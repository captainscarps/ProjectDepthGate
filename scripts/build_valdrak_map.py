"""
Mapa da Valdrak antiga (missão "O Rei que Abriu as Portas", arco do príncipe).
Monta, a partir dos pacotes da craftpix (vila em escala 1; fazenda e taberna dobradas para ficar na mesma escala):
  assets/pixel-art/valdrak/map/ground.png   chão (grama, estradas, praça, riacho, lago, plantações)
  assets/pixel-art/valdrak/map/props.png/.json  atlas dos objetos (casas, taberna, moinho, árvores...)
  assets/pixel-art/valdrak/map/map.json     objetos posicionados, colisão (grade de 16 px) e pontos da história
Os personagens da taberna NÃO são usados (só cenário).
Uso: python3 scripts/build_valdrak_map.py <vila> <taberna> <fazenda>
"""
import json, os, random, sys
from PIL import Image, ImageDraw
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "valdrak", "map"); os.makedirs(OUT, exist_ok=True)
VIL, TAV, FARM = sys.argv[1], sys.argv[2], sys.argv[3]
T = 32; COLS, ROWS = 100, 70; W, H = COLS * T, ROWS * T; G = 16
rnd = random.Random(7)

def img(p): return Image.open(p).convert("RGBA")
def crop2(sheet, box, k=2):
    x, y, w, h = box; return sheet.crop((x, y, x + w, y + h)).resize((w * k, h * k), Image.NEAREST)

# ── fontes ──────────────────────────────────────────────────────────────────────────────────────
V_TILES = [img(os.path.join(VIL, "1 Tiles", f"FieldsTile_{i:02d}.png")) for i in range(1, 65)]
V_FENCE = [img(os.path.join(VIL, "1.1 Tiles", f"Tile2_{i:02d}.png")) for i in range(1, 65)]
HOUSES = img(os.path.join(FARM, "PNG", "Houses.png")); PLANTS = img(os.path.join(FARM, "PNG", "Plants.png"))
GROUND = img(os.path.join(FARM, "PNG", "ground_grass_bricks.png")); WATER = img(os.path.join(FARM, "PNG", "Water_coasts.png"))
EXT = img(os.path.join(TAV, "Tiled_files", "Exterior.png")); WALLS = img(os.path.join(TAV, "Tiled_files", "Walls_street.png"))

# ── chão ────────────────────────────────────────────────────────────────────────────────────────
GRASS = V_TILES[37]  # FieldsTile_38: grama lisa
gpx = np.array(GRASS)[16, 16, :3]
def green_frac(t, box):
    a = np.array(t.crop(box))[:, :, :3].astype(int)
    return float((np.abs(a - gpx).sum(2) < 60).mean())
FEAT = []
for t in V_TILES:
    FEAT.append([green_frac(t, b) for b in ((4, 0, 28, 5), (27, 4, 32, 28), (4, 27, 28, 32), (0, 4, 5, 28),
                                             (0, 0, 6, 6), (26, 0, 32, 6), (26, 26, 32, 32), (0, 26, 6, 32))])
road = np.zeros((ROWS, COLS), bool)
def rect(m, c0, r0, c1, r1, v=True): m[max(0, r0):r1, max(0, c0):c1] = v
# estradas e praça
rect(road, 46, 5, 54, 9)          # pátio diante dos portões
rect(road, 48, 9, 52, 50)         # estrada principal (portões → praça → sul)
rect(road, 40, 24, 60, 35)        # praça
rect(road, 22, 28, 40, 31)        # para a taberna
rect(road, 60, 28, 79, 31)        # para o riacho
rect(road, 84, 28, 92, 31)        # do outro lado do riacho (ferreiro)
rect(road, 17, 46, 48, 49)        # para as fazendas
rect(road, 17, 46, 20, 64)
rect(road, 48, 50, 52, 70)        # saída sul (mata)
ground = Image.new("RGBA", (W, H))
for r in range(ROWS):
    for c in range(COLS):
        ground.paste(GRASS, (c * T, r * T))
for r in range(ROWS):
    for c in range(COLS):
        if not road[r, c]: continue
        g = lambda dc, dr: not (0 <= r + dr < ROWS and 0 <= c + dc < COLS and road[r + dr, c + dc])
        want = [g(0, -1), g(1, 0), g(0, 1), g(-1, 0), g(-1, -1), g(1, -1), g(1, 1), g(-1, 1)]
        best = sorted(range(64), key=lambda i: sum(abs(FEAT[i][k] - (0.55 if want[k] else 0.0)) * (2 if k < 4 else 1) for k in range(8)) + rnd.random() * 0.15)
        cand = [i for i in best[:3] if i != 37]
        ground.paste(V_TILES[cand[0]], (c * T, r * T), V_TILES[cand[0]])
