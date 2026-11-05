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

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODELS_QUEUE = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview", "gemini-3.8-flash-lite-tts"]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
OUT_EN = os.path.join(ROOT, "assets", "audio", "voice", "en")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MIRROR_EN = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

os.makedirs(OUT_PT, exist_ok=True)
os.makedirs(OUT_EN, exist_ok=True)
os.makedirs(MIRROR_PT, exist_ok=True)
os.makedirs(MIRROR_EN, exist_ok=True)

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

def generate_tts(prompt, voice_name):
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
                    return wav_to_mp3(wav_bytes)
            except Exception as e:
                time.sleep(1)
    raise RuntimeError(f"TTS Failed for {prompt[:50]}")

print("=== GENERATING NEW VOICES FOR DEPTHGATE ===")

# 1. Guardiã Cave Line
LINE_CAVE_PT = "Explore com cuidado, herói. Não se preocupe, se acontecer algo, eu abro um portal e te trago de volta pro Refúgio."
LINE_CAVE_EN = "Explore carefully, hero. Don't worry, if anything happens, I'll open a portal and bring you back to the Refuge."
ID_CAVE = fnv(LINE_CAVE_PT)
print(f"Cave Line ID: {ID_CAVE}")

pt_mp3, pt_dur = generate_tts(
    f'Diga com voz feminina solene, afetuosa, serena e autoridade mística de Guardiã protetora: "{LINE_CAVE_PT}"',
    "Aoede"
)
with open(os.path.join(OUT_PT, f"{ID_CAVE}.mp3"), "wb") as f: f.write(pt_mp3)
with open(os.path.join(MIRROR_PT, f"{ID_CAVE}.mp3"), "wb") as f: f.write(pt_mp3)
print(f"✓ Guardiã Cave PT saved ({len(pt_mp3)} bytes, {pt_dur}s)")

en_mp3, en_dur = generate_tts(
    f'Speak with a serene, protective, warm, authoritative and mystical female voice of a Guardian: "{LINE_CAVE_EN}"',
    "Aoede"
)
with open(os.path.join(OUT_EN, f"{ID_CAVE}.mp3"), "wb") as f: f.write(en_mp3)
with open(os.path.join(MIRROR_EN, f"{ID_CAVE}.mp3"), "wb") as f: f.write(en_mp3)
print(f"✓ Guardiã Cave EN saved ({len(en_mp3)} bytes, {en_dur}s)")

# 2. Guardiã Magic Blessing Line
LINE_MAGIC_PT = "Cada um de vocês veio de terras e eras distintas, falando línguas que os outros não compreendiam. Que a bênção dos selos una nossas vozes e espíritos."
LINE_MAGIC_EN = "Each of you came from distinct lands and eras, speaking tongues others could not understand. May the blessing of the seals unite our voices and spirits."
ID_MAGIC = fnv(LINE_MAGIC_PT)
print(f"Magic Line ID: {ID_MAGIC}")

pt_mp3_m, pt_dur_m = generate_tts(
    f'Diga com tom solene, místico, acolhedor e transcendental de uma divindade protetora: "{LINE_MAGIC_PT}"',
    "Aoede"
)
with open(os.path.join(OUT_PT, f"{ID_MAGIC}.mp3"), "wb") as f: f.write(pt_mp3_m)
with open(os.path.join(MIRROR_PT, f"{ID_MAGIC}.mp3"), "wb") as f: f.write(pt_mp3_m)
print(f"✓ Guardiã Magic PT saved ({len(pt_mp3_m)} bytes, {pt_dur_m}s)")

en_mp3_m, en_dur_m = generate_tts(
    f'Speak with a solemn, mystical, welcoming, and transcendental tone of a protective deity: "{LINE_MAGIC_EN}"',
    "Aoede"
)
with open(os.path.join(OUT_EN, f"{ID_MAGIC}.mp3"), "wb") as f: f.write(en_mp3_m)
with open(os.path.join(MIRROR_EN, f"{ID_MAGIC}.mp3"), "wb") as f: f.write(en_mp3_m)
print(f"✓ Guardiã Magic EN saved ({len(en_mp3_m)} bytes, {en_dur_m}s)")

