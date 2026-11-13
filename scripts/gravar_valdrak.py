"""
Grava no ElevenLabs (eleven_v4) as falas de scripts/valdrak_lines.json em português e inglês e registra no
voice-manifest.json (id = hash do texto em português; o espanhol aponta para o mesmo id).
Falas do herói ("hero") saem com a voz de cada uma das 9 classes (byClass), como o resto da dublagem.
Uma chamada por fala e por idioma; pula o que já existe (use --refazer para regravar).
  python3 scripts/gravar_valdrak.py            → plano e total de caracteres
  python3 scripts/gravar_valdrak.py --executar
"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regravar_dublagem_elevenlabs as R

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, "assets", "audio", "voice"); MAN = os.path.join(VOICE, "voice-manifest.json")
_LF = sys.argv[sys.argv.index("--linhas") + 1] if "--linhas" in sys.argv else os.path.join(ROOT, "scripts", "valdrak_lines.json")
LINES = json.load(open(_LF, encoding="utf-8"))   # --linhas outro.json grava outro conjunto no mesmo formato
CAST = json.load(open(os.path.join(ROOT, "scripts", "elevenlabs_elenco.json"), encoding="utf-8"))
VOZES = {  # vozes brasileiras da biblioteca do ElevenLabs (o mesmo timbre lê o inglês)
    "aelric_jovem": "LuQ9eaWO9yCQrR73VQFa",  # Victor Pinho — jovial e enérgico
    "mira": "xcNJswC7UcxsIiCuih19",          # Larissa — vibrante
    "padeira": "jXut6osIUq8fzeZmDtEf",       # Alina — calorosa
    "ferreiro_v": "hwnuNyWkl9DjdTFykrN6",    # Adriano — grave e rouco
    "mae": "8EY2gK6oUxZCDZAlvUpZ",           # Pri — natural
    "tico": "4dlXQwYXFHlCAUmQAu9j",          # Zozo — animado
    "bram": "zoe2cQFqDDW4DteHDEWI",          # Manoel Lopes — idoso
    "corvo": "ycxdm1PRMs962FxyyuJ0",         # Otto — intimidador
    "morador": "5p9IbzcK4R8rN1fpGdMF",       # Davi — amigável
    "halvard": "rnJZLKxtlBZt77uIED10",       # Sergio — grave, sênior
    "rei": CAST["Fenrir"],                   # a mesma voz do Rei possuído
    "guardia": CAST["Aoede"],                # Elyndra = a Guardiã
    "narrador": CAST["Charon"],              # o narrador do jogo
    "conselheiro": "5lrBPYY4YvMbKHTo8kvZ",
    "crianca": "iTvRNZPNPS0EiSgOCQG0",
    "observador": "I5Mp8yDo0fn7upNW3DzQ",    # A Voz (o Observador)
    "olivia": "iTvRNZPNPS0EiSgOCQG0",
    "farias": "Hsrdp9vv51A8JfLqfIH8",        # Jaan — senhor idoso, voz grossa e séria
    "maria": "OB6x7EbXYlhG4DDTB1XU",         # Michelle — jovem de uns 20 anos, doce e animada        # Graziella (voz brasileira infantil), afinada mais aguda: menina
}
PITCH = {"olivia": 1.16}   # sobe o tom sem mudar a duração (ffmpeg asetrate + atempo)
CLASSES = ["WARRIOR", "BERSERKER", "ARCHER", "HUNTER", "DRUID", "NECROMANCER", "MAGE", "ROGUE", "SHAMAN"]

def H(t):
    t = re.sub(r"\s+", " ", t).strip(); h = 2166136261; b = t.encode("utf-16-le")
    for i in range(0, len(b), 2): h ^= b[i] | (b[i + 1] << 8); h = (h * 16777619) & 0xFFFFFFFF
    return "%08x" % h

def jobs():
    out = []
    for scene, rows in LINES["scenes"].items():
        for row in rows:
            who, pt, en, es = row[:4]
            v = LINES["speakers"][who]["voice"]; lid = H(pt)
            for lang, text in (("pt", pt), ("en", en)):
                if v == "hero":
                    for c in (["WARRIOR"] if scene.startswith("dv_") else CLASSES): out.append(dict(id=lid, lang=lang, text=text, voice=CAST[c], cls=c, keys=(pt, en, es)))
                else: out.append(dict(id=lid, lang=lang, text=text, voice=VOZES[v], cls=None, keys=(pt, en, es), pitch=PITCH.get(v)))
    return out

def main():
    J = jobs(); man = json.load(open(MAN, encoding="utf-8")); redo = "--refazer" in sys.argv
    def done(j):
        d = man["d"].get(j["id"], {})
        return (d.get("byClass", {}).get(j["lang"], {}).get(j["cls"]) if j["cls"] else d.get(j["lang"])) and not redo and d.get("vk")
    todo = [j for j in J if not done(j)]
    print(len(todo), "gravações ·", sum(len(R.clean(j["text"])) for j in todo), "caracteres")
    if "--executar" not in sys.argv: return
    key = R.api_key(); ok = fail = 0
    for n, j in enumerate(todo, 1):
        text = R.clean(j["text"])
        out = os.path.join(VOICE, j["lang"], f"{j['id']}-{j['cls']}.mp3" if j["cls"] else f"{j['id']}.mp3")
        try:
            mp3 = R.req(key, "POST", f"/v1/text-to-speech/{j['voice']}?output_format=mp3_44100_128",
                        {"text": text, "model_id": "eleven_v4", "language_code": "pt" if j["lang"] == "pt" else "en", "voice_settings": R.SETTINGS}, raw=True)
        except Exception as e:
            fail += 1; print(f"[{n}/{len(todo)}] ERRO {out}: {e}")
            if "HTTP 401" in str(e) or "quota" in str(e): break
            continue
        dur = R.save_mp3(mp3, out)
        if j.get("pitch"):
            p_ = j["pitch"]; tmp = out + ".tmp.mp3"
            sr = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip() or 44100)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out, "-af", f"asetrate={sr}*{p_},aresample={sr},atempo={1 / p_:.5f}", "-b:a", "96k", tmp], check=True)
            os.replace(tmp, out)
        d = man["d"].setdefault(j["id"], {}); d["vk"] = 1
        for t in j["keys"]: man["k"][H(t)] = j["id"]
        if j["cls"]:
            d.setdefault("byClass", {}).setdefault(j["lang"], {})[j["cls"]] = dur
            if j["cls"] == "WARRIOR":   # arquivo comum (quando o jogo não sabe o herói)
                subprocess.run(["cp", out, os.path.join(VOICE, j["lang"], j["id"] + ".mp3")], check=True); d[j["lang"]] = dur
        else: d[j["lang"]] = dur
        json.dump(man, open(MAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        ok += 1; print(f"[{n}/{len(todo)}] ok {j['lang']}/{os.path.basename(out)} {dur}s", flush=True)
    print(f"Pronto: {ok} gravadas, {fail} com erro.")

if __name__ == "__main__":
    main()
