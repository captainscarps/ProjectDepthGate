"""
Taverna do Refúgio (a cabana do curtidor, que vivia trancada, vira a entrada): interior grande montado do mapa do
pacote CraftPix "Tavern" (só cenário; os fregueses desenhados no mapa ficam de fora) e dois funcionários:
  · Farias, o taberneiro — sprite do taberneiro (peasant-4) com cabelo e barba grisalhos, pele morena, óculos
    redondos e camisa verde-escura, como no retrato dele;
  · Maria, a garçonete — sprite da garçonete (peasant-2) com cabelo castanho ondulado de pontas claras, bandana
    preta estampada e blusa marrom-escura, como no retrato dela.
Os retratos de fala (5 expressões de cada) viram os 128x128 que a caixa de fala do Refúgio usa.
Saídas: assets/pixel-art/npc/farias.png, maria.png, farias-p-*.png, maria-p-*.png
        assets/pixel-art/hub/taverna/base.png, top.png, props.png/.json, taverna.json
Uso: python3 scripts/build_taverna.py <pasta Tiled_files do pacote Tavern> <retrato Farias> <retrato Maria>
"""
import json, math, os, sys, xml.etree.ElementTree as ET
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NPC = os.path.join(ROOT, "assets", "pixel-art", "npc"); OUT = os.path.join(ROOT, "assets", "pixel-art", "hub", "taverna")
os.makedirs(OUT, exist_ok=True)
TD, PF, PM = sys.argv[1], sys.argv[2], sys.argv[3]

