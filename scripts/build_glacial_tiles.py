"""Cidadela Congelada (bioma "frozen" do Infinito) — piso, paredes e topos com cara de gelo e neve.

Parte da arte original (scripts/art-src/frozen/, mesma grade de quadros) e redesenha por cima:
  biome-frozen.png    (14 quadros 32x32)  0-5 chão: neve batida com laje congelada aparecendo, placa de gelo liso
                      com rachaduras e reflexo, pedrinhas na neve · 6-9 o mesmo com a sombra azul da parede
                      (em cima / esquerda / direita) · 10-13 parede/topo para o tilemap
  walltop-frozen.png  (16 quadros 32x32)  topo das paredes coberto de neve; onde o original tinha borda, a neve faz
                      uma "beirada" (lábio claro + sombra azul)
  wallface-frozen.png (14 quadros 32x64)  blocos de gelo translúcido (rejunte azul profundo, brilho na quina de cima
                      de cada bloco, geada), marquise de neve no alto, pingentes de gelo pendurados e neve acumulada
                      no pé da parede; nicho e pilar mantidos
Tudo com ruído periódico de 32 px, para os quadros emendarem sem costura.
Uso: python3 scripts/build_glacial_tiles.py
"""
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "art-src", "frozen")
OUT = os.path.join(ROOT, "assets", "pixel-art", "tiles")
rng = np.random.default_rng(7)


def pnoise(n, period=32, octaves=((8, .6), (4, .3), (2, .1)), seed=0):
    """ruído de valor periódico (emenda nas bordas do quadro)"""
    r = np.random.default_rng(seed)
    out = np.zeros((n, period * 0 + 32), np.float32) if False else np.zeros((32, 32), np.float32)
    for cell, amp in octaves:
        g = r.random((32 // cell, 32 // cell)).astype(np.float32)
        ys, xs = np.mgrid[0:32, 0:32] / cell
        x0, y0 = np.floor(xs).astype(int), np.floor(ys).astype(int)
        fx, fy = xs - x0, ys - y0
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        m = g.shape[0]
        a, b = g[y0 % m, x0 % m], g[y0 % m, (x0 + 1) % m]
        c, d = g[(y0 + 1) % m, x0 % m], g[(y0 + 1) % m, (x0 + 1) % m]
        out += amp * ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy)
    return out


def lum(a):
    return a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11


def snow(seed, base=(184, 200, 224), var=16):
    n = pnoise(32, seed=seed)
    img = np.zeros((32, 32, 4), np.float32)
    for i, c in enumerate(base):
        img[..., i] = c + (n - .5) * var * 2 + (i == 2) * 4
    # sombrinhas azuis suaves (neve com relevo) e brilhos
    n2 = pnoise(32, octaves=((16, .7), (8, .3)), seed=seed + 50)
    sh = np.clip((n2 - .55) * 3, 0, 1)[..., None]
    img[..., :3] = img[..., :3] * (1 - sh * .12) + np.array([150, 175, 215]) * sh * .12
    r = np.random.default_rng(seed + 9)
    for _ in range(6):
        x, y = r.integers(0, 32, 2)
        img[y, x, :3] = (255, 255, 255)
    img[..., 3] = 255
    return img


def put(img, x, y, c, a=1.0):
    if 0 <= x < img.shape[1] and 0 <= y < img.shape[0]:
        img[y, x, :3] = img[y, x, :3] * (1 - a) + np.array(c[:3]) * a
        img[y, x, 3] = max(img[y, x, 3], 255 * min(1, a + img[y, x, 3] / 255))


def floor_tiles(orig):
    tiles = []
    o = np.asarray(orig, np.float32)
    for i in range(14):
        src = o[:, i * 32:(i + 1) * 32]
        t = snow(100 + i % 6)
        mortar = lum(src) < 24
        v = i % 6 if i < 10 else 0
        # laje congelada aparecendo debaixo da neve (linhas de rejunte)
        a = {0: .18, 1: .22, 2: .55, 3: .5, 4: .15, 5: .3}[v]
        t[mortar, :3] = t[mortar, :3] * (1 - a) + np.array([150, 172, 205]) * a
        if v == 4:                                   # neve varrida pelo vento: estrias azuladas
            for k in range(5):
                y0 = 4 + k * 6 + int(pnoise(32, seed=80 + k)[k, k] * 3)
                for x in range(32):
                    y = y0 + int(1.5 * np.sin(x / 32 * np.pi * 2 + k))
                    put(t, x, y % 32, (184, 204, 232), .35)
                    put(t, x, (y + 1) % 32, (240, 248, 255), .35)
        if v == 5:                                   # pedrinhas congeladas aparecendo
            r = np.random.default_rng(55 + i)
            for _ in range(2):
                cx, cy = r.integers(5, 27, 2)
                for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (1, 1)):
                    put(t, cx + dx, cy + dy, (112, 128, 152) if dy else (146, 162, 186), .9)
                put(t, cx, cy - 1, (244, 250, 255), .95); put(t, cx - 1, cy - 1, (230, 240, 252), .7)
        if v == 1:                                   # trilha de pegadas
            for k, (px, py) in enumerate([(8, 6), (14, 13), (9, 20), (15, 27)]):
                for dy in range(3):
                    for dx in range(2):
                        put(t, px + dx, py + dy, (176, 196, 224), .6)
        # sombra azul da parede
        yy, xx = np.mgrid[0:32, 0:32]
        if i in (6, 7):
            s = np.clip(1 - yy / 15, 0, 1) * .55
        elif i == 8:
            s = np.clip(1 - xx / 11, 0, 1) * .45
        elif i == 9:
            s = np.clip(1 - (31 - xx) / 11, 0, 1) * .45
        else:
            s = None
        if s is not None:
            t[..., :3] = t[..., :3] * (1 - s[..., None]) + np.array([92, 118, 168]) * s[..., None]
        tiles.append(t)
    return tiles


