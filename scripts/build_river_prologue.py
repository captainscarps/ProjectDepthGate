"""
Prólogo do Rio da Floresta — mapa assado no mesmo padrão refinado do Bosque Amaldiçoado e da Floresta Nevada.

O herói chega de barco por um lago enevoado e desce um rio longo e sinuoso no meio da mata: uma garganta
estreita com corredeira e pedras, as ruínas de uma ponte dos Antigos (pilares dentro d'água), um segundo lago
com ilhota, vitórias-régias e juncos, até o píer de madeira. Desembarca, atravessa a clareira (naufrágio na
margem, estátua antiga) e entra na trilha que leva à Floresta de Eldervale.
Nada de bloco quadrado: lago, rio, margens, clareira e trilha saem de campos contínuos (bordas orgânicas),
a grama é sintetizada com recortes reais do chão do Bosque Amaldiçoado, a mata fechada é assada atrás e as
árvores da borda ficam como objetos com profundidade.
Usa só o que já está no jogo (assets/pixel-art/ruins-forest) + o barco do pacote Arctic Viking (arc-boat-*).
Uso: python3 scripts/build_river_prologue.py
Gera assets/pixel-art/river-prologue/: rpb-X-Y.png (chão em pedaços de 512), rp-meta.json (objetos, máscara
de onde se anda/rema, pontos do roteiro).
"""
import base64
import json
import math
import os
import random
import shutil

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RF = os.path.join(ROOT, "assets", "pixel-art", "ruins-forest")
OUT = os.path.join(ROOT, "assets", "pixel-art", "river-prologue")
os.makedirs(OUT, exist_ok=True)
random.seed(21)
rng = np.random.default_rng(21)
W, H = 3800, 2000
NEW = os.environ.get("RP_NEWPACK") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "rp-newpack")

# ───────── fontes: chão e árvores do Bosque Amaldiçoado ─────────
meta_rf = json.load(open(os.path.join(RF, "rfb-meta.json")))
atlas = Image.open(os.path.join(RF, "rf-props.png")).convert("RGBA")
frames = json.load(open(os.path.join(RF, "rf-props.json")))["frames"]
FR = {k: atlas.crop((v["frame"]["x"], v["frame"]["y"], v["frame"]["x"] + v["frame"]["w"], v["frame"]["y"] + v["frame"]["h"])) for k, v in frames.items()}
# objetos extras do pacote "Forest Top-Down Tileset" (mesma arte): atlas rp2-props (prefixo n-)
NEWSEL = ["Tree10", "Tree14", "Bush5", "Bush7", "Bush10", "Bush6", "Ruin_orange1", "Ruin_orange2", "Ruin_orange4", "Ruin_orange5",
          "Ruin_grass1", "Ruin_grass2", "Ruin_grass3", "Ruin_grass5", "reeds1", "reeds2", "reeds3", "Light_stone_grass1",
          "Light_stone_grass2", "Light_stone_grass4", "Beige_stone_grass2", "Beige_stone_grass4", "Beige_stone_grass6",
          "Brown_stone_grass2", "Red_mushroom1", "Red_mushroom2", "Red_mushroom3", "Brown_mushroom1", "Brown_mushroom2", "Layer7"]
A2P, A2J = os.path.join(OUT, "rp2-props.png"), os.path.join(OUT, "rp2-props.json")
FR2 = {}
if os.path.isdir(NEW):
    for n in NEWSEL:
        im = Image.open(os.path.join(NEW, n + ".png")).convert("RGBA")
        FR2["n-" + n] = im.crop(im.getbbox())
    xx_, yy_, rowh, AW = 0, 0, 0, 1024
    pos = {}
    for k, im in sorted(FR2.items(), key=lambda kv: -kv[1].height):
        if xx_ + im.width > AW:
            xx_, yy_, rowh = 0, yy_ + rowh + 2, 0
        pos[k] = (xx_, yy_)
        xx_ += im.width + 2
        rowh = max(rowh, im.height)
    at2 = Image.new("RGBA", (AW, yy_ + rowh), (0, 0, 0, 0))
    fr_ = {}
    for k, (x0, y0) in pos.items():
        im = FR2[k]
        at2.paste(im, (x0, y0))
        fr_[k] = {"frame": {"x": x0, "y": y0, "w": im.width, "h": im.height}, "rotated": False, "trimmed": False,
                  "spriteSourceSize": {"x": 0, "y": 0, "w": im.width, "h": im.height}, "sourceSize": {"w": im.width, "h": im.height}}
    at2.save(A2P, optimize=True)
    json.dump({"frames": fr_, "meta": {"image": "rp2-props.png", "size": {"w": at2.width, "h": at2.height}, "scale": "1"}}, open(A2J, "w"))
else:
    at2 = Image.open(A2P).convert("RGBA")
    for k, v in json.load(open(A2J))["frames"].items():
        f_ = v["frame"]
        FR2[k] = at2.crop((f_["x"], f_["y"], f_["x"] + f_["w"], f_["y"] + f_["h"]))
FR.update(FR2)
chunks = [np.array(Image.open(os.path.join(RF, k + ".png")).convert("RGB")).astype(float) for k, _, _ in meta_rf["chunks"]]

# cor da grama: tom mais comum entre os pixels verdes claros
allpx = np.concatenate([c.reshape(-1, 3) for c in chunks])
g = allpx[(allpx[:, 1] > allpx[:, 0] + 12) & (allpx[:, 1] > allpx[:, 2] + 8) & (allpx.sum(1) > 230)]
GRASS = np.median(g, 0)
pathpx = allpx[(np.abs(allpx[:, 0] - allpx[:, 2]) < 22) & (allpx[:, 0] > 95) & (allpx[:, 0] < 150) & (allpx[:, 1] > allpx[:, 2]) & (allpx[:, 0] >= allpx[:, 1] - 4)]
PATH = np.median(pathpx, 0) if len(pathpx) > 500 else np.array([128, 112, 98.])

