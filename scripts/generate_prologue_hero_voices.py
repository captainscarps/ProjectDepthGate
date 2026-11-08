"""Voz do herói no prólogo (Rio da Floresta) e na viagem de volta, com a voz de cada herói.

As falas do herói no prólogo (comentários, respostas à Guardiã) e os monólogos da volta tinham um áudio só para
todos os heróis, ou nenhum. Aqui cada herói ganha a sua versão (byClass no manifesto), como nas outras falas de herói:
  PT — Gemini TTS com a voz do herói (generate_hero_voice.VOICES), cada fala medida e levada ao tom médio daquele
       herói (o Gemini varia o tom de uma fala para outra); a que vier sussurrada ou longe demais do tom é refeita.
  EN — Kokoro, o mesmo modelo e a mesma mistura de vozes da dublagem em inglês da Guardiã (build_voice_dub.KVOICE
       "hero-<CLASSE>"), com o mesmo tratamento (frases, emoção, efeito).
As falas saem de scripts/source/arctic-prologue.js (o texto precisa ser idêntico ao do jogo).

Uso (a chave nunca é gravada em arquivo):
    GEMINI_API_KEY=... python3 scripts/generate_prologue_hero_voices.py [--only pt|en] [--force] [--model <modelo TTS>] [--sem-volta]
    KOKORO_Q8=<pasta> (padrão /tmp/dg/kq8): o modelo q8 e as vozes são baixados do npm na primeira vez.
Re-executável: só gera o que falta (--force refaz tudo).
"""
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


V = load("npcv", "generate_all_npc_voices_gemini.py")
HV = load("herov2", "generate_hero_voice.py")
Q = load("questv", "generate_quest_npc_voices.py")      # f0, to_mp3, dur
_argv, sys.argv = sys.argv, sys.argv[:1]
DUB = load("dubv", "build_voice_dub.py")                  # Kokoro + tratamento da dublagem em inglês
sys.argv = _argv
DUB.KOKORO = os.environ.get("KOKORO_Q8", "/tmp/dg/kq8")

CLASSES = list(HV.VOICES)
STR = r'"((?:[^"\\]|\\.)*)"'


def unq(t):
    return json.loads('"' + t + '"')


def lines():
    """(pt, en, classes) de cada fala do herói no prólogo e na volta"""
    src = open(os.path.join(ROOT, "scripts", "source", "arctic-prologue.js"), encoding="utf-8").read()

    def seg(a, b):
        i = src.index(a)
        return src[i:src.index(b, i)]
    out = []
    for part in (seg("function __arcHero(i)", "/* animais"), ):
        out += [(unq(p), unq(e), CLASSES) for p, e in re.findall(STR + r",\s*" + STR, part)]
    out += [(unq(p), unq(e), CLASSES) for p, e in re.findall(r'hsay\("\w+",__L3\(' + STR + "," + STR, src)]
    out += [(unq(p), unq(e), [c]) for c, p, e in re.findall(r"(\w+):\[" + STR + "," + STR, seg("const __RETH=", "/* o mapa visto"))]
    if "--sem-volta" not in sys.argv:   # monólogos da viagem de volta (fim do jogo): muitas falas, gastam cota
        out += [(unq(p), unq(e), CLASSES) for p, e in re.findall(STR + r",\s*" + STR, seg("const __RET=", "const __RETH="))]
    seen, res = set(), []
    for r in out:
        if r[0] not in seen:
            seen.add(r[0])
            res.append(r)
    return res


def class_hz(man):
    """tom mediano de cada herói nas falas PT já gravadas com a voz dele"""
    cache = os.path.join(tempfile.gettempdir(), "dg-hero-hz.json")
    if os.path.isfile(cache):
        return json.load(open(cache))
    import numpy as np
    res = {}
    for c in CLASSES:
        ids = [i for i, d in man["d"].items() if c in d.get("byClass", {}).get("pt", {})][:30]
        hz = [Q.f0(os.path.join(V.OUT_PT, f"{i}-{c}.mp3"))[0] for i in ids]
        res[c] = round(float(np.median([h for h in hz if h])))
        print(f"  tom de {c}: {res[c]} Hz", flush=True)
    json.dump(res, open(cache, "w"))
    return res