def snow_top(src, seed):
    """topo de parede nevado; borda do original vira a beirada da neve"""
    s = np.asarray(src, np.float32)
    t = snow(seed, base=(212, 224, 242), var=10)
    L = lum(s)
    edge = (L > 70) & (s[..., 3] > 0)
    sides = {"t": edge[0:2].any(), "b": edge[30:32].any(), "l": edge[:, 0:2].any(), "r": edge[:, 30:32].any()}
    for k in range(3):
        a = (.75, .35, .12)[k]
        if sides["t"]: t[k, :, :3] = t[k, :, :3] * (1 - a) + np.array([250, 253, 255]) * a
        if sides["l"]: t[:, k, :3] = t[:, k, :3] * (1 - a) + np.array([250, 253, 255]) * a
        if sides["b"]: t[31 - k, :, :3] = t[31 - k, :, :3] * (1 - a) + np.array([126, 156, 204]) * a
        if sides["r"]: t[:, 31 - k, :3] = t[:, 31 - k, :3] * (1 - a) + np.array([150, 176, 218]) * a
    t[s[..., 3] == 0, 3] = 0
    return t


def ice_face(src, seed, cap):
    """face da parede: blocos de gelo + marquise de neve + pingentes + neve no pé"""
    s = np.asarray(src, np.float32)
    h, w = s.shape[:2]
    t = np.zeros_like(s)
    t[..., 3] = s[..., 3]
    L = lum(s)
    nz = pnoise(32, seed=seed)
    for y in range(h):
        for x in range(w):
            if s[y, x, 3] == 0:
                continue
            if y < cap:                                       # marquise de neve
                g = y / max(1, cap)
                c = np.array([244, 249, 255]) * (1 - g) + np.array([196, 216, 240]) * g
                c += (nz[y % 32, x] - .5) * 14
                t[y, x, :3] = c
            elif y == cap:
                t[y, x, :3] = (150, 186, 226)
            elif L[y, x] < 16:                                # rejunte: azul profundo
                t[y, x, :3] = (34, 62, 104)
            elif L[y, x] > 140:                                # brilhos do original (cristal do nicho)
                t[y, x, :3] = s[y, x, :3]
            else:
                k = np.clip((L[y, x] - 20) / 50, 0, 1)
                c = np.array([86, 138, 196]) * (1 - k) + np.array([168, 214, 246]) * k
                c += (nz[y % 32, x] - .5) * 18
                t[y, x, :3] = c
    # quina de cima de cada bloco brilha, de baixo escurece
    for y in range(cap + 2, h - 1):
        for x in range(w):
            if s[y, x, 3] == 0 or L[y, x] < 16:
                continue
            if L[y - 1, x] < 16:
                t[y, x, :3] = t[y, x, :3] * .3 + np.array([232, 248, 255]) * .7
            elif L[y + 1, x] < 16:
                t[y, x, :3] = t[y, x, :3] * .7 + np.array([52, 92, 150]) * .3
    # geada: pontinhos claros e veios
    r = np.random.default_rng(seed + 3)
    for _ in range(int(w * h / 60)):
        x, y = r.integers(0, w), r.integers(cap + 2, h)
        if s[y, x, 3] and L[y, x] >= 16:
            put(t, x, y, (240, 250, 255), .6)
    # borda irregular da marquise e pingentes
    for x in range(w):
        drop = int(r.integers(0, 3))
        for k in range(drop):
            if cap + 1 + k < h and s[cap + 1 + k, x, 3]:
                t[cap + 1 + k, x, :3] = (226, 238, 252)
    x = int(r.integers(1, 5))
    while x < w - 1:
        ln = int(r.integers(4, 14))
        for k in range(ln):
            y = cap + 1 + k
            if y >= h - 4 or not s[y, x, 3]:
                break
            put(t, x, y, (236, 250, 255) if k < ln - 2 else (180, 226, 255), .95)
            if k < ln * .6 and x + 1 < w:
                put(t, x + 1, y, (150, 200, 240), .85)
        x += int(r.integers(3, 8))
    # neve acumulada no pé
    base = int(r.integers(0, 3))
    for x in range(w):
        hh = 3 + int(2 * np.sin(x / 32 * np.pi * 2 + seed) + 1.2 * np.sin(x / 32 * np.pi * 6 + seed * 2))
        for k in range(max(1, hh + base)):
            y = h - 1 - k
            if s[y, x, 3]:
                t[y, x, :3] = (236, 244, 255) if k < hh + base - 1 else (200, 220, 244)
    return t


