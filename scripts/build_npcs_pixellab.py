#!/usr/bin/env python3
"""Ferreiro Rafael e Alline refeitos (p216.45) — PixelLab, com o rosto dos retratos das falas.
Fontes: scripts/art-src/npcs/<npc>-src.png (pose base redesenhada) e <npc>-<anim>.png (tiras 192×192; quadro 0 = base).
Saída nas MESMAS posições de quadro das folhas antigas, em resolução ~2,5× maior (o jogo usa escala menor):
  npc/ferreiro.png  quadros 192×192, 16×4  (0–11 forjando, 48–58 conversando; linhas 1 e 2 repetem)
  npc/alline.png    quadros 120×180, 12×5  (0 parada, 12 agachada, 24 andando (8), 36 falando, 48 entregando)"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/npcs")
OUT = os.path.join(ROOT, "assets/pixel-art/npc")
F = 192

def frames(n):
    im = Image.open(os.path.join(SRC, n + ".png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

def biggest(im):
    """só o corpo (tira o gatinho que a IA desenhou no chão — os gatos do jogo são outros sprites)"""
    a = np.array(im); op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n < 2: return im
    sz = ndimage.sum(op, lab, range(1, n + 1))
    a[lab != int(np.argmax(sz)) + 1] = 0
    return Image.fromarray(a, "RGBA")

# ── ferreiro: pé de 186 → 191 (o quadro é preso pela base), corpo já no meio ──
fe = Image.new("RGBA", (F * 16, F * 4))
idle, talk = frames("ferreiro-idle")[1:13], frames("ferreiro-talk")[1:12]
for row, seq in ((0, idle), (1, talk), (2, idle), (3, talk)):
    for k, f in enumerate(seq): fe.paste(f, (k * F, row * F + 5), f)
fe.save(os.path.join(OUT, "ferreiro.png"), optimize=True)

# ── Alline: janela 120×180 com o pé na base e o corpo em 20,5/46 da largura (como na folha antiga) ──
W, H = 120, 180
x0 = round(96 - 20.5 / 46 * W); y0 = 186 - H
def cell(f): return f.crop((x0, y0, x0 + W, y0 + H))
ROWS = [frames("alline-idle")[1:8], [biggest(f) for f in frames("alline-idle2")[2:9]],
        frames("alline-walk")[5:13], frames("alline-talk")[1:9], frames("alline-special")[1:8]]
al = Image.new("RGBA", (W * 12, H * 5))
for r, seq in enumerate(ROWS):
    for k, f in enumerate(seq): al.alpha_composite(cell(f), (k * W, r * H))
al.save(os.path.join(OUT, "alline.png"), optimize=True)
print("ferreiro", fe.size, "alline", al.size)
