"""Confere as vozes por herói (assets/audio/voice/<idioma>/<id>-<CLASSE>.mp3).

Para cada arquivo: tom médio (frequência fundamental) dentro da faixa do herói e duração plausível
para o tamanho do texto (duração muito acima do esperado costuma ser instrução lida em voz alta).
Uso: python3 scripts/check_hero_voices.py   (precisa de ffmpeg e numpy)
"""
import importlib.util
import json
import os
import subprocess
import sys

import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("hv", os.path.join(ROOT, "scripts", "generate_hero_voice.py"))
G = importlib.util.module_from_spec(spec)
spec.loader.exec_module(G)

MALE, FEMALE = (85, 175), (165, 300)
man = json.load(open(G.V.MANIFEST_PATH, encoding="utf-8"))
texts = {}
for pt, en in [(r[1], r[2]) for r in G.H.HERO_LINES] + G.EXTRA:
    lid = man["k"].get(G.V.fnv(pt))
    if lid:
        texts[lid] = {"pt": pt, "en": en}


def f0(path):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(float)
    fr = []
    for i in range(0, len(x) - 1024, 512):
        w = x[i:i + 1024]
        if np.abs(w).mean() < 500:
            continue
        w = w - w.mean()
        ac = np.correlate(w, w, "full")[1023:]
        lo, hi = 16000 // 400, 16000 // 60
        p = lo + int(np.argmax(ac[lo:hi]))
        if ac[p] > 0.3 * ac[0]:
            fr.append(16000 / p)
    return float(np.median(fr)) if fr else 0.0


per, bad = {}, []
for lid, v in man["d"].items():
    for L, bc in v.get("byClass", {}).items():
        for cls, dur in bc.items():
            path = os.path.join(ROOT, "assets", "audio", "voice", L, f"{lid}-{cls}.mp3")
            if not os.path.isfile(path):
                bad.append(f"FALTA {L}/{lid}-{cls}.mp3")
                continue
            hz = f0(path)
            per.setdefault(cls, []).append(hz)
            lo, hi = FEMALE if cls in G.FEMALE else MALE
            t = texts.get(lid, {}).get(L, "")
            exp = max(1.5, len(t) / 13.0) if t else None   # ~13 caracteres por segundo
            if hz and not (lo <= hz <= hi):
                bad.append(f"TOM {L}/{lid}-{cls} {hz:.0f} Hz fora de {lo}-{hi}  {t[:40]}")
            if exp and dur > exp * 2.2 + 1.5:
                bad.append(f"LONGO {L}/{lid}-{cls} {dur}s (esperado ~{exp:.1f}s)  {t[:40]}")

for cls in G.VOICES:
    a = per.get(cls, [])
    print(f"{cls:12s} {G.VOICES[cls]:10s} {len(a):3d} arquivos  tom mediano {np.median(a) if a else 0:5.0f} Hz")
print(f"\n{len(bad)} problemas")
for b in bad:
    print(" ", b)
