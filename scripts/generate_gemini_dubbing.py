import os
import sys
import json
import base64
import time
import io
import wave
import urllib.request
import lameenc

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding="utf-8")

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-3.8-flash-lite-tts"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

os.makedirs(OUT_PT, exist_ok=True)
os.makedirs(MIRROR_PT, exist_ok=True)

VOICE_MAP = {
    "narrator": {"voice": "Charon", "direction": "com tom épico, solene e misterioso de narrador de fantasia sombria"},
    "video": {"voice": "Charon", "direction": "com tom épico, dramático e cinematográfico de abertura lendária"},
    "vision": {"voice": "Charon", "direction": "com voz misteriosa, envolvente e antiga, descrevendo visões e memórias"},
    "guardia": {"voice": "Aoede", "direction": "com tom solene, místico, afetuoso e etéreo de guardiã mágica ancestral"},
    "cine-✦ A GUARDIÃ ✦": {"voice": "Aoede", "direction": "com tom solene, místico e etéreo de guardiã ancestral"},
    "rei": {"voice": "Fenrir", "direction": "com tom majestoso, idoso e pesaroso de um rei caído"},
    "rei-corrupt": {"voice": "Fenrir", "direction": "com tom cavernoso, corrompido, gutural e ameaçador de uma entidade demoníaca"},
    "hero-WARRIOR": {"voice": "Fenrir", "direction": "com tom firme, honrado e forte de guerreiro de infantaria"},
    "hero-BERSERKER": {"voice": "Fenrir", "direction": "com tom ríspido, feroz, rouco e impetuoso de berserker furioso"},
    "hero-ARCHER": {"voice": "Puck", "direction": "com tom focado, ágil e calmo de atirador experiente"},
    "hero-HUNTER": {"voice": "Puck", "direction": "com tom pragmático, observador e rústico de rastreador"},
    "hero-ROGUE": {"voice": "Puck", "direction": "com tom sussurrado, esperto e ardiloso de assassino nas sombras"},
    "hero-MAGE": {"voice": "Aoede", "direction": "com tom erudito, inteligente e místico de feiticeira"},
    "hero-DRUID": {"voice": "Fenrir", "direction": "com tom conectado à natureza, solene e ancestral de guardião da floresta"},
    "hero-NECROMANCER": {"voice": "Charon", "direction": "com tom sombrio, calculista e sepulcral de mestre das almas"},
    "hero-SHAMAN": {"voice": "Aoede", "direction": "com tom espiritual, enigmático e xamânico dos espíritos ancestrais"},
    "echo-m": {"voice": "Charon", "direction": "como um eco fantasmagórico sussurrado do passado"},
    "echo-f": {"voice": "Kore", "direction": "como um eco etéreo e misterioso de um espírito feminino aprisionado"},
}

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def wav_to_mp3(wav_bytes):
    try:
        wf = wave.open(io.BytesIO(wav_bytes), "rb")
        sr = wf.getframerate()
        channels = wf.getnchannels()
        nframes = wf.getnframes()
        pcm_raw = wf.readframes(nframes)
        duration = round(nframes / sr, 2)
    except Exception:
        # Fallback if raw PCM without header
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

def generate_voice(text, voice_key):
    vinfo = VOICE_MAP.get(voice_key, VOICE_MAP["narrator"])
    voice_name = vinfo["voice"]
    direction = vinfo["direction"]

    prompt = f'Diga exatamente esta fala em Português do Brasil {direction}: "{text}"'
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": voice_name}
                }
            }
        }
    }

    for attempt in range(5):
        try:
            req = urllib.request.Request(
                URL,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
                cand = data["candidates"][0]["content"]["parts"][0]
                wav_bytes = base64.b64decode(cand["inlineData"]["data"])
                return wav_to_mp3(wav_bytes)
        except urllib.error.HTTPError as he:
            if he.code == 429:
                wait_sec = 5 + attempt * 4
                print(f" [Rate-limit 429, aguardando {wait_sec}s...]", end="", flush=True)
                time.sleep(wait_sec)
            else:
                print(f" [HTTP {he.code}]", end="", flush=True)
                time.sleep(2)
        except Exception as e:
            print(f" [Erro: {type(e).__name__}]", end="", flush=True)
            time.sleep(2)
    return None, 0.0

def main():
    ext = json.load(open(os.path.join(ROOT, "scripts", "extracted_lines.json"), encoding="utf-8"))
    extra = json.load(open(os.path.join(ROOT, "scripts", "voice_extra_lines.json"), encoding="utf-8"))
    all_lines = ext + extra

    manifest = json.load(open(MANIFEST_PATH, encoding="utf-8"))

    id_to_line = {}
    for item in all_lines:
        t = " ".join(item["text"].split()).strip()
        h = fnv(t)
        if h in manifest["k"]:
            lid = manifest["k"][h]
            id_to_line[lid] = item

    print(f"=== INICIANDO GERAÇÃO DA DUBLAGEM GEMINI 3.8 TTS (PT-BR) ===")
    print(f"Total de falas: {len(manifest['d'])}")

    progress_file = os.path.join(ROOT, "scripts", "dub_gemini_progress.json")
    done_ids = set()
    if os.path.exists(progress_file):
        try:
            done_ids = set(json.load(open(progress_file, encoding="utf-8")))
        except Exception:
            pass

    print(f"Falas já concluídas: {len(done_ids)}")

    count = 0
    total = len(manifest["d"])
    start_time = time.time()

    for idx, (lid, dur_dict) in enumerate(manifest["d"].items(), start=1):
        if lid in done_ids:
            continue

        item = id_to_line.get(lid)
        if not item:
            continue

        text = item["text"].strip()
        voice_key = item.get("voice", "narrator")

        print(f"[{idx}/{total}] [{voice_key}] {lid}: {text[:35]}...", end="", flush=True)
        mp3_bytes, duration = generate_voice(text, voice_key)

        if mp3_bytes:
            out_file = os.path.join(OUT_PT, f"{lid}.mp3")
            with open(out_file, "wb") as f:
                f.write(mp3_bytes)

            mirror_file = os.path.join(MIRROR_PT, f"{lid}.mp3")
            with open(mirror_file, "wb") as f:
                f.write(mp3_bytes)

            manifest["d"][lid]["pt"] = duration
            done_ids.add(lid)
            count += 1
            print(f" [OK: {duration}s, {len(mp3_bytes)}b]")

            # Salvar progresso
            with open(progress_file, "w", encoding="utf-8") as f:
                json.dump(list(done_ids), f)
            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2)
            with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2)

            time.sleep(0.5)
        else:
            print(" [FALHOU]")

    print(f"\n=== PROCESSO FINALIZADO! {count} falas geradas em {time.time()-start_time:.1f}s ===")

if __name__ == "__main__":
    main()