def main():
    bf = Image.open(os.path.join(SRC, "biome-frozen.png")).convert("RGBA")
    wt = Image.open(os.path.join(SRC, "walltop-frozen.png")).convert("RGBA")
    wf = Image.open(os.path.join(SRC, "wallface-frozen.png")).convert("RGBA")
    o = np.asarray(bf, np.float32)

    tiles = floor_tiles(bf)
    # 10 parede, 11 face, 12 topo, 13 face-topo (tilemap)
    tiles[10] = snow_top(o[:, 320:352], 210)
    tiles[12] = snow_top(o[:, 384:416], 212)
    tiles[11] = ice_face(o[:, 352:384], 211, 6)
    tiles[13] = ice_face(o[:, 416:448], 213, 6)
    out = np.concatenate(tiles, axis=1)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "biome-frozen.png"), optimize=True)

    w = np.asarray(wt, np.float32)
    tops = [snow_top(w[:, i * 32:(i + 1) * 32], 300 + i) for i in range(w.shape[1] // 32)]
    Image.fromarray(np.clip(np.concatenate(tops, axis=1), 0, 255).astype(np.uint8)).save(os.path.join(OUT, "walltop-frozen.png"), optimize=True)

    f = np.asarray(wf, np.float32)
    faces = []
    for i in range(f.shape[1] // 32):
        fr = f[:, i * 32:(i + 1) * 32]
        if fr[..., 3].sum() < 64 * 255 * 4:                    # quadros-fio (laterais): só tinge de azul gelo
            g = fr.copy(); m = g[..., 3] > 0; g[m, :3] = (150, 190, 230); faces.append(g); continue
        rows = [y for y in range(64) if fr[y, :, 3].any()]
        top = rows[0]
        ledge = next((y for y in range(top, 64) if lum(fr[y:y + 1])[0].mean() > 70), top + 16)
        faces.append(ice_face(fr, 400 + i, ledge))
    Image.fromarray(np.clip(np.concatenate(faces, axis=1), 0, 255).astype(np.uint8)).save(os.path.join(OUT, "wallface-frozen.png"), optimize=True)
    print("ok")


if __name__ == "__main__":
    main()
