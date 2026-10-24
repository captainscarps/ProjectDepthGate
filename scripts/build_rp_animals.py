"""
Animais do Prólogo do Rio (pacote "Top-Down Wild Animals"): uma folha só com todas as poses.
Espécies: 1 ovelha, 2 coelho, 3 corvo, 4 pato, 5 pardal, 6 sapo, 7 peixe, 8 minhoca.
Cada pose tem 3 direções: D (de frente/para baixo), U (de costas/para cima), S (de lado, olhando para a esquerda).
Saída: assets/pixel-art/river-prologue/rp-animals.png (quadros 48x48) e rp-animals.json (quadros de cada pose).
Uso: python3 scripts/build_rp_animals.py <pasta com as pastas 1..8 do pacote>
"""
import glob
import json
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "assets", "pixel-art", "river-prologue")
NAMES = {1: "sheep", 2: "rabbit", 3: "crow", 4: "duck", 5: "sparrow", 6: "frog", 7: "fish", 8: "worm"}
F = 48
frames, meta = [], {}
for n, nm in NAMES.items():
    meta[nm] = {}
    for f in sorted(glob.glob(os.path.join(SRC, str(n), "*.png"))):
        pose = os.path.basename(f)[:-4]            # ex.: S_Walk, D_Idle, DS_Walk
        im = Image.open(f).convert("RGBA")
        k = im.width // F
        meta[nm][pose] = list(range(len(frames), len(frames) + k))
        frames += [im.crop((i * F, 0, (i + 1) * F, F)) for i in range(k)]
COLS = 16
rows = (len(frames) + COLS - 1) // COLS
sheet = Image.new("RGBA", (COLS * F, rows * F), (0, 0, 0, 0))
for i, f in enumerate(frames):
    sheet.paste(f, ((i % COLS) * F, (i // COLS) * F))
sheet.save(os.path.join(OUT, "rp-animals.png"), optimize=True)
json.dump(meta, open(os.path.join(OUT, "rp-animals.json"), "w"), separators=(",", ":"))
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "river-prologue")
if os.path.isdir(MIR):
    for f in ("rp-animals.png", "rp-animals.json"):
        shutil.copy2(os.path.join(OUT, f), os.path.join(MIR, f))
print("animais:", len(frames), "quadros;", {k: sorted(v) for k, v in meta.items()})
