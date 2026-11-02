import os
import sys
import json
import base64
import urllib.request
import urllib.error
import wave
import io
import time
import lameenc

sys.stdout.reconfigure(encoding="utf-8")

API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODELS = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview"]

HERO_DIALOGUES = [
    # Quests - Irmão / Templo
    (
        "É a letra do meu irmão mais velho… AKIHIRO.",
        "It's the handwriting of my older brother… AKIHIRO."
    ),
    (
        "É a letra do meu irmão… HAYATO.",
        "It's the handwriting of my brother… HAYATO."
    ),
    (
        "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.",
        "I would never leave you alone. Not here, not anywhere."
    ),
    (
        "Lembro. Você sempre chegava atrasado.",
        "I remember. You were always late."
    ),

    # Quests - Pajé
    (
        "Avô? O senhor é… um dos pajés do igapó?",
        "Grandfather? Are you… one of the shamans of the igapó?"
    ),
    (
        "Quem é o senhor?",
        "Who are you, sir?"
    ),
    (
        "O Observador…",
        "The Beholder…"
    ),

    # Quests - Bispo / Freira
    (
        "Bispo! Mostre o que está bordado no seu manto.",
        "Bishop! Show what is embroidered on your mantle."
    ),

    # Quests - Menino perdido
    (
        "Fique perto de mim. Vou te tirar daqui.",
        "Stay close to me. I will get you out of here."
    ),
    (
        "Me perdoe. Eu não fui rápido o bastante.",
        "Forgive me. I was not fast enough."
    ),

    # Witch Quest
    (
        "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse.",
        "An old lady… in the Crypt Forest. She gave me a fruit and insisted that I eat it."
    ),
    (
        "Você me envenenou!",
        "You poisoned me!"
    ),
    (
        "Desfaça o feitiço. Agora.",
        "Break the spell. Now."
    ),

    # Witch Quest - Barks de veneno
    (
        "Essa missão foi mais difícil do que deveria ser… o que será?",
        "This quest was harder than it should have been… what could it be?"
    ),
    (
        "Minhas pernas pesam como pedra… isso não é normal.",
        "My legs feel heavy as stone… this is not normal."
    ),
    (
        "Antes eu aguentava muito mais. O que está acontecendo comigo?",
        "I used to endure much more. What is happening to me?"
    ),
    (
        "Cada selo me deixa mais fraco… ou é impressão minha?",
        "Each seal leaves me weaker… or is it just my impression?"
    ),

    # Intro / Portais Hero lines
    (
        "Quem… quem está falando comigo?",
        "Who… who is speaking to me?"
    ),
    (
        "Essa voz… parece vir de todos os lados.",
        "That voice… it seems to come from everywhere."
    ),
    (
        "Calma, pequeno… não vou te machucar.",
        "Easy, little one… I won't hurt you."
    ),
    (
        "Voltaram… só que em outro canto. Espertos.",
        "They came back… just somewhere else. Clever."
    )
]

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def synthesize(text, voice="Puck"):
    model_idx = 0
    for attempt in range(8):
        model = MODELS[model_idx % len(MODELS)]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": text}]}],
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
                wait_sec = 20 + attempt * 5
                print(f"    [Rate Limit 429] Waiting {wait_sec}s before retry (model: {model})...")
                time.sleep(wait_sec)
                model_idx += 1
            else:
                print(f"    [HTTP Error {e.code}] Attempt {attempt+1}: {e}")
                time.sleep(3)
        except Exception as e:
            print(f"    [Attempt {attempt+1}/8] Error: {e}")
            time.sleep(3)
    raise RuntimeError(f"Failed to synthesize after retries: {text}")

