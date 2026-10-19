"""
Floresta Nevada — a mata coberta de neve que antecede o Portão Congelado (fase "glacial").

Igual ao Bosque Amaldiçoado das Ruínas: o mapa da Cidadela Glacial cresce para 80 linhas e o herói começa
na Trilha Nevada (linhas 49-79), atravessa a Clareira dos Pinheiros, o Lago Congelado e o Bosque Gélido
até o Portão Congelado.

Pacote: craftpix "2D RPG Winter Tileset" (pasta com PNG/).
Uso: python3 scripts/build_glacial_snow.py <pasta-do-pacote>

Gera:
  assets/pixel-art/glacial-snow/gsb-X-Y.png    chão de neve assado (bordas orgânicas, trilha pisada, lago congelado)
  assets/pixel-art/glacial-snow/gs-props.png/.json   atlas das árvores, pedras e objetos com profundidade
  assets/pixel-art/glacial-snow/gsb-meta.json  props, lago (gelo), lampiões, neblina
  scripts/glacial_snow_level.json              salas, corredores, porta e início (usado por patch_glacial_snow.py)
"""
import json
import math
import os
import random
import shutil
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PK = os.path.join(sys.argv[1], "PNG")
assert os.path.isdir(PK), "informe a pasta do pacote Winter (com PNG/)"
OUT = os.path.join(ROOT, "assets", "pixel-art", "glacial-snow")
os.makedirs(OUT, exist_ok=True)
random.seed(33)
rng = np.random.default_rng(33)
T = 32
COLS, ROWS, R0 = 60, 80, 49
SC = .42                     # escala da arte do pacote (desenho grande → tamanho do jogo)


def png(name, scale=SC):
    im = Image.open(os.path.join(PK, name + ".png")).convert("RGBA")
    im = im.crop(im.getbbox())
    return im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)


# ───────────────────────── layout ─────────────────────────
ROOMS = [
    {"id": "gs-trilha", "name": "Trilha Nevada", "rect": {"x": 25, "y": 70, "w": 13, "h": 8}, "ambient": .72},
    {"id": "gs-clareira", "name": "Clareira dos Pinheiros", "rect": {"x": 5, "y": 57, "w": 17, "h": 11}, "ambient": .68},
    {"id": "gs-lago", "name": "Lago Congelado", "rect": {"x": 39, "y": 57, "w": 16, "h": 11}, "ambient": .7},
    {"id": "gs-bosque", "name": "Bosque Gélido", "rect": {"x": 22, "y": 51, "w": 19, "h": 9}, "ambient": .64},
]
CORR = [
    {"x": 13, "y": 72, "w": 13, "h": 3}, {"x": 13, "y": 67, "w": 3, "h": 6},
    {"x": 37, "y": 72, "w": 11, "h": 3}, {"x": 45, "y": 67, "w": 3, "h": 6},
    {"x": 16, "y": 53, "w": 7, "h": 3}, {"x": 16, "y": 53, "w": 3, "h": 5},
    {"x": 40, "y": 53, "w": 8, "h": 3}, {"x": 45, "y": 53, "w": 3, "h": 5},
    {"x": 30, "y": 48, "w": 2, "h": 4},
]
DOOR = {"id": "porta-glacial-floresta", "orientation": "h", "col": 30, "row": 49, "rooms": ["gs-bosque", "frozen-gate"]}
SPAWN = {"col": 31, "row": 75}
# poucos inimigos, os mesmos da Cidadela Glacial
ENEMIES = {
    "gs-trilha": [],
    "gs-clareira": [("FROST_GOBLIN", 9, 60), ("FROST_GOBLIN_ARCHER", 18, 63)],
    "gs-lago": [("FROST_WOLF", 50, 61), ("ICE_SKELETON", 42, 64)],
    "gs-bosque": [("FROST_GOBLIN", 26, 55), ("ICE_SKELETON", 36, 54), ("FROST_GOBLIN_ARCHER", 31, 52)],
}

grid = np.ones((ROWS, COLS), np.uint8)
for r in ROOMS:
    q = r["rect"]
    grid[q["y"]:q["y"] + q["h"], q["x"]:q["x"] + q["w"]] = 0
