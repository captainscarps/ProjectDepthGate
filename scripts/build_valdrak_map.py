"""
Mapa da Valdrak antiga (missão "O Rei que Abriu as Portas", arco do príncipe) — versão orgânica.
Pinta o chão como o pacote de vila da referência: caminhos de pedra com bordas que seguem o contorno de
cada pedra (células de Voronoi), praça irregular, rio sinuoso com margem de terra e pedras, lago, canteiros
de contorno natural, grama com tufos, flores e pedrinhas, cerca de estacas acompanhando curvas e a mata
em grupos. Objetos da vila em escala 1:1 dobrada; fazenda e taberna dobradas (mesma escala dos personagens).
Saída:
  assets/pixel-art/valdrak/map/ground.png · props.png/.json · map.json (objetos, colisão 16 px, pontos da história)
Os personagens da taberna NÃO são usados (só cenário).
Uso: python3 scripts/build_valdrak_map.py <vila> <taberna> <fazenda>
"""
import json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage
from scipy.spatial import cKDTree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "valdrak", "map"); os.makedirs(OUT, exist_ok=True)
VIL, TAV, FARM = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, G, T = 3200, 2240, 16, 32
rnd = random.Random(11); nrng = np.random.default_rng(11)

def img(p): return Image.open(p).convert("RGBA")
def crop2(sheet, box, k=2):
    x, y, w, h = box; return sheet.crop((x, y, x + w, y + h)).resize((w * k, h * k), Image.NEAREST)
V2 = lambda p: (lambda im: im.resize((im.width * 2, im.height * 2), Image.NEAREST))(img(p))
HOUSES = img(os.path.join(FARM, "PNG", "Houses.png")); PLANTS = img(os.path.join(FARM, "PNG", "Plants.png"))
DET = img(os.path.join(FARM, "PNG", "Ground_grass_details.png"))
EXT = img(os.path.join(TAV, "Tiled_files", "Exterior.png")); WALLS = img(os.path.join(TAV, "Tiled_files", "Walls_street.png"))
FENCE = [img(os.path.join(VIL, "1.1 Tiles", f"Tile2_{i:02d}.png")) for i in range(1, 65)]

# ── utilitários de forma ────────────────────────────────────────────────────────────────────────
def value_noise(w, h, cell, seed):
    r = np.random.default_rng(seed); gw, gh = w // cell + 3, h // cell + 3
    g = r.random((gh, gw)).astype(np.float32)
    big = np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((gw * cell, gh * cell), Image.BICUBIC), np.float32) / 255
    return big[:h, :w]
NZ = value_noise(W, H, 48, 1) * .65 + value_noise(W, H, 14, 2) * .35
def catmull(pts, step=6):
    out = []; P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = map(np.array, (P[i - 1], P[i], P[i + 1], P[i + 2])); n = max(2, int(np.linalg.norm(p2 - p1) / step))
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(np.array(pts[-1])); return out
def stroke(mask, pts, r0, r1=None, wob=.25, seed=0):
    d = ImageDraw.Draw(mask); r1 = r1 or r0; cv = catmull(pts); rr = random.Random(seed); ph = rr.random() * 6
    for i, p in enumerate(cv):
        t = i / max(1, len(cv) - 1); r = (r0 + (r1 - r0) * t) * (1 + wob * math.sin(i * .07 + ph) * .6 + wob * math.sin(i * .19 + ph * 2) * .4)
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=255)
    return cv
def blob(mask, cx, cy, rx, ry, wob=.18, seed=0):
    d = ImageDraw.Draw(mask); rr = random.Random(seed); ph = [rr.random() * 6 for _ in range(3)]
    pts = [(cx + rx * math.cos(a) * (1 + wob * (math.sin(3 * a + ph[0]) * .5 + math.sin(5 * a + ph[1]) * .3 + math.sin(8 * a + ph[2]) * .2)),
            cy + ry * math.sin(a) * (1 + wob * (math.sin(3 * a + ph[0]) * .5 + math.sin(5 * a + ph[1]) * .3 + math.sin(8 * a + ph[2]) * .2))) for a in np.linspace(0, 2 * math.pi, 120)]
    d.polygon(pts, fill=255)
def organic(mask_img, amount=14):
    """borda irregular: desfoca e corta com ruído"""
    a = np.array(mask_img.filter(ImageFilter.GaussianBlur(amount)), np.float32) / 255
    return a + (NZ - .5) * .55 > .5

