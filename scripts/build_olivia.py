"""
Olivia, a filha do Rafael (o ferreiro), e os bichos dela no Refúgio:
  · olivia.png — a menina de rabo de cavalo do pacote CraftPix "Schoolgirls 2" (Girl_2): linha 0 correndo (12),
    linha 1 pulando (15), linha 2 esticando o braço (4); cabelo castanho mais quente e pele morena como no retrato;
  · olivia-p-*.png — os 5 retratos de fala enviados (calm/talk, smile, aggression, special, sadness);
  · mussarela.png — a cachorra branca com manchas pretas (o cachorro do Refúgio recolorido, mesmas animações);
  · gato-o.png — o Fumaça, gato cinza que fica na forja (o gato da Alline recolorido).
Uso: python3 scripts/build_olivia.py <pasta Girl_2> <retratos.png>
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NPC = os.path.join(ROOT, "assets", "pixel-art", "npc"); VIL = os.path.join(ROOT, "assets", "pixel-art", "hub", "village")
GD, PORT = sys.argv[1], sys.argv[2]

def portraits(src, name):
    a = np.array(Image.open(src).convert("RGBA")).astype(int)
    white = a[..., :3].min(-1) > 236
    lab, _ = ndimage.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    a[np.isin(lab, list(edge)), 3] = 0
    Hh, Ww = a.shape[:2]; cw = Ww // 3
    cells = [(0, 0, cw), (0, cw, 2 * cw), (0, 2 * cw, Ww), (1, cw // 2, cw // 2 + cw), (1, cw // 2 + cw, cw // 2 + 2 * cw)]
    for k, (row, x0, x1) in zip(["calm", "smile", "aggression", "special", "sadness"], cells):
        y0, y1 = (0, Hh // 2) if row == 0 else (Hh // 2, Hh); m = a[y0:y1, x0:x1, 3] > 0; yy, xx = np.where(m)
        crop = Image.fromarray(a[y0 + yy.min():y0 + yy.max() + 1, x0 + xx.min():x0 + xx.max() + 1].clip(0, 255).astype(np.uint8))
        s = max(crop.size); sq = Image.new("RGBA", (s, s)); sq.paste(crop, ((s - crop.width) // 2, s - crop.height))
        p = sq.resize((128, 128), Image.BOX); al = np.array(p)[..., 3]
        p = p.convert("RGB").quantize(48, method=Image.Quantize.MEDIANCUT).convert("RGBA"); pa = np.array(p); pa[..., 3] = np.where(al > 110, 255, 0)
        Image.fromarray(pa).save(os.path.join(NPC, f"{name}-p-{k}.png"))
        if k == "calm": Image.fromarray(pa).save(os.path.join(NPC, f"{name}-p-talk.png"))
portraits(PORT, "olivia")

def remap(a, table, mask=None):
    out = a.copy()
    for src, dst in table.items():
        m = (a[..., 3] > 0) & np.all(a[..., :3] == src, axis=-1)
        if mask is not None: m &= mask
        out[m, :3] = dst
    return out

# ── Olivia ──
rows = [("Run.png", 12), ("Jump.png", 15), ("Opening_Door.png", 4)]
sheet = np.zeros((128 * 3, 128 * 15, 4), np.uint8)
for r, (fn, n) in enumerate(rows):
    im = np.array(Image.open(os.path.join(GD, fn)).convert("RGBA"))
    for c in range(n):
        f = im[:, c * 128:(c + 1) * 128].copy()
        ys, xs = np.where(f[..., 3] > 0)
        if len(ys):
            head = np.zeros(f.shape[:2], bool); head[ys.min():ys.min() + 24] = True
            f = remap(f, {(39, 31, 27): (96, 58, 40), (51, 39, 42): (122, 76, 54), (89, 77, 77): (150, 104, 76)}, head)
            f = remap(f, {(233, 181, 163): (226, 166, 130), (186, 117, 106): (178, 112, 86), (142, 82, 82): (140, 84, 70)})
        sheet[r * 128:(r + 1) * 128, c * 128:(c + 1) * 128] = f
Image.fromarray(sheet).save(os.path.join(NPC, "olivia.png"))

# ── Mussarela: cachorro branco com manchas pretas ──
d = np.array(Image.open(os.path.join(VIL, "dog.png")).convert("RGBA"))
WH = {(116, 117, 144): (255, 255, 255), (96, 94, 121): (250, 250, 252), (81, 78, 96): (244, 244, 248), (70, 65, 78): (236, 236, 242),
      (58, 53, 63): (224, 224, 232), (57, 55, 69): (230, 230, 236), (51, 46, 56): (212, 212, 222), (51, 46, 54): (212, 212, 222),
      (41, 36, 45): (190, 190, 202), (35, 33, 45): (70, 68, 80), (31, 30, 41): (60, 58, 70), (59, 41, 39): (130, 96, 96),
      (195, 157, 127): (236, 198, 194), (169, 133, 112): (212, 172, 168), (135, 103, 91): (176, 138, 134), (222, 191, 144): (248, 222, 218)}
body_cols = [k for k in WH if sum(k) < 400 and k not in [(35, 33, 45), (31, 30, 41), (59, 41, 39)]]
for r in range(d.shape[0] // 32):
    for c in range(d.shape[1] // 32):
        f = d[r * 32:(r + 1) * 32, c * 32:(c + 1) * 32]
        if not f[..., 3].any(): continue
        body = np.zeros(f.shape[:2], bool)
        for col in body_cols: body |= np.all(f[..., :3] == col, axis=-1) & (f[..., 3] > 0)
        g = remap(f, WH)
        ys, xs = np.where(body)
        if len(ys):   # manchas pretas: blocos de 2x2 em posições fixas em relação ao corpo
            y0, x0 = ys.min(), xs.min(); hh, ww = ys.max() - y0 + 1, xs.max() - x0 + 1
            for fy, fx in ((.25, .3), (.55, .62), (.4, .8), (.7, .25), (.15, .7)):
                cy, cx = int(y0 + fy * hh), int(x0 + fx * ww)
                for dy in (0, 1):
                    for dx in (0, 1, 2):
                        yy, xx = cy + dy, cx + dx - 1
                        if 0 <= yy < 32 and 0 <= xx < 32 and body[yy, xx]: g[yy, xx, :3] = (34, 32, 38)
        f[:] = g
Image.fromarray(d).save(os.path.join(NPC, "mussarela.png"))

# ── Fumaça: gato cinza ──
cat = np.array(Image.open(os.path.join(NPC, "gato-a.png")).convert("RGBA"))
cat = remap(cat, {(255, 224, 183): (168, 170, 184), (189, 164, 153): (128, 130, 146), (136, 110, 106): (92, 94, 110), (45, 27, 30): (36, 34, 44)})
Image.fromarray(cat).save(os.path.join(NPC, "gato-o.png"))
print("olivia ok")