for c in CORR:
    grid[c["y"]:c["y"] + c["h"], c["x"]:c["x"] + c["w"]] = 0
grid[:R0 - 1] = 1
grid[48, 30:32] = 0

keep = set()
for c in CORR:
    for y in range(c["y"] - 1, c["y"] + c["h"] + 1):
        for x in range(c["x"] - 1, c["x"] + c["w"] + 1):
            keep.add((x, y))
keep |= {(SPAWN["col"] + dx, SPAWN["row"] + dy) for dx in range(-2, 3) for dy in range(-2, 3)}
for lst in ENEMIES.values():
    for _, x, y in lst:
        keep |= {(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)}

PTS = [[(31, 77), (31, 73), (20, 73), (14, 73), (14, 66), (13, 62), (17, 54), (24, 54), (31, 55), (31, 49)],
       [(31, 73), (40, 73), (46, 73), (46, 66), (47, 61), (46, 54), (39, 54), (31, 55)]]
PATHC = set()
for line in PTS:
    for (ax, ay), (bx, by) in zip(line, line[1:]):
        n = max(abs(bx - ax), abs(by - ay)) * 3 + 1
        for i in range(n + 1):
            fx, fy = ax + (bx - ax) * i / n, ay + (by - ay) * i / n
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    PATHC.add((round(fx) + dx, round(fy) + dy))
keep |= PATHC
walls = {r["id"]: [] for r in ROOMS}


def connected(g):
    fl = [(x, y) for y in range(R0, ROWS) for x in range(COLS) if not g[y, x]]
    seen = {fl[0]}
    q = deque([fl[0]])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (x + dx, y + dy)
            if n not in seen and R0 <= n[1] < ROWS and 0 <= n[0] < COLS and not g[n[1], n[0]]:
                seen.add(n)
                q.append(n)
    return len(seen) == len(fl)


def add_wall(rid, x, y):
    if (x, y) in keep or grid[y, x]:
        return False
    grid[y, x] = 1
    if not connected(grid):
        grid[y, x] = 0
        return False
    walls[rid].append({"x": x, "y": y, "w": 1, "h": 1})
    return True


# bordas orgânicas (nada de lado reto nem canto quadrado)
for r in ROOMS:
    q = r["rect"]
    x0, y0, x1, y1 = q["x"], q["y"], q["x"] + q["w"] - 1, q["y"] + q["h"] - 1
    for x in range(x0, x1 + 1):
        for y, d in ((y0, 1), (y1, -1)):
            if random.random() < .5:
                add_wall(r["id"], x, y)
                random.random() < .3 and add_wall(r["id"], x, y + d)
    for y in range(y0, y1 + 1):
        for x, d in ((x0, 1), (x1, -1)):
            if random.random() < .5:
                add_wall(r["id"], x, y)
                random.random() < .3 and add_wall(r["id"], x + d, y)
    for cx, cy, dx, dy in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        for a, b in ((0, 0), (dx, 0), (0, dy), (dx, dy), (2 * dx, 0), (0, 2 * dy), (2 * dx, dy), (dx, 2 * dy)):
            add_wall(r["id"], cx + a, cy + b)

# lago congelado: gelo andável (sem obstáculo), ocupa o meio do Lago Congelado
ICE = set()
lq = ROOMS[2]["rect"]
icx, icy = lq["x"] + lq["w"] / 2 - .5, lq["y"] + lq["h"] / 2 - .2
for y in range(lq["y"], lq["y"] + lq["h"]):
    for x in range(lq["x"], lq["x"] + lq["w"]):
        if ((x - icx) / 4.6) ** 2 + ((y - icy) / 2.9) ** 2 <= 1 and not grid[y, x]:
            ICE.add((x, y))

# moitas de pinheiros dentro das salas (cobertura), longe da trilha
CLUMP = set()
for rid, spots in (("gs-clareira", [(8, 58), (19, 66), (7, 64)]), ("gs-bosque", [(24, 52), (38, 52), (27, 58), (35, 58)]),
                   ("gs-trilha", [(27, 71), (36, 76)]), ("gs-lago", [(52, 58), (40, 66)])):
    for x, y in spots:
        for dx, dy in ((0, 0), (1, 0)):
            add_wall(rid, x + dx, y + dy) and CLUMP.add((x + dx, y + dy))

