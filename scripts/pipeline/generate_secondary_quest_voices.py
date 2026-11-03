import os
import sys
import json
import base64
import urllib.request
import urllib.error
import wave
import io
import time
import re
import lameenc

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEY_FILE = os.path.join(ROOT, "scripts", ".api_key.txt")

if os.path.exists(KEY_FILE):
    API_KEY = open(KEY_FILE, "r", encoding="utf-8").read().strip()
else:
    API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found in environment or scripts/.api_key.txt")
    sys.exit(1)

MODELS = ["gemini-2.5-flash-preview-tts", "gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview"]

# Character Definitions:
# bispo -> Charon (deep, sinister priest)
# freira -> Kore (gentle, pious nun)
# menino -> Puck (youthful, child)
# velha -> Leda (mature, raspy old woman / witch)

SECONDARY_NPC_DIALOGUES = [
    # ── 1. O PADRE / BISPO (Charon) ──
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "Filho das Profundezas… a fé pode guiar sua lâmina.",
        "en": "Child of the Depths… faith can guide your blade."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "Por uma pequena oferta de 40 moedas, abençoo seu próximo portal. Seus golpes cairão como a ira divina.",
        "en": "For a small offering of 40 coins, I will bless your next portal. Your strikes will fall like divine wrath."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "A bênção já está com você. Vá.",
        "en": "The blessing is already upon you. Go."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "A fé não aceita bolsos vazios.",
        "en": "Faith does not accept empty pockets."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "Que a luz caminhe ao seu lado.",
        "en": "May the light walk beside you."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "Sábia escolha, filho. Ela vai deixar o templo hoje mesmo.",
        "en": "A wise choice, my child. She will leave the temple this very day."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "Hehehe… o Observador agradece a sua confiança.",
        "en": "Hehehe… the Beholder thanks you for your trust."
    },
    {
        "char": "bispo",
        "voice": "Charon",
        "pt": "…Menina tola. Então que vejam o olho de verdade!",
        "en": "…Foolish girl. Then let them behold the true eye!"
    },

    # ── 2. A FREIRA (Kore) ──
    {
        "char": "freira",
        "voice": "Kore",
        "pt": "(sussurrando) Não fale alto. Ele escuta tudo.",
        "spoken_pt": "Não fale alto. Ele escuta tudo.",
        "en": "Do not speak loudly. He hears everything.",
        "spoken_en": "Do not speak loudly. He hears everything."
    },
    {
        "char": "freira",
        "voice": "Kore",
        "pt": "Aquele não é um homem de fé. Vi o olho bordado por dentro do manto dele. O mesmo olho do castelo.",
        "en": "That is no man of faith. I saw the eye embroidered inside his cloak. The very same eye from the castle."
    },
    {
        "char": "freira",
        "voice": "Kore",
        "pt": "Cada bênção que ele vende amarra a sua alma a alguém que observa. Em quem você acredita?",
        "en": "Every blessing he sells binds your soul to one who watches. Who do you place your faith in?"
    },
    {
        "char": "freira",
        "voice": "Kore",
        "pt": "Você acreditou em mim… obrigada. Que a verdadeira luz guie seus golpes.",
        "en": "You believed in me… thank you. May the true light guide your strikes."
    },

    # ── 3. O MENINO (Puck) ──
    {
        "char": "menino",
        "voice": "Puck",
        "pt": "(soluçando) Eu… eu me perdi. Entrei atrás do meu cachorro e a porta sumiu.",
        "spoken_pt": "Eu… eu me perdi. Entrei atrás do meu cachorro e a porta sumiu.",
        "en": "I… I got lost. I went in after my puppy and the door vanished.",
        "spoken_en": "I… I got lost. I went in after my puppy and the door vanished."
    },
    {
        "char": "menino",
        "voice": "Puck",
        "pt": "Promete?",
        "en": "Do you promise?"
    },
    {
        "char": "menino",
        "voice": "Puck",
        "pt": "Você cumpriu a promessa! Vou contar pra todo mundo da vila!",
        "en": "You kept your promise! I'm going to tell everyone in the village!"
    },
    {
        "char": "menino",
        "voice": "Puck",
        "pt": "Você prometeu…",
        "en": "You promised…"
    },
    {
        "char": "menino",
        "voice": "Puck",
        "pt": "…Tudo bem. Meu cachorro estava me esperando do outro lado. Agora eu sei o caminho.",
        "en": "…It's okay. My puppy was waiting for me on the other side. Now I know the way."
    },

    # ── 4. A VELHA DA CABANA / A BRUXA (Leda) ──
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Ainda aqui, criança? Vá, vá… o cão de três cabeças não vai se matar sozinho. Hihihi.",
        "en": "Still here, child? Go, go… that three-headed hound won't slay itself. Tee-hee-hee."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Ah… visita! Faz tanto tempo que ninguém bate à porta desta pobre velha.",
        "en": "Ah… a visitor! It has been so long since anyone knocked on this poor old woman's door."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Estes ossos não aguentam mais o frio da névoa. Uma moedinha ajudaria tanto…",
        "en": "These old bones can no longer bear the chill of the mist. A little coin would help so much…"
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Em troca, te dou isto: uma fruta que só nasce no fundo da mata. É mágica, sabia?",
        "en": "In exchange, I give you this: a fruit that only grows deep in the woods. It is magical, you know?"
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Seus golpes vão achar o ponto fraco com mais frequência, e suas habilidades vão voltar bem mais rápido.",
        "en": "Your strikes will find the weak spot more often, and your abilities will recover much faster."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Voltou, criança? A fruta ainda está aqui, fresquinha. Só uma moedinha…",
        "en": "Returned, child? The fruit is still here, fresh as ever. Just a little coin…"
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Hmpf. Os jovens de hoje não têm coração…",
        "en": "Hmph. The youth of today have no heart…"
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Sem moedas? Que pena… volte quando tiver, criança.",
        "en": "No coins? What a pity… come back when you have some, child."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Que coração bondoso! Tome. Mas coma agora, aqui na minha frente.",
        "en": "What a kind heart! Here, take it. But eat it now, right here in front of me."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Fruta mágica perde o encanto se esfriar. Vamos, uma mordida… isso!",
        "en": "A magical fruit loses its charm if it gets cold. Come on, take a bite… that's it!"
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Hihihi… que os mortos te sejam leves. Agora vá, o Cérbero te espera.",
        "en": "Tee-hee-hee… may the dead lie lightly upon you. Now go, the Cerberus awaits you."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Ora, ora… voltou para me ver? A fruta estava docinha, não estava? Hihihi.",
        "en": "Well, well… come back to see me? The fruit was sweet, wasn't it? Tee-hee-hee."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Envenenar? Eu te dei força! E cobrei um preço justo: um pedacinho da sua vida a cada selo.",
        "en": "Poison? I gave you power! And I asked for a fair price: a tiny piece of your life with every seal."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Cada pedaço que você perde vem para mim. Olhe bem… estou quase jovem de novo.",
        "en": "Every piece you lose flows into me. Look closely… I am almost young once more."
    },
    {
        "char": "velha",
        "voice": "Leda",
        "pt": "Desfazer? Só se me matar, criança… e ninguém mata a Bruxa das Sepulturas na porta da casa dela!",
        "en": "Undo it? Only if you kill me, child… and nobody slays the Grave Witch on her own doorstep!"
    }
]

