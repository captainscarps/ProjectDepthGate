"""
Catálogo de peças do Castelo de Valdrak (pack "RPG Buildings: CASTLE", Szadi art) e dos adereços antigos
do castelo (cx-*), estes reajustados à paleta do pack para não destoarem.
Cada adereço vira assets/pixel-art/castle2/cf-p-<nome>.png e é posto no jogo com profundidade e colisão.
"""
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PACK = os.environ.get("CASTLE_PACK", "/tmp/castle")
CX = os.path.join(ROOT, "assets", "pixel-art", "castle")

SHEETS = {}


def sheet(n):
    if n not in SHEETS:
        SHEETS[n] = Image.open(os.path.join(PACK, {"int": "castle_interriors.png", "ext": "castle_outside.png",
                                                    "deco": "castle_decoratives.png"}[n])).convert("RGBA")
    return SHEETS[n]


def crop(n, box):
    im = sheet(n).crop(box)
    bb = im.getbbox()
    return im.crop(bb) if bb else im


def grade(im, sat=.62, val=.86, warm=(6, 2, -6)):
    """aproxima um sprite de outro pacote da paleta do castelo: menos saturado, mais escuro, tom pedra"""
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    rgb = a[..., :3]
    g = rgb @ np.array([.3, .59, .11], np.float32)
    rgb = g[..., None] + (rgb - g[..., None]) * sat
    rgb = rgb * val + np.array(warm, np.float32)
    a[..., :3] = np.clip(rgb, 0, 255)
    return Image.fromarray(a.astype(np.uint8))


def cx(name, **k):
    return grade(Image.open(os.path.join(CX, f"cx-{name}.png")), **k)


# nome: (imagem, colisão (largura, altura) em px na base ou None, "wall" se vai pendurado na parede)
def catalog():
    P = {}
    # pack — interior
    P["pillar"] = (crop("int", (416, 116, 448, 272)), (18, 10))
    P["pillar-b"] = (crop("int", (464, 116, 496, 272)), (18, 10))
    P["pillar-grey"] = (crop("int", (160, 432, 192, 592)), (16, 10))
    P["pillar-gem"] = (crop("int", (944, 280, 976, 428)), (18, 10))
    P["pillar-short"] = (crop("int", (416, 336, 448, 400)), (16, 8))
    P["dais"] = (crop("int", (466, 598, 640, 800)), None)
    P["arcade"] = (crop("int", (0, 736, 128, 800)), None, "wall")
    P["arch-niche"] = (crop("int", (0, 812, 32, 868)), None, "wall")
    P["win-tall"] = (crop("int", (96, 928, 128, 980)), None, "wall")
    P["win-tall2"] = (crop("int", (144, 928, 176, 980)), None, "wall")
    P["win-round"] = (crop("int", (0, 1000, 32, 1060)), None, "wall")
    P["door-wood"] = (crop("int", (496, 972, 528, 1028)), None, "wall")
    P["gem-panel"] = (crop("int", (864, 320, 928, 384)), None, "wall")
    P["gem-arch"] = (crop("int", (672, 320, 704, 384)), None, "wall")
    P["rail"] = (crop("int", (704, 1150, 800, 1250)), None)
    # pack — decorativos
    P["throne"] = (crop("deco", (288, 8, 380, 80)), (70, 14))
    P["throne-s"] = (crop("deco", (80, 0, 112, 48)), (26, 10))
    P["seat"] = (crop("deco", (0, 0, 32, 48)), (22, 10))
    P["rubble"] = (crop("deco", (96, 96, 192, 160)), (60, 14))
    P["rubble-s"] = (crop("deco", (384, 104, 416, 150)), (22, 10))
    P["stones"] = (crop("deco", (0, 108, 32, 152)), (22, 10))
    P["shield"] = (crop("deco", (448, 72, 482, 112)), None, "wall")
    P["shield-r"] = (crop("deco", (464, 144, 496, 176)), None, "wall")
    P["kite"] = (crop("deco", (100, 172, 124, 208)), None, "wall")
    P["kite-b"] = (crop("deco", (148, 172, 172, 208)), None, "wall")
    P["shield-pole"] = (crop("deco", (4, 168, 28, 216)), None, "wall")
    P["swords"] = (crop("deco", (304, 190, 336, 214)), None, "wall")
    P["swords2"] = (crop("deco", (464, 208, 496, 234)), None, "wall")
    P["sword"] = (crop("deco", (264, 240, 280, 276)), None, "wall")
    P["chain"] = (crop("deco", (264, 350, 280, 402)), None, "wall")
    P["chain-l"] = (crop("deco", (264, 414, 280, 500)), None, "wall")
    P["shackle"] = (crop("deco", (456, 256, 472, 288)), None, "wall")
    P["shackle2"] = (crop("deco", (472, 304, 488, 340)), None, "wall")
    # adereços antigos do castelo, na paleta do pack
    for n, coll in (("banquet", (84, 16)), ("chair", (20, 10)), ("candles", (14, 8)), ("bookshelf", (60, 14)), ("lectern", (26, 10)),
                    ("globe", (20, 10)), ("keytable", (48, 12)), ("altar", (72, 16)), ("angel", (36, 12)), ("knight", (30, 12)),
                    ("halberds", (56, 12)), ("rack", (52, 12)), ("axeblock", (30, 10)), ("gargoyle", (40, 12)),
                    ("sarcophagus", (60, 18)), ("coffin", (26, 12)), ("urns", (36, 10)), ("bunk", (60, 14)), ("ballchain", (20, 8)),
                    ("bucket", (18, 8)), ("gibbet", (34, 10)), ("maiden", (30, 12)), ("drawers", (48, 12)), ("potions", (48, 12)),
                    ("cross", (22, 8)), ("obelisk", (22, 10)), ("grave", (24, 8)), ("deadtree", (24, 10)), ("hourglass", (20, 8)),
                    ("alchemy", (50, 14)), ("bier", (60, 14))):
        P[n] = (cx(n), coll)
    b = cx("banners")
    P["banner"] = (b.crop((0, 0, b.width // 2, b.height)).crop(b.crop((0, 0, b.width // 2, b.height)).getbbox()), None, "wall")
    return P


if __name__ == "__main__":
    from PIL import ImageDraw
    P = catalog()
    x = y = rh = 0
    S = Image.new("RGBA", (1400, 900), (60, 56, 60, 255))
    d = ImageDraw.Draw(S)
    for k, v in P.items():
        im = v[0].resize((v[0].width * 2, v[0].height * 2), Image.NEAREST)
        if x + im.width > 1400:
            x, y, rh = 0, y + rh + 14, 0
        S.alpha_composite(im, (x, y))
        d.text((x, y + im.height), k, fill=(255, 255, 0))
        x += im.width + 10
        rh = max(rh, im.height)
    S.crop((0, 0, 1400, y + rh + 16)).save("/tmp/cat/props.png")
