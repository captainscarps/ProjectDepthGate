"""
Prólogo do Rio da Floresta — mapa assado no mesmo padrão refinado do Bosque Amaldiçoado e da Floresta Nevada.

O herói chega de barco por um lago e um rio sinuoso no meio da mata, desembarca num píer de madeira,
atravessa uma clareira e entra na trilha que leva à Floresta de Eldervale.
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
W, H = 1600, 1200

# ───────── fontes: chão e árvores do Bosque Amaldiçoado ─────────
meta_rf = json.load(open(os.path.join(RF, "rfb-meta.json")))
atlas = Image.open(os.path.join(RF, "rf-props.png")).convert("RGBA")
frames = json.load(open(os.path.join(RF, "rf-props.json")))["frames"]
FR = {k: atlas.crop((v["frame"]["x"], v["frame"]["y"], v["frame"]["x"] + v["frame"]["w"], v["frame"]["y"] + v["frame"]["h"])) for k, v in frames.items()}
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

# ───────── água: lago + rio sinuoso + remanso do píer ─────────
yy, xx = np.mgrid[0:H, 0:W].astype(float)
water = np.zeros((H, W))


def blob(cx, cy, rx, ry, k=1.0):
    global water
    water = np.maximum(water, k * np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) * 1.6))


blob(380, 900, 300, 210)
blob(250, 1040, 200, 140)
blob(560, 980, 150, 110)
RIVER = [(560, 860), (680, 790), (800, 740), (920, 760), (1040, 720), (1130, 640), (1190, 560), (1230, 500)]
for (ax, ay), (bx, by) in zip(RIVER, RIVER[1:]):
    for t in np.linspace(0, 1, 14):
        cx, cy = ax + (bx - ax) * t, ay + (by - ay) * t
        r = 82 + 12 * math.sin(cx / 47)
        blob(cx, cy, r, r * .9)
blob(1240, 470, 120, 85)                      # remanso do píer
wf = water + vnoise(70, .1) + vnoise(23, .05)
W_M = wf > .5                                  # água
deep = smooth(blur(W_M.astype(float), 22), .55, .95)

# clareira + trilha (onde se anda)
land = np.zeros((H, W))


def lblob(cx, cy, rx, ry):
    global land
    land = np.maximum(land, np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) * 1.6))


lblob(1250, 330, 210, 150)                    # clareira do desembarque
lblob(1040, 270, 140, 110)                    # estátua
lblob(1180, 560, 120, 70)                     # margem do naufrágio
TRAIL = [(1250, 380), (1180, 300), (1080, 230), (960, 170), (860, 110), (800, 40), (790, -20)]
for (ax, ay), (bx, by) in zip(TRAIL, TRAIL[1:]):
    for t in np.linspace(0, 1, 16):
        lblob(ax + (bx - ax) * t, ay + (by - ay) * t, 62, 62)
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
d.line(TRAIL, fill=255, width=26, joint="curve")
for p in TRAIL:
    d.ellipse((p[0] - 13, p[1] - 13, p[0] + 13, p[1] + 13), fill=255)
d.ellipse((1250 - 34, 410 - 22, 1250 + 34, 410 + 26), fill=255)          # chegada do píer
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
img = np.clip(img, 0, 255)
base = Image.fromarray(img.astype(np.uint8), "RGB").convert("RGBA")
bd = ImageDraw.Draw(base)
for _ in range(90):                                                 # marolas
    x, y = rng.integers(0, W), rng.integers(0, H)
    if W_M[y, x] and deep[y, x] > .2:
        w = int(rng.integers(8, 20))
        bd.arc((x, y, x + w, y + 5), 200, 340, fill=(150, 196, 186, 120), width=1)

# ───────── árvores ─────────
TREES = ["rf-Tree1", "rf-Tree2", "rf-Tree3", "rf-Tree5", "rf-Tree6", "rf-Tree7", "rf-Tree8", "rf-Tree9", "rf-Tree11", "rf-Tree13"]
BUSH = ["rf-Bush1", "rf-Bush3", "rf-Bush4", "rf-Bush9", "rf-Bush11", "rf-Bush12", "rf-Bush13", "rf-Tree4", "rf-Tree12"]


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


PROPS, deep_spots = [], []
for y in range(-40, H + 90, 22):
    for x in range(-20, W + 20, 26):
        jx, jy = x + rng.integers(-10, 11), y + rng.integers(-8, 9)
        cx, cy = min(W - 1, max(0, jx)), min(H - 1, max(0, jy))
        if openm[cy, cx]:
            continue
        ob = openblur[cy, cx]
        if ob > .08:                     # borda: objeto com profundidade, sem tampar água/clareira
            if rng.random() < .7:
                for k in ([random.choice(TREES)] if rng.random() < .55 else []) + [random.choice(BUSH)]:
                    if cover(jx, jy, FR[k].width, FR[k].height) < .12:
                        PROPS.append([k, int(jx), int(jy)])
                        break
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
# afasta objetos de cima da clareira/água (pé da árvore nunca dentro do caminho)
keep = []
for k, x, y in PROPS:
    cx, cy = min(W - 1, max(0, x)), min(H - 1, max(0, y))
    if not openm[min(H - 1, cy + 4), cx]:
        keep.append([k, x, y])
PROPS = keep
PROPS = [p for p in PROPS if all((p[1] - x) ** 2 + (p[2] - y) ** 2 > 70 ** 2 for x, y in ((1030, 250), (1238, 430), (1196, 412)))]
for k, x, y in PROPS:
    shadow(base, x, y, FR[k].width // 2, 70)
# moitinhas e pedrinhas soltas na clareira (assadas no chão)
FO = os.path.join(ROOT, "assets", "pixel-art", "forest-open")
SMALL = [Image.open(os.path.join(FO, f)).convert("RGBA") for f in ("fr-flower0.png", "fr-flower1.png", "fr-flower2.png", "fr-rock0.png", "fr-rock2.png", "fr-bush3.png")]
for _ in range(260):
    x, y = rng.integers(10, W - 10), rng.integers(10, H - 10)
    if L_M[y, x] and trail[y, x] < .3 and inside[y, x] > .8:
        s = SMALL[rng.integers(len(SMALL))]
        base.alpha_composite(s, (int(x - s.width // 2), int(y - s.height)))

# ───────── saída: chunks, máscara e roteiro ─────────
CH = 512
meta_chunks = []
for cy in range(0, H, CH):
    for cx in range(0, W, CH):
        k = f"rpb-{cx // CH}-{cy // CH}"
        base.crop((cx, cy, min(W, cx + CH), min(H, cy + CH))).save(os.path.join(OUT, k + ".png"), optimize=True)
        meta_chunks.append([k, cx, cy])
C = 8                                  # máscara em células de 8 px: 0 mata, 1 chão, 2 água
gw, gh = W // C, H // C
grid = np.zeros((gh, gw), np.uint8)
for j in range(gh):
    for i in range(gw):
        blk_w = W_M[j * C:(j + 1) * C, i * C:(i + 1) * C].mean()
        blk_l = L_M[j * C:(j + 1) * C, i * C:(i + 1) * C].mean()
        grid[j, i] = 2 if blk_w > .6 else 1 if blk_l > .6 else 0
# naufrágio: ponto de chão mais perto do desejado que encosta na água (fica na margem)
from collections import deque
_s = (395 // C, 1250 // C)
REACH = {_s}
_q = deque([_s])
while _q:
    _j, _i = _q.popleft()
    for _dj, _di in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        _n = (_j + _dj, _i + _di)
        if 0 <= _n[0] < gh and 0 <= _n[1] < gw and _n not in REACH and grid[_n] == 1:
            REACH.add(_n)
            _q.append(_n)


def shore_spot(px, py):
    best = None
    for j in range(1, gh - 1):
        for i in range(1, gw - 1):
            if (j, i) in REACH and (grid[max(0, j - 3):j + 4, max(0, i - 3):i + 4] == 2).any() and (grid[j - 2:j + 1, i] == 1).all():
                d = (i * C - px) ** 2 + (j * C - py) ** 2
                if (i * C - 1238) ** 2 + (j * C - 452) ** 2 < 85 ** 2:
                    continue
                if best is None or d < best[0]:
                    best = (d, i * C + 4, j * C + 4)
    return [best[1], best[2]]


WRECK = shore_spot(1150, 560)
# nada de árvore na frente da estátua, do naufrágio ou do píer
PROPS = [p for p in PROPS if all((p[1] - x) ** 2 + (p[2] - y) ** 2 > 70 ** 2 for x, y in ((1030, 250), tuple(WRECK), (1238, 430)))]
meta = {"w": W, "h": H, "cell": C, "gw": gw, "gh": gh, "grid": base64.b64encode(grid.tobytes()).decode(),
        "chunks": meta_chunks, "props": PROPS,
        "start": [300, 960], "dock": [1238, 452], "land": [1250, 395], "exit": [800, 30],
        "wreck": WRECK, "statue": [1030, 250],
        "cues": {"river": 640, "mid": 960, "near": 600}}
json.dump(meta, open(os.path.join(OUT, "rp-meta.json"), "w"), separators=(",", ":"))
used = sorted({p[0] for p in PROPS} | {"rf-Ruin_grass4", "rf-Broken_tree1", "rf-Broken_tree2"})
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art")
if os.path.isdir(MIR):
    shutil.rmtree(os.path.join(MIR, "river-prologue"), ignore_errors=True)
    shutil.copytree(OUT, os.path.join(MIR, "river-prologue"))
prev = base.copy()
for k, x, y in sorted(PROPS, key=lambda p: p[2]):
    t = FR[k]
    prev.alpha_composite(t, (int(x - t.width / 2), max(0, int(y - t.height))))
prev.resize((W // 2, H // 2)).save(os.path.join(ROOT, "scripts", "river_prologue_preview.png"))
print("prólogo do rio:", W, H, "objetos", len(PROPS), "mata assada", len(deep_spots), "grama", len(patches), "recortes")
