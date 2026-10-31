"""
Monta o cenário do Castelo de Valdrak em andares a partir de scripts/castle/layout.py:
  assets/pixel-art/castle2/c2<andar>-<x>-<y>.png  (pedaços de 512 px)
  assets/pixel-art/castle2/cf-*.png               (grades, portas, ícones das chaves, adereços cf-p-*)
  assets/castle2/castle-data.json                 (salas, corredores, escadas, portas, chaves, saves, adereços)
Pacote "RPG Buildings: CASTLE" (Szadi art) fora do repositório (licença): CASTLE_PACK=pasta com os PNG.
Uso: CASTLE_PACK=/tmp/castle python3 scripts/castle/build_castle.py
"""
import json
import math
import os
import random
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from layout import FLOORS, KEYS, ORDER, FUTURE, NAMES  # noqa: E402
from art import catalog, crop, sheet  # noqa: E402

OUT_IMG = [os.path.join(ROOT, "assets", "pixel-art", "castle2"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "castle2")]
OUT_DATA = [os.path.join(ROOT, "assets", "castle2"), os.path.join(ROOT, "Projeto atualizado", "assets", "castle2")]
FOREST = os.path.join(ROOT, "assets", "pixel-art", "forest-open")
T = 32
CH = 512
PROPS = catalog()


def cell(n, cx, cy, w=1, h=1):
    return sheet(n).crop((cx * T, cy * T, (cx + w) * T, (cy + h) * T))


def fr(name):
    return Image.open(os.path.join(FOREST, name + ".png")).convert("RGBA")


