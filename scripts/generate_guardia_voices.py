#!/usr/bin/env python3
"""
Gerador das vozes da Guardiã para o DepthGate usando Gemini TTS (Voz: Aoede).
Gera as falas ausentes em PT e EN, converte para MP3 128kbps e atualiza os manifestos.

Uso com Gemini TTS:
    $env:GEMINI_API_KEY="SUA_CHAVE"
    python scripts/generate_guardia_voices.py

Uso alternativo imediato via Edge TTS (caso queira testar antes de fornecer a chave do Gemini):
    python scripts/generate_guardia_voices.py --use-edge
"""

import os
import sys
import json
import base64
import time
import io
import wave
import urllib.request
import urllib.error
import argparse
import lameenc

# Forçar UTF-8
sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
OUT_EN = os.path.join(ROOT, "assets", "audio", "voice", "en")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MIRROR_EN = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

# Busca de chave da API
API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not API_KEY:
    for keyfile in [os.path.join(ROOT, "scripts", ".api_key.txt"), os.path.join(ROOT, ".env")]:
        if os.path.exists(keyfile):
            try:
                with open(keyfile, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("GEMINI_API_KEY="):
                            API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                            break
                        elif line.startswith("AIzaSy"):
                            API_KEY = line
                            break
            except Exception:
                pass
        if API_KEY:
            break

MODELS_QUEUE = [
    "gemini-2.5-flash-preview-tts",
    "gemini-3.8-flash-lite-tts",
    "gemini-3.8-flash-tts"
]

def fnv(text):
    """Hash FNV-1a 32-bit idêntico ao runtime Web Audio / Phaser."""
    h = 0x811c9dc5
    b = (' '.join(str(text).strip().split())).encode('utf-16-le')
    for i in range(0, len(b), 2):
        code = b[i] | (b[i+1] << 8)
        h ^= code
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f'{h:08x}'

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

def generate_gemini(text, prompt_instruction, voice="Aoede"):
    if not API_KEY:
        raise ValueError("GEMINI_API_KEY não encontrada. Defina a variável de ambiente GEMINI_API_KEY.")

    instruction = f'{prompt_instruction}: "{text}"' if prompt_instruction else text
    payload = {
        "contents": [{"parts": [{"text": instruction}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": voice}
                }
            }
        }
    }

    last_err = None
    for model in MODELS_QUEUE:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        for attempt in range(3):
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
                    return wav_to_mp3(wav_bytes)
            except urllib.error.HTTPError as he:
                last_err = he
                if he.code == 429:
                    time.sleep(3 + attempt * 2)
                else:
                    break
            except Exception as e:
                last_err = e
                time.sleep(1.5)
    raise RuntimeError(f"Falha ao gerar áudio Gemini TTS para: {text[:40]} ({last_err})")

def generate_edge(text, lang="pt"):
    import asyncio
    import edge_tts

    voice = "pt-BR-FranciscaNeural" if lang == "pt" else "en-US-JennyNeural"
    async def _synth():
        c = edge_tts.Communicate(text, voice)
        buf = bytearray()
        async for chunk in c.stream():
            if chunk["type"] == "audio":
                buf.extend(chunk["data"])
        return bytes(buf)

    mp3_data = asyncio.run(_synth())
    # Estimar duração aproximada do MP3
    sr = 24000
    dur = round(len(mp3_data) / (128 * 1024 / 8), 2)
    return mp3_data, dur

# Falas prioritárias da Guardiã identificadas na auditoria
GUARDIA_LINES = [
    {
        "id": "7d6ba853",
        "description": "Resgate ao cair na Caverna Dorf (novo fluxo da Guardiã)",
        "pt": "Você caiu, herói. Eu te trouxe para se recuperar.",
        "pt_aliases": ["A Guardiã: Você caiu, herói. Eu te trouxe para se recuperar."],
        "en": "You fell, hero. I brought you here to recover.",
        "en_aliases": ["The Guardian: You fell, hero. I brought you here to recover."],
        "pt_prompt": "com tom solene, místico, afetuoso, sereno e etéreo de Guardiã protetora acolhendo um herói caído",
        "en_prompt": "with a solemn, mystical, warm, serene and ethereal tone of a protective Guardian deity welcoming a fallen hero"
    },
    {
        "id": "c46db04c",
        "description": "Bênção final ao reunir as 9 relíquias ancestrais",
        "pt": "As nove relíquias… ninguém reuniu todas desde a primeira selagem. Elas te protegem agora.",
        "pt_aliases": ["A Guardiã: As nove relíquias… ninguém reuniu todas desde a primeira selagem. Elas te protegem agora."],
        "en": "All nine relics… no one has gathered them since the first sealing. They protect you now.",
        "en_aliases": ["The Guardian: All nine relics… no one has gathered them since the first sealing. They protect you now."],
        "pt_prompt": "com tom maravilhado, solene, respeitoso e místico de Guardiã vendo o herói completar o destino",
        "en_prompt": "with a wondrous, solemn, respectful and mystical tone of a Guardian witnessing the hero fulfill destiny"
    }
]

def main():
    parser = argparse.ArgumentParser(description="Gerador de vozes da Guardiã (DepthGate)")
    parser.add_argument("--use-edge", action="store_true", help="Usa Edge TTS como fallback caso não haja chave do Gemini")
    args = parser.parse_args()

    print("====================================================")
    print("      DEPTHGATE - GERADOR DE VOZES DA GUARDIÃ       ")
    print("====================================================")

    use_gemini = not args.use_edge and bool(API_KEY)
    if not use_gemini and not args.use_edge:
        print("\n[AVISO] GEMINI_API_KEY não foi encontrada no ambiente.")
        print("Para gerar com o Gemini TTS (voz Aoede):")
        print('  $env:GEMINI_API_KEY="sua_chave_do_google"')
        print("  python scripts/generate_guardia_voices.py\n")
        print("Você também pode rodar com '--use-edge' para gerar via Edge TTS.")
        return

    provider_name = "Gemini Flash TTS (Voz: Aoede)" if use_gemini else "Edge TTS (Voz: Francisca/Jenny)"
    print(f"Provedor ativo: {provider_name}\n")

    os.makedirs(OUT_PT, exist_ok=True)
    os.makedirs(OUT_EN, exist_ok=True)
    os.makedirs(MIRROR_PT, exist_ok=True)
    os.makedirs(MIRROR_EN, exist_ok=True)

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    for item in GUARDIA_LINES:
        lid = item["id"]
        pt_text = item["pt"]
        en_text = item["en"]

        print(f"-> Processando: {item['description']}")
        print(f"   PT: \"{pt_text}\" (ID: {lid})")

        # Sintetizar PT
        if use_gemini:
            pt_mp3, pt_dur = generate_gemini(pt_text, item["pt_prompt"], voice="Aoede")
        else:
            pt_mp3, pt_dur = generate_edge(pt_text, lang="pt")

        with open(os.path.join(OUT_PT, f"{lid}.mp3"), "wb") as f: f.write(pt_mp3)
        with open(os.path.join(MIRROR_PT, f"{lid}.mp3"), "wb") as f: f.write(pt_mp3)
        print(f"   ✓ PT gravado com sucesso ({pt_dur}s, {len(pt_mp3)} bytes)")

        # Sintetizar EN
        print(f"   EN: \"{en_text}\" (ID: {lid})")
        if use_gemini:
            en_mp3, en_dur = generate_gemini(en_text, item["en_prompt"], voice="Aoede")
        else:
            en_mp3, en_dur = generate_edge(en_text, lang="en")

        with open(os.path.join(OUT_EN, f"{lid}.mp3"), "wb") as f: f.write(en_mp3)
        with open(os.path.join(MIRROR_EN, f"{lid}.mp3"), "wb") as f: f.write(en_mp3)
        print(f"   ✓ EN gravado com sucesso ({en_dur}s, {len(en_mp3)} bytes)")

        # Registrar hashes principais e aliases no manifesto
        manifest["k"][fnv(pt_text)] = lid
        manifest["k"][fnv(en_text)] = lid
        manifest["k"][lid] = lid
        for al in item.get("pt_aliases", []):
            manifest["k"][fnv(al)] = lid
        for al in item.get("en_aliases", []):
            manifest["k"][fnv(al)] = lid

        manifest["d"][lid] = {
            "pt": pt_dur,
            "en": en_dur
        }

    # Salvar manifestos atualizados
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n✓ voice-manifest.json atualizado em ambos os diretórios.")
    print("====================================================")
    print("[SUCESSO] Vozes da Guardiã sintetizadas e registradas!")
    print("====================================================")

if __name__ == "__main__":
    main()
