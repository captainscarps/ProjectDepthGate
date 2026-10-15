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
    """bloco de obsidiana: vidro preto lascado, facetas largas, reflexo discreto"""
    r = np.random.RandomState(seed)
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    n = r.randint(2, 4)
    for i in range(n):
        cw = r.randint(max(7, w // 3), max(8, w // 2 + 2))
        cx = int(w * (i + .5) / n + r.randint(-2, 3))
        ch = r.randint(h // 2, h - 1)
        base = h - 1
        tip = (cx + r.randint(-3, 4), base - ch)
        L, Rr = (cx - cw / 2, base), (cx + cw / 2, base)
        mid = (cx + r.randint(-1, 2), base - ch * .45)
        d.polygon([L, mid, tip], fill=OBS[3])
        d.polygon([L, mid, (cx, base)], fill=OBS[2])
        d.polygon([mid, Rr, tip], fill=OBS[1])
        d.polygon([(cx, base), Rr, mid], fill=OBS[0])
        d.line([mid, tip], fill=OBS[4])
        d.line([L, (cx, base), Rr], fill=(120, 44, 18))
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
    w, h = 20, 12
    yy0, xx0 = np.mgrid[0:h, 0:w]
    n0 = vnoise(h, w, 3, seed)
    m = (((xx0 - w / 2) / (w / 2)) ** 2 + ((yy0 - h / 2) / (h / 2)) ** 2 < .9 + (n0 - .5) * .6)
    v = np.clip(.25 + n0 * .8 - ((xx0 - w / 2) ** 2 + (yy0 - h / 2) ** 2) / (w * w / 4) * .4, 0, 1)
    a0 = np.zeros((h, w, 4), np.uint8)
    a0[..., :3] = ramp(SULF, v, yy0, xx0)
    a0[..., 3] = (m * np.clip(.35 + v, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(a0)


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
    """muro de blocos de basalto que sobe do chão quando a passagem se tranca"""
    w, h = (68, 44) if horizontal else (38, 78)
    im = Image.new("RGBA", (w, h))
    spots = [(0, 16, 26, 26), (20, 10, 28, 32), (42, 16, 26, 26)] if horizontal else [(2, 0, 34, 26), (0, 22, 38, 30), (2, 48, 34, 28)]
    for k, (x, y, bw, bh) in enumerate(spots):
        im.alpha_composite(boulder(600 + k, bw, bh), (x, y))
    d = ImageDraw.Draw(im)
    for k, (x, y, bw, bh) in enumerate(spots):
        cx, cy = x + bw // 2, y + bh // 2
        d.line([(cx - 4, cy - 2), (cx, cy + 1), (cx + 3, cy - 1), (cx + 5, cy + 3)], fill=(240, 110, 30))
        d.point([(cx, cy + 1)], fill=(255, 220, 120))
    return im


IRON = [(12, 12, 16), (24, 24, 30), (40, 40, 48), (60, 60, 70), (86, 86, 96), (120, 120, 130), (170, 170, 178)]
WOOD = [(28, 16, 10), (46, 28, 16), (66, 42, 24), (88, 58, 34), (112, 76, 44)]
CLOTH = [(40, 10, 12), (70, 16, 18), (104, 26, 24), (140, 40, 30)]
BONE = [(70, 60, 50), (120, 104, 86), (170, 152, 124), (212, 198, 168), (238, 230, 210)]


def poly_shade(size, polys, cols, rim=.2, seed=0):
    """polígonos → máscara sombreada com volume"""
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon(p, fill=255)
    return shade_mask(np.asarray(m) > 0, cols, rim=rim, seed=seed)


def anvil():
    w, h = 34, 24
    im = Image.new("RGBA", (w, h))
    stump = poly_shade((w, h), [[(9, 14), (25, 14), (26, 23), (8, 23)]], WOOD, seed=1)
    im.alpha_composite(stump)
    body = poly_shade((w, h), [[(1, 5), (6, 3), (28, 3), (32, 6), (26, 9), (22, 9), (21, 13), (24, 15), (10, 15), (13, 13), (12, 9), (6, 9)]], IRON, seed=2)
    im.alpha_composite(body)
    d = ImageDraw.Draw(im)
    d.line([(6, 3), (28, 3)], fill=IRON[6])
    d.line([(2, 5), (6, 4)], fill=IRON[5])
    d.point([(14, 2), (20, 2)], fill=(255, 170, 70))          # faíscas
    d.line([(26, 20), (31, 16)], fill=WOOD[3], width=2)        # cabo do martelo
    d.rectangle((29, 13, 33, 16), fill=IRON[3])
    return im


def forge():
    w, h = 50, 46
    im = Image.new("RGBA", (w, h))
    chim = poly_shade((w, h), [[(30, 0), (40, 0), (41, 18), (29, 18)]], ROCK, rim=.3, seed=3)
    im.alpha_composite(chim)
    body = poly_shade((w, h), [[(3, 44), (5, 22), (12, 13), (25, 10), (38, 13), (45, 22), (47, 44)]], ROCK, rim=.5, seed=4)
    im.alpha_composite(body)
    d = ImageDraw.Draw(im)
    for y in range(18, 44, 7):                                   # fiadas de pedra
        d.line([(6, y), (44, y)], fill=ROCK[1])
        for x in range(8 + (y // 7 % 2) * 5, 44, 10):
            d.line([(x, y), (x, y + 6)], fill=ROCK[1])
    d.ellipse((13, 24, 37, 44), fill=(20, 10, 8))                # boca
    d.ellipse((16, 30, 34, 44), fill=(170, 52, 14))
    d.ellipse((19, 34, 31, 44), fill=(250, 140, 34))
    d.ellipse((22, 37, 28, 43), fill=(255, 230, 150))
    d.rectangle((13, 42, 37, 45), fill=ROCK[2])
    d.line([(30, 0), (40, 0)], fill=ROCK[7])
    return im


def minecart():
    w, h = 38, 28
    im = Image.new("RGBA", (w, h))
    ore = Image.new("RGBA", (w, h))
    od = ImageDraw.Draw(ore)
    r = np.random.RandomState(5)
    for _ in range(9):
        x, y, s = r.randint(7, 30), r.randint(2, 8), r.randint(3, 5)
        od.ellipse((x - s, y - s + 2, x + s, y + s), fill=ROCK[r.randint(3, 6)])
        od.point([(x, y)], fill=(255, 150, 40))
    im.alpha_composite(ore)
    box = poly_shade((w, h), [[(3, 8), (35, 8), (31, 22), (7, 22)]], WOOD, seed=6)
    im.alpha_composite(box)
    d = ImageDraw.Draw(im)
    for x in (4, 34):
        d.line([(x, 8), (x + (3 if x < 10 else -3), 22)], fill=IRON[4], width=2)
    d.line([(3, 8), (35, 8)], fill=IRON[5])
    d.line([(6, 15), (32, 15)], fill=IRON[3])
    for cx in (11, 27):
        d.ellipse((cx - 4, 19, cx + 4, 27), fill=IRON[1], outline=IRON[4])
        d.point([(cx, 23)], fill=IRON[5])
    return im


def weapon_rack():
    w, h = 34, 36
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    d.rectangle((2, 10, 4, 35), fill=WOOD[2])
    d.rectangle((29, 10, 31, 35), fill=WOOD[1])
    d.rectangle((1, 9, 32, 12), fill=WOOD[3])
    d.line([(1, 9), (32, 9)], fill=WOOD[4])
    d.rectangle((1, 27, 32, 29), fill=WOOD[2])
    d.line([(9, 2), (9, 34)], fill=IRON[5], width=2)              # espada
    d.line([(6, 8), (12, 8)], fill=IRON[3], width=2)
    d.point([(9, 1)], fill=IRON[6])
    d.line([(17, 4), (17, 34)], fill=WOOD[3], width=2)            # machado
    d.polygon([(18, 4), (24, 2), (24, 11), (18, 9)], fill=IRON[4])
    d.line([(24, 2), (24, 11)], fill=IRON[6])
    d.line([(25, 0), (25, 34)], fill=WOOD[3])                     # lança
    d.polygon([(23, 3), (25, -1), (27, 3), (25, 6)], fill=IRON[5])
    return im


def banner():
    w, h = 18, 50
    im = Image.new("RGBA", (w, h))
    cloth = poly_shade((w, h), [[(3, 6), (15, 6), (15, 34), (13, 31), (11, 36), (9, 31), (7, 37), (5, 32), (3, 35)]], CLOTH, seed=7)
    d = ImageDraw.Draw(im)
    d.line([(9, 1), (9, 49)], fill=WOOD[1], width=2)
    d.line([(2, 5), (16, 5)], fill=WOOD[3], width=2)
    d.point([(9, 0)], fill=IRON[6])
    im.alpha_composite(cloth)
    d = ImageDraw.Draw(im)
    d.polygon([(9, 12), (12, 18), (9, 25), (6, 18)], fill=(230, 120, 30))   # brasão: chama
    d.polygon([(9, 15), (10.5, 18), (9, 22), (7.5, 18)], fill=(255, 220, 120))
    return im


def remains():
    w, h = 36, 16
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    d.ellipse((24, 4, 33, 12), fill=IRON[3])                      # elmo enferrujado
    d.arc((24, 4, 33, 12), 200, 340, fill=IRON[5])
    d.line([(26, 9), (31, 9)], fill=IRON[0])
    for k in range(4):                                             # costelas
        d.arc((10 + k * 3, 4, 16 + k * 3, 12), 180, 360, fill=BONE[3])
    d.line([(8, 9), (22, 9)], fill=BONE[2])
    d.line([(2, 11), (9, 9)], fill=BONE[3], width=2)
    d.line([(3, 14), (10, 11)], fill=BONE[2], width=2)
    d.ellipse((17, 10, 25, 15), fill=WOOD[2], outline=IRON[3])    # escudo
    d.point([(21, 12)], fill=IRON[5])
    return im


def sword_rock():
    w, h = 26, 34
    im = Image.new("RGBA", (w, h))
    rock = boulder(77, 26, 16)
    d = ImageDraw.Draw(im)
    d.line([(13, 2), (13, 22)], fill=IRON[5], width=2)
    d.line([(14, 4), (14, 22)], fill=IRON[3])
    d.line([(9, 6), (17, 6)], fill=(170, 130, 50), width=2)
    d.rectangle((12, 0, 14, 5), fill=WOOD[2])
    d.point([(13, 0)], fill=(220, 180, 70))
    im.alpha_composite(rock, (0, h - 16))
    return im


def fx_streak(col, w=34, h=5):
    a = np.zeros((h, w, 4), np.float32)
    yy2, xx2 = np.mgrid[0:h, 0:w]
    t = np.clip(1 - np.abs(xx2 - w / 2) / (w / 2), 0, 1) ** 1.3 * np.clip(1 - np.abs(yy2 - h / 2 + .5) / (h / 2), 0, 1) ** 1.5
    a[..., :3] = col
    a[..., 3] = t * 255
    return Image.fromarray(a.astype(np.uint8))


def fx_bubble():
    sh = Image.new("RGBA", (12 * 6, 12))
    for f, r in enumerate([1.5, 2.5, 3.5, 4.2, 0, -1]):
        d = ImageDraw.Draw(sh)
        cx = f * 12 + 6
        if r > 0:
            d.ellipse((cx - r, 6 - r, cx + r, 6 + r), fill=(120, 30, 10, 255), outline=(255, 200, 90, 255))
            d.point([(cx - 1, 5)], fill=(255, 245, 210, 255))
        elif r == 0:
            for dx, dy in [(-4, -2), (4, -2), (-3, 2), (3, 3), (0, -4)]:
                d.point([(cx + dx, 6 + dy)], fill=(255, 190, 80, 255))
            d.ellipse((cx - 2, 4, cx + 2, 8), outline=(200, 70, 20, 200))
    return sh


PROPS = {}
PROPS["vc-anvil"] = anvil()
PROPS["vc-forge"] = forge()
PROPS["vc-minecart"] = minecart()
PROPS["vc-rack"] = weapon_rack()
PROPS["vc-banner"] = banner()
PROPS["vc-remains"] = remains()
PROPS["vc-swordrock"] = sword_rock()
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
fx_streak((255, 226, 150), 48, 6).save(os.path.join(OUT, "vc-fx-streak.png"))
fx_streak((255, 130, 40), 26, 3).save(os.path.join(OUT, "vc-fx-streak2.png"))
fx_bubble().save(os.path.join(OUT, "vc-fx-bubble.png"))
for k in range(3):                      # placas de crosta que derivam com a correnteza
    w0, h0 = [9, 7, 12][k], [5, 4, 6][k]
    yy0, xx0 = np.mgrid[0:h0, 0:w0]
    rr0 = 1 + (vnoise(h0, w0, 2, 500 + k) - .5) * .6
    m0 = ((xx0 - w0 / 2 + .5) / (w0 / 2)) ** 2 + ((yy0 - h0 / 2 + .5) / (h0 / 2)) ** 2 < rr0
    a0 = np.zeros((h0, w0, 4), np.uint8)
    a0[..., :3] = FACE[1]
    a0[m0 & (yy0 < h0 / 2), :3] = FACE[3]
    a0[..., 3] = m0 * 255
    e0 = m0 & ~ndimage.binary_erosion(m0)
    a0[e0, :3] = (200, 70, 18)
    Image.fromarray(a0).save(os.path.join(OUT, f"vc-fx-crust{k + 1}.png"))

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
         boss="PALE_DRAGON", banner="CALDEIRA DO VULCÃO", zoom=.85),
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
    ([(0, 33.5), (5, 36), (10, 36.5), (15, 34), (20, 33), (25, 35.5), (30, 36), (35, 34), (40, 33.6), (45, 35.8), (50, 36),
      (55, 33.6), (60, 33), (65, 35.6), (70, 36.4), (75, 34), (80, 33.5)], 2.3),
    ([(55, 0), (57, 5), (56.5, 10), (54.5, 15), (55, 20), (57, 24), (56.5, 29), (55, 33)], 2.1),
    ([(0, 11), (4, 13.5), (8, 13.8), (12, 11.8), (16, 12.5), (20, 14.5), (23, 15)], 1.7),
    ([(80, 51), (76, 48.5), (71, 48.8), (66, 51), (61, 50.6), (56, 48.6), (52, 50)], 1.9),
]
LAKES = [R(31, 2, 18, 3), R(7, 44, 5, 3), R(66, 22, 4, 3), R(64, 47, 6, 3)]
# correntes rasas de magma no chão (dá pra pisar, mas queima) — polilinha em tiles, meia-largura em px
STREAMS = [
    ([(44, 36.6), (45.2, 39), (43.6, 41.4), (46, 43.8), (48.4, 46.2)], 7),
    ([(12, 21.4), (11, 24), (13, 26.6), (12, 29.4)], 6),
    ([(8.5, 47.2), (12, 49.2), (15.6, 50.4), (19, 52)], 6),
    ([(34, 31), (32.8, 28.4), (35, 25.8), (33.4, 22.6)], 6),
    ([(72.4, 19.6), (71, 23.4), (73.6, 27), (72, 31)], 6),
    ([(30.5, 5.6), (29.6, 8.4), (31.4, 11.6)], 5),
    ([(50.5, 5.6), (51.4, 8.4), (49.6, 11.6)], 5),
]

def smooth(pl, k=8):
    """Catmull-Rom: polilinha → curva suave"""
    P = [pl[0]] + list(pl) + [pl[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for j in range(k):
            t = j / k
            t2, t3 = t * t, t * t * t
            out.append(tuple(.5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2
                                   + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3) for a in (0, 1)))
    out.append(pl[-1])
    return out


RIVERS = [(smooth(pl), hw) for pl, hw in RIVERS]
STREAMS = [(smooth(pl), hw) for pl, hw in STREAMS]
E = lambda t, c, r, **k: dict(type=t, col=c, row=r, **k)
S = lambda tex, c, r, bw=14, bh=10, **k: dict(type="sprite", tex=tex, col=c, row=r, solid=True, bw=bw, bh=bh, **k)
FLAT = lambda tex, c, r, **k: dict(type="sprite", tex=tex, col=c, row=r, flat=True, **k)
CONTENT = {
    "vulcao-encosta": dict(enemies=[], decor=[
        S("vc-boulder3", 35, 53, 30, 12), S("vc-columns1", 46, 52, 26, 10), S("vc-stump", 36, 59), FLAT("vc-sulfur", 44, 57),
        S("vc-vent", 45, 59, 18, 8, light="TORCH"), S("vc-obsidian1", 34, 57, 14, 8), FLAT("vc-remains", 38, 54),
        S("vc-swordrock", 43, 53, 16, 8), S("vc-banner", 37, 51, 8, 6), dict(type="barrel", col=46, row=56, solid=True)]),
    "vulcao-campo": dict(enemies=[E("FIRE_ELEMENTAL", 33, 40), E("DEMON", 46, 41), E("DRAGON_WYRMLING", 49, 39), E("DEMON", 36, 44)], decor=[
        S("vc-columns2", 30, 39, 30, 10), S("vc-boulder1", 50, 44, 22, 10), S("vc-obsidian2", 44, 38, 16, 8),
        S("vc-boulder5", 31, 45, 26, 10), S("vc-stump", 38, 38), S("vc-minecart", 34, 42, 30, 10), FLAT("vc-remains", 50, 41),
        dict(type="crate", col=32, row=43, solid=True)]),
    "vulcao-fumarolas": dict(lake=LAKES[1], enemies=[
        E("FIRE_ELEMENTAL", 15, 43, elite=True, affixes=["TOUGH"]), E("DEMON_CASTER", 8, 50), E("DRAGON_WYRMLING", 17, 50)],
        decor=[S("vc-vent", 6, 42, 18, 8, light="TORCH"), S("vc-vent", 14, 48, 18, 8, light="TORCH"), S("vc-vent", 18, 44, 18, 8),
               FLAT("vc-sulfur", 7, 49), FLAT("vc-sulfur", 15, 47), FLAT("vc-sulfur", 19, 45), S("vc-boulder2", 5, 51, 20, 10),
               dict(type="chest", col=12, row=51, solid=True), FLAT("vc-remains", 16, 44), dict(type="barrel", col=20, row=50, solid=True)]),
    "vulcao-ponte": dict(enemies=[E("DRAGON_DRAKE", 45, 23, elite=True, affixes=["VAMPIRIC"]), E("FIRE_ELEMENTAL", 32, 28),
                                  E("DEMON_CASTER", 49, 29), E("DRAGON_WYRMLING_SHADOW", 41, 29)],
                         decor=[S("vc-columns3", 30, 21, 32, 10), S("vc-obsidian3", 50, 21, 18, 8), S("vc-boulder3", 29, 30, 30, 12),
                                S("vc-stump", 52, 30), S("vc-banner", 30, 25, 8, 6), S("vc-banner", 51, 25, 8, 6), dict(type="fire-crystal", col=47, row=22),
                                dict(type="fire-crystal", col=31, row=29)]),
    "vulcao-forja": dict(enemies=[E("ORC_WARRIOR", 12, 24, elite=True, affixes=["TOUGH"]), E("DEMON", 7, 29), E("FIRE_ELEMENTAL", 17, 29),
                                  E("DEMON_CASTER", 6, 21)],
                         decor=[dict(type="brazier", col=8, row=21, solid=True), dict(type="brazier", col=16, row=21, solid=True),
                                S("vc-forge", 12, 19, 40, 14, light="TORCH"), S("vc-anvil", 15, 23, 26, 10), S("vc-rack", 7, 23, 28, 10), S("vc-minecart", 18, 28, 30, 10),
                                dict(type="barrel", col=5, row=27, solid=True), dict(type="barrel", col=6, row=28, solid=True), dict(type="crate", col=19, row=21, solid=True),
                                dict(type="chest", col=4, row=21, solid=True), S("vc-obsidian1", 19, 31, 14, 8)]),
    "vulcao-colunas": dict(lake=LAKES[2], enemies=[E("DRAGON_WYRMLING", 63, 26), E("DRAGON_DRAKE", 72, 30), E("DEMON", 68, 21),
                                                    E("FIRE_ELEMENTAL", 73, 22)],
                           decor=[S("vc-bigcolumns", 63, 21, 60, 14), S("vc-columns1", 74, 26, 26, 10), S("vc-columns3", 67, 30, 32, 10),
                                  S("vc-obsidian2", 62, 32, 16, 8), FLAT("vc-sulfur", 70, 33), dict(type="trap-spikes", col=65, row=31),
                                  dict(type="fire-crystal", col=64, row=24), dict(type="fire-crystal", col=75, row=31), FLAT("vc-remains", 69, 27),
                                  dict(type="trap-spikes", col=71, row=25)]),
    "vulcao-fenda": dict(lake=LAKES[3], enemies=[E("ORC_WARRIOR", 68, 45, elite=True, affixes=["TOUGH"]), E("DEMON_CASTER", 62, 51),
                                                  E("FIRE_ELEMENTAL", 73, 52)],
                         decor=[dict(type="chest", col=73, row=45, solid=True), S("vc-boulder5", 62, 45, 26, 10), S("vc-obsidian3", 74, 50, 18, 8),
                                S("vc-vent", 66, 52, 18, 8, light="TORCH"), FLAT("vc-sulfur", 69, 53), dict(type="fire-crystal", col=61, row=46),
                                dict(type="crate", col=74, row=47, solid=True), S("vc-swordrock", 63, 52, 16, 8)]),
    "vulcao-caldeira": dict(lake=LAKES[0], enemies=[E("FIRE_ELEMENTAL", 30, 10), E("FIRE_ELEMENTAL", 50, 10), E("DEMON", 41, 12)],
                            decor=[dict(type="statue-fire", col=33, row=7), dict(type="statue-fire", col=47, row=7),
                                   dict(type="brazier", col=30, row=12, solid=True), dict(type="brazier", col=52, row=12, solid=True),
                                   S("vc-columns2", 26, 5, 30, 10), S("vc-columns3", 53, 5, 32, 10), S("vc-obsidian3", 37, 12, 18, 8),
                                   S("vc-banner", 36, 6, 8, 6), S("vc-banner", 44, 6, 8, 6), FLAT("vc-remains", 40, 13)]),
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
streamT = np.zeros((ROWS, COLS), bool)
for pl, hw in STREAMS:
    for (x0, y0), (x1, y1) in zip(pl, pl[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 4) + 1
        for i in range(n + 1):
            x, y = x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n
            rr = (hw + 12) / T
            for r in range(int(y - rr - 1), int(y + rr + 2)):
                for c in range(int(x - rr - 1), int(x + rr + 2)):
                    if 0 <= r < ROWS and 0 <= c < COLS and (c - x) ** 2 + (r - y) ** 2 <= rr * rr:
                        streamT[r, c] = True

used = set()


def snap(o, room_rect, clearance):
    best = None
    for r in range(room_rect["y"], room_rect["y"] + room_rect["h"]):
        for c in range(room_rect["x"], room_rect["x"] + room_rect["w"]):
            ok = all(0 <= c + dx < COLS and 0 <= r + dy < ROWS and walk[r + dy, c + dx] and not bridgeT[r + dy, c + dx] and not streamT[r + dy, c + dx]
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
bump = ndimage.gaussian_filter(tex, 1)
gy, gx = np.gradient(bump)
lit = np.clip(.5 - (gx * -.6 + gy * -.8) * 9, 0, 1)
v = np.clip(.2 + lit * .45 + tex * .35, 0, 1)
ground = ramp(ROCK, v, yy, xx)
ashn = fbm(H, W, 11, ((30, .5), (9, .3), (3, .2)))
aw = np.clip((ashn - .58) * 3.2, 0, .42)[..., None]
ground = ground * (1 - aw) + ramp(ASH, np.clip(v * .8, 0, 1), yy, xx) * aw
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
hotc = (ee < .45) & crk & (distLV < 56) & (fbm(H, W, 18, ((20, 1.),)) > .55) & FLOOR
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
heat = np.clip(1 - e2 / 7, 0, 1) * .62 + fbm(H, W, 23, ((14, .6), (5, .4))) * .36
inner = ndimage.distance_transform_edt(LV)
heat = heat * np.clip(inner / 7, .45, 1)
lav = ramp(LAVA, np.clip(heat, 0, 1), yy, xx)
crust = (e2 > 3.0) & (fbm(H, W, 25, ((12, .7), (4, .3))) < .53) & (inner > 3) & LV
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
img[hotc] = (214, 92, 26)

# — pontes de basalto sobre a lava (chão caminhável dentro de um rio)
BRp = np.zeros((H, W), bool)
STONE = [(30, 26, 26), (44, 38, 36), (60, 52, 48), (78, 68, 60), (98, 86, 74), (120, 106, 90)]
labB, nB = ndimage.label(bridgeT)
for k in range(1, nB + 1):
    rr_, cc_ = np.nonzero(labB == k)
    c0, c1, r0, r1 = cc_.min(), cc_.max(), rr_.min(), rr_.max()
    vertical = (r1 - r0) >= (c1 - c0)
    if vertical:
        x0, x1 = c0 * T + 2, (c1 + 1) * T - 2
        band = LZ[:, x0:x1].any(1)
        ys = np.nonzero(band[r0 * T - 3 * T:(r1 + 1) * T + 3 * T])[0] + r0 * T - 3 * T
        if not len(ys):
            continue
        y0, y1 = ys.min() - 8, ys.max() + 10
    else:
        y0, y1 = r0 * T + 4, (r1 + 1) * T - 2
        band = LZ[y0:y1, :].any(0)
        xs = np.nonzero(band[c0 * T - 3 * T:(c1 + 1) * T + 3 * T])[0] + c0 * T - 3 * T
        if not len(xs):
            continue
        x0, x1 = xs.min() - 8, xs.max() + 8
    sub_y, sub_x = np.mgrid[y0:y1, x0:x1]
    # tabuleiro: lajes de pedra desencontradas
    v = .45 + (tex[y0:y1, x0:x1] - .5) * .35
    deck = ramp(STONE, np.clip(v, 0, 1), sub_y, sub_x)
    if vertical:
        joint_r = ((sub_y - y0) % 12 == 0)
        joint_c = (((sub_x - x0) + ((sub_y - y0) // 12) * 9) % 18 == 0)
    else:
        joint_c = ((sub_x - x0) % 12 == 0)
        joint_r = (((sub_y - y0) + ((sub_x - x0) // 12) * 7) % 14 == 0)
    deck[joint_r | joint_c] = np.array(STONE[0])
    hl = np.roll(joint_r | joint_c, 1, 0) & ~(joint_r | joint_c)
    deck[hl] = np.minimum(255, deck[hl] * 1.25)
    img[y0:y1, x0:x1] = deck
    BRp[y0:y1, x0:x1] = True
    # parapeitos laterais
    if vertical:
        for xa, xb, lit in ((x0, x0 + 5, True), (x1 - 5, x1, False)):
            img[y0:y1, xa:xb] = np.array(STONE[4 if lit else 1])
            img[y0:y1, xa] = np.array(STONE[0])
            img[y0:y1, xb - 1] = np.array(STONE[0])
            for yb in range(y0, y1, 10):
                img[yb, xa:xb] = np.array(STONE[0])
        # face frontal com arco sobre a lava
        fy0, fy1 = y1, min(H, y1 + 14)
        fx = np.arange(x0, x1)
        img[fy0:fy1, x0:x1] = np.array(STONE[1])
        cx_, rw = (x0 + x1) / 2, (x1 - x0) / 2 - 7
        for yy2 in range(fy0, fy1):
            t = (yy2 - fy0) / 14
            inside = np.abs(fx - cx_) < rw * np.sqrt(max(0, t * 1.4 - .1))
            img[yy2, x0:x1][inside] = img[yy2, x0:x1][inside] * .3 + np.array([230, 90, 24]) * .7 * t
        img[fy0, x0:x1] = np.array(STONE[5])
        BRp[fy0:fy1, x0:x1] = True
    else:
        img[y0:y0 + 5, x0:x1] = np.array(STONE[4])
        img[y0, x0:x1] = np.array(STONE[0])
        img[y1 - 5:y1, x0:x1] = np.array(STONE[1])
        img[y1 - 1, x0:x1] = np.array(STONE[0])
        for xb in range(x0, x1, 10):
            img[y0:y0 + 5, xb] = np.array(STONE[0])
        fy0, fy1 = y1, min(H, y1 + 10)
        img[fy0:fy1, x0:x1] = np.array(STONE[1])
        img[fy0, x0:x1] = np.array(STONE[5])
        BRp[fy0:fy1, x0:x1] = True
LV &= ~BRp
FC &= ~BRp
# — correntes rasas de magma no chão (caminháveis, queimam)
sm = Image.new("L", (W, H), 0)
sd = ImageDraw.Draw(sm)
STREAM_PX = []
for pl, hw in STREAMS:
    pts = [(x * T + 16, y * T + 16) for x, y in pl]
    STREAM_PX.append(pts)
    for qi, q in enumerate(pts):
        rr = hw * (.75 + .45 * (math.sin(qi * .9 + q[0] * .01) * .5 + .5))
        sd.ellipse((q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr), fill=255)
    for (a0, b0), (a1, b1) in zip(pts, pts[1:]):
        sd.line([(a0, b0), (a1, b1)], fill=255, width=int(hw * 1.5))
STR = (ndimage.gaussian_filter(np.asarray(sm, np.float32) / 255, 3) + (fbm(H, W, 95, ((10, .6), (4, .4))) - .5) * .45) > .5
STR &= FLOOR & ~BR & ~BRp
sin_ = ndimage.distance_transform_edt(STR)
heat2 = np.clip(.3 + sin_ / 6 * .55 + (fbm(H, W, 96, ((8, .6), (3, .4))) - .5) * .5, 0, 1)
sl = ramp(LAVA, heat2, yy, xx)
spk = STR & (fbm(H, W, 97, ((5, .6), (2, .4))) < .33) & (sin_ > 1.5)
sl[spk] = np.array(FACE[2])
img[STR] = sl[STR]
rimS = ndimage.binary_dilation(STR, iterations=3) & FLOOR & ~STR
img[rimS] = img[rimS] * .45 + np.array(FACE[0]) * .55
rimS1 = ndimage.binary_dilation(STR, iterations=1) & FLOOR & ~STR
img[rimS1] = (140, 40, 14)
emis = LV | hotc | STR
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
        ("vc-obsidian1", 1), ("vc-obsidian2", 1), ("vc-obsidian3", 1), ("vc-columns1", 4), ("vc-columns2", 3), ("vc-stump", 2)]
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
small = [boulder(200 + i, 8 + i % 3 * 2, 6 + i % 2 * 2) for i in range(6)]
for _ in range(170):
    im = rnd.choice(small)
    x, y = rnd.randrange(W - 40), rnd.randrange(H - 40)
    if walk[y // T, x // T] and walk[(y + im.height) // T, (x + im.width) // T] and FLOOR[y, x] and FLOOR[y + im.height, x + im.width] \
            and not BRp[y, x] and distLV[y, x] > 12:
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
VENTS = []
for _ in range(60):
    x, y = rnd.randrange(40, W - 40), rnd.randrange(60, H - 20)
    if not STR[y, x] and FLOOR[y, x] and walk[y // T, x // T] and distLV[y, x] > 40 and free((x - 11, y - 6, x + 11, y + 6), 2):
        occ.append((x - 11, y - 6, x + 11, y + 6))
        VENTS.append([int(x), int(y)])
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
# ── dados para a animação da lava e o dano ──
def seg_dir(px, py, lines):
    best = (1e18, 1., 0.)
    for pts in lines:
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            vx, vy = x1 - x0, y1 - y0
            L2 = vx * vx + vy * vy or 1
            t = max(0, min(1, ((px - x0) * vx + (py - y0) * vy) / L2))
            d = (px - x0 - vx * t) ** 2 + (py - y0 - vy * t) ** 2
            if d < best[0]:
                ln = math.sqrt(L2)
                best = (d, vx / ln, vy / ln)
    return best
RIV_PX = [[(x * T + 16, y * T + 16) for x, y in pl] for pl, _ in RIVERS]
innerLV = ndimage.distance_transform_edt(LV)
flow, bub = [], []
c1 = np.argwhere(LV & (innerLV >= 6))
nrs.shuffle(c1)
for y, x in c1[:560]:
    d, dx, dy = seg_dir(x, y, RIV_PX)
    if d > 90 ** 2:
        a = nrs.rand() * 6.28
        dx, dy = math.cos(a) * .35, math.sin(a) * .2
    flow.append([int(x), int(y), round(dx, 2), round(dy, 2)])
c2 = np.argwhere(STR & (sin_ >= 3))
nrs.shuffle(c2)
for y, x in c2[:180]:
    d, dx, dy = seg_dir(x, y, STREAM_PX)
    flow.append([int(x), int(y), round(dx, 2), round(dy, 2)])
for y, x in list(c1[560:720]) + list(c2[180:230]):
    bub.append([int(x), int(y)])
glow = []
G = 128
em2 = LV | STR
for gy0 in range(0, H, G):
    for gx0 in range(0, W, G):
        blk = em2[gy0:gy0 + G, gx0:gx0 + G]
        fr = blk.mean()
        if fr > .12:
            ys, xs = np.nonzero(blk)
            glow.append([int(gx0 + xs.mean()), int(gy0 + ys.mean()), round(.5 + fr * 1.3, 2)])
cs = 8
gh, gw = H // cs, W // cs
cell = STR[:gh * cs, :gw * cs].reshape(gh, cs, gw, cs).mean((1, 3)) > .45
hz = []
for r in range(gh):
    c = 0
    while c < gw:
        if cell[r, c]:
            c0 = c
            while c < gw and cell[r, c]:
                c += 1
            hz.append([c0 * cs, r * cs, (c - c0) * cs, cs])
        else:
            c += 1
print("fluxo", len(flow), "bolhas", len(bub), "brilho", len(glow), "zonas de dano", len(hz), "fumarolas", len(VENTS))
json.dump({"chunk": CH, "cols": math.ceil(W / CH), "rows": math.ceil(H / CH), "front": front, "flow": flow, "bub": bub,
           "glow": glow, "hz": hz, "vents": VENTS},
          open(os.path.join(OUT, "vcb-meta.json"), "w"))
prev = canvas.convert("RGBA")
for x, y, k in front:
    im = PROPS[k]
    prev.alpha_composite(im, (x - im.width // 2, y - im.height))
prev.resize((W // 2, H // 2), Image.LANCZOS).convert("RGB").save(os.path.join(ROOT, "scripts", "volcano_preview.png"))
prev.convert("RGB").save(os.path.join(ROOT, "scripts", "volcano_full.png"))
json.dump({"world": {"cols": COLS, "rows": ROWS}, "rooms": rooms_out, "corridors": corridors, "doors": doors, "spawn": SPAWN,
           "props": sorted(PROPS) + ["vc-thorn-h", "vc-thorn-v", "vc-fx-streak", "vc-fx-streak2", "vc-fx-crust1", "vc-fx-crust2", "vc-fx-crust3"]},
          open(os.path.join(ROOT, "scripts", "volcano_level.json"), "w"), ensure_ascii=False, indent=1)
print("ok", len(front), "props na borda", len(corridors), "corredores")
