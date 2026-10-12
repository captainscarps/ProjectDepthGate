"""
Realce de sprite em pixel art (usado no Arqueiro): dobra a resolução e
"repinta" com volume — suaviza a escadinha (Scale2x), sombreia cada material
com luz vinda do alto-esquerda em faixas (sem degradê), joga sombra fria e luz
quente, dobras na capa, oclusão embaixo e contorno escuro de 1px.

enhance(img_rgba_lowres) -> img_rgba (2x)
"""
import colorsys

import numpy as np
from PIL import Image
from scipy import ndimage

LIGHT = np.array([-0.62, -0.78])          # luz vindo do alto-esquerda
KEEP = {(213, 220, 29), (115, 239, 232), (189, 164, 153)}   # brilhos, olhos e corda: sem sombra
CLOAK = {(93, 155, 121), (72, 104, 89), (44, 59, 57)}


def scale2x(a):
    """EPX/Scale2x em RGBA (array HxWx4) → 2Hx2W"""
    h, w = a.shape[:2]
    P = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode="edge")
    E = P[1:-1, 1:-1]
    A, B, C, D = P[:-2, 1:-1], P[1:-1, 2:], P[1:-1, :-2], P[2:, 1:-1]   # cima, dir, esq, baixo
    eq = lambda x, y: np.all(x == y, axis=-1)
    out = np.zeros((h * 2, w * 2, 4), a.dtype)
    c1 = eq(C, A) & ~eq(C, D) & ~eq(A, B)
    c2 = eq(A, B) & ~eq(A, C) & ~eq(B, D)
    c3 = eq(D, C) & ~eq(D, B) & ~eq(C, A)
    c4 = eq(B, D) & ~eq(B, A) & ~eq(D, C)
    out[0::2, 0::2] = np.where(c1[..., None], A, E)
    out[0::2, 1::2] = np.where(c2[..., None], B, E)
    out[1::2, 0::2] = np.where(c3[..., None], C, E)
    out[1::2, 1::2] = np.where(c4[..., None], D, E)
    return out


def shift(rgb, f):
    """clareia/escurece com troca de matiz (sombra fria, luz quente) e posterização"""
    r, g, b = [x / 255 for x in rgb]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if f < 0:
        h = h + (0.66 - h) * min(.18, -f * .35)          # puxa para azul
        s = min(1, s * (1 - f * .25))
        v = v * (1 + f * .55)
    else:
        h = h + ((0.12 if h < .6 else 1.12) - h) * min(.12, f * .25)  # puxa para amarelo
        s = s * (1 - f * .22)
        v = min(1, v * (1 + f * .45) + f * .05)
    rr, gg, bb = colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v)))
    return int(rr * 255), int(gg * 255), int(bb * 255)


def enhance(img):
    a = np.asarray(img.convert("RGBA")).copy()
    a[a[..., 3] < 128] = 0
    a[..., 3] = np.where(a[..., 3] > 0, 255, 0)
    big = scale2x(a)
    H, W = big.shape[:2]
    alpha = big[..., 3] > 0
    rgb = big[..., :3]
    keys = rgb[..., 0].astype(np.int64) * 65536 + rgb[..., 1].astype(np.int64) * 256 + rgb[..., 2]
    # altura = silhueta geral + volume de cada material
    hgt = ndimage.gaussian_filter(alpha.astype(float), 3.2) * .55
    local = np.zeros((H, W))
    for k in np.unique(keys[alpha]):
        m = (keys == k) & alpha
        lab, n = ndimage.label(m)
        for i in range(1, n + 1):
            mi = lab == i
            local[mi] = ndimage.gaussian_filter(mi.astype(float), 1.6)[mi]
    hgt += local * .45
    gy, gx = np.gradient(hgt)
    lit = -(gx * LIGHT[0] + gy * LIGHT[1]) * 11                   # ~[-1,1]
    # oclusão: mais escuro perto dos pés / base da capa
    ys = np.arange(H)[:, None] / H
    rows = np.where(alpha.any(1))[0]
    y0, y1 = (rows.min(), rows.max()) if len(rows) else (0, H)
    yy = np.clip((np.arange(H)[:, None] - y0) / max(1, y1 - y0), 0, 1)
    lit = lit - np.clip(yy - .72, 0, 1) * 1.1
    # dobras verticais na capa
    xx = np.arange(W)[None, :]
    folds = np.where(np.sin(xx * .75 + np.arange(H)[:, None] * .06) > .55, -.55, 0.0)
    out = big.copy()
    for y, x in zip(*np.nonzero(alpha)):
        c = tuple(int(v) for v in rgb[y, x])
        if c in KEEP:
            continue
        f = lit[y, x]
        if c in CLOAK:
            f += folds[y, x]
        q = round(max(-1.4, min(1.2, f)) * 2.2) / 2.2           # faixas
        if abs(q) < .2:
            continue
        out[y, x, :3] = shift(c, q * .55)
    # luz de borda: 1px mais claro no contorno de cima/esquerda de cada material
    up = np.zeros_like(alpha); up[1:] = alpha[:-1]
    lf = np.zeros_like(alpha); lf[:, 1:] = alpha[:, :-1]
    rim = alpha & (~up | ~lf)
    for y, x in zip(*np.nonzero(rim)):
        c = tuple(int(v) for v in rgb[y, x])
        if c not in KEEP and sum(c) > 90:
            out[y, x, :3] = shift(tuple(int(v) for v in out[y, x, :3]), .45)
    # contorno de 1px (cor escura levemente puxada da vizinha)
    ring = ndimage.binary_dilation(alpha) & ~alpha
    for y, x in zip(*np.nonzero(ring)):
        out[y, x] = (22, 17, 24, 255)
    # borda interna entre materiais muito diferentes → linha de separação sutil
    return Image.fromarray(out, "RGBA")
