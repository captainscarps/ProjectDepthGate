"""
Deserto Esquecido (v2, orgânico) — gera o mapa "assado" (chunks 512px), os props,
a barreira das passagens, a folha do chefe Golem de Lava e o JSON do nível
usado por patch_desert.py.

Uso: python3 scripts/build_desert_map.py <pasta-do-pacote rpg-desert-tileset>
"""
import json
import math
import os
import random
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "newmaps")
BOSS_OUT = os.path.join(ROOT, "assets", "pixel-art", "bosses")
PK = sys.argv[1]
PNG = os.path.join(PK, "PNG")
T = 32
COLS, ROWS = 80, 64
W, H = COLS * T, ROWS * T
CH = 512
rnd = random.Random(11)
nrs = np.random.RandomState(11)


def L(name):
    return Image.open(os.path.join(PNG, name + ".png")).convert("RGBA")


def scaled(im, s):
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


# ═══════════════════════════ props ═══════════════════════════════════════
def pyramid():
    im = Image.open(os.path.join(PNG, "Preview_2D_RPG_Desert_Tileset.png")).convert("RGBA").crop((1820, 1080, 2240, 1460))
    poly = [(209, 60), (68, 170), (72, 314), (352, 314), (362, 166)]
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    im.putalpha(m)
    ImageDraw.Draw(im).line(poly + [poly[0]], fill=(92, 52, 22, 255), width=7, joint="curve")
    return im.crop(m.getbbox())


PROPS = {
    "ds-cactus": (L("greenery_1"), 0.26), "ds-cactus2": (L("greenery_3"), 0.30),
    "ds-cactus3": (L("greenery_1").transpose(Image.FLIP_LEFT_RIGHT), 0.21),
    "ds-cactus4": (L("greenery_3").transpose(Image.FLIP_LEFT_RIGHT), 0.24),
    "ds-deadtree": (L("tree_11"), 0.27), "ds-deadtree2": (L("tree_12"), 0.27),
    "ds-deadtree3": (L("tree_12").transpose(Image.FLIP_LEFT_RIGHT), 0.22),
    "ds-house": (L("building_1"), 0.25), "ds-house2": (L("building_2"), 0.25), "ds-tower": (L("building_3"), 0.27),
    "ds-boulder": (L("stones_5"), 0.26), "ds-boulder2": (L("stones_6"), 0.24), "ds-boulder3": (L("stones_7"), 0.26),
    "ds-boulder4": (L("stones_9"), 0.26), "ds-boulder5": (L("stones_8"), 0.24),
    "ds-rockpile": (L("stones_4"), 0.24), "ds-campfire": (L("decor_7"), 0.26), "ds-skull": (L("decor_6"), 0.24),
    "ds-boat": (L("decor_5"), 0.26), "ds-log": (L("decor_4"), 0.26),
    "ds-mesa": (L("stones_10"), 0.22), "ds-mesa2": (L("stones_12"), 0.2), "ds-mesa3": (L("stones_11"), 0.17),
    "ds-pyramid": (pyramid(), 0.5),
}
P = {}
for k, (im, s) in PROPS.items():
    P[k] = scaled(im, s)
    P[k].save(os.path.join(OUT, k + ".png"))


# barreira de pedras que surge quando a passagem se tranca (como os espinhos da floresta)
def barrier(horizontal):
    w, h = (64, 46) if horizontal else (36, 76)
    im = Image.new("RGBA", (w, h))
    pieces = [("stones_7", .17, 2, 16), ("stones_5", .16, 26, 12), ("stones_9", .15, 40, 20)] if horizontal else \
        [("stones_7", .16, 2, 2), ("stones_9", .15, 0, 24), ("stones_5", .15, 2, 44)]
    for n, s, x, y in pieces:
        p = scaled(L(n), s)
        im.alpha_composite(p, (min(x, w - p.width), min(y, h - p.height)))
    return im


barrier(True).save(os.path.join(OUT, "ds-thorn-h.png"))
barrier(False).save(os.path.join(OUT, "ds-thorn-v.png"))