# 3. Guardiã Explanation Line
LINE_EXPL_PT = "É a comunhão dos DepthGates. Agora nossas mentes se tocam, e qualquer viajante que você encontrar entenderá as suas palavras."
LINE_EXPL_EN = "It is the communion of the DepthGates. Now our minds touch, and any traveler you meet will understand your words."
ID_EXPL = fnv(LINE_EXPL_PT)
print(f"Explanation Line ID: {ID_EXPL}")

pt_mp3_e, pt_dur_e = generate_tts(
    f'Diga com tom caloroso, sereno, sábio e reconfortante: "{LINE_EXPL_PT}"',
    "Aoede"
)
with open(os.path.join(OUT_PT, f"{ID_EXPL}.mp3"), "wb") as f: f.write(pt_mp3_e)
with open(os.path.join(MIRROR_PT, f"{ID_EXPL}.mp3"), "wb") as f: f.write(pt_mp3_e)
print(f"✓ Guardiã Explanation PT saved ({len(pt_mp3_e)} bytes, {pt_dur_e}s)")

en_mp3_e, en_dur_e = generate_tts(
    f'Speak with a warm, serene, wise, and reassuring tone: "{LINE_EXPL_EN}"',
    "Aoede"
)
with open(os.path.join(OUT_EN, f"{ID_EXPL}.mp3"), "wb") as f: f.write(en_mp3_e)
with open(os.path.join(MIRROR_EN, f"{ID_EXPL}.mp3"), "wb") as f: f.write(en_mp3_e)
print(f"✓ Guardiã Explanation EN saved ({len(en_mp3_e)} bytes, {en_dur_e}s)")

# 4. Hero Reaction Lines (Per Class)
HERO_REACTION_PT = "Nossa, estou falando e entendendo uma língua diferente, que mágica é essa?"
HERO_REACTION_EN = "Wow, I'm speaking and understanding a different language, what kind of magic is this?"
ID_REACTION = fnv(HERO_REACTION_PT)
print(f"Hero Reaction Line ID: {ID_REACTION}")

HERO_PROFILES = {
    "WARRIOR": {
        "voice": "Fenrir",
        "pt_dir": "homem forte, voz grave, encorpada e altiva, demonstrando surpresa e espanto genuíno com autoridade",
        "en_dir": "strong man, deep, rich and imposing voice, showing genuine surprise and astonishment with authority"
    },
    "ARCHER": {
        "voice": "Puck",
        "pt_dir": "homem jovem, voz enérgica, impulsiva e espontânea, com reação de surpresa viva e curiosidade",
        "en_dir": "young man, energetic, impulsive and spontaneous voice, with lively surprise and curiosity"
    },
    "MAGE": {
        "voice": "Kore",
        "pt_dir": "mulher madura e experiente, voz segura, sofisticada e firme, demonstrando espanto intelectual genuíno diante da magia",
        "en_dir": "mature and experienced woman, confident, sophisticated, firm voice, showing genuine intellectual wonder at the magic"
    },
    "ROGUE": {
        "voice": "Leda",
        "pt_dir": "mulher jovem de 20 anos, voz misteriosa, astuta e reservada, com espanto genuíno e cautela",
        "en_dir": "young woman of 20, mysterious, sly and reserved voice, with genuine astonishment and caution"
    },
    "NECROMANCER": {
        "voice": "Fenrir",
        "pt_dir": "homem de meia-idade, voz cansada, sombria e contida, surpreso com a clareza repentina da fala",
        "en_dir": "middle-aged man, weary, somber and restrained voice, surprised by the sudden clarity of speech"
    },
    "SHAMAN": {
        "voice": "Zephyr",
        "pt_dir": "mulher adulta, voz curiosa, expressiva e imponente, sentindo a conexão espiritual e surpresa genuína",
        "en_dir": "adult woman, curious, expressive and imposing voice, feeling the spiritual connection and genuine surprise"
    },
    "BERSERKER": {
        "voice": "Orus",
        "pt_dir": "homem de 40 anos, samurai disciplinado, voz madura, calma e controlada, admirado com o fenômeno",
        "en_dir": "40-year-old disciplined samurai, mature, calm and controlled voice, marveling at the phenomenon"
    },
    "HUNTER": {
        "voice": "Orus",
        "pt_dir": "homem adulto, voz reservada, madura e misteriosa, falando de maneira controlada com surpresa contida",
        "en_dir": "adult man, reserved, mature and mysterious voice, speaking in a controlled manner with restrained surprise"
    },
    "DRUID": {
        "voice": "Charon",
        "pt_dir": "homem de 50 anos, voz profunda, tranquila e sábia, admirado com a magia ancestral que ressoa na voz",
        "en_dir": "50-year-old man, deep, tranquil and wise voice, marveling at the ancient magic resonating in his voice"
    }
}