# ── desenho geral ───────────────────────────────────────────────────────────────────────────────
GATE_X, WALL_H = 1600, 192
road_m = Image.new("L", (W, H)); water_m = Image.new("L", (W, H)); soil_m = Image.new("L", (W, H))
PATHS = {
    "gate": [(1600, 150), (1590, 330), (1618, 560), (1596, 800)],
    "tavern": [(1360, 950), (1130, 915), (900, 975), (700, 1035)],
    "east": [(1860, 960), (2120, 905), (2380, 965), (2560, 940)],
    "east2": [(2700, 940), (2860, 900), (3020, 930)],
    "south": [(1600, 1100), (1555, 1330), (1640, 1590), (1590, 1880), (1620, 2260)],
    "farm": [(1570, 1420), (1310, 1480), (1020, 1460), (800, 1530), (640, 1690), (610, 1950), (640, 2150)],
    "mill": [(700, 1700), (470, 1640), (380, 1720)],
}
for i, (k, pts) in enumerate(PATHS.items()):
    stroke(road_m, pts, 58 if k in ("gate", "south") else 46, wob=.22, seed=i)
blob(road_m, 1600, 935, 330, 205, .16, 3)          # praça
blob(road_m, 1600, 260, 210, 90, .2, 4)            # pátio diante dos portões
blob(road_m, 600, 1060, 150, 60, .2, 5)            # frente da taberna
ROAD = organic(road_m, 10)
RIVER = [(2630, -80), (2600, 260), (2690, 600), (2600, 940), (2660, 1290), (2570, 1640), (2650, 2000), (2610, 2330)]
riv_cv = stroke(water_m, RIVER, 62, 74, wob=.18, seed=9)
blob(water_m, 1330, 1720, 150, 92, .22, 10)        # lago da fazenda
WATER = organic(water_m, 8)
ROAD &= ~ndimage.binary_dilation(WATER, iterations=30)
FIELDS = [(330, 1950, 230, 120, 12), (860, 1990, 200, 110, 13), (300, 1560, 170, 80, 14), (1060, 1720, 120, 70, 15)]
for cx, cy, rx, ry, s in FIELDS: blob(soil_m, cx, cy, rx, ry, .14, s)
SOIL = organic(soil_m, 6) & ~ROAD

# ── pintura ─────────────────────────────────────────────────────────────────────────────────────
C = dict(grass=(166, 176, 79), grass_d=(150, 160, 70), grass_l=(178, 188, 90), cob=(235, 150, 97), cob_s=(208, 119, 83), mortar=(181, 89, 69),
         water=(91, 141, 209), water_l=(97, 182, 237), water_d=(72, 112, 186), dirt=(171, 120, 75), dirt_s=(142, 87, 62), dirt_d=(120, 72, 58), edge=(73, 40, 35),
         soil=(147, 83, 54), soil_s=(133, 66, 49), soil_d=(108, 51, 46))