# ═══════════════════════════ chefe: Golem de Lava ════════════════════════
GD = os.path.join(PK, "Lava_golem boss")
frames, idx = [], {}
for n in ["Idle", "Walk", "Attack_1", "Attack_3", "Run+Attack", "Hurt", "Dead", "Run"]:
    im = Image.open(os.path.join(GD, n + ".png")).convert("RGBA")
    k = im.width // 128
    idx[n] = list(range(len(frames), len(frames) + k))
    frames += [im.crop((i * 128, 0, i * 128 + 128, 128)) for i in range(k)]
sheet = Image.new("RGBA", (128 * len(frames), 128))
for i, f in enumerate(frames):
    sheet.paste(f, (i * 128, 0))
sheet.save(os.path.join(BOSS_OUT, "boss-lava-golem.png"))
BOSS_ANIMS = {
    "idle": {"frames": idx["Idle"], "frameRate": 7, "repeat": -1},
    "walk": {"frames": idx["Walk"], "frameRate": 10, "repeat": -1},
    "attack": {"frames": idx["Attack_3"], "frameRate": 11, "repeat": 0},
    "hurt": {"frames": idx["Hurt"], "frameRate": 10, "repeat": 0},
    "death": {"frames": idx["Dead"], "frameRate": 7, "repeat": 0},
    "windup": {"frames": idx["Attack_1"][:3], "frameRate": 7, "repeat": 0},
    "strike": {"frames": idx["Attack_1"][3:] + idx["Attack_3"][3:], "frameRate": 13, "repeat": 0},
    "phase": {"frames": idx["Run+Attack"], "frameRate": 11, "repeat": 0},
    "special": {"frames": idx["Run"], "frameRate": 13, "repeat": -1},
}

# ═══════════════════════════ layout ══════════════════════════════════════
R = lambda x, y, w, h: {"x": x, "y": y, "w": w, "h": h}
ROOMS = [
    dict(id="deserto-acampamento", name="Acampamento das Caravanas", rect=R(32, 50, 17, 12), ambient=.14),
    dict(id="deserto-dunas", name="Dunas do Viajante", rect=R(28, 36, 25, 12), ambient=.16),
    dict(id="deserto-oasis", name="Oásis Esquecido", rect=R(27, 19, 27, 15), ambient=.18),
    dict(id="deserto-vila", name="Vila Soterrada", rect=R(3, 19, 19, 17), ambient=.2),
    dict(id="deserto-poco", name="Poço Seco", rect=R(4, 43, 15, 12), ambient=.2),
    dict(id="deserto-canion", name="Cânion dos Ossos", rect=R(60, 19, 17, 17), ambient=.22),
    dict(id="deserto-mesa", name="Mesa Vermelha", rect=R(60, 43, 16, 12), ambient=.22),
    dict(id="deserto-piramide", name="Pirâmide Esquecida", rect=R(25, 1, 32, 14), ambient=.26, final=True,
         boss="LAVA_GOLEM", banner="PIRÂMIDE ESQUECIDA", zoom=.85),
]
# corredores: polilinhas (largura 3) — passam por "gargalos" de 2 onde ficam as passagens
CORR = [
    [(40, 55), (40, 52), (41, 49), (40, 46)],
    [(40, 40), (39, 37), (40, 34), (40, 31)],
    [(30, 26), (26, 27), (22, 27), (18, 28)],
    [(51, 26), (55, 27), (59, 27), (63, 28)],
    [(11, 33), (11, 37), (12, 41), (11, 46)],
    [(68, 33), (68, 37), (67, 41), (68, 46)],
    [(11, 22), (11, 15), (13, 8), (18, 6), (24, 7), (29, 7)],
    [(68, 22), (68, 15), (66, 8), (61, 6), (56, 7), (52, 7)],
]
DOORS = [  # (id, orient, col, row, rooms)
    ("porta-deserto-dunas", "h", 40, 49, ["deserto-acampamento", "deserto-dunas"]),
    ("porta-deserto-oasis", "h", 39, 35, ["deserto-dunas", "deserto-oasis"]),
    ("porta-deserto-vila", "v", 24, 26, ["deserto-oasis", "deserto-vila"]),
    ("porta-deserto-canion", "v", 57, 26, ["deserto-oasis", "deserto-canion"]),
    ("porta-deserto-poco", "h", 11, 39, ["deserto-vila", "deserto-poco"]),
    ("porta-deserto-mesa", "h", 67, 39, ["deserto-canion", "deserto-mesa"]),
    ("porta-deserto-piramide-w", "h", 11, 17, ["deserto-vila", "deserto-piramide"]),
    ("porta-deserto-piramide-e", "h", 67, 17, ["deserto-canion", "deserto-piramide"]),
]
SPAWN = {"col": 40, "row": 57}

