"""
Vulcão de Cinzas — 10º portal. Gera, sem pacote externo, todo o visual da fase em vista 3/4
(estilo Diablo): chão de basalto, platôs com paredes de colunas de basalto, fendas com lava
no fundo (a parede de cima fica visível e iluminada pela lava), pontes de pedra, adereços
sombreados (pedras, colunas, obsidiana, fumarolas, enxofre, tocos), a barreira das passagens
e o JSON do nível usado por patch_volcano.py.

Uso: python3 scripts/build_volcano_map.py
"""
import json
import math
import os
import random
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import cKDTree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "newmaps")
T = 32
COLS, ROWS = 80, 64
W, H = COLS * T, ROWS * T
CH = 512
rnd = random.Random(23)
nrs = np.random.RandomState(23)
BAY = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16. - .5

ROCK = [(14, 13, 16), (22, 20, 24), (31, 28, 31), (41, 37, 39), (53, 47, 47), (67, 59, 57), (83, 73, 68), (102, 90, 82), (124, 110, 98)]
FACE = [(10, 8, 9), (18, 14, 14), (27, 21, 20), (37, 28, 25), (49, 37, 31), (62, 47, 38), (78, 59, 46), (96, 74, 56)]
ASH = [(70, 66, 66), (88, 84, 82), (108, 104, 100), (128, 124, 118)]
LAVA = [(60, 12, 6), (104, 24, 8), (152, 40, 10), (200, 66, 14), (236, 106, 22), (252, 152, 36), (255, 200, 72), (255, 236, 150), (255, 252, 220)]
SULF = [(120, 100, 30), (170, 150, 40), (214, 196, 70), (244, 232, 130)]
OBS = [(8, 8, 12), (16, 16, 22), (28, 30, 40), (46, 50, 64), (80, 92, 116), (150, 170, 200), (225, 235, 250)]


# ═════════════════════════════ utilidades ═════════════════════════════
def ramp(cols, v, yy, xx, d=.9):
    c = np.array(cols, np.float32)
    t = v * (len(c) - 1) + BAY[yy % 4, xx % 4] * d
    return c[np.clip(np.round(t), 0, len(c) - 1).astype(int)]


