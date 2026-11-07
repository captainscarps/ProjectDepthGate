#!/usr/bin/env python3
"""
Gerador de Dublagem Profissional dos NPCs do DepthGate via Google Gemini TTS.
Substitui as vozes robóticas pelas vozes de estúdio:
  - Ferreiro & Curtidor: 'Fenrir' (grave, caloroso, rústico)
  - Herbalista Elfa: 'Kore' (suave, melódica, acolhedora)
  - Explorador da Caverna & Aprendiz: 'Puck' (jovem, ágil, expressivo)
  - Vendedor / Mercador: 'Charon' (sussurrado, astuto, misterioso)

Uso:
    python scripts/generate_all_npc_voices_gemini.py --api-key "AIzaSy..."
ou defina a variável de ambiente:
    $env:GEMINI_API_KEY="AIzaSy..."
    python scripts/generate_all_npc_voices_gemini.py
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

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
OUT_EN = os.path.join(ROOT, "assets", "audio", "voice", "en")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MIRROR_EN = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

MODELS_QUEUE = [
    "gemini-2.5-flash-preview-tts",
    "gemini-3.8-flash-lite-tts",
    "gemini-3.8-flash-tts"
]

def fnv(text):
    """Hash FNV-1a 32-bit (UTF-16LE) idêntico ao runtime."""
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

def generate_gemini(api_key, text, prompt_instruction, voice):
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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
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
    raise RuntimeError(f"Erro TTS para '{text[:35]}': {last_err}")

# Linhas de dublagem detalhadas com direção teatral por personagem
NPC_VOICE_SPECS = [
    # ── 1. Ferreiro (Fenrir) ─────────────────────────────────────────────────────────────
    {
        "npc": "Ferreiro",
        "voice": "Fenrir",
        "pt_dir": "com voz forte, calorosa, rústica e encorpada de um ferreiro sábio e experiente diante da fornalha",
        "en_dir": "with a strong, hearty, rustic, and weathered voice of an experienced master blacksmith",
        "lines": [
            ("b416497c", "Ah, um cliente! Chegue mais perto.", "Ah, a customer! Come closer."),
            ("aec7ec54", "Aço bom pede fogo paciente. Em que posso ajudar?", "Good steel needs patient fire. How can I help?"),
            ("91a6267b", "Traga fragmentos e eu deixo sua lâmina digna do Abismo.", "Bring fragments and I'll make your blade worthy of the Abyss."),
            ("6d2e9efe", "Traga arma e catalisador para a fusão — eu cuido do fogo.", "Bring weapon and catalyst for the fusion — I handle the fire."),
            (None, "Só forjo com Pedra Cobalto. Essas armas são feitas dela, por isso são tão raras.", "I only forge with Cobalt Stone. These weapons are made of it, that's why they're so rare.")
        ]
    },
    # ── 2. Explorador da Caverna (Puck) ──────────────────────────────────────────────────
    {
        "npc": "Explorador da Caverna",
        "voice": "Puck",
        "pt_dir": "com voz jovem, expressiva, ágil e cautelosa de aventureiro veterano avisando sobre perigos",
        "en_dir": "with an energetic, expressive, nimble, and cautious voice of a nimble cave explorer",
        "lines": [
            ("abcf345c", "Essa caverna é traiçoeira, ela sempre muda a cada entrada, explore com cuidado.", "This cave is treacherous, it always changes with every entrance, explore with caution.")
        ]
    },
    # ── 3. Herbalista Elfa (Kore) ────────────────────────────────────────────────────────
    {
        "npc": "Herbalista Elfa",
        "voice": "Kore",
        "pt_dir": "com voz feminina suave, melódica, acolhedora, serena e mística de elfa alquimista",
        "en_dir": "with a soft, melodic, welcoming, serene, and mystical female voice of an elven herbalist",
        "lines": [
            ("139920e1", "Psst! Poções fresquinhas, direto do caldeirão!", "Psst! Fresh potions, straight from the cauldron!"),
            ("1bf0c909", "Ervas frescas e um pouco de magia. Do que você precisa?", "Fresh herbs and a little magic. What do you need?"),
            ("f7b1dd43", "Plantei essas flores em terra do Abismo. Curam melhor assim.", "I planted these flowers in Abyss soil. They heal better that way."),
            ("6eaa0e2d", "A dourada protege, mas não dura. Use na hora certa.", "The golden one protects, but it doesn't last. Use it at the right moment."),
            ("16aab5c2", "A laranja acende a fúria; a azul devolve a magia na hora.", "The orange one kindles fury; the blue one brings your magic right back.")
        ]
    },
    # ── 4. Vendedor / Mercador Clandestino (Charon) ──────────────────────────────────────
    {
        "npc": "Vendedor",
        "voice": "Charon",
        "pt_dir": "com voz sombria, sussurrada, astuta, irônica e misteriosa de mercador do submundo",
        "en_dir": "with a gravelly, hushed, cunning, witty, and mysterious voice of a dark underworld merchant",
        "lines": [
            ("16f82f5a", "Ouro da sua campanha, mercadoria da boa.", "Your campaign gold, fine goods."),
            ("dbf9f0b4", "Fragmentos? Aceito. Tudo tem um preço.", "Fragments? I take those. Everything has a price."),
            ("3c838b9f", "Psst… você parece alguém que precisa de uma lâmina que nunca cansa.", "Psst… you look like someone who needs a blade that never tires."),
            ("955b8d52", "A Lâmina Faminta. Fica mais forte a cada vida que toma. 60 moedas e ela é sua. Sem devoluções.", "The Hungry Blade. It grows stronger with every life it takes. 60 coins and it's yours. No returns."),
            ("dc8b1347", "Hm. Voltarei a te oferecer… se você sobreviver.", "Hm. I'll offer it again… if you survive."),
            ("e261a7b1", "Sem moedas, sem lâmina.", "No coins, no blade."),
            ("e4fe9f52", "Hehe… alimente-a bem.", "Hehe… feed it well.")
        ]
    },
    # ── 5. Curtidor / Caçador (Fenrir) ───────────────────────────────────────────────────
    {
        "npc": "Curtidor",
        "voice": "Fenrir",
        "pt_dir": "com voz madura, rústica, firme e pragmática de um caçador calejado da floresta",
        "en_dir": "with a seasoned, rugged, gritty, and pragmatic voice of an experienced hunter",
        "lines": [
            ("2623db51", "Couro de fera do Abismo não apodrece. Nem amolece.", "Abyss beast hide never rots. Never softens."),
            ("da24ecdf", "Os bonecos de treino ali embaixo aguentam qualquer golpe.", "The training dummies down there take any blow."),
            ("d3a45c4e", "Esse cão me segue desde que voltei do bosque.", "This dog has followed me since I came back from the woods."),
            ("643f69aa", "Cuidado no portal. Nem tudo que sai de lá é bicho.", "Careful at the portal. Not everything that comes out is a beast.")
        ]
    },
    # ── 6. Aprendiz da Vila (Puck) ───────────────────────────────────────────────────────
    {
        "npc": "Aprendiz",
        "voice": "Puck",
        "pt_dir": "com voz jovem, espontânea, simpática e animada de uma jovem aprendiz de ferreiro",
        "en_dir": "with a youthful, cheerful, spontaneous, and friendly voice of a young blacksmith apprentice",
        "lines": [
            ("43ca8171", "O mestre está lá dentro. Ele forja melhor quando alguém elogia.", "The master is inside. He forges better when praised."),
            ("df7e9850", "Fragmentos abissais viram aço bom. Traga muitos!", "Abyssal fragments make good steel. Bring plenty!"),
            ("ef99c92c", "Já tentou fundir itens? Pergunte na loja BARGANHAS.", "Tried fusing items? Ask at the BARGAINS shop.")
        ]
    }
]

def main():
    parser = argparse.ArgumentParser(description="Gerador de dublagem Gemini TTS para DepthGate")
    parser.add_argument("--api-key", default=None, help="Chave de API do Google Gemini")
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        for kf in [os.path.join(ROOT, "scripts", ".api_key.txt"), os.path.join(ROOT, ".env")]:
            if os.path.exists(kf):
                try:
                    content = open(kf, "r", encoding="utf-8").read().strip()
                    if "GEMINI_API_KEY=" in content:
                        for line in content.splitlines():
                            if line.strip().startswith("GEMINI_API_KEY="):
                                api_key = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                                break
                    elif content:
                        api_key = content.splitlines()[0].strip()
                except Exception:
                    pass
            if api_key:
                break

    if not api_key:
        print("\n[ERRO] Chave de API do Gemini não informada!")
        print("Passe via argumento: --api-key \"AIzaSy...\"")
        print("ou defina no terminal: $env:GEMINI_API_KEY=\"AIzaSy...\"")
        sys.exit(1)

    print("====================================================")
    print("  DEPTHGATE - REVISÃO DAS VOZES DOS NPCS (GEMINI)   ")
    print("====================================================")
    print("Iniciando sintetização com vozes humanas e atuação de estúdio...\n")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    total_lines = sum(len(spec["lines"]) for spec in NPC_VOICE_SPECS)
    processed = 0

    for spec in NPC_VOICE_SPECS:
        npc_name = spec["npc"]
        voice = spec["voice"]
        pt_prompt = spec["pt_dir"]
        en_prompt = spec["en_dir"]

        print(f"\n▶ Personagem: {npc_name.upper()} (Voz: {voice})")

        for explicit_id, pt_text, en_text in spec["lines"]:
            processed += 1
            h_pt = fnv(pt_text)
            lid = explicit_id or manifest["k"].get(h_pt, h_pt)

            print(f"  [{processed}/{total_lines}] {lid}: \"{pt_text[:35]}...\"", end="", flush=True)

            # Sintetizar PT
            pt_mp3, pt_dur = generate_gemini(api_key, pt_text, pt_prompt, voice)
            with open(os.path.join(OUT_PT, f"{lid}.mp3"), "wb") as f: f.write(pt_mp3)
            with open(os.path.join(MIRROR_PT, f"{lid}.mp3"), "wb") as f: f.write(pt_mp3)

            # Sintetizar EN
            en_mp3, en_dur = generate_gemini(api_key, en_text, en_prompt, voice)
            with open(os.path.join(OUT_EN, f"{lid}.mp3"), "wb") as f: f.write(en_mp3)
            with open(os.path.join(MIRROR_EN, f"{lid}.mp3"), "wb") as f: f.write(en_mp3)

            # Atualizar manifestos
            manifest["k"][h_pt] = lid
            h_en = fnv(en_text)
            manifest["k"][h_en] = lid
            manifest["k"][lid] = lid
            manifest["d"][lid] = {"pt": pt_dur, "en": en_dur}

            print(f" ✓ OK (PT: {pt_dur}s, EN: {en_dur}s)")
            time.sleep(0.4)

    # Gravar manifestos
    manifest_str = json.dumps(manifest, indent=2, ensure_ascii=False)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f: f.write(manifest_str)
    with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f: f.write(manifest_str)

    print("\n✓ Manifestos atualizados com sucesso.")
    print("====================================================")
    print(f"[SUCESSO] Todas as {total_lines} falas regeradas no Gemini TTS com perfeição!")
    print("====================================================")

if __name__ == "__main__":
    main()