# conteúdo das áreas (posições "desejadas"; o gerador ajusta para o chão livre mais próximo)
E = lambda t, c, r, **k: dict(type=t, col=c, row=r, **k)
S = lambda tex, c, r, bw=14, bh=10, **k: dict(type="sprite", tex=tex, col=c, row=r, solid=True, bw=bw, bh=bh, **k)
FLAT = lambda tex, c, r: dict(type="sprite", tex=tex, col=c, row=r, flat=True)
CONTENT = {
    "deserto-acampamento": dict(enemies=[], decor=[
        S("ds-campfire", 43, 56, 22, 12, light="TORCH"), S("ds-log", 43, 58, 40, 8), S("ds-log", 37, 54, 40, 8),
        S("ds-cactus", 34, 52), S("ds-deadtree", 46, 52), S("ds-boulder3", 35, 59, 26, 12), FLAT("ds-skull", 45, 59)]),
    "deserto-dunas": dict(enemies=[E("GOBLIN", 33, 41), E("GOBLIN", 46, 42), E("GOBLIN_ARCHER", 49, 39), E("SKELETON", 36, 44)], decor=[
        S("ds-cactus2", 31, 39, 12, 8), S("ds-cactus", 50, 45), S("ds-rockpile", 44, 38, 40, 14),
        S("ds-boulder", 30, 45, 30, 14), S("ds-deadtree3", 36, 38), FLAT("ds-skull", 42, 44)]),
    "deserto-oasis": dict(lake=R(30, 22, 7, 4), enemies=[
        E("DEMON_CASTER", 46, 23, elite=True, affixes=["VAMPIRIC"]), E("NECRO_SHADE", 32, 29), E("NECRO_SHADE", 49, 30), E("GHOST", 41, 30)],
        decor=[S("ds-boat", 33, 27, 60, 12), S("ds-cactus", 29, 21), S("ds-cactus4", 38, 21, 12, 8), S("ds-cactus3", 52, 21, 12, 10),
               S("ds-deadtree2", 51, 32), S("ds-boulder", 29, 32, 30, 14), S("ds-rockpile", 45, 20, 40, 14), FLAT("ds-skull", 44, 28)]),
    "deserto-vila": dict(enemies=[E("GHOST", 7, 31), E("DEMON", 16, 29), E("SKELETON_MAGE", 11, 33), E("SKELETON_WARRIOR", 18, 24)], decor=[
        S("ds-house", 8, 24, 130, 30, baseUp=6), S("ds-tower", 17, 22, 52, 24, baseUp=6), S("ds-cactus2", 5, 27, 12, 8),
        S("ds-boulder4", 5, 33, 28, 12), S("ds-deadtree", 14, 30), FLAT("ds-skull", 9, 29), S("ds-log", 19, 33, 40, 8)]),
    "deserto-poco": dict(enemies=[], decor=[
        dict(type="chest", col=11, row=47, solid=True), S("ds-rockpile", 8, 46, 40, 14), S("ds-cactus", 15, 45),
        S("ds-deadtree2", 6, 51), S("ds-boulder2", 15, 51, 34, 16), FLAT("ds-skull", 12, 50)]),
    "deserto-canion": dict(enemies=[E("GHOST", 63, 26), E("SKELETON_WARRIOR", 72, 30), E("DEMON_CASTER", 68, 23), E("SKELETON_ARCHER", 73, 22)], decor=[
        S("ds-boulder2", 63, 22, 34, 16), S("ds-boulder", 74, 26, 30, 14), S("ds-rockpile", 67, 29, 40, 14),
        S("ds-deadtree2", 62, 33), S("ds-cactus", 74, 33), FLAT("ds-skull", 70, 26), FLAT("ds-skull", 64, 30),
        dict(type="trap-spikes", col=65, row=31), dict(type="trap-spikes", col=71, row=25)]),
    "deserto-mesa": dict(enemies=[E("ORC_WARRIOR", 68, 48, elite=True, affixes=["TOUGH"]), E("GOBLIN_ARCHER", 63, 46), E("GOBLIN", 72, 50)], decor=[
        dict(type="chest", col=73, row=46, solid=True), S("ds-boulder5", 62, 51, 30, 12), S("ds-cactus3", 74, 52, 12, 10),
        S("ds-deadtree3", 64, 45), FLAT("ds-skull", 69, 52)]),
    "deserto-piramide": dict(enemies=[E("GHOST", 31, 10), E("GHOST", 50, 10), E("DEMON", 41, 12)], decor=[
        S("ds-pyramid", 41, 5, 150, 44, baseUp=4), dict(type="statue-fire", col=34, row=6), dict(type="statue-fire", col=48, row=6),
        dict(type="brazier", col=31, row=12, solid=True), dict(type="brazier", col=51, row=12, solid=True),
        S("ds-cactus2", 27, 4, 12, 8), S("ds-cactus4", 55, 4, 12, 8), FLAT("ds-skull", 37, 12)]),
}


