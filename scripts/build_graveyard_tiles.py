"""
Atlas do Cemitério dos Esquecidos (pack "Graveyard" da CraftPix, fora do repositório pela licença).
Junta os ladrilhos 32x32 usados pelo cenário (grama, platô, penhasco de terra, calçamento) e as
animações (lanternas e forca com esqueleto) num atlas: assets/pixel-art/endless/gyt-atlas.png + .json
O cenário é montado no jogo por scripts/source/graveyard.js.
Uso: GY_PACK="/pasta/Cemitério" python3 scripts/build_graveyard_tiles.py
"""
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.environ.get("GY_PACK", "/tmp/gy")
T = 32
TILES = {
    "grass": [61, 61, 61, 61, 61, 61], "patch": [62], "dark": [63], "stone": [6, 7, 14, 15, 29, 30, 31, 37, 38, 39],
    "edgeTop": [1, 2, 3, 4], "edgeTop2": [9, 10, 11, 12], "sideL": [25, 17], "sideR": [28, 20],
    "cliff1": [33, 34, 35, 36], "cliff2": [41, 42, 43, 44, 49, 50, 51, 52], "cliff3": [57, 58, 59, 60],
}
ANIM = {"lantern1": ("Lantern1.png", 4), "lantern2": ("Lantern2.png", 4), "lantern3": ("Lantern3.png", 4), "gallows": ("Skeleton.png", 6)}


def main():
    ids = sorted({i for v in TILES.values() for i in v})
    tw = 16
    sheet = Image.new("RGBA", (tw * T, (len(ids) + tw - 1) // tw * T + 48 * 4), (0, 0, 0, 0))
    pos = {}
    for k, i in enumerate(ids):
        im = Image.open(os.path.join(PACK, "1 Tiles", f"GraveyardTile_{i:02d}.png")).convert("RGBA")
        x, y = (k % tw) * T, (k // tw) * T
        sheet.paste(im, (x, y))
        pos[i] = [x, y]
    y0 = (len(ids) + tw - 1) // tw * T
    anims = {}
    for row, (name, (fn, n)) in enumerate(ANIM.items()):
        im = Image.open(os.path.join(PACK, "3 Animated Objects", fn)).convert("RGBA")
        sheet.paste(im, (0, y0 + row * 48))
        anims[name] = {"x": 0, "y": y0 + row * 48, "w": 32, "h": 48, "n": n}
    meta = {"t": {k: [pos[i] for i in v] for k, v in TILES.items()}, "anim": anims}
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "endless")
        if os.path.isdir(os.path.dirname(d)):
            os.makedirs(d, exist_ok=True)
            sheet.save(os.path.join(d, "gyt-atlas.png"), optimize=True)
            json.dump(meta, open(os.path.join(d, "gyt-atlas.json"), "w"), separators=(",", ":"))
    print("atlas", sheet.size, len(ids), "ladrilhos")


if __name__ == "__main__":
    main()