def vnoise(h, w, cell_, seed):
    r = np.random.RandomState(seed)
    g = r.rand(h // cell_ + 3, w // cell_ + 3)
    return ndimage.zoom(g, cell_, order=3)[:h, :w]


def fbm(h, w, seed, octs=((96, .55), (40, .3), (14, .15))):
    return sum(vnoise(h, w, c, seed + i) * a for i, (c, a) in enumerate(octs))


def put(img, im, x, y):
    img.alpha_composite(im, (int(round(x)), int(round(y))))


def put_base(img, im, cx, by):
    """cola com o centro da base em (cx, by) px"""
    put(img, im, cx - im.width / 2, by - im.height)


def walk_grid(F, extra=()):
    g = np.zeros((F["H"], F["W"]), bool)
    for r in [x["rect"] for x in F["rooms"]] + F["corridors"] + list(extra):
        g[r["y"]:r["y"] + r["h"], r["x"]:r["x"] + r["w"]] = True
    return g


VOID = (9, 11, 17, 255)
FLOORSETS = {
    "grey": [(14, 37), (15, 37), (16, 37), (16, 38), (16, 39), (15, 36), (14, 36)],
    "maroon": [(5, 36), (6, 36), (5, 37), (6, 37), (5, 38), (6, 38), (5, 39), (6, 39)],
    "brown": [(12, 36), (13, 36), (12, 37), (13, 37), (12, 38), (13, 38), (12, 39), (13, 39)],
    "wood": [(14, 14), (15, 14), (14, 15), (15, 15)],
}


# ═══════════════════════════════ interior ═══════════════════════════════
def paint_interior(F, rnd):
    W, H = F["W"], F["H"]
    g = walk_grid(F)
    kind = np.full((H, W), F.get("floor", "grey"), object)
    for rm in F["rooms"]:
        r = rm["rect"]
        kind[r["y"]:r["y"] + r["h"], r["x"]:r["x"] + r["w"]] = rm.get("floor", F.get("floor", "grey"))
    img = Image.new("RGBA", (W * T, H * T), VOID)
    # piso
    for y in range(H):
        for x in range(W):
            if g[y, x]:
                t = cell("int", *rnd.choice(FLOORSETS[kind[y, x]]))
                if kind[y, x] != "wood" and rnd.random() < .5:
                    t = t.transpose(Image.FLIP_LEFT_RIGHT)
                put(img, t, x * T, y * T)
    for rm in F["rooms"]:
        r, k = rm["rect"], rm.get("floor", F.get("floor", "grey"))
        if k == "grey":
            for yy in range(r["y"] + 2, r["y"] + r["h"] - 2, 4):
                for xx in range(r["x"] + 2, r["x"] + r["w"] - 2, 5):
                    if rnd.random() < .35:
                        put(img, cell("int", 14, 38, 2, 2), xx * T, yy * T)
    # paredes: cada borda de cima de piso ganha 1 fileira de topo (moldura do pack) + 2 de tijolo
    face = np.zeros((H, W), np.int8)          # 1 = tijolo, 2 = topo
    for x in range(W):
        for y in range(1, H):
            if g[y, x] and not g[y - 1, x]:
                for k, v in ((1, 1), (2, 1), (3, 2)):
                    if y - k < 0 or g[y - k, x]:
                        break
                    face[y - k, x] = v
    for y in range(H):
        x = 0
        while x < W:
            if face[y, x] == 1 and (y + 1 >= H or face[y + 1, x] != 1):      # fileira de baixo da face
                x0 = x
                while x < W and face[y, x] == 1 and (y + 1 >= H or face[y + 1, x] != 1):
                    x += 1
                for c in range(x0, x):
                    sx = 0 if c == x0 else 4 if c == x - 1 else 1 + (c - x0) % 3
                    put(img, cell("int", sx, 5, 1, 2), c * T, (y - 1) * T)
                continue
            x += 1
    for y in range(H):
        x = 0
        while x < W:
            if face[y, x] == 2:
                x0 = x
                while x < W and face[y, x] == 2:
                    x += 1
                for c in range(x0, x):
                    sx = 0 if c == x0 else 4 if c == x - 1 else 1 + (c - x0) % 3
                    put(img, cell("int", sx, 4), c * T, y * T)
                continue
            x += 1
    # moldura do topo das paredes (vista de cima) contornando o vazio
    open_ = g | (face > 0)
    L = cell("int", 0, 2).crop((0, 0, 14, 32))
    Rr = cell("int", 4, 2).crop((18, 0, 32, 32))
    TOP = cell("int", 2, 0).crop((0, 0, 32, 14))
    BOT = cell("int", 2, 4).crop((0, 18, 32, 32))
    for y in range(H):
        for x in range(W):
            if open_[y, x]:
                continue
            if x + 1 < W and open_[y, x + 1]:
                put(img, Rr, x * T + 18, y * T)
            if x - 1 >= 0 and open_[y, x - 1]:
                put(img, L, x * T, y * T)
            if y + 1 < H and open_[y + 1, x] and face[y + 1, x] == 0:
                put(img, BOT, x * T, y * T + 18)
            if y - 1 >= 0 and g[y - 1, x]:
                put(img, TOP, x * T, y * T)
    # tapetes: vermelho com barra dourada e franja
    d = ImageDraw.Draw(img)
    for rm in F["rooms"]:
        c = rm.get("carpet")
        if not c:
            continue
        x0, y0, x1, y1 = c["x"] * T + 8, c["y"] * T + 2, (c["x"] + c["w"]) * T - 8, (c["y"] + c["h"]) * T - 4
        d.rectangle((x0, y0, x1, y1), fill=(92, 22, 26, 255))
        d.rectangle((x0 + 2, y0, x1 - 2, y1), fill=(122, 30, 32, 255))
        for xx in (x0 + 4, x1 - 6):
            d.rectangle((xx, y0, xx + 2, y1), fill=(178, 136, 64, 255))
            d.line((xx + 1, y0, xx + 1, y1), fill=(214, 176, 92, 255))
        mx = (x0 + x1) // 2
        for yy in range(y0 + 18, y1 - 10, 30):
            d.polygon([(mx, yy - 8), (mx + 8, yy), (mx, yy + 8), (mx - 8, yy)], fill=(150, 44, 40, 255), outline=(178, 136, 64, 255))
        for xx in range(x0 + 2, x1 - 1, 3):
            d.line((xx, y1 + 1, xx, y1 + 3), fill=(178, 136, 64, 255))
    # escadas e portas de saída
    for st in F.get("stairs", []):
        if st["kind"] == "down":
            put(img, cell("int", 12, 28, 2, 2), st["col"] * T, st["row"] * T)
        elif st["kind"] == "up":
            put(img, cell("int", 27, 31, 2, 2), st["col"] * T, st["row"] * T)
        elif st["kind"] == "door":
            x0, y0 = st["col"] * T, (st["row"] + 1) * T
            d.rectangle((x0, y0, x0 + st["w"] * T - 1, y0 + 20), fill=(4, 4, 8, 255))
            for i in range(st["w"]):
                d.line((x0 + i * T, y0, x0 + i * T + 31, y0), fill=(110, 96, 80, 255))
    # adereços de parede (assados no cenário)
    for p in F.get("props", []):
        if p.get("wall"):
            put_base(img, PROPS[p["p"]][0], p["c"] * T, p["r"] * T - 4)
        elif p.get("under"):
            put_base(img, PROPS[p["p"]][0], p["c"] * T, p["r"] * T)
    # sombra ao pé das paredes e nas laterais
    a = np.asarray(img).astype(np.float32)
    sh = np.zeros((H * T, W * T), np.float32)
    ramp = np.linspace(.5, 0, 14)
    for x in range(W):
        for y in range(1, H):
            if g[y, x] and not g[y - 1, x]:
                sh[y * T:y * T + 14, x * T:(x + 1) * T] = np.maximum(sh[y * T:y * T + 14, x * T:(x + 1) * T], ramp[:, None])
    for y in range(H):
        for x in range(W):
            if g[y, x] and x > 0 and not g[y, x - 1]:
                sh[y * T:(y + 1) * T, x * T:x * T + 10] = np.maximum(sh[y * T:(y + 1) * T, x * T:x * T + 10], np.linspace(.35, 0, 10)[None, :])
            if g[y, x] and x + 1 < W and not g[y, x + 1]:
                sh[y * T:(y + 1) * T, x * T + 22:(x + 1) * T] = np.maximum(sh[y * T:(y + 1) * T, x * T + 22:(x + 1) * T], np.linspace(0, .35, 10)[None, :])
    a[..., :3] *= (1 - sh[..., None])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), g