# plantações (terra arada do pacote da fazenda, dobrada) e lago / riacho
soil = crop2(GROUND, (128, 208, 64, 64))            # bloco de terra lisa
for (c0, r0, c1, r1) in ((4, 58, 15, 66), (21, 58, 30, 66), (4, 50, 14, 55)):
    for y in range(r0 * T, r1 * T, soil.height):
        for x in range(c0 * T, c1 * T, soil.width):
            ground.alpha_composite(soil.crop((0, 0, min(soil.width, c1 * T - x), min(soil.height, r1 * T - y))), (x, y))
ring = WATER.crop((48, 0, 96, 48))                  # 9 partes: borda de terra com água no meio
wcol = (86, 136, 206, 255)
def pond(x, y, w, h, k=2):
    R = ring.resize((96, 96), Image.NEAREST); e = 32
    d = ImageDraw.Draw(ground); d.rectangle([x, y, x + w - 1, y + h - 1], fill=wcol)
    parts = {(0, 0): (0, 0), (1, 0): (e, 0), (2, 0): (2 * e, 0), (0, 1): (0, e), (2, 1): (2 * e, e), (0, 2): (0, 2 * e), (1, 2): (e, 2 * e), (2, 2): (2 * e, 2 * e)}
    for (i, j), (sx, sy) in parts.items():
        piece = R.crop((sx, sy, sx + e, sy + e))
        xs = [x] if i == 0 else [x + w - e] if i == 2 else range(x + e, x + w - e, e)
        ys = [y] if j == 0 else [y + h - e] if j == 2 else range(y + e, y + h - e, e)
        for px in xs:
            for py in ys: ground.alpha_composite(piece, (px, py))
pond(38 * T, 50 * T, 8 * T, 6 * T)                  # lago da fazenda
pond(79 * T, -2 * T, 5 * T, 76 * T)                  # riacho (as pontas ficam fora do mapa)

# ── objetos ─────────────────────────────────────────────────────────────────────────────────────
atlas = {}
def add(key, im): atlas[key] = im; return key
add("windmill", crop2(HOUSES, (82, 157, 67, 132))); add("sails", crop2(HOUSES, (169, 143, 117, 117)))
SAILS = img(os.path.join(FARM, "PNG", "Sails_animation.png"))
add("farmhouse", crop2(HOUSES, (276, 0, 123, 129))); add("barn", crop2(HOUSES, (127, 5, 82, 76)))
add("coop", crop2(HOUSES, (228, 15, 38, 62))); add("hayshed", crop2(HOUSES, (132, 95, 73, 50)))
add("tavern", crop2(EXT, (11, 5, 177, 156))); add("tav-table", crop2(EXT, (191, 71, 49, 29))); add("tav-barrels", crop2(EXT, (10, 341, 38, 53)))
V2 = lambda p: (lambda im: im.resize((im.width * 2, im.height * 2), Image.NEAREST))(img(p))
for i, f in enumerate(["1", "2", "3", "4"]): add(f"house{i+1}", V2(os.path.join(VIL, "2 Objects", "7 House", f + ".png")))
for i, f in enumerate(["1", "2", "3", "4"]): add(f"tent{i+1}", V2(os.path.join(VIL, "2 Objects", "6 Tent", f + ".png")))
DEC = {"cart": "1", "lamp": "10", "lamp2": "11", "well": "13", "sign": "14", "cart2": "2", "logs": "5", "stump": "6", "anvil": "7", "chair": "8", "barrel": "3", "barrel2": "4"}
for k, f in DEC.items():
    p = os.path.join(VIL, "2 Objects", "3 Decor", f + ".png")
    if os.path.exists(p): add(k, V2(p))
for i in range(1, 6):
    p = os.path.join(VIL, "2 Objects", "4 Box", f"{i}.png"); os.path.exists(p) and add(f"box{i}", V2(p))
TREES = {"tree1": (132, 253, 53, 66), "tree2": (386, 253, 58, 67), "tree3": (330, 268, 43, 50), "tree4": (130, 333, 55, 68),
         "tree5": (388, 333, 54, 66), "pine1": (148, 404, 73, 76), "pine2": (225, 415, 61, 64), "pine3": (291, 437, 41, 41),
         "oak1": (336, 399, 63, 82), "oak2": (402, 405, 55, 71), "oak3": (2, 484, 60, 72), "oak4": (70, 499, 54, 60),
         "apple": (196, 253, 53, 66), "orange": (194, 333, 55, 68)}