# recortes 32x32 só de grama (para sintetizar o chão)
P = 32
patches = []
for c in chunks:
    d = np.linalg.norm(c - GRASS, axis=2)
    m = (d < 40) & (c[..., 1] > c[..., 0] + 8) & (c[..., 1] > c[..., 2] + 6)
    for y in range(0, c.shape[0] - P, 12):
        for x in range(0, c.shape[1] - P, 12):
            if m[y:y + P, x:x + P].mean() > .97:
                patches.append(c[y:y + P, x:x + P])
assert len(patches) > 40, len(patches)


def blur(a, r):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.array(im).astype(float) / 255


def vnoise(scale, amp, h=H, w=W):
    gw, gh = w // scale + 3, h // scale + 3
    gg = rng.random((gh, gw))
    ys, xs = np.mgrid[0:h, 0:w] / scale
    x0, y0 = xs.astype(int), ys.astype(int)
    fx, fy = xs - x0, ys - y0
    fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = gg[y0, x0] * (1 - fx) + gg[y0, x0 + 1] * fx
    b = gg[y0 + 1, x0] * (1 - fx) + gg[y0 + 1, x0 + 1] * fx
    return (a * (1 - fy) + b * fy - .5) * 2 * amp


def smooth(a, lo, hi):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


# ───────── chão de grama sintetizado (recortes com borda suave, sem repetição visível) ─────────
acc = np.zeros((H + P, W + P, 3))
wsum = np.zeros((H + P, W + P, 1))
win = np.outer(np.hanning(P + 2)[1:-1], np.hanning(P + 2)[1:-1])[..., None] + 1e-3
for y in range(-P // 2, H, P // 2):
    for x in range(-P // 2, W, P // 2):
        p = patches[rng.integers(len(patches))]
        if rng.random() < .5:
            p = p[:, ::-1]
        ys, xs = max(0, y), max(0, x)
        oy, ox = ys - y, xs - x
        hh, ww = min(P - oy, H + P - ys), min(P - ox, W + P - xs)
        acc[ys:ys + hh, xs:xs + ww] += p[oy:oy + hh, ox:ox + ww] * win[oy:oy + hh, ox:ox + ww]
        wsum[ys:ys + hh, xs:xs + ww] += win[oy:oy + hh, ox:ox + ww]
img = acc[:H, :W] / wsum[:H, :W]
light = 1 + vnoise(160, .06) + vnoise(48, .03)
img *= light[..., None]

# ───────── água: lago enevoado → rio longo (garganta, ponte, segundo lago) → remanso do píer ─────────
yy, xx = np.mgrid[0:H, 0:W].astype(float)
water = np.zeros((H, W))


def _blob(arr, cx, cy, rx, ry):
    """gaussiana só na janela que ela ocupa (rápido em mapa grande)"""
    x0, x1 = max(0, int(cx - rx * 2)), min(W, int(cx + rx * 2) + 1)
    y0, y1 = max(0, int(cy - ry * 2)), min(H, int(cy + ry * 2) + 1)
    if x1 <= x0 or y1 <= y0:
        return
    gx = ((np.arange(x0, x1) - cx) / rx) ** 2
    gy = ((np.arange(y0, y1) - cy) / ry) ** 2
    arr[y0:y1, x0:x1] = np.maximum(arr[y0:y1, x0:x1], np.exp(-(gy[:, None] + gx[None, :]) * 1.6))


def blob(cx, cy, rx, ry):
    _blob(water, cx, cy, rx, ry)


def catmull(pts, n=10):
    """curva suave passando pelos pontos (nada de segmento reto)"""
    P_ = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(P_) - 2):
        p0, p1, p2, p3 = (np.array(P_[k], float) for k in (i - 1, i, i + 1, i + 2))
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(np.array(pts[-1], float))
    return out


LAKE_A = [(430, 1640, 330, 230), (270, 1760, 210, 150), (650, 1700, 170, 130), (380, 1500, 170, 110)]
for b_ in LAKE_A:
    blob(*b_)
# (x, y, raio): raio menor = garganta
RIVER = [(560, 1650, 80), (760, 1610, 82), (960, 1650, 80), (1150, 1640, 68), (1300, 1590, 52), (1420, 1500, 48),
         (1490, 1380, 48), (1480, 1250, 52), (1400, 1140, 68), (1260, 1060, 90), (1100, 1010, 106), (950, 960, 92),
         (840, 870, 76), (800, 750, 74), (850, 640, 76), (980, 565, 80), (1150, 525, 80), (1330, 545, 84),
         (1500, 575, 110), (1650, 565, 150), (1820, 610, 100), (1980, 700, 80), (2100, 840, 76), (2170, 1000, 64),
         (2250, 1160, 72), (2360, 1290, 80), (2460, 1385, 80)]
cr = catmull([(x, y) for x, y, _ in RIVER], 14)
rr = np.interp(np.linspace(0, len(RIVER) - 1, len(cr)), np.arange(len(RIVER)), [r for *_, r in RIVER])
for (cx, cy), r in zip(cr, rr):
    r = r + 8 * math.sin(cx / 53 + cy / 71)
    blob(cx, cy, r, r * .92)
blob(1650, 560, 400, 250)                     # segundo lago
blob(1560, 640, 220, 130)
blob(2480, 1400, 125, 88)                     # remanso do píer
POND = (3060, 650)
for dx_, dy_, rx_, ry_ in ((0, 0, 190, 120), (-110, 35, 150, 100), (95, -30, 140, 95), (40, 70, 120, 80), (-40, -55, 110, 70)):
    blob(POND[0] + dx_, POND[1] + dy_, rx_, ry_)                     # lago da clareira: vários lobos = margem sinuosa
wf = water + vnoise(70, .1) + vnoise(23, .05)
W_M = wf > .5                                  # água
# ilhota no segundo lago (mata, ninguém passa)
isl = np.zeros((H, W))
_blob(isl, 1670, 540, 110, 70)
_blob(isl, 1610, 565, 70, 52)
ISL = (isl + vnoise(18, .12) > .55)
W_M &= ~ISL
deep = smooth(blur(W_M.astype(float), 22), .55, .95)

# trajeto do barco (para a correnteza e para o roteiro da narração)
RPATH = catmull([(360, 1720), (520, 1660)] + [(x, y) for x, y, _ in RIVER[1:18]] + [(1500, 640), (1650, 670), (1800, 650)]
                + [(x, y) for x, y, _ in RIVER[20:]] + [(2478, 1405)], 12)
seg = [0.0]
for p0, p1 in zip(RPATH, RPATH[1:]):
    seg.append(seg[-1] + float(np.hypot(*(p1 - p0))))
TOT = seg[-1]
_crA = np.array(cr)
_rw = [float(rr[int(np.argmin(((_crA - p_) ** 2).sum(1)))]) for p_ in RPATH]


def s_at(px, py):
    k = int(np.argmin([(p[0] - px) ** 2 + (p[1] - py) ** 2 for p in RPATH]))
    return seg[k]


# clareira + trilha (onde se anda)
land = np.zeros((H, W))


def lblob(cx, cy, rx, ry):
    _blob(land, cx, cy, rx, ry)


lblob(2500, 1220, 230, 140)                   # clareira do desembarque
lblob(2650, 1170, 140, 100)                   # estátua
lblob(2350, 1225, 110, 60)                    # margem do naufrágio
# área explorável depois do rio: campo dos coelhos, clareira das ruínas, lago, campo das aves e trilha de saída
M1, G1, M2 = (2400, 640), (2130, 340), (3340, 1090)
lblob(M1[0], M1[1], 330, 200)
lblob(M1[0] + 150, M1[1] + 80, 200, 140)
lblob(G1[0], G1[1], 190, 135)
lblob(POND[0], POND[1] + 10, 420, 290)        # margens do lago
lblob(M2[0], M2[1], 250, 170)
lblob(M2[0] - 120, M2[1] + 60, 150, 110)
TRAILS = [[(2490, 1335), (2450, 1220), (2445, 1085), (2415, 940), (2400, 790), (2425, 665), (2560, 615), (2740, 640),
           (2890, 770), (3060, 850), (3210, 900), (3300, 1000), (3410, 1065), (3545, 1025), (3665, 972), (3860, 955)],
          [(2410, 720), (2310, 575), (2220, 465), (2150, 385)]]
for TR in TRAILS:
    for (ax, ay), (bx, by) in zip(TR, TR[1:]):
        for t in np.linspace(0, 1, 16):
            lblob(ax + (bx - ax) * t, ay + (by - ay) * t, 64, 64)
lf = land + vnoise(60, .1) + vnoise(19, .05)
L_M = (lf > .5) & ~W_M

# borda da mata: tudo que não é clareira nem água vira floresta (escurece com a distância)
open_ = (L_M | W_M).astype(float)
inside = smooth(blur(open_, 14) + vnoise(30, .08), .35, .62)
shade = np.array([.42, .5, .46])
img = img * (inside[..., None] + (1 - inside[..., None]) * shade)

# trilha de terra batida
tr = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(tr)
for TR in TRAILS:
    TRc = [tuple(q) for q in catmull(TR, 8)]
    d.line(TRc, fill=255, width=24, joint="curve")
    for p in TRc[::3]:
        d.ellipse((p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12), fill=255)
d.ellipse((2490 - 34, 1322 - 22, 2490 + 34, 1322 + 26), fill=255)          # chegada do píer
pf = blur(np.array(tr) / 255., 7) + vnoise(20, .14) + vnoise(7, .06)
trail = smooth(pf, .42, .62) * inside
pcol = PATH * (1 + vnoise(14, .05))[..., None]
img = img * (1 - trail[..., None] * .85) + pcol * trail[..., None] * .85

# margem: lama escura + borda clara de grama molhada
wb = blur(W_M.astype(float), 3)
bank = smooth(wb, .05, .45) - smooth(wb, .45, .55)
img = img * (1 - np.clip(bank, 0, 1)[..., None] * .45) + np.array([62, 58, 44]) * np.clip(bank, 0, 1)[..., None] * .45
rim = smooth(blur(W_M.astype(float), 1.5), .3, .5) - smooth(blur(W_M.astype(float), 1.5), .5, .7)
# água: verde-azulada da mata, mais escura no fundo, reflexos e marolas
wcol = np.array([66, 112, 104.]) * (1 - deep[..., None]) + np.array([34, 66, 70.]) * deep[..., None]
wcol = wcol * (1 + vnoise(90, .05) + vnoise(30, .025))[..., None]
streak = np.clip(np.sin((xx * .35 + yy) / 7.0) * 3 - 2.55, 0, 1) * smooth(vnoise(80, 1.0), .25, .7)
wcol += (streak * 22)[..., None] * np.array([.8, 1, 1])
wm = smooth(blur(W_M.astype(float), 1.2), .45, .55)
img = img * (1 - wm[..., None]) + wcol * wm[..., None]
img += (np.clip(rim, 0, 1) * 26)[..., None] * np.array([.9, 1, .9])
# corredeira da garganta: água mais clara e espuma onde o rio estreita
fast = np.zeros((H, W))
for p_, r_ in zip(RPATH, _rw):
    if r_ < 60:
        _blob(fast, p_[0], p_[1], 58, 58)
fast = fast * wm
img = img * (1 - fast[..., None] * .18) + np.array([120, 170, 160.]) * fast[..., None] * .18
# prainha de areia molhada na beira do primeiro lago
sand = np.zeros((H, W))
for cx, cy, rx, ry in ((560, 1440, 120, 60), (180, 1600, 80, 70), (760, 1810, 120, 50)):
    _blob(sand, cx, cy, rx, ry)
sand = smooth(sand + vnoise(16, .1), .45, .7) * np.clip(bank * 2 + smooth(wb, .02, .2) * (1 - wm), 0, 1)
img = img * (1 - sand[..., None] * .55) + np.array([150, 136, 104.]) * (1 + vnoise(6, .06))[..., None] * sand[..., None] * .55
img = np.clip(img, 0, 255)
base = Image.fromarray(img.astype(np.uint8), "RGB").convert("RGBA")
bd = ImageDraw.Draw(base)
for _ in range(320):                                                # marolas
    x, y = rng.integers(0, W), rng.integers(0, H)
    if W_M[y, x] and deep[y, x] > .2:
        w = int(rng.integers(8, 20))
        bd.arc((x, y, x + w, y + 5), 200, 340, fill=(150, 196, 186, 120), width=1)
for p_, r_ in zip(RPATH, _rw):                                     # espuma da corredeira
    if r_ >= 60:
        continue
    for _ in range(13):
        x, y = int(p_[0] + rng.normal(0, r_ * .45)), int(p_[1] + rng.normal(0, r_ * .45))
        if 0 <= x < W and 0 <= y < H and W_M[y, x] and wm[y, x] > .9:
            w = int(rng.integers(5, 16))
            bd.arc((x, y, x + w, y + 4), 190, 350, fill=(225, 240, 232, int(110 + 120 * min(1, fast[y, x]))), width=1)
# juncos na beira d'água (água rasa, perto da margem)
shallow = W_M & (blur(W_M.astype(float), 6) < .8)
REED = [(54, 86, 40), (70, 104, 48), (88, 118, 58), (46, 74, 36)]
for _ in range(11000):
    x, y = int(rng.integers(4, W - 4)), int(rng.integers(16, H - 4))
    if not shallow[y, x] or fast[y, x] > .2 or (abs(x - 2478) < 60 and abs(y - 1382) < 60):
        continue
    if rng.random() < .55:
        continue
    for _k in range(int(rng.integers(3, 8))):
        hx, hh = x + int(rng.integers(-5, 6)), int(rng.integers(9, 18))
        lean = int(rng.integers(-2, 3))
        bd.line((hx, y, hx + lean, y - hh), fill=REED[int(rng.integers(len(REED)))] + (255,), width=1)
        if rng.random() < .25:                                      # taboa
            bd.line((hx + lean, y - hh, hx + lean, y - hh + 3), fill=(112, 72, 40, 255), width=2)
    bd.arc((x - 7, y - 1, x + 7, y + 3), 0, 180, fill=(150, 196, 186, 110), width=1)
# vitórias-régias nos lagos (água calma e funda, longe da rota no meio)
def lily(x, y, r, c, flower):
    bd.ellipse((x - r, y - r * .7 + 1, x + r, y + r * .7 + 1), fill=(20, 48, 44, 90))       # sombra
    bd.ellipse((x - r, y - r * .7, x + r, y + r * .7), fill=c + (255,))
    bd.ellipse((x - r + 1, y - r * .7 + 1, x + r - 2, y + r * .7 - 2), outline=tuple(min(255, v + 22) for v in c) + (255,))
    a0 = float(rng.uniform(0, 360))
    bd.pieslice((x - r, y - r * .7, x + r, y + r * .7), a0, a0 + 28, fill=tuple(int(v) for v in wcol[min(H - 1, y), min(W - 1, x)]) + (255,))
    if flower:
        bd.ellipse((x - 2, y - 3, x + 2, y), fill=(236, 170, 196, 255))
        bd.point((x, y - 2), fill=(255, 236, 160, 255))


LILY_C = [(70, 120, 56), (82, 132, 60), (60, 108, 52)]
calm = W_M & (fast < .05) & (deep > .35)
for zx, zy, zr in ((430, 1640, 300), (1650, 560, 330), (950, 960, 120), (850, 660, 100), (1500, 600, 140), (POND[0], POND[1], 170)):
    for _ in range(int(zr * .6)):
        x, y = int(zx + rng.normal(0, zr * .55)), int(zy + rng.normal(0, zr * .4))
        if 0 < x < W and 0 < y < H and calm[y, x]:
            if min((x - p_[0]) ** 2 + (y - p_[1]) ** 2 for p_ in RPATH[::3]) < 46 ** 2:
                continue
            lily(x, y, int(rng.integers(4, 8)), LILY_C[int(rng.integers(3))], rng.random() < .18)

# ───────── árvores ─────────
TREES = ["rf-Tree1", "rf-Tree2", "rf-Tree3", "rf-Tree5", "rf-Tree6", "rf-Tree7", "rf-Tree8", "rf-Tree9", "rf-Tree11", "rf-Tree13", "n-Tree10", "n-Tree14"]
BUSH = ["rf-Bush1", "rf-Bush3", "rf-Bush4", "rf-Bush9", "rf-Bush11", "rf-Bush12", "rf-Bush13", "rf-Tree4", "rf-Tree12", "n-Bush5", "n-Bush7"]


def shadow(im, x, y, w, a=70):
    sh = Image.new("L", (w * 2 + 20, w + 10), 0)
    ImageDraw.Draw(sh).ellipse((10, 5, w * 2 + 10, w // 2 + 8), fill=a)
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    t = Image.new("RGBA", sh.size, (8, 18, 12, 0))
    t.putalpha(sh)
    im.alpha_composite(t, (int(x - w - 10 + w * .3), int(y - w // 4 - 5)))


openm = L_M | W_M
openblur = blur(openm.astype(float), 18)
II = np.pad(openm.astype(np.int32).cumsum(0).cumsum(1), ((1, 0), (1, 0)))


def cover(x, y, w, h):
    """fração do retângulo da árvore que fica em cima de água/clareira"""
    x0, x1 = max(0, int(x - w * .4)), min(W, int(x + w * .4))
    y0, y1 = max(0, int(y - h * .9)), min(H, int(y))
    if x1 <= x0 or y1 <= y0:
        return 0
    return (II[y1, x1] - II[y0, x1] - II[y1, x0] + II[y0, x0]) / ((x1 - x0) * (y1 - y0))


PROPS, deep_spots, edge_fill = [], [], []
for y in range(-40, H + 90, 22):
    for x in range(-20, W + 20, 26):
        jx, jy = x + rng.integers(-10, 11), y + rng.integers(-8, 9)
        cx, cy = min(W - 1, max(0, jx)), min(H - 1, max(0, jy))
        if openm[cy, cx]:
            continue
        ob = openblur[cy, cx]
        if ob > .08:                     # borda: objeto com profundidade, sem tampar água/clareira
            if rng.random() < .82:
                for k in ([random.choice(TREES)] if rng.random() < .55 else []) + [random.choice(BUSH), random.choice(BUSH)]:
                    if cover(jx, jy, FR[k].width, FR[k].height) < .12:
                        PROPS.append([k, int(jx), int(jy)])
                        break
                else:
                    edge_fill.append((jx, jy))
        elif rng.random() < .9 and cover(jx, jy, 90, 115) < .04:
            deep_spots.append((jx, jy))
# mata fechada assada (atrás de tudo)
deep_spots.sort(key=lambda p: p[1])
for x, y in deep_spots:
    t = FR[random.choice(TREES)]
    if rng.random() < .5:
        t = t.transpose(Image.FLIP_LEFT_RIGHT)
    shadow(base, x, y, t.width // 2, 60)
    dk = Image.new("RGBA", t.size, (0, 0, 0, 0))
    base.alpha_composite(t, (x - t.width // 2, y - t.height))
# moitas baixas assadas onde a borda ficou sem árvore (nada de grama escura vazia na beira)
for x, y in edge_fill:
    k = random.choice(["rf-Bush12", "rf-Bush3", "rf-Bush4", "rf-Tree4"])
    t = FR[k]
    if cover(x, y, t.width, t.height * .6) < .3:
        shadow(base, x, y, t.width // 2, 50)
        base.alpha_composite(t if rng.random() < .5 else t.transpose(Image.FLIP_LEFT_RIGHT), (x - t.width // 2, y - t.height))
# segunda passada: nenhum trecho de borda fica com grama escura vazia
_occ = [(p_[1], p_[2]) for p_ in PROPS] + list(edge_fill)
_occ_g = {}
for x, y in _occ:
    _occ_g.setdefault((int(x) // 40, int(y) // 40), []).append((x, y))


def _free(x, y, r):
    for gx in range(int(x) // 40 - 1, int(x) // 40 + 2):
        for gy in range(int(y) // 40 - 1, int(y) // 40 + 2):
            for qx, qy in _occ_g.get((gx, gy), ()):
                if (qx - x) ** 2 + (qy - y) ** 2 < r * r:
                    return False
    return True


for y in range(10, H - 10, 18):
    for x in range(10, W - 10, 18):
        jx, jy = x + int(rng.integers(-5, 6)), y + int(rng.integers(-5, 6))
        if openm[jy, jx] or openblur[jy, jx] <= .08 or not _free(jx, jy, 30):
            continue
        k = random.choice(["rf-Bush12", "rf-Bush3", "rf-Bush4", "rf-Tree4", "rf-Bush9"])
        t = FR[k]
        if cover(jx, jy, t.width, t.height * .6) < .25:
            shadow(base, jx, jy, t.width // 2, 50)
            base.alpha_composite(t if rng.random() < .5 else t.transpose(Image.FLIP_LEFT_RIGHT), (jx - t.width // 2, jy - t.height))
            _occ_g.setdefault((jx // 40, jy // 40), []).append((jx, jy))
# afasta objetos de cima da clareira/água (pé da árvore nunca dentro do caminho)
keep = []
for k, x, y in PROPS:
    cx, cy = min(W - 1, max(0, x)), min(H - 1, max(0, y))
    if not openm[min(H - 1, cy + 4), cx]:
        keep.append([k, x, y])
PROPS = keep
STATUE, DOCK, LAND, EXIT = (2660, 1160), (2478, 1382), (2490, 1322), (3740, 958)
BRIDGE = (1100, 1010)
PROPS = [p for p in PROPS if all((p[1] - x) ** 2 + (p[2] - y) ** 2 > 70 ** 2 for x, y in (STATUE, DOCK, LAND))]

# ───────── objetos de cena com profundidade (ponte em ruínas, pedras no rio, troncos caídos) ─────────
DECO, WOBS = [], []          # DECO: [chave, x, y, escala, espelha]; WOBS: obstáculos do barco [x, y, raio]


def nearest_tan(px, py):
    k = int(np.argmin([(p[0] - px) ** 2 + (p[1] - py) ** 2 for p in RPATH]))
    a_, b_ = RPATH[max(0, k - 2)], RPATH[min(len(RPATH) - 1, k + 2)]
    t = b_ - a_
    return t / (np.hypot(*t) + 1e-9), RPATH[k]


# ponte dos Antigos: dois pilares partidos dentro d'água + pedaços do tabuleiro nas margens + cabeceiras
tg, c0 = nearest_tan(*BRIDGE)
nrm = np.array([-tg[1], tg[0]])


def span(sgn):
    for d_ in range(0, 260):
        x, y = c0 + nrm * d_ * sgn
        if not W_M[int(y), int(x)]:
            return d_
    return 260


lo_, hi_ = -span(-1), span(1)
for off in (lo_ + 14, hi_ - 14):                                      # pilares colados nas margens: o rio fica livre
    x, y = c0 + nrm * off
    DECO.append(["rp-pillar", int(x), int(y) + 6, .74, bool(off > 0)])
STUBS = []
for edge_, sgn in ((lo_, -1), (hi_, 1)):                             # tabuleiro partido saindo de cada margem
    q0 = c0 + nrm * (edge_ + sgn * 22)
    STUBS.append(tuple(q0))
    q1 = c0 + nrm * (edge_ - sgn * 16)
    pts = []
    for (qa, side) in ((q0, 1), (q1, 1), (q1, -1), (q0, -1)):
        pts.append(tuple(qa + tg * 15 * side))
    jag = [tuple(q1 + tg * k + nrm * float(rng.integers(-4, 5))) for k in (10, 4, -3, -10)]
    poly = [pts[0], pts[1]] + jag + [pts[2], pts[3]]
    bd.polygon([(x + 2, y + 3) for x, y in poly], fill=(20, 40, 40, 120))
    bd.polygon(poly, fill=(128, 122, 108, 255), outline=(78, 74, 64, 255))
    for k in range(-12, 13, 6):
        a_, b_ = q0 + tg * k, q1 + tg * k
        bd.line((tuple(a_), tuple(b_)), fill=(104, 100, 88, 255))
    for _ in range(14):
        m_ = q0 + (q1 - q0) * rng.random() + tg * rng.uniform(-13, 13)
        bd.point(tuple(m_), fill=(84, 120, 66, 255))
for off in (-118, 118, -150, 150):
    x, y = c0 + nrm * off
    ix, iy = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, y)))
    if not W_M[iy, ix]:
        DECO.append(["dx-ruin1-1" if off < 0 else "dx-ruin2-1", int(x), int(y) + 20, .62, off > 0])
        break
for off in (118, 150, 180):
    x, y = c0 + nrm * off
    ix, iy = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, y)))
    if not W_M[iy, ix]:
        DECO.append(["dx-ruin2-1", int(x), int(y) + 20, .62, True])
        break
# garganta: pedras grandes dentro e nas bordas da corredeira (sempre sobra passagem no meio)
for k_, (p_, r_) in enumerate(zip(RPATH, _rw)):
    if r_ < 56 and k_ % 7 == 0:
        tg, c = nearest_tan(*p_)
        side = 1 if (k_ // 9) % 2 else -1
        x, y = c + np.array([-tg[1], tg[0]]) * side * (r_ * .9)
        DECO.append([["dx-rock1-1", "dx-rock2-1", "dx-rock3-1"][k_ % 3], int(x), int(y) + 12, .55, bool(k_ % 2)])
        for _ in range(5):                                          # espuma batendo na pedra
            ox_, oy_ = rng.integers(-16, 17), rng.integers(4, 12)
            bd.arc((int(x + ox_ - 8), int(y + oy_ - 2), int(x + ox_ + 8), int(y + oy_ + 3)), 180, 360, fill=(235, 246, 240, 200), width=1)
# grande rocha-ruína na curva da garganta, na margem
for cand in ((1600, 1420), (1620, 1340), (1580, 1500)):
    if not openm[cand[1], cand[0]] and cover(cand[0], cand[1], 118, 128) < .15:
        DECO.append(["rf-Ruin_orange3", cand[0], cand[1], 1.0, False])
        break
# troncos caídos e tocos na beira (no chão de mata que encosta na água)
edge = (~openm) & (blur(W_M.astype(float), 10) > .12)
for _ in range(2600):
    x, y = int(rng.integers(30, W - 30)), int(rng.integers(30, H - 30))
    if edge[y, x] and len(DECO) < 90 and all((x - d_[1]) ** 2 + (y - d_[2]) ** 2 > 160 ** 2 for d_ in DECO):
        k = ["rf-Broken_tree1", "rf-Broken_tree2", "rf-Broken_tree3"][int(rng.integers(3))]
        if cover(x, y, FR[k].width, FR[k].height) < .2:
            DECO.append([k, x, y, 1.0, bool(rng.random() < .5)])
DECO = [d_ for d_ in DECO if all((d_[1] - x) ** 2 + (d_[2] - y) ** 2 > 80 ** 2 for x, y in (STATUE, DOCK, LAND))]
# área nova: ruínas na clareira, pedras e juncos no lago, cogumelos e pedrinhas nos campos
for k, dx, dy, fl in (("n-Ruin_orange1", -70, 30, False), ("n-Ruin_grass2", 95, -5, True), ("n-Ruin_orange4", 15, -75, False),
                      ("n-Ruin_grass5", -120, -50, True), ("n-Ruin_orange5", 60, 70, False)):
    DECO.append([k, G1[0] + dx, G1[1] + dy, 1.0, fl])
pond_sh = W_M & (blur(W_M.astype(float), 6) < .85)
nd = 0
for _ in range(4000):
    x, y = int(rng.integers(POND[0] - 330, POND[0] + 330)), int(rng.integers(POND[1] - 220, POND[1] + 220))
    if 0 < x < W and 0 < y < H and pond_sh[y, x] and nd < 16 and all((x - d_[1]) ** 2 + (y - d_[2]) ** 2 > 34 ** 2 for d_ in DECO):
        DECO.append([random.choice(["n-reeds1", "n-reeds2", "n-reeds3"]), x, y + 4, 1.0, bool(rng.random() < .5)])
        nd += 1
for k, dx, dy in (("n-Light_stone_grass1", -250, -90), ("n-Light_stone_grass2", 230, 120), ("n-Beige_stone_grass4", -40, 210)):
    x, y = POND[0] + dx, POND[1] + dy
    if L_M[min(H - 1, y), min(W - 1, x)]:
        DECO.append([k, x, y, 1.0, False])
NEWAREA = (2000, 150, 3800, 1300)
SMALL2 = [FR[k] for k in ("n-Red_mushroom1", "n-Brown_mushroom1", "n-Beige_stone_grass6", "n-Bush10", "n-Bush6", "n-Bush10",
                          "n-Bush6", "n-Bush10", "n-Light_stone_grass4")]
for _ in range(650):
    x, y = int(rng.integers(NEWAREA[0], NEWAREA[2])), int(rng.integers(NEWAREA[1], NEWAREA[3]))
    if L_M[y, x] and trail[y, x] < .2 and inside[y, x] > .6 and rng.random() < .35:
        s_ = SMALL2[int(rng.integers(len(SMALL2)))]
        if s_.height > 40 and inside[y, x] < .9:
            continue
        base.alpha_composite(s_, (int(x - s_.width // 2), int(y - s_.height)))
ZONES = {"m1": [M1[0], M1[1], 300, 180], "g1": [G1[0], G1[1], 165, 115], "pond": [POND[0], POND[1], 230, 135],
         "bank": [POND[0], POND[1] + 10, 380, 260], "m2": [M2[0], M2[1], 230, 150]}
for k, x, y, sc, fl in DECO:
    if k == "rp-pillar":
        continue
    wd = FR[k].width if k in FR else 40
    shadow(base, x, y, int(wd * sc * .4), 60)
PROPS = [p for p in PROPS if all((p[1] - d_[1]) ** 2 + (p[2] - d_[2]) ** 2 > (70 if 'Ruin' in d_[0] else 40) ** 2 for d_ in DECO)
         and all((p[1] - x) ** 2 + (p[2] - 30 - y) ** 2 > 55 ** 2 for x, y in STUBS)]
for k, x, y in PROPS:
    shadow(base, x, y, FR[k].width // 2, 70)
# moitinhas, flores e pedrinhas soltas na clareira (assadas no chão)
FO = os.path.join(ROOT, "assets", "pixel-art", "forest-open")
SMALL = [Image.open(os.path.join(FO, f)).convert("RGBA") for f in ("fr-flower0.png", "fr-flower1.png", "fr-flower2.png", "fr-rock0.png", "fr-rock2.png", "fr-bush3.png")]
for _ in range(900):
    x, y = rng.integers(10, W - 10), rng.integers(10, H - 10)
    if L_M[y, x] and trail[y, x] < .3 and inside[y, x] > .8:
        s_ = SMALL[rng.integers(len(SMALL))]
        base.alpha_composite(s_, (int(x - s_.width // 2), int(y - s_.height)))
# flores na beira dos lagos e da trilha
for _ in range(2400):
    x, y = int(rng.integers(10, W - 10)), int(rng.integers(10, H - 10))
    if (edge[y, x] or (L_M[y, x] and trail[y, x] < .2)) and rng.random() < .5:
        c = [(232, 214, 120), (226, 150, 176), (190, 196, 236), (250, 250, 236)][int(rng.integers(4))]
        bd.point((x, y), fill=c + (255,))
        bd.point((x, y + 1), fill=(56, 96, 50, 255))

# ───────── saída: chunks, máscara e roteiro ─────────
CH = 512
meta_chunks = []
for cy in range(0, H, CH):
    for cx in range(0, W, CH):
        k = f"rpb-{cx // CH}-{cy // CH}"
        base.crop((cx, cy, min(W, cx + CH), min(H, cy + CH))).save(os.path.join(OUT, k + ".png"), optimize=True)
        meta_chunks.append([k, cx, cy])
for f in os.listdir(OUT):                       # pedaços de versões menores do mapa
    if f.startswith("rpb-") and f[:-4] not in {k for k, _, _ in meta_chunks}:
        os.remove(os.path.join(OUT, f))
C = 8                                  # máscara em células de 8 px: 0 mata, 1 chão, 2 água
gw, gh = W // C, H // C
grid = np.zeros((gh, gw), np.uint8)
wm8 = W_M[:gh * C, :gw * C].reshape(gh, C, gw, C).mean((1, 3))
lm8 = L_M[:gh * C, :gw * C].reshape(gh, C, gw, C).mean((1, 3))
grid[lm8 > .6] = 1
grid[wm8 > .6] = 2
# naufrágio: ponto de chão mais perto do desejado que encosta na água (fica na margem)
from collections import deque
_s = (LAND[1] // C, LAND[0] // C)
REACH = {_s}
_q = deque([_s])
while _q:
    _j, _i = _q.popleft()
    for _dj, _di in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        _n = (_j + _dj, _i + _di)
        if 0 <= _n[0] < gh and 0 <= _n[1] < gw and _n not in REACH and grid[_n] == 1:
            REACH.add(_n)
            _q.append(_n)
assert any((j, i) in REACH for j in range(EXIT[1] // C - 4, EXIT[1] // C + 5) for i in range(EXIT[0] // C - 4, EXIT[0] // C + 5)), "saída inalcançável"


def shore_spot(px, py):
    best = None
    for (j, i) in REACH:
        if 1 <= j < gh - 1 and 1 <= i < gw - 1 and (grid[max(0, j - 3):j + 4, max(0, i - 3):i + 4] == 2).any() and (grid[j - 2:j + 1, i] == 1).all():
            if (i * C - DOCK[0]) ** 2 + (j * C - DOCK[1]) ** 2 < 85 ** 2:
                continue
            d = (i * C - px) ** 2 + (j * C - py) ** 2
            if best is None or d < best[0]:
                best = (d, i * C + 4, j * C + 4)
    return [best[1], best[2]]


WRECK = shore_spot(2340, 1250)
PROPS = [p for p in PROPS if all((p[1] - x) ** 2 + (p[2] - y) ** 2 > 70 ** 2 for x, y in (STATUE, tuple(WRECK), DOCK))]
path = [[int(p_[0]), int(p_[1]), int(round(s_))] for p_, s_ in zip(RPATH[::2], seg[::2])]
flow = [int(round(28 + max(0, 72 - r_) * 2.0)) for r_ in _rw[::2]]
_sb = int(s_at(*BRIDGE))
cues = {"1": 420, "8": int(s_at(1420, 1500)) - 120, "9": _sb - 200, "2": _sb + 520, "10": int(s_at(1420, 570)),
        "3": int(TOT - 330)}
meta = {"w": W, "h": H, "cell": C, "gw": gw, "gh": gh, "grid": base64.b64encode(grid.tobytes()).decode(),
        "chunks": meta_chunks, "props": PROPS, "deco": DECO, "wobs": WOBS,
        "start": [360, 1720], "dock": list(DOCK), "land": list(LAND), "exit": list(EXIT),
        "wreck": WRECK, "statue": list(STATUE), "bridge": list(BRIDGE),
        "path": path, "flow": flow, "len": int(TOT), "cues": cues,
        "mist": [[430, 1640, 330, 230], [1650, 560, 330, 200], [POND[0], POND[1], 200, 120]],
        "zones": ZONES, "rp2": sorted({k for k, *_ in PROPS + DECO if k.startswith("n-")})}
json.dump(meta, open(os.path.join(OUT, "rp-meta.json"), "w"), separators=(",", ":"))
# pilar partido da ponte (gerado a partir da coluna quebrada do jogo, com musgo e linha d'água)
col = Image.open(os.path.join(ROOT, "assets", "pixel-art", "props", "broken-column.png")).convert("RGBA")
col = col.resize((col.width * 2, col.height * 2), Image.NEAREST)
pil = Image.new("RGBA", (col.width + 16, col.height + 10), (0, 0, 0, 0))
pd = ImageDraw.Draw(pil)
pd.ellipse((2, col.height - 6, col.width + 14, col.height + 8), fill=(30, 60, 62, 150))
pil.alpha_composite(col, (8, 0))
pa = np.array(pil)
mossy = (pa[..., 3] > 0) & (np.arange(pa.shape[0])[:, None] > pa.shape[0] * .55) & (rng.random(pa.shape[:2]) < .35)
op = pa[..., 3] > 0
lum = pa[..., :3].astype(float).mean(2, keepdims=True)
pa[..., :3] = np.where(op[..., None], np.clip(lum * np.array([1.05, 1.02, .94]) * 1.25 + 8, 0, 255), pa[..., :3]).astype(np.uint8)
pa[mossy, :3] = (pa[mossy, :3] * .4 + np.array([70, 110, 60]) * .6).astype(np.uint8)
Image.fromarray(pa).save(os.path.join(OUT, "rp-pillar.png"))
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art")
if os.path.isdir(MIR):
    shutil.rmtree(os.path.join(MIR, "river-prologue"), ignore_errors=True)
    shutil.copytree(OUT, os.path.join(MIR, "river-prologue"))
prev = base.copy()
items = [(FR[k], x, y) for k, x, y in PROPS]
for k, x, y, sc, fl in DECO:
    im = FR[k] if k in FR else Image.open(os.path.join(OUT, "rp-pillar.png")) if k == "rp-pillar" else Image.open(os.path.join(ROOT, "assets", "pixel-art", "props-extra", k + ".png")).convert("RGBA")
    im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.NEAREST)
    items.append((im, x, y))
for t, x, y in sorted(items, key=lambda p: p[2]):
    prev.alpha_composite(t, (int(x - t.width / 2), max(0, int(y - t.height))))
pdr = ImageDraw.Draw(prev)
pdr.line([tuple(p_) for p_ in RPATH], fill=(255, 220, 120, 90), width=2)
prev.resize((W // 2, H // 2)).save(os.path.join(ROOT, "scripts", "river_prologue_preview.png"))
print("prólogo do rio:", W, H, "objetos", len(PROPS), "cena", len(DECO), "mata assada", len(deep_spots), "trajeto", int(TOT), "px", "falas", cues)
