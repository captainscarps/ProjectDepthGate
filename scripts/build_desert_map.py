"""
Deserto Esquecido — gera o mapa "assado" (chunks 512px) + props a partir do
pacote rpg-desert-tileset, e o JSON do nível usado por patch_desert.py.

Uso: python3 scripts/build_desert_map.py <pasta-do-pacote rpg-desert-tileset>
Saídas:
  assets/pixel-art/newmaps/dsb-X-Y.png, dsb-meta.json, ds-*.png
  scripts/desert_level.json
"""
import json
import os
import random
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "newmaps")
PK = sys.argv[1]
PNG = os.path.join(PK, "PNG")
T = 32
COLS, ROWS = 64, 48
W, H = COLS * T, ROWS * T
CH = 512
rnd = random.Random(7)


def L(name):
    return Image.open(os.path.join(PNG, name + ".png")).convert("RGBA")


def scaled(im, s):
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


# ── props (tamanho final no jogo) ────────────────────────────────────────
def pyramid():
    im = Image.open(os.path.join(PNG, "Preview_2D_RPG_Desert_Tileset.png")).convert("RGBA").crop((1820, 1080, 2240, 1460))
    poly = [(209, 60), (68, 170), (72, 314), (352, 314), (362, 166)]
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    im.putalpha(m)
    d = ImageDraw.Draw(im)
    d.line(poly + [poly[0]], fill=(92, 52, 22, 255), width=7, joint="curve")
    return im.crop(m.getbbox())


PROPS = {
    "ds-cactus": (L("greenery_1"), 0.26),
    "ds-cactus2": (L("greenery_3"), 0.30),
    "ds-cactus3": (L("greenery_1").transpose(Image.FLIP_LEFT_RIGHT), 0.21),
    "ds-deadtree": (L("tree_11"), 0.27),
    "ds-deadtree2": (L("tree_12"), 0.27),
    "ds-house": (L("building_1"), 0.25),
    "ds-house2": (L("building_2"), 0.25),
    "ds-tower": (L("building_3"), 0.27),
    "ds-boulder": (L("stones_5"), 0.26),
    "ds-boulder2": (L("stones_6"), 0.24),
    "ds-boulder3": (L("stones_7"), 0.26),
    "ds-boulder4": (L("stones_9"), 0.26),
    "ds-rockpile": (L("stones_4"), 0.24),
    "ds-campfire": (L("decor_7"), 0.26),
    "ds-skull": (L("decor_6"), 0.24),
    "ds-boat": (L("decor_5"), 0.26),
    "ds-log": (L("decor_4"), 0.26),
    "ds-mesa": (L("stones_10"), 0.22),
    "ds-mesa2": (L("stones_12"), 0.2),
    "ds-pyramid": (pyramid(), 0.5),
}
P = {}
for k, (im, s) in PROPS.items():
    P[k] = scaled(im, s)
    P[k].save(os.path.join(OUT, k + ".png"))