# ───────────────────────── chão de neve assado ─────────────────────────
PW, PH = COLS * T, (ROWS - R0) * T
Y0 = R0 * T


def floor_mask():
    f = np.zeros((PH, PW), bool)
    for y in range(R0, ROWS):
        for x in range(COLS):
            if not grid[y, x]:
                f[(y - R0) * T:(y - R0 + 1) * T, x * T:(x + 1) * T] = True
    return f


icem = np.zeros((PH, PW), bool)
for x, y in ICE:
    icem[(y - R0) * T:(y - R0 + 1) * T, x * T:(x + 1) * T] = True


def blur(m, r):
    im = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.array(im).astype(float) / 255


def vnoise(scale, amp, h=PH, w=PW):
    gw, gh = w // scale + 3, h // scale + 3
    g = rng.random((gh, gw))
    ys, xs = np.mgrid[0:h, 0:w] / scale
    x0, y0 = xs.astype(int), ys.astype(int)
    fx, fy = xs - x0, ys - y0
    fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = g[y0, x0] * (1 - fx) + g[y0, x0 + 1] * fx
    b = g[y0 + 1, x0] * (1 - fx) + g[y0 + 1, x0 + 1] * fx
    return (a * (1 - fy) + b * fy - .5) * 2 * amp


def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


# textura de neve do pacote em duas escalas e deslocamentos (quebra a repetição)
bgt = Image.open(os.path.join(PK, "bg.png")).convert("RGB")


def tiled(t, scale, ox, oy):
    t = t.resize((round(t.width * scale), round(t.height * scale)), Image.LANCZOS)
    im = Image.new("RGB", (PW + t.width, PH + t.height))
    for y in range(0, im.height, t.height):
        for x in range(0, im.width, t.width):
            im.paste(t, (x, y))
    return np.array(im.crop((ox, oy, ox + PW, oy + PH))).astype(float)


snowA = tiled(bgt, .5, 37, 11)
snowB = tiled(bgt.rotate(90), .36, 5, 61)
detail = (snowA.mean(-1) * .55 + snowB.mean(-1) * .45)
detail = (detail - detail.mean()) / 40.0                     # -1..1 aprox.
base_col = np.array([238., 242., 249.])
light = 1 + vnoise(90, .035) + vnoise(30, .018)
img = np.ones((PH, PW, 3)) * base_col * light[..., None]
img += detail[..., None] * np.array([9., 8., 6.])
# brilhos de cristal de gelo
spark = rng.random((PH, PW)) > .9965
img[spark] = (255, 255, 255)

# área fora das salas: neve funda à sombra da mata, com transição suave (sem degrau).
# A borda é orgânica (ruído forte) e a colisão acompanha o desenho: célula pouco coberta vira mata.
NZ = vnoise(64, .3) + vnoise(22, .12) + vnoise(7, .04) + vnoise(3, .015)
floor = floor_mask()
for _ in range(2):
    ofield = blur(floor, 13) + NZ
    cov = (ofield > .5).reshape(ROWS - R0, T, COLS, T).mean((1, 3))
    rid_of = {}
    for r in ROOMS:
        q = r["rect"]
        for yy in range(q["y"] - 2, q["y"] + q["h"] + 2):
            for xx in range(q["x"] - 2, q["x"] + q["w"] + 2):
                rid_of.setdefault((xx, yy), r["id"])
    for y in range(R0, ROWS):
        for x in range(COLS):
            if not grid[y, x] and cov[y - R0, x] < .55 and (x, y) in rid_of:
                add_wall(rid_of[(x, y)], x, y)
    floor = floor_mask()
# lago: elipse irregular em pixels (nada de bloco)
_yy, _xx = np.mgrid[0:PH, 0:PW]
_ix, _iy = (icx + .5) * T, (icy - R0 + .5) * T
_ang = np.arctan2(_yy - _iy, _xx - _ix)
_rr = np.hypot((_xx - _ix) / (4.7 * T), (_yy - _iy) / (2.9 * T)) * (1 + .1 * np.sin(_ang * 3 + 1) + .06 * np.sin(_ang * 5 + 2))
icem = (_rr <= 1) & floor
ICE = {(x, y) for y in range(R0, ROWS) for x in range(COLS) if not grid[y, x] and icem[(y - R0) * T + 16, x * T + 16]}
# células da trilha nunca viram mata; o desenho garante que elas aparecem abertas
ofield = blur(floor, 13) + NZ
for x, y in PATHC:
    if R0 <= y < ROWS and 0 <= x < COLS and not grid[y, x]:
        ofield[(y - R0) * T:(y - R0 + 1) * T, x * T:(x + 1) * T] = np.maximum(ofield[(y - R0) * T:(y - R0 + 1) * T, x * T:(x + 1) * T], .62)