def gemini_pt(key, text, cls, target, tmp):
    raw = os.path.join(tmp, "pt.mp3")
    rate, mp3 = 1.0, None
    for take in range(4):
        say = text
        for tries in range(5):
            try:
                mp3, _ = V.generate_gemini(key, say, None, HV.VOICES[cls])
                break
            except RuntimeError as e:
                if "400" in str(e) and tries < 4:   # o modelo Pro às vezes tenta responder em texto: pede só a leitura
                    say = f'Leia em voz alta: "{text}"'
                    time.sleep(3)
                    continue
                if "429" not in str(e) or tries == 4:
                    raise
                print("  limite por minuto, esperando 65 s…", flush=True)
                time.sleep(65)
        open(raw, "wb").write(mp3)
        hz, voiced = Q.f0(raw)
        hi = 1.12 if cls in HV.FEMALE else 1.15
        ok = hz > 0 and voiced > 0.35 and 0.85 <= target / hz <= hi
        if say != text and Q.dur(raw) > len(text) / 10 + 1.0:   # leu a instrução junto: refaz
            ok = False
        print(f"    tirada {take + 1}: {hz:.0f} Hz (alvo {target}), {voiced:.0%} com voz{'' if ok else ' — refazendo'}", flush=True)
        if ok or take == 3:
            rate = min(1.15, max(0.8, target / hz)) if hz else 1.0
            break
    out = os.path.join(tmp, "pt-out.mp3")
    Q.to_mp3(raw, out, rate if abs(rate - 1) > 0.03 else 1.0)
    return out


def kokoro_en(text, cls, tmp):
    v = "hero-" + cls
    emo = DUB.emotion_of({"voice": v, "text": text})
    gen = lambda p, m: DUB.synth_en_raw(p, v, emo, m)
    x, sr = DUB.phrased(gen, text, v, emo)
    x = DUB.fx(x, DUB.voice_cfg(v)["fx"], sr, emo, 0)
    out = os.path.join(tmp, "en-out.mp3")
    DUB.save_mp3(x, sr, out)
    return out


def main():
    argv = sys.argv[1:]
    only = argv[argv.index("--only") + 1] if "--only" in argv else None
    force = "--force" in argv
    if "--model" in argv:
        V.MODELS_QUEUE = [argv[argv.index("--model") + 1]]
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if only != "en" and not key:
        raise SystemExit("defina GEMINI_API_KEY (ou use --only en)")
    man = json.load(open(V.MANIFEST_PATH, encoding="utf-8"))
    tmp = tempfile.mkdtemp()

    def save():
        txt = json.dumps(man, indent=2, ensure_ascii=False)
        for f in (V.MANIFEST_PATH, V.MIRROR_MANIFEST):
            open(f, "w", encoding="utf-8").write(txt)

    hz = class_hz(man) if only != "en" else {}
    ls = lines()
    # inglês primeiro (local, sem cota); depois o português, fala por fala, prólogo antes da volta
    for L in ("en", "pt"):
        if only and only != L:
            continue
        out_dir, mir = (V.OUT_PT, V.MIRROR_PT) if L == "pt" else (V.OUT_EN, V.MIRROR_EN)
        for n, (pt, en, classes) in enumerate(ls):
            lid = man["k"].get(V.fnv(pt)) or V.fnv(pt)
            man["k"][V.fnv(pt)] = lid
            man["k"].setdefault(V.fnv(en), lid)
            d = man["d"].setdefault(lid, {})
            bc = d.setdefault("byClass", {}).setdefault(L, {})
            for cls in classes:
                name = f"{lid}-{cls}.mp3"
                # PT já gravado com a voz do herói (Gemini) fica; EN é sempre do Kokoro, então o Gemini antigo é trocado
                kept = bc.get(cls) and os.path.isfile(os.path.join(out_dir, name))
                if kept and not force and (L == "pt" or d.get("_enk", {}).get(cls)):
                    continue
                try:
                    f = kokoro_en(en, cls, tmp) if L == "en" else gemini_pt(key, pt, cls, hz[cls], tmp)
                except RuntimeError as e:
                    print("  ERRO:", e, flush=True)
                    save()
                    raise SystemExit("parando (cota do Gemini?) — rode de novo depois para continuar")
                for dd in (out_dir, mir):
                    os.makedirs(dd, exist_ok=True)
                    shutil.copy(f, os.path.join(dd, name))
                bc[cls] = Q.dur(f)
                if L == "en":
                    d.setdefault("_enk", {})[cls] = 1
                # fala sem áudio comum (nova): o arquivo comum é a versão do primeiro herói
                if not d.get(L) or not os.path.isfile(os.path.join(out_dir, lid + ".mp3")) or (cls == classes[0] and d.get("_gen" + L)):
                    for dd in (out_dir, mir):
                        shutil.copy(f, os.path.join(dd, lid + ".mp3"))
                    d[L] = bc[cls]
                    d["_gen" + L] = 1
                print(f"[{n + 1}/{len(ls)}] {L}/{name} {bc[cls]}s  {pt[:45]}", flush=True)
                save()
    save()
    print("fim", flush=True)


if __name__ == "__main__":
    main()