for k, b in TREES.items(): add(k, crop2(PLANTS, b))
for k, b in {"bush1": (181, 482, 38, 39), "bush2": (228, 483, 39, 40), "bush3": (239, 527, 33, 33), "bush4": (274, 531, 28, 27), "bush5": (308, 531, 26, 27)}.items(): add(k, crop2(PLANTS, b))
for k, b in {"corn": (482, 10, 26, 38), "wheat": (450, 10, 26, 38), "tomato": (353, 9, 27, 38), "bean": (321, 9, 27, 38), "melon": (323, 53, 28, 26), "eggplant": (451, 53, 25, 25)}.items(): add(k, crop2(PLANTS, b))
add("stone", img(os.path.join(VIL, "2 Objects", "2 Stone", "6.png")).resize((22, 18), Image.NEAREST))
# muralha do castelo: face de tijolo + ameias (pacote da taberna, dobrado)
face = crop2(WALLS, (128, 0, 32, 30)); top = crop2(WALLS, (240, 0, 16, 16))
wall = Image.new("RGBA", (W, 6 * T))
for x in range(0, W, top.width):
    for y in range(0, 2 * T, top.height): wall.alpha_composite(top, (x, y))
for x in range(0, W, face.width):
    for y in range(2 * T, 6 * T, face.height): wall.alpha_composite(face.crop((0, 0, face.width, min(face.height, 6 * T - y))), (x, y))
mer = crop2(WALLS, (95, 0, 66, 20))
for x in range(0, W, mer.width): wall.alpha_composite(mer, (x, 2 * T - 10))
ground.alpha_composite(wall, (0, 0))
# cerca de estacas
for c in list(range(53, 80)):
    ground.alpha_composite(V_FENCE[1], (c * T, 53 * T))

# atlas (prateleiras)
keys = sorted(atlas, key=lambda k: -atlas[k].height)
AW = 2048; x = y = rowh = 0; frames = {}
for k in keys:
    im = atlas[k]
    if x + im.width > AW: x = 0; y += rowh + 2; rowh = 0
    frames[k] = {"frame": {"x": x, "y": y, "w": im.width, "h": im.height}}; x += im.width + 2; rowh = max(rowh, im.height)
A = Image.new("RGBA", (AW, y + rowh))
for k, f in frames.items(): A.paste(atlas[k], (f["frame"]["x"], f["frame"]["y"]))
A.save(os.path.join(OUT, "props.png"), optimize=True)
json.dump({"frames": frames, "meta": {"image": "props.png", "size": {"w": A.width, "h": A.height}, "scale": 1}}, open(os.path.join(OUT, "props.json"), "w"))
SAILS2 = SAILS.resize((SAILS.width * 2, SAILS.height * 2), Image.NEAREST); SAILS2.save(os.path.join(OUT, "sails.png"), optimize=True)