# ═══════════════════════════════ parte externa ═══════════════════════════════
def polyline_mask(H, W, pts, w, seed):
    m = Image.new("L", (W * T, H * T), 0)
    d = ImageDraw.Draw(m)
    P = [(x * T, y * T) for x, y in pts]
    for (a, b), (c, e) in zip(P, P[1:]):
        steps = int(math.hypot(c - a, e - b) / 6) + 1
        for i in range(steps + 1):
            t = i / steps
            x, y = a + (c - a) * t, b + (e - b) * t
            r = w * T / 2 * (.85 + .3 * math.sin(x * .02 + y * .031 + seed))
            d.ellipse((x - r, y - r, x + r, y + r), fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255


def organic_walk(F, seed):
    """amplia as áreas abertas da mata com bordas irregulares (em células), sem tocar no castelo"""
    H, W, CR = F["H"], F["W"], F["castleRows"]
    g = walk_grid(F)
    n = vnoise(H * 4, W * 4, 10, seed)[::4, ::4]
    ring1 = ndimage.binary_dilation(g, iterations=1) & ~g
    ring2 = ndimage.binary_dilation(g, iterations=2) & ~g & ~ring1
    add = (ring1 & (n > .42)) | (ring2 & (n > .7))
    add[:CR + 4] = False
    add[:, :1] = add[:, -1:] = False
    add[-1:] = False
    g2 = g | add
    g2 = ndimage.binary_closing(g2, iterations=1) | g
    g2[:CR + 4] = g[:CR + 4]
    runs = []
    for y in range(CR + 4, H):
        x = 0
        while x < W:
            if g2[y, x] and not g[y, x]:
                x0 = x
                while x < W and g2[y, x] and not g[y, x]:
                    x += 1
                runs.append({"x": x0, "y": y, "w": x - x0, "h": 1})
            else:
                x += 1
    return g2, runs


def paint_exterior(F, rnd):
    W, H, CR = F["W"], F["H"], F["castleRows"]
    PW, PH = W * T, H * T
    g, extra = organic_walk(F, 11)
    F["corridors"] = F["corridors"] + extra
    # ── chão: grama com variação de cor em manchas largas
    img = Image.new("RGBA", (PW, PH))
    grass = [fr(f"fr-grass{i}") for i in range(4)]
    for y in range(H):
        for x in range(W):
            put(img, rnd.choice(grass), x * T, y * T)
    a = np.asarray(img).astype(np.float32)
    v = fbm(PH, PW, 3)
    a[..., :3] *= (.82 + v[..., None] * .32)
    a[..., 0] += (v - .5) * 18
    # ── terra batida das trilhas com borda irregular e pontilhada
    pm = np.zeros((PH, PW), np.float32)
    for k, pth in enumerate(F["paths"]):
        pm = np.maximum(pm, polyline_mask(H, W, pth["pts"], pth["w"], k))
    edge_n = fbm(PH, PW, 9, ((24, .6), (6, .4)))
    pth = (pm + (edge_n - .5) * .5) > .5
    dirt = Image.new("RGBA", (PW, PH))
    dd = [fr(f"fr-dirt{i}") for i in range(3)]
    for y in range(0, PH, 40):
        for x in range(0, PW, 40):
            put(dirt, rnd.choice(dd), x - 4, y - 4)
    da = np.asarray(dirt).astype(np.float32)
    base_d = np.array([118, 92, 62], np.float32)
    dcol = np.where(da[..., 3:] > 0, da[..., :3] * .5 + base_d * .5, base_d)
    dcol *= (.88 + edge_n[..., None] * .24)
    a[pth, :3] = dcol[pth]
    rim = ndimage.binary_dilation(pth, iterations=2) & ~pth
    a[rim, :3] *= .8
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # ── água: lago orgânico e fosso com margem irregular ao sul
    yy, xx = np.mgrid[0:PH, 0:PW]
    Lk = F["lake"]
    ang = np.arctan2(yy / T - Lk["cy"], xx / T - Lk["cx"])
    wob = 1 + .13 * np.sin(ang * 3 + 1.3) + .07 * np.sin(ang * 7 + .4) + .04 * np.sin(ang * 13)
    water = ((xx / T - Lk["cx"]) / (Lk["rx"] * wob)) ** 2 + ((yy / T - Lk["cy"]) / (Lk["ry"] * wob)) ** 2 < 1
    m = F["moat"]
    south = (m["y"] + m["h"]) * T + (vnoise(1, PW, 40, 5)[0] - .5) * 22 + np.sin(np.arange(PW) * .013) * 5
    water |= (yy >= m["y"] * T) & (yy < south[None, :])
    wt = fr("fr-water")
    wimg = Image.new("RGBA", (PW, PH))
    for y in range(0, PH, wt.height):
        for x in range(0, PW, wt.width):
            put(wimg, wt, x, y)
    wa = np.asarray(wimg).astype(np.float32)
    depth = ndimage.distance_transform_edt(water)
    wa[..., :3] *= (1.05 - np.clip(depth / 60, 0, .35))[..., None]
    ba = np.asarray(img).astype(np.float32)
    shore = ndimage.binary_dilation(water, iterations=7) & ~water
    shore2 = ndimage.binary_dilation(water, iterations=3) & ~water
    ba[shore, :3] *= .72
    ba[shore2, :3] = ba[shore2, :3] * .4 + np.array([86, 72, 50]) * .6
    ba[water] = wa[water]
    foam = ndimage.binary_dilation(~water, iterations=2) & water
    ba[foam, :3] = ba[foam, :3] * .5 + np.array([170, 200, 205]) * .5
    img = Image.fromarray(np.clip(ba, 0, 255).astype(np.uint8))
    # pedrinhas e tufos na margem
    rocks = [fr(f"fr-rock{i}") for i in range(3)]
    sh_pts = np.argwhere(shore2 & (yy > (m["y"] + m["h"]) * T + 8))
    for i in rnd.sample(range(len(sh_pts)), min(60, len(sh_pts))):
        y_, x_ = sh_pts[i]
        if rnd.random() < .5:
            put_base(img, rnd.choice(rocks), x_, y_ + 6)
    # ── castelo
    paint_castle(img, F, rnd, g)
    # ── mata: árvores densas onde não é chão, água ou castelo
    walk_px = ndimage.zoom(g.astype(np.float32), T, order=0) > .5
    free = ~walk_px & ~water
    free[:CR * T + 6] = False
    trees = [fr(f"fr-tree{i}") for i in range(8)]
    bushes = [fr(f"fr-bush{i}") for i in range(4)]
    flowers = [fr(f"fr-flower{i}") for i in range(3)]
    dist_w = ndimage.distance_transform_edt(~walk_px)
    stamps = []
    for y in range(CR * T + 20, PH + 40, 22):
        for x in range(-10, PW + 10, 24):
            px, py = x + rnd.randint(-10, 10), y + rnd.randint(-8, 8)
            qx, qy = min(PW - 1, max(0, px)), min(PH - 1, max(0, py))
            if not free[qy, qx]:
                continue
            dw = dist_w[qy, qx]
            if dw < 10:
                if rnd.random() < .6:
                    stamps.append((py, px, rnd.choice(bushes)))
                continue
            stamps.append((py, px, rnd.choice(trees)))
    # tufos e flores dentro das clareiras (sem colisão)
    for _ in range(260):
        px, py = rnd.randrange(PW), rnd.randrange(CR * T + 140, PH)
        if walk_px[py, px] and not pth[py, px] and not water[py, px] and dist_w[py, px] == 0:
            stamps.append((py, px, rnd.choice(flowers if rnd.random() < .7 else rocks)))
    stamps.sort(key=lambda s: s[0])
    for by, bx, im in stamps:
        if im.height > 30:
            s = Image.new("RGBA", (im.width + 8, 12))
            ImageDraw.Draw(s).ellipse((2, 1, im.width + 6, 11), fill=(0, 0, 0, 80))
            put(img, s.filter(ImageFilter.GaussianBlur(2)), bx - im.width / 2 - 4, by - 8)
        put_base(img, im, bx, by)
    # ponte de madeira por cima do fosso
    br = F["bridge"]
    plank = fr("fr-bridge").rotate(90, expand=True)
    for y in range(br["y"] * T - 10, (br["y"] + br["h"]) * T + 12, 32):
        for x in range(br["x"], br["x"] + br["w"]):
            put(img, plank, x * T, y)
    d = ImageDraw.Draw(img)
    for xx in (br["x"] * T, (br["x"] + br["w"]) * T - 5):
        d.rectangle((xx, br["y"] * T - 12, xx + 4, (br["y"] + br["h"]) * T + 14), fill=(66, 42, 24, 255))
        for yy in range(br["y"] * T - 10, (br["y"] + br["h"]) * T + 12, 26):
            d.rectangle((xx - 1, yy, xx + 5, yy + 5), fill=(48, 30, 18, 255))
    return img, g


def paint_castle(img, F, rnd, g):
    W, H, CR = F["W"], F["H"], F["castleRows"]
    PW = W * T
    # chão dentro das muralhas: pátio calçado; fora do pátio, gramado escuro do recinto
    pave = [cell("ext", a, b) for a in (1, 2, 3) for b in (1, 2, 3)]
    patio = next(r["rect"] for r in F["rooms"] if r["id"] == "x-patio")
    for y in range(0, CR):
        for x in range(W):
            if (patio["x"] - 1 <= x < patio["x"] + patio["w"] + 1 and y >= 12) or g[y, x]:
                put(img, rnd.choice(pave), x * T, y * T)
    # alamedas laterais do recinto: árvores entre os prédios
    trees = [fr(f"fr-tree{i}") for i in (0, 1, 5, 6)]
    for _ in range(26):
        x = rnd.choice([rnd.randint(20, 300), rnd.randint(PW - 300, PW - 20)])
        y = rnd.randint(250, 760)
        put_base(img, rnd.choice(trees), x, y)
    # prédios do recinto (telhados vermelhos) nas laterais
    hall = crop("ext", (544, 256, 768, 576))
    for x, y in ((40, 560), (PW - 264, 560)):
        put(img, hall, x, y - hall.height)
    # torre de menagem: fachada de janelas nas alas e corpo central com portal
    wing = crop("ext", (0, 290, 352, 606))
    by = 13 * T
    put(img, wing, patio["x"] * T + 6, by - wing.height)
    put(img, wing.transpose(Image.FLIP_LEFT_RIGHT), (patio["x"] + patio["w"]) * T - wing.width - 6, by - wing.height)
    keep = crop("ext", (544, 256, 768, 576))
    put(img, keep, 30 * T - keep.width // 2, by - keep.height)
    portal = crop("ext", (1440, 544, 1506, 662))
    put(img, portal, 30 * T - portal.width // 2, by - portal.height + 2)
    # torres redondas nos cantos do pátio
    tower = crop("ext", (0, 828, 64, 1032))
    for tx in (patio["x"] - 1, patio["x"] + patio["w"] + 1):
        put_base(img, tower, tx * T, by + 6)
    # muralha sul: passeio com ameias + face com arcos até a água
    wy0, wy1 = 24 * T, F["moat"]["y"] * T
    merl = crop("ext", (0, 292, 288, 332))
    facew = crop("ext", (0, 472, 352, 604))
    top = [cell("ext", a, b) for a in (1, 2, 3) for b in (1, 2, 3)]
    dk = []
    for t in top:
        q = np.asarray(t).astype(np.float32)
        q[..., :3] *= .78
        dk.append(Image.fromarray(q.astype(np.uint8)))
    for y in range(wy0, wy1 - facew.height, T):
        for x in range(0, PW, T):
            put(img, rnd.choice(dk), x, y)
    fy = wy1 - facew.height
    for x in range(-40, PW, facew.width):
        put(img, facew, x, fy)
    for x in range(0, PW, merl.width):
        put(img, merl, x, fy - merl.height + 6)
    # muralhas laterais do pátio (ameias de cima)
    for x in (patio["x"] - 1, patio["x"] + patio["w"]):
        for y in range(by, wy0, T):
            put(img, rnd.choice(dk), x * T, y)
    # torres redondas na muralha sul e portaria
    for tx in (2, 13, 46, 57):
        put_base(img, tower, tx * T, wy1 + 4)
    gate = crop("ext", (320, 0, 512, 236))
    put(img, gate, 29 * T + 16 - gate.width // 2, wy1 - gate.height + 6)
    d = ImageDraw.Draw(img)
    # passagem escura sob a portaria
    d.rectangle((28 * T + 4, wy1 - 96, 31 * T - 4, wy1 - 1), fill=(24, 20, 20, 255))
    for y in range(wy1 - 96, wy1, 8):
        d.line((28 * T + 4, y, 31 * T - 5, y), fill=(40, 34, 32, 255))


# ═══════════════════════════════ objetos e ícones ═══════════════════════════════
def key_icon(col, gem=None, crank=False):
    im = Image.new("RGBA", (24, 24))
    d = ImageDraw.Draw(im)
    dark = tuple(max(0, c - 70) for c in col)
    if crank:
        d.rectangle((4, 10, 18, 13), fill=dark)
        d.rectangle((5, 11, 17, 12), fill=col)
        d.rectangle((15, 4, 18, 13), fill=dark)
        d.rectangle((16, 5, 17, 12), fill=col)
        d.ellipse((13, 1, 21, 6), fill=(110, 60, 30), outline=(50, 26, 12))
        d.ellipse((1, 8, 8, 15), outline=dark, width=2)
        return im
    d.ellipse((2, 2, 12, 12), fill=dark)
    d.ellipse((4, 4, 10, 10), fill=col)
    d.ellipse((6, 6, 8, 8), fill=(0, 0, 0, 0))
    d.rectangle((10, 6, 21, 8), fill=dark)
    d.rectangle((11, 6, 20, 7), fill=col)
    d.rectangle((17, 8, 19, 12), fill=dark)
    d.rectangle((14, 8, 15, 11), fill=dark)
    if gem:
        d.rectangle((6, 6, 8, 8), fill=gem)
    return im


def objects():
    out = {}
    gate = crop("int", (928, 1000, 1024, 1056))
    out["cf-gate"] = gate
    door = Image.new("RGBA", (128, 64))
    wd = crop("int", (448, 960, 480, 1028))
    for i in range(4):
        door.alpha_composite(wd.resize((32, 64), Image.NEAREST), (i * 32, 0))
    out["cf-crestdoor"] = door
    out["cf-portcullis"] = crop("ext", (960, 840, 1024, 896))
    out["cf-icon-castle_crank"] = key_icon((150, 98, 60), crank=True)
    out["cf-icon-castle_key_iron"] = key_icon((150, 156, 166))
    out["cf-icon-castle_key_crest"] = key_icon((222, 180, 70), gem=(200, 30, 40))
    out["cf-p-lectern"] = PROPS["lectern"][0]
    return out


# ═══════════════════════════════ saída ═══════════════════════════════
def save_img(im, name):
    for o in OUT_IMG:
        if os.path.isdir(os.path.dirname(os.path.dirname(o))):
            os.makedirs(o, exist_ok=True)
            im.save(os.path.join(o, name), optimize=True)


def main():
    data = {"order": ORDER, "future": FUTURE, "keys": KEYS, "floors": {}, "props": {}}
    previews = []
    used = set()
    for fid, F in FLOORS.items():
        rnd = random.Random(sum(map(ord, fid)) * 31 + 7)
        img, g = (paint_exterior if F["kind"] == "exterior" else paint_interior)(F, rnd)
        cols, rows = math.ceil(F["W"] * T / CH), math.ceil(F["H"] * T / CH)
        for cy in range(rows):
            for cx in range(cols):
                save_img(img.crop((cx * CH, cy * CH, cx * CH + CH, cy * CH + CH)).convert("RGB"), f"c2{fid}-{cx}-{cy}.png")
        rooms = []
        for rm in F["rooms"]:
            q = {k: v for k, v in rm.items() if k not in ("floor", "carpet")}
            q["name"] = NAMES[rm["id"]][0]
            q["nameI18n"] = NAMES[rm["id"]]
            q.setdefault("walls", [])
            q.setdefault("enemies", [])
            q.setdefault("decor", [])
            rooms.append(q)
            r = rm["rect"]
            assert g[r["y"]:r["y"] + r["h"], r["x"]:r["x"] + r["w"]].all(), rm["id"]
        props = []
        for p in F.get("props", []):
            if p.get("wall") or p.get("under"):
                continue
            im, coll = PROPS[p["p"]][0], PROPS[p["p"]][1]
            used.add(p["p"])
            props.append({"t": "cf-p-" + p["p"], "x": round(p["c"] * T), "y": round(p["r"] * T), "b": coll})
        data["floors"][fid] = {
            "id": fid, "name": F["name"], "kind": F["kind"], "world": {"cols": F["W"], "rows": F["H"]},
            "rooms": rooms, "corridors": F["corridors"], "spawn": F["spawn"],
            "chunks": {"prefix": f"c2{fid}", "chunk": CH, "cols": cols, "rows": rows},
            "stairs": F.get("stairs", []), "arrive": F.get("arrive", {}), "doors": F.get("doors", []),
            "items": F.get("items", []), "saves": F.get("saves", []), "props": props,
            "bg": 591121 if F["kind"] == "interior" else 2633754,
        }
        previews.append((fid, img, props))
        print(fid, img.size, cols * rows, "pedaços", len(props), "adereços")
    for k, im in objects().items():
        save_img(im, k + ".png")
    for n in used:
        save_img(PROPS[n][0], "cf-p-" + n + ".png")
    data["props"] = sorted("cf-p-" + n for n in used | {"lectern"})
    for o in OUT_DATA:
        if os.path.isdir(os.path.dirname(o)):
            os.makedirs(o, exist_ok=True)
            json.dump(data, open(os.path.join(o, "castle-data.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    pv = os.environ.get("CASTLE_PREVIEW")
    if pv:
        for fid, im, props in previews:
            im = im.copy()
            for p in sorted(props, key=lambda q: q["y"]):
                put_base(im, PROPS[p["t"][5:]][0], p["x"], p["y"])
            im.convert("RGB").save(os.path.join(pv, f"castle_{fid}_full.png"))
            im.convert("RGB").resize((im.width // 2, im.height // 2)).save(os.path.join(pv, f"castle_{fid}.png"))


main()