def fnv(text):
    t = str(text or "").strip()
    t = re.sub(r"\s+", " ", t)
    h = 0x811C9DC5
    b = t.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def synthesize(text, voice="Aoede"):
    model_idx = 0
    clean_text = text.strip()
    for attempt in range(8):
        model = MODELS[model_idx % len(MODELS)]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": clean_text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {"voiceName": voice}
                    }
                }
            }
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
                cand = data["candidates"][0]["content"]["parts"][0]
                raw_bytes = base64.b64decode(cand["inlineData"]["data"])
                
                if raw_bytes[:4] == b"RIFF":
                    wf = wave.open(io.BytesIO(raw_bytes), "rb")
                    sr = wf.getframerate()
                    ch = wf.getnchannels()
                    n = wf.getnframes()
                    dur = round(n / sr, 2)
                    pcm_raw = wf.readframes(n)
                else:
                    pcm_raw = raw_bytes
                    sr = 24000
                    ch = 1
                    dur = round(len(pcm_raw) / (sr * ch * 2), 2)
                
                encoder = lameenc.Encoder()
                encoder.set_bit_rate(128)
                encoder.set_in_sample_rate(sr)
                encoder.set_channels(ch)
                encoder.set_quality(2)
                mp3_bytes = encoder.encode(pcm_raw) + encoder.flush()
                return mp3_bytes, dur
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_sec = 15 + attempt * 5
                print(f"    [Rate Limit 429] Waiting {wait_sec}s before retry (model: {model})...")
                time.sleep(wait_sec)
                model_idx += 1
            else:
                print(f"    [HTTP Error {e.code}] Attempt {attempt+1}: {e}")
                time.sleep(3)
        except Exception as e:
            print(f"    [Attempt {attempt+1}/8] Error: {e}")
            time.sleep(3)
    raise RuntimeError(f"Failed to synthesize: {text}")