def vnoise(h, w, cell, seed):
    r = np.random.RandomState(seed)
    g = r.rand(h // cell + 3, w // cell + 3)
    return np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize(((w // cell + 3) * cell, (h // cell + 3) * cell), Image.BICUBIC),
                      np.float32)[:h, :w] / 255.


def fbm(h, w, seed, octs=((64, .5), (24, .27), (9, .15), (3, .08))):
    return sum(vnoise(h, w, c, seed + i) * a for i, (c, a) in enumerate(octs))


def shade_mask(m, cols, rim=0., seed=0, hm=None, tex=.25):
    """máscara → RGBA com volume (luz alto-esquerda) e aro quente embaixo"""
    h, w = m.shape
    if hm is None:
        dt = ndimage.distance_transform_edt(m)
        hm = np.sqrt(dt / (dt.max() + 1e-6))
    gy, gx = np.gradient(ndimage.gaussian_filter(hm.astype(np.float32), .8))
    nx, ny = -gx * 7, -gy * 7
    nz = np.ones_like(nx)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    lam = np.clip((nx * -.55 + ny * -.7 + nz * .45) / ln, 0, 1)
    v = .12 + lam * .8 + (fbm(h, w, seed, ((4, .6), (2, .4))) - .5) * tex
    yy, xx = np.mgrid[0:h, 0:w]
    c = ramp(cols, np.clip(v, 0, 1), yy, xx)
    if rim:
        c = c + np.clip(ny / ln, 0, 1)[..., None] * np.array([200, 70, 20]) * rim
    a = np.zeros((h, w, 4), np.uint8)
    a[..., :3] = np.clip(c, 0, 255)
    a[..., 3] = m * 255
    ed = m & ~ndimage.binary_erosion(m)
    a[ed, :3] = (a[ed, :3] * .45).astype(np.uint8)
    return Image.fromarray(a)


# ═════════════════════════════ adereços ═════════════════════════════
def boulder(seed, w, h):
    yy, xx = np.mgrid[0:h, 0:w]
    ang = np.arctan2(yy - h * .55, xx - w / 2)
    rad = 1 + .12 * np.sin(ang * 3 + seed) + .08 * np.sin(ang * 5 + seed * 2)
    m = ((xx - w / 2) / (w / 2 - 1)) ** 2 + ((yy - h * .55) / (h * .45)) ** 2 < rad ** 2
    m &= yy < h - 1
    return shade_mask(m, ROCK, rim=.3, seed=seed)


def obsidian(seed, w=22, h=26):
    r = np.random.RandomState(seed)
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    for _ in range(r.randint(2, 4)):
        cx, ch, cw, ln = r.randint(min(6, w // 2 - 1), max(7, w - 6)), r.randint(h // 2, h - 2), r.randint(6, 10), r.uniform(-.25, .25)
        base = h - 1
        tip = (cx + ln * ch, base - ch)
        d.polygon([(cx - cw / 2, base), (cx, base - 2), tip], fill=OBS[3])
        d.polygon([(cx, base - 2), (cx + cw / 2, base), tip], fill=OBS[1])
        d.line([(cx, base - 2), tip], fill=OBS[5])
        d.point([(tip[0], tip[1] + 2)], fill=OBS[6])
        d.line([(cx - cw / 2, base), (cx + cw / 2, base)], fill=(150, 60, 24))
    return im


def columns(seed, n=4, hmax=46):
    """aglomerado de colunas hexagonais de basalto"""
    r = np.random.RandomState(seed)
    w, h = n * 9 + 6, hmax
    A = Image.new("RGBA", (w, h))
    order = list(range(n))
    tops = [r.randint(2, hmax // 2) for _ in order]
    for k in order:
        x, top, cw = 3 + k * 9 + r.randint(-1, 2), tops[k], 9
        m = np.zeros((h, w), bool)
        m[top + 3:h - 1, x:x + cw] = True
        yy, xx = np.mgrid[0:h, 0:w]
        v = np.where(xx < x + 3, .6, np.where(xx < x + 6, .4, .22)) + (fbm(h, w, seed * 7 + k, ((4, .6), (2, .4))) - .5) * .25
        v = v + np.clip((yy - (h - 12)) / 12, 0, 1) * .2
        face = np.zeros((h, w, 4), np.uint8)
        face[..., :3] = ramp(FACE, np.clip(v, 0, 1), yy, xx)
        face[..., 3] = m * 255
        for y2 in range(top + 8, h - 4, r.randint(6, 10)):
            face[y2, x:x + cw, :3] = FACE[0]
            face[y2 + 1, x:x + cw, :3] = np.minimum(255, face[y2 + 1, x:x + cw, :3] * 1.3)
        im = Image.fromarray(face)
        d = ImageDraw.Draw(im)
        hexp = [(x + 2, top + 1), (x + cw - 3, top + 1), (x + cw - 1, top + 3), (x + cw - 3, top + 5), (x + 2, top + 5), (x, top + 3)]
        d.polygon(hexp, fill=ROCK[6])
        d.line(hexp[:3], fill=ROCK[8])
        d.line(hexp[3:] + [hexp[0]], fill=ROCK[3])
        d.line([(x, top + 3), (x, h - 2)], fill=FACE[0])
        d.line([(x + cw - 1, top + 3), (x + cw - 1, h - 2)], fill=FACE[0])
        A.alpha_composite(im)
    return A


def vent(seed):
    w, h = 22, 13
    yy, xx = np.mgrid[0:h, 0:w]
    m = ((xx - 11) / 10.5) ** 2 + ((yy - 7) / 5.8) ** 2 < 1
    im = shade_mask(m, ROCK, seed=seed)
    d = ImageDraw.Draw(im)
    d.ellipse((6, 4, 16, 9), fill=(18, 14, 14))
    d.ellipse((8, 5, 14, 8), fill=(170, 64, 20))
    d.point([(11, 6)], fill=(255, 200, 90))
    return im


def sulfur(seed):
    r = np.random.RandomState(seed)
    im = Image.new("RGBA", (18, 12))
    d = ImageDraw.Draw(im)
    for _ in range(6):
        x, y, s = r.randint(2, 15), r.randint(5, 10), r.randint(2, 4)
        d.polygon([(x - s, y + 1), (x, y - s - 1), (x + s, y + 1)], fill=SULF[r.randint(1, 3)])
        d.point([(x, y - s)], fill=SULF[3])
    return im


def stump(seed):
    im = Image.new("RGBA", (24, 34))
    d = ImageDraw.Draw(im)
    d.polygon([(8, 33), (16, 33), (15, 14), (13, 7), (11, 11), (9, 15)], fill=(26, 20, 18))
    d.line([(9, 32), (9, 15), (11, 11)], fill=(60, 46, 40))
    d.line([(14, 16), (20, 9), (21, 5)], fill=(30, 22, 20), width=2)
    d.line([(10, 18), (3, 11)], fill=(30, 22, 20), width=2)
    for p in [(20, 9), (4, 12), (13, 8)]:
        d.point([p], fill=(235, 110, 40))
    return im


def lava_pool(seed, w=46, h=24):
    yy, xx = np.mgrid[0:h, 0:w]
    rr = 1 + (fbm(h, w, seed, ((6, 1.),)) - .5) * .5
    m = ((xx - w / 2) / (w / 2 - 2)) ** 2 + ((yy - h / 2) / (h / 2 - 2)) ** 2 < rr
    heat = np.clip(1 - ndimage.distance_transform_edt(~m) * 0, 0, 1)
    v = np.clip(.55 + (fbm(h, w, seed + 1, ((5, .6), (2, .4))) - .5) * .9, 0, 1)
    a = np.zeros((h, w, 4), np.uint8)
    a[..., :3] = ramp(LAVA, v, yy, xx)
    a[..., 3] = m * 255
    rim = ndimage.binary_dilation(m, iterations=2) & ~m
    a[rim, :3] = (34, 16, 12)
    a[rim, 3] = 255
    e = m & ~ndimage.binary_erosion(m)
    a[e, :3] = (120, 36, 12)
    return Image.fromarray(a)


def barrier(horizontal):
    """obsidiana que brota do chão quando a passagem se tranca"""
    w, h = (64, 46) if horizontal else (36, 76)
    im = Image.new("RGBA", (w, h))
    spots = [(2, 18), (18, 12), (32, 20), (44, 14)] if horizontal else [(2, 2), (6, 22), (0, 42), (8, 52)]
    for k, (x, y) in enumerate(spots):
        o = obsidian(100 + k, 22, 30)
        im.alpha_composite(o, (min(x, w - o.width), min(y, h - o.height)))
    return im


PROPS = {}
for k in range(5):
    PROPS[f"vc-boulder{k + 1}"] = boulder(k, [26, 22, 34, 18, 30][k], [18, 15, 22, 12, 20][k])
for k in range(3):
    PROPS[f"vc-obsidian{k + 1}"] = obsidian(10 + k, 22 + k * 3, 26 + k * 4)
for k in range(3):
    PROPS[f"vc-columns{k + 1}"] = columns(20 + k, 3 + k, 40 + k * 8)
PROPS["vc-bigcolumns"] = columns(30, 7, 70)
PROPS["vc-vent"] = vent(40)
PROPS["vc-sulfur"] = sulfur(41)
PROPS["vc-stump"] = stump(42)
PROPS["vc-lavapool"] = lava_pool(43)
PROPS["vc-lavapool2"] = lava_pool(44, 34, 18)
os.makedirs(OUT, exist_ok=True)
for k, im in PROPS.items():
    im.save(os.path.join(OUT, k + ".png"))
barrier(True).save(os.path.join(OUT, "vc-thorn-h.png"))
barrier(False).save(os.path.join(OUT, "vc-thorn-v.png"))

# ═════════════════════════════ layout ═════════════════════════════
R = lambda x, y, w, h: {"x": x, "y": y, "w": w, "h": h}
ROOMS = [
    dict(id="vulcao-encosta", name="Encosta de Cinzas", rect=R(32, 50, 17, 12), ambient=.2),
    dict(id="vulcao-campo", name="Campo de Basalto", rect=R(28, 37, 25, 10), ambient=.22),
    dict(id="vulcao-fumarolas", name="Fumarolas", rect=R(4, 40, 18, 14), ambient=.22),
    dict(id="vulcao-ponte", name="Ponte de Obsidiana", rect=R(27, 19, 27, 13), ambient=.24),
    dict(id="vulcao-forja", name="Forja Soterrada", rect=R(3, 18, 19, 15), ambient=.24),
    dict(id="vulcao-colunas", name="Colunas Negras", rect=R(60, 18, 17, 17), ambient=.26),
    dict(id="vulcao-fenda", name="Fenda Ardente", rect=R(60, 43, 16, 12), ambient=.26),
    dict(id="vulcao-caldeira", name="Caldeira", rect=R(24, 1, 32, 14), ambient=.3, final=True,
         boss="MAGMA_TITAN", banner="CALDEIRA DO VULCÃO", zoom=.85),
]
CORR = [
    [(40, 55), (40, 52), (41, 49), (40, 45)],
    [(40, 40), (39, 37), (40, 33), (40, 29)],
    [(30, 26), (26, 26), (22, 27), (18, 27)],
    [(51, 26), (55, 26), (59, 27), (63, 27)],
    [(11, 32), (11, 36), (12, 40), (11, 45)],
    [(68, 33), (68, 37), (67, 41), (68, 47)],
    [(11, 22), (11, 15), (13, 8), (18, 6), (24, 7), (29, 7)],
    [(68, 22), (68, 15), (66, 8), (61, 6), (56, 7), (52, 7)],
]
DOORS = [
    ("porta-vulcao-campo", "h", 40, 48, ["vulcao-encosta", "vulcao-campo"]),
    ("porta-vulcao-ponte", "h", 39, 34, ["vulcao-campo", "vulcao-ponte"]),
    ("porta-vulcao-forja", "v", 24, 26, ["vulcao-ponte", "vulcao-forja"]),
    ("porta-vulcao-colunas", "v", 57, 26, ["vulcao-ponte", "vulcao-colunas"]),
    ("porta-vulcao-fumarolas", "h", 11, 37, ["vulcao-forja", "vulcao-fumarolas"]),
    ("porta-vulcao-fenda", "h", 67, 39, ["vulcao-colunas", "vulcao-fenda"]),
    ("porta-vulcao-caldeira-w", "h", 11, 16, ["vulcao-forja", "vulcao-caldeira"]),
    ("porta-vulcao-caldeira-e", "h", 67, 16, ["vulcao-colunas", "vulcao-caldeira"]),
]
SPAWN = {"col": 40, "row": 58}
# rios de lava (polilinhas em tiles, meia-largura em tiles) — onde não há chão, viram fendas
RIVERS = [
    ([(0, 34.5), (10, 35.5), (20, 34), (30, 35), (40, 34.2), (50, 35.2), (60, 34), (70, 35.5), (80, 34.5)], 2.4),
    ([(55, 0), (56, 8), (55.5, 16), (56.5, 26), (55.5, 34)], 2.2),
    ([(0, 12), (6, 13), (12, 12.5), (20, 14), (23, 15)], 1.8),
    ([(80, 50), (74, 49), (66, 50.5), (58, 49), (52, 50)], 2.0),
]
LAKES = [R(31, 2, 18, 3), R(7, 44, 5, 3), R(66, 22, 4, 3), R(64, 47, 6, 3)]

E = lambda t, c, r, **k: dict(type=t, col=c, row=r, **k)
S = lambda tex, c, r, bw=14, bh=10, **k: dict(type="sprite", tex=tex, col=c, row=r, solid=True, bw=bw, bh=bh, **k)
FLAT = lambda tex, c, r, **k: dict(type="sprite", tex=tex, col=c, row=r, flat=True, **k)
CONTENT = {
    "vulcao-encosta": dict(enemies=[], decor=[
        S("vc-boulder3", 35, 53, 30, 12), S("vc-columns1", 46, 52, 26, 10), S("vc-stump", 36, 59), FLAT("vc-sulfur", 44, 57),
        S("vc-vent", 45, 59, 18, 8, light="TORCH"), S("vc-obsidian1", 34, 57, 14, 8)]),
    "vulcao-campo": dict(enemies=[E("FIRE_ELEMENTAL", 33, 40), E("DEMON", 46, 41), E("DRAGON_WYRMLING", 49, 39), E("DEMON", 36, 44)], decor=[
        S("vc-columns2", 30, 39, 30, 10), S("vc-boulder1", 50, 44, 22, 10), S("vc-obsidian2", 44, 38, 16, 8),
        S("vc-boulder5", 31, 45, 26, 10), FLAT("vc-lavapool2", 42, 43), S("vc-stump", 38, 38)]),
    "vulcao-fumarolas": dict(lake=LAKES[1], enemies=[
        E("FIRE_ELEMENTAL", 15, 43, elite=True, affixes=["TOUGH"]), E("DEMON_CASTER", 8, 50), E("DRAGON_WYRMLING", 17, 50)],
        decor=[S("vc-vent", 6, 42, 18, 8, light="TORCH"), S("vc-vent", 14, 48, 18, 8, light="TORCH"), S("vc-vent", 18, 44, 18, 8),
               FLAT("vc-sulfur", 7, 49), FLAT("vc-sulfur", 15, 47), FLAT("vc-sulfur", 19, 45), S("vc-boulder2", 5, 51, 20, 10),
               dict(type="chest", col=12, row=51, solid=True)]),
    "vulcao-ponte": dict(enemies=[E("DRAGON_DRAKE", 45, 23, elite=True, affixes=["VAMPIRIC"]), E("FIRE_ELEMENTAL", 32, 28),
                                  E("DEMON_CASTER", 49, 29), E("DRAGON_WYRMLING_SHADOW", 41, 29)],
                         decor=[S("vc-columns3", 30, 21, 32, 10), S("vc-obsidian3", 50, 21, 18, 8), S("vc-boulder3", 29, 30, 30, 12),
                                FLAT("vc-lavapool", 46, 26), S("vc-stump", 52, 30)]),
    "vulcao-forja": dict(enemies=[E("ORC_WARRIOR", 12, 24, elite=True, affixes=["TOUGH"]), E("DEMON", 7, 29), E("FIRE_ELEMENTAL", 17, 29),
                                  E("DEMON_CASTER", 6, 21)],
                         decor=[dict(type="brazier", col=8, row=21, solid=True), dict(type="brazier", col=16, row=21, solid=True),
                                S("vc-columns2", 5, 26, 30, 10), S("vc-boulder4", 18, 24, 16, 8), FLAT("vc-lavapool2", 12, 28),
                                dict(type="chest", col=12, row=20, solid=True), S("vc-obsidian1", 19, 31, 14, 8)]),
    "vulcao-colunas": dict(lake=LAKES[2], enemies=[E("DRAGON_WYRMLING", 63, 26), E("DRAGON_DRAKE", 72, 30), E("DEMON", 68, 21),
                                                    E("FIRE_ELEMENTAL", 73, 22)],
                           decor=[S("vc-bigcolumns", 63, 21, 60, 14), S("vc-columns1", 74, 26, 26, 10), S("vc-columns3", 67, 30, 32, 10),
                                  S("vc-obsidian2", 62, 32, 16, 8), FLAT("vc-sulfur", 70, 33), dict(type="trap-spikes", col=65, row=31),
                                  dict(type="trap-spikes", col=71, row=25)]),
    "vulcao-fenda": dict(lake=LAKES[3], enemies=[E("ORC_WARRIOR", 68, 45, elite=True, affixes=["TOUGH"]), E("DEMON_CASTER", 62, 51),
                                                  E("FIRE_ELEMENTAL", 73, 52)],
                         decor=[dict(type="chest", col=73, row=45, solid=True), S("vc-boulder5", 62, 45, 26, 10), S("vc-obsidian3", 74, 50, 18, 8),
                                S("vc-vent", 66, 52, 18, 8, light="TORCH"), FLAT("vc-sulfur", 69, 53)]),
    "vulcao-caldeira": dict(lake=LAKES[0], enemies=[E("FIRE_ELEMENTAL", 30, 10), E("FIRE_ELEMENTAL", 50, 10), E("DEMON", 41, 12)],
                            decor=[dict(type="statue-fire", col=33, row=7), dict(type="statue-fire", col=47, row=7),
                                   dict(type="brazier", col=30, row=12, solid=True), dict(type="brazier", col=52, row=12, solid=True),
                                   S("vc-columns2", 26, 5, 30, 10), S("vc-columns3", 53, 5, 32, 10), S("vc-obsidian3", 37, 12, 18, 8)]),
}


# ═════════════════════════════ grade orgânica ═════════════════════════════
def tnoise(shape, cell, seed):
    rs = np.random.RandomState(seed)
    g = rs.rand(shape[0] // cell + 3, shape[1] // cell + 3)
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
nz = tnoise((ROWS, COLS), 4, 3)
for rm in ROOMS:
    q = rm["rect"]
    cx, cy = q["x"] + q["w"] / 2 - .5, q["y"] + q["h"] / 2 - .5
    a, b = q["w"] / 2, q["h"] / 2
    for r in range(q["y"], q["y"] + q["h"]):
        for c in range(q["x"], q["x"] + q["w"]):
            d = ((abs(c - cx) / a) ** 2.6 + (abs(r - cy) / b) ** 2.6) ** (1 / 2.6)
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
for lk in LAKES:
    lake_tiles |= {(c, r) for r in range(lk["y"], lk["y"] + lk["h"]) for c in range(lk["x"], lk["x"] + lk["w"])}
walk = ndimage.binary_closing(walk, structure=np.ones((2, 2)), iterations=1) | walk
for (c, r) in lake_tiles:
    walk[r, c] = False
necks(walk)
walk[0, :] = walk[-1, :] = walk[:, 0] = walk[:, -1] = False

# zonas de lava (em tiles)
lavaT = np.zeros((ROWS, COLS), bool)
for pl, hw in RIVERS:
    for (x0, y0), (x1, y1) in zip(pl, pl[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 4) + 1
        for i in range(n + 1):
            x, y = x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n
            for r in range(int(y - hw - 1), int(y + hw + 2)):
                for c in range(int(x - hw - 1), int(x + hw + 2)):
                    if 0 <= r < ROWS and 0 <= c < COLS and (c - x) ** 2 + (r - y) ** 2 <= hw * hw:
                        lavaT[r, c] = True
for (c, r) in lake_tiles:
    lavaT[r, c] = True
bridgeT = lavaT & walk          # chão que cruza um rio = ponte
lavaT &= ~walk

used = set()


def snap(o, room_rect, clearance):
    best = None
    for r in range(room_rect["y"], room_rect["y"] + room_rect["h"]):
        for c in range(room_rect["x"], room_rect["x"] + room_rect["w"]):
            ok = all(0 <= c + dx < COLS and 0 <= r + dy < ROWS and walk[r + dy, c + dx] and not bridgeT[r + dy, c + dx]
                     for dy in range(-clearance, clearance + 1) for dx in range(-clearance, clearance + 1))
            if ok and (c, r) not in used:
                d = (c - o["col"]) ** 2 + (r - o["row"]) ** 2
                if best is None or d < best[0]:
                    best = (d, c, r)
    assert best, o
    o["col"], o["row"] = best[1], best[2]
    used.add((o["col"], o["row"]))


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
bridgeT &= walk

rooms_out = []
for rm in ROOMS:
    q = rm["rect"]
    ct = CONTENT[rm["id"]]
    for o in ct["enemies"]:
        snap(o, q, 1)
    for o in ct["decor"]:
        big = o.get("tex") in ("vc-bigcolumns",)
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

# ═════════════════════════════ pintura (vista 3/4) ═════════════════════════════
print("pintando…")
yy, xx = np.mgrid[0:H, 0:W]
up = lambda m: np.kron(m.astype(np.float32), np.ones((T, T), np.float32))
pn = ndimage.zoom(tnoise((H // 16 + 4, W // 16 + 4), 3, 5), 16, order=1)[:H, :W]
WM = (ndimage.gaussian_filter(up(~walk), 12) + pn * .16) > .5
LZ = (ndimage.gaussian_filter(up(lavaT), 16) + (fbm(H, W, 91, ((96, .6), (32, .4))) - .5) * .5 + pn * .1) > .5
BR = up(bridgeT) > .5
CM = WM & LZ                      # fendas de lava (nível baixo)
PM = WM & ~CM                     # platôs (nível alto)
# remove fiapos
PM = ndimage.binary_opening(PM, structure=np.ones((5, 5)))
CM = WM & ~PM
FACEH, CFACE = 40, 34
below = np.zeros_like(PM)
below[:-FACEH] = PM[FACEH:]
FM = PM & ~below                  # face do platô (parte de baixo)
TOP = PM & ~FM
above = np.zeros_like(CM)
above[CFACE:] = CM[:-CFACE]
FC = CM & ~above                  # face da fenda (parede de cima, vista de frente)
LV = CM & ~FC                     # lava
FLOOR = ~WM


def run_len(mask):
    """quantos pixels da mesma máscara existem logo acima (para posicionar textura das faces)"""
    out = np.zeros(mask.shape, np.int32)
    for y in range(1, mask.shape[0]):
        out[y] = np.where(mask[y], out[y - 1] + 1, 0)
    return out


n1, n2 = fbm(H, W, 1), fbm(H, W, 2)
tex = fbm(H, W, 7, ((20, .4), (6, .35), (2, .25)))
img = np.zeros((H, W, 3), np.float32)

# — chão: basalto, cinzas, cascalho, rachaduras secas
rope = np.sin((yy * .9 + np.sin(xx / 9. + n1 * 6) * 5 + n2 * 20) * 1.1)
flowz = fbm(H, W, 77, ((60, 1.),)) > .6
bump = ndimage.gaussian_filter(tex, 1) + rope * .02 * flowz
gy, gx = np.gradient(bump)
lit = np.clip(.5 - (gx * -.6 + gy * -.8) * 9, 0, 1)
v = np.clip(.2 + lit * .45 + tex * .35, 0, 1)
ground = ramp(ROCK, v, yy, xx)
ashn = fbm(H, W, 11, ((30, .5), (9, .3), (3, .2)))
ash = (ashn > .6) & (nrs.rand(H, W) < np.clip((ashn - .6) * 6, 0, .85))
ground[ash] = ground[ash] * .55 + ramp(ASH, np.clip(v[ash] * .8, 0, 1), yy[ash], xx[ash]) * .45
# rachaduras (voronoi deformado), algumas incandescentes perto da lava
pts = nrs.rand(2600, 2) * [W, H]
sel = FLOOR | TOP
q_pts = np.stack([xx[sel] + (n1[sel] - .5) * 20, yy[sel] + (n2[sel] - .5) * 20], 1)
dd, _ = cKDTree(pts).query(q_pts, k=2)
ee = np.full((H, W), 99., np.float32)
ee[sel] = dd[:, 1] - dd[:, 0]
crk = (ee < .9) & (fbm(H, W, 16, ((14, 1.),)) > .45)
ground[crk] *= .45
crk2 = np.roll(crk, 1, 0) & ~crk
ground[crk2] = np.minimum(255, ground[crk2] * 1.25)
peb = nrs.rand(H, W) > .985
ground[peb] = np.array(ROCK[7])
peb2 = (np.roll(peb, 1, 0) | np.roll(peb, 1, 1)) & ~peb
ground[peb2] *= .6
distLV = ndimage.distance_transform_edt(~LV)
hotc = crk & (distLV < 70) & (fbm(H, W, 18, ((20, 1.),)) > .48) & FLOOR
img[:] = ground

# — platô: um pouco mais claro e frio + lábio
top = ground * .78 + np.array([2, 3, 6])
img[TOP] = top[TOP]
# cascalho grosso no platô (terreno áspero, não caminhável)
rub = Image.new("RGBA", (W, H))
dr = ImageDraw.Draw(rub)
ty, tx = np.nonzero(TOP & (nrs.rand(H, W) < 1 / 70))
for y, x in zip(ty, tx):
    r = rnd.randint(1, 3)
    c = ROCK[rnd.randint(3, 5)]
    dr.ellipse((x - r - 1, y - r, x + r + 1, y + r), fill=c + (255,))
    dr.point([(x - r, y - r + 1)], fill=ROCK[7] + (255,))
    dr.line([(x - r, y + r + 1), (x + r + 1, y + r + 1)], fill=ROCK[0] + (200,))
ra = np.asarray(rub).astype(np.float32)
am = (ra[..., 3:] / 255) * TOP[..., None]
img = img * (1 - am) + ra[..., :3] * am
lipT = TOP & ndimage.binary_dilation(FM, iterations=2)
img[lipT] = np.minimum(255, img[lipT] * 1.45 + 10)
edgeT = TOP & ~ndimage.binary_erosion(TOP, iterations=1)
img[edgeT] = img[edgeT] * .4

# — faces (colunas de basalto)
colx = np.zeros(W, int)
acc = ci = 0
while acc < W:
    w = rnd.randint(3, 9)
    colx[acc:acc + w] = ci
    acc += w
    ci += 1
colw = np.bincount(colx, minlength=ci)
colst = np.zeros(ci, int)
for x in range(W - 1, -1, -1):
    colst[colx[x]] = x
csh = nrs.uniform(-.14, .14, ci)
cbr, cfr = nrs.randint(0, 9, ci), nrs.randint(7, 15, ci)
CX = colx[None, :].repeat(H, 0)
FX = (xx - colst[CX]) / np.maximum(1, colw[CX] - 1)
EDGEC = np.zeros((H, W), bool)
EDGEC[:, 1:] = colx[1:] != colx[:-1]


def faces(mask, height, uplit):
    j = run_len(mask)
    t = np.clip(j / height, 0, 1)
    vv = .5 - t * .25 + csh[CX] + (.5 - FX) * .32 + (tex - .5) * .25
    vv = vv + (j < 2) * .28 - EDGEC * .35
    ring = (j + cbr[CX]) % cfr[CX]
    vv = vv - (ring == 0) * .22 + (ring == 1) * .08
    c = ramp(FACE, np.clip(vv, 0, 1), yy, xx)
    if uplit:
        u = np.clip((t - .2) / .8, 0, 1) ** 1.4
        c = c * (1 - u[..., None] * .25) + np.array([235, 90, 24]) * (u[..., None] * .8)
    return c


fp = faces(FM, FACEH, False)
img[FM] = fp[FM]
fc = faces(FC, CFACE, True)
img[FC] = fc[FC]
# oclusão ao pé dos platôs
foot = np.zeros((H, W), np.float32)
for k in range(1, 16):
    sh = np.zeros_like(FM)
    sh[k:] = FM[:-k]
    foot = np.maximum(foot, (sh & FLOOR) * (1 - k / 16))
img[FLOOR] *= (1 - foot[FLOOR, None] * .55)

# — lava: correnteza horizontal, crosta, veios, bolhas
lsel = LV
f = fbm(H, W, 21, ((60, .5), (22, .3), (9, .2)))
wx = xx * .45 + (f - .5) * 30
wy = yy * 1.4 + (fbm(H, W, 22) - .5) * 12
lp = nrs.rand(9000, 2) * [W * .45 + 40, H * 1.4 + 20]
d2, _ = cKDTree(lp).query(np.stack([wx[lsel], wy[lsel]], 1), k=2)
e2 = np.full((H, W), 99., np.float32)
e2[lsel] = d2[:, 1] - d2[:, 0]
heat = np.clip(1 - e2 / 8, 0, 1) * .75 + fbm(H, W, 23, ((14, .6), (5, .4))) * .5
inner = ndimage.distance_transform_edt(LV)
heat = heat * np.clip(inner / 7, .45, 1)
lav = ramp(LAVA, np.clip(heat, 0, 1), yy, xx)
crust = (e2 > 3.4) & (fbm(H, W, 25, ((12, .7), (4, .3))) < .47) & (inner > 3) & LV
cr = ramp(FACE, np.clip(.15 + tex * .4, 0, 1), yy, xx)
lav[crust] = cr[crust]
ce = crust & ~ndimage.binary_erosion(crust)
lav[ce] = (190, 64, 18)
img[LV] = lav[LV]
bub = (nrs.rand(H, W) > .9985) & LV & ~crust
for y, x in zip(*np.nonzero(bub)):
    img[max(0, y - 1):y + 2, max(0, x - 1):x + 2] = (255, 200, 90)
    img[y, x] = (255, 250, 220)
# margem sul da lava: crosta preta + borda acesa
rimA = ndimage.binary_dilation(LV, iterations=4) & FLOOR
rimB = ndimage.binary_dilation(LV, iterations=1) & FLOOR
img[rimA] = img[rimA] * .4 + np.array(FACE[0]) * .6
img[rimB] = (110, 30, 12)
img[hotc] = (236, 110, 30)

# — pontes de basalto sobre a lava (chão caminhável dentro de um rio)
BRp = BR & FLOOR
if BRp.any():
    bc = ramp(FACE, np.clip(.45 + (tex - .5) * .4, 0, 1), yy, xx)
    img[BRp] = bc[BRp]
    for y in range(0, H, 9):
        row = BRp[y]
        img[y, row] = np.array(FACE[1])
    be = BRp & ~ndimage.binary_erosion(BRp, iterations=2)
    img[be] = np.array(FACE[6])
    # abaixo da ponte (visto de frente): a borda sul da ponte
    bf = np.zeros_like(BRp)
    for k in range(1, 7):
        s2 = np.zeros_like(BRp)
        s2[k:] = BRp[:-k]
        bf |= s2 & LV
    img[bf] = img[bf] * .2 + np.array(FACE[2]) * .8
emis = LV | hotc
canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

# ═════════════════════════════ adereços sobre o mapa ═════════════════════════════
front, occ = [], []
distP = ndimage.distance_transform_edt(PM)


def free(b, pad=4):
    return all(b[2] + pad < o[0] or b[0] - pad > o[2] or b[3] + pad < o[1] or b[1] - pad > o[3] for o in occ)


def place(k, x, y, as_front):
    im = PROPS[k]
    b = (x - im.width // 2, y - im.height, x + im.width // 2, y)
    if not free(b):
        return False
    occ.append(b)
    if as_front:
        front.append([int(x), int(y), k])
    else:
        s2 = Image.new("RGBA", (im.width + 20, 24))
        ImageDraw.Draw(s2).ellipse((6, 4, im.width + 10, 20), fill=(0, 0, 0, 110))
        canvas.alpha_composite(s2.filter(ImageFilter.GaussianBlur(3)), (int(b[0] - 6), int(y - 16)))
        canvas.alpha_composite(im, (int(b[0]), int(b[1])))
    return True


def base_ok(x, y, im, need):
    x0, x1 = int(x - im.width * .38), int(x + im.width * .38)
    if x0 < 0 or x1 >= W or y >= H or y - 8 < 0 or y - im.height < 0:
        return False
    return all(TOP[int(y) - 6, q] and distP[int(y) - 6, q] >= need for q in (x0, int(x), x1))


for k, n in (("vc-bigcolumns", 10), ("vc-columns3", 16), ("vc-columns2", 16)):
    for _ in range(6000):
        if n <= 0:
            break
        im = PROPS[k]
        x, y = rnd.randrange(W), rnd.randrange(H)
        if base_ok(x, y, im, 60) and TOP[max(0, y - im.height + 8), x]:
            if place(k, x, y, False):
                n -= 1
EDGE = [("vc-boulder1", 5), ("vc-boulder2", 5), ("vc-boulder3", 4), ("vc-boulder4", 5), ("vc-boulder5", 4),
        ("vc-obsidian1", 3), ("vc-obsidian2", 3), ("vc-obsidian3", 2), ("vc-columns1", 4), ("vc-columns2", 3), ("vc-stump", 2)]
ek, ew = zip(*EDGE)
cand = np.argwhere(TOP & (distP > 10) & (distP < 30))
nrs.shuffle(cand)
for y, x in cand[:9000]:
    k = rnd.choices(ek, ew)[0]
    if base_ok(x, y, PROPS[k], 8):
        place(k, x, y, True)
for _ in range(7000):
    k = rnd.choices(ek, ew)[0]
    x, y = rnd.randrange(W), rnd.randrange(H)
    if base_ok(x, y, PROPS[k], 50):
        place(k, x, y, False)
# miudezas no chão
small = [boulder(200 + i, 8 + i % 3 * 2, 6 + i % 2 * 2) for i in range(6)] + [sulfur(300), obsidian(301, 16, 14)]
for _ in range(520):
    im = rnd.choice(small)
    x, y = rnd.randrange(W - 40), rnd.randrange(H - 40)
    if walk[y // T, x // T] and walk[(y + im.height) // T, (x + im.width) // T] and FLOOR[y, x] and FLOOR[y + im.height, x + im.width] \
            and not BR[y, x] and distLV[y, x] > 12:
        canvas.alpha_composite(im, (x, y))
# fumarolas com vapor nos platôs e pocinhas de enxofre
steam = Image.new("RGBA", (34, 56))
sa = np.zeros((56, 34, 4), np.float32)
sy, sx = np.mgrid[0:56, 0:34]
for k in range(10):
    cy2, cx2, rad = 50 - k * 5, 17 + math.sin(k * .7) * (2 + k * .5), 3 + k * .9
    sa[..., 3] = np.maximum(sa[..., 3], np.clip(1 - ((sx - cx2) ** 2 + (sy - cy2) ** 2) / (rad * rad), 0, 1) * (150 - k * 12))
sa[..., :3] = (210, 206, 202)
steam = Image.fromarray(sa.astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))
for _ in range(60):
    x, y = rnd.randrange(40, W - 40), rnd.randrange(60, H - 20)
    if FLOOR[y, x] and walk[y // T, x // T] and distLV[y, x] > 40 and free((x - 11, y - 6, x + 11, y + 6), 2):
        occ.append((x - 11, y - 6, x + 11, y + 6))
        canvas.alpha_composite(PROPS["vc-vent"], (x - 11, y - 6))
        canvas.alpha_composite(steam, (x - 17, y - 52))
        sp = PROPS["vc-sulfur"]
        canvas.alpha_composite(sp, (x - 18, y + 2))

# ═════════════════════════════ luz ═════════════════════════════
print("iluminando…")
arr = np.asarray(canvas).astype(np.float32)[..., :3]
em = emis.astype(np.float32)
small_em = np.asarray(Image.fromarray((em * 255).astype(np.uint8)).resize((W // 4, H // 4), Image.BILINEAR), np.float32) / 255
g_big = ndimage.gaussian_filter(small_em, 7)
g_big = np.asarray(Image.fromarray(np.clip(g_big * 255, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32) / 255
g_small = ndimage.gaussian_filter(em, 4)
glow = g_big * 2.4 + g_small * .8
light = np.clip(.66 + glow[..., None] * np.array([1.25, .62, .32]), 0, 1.9)
out = arr * light
out[emis] = arr[emis]
canvas = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")

for cy in range(math.ceil(H / CH)):
    for cx in range(math.ceil(W / CH)):
        canvas.crop((cx * CH, cy * CH, cx * CH + CH, cy * CH + CH)).save(os.path.join(OUT, f"vcb-{cx}-{cy}.png"), optimize=True)
front.sort(key=lambda f: f[1])
json.dump({"chunk": CH, "cols": math.ceil(W / CH), "rows": math.ceil(H / CH), "front": front},
          open(os.path.join(OUT, "vcb-meta.json"), "w"))
prev = canvas.convert("RGBA")
for x, y, k in front:
    im = PROPS[k]
    prev.alpha_composite(im, (x - im.width // 2, y - im.height))
prev.resize((W // 2, H // 2), Image.LANCZOS).convert("RGB").save(os.path.join(ROOT, "scripts", "volcano_preview.png"))
prev.convert("RGB").save(os.path.join(ROOT, "scripts", "volcano_full.png"))
json.dump({"world": {"cols": COLS, "rows": ROWS}, "rooms": rooms_out, "corridors": corridors, "doors": doors, "spawn": SPAWN,
           "props": sorted(PROPS) + ["vc-thorn-h", "vc-thorn-v"]},
          open(os.path.join(ROOT, "scripts", "volcano_level.json"), "w"), ensure_ascii=False, indent=1)
print("ok", len(front), "props na borda", len(corridors), "corredores")
