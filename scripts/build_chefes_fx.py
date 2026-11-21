#!/usr/bin/env python3
"""Efeitos dos golpes dos chefes (p216.78) — PixelLab (generate-image-v2 → animate-pixminimax).
Fontes scripts/art-src/chefes/fx/<efeito>.png (tira de quadros quadrados); saída assets/pixel-art/fx/boss/<efeito>.png.
A runa de aviso fica em tons de cinza para o jogo pintar com a cor do aviso; alfa em degrau (pixel limpo)."""
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/chefes/fx"); O = os.path.join(ROOT, "assets/pixel-art/fx/boss")
os.makedirs(O, exist_ok=True)
for f in sorted(os.listdir(S)):
    a = np.array(Image.open(os.path.join(S, f)).convert("RGBA")).astype(np.float32)
    a[..., 3] = np.where(a[..., 3] > 70, 255, 0)
    if f.startswith("warn"):
        lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
        lum = np.clip(lum * 1.6 + 40, 0, 255)
        a[..., 0] = a[..., 1] = a[..., 2] = lum
    Image.fromarray(a.astype(np.uint8), "RGBA").save(os.path.join(O, f)); print(f)
