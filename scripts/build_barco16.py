#!/usr/bin/env python3
"""Barco do prólogo em 16 direções (p216.140): monta assets/pixel-art/barco/barco16-<classe>.png a partir de
scripts/art-src/barco/v16/<classe>-<dir>.png (gerar_barco16.py). 9 linhas (e, ese, se, sse, s, ene, ne, nne, n) × 13
quadros de 128×128 (0 = parado, 1–12 remada); o lado oeste é o espelho no jogo. Cada linha é centrada pelo casco do
quadro parado (meio do barco no x=64, y=78, sem sair do quadro) para o barco não pular ao trocar de direção.
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
def wood(im):
    a = np.array(im).astype(int); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    return (al > 100) & (r > g + 15) & (g > b) & (r > 70)
def shift(m, x, y):
    o = np.zeros_like(m); H, W = m.shape
    o[max(0, y):H + min(0, y), max(0, x):W + min(0, x)] = m[max(0, -y):H - max(0, y), max(0, -x):W - max(0, x)]; return o
def best_shift(m, m0, R=14):
    best = (-1, 0, 0)
    for y in range(-R, R + 1, 1):
        for x in range(-R, R + 1, 1):
            v = (shift(m, x, y) & m0).sum()
            if v > best[0]: best = (v, x, y)
    return best[1], best[2]
for c in (sys.argv[1:] or ["warrior"]):
    if not all(os.path.exists(os.path.join(SRC, f"{c}-{d}.png")) for d in DIRS): print("faltam direções:", c); continue
    sheet = Image.new("RGBA", (F * N, F * len(DIRS)))
    for r, d in enumerate(DIRS):
        st = Image.open(os.path.join(SRC, f"{c}-{d}.png")).convert("RGBA")
        f0 = clean(st.crop((0, 0, F, F))); cx, cy = hull(f0)
        ys = np.nonzero(np.array(f0)[..., 3] > 0)[0]; top, bot = ys.min(), ys.max()
        dx = round(64 - cx); dy = round(78 - cy)
        dy = max(dy, -top + 1); dy = min(dy, F - 2 - bot)          # o barco inteiro dentro do quadro (o de frente é alto)
        m0 = wood(f0)
        for k in range(min(N, st.width // F)):
            fr = clean(st.crop((k * F, 0, k * F + F, F))); cell = Image.new("RGBA", (F, F))
            # p216.141: a IA move o barco alguns pixels entre os quadros da remada (ele "pulava"): cada quadro é encaixado
            # no casco do quadro parado (melhor sobreposição da madeira, ±14 px) antes de ir para a folha
            sx, sy = (0, 0) if k == 0 else best_shift(wood(fr), m0)
            ox, oy = dx + sx, dy + sy
            cell.alpha_composite(fr, (max(0, ox), max(0, oy)), (max(0, -ox), max(0, -oy)))     # recortado no próprio quadro
            sheet.alpha_composite(cell, (k * F, r * F))
    sheet.save(os.path.join(OUT, f"barco16-{c}.png"), optimize=True); print("barco16", c)
