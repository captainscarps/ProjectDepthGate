"""
Refúgio: setor aberto para o mar ao sul do portal, com a doca de pesca do pacote CraftPix "2D Pixel Fishing Village"
(só cenário: chão do píer, casa, rede, tubarão pendurado, caixotes, barris, peixes, barcos). Os personagens do pacote
(velho, menino, goblin no tubarão, pescador no barco) ficam de fora.

O mapa do Refúgio cresce de 704 para 1120 px de altura:
  · ground.png ganha embaixo grama, um caminho de tijolo saindo da praça, a margem de terra e o mar com a doca;
  · village.json ganha as linhas novas da grade de colisão (água sólida, píer livre, objetos com pé sólido) e
    os pontos "dock", "dockEnd", "shore";
  · refugio/dock.png/.json: os objetos altos da doca recortados um a um (casa, rede, caixotes...), que o jogo
    desenha com profundidade pela base (o herói passa atrás e na frente deles);
  · refugio/sea-wave.png e fish-jump.png: brilho da água e peixes pulando, animados no jogo.
Uso: python3 scripts/build_refugio_dock.py /tmp/fish/dock/Tiled_foles
(o ground.png original é sempre lido só até a linha 704, então rodar de novo é seguro)
"""
import json, math, os, sys, xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, "assets", "pixel-art", "hub", "village"); RF = os.path.join(ROOT, "assets", "pixel-art", "hub", "refugio")
TD = sys.argv[1] if len(sys.argv) > 1 else "/tmp/fish/dock/Tiled_foles"
W, H0, ADD, G = 1024, 704, 416, 8; H = H0 + ADD
DX, DY = 500, H0 + 58          # canto superior esquerdo da doca no mapa
NPC = {"Boy_weaves", "Fisherman_boat1_throws", "Old_man_idle", "Boy_amazed", "Cobold_on_shark", "Boy_looking", "Seller_gramma", "Fisherman_boat1_idle"}

# ── leitura do Tiled ────────────────────────────────────────────────────────────────────────────────
r = ET.parse(os.path.join(TD, "Fishing_dock.tmx")).getroot(); T = 16; ts = []
for t in r.findall("tileset"):
    im = t.find("image"); ts.append((int(t.get("firstgid")), int(t.get("columns")), Image.open(os.path.join(TD, im.get("source"))).convert("RGBA"), os.path.basename(im.get("source"))[:-4]))
