#!/usr/bin/env python3
"""Farias e Maria da Taverna refeitos (p216.48) — PixelLab, com o rosto dos retratos das falas.
Fontes: scripts/art-src/npcs/<npc>-src.png (pose base) e <npc>-<anim>.png (tiras 192×192; quadro 0 = base).
Saída npc/farias.png e npc/maria.png em quadros de 192×192 (16 × 4), nas posições usadas por taverna.js:
  Farias: 0–6 parado · 16–25 polindo a caneca · 48–54 olhando e acenando com a cabeça
  Maria:  0–6 parada · 16–22 olhando em volta · 32–39 andando (8) · 48–57 servindo
A escala no jogo é SC × __TV_KF / __TV_KM (taverna.js), para ficarem do mesmo tamanho e mais nítidos."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/npcs")
F = 192

def frames(n):
    im = Image.open(os.path.join(SRC, n + ".png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

def biggest(im):
    """só o corpo (a IA deixou a caneca servida solta no chão)"""
    a = np.array(im); op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n < 2: return im
    sz = ndimage.sum(op, lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sz) if s >= sz.max() * .2]
    a[~np.isin(lab, keep)] = 0
    return Image.fromarray(a, "RGBA")

def build(name, rows, old_h):
    sh = Image.new("RGBA", (F * 16, F * 4))
    for start, seq in rows:
        for k, f in enumerate(seq):
            i = start + k; sh.paste(f, ((i % 16) * F, (i // 16) * F + 5), f)     # pé de 186 → 191 (preso pela base)
    sh.save(os.path.join(ROOT, f"assets/pixel-art/npc/{name}.png"), optimize=True)
    b = Image.open(os.path.join(SRC, f"{name}-src.png")).getbbox()
    print(name, sh.size, "altura", b[3] - b[1], "K", round(old_h / (b[3] - b[1]), 4))

build("farias", [(0, frames("farias-idle")[1:8]), (16, frames("farias-wipe")[1:11]), (48, frames("farias-idle2")[1:8])], 71)
build("maria", [(0, frames("maria-idle")[1:8]), (16, frames("maria-idle2")[1:8]), (32, frames("maria-walk")[1:9]),
                (48, [biggest(f) for f in frames("maria-serve")[1:11]])], 67)
