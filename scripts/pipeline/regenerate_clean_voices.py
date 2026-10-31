import os
import sys
import json
import base64
import time
import io
import wave
import re
import urllib.request
import lameenc

# Força codificação UTF-8 no console do Windows
sys.stdout.reconfigure(encoding="utf-8")

API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Modelos disponíveis em ordem de preferência
MODELS_QUEUE = [
    "gemini-3.8-flash-tts",
    "gemini-3.1-flash-tts-preview",
    "gemini-3.8-flash-lite-tts",
    "gemini-2.5-pro-preview-tts"
]

from pathlib import Path
ROOT = str(Path(__file__).resolve().parents[2])
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

os.makedirs(OUT_PT, exist_ok=True)
os.makedirs(MIRROR_PT, exist_ok=True)

# Mapeamento de vozes canônicas por personagem
VOICE_MAP = {
    "narrator": "Charon",
    "video": "Charon",
    "vision": "Charon",
    "guardia": "Aoede",
    "cine-✦ A GUARDIÃ ✦": "Aoede",
    "rei": "Fenrir",
    "rei-corrupt": "Fenrir"
}

TARGET_VOICE_KEYS = set(VOICE_MAP.keys())

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def refine_text(raw_text):
    t = raw_text.strip()
    
    # Remove decorações visuais
    t = t.replace("✦", "").replace("★", "").replace("💀", "").replace("👑", "").replace("📜", "")
    
    # Remove aspas externas
    t = t.strip('"\'')
    
    # Travessões e pausas
    t = t.replace(" — ", ", ").replace("—", ", ").replace(" – ", ", ").replace("–", ", ")
    
    # Reticências internas viram vírgulas (pausa natural), finais viram ponto
    t = re.sub(r'\.{3,}$', '.', t)
    t = re.sub(r'\.{3,}', ', ', t)
    t = t.replace("…", ", ")
    
    # Ajuste fonético de nomes próprios para perfeita pronúncia no português
    t = re.sub(r'\bDepthGates\b', 'Depth Gates', t)
    t = re.sub(r'\bDepthGate\b', 'Depth Gate', t)
    t = re.sub(r'\bEldervale\b', 'Éldervale', t)
    t = re.sub(r'\bValdrak\b', 'Váldrak', t)
    t = re.sub(r'\bGravewake\b', 'Grave-wake', t)
    t = re.sub(r'\bMoltenborn\b', 'Móltenborn', t)
    
    # Limpa pontuação duplicada e espaços extras
    t = re.sub(r'[,;\s]*,', ',', t)
    t = re.sub(r'\s*,\s*', ', ', t)
    t = re.sub(r'\.{2,}', '.', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def wav_to_mp3(wav_bytes):
    try:
        wf = wave.open(io.BytesIO(wav_bytes), "rb")
        sr = wf.getframerate()
        channels = wf.getnchannels()
        nframes = wf.getnframes()
        pcm_raw = wf.readframes(nframes)
        duration = round(nframes / sr, 2)
    except Exception:
        sr = 24000
        channels = 1
        pcm_raw = wav_bytes[44:] if wav_bytes[:4] == b"RIFF" else wav_bytes
        duration = round(len(pcm_raw) / (sr * 2), 2)

    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(sr)
    encoder.set_channels(channels)
    encoder.set_quality(2)
    mp3 = encoder.encode(pcm_raw) + encoder.flush()
    return mp3, duration

def generate_clean_voice(text, voice_key):
    voice_name = VOICE_MAP.get(voice_key, "Charon")
    clean_text = refine_text(text)
    
    # PAYLOAD 100% PURO: SEM NENHUMA INSTRUÇÃO OU DIRECIONAMENTO
    # O modelo recebe estritamente o texto que deve ser falado!
    payload = {
        "contents": [{"parts": [{"text": clean_text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": voice_name}
                }
            }
        }
    }

    for model in MODELS_QUEUE:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode())
                    cand = data["candidates"][0]["content"]["parts"][0]
                    wav_bytes = base64.b64decode(cand["inlineData"]["data"])
                    return wav_to_mp3(wav_bytes), clean_text
            except urllib.error.HTTPError as he:
                if he.code == 429:
                    # Alterna para o próximo modelo da fila
                    break
                else:
                    time.sleep(1.2)
            except Exception:
                time.sleep(1.2)
    return (None, 0.0), clean_text

def main():
    ext_path = os.path.join(ROOT, "scripts", "extracted_lines.json")
    extra_path = os.path.join(ROOT, "scripts", "voice_extra_lines.json")
    
    ext = json.load(open(ext_path, encoding="utf-8"))
    extra = json.load(open(extra_path, encoding="utf-8"))
    all_lines = ext + extra

    manifest = json.load(open(MANIFEST_PATH, encoding="utf-8"))

    id_to_line = {}
    for item in all_lines:
        t = " ".join(item["text"].split()).strip()
        h = fnv(t)
        if h in manifest["k"]:
            lid = manifest["k"][h]
            if item.get("voice") in TARGET_VOICE_KEYS:
                id_to_line[lid] = item

    print("======================================================================")
    print("REGENERAÇÃO LIMPA E REFINADA DE TODAS AS VOZES (SEM VAZAMENTO)")
    print(f"Total de falas dos 3 personagens principais: {len(id_to_line)}")
    print("======================================================================")

    progress_file = os.path.join(ROOT, "scripts", "dub_clean_progress.json")
    done_ids = set()
    if os.path.exists(progress_file):
        try:
            done_ids = set(json.load(open(progress_file, encoding="utf-8")))
        except Exception:
            pass

    print(f"Progresso atual: {len(done_ids)}/{len(id_to_line)} concluídas.")

    samples_summary = []
    total = len(id_to_line)
    start_time = time.time()
    generated_count = 0

    for idx, (lid, item) in enumerate(id_to_line.items(), start=1):
        if lid in done_ids:
            continue

        raw_text = item["text"]
        voice_key = item.get("voice", "narrator")

        print(f"[{idx}/{total}] [{voice_key:12s}] {lid}: \"{raw_text[:32]}...\" ", end="", flush=True)

        (mp3_bytes, duration), clean_text = generate_clean_voice(raw_text, voice_key)

        if mp3_bytes and duration > 0:
            out_file = os.path.join(OUT_PT, f"{lid}.mp3")
            mirror_file = os.path.join(MIRROR_PT, f"{lid}.mp3")

            with open(out_file, "wb") as f:
                f.write(mp3_bytes)
            with open(mirror_file, "wb") as f:
                f.write(mp3_bytes)

            manifest["d"][lid]["pt"] = duration
            done_ids.add(lid)
            generated_count += 1

            samples_summary.append({
                "id": lid,
                "voice": voice_key,
                "text": raw_text,
                "clean": clean_text,
                "dur": duration,
                "rel_path": f"assets/audio/voice/pt/{lid}.mp3"
            })

            print(f"-> OK ({duration}s, {len(mp3_bytes)//1024} KB)")

            # Salva progresso a cada fala
            with open(progress_file, "w", encoding="utf-8") as f:
                json.dump(list(done_ids), f)
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)

            time.sleep(0.35)
        else:
            print("-> FALHA ❌")

    print("\n======================================================================")
    print(f"REGENERAÇÃO CONCLUÍDA! {generated_count} novas falas geradas sem vazamento.")
    print(f"Total geral concluído: {len(done_ids)}/{total} falas.")
    print("======================================================================")

if __name__ == "__main__":
    main()
