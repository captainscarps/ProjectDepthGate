"""
Atlas do bioma "Salões de Valdrak" do modo infinito (pisos, paredes, molduras e adereços de parede
do pack "RPG Buildings: CASTLE", Szadi art). O jogo monta o cenário de cada andar com essas peças
(scripts/source/endless-biomes.js, __excBake).
Saída: assets/pixel-art/endless/exc-atlas.png + exc-atlas.json (e o espelho em "Projeto atualizado").
Uso: CASTLE_PACK=/tmp/castle python3 scripts/build_endless_castle.py
"""
import json
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, "castle"))
from art import catalog, sheet  # noqa: E402

T = 32
FLOORSETS = {
    "grey": [(14, 37), (15, 37), (16, 37), (16, 38), (16, 39), (15, 36), (14, 36)],
    "maroon": [(5, 36), (6, 36), (5, 37), (6, 37), (5, 38), (6, 38), (5, 39), (6, 39)],
    "brown": [(12, 36), (13, 36), (12, 37), (13, 37), (12, 38), (13, 38), (12, 39), (13, 39)],
    "wood": [(14, 14), (15, 14), (14, 15), (15, 15)],
}
WALLP = ["win-tall", "win-tall2", "win-round", "arch-niche", "gem-arch", "shield", "shield-r", "kite", "kite-b",
         "swords", "swords2", "chain", "chain-l", "banner"]


def cell(cx, cy, w=1, h=1):
    return sheet("int").crop((cx * T, cy * T, (cx + w) * T, (cy + h) * T))


def main():
    pieces = []      # (nome, imagem)
    for k, cells in FLOORSETS.items():
        for i, (x, y) in enumerate(cells):
            pieces.append((f"f-{k}-{i}", cell(x, y)))
    pieces.append(("big", cell(14, 38, 2, 2)))
    for sx in range(5):
        pieces.append((f"brick-{sx}", cell(sx, 5, 1, 2)))
        pieces.append((f"top-{sx}", cell(sx, 4)))
    pieces += [("frL", cell(0, 2)), ("frR", cell(4, 2)), ("frT", cell(2, 0)), ("frB", cell(2, 4)),
               ("stairs", cell(12, 28, 2, 2))]
    P = catalog()
    for n in WALLP:
        pieces.append((f"w-{n}", P[n][0]))
    # empacota em prateleiras de 512 px
    W, x, y, rh, rects = 512, 0, 0, 0, {}
    for n, im in pieces:
        if x + im.width > W:
            x, y, rh = 0, y + rh + 1, 0
        rects[n] = [x, y, im.width, im.height]
        x += im.width + 1
        rh = max(rh, im.height)
    atlas = Image.new("RGBA", (W, y + rh), (0, 0, 0, 0))
    for n, im in pieces:
        atlas.paste(im, tuple(rects[n][:2]))
    meta = {"floor": {k: [rects[f"f-{k}-{i}"] for i in range(len(v))] for k, v in FLOORSETS.items()},
            "big": rects["big"], "brick": [rects[f"brick-{i}"] for i in range(5)], "top": [rects[f"top-{i}"] for i in range(5)],
            "frame": {k: rects["fr" + k] for k in "LRTB"}, "stairs": rects["stairs"],
            "wall": {n: rects[f"w-{n}"] for n in WALLP}}
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "endless")
        if not os.path.isdir(os.path.dirname(d)):
            continue
        os.makedirs(d, exist_ok=True)
        atlas.save(os.path.join(d, "exc-atlas.png"), optimize=True)
        json.dump(meta, open(os.path.join(d, "exc-atlas.json"), "w"), separators=(",", ":"))
    print("atlas", atlas.size, len(pieces), "peças")
    if len(sys.argv) > 1:
        atlas.resize((atlas.width * 2, atlas.height * 2), Image.NEAREST).save(sys.argv[1])


if __name__ == "__main__":
    main()