reaction_durs_pt = {}
reaction_durs_en = {}

for cls_key, prof in HERO_PROFILES.items():
    print(f"Generating reaction for {cls_key} ({prof['voice']})...")
    # PT
    pt_h_mp3, pt_h_dur = generate_tts(
        f"Diga exatamente esta fala em Português com interpretação de {prof['pt_dir']}: \"{HERO_REACTION_PT}\"",
        prof["voice"]
    )
    with open(os.path.join(OUT_PT, f"{ID_REACTION}-{cls_key}.mp3"), "wb") as f: f.write(pt_h_mp3)
    with open(os.path.join(MIRROR_PT, f"{ID_REACTION}-{cls_key}.mp3"), "wb") as f: f.write(pt_h_mp3)
    reaction_durs_pt[cls_key] = pt_h_dur

    # EN
    en_h_mp3, en_h_dur = generate_tts(
        f"Say exactly this line in English with the delivery of a {prof['en_dir']}: \"{HERO_REACTION_EN}\"",
        prof["voice"]
    )
    with open(os.path.join(OUT_EN, f"{ID_REACTION}-{cls_key}.mp3"), "wb") as f: f.write(en_h_mp3)
    with open(os.path.join(MIRROR_EN, f"{ID_REACTION}-{cls_key}.mp3"), "wb") as f: f.write(en_h_mp3)
    reaction_durs_en[cls_key] = en_h_dur
    print(f"  ✓ {cls_key} PT: {pt_h_dur}s, EN: {en_h_dur}s")

# Also write default generic fallback file for ID_REACTION using Warrior
with open(os.path.join(OUT_PT, f"{ID_REACTION}.mp3"), "wb") as f:
    f.write(open(os.path.join(OUT_PT, f"{ID_REACTION}-WARRIOR.mp3"), "rb").read())
with open(os.path.join(OUT_EN, f"{ID_REACTION}.mp3"), "wb") as f:
    f.write(open(os.path.join(OUT_EN, f"{ID_REACTION}-WARRIOR.mp3"), "rb").read())
with open(os.path.join(MIRROR_PT, f"{ID_REACTION}.mp3"), "wb") as f:
    f.write(open(os.path.join(OUT_PT, f"{ID_REACTION}-WARRIOR.mp3"), "rb").read())
with open(os.path.join(MIRROR_EN, f"{ID_REACTION}.mp3"), "wb") as f:
    f.write(open(os.path.join(OUT_EN, f"{ID_REACTION}-WARRIOR.mp3"), "rb").read())

# 5. Update voice-manifest.json
with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Register text hashes in manifest['k']
def reg_k(txt, target_id):
    h = fnv(txt)
    manifest["k"][h] = target_id
    manifest["k"][target_id] = target_id

reg_k(LINE_CAVE_PT, ID_CAVE)
reg_k(LINE_CAVE_EN, ID_CAVE)
reg_k(LINE_MAGIC_PT, ID_MAGIC)
reg_k(LINE_MAGIC_EN, ID_MAGIC)
reg_k(LINE_EXPL_PT, ID_EXPL)
reg_k(LINE_EXPL_EN, ID_EXPL)
reg_k(HERO_REACTION_PT, ID_REACTION)
reg_k(HERO_REACTION_EN, ID_REACTION)

manifest["d"][ID_CAVE] = {"pt": pt_dur, "en": en_dur}
manifest["d"][ID_MAGIC] = {"pt": pt_dur_m, "en": en_dur_m}
manifest["d"][ID_EXPL] = {"pt": pt_dur_e, "en": en_dur_e}
manifest["d"][ID_REACTION] = {
    "pt": reaction_durs_pt["WARRIOR"],
    "en": reaction_durs_en["WARRIOR"],
    "byClass": {
        "pt": reaction_durs_pt,
        "en": reaction_durs_en
    }
}

manifest_json_str = json.dumps(manifest, ensure_ascii=False, indent=2)
with open(MANIFEST_PATH, "w", encoding="utf-8") as f: f.write(manifest_json_str)
with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f: f.write(manifest_json_str)

print("\n=== VOICE GENERATION & MANIFEST UPDATE COMPLETE! ===")