# ── posições (x, base y em px) e colisão ───────────────────────────────────────────────────────
props = []; solid = np.zeros((H // G, W // G), np.uint8)   # 0 livre · 1 sólido · 2 água · 3 pedra (só pulando entre elas)
def block(x0, y0, x1, y1, v=1): solid[max(0, int(y0) // G):int(np.ceil(y1 / G)), max(0, int(x0) // G):int(np.ceil(x1 / G))] = v
def put(k, x, y, foot=None, flip=False):
    im = atlas[k]; props.append([k, int(x), int(y)] + ([1] if flip else []))
    fw, fh = foot if foot else (im.width * .7, min(28, im.height * .25))
    block(x - fw / 2, y - fh, x + fw / 2, y)
block(0, 0, W, 6 * T)                                     # muralha
block(79 * T + 24, 0, 84 * T - 24, H, 2)                    # riacho
STONES = [79 * T + 72, 80 * T + 80 + 32, 82 * T + 56]       # pedras do riacho: entre elas só pulando
for sx in STONES: block(sx - 16, 28 * T + 8, sx + 16, 31 * T - 8, 3)
block(38 * T + 8, 50 * T + 8, 46 * T - 8, 56 * T - 8, 2)  # lago
block(53 * T, 53 * T + 12, 80 * T, 54 * T - 4)            # cerca
block(0, 0, 3 * T, H); block(W - 2 * T, 0, W, H); block(0, H - T, W, H)
put("tavern", 17 * T, 33 * T, (300, 120)); put("tav-barrels", 9 * T, 33 * T); put("tav-table", 23 * T, 35 * T)
put("windmill", 12 * T, 57 * T, (110, 70)); put("farmhouse", 26 * T, 56 * T, (220, 80)); put("barn", 34 * T, 66 * T, (150, 60))
put("coop", 36 * T, 60 * T); put("hayshed", 26 * T, 68 * T)
for (k, c, r) in (("house1", 34, 23), ("house2", 67, 23), ("house3", 34, 42), ("house4", 67, 42), ("house2", 40, 17), ("house1", 60, 17),
                  ("house3", 75, 25), ("house4", 26, 20), ("house1", 74, 47), ("house3", 58, 47)): put(k, c * T, r * T, (atlas[k].width * .78, 70))
for (k, c, r) in (("tent1", 44, 37), ("tent2", 56, 37), ("tent3", 44, 23), ("tent4", 57, 23)): put(k, c * T, r * T, (atlas[k].width * .7, 22))
put("well", 50 * T, 30 * T, (40, 22))
for (k, c, r) in (("lamp", 46, 26), ("lamp", 54, 26), ("lamp", 46, 34), ("lamp", 54, 34), ("lamp2", 47, 9), ("lamp2", 53, 9),
                  ("cart", 61, 33), ("barrel", 40, 33), ("barrel2", 41, 33), ("box1", 59, 26), ("box2", 60, 26), ("logs", 31, 50),
                  ("stump", 30, 51), ("anvil", 88, 27), ("box3", 90, 27), ("cart2", 22, 48), ("sign", 21, 46), ("chair", 45, 31), ("barrel", 63, 31)):
    k in atlas and put(k, c * T + 16, r * T)
for c in range(5, 15, 2):
    for r in range(59, 66, 2): put(rnd.choice(["corn", "wheat"]), c * T + 16, r * T + 24, (20, 8))
for c in range(22, 30, 2):
    for r in range(59, 66, 2): put(rnd.choice(["tomato", "bean", "melon", "eggplant"]), c * T + 16, r * T + 24, (20, 8))
# mata: bordas e sul (de onde vêm os saqueadores)
def forest(c0, r0, c1, r1, dens):
    for r in range(r0, r1, 2):
        for c in range(c0, c1, 2):
            if rnd.random() < dens and not road[min(r, ROWS - 1), min(c, COLS - 1)]:
                k = rnd.choice(["pine1", "pine2", "oak1", "oak2", "oak3", "oak4", "tree1", "tree2", "tree5"])
                put(k, c * T + rnd.randint(-10, 10), r * T + rnd.randint(-8, 8), (24, 16))
forest(53, 56, 80, 70, .75); forest(84, 34, 99, 70, .7); forest(84, 6, 99, 25, .6); forest(1, 7, 6, 50, .7); forest(36, 7, 46, 20, .35); forest(56, 8, 79, 20, .35)
for (k, c, r) in (("apple", 8, 47), ("orange", 12, 46), ("apple", 30, 44), ("bush1", 47, 21), ("bush2", 53, 21), ("bush3", 62, 45), ("bush4", 37, 45)):
    put(k, c * T, r * T, (24, 14))
# grama: tufos do pacote da vila espalhados
TUFT = [V2(os.path.join(VIL, "2 Objects", "5 Grass", f"{i}.png")) for i in range(1, 7)]
for _ in range(1400):
    c, r = rnd.randrange(3, COLS - 2), rnd.randrange(7, ROWS - 1)
    if not road[r, c] and solid[r * T // G, c * T // G] == 0:
        t = rnd.choice(TUFT); ground.alpha_composite(t, (c * T + rnd.randint(0, 20), r * T + rnd.randint(0, 20)))
spots = {
    "start": [18 * T + 16, 62 * T], "mira": [14 * T, 58 * T + 20], "millLever": [12 * T + 40, 57 * T + 8],
    "baker": [44 * T, 39 * T], "smith": [87 * T, 29 * T], "bridgeW": [79 * T, 29 * T + 16], "bridgeE": [83 * T + 16, 29 * T + 16],
    "ticoMom": [52 * T, 32 * T], "tico": [58 * T + 10, 22 * T], "tavernDoor": [17 * T, 33 * T + 12], "bram": [17 * T, 34 * T],
    "well": [50 * T, 30 * T + 20], "gate": [50 * T, 6 * T + 8], "wallTop": [50 * T, 2 * T], "raidFrom": [66 * T, 66 * T],
    "rescue": [[34 * T, 24 * T + 10], [66 * T, 24 * T + 10], [34 * T, 41 * T], [26 * T, 57 * T], [87 * T, 30 * T]],
    "festival": [50 * T, 28 * T],
}
coll = ["".join(str(v) for v in row) for row in solid]
json.dump({"w": W, "h": H, "g": G, "coll": coll, "props": props, "spots": spots, "wallH": 6 * T, "gateX": 50 * T},
          open(os.path.join(OUT, "map.json"), "w"), separators=(",", ":"))
gq = ground.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
gq.save(os.path.join(OUT, "ground.png"), optimize=True)
# prévia
P = ground.copy()
for k, x, y, *f in sorted(props, key=lambda p: p[2]):
    im = atlas[k]; P.alpha_composite(im, (x - im.width // 2, y - im.height))
P.resize((W // 4, H // 4), Image.LANCZOS).save("/tmp/valdrak_preview.png")
print("mapa", W, H, "objetos", len(props), "atlas", A.size, "chão KB", os.path.getsize(os.path.join(OUT, "ground.png")) // 1024)