# ── nível ────────────────────────────────────────────────────────────────
R = lambda x, y, w, h: {"x": x, "y": y, "w": w, "h": h}
rooms = [
    {"id": "deserto-portao", "name": "Portão das Areias", "rect": R(27, 37, 12, 8), "ambient": .16, "walls": [], "enemies": [],
     "decor": [
         {"type": "sprite", "tex": "ds-cactus", "col": 28, "row": 38, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-deadtree", "col": 37, "row": 38, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-campfire", "col": 35, "row": 42, "solid": True, "bw": 22, "bh": 12, "light": "TORCH"},
         {"type": "sprite", "tex": "ds-log", "col": 35, "row": 44, "solid": True, "bw": 40, "bh": 8},
         {"type": "sprite", "tex": "ds-boulder3", "col": 28, "row": 44, "solid": True, "bw": 26, "bh": 12},
         {"type": "sprite", "tex": "ds-skull", "col": 30, "row": 40, "flat": True},
     ]},
    {"id": "deserto-oasis", "name": "Oásis Esquecido", "rect": R(23, 21, 20, 12), "ambient": .2,
     "walls": [R(25, 23, 6, 3)], "lake": R(25, 23, 6, 3),
     "enemies": [{"type": "DEMON_CASTER", "col": 36, "row": 25, "elite": True, "affixes": ["VAMPIRIC"]},
                 {"type": "NECRO_SHADE", "col": 27, "row": 29}, {"type": "NECRO_SHADE", "col": 40, "row": 29},
                 {"type": "GHOST", "col": 33, "row": 30}],
     "decor": [
         {"type": "sprite", "tex": "ds-boat", "col": 28, "row": 27, "solid": True, "bw": 60, "bh": 12},
         {"type": "sprite", "tex": "ds-cactus", "col": 24, "row": 22, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-cactus2", "col": 32, "row": 23, "solid": True, "bw": 12, "bh": 8},
         {"type": "sprite", "tex": "ds-cactus3", "col": 41, "row": 22, "solid": True, "bw": 12, "bh": 10},
         {"type": "sprite", "tex": "ds-deadtree2", "col": 41, "row": 31, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-boulder", "col": 24, "row": 31, "solid": True, "bw": 30, "bh": 14},
         {"type": "sprite", "tex": "ds-rockpile", "col": 37, "row": 22, "solid": True, "bw": 40, "bh": 14},
         {"type": "sprite", "tex": "ds-skull", "col": 38, "row": 28, "flat": True},
     ]},
    {"id": "deserto-vila", "name": "Vila Soterrada", "rect": R(3, 19, 14, 14), "ambient": .22,
     "walls": [],
     "enemies": [{"type": "GHOST", "col": 6, "row": 29}, {"type": "DEMON", "col": 13, "row": 27},
                 {"type": "SKELETON_MAGE", "col": 9, "row": 31}],
     "decor": [
         {"type": "sprite", "tex": "ds-house", "col": 7, "row": 23, "solid": True, "bw": 130, "bh": 30, "baseUp": 6},
         {"type": "sprite", "tex": "ds-tower", "col": 14, "row": 23, "solid": True, "bw": 52, "bh": 24, "baseUp": 6},
         {"type": "chest", "col": 15, "row": 31, "solid": True},
         {"type": "sprite", "tex": "ds-cactus2", "col": 4, "row": 25, "solid": True, "bw": 12, "bh": 8},
         {"type": "sprite", "tex": "ds-boulder4", "col": 4, "row": 31, "solid": True, "bw": 28, "bh": 12},
         {"type": "sprite", "tex": "ds-deadtree", "col": 11, "row": 27, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-skull", "col": 8, "row": 28, "flat": True},
     ]},
    {"id": "deserto-canion", "name": "Cânion dos Ossos", "rect": R(48, 19, 13, 14), "ambient": .24,
     "walls": [],
     "enemies": [{"type": "GHOST", "col": 51, "row": 26}, {"type": "SKELETON_WARRIOR", "col": 57, "row": 30},
                 {"type": "DEMON_CASTER", "col": 54, "row": 23}],
     "decor": [
         {"type": "sprite", "tex": "ds-boulder2", "col": 51, "row": 22, "solid": True, "bw": 34, "bh": 16},
         {"type": "sprite", "tex": "ds-boulder", "col": 58, "row": 22, "solid": True, "bw": 30, "bh": 14},
         {"type": "sprite", "tex": "ds-rockpile", "col": 54, "row": 28, "solid": True, "bw": 40, "bh": 14},
         {"type": "sprite", "tex": "ds-deadtree2", "col": 49, "row": 31, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-cactus", "col": 59, "row": 31, "solid": True, "bw": 14, "bh": 10},
         {"type": "sprite", "tex": "ds-skull", "col": 56, "row": 25, "flat": True},
         {"type": "sprite", "tex": "ds-skull", "col": 50, "row": 28, "flat": True},
         {"type": "trap-spikes", "col": 52, "row": 30},
         {"type": "trap-spikes", "col": 57, "row": 26},
     ]},
    {"id": "deserto-piramide", "name": "Pirâmide Esquecida", "rect": R(19, 2, 26, 14), "ambient": .3, "final": True,
     "boss": "ABYSS_GUARDIAN", "banner": "PIRÂMIDE ESQUECIDA", "zoom": .88,
     "walls": [],
     "enemies": [{"type": "GHOST", "col": 25, "row": 10}, {"type": "GHOST", "col": 39, "row": 10},
                 {"type": "DEMON", "col": 32, "row": 12}],
     "decor": [
         {"type": "sprite", "tex": "ds-pyramid", "col": 32, "row": 5, "solid": True, "bw": 150, "bh": 44, "baseUp": 4},
         {"type": "statue-fire", "col": 26, "row": 6},
         {"type": "statue-fire", "col": 38, "row": 6},
         {"type": "brazier", "col": 23, "row": 13, "solid": True},
         {"type": "brazier", "col": 41, "row": 13, "solid": True},
         {"type": "sprite", "tex": "ds-cactus2", "col": 20, "row": 3, "solid": True, "bw": 12, "bh": 8},
         {"type": "sprite", "tex": "ds-cactus3", "col": 44, "row": 3, "solid": True, "bw": 12, "bh": 10},
         {"type": "sprite", "tex": "ds-skull", "col": 29, "row": 13, "flat": True},
     ]},
]
corridors = [R(32, 33, 2, 4), R(17, 26, 6, 2), R(43, 26, 5, 2),
             R(8, 9, 2, 10), R(10, 9, 9, 2), R(54, 9, 2, 10), R(45, 9, 9, 2)]
doors = [
    {"id": "porta-deserto-oasis", "orientation": "h", "col": 32, "row": 34, "rooms": ["deserto-portao", "deserto-oasis"], "model": "gate"},
    {"id": "porta-deserto-vila", "orientation": "v", "col": 19, "row": 26, "rooms": ["deserto-oasis", "deserto-vila"], "model": "gate"},
    {"id": "porta-deserto-canion", "orientation": "v", "col": 45, "row": 26, "rooms": ["deserto-oasis", "deserto-canion"], "model": "gate"},
    {"id": "porta-deserto-piramide-w", "orientation": "h", "col": 8, "row": 17, "rooms": ["deserto-vila", "deserto-piramide"], "model": "gate"},
    {"id": "porta-deserto-piramide-e", "orientation": "h", "col": 54, "row": 17, "rooms": ["deserto-canion", "deserto-piramide"], "model": "gate"},
]
spawn = {"col": 32, "row": 42}
paths = [R(32, 33, 2, 9), R(17, 26, 31, 2), R(8, 9, 2, 12), R(10, 9, 10, 2), R(54, 9, 2, 12), R(44, 9, 10, 2),
]
plaza = R(25, 8, 14, 6)

# ── grade ────────────────────────────────────────────────────────────────
g = [[1] * COLS for _ in range(ROWS)]
for rr in [r["rect"] for r in rooms] + corridors:
    for y in range(rr["y"], rr["y"] + rr["h"]):
        for x in range(rr["x"], rr["x"] + rr["w"]):
            g[y][x] = 0
for r in rooms:
    for w in r["walls"]:
        for y in range(w["y"], w["y"] + w["h"]):
            for x in range(w["x"], w["x"] + w["w"]):
                g[y][x] = 1
wall = lambda c, r: not (0 <= c < COLS and 0 <= r < ROWS) or g[r][c] == 1
lake_tiles = set()
for r in rooms:
    if r.get("lake"):
        q = r["lake"]
        lake_tiles |= {(x, y) for y in range(q["y"], q["y"] + q["h"]) for x in range(q["x"], q["x"] + q["w"])}


def tile(tex, s, crop=None):
    t = tex.crop(crop) if crop else tex
    t = scaled(t, s)
    out = Image.new("RGBA", (W, H))
    for y in range(0, H, t.height):
        for x in range(0, W, t.width):
            out.paste(t, (x, y))
    return out


def mask_from(fn):
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for y in range(ROWS):
        for x in range(COLS):
            if fn(x, y):
                d.rectangle((x * T, y * T, x * T + T - 1, y * T + T - 1), fill=255)
    return m


def soften(m, r=6):
    return m.filter(ImageFilter.GaussianBlur(r)).point(lambda v: 255 if v > 127 else 0)


canvas = tile(L("bg"), 0.5)
# manchas mais escuras na areia
spots = Image.new("L", (W, H), 0)
ds = ImageDraw.Draw(spots)
for _ in range(90):
    x, y = rnd.randrange(W), rnd.randrange(H)
    ds.ellipse((x - 70, y - 40, x + 70, y + 40), fill=rnd.randrange(20, 45))
spots = spots.filter(ImageFilter.GaussianBlur(30))
canvas = Image.composite(Image.new("RGBA", (W, H), (150, 90, 40, 255)), canvas, spots)

# trilhas de pedra (rachada) e praça da pirâmide (laje cinza)
pm = Image.new("L", (W, H), 0)
dp = ImageDraw.Draw(pm)
for q in paths:
    dp.rounded_rectangle((q["x"] * T + 4, q["y"] * T + 4, (q["x"] + q["w"]) * T - 4, (q["y"] + q["h"]) * T - 4), radius=18, fill=255)
pm = soften(pm, 5)
road = tile(L("road_5"), 0.75)
plz = Image.new("L", (W, H), 0)
ImageDraw.Draw(plz).rounded_rectangle((plaza["x"] * T, plaza["y"] * T, (plaza["x"] + plaza["w"]) * T, (plaza["y"] + plaza["h"]) * T), radius=26, fill=255)
edge = pm.filter(ImageFilter.MaxFilter(7))
canvas = Image.composite(Image.new("RGBA", (W, H), (112, 70, 34, 255)), canvas, edge)
canvas = Image.composite(road, canvas, pm)
pe = plz.filter(ImageFilter.MaxFilter(9))
canvas = Image.composite(Image.new("RGBA", (W, H), (88, 70, 54, 255)), canvas, pe)
canvas = Image.composite(tile(L("road_18"), 0.75), canvas, plz)

# paredes: platô de areia + face de rocha virada para o sul
wall_m = mask_from(lambda c, r: wall(c, r) and (c, r) not in lake_tiles)
face_m = Image.new("L", (W, H), 0)
df = ImageDraw.Draw(face_m)
FACE = 40
for y in range(ROWS):
    for x in range(COLS):
        if wall(x, y) and (x, y) not in lake_tiles and not wall(x, y + 1):
            df.rectangle((x * T, (y + 1) * T - FACE, x * T + T - 1, (y + 1) * T - 1), fill=255)
face_m = ImageChops.multiply(face_m, wall_m)
# sombra no chão abaixo das faces e ao lado das paredes
sh = wall_m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
sh_off = Image.new("L", (W, H), 0)
sh_off.paste(sh, (3, 8))
canvas = Image.composite(Image.new("RGBA", (W, H), (70, 36, 14, 255)), canvas, sh_off.point(lambda v: int(v * .5)))

top = tile(L("land_6"), 0.5)
canvas = Image.composite(top, canvas, wall_m)
rock = tile(L("land_14"), 0.32, crop=(6, 6, 232, 232))
grad = Image.new("L", (1, FACE))
for i in range(FACE):
    grad.putpixel((0, i), int(255 * (1 - 0.55 * i / FACE)))
shade = Image.new("L", (W, H), 255)
for y in range(ROWS):
    for x in range(COLS):
        if wall(x, y) and not wall(x, y + 1):
            shade.paste(grad.resize((T, FACE)), (x * T, (y + 1) * T - FACE))
rock = Image.composite(rock, Image.new("RGBA", (W, H), (30, 16, 6, 255)), shade)
canvas = Image.composite(rock, canvas, face_m)
# contorno escuro do platô e da face
outline = ImageChops.subtract(wall_m, wall_m.filter(ImageFilter.MinFilter(7)))
canvas = Image.composite(Image.new("RGBA", (W, H), (84, 46, 18, 255)), canvas, outline)
ftop = ImageChops.subtract(face_m, face_m.transform((W, H), Image.AFFINE, (1, 0, 0, 0, 1, 4)))
canvas = Image.composite(Image.new("RGBA", (W, H), (84, 46, 18, 255)), canvas, ftop.filter(ImageFilter.MaxFilter(3)))
hl = face_m.transform((W, H), Image.AFFINE, (1, 0, 0, 0, 1, 5))
hl = ImageChops.subtract(hl, face_m)
canvas = Image.composite(Image.new("RGBA", (W, H), (232, 176, 98, 255)), canvas, ImageChops.multiply(hl, wall_m).point(lambda v: int(v * .7)))

# lago do oásis
for r in rooms:
    if r.get("lake"):
        q = r["lake"]
        lk = L("lake").resize((q["w"] * T + 16, q["h"] * T + 12), Image.LANCZOS)
        canvas.alpha_composite(lk, (q["x"] * T - 8, q["y"] * T - 6))


# enfeites "assados": só onde tudo embaixo é parede (topo do platô) ou chão livre (pequenos)
def fits_wall(x0, y0, w, h, pad=1):
    for ty in range((y0) // T - pad, (y0 + h) // T + 1 + pad):
        for tx in range(x0 // T - pad, (x0 + w) // T + 1 + pad):
            if not wall(tx, ty) or (tx, ty) in lake_tiles:
                return False
    return True


occupied = []


def free(b):
    return all(b[2] < o[0] or b[0] > o[2] or b[3] < o[1] or b[1] > o[3] for o in occupied)


big = ["ds-mesa", "ds-mesa2", "ds-rockpile", "ds-boulder", "ds-boulder2", "ds-deadtree", "ds-deadtree2", "ds-cactus", "ds-cactus2", "ds-boulder3"]
wts = [9, 9, 4, 3, 3, 3, 3, 3, 3, 2]
placed = 0
for _ in range(20000):
    if placed >= 95:
        break
    k = rnd.choices(big, wts)[0]
    im = P[k]
    x, y = rnd.randrange(0, W - im.width), rnd.randrange(0, H - im.height)
    b = (x - 6, y - 6, x + im.width + 6, y + im.height + 6)
    if fits_wall(x, y, im.width, im.height) and free(b):
        occupied.append(b)
        placed += 1
        sh2 = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh2).ellipse((im.width * .1, im.height * .78, im.width * .95, im.height), fill=(60, 30, 10, 90))
        canvas.alpha_composite(sh2.filter(ImageFilter.GaussianBlur(3)), (x + 4, y + 2))
        canvas.alpha_composite(im, (x, y))
small = [scaled(L("stones_1"), .14), scaled(L("stones_8"), .12), scaled(L("stones_9"), .1), scaled(L("decor_6"), .17)]
for _ in range(120):
    im = rnd.choice(small)
    c, r_ = rnd.randrange(COLS), rnd.randrange(ROWS)
    if wall(c, r_) or wall(c, r_ - 1) or wall(c, r_ + 1) or wall(c - 1, r_) or wall(c + 1, r_):
        continue
    canvas.alpha_composite(im, (c * T + rnd.randrange(0, T - im.width + 1), r_ * T + rnd.randrange(0, T - im.height + 1)))

canvas = canvas.convert("RGB")
for cy in range(H // CH):
    for cx in range(W // CH):
        canvas.crop((cx * CH, cy * CH, cx * CH + CH, cy * CH + CH)).save(os.path.join(OUT, f"dsb-{cx}-{cy}.png"), optimize=True)
json.dump({"chunk": CH, "cols": W // CH, "rows": H // CH, "front": []}, open(os.path.join(OUT, "dsb-meta.json"), "w"))
canvas.resize((W // 2, H // 2)).save(os.path.join(ROOT, "scripts", "desert_preview.png"))
for r in rooms:
    r.pop("lake", None)
json.dump({"world": {"cols": COLS, "rows": ROWS}, "rooms": rooms, "corridors": corridors, "doors": doors, "spawn": spawn,
           "props": sorted(P)}, open(os.path.join(ROOT, "scripts", "desert_level.json"), "w"), ensure_ascii=False, indent=1)
print("ok", W // CH, "x", H // CH)
