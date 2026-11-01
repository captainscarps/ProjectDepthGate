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
    maus = mausoleum()
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "endless")
        if os.path.isdir(d):
            maus.save(os.path.join(d, "gyt-maus.png"), optimize=True)
    print("atlas", sheet.size, len(ids), "ladrilhos; mausoléu", maus.size)


def mausoleum():
    """Mausoléu montado pelo autor do pack em GraveyardTileset.png (metade direita, sem a grama de baixo),
    com porta de ferro em arco, degrau e musgo na base."""
    from PIL import ImageDraw
    t = Image.open(os.path.join(PACK, "1 Tiles", "GraveyardTileset.png")).convert("RGBA")
    m = t.crop((128, 0, 256, 224))
    d = ImageDraw.Draw(m)
    cx, w, top, bot = 48, 30, 168, 222
    frame, dark, iron = (104, 98, 92, 255), (22, 20, 26, 255), (92, 96, 104, 255)
    # moldura de pedra e vão escuro em arco
    d.rectangle((cx - w // 2 - 4, top - 2, cx + w // 2 + 3, bot), fill=frame)
    d.ellipse((cx - w // 2 - 4, top - 14, cx + w // 2 + 3, top + 12), fill=frame)
    d.rectangle((cx - w // 2, top, cx + w // 2 - 1, bot), fill=dark)
    d.ellipse((cx - w // 2, top - 10, cx + w // 2 - 1, top + 10), fill=dark)
    for x in range(cx - w // 2 + 3, cx + w // 2 - 1, 5):
        d.line((x, top - 6 if abs(x - cx) < 9 else top - 2, x, bot), fill=iron)
    d.line((cx - w // 2, top + 18, cx + w // 2 - 1, top + 18), fill=iron)
    d.line((cx - w // 2, top + 36, cx + w // 2 - 1, top + 36), fill=iron)
    d.rectangle((cx - 2, top + 24, cx + 1, top + 28), fill=(150, 130, 70, 255))
    # degrau
    d.rectangle((cx - w // 2 - 8, bot - 2, cx + w // 2 + 7, bot + 1), fill=(150, 142, 132, 255))
    # musgo na base
    import random
    rnd = random.Random(7)
    for x in range(0, 128):
        h = rnd.choice([0, 0, 1, 2, 3, 4])
        for y in range(224 - h, 224):
            if m.getpixel((x, y))[3] > 0 and not (cx - w // 2 - 8 <= x <= cx + w // 2 + 7):
                m.putpixel((x, y), (92, 128, 84, 255) if rnd.random() < .7 else (70, 104, 66, 255))
    return m


if __name__ == "__main__":
    main()
