"""
Grade da IA (4 linhas: frente, costas, diagonal de frente, diagonal de costas), com fundo transparente de verdade,
magenta/verde liso ou o quadriculado "falso" desenhado pela IA. Cada linha pode ter 6–12 bonecos de caminhada.
Uso: python3 scripts/hero_dirs/grid.py <imagem> <classe> [--idle-first] [--skip r:c,r:c] [--altura 64]
  --idle-first : o 1º boneco de cada linha é a pose parada (senão a pose parada é escolhida entre os da caminhada,
                 a de pernas mais juntas)
  --skip       : bonecos a descartar (ex.: 2:3 = linha 2, 4º boneco, contando do 0)
Saída: assets/pixel-art/characters/<classe>-pack-t0-dirs.png, 13 colunas × 4 linhas de 128×128
(coluna 0 parado, 1… caminhada). Imprime quantos quadros de caminhada ficaram em cada linha (para __HDIRS).
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CH = os.path.join(ROOT, "assets", "pixel-art", "characters")
args = sys.argv[1:]; src, cls = args[0], args[1]
IDLE1 = "--idle-first" in args
SKIP = set()
if "--skip" in args:
    for t in args[args.index("--skip") + 1].split(","):
        r, c = t.split(":"); SKIP.add((int(r), int(c)))
TARGET = int(args[args.index("--altura") + 1]) if "--altura" in args else 64
COLS = 13
im = np.array(Image.open(src).convert("RGBA")).astype(int); H, W = im.shape[:2]
rgb = im[..., :3]; mn, mx = rgb.min(2), rgb.max(2)
if (im[..., 3] < 250).mean() > .05:
    fg = im[..., 3] > 140
else:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    bgc = ((r > 170) & (b > 170) & (g < 110)) | ((g > 170) & (r < 110) & (b < 110))
    chk = (mn > 175) & ((mx - mn) < 30)            # quadriculado cinza/branco
    lab, _ = ndimage.label(chk | bgc)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    # cada linha também tem fundo entre os bonecos: componentes grandes de fundo contam como fundo
    sizes = ndimage.sum(np.ones_like(lab), lab, index=np.arange(lab.max() + 1))
    big = set(np.where(sizes > 4000)[0]) - {0}
    fg = ~(np.isin(lab, list(edge | big)) | bgc)
fg = ndimage.binary_opening(fg, iterations=1)
fg = ndimage.binary_erosion(fg, iterations=1)
o = np.array(Image.open(os.path.join(CH, f"{cls}-pack-t0-body.png")).convert("RGBA"))
pal = np.unique(o[o[..., 3] > 200][:, :3], axis=0).astype(int); dark = pal[np.argmin(pal.sum(1))]
lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=5))
objs = [sl for sl in ndimage.find_objects(lab) if sl and sl[0].stop - sl[0].start > H * .12]
ids = [k + 1 for k, sl in enumerate(ndimage.find_objects(lab)) if sl and sl[0].stop - sl[0].start > H * .12]
items = sorted(zip(objs, ids), key=lambda t: (t[0][0].start + t[0][0].stop) / 2)
# agrupa em 4 linhas pelo centro vertical
cy = np.array([(sl[0].start + sl[0].stop) / 2 for sl, _ in items]); order = np.argsort(cy)
rows = [[] for _ in range(4)]
for sl, k in items: rows[min(3, int((sl[0].start + sl[0].stop) / 2 / (H / 4)))].append((sl, k))
for r in rows: r.sort(key=lambda t: t[0][1].start)
print("bonecos por linha:", [len(r) for r in rows])
def tocell(sl, k, sc):
    m = (lab[sl] == k) & fg[sl]; c0 = rgb[sl].astype(float)
    h, w = m.shape; nw, nh = max(1, round(w * sc)), max(1, round(h * sc))
    pre = np.dstack([c0 * m[..., None], m * 255.0]).astype(np.uint8)
    P = np.array(Image.fromarray(pre).resize((nw, nh), Image.BOX)).astype(float)
    A = P[..., 3]; c = np.where(A[..., None] > 0, P[..., :3] * 255 / np.maximum(A[..., None], 1), 0)
    q = c.reshape(-1, 3); q = pal[((q[:, None, :] - pal[None]) ** 2).sum(2).argmin(1)].reshape(c.shape)
    out = np.zeros((nh, nw, 4), np.uint8); out[..., :3] = q; out[..., 3] = (A > 120) * 255
    a = out[..., 3] > 0; ys, xs = np.where(a); top, bot = ys.min(), ys.max(); hh = bot - top + 1
    band = a[top:top + max(2, int(hh * .2))]; cx = np.where(band.any(0))[0]; cxm = (cx.min() + cx.max()) / 2
    cell = np.zeros((128, 128, 4), np.uint8); ox, oy = int(round(64 - cxm)), 118 - bot
    for y in range(nh):
        for x in range(nw):
            ty, tx = y + oy, x + ox
            if out[y, x, 3] and 0 <= ty < 128 and 0 <= tx < 128: cell[ty, tx] = out[y, x]
    al = cell[..., 3] > 0; nb = np.zeros_like(al)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): nb |= ~np.roll(np.roll(al, dy, 0), dx, 1)
    e = al & nb & (cell[..., :3].astype(int).sum(2) > 3 * 128); cell[e, :3] = dark
    return cell
sheet = np.zeros((128 * 4, 128 * COLS, 4), np.uint8); counts = []
for ri, r in enumerate(rows):
    r = [t for ci, t in enumerate(r) if (ri, ci) not in SKIP]
    hs = []
    for sl, k in r:
        m = (lab[sl] == k) & fg[sl]; ys = np.where(m.any(1))[0]; hs.append(ys[-1] - ys[0] + 1)
    sc = TARGET / np.median(hs)
    cells = [tocell(sl, k, sc) for sl, k in r]
    if IDLE1: idle, walk = cells[0], cells[1:]
    else:
        def spread(c):  # largura das pernas (terço de baixo)
            a = c[..., 3] > 0; ys = np.where(a.any(1))[0]; low = a[ys[-1] - (ys[-1] - ys[0]) // 3:ys[-1] + 1]
            xs = np.where(low.any(0))[0]; return xs.max() - xs.min()
        idle, walk = min(cells, key=spread), cells
    walk = walk[:COLS - 1]; counts.append(len(walk))
    sheet[ri * 128:ri * 128 + 128, 0:128] = idle
    for i, c in enumerate(walk): sheet[ri * 128:ri * 128 + 128, (i + 1) * 128:(i + 2) * 128] = c
out = Image.fromarray(sheet); path = os.path.join(CH, f"{cls}-pack-t0-dirs.png"); out.save(path)
mir = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")
if os.path.isdir(mir): out.save(os.path.join(mir, os.path.basename(path)))
print("quadros de caminhada por linha:", counts, "→", path)
