#!/usr/bin/env python3
"""Barco do prólogo em 16 direções (p216.140): monta assets/pixel-art/barco/barco16-<classe>.png a partir de
scripts/art-src/barco/v16/<classe>-<dir>.png (gerar_barco16.py). 9 linhas (e, ese, se, sse, s, ene, ne, nne, n) × 13
quadros de 128×128 (0 = parado, 1–12 remada); o lado oeste é o espelho no jogo. Cada linha é centrada pelo casco do
quadro parado (meio do barco no x=64, y=78) para o barco não pular ao trocar de direção.
Uso: python3 scripts/build_barco16.py [classe…]"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_barco import clean
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/barco/v16"); OUT = os.path.join(ROOT, "assets/pixel-art/barco"); F, N = 128, 13
DIRS = ["e", "ese", "se", "sse", "s", "ene", "ne", "nne", "n"]
def hull(im):
    a = np.array(im).astype(int); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    m = (al > 100) & (r > g + 15) & (g > b) & (r > 70)          # madeira (casco + remos)
    lab = m.copy()
    ys, xs = np.nonzero(lab)
    # o casco é a parte larga: pega a mediana para os remos compridos pesarem pouco
    return float(np.median(xs)), float(np.median(ys))
for c in (sys.argv[1:] or ["warrior"]):
    if not all(os.path.exists(os.path.join(SRC, f"{c}-{d}.png")) for d in DIRS): print("faltam direções:", c); continue
    sheet = Image.new("RGBA", (F * N, F * len(DIRS)))
    for r, d in enumerate(DIRS):
        st = Image.open(os.path.join(SRC, f"{c}-{d}.png")).convert("RGBA")
        f0 = clean(st.crop((0, 0, F, F))); cx, cy = hull(f0); dx, dy = round(64 - cx), round(78 - cy)
        for k in range(min(N, st.width // F)):
            fr = clean(st.crop((k * F, 0, k * F + F, F)))
            sheet.alpha_composite(fr, (k * F + max(0, dx), r * F + max(0, dy)), (max(0, -dx), max(0, -dy)))
    sheet.save(os.path.join(OUT, f"barco16-{c}.png"), optimize=True); print("barco16", c)
