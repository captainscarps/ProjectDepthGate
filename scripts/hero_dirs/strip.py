"""
Uma direção por imagem (prompt v2): tira com 9 bonecos (parado + 8 de caminhada), fundo transparente, magenta ou verde.
Uso: python3 scripts/hero_dirs/strip.py <imagem> <classe> <linha 0-3> [altura_alvo=64]
Linhas: 0 de frente · 1 de costas · 2 diagonal de frente (↘) · 3 diagonal de costas (↗).
Atualiza assets/pixel-art/characters/<classe>-pack-t0-dirs.png (9 colunas de 128×128) e o espelho em "Projeto atualizado".
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CH = os.path.join(ROOT, "assets", "pixel-art", "characters")
src, cls, row = sys.argv[1], sys.argv[2], int(sys.argv[3]); TARGET = int(sys.argv[4]) if len(sys.argv) > 4 else 64
im = np.array(Image.open(src).convert("RGBA")).astype(int)
fg = im[..., 3] > 140
if fg.all() or (im[..., 3] > 250).mean() > .9:  # sem transparência: fundo magenta/verde liso
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    fg = ~(((r > 170) & (b > 170) & (g < 110)) | ((g > 170) & (r < 110) & (b < 110)))
fg = ndimage.binary_opening(fg, iterations=1)
fg = ndimage.binary_erosion(fg, iterations=1)          # tira a franja semitransparente/clara
lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=6))
objs = [(sl, k + 1) for k, sl in enumerate(ndimage.find_objects(lab)) if sl[0].stop - sl[0].start > 60]
objs.sort(key=lambda o: o[0][1].start)
print("bonecos:", len(objs))
assert len(objs) >= 7, "esperava 9 bonecos separados"
o = np.array(Image.open(os.path.join(CH, f"{cls}-pack-t0-body.png")).convert("RGBA"))
pal = np.unique(o[o[..., 3] > 200][:, :3], axis=0).astype(int); dark = pal[np.argmin(pal.sum(1))]
hs = []
for sl, k in objs:
    m = (lab[sl] == k) & fg[sl]; ys = np.where(m.any(1))[0]; hs.append(ys[-1] - ys[0] + 1)
sc = TARGET / np.median(hs); print("escala", round(sc, 4))
cells = []
for sl, k in objs:
    m = (lab[sl] == k) & fg[sl]; rgb = im[sl][..., :3].astype(float)
    h, w = m.shape; nw, nh = max(1, round(w * sc)), max(1, round(h * sc))
    pre = np.dstack([rgb * m[..., None], m * 255.0]).astype(np.uint8)
    P = np.array(Image.fromarray(pre).resize((nw, nh), Image.BOX)).astype(float)
    A = P[..., 3]; c = np.where(A[..., None] > 0, P[..., :3] * 255 / np.maximum(A[..., None], 1), 0)
    a = A > 120
    q = c.reshape(-1, 3); q = pal[((q[:, None, :] - pal[None]) ** 2).sum(2).argmin(1)].reshape(c.shape)
    out = np.zeros((nh, nw, 4), np.uint8); out[..., :3] = q; out[..., 3] = a * 255; cells.append(out)
def place(out):
    a = out[..., 3] > 0; ys, xs = np.where(a); top, bot = ys.min(), ys.max(); h = bot - top + 1
    band = a[top:top + max(2, int(h * .2))]; cx = np.where(band.any(0))[0]; cxm = (cx.min() + cx.max()) / 2
    cell = np.zeros((128, 128, 4), np.uint8); ox, oy = int(round(64 - cxm)), 118 - bot
    H, W = a.shape
    for y in range(H):
        for x in range(W):
            ty, tx = y + oy, x + ox
            if out[y, x, 3] and 0 <= ty < 128 and 0 <= tx < 128: cell[ty, tx] = out[y, x]
    al = cell[..., 3] > 0; nb = np.zeros_like(al)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)): nb |= ~np.roll(np.roll(al, dy, 0), dx, 1)
    e = al & nb & (cell[..., :3].astype(int).sum(2) > 3 * 128); cell[e, :3] = dark
    return cell
path = os.path.join(CH, f"{cls}-pack-t0-dirs.png")
old = Image.open(path).convert("RGBA") if os.path.exists(path) else None
sheet = Image.new("RGBA", (128 * 9, 128 * 4), (0, 0, 0, 0))
if old is not None:
    cols = old.width // 128
    for r in range(4):
        if r != row: sheet.paste(old.crop((0, r * 128, min(cols, 9) * 128, r * 128 + 128)), (0, r * 128))
for i, c in enumerate(cells[:9]): sheet.paste(Image.fromarray(place(c)), (i * 128, row * 128))
sheet.save(path)
mir = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")
if os.path.isdir(mir): sheet.save(os.path.join(mir, os.path.basename(path)))
print("linha", row, "com", min(9, len(cells)), "quadros →", path)
