"""
Bosque Amaldiçoado — a mata que antecede a entrada das Ruínas Antigas.

A fase "ruins" passa a começar na floresta (linhas 49-79 do mapa): o herói atravessa clareiras,
um lago sombrio e o bosque retorcido, enfrentando Árvores Amaldiçoadas (Ents), até o portão das Ruínas.

Pacotes: craftpix "Forest Top-Down Tileset" e "Top-Down Pixel Ent Character Sprites".
Uso: python3 scripts/build_ruins_forest.py <pasta-forest-pack> <pasta-ent-pack>

Gera:
  assets/pixel-art/ruins-forest/rfb-X-Y.png   chão da floresta assado (só a parte da floresta)
  assets/pixel-art/ruins-forest/rfb-meta.json árvores/props com profundidade, névoa, etc.
  assets/pixel-art/ruins-forest/rf-props.png/.json  atlas das árvores e objetos
  assets/pixel-art/enemies/cursed-ent{1,2,3}.png    inimigos (formato mk3e, 28 quadros)
  scripts/ruins_forest_level.json  salas, corredores, porta e início (usado pelo patch)
"""
import json
import math
import os
import random
import re
import sys
import xml.etree.ElementTree as ET
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FP, EP = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, "assets", "pixel-art", "ruins-forest")
EN = os.path.join(ROOT, "assets", "pixel-art", "enemies")
os.makedirs(OUT, exist_ok=True)
random.seed(21)
rng = np.random.default_rng(21)
T = 32                      # tile do jogo
COLS, ROWS, R0 = 60, 80, 49  # mapa das ruínas ampliado; a floresta começa na linha 49
S = 2                       # escala da arte (16px → 32px)

# ───────────────────────── leitura do tileset ─────────────────────────
TMXP = os.path.join(FP, "Tiled_files", "Forest.tmx")
root = ET.parse(TMXP).getroot()
SETS = []
for ts0 in root.findall("tileset"):
    fg = int(ts0.get("firstgid"))
    ts = ET.parse(os.path.join(os.path.dirname(TMXP), ts0.get("source"))).getroot() if ts0.get("source") else ts0
    img = Image.open(os.path.join(os.path.dirname(TMXP), ts.find("image").get("source"))).convert("RGBA")
    SETS.append((fg, int(ts.get("columns")), img))
SETS.sort(key=lambda x: x[0])