def main():
    print(f"Total hero dialogues to process: {len(HERO_DIALOGUES)}")
    manifest_path = "assets/audio/voice/voice-manifest.json"
    manifest_mirror = "Projeto atualizado/assets/audio/voice/voice-manifest.json"
    cache_path = "scripts/pipeline/hero_voice_durations_cache.json"

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except Exception:
            cache = {}

    os.makedirs("assets/audio/voice/pt", exist_ok=True)
    os.makedirs("assets/audio/voice/en", exist_ok=True)
    os.makedirs("Projeto atualizado/assets/audio/voice/pt", exist_ok=True)
    os.makedirs("Projeto atualizado/assets/audio/voice/en", exist_ok=True)

    tr_en_map = {}

    for idx, (pt_text, en_text) in enumerate(HERO_DIALOGUES, 1):
        lid = fnv(pt_text)
        hash_en = fnv(en_text)
        tr_en_map[pt_text] = en_text

        print(f"\n[{idx:02d}/{len(HERO_DIALOGUES)}] LID: {lid} | Hash EN: {hash_en}")

        # Paths
        pt_path = f"assets/audio/voice/pt/{lid}.mp3"
        pt_mirror = f"Projeto atualizado/assets/audio/voice/pt/{lid}.mp3"
        en_path = f"assets/audio/voice/en/{lid}.mp3"
        en_mirror = f"Projeto atualizado/assets/audio/voice/en/{lid}.mp3"

        # Check PT
        need_pt = not os.path.exists(pt_path) or os.path.getsize(pt_path) < 1000
        if need_pt:
            print(f"  Synthesizing Hero PT: {pt_text[:50]}...")
            pt_mp3, pt_dur = synthesize(pt_text, "Puck")
            with open(pt_path, "wb") as f:
                f.write(pt_mp3)
            with open(pt_mirror, "wb") as f:
                f.write(pt_mp3)
            print(f"  Hero PT saved: {len(pt_mp3)} bytes, {pt_dur}s")
            time.sleep(3)
        else:
            if lid in cache and "pt" in cache[lid]:
                pt_dur = cache[lid]["pt"]
            elif lid in manifest.get("d", {}) and "pt" in manifest["d"][lid]:
                pt_dur = manifest["d"][lid]["pt"]
            else:
                pt_dur = round(os.path.getsize(pt_path) / 16000.0, 2)
            print(f"  Hero PT already exists ({pt_dur}s)")

        # Check EN
        need_en = not os.path.exists(en_path) or os.path.getsize(en_path) < 1000
        if need_en:
            print(f"  Synthesizing Hero EN: {en_text[:50]}...")
            en_mp3, en_dur = synthesize(en_text, "Puck")
            with open(en_path, "wb") as f:
                f.write(en_mp3)
            with open(en_mirror, "wb") as f:
                f.write(en_mp3)
            print(f"  Hero EN saved: {len(en_mp3)} bytes, {en_dur}s")
            time.sleep(3)
        else:
            if lid in cache and "en" in cache[lid]:
                en_dur = cache[lid]["en"]
            elif lid in manifest.get("d", {}) and "en" in manifest["d"][lid]:
                en_dur = manifest["d"][lid]["en"]
            else:
                en_dur = round(os.path.getsize(en_path) / 16000.0, 2)
            print(f"  Hero EN already exists ({en_dur}s)")

        # Save to cache
        cache[lid] = {"pt": round(pt_dur, 2), "en": round(en_dur, 2)}
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)

        # Update manifest in-memory
        manifest["k"][lid] = lid
        manifest["k"][hash_en] = lid
        manifest["d"][lid] = {
            "pt": round(pt_dur, 2),
            "en": round(en_dur, 2)
        }

    # Save manifest
    print("\nSaving voice-manifest.json...")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    with open(manifest_mirror, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("Manifest updated successfully with hero voices.")

    # Update translations in bundle files
    print("\nUpdating __TR.en for hero dialogues in JS bundles...")
    assign_code = f"\n;Object.assign(__TR.en,{json.dumps(tr_en_map, ensure_ascii=False)});\n"

    for bundle_file in ["assets/index-D6qIWtA7-p209.js", "Projeto atualizado/assets/index-D6qIWtA7-p209.js"]:
        if os.path.exists(bundle_file):
            with open(bundle_file, "r", encoding="utf-8") as f:
                js_content = f.read()

            anchor = 'Object.assign(__TR.en,{"Olhe nos meus olhos'
            if "I would never leave you alone. Not here, not anywhere." in js_content:
                print(f"  Hero translations already present in {bundle_file}")
            else:
                if anchor in js_content:
                    idx = js_content.find(anchor)
                    js_content = js_content[:idx] + assign_code + js_content[idx:]
                    with open(bundle_file, "w", encoding="utf-8") as f:
                        f.write(js_content)
                    print(f"  Inserted hero translations into {bundle_file}")
                else:
                    print(f"  WARNING: anchor not found in {bundle_file}")

    print("\n=== HERO VOICES GENERATION COMPLETE! ===")

if __name__ == "__main__":
    main()
