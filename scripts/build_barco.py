#!/usr/bin/env python3
"""Barco do prólogo com o herói remando (p216.70) — PixelLab.
Fontes: scripts/art-src/barco/<classe>-rema-<dir>.png (quadros 168×168; o quadro 0 é a pose parada, 1…8 a remada),
dir ∈ e (perfil), se, s (de frente), ne, n (de costas); o lado oeste é o espelho do leste no jogo.
Saída: assets/pixel-art/barco/barco-<classe>.png — 5 linhas (e, se, s, ne, n) × 9 quadros (0 = parado, 1–8 remada)
e barco-vazio.png (o barco sozinho, de perfil, para quando o herói desembarca).
Uso: python3 scripts/build_barco.py [classe…]"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/barco")
OUT = os.path.join(ROOT, "assets/pixel-art/barco")
F = 168
DIRS = ["e", "se", "s", "ne", "n"]
CLS = ["warrior", "archer", "mage", "necromancer", "druid", "shaman", "rogue", "berserker", "hunter"]


def clean(im):
    """alfa em degrau (pixel limpo) e sem os pontinhos soltos da água que a IA desenha longe do barco"""
    a = np.array(im.convert("RGBA")); a[..., 3] = np.where(a[..., 3] > 90, 255, 0)
    from scipy import ndimage
    op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndimage.sum(op, lab, range(1, n + 1))
        a[np.isin(lab, [i + 1 for i, s in enumerate(sz) if s < 12])] = 0
    return Image.fromarray(a, "RGBA")


def main(only):
    os.makedirs(OUT, exist_ok=True)
    for c in CLS:
        if only and c not in only:
            continue
        if not all(os.path.exists(os.path.join(SRC, f"{c}-rema-{d}.png")) for d in DIRS):
            continue
        sheet = Image.new("RGBA", (F * 9, F * len(DIRS)))
        for r, d in enumerate(DIRS):
            st = Image.open(os.path.join(SRC, f"{c}-rema-{d}.png")).convert("RGBA")
            for k in range(9):
                sheet.alpha_composite(clean(st.crop((k * F, 0, k * F + F, F))), (k * F, r * F))
        sheet.save(os.path.join(OUT, f"barco-{c}.png"), optimize=True)
        print("barco", c)
    v = os.path.join(SRC, "vazio.png")
    if os.path.exists(v):
        clean(Image.open(v)).save(os.path.join(OUT, "barco-vazio.png"), optimize=True)


if __name__ == "__main__":
    main(sys.argv[1:])
