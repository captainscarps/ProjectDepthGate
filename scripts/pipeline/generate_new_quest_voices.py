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

DIALOGUES = [
    # 1. quests.js
    (
        "Espere. Uma carta atravessou um dos portais. Está selada com um brasão que você conhece.",
        "Wait. A letter crossed one of the gates. It is sealed with a crest you know."
    ),
    (
        "O templo fica além do último selo que você fechou. Vou abrir o caminho. Tragam um ao outro de volta.",
        "The temple lies beyond the last seal you closed. I will open the way. Bring each other back."
    ),
    (
        "Vocês dois juntos… há muito tempo não via isso. Agora, de volta aos selos.",
        "The two of you together… I haven't seen that in a long time. Now, back to the seals."
    ),
    (
        "O templo ainda espera por vocês.",
        "The temple is still waiting for you."
    ),
    (
        "Seu irmão espera no templo. Vou abrir o caminho de novo.",
        "Your brother is waiting in the temple. I will open the way again."
    ),
    (
        "Essa lâmina… ela fala com você, não fala? Sinto a fome dela daqui.",
        "That blade… it speaks to you, doesn't it? I can feel its hunger from here."
    ),
    (
        "Posso purificá-la — ela perde a fome, mas guarda um pouco da força. Ou você enfrenta o espírito dentro dela e a domina.",
        "I can purify it — it will lose its hunger, but keep some of its strength. Or you can face the spirit within and master it."
    ),

    # 2. temple.js
    (
        "O templo está em silêncio outra vez. Venha, vou te trazer de volta.",
        "The temple is silent once more. Come, I will bring you back."
    ),

    # 3. witch-quest.js
    (
        "Cuidado. Esta névoa esconde mais do que túmulos. Siga até o covil do Cérbero e acabe com ele.",
        "Careful. This mist hides more than tombs. Make your way to the Cerberus lair and destroy it."
    ),
    (
        "Você conseguiu! As portas dos mortos estão se fechando.",
        "You did it! The gates of the dead are closing."
    ),
    (
        "Vou te trazer de volta ao Coração da Floresta.",
        "I will bring you back to the Heart of the Forest."
    ),
    (
        "Acabou. O feitiço morreu junto com ela.",
        "It's over. The spell died with her."
    ),
    (
        "Venha, vou te levar de volta para casa.",
        "Come, I will take you back home."
    ),
    (
        "Espere. Antes que você continue, preciso que faça uma coisa por mim.",
        "Wait. Before you continue, I need you to do something for me."
    ),
    (
        "Vou abrir um portal e te levar à Floresta da Cripta.",
        "I will open a gate and take you to the Crypt Forest."
    ),
    (
        "Lá, o Cérbero da Podridão está causando o caos e abrindo portas para os mortos passarem.",
        "There, the Rot Cerberus is wreaking havoc and opening doors for the dead to cross."
    ),
    (
        "Derrote-o. Isso é urgente!",
        "Defeat it. This is urgent!"
    ),
    (
        "Espere… estou sentindo que você está mais fraco. Menos resistente.",
        "Wait… I sense that you are weaker. Less resilient."
    ),
    (
        "Deixe-me examinar você.",
        "Let me examine you."
    ),
    (
        "Isto é um envenenamento mágico. Ele se agarra à sua vida e a consome a cada selo.",
        "This is magical poisoning. It clings to your life and consumes it with each seal."
    ),
    (
        "Você aceitou algo de algum estranho?",
        "Did you accept anything from a stranger?"
    ),
    (
        "Na Floresta da Cripta, além dos mortos, só vive uma bruxa. Foi ela que te envenenou.",
        "In the Crypt Forest, apart from the dead, only a witch dwells. She was the one who poisoned you."
    ),
    (
        "Vou tentar desfazer o feitiço.",
        "I will try to break the spell."
    ),
    (
        "Não… não é o suficiente. Algo prende você a essa bruxa. Enquanto ela viver, o veneno vive.",
        "No… it is not enough. Something binds you to this witch. As long as she lives, the poison lives."
    ),
    (
        "Vou abrir um portal bem na porta da casa dela. Acabe com isso.",
        "I will open a gate right at her doorstep. End this."
    ),
    (
        "Você se sente bem?",
        "Do you feel well?"
    ),
    (
        "Que bom. Mas não ignore o que o corpo diz. Se algo mudar, me procure.",
        "Good. But do not ignore what your body tells you. If anything changes, seek me out."
    ),
    (
        "A Floresta da Cripta está em paz… por enquanto. Obrigada.",
        "The Crypt Forest is at peace… for now. Thank you."
    ),
    (
        "Agora, sim, podemos voltar aos selos.",
        "Now, indeed, we can return to the seals."
    ),
    (
        "Agora sinto que está melhorando. Acho que podemos continuar.",
        "Now I feel you are improving. I believe we can continue."
    ),
    (
        "A Floresta da Cripta não pode esperar. Vou abrir o portal de novo.",
        "The Crypt Forest cannot wait. I will open the gate again."
    ),
    (
        "A bruxa ainda prende você. Vou te levar até a casa dela.",
        "The witch still binds you. I will take you to her house."
    )
]

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def synthesize(text, voice="Aoede"):
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
    print(f"Total dialogues to process: {len(DIALOGUES)}")
    manifest_path = "assets/audio/voice/voice-manifest.json"
    manifest_mirror = "Projeto atualizado/assets/audio/voice/voice-manifest.json"
    cache_path = "scripts/pipeline/voice_durations_cache.json"

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

    for idx, (pt_text, en_text) in enumerate(DIALOGUES, 1):
        lid = fnv(pt_text)
        hash_en = fnv(en_text)
        tr_en_map[pt_text] = en_text

        print(f"\n[{idx:02d}/{len(DIALOGUES)}] LID: {lid} | Hash EN: {hash_en}")

        # Paths
        pt_path = f"assets/audio/voice/pt/{lid}.mp3"
        pt_mirror = f"Projeto atualizado/assets/audio/voice/pt/{lid}.mp3"
        en_path = f"assets/audio/voice/en/{lid}.mp3"
        en_mirror = f"Projeto atualizado/assets/audio/voice/en/{lid}.mp3"

        # Check PT
        need_pt = not os.path.exists(pt_path) or os.path.getsize(pt_path) < 1000
        if need_pt:
            print(f"  Synthesizing PT: {pt_text[:50]}...")
            pt_mp3, pt_dur = synthesize(pt_text, "Aoede")
            with open(pt_path, "wb") as f:
                f.write(pt_mp3)
            with open(pt_mirror, "wb") as f:
                f.write(pt_mp3)
            print(f"  PT saved: {len(pt_mp3)} bytes, {pt_dur}s")
            time.sleep(3)
        else:
            if lid in cache and "pt" in cache[lid]:
                pt_dur = cache[lid]["pt"]
            elif lid in manifest.get("d", {}) and "pt" in manifest["d"][lid]:
                pt_dur = manifest["d"][lid]["pt"]
            else:
                pt_dur = round(os.path.getsize(pt_path) / 16000.0, 2)
            print(f"  PT already exists ({pt_dur}s)")

        # Check EN
        need_en = not os.path.exists(en_path) or os.path.getsize(en_path) < 1000
        if need_en:
            print(f"  Synthesizing EN: {en_text[:50]}...")
            en_mp3, en_dur = synthesize(en_text, "Aoede")
            with open(en_path, "wb") as f:
                f.write(en_mp3)
            with open(en_mirror, "wb") as f:
                f.write(en_mp3)
            print(f"  EN saved: {len(en_mp3)} bytes, {en_dur}s")
            time.sleep(3)
        else:
            if lid in cache and "en" in cache[lid]:
                en_dur = cache[lid]["en"]
            elif lid in manifest.get("d", {}) and "en" in manifest["d"][lid]:
                en_dur = manifest["d"][lid]["en"]
            else:
                en_dur = round(os.path.getsize(en_path) / 16000.0, 2)
            print(f"  EN already exists ({en_dur}s)")

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
    print("Manifest updated successfully.")

    # Update translations in bundle files
    print("\nUpdating __TR.en in JS bundles...")
    assign_code = f"\nObject.assign(__TR.en,{json.dumps(tr_en_map, ensure_ascii=False)});\n"
    
    for bundle_file in ["assets/index-D6qIWtA7-p209.js", "Projeto atualizado/assets/index-D6qIWtA7-p209.js"]:
        if os.path.exists(bundle_file):
            with open(bundle_file, "r", encoding="utf-8") as f:
                js_content = f.read()
            
            anchor = 'Object.assign(__TR.en,{"Olhe nos meus olhos e vire pedra no meio do rio."'
            if "Espere. Uma carta atravessou um dos portais." in js_content:
                print(f"  Translations already present in {bundle_file}")
            else:
                if anchor in js_content:
                    idx = js_content.find(anchor)
                    js_content = js_content[:idx] + assign_code + js_content[idx:]
                    with open(bundle_file, "w", encoding="utf-8") as f:
                        f.write(js_content)
                    print(f"  Inserted translations into {bundle_file}")
                else:
                    print(f"  WARNING: anchor not found in {bundle_file}")

    print("\n=== COMPLETE! ===")

if __name__ == "__main__":
    main()