A = np.zeros((H, W, 3), np.uint8); A[:] = C["grass"]
# manchas suaves de grama mais clara/escura (em blocos de 2 px para manter o pixel)
n2 = value_noise(W // 2, H // 2, 40, 21); big = np.kron(n2, np.ones((2, 2)))[:H, :W]
A[big > .7] = C["grass_l"]; A[big < .26] = C["grass_d"]
# pedras do caminho: Voronoi; cada pedra entra inteira se o centro está no caminho
ys, xs = np.nonzero(ndimage.binary_dilation(ROAD, iterations=18))
pts = []
for gy in range(0, H, 22):
    for gx in range(0, W, 22):
        pts.append((gx + rnd.uniform(2, 20), gy + rnd.uniform(2, 20)))
pts = np.array(pts); keep = ROAD[np.clip(pts[:, 1].astype(int), 0, H - 1), np.clip(pts[:, 0].astype(int), 0, W - 1)]
tree = cKDTree(pts)
d, idx = tree.query(np.stack([xs, ys], 1), k=2)
inside = keep[idx[:, 0]]
gap = d[:, 1] - d[:, 0]
sel = inside
px, py, g1, i0 = xs[sel], ys[sel], gap[sel] - .1 * d[sel, 0], idx[sel, 0]
cx, cy = pts[i0, 0], pts[i0, 1]
col = np.tile(np.array(C["cob"], np.uint8), (len(px), 1))
shade = (g1 < 6.5) & ((py - cy) + (px - cx) * .6 > 2)
col[shade] = C["cob_s"]; col[g1 < 2.4] = C["mortar"]
A[py, px] = col
# tufos de grama entrando nas frestas da borda
edge_px = sel & (gap < 1.5)
# água: margem de terra em 2 px (como o pacote da fazenda)
W2 = WATER[::2, ::2]
ring1 = ndimage.binary_dilation(W2, iterations=4) & ~W2
ring0 = ndimage.binary_dilation(W2, iterations=5) & ~ndimage.binary_dilation(W2, iterations=4)
ringIn = W2 & ~ndimage.binary_erosion(W2, iterations=1)
deep = ndimage.binary_erosion(W2, iterations=9)
def paint2(m, c):
    yy, xx = np.nonzero(m)
    for oy in (0, 1):
        for ox in (0, 1): A[np.clip(yy * 2 + oy, 0, H - 1), np.clip(xx * 2 + ox, 0, W - 1)] = c
paint2(W2, C["water"]); paint2(deep, C["water_d"]); paint2(ring0, C["edge"]); paint2(ring1, C["dirt"])
ring1s = ring1 & (np.roll(W2, -2, 0) | np.roll(W2, -1, 0)); paint2(ring1s, C["dirt_s"]); paint2(ringIn, C["dirt_d"])
# reflexos na água
for _ in range(900):
    yy, xx = rnd.randrange(0, H // 2), rnd.randrange(0, W // 2)
    if W2[yy, xx] and not ringIn[yy, xx]:
        L = rnd.randint(2, 6); A[yy * 2:yy * 2 + 2, xx * 2:xx * 2 + L * 2] = C["water_l"]
# pedras da margem
for _ in range(500):
    yy, xx = rnd.randrange(0, H // 2), rnd.randrange(0, W // 2)
    if ring1[yy, xx] and rnd.random() < .5: A[yy * 2:yy * 2 + 4, xx * 2:xx * 2 + 4] = C["dirt_d"]; A[yy * 2:yy * 2 + 2, xx * 2:xx * 2 + 2] = C["dirt"]
# canteiros: terra arada com sulcos
S2 = SOIL[::2, ::2]
paint2(S2, C["soil"]); paint2(S2 & ((np.arange(S2.shape[0])[:, None] % 12) < 2), C["soil_s"])
paint2(ndimage.binary_dilation(S2, iterations=1) & ~S2, C["soil_d"])
ground = Image.fromarray(A, "RGB").convert("RGBA")
# detalhes: tufos, flores, pedrinhas e terra (pacotes da vila e da fazenda)
TUFT = [V2(os.path.join(VIL, "2 Objects", "5 Grass", f"{i}.png")) for i in range(1, 7)]
STN = [V2(os.path.join(VIL, "2 Objects", "2 Stone", f"{i}.png")) for i in range(1, 7)]
DOTS = [crop2(DET, b) for b in ((8, 8, 10, 8), (40, 6, 12, 10), (72, 10, 9, 8), (104, 4, 14, 12), (8, 40, 12, 10), (44, 42, 14, 9))]
LEAF = [crop2(DET, b) for b in ((0, 124, 26, 18), (26, 128, 18, 14), (180, 124, 30, 20), (210, 128, 20, 14))]
occupied = ROAD | WATER | SOIL
for _ in range(5200):
    x, y = rnd.randrange(40, W - 40), rnd.randrange(WALL_H + 20, H - 20)
    if occupied[y, x]: continue
    r = rnd.random(); t = rnd.choice(TUFT) if r < .7 else rnd.choice(LEAF) if r < .85 else rnd.choice(STN) if r < .95 else rnd.choice(DOTS)
    ground.alpha_composite(t, (x, y))
# tufos nas bordas do caminho (grama invadindo as frestas, como na referência)
by, bx = py[(g1 < 3.2)], px[(g1 < 3.2)]
bd = ndimage.binary_dilation(~ROAD, iterations=6) & ROAD
for _ in range(2600):
    k = rnd.randrange(len(bx))
    if bd[by[k], bx[k]]: ground.alpha_composite(rnd.choice(TUFT[:4]), (int(bx[k]) - 4, int(by[k]) - 6))

# ── objetos (atlas) ─────────────────────────────────────────────────────────────────────────────
atlas = {}
def add(key, im): atlas[key] = im; return key
add("windmill", crop2(HOUSES, (82, 157, 67, 132))); add("sails", crop2(HOUSES, (169, 143, 117, 117)))
add("farmhouse", crop2(HOUSES, (276, 0, 123, 129))); add("barn", crop2(HOUSES, (127, 5, 82, 76)))
add("coop", crop2(HOUSES, (228, 15, 38, 62))); add("hayshed", crop2(HOUSES, (132, 95, 73, 50))); add("vines", crop2(HOUSES, (11, 147, 68, 104)))
add("tavern", crop2(EXT, (11, 5, 177, 156))); add("tav-table", crop2(EXT, (191, 71, 49, 29))); add("tav-barrels", crop2(EXT, (10, 341, 38, 53)))
add("tav-sign", crop2(EXT, (365, 305, 70, 28)))
for i, f in enumerate(["1", "2", "3", "4"]): add(f"house{i+1}", V2(os.path.join(VIL, "2 Objects", "7 House", f + ".png")))
for i, f in enumerate(["1", "2", "3", "4"]): add(f"tent{i+1}", V2(os.path.join(VIL, "2 Objects", "6 Tent", f + ".png")))
DEC = {"cart": "1", "lamp": "10", "lamp2": "11", "well": "13", "sign": "14", "cart2": "2", "logs": "5", "stump": "6", "anvil": "7", "chair": "8", "barrel": "3", "barrel2": "4",
       "d9": "9", "d12": "12", "d15": "15", "d16": "16", "d17": "17"}
for k, f in DEC.items():
    p = os.path.join(VIL, "2 Objects", "3 Decor", f + ".png")
    if os.path.exists(p): add(k, V2(p))
for i in range(1, 6):
    p = os.path.join(VIL, "2 Objects", "4 Box", f"{i}.png"); os.path.exists(p) and add(f"box{i}", V2(p))
TREES = {"tree1": (132, 253, 53, 66), "tree2": (386, 253, 58, 67), "tree3": (330, 268, 43, 50), "tree4": (130, 333, 55, 68),
         "tree5": (388, 333, 54, 66), "pine1": (148, 404, 73, 76), "pine2": (225, 415, 61, 64), "pine3": (291, 437, 41, 41),
         "oak1": (336, 399, 63, 82), "oak2": (402, 405, 55, 71), "oak3": (2, 484, 60, 72), "oak4": (70, 499, 54, 60),
         "apple": (196, 253, 53, 66), "orange": (194, 333, 55, 68), "tree6": (386, 268, 0, 0)}
TREES.pop("tree6")
for k, b in TREES.items(): add(k, crop2(PLANTS, b))
BUSH = {"bush1": (181, 482, 38, 39), "bush2": (228, 483, 39, 40), "bush3": (239, 527, 33, 33), "bush4": (274, 531, 28, 27), "bush5": (308, 531, 26, 27),
        "bush6": (34, 18, 28, 28), "bush7": (159, 16, 30, 31)}
for k, b in BUSH.items(): add(k, crop2(PLANTS, b))
for k, b in {"corn": (482, 10, 26, 38), "wheat": (450, 10, 26, 38), "tomato": (353, 9, 27, 38), "bean": (321, 9, 27, 38), "melon": (323, 53, 28, 26), "eggplant": (451, 53, 25, 25),
             "cabbage": (136, 112, 28, 22), "pumpkin": (386, 112, 30, 30)}.items(): add(k, crop2(PLANTS, b))
add("stone", img(os.path.join(VIL, "2 Objects", "2 Stone", "6.png")).resize((22, 18), Image.NEAREST))
add("tower", crop2(WALLS, (10, 6, 28, 75)))
for n in (1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 26, 27, 34, 35): add(f"fence{n}", FENCE[n - 1].resize((64, 64), Image.NEAREST))

# muralha: caminho de ronda, ameias, face de tijolo; torres e mato na base
face = crop2(WALLS, (128, 0, 32, 30)); top = crop2(WALLS, (240, 0, 16, 16)); mer = crop2(WALLS, (95, 0, 66, 20))
wall = Image.new("RGBA", (W, WALL_H))
for x in range(0, W, top.width):
    for y in range(0, 64, top.height): wall.alpha_composite(top, (x, y))
for x in range(0, W, face.width):
    for y in range(64, WALL_H, face.height): wall.alpha_composite(face.crop((0, 0, face.width, min(face.height, WALL_H - y))), (x, y))
for x in range(0, W, mer.width): wall.alpha_composite(mer, (x, 54))
# vão do grande portão: arco escuro com moldura de pedra
dw = ImageDraw.Draw(wall); gx0, gx1 = GATE_X - 72, GATE_X + 72
dw.rectangle([gx0 - 10, 70, gx1 + 10, WALL_H], fill=(58, 62, 84, 255))
dw.pieslice([gx0 - 10, 40, gx1 + 10, 140], 180, 360, fill=(58, 62, 84, 255))
dw.rectangle([gx0, 90, gx1, WALL_H], fill=(24, 20, 30, 255)); dw.pieslice([gx0, 56, gx1, 126], 180, 360, fill=(24, 20, 30, 255))
# folhas do portão (madeira com cintas de ferro), fechadas
gate = Image.new("RGBA", (gx1 - gx0 - 8, WALL_H - 66)); gd = ImageDraw.Draw(gate); gw, gh = gate.size
gd.pieslice([0, 0, gw - 1, 60], 180, 360, fill=(150, 82, 52, 255)); gd.rectangle([0, 30, gw - 1, gh - 1], fill=(150, 82, 52, 255))
for xx in range(0, gw, 12): gd.line([xx, 4, xx, gh], fill=(112, 58, 40, 255), width=2)
for yy in (46, 86, gh - 18): gd.rectangle([0, yy, gw, yy + 7], fill=(64, 62, 74, 255)); gd.line([0, yy + 7, gw, yy + 7], fill=(36, 34, 44, 255), width=1)
for yy in (46, 86, gh - 18):
    for xx in range(6, gw, 18): gd.rectangle([xx, yy + 2, xx + 2, yy + 4], fill=(150, 150, 160, 255))
gd.line([gw // 2, 0, gw // 2, gh], fill=(70, 34, 26, 255), width=3)
gd.ellipse([gw // 2 - 14, gh // 2 - 4, gw // 2 - 4, gh // 2 + 6], outline=(180, 160, 90, 255), width=2); gd.ellipse([gw // 2 + 4, gh // 2 - 4, gw // 2 + 14, gh // 2 + 6], outline=(180, 160, 90, 255), width=2)
wall.alpha_composite(gate, (gx0 + 4, 66))
for yy in range(66, WALL_H, 18):
    for xx in (gx0 - 10, gx1 + 2): dw.rectangle([xx, yy, xx + 8, yy + 14], fill=(86, 92, 118, 255)); dw.rectangle([xx, yy + 14, xx + 8, yy + 16], fill=(40, 42, 60, 255))
ground.alpha_composite(wall, (0, 0))

props = []; solid = np.zeros((H // G, W // G), np.uint8)   # 0 livre · 1 sólido · 2 água · 3 pedra do riacho
def block(x0, y0, x1, y1, v=1): solid[max(0, int(y0) // G):int(math.ceil(y1 / G)), max(0, int(x0) // G):int(math.ceil(x1 / G))] = v
def free_at(x, y, r=20):
    y0, y1, x0, x1 = max(0, y - r), min(H, y + 4), max(0, x - r), min(W, x + r)
    return not (ROAD[y0:y1, x0:x1].any() or WATER[y0:y1, x0:x1].any()) and not solid[y // G, x // G]
def put(k, x, y, foot=None, flip=False, check=False):
    if check and not free_at(int(x), int(y)): return False
    im = atlas[k]; props.append([k, int(x), int(y)] + ([1] if flip else []))
    fw, fh = foot if foot else (im.width * .7, min(28, im.height * .25)); block(x - fw / 2, y - fh, x + fw / 2, y); return True
# colisão do terreno
wg = WATER[::G, ::G][:solid.shape[0], :solid.shape[1]]; solid[wg] = 2
block(0, 0, W, WALL_H); block(0, 0, 40, H); block(W - 40, 0, W, H); block(0, H - 24, W, H)
for x in range(140, W, 420):
    if abs(x - GATE_X) > 260: props.append(["tower", x, WALL_H + 6])
props.append(["tower", GATE_X - 118, WALL_H + 8]); props.append(["tower", GATE_X + 118, WALL_H + 8])
# pedras para atravessar o rio no caminho leste (entre elas só pulando)
cross = min(riv_cv, key=lambda p: abs(p[1] - 940)); RX = int(cross[0])
STONES = [RX - 54, RX, RX + 54]
for sx in STONES: block(sx - 14, 920, sx + 14, 962, 3)
# construções
put("tavern", 560, 1050, (300, 110)); put("tav-barrels", 380, 1040); put("tav-table", 760, 1115); put("tav-table", 470, 1125); put("tav-sign", 700, 990, (10, 4))
put("windmill", 400, 1700, (110, 70)); put("farmhouse", 880, 1760, (220, 80)); put("barn", 1110, 2120, (150, 60))
put("coop", 1140, 1900); put("hayshed", 760, 2160)
HOUSES_AT = [("house1", 1130, 760), ("house2", 2080, 760), ("house3", 1150, 1290), ("house4", 2060, 1300), ("house2", 1280, 520),
             ("house1", 1930, 520), ("house3", 2330, 820), ("house4", 860, 760), ("house1", 2330, 1520), ("house3", 1900, 1560)]
for k, x, y in HOUSES_AT: put(k, x, y, (atlas[k].width * .78, 70))
for k, x, y in (("tent1", 1430, 1150), ("tent2", 1780, 1140), ("tent3", 1410, 760), ("tent4", 1800, 760)): put(k, x, y, (atlas[k].width * .7, 22))
put("well", 1600, 950, (40, 22))
for k, x, y in (("lamp", 1460, 860), ("lamp", 1740, 860), ("lamp", 1470, 1040), ("lamp", 1735, 1040), ("lamp2", 1490, 250), ("lamp2", 1710, 250),
                ("lamp", 1080, 990), ("lamp", 2180, 990), ("lamp", 1530, 1650), ("cart", 1950, 1050), ("barrel", 1300, 1060), ("barrel2", 1325, 1070),
                ("box1", 1880, 820), ("box2", 1905, 832), ("logs", 1000, 1600), ("stump", 975, 1625), ("box3", 2930, 868),
                ("cart2", 740, 1460), ("sign", 1450, 1440), ("chair", 1450, 990), ("barrel", 2000, 990), ("d9", 1250, 880), ("d12", 2230, 640),
                ("d15", 1320, 600), ("d16", 2380, 1120), ("d17", 960, 1180)):
    k in atlas and put(k, x, y)
# plantações dentro dos canteiros (fileiras levemente tortas)
for cx, cy, rx, ry, s in FIELDS:
    kinds = ["corn", "wheat"] if s in (12, 14) else ["tomato", "bean", "cabbage", "pumpkin", "melon", "eggplant"]
    for yy in range(int(cy - ry + 30), int(cy + ry - 10), 38):
        for xx in range(int(cx - rx + 26), int(cx + rx - 20), 34):
            jx, jy = xx + rnd.randint(-4, 4), yy + rnd.randint(-3, 3)
            if SOIL[min(H - 1, jy), min(W - 1, jx)] and SOIL[max(0, jy - 20), min(W - 1, jx)]: put(rnd.choice(kinds), jx, jy, (18, 8))
# cerca de estacas acompanhando uma curva ao redor da vila (sul e leste), com abertura nas estradas
FENCE_LINE = catmull([(1180, 1640), (1400, 1680), (1700, 1665), (2000, 1690), (2230, 1660), (2420, 1560), (2475, 1330), (2470, 1090)], step=4)
fx_last = None
for p in FENCE_LINE:
    x, y = int(p[0]), int(p[1])
    if ROAD[y - 6:y + 6, x - 6:x + 6].any() or WATER[y, x]: fx_last = None; continue
    if fx_last and math.hypot(x - fx_last[0], y - fx_last[1]) < 58: continue
    vert = fx_last and abs(y - fx_last[1]) > abs(x - fx_last[0])
    put(rnd.choice(["fence9", "fence10", "fence11", "fence12"]) if vert else rnd.choice(["fence1", "fence2", "fence3", "fence4"]), x, y + 24, (60, 16)); fx_last = (x, y)
# mata em grupos (ruído decide a densidade), arbustos nas bordas
TK = ["pine1", "pine2", "oak1", "oak2", "oak3", "oak4", "tree1", "tree2", "tree5", "tree4", "pine3"]
def forest(x0, y0, x1, y1, dens, kinds=TK):
    for _ in range(int((x1 - x0) * (y1 - y0) / 3000)):
        x, y = rnd.randrange(x0, x1), rnd.randrange(y0, y1)
        if NZ[min(H - 1, y), min(W - 1, x)] > 1 - dens: put(rnd.choice(kinds), x, y, (26, 16), flip=rnd.random() < .5, check=True)
forest(1700, 1740, 2440, 2230, .75); forest(2740, 1050, 3170, 2230, .8); forest(2740, 210, 3170, 820, .75); forest(50, 220, 300, 1500, .8)
forest(1050, 220, 1450, 470, .45); forest(1760, 230, 2500, 470, .45); forest(50, 1300, 220, 2230, .6); forest(2450, 1650, 2560, 2230, .5)
for _ in range(260):
    x, y = rnd.randrange(60, W - 60), rnd.randrange(WALL_H + 60, H - 30)
    nearby = any(abs(p[1] - y) < 50 and abs(p[2] - y) < 50 for p in props[-5:])
    rnd.random() < .5 and put(rnd.choice(list(BUSH)), x, y, (20, 12), flip=rnd.random() < .5, check=True)
for k, x, y in (("apple", 230, 1310), ("orange", 1180, 1560), ("apple", 1260, 1940), ("orange", 260, 2150)): put(k, x, y, (24, 14), check=True)

spots = {
    "start": [620, 2000], "mira": [470, 1760], "millLever": [450, 1712],
    "baker": [1430, 1190], "smith": [2860, 920], "bridgeW": [RX - 140, 945], "bridgeE": [RX + 130, 945],
    "ticoMom": [1640, 1010], "tico": [1830, 740], "tavernDoor": [560, 1062], "bram": [600, 1090],
    "well": [1600, 975], "gate": [GATE_X, WALL_H + 8], "wallTop": [GATE_X, 64], "raidFrom": [2100, 2050],
    "rescue": [[1130, 790], [2080, 790], [1150, 1320], [880, 1790], [2860, 940]],
    "festival": [1600, 880],
}
# área livre ao redor dos pontos da história
for k in ("start", "mira", "millLever", "baker", "smith", "bridgeW", "bridgeE", "ticoMom", "tico", "tavernDoor", "well", "festival"):
    x, y = spots[k]; sub = solid[(y - 30) // G:(y + 20) // G, (x - 30) // G:(x + 30) // G]; sub[sub == 1] = 0
coll = ["".join(str(v) for v in row) for row in solid]
json.dump({"w": W, "h": H, "g": G, "coll": coll, "props": props, "spots": spots, "wallH": WALL_H, "gateX": GATE_X, "stones": [[s, 941] for s in STONES]},
          open(os.path.join(OUT, "map.json"), "w"), separators=(",", ":"))
# atlas (prateleiras)
keys = sorted(atlas, key=lambda k: -atlas[k].height); AW = 2048; x = y = rowh = 0; frames = {}
for k in keys:
    im = atlas[k]
    if x + im.width > AW: x = 0; y += rowh + 2; rowh = 0
    frames[k] = {"frame": {"x": x, "y": y, "w": im.width, "h": im.height}}; x += im.width + 2; rowh = max(rowh, im.height)
AT = Image.new("RGBA", (AW, y + rowh))
for k, f in frames.items(): AT.paste(atlas[k], (f["frame"]["x"], f["frame"]["y"]))
AT.save(os.path.join(OUT, "props.png"), optimize=True)
json.dump({"frames": frames, "meta": {"image": "props.png", "size": {"w": AT.width, "h": AT.height}, "scale": 1}}, open(os.path.join(OUT, "props.json"), "w"))
# ── neve: telhados e topos brancos (atlas paralelo) e manchas de neve no chão (camada por cima) ───────
SNOW_W, SNOW_L, SNOW_S = np.array([242, 247, 255]), np.array([212, 224, 242]), np.array([172, 188, 216])
ROOF_BLUE = {"house1", "house2", "house3", "house4", "farmhouse", "barn", "coop", "hayshed", "windmill", "well"}
ROOF_RED = {"tavern", "tent1", "tent2", "tent3", "tent4"}
def snowify(key, im):
    a = np.array(im).astype(np.int16); A_ = a[:, :, 3] > 0; h, w = A_.shape
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]; mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
    v = mx / 255; sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0); rel = np.arange(h)[:, None] / h
    roof = np.zeros_like(A_)
    if key in ROOF_BLUE: roof = A_ & (b > r + 5) & (b >= g - 4) & (sat > .07) & (v > .2) & (rel < (.62 if key != "windmill" else .45))
    if key in ROOF_RED: roof = A_ & (r > g + 50) & (r > b + 20) & (v > .25) & (rel < (.55 if key == "tavern" else .5))
    out = a.copy(); lum = (r * .3 + g * .59 + b * .11) / 255
    for m, c in ((roof & (lum > .5), SNOW_W), (roof & (lum <= .5) & (lum > .33), SNOW_L), (roof & (lum <= .33) & (v > .17), SNOW_S)):
        out[m, :3] = c
    # capa de neve no topo de tudo (2 a 5 px abaixo do contorno de cima de cada coluna)
    rr = random.Random(hash(key) & 0xffff)
    for x in range(w):
        col = np.nonzero(A_[:, x])[0]
        if not len(col): continue
        y0 = col[0]; th = rr.randint(2, 5) * (2 if key in ROOF_BLUE or key in ROOF_RED or key in TREES or key.startswith("bush") or key.startswith("fence") else 1)
        seg = [y for y in range(y0 + 1, min(h, y0 + 1 + th)) if A_[y, x]]
        for y in seg: out[y, x, :3] = SNOW_W if y < y0 + th - 1 else SNOW_L
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), "RGBA")
ATS = Image.new("RGBA", AT.size)
for k, f in frames.items(): ATS.paste(snowify(k, atlas[k]), (f["frame"]["x"], f["frame"]["y"]))
ATS.save(os.path.join(OUT, "props-snow.png"), optimize=True)
# chão: manchas de neve na grama (contorno irregular), poeira de neve nas pedras do caminho, água livre
sn = value_noise(W // 2, H // 2, 70, 31) * .6 + value_noise(W // 2, H // 2, 18, 32) * .4
R2, W2_ = ROAD[::2, ::2], WATER[::2, ::2]
cover = (sn > .5) & ~W2_ & ~ndimage.binary_dilation(W2_, iterations=3)
cover &= ~R2 | (sn > .66)                       # no caminho só onde a neve acumula mais
cover = ndimage.binary_opening(cover, iterations=1)
edge = cover & ~ndimage.binary_erosion(cover, iterations=1)
SO = np.zeros((H // 2, W // 2, 4), np.uint8)
SO[cover] = (238, 244, 252, 255); SO[edge] = (200, 214, 236, 255)
tex = cover & (value_noise(W // 2, H // 2, 6, 33) > .72); SO[tex] = (222, 232, 248, 255)   # textura leve dentro da neve
shadow = cover & ~np.roll(cover, -1, 0); SO[shadow] = (186, 202, 228, 255)
for _ in range(9000):   # flocos soltos fora das manchas
    yy, xx = rnd.randrange(0, H // 2), rnd.randrange(0, W // 2)
    if not cover[yy, xx] and not W2_[yy, xx]: SO[yy, xx] = (236, 242, 252, 220)
Image.fromarray(SO, "RGBA").resize((W, H), Image.NEAREST).save(os.path.join(OUT, "ground-snow.png"), optimize=True)
# janelas e lanternas para a noite (pontos de luz)
LIGHTS = [[x, y - 40, "lamp"] for k, x, y, *f in props if k in ("lamp", "lamp2")]
for k, x, y, *f in props:
    if k.startswith("house") or k in ("tavern", "farmhouse"): LIGHTS.append([x, y - atlas[k].height * .45, "win"])
json.dump({"lights": LIGHTS}, open(os.path.join(OUT, "lights.json"), "w"))
gq = ground.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
gq.save(os.path.join(OUT, "ground.png"), optimize=True)
P = ground.copy()
for k, x, y, *f in sorted(props, key=lambda p: p[2]):
    im = atlas[k].transpose(Image.FLIP_LEFT_RIGHT) if f else atlas[k]; P.alpha_composite(im, (x - im.width // 2, y - im.height))
P.save("/tmp/valdrak_full.png"); P.resize((W // 4, H // 4), Image.LANCZOS).save("/tmp/valdrak_preview.png")
PS = ground.copy(); PS.alpha_composite(Image.open(os.path.join(OUT, "ground-snow.png")))
for k, x, y, *f in sorted(props, key=lambda p: p[2]):
    fr = frames[k]["frame"]; im = ATS.crop((fr["x"], fr["y"], fr["x"] + fr["w"], fr["y"] + fr["h"]))
    im = im.transpose(Image.FLIP_LEFT_RIGHT) if f else im; PS.alpha_composite(im, (x - im.width // 2, y - im.height))
PS.save("/tmp/valdrak_snow.png")
print("mapa", W, H, "objetos", len(props), "atlas", AT.size, "chão KB", os.path.getsize(os.path.join(OUT, "ground.png")) // 1024)
