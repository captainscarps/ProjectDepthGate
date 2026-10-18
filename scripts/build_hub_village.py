"""
Refúgio jogável: vila do ferreiro (pacote craftpix "Pixel Blacksmith House" + pacote da cabana já usado no jogo).

Gera em assets/pixel-art/hub/village/:
  ground.png            chão da vila (pavimento, muralha, canteiros, sombras) — estático
  house.png             casa do ferreiro (24 quadros: 0-11 portas fechadas / 12-23 abertas, bandeiras ao vento)
  house-table.png, house-cart.png   peças da frente da casa (ordenadas por profundidade)
  interior.png          interior da forja (12 quadros: tochas, fogo, luz) — parte de baixo
  interior-front.png    interior da forja (12 quadros) — parte que fica na frente do herói
  props.png + props.json  atlas com árvores, pedras, caixas, cabana, etc.
  smith-*.png, girl.png, smoke.png, anvil.png, hunter-*.png, dog.png   personagens animados
  village.json          mapa: tamanho, colisão (grade de 8px), props, NPCs, pontos de interação

Uso: python3 scripts/build_hub_village.py <pasta-do-pacote-blacksmith>
     (a pasta que contém Tiled_files/ e PNG/)
"""
import json
import os
import random
import re
import sys
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HUB_PACK", "")
assert PACK and os.path.isdir(os.path.join(PACK, "Tiled_files")), "informe a pasta do pacote Blacksmith"
LODGE = os.path.join(ROOT, "assets", "pixel-art", "scenery", "lodge")
OUT = os.path.join(ROOT, "assets", "pixel-art", "hub", "village")
os.makedirs(OUT, exist_ok=True)
random.seed(7)
T = 16

# ───────────────────────────── leitor de TMX (com espelhamento e animação) ─────────────────────────────
FH, FV, FD = 0x80000000, 0x40000000, 0x20000000