ofield = blur(np.clip(ofield, 0, 1.2) / 1.2, 3) * 1.2
inside = smooth(ofield, .4, .6)
shade = np.array([.70, .77, .90])
img = img * (inside[..., None] + (1 - inside[..., None]) * shade)
# monte de neve na borda (luz em cima, sombra embaixo) — dá volume à beirada
edge = smooth(ofield, .44, .5) - smooth(ofield, .5, .6)
gy = np.gradient(blur(inside, 3), axis=0)
img += (np.clip(-gy * 60, 0, 1) * 20)[..., None] * np.array([1, 1, 1.02])
img -= (np.clip(gy * 60, 0, 1) * 26)[..., None] * np.array([1, .9, .6])

# trilha pisada (neve compactada, levemente azulada, bordas macias)
path = Image.new("L", (PW, PH), 0)
pd = ImageDraw.Draw(path)
for line in PTS:
    pts = [((x + .5) * T, (y - R0 + .5) * T) for x, y in line]
    pd.line(pts, fill=255, width=40, joint="curve")
    for p in pts:
        pd.ellipse((p[0] - 20, p[1] - 20, p[0] + 20, p[1] + 20), fill=255)
pfield = blur(np.array(path) / 255.0, 9) + vnoise(26, .16) + vnoise(8, .06)
trail = smooth(pfield, .42, .62) * inside
tcol = np.array([.88, .91, .96]) + vnoise(12, .03)[..., None]
img = img * (1 - trail[..., None]) + img * tcol * trail[..., None]
# sulcos de pegadas antigas e marcas de trenó na trilha
old = Image.new("L", (PW, PH), 0)
od = ImageDraw.Draw(old)
for line in PTS:
    for (ax, ay), (bx, by) in zip(line, line[1:]):
        L = math.hypot(bx - ax, by - ay) * T
        ang = math.atan2(by - ay, bx - ax)
        nx, ny = -math.sin(ang), math.cos(ang)
        k = 0
        while k < L:
            for side in (-1, 1):
                if random.random() < .55:
                    px = (ax + .5) * T + math.cos(ang) * k + nx * (side * 5 + random.uniform(-9, 9))
                    py = (ay - R0 + .5) * T + math.sin(ang) * k + ny * (side * 5 + random.uniform(-9, 9))
                    od.ellipse((px - 2, py - 3, px + 2, py + 3), fill=random.randint(40, 90))
            k += random.uniform(7, 12)
oldm = blur(np.array(old) / 255.0, .8) * trail
img -= (oldm * 34)[..., None] * np.array([1, .86, .6])

# lago congelado: gelo azul com rachaduras e reflexos, borda de neve acumulada
ifield = blur(icem, 4) + vnoise(30, .06) + vnoise(9, .025)
ice = smooth(ifield, .48, .56)
yy, xx = np.mgrid[0:PH, 0:PW]
deepi = smooth(vnoise(26, 1.0) + vnoise(9, .3), .1, .7)[..., None]
icol = np.array([186., 220., 238.]) * (1 - deepi) + np.array([128., 176., 210.]) * deepi
icol = icol * (1 + vnoise(40, .04))[..., None]
crk = Image.new("L", (PW, PH), 0)
cd = ImageDraw.Draw(crk)
ix0, iy0 = (icx + .5) * T, (icy - R0 + .5) * T
for _ in range(26):
    x, y = ix0 + random.uniform(-130, 130), iy0 + random.uniform(-80, 80)
    a = random.uniform(0, 6.28)
    pts = [(x, y)]
    for _ in range(random.randint(3, 7)):
        a += random.uniform(-.7, .7)
        L = random.uniform(8, 26)
        x, y = x + math.cos(a) * L, y + math.sin(a) * L * .7
        pts.append((x, y))
    cd.line(pts, fill=255, width=1)
