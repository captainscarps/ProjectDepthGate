import os
import sys
import json
import base64
import urllib.request
import urllib.error
import time
import re
import subprocess
import imageio_ffmpeg
import hashlib

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

KEY_FILE = os.path.join(ROOT, "scripts", ".api_key.txt")
if os.path.exists(KEY_FILE):
    API_KEY = open(KEY_FILE, "r", encoding="utf-8").read().strip()
else:
    API_KEY = os.environ.get("GEMINI_API_KEY", "")

PAJE_DIALOGUES = [
    {
        "pt": "Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.",
        "en": "Kunhã… daughter of the forest. I could smell your annatto from the other side of the gate.",
        "yrl_tts": "Cunhã… caá taíra. Assendú uá ne urucú piatã, ukêna amó quití suí."
    },
    {
        "pt": "O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo.",
        "en": "The last one left. When they began building new gates, our ancient seal cracked. I crossed over to hold it.",
        "yrl_tts": "Paiê pahá upitá uá. Mairamê umunhã ukêna pissassú, iandê mucamenssá paieuá ussucá. Axó apé xupê, assupecatú aráma."
    },
    {
        "pt": "Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.",
        "en": "They stole the three sacred objects of the ritual. Without them, I cannot mend the fracture.",
        "yrl_tts": "Umundá mupirí mbaá maranduá rituáu suí. Aintá seí, ti apucwá assukendá cuá sucá."
    },
    {
        "pt": "Hm. Mais um forasteiro tocado pelas Profundezas.",
        "en": "Hm. Another outlander touched by the Depths.",
        "yrl_tts": "Hm. Amó taua-ssuára upuassú Igarapé-Uassú suí."
    },
    {
        "pt": "Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.",
        "en": "An old man holding a door that refuses to stay shut. They stole the sacred relics of my ritual.",
        "yrl_tts": "Iepê tuixaua-itá ussupecatú ukêna ti uá uputári assukendá. Umundá mbaá maranduá se rituáu suí."
    },
    {
        "pt": "Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.",
        "en": "If you find them on your path, bring them to me. Perhaps you may be of some use after all.",
        "yrl_tts": "Reussú-ramê repurucá pé upé, rerurí ixé aráma. Xapí ne catú amó mbaá supê."
    },
    {
        "pt": "Ainda faltam 3. A mata espera.",
        "en": "There are still 3 missing. The forest waits.",
        "yrl_tts": "Piquí muapirí upitá. Caá ussicári."
    },
    {
        "pt": "Ainda faltam 2. A mata espera.",
        "en": "There are still 2 missing. The forest waits.",
        "yrl_tts": "Piquí mucũi upitá. Caá ussicári."
    },
    {
        "pt": "Ainda faltam 1. A mata espera.",
        "en": "There is still 1 missing. The forest waits.",
        "yrl_tts": "Piquí iepé upitá. Caá ussicári."
    },
    {
        "pt": "Ainda falta 1. A mata espera.",
        "en": "There is still 1 missing. The forest waits.",
        "yrl_tts": "Piquí iepé upitá. Caá ussicári."
    },
    {
        "pt": "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo.",
        "en": "Everything is here. Hold the maracá with me, kunhã. Sing with me.",
        "yrl_tts": "Panhê mbaá iquê. Ressupecatú maracá ixé irũmu, cunhã. Recantá ixé irũmu."
    },
    {
        "pt": "Tudo aqui… você trouxe mesmo. Afaste-se.",
        "en": "Everything is here… you truly brought it. Step back.",
        "yrl_tts": "Panhê iquê… rerurí supí. Ressicári apecatú."
    },
    {
        "pt": "O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.",
        "en": "The flooded forest breathes once more. Take the forest's blessing: it will sustain your life as it did mine.",
        "yrl_tts": "Igapó upituú iepeassú. Rerassú caá tuixaua-ssaua: aê ussupecatú ne recovê maiê ussupecatú se aê."
    },
    {
        "pt": "E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.",
        "en": "And listen, kunhã: whoever builds the new gates bears the same symbol as the castle. The eye. Beware of it.",
        "yrl_tts": "Assendú, cunhã: auá umunhã ukêna pissassú upurú iepeassú sessá castílu sua. Sessá. Reicuê catú iressé."
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

def synthesize_charon_pcm(tts_text):
    models = ["gemini-2.5-flash-preview-tts", "gemini-3.1-flash-tts-preview", "gemini-3.8-flash-tts"]
    for attempt in range(8):
        model = models[attempt % len(models)]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": tts_text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Charon"}}}
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
                return raw_bytes
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_sec = 10 + attempt * 5
                print(f"    [Rate Limit 429] Waiting {wait_sec}s...")
                time.sleep(wait_sec)
            else:
                print(f"    [HTTP Error {e.code}] Attempt {attempt+1}: {e}")
                time.sleep(3)
        except Exception as e:
            print(f"    [Attempt {attempt+1}/8] Error: {e}")
            time.sleep(3)
    raise RuntimeError(f"Failed to synthesize: {tts_text}")

