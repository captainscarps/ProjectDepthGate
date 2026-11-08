"""Auditoria da dublagem em português: quem fala cada áudio, com que motor foi gravado e em que tom.

Para cada fala do manifesto (assets/audio/voice/voice-manifest.json) descobre o personagem (diálogos do bundle,
falas extras, NPCs, heróis, prólogo, missões novas), identifica o motor pela codificação do arquivo
(Gemini = 128 kbps sem marca do ffmpeg; Kokoro antigo = 48 kbps; NPCs das missões novas = 96 kbps) e mede o tom
(pYIN). Aponta: falas PT ainda no modelo antigo, personagem com mais de um motor, tom fora da faixa do personagem,
fala de herói sem versão própria de cada herói.

Uso: NODE_PATH=<pasta com acorn e acorn-walk> python3 scripts/audit_pt_voices.py [saida.json]
"""
import collections
import concurrent.futures as cf
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import warnings

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, "assets", "audio", "voice")


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


V = load("npcv", "generate_all_npc_voices_gemini.py")
fnv = V.fnv
man = json.load(open(os.path.join(VOICE, "voice-manifest.json"), encoding="utf-8"))


def idof(t):
    return man["k"].get(fnv(t))


who, text = {}, {}


def put(t, w, force=False):
    i = idof(t)
    if i and (force or i not in who):
        who[i], text[i] = w, t


# 1) diálogos da história no bundle (com quem fala)
with tempfile.TemporaryDirectory() as td:
    lj = os.path.join(td, "l.json")
    subprocess.run(["node", os.path.join(ROOT, "scripts", "extract_story_lines.cjs"),
                    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"), lj], check=True, capture_output=True)
    for ln in json.load(open(lj)):
        v = ln["voice"]
        put(ln["text"], "guardia" if v.startswith("cine-") else "hero" if v.startswith("hero") else v)
for ln in json.load(open(os.path.join(ROOT, "scripts", "voice_extra_lines.json"), encoding="utf-8")):
    put(ln["text"], "hero" if ln["voice"].startswith("hero") else ln["voice"])
# 2) NPCs (Gemini)
for spec in V.NPC_VOICE_SPECS:
    for _, pt, _en in spec["lines"]:
        put(pt, "npc:" + spec["npc"], True)
# 3) heróis
H = load("herov", "generate_all_hero_voices_gemini.py")
for r in H.HERO_LINES:
    put(r[1], "hero", True)
P = load("prolv", "generate_prologue_hero_voices.py")
for pt, _en, _c in P.lines():
    put(pt, "hero", True)
Qn = load("questv", "generate_quest_npc_voices.py")
for name, spec in Qn.NPCS.items():
    Qn.NPC = spec
    for pt, _en in Qn.lines():
        put(pt, "npc:" + name, True)
# 4) o resto: qualquer texto entre aspas das fontes que bata com o manifesto (falante desconhecido)
src = "\n".join(open(os.path.join(ROOT, "scripts", "source", f), encoding="utf-8").read()
                for f in os.listdir(os.path.join(ROOT, "scripts", "source")) if f.endswith(".js"))
src += open(os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"), encoding="utf-8").read()
for m in re.finditer(r'"((?:[^"\\]|\\.){6,400})"', src):
    try:
        t = json.loads('"' + m.group(1) + '"')
    except Exception:
        continue
    i = idof(t)
    if i and i not in text:
        text[i] = t
    # quem fala: who:"x" logo antes do texto
    if i and i not in who:
        w = re.search(r'who:"([\w-]+)"[^{}]{0,60}$', src[max(0, m.start() - 80):m.start()])
        if w:
            who[i] = "hero" if w.group(1).startswith("hero") else w.group(1)


def probe(f):
    r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=bit_rate,duration:format_tags=encoder", "-of", "json", f],
                       capture_output=True, text=True)
    j = json.loads(r.stdout or "{}").get("format", {})
    br = int(j.get("bit_rate", 0)) // 1000
    enc = j.get("tags", {}).get("encoder", "")
    eng = "kokoro" if br < 64 else "gemini-96k" if br < 112 else "gemini"
    return eng, enc, float(j.get("duration", 0))


def f0(f):
    import librosa
    import numpy as np
    warnings.filterwarnings("ignore")
    y, sr = librosa.load(f, sr=16000)
    fr, v, _ = librosa.pyin(y, fmin=65, fmax=420, sr=sr)
    g = fr[v]
    return (float(np.median(g)) if len(g) else 0.0), len(g) / max(1, len(fr))


def job(i):
    f = os.path.join(VOICE, "pt", i + ".mp3")
    if not os.path.isfile(f):
        return i, None
    eng, enc, d = probe(f)
    hz, vo = f0(f)
    return i, dict(eng=eng, enc=enc, dur=round(d, 2), hz=round(hz), voiced=round(vo, 2))


ids = [i for i, d in man["d"].items() if d.get("pt")]
res = {}
with cf.ProcessPoolExecutor(max_workers=4) as ex:
    for i, r in ex.map(job, ids):
        res[i] = r
rows = []
for i in ids:
    r = res[i]
    d = man["d"][i]
    bc = sorted(d.get("byClass", {}).get("pt", {}))
    rows.append(dict(id=i, who=who.get(i, "?"), text=text.get(i, ""), byClass=bc, **(r or {"eng": "SEM ARQUIVO"})))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), "pt-voice-audit.json")
json.dump(rows, open(out, "w"), ensure_ascii=False, indent=1)

by = collections.defaultdict(list)
for r in rows:
    by[r["who"]].append(r)
print(f"{len(rows)} falas PT\n")
print("personagem              falas  motores                         tom mediano (Hz)")
import statistics
for w, rs in sorted(by.items(), key=lambda kv: -len(kv[1])):
    engs = collections.Counter(r["eng"] for r in rs)
    hz = [r["hz"] for r in rs if r.get("hz")]
    print(f"{w:22s} {len(rs):5d}  {dict(engs)!s:32s} {statistics.median(hz) if hz else 0:.0f}")
print("\nfalas PT no modelo antigo (Kokoro):")
for r in rows:
    if r["eng"] == "kokoro":
        print(f"  {r['id']} {r['who']:14s} {r['text'][:70]}")
print("\nfalas de herói sem versão própria de cada herói:")
for r in rows:
    if r["who"] == "hero" and len(r["byClass"]) < 1:
        print(f"  {r['id']} {r['eng']:8s} {r['text'][:70]}")
print(f"\ndetalhes: {out}")