crack = np.array(crk) / 255.0
icol = icol * (1 - crack[..., None] * .25) + crack[..., None] * np.array([235., 248., 255.]) * .25
streak = np.clip(np.sin((xx * .6 + yy) / 9.0) * 3 - 2.4, 0, 1) * smooth(vnoise(60, 1.0), .2, .6)
icol += (streak * 28)[..., None]
img = img * (1 - ice[..., None]) + icol * ice[..., None]
irim = smooth(ifield, .4, .48) - smooth(ifield, .48, .56)
img += (np.clip(irim, 0, 1) * 18)[..., None]
img = np.clip(img, 0, 255)
base = Image.fromarray(img.astype(np.uint8), "RGB").convert("RGBA")
inside_full = inside > .5
trail_m = trail > .35
ice_m = ice > .5

# ───────────────────────── árvores, pedras e objetos ─────────────────────────
PINES = ["tree_3", "tree_8", "tree_9"]
LEAFY = ["tree_2", "tree_4", "tree_5", "tree_6", "tree_7", "tree_1", "tree_10"]
DEAD = ["tree_11", "tree_12"]
ROCKS = ["stones_4", "stones_5", "stones_6", "stones_7"]
STUMP = ["tree_13", "tree_14", "tree_15"]
BUSH = ["greenery_1", "greenery_2", "greenery_3", "greenery_6", "greenery_9"]
TUFT = ["greenery_4", "greenery_5", "greenery_7", "greenery_8"]
FR = {}
for n in PINES + LEAFY + DEAD:
    FR["gs-" + n] = png(n, .42)
for n in ROCKS + ["stones_3", "stones_2"]:
    FR["gs-" + n] = png(n, .4)
for n in STUMP + BUSH:
    FR["gs-" + n] = png(n, .36)
for n in TUFT:
    FR["gs-" + n] = png(n, .34)
FR["gs-snowman"] = png("decor_1", .36)
FR["gs-sign"] = png("decor_8", .32)
FR["gs-lamp"] = png("decor_6", .34)
FR["gs-banner"] = png("decor_4", .3)
FR["gs-barrel"] = png("decor_9", .3)
FR["gs-rock-big"] = png("stones_1", .3)


