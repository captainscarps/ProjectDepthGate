"""
Templo do deserto (memória "A Voz", missão "O Rei que Abriu as Portas"): salão de arenito onde o rei Aelric rezava.
Piso de lajes com rejunte e areia acumulada nos cantos, paredes escuras com nichos, colunas, ídolo alado sobre o
altar, gárgulas, urnas, estandartes e sarcófagos (pacote de props do templo do jogo, dobrados).
Saída: assets/pixel-art/valdrak/map/temple-ground.png, temple-props.png/.json, temple.json
Uso: python3 scripts/build_valdrak_temple.py
"""
import json, math, os, random
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "valdrak", "map"); SRC = os.path.join(ROOT, "assets", "pixel-art", "props-temple")
W, H, G = 1600, 1120, 16; WALL = 180; SIDE = 120
rnd = random.Random(21)
def noise(w, h, cell, seed):
    r = np.random.default_rng(seed); g = r.random((h // cell + 3, w // cell + 3)).astype(np.float32)
    return np.array(Image.fromarray((g * 255).astype(np.uint8)).resize(((w // cell + 3) * cell, (h // cell + 3) * cell), Image.BICUBIC), np.float32)[:h, :w] / 255
C = dict(slab=(214, 178, 118), slab_l=(226, 194, 136), slab_d=(190, 152, 96), mortar=(142, 104, 64), sand=(232, 204, 148), sand_d=(212, 182, 126),
         wall=(84, 62, 48), wall_l=(112, 86, 64), wall_d=(56, 40, 32), gold=(214, 170, 72))
A = np.zeros((H, W, 3), np.uint8)
# lajes retangulares desencontradas (2 px por pixel de arte)
y = 0; row = 0
while y < H:
    sh = rnd.choice([48, 56, 64]); x = -rnd.randint(0, 60) if row % 2 else 0
    while x < W:
        sw = rnd.choice([64, 80, 96, 112]); col = C[rnd.choice(["slab", "slab", "slab_l", "slab_d"])]
        x0, x1, y1 = max(0, x), min(W, x + sw), min(H, y + sh)
        A[y:y1, x0:x1] = col
        A[y:y1, x0:min(W, x0 + 4)] = C["mortar"]; A[y:min(H, y + 4), x0:x1] = C["mortar"]
        A[max(y, y1 - 4):y1, x0:x1] = np.minimum(np.array(col) * .86, 255).astype(np.uint8)   # sombra embaixo da laje
        if rnd.random() < .18:   # rachadura
            cx, cy = rnd.randint(x0 + 8, max(x0 + 9, x1 - 8)), rnd.randint(y + 8, max(y + 9, y1 - 8))
            for k in range(rnd.randint(6, 14)): A[min(H - 1, cy + k * 2):min(H, cy + k * 2 + 2), min(W - 1, cx + (k % 3 - 1) * 2):min(W, cx + (k % 3 - 1) * 2 + 2)] = C["mortar"]
        x += sw
    y += sh; row += 1
# areia acumulada nos cantos e junto às paredes (bordas irregulares em blocos de 2 px)
n = np.kron(noise(W // 2, H // 2, 30, 3), np.ones((2, 2)))[:H, :W]
yy, xx = np.mgrid[0:H, 0:W]
edge = np.minimum.reduce([xx - SIDE, W - SIDE - xx, yy - WALL, H - 40 - yy]).astype(np.float32)
sand = (n * 120 - edge) > 40
A[sand] = C["sand"]; A[sand & (n > .62)] = C["sand_d"]
# paredes: topo com friso, laterais escuras
def stone_wall(x0, y0, x1, y1):
    for by in range(y0, y1, 32):
        off = 0 if (by // 32) % 2 else 24
        for bx in range(x0 - off, x1, 48):
            a0, a1 = max(x0, bx), min(x1, bx + 46)
            if a1 > a0: A[by:min(y1, by + 30), a0:a1] = C[rnd.choice(["wall", "wall", "wall_l"])]; A[min(y1, by + 28):min(y1, by + 30), a0:a1] = C["wall_d"]
stone_wall(0, 0, W, WALL); stone_wall(0, WALL, SIDE, H); stone_wall(W - SIDE, WALL, W, H)
A[WALL - 18:WALL - 10, SIDE:W - SIDE] = C["gold"]; A[WALL - 10:WALL, SIDE:W - SIDE] = C["wall_d"]   # friso dourado
for nx in range(SIDE + 120, W - SIDE - 60, 220):   # nichos com vela
    A[50:130, nx:nx + 50] = C["wall_d"]; A[95:110, nx + 20:nx + 30] = (240, 220, 160)
# janela alta por onde entra o sol (fonte da luz do enigma)
A[20:90, 210:270] = (250, 232, 180); A[20:26, 204:276] = C["wall_d"]
ground = Image.fromarray(A, "RGB")
ground.save(os.path.join(OUT, "temple-ground.png"), optimize=True)
# objetos
K2 = lambda f, k=2: (lambda im: im.resize((im.width * k, im.height * k), Image.NEAREST))(Image.open(os.path.join(SRC, f + ".png")).convert("RGBA"))
atlas = {k: K2(f, 3 if k in ("col", "colb") else 2) for k, f in {"col": "temple-column-intact", "colb": "temple-column-broken", "idol": "temple-winged-idol", "altar": "temple-altar",
         "garg-l": "temple-gargoyle-l", "garg-r": "temple-gargoyle-r", "urns": "temple-urns", "banner": "temple-banner", "sarc": "temple-sarcophagus-effigy",
         "coffin": "temple-coffin-skeleton", "gold1": "temple-gold-pile-1"}.items()}
keys = sorted(atlas, key=lambda k: -atlas[k].height); AW = 1024; x = y = rh = 0; frames = {}
for k in keys:
    im = atlas[k]
    if x + im.width > AW: x = 0; y += rh + 2; rh = 0
    frames[k] = {"frame": {"x": x, "y": y, "w": im.width, "h": im.height}}; x += im.width + 2; rh = max(rh, im.height)
AT = Image.new("RGBA", (AW, y + rh))
for k, f in frames.items(): AT.paste(atlas[k], (f["frame"]["x"], f["frame"]["y"]))
AT.save(os.path.join(OUT, "temple-props.png"), optimize=True)
json.dump({"frames": frames, "meta": {"image": "temple-props.png", "size": {"w": AT.width, "h": AT.height}, "scale": 1}}, open(os.path.join(OUT, "temple-props.json"), "w"))
props = []; solid = np.zeros((H // G, W // G), np.uint8)
def block(x0, y0, x1, y1): solid[max(0, int(y0) // G):int(math.ceil(y1 / G)), max(0, int(x0) // G):int(math.ceil(x1 / G))] = 1
def put(k, x, y, foot=None):
    im = atlas[k]; props.append([k, int(x), int(y)]); fw, fh = foot or (im.width * .7, 22); block(x - fw / 2, y - fh, x + fw / 2, y)
block(0, 0, W, WALL); block(0, 0, SIDE, H); block(W - SIDE, 0, W, H); block(0, H - 30, W, H)
put("idol", 800, WALL + 70, (200, 50)); put("altar", 800, WALL + 170, (110, 40))
put("garg-l", 560, WALL + 120, (90, 40)); put("garg-r", 1040, WALL + 120, (90, 40))
for i, cx in enumerate((300, 520, 1080, 1300)):
    for cy in (480, 780): put("colb" if (i + cy) % 3 == 0 else "col", cx, cy, (50, 26))
for k, x, y in (("urns", 220, 300), ("urns", 1380, 300), ("banner", 420, WALL + 10), ("banner", 1180, WALL + 10), ("sarc", 210, 640), ("coffin", 1400, 640),
                ("sarc", 1400, 930), ("gold1", 230, 960), ("urns", 700, 1030), ("urns", 900, 1030)):
    put(k, x, y, (30, 16))
spots = {"start": [800, 1040], "sun": [240, 92], "altar": [800, WALL + 200],
         "mirrors": [[380, 360], [1220, 600], [800, 900]], "queen": [800, 1110]}
json.dump({"w": W, "h": H, "g": G, "coll": ["".join(str(v) for v in r) for r in solid], "props": props, "spots": spots}, open(os.path.join(OUT, "temple.json"), "w"), separators=(",", ":"))
P = ground.convert("RGBA")
for k, x, y in sorted(props, key=lambda p: p[2]): im = atlas[k]; P.alpha_composite(im, (x - im.width // 2, y - im.height))
P.resize((W // 2, H // 2)).save("/tmp/temple_preview.png"); print("templo ok", AT.size)
