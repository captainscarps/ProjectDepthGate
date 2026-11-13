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
ORIG = os.path.join(ROOT, "art-src", "refugio-ground-original.png")   # o chão do Refúgio antes da doca (sem o caminho já pintado)
G0 = Image.open(ORIG if os.path.isfile(ORIG) else os.path.join(V, "ground.png")).convert("RGBA").crop((0, 0, W, H0))
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
# ── praia: linha d'água orgânica, areia seca e molhada, raso que vai escurecendo até o fundo ──────────
deckTop = DY + 70
nx = np.kron(noise(W // 2, 4, 90, 3)[0], np.ones(2))[:W]; nx2 = np.kron(noise(W // 2, 4, 22, 4)[0], np.ones(2))[:W]
ys = H0 + 156 + (nx - .5) * 40 + (nx2 - .5) * 10            # onde a água começa
for x in range(W):
    o1 = max(DX + 20 - x, x - (DX + 280), 0); ys[x] = max(ys[x], deckTop + 26 - o1 * .7)   # o píer principal pisa na areia
    o2 = max(800 - x, x - 990, 0); ys[x] = min(ys[x], 806 + o2 * .7)                        # o barco à vela fica na água
ys = ndimage.uniform_filter1d(ys, 15)
sw = 50 + np.kron(noise(W // 2, 4, 50, 6)[0], np.ones(2))[:W] * 26                      # largura da areia
ye = ys - sw; ye = np.minimum(ye, deckTop - 22)                                           # a areia sempre chega antes do píer
en = np.kron(noise(W // 2, H // 2, 4, 8), np.ones((2, 2)))[:H, :W]                       # serrilhado fino das bordas
depth = yy - ys[None, :]                                    # > 0 dentro d'água
landD = ye[None, :] - yy                                    # > 0 na grama
land = depth < 0
grassM = (landD + (en - .5) * 7) > 0
shore = np.round(ys).astype(int)
wt = np.tile(water_tile, (H // 16 + 1, W // 16 + 1, 1))[:H, :W]
new = np.zeros((H, W, 3), np.float32)
DRY = np.array([232, 206, 152]); DRY2 = np.array([216, 188, 134]); WET = np.array([196, 166, 118]); WET2 = np.array([178, 148, 106])
gn = np.kron(rng.random((H // 2 + 1, W // 2 + 1)), np.ones((2, 2)))[:H, :W]
sandC = np.where((gn > .82)[..., None], DRY2, DRY).astype(np.float32)
wetT = np.clip((yy - (ys[None, :] - 16)) / 16, 0, 1)        # últimos 16 px antes da água: areia molhada
sandC = sandC * (1 - wetT[..., None]) + np.where((gn > .7)[..., None], WET2, WET) * wetT[..., None]
# raso: cor da areia molhada misturada com o mar, em 5 degraus com pontilhado de 2 px (jeito de pixel art)
t = np.clip(depth / 54, 0, 1) ** .8
bay = np.kron(np.array([[0, 2], [3, 1]]) / 4, np.ones((2, 2))); bay = np.tile(bay, (H // 4 + 1, W // 4 + 1))[:H, :W]
tq = np.floor(t * 5 + bay * .9) / 5
SH = np.array([120, 176, 172])
shallowC = (SH * (1 - tq[..., None]) + wt * tq[..., None])
new[...] = wt
new[land] = sandC[land]
wa = depth >= 0; new[wa] = shallowC[wa]
new[grassM] = grass[grassM]
# contorno da grama (verde escuro de 2 px) e tufinhos invadindo a areia
gedge = ndimage.binary_dilation(grassM, iterations=2) & ~grassM & land
new[gedge] = np.array([96, 146, 66])
for _ in range(260):
    x_ = int(rng.integers(4, W - 8)); y_ = int(ye[x_] + rng.integers(0, 6))
    if 0 < y_ < H - 4 and land[y_, x_]: new[y_ - 4:y_, x_:x_ + 2] = np.array([104, 158, 72]); new[y_ - 2:y_, x_ + 2:x_ + 4] = np.array([96, 146, 66])
# conchinhas, pedrinhas e gravetos na areia
for _ in range(150):
    x_ = int(rng.integers(6, W - 12)); y_ = int(rng.integers(int(ye[x_]) + 6, max(int(ye[x_]) + 7, int(ys[x_]) - 4)))
    if not (land[y_, x_] and not grassM[y_, x_]): continue
    k = rng.random()
    if k < .45: new[y_:y_ + 2, x_:x_ + 2] = np.array([150, 140, 128]); new[y_:y_ + 1, x_:x_ + 1] = np.array([186, 178, 166])
    elif k < .8: new[y_:y_ + 2, x_:x_ + 3] = np.array([240, 214, 200]); new[y_ + 1:y_ + 2, x_ + 1:x_ + 2] = np.array([214, 160, 150])
    elif k < .93: new[y_:y_ + 2, x_:x_ + 12] = np.array([140, 104, 72]); new[y_:y_ + 1, x_ + 2:x_ + 10] = np.array([170, 132, 92])
    else: new[y_:y_ + 4, x_:x_ + 5] = np.array([128, 124, 118]); new[y_:y_ + 2, x_ + 1:x_ + 4] = np.array([160, 156, 148])
# espuma parada na linha d'água (a animada vem no jogo) e as linhas claras do raso
fe = (depth >= 0) & (depth < 3 + (en > .55) * 2); new[fe] = new[fe] * .3 + np.array([236, 244, 240]) * .7
for dl, al in ((12, .35), (26, .22)):
    ln = (np.abs(depth - dl - (en - .5) * 4) < 1) & (en > .35); new[ln] = new[ln] * (1 - al) + np.array([210, 236, 236]) * al
# brilho e sombra de ondas no fundo (risquinhos horizontais)
wn = np.array(Image.fromarray((noise(W // 24 + 2, H // 4 + 2, 3, 5) * 255).astype(np.uint8)).resize((W + 48, H + 8), Image.BICUBIC), np.float32)[:H, :W] / 255
wn = np.kron(wn[::2, ::2], np.ones((2, 2)))[:H, :W]
sea = depth > 56
hi, lo = sea & (wn > .86), sea & (wn < .1)
new[hi] = np.clip(wt[hi] + 9, 0, 255); new[lo] = np.clip(wt[lo] - 10, 0, 255)
new = new.astype(np.int16)
foam = np.zeros((H, W), bool); cliff = np.zeros((H, W), bool)
# caminho de tijolo: nasce dentro da praça (lado direito do portal), desce até a areia na frente do píer; borda
# serrilhada em degraus de 2 px com o mesmo contorno verde-escuro + brilho verde-claro da praça, tijolo alinhado ao da praça
pts = [(690, 636), (694, 700), (704, 748), (712, 790), (716, deckTop - 6)]
hw = np.zeros((H // 2, W // 2), np.float32); hy_, hx_ = np.mgrid[0:H // 2, 0:W // 2]
dist = np.full((H // 2, W // 2), 1e9, np.float32)
for (a_, b_), (c_, e_) in zip(pts, pts[1:]):
    a2, b2, c2, e2 = a_ / 2, b_ / 2, c_ / 2, e_ / 2; vx, vy = c2 - a2, e2 - b2; L2 = vx * vx + vy * vy
    t_ = np.clip(((hx_ - a2) * vx + (hy_ - b2) * vy) / L2, 0, 1); dist = np.minimum(dist, np.hypot(hx_ - (a2 + t_ * vx), hy_ - (b2 + t_ * vy)))
jag = noise(W // 2, H // 2, 5, 9); wav = noise(W // 2, H // 2, 22, 10)
pm2 = dist < (11 + wav * 4 + (jag - .5) * 3)
path = np.kron(pm2, np.ones((2, 2), bool))[:H, :W] & (yy >= 600)
brick = A0[512:576, 560:624, :3]                                   # 64x64 de tijolo puro da praça
bt = brick[(yy - 512) % 64, (xx - 560) % 64]
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
    if not grassM[y_:y_ + hh, x_:x_ + ww].all(): continue
    sub = new[y_:y_ + hh, x_:x_ + ww]; sub[m_] = d_[m_]; dens += 1
print("enfeites", len(decals), dens)
# tijolo por cima da grama e da terra (nunca na água), com contorno escuro como a praça
orig_brick = np.zeros((H, W), bool); orig_brick[:H0] = np.abs(A0[..., :3] - np.array([189, 159, 129])).sum(-1) < 90
pth = path & (grassM | (yy < H0) | ((landD > -10 - en * 10) & land)) & ~orig_brick       # onde já é praça fica a praça
allb = pth | (orig_brick & ndimage.binary_dilation(path, iterations=4))
outline = ndimage.binary_dilation(allb, iterations=1) & ~allb & (grassM | (yy < H0)) & ndimage.binary_dilation(pth, iterations=2)
halo = ndimage.binary_dilation(allb, iterations=2) & ~allb & ~outline & (grassM | (yy < H0)) & ndimage.binary_dilation(pth, iterations=3) & ((xx + yy) % 3 > 0)
region = yy >= H0
FULL[region, :3] = new[region]; FULL[region, 3] = 255
FULL[pth, :3] = bt[pth]; FULL[outline, :3] = np.array([38, 70, 40]); FULL[halo, :3] = np.array([150, 196, 86])
# junção suave com o chão antigo (as últimas linhas dele são só grama)
for k in range(10):
    a = (k + 1) / 11; row = H0 + k; m = ~pth[row]
    FULL[row, m, :3] = (A0[H0 - 2, m, :3] * (1 - a) + FULL[row, m, :3] * a).astype(np.int16)
GI = Image.fromarray(FULL.clip(0, 255).astype(np.uint8), "RGBA")
# a doca: sombras da água (só sobre a água), o chão do píer e os barcos
wd = np.array(WDET); seaMask = (depth[DY:DY + DH, DX:DX + DW] > 6)
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
        bx0, by0 = DX + sl[1].start, DY + sl[0].start
        if bx0 + w > 704 and bx0 < 790 and deckTop - 30 < by0 + h < deckTop + 30: continue   # entrada do píer livre
        if ln != "piles_top_front" and w > 60 and h < 40 and 690 < bx0 < 720:   # o tubarão sai da frente da entrada e vai para a areia
            sx = 420; sy_ = int(ys[sx] - 18); parts.append((sx - w // 2 - DX, sy_ - h - DY, w, h, Image.fromarray(crop))); continue
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
VO = os.path.join(ROOT, "art-src", "refugio-village-original.json")   # a grade antes da doca (sem aberturas antigas)
v = json.load(open(os.path.join(V, "village.json"))); v0 = json.load(open(VO)) if os.path.isfile(VO) else v
v["coll"] = v0["coll"][:H0 // G]
coll = [list(row) for row in v["coll"][:H0 // G]]
deck = np.zeros((H, W), bool); da = np.array(DECK)[..., 3] > 0; deck[DY:DY + DH, DX:DX + DW] = da[:min(DH, H - DY)]
hull = np.zeros((H, W), bool); fa = np.array(render(["Big_boat1", "Big_boat2", "Small_boats", "Small_boats2"]))[..., 3] > 0; hull[DY:DY + DH, DX:DX + DW] = fa & ~da   # barcos (postes finos não travam)
solid = np.zeros((H // G, W // G), bool); shal = np.zeros((H // G, W // G), np.uint8)
SHALLOW = 30   # até onde dá pé
FO = 24        # no Refúgio a posição do herói fica na cintura: os pés estão 24 px abaixo (a grade testa os pés)
for gy in range(H0 // G, H // G):
    for gx in range(W // G):
        cx, cy = gx * G + 4, min(H - 5, gy * G + 4 + FO)
        dk = deck[cy - 4:cy + 4, cx - 4:cx + 4].mean() >= .6
        dp = depth[cy, cx]
        if dk: continue
        if hull[cy - 4:cy + 4, cx - 4:cx + 4].mean() > .3: solid[gy, gx] = True; continue
        if dp >= SHALLOW: solid[gy, gx] = True
        elif dp >= -2: shal[gy, gx] = 1 + min(2, int(max(0, dp) // 10))
# a borda do fundo sem degraus soltos: célula sólida isolada no raso vira raso, buraco isolado no fundo vira fundo
for _ in range(2):
    nb = ndimage.convolve(solid.astype(int), np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]]), mode="nearest")
    lone = solid & (nb <= 1) & (np.arange(solid.shape[0])[:, None] >= H0 // G); solid[lone] = False; shal[lone] = 3
    hole = ~solid & (nb >= 3) & (shal == 3); solid[hole] = True; shal[hole] = 0
for k, px, py, w, h in props:   # pé dos objetos (a casa ocupa mais)
    big = h > 70; fh = h * .9 if big else min(12, h * .45); fw = w * (.9 if big else .62)
    for gy in range(int((py - fh - FO) // G), int(math.ceil((py - FO) / G))):
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
v["feetOff"] = FO; v["shallow"] = {"y0": H0 // G, "rows": ["".join(str(int(c)) for c in shal[gy]) for gy in range(H0 // G, H // G)]}
v["shoreY"] = [int(ys[min(W - 1, gx * G + 4)]) for gx in range(W // G)]
v["spots"]["dock"] = [DX + 150, DY + 118]; v["spots"]["dockEnd"] = [DX + 340, DY + 150]; v["spots"]["shore"] = [300, int(ys[300]) - 20]
v["dockProps"] = [[k, px, py] for k, px, py, w, h in props]; v["seaTop"] = int(ys.min()); v["dockRect"] = [DX, DY, DW, DH]
json.dump(v, open(os.path.join(V, "village.json"), "w"), separators=(",", ":"))
prev = GI.copy()
for k, px, py, w, h in props: f = frames[k]["frame"]; prev.alpha_composite(AT.crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])), (px - w // 2, py - h))
prev.crop((0, 560, W, H)).save("/tmp/rf_dock_preview.png")
cm = Image.fromarray((solid[H0 // G:] * 180).astype(np.uint8)).resize((W, ADD), Image.NEAREST); pc = prev.crop((0, H0, W, H)).convert("RGB"); pc.paste((255, 0, 0), mask=cm.point(lambda q: 90 if q else 0)); pc.save("/tmp/rf_dock_coll.png")
print("ok", len(props), "objetos; mapa", W, H)
