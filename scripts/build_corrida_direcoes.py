#!/usr/bin/env python3
"""Acrescenta as 4 linhas de corrida (frente, costas, diagonal de frente, diagonal de costas) às folhas -dirs das
variantes que só tinham o andar (p216.142). Fontes: scripts/art-src/armaduras/<v>-dirs2-<dir>-run.png
(gerar_corrida_direcoes.py). Cada linha de corrida usa o mesmo tamanho e lugar do andar daquela direção já montado na
folha (o quadro parado do andar é encaixado na folha para achar escala e posição); quadro 0 = parado do andar.
As linhas 0–3 (andar) ficam como estão. Vendaval e Ossário também ganham o brilho (-glow) das linhas novas.
Uso: python3 scripts/build_corrida_direcoes.py [variante…]"""
import colorsys, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/armaduras"); OUT = os.path.join(ROOT, "assets/pixel-art/characters"); S, F = 128, 192
DIRS = ["south", "north", "se", "ne"]
CLS = ["warrior", "archer", "mage", "necromancer", "druid", "rogue", "berserker", "hunter"]
SHEET = {**{f"nh-{c}": f"{c}-nh" for c in CLS}, "dh": "warrior-dh", "saqueador": "warrior-saqueador", "vendaval": "mage-vendaval", "ossos": "necromancer-ossos"}
GLOW = {"ossos": lambda h, s, v: 250 <= h <= 310 and s > .35 and v > .6, "vendaval": lambda h, s, v: 32 <= h <= 56 and s > .35 and v > .62}
def shrink(fr, size):
    a = np.array(fr.resize((size, size), Image.LANCZOS, reducing_gap=None))
    a[..., 3] = np.where(a[..., 3] >= 110, 255, 0); a[a[..., 3] == 0] = 0
    return Image.fromarray(a, "RGBA")
def dust(im, small=30):
    a = np.array(im); op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndimage.sum(op, lab, range(1, n + 1)); a[np.isin(lab, [i + 1 for i, s in enumerate(sz) if s < small])] = 0
    return Image.fromarray(a, "RGBA")
def hgt(m): ys = np.nonzero(m.any(1))[0]; return ys.max() - ys.min()
def place(f, dx, dy):
    c = Image.new("RGBA", (S, S)); c.alpha_composite(f, (max(0, dx), max(0, dy)), (max(0, -dx), max(0, -dy))); return c
def fit(src, dst):
    """offset (dx,dy) que melhor encaixa o contorno de src (já reduzido) no de dst"""
    ms, md = np.array(src)[..., 3] > 0, np.array(dst)[..., 3] > 0
    ys, xs = np.nonzero(ms); yd, xd = np.nonzero(md)
    bx, by = int(round(xd.mean() - xs.mean())), int(round(yd.max() - ys.max())); best = (-1, bx, by)
    for dy in range(by - 4, by + 5):
        for dx in range(bx - 5, bx + 6):
            sh = np.zeros_like(md); y0, x0 = max(0, dy), max(0, dx)
            sub = ms[max(0, -dy):S - max(0, dy), max(0, -dx):S - max(0, dx)]; sh[y0:y0 + sub.shape[0], x0:x0 + sub.shape[1]] = sub
            v = (sh & md).sum() / max(1, (sh | md).sum())
            if v > best[0]: best = (v, dx, dy)
    return best
def glow_of(im, test):
    a = np.array(im); g = np.zeros_like(a)
    for y, x in zip(*np.nonzero(a[..., 3] > 0)):
        h, s, v = colorsys.rgb_to_hsv(*(a[y, x, :3] / 255.))
        if test(h * 360, s, v): g[y, x] = a[y, x]
    return Image.fromarray(g, "RGBA")
for v in (sys.argv[1:] or list(SHEET)):
    if not all(os.path.exists(os.path.join(SRC, f"{v}-dirs2-{d}-run.png")) for d in DIRS): print(v, "faltam fontes"); continue
    sp = os.path.join(OUT, SHEET[v] + "-dirs.png"); sheet = Image.open(sp).convert("RGBA")
    if sheet.height >= S * 8: print(v, "já tem 8 linhas"); continue
    walk0 = [sheet.crop((0, r * S, S, r * S + S)) for r in range(4)]
    src0 = [Image.open(os.path.join(SRC, f"{v}-dirs-{d}.png")).convert("RGBA").crop((0, 0, F, F)) for d in DIRS]
    # tamanho: o mesmo para as 4 direções (como no build original) — média da razão das alturas
    size = int(round(np.median([F * hgt(np.array(w)[..., 3] > 0) / hgt(np.array(s)[..., 3] > 110) for w, s in zip(walk0, src0)])))
    out = Image.new("RGBA", (sheet.width, S * 8)); out.paste(sheet, (0, 0))
    for r, d in enumerate(DIRS):
        iou, dx, dy = fit(shrink(src0[r], size), walk0[r])
        run = Image.open(os.path.join(SRC, f"{v}-dirs2-{d}-run.png")).convert("RGBA"); n = run.width // F
        out.alpha_composite(walk0[r], (0, (4 + r) * S))
        for k in range(1, min(9, n)):
            f = dust(shrink(run.crop((k * F, 0, k * F + F, F)), size))
            out.alpha_composite(place(f, dx, dy), (k * S, (4 + r) * S))
        print(v, d, "tamanho", size, "encaixe %.2f" % iou, dx, dy)
    out.save(sp, optimize=True)
    if v in GLOW: glow_of(out, GLOW[v]).save(os.path.join(OUT, SHEET[v] + "-dirs-glow.png"), optimize=True)
