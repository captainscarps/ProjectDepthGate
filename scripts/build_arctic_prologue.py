"""
Prólogo no mar gelado: prepara as imagens do pacote craftpix "Top View Arctic Viking" (pasta PNG/) para o jogo.
Uso: python3 scripts/build_arctic_prologue.py <pasta-do-pacote>
Gera assets/pixel-art/arctic/:
  arc-<nome>.png  peças do pacote reduzidas para 2x o tamanho no jogo (o jogo mostra em .5)
  arc-water.png   água em ladrilho contínuo (mesmo tom do pacote, ondinhas e reflexos)
  arc-snow.png    neve em ladrilho contínuo para a margem
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
ITEMS = {
    "boat-red": ("12.png", .36), "boat-blue": ("13.png", .36), "boat-gold": ("14.png", .36), "boat-teal": ("15.png", .36),
    "foam": ("01.png", .4), "shallow": ("02.png", .5), "deep": ("03.png", .5),
    "pillar-break": ("04.png", .5), "post-rust": ("05.png", .5), "post-rope": ("06.png", .5),
    "ring": ("07.png", .4), "chevron": ("08.png", .36), "frame": ("09.png", .4),
    "ice-stack": ("10.png", .42), "pillar-lean": ("11.png", .5), "iceberg": ("16.png", .5),
    "shards-a": ("17.png", .42), "shards-b": ("18.png", .42), "iceberg-big": ("19.png", .5),
    "well": ("20.png", .45), "well-gold": ("21.png", .45), "floe-a": ("22.png", .5), "floe-b": ("23.png", .5),
    "ice-block": ("24.png", .5), "snow-tile": ("25.png", .5), "ice-tile": ("26.png", .5),
    "bridge": ("27.png", .5), "bridge-broken": ("28.png", .5), "pillar-wrap": ("29.png", .5),
    "post-a": ("30.png", .5), "post-b": ("31.png", .5), "post-c": ("32.png", .5), "post-d": ("33.png", .5),
    "ice-flat": ("34.png", .5), "pillar-pair": ("35.png", .5),
}
for k, (f, sc) in ITEMS.items():
    im = Image.open(os.path.join(PK, f)).convert("RGBA")
    im = im.resize((max(2, round(im.width * sc)), max(2, round(im.height * sc))), Image.LANCZOS)
    im.save(os.path.join(OUT, f"arc-{k}.png"), optimize=True)

# água: ladrilho 256 contínuo, tom do pacote
N = 256
yy, xx = np.mgrid[0:N, 0:N] / N * 2 * np.pi
base = np.array([62, 178, 214], float)
v = (np.sin(xx * 3 + np.sin(yy * 2) * 1.2) + np.sin(yy * 4 + np.cos(xx * 2) * 1.3)) * .5
img = np.ones((N, N, 3)) * base + v[..., None] * np.array([6, 8, 8])
im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
d = ImageDraw.Draw(im)
for _ in range(26):                                    # ondinhas claras (desenhadas também do outro lado do ladrilho)
    x, y = rng.integers(0, N, 2)
    w = int(rng.integers(14, 34))
    for ox in (-N, 0, N):
        for oy in (-N, 0, N):
            d.arc((x + ox, y + oy, x + ox + w, y + oy + 8), 200, 340, fill=(160, 228, 244, 150), width=2)
for _ in range(60):                                    # células escuras finas como no fundo do pacote
    x, y = rng.integers(0, N, 2)
    r = int(rng.integers(10, 26))
    for ox in (-N, 0, N):
        for oy in (-N, 0, N):
            d.polygon([(x + ox + r * np.cos(a), y + oy + r * np.sin(a) * .8) for a in np.linspace(0, 2 * np.pi, 7)[:-1]], outline=(48, 150, 190, 60))
im.save(os.path.join(OUT, "arc-water.png"), optimize=True)

# neve: ladrilho 256 com leve relevo
n = rng.random((N // 8, N // 8))
n = np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC)) / 255.
n = (n + np.roll(n, N // 2, 0) + np.roll(n, N // 2, 1)) / 3
s = np.ones((N, N, 3)) * np.array([236, 244, 251], float) + (n[..., None] - .5) * np.array([26, 20, 12])
sp = rng.random((N, N)) > .996
s[sp] = (255, 255, 255)
Image.fromarray(np.clip(s, 0, 255).astype(np.uint8), "RGB").filter(ImageFilter.SMOOTH).save(os.path.join(OUT, "arc-snow.png"), optimize=True)

MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art")
if os.path.isdir(MIR):
    shutil.rmtree(os.path.join(MIR, "arctic"), ignore_errors=True)
    shutil.copytree(OUT, os.path.join(MIR, "arctic"))
print("prólogo do mar gelado:", len(ITEMS), "peças")