def main():
    print(f"=== SINTETIZADOR DE VOZES DAS MISSÕES SECUNDÁRIAS ===")
    print(f"Total de diálogos a processar: {len(SECONDARY_NPC_DIALOGUES)} ({len(SECONDARY_NPC_DIALOGUES)*2} arquivos de áudio)")

    manifest_path = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
    manifest_mirror = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")
    cache_path = os.path.join(ROOT, "scripts", "pipeline", "secondary_voice_durations_cache.json")

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except Exception:
            cache = {}

    tr_en_map = {}

    for idx, item in enumerate(SECONDARY_NPC_DIALOGUES, 1):
        char_name = item["char"]
        voice = item["voice"]
        pt_text = item["pt"]
        spoken_pt = item.get("spoken_pt", pt_text)
        en_text = item["en"]
        spoken_en = item.get("spoken_en", en_text)

        lid = fnv(pt_text)
        hash_en = fnv(en_text)
        tr_en_map[pt_text] = en_text

        print(f"\n[{idx}/{len(SECONDARY_NPC_DIALOGUES)}] [{char_name.upper()} | {voice}] {lid}: \"{pt_text[:40]}...\"")

        # ── PT-BR ──
        pt_dst = os.path.join(ROOT, "assets", "audio", "voice", "pt", f"{lid}.mp3")
        pt_mirror = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt", f"{lid}.mp3")

        if os.path.exists(pt_dst) and os.path.getsize(pt_dst) > 1000 and f"{lid}_pt" in cache:
            dur_pt = cache[f"{lid}_pt"]
            print(f"  [PT] Already cached ({dur_pt}s)")
        else:
            print(f"  [PT] Synthesizing: \"{spoken_pt}\"...")
            mp3_bytes, dur_pt = synthesize(spoken_pt, voice=voice)
            os.makedirs(os.path.dirname(pt_dst), exist_ok=True)
            os.makedirs(os.path.dirname(pt_mirror), exist_ok=True)
            with open(pt_dst, "wb") as f:
                f.write(mp3_bytes)
            with open(pt_mirror, "wb") as f:
                f.write(mp3_bytes)
            cache[f"{lid}_pt"] = dur_pt
            print(f"    Saved PT ({dur_pt}s, {len(mp3_bytes)} bytes)")
            time.sleep(1.2)

        # ── EN ──
        en_dst = os.path.join(ROOT, "assets", "audio", "voice", "en", f"{lid}.mp3")
        en_mirror = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en", f"{lid}.mp3")

        if os.path.exists(en_dst) and os.path.getsize(en_dst) > 1000 and f"{lid}_en" in cache:
            dur_en = cache[f"{lid}_en"]
            print(f"  [EN] Already cached ({dur_en}s)")
        else:
            print(f"  [EN] Synthesizing: \"{spoken_en}\"...")
            mp3_bytes, dur_en = synthesize(spoken_en, voice=voice)
            os.makedirs(os.path.dirname(en_dst), exist_ok=True)
            os.makedirs(os.path.dirname(en_mirror), exist_ok=True)
            with open(en_dst, "wb") as f:
                f.write(mp3_bytes)
            with open(en_mirror, "wb") as f:
                f.write(mp3_bytes)
            cache[f"{lid}_en"] = dur_en
            print(f"    Saved EN ({dur_en}s, {len(mp3_bytes)} bytes)")
            time.sleep(1.2)

        # Register in manifest
        manifest["k"][lid] = lid
        manifest["k"][hash_en] = lid
        manifest["d"][lid] = {
            "pt": dur_pt,
            "en": dur_en
        }

    # Save manifest
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    with open(manifest_mirror, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

    print(f"\nManifest updated with {len(SECONDARY_NPC_DIALOGUES)} secondary quest lines!")

    # ── Inject English translations into bundles ──
    print("\nInjecting translations into bundles...")
    bundles = [
        os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
    ]

    for bp in bundles:
        if not os.path.exists(bp):
            continue
        with open(bp, "r", encoding="utf-8") as f:
            code = f.read()

        pos = code.find('__TR.en = {')
        if pos == -1:
            pos = code.find('__TR.en={')
        if pos == -1:
            print(f"WARNING: __TR.en not found in {bp}")
            continue

        insert_point = code.find('{', pos) + 1
        entries = []
        for pt, en in tr_en_map.items():
            pt_esc = json.dumps(pt, ensure_ascii=False)
            en_esc = json.dumps(en, ensure_ascii=False)
            token = f"{pt_esc}: {en_esc},"
            if pt_esc not in code:
                entries.append(token)

        if entries:
            code = code[:insert_point] + "\n  " + "\n  ".join(entries) + code[insert_point:]
            with open(bp, "w", encoding="utf-8") as f:
                f.write(code)
            print(f"Injected {len(entries)} translations into {bp}")
        else:
            print(f"All translations already present in {bp}")

    print("\nAll secondary quest voices synthesized and integrated successfully!")

if __name__ == "__main__":
    main()