# ── retratos ────────────────────────────────────────────────────────────────────────────────────────
def portraits(src, name):
    im = Image.open(src).convert("RGBA"); a = np.array(im).astype(int)
    white = (a[..., :3].min(-1) > 236)
    # fundo = branco ligado à borda (os olhos e dentes brancos ficam)
    lab, _ = ndimage.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)); a[bg, 3] = 0
    Hh, Ww = a.shape[:2]; cw = Ww // 3
    cells = [(0, 0, cw), (0, cw, 2 * cw), (0, 2 * cw, Ww), (1, cw // 2, cw // 2 + cw), (1, cw // 2 + cw, cw // 2 + 2 * cw)]
    boxes = []
    for row, x0, x1 in cells:
        y0, y1 = (0, Hh // 2) if row == 0 else (Hh // 2, Hh); m = a[y0:y1, x0:x1, 3] > 0
        yy_, xx_ = np.where(m); boxes.append((slice(y0 + yy_.min(), y0 + yy_.max() + 1), slice(x0 + xx_.min(), x0 + xx_.max() + 1)))
    keys = ["calm", "smile", "aggression", "special", "sadness"]
    for k, sl in zip(keys, boxes):
        crop = Image.fromarray(a[sl].clip(0, 255).astype(np.uint8))
        s = max(crop.size); sq = Image.new("RGBA", (s, s)); sq.paste(crop, ((s - crop.width) // 2, s - crop.height))
        p = sq.resize((128, 128), Image.BOX)
        al = np.array(p)[..., 3]; p = p.convert("RGB").quantize(48, method=Image.Quantize.MEDIANCUT).convert("RGBA")
        pa = np.array(p); pa[..., 3] = np.where(al > 110, 255, 0); p = Image.fromarray(pa)
        p.save(os.path.join(NPC, f"{name}-p-{k}.png"))
        if k == "calm": p.save(os.path.join(NPC, f"{name}-p-talk.png"))
    print(name, "retratos", len(boxes))
portraits(PF, "farias"); portraits(PM, "maria")

# ── sprites recoloridos ─────────────────────────────────────────────────────────────────────────────
C = lambda *v: np.array(list(v) + [255], np.uint8)
def recolor(src, dst, fn):
    a = np.array(Image.open(os.path.join(NPC, src)).convert("RGBA"))
    for r in range(a.shape[0] // 128):
        for c in range(a.shape[1] // 128):
            f = a[r * 128:(r + 1) * 128, c * 128:(c + 1) * 128]
            if f[..., 3].any(): fn(f)
    Image.fromarray(a).save(os.path.join(NPC, dst))
def eq(f, col): return (f[..., 3] > 0) & np.all(f[..., :3] == col, axis=-1)

def farias(f):
    ys, xs = np.where(f[..., 3] > 0); top = ys.min(); head = np.zeros(f.shape[:2], bool); head[top:top + 20] = True
    skin = eq(f, (252, 165, 112)); beard = (eq(f, (176, 91, 44)) | eq(f, (125, 56, 51)) | eq(f, (97, 39, 33))) & head
    # lado da frente = onde está a barba
    hx = xs[ys < top + 9]; hc = (hx.min() + hx.max()) / 2; bx = np.where(beard)[1]; front = 1 if (bx.mean() if len(bx) else hc + 1) >= hc else -1
    f[eq(f, (176, 91, 44)) & head] = C(206, 202, 196); f[eq(f, (125, 56, 51)) & head] = C(158, 154, 150); f[eq(f, (97, 39, 33)) & head] = C(118, 114, 112)
    f[eq(f, (103, 57, 49)) & head & (np.arange(128)[:, None] < top + 14)] = C(138, 134, 130)
    # cabelo grisalho dos lados e de trás (careca no alto)
    hs = skin & head
    for y in range(top + 2, top + 11):
        row = np.where(hs[y])[0]
        if not len(row): continue
        nb = 1 if y == top + 2 else (2 if y < top + 5 else 3)
        back = row[:nb] if front == 1 else row[::-1][:nb]
        for x in back: f[y, x, :3] = (184, 180, 176) if (x + y) % 3 else (140, 136, 134)
    # pele morena
    f[skin] = C(178, 114, 80); f[eq(f, (140, 91, 62))] = C(112, 70, 48); f[eq(f, (178, 148, 118))] = C(178, 148, 118)
    # camisa verde-escura
    f[eq(f, (70, 84, 86))] = C(46, 70, 66)
    # óculos: acha o olho (pixel escuro cercado de pele) na metade da frente da cabeça
    sk2 = np.all(f[..., :3] == (178, 114, 80), axis=-1)
    best = None
    for y in range(top + 4, top + 11):
        for x in range(int(hc), int(hc) + 9 * front, front):
            if 1 <= x < 127 and f[y, x, 3] and f[y, x, :3].sum() < 120 and sk2[y, x - front] and (sk2[y - 1, x] or sk2[y + 1, x]):
                best = (x, y); break
        if best: break
    if best:
        ex, ey = best; D = (26, 20, 22)
        ring = [(ex - 1, ey - 2), (ex, ey - 2), (ex + 1, ey - 2), (ex - 2, ey - 1), (ex - 2, ey), (ex - 2, ey + 1), (ex + 2, ey - 1), (ex + 2, ey), (ex + 2, ey + 1), (ex - 1, ey + 2), (ex, ey + 2), (ex + 1, ey + 2)]
        temple = [(ex - 3 * front, ey - 1), (ex - 4 * front, ey - 1), (ex - 5 * front, ey - 1)]
        for x, y in ring + temple:
            if 0 <= x < 128 and 0 <= y < 128 and f[y, x, 3]: f[y, x, :3] = D
        for x, y in ((ex - front, ey - 1), (ex + front, ey + 1)):   # brilho na lente
            if f[y, x, 3] and np.array_equal(f[y, x, :3], (178, 114, 80)): f[y, x, :3] = (204, 160, 132)
recolor("peasant-4.png", "farias.png", farias)

def maria(f):
    ys, xs = np.where(f[..., 3] > 0); top = ys.min()
    hairc = [(176, 91, 44), (125, 56, 51), (97, 39, 33), (59, 32, 39)]
    hm = np.zeros(f.shape[:2], bool)
    for col in hairc: hm |= eq(f, col)
    lab, n = ndimage.label(hm); keep = set(np.unique(lab[top:top + 6])) - {0}
    hair = np.isin(lab, list(keep))
    yy = np.arange(128)[:, None] * np.ones((1, 128), int)
    lower = yy > top + 15
    f[hair & eq(f, (176, 91, 44)) & ~lower] = C(112, 76, 52); f[hair & eq(f, (176, 91, 44)) & lower] = C(178, 140, 94)
    f[hair & eq(f, (125, 56, 51))] = C(90, 60, 44); f[hair & eq(f, (97, 39, 33)) & ~lower] = C(70, 46, 34); f[hair & eq(f, (97, 39, 33)) & lower] = C(140, 106, 70)
    f[hair & eq(f, (59, 32, 39))] = C(52, 36, 30)
    # bandana preta estampada no alto da cabeça + nó atrás
    hy, hx = np.where(hair)
    if len(hy):
        band = hair & (yy <= top + 5)
        f[band] = C(32, 27, 29)
        inner = band & ndimage.binary_erosion(band | ~hair & (f[..., 3] > 0) & (yy <= top + 5), iterations=1)
        for y, x in zip(*np.where(inner)):
            if (x * 5 + y * 3) % 11 == 0: f[y, x, :3] = (176, 170, 164)
        bx = hx[hy <= top + 4]; back = bx.max() if len(bx) else None
        if back is not None and back + 2 < 128:
            for dy, dx in ((3, 1), (4, 1), (4, 2), (5, 2), (5, 1)): f[top + dy, back + dx] = (32, 27, 29, 255)
    # blusa marrom-escura e pele levemente mais morena
    f[eq(f, (178, 139, 120))] = C(80, 56, 50); f[eq(f, (113, 65, 59))] = C(58, 40, 37); f[eq(f, (189, 164, 153))] = C(104, 76, 68)
    f[eq(f, (252, 165, 112))] = C(232, 166, 124)
recolor("peasant-2.png", "maria.png", maria)

# ── interior da taverna ─────────────────────────────────────────────────────────────────────────────
r = ET.parse(os.path.join(TD, "Tavern_interior_1nd_floor.tmx")).getroot(); T = 16; ts = []
for t in r.findall("tileset"):
    im = t.find("image"); ts.append((int(t.get("firstgid")), int(t.get("columns")), Image.open(os.path.join(TD, im.get("source"))).convert("RGBA")))
ts.sort(key=lambda a: a[0])
def tile(g):
    for f_, c, im in reversed(ts):
        if g >= f_: i = g - f_; return im.crop(((i % c) * T, (i // c) * T, (i % c) * T + T, (i // c) * T + T))
layers = {}; MINX, MINY = -11, -10; TW, TH = 26 * T, 20 * T
for L in r.iter("layer"):
    cells = []
    for ch in L.find("data").findall("chunk"):
        x0, y0, w = int(ch.get("x")), int(ch.get("y")), int(ch.get("width"))
        for k, v in enumerate(int(s) for s in ch.text.replace("\n", "").split(",") if s.strip()):
            if v: cells.append((x0 + k % w, y0 + k // w, v))
    layers[L.get("name")] = cells
def render(names):
    img = Image.new("RGBA", (TW, TH))
    for n in names:
        for x, y, g in layers.get(n, []):
            tl = tile(g & 0x1FFFFFFF)
            if g & 0x80000000: tl = tl.transpose(Image.FLIP_LEFT_RIGHT)
            if g & 0x40000000: tl = tl.transpose(Image.FLIP_TOP_BOTTOM)
            img.alpha_composite(tl, ((x - MINX) * T, (y - MINY) * T))
    return img
BASE = render(["floor", "Walls", "Stairs", "Walls_top2"])
TOP = render(["Walls_top1"])
FURN = ["Furniture3", "Furniture2", "Furniture1", "Stuff_on_tables"]
# capacho na saída (meio da parede de baixo)
DOOR = (208, 236)
base = BASE.copy(); ba = np.array(base)
ba[DOOR[1] - 10:DOOR[1] - 2, DOOR[0] - 14:DOOR[0] + 14, :3] = (122, 64, 48); ba[DOOR[1] - 10:DOOR[1] - 2, DOOR[0] - 14:DOOR[0] + 14, 3] = 255
ba[DOOR[1] - 9:DOOR[1] - 3, DOOR[0] - 12:DOOR[0] + 12, :3] = (150, 84, 58)
ba[DOOR[1] - 2:DOOR[1] + 4, DOOR[0] - 16:DOOR[0] + 16] = (18, 12, 10, 255)   # vão da porta
Image.fromarray(ba).save(os.path.join(OUT, "base.png"), optimize=True); TOP.save(os.path.join(OUT, "top.png"), optimize=True)
# móveis um a um (profundidade pela base)
fa = np.array(render(FURN)); lab, _ = ndimage.label(fa[..., 3] > 0); parts = []
for i, sl in enumerate(ndimage.find_objects(lab), 1):
    h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
    if h * w < 12: continue
    crop = fa[sl].copy(); crop[lab[sl] != i] = 0; parts.append((sl[1].start, sl[0].start, w, h, Image.fromarray(crop)))
parts.sort(key=lambda p: -p[3]); AW = 512; x = y = rh = 0; frames = {}; props = []
for n_, (px, py, w, h, img) in enumerate(parts):
    if x + w > AW: x = 0; y += rh + 2; rh = 0
    k = f"t{n_}"; frames[k] = {"frame": {"x": x, "y": y, "w": w, "h": h}}; props.append([k, px + w // 2, py + h, w, h]); x += w + 2; rh = max(rh, h)
AT = Image.new("RGBA", (AW, y + rh))
for (k, fr), p in zip(frames.items(), parts): AT.paste(p[4], (fr["frame"]["x"], fr["frame"]["y"]))
AT.save(os.path.join(OUT, "props.png"), optimize=True)
json.dump({"frames": frames, "meta": {"image": "props.png", "size": {"w": AT.width, "h": AT.height}, "scale": 1}}, open(os.path.join(OUT, "props.json"), "w"))
# colisão (8 px, medida nos pés do herói: FO abaixo da posição)
G, FO = 8, 24
floor = np.array(render(["floor"]))[..., 3] > 0; wall = np.array(render(["Walls", "Walls_top1", "Walls_top2", "Stairs"]))[..., 3] > 0
solid = np.ones((TH // G, TW // G), bool)
for gy in range(TH // G):
    for gx in range(TW // G):
        cx, cy = gx * G + 4, gy * G + 4 + FO
        if cy >= TH - 2: continue
        win = (slice(cy - 3, cy + 3), slice(cx - 3, cx + 3))
        solid[gy, gx] = not floor[win].mean() > .6 or wall[win].mean() > .25
for k, px, py, w, h in props:
    fh = max(5, h * .45) if h > 12 else 4; fw = w * .8
    for gy in range(int((py - fh - FO) // G), int(math.ceil((py - FO) / G))):
        for gx in range(int((px - fw / 2) // G), int(math.ceil((px + fw / 2) / G))):
            if 0 <= gy < TH // G and 0 <= gx < TW // G: solid[gy, gx] = True
# a faixa da porta fica livre (é por onde se sai)
for gy in range((DOOR[1] - FO - 30) // G, (DOOR[1] - FO + 4) // G + 1):
    for gx in range((DOOR[0] - 12) // G, (DOOR[0] + 12) // G + 1): solid[gy, gx] = False
J = {"w": TW, "h": TH, "g": G, "feetOff": FO, "coll": ["".join("1" if v else "0" for v in row) for row in solid], "props": [[k, px, py] for k, px, py, w, h in props],
     "door": [DOOR[0], DOOR[1] - FO], "spawn": [DOOR[0], DOOR[1] - FO - 14],
     "spots": {"farias": [208, 126], "counter": [208, 143], "maria": [[126, 146], [208, 190], [296, 146], [208, 192]]}}
json.dump(J, open(os.path.join(OUT, "taverna.json"), "w"), separators=(",", ":"))
# prévia
pv = Image.fromarray(ba).copy()
for k, px, py, w, h in props: fr = frames[k]["frame"]; pv.alpha_composite(AT.crop((fr["x"], fr["y"], fr["x"] + fr["w"], fr["y"] + fr["h"])), (px - w // 2, py - h))
pv.alpha_composite(TOP); bg = Image.new("RGBA", pv.size, (30, 20, 20, 255)); bg.alpha_composite(pv)
cm = Image.fromarray((solid * 255).astype(np.uint8)).resize((TW, TH), Image.NEAREST)
red = Image.new("RGBA", pv.size, (255, 0, 0, 90)); bg2 = bg.copy(); bg2.paste(red, mask=cm)
bg.resize((TW * 2, TH * 2), Image.NEAREST).save("/tmp/tav_prev.png"); bg2.resize((TW * 2, TH * 2), Image.NEAREST).save("/tmp/tav_coll.png")
print("taverna ok", len(props), "móveis")
