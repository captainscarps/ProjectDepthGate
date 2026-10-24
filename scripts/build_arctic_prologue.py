"""
Barco do prólogo: prepara as imagens do pacote craftpix "Top View Arctic Viking" (pasta PNG/) para o jogo.
Uso: python3 scripts/build_arctic_prologue.py <pasta-do-pacote>
Gera assets/pixel-art/arctic/arc-boat-*.png — só os barcos (o cenário do prólogo é a floresta,
scripts/build_river_prologue.py), reduzidos para 2x o tamanho no jogo (o jogo mostra em .5).
"""
import os
import shutil
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PK = os.path.join(sys.argv[1], "PNG")
OUT = os.path.join(ROOT, "assets", "pixel-art", "arctic")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

# nome: (arquivo, escala) — escala sobre o original; o resultado é 2x o tamanho no jogo
ITEMS = {"boat-red": ("12.png", .36), "boat-blue": ("13.png", .36), "boat-gold": ("14.png", .36), "boat-teal": ("15.png", .36)}
for k, (f, sc) in ITEMS.items():
    im = Image.open(os.path.join(PK, f)).convert("RGBA")
    im = im.resize((max(2, round(im.width * sc)), max(2, round(im.height * sc))), Image.LANCZOS)
    im.save(os.path.join(OUT, f"arc-{k}.png"), optimize=True)

MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art")
if os.path.isdir(MIR):
    shutil.rmtree(os.path.join(MIR, "arctic"), ignore_errors=True)
    shutil.copytree(OUT, os.path.join(MIR, "arctic"))
print("barcos do prólogo:", len(ITEMS))