ts.sort(key=lambda a: a[0])
def tile(g):
    for f, c, im, fn in reversed(ts):
        if g >= f: i = g - f; return im.crop(((i % c) * T, (i // c) * T, (i % c) * T + T, (i // c) * T + T)), fn
layers = {}; MINX, MINY = -3, -5
for L in r.iter("layer"):
    cells = []
    for ch in L.find("data").findall("chunk"):
        x0, y0, w = int(ch.get("x")), int(ch.get("y")), int(ch.get("width"))
        for k, v in enumerate(int(s) for s in ch.text.replace("\n", "").split(",") if s.strip()):
            if v: cells.append((x0 + k % w, y0 + k // w, v))
    layers[L.get("name")] = cells
DW, DH = 31 * T, 19 * T
def render(names):
    img = Image.new("RGBA", (DW, DH))
    for n in names:
        for x, y, g in layers[n]:
            tl, fn = tile(g & 0x1FFFFFFF)
            if fn in NPC: continue
            if g & 0x80000000: tl = tl.transpose(Image.FLIP_LEFT_RIGHT)
            if g & 0x40000000: tl = tl.transpose(Image.FLIP_TOP_BOTTOM)
            img.alpha_composite(tl, ((x - MINX) * T, (y - MINY) * T))
    return img
WDET = render(["water_detailsation1", "water_detailsation2", "water_detailsation3", "water_detailsation4", "water_detailsation5"])
FLOOR = render(["piles_bottom", "Big_boat1", "floor", "Piles_top_back", "Big_boat2", "ropes", "Small_boats", "Small_boats2"])
DECK = render(["floor"])
OBJ = render(["Objects1", "Objects2", "Objects3", "piles_top_front"])
water_tile = np.array(tile(1507)[0].convert("RGB"))

# ── chão original e o pedaço novo ───────────────────────────────────────────────────────────────────
G0 = Image.open(os.path.join(V, "ground.png")).convert("RGBA").crop((0, 0, W, H0))
A0 = np.array(G0).astype(np.int16); A0[H0 - 1] = A0[H0 - 2]   # a última linha era uma borda escura do mapa
rng = np.random.default_rng(7)
def noise(w, h, cell, seed):
    rr = np.random.default_rng(seed); g = rr.random((h // cell + 3, w // cell + 3)).astype(np.float32)
    return np.array(Image.fromarray((g * 255).astype(np.uint8)).resize(((w // cell + 3) * cell, (h // cell + 3) * cell), Image.BICUBIC), np.float32)[:h, :w] / 255
FULL = np.zeros((H, W, 4), np.int16); FULL[:H0] = A0
yy, xx = np.mgrid[0:H, 0:W]
# grama: o mesmo verde do Refúgio, com manchas suaves (em blocos de 2 px, como a arte)
GR = np.array([123, 174, 85]); n1 = np.kron(noise(W // 2, H // 2, 40, 1), np.ones((2, 2)))[:H, :W]
grass = np.clip(GR[None, None, :] + ((n1 - .5) * 16)[..., None] * np.array([.6, 1, .5]), 0, 255)
# linha da margem (y local de onde começa a água), orgânica, encostando no topo do píer principal
nx = np.kron(noise(W // 2, 4, 60, 3)[0], np.ones(2))[:W]
shore = H0 + 118 + (nx - .5) * 44
deckTop = DY + 70
for x in range(W):   # embaixo do píer a terra chega até a borda dele, descendo em rampa suave dos lados
    out = max(DX + 30 - x, x - (DX + 270), 0); shore[x] = max(shore[x], deckTop + 16 - out * .9)
shore = ndimage.uniform_filter1d(shore, 9); shore = (np.round(shore / 2) * 2).astype(int)
land = yy < shore[None, :]
# caminho de tijolo da praça (sai ao lado do portal) até o píer, com borda irregular
path = np.zeros((H, W), bool); pts = [(652, 640), (666, 700), (696, 760), (712, 800), (714, deckTop + 12)]
im = Image.new("L", (W, H)); d = ImageDraw.Draw(im)
for (a, b), (c, e) in zip(pts, pts[1:]): d.line([a, b, c, e], fill=255, width=50)
for (a, b) in pts: d.ellipse([a - 25, b - 25, a + 25, b + 25], fill=255)
pm = np.array(im) > 0
edge_n = np.kron(noise(W // 2, H // 2, 6, 9), np.ones((2, 2)))[:H, :W]
pm = ndimage.binary_dilation(pm, iterations=3) & ((ndimage.distance_transform_edt(~np.array(im).astype(bool)) < 3 + edge_n * 6) | (np.array(im) > 0))
path = pm & (yy >= 630)
brick = A0[560:608, 560:608, :3]
bt = np.tile(brick, (H // 48 + 1, W // 48 + 1, 1))[:H, :W]
# margem: faixa de terra e um barranco escuro, depois espuma clara na água
dshore = shore[None, :] - yy
sand = (dshore > 0) & (dshore <= 12); cliff = (dshore > 0) & (dshore <= 4); foam = (dshore <= 0) & (dshore > -3)
SAND = np.array([164, 122, 82]); CLIFF = np.array([104, 70, 52]); FOAM = np.array([170, 210, 230])
wt = np.tile(water_tile, (H // 16 + 1, W // 16 + 1, 1))[:H, :W]
new = np.zeros((H, W, 3), np.int16)
new[...] = wt; new[land] = grass[land]; new[sand] = SAND; new[cliff] = CLIFF; new[foam] = (wt[foam] * .4 + FOAM * .6)
# brilho e sombra de ondas no mar (pixels soltos de 2 px)
wn = np.array(Image.fromarray((noise(W // 24 + 2, H // 4 + 2, 3, 5) * 255).astype(np.uint8)).resize((W + 48, H + 8), Image.BICUBIC), np.float32)[:H, :W] / 255
wn = np.kron(wn[::2, ::2], np.ones((2, 2)))[:H, :W]
sea = ~land & ~foam
hi, lo = sea & (wn > .86), sea & (wn < .1)
new[hi] = np.clip(wt[hi] + 9, 0, 255); new[lo] = np.clip(wt[lo] - 10, 0, 255)
# florzinhas e tufos: recortados da grama do próprio Refúgio e espalhados pela grama nova
gref = A0[140:690, :, :3]; base = np.array([123, 174, 85]); dev = np.abs(gref - base).sum(-1) > 60
grassy = ndimage.uniform_filter((np.abs(gref - base).sum(-1) < 30).astype(float), 15) > .8
lab2, n2 = ndimage.label(dev & ndimage.binary_dilation(grassy, iterations=6)); decals = []
for i, sl in enumerate(ndimage.find_objects(lab2), 1):
    hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
    if 3 <= hh <= 12 and 2 <= ww <= 14: m = lab2[sl] == i; decals.append((gref[sl].copy(), m))
dens = 0
for _ in range(int(W * ADD * len(decals) / max(1, gref.shape[0] * W) * 1.0)):
    d_, m_ = decals[rng.integers(len(decals))]; x_, y_ = rng.integers(4, W - 20), rng.integers(H0 + 6, H - 14)
    hh, ww = m_.shape
    if not land[y_:y_ + hh, x_:x_ + ww].all() or (shore[x_] - (y_ + hh)) < 16: continue
    sub = new[y_:y_ + hh, x_:x_ + ww]; sub[m_] = d_[m_]; dens += 1
print("enfeites", len(decals), dens)
# tijolo por cima da grama e da terra (nunca na água), com contorno escuro como a praça
pth = path & (land | (yy < H0))
outline = ndimage.binary_dilation(pth, iterations=1) & ~pth & (land | (yy < H0))
region = yy >= H0
FULL[region, :3] = new[region]; FULL[region, 3] = 255
FULL[pth, :3] = bt[pth]; FULL[outline & ~pth, :3] = np.array([92, 120, 60])
# junção suave com o chão antigo (as últimas linhas dele são só grama)
for k in range(10):
    a = (k + 1) / 11; row = H0 + k; m = ~pth[row]
    FULL[row, m, :3] = (A0[H0 - 2, m, :3] * (1 - a) + FULL[row, m, :3] * a).astype(np.int16)
GI = Image.fromarray(FULL.clip(0, 255).astype(np.uint8), "RGBA")
# a doca: sombras da água (só sobre a água), o chão do píer e os barcos
wd = np.array(WDET); seaMask = (~land[DY:DY + DH, DX:DX + DW]) if DY + DH <= H else None
wd[..., 3] = wd[..., 3] * seaMask[:wd.shape[0], :wd.shape[1]]
GI.alpha_composite(Image.fromarray(wd), (DX, DY)); GI.alpha_composite(FLOOR, (DX, DY))
GI.save(os.path.join(V, "ground.png"), optimize=True)

# ── objetos altos recortados um a um ───────────────────────────────────────────────────────────────
parts = []
for ln in ("Objects1", "Objects2", "Objects3", "piles_top_front"):   # camada por camada: a casa não gruda nos caixotes
    oa = np.array(render([ln])); lab, nl = ndimage.label(oa[..., 3] > 0)
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if h * w < 30: continue
        crop = oa[sl].copy(); crop[lab[sl] != i] = 0
        parts.append((sl[1].start, sl[0].start, w, h, Image.fromarray(crop)))
parts.sort(key=lambda p: -p[3]); AW = 512; x = y = rh = 0; frames = {}; props = []
for n, (px, py, w, h, img) in enumerate(parts):
    if x + w > AW: x = 0; y += rh + 2; rh = 0
    k = f"d{n}"; frames[k] = {"frame": {"x": x, "y": y, "w": w, "h": h}}; props.append([k, DX + px + w // 2, DY + py + h, w, h]); x += w + 2; rh = max(rh, h)
AT = Image.new("RGBA", (AW, y + rh))
for (k, f), (_, _, _, _, img) in zip(frames.items(), parts): AT.paste(img, (f["frame"]["x"], f["frame"]["y"]))
AT.save(os.path.join(RF, "dock.png"), optimize=True)
json.dump({"frames": frames, "meta": {"image": "dock.png", "size": {"w": AT.width, "h": AT.height}, "scale": 1}}, open(os.path.join(RF, "dock.json"), "w"))

# ── animações: brilho da água e peixes pulando ─────────────────────────────────────────────────────
P = os.path.join(os.path.dirname(TD), "PNG")
Image.open(os.path.join(P, "Fish", "Fish1_animation.png")).save(os.path.join(RF, "fish-jump.png"))
Image.open(os.path.join(P, "Fish", "Fish2_animation.png")).save(os.path.join(RF, "fish-jump2.png"))

# ── grade de colisão ───────────────────────────────────────────────────────────────────────────────
v = json.load(open(os.path.join(V, "village.json")))
coll = [list(row) for row in v["coll"][:H0 // G]]
deck = np.zeros((H, W), bool); da = np.array(DECK)[..., 3] > 0; deck[DY:DY + DH, DX:DX + DW] = da[:min(DH, H - DY)]
solid = np.zeros((H // G, W // G), bool)
for gy in range(H0 // G, H // G):
    for gx in range(W // G):
        cx, cy = gx * G + 4, gy * G + 4
        win = deck[cy - 4:cy + 4, cx - 4:cx + 4]
        solid[gy, gx] = not land[cy, cx] and win.mean() < .6
for k, px, py, w, h in props:   # pé dos objetos (a casa ocupa mais)
    big = h > 70; fh = h * .9 if big else min(12, h * .45); fw = w * (.9 if big else .62)
    for gy in range(int((py - fh) // G), int(math.ceil(py / G))):
        for gx in range(int((px - fw / 2) // G), int(math.ceil((px + fw / 2) / G))):
            if 0 <= gy < H // G and 0 <= gx < W // G: solid[gy, gx] = True
new_rows = []
for gy in range(H0 // G, H // G):
    row = ["1" if solid[gy, gx] else "0" for gx in range(W // G)]
    row[0] = row[1] = row[-1] = row[-2] = "1"
    if gy >= H // G - 1: row = ["1"] * (W // G)
    new_rows.append(row)
# abre as duas linhas de borda antigas onde o caminho passa
for gy in range(H0 // G - 2, H0 // G):
    for gx in range(W // G):
        if path[gy * G + 4, gx * G + 4]: coll[gy][gx] = "0"
v["coll"] = ["".join(r_) for r_ in coll + new_rows]; v["h"] = H
v["spots"]["dock"] = [DX + 150, DY + 118]; v["spots"]["dockEnd"] = [DX + 340, DY + 150]; v["spots"]["shore"] = [300, int(shore[300]) - 20]
v["dockProps"] = [[k, px, py] for k, px, py, w, h in props]; v["seaTop"] = int(shore.min()); v["dockRect"] = [DX, DY, DW, DH]
json.dump(v, open(os.path.join(V, "village.json"), "w"), separators=(",", ":"))
prev = GI.copy()
for k, px, py, w, h in props: f = frames[k]["frame"]; prev.alpha_composite(AT.crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])), (px - w // 2, py - h))
prev.crop((0, 560, W, H)).save("/tmp/rf_dock_preview.png")
cm = Image.fromarray((solid[H0 // G:] * 180).astype(np.uint8)).resize((W, ADD), Image.NEAREST); pc = prev.crop((0, H0, W, H)).convert("RGB"); pc.paste((255, 0, 0), mask=cm.point(lambda q: 90 if q else 0)); pc.save("/tmp/rf_dock_coll.png")
print("ok", len(props), "objetos; mapa", W, H)
