#!/usr/bin/env python3
"""Inimigos do cemitério (gw-*) com movimento (p216.79) — PixelLab animate-pixminimax a partir do quadro de perfil
(quadro 6 da folha antiga de 8 direções), feito em 128 px e reduzido para 64. Fontes scripts/art-src/inimigos-gw/
<inimigo>-{walk,idle,attack}.png (9 quadros; o 0 é a pose base). O perfil desenhado olha para a ESQUERDA: aqui é
espelhado para olhar à direita (o jogo espelha quando o inimigo anda para a esquerda).
Saída assets/pixel-art/enemies/v2/<inimigo>.png: linha 0 andando (8), 1 parado (8), 2 golpe (4 preparo + 4 ataque); no golpe, índice negativo = quadro que a IA já desenhou virado (não espelha)."""
import os
import numpy as np
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/inimigos-gw"); O = os.path.join(ROOT, "assets/pixel-art/enemies/v2")
ATK = {"gw-zombie": [1, 1, 2, 2, 3, 3, 3, 2], "gw-skeleton-gravedigger": [1, 2, 2, 2, -3, -4, -5, 6], "gw-sheet-ghost": [1, 2, 3, 3, 4, -5, -5, 4],
       "gw-pumpkin-scarecrow": [1, 2, 3, 4, 4, 5, 4, 3], "gw-mummy": [1, 2, 3, 3, 4, 5, 6, 7], "gw-witch": [1, 2, 3, 3, 4, 5, 6, 7],
       "gw-werewolf": [1, 2, 3, 4, 5, 6, 7, 7], "gw-stitched-brute": [1, 2, 3, 3, 4, 4, 4, 3], "gw-vampire": [1, 2, 3, 4, 5, 6, 7, 8]}
os.makedirs(O, exist_ok=True)
def fr(k, a):
    im = Image.open(os.path.join(S, f"{k}-{a}.png")).convert("RGBA"); w = im.height
    return [im.crop((i * w, 0, i * w + w, w)) for i in range(im.width // w)]
for k, atk in ATK.items():
    A = fr(k, "attack"); rows = [[(f, 1) for f in fr(k, "walk")[1:9]], [(f, 1) for f in fr(k, "idle")[1:9]], [(A[abs(i)], i > 0) for i in atk]]   # índice negativo: a IA já virou o quadro, não espelhar
    sheet = Image.new("RGBA", (64 * 8, 64 * 3))
    for r, L in enumerate(rows):
        for c, (f, mir) in enumerate(L[:8]):
            g = f.resize((64, 64), Image.LANCZOS); g = ImageOps.mirror(g) if mir else g; a = np.array(g); a[..., 3] = np.where(a[..., 3] > 100, 255, 0)
            sheet.alpha_composite(Image.fromarray(a), (c * 64, r * 64))
    sheet.save(os.path.join(O, f"{k}.png")); print(k)
