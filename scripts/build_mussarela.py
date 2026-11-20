#!/usr/bin/env python3
"""Mussarela, a cachorra da Olivia (p216.75) — PixelLab (generate-image-v2 → generate-8-rotations-v2 → animate-pixminimax).
Fontes: scripts/art-src/mussarela/an_<walk|idle>_<d|r|u>.png (8 quadros de 64×64; a esquerda é o espelho da direita).
Saída: assets/pixel-art/npc/mussarela.png — quadros 64×64, 8 colunas; linhas 0–3 andando (baixo, esquerda, direita,
cima), 4–7 parada nas mesmas direções (scripts/source/olivia.js)."""
import os
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/mussarela"); F = 64
out = Image.new("RGBA", (F * 8, F * 8))
for r, (kind, d) in enumerate([(k, d) for k in ("walk", "idle") for d in ("d", "l", "r", "u")]):
    strip = Image.open(os.path.join(S, f"an_{kind}_{'r' if d == 'l' else d}.png")).convert("RGBA")
    for c in range(8):
        fr = strip.crop((c * F, 0, c * F + F, F))
        out.paste(ImageOps.mirror(fr) if d == "l" else fr, (c * F, r * F))
out.save(os.path.join(ROOT, "assets/pixel-art/npc/mussarela.png")); print("mussarela", out.size)
