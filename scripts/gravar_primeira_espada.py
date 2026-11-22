"""Dublagem da missão "A Primeira Espada" (p216.105) com as MESMAS vozes de antes de cada personagem:
  Farias ...... ElevenLabs "farias" (Jaan) em PT e EN — como as falas da taverna (gravar_valdrak.py)
  Rafael ...... PT ElevenLabs = par do Gemini "Algieba" no elenco (como o resto das falas dele);
                EN Kokoro am_onyx 0.92 en-us (generate_quest_npc_voices.py, "rafael")
  Herói ....... uma versão por classe: PT ElevenLabs do elenco (WARRIOR, MAGE…);
                EN Kokoro com a mistura de vozes e o tratamento da dublagem em inglês (build_voice_dub.KVOICE "hero-<CLASSE>")
  Gaspar ...... personagem novo: ElevenLabs "Rannox Elion" (grave, rouco) em PT e EN
As falas saem de scripts/source/primeira-espada.js (texto idêntico ao do jogo); id = hash do português, EN/ES apontam para o mesmo id.
  python3 scripts/gravar_primeira_espada.py              → lista as falas e o plano
  python3 scripts/gravar_primeira_espada.py --executar   (KOKORO_DIR=/tmp/kok com kokoro.onnx+voices.bin; KOKORO_Q8 para o herói)
Pula o que já existe (--refazer regrava)."""
import importlib.util, json, os, re, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regravar_dublagem_elevenlabs as R
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, "assets", "audio", "voice"); MAN = os.path.join(VOICE, "voice-manifest.json")
CAST = json.load(open(os.path.join(ROOT, "scripts", "elevenlabs_elenco.json"), encoding="utf-8"))
CLASSES = ["WARRIOR", "BERSERKER", "ARCHER", "HUNTER", "DRUID", "NECROMANCER", "MAGE", "ROGUE", "SHAMAN"]
EL = {"farias": "Hsrdp9vv51A8JfLqfIH8", "rafael": CAST["Algieba"], "gaspar": "NvHN9pLXN2C3JhUv7ZCi"}

def H(t):
    t = re.sub(r"\s+", " ", t).strip(); h = 2166136261; b = t.encode("utf-16-le")
    for i in range(0, len(b), 2): h ^= b[i] | (b[i + 1] << 8); h = (h * 16777619) & 0xFFFFFFFF
    return "%08x" % h

STR = r'"((?:[^"\\]|\\.)*)"'
def lines():
    src = open(os.path.join(ROOT, "scripts", "source", "primeira-espada.js"), encoding="utf-8").read()
    fns = [(m.start(), m.group(1)) for m in re.finditer(r"function (\w+)\(", src)]
    out, seen = [], set()
    for m in re.finditer(r"L3\(\s*" + STR + r",\s*" + STR + r",\s*" + STR + r"\s*\)", src):
        pt, en, es = (json.loads('"' + g + '"') for g in m.groups())
        back = src[max(0, m.start() - 40):m.start()]
        fname = max((f for f in fns if f[0] < m.start()), default=(0, ""))[1]
        who = None
        if re.search(r"(__Q\.H\(S,|__feHero\(H,)\s*$", back): who = "hero"
        elif re.search(r"\bG\(\s*$", back): who = "gaspar"
        elif re.search(r"\bR\(\s*$", back): who = "rafael"
        elif re.search(r"\bF\(\s*\[?\s*$", back): who = "farias"
        elif fname == "__feFariasTalk" and re.search(r"(\[,\s*|\),\s*)$", back): who = "farias"   # falas em lista ([, L3(...), L3(...)][s])
        if not who or pt in seen: continue
        seen.add(pt); out.append((who, pt, en, es))
    return out

def main():
    L = lines()
    if "--listar" in sys.argv or "--executar" not in sys.argv:
        for w, pt, en, es in L: print(f"{w:7s} {pt[:96]}")
        print(len(L), "falas ·", sum(1 for x in L if x[0] == "hero"), "do herói")
    if "--executar" not in sys.argv: return
    man = json.load(open(MAN, encoding="utf-8")); redo = "--refazer" in sys.argv; key = R.api_key()
    # Kokoro (inglês): Rafael com o modelo cheio; herói com o q8 e o tratamento da dublagem
    def load(name, f):
        sp = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", f)); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
    Q = load("questv", "generate_quest_npc_voices.py")
    _a, sys.argv = sys.argv, sys.argv[:1]; DUB = load("dubv", "build_voice_dub.py"); sys.argv = _a
    DUB.KOKORO = os.environ.get("KOKORO_Q8", "/tmp/dg/kq8")
    from kokoro_onnx import Kokoro; import soundfile as sf
    kd = os.environ.get("KOKORO_DIR", "/tmp/kok"); kok = Kokoro(os.path.join(kd, "kokoro.onnx"), os.path.join(kd, "voices.bin"))
    tmp = tempfile.mkdtemp()
    def save(): json.dump(man, open(MAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    def el(voice, text, lang, out):
        mp3 = R.req(key, "POST", f"/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
                    {"text": R.clean(text), "model_id": "eleven_v4", "language_code": lang, "voice_settings": R.SETTINGS}, raw=True)
        return R.save_mp3(mp3, out)
    n = 0
    for who, pt, en, es in L:
        lid = H(pt); d = man["d"].setdefault(lid, {})
        for t in (pt, en, es): man["k"][H(t)] = lid
        for lang, text in (("pt", pt), ("en", en)):
            if who == "hero":
                for c in CLASSES:
                    if d.get("byClass", {}).get(lang, {}).get(c) and not redo: continue
                    out = os.path.join(VOICE, lang, f"{lid}-{c}.mp3")
                    if lang == "pt": dur = el(CAST[c], text, "pt", out)
                    else:
                        v = "hero-" + c; emo = DUB.emotion_of({"voice": v, "text": text})
                        x, sr = DUB.phrased(lambda p, mm: DUB.synth_en_raw(p, v, emo, mm), text, v, emo)
                        x = DUB.fx(x, DUB.voice_cfg(v)["fx"], sr, emo, 0); DUB.save_mp3(x, sr, out); dur = Q.dur(out)
                    d.setdefault("byClass", {}).setdefault(lang, {})[c] = dur
                    if c == "WARRIOR": subprocess.run(["cp", out, os.path.join(VOICE, lang, lid + ".mp3")], check=True); d[lang] = dur
                    n += 1; print(f"[{n}] hero {c} {lang} {dur}s {text[:50]}", flush=True); save()
            else:
                if d.get(lang) and not redo: continue
                out = os.path.join(VOICE, lang, lid + ".mp3")
                if who == "rafael" and lang == "en":
                    s, sr = kok.create(text, voice="am_onyx", speed=0.92, lang="en-us"); raw = os.path.join(tmp, "en.wav"); sf.write(raw, s, sr)
                    Q.to_mp3(raw, out, 1.0); dur = Q.dur(out)
                else:
                    dur = el(EL[who], text, "pt" if lang == "pt" else "en", out)
                d[lang] = dur; d["vk"] = 1
                n += 1; print(f"[{n}] {who} {lang} {dur}s {text[:50]}", flush=True); save()
    save(); print("Pronto:", n, "gravações. Agora: python3 scripts/build_asset_versions.py")

if __name__ == "__main__":
    main()