def tile(gid, scale=S):
    fg, cols, img = [t for t in SETS if t[0] <= gid][-1]
    lid = gid - fg
    t = img.crop(((lid % cols) * 16, (lid // cols) * 16, (lid % cols + 1) * 16, (lid // cols + 1) * 16))
    return t.resize((16 * scale, 16 * scale), Image.NEAREST)


LAY = {}
for ly in root.iter("layer"):
    d = ly.find("data")
    vals = []
    for c in (d.findall("chunk") or [d]):
        vals += [int(v) & 0x1FFFFFFF for v in re.split(r"[\s,]+", c.text.strip()) if v]
    LAY[ly.get("name")] = [v for v in vals if v]

OBJ = os.path.join(FP, "PNG", "Objects_separated")


def obj(name, scale=S):
    im = Image.open(os.path.join(OBJ, name + ".png")).convert("RGBA")
    im = im.crop(im.getbbox())
    return im.resize((round(im.width * scale), round(im.height * scale)), Image.NEAREST)


# ───────────────────────── layout da floresta ─────────────────────────
ROOMS = [
    {"id": "rf-trilha", "name": "Trilha Amaldiçoada", "rect": {"x": 25, "y": 70, "w": 13, "h": 8}, "ambient": .5},
    {"id": "rf-clareira", "name": "Clareira das Raízes", "rect": {"x": 5, "y": 57, "w": 17, "h": 11}, "ambient": .46},
    {"id": "rf-lago", "name": "Lago Sombrio", "rect": {"x": 39, "y": 57, "w": 16, "h": 11}, "ambient": .46},
    {"id": "rf-bosque", "name": "Bosque Retorcido", "rect": {"x": 22, "y": 51, "w": 19, "h": 9}, "ambient": .42},
]
CORR = [
    {"x": 13, "y": 72, "w": 13, "h": 3}, {"x": 13, "y": 67, "w": 3, "h": 6},
    {"x": 37, "y": 72, "w": 11, "h": 3}, {"x": 45, "y": 67, "w": 3, "h": 6},
    {"x": 16, "y": 53, "w": 7, "h": 3}, {"x": 16, "y": 53, "w": 3, "h": 5},
    {"x": 40, "y": 53, "w": 8, "h": 3}, {"x": 45, "y": 53, "w": 3, "h": 5},
    {"x": 30, "y": 48, "w": 2, "h": 4},
]
DOOR = {"id": "porta-ruinas-floresta", "orientation": "h", "col": 30, "row": 49, "rooms": ["rf-bosque", "entrada-ruinas"]}
SPAWN = {"col": 31, "row": 75}
ENEMIES = {
    "rf-trilha": [],
    "rf-clareira": [("CURSED_SAPLING", 9, 60), ("CURSED_SAPLING", 17, 61), ("CURSED_ENT", 13, 63), ("CURSED_SAPLING", 10, 65)],
    "rf-lago": [("CURSED_ENT", 42, 59), ("CURSED_SAPLING", 52, 60), ("CURSED_ENT", 52, 65), ("CURSED_SAPLING", 42, 65)],
    "rf-bosque": [("CURSED_ELDER", 31, 53), ("CURSED_ENT", 25, 55), ("CURSED_ENT", 37, 55), ("CURSED_SAPLING", 31, 57)],
}

grid = np.ones((ROWS, COLS), np.uint8)       # 1 = parede (mata fechada)
for r in ROOMS:
    q = r["rect"]
    grid[q["y"]:q["y"] + q["h"], q["x"]:q["x"] + q["w"]] = 0
for c in CORR:
    grid[c["y"]:c["y"] + c["h"], c["x"]:c["x"] + c["w"]] = 0
grid[:R0 - 1] = 1                            # parte das ruínas não é assunto deste script
grid[48, 30:32] = 0
base_open = grid.copy()

# o que não pode ser bloqueado: aberturas de corredores, porta, início e inimigos
keep = set()
for c in CORR:
    for y in range(c["y"] - 1, c["y"] + c["h"] + 1):
        for x in range(c["x"] - 1, c["x"] + c["w"] + 1):
            keep.add((x, y))
keep |= {(SPAWN["col"] + dx, SPAWN["row"] + dy) for dx in range(-2, 3) for dy in range(-2, 3)}
for lst in ENEMIES.values():
    for _, x, y in lst:
        keep |= {(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)}

walls = {r["id"]: [] for r in ROOMS}


def connected(g):
    fl = [(x, y) for y in range(R0, ROWS) for x in range(COLS) if not g[y, x]]
    if not fl:
        return True
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


# bordas orgânicas: mordidas nas bordas e cantos das salas
for r in ROOMS:
    q = r["rect"]
    x0, y0, x1, y1 = q["x"], q["y"], q["x"] + q["w"] - 1, q["y"] + q["h"] - 1
    for x in range(x0, x1 + 1):
        for y, d in ((y0, 1), (y1, -1)):
            if random.random() < .45:
                add_wall(r["id"], x, y)
                random.random() < .3 and add_wall(r["id"], x, y + d)
    for y in range(y0, y1 + 1):
        for x, d in ((x0, 1), (x1, -1)):
            if random.random() < .45:
                add_wall(r["id"], x, y)
                random.random() < .3 and add_wall(r["id"], x + d, y)
    for cx, cy, dx, dy in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        for a, b in ((0, 0), (dx, 0), (0, dy), (dx, dy), (2 * dx, 0), (0, 2 * dy)):
            add_wall(r["id"], cx + a, cy + b)

# lago no meio do Lago Sombrio (bloqueado, desenhado como água)
POND = set()
lq = ROOMS[2]["rect"]
pcx, pcy = lq["x"] + lq["w"] / 2 - .5, lq["y"] + lq["h"] / 2 - .5
for y in range(lq["y"], lq["y"] + lq["h"]):
    for x in range(lq["x"], lq["x"] + lq["w"]):
        if ((x - pcx) / 3.6) ** 2 + ((y - pcy) / 2.2) ** 2 <= 1 and add_wall("rf-lago", x, y):
            POND.add((x, y))
# moitas de árvores dentro das clareiras (cobertura)
CLUMP = set()
for rid, spots in (("rf-clareira", [(8, 58), (19, 65), (14, 59)]), ("rf-bosque", [(25, 52), (37, 52), (27, 58), (35, 58)]), ("rf-trilha", [(27, 71), (35, 76)])):
    for x, y in spots:
        for dx, dy in ((0, 0), (1, 0), (0, 1)):
            add_wall(rid, x + dx, y + dy) and CLUMP.add((x + dx, y + dy))

# ───────────────────────── chão assado ─────────────────────────
PW, PH = COLS * T, (ROWS - R0) * T
Y0 = R0 * T
floor = np.zeros((PH, PW), bool)
for y in range(R0, ROWS):
    for x in range(COLS):
        if not grid[y, x]:
            floor[(y - R0) * T:(y - R0 + 1) * T, x * T:(x + 1) * T] = True
water = np.zeros_like(floor)
for x, y in POND:
    water[(y - R0) * T:(y - R0 + 1) * T, x * T:(x + 1) * T] = True


def blur(m, r):
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
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


def tex(gid):
    t = tile(gid)
    im = Image.new("RGBA", (PW, PH))
    for y in range(0, PH, t.height):
        for x in range(0, PW, t.width):
            im.paste(t, (x, y))
    return np.array(im).astype(float)


grass_t, dirt_t, water_t = tex(5954), tex(6314), tex(1)
# máscaras orgânicas
gfield = blur(floor, 12) + vnoise(52, .24) + vnoise(16, .09) + vnoise(5, .035)
grass = gfield > .5
wfield = blur(water, 6) + vnoise(30, .12)
wat = (wfield > .55) & ~grass | (wfield > .62)
# trilha de terra ligando o início, os corredores e o portão
path = Image.new("L", (PW, PH), 0)
pd = ImageDraw.Draw(path)
PTS = [[(31, 77), (31, 73), (20, 73), (14, 73), (14, 66), (13, 62), (17, 54), (24, 54), (31, 55), (31, 49)],
       [(31, 73), (40, 73), (46, 73), (46, 66), (47, 61), (46, 54), (39, 54), (31, 55)]]
for line in PTS:
    pts = [((x + .5) * T, (y - R0 + .5) * T) for x, y in line]
    pd.line(pts, fill=255, width=44, joint="curve")
    for p in pts:
        pd.ellipse((p[0] - 22, p[1] - 22, p[0] + 22, p[1] + 22), fill=255)
pfield = blur(np.array(path) > 0, 8) + vnoise(24, .18) + vnoise(7, .07)
dirt = (pfield > .55) & grass

under = np.zeros((PH, PW, 4))
under[..., :3] = (20, 32, 22)
under[..., :3] *= (1 + vnoise(36, .25))[..., None]
under[..., 3] = 255
img = under.copy()
tone = (1 + vnoise(70, .08))[..., None]
gt2 = grass_t.copy()
gt2[..., :3] *= tone
img[grass] = gt2[grass]
img[dirt] = dirt_t[dirt]
img[wat] = water_t[wat]


def shift(m, dx, dy):
    o = np.zeros_like(m)
    H, W = m.shape
    o[max(0, dy):H + min(0, dy), max(0, dx):W + min(0, dx)] = m[max(0, -dy):H + min(0, -dy), max(0, -dx):W + min(0, -dx)]
    return o


def ring(m):
    d = m | shift(m, 1, 0) | shift(m, -1, 0) | shift(m, 0, 1) | shift(m, 0, -1)
    e = m & shift(m, 1, 0) & shift(m, -1, 0) & shift(m, 0, 1) & shift(m, 0, -1)
    return d, e


gd, ge = ring(grass)
img[gd & ~grass, :3] = (16, 30, 14)
img[(shift(grass, 0, 3) | shift(grass, 1, 2)) & ~gd, :3] *= .6
img[grass & ~ge & ~shift(grass, 0, 1), :3] = (120, 160, 70)
dd, de = ring(dirt)
img[dirt & ~de, :3] = img[dirt & ~de, :3] * .82
wd, we = ring(wat)
img[wd & ~wat, :3] = (40, 52, 30)
img[wat & ~we & ~shift(wat, 0, 1), :3] = (150, 190, 200)
base = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGBA")

# tufos de grama/manchas do pacote sobre o chão
GE = [g for k in ("grass_elements", "grass_elements2", "grass_elements3") for g in LAY.get(k, [])]
SP = LAY.get("spots1", []) + LAY.get("spots2", [])
LIL = LAY.get("water_lilies", [])
for _ in range(5200):
    x, y = random.randrange(0, PW - 32), random.randrange(0, PH - 32)
    cx, cy = x + 16, y + 16
    if grass[cy, cx] and not dirt[cy, cx] and ge[cy, cx]:
        if random.random() < .6 and GE:
            base.alpha_composite(tile(random.choice(GE)), (x, y))
    elif dirt[cy, cx] and random.random() < .25 and SP:
        base.alpha_composite(tile(random.choice(SP)), (x, y))
    elif wat[cy, cx] and we[cy, cx] and random.random() < .2 and LIL:
        base.alpha_composite(tile(random.choice(LIL)), (x, y))

# ───────────────────────── árvores e objetos ─────────────────────────
EDGE_BUSH = []
TREES = ["Tree1", "Tree2", "Tree3", "Tree5", "Tree6", "Tree11", "Tree4", "Tree7", "Tree8", "Tree9", "Tree12", "Tree13"]
DEAD = ["Broken_tree1", "Broken_tree2", "Broken_tree3"]
ROCKS = ["Light_stone_grass1", "Light_stone_grass2", "Light_stone_grass3", "Brown_stone_grass1", "Beige_stone_grass4"]
RUINS = ["Ruin_grass1", "Ruin_grass2", "Ruin_grass3", "Ruin_orange1", "Ruin_orange2", "Ruin_grass4", "Ruin_orange3"]
SMALL = ["Red_mushroom1", "Red_mushroom2", "Red_mushroom3", "Brown_mushroom1", "Brown_mushroom2", "Bush2", "Bush3", "Bush4",
         "Bush7", "Bush9", "Bush12", "Bush13", "Beige_stone_grass1", "Beige_stone_grass2", "Broken_tree4", "Broken_tree5", "Broken_tree6",
         "reeds1", "reeds2", "reeds3"]
FR = {}
for n in TREES + DEAD + ROCKS + RUINS + SMALL + ["Bush1", "Bush11"]:
    FR["rf-" + n] = obj(n, 1.5 if n in TREES or n in DEAD else S)


def cursed(im, k=1.0):
    a = np.array(im).astype(float)
    g = a[..., :3].mean(-1, keepdims=True)
    a[..., :3] = a[..., :3] * .72 + g * .28
    a[..., :3] *= np.array([.84, .86, .96]) * k
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


for k in list(FR):
    FR[k] = cursed(FR[k])

PROPS = []        # [chave, x, y(base)]
wallc = [(x, y) for y in range(R0, ROWS) for x in range(COLS) if grid[y, x] and (x, y) not in POND]


def near_floor(x, y, d=1):
    for dy in range(-d, d + 1):
        for dx in range(-d, d + 1):
            if 0 <= x + dx < COLS and R0 <= y + dy < ROWS and not grid[y + dy, x + dx]:
                return True
    return False


deep = []
for x, y in wallc:
    if (x, y) in CLUMP:
        PROPS.append([random.choice(["rf-Tree4", "rf-Tree7", "rf-Tree8", "rf-Tree9", "rf-Tree12", "rf-Tree13", "rf-Broken_tree2", "rf-Broken_tree3", "rf-Bush1", "rf-Bush11"]), x * T + 16, (y + 1) * T - 2])
    elif near_floor(x, y, 1):
        below_floor = any(0 <= x + dx < COLS and not grid[y - 1, x + dx] for dx in (-1, 0, 1)) and not any(0 <= x + dx < COLS and y + 1 < ROWS and not grid[y + 1, x + dx] for dx in (-1, 0, 1))
        if below_floor:
            # borda de baixo de uma sala: só moitas e pedras baixas (a copa não pode cobrir a clareira)
            random.random() < .7 and PROPS.append(["rf-" + random.choice(["Bush1", "Bush11", "Bush3", "Bush9", "Bush12", "Light_stone_grass3", "Brown_stone_grass1"]), x * T + 16 + random.randint(-6, 6), (y + 1) * T - random.randint(4, 12)])
            continue
        if random.random() < .62:
            k = random.choice(TREES + DEAD) if random.random() < .82 else random.choice(ROCKS)
            PROPS.append(["rf-" + k, x * T + 16 + random.randint(-8, 8), (y + 1) * T - random.randint(0, 8)])
    elif near_floor(x, y, 3):
        deep.append((x, y))
# moitas e capim alto ao longo de toda a borda (esconde a grade das salas)
for y in range(R0, ROWS):
    for x in range(COLS):
        if not grid[y, x] or (x, y) in POND:
            continue
        nb = [(dx, dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < COLS and R0 <= y + dy < ROWS and not grid[y + dy, x + dx]]
        for dx, dy in nb:
            for _ in range(2):
                if random.random() < .7:
                    k = random.choice(["rf-Bush1", "rf-Bush11", "rf-Bush3", "rf-Bush4", "rf-Bush7", "rf-Bush9", "rf-Bush12", "rf-Bush13", "rf-Bush2"])
                    t = FR[k]
                    px = x * T + 16 - dx * 6 + random.randint(-14, 14)
                    py = (y - R0) * T + 22 - dy * 6 + random.randint(-12, 12)
                    EDGE_BUSH.append((py, k, px))
for py, k, px in sorted(EDGE_BUSH):
    t = FR[k]
    base.alpha_composite(t, (max(0, px - t.width // 2), max(0, py - t.height // 2)))
# mata fechada: árvores assadas direto no chão (o herói nunca chega lá)
deep.sort(key=lambda p: p[1])
for x, y in deep:
    if random.random() < .55:
        t = FR["rf-" + random.choice(TREES[:6])]
        px, py = x * T + 16 + random.randint(-10, 10), (y - R0 + 1) * T
        base.alpha_composite(t, (px - t.width // 2, max(0, py - t.height)) if py - t.height >= 0 else (px - t.width // 2, 0))
# ruínas espalhadas, cogumelos e moitas no chão (sem colisão)
for rid, lst in (("rf-clareira", [("rf-Ruin_grass4", 7, 66), ("rf-Ruin_orange3", 20, 59)]), ("rf-bosque", [("rf-Ruin_grass5" if "rf-Ruin_grass5" in FR else "rf-Ruin_grass4", 23, 57), ("rf-Ruin_orange4" if "rf-Ruin_orange4" in FR else "rf-Ruin_orange3", 39, 57)]), ("rf-trilha", [("rf-Ruin_grass4", 36, 71)])):
    for k, x, y in lst:
        if k in FR and not grid[y, x]:
            grid[y, x] = 1
            if connected(grid) and (x, y) not in keep:
                walls[rid].append({"x": x, "y": y, "w": 1, "h": 1})
                PROPS.append([k, x * T + 16, (y + 1) * T - 2])
            else:
                grid[y, x] = 0
FLAT = []
for _ in range(900):
    x, y = random.randrange(0, PW), random.randrange(0, PH)
    if grass[y, x] and ge[y, x] and not dirt[y, x]:
        cx, cy = x // T, y // T + R0
        if not grid[cy, cx] and random.random() < .5:
            FLAT.append([random.choice(SMALL[:13]), x, y + Y0])
# os objetos pequenos vão para o chão assado (não atrapalham a leitura do combate)
for k, x, y in FLAT:
    t = FR["rf-" + k]
    base.alpha_composite(t, (x - t.width // 2, y - Y0 - t.height))

# grading final do chão: mais frio e escuro (maldição)
base = cursed(base, .94)

# chunks
CH = 512
meta_chunks = []
for cy in range(0, PH, CH):
    for cx in range(0, PW, CH):
        k = f"rfb-{cx // CH}-{cy // CH}"
        base.crop((cx, cy, min(PW, cx + CH), min(PH, cy + CH))).save(os.path.join(OUT, k + ".png"))
        meta_chunks.append([k, cx, cy + Y0])

# atlas de props usados
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
atlas.save(os.path.join(OUT, "rf-props.png"))
json.dump({"frames": {k: {"frame": {"x": x, "y": y, "w": w, "h": h}, "rotated": False, "trimmed": False,
                          "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h}, "sourceSize": {"w": w, "h": h}}
                      for k, (x, y, w, h) in pos.items()}, "meta": {"image": "rf-props.png", "size": {"w": AW, "h": atlas.height}, "scale": "1"}},
          open(os.path.join(OUT, "rf-props.json"), "w"))

# névoa: pontos nas bordas da mata e sobre o lago
FOG = []
for _ in range(140):
    x, y = random.randrange(0, COLS), random.randrange(R0, ROWS)
    if grid[y, x] and near_floor(x, y, 2) or (x, y) in POND:
        FOG.append([x * T + 16, y * T + 16])
meta = {"row0": R0, "chunks": meta_chunks, "props": PROPS, "fog": FOG[:90],
        "pond": [[x * T + 16, y * T + 16] for x, y in sorted(POND)]}
json.dump(meta, open(os.path.join(OUT, "rfb-meta.json"), "w"), separators=(",", ":"))

# ───────────────────────── salas do nível ─────────────────────────
DECOR = {"rf-trilha": [{"type": "torch", "col": 30, "row": 69}], "rf-bosque": [], "rf-clareira": [], "rf-lago": []}
LEVEL = {"rooms": [], "corridors": CORR, "door": DOOR, "spawn": SPAWN}
for r in ROOMS:
    LEVEL["rooms"].append({**r, "walls": walls[r["id"]], "enemies": [{"type": t, "col": x, "row": y} for t, x, y in ENEMIES[r["id"]]],
                           "decor": []})
json.dump(LEVEL, open(os.path.join(ROOT, "scripts", "ruins_forest_level.json"), "w"), ensure_ascii=False, indent=1)

# ───────────────────────── inimigos: Árvores Amaldiçoadas ─────────────────────────
def ent_sheet(n, tint=None):
    P = os.path.join(EP, "PNG", n, "Without_shadow")
    A = {a: Image.open(os.path.join(P, f"{n}_{a}_without_shadow.png")).convert("RGBA") for a in ("Idle", "Walk", "Run", "Attack", "Hurt", "Death")}
    row = 3 * 128      # olhando para a direita
    fr = lambda a, i: A[a].crop((i * 128, row, i * 128 + 128, row + 128))
    seq = [fr("Idle", i) for i in range(4)] + [fr("Walk", i) for i in range(6)] + [fr("Run", i) for i in range(6)] + \
          [fr("Idle", 0)] + [fr("Attack", 0), fr("Attack", 1)] + [fr("Attack", 3), fr("Attack", 4)] + [fr("Attack", 6)] + \
          [fr("Hurt", 1), fr("Hurt", 2)] + [fr("Death", i) for i in (1, 3, 4, 5)]
    bb = None
    for f in seq:
        b = f.getbbox()
        if b:
            bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    # mantém o centro horizontal no meio do quadro (o jogo espelha o sprite)
    cx = 64
    half = max(cx - bb[0], bb[2] - cx) + 2
    box = (cx - half, bb[1] - 2, cx + half, bb[3] + 2)
    w, h = box[2] - box[0], box[3] - box[1]
    out = Image.new("RGBA", (w * len(seq), h))
    for i, f in enumerate(seq):
        c = f.crop(box)
        if tint:
            a = np.array(c).astype(float)
            a[..., :3] = a[..., :3] * tint
            c = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")
        out.alpha_composite(c, (i * w, 0))
    return out, w, h


SHEETS = {}
for i, (n, tint) in enumerate((("Ent1", (1.0, .9, 1.05)), ("Ent2", (.92, .9, 1.0)), ("Ent3", (.86, .84, .98))), 1):
    im, w, h = ent_sheet(n, tint)
    im.save(os.path.join(EN, f"cursed-ent{i}.png"))
    SHEETS[f"cursed-ent{i}"] = [w, h]
json.dump(SHEETS, open(os.path.join(ROOT, "scripts", "ruins_forest_sheets.json"), "w"))

# espelho em "Projeto atualizado"
import shutil
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art")
if os.path.isdir(MIR):
    shutil.rmtree(os.path.join(MIR, "ruins-forest"), ignore_errors=True)
    shutil.copytree(OUT, os.path.join(MIR, "ruins-forest"))
    for k in SHEETS:
        shutil.copy(os.path.join(EN, k + ".png"), os.path.join(MIR, "enemies", k + ".png"))

# prévia
prev = base.copy()
for k, x, y in sorted(PROPS, key=lambda p: p[2]):
    t = FR[k]
    prev.alpha_composite(t, (int(x - t.width / 2), int(y - Y0 - t.height)) if y - Y0 - t.height >= 0 else (int(x - t.width / 2), 0))
prev.resize((PW // 2, PH // 2)).save(os.path.join(ROOT, "scripts", "ruins_forest_preview.png"))
print("floresta das ruínas gerada", PW, PH, "props", len(PROPS), "sheets", SHEETS, "lago", len(POND))
