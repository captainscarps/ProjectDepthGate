"""
Monta o cenário do Castelo de Valdrak em andares a partir de scripts/castle/layout.py:
  assets/pixel-art/castle2/<andar>-<x>-<y>.png   (pedaços de 512 px)
  assets/pixel-art/castle2/cf-*.png              (grades, portas, ícones das chaves)
  assets/castle2/castle-data.json                (salas, corredores, escadas, portas, chaves, saves)
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

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from layout import FLOORS, KEYS, ORDER, FUTURE  # noqa: E402

PACK = os.environ.get("CASTLE_PACK", "/tmp/castle")
OUT_IMG = [os.path.join(ROOT, "assets", "pixel-art", "castle2"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "castle2")]
OUT_DATA = [os.path.join(ROOT, "assets", "castle2"), os.path.join(ROOT, "Projeto atualizado", "assets", "castle2")]
FOREST = os.path.join(ROOT, "assets", "pixel-art", "forest-open")
T = 32
CH = 512

INT = Image.open(os.path.join(PACK, "castle_interriors.png")).convert("RGBA")
EXT = Image.open(os.path.join(PACK, "castle_outside.png")).convert("RGBA")


def cell(img, cx, cy, w=1, h=1):
    return img.crop((cx * T, cy * T, (cx + w) * T, (cy + h) * T))


def fr(name):
    return Image.open(os.path.join(FOREST, name + ".png")).convert("RGBA")


VOID = (10, 12, 18, 255)
FLOORSETS = {
    "grey": ([(14, 37), (15, 37), (16, 37), (16, 38), (16, 39), (14, 37)], (14, 38)),
    "maroon": ([(5, 36), (6, 36), (5, 37), (6, 37), (5, 38), (6, 38), (5, 39), (6, 39), (4, 36), (6, 38)], None),
    "wood": ([(14, 14), (15, 14), (14, 15), (15, 15)], None),
}
RIM = [(22, 28), (23, 28), (24, 28), (25, 28), (27, 28)]
FACE1 = [(24, 29), (25, 29), (24, 29)]
FACE2 = [(21, 30), (23, 30), (24, 30), (26, 30), (28, 30), (25, 30)]
STONE_L, STONE_D, STONE_M = (124, 112, 98, 255), (34, 30, 30, 255), (84, 76, 68, 255)


def walk_grid(F):
    W, H = F["W"], F["H"]
    g = np.zeros((H, W), bool)
    for r in [x["rect"] for x in F["rooms"]] + F["corridors"]:
        g[r["y"]:r["y"] + r["h"], r["x"]:r["x"] + r["w"]] = True
    return g


def floor_kind(F):
    """tipo de piso de cada célula caminhável"""
    W, H = F["W"], F["H"]
    k = np.full((H, W), F.get("floor", "grey"), object)
    for c in F["corridors"]:
        k[c["y"]:c["y"] + c["h"], c["x"]:c["x"] + c["w"]] = F.get("floor", "grey")
    for rm in F["rooms"]:
        r = rm["rect"]
        k[r["y"]:r["y"] + r["h"], r["x"]:r["x"] + r["w"]] = rm.get("floor", F.get("floor", "grey"))
    return k


# ═══════════════════════════════ interior ═══════════════════════════════
def paint_interior(F, rnd):
    W, H = F["W"], F["H"]
    g = walk_grid(F)
    kind = floor_kind(F)
    img = Image.new("RGBA", (W * T, H * T), VOID)
    # piso
    for y in range(H):
        for x in range(W):
            if not g[y, x]:
                continue
            tiles, _ = FLOORSETS[kind[y, x]]
            t = cell(INT, *rnd.choice(tiles))
            if rnd.random() < .5 and kind[y, x] != "wood":
                t = t.transpose(Image.FLIP_LEFT_RIGHT)
            img.alpha_composite(t, (x * T, y * T))
    # enfeites do piso: rosáceas no cinza, manchas de terra no porão
    for rm in F["rooms"]:
        r = rm["rect"]
        k = rm.get("floor", F.get("floor", "grey"))
        if k == "grey":
            for yy in range(r["y"] + 2, r["y"] + r["h"] - 3, 4):
                for xx in range(r["x"] + 2, r["x"] + r["w"] - 3, 5):
                    if rnd.random() < .45:
                        img.alpha_composite(cell(INT, 14, 38, 2, 2), (xx * T, yy * T))
        if k == "maroon":
            for _ in range(max(1, r["w"] * r["h"] // 50)):
                xx = rnd.randint(r["x"], r["x"] + r["w"] - 4)
                yy = rnd.randint(r["y"], r["y"] + r["h"] - 4)
                img.alpha_composite(cell(INT, 0, 36, 4, 4), (xx * T, yy * T))
    # tapetes
    d = ImageDraw.Draw(img)
    for rm in F["rooms"]:
        c = rm.get("carpet")
        if not c:
            continue
        x0, y0, x1, y1 = c["x"] * T + 6, c["y"] * T, (c["x"] + c["w"]) * T - 6, (c["y"] + c["h"]) * T
        d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=(118, 24, 28, 255))
        d.rectangle((x0 + 3, y0, x0 + 5, y1 - 1), fill=(196, 150, 70, 255))
        d.rectangle((x1 - 6, y0, x1 - 4, y1 - 1), fill=(196, 150, 70, 255))
        for yy in range(y0 + 10, y1, 24):
            d.polygon([((x0 + x1) // 2, yy - 5), ((x0 + x1) // 2 + 5, yy), ((x0 + x1) // 2, yy + 5), ((x0 + x1) // 2 - 5, yy)], fill=(160, 46, 40, 255))
    # paredes: frente (2 fileiras) e borda de cima (1 fileira) acima de cada piso
    for x in range(W):
        y = 0
        while y < H:
            if g[y, x] and (y == 0 or not g[y - 1, x]):
                for k, (rows, pick) in enumerate(((1, FACE2), (2, FACE1), (3, RIM))):
                    yy = y - rows
                    if yy < 0 or g[yy, x]:
                        break
                    left = x == 0 or g[y, x - 1] is False or not g[y, x - 1] or g[yy, x - 1]
                    right = x == W - 1 or not g[y, x + 1] or g[yy, x + 1]
                    tile = cell(INT, *rnd.choice(pick))
                    if rows == 3:
                        if left and not right:
                            tile = cell(INT, 20, 28)
                        elif right and not left:
                            tile = cell(INT, 28, 28)
                    elif rows == 2 and left:
                        tile = cell(INT, 23, 29)
                    elif rows == 1 and left:
                        tile = cell(INT, 20, 30)
                    img.alpha_composite(tile, (x * T, yy * T))
            y += 1
    # janelas e nichos na frente das paredes (a cada 4-6 colunas, longe das pontas)
    WIN = [(23, 31), (24, 31)]
    for x in range(1, W - 1):
        for y in range(2, H):
            if g[y, x] and not g[y - 1, x] and not g[y - 2, x] and g[y, x - 1] and g[y, x + 1] \
                    and not g[y - 1, x - 1] and not g[y - 1, x + 1] and (x * 7 + y * 3) % 5 == 0:
                img.alpha_composite(cell(INT, *rnd.choice(WIN), 1, 2), (x * T, (y - 2) * T))
    # bordas laterais e de baixo (topo da parede visto de cima)
    d = ImageDraw.Draw(img)
    face = np.zeros((H, W), bool)
    for x in range(W):
        for y in range(H):
            if g[y, x] and (y == 0 or not g[y - 1, x]):
                for k in (1, 2, 3):
                    if y - k >= 0 and not g[y - k, x]:
                        face[y - k, x] = True
                    else:
                        break
    for y in range(H):
        for x in range(W):
            if g[y, x] or face[y, x]:
                continue
            px, py = x * T, y * T
            if x + 1 < W and (g[y, x + 1]):
                d.rectangle((px + T - 7, py, px + T - 1, py + T - 1), fill=STONE_M)
                d.rectangle((px + T - 7, py, px + T - 6, py + T - 1), fill=STONE_D)
                d.rectangle((px + T - 5, py, px + T - 4, py + T - 1), fill=STONE_L)
            if x - 1 >= 0 and (g[y, x - 1]):
                d.rectangle((px, py, px + 6, py + T - 1), fill=STONE_M)
                d.rectangle((px + 5, py, px + 6, py + T - 1), fill=STONE_D)
                d.rectangle((px + 2, py, px + 3, py + T - 1), fill=STONE_L)
            if y - 1 >= 0 and g[y - 1, x]:
                d.rectangle((px, py, px + T - 1, py + 7), fill=STONE_M)
                d.rectangle((px, py + 6, px + T - 1, py + 7), fill=STONE_D)
                d.rectangle((px, py + 1, px + T - 1, py + 2), fill=STONE_L)
    # escadas
    for st in F.get("stairs", []):
        if st["kind"] == "down":
            img.alpha_composite(cell(INT, 12, 28, 2, 2), (st["col"] * T, st["row"] * T))
        elif st["kind"] == "up":
            img.alpha_composite(cell(INT, 27, 31, 2, 2), (st["col"] * T, st["row"] * T))
        elif st["kind"] == "door":
            # saída: portal de pedra escuro na parede de baixo
            x0, y0 = st["col"] * T, (st["row"] + 1) * T
            for i in range(st["w"]):
                img.alpha_composite(cell(INT, 25 + (i % 2), 33), (x0 + i * T, y0))
    # sombra suave ao pé das paredes
    a = np.asarray(img).astype(np.float32)
    sh = np.zeros((H * T, W * T), np.float32)
    for x in range(W):
        for y in range(H):
            if g[y, x] and y > 0 and not g[y - 1, x]:
                sh[y * T:y * T + 12, x * T:(x + 1) * T] = np.linspace(.45, 0, 12)[:, None]
    a[..., :3] *= (1 - sh[..., None])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), g


# ═══════════════════════════════ parte externa ═══════════════════════════════
def blob_mask(H, W, cx, cy, rx, ry, seed):
    yy, xx = np.mgrid[0:H * T, 0:W * T]
    rnd = np.random.RandomState(seed)
    ang = np.arctan2(yy / T - cy, xx / T - cx)
    wob = 1 + .12 * np.sin(ang * 3 + rnd.rand() * 6) + .07 * np.sin(ang * 7 + rnd.rand() * 6)
    return ((xx / T - cx) / (rx * wob)) ** 2 + ((yy / T - cy) / (ry * wob)) ** 2 < 1


def paint_exterior(F, rnd):
    W, H = F["W"], F["H"]
    g = walk_grid(F)
    kind = floor_kind(F)
    img = Image.new("RGBA", (W * T, H * T), (40, 52, 30, 255))
    grass = [fr(f"fr-grass{i}") for i in range(4)]
    canopy = [fr(f"fr-canopy{i}") for i in range(4)]
    for y in range(H):
        for x in range(W):
            img.alpha_composite(rnd.choice(grass), (x * T, y * T))
    CR = F["castleRows"]
    # castelo (massa das muralhas): topo calçado
    pave = [cell(EXT, a, b) for a in (1, 2, 3) for b in (1, 2, 3)]
    dark = []
    for p in pave:
        a = np.asarray(p).astype(np.float32)
        a[..., :3] *= .55
        dark.append(Image.fromarray(a.astype(np.uint8)))
    for y in range(CR):
        for x in range(W):
            if not g[y, x]:
                img.alpha_composite(rnd.choice(dark), (x * T, y * T))
    # chão do pátio e passagens do castelo: pedra da passagem do portão
    cob = pave
    for y in range(H):
        for x in range(W):
            if g[y, x] and (kind[y, x] == "cobble" or y < CR):
                img.alpha_composite(rnd.choice(cob), (x * T, y * T))
    # trilha de terra
    dirt = [fr(f"fr-dirt{i}") for i in range(3)]
    for y in range(H):
        for x in range(W):
            if g[y, x] and y >= CR and (kind[y, x] == "path" or rnd.random() < .05):
                for _ in range(2 if kind[y, x] == "path" else 1):
                    dd = rnd.choice(dirt)
                    img.alpha_composite(dd, (x * T + rnd.randint(-10, 2), y * T + rnd.randint(-10, 2)))
    # água: lago e fosso
    m = F["moat"]
    water = np.zeros((H * T, W * T), bool)
    water[m["y"] * T:(m["y"] + m["h"]) * T, :] = True
    L = F["lake"]
    water |= blob_mask(H, W, L["cx"], L["cy"], L["rx"], L["ry"], 7)
    br = F["bridge"]
    wt = fr("fr-water").crop((0, 0, 32, 32))
    wimg = Image.new("RGBA", (W * T, H * T))
    for y in range(H):
        for x in range(W):
            wimg.alpha_composite(wt, (x * T, y * T))
    wa = np.asarray(wimg).copy()
    wa[..., 3] = np.where(water, 255, 0)
    from scipy import ndimage
    rim = ndimage.binary_dilation(water, iterations=4) & ~water
    rim2 = ndimage.binary_dilation(water, iterations=2) & ~water
    base = np.asarray(img).copy()
    base[rim] = (base[rim].astype(np.float32) * .55).astype(np.uint8)
    base[rim2] = (70, 58, 40, 255)
    img = Image.fromarray(base)
    img.alpha_composite(Image.fromarray(wa))
    foam = ndimage.binary_dilation(~water, iterations=1) & water
    fa = np.asarray(img).copy()
    fa[foam] = (150, 190, 200, 255)
    img = Image.fromarray(fa)
    # ponte de madeira sobre o fosso
    plank = fr("fr-bridge").rotate(90, expand=True)
    for y in range(br["y"], br["y"] + br["h"]):
        for x in range(br["x"], br["x"] + br["w"]):
            img.alpha_composite(plank, (x * T, y * T))
    d = ImageDraw.Draw(img)
    for xx in (br["x"] * T + 2, (br["x"] + br["w"]) * T - 6):
        d.rectangle((xx, br["y"] * T - 4, xx + 4, (br["y"] + br["h"]) * T + 2), fill=(70, 44, 26, 255))
    # frente das muralhas (vista do sul) e da fachada do castelo (vista do pátio)
    wc = np.zeros((H, W), bool)
    for y in range(H):
        for x in range(W):
            wc[y, x] = water[y * T + 16, x * T + 16]
    for x in range(W):
        for y in range(1, H):
            if (g[y, x] or wc[y, x]) and not g[y - 1, x] and not wc[y - 1, x] and y - 1 < CR + 1:
                keep = y <= 14
                for k in (1, 2, 3):
                    yy = y - k
                    if yy < 0 or g[yy, x]:
                        break
                    if keep:
                        tile = cell(EXT, x % 11, 18 - k)
                    else:
                        tile = cell(EXT, 1 + x % 3, 8 - k)
                    img.alpha_composite(tile, (x * T, yy * T))
    # beiradas da muralha
    d = ImageDraw.Draw(img)
    for y in range(CR):
        for x in range(W):
            if g[y, x]:
                continue
            px, py = x * T, y * T
            if y + 1 < H and g[y + 1, x]:
                continue
            if x + 1 < W and g[y, x + 1] and not (y + 1 < H and g[y + 1, x + 1] is False):
                d.rectangle((px + T - 6, py, px + T - 1, py + T - 1), fill=(96, 92, 80, 255))
                d.rectangle((px + T - 6, py, px + T - 5, py + T - 1), fill=(40, 38, 34, 255))
            if x - 1 >= 0 and g[y, x - 1]:
                d.rectangle((px, py, px + 5, py + T - 1), fill=(96, 92, 80, 255))
                d.rectangle((px + 4, py, px + 5, py + T - 1), fill=(40, 38, 34, 255))
            if y - 1 >= 0 and g[y - 1, x]:
                d.rectangle((px, py, px + T - 1, py + 6), fill=(96, 92, 80, 255))
                d.rectangle((px, py + 5, px + T - 1, py + 6), fill=(40, 38, 34, 255))
    # ameias ao longo do alto da muralha externa
    wall_top = F["gatehouse"]["y"]
    for x in range(W):
        if not g[wall_top, x]:
            img.alpha_composite(cell(EXT, 1 + x % 3, 0), (x * T, wall_top * T))
    # torre do portão e fachada central do castelo
    gh = F["gatehouse"]
    img.alpha_composite(cell(EXT, 10, 0, 6, 8), (gh["x"] * T, gh["y"] * T))
    kp = F["keep"]
    img.alpha_composite(cell(EXT, 17, 8, 7, 11), (kp["x"] * T, kp["y"] * T))
    for st in F["stairs"]:
        if st["kind"] == "door":
            for i in range(st["w"]):
                img.alpha_composite(cell(INT, 25 + (i % 2), 33, 1, 2), ((st["col"] + i) * T, (st["row"] - 1) * T))
    # torres redondas nas pontas da fachada e da muralha
    # mata: tudo abaixo do castelo que não é chão nem água
    forest = np.zeros((H, W), bool)
    for y in range(CR, H):
        for x in range(W):
            if not g[y, x] and not water[y * T + 16, x * T + 16]:
                forest[y, x] = True
    for y in range(H):
        for x in range(W):
            if forest[y, x]:
                img.alpha_composite(rnd.choice(canopy), (x * T, y * T))
    trees = [fr(f"fr-tree{i}") for i in range(8)]
    bushes = [fr(f"fr-bush{i}") for i in range(4)]
    stamps = []
    for y in range(H):
        for x in range(W):
            if forest[y, x] and rnd.random() < .55:
                near = any(0 <= y + dy < H and 0 <= x + dx < W and g[y + dy, x + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1))
                im = rnd.choice(bushes if near and rnd.random() < .5 else trees)
                stamps.append((y * T + rnd.randint(14, 30), x * T + rnd.randint(0, 31), im))
    stamps.sort(key=lambda s: s[0])
    for by, bx, im in stamps:
        shadow = Image.new("RGBA", (im.width, 10))
        ImageDraw.Draw(shadow).ellipse((2, 0, im.width - 2, 9), fill=(0, 0, 0, 90))
        img.alpha_composite(shadow, (bx - im.width // 2, by - 6))
        img.alpha_composite(im, (bx - im.width // 2, by - im.height))
    # sombra ao pé das muralhas
    a = np.asarray(img).astype(np.float32)
    sh = np.zeros((H * T, W * T), np.float32)
    for x in range(W):
        for y in range(1, H):
            if g[y, x] and not g[y - 1, x] and y < CR + 1:
                sh[y * T:y * T + 14, x * T:(x + 1) * T] = np.linspace(.5, 0, 14)[:, None]
    a[..., :3] *= (1 - sh[..., None])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), g


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
    out["cf-gate"] = cell(INT, 29, 31, 2, 2)
    door = Image.new("RGBA", (128, 64))
    for i in range(2):
        door.alpha_composite(cell(INT, 14, 30, 2, 2), (i * 64, 0))
    out["cf-crestdoor"] = door
    bars = cell(INT, 29, 29, 3, 2).resize((64, 64), Image.NEAREST)
    out["cf-portcullis"] = bars
    out["cf-icon-castle_crank"] = key_icon((150, 98, 60), crank=True)
    out["cf-icon-castle_key_iron"] = key_icon((150, 156, 166))
    out["cf-icon-castle_key_crest"] = key_icon((222, 180, 70), gem=(200, 30, 40))
    out["cf-stair-down"] = cell(INT, 12, 28, 2, 2)
    return out


# ═══════════════════════════════ saída ═══════════════════════════════
def save_img(im, name):
    for o in OUT_IMG:
        if os.path.isdir(os.path.dirname(os.path.dirname(o))):
            os.makedirs(o, exist_ok=True)
            im.save(os.path.join(o, name), optimize=True)


def main():
    data = {"order": ORDER, "future": FUTURE, "keys": KEYS, "floors": {}}
    previews = []
    for fid, F in FLOORS.items():
        rnd = random.Random(hash(fid) % 1000 + 17)
        img, g = (paint_exterior if F["kind"] == "exterior" else paint_interior)(F, rnd)
        cols, rows = math.ceil(F["W"] * T / CH), math.ceil(F["H"] * T / CH)
        for cy in range(rows):
            for cx in range(cols):
                save_img(img.crop((cx * CH, cy * CH, cx * CH + CH, cy * CH + CH)).convert("RGB"), f"c2{fid}-{cx}-{cy}.png")
        rooms = []
        for rm in F["rooms"]:
            q = {k: v for k, v in rm.items() if k not in ("floor", "carpet")}
            q.setdefault("walls", [])
            q.setdefault("enemies", [])
            q.setdefault("decor", [])
            rooms.append(q)
            r = rm["rect"]
            assert g[r["y"]:r["y"] + r["h"], r["x"]:r["x"] + r["w"]].all()
        data["floors"][fid] = {
            "id": fid, "name": F["name"], "kind": F["kind"], "world": {"cols": F["W"], "rows": F["H"]},
            "rooms": rooms, "corridors": F["corridors"], "spawn": F["spawn"],
            "chunks": {"prefix": f"c2{fid}", "chunk": CH, "cols": cols, "rows": rows},
            "stairs": F.get("stairs", []), "arrive": F.get("arrive", {}), "doors": F.get("doors", []),
            "items": F.get("items", []), "saves": F.get("saves", []),
            "bg": 1315091 if F["kind"] == "interior" else 2633754,
        }
        previews.append((fid, img))
        print(fid, img.size, cols * rows, "pedaços")
    for k, im in objects().items():
        save_img(im, k + ".png")
    for o in OUT_DATA:
        if os.path.isdir(os.path.dirname(o)):
            os.makedirs(o, exist_ok=True)
            json.dump(data, open(os.path.join(o, "castle-data.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    pv = os.environ.get("CASTLE_PREVIEW")
    if pv:
        for fid, im in previews:
            im.convert("RGB").resize((im.width // 2, im.height // 2)).save(os.path.join(pv, f"castle_{fid}.png"))


main()