# ═══════════════════════════ grade orgânica ═════════════════════════════
def vnoise(shape, cell, seed):
    rs = np.random.RandomState(seed)
    gh, gw = shape[0] // cell + 3, shape[1] // cell + 3
    g = rs.rand(gh, gw)
    return ndimage.zoom(g, cell, order=3)[:shape[0], :shape[1]] * 2 - 1


def necks(walk):
    for _, o, c, r, _ in DOORS:
        if o == "h":
            for rr in (r - 1, r, r + 1):
                walk[rr, c] = walk[rr, c + 1] = True
                for k in range(1, 4):
                    walk[rr, c - k] = walk[rr, c + 1 + k] = False
        else:
            for cc in (c - 1, c, c + 1):
                walk[r, cc] = walk[r + 1, cc] = True
                for k in range(1, 4):
                    walk[r - k, cc] = walk[r + 1 + k, cc] = False


walk = np.zeros((ROWS, COLS), bool)
nz = vnoise((ROWS, COLS), 4, 3)
for rm in ROOMS:
    q = rm["rect"]
    cx, cy = q["x"] + q["w"] / 2 - .5, q["y"] + q["h"] / 2 - .5
    a, b = q["w"] / 2, q["h"] / 2
    for r in range(q["y"], q["y"] + q["h"]):
        for c in range(q["x"], q["x"] + q["w"]):
            nx, ny = abs(c - cx) / a, abs(r - cy) / b
            d = (nx ** 2.6 + ny ** 2.6) ** (1 / 2.6)
            if d < .9 + .14 * nz[r, c]:
                walk[r, c] = True
