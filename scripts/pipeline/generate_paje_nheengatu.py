import os
import sys
import json
import asyncio
import re
import subprocess
import edge_tts
import imageio_ffmpeg

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()

PAJE_DIALOGUES = [
    {
        "pt": "Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.",
        "en": "Kunhã… daughter of the forest. I could smell your annatto from the other side of the gate.",
        "yrl": "Kunhã… kaá tayra. Asendú waá ne uruku piatã ukena amó kiti suí.",
        "yrl_tts": "Cunhã… caá taíra. Assendú uá ne urucú piatã, ukêna amó quití suí."
    },
    {
        "pt": "O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo.",
        "en": "The last one left. When they began building new gates, our ancient seal cracked. I crossed over to hold it.",
        "yrl": "Paié paha upitá waá. Mairamé umunhã ukena pisasu, yande mukameẽsá pajeuá usuka. Axo apé xupé asupekatu arama.",
        "yrl_tts": "Paiê pahá upitá uá. Mairamê umunhã ukêna pissassú, iandê mucamenssá paieuá ussucá. Axó apé xupê, assupecatú aráma."
    },
    {
        "pt": "Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.",
        "en": "They stole the three sacred objects of the ritual. Without them, I cannot mend the fracture.",
        "yrl": "Umundá mupiri mbaá marandua rituau suí. Aintá seí, ti apukwá asukenda kuá suka.",
        "yrl_tts": "Umundá mupirí mbaá maranduá rituáu suí. Aintá seí, ti apucwá assukendá cuá sucá."
    },
    {
        "pt": "Hm. Mais um forasteiro tocado pelas Profundezas.",
        "en": "Hm. Another outlander touched by the Depths.",
        "yrl": "Hm. Amó tawa-suara upuasú Igarapé-Uaçu suí.",
        "yrl_tts": "Hm. Amó taua-ssuára upuassú Igarapé-Uassú suí."
    },
    {
        "pt": "Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.",
        "en": "An old man holding a door that refuses to stay shut. They stole the sacred relics of my ritual.",
        "yrl": "Yepé tuixawa-itá usupekatu ukena ti waá uputari usukenda. Umundá mbaá marandua se rituau suí.",
        "yrl_tts": "Iepê tuixaua-itá ussupecatú ukêna ti uá uputári assukendá. Umundá mbaá maranduá se rituáu suí."
    },
    {
        "pt": "Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.",
        "en": "If you find them on your path, bring them to me. Perhaps you may be of some use after all.",
        "yrl": "Reusú-ramé repuruká pé upé, reruri ixé arama. Xapí ne katú amó mbaá supé.",
        "yrl_tts": "Reussú-ramê repurucá pé upé, rerurí ixé aráma. Xapí ne catú amó mbaá supê."
    },
    {
        "pt": "Ainda faltam 3. A mata espera.",
        "en": "There are still 3 missing. The forest waits.",
        "yrl": "Pikí muapiri upitá. Kaá usikari.",
        "yrl_tts": "Piquí muapirí upitá. Caá ussicári."
    },
    {
        "pt": "Ainda faltam 2. A mata espera.",
        "en": "There are still 2 missing. The forest waits.",
        "yrl": "Pikí mukũi upitá. Kaá usikari.",
        "yrl_tts": "Piquí mucũi upitá. Caá ussicári."
    },
    {
        "pt": "Ainda faltam 1. A mata espera.",
        "en": "There is still 1 missing. The forest waits.",
        "yrl": "Pikí yepé upitá. Kaá usikari.",
        "yrl_tts": "Piquí iepé upitá. Caá ussicári."
    },
    {
        "pt": "Ainda falta 1. A mata espera.",
        "en": "There is still 1 missing. The forest waits.",
        "yrl": "Pikí yepé upitá. Kaá usikari.",
        "yrl_tts": "Piquí iepé upitá. Caá ussicári."
    },
    {
        "pt": "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo.",
        "en": "Everything is here. Hold the maracá with me, kunhã. Sing with me.",
        "yrl": "Panhe mbaá iké. Resupekatu maraká ixé irũmu, kunhã. Rekanta ixé irũmu.",
        "yrl_tts": "Panhê mbaá iquê. Ressupecatú maracá ixé irũmu, cunhã. Recantá ixé irũmu."
    },
    {
        "pt": "Tudo aqui… você trouxe mesmo. Afaste-se.",
        "en": "Everything is here… you truly brought it. Step back.",
        "yrl": "Panhe iké… reruri supí. Resikari apekatu.",
        "yrl_tts": "Panhê iquê… rerurí supí. Ressicári apecatú."
    },
    {
        "pt": "O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.",
        "en": "The flooded forest breathes once more. Take the forest's blessing: it will sustain your life as it did mine.",
        "yrl": "Igapó upituu yepeasu. Rerasú kaá tuixawa-sawa: aé usupekatu ne rekove mayé usupekatu se aé.",
        "yrl_tts": "Igapó upituú iepeassú. Rerassú caá tuixaua-ssaua: aê ussupecatú ne recovê maiê ussupecatú se aê."
    },
    {
        "pt": "E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.",
        "en": "And listen, kunhã: whoever builds the new gates bears the same symbol as the castle. The eye. Beware of it.",
        "yrl": "Asendú, kunhã: awá umunhã ukena pisasu upuru yepeasu sesá kastiylu sua. Sesá. Reikué katu iresé.",
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

async def synthesize_elder(tts_text, raw_mp3_path):
    # pt-BR-AntonioNeural with -10% rate and -8Hz pitch produces a wise, elder indigenous male voice
    voice = "pt-BR-AntonioNeural"
    c = edge_tts.Communicate(tts_text, voice, rate="-10%", pitch="-8Hz")
    await c.save(raw_mp3_path)

def transcode_and_get_duration(raw_mp3_path, out_mp3_path):
    cmd = [
        FFMPEG_EXE, "-y", "-i", raw_mp3_path,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=10",
        "-ar", "24000", "-ac", "1", "-b:a", "128k",
        out_mp3_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg transcode failed: {res.stderr}")
    
    # Get exact duration
    probe_cmd = [FFMPEG_EXE, "-i", out_mp3_path]
    probe_res = subprocess.run(probe_cmd, capture_output=True, text=True)
    m = re.search(r"Duration: (\d+:\d+:\d+\.\d+)", probe_res.stderr)
    if not m:
        raise RuntimeError("Could not find duration in ffmpeg output")
    h, mn, s = m.group(1).split(":")
    dur = round(int(h)*3600 + int(mn)*60 + float(s), 2)
    return dur

async def main():
    print("=== SÍNTESE DA VOZ DO PAJÉ (SENHOR IDOSO EM NHEENGATU / YRL) ===")
    manifest_paths = [
        os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")
    ]
    
    with open(manifest_paths[0], "r", encoding="utf-8") as f:
        mf = json.load(f)
    
    tmp_raw = os.path.join(ROOT, "temp_paje_raw.mp3")
    tmp_norm = os.path.join(ROOT, "temp_paje_norm.mp3")

    for i, item in enumerate(PAJE_DIALOGUES, 1):
        pt_text = item["pt"]
        en_text = item["en"]
        yrl_tts = item["yrl_tts"]
        
        h_pt = fnv(pt_text)
        h_en = fnv(en_text)

        print(f"\n[{i}/{len(PAJE_DIALOGUES)}] Hash: {h_pt}")
        print(f"  PT: {pt_text[:50]}...")
        print(f"  Nheengatu TTS: {yrl_tts}")

        # Synthesize via EdgeTTS
        await synthesize_elder(yrl_tts, tmp_raw)

        # Transcode & get duration
        dur = transcode_and_get_duration(tmp_raw, tmp_norm)
        print(f"  -> Generated Nheengatu voice! Duration: {dur}s")

        with open(tmp_norm, "rb") as f:
            audio_bytes = f.read()

        # Destination paths (assets & Projeto atualizado, pt & en)
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

    # Clean up temp files
    if os.path.exists(tmp_raw): os.remove(tmp_raw)
    if os.path.exists(tmp_norm): os.remove(tmp_norm)

    # Save manifests
    for mp in manifest_paths:
        with open(mp, "w", encoding="utf-8") as f:
            json.dump(mf, f, indent=2, ensure_ascii=False)
        print(f"Updated manifest: {mp}")

    print("\n✓ Todas as 14 falas do Pajé foram geradas com sucesso na voz de idoso e língua Nheengatu!")

if __name__ == "__main__":
    asyncio.run(main())