def pcm_to_elder_mp3(pcm_raw, out_mp3_path):
    tmp_pcm = out_mp3_path + ".tmp.pcm"
    with open(tmp_pcm, "wb") as f:
        f.write(pcm_raw)

    # Master with deep chest resonance, shamanic presence, and loudness leveling
    cmd = [
        FFMPEG_EXE, "-y",
        "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", tmp_pcm,
        "-af", "bass=g=4:f=100:w=0.8,equalizer=f=3200:t=q:w=1.2:g=1.2,loudnorm=I=-16:TP=-1.5:LRA=10",
        "-ar", "24000", "-ac", "1", "-b:a", "128k",
        out_mp3_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(tmp_pcm): os.remove(tmp_pcm)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg transcode failed: {res.stderr}")

    # Measure exact duration
    probe_cmd = [FFMPEG_EXE, "-i", out_mp3_path]
    probe_res = subprocess.run(probe_cmd, capture_output=True, text=True)
    m = re.search(r"Duration: (\d+:\d+:\d+\.\d+)", probe_res.stderr)
    if not m:
        raise RuntimeError(f"Could not find duration in ffmpeg output for {out_mp3_path}")
    h, mn, s = m.group(1).split(":")
    dur = round(int(h)*3600 + int(mn)*60 + float(s), 2)
    return dur

def main():
    print("=== SÍNTESE DA VOZ DO PAJÉ: ANCIÃO INDÍGENA (CHARON - GEMINI TTS) ===")
    manifest_paths = [
        os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")
    ]
    with open(manifest_paths[0], "r", encoding="utf-8") as f:
        mf = json.load(f)

    paje_hashes = []

    for i, item in enumerate(PAJE_DIALOGUES, 1):
        pt_text = item["pt"]
        en_text = item["en"]
        yrl_tts = item["yrl_tts"]

        h_pt = fnv(pt_text)
        h_en = fnv(en_text)
        paje_hashes.append(h_pt)

        print(f"\n[{i}/{len(PAJE_DIALOGUES)}] Hash: {h_pt}")
        print(f"  Legenda (PT): {pt_text[:40]}...")
        print(f"  Nheengatu (Charon): {yrl_tts}")

        # Synthesize via Charon
        pcm_raw = synthesize_charon_pcm(yrl_tts)
        tmp_mp3 = os.path.join(ROOT, f"temp_paje_{h_pt}.mp3")
        dur = pcm_to_elder_mp3(pcm_raw, tmp_mp3)
        print(f"  -> Áudio de Ancião Gerado! Duração: {dur}s ({len(pcm_raw)} bytes PCM)")

        with open(tmp_mp3, "rb") as f:
            audio_bytes = f.read()
        if os.path.exists(tmp_mp3): os.remove(tmp_mp3)

        # Write to both pt and en (assets and mirror)
        targets = [
            os.path.join(ROOT, "assets", "audio", "voice", "pt", f"{h_pt}.mp3"),
            os.path.join(ROOT, "assets", "audio", "voice", "en", f"{h_pt}.mp3"),
            os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt", f"{h_pt}.mp3"),
            os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en", f"{h_pt}.mp3"),
        ]
        for target in targets:
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "wb") as f:
                f.write(audio_bytes)

        # Update manifest
        mf["k"][h_pt] = h_pt
        mf["k"][h_en] = h_pt
        mf["d"][h_pt] = {"pt": dur, "en": dur}

        time.sleep(1.0)

    # Save manifests
    for mp in manifest_paths:
        with open(mp, "w", encoding="utf-8") as f:
            json.dump(mf, f, indent=2, ensure_ascii=False)
        print(f"Updated manifest: {mp}")

    print("\nAtualizando asset-versions.json...")
    av_paths = [
        os.path.join(ROOT, "asset-versions.json"),
        os.path.join(ROOT, "Projeto atualizado", "asset-versions.json")
    ]
    with open(av_paths[0], "r", encoding="utf-8") as f:
        av = json.load(f)

    # Hash updated files
    for h in paje_hashes:
        for lang in ["pt", "en"]:
            rel = f"assets/audio/voice/{lang}/{h}.mp3"
            full = os.path.join(ROOT, rel)
            with open(full, "rb") as fp:
                av[rel] = hashlib.md5(fp.read()).hexdigest()[:10]

    with open(os.path.join(ROOT, "assets/audio/voice/voice-manifest.json"), "rb") as fp:
        av["assets/audio/voice/voice-manifest.json"] = hashlib.md5(fp.read()).hexdigest()[:10]

    av_data = json.dumps(av, separators=(",", ":"), sort_keys=True)
    for p in av_paths:
        with open(p, "w", encoding="utf-8") as f:
            f.write(av_data)
        print(f"Updated {p}")

    print("\n=== SÍNTESE CONCLUÍDA COM SUCESSO! ===")

if __name__ == "__main__":
    main()
