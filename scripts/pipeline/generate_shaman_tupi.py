import os
import sys
import json
import base64
import time
import io
import wave
import urllib.request
import lameenc

sys.stdout.reconfigure(encoding="utf-8")

key = os.environ.get("GEMINI_API_KEY", "")
models = ["gemini-3.8-flash-lite-tts", "gemini-3.1-flash-tts-preview", "gemini-3.8-flash-tts", "gemini-2.5-pro-preview-tts"]

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

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

# Falas aprimoradas da Xamã Araí com vocabulário Tupi/Nheengatu (Opção 1)
shaman_lines = [
    {
        "id": "21b2102b",
        "display": "Puranga… Esta é a mata dos meus avós. Ela está doente — eu sinto nas raízes.",
        "tts_text": "Puranga. Esta é a mata dos meus avós. Ela está doente, eu sinto nas raízes."
    },
    {
        "id": "12a22025",
        "display": "No Rio Negro, os pajés antigos fecharam um portal num igapó. A doença desta mata vem de lá.",
        "tts_text": "No Rio Negro, os pajés antigos fecharam um portal num igapó. A doença desta mata vem de lá."
    },
    {
        "id": "34e964bf",
        "display": "O espírito Anhangá nunca fez mal a quem respeita a floresta. Algo o corrompeu.",
        "tts_text": "O espírito Anhangá nunca fez mal a quem respeita a floresta. Algo o corrompeu."
    },
    {
        "id": "c16dc423",
        "display": "Descanse em paz, espírito Anhangá. Vou levar o seu selo para longe da escuridão.",
        "tts_text": "Descanse em paz, espírito Anhangá. Vou levar o seu selo para longe da escuridão."
    },
    {
        "id": "9203c20c",
        "display": "“Os espíritos da mata sussurram o seu nome, Guardiã. E não é com carinho.”",
        "tts_text": "Os espíritos da mata sussurram o seu nome, Guardiã. E não é com carinho."
    }
]

manifest = json.load(open(MANIFEST_PATH, encoding="utf-8"))

print("======================================================================")
print("GERANDO FALAS REFINADAS DA XAMÃ (ARAÍ) - VOZ KORE + TUPI / NHEENGATU")
print("======================================================================")

generated_samples = []

for item in shaman_lines:
    lid = item["id"]
    tts_text = item["tts_text"]
    display_text = item["display"]
    
    print(f"[{lid}] Gerando: \"{tts_text}\"...", end="", flush=True)
    
    wav_bytes = None
    used_model = None
    
    payload = {
        "contents": [{"parts": [{"text": tts_text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Kore"}}}
        }
    }
    
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = json.loads(resp.read().decode())
                cand = data["candidates"][0]["content"]["parts"][0]
                wav_bytes = base64.b64decode(cand["inlineData"]["data"])
                used_model = model
                break
        except Exception:
            continue
            
    if wav_bytes:
        mp3_bytes, duration = wav_to_mp3(wav_bytes)
        
        # Salva na raiz e no espelho
        out_file = os.path.join(OUT_PT, f"{lid}.mp3")
        mirror_file = os.path.join(MIRROR_PT, f"{lid}.mp3")
        
        with open(out_file, "wb") as f:
            f.write(mp3_bytes)
        with open(mirror_file, "wb") as f:
            f.write(mp3_bytes)
            
        manifest["d"][lid]["pt"] = duration
        print(f" -> OK ({used_model}, {duration}s, {len(mp3_bytes)//1024} KB)")
        
        generated_samples.append({
            "id": lid,
            "display": display_text,
            "dur": duration,
            "path": out_file
        })
    else:
        print(" -> FALHA ❌")
    
    time.sleep(1)

# Atualiza manifestos
with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)
with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print("\nManifestos atualizados com sucesso!")