def shadow_under(im, x, y, w, a=60):
    """sombra azulada e macia sob o objeto (sol baixo de inverno)"""
    sh = Image.new("L", (w * 2 + 20, w + 10), 0)
    ImageDraw.Draw(sh).ellipse((10, 5, w * 2 + 10, w // 2 + 8), fill=a)
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    tint = Image.new("RGBA", sh.size, (60, 80, 120, 0))
    tint.putalpha(sh)
    im.alpha_composite(tint, (int(x - w - 10 + w * .35), int(y - w // 4 - 5)))


PROPS = []
LAMPS = []


def near_floor(x, y, d=1):
    for dy in range(-d, d + 1):
        for dx in range(-d, d + 1):
            if 0 <= x + dx < COLS and R0 <= y + dy < ROWS and not grid[y + dy, x + dx]:
                return True
    return False


def prop(k, x, y):
    PROPS.append([k, int(x), int(y)])


wallc = [(x, y) for y in range(R0, ROWS) for x in range(COLS) if grid[y, x]]
deep = []
for x, y in wallc:
    if (x, y) in CLUMP:
        prop("gs-" + random.choice(PINES + PINES + LEAFY[:3]), x * T + 16 + random.randint(-4, 4), (y + 1) * T - 2)
    elif near_floor(x, y, 1):
        below = any(0 <= x + dx < COLS and not grid[y - 1, x + dx] for dx in (-1, 0, 1)) and not any(
            0 <= x + dx < COLS and y + 1 < ROWS and not grid[y + 1, x + dx] for dx in (-1, 0, 1))
        if below:
            # borda de baixo: só moitas, tocos e pedras baixas (não cobrem a sala)
            if random.random() < .75:
                prop("gs-" + random.choice(BUSH + ROCKS[1:] + STUMP), x * T + 16 + random.randint(-6, 6), (y + 1) * T - random.randint(2, 10))
            continue
        if random.random() < .66:
            k = random.choice(PINES * 3 + LEAFY + DEAD)
            prop("gs-" + k, x * T + 16 + random.randint(-8, 8), (y + 1) * T - random.randint(0, 8))
        elif random.random() < .35:
            prop("gs-" + random.choice(ROCKS), x * T + 16 + random.randint(-6, 6), (y + 1) * T - random.randint(2, 8))
    elif near_floor(x, y, 6):
        deep.append((x, y))

# objetos marcantes (sempre fora da trilha)
SPECIAL = [("gs-trilha", "gs-sign", 28, 75), ("gs-trilha", "gs-lamp", 29, 72), ("gs-trilha", "gs-lamp", 34, 72),
           ("gs-clareira", "gs-snowman", 7, 61), ("gs-clareira", "gs-rock-big", 20, 59), ("gs-clareira", "gs-barrel", 6, 66),
           ("gs-bosque", "gs-banner", 29, 51), ("gs-bosque", "gs-banner", 33, 51), ("gs-bosque", "gs-lamp", 23, 56),
           ("gs-lago", "gs-lamp", 53, 64), ("gs-lago", "gs-stones_4", 41, 58)]
USED = set()
for rid, k, x0, y0 in SPECIAL:
    cands = sorted(((dx * dx + dy * dy, x0 + dx, y0 + dy) for dx in range(-3, 4) for dy in range(-3, 4)
                    if 0 <= x0 + dx < COLS and R0 <= y0 + dy < ROWS))
    for _, x, y in cands:
        if (x, y) in USED or (x, y) in CLUMP or (x, y) in PATHC:
            continue
        ok = grid[y, x] and near_floor(x, y, 1) or add_wall(rid, x, y)
        if ok:
            USED.add((x, y))
            PROPS[:] = [p for p in PROPS if not (abs(p[1] - (x * T + 16)) < 20 and abs(p[2] - (y + 1) * T) < 20)]
            prop(k, x * T + 16, (y + 1) * T - 3)
            if k == "gs-lamp":
                LAMPS.append([x * T + 16, (y + 1) * T - 3 - 34])
            break

# moitas de neve e capim seco ao longo da borda (escondem a grade)
EDGE = []
for y in range(R0, ROWS):
    for x in range(COLS):
        if not grid[y, x]:
            continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if 0 <= x + dx < COLS and R0 <= y + dy < ROWS and not grid[y + dy, x + dx] and (x + dx, y + dy) not in PATHC:
                if random.random() < .55:
                    k = "gs-" + random.choice(BUSH + TUFT + TUFT)
                    EDGE.append(((y - R0) * T + 22 - dy * 8 + random.randint(-8, 8), k, x * T + 16 - dx * 8 + random.randint(-12, 12)))
for py, k, px in sorted(EDGE):
    t = FR[k]
    shadow_under(base, px, py, t.width // 2, 40)
    base.alpha_composite(t, (px - t.width // 2, max(0, py - t.height)))

# mata fechada assada no chão (o herói nunca chega lá): pinheiros densos e árvores nevadas
deep.sort(key=lambda p: p[1])
for x, y in deep:
    if random.random() < .85:
        t = FR["gs-" + random.choice(PINES * 3 + LEAFY)]
        px, py = x * T + 16 + random.randint(-10, 10), (y - R0 + 1) * T
        shadow_under(base, px, py, t.width // 2, 50)
        base.alpha_composite(t, (px - t.width // 2, max(0, py - t.height)))
# sombras dos props com profundidade (desenhadas no chão)
for k, x, y in PROPS:
    shadow_under(base, x, y - Y0, FR[k].width // 2, 55)

# tufos de capim seco e tocos pequenos no chão das salas (fora da trilha e do gelo)
for _ in range(700):
    x, y = random.randrange(10, PW - 10), random.randrange(10, PH - 10)
    cx, cy = x // T, y // T + R0
    if inside_full[y, x] and not trail_m[y, x] and not ice_m[y, x] and (cx, cy) not in PATHC and not grid[cy, cx] and random.random() < .35:
        k = "gs-" + random.choice(TUFT * 4 + ["stones_3"])
        t = FR[k]
        t = t.resize((max(1, int(t.width * .75)), max(1, int(t.height * .75))), Image.LANCZOS)
        base.alpha_composite(t, (x - t.width // 2, y - t.height))

# ───────── banco de neve encostado na muralha (esconde a linha reta entre o castelo e a floresta) ─────────
DH = 72                                    # do topo do banco (R0*T-40) até R0*T+32
dx_ = np.arange(PW)
wav = 18 + 6 * np.sin(dx_ / 23.0 + 1.3) + 4 * np.sin(dx_ / 9.0) + vnoise(18, 5, 1, PW)[0] + vnoise(5, 2, 1, PW)[0]
ys_ = np.arange(DH)[:, None]
dal = np.clip((ys_ - wav[None, :]) / 7.0, 0, 1)            # topo ondulado e macio
sn = np.ones((DH, PW, 3)) * base_col * (1 + vnoise(40, .03, DH, PW))[..., None]
sn += ((snowA[:DH].mean(-1) - snowA.mean()) / 40.0)[..., None] * np.array([9., 8., 6.])
top_hl = np.clip(1 - np.abs(ys_ - wav[None, :] - 5) / 6.0, 0, 1)
sn += (top_hl * 14)[..., None]
# o banco se funde ao chão assado: a parte de baixo usa a própria imagem do chão
blend = np.clip((ys_ - 36) / 30.0, 0, 1)[..., None]
groundtop = np.array(base.convert("RGB"))[:DH - 40].astype(float)
gt = np.zeros((DH, PW, 3))
gt[40:] = groundtop
sn = sn * (1 - blend) + gt * blend
# fenda da porta: o caminho entra no portão (sem banco na frente)
gx0, gx1 = 30 * T - 6, 32 * T + 6
notch = np.clip(1 - np.minimum(np.abs(dx_ - gx0), np.abs(dx_ - gx1)) / 10.0, 0, 1)
inn = (dx_ > gx0) & (dx_ < gx1)
dal = dal * np.where(inn, 0, 1)[None, :] * (1 - notch[None, :] * .0)
# sombra azul que o banco projeta no chão logo abaixo da muralha
drift = Image.fromarray(np.clip(sn, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
drift.putalpha(Image.fromarray((dal * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1)))
drift.save(os.path.join(OUT, "gsb-drift.png"), optimize=True)
# chão da passagem do portão (linha 48): neve pisada até a porta
GH = T + 18
gate = np.ones((GH, gx1 - gx0 + 24, 3)) * base_col * np.array([.9, .92, .97])
gate += vnoise(8, 6, GH, gx1 - gx0 + 24)[..., None]
ga = np.ones((GH, gx1 - gx0 + 24))
ga[:, :12] *= np.linspace(0, 1, 12)[None, :]
ga[:, -12:] *= np.linspace(1, 0, 12)[None, :]
ga[:8] *= np.linspace(0, 1, 8)[:, None]
gim = Image.fromarray(np.clip(gate, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
gim.putalpha(Image.fromarray((ga * 255).astype(np.uint8)))
gim.save(os.path.join(OUT, "gsb-gate.png"), optimize=True)

# ───────── mata nevada em volta do castelo (linhas 41-48, por baixo das muralhas) ─────────
EH = (R0 - 41) * T
ext = np.ones((EH, PW, 3)) * base_col * shade * (1 + vnoise(50, .04, EH, PW))[..., None]
ext += ((snowB[:EH].mean(-1) - snowB.mean()) / 40.0)[..., None] * np.array([7., 6., 5.])
exti = Image.fromarray(np.clip(ext, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
spots = [(x, y) for y in range(41, R0) for x in range(COLS)]
spots.sort(key=lambda p: p[1])
for x, y in spots:
    if random.random() < .8:
        t = FR["gs-" + random.choice(PINES * 3 + LEAFY)]
        px, py = x * T + 16 + random.randint(-12, 12), (y - 41 + 1) * T + random.randint(-6, 6)
        shadow_under(exti, px, py, t.width // 2, 50)
        exti.alpha_composite(t, (px - t.width // 2, py - t.height))
# o topo some no escuro da noite (sem linha reta)
ea = np.ones((EH, PW))
ea[:72] = (np.linspace(0, 1, 72) ** 1.6)[:, None]
ea *= np.clip(np.array(exti.split()[3]) / 255.0 + 1, 0, 1)
dark = Image.new("RGBA", exti.size, (8, 10, 18, 255))
fade = Image.fromarray((np.clip(1 - ea, 0, 1) * 255).astype(np.uint8))
exti = Image.composite(dark, exti, fade)
exti.putalpha(Image.fromarray((np.clip(ea * 1.6, 0, 1) * 255).astype(np.uint8)))
exti.save(os.path.join(OUT, "gsb-ext.png"), optimize=True)

# chunks
CH = 512
meta_chunks = []
for cy in range(0, PH, CH):
    for cx in range(0, PW, CH):
        k = f"gsb-{cx // CH}-{cy // CH}"
        base.crop((cx, cy, min(PW, cx + CH), min(PH, cy + CH))).save(os.path.join(OUT, k + ".png"), optimize=True)
        meta_chunks.append([k, cx, cy + Y0])

# atlas dos props
used = sorted({p[0] for p in PROPS})
order = sorted(used, key=lambda k: -FR[k].height)
AW, x, y, rowh, pos = 1024, 0, 0, 0, {}
for k in order:
    w, h = FR[k].size
    if x + w > AW:
        x, y, rowh = 0, y + rowh + 1, 0
    pos[k] = (x, y, w, h)
    x += w + 1
    rowh = max(rowh, h)
atlas = Image.new("RGBA", (AW, y + rowh + 1))
for k, (x, y, w, h) in pos.items():
    atlas.alpha_composite(FR[k], (x, y))
atlas.save(os.path.join(OUT, "gs-props.png"), optimize=True)
json.dump({"frames": {k: {"frame": {"x": x, "y": y, "w": w, "h": h}, "rotated": False, "trimmed": False,
                          "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h}, "sourceSize": {"w": w, "h": h}}
                      for k, (x, y, w, h) in pos.items()}, "meta": {"image": "gs-props.png", "size": {"w": AW, "h": atlas.height}, "scale": "1"}},
          open(os.path.join(OUT, "gs-props.json"), "w"))

# neblina fria nas bordas da mata
MIST = []
for _ in range(160):
    x, y = random.randrange(0, COLS), random.randrange(R0, ROWS)
    if grid[y, x] and near_floor(x, y, 2):
        MIST.append([x * T + 16, y * T + 16])
meta = {"row0": R0, "chunks": meta_chunks, "drift": [0, R0 * T - 40], "ext": [0, 41 * T], "gate": [gx0 - 12, (R0 - 1) * T - 2], "props": PROPS, "mist": MIST[:70], "lamps": LAMPS,
        "ice": sorted([x, y] for x, y in ICE)}
json.dump(meta, open(os.path.join(OUT, "gsb-meta.json"), "w"), separators=(",", ":"))

LEVEL = {"rooms": [], "corridors": CORR, "door": DOOR, "spawn": SPAWN}
for r in ROOMS:
    LEVEL["rooms"].append({**r, "walls": walls[r["id"]], "enemies": [{"type": t, "col": x, "row": y} for t, x, y in ENEMIES[r["id"]]],
                           "decor": [{"type": "gs-puzzles", "col": 53, "row": 60}] if r["id"] == "gs-lago" else []})   # enigmas: patch_glacial_puzzles.py
json.dump(LEVEL, open(os.path.join(ROOT, "scripts", "glacial_snow_level.json"), "w"), ensure_ascii=False, indent=1)

MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art")
if os.path.isdir(MIR):
    shutil.rmtree(os.path.join(MIR, "glacial-snow"), ignore_errors=True)
    shutil.copytree(OUT, os.path.join(MIR, "glacial-snow"))

prev = base.copy()
for k, x, y in sorted(PROPS, key=lambda p: p[2]):
    t = FR[k]
    prev.alpha_composite(t, (int(x - t.width / 2), max(0, int(y - Y0 - t.height))))
prev.resize((PW // 2, PH // 2), Image.LANCZOS).save(os.path.join(ROOT, "scripts", "glacial_snow_preview.png"))
print("floresta nevada gerada", PW, PH, "props", len(PROPS), "gelo", len(ICE), "lampiões", len(LAMPS))