for pl in CORR:
    for (x0, y0), (x1, y1) in zip(pl, pl[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 3) + 1
        for i in range(n + 1):
            x, y = x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n
            for r in range(int(y) - 2, int(y) + 3):
                for c in range(int(x) - 2, int(x) + 3):
                    if (c - x) ** 2 + (r - y) ** 2 <= 1.6 ** 2 and 0 < c < COLS - 1 and 0 < r < ROWS - 1:
                        walk[r, c] = True
lake_tiles = set()
for rm in ROOMS:
    lk = CONTENT[rm["id"]].get("lake")
    if lk:
        lake_tiles |= {(c, r) for r in range(lk["y"], lk["y"] + lk["h"]) for c in range(lk["x"], lk["x"] + lk["w"])}
walk = ndimage.binary_closing(walk, structure=np.ones((2, 2)), iterations=1) | walk
for (c, r) in lake_tiles:
    walk[r, c] = False
necks(walk)
walk[0, :] = walk[-1, :] = walk[:, 0] = walk[:, -1] = False

used = set()


def snap(o, room_rect, clearance):
    """move objeto para o chão livre mais próximo (com folga) dentro da sala"""
    best = None
    for r in range(room_rect["y"], room_rect["y"] + room_rect["h"]):
        for c in range(room_rect["x"], room_rect["x"] + room_rect["w"]):
            ok = all(0 <= c + dx < COLS and 0 <= r + dy < ROWS and walk[r + dy, c + dx]
                     for dy in range(-clearance, clearance + 1) for dx in range(-clearance, clearance + 1))
            if ok and (c, r) not in used:
                d = (c - o["col"]) ** 2 + (r - o["row"]) ** 2
                if best is None or d < best[0]:
                    best = (d, c, r)
    assert best, o
    o["col"], o["row"] = best[1], best[2]
    used.add((o["col"], o["row"]))


# alcance: bolsões isolados viram parede
seen = np.zeros_like(walk)
dq = deque([(SPAWN["col"], SPAWN["row"])])
seen[SPAWN["row"], SPAWN["col"]] = True
while dq:
    c, r = dq.popleft()
    for dc, dr in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if walk[r + dr, c + dc] and not seen[r + dr, c + dc]:
            seen[r + dr, c + dc] = True
            dq.append((c + dc, r + dr))
print("chão alcançável:", int(seen.sum()), "de", int(walk.sum()))
walk &= seen

rooms_out = []
for rm in ROOMS:
    q = rm["rect"]
    ct = CONTENT[rm["id"]]
    for o in ct["enemies"]:
        snap(o, q, 1)
    for o in ct["decor"]:
        big = o.get("tex") in ("ds-house", "ds-pyramid", "ds-tower")
        snap(o, q, 0 if o.get("flat") else (2 if big else 1))
    walls = []
    for r in range(q["y"], q["y"] + q["h"]):
        c = q["x"]
        while c < q["x"] + q["w"]:
            if not walk[r, c]:
                c0 = c
                while c < q["x"] + q["w"] and not walk[r, c]:
                    c += 1
                walls.append(R(c0, r, c - c0, 1))
            else:
                c += 1
    out = {k: v for k, v in rm.items()}
    out.update(walls=walls, enemies=ct["enemies"], decor=ct["decor"])
    rooms_out.append(out)
in_rect = np.zeros_like(walk)
for rm in ROOMS:
    q = rm["rect"]
    in_rect[q["y"]:q["y"] + q["h"], q["x"]:q["x"] + q["w"]] = True
corridors = []
for r in range(ROWS):
    c = 0
    while c < COLS:
        if walk[r, c] and not in_rect[r, c]:
            c0 = c
            while c < COLS and walk[r, c] and not in_rect[r, c]:
                c += 1
            corridors.append(R(c0, r, c - c0, 1))
        else:
            c += 1
doors = [dict(id=i, orientation=o, col=c, row=r, rooms=rr) for i, o, c, r, rr in DOORS]
for d in doors:
    assert walk[d["row"], d["col"]], d


# ═══════════════════════════ pintura ═════════════════════════════════════
def tile(tex, s, crop=None):
    t = scaled(tex.crop(crop) if crop else tex, s)
    out = Image.new("RGBA", (W, H))
    for y in range(0, H, t.height):
        for x in range(0, W, t.width):
            out.paste(t, (x, y))
    return out


def A(img):
    return np.asarray(img).astype(np.float32)


def comp(base, top, alpha):
    a = np.asarray(alpha, np.float32)[..., None]
    base[..., :3] = base[..., :3] * (1 - a) + top[..., :3] * a
    return base


def solid(rgb):
    return np.array(list(rgb) + [255], np.float32)


wallpx = np.kron((~walk).astype(np.float32), np.ones((T, T), np.float32))
pn = vnoise((H // 16 + 4, W // 16 + 4), 3, 5)
pn = ndimage.zoom(pn, 16, order=1)[:H, :W]
soft = ndimage.gaussian_filter(wallpx, 13) + pn * .16
WM = soft > .5
for (c, r) in lake_tiles:
    WM[r * T:(r + 1) * T, c * T:(c + 1) * T] = False
FACE = 34
below = np.zeros_like(WM)
below[:-FACE] = WM[FACE:]
FM = WM & ~below
TOP = WM & ~FM

img = A(tile(L("bg"), 0.5))
tone = ndimage.zoom(vnoise((H // 64 + 4, W // 64 + 4), 3, 9), 64, order=1)[:H, :W]
img[..., :3] *= (1 + tone[..., None] * .07)
spots = ndimage.gaussian_filter((nrs.rand(H // 8, W // 8) > .985).astype(np.float32), 3)
spots = np.kron(spots, np.ones((8, 8)))[:H, :W]
img = comp(img, solid((150, 92, 44)), np.clip(spots * 6, 0, .35))

pathm = Image.new("L", (W, H), 0)
dp = ImageDraw.Draw(pathm)
LINKS = CORR + [[(40, 46), (40, 40)], [(40, 31), (40, 26), (30, 26)], [(40, 26), (51, 26)],
                [(18, 28), (12, 29), (11, 33)], [(63, 28), (68, 29), (68, 33)], [(11, 22), (11, 28)], [(68, 22), (68, 28)],
                [(29, 7), (35, 9), (41, 10), (47, 9), (52, 7)], [(40, 55), (40, 57)]]
for pl in LINKS:
    pts = [(x * T + 16, y * T + 16) for x, y in pl]
    dp.line(pts, fill=255, width=46, joint="curve")
    for p in pts:
        dp.ellipse((p[0] - 23, p[1] - 23, p[0] + 23, p[1] + 23), fill=255)
pm = ndimage.gaussian_filter(A(pathm) / 255, 5) + pn * .25
PM = (pm > .5) & ~WM
road = A(tile(L("road_5"), 0.6))
edge = ndimage.binary_dilation(PM, iterations=3) & ~PM & ~WM
img = comp(img, solid((118, 76, 38)), edge * .55)
img = comp(img, road, PM * .92)
yy, xx = np.ogrid[:H, :W]
plz = ((((xx - 41.5 * T) / (9 * T)) ** 2 + ((yy - 10 * T) / (3.6 * T)) ** 2) < 1) & ~WM
img = comp(img, solid((86, 66, 50)), (ndimage.binary_dilation(plz, iterations=4) & ~plz & ~WM) * .8)
img = comp(img, A(tile(L("road_18"), 0.6)), plz * 1.0)

sh = ndimage.gaussian_filter(np.roll(np.roll(WM.astype(np.float32), 10, 0), 5, 1), 7)
img = comp(img, solid((64, 32, 12)), np.clip(sh, 0, 1) * (~WM) * .55)
top = A(tile(L("land_6"), 0.5))
top[..., :3] *= np.array([.97, .86, .74], np.float32)
inner = ndimage.distance_transform_edt(TOP)
img = comp(img, top, TOP.astype(np.float32))
img = comp(img, solid((96, 54, 22)), TOP * np.clip(1 - inner / 10, 0, 1) * .35)
rim = TOP & (inner <= 5) & (inner > 2)
img = comp(img, solid((232, 170, 96)), rim * .55)
rock = A(tile(L("land_14"), 0.3, crop=(6, 6, 232, 232)))
fd = np.clip(ndimage.distance_transform_edt(~TOP) / FACE, 0, 1)
rock[..., :3] *= (1 - .5 * fd[..., None])
img = comp(img, rock, FM.astype(np.float32))
outline = ndimage.binary_dilation(WM, iterations=2) & ~ndimage.binary_erosion(WM, iterations=2)
img = comp(img, solid((78, 42, 16)), outline * .95)
lip = TOP & ndimage.binary_dilation(FM, iterations=3)
img = comp(img, solid((236, 182, 104)), lip * .6)
lipline = TOP & ndimage.binary_dilation(FM, iterations=1)
img = comp(img, solid((78, 42, 16)), lipline * .9)
canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGBA")

for rm in ROOMS:
    lk = CONTENT[rm["id"]].get("lake")
    if lk:
        im = L("lake").resize((lk["w"] * T + 26, lk["h"] * T + 22), Image.LANCZOS)
        canvas.alpha_composite(im, (lk["x"] * T - 13, lk["y"] * T - 11))

# ── enfeites sobre o platô ───────────────────────────────────────────────
front, occ = [], []
dist_floor = ndimage.distance_transform_edt(WM)


def free(b, pad=4):
    return all(b[2] + pad < o[0] or b[0] - pad > o[2] or b[3] + pad < o[1] or b[1] - pad > o[3] for o in occ)


def place(k, x, y, as_front):
    im = P[k]
    b = (x - im.width // 2, y - im.height, x + im.width // 2, y)
    if not free(b):
        return False
    occ.append(b)
    if as_front:
        front.append([int(x), int(y), k])
    else:
        sh2 = Image.new("RGBA", (im.width + 20, 24))
        ImageDraw.Draw(sh2).ellipse((6, 4, im.width + 10, 20), fill=(60, 30, 10, 85))
        canvas.alpha_composite(sh2.filter(ImageFilter.GaussianBlur(4)), (int(b[0] - 6), int(y - 16)))
        canvas.alpha_composite(im, (int(b[0]), int(b[1])))
    return True


def base_ok(x, y, im, need):
    x0, x1 = int(x - im.width * .38), int(x + im.width * .38)
    if x0 < 0 or x1 >= W or y >= H or y - 8 < 0 or y - im.height < 0:
        return False
    return all(TOP[int(y) - 6, q] and dist_floor[int(y) - 6, q] >= need for q in (x0, int(x), x1))


for k, n in (("ds-mesa3", 6), ("ds-mesa", 12), ("ds-mesa2", 12)):
    for _ in range(5000):
        if n <= 0:
            break
        im = P[k]
        x, y = rnd.randrange(W), rnd.randrange(H)
        if base_ok(x, y, im, 90) and all(TOP[y - im.height + 10, q] for q in (x - im.width // 3, x + im.width // 3)):
            if place(k, x, y, False):
                n -= 1
EDGE = [("ds-boulder", 5), ("ds-boulder2", 4), ("ds-boulder3", 5), ("ds-boulder4", 4), ("ds-boulder5", 4), ("ds-rockpile", 5),
        ("ds-cactus", 5), ("ds-cactus2", 4), ("ds-cactus3", 3), ("ds-cactus4", 3), ("ds-deadtree", 3), ("ds-deadtree2", 3), ("ds-deadtree3", 3)]
ek, ew = zip(*EDGE)
cand = np.argwhere(TOP & (dist_floor > 10) & (dist_floor < 34))
nrs.shuffle(cand)
for y, x in cand[:9000]:
    k = rnd.choices(ek, ew)[0]
    if base_ok(x, y, P[k], 8):
        place(k, x, y, True)
for _ in range(6000):
    k = rnd.choices(ek, ew)[0]
    x, y = rnd.randrange(W), rnd.randrange(H)
    if base_ok(x, y, P[k], 70) and TOP[y - P[k].height, x]:
        place(k, x, y, False)
small = [scaled(L("stones_1"), .13), scaled(L("stones_8"), .11), scaled(L("stones_9"), .1), scaled(L("decor_6"), .16), scaled(L("stones_7"), .1)]
for _ in range(420):
    im = rnd.choice(small)
    x, y = rnd.randrange(W - 40), rnd.randrange(H - 40)
    if walk[y // T, x // T] and walk[(y + im.height) // T, (x + im.width) // T] and not WM[y, x] and not WM[y + im.height, x + im.width]:
        canvas.alpha_composite(im, (x, y))

canvas = canvas.convert("RGB")
for cy in range(math.ceil(H / CH)):
    for cx in range(math.ceil(W / CH)):
        canvas.crop((cx * CH, cy * CH, cx * CH + CH, cy * CH + CH)).save(os.path.join(OUT, f"dsb-{cx}-{cy}.png"), optimize=True)
front.sort(key=lambda f: f[1])
json.dump({"chunk": CH, "cols": math.ceil(W / CH), "rows": math.ceil(H / CH), "front": front},
          open(os.path.join(OUT, "dsb-meta.json"), "w"))
prev = canvas.copy().convert("RGBA")
for x, y, k in front:
    im = P[k]
    prev.alpha_composite(im, (x - im.width // 2, y - im.height))
prev.resize((W // 2, H // 2), Image.LANCZOS).convert("RGB").save(os.path.join(ROOT, "scripts", "desert_preview.png"))
json.dump({"world": {"cols": COLS, "rows": ROWS}, "rooms": rooms_out, "corridors": corridors, "doors": doors, "spawn": SPAWN,
           "props": sorted(P) + ["ds-thorn-h", "ds-thorn-v"], "boss_anims": BOSS_ANIMS},
          open(os.path.join(ROOT, "scripts", "desert_level.json"), "w"), ensure_ascii=False, indent=1)
print("ok", len(front), "props na borda", len(corridors), "corredores")