class TMX:
    def __init__(s, path):
        s.base = os.path.dirname(path)
        r = ET.parse(path).getroot()
        s.tw = int(r.get("tilewidth"))
        s.sets, s.anim, s.layers, s.cache = [], {}, [], {}
        for ts in r.findall("tileset"):
            fg = int(ts.get("firstgid"))
            img = Image.open(os.path.join(s.base, ts.find("image").get("source"))).convert("RGBA")
            s.sets.append((fg, int(ts.get("columns")), img))
            for t in ts.findall("tile"):
                a = t.find("animation")
                if a is not None:
                    s.anim[fg + int(t.get("id"))] = [(fg + int(f.get("tileid")), int(f.get("duration"))) for f in a.findall("frame")]
        s.sets.sort(key=lambda x: x[0])

        def lay(node):
            d, g = node.find("data"), {}
            for c in (d.findall("chunk") or [d]):
                x0, y0, w = int(c.get("x", 0)), int(c.get("y", 0)), int(c.get("width", r.get("width")))
                for i, v in enumerate(int(v) for v in re.split(r"[\s,]+", c.text.strip()) if v):
                    if v:
                        g[(x0 + i % w, y0 + i // w)] = v
            return g

        def walk(n):
            for ch in n:
                if ch.tag == "layer":
                    s.layers.append((ch.get("name"), lay(ch)))
                elif ch.tag == "group":
                    walk(ch)
        walk(r)

    def tile(s, raw, t_ms=0):
        gid = raw & 0x1FFFFFFF
        if gid in s.anim:
            fr = s.anim[gid]
            m = t_ms % sum(d for _, d in fr)
            for g, d in fr:
                if m < d:
                    gid = g
                    break
                m -= d
        key = (gid, raw & (FH | FV | FD))
        if key not in s.cache:
            fg, cols, img = [t for t in s.sets if t[0] <= gid][-1]
            lid = gid - fg
            t = img.crop(((lid % cols) * T, (lid // cols) * T, (lid % cols + 1) * T, (lid // cols + 1) * T))
            if raw & FD:
                t = t.transpose(Image.TRANSPOSE)
            if raw & FH:
                t = t.transpose(Image.FLIP_LEFT_RIGHT)
            if raw & FV:
                t = t.transpose(Image.FLIP_TOP_BOTTOM)
            s.cache[key] = t
        return s.cache[key]

    def render(s, names, box, t_ms=0, cell=None, times=None):
        x0, y0, x1, y1 = box
        im = Image.new("RGBA", ((x1 - x0) * T, (y1 - y0) * T), (0, 0, 0, 0))
        for n, g in s.layers:
            if n not in names:
                continue
            tm = (times or {}).get(n, t_ms)
            for (x, y), raw in g.items():
                if x0 <= x < x1 and y0 <= y < y1 and (cell is None or cell(n, x, y)):
                    im.alpha_composite(s.tile(raw, tm), ((x - x0) * T, (y - y0) * T))
        return im


def strip(frames):
    w, h = frames[0].size
    im = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        im.alpha_composite(f, (i * w, 0))
    return im


EXT = TMX(os.path.join(PACK, "Tiled_files", "Blacksmith_house_exterior.tmx"))
INT = TMX(os.path.join(PACK, "Tiled_files", "Blacksmith_house_interior.tmx"))
STREET = EXT  # mesmo conjunto de tiles (Walls_street = gid 1..378, Decorative_cracks 379..)

# ───────────────────────────── mundo ─────────────────────────────
W, H = 64, 44                       # em tiles de 16px
G = 8                               # grade de colisão
GW, GH = W * T // G, H * T // G
coll = [[0] * GW for _ in range(GH)]


def block_px(x0, y0, x1, y1):
    for gy in range(max(0, int(y0) // G), min(GH, (int(y1) + G - 1) // G)):
        for gx in range(max(0, int(x0) // G), min(GW, (int(x1) + G - 1) // G)):
            coll[gy][gx] = 1


ground = Image.new("RGBA", (W * T, H * T), (40, 36, 30, 255))
tiles = {}


def put(x, y, gid, layer=0):
    tiles.setdefault((x, y), []).append(gid)


# pavimento: blocos 3x3 alinhados (padrão do pacote) com variações lisas
BLOCK = [(328, 329, 330), (349, 350, 351), (370, 371, 372)]
PLAIN = [275, 275, 275, 278, 281, 284, 276, 277]
for by in range(9, H, 3):
    for bx in range(0, W, 3):
        r = random.random()
        for j in range(3):
            for i in range(3):
                x, y = bx + i, by + j
                if x >= W or y >= H:
                    continue
                put(x, y, BLOCK[j][i] if r < .72 else random.choice(PLAIN))
# muralha da cidade + faixa de grama (topo)
SLAB = [204] * 12 + [205, 206, 225, 226, 227, 228]
for x in range(W):
    for y in range(0, 3):
        tiles[(x, y)] = [random.choice(SLAB)]
    tiles[(x, 3)] = [44]
    tiles[(x, 4)] = [65 if random.random() > .12 else random.choice([437, 380, 608])]
    tiles[(x, 5)] = [(120, 121, 122)[x % 3]]
    tiles[(x, 6)] = [193]
    tiles[(x, 7)] = [193]
    tiles[(x, 8)] = [random.choice([214, 214, 214, 219, 220, 221])]
block_px(0, 0, W * T, 9 * T - 2)
block_px(0, 0, 12, H * T)
block_px(W * T - 12, 0, W * T, H * T)
block_px(0, H * T - 14, W * T, H * T)


# canteiros (9-slice da grama com borda de pedra)
def bed(x0, y0, w, h, solid=True):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            col = 0 if x == x0 else 2 if x == x0 + w - 1 else 1
            row = 0 if y == y0 else 2 if y == y0 + h - 1 else 1
            tiles[(x, y)] = [((171, 172, 173), (192, 193, 194), (213, 214, 215))[row][col]]
    if solid:
        block_px(x0 * T + 2, y0 * T + 2, (x0 + w) * T - 2, (y0 + h) * T - 4)


# gramados (andáveis) e canteiros (sólidos)
for b in [(0, 10, 20, 12), (44, 10, 20, 12), (0, 30, 20, 14), (44, 30, 20, 14)]:
    bed(*b, solid=False)
BEDS = [(22, 41, 7, 3), (35, 41, 7, 3), (24, 23, 3, 3), (37, 23, 3, 3)]
for b in BEDS:
    bed(*b)

# render do chão
for (x, y), gs in tiles.items():
    for g in gs:
        ground.alpha_composite(STREET.tile(g), (x * T, y * T))
# detalhes: folhas perto da grama e tijolinhos soltos
LEAF = [245, 246, 247, 248, 249, 250, 266, 267, 268, 269, 270, 287, 288, 289, 290, 291, 308, 309, 310]
BRICK = [331, 332, 333, 334, 335, 352, 353, 354, 355, 356, 373, 374, 375, 376, 377]
for y in range(9, H):
    for x in range(W):
        near = any(tiles.get((x + dx, y + dy), [0])[0] in (192, 193, 194, 171, 172, 173, 213, 214, 215) for dx in (-1, 0, 1) for dy in (-1, 0, 1))
        if near and random.random() < .22:
            ground.alpha_composite(STREET.tile(random.choice(LEAF)), (x * T, y * T))
        elif random.random() < .05 and tiles.get((x, y), [0])[0] not in (171, 172, 173, 192, 193, 194, 213, 214, 215):
            ground.alpha_composite(STREET.tile(random.choice(BRICK)), (x * T, y * T))
for x in range(W):
    if random.random() < .35:
        ground.alpha_composite(STREET.tile(random.choice(LEAF)), (x * T, 9 * T))

# ───────────────────────────── casa do ferreiro ─────────────────────────────
OX, OY = 30 * T, 13 * T             # origem (0,0) do TMX exterior no mundo
HB = (-5, -4, 8, 6)                 # caixa da casa (tiles do TMX)
HX, HY = OX + HB[0] * T, OY + HB[1] * T


def body_cell(n, x, y):
    if n == "Canopy_sign" and y > 6:
        return False
    if n == "Boxes_carts":
        return x <= -3
    return True


BODY = ["House_walls", "Flags", "roof", "Canopy_sign", "Boxes_carts"]
house = []
for state in (0, 11 * 150):       # portas fechadas / abertas
    for k in range(12):
        house.append(EXT.render(BODY, HB, k * 150, cell=body_cell, times={"House_walls": state}))
strip(house).save(os.path.join(OUT, "house.png"))
EXT.render(["Table", "stool"], HB).crop((5 * T, 8 * T, 10 * T, 10 * T)).save(os.path.join(OUT, "house-table.png"))
EXT.render(["Boxes_carts"], HB, cell=lambda n, x, y: x >= 4).crop((9 * T, 5 * T, 13 * T, 10 * T)).save(os.path.join(OUT, "house-cart.png"))
# sombra da casa no chão
ground.alpha_composite(EXT.render(["House_shadow"], HB), (HX, HY))
# colisão da casa
block_px(OX - 3 * T, OY - 1 * T, OX + 5 * T, OY + 5 * T - 2)       # paredes
block_px(OX - 5 * T, OY + 2 * T, OX - 3 * T, OY + 5 * T - 2)       # lenha
block_px(OX + 4 * T + 2, OY + 3 * T, OX + 8 * T - 2, OY + 6 * T - 2)   # carrinho de carvão
block_px(OX + 0 * T, OY + 4 * T, OX + 5 * T, OY + 6 * T - 2)       # balcão + aprendiz
DOOR = {"x": OX - T, "y": OY + 5 * T + 4}                          # na frente da porta

# ───────────────────────────── interior ─────────────────────────────
IB = (-9, -10, 11, 4)               # 20x14 tiles
BASE_L = ["Floor", "Walls", "Floor_light", "Various_objects", "Torches_back", "Boxes_grindstone_barrel_rack",
          "Forge_pillars_boxes", "Bellows_tannery_rack_table", "Tables_shields_w_weapon"]
FRONT_L = ["Torches_pillar_n_front", "Walls_top"]
OBJ_L = ["Various_objects", "Boxes_grindstone_barrel_rack", "Forge_pillars_boxes", "Bellows_tannery_rack_table", "Tables_shields_w_weapon"]
ib, ifr = [], []
for k in range(12):
    ib.append(INT.render(BASE_L, IB, k * 150, cell=lambda n, x, y: not (n in OBJ_L and y >= 0)))
    ifr.append(INT.render(FRONT_L + OBJ_L, IB, k * 150, cell=lambda n, x, y: n in FRONT_L or y >= 0))
def clear_void(im):
    """apaga o cinza-escuro de preenchimento que encosta na borda (fica a cor de fundo da câmera)"""
    from collections import deque
    px, (w, h) = im.load(), im.size
    VOID = px[0, 0][:3]
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    seen = set()
    while q:
        x, y = q.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        if px[x, y][3] and px[x, y][:3] == VOID:
            px[x, y] = (0, 0, 0, 0)
            q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


ib = [clear_void(f) for f in ib]
strip(ib).save(os.path.join(OUT, "interior.png"))
strip(ifr).save(os.path.join(OUT, "interior-front.png"))
# interior fica fora do mapa, à direita
IX, IY = W * T + 160, 40
ICOLL_OFF = (IX, IY)
iw, ih = (IB[2] - IB[0]) * T, (IB[3] - IB[1]) * T


def itile(x, y):           # canto do tile (coord. TMX) no mundo
    return IX + (x - IB[0]) * T, IY + (y - IB[1]) * T


# colisão do interior: tudo bloqueado, depois libera o chão e bloqueia os móveis
IGW, IGH = iw // G, ih // G
icoll = [[1] * IGW for _ in range(IGH)]


def ifree(x0, y0, x1, y1, v=0):
    for ty in range(y0, y1 + 1):
        for tx in range(x0, x1 + 1):
            gx, gy = (tx - IB[0]) * 2, (ty - IB[1]) * 2
            for a in (0, 1):
                for b in (0, 1):
                    icoll[gy + a][gx + b] = v


ifree(-7, -4, 9, 2)                 # chão
ifree(-4, -5, -2, -5)               # perto do monte de carvão
ifree(-1, -5, 3, -5)                # boca da forja
ifree(-6, 3, -5, 3)                 # porta
for r in [(-7, -4, -7, -3), (-8, -2, -5, 0), (-3, -3, -1, -2), (0, -2, 2, -1), (4, -2, 4, -1), (5, -4, 7, -3),
          (8, -5, 9, -1), (-7, 1, -7, 2), (-3, 1, 0, 2), (1, 1, 3, 2), (4, 1, 7, 2), (8, 1, 9, 2), (-4, 2, -4, 2)]:
    ifree(*r, v=1)

# ───────────────────────────── atlas de props ─────────────────────────────
EO = Image.open(os.path.join(LODGE, "Exterior_objects.png")).convert("RGBA")
TR = Image.open(os.path.join(LODGE, "Trees_rocks.png")).convert("RGBA")
SRC = {
    "cabin": (EO, (9, 117, 157, 267)), "crate": (EO, (2, 430, 31, 465)), "crate2": (EO, (36, 432, 62, 464)),
    "crate3": (EO, (69, 433, 92, 462)), "crate-tall": (EO, (289, 422, 318, 460)), "sack": (EO, (5, 470, 27, 492)),
    "sack2": (EO, (37, 467, 61, 494)), "coal": (EO, (67, 463, 93, 496)), "veg": (EO, (99, 464, 123, 495)),
    "stump": (EO, (192, 436, 222, 461)), "stump-axe": (EO, (224, 432, 254, 465)), "logs": (EO, (164, 338, 205, 385)),
    "stakes": (EO, (147, 426, 180, 454)), "rope": (EO, (180, 391, 219, 432)), "hide-crate": (EO, (127, 371, 165, 422)),
    "boxes": (EO, (265, 339, 313, 411)), "chimney": (EO, (265, 421, 286, 457)),
    "tree-a": (TR, (0, 0, 64, 82)), "pine-a": (TR, (66, 0, 129, 82)), "tree-b": (TR, (132, 0, 198, 82)),
    "tree-c": (TR, (212, 6, 267, 74)), "tree-d": (TR, (276, 5, 333, 73)), "tree-e": (TR, (345, 8, 400, 76)),
    "pine-b": (TR, (410, 0, 477, 82)), "pine-c": (TR, (488, 11, 540, 74)), "tree-f": (TR, (4, 85, 70, 168)),
    "tree-g": (TR, (91, 86, 157, 169)), "tree-s1": (TR, (323, 86, 366, 139)), "tree-s2": (TR, (369, 86, 412, 139)),
    "tree-s3": (TR, (429, 83, 472, 136)), "tree-s4": (TR, (504, 142, 544, 197)), "tree-s5": (TR, (274, 154, 314, 209)),
    "rock-a": (TR, (320, 149, 384, 206)), "rock-b": (TR, (390, 150, 440, 198)), "rock-c": (TR, (478, 84, 544, 144)),
    "rock-s1": (TR, (99, 181, 123, 207)), "rock-s2": (TR, (162, 181, 190, 209)), "rock-s3": (TR, (265, 221, 298, 254)),
    "bush-a": (TR, (161, 146, 192, 173)), "bush-b": (TR, (450, 157, 490, 199)), "bush-c": (TR, (0, 175, 33, 208)),
    "bush-d": (TR, (340, 220, 375, 255)), "bush-e": (TR, (393, 223, 426, 256)), "bush-f": (TR, (120, 264, 151, 291)),
    "bush-g": (TR, (82, 266, 115, 299)),
}
FRAMES = {}
for k, (img, b) in SRC.items():
    FRAMES[k] = img.crop(b)


# boneco de treino, mural e placa (desenhados à mão no mesmo estilo)
def dummy():
    im = Image.new("RGBA", (26, 42), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((5, 36, 21, 41), fill=(0, 0, 0, 70))
    d.rectangle((12, 14, 14, 39), fill=(92, 60, 36, 255))
    d.rectangle((12, 14, 12, 39), fill=(124, 84, 50, 255))
    d.rectangle((3, 15, 23, 18), fill=(110, 74, 44, 255))
    d.rectangle((3, 15, 23, 15), fill=(146, 104, 62, 255))
    d.ellipse((6, 13, 20, 32), fill=(196, 160, 86, 255), outline=(120, 90, 40, 255))
    for yy in (18, 23, 28):
        d.line((8, yy, 18, yy), fill=(160, 124, 60, 255))
    d.ellipse((8, 2, 18, 13), fill=(214, 182, 104, 255), outline=(120, 90, 40, 255))
    d.line((10, 7, 12, 7), fill=(90, 50, 30, 255))
    d.line((14, 7, 16, 7), fill=(90, 50, 30, 255))
    d.rectangle((6, 22, 20, 24), fill=(150, 40, 40, 255))
    return im


def board():
    im = Image.new("RGBA", (40, 44), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((4, 39, 36, 43), fill=(0, 0, 0, 70))
    d.rectangle((5, 18, 7, 41), fill=(84, 54, 32, 255))
    d.rectangle((33, 18, 35, 41), fill=(84, 54, 32, 255))
    d.rectangle((1, 3, 39, 29), fill=(104, 68, 40, 255), outline=(58, 36, 22, 255))
    d.rectangle((3, 5, 37, 27), fill=(132, 90, 54, 255))
    for x0, y0, x1, y1, c in [(5, 7, 14, 17, (232, 220, 190)), (16, 6, 26, 14, (240, 230, 200)), (28, 8, 35, 19, (222, 206, 170)),
                              (8, 18, 18, 25, (236, 224, 196)), (21, 16, 31, 25, (228, 214, 182))]:
        d.rectangle((x0, y0, x1, y1), fill=c + (255,))
        for yy in range(y0 + 2, y1 - 1, 2):
            d.line((x0 + 2, yy, x1 - 2, yy), fill=(120, 110, 96, 255))
        d.point(((x0 + x1) // 2, y0), fill=(190, 40, 40, 255))
    d.rectangle((0, 0, 39, 3), fill=(70, 46, 28, 255))
    return im


def sign():
    im = Image.new("RGBA", (36, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((10, 35, 26, 39), fill=(0, 0, 0, 70))
    d.rectangle((16, 8, 19, 37), fill=(84, 54, 32, 255))
    d.polygon([(2, 9), (8, 3), (32, 3), (32, 15), (8, 15)], fill=(132, 90, 54, 255), outline=(58, 36, 22, 255))
    d.line((10, 9, 28, 9), fill=(232, 210, 160, 255))
    d.line((10, 9, 13, 6), fill=(232, 210, 160, 255))
    d.line((10, 9, 13, 12), fill=(232, 210, 160, 255))
    d.polygon([(34, 23), (28, 17), (4, 17), (4, 29), (28, 29)], fill=(118, 80, 48, 255), outline=(58, 36, 22, 255))
    return im


def stones_ring():
    im = Image.new("RGBA", (96, 40), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((2, 4, 94, 38), fill=(70, 62, 86, 255), outline=(40, 34, 52, 255))
    d.ellipse((8, 8, 88, 34), fill=(96, 86, 118, 255))
    d.ellipse((16, 12, 80, 30), fill=(58, 46, 84, 255))
    for a in range(10):
        import math
        x = 48 + 43 * math.cos(a / 10 * 6.283)
        y = 21 + 16 * math.sin(a / 10 * 6.283)
        d.ellipse((x - 5, y - 4, x + 5, y + 3), fill=(150, 142, 160, 255), outline=(60, 54, 70, 255))
    return im


FRAMES["dummy"] = dummy()
FRAMES["board"] = board()
FRAMES["sign"] = sign()
FRAMES["ring"] = stones_ring()

# empacota o atlas
order = sorted(FRAMES, key=lambda k: -FRAMES[k].height)
AW, x, y, rowh, pos = 512, 0, 0, 0, {}
for k in order:
    w, h = FRAMES[k].size
    if x + w > AW:
        x, y, rowh = 0, y + rowh + 1, 0
    pos[k] = (x, y, w, h)
    x += w + 1
    rowh = max(rowh, h)
atlas = Image.new("RGBA", (AW, y + rowh + 1), (0, 0, 0, 0))
for k, (x, y, w, h) in pos.items():
    atlas.alpha_composite(FRAMES[k], (x, y))
atlas.save(os.path.join(OUT, "props.png"))
json.dump({"frames": {k: {"frame": {"x": x, "y": y, "w": w, "h": h}, "rotated": False, "trimmed": False,
                          "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h}, "sourceSize": {"w": w, "h": h}}
                      for k, (x, y, w, h) in pos.items()},
           "meta": {"image": "props.png", "size": {"w": atlas.width, "h": atlas.height}, "scale": "1"}},
          open(os.path.join(OUT, "props.json"), "w"))

# ───────────────────────────── colocação dos props ─────────────────────────────
PROPS = []


def prop(k, x, y, solid=True, foot=None):
    """x = centro, y = base (pés). foot = (meia-largura, altura) da área sólida."""
    w, h = FRAMES[k].size
    PROPS.append([k, x, y])
    if solid:
        fw, fh = foot or (max(4, w // 2 - 6), 10)
        block_px(x - fw, y - fh, x + fw, y)


# cabana do caçador (gramado de cima, à esquerda)
prop("cabin", 132, 300, foot=(70, 70))
prop("stump-axe", 278, 304, foot=(10, 8))
prop("logs", 306, 296, foot=(14, 8))
prop("hide-crate", 64, 334, foot=(14, 8))
prop("sack", 88, 342, foot=(8, 6))
prop("chimney", 296, 250, foot=(8, 6))
# barraca do vendedor (praça, à esquerda)
for k, x, y in [("crate", 334, 418), ("crate2", 350, 438), ("veg", 448, 430), ("sack2", 464, 442), ("coal", 322, 440)]:
    prop(k, x, y, foot=(10, 7))
# mural, caixas
prop("board", 648, 300, foot=(16, 6))
prop("boxes", 680, 420, foot=(18, 10))
prop("crate", 708, 414, foot=(10, 7))
# área de treino (gramado de baixo, à esquerda)
prop("dummy", 120, 584, foot=(6, 5))
prop("dummy", 184, 596, foot=(6, 5))
prop("dummy", 248, 584, foot=(6, 5))
prop("stakes", 300, 560, foot=(12, 6))
prop("crate-tall", 60, 560, foot=(12, 8))
prop("rope", 68, 600, solid=False)
# fogueira, portal, saída
prop("stump", 476, 470, foot=(10, 6))
prop("stump", 548, 470, foot=(10, 6))
prop("logs", 512, 500, foot=(14, 6))
prop("ring", 512, 652, solid=False)
prop("sign", 952, 620, foot=(6, 5))
# árvores nas bordas dos gramados
def tree(k, x, y):
    prop(k, x, y, foot=(7, 6))
for y in range(176, 352, 56):
    tree(random.choice(["tree-a", "tree-c", "tree-d", "pine-c", "tree-f"]), 30 + random.randint(-4, 4), y + 30)
    tree(random.choice(["tree-b", "tree-c", "tree-e", "pine-a", "tree-g"]), W * T - 30 + random.randint(-4, 4), y + 30)
for y in range(500, 700, 56):
    tree(random.choice(["tree-a", "tree-c", "tree-d", "pine-c", "tree-f"]), 30 + random.randint(-4, 4), y + 20)
    tree(random.choice(["tree-b", "tree-d", "tree-e", "pine-b", "tree-g"]), W * T - 30 + random.randint(-4, 4), y + 20)
for x in range(80, 320, 50):
    tree(random.choice(["tree-s1", "tree-s2", "tree-s3", "pine-c", "tree-s4"]), x, 700)
for x in range(760, 960, 50):
    tree(random.choice(["tree-s1", "tree-s2", "tree-s3", "pine-c", "tree-s5"]), x, 700)
for k, x, y in [("tree-d", 820, 560), ("pine-b", 880, 520), ("tree-c", 760, 600), ("tree-s2", 360, 200), ("tree-s3", 680, 200)]:
    tree(k, x, y)
for k, x, y in [("bush-a", 392, 380), ("bush-d", 512, 380), ("bush-e", 616, 380), ("bush-f", 760, 186), ("bush-g", 932, 190),
                ("bush-c", 724, 560), ("bush-b", 916, 600), ("bush-a", 330, 520), ("bush-f", 310, 640), ("bush-d", 386, 696),
                ("bush-e", 640, 696), ("bush-g", 768, 340), ("bush-a", 948, 340)]:
    prop(k, x, y, solid=False)
for k, x, y in [("rock-a", 900, 300), ("rock-s1", 940, 318), ("rock-s3", 80, 520), ("rock-b", 840, 640), ("rock-s2", 300, 676)]:
    prop(k, x, y, foot=(12, 8))

# ───────────────────────────── personagens (folhas de sprite) ─────────────────────────────
P = lambda *a: os.path.join(PACK, "PNG", *a)
COPY = {
    "smith-idle.png": P("Smith", "Idle_Walk", "Smith_idle_with_shadow.png"),
    "smith-walk.png": P("Smith", "Idle_Walk", "Smith_walk_with_shadow.png"),
    "smith-forge.png": P("Smith", "Forge", "full", "Smith_forge_full.png"),
    "smith-forge-idle.png": P("Smith", "Forge", "full", "Smith_forge_idle_full.png"),
    "smith-take.png": P("Smith", "Forge", "full", "Smith_forge_taking_tools_full.png"),
    "smith-leave.png": P("Smith", "Forge", "full", "Smith_forge_leaving_tools-full.png"),
    "anvil.png": P("Smith", "Forge", "Anvil.png"),
    "girl.png": P("Girl_animation.png"),
    "smoke.png": P("Smoke_animation.png"),
    "hunter-tans.png": os.path.join(LODGE, "Hunter_tans_outside.png"),
    "hunter-take.png": os.path.join(LODGE, "Hunter_taking_knife_outside.png"),
    "hunter-leave.png": os.path.join(LODGE, "Hunter_leaving_knife_outside.png"),
    "dog.png": os.path.join(LODGE, "Dog_animation.png"),
}
for dst, src in COPY.items():
    Image.open(src).convert("RGBA").save(os.path.join(OUT, dst))

# colisões dos NPCs fixos
block_px(400 - 30, 394, 400 + 30, 420)            # barraca
block_px(232 - 18, 286, 232 + 18, 302)            # curtidor + varal
block_px(820 - 22, 262, 820 + 22, 282)            # santuário
block_px(512 - 16, 444, 512 + 16, 458)            # fogueira
block_px(512 - 22, 630, 512 + 22, 646)            # portal

ground.save(os.path.join(OUT, "ground.png"))

# ───────────────────────────── mapa ─────────────────────────────
ix = lambda x: IX + (x - IB[0]) * T
iy = lambda y: IY + (y - IB[1]) * T
meta = {
    "w": W * T, "h": H * T, "g": G,
    "coll": ["".join(map(str, r)) for r in coll],
    "interior": {"x": IX, "y": IY, "w": iw, "h": ih, "coll": ["".join(map(str, r)) for r in icoll],
                 "spawn": [ix(-6) + T, iy(2) + 8], "door": [ix(-6) + T, iy(3) + 10],
                 "smith": {"anvil": [ix(0) + 24, iy(-1) + 16], "stand": [ix(1) + 8, iy(-4) + 12],
                           "forge": [ix(1) + 8, iy(-5) + 12], "tub": [ix(-2) + 8, iy(-4) + 12],
                           "grind": [ix(4) + 8, iy(-4) + 12], "rack": [ix(6) + 8, iy(0) + 12]},
                 "spots": {"forge": [ix(1) + 8, iy(-5) + 4], "tub": [ix(-2) + 8, iy(-3) + 4], "rack": [ix(5) + 8, iy(1) + 4],
                           "grind": [ix(6) + 8, iy(-3) + 4]}},
    "house": {"x": HX, "y": HY, "w": (HB[2] - HB[0]) * T, "h": (HB[3] - HB[1]) * T, "base": OY + 5 * T,
              "table": [OX + 0 * T, OY + 4 * T, OY + 6 * T], "cart": [OX + 4 * T, OY + 1 * T, OY + 6 * T],
              "smoke": [OX + 2 * T, OY - 7 * T], "girl": [OX + 3 * T + 16, OY + 6 * T], "door": [DOOR["x"], DOOR["y"]]},
    "spawn": [DOOR["x"], DOOR["y"] + 26],
    "props": PROPS,
    "spots": {
        "vendor": [400, 420], "hunter": [232, 302], "board": [648, 300], "shrine": [820, 282], "campfire": [512, 458],
        "portal": [512, 646], "sign": [952, 620], "cabin": [150, 300], "dummy1": [120, 584], "dummy2": [184, 596],
        "dummy3": [248, 584], "girl": [544, 304],
    },
    "lamps": [[344, 352], [680, 352], [344, 560], [680, 560], [430, 600], [594, 600]],
    "dog": [[440, 520], [590, 520], [600, 420], [470, 400], [330, 470], [700, 470], [512, 560], [240, 340]],
}
json.dump(meta, open(os.path.join(OUT, "village.json"), "w"), separators=(",", ":"))

# prévia para conferência
# espelho em "Projeto atualizado"
import shutil
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "hub", "village")
if os.path.isdir(os.path.dirname(MIR)):
    shutil.rmtree(MIR, ignore_errors=True)
    shutil.copytree(OUT, MIR)

prev = ground.copy()
d = ImageDraw.Draw(prev)
for gy in range(GH):
    for gx in range(GW):
        if coll[gy][gx]:
            d.rectangle((gx * G, gy * G, gx * G + G - 1, gy * G + G - 1), outline=(255, 0, 0, 90))
prev.save(os.path.join(ROOT, "scripts", "hub_village_preview.png"))
print("vila gerada:", W * T, "x", H * T, "props", len(PROPS))
