"""
Arqueiro = Caçadora (pacote "Huntress 2", CC0) com detalhes extras.

A arte original tem só ~36 px de altura. Para ficar do tamanho dos outros heróis
sem "pixelzão":
  1) amplia 4x com Scale2x duas vezes (suaviza a escadinha sem borrar);
  2) reduz para ~94 px (resolução dobrada do jogo — mesmo esquema do elfo);
  3) repinta com volume: luz do alto-esquerda em faixas, sombra fria/luz quente,
     oclusão nos pés e brilho de borda;
  4) contorno LEVE: só a borda externa fica um tom mais escuro da própria cor.

Uso: python3 scripts/build_huntress_archer.py "<pasta Huntress 2>"
"""
import colorsys
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enhance_pixel_sprite import scale2x  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
SRC = os.path.join(sys.argv[1], "Sprites")
FOOT, CX = 119, 62
TARGET_H = 94
ORDER = ["idle0", "idle1", "idle2", "idle3", "idlevar0", "idlevar1", "walk0", "walk1", "walk2", "walk3", "walk4", "walk5",
         "run0", "run1", "run2", "run3", "run4", "run5", "windupA", "windup", "hitA", "hit", "recovery", "guardStart", "guard",
         "hurt", "hurtB", "stunA", "stunB", "dashA", "dash", "castA", "cast", "castC", "deathA", "deathB", "deathC", "upA", "upB"]


def strip(name):
    im = Image.open(os.path.join(SRC, "Character", name + ".png")).convert("RGBA")
    return [im.crop((i * 100, 0, i * 100 + 100, 100)) for i in range(im.width // 100)]


A = {n: strip(n) for n in ["Idle", "Run", "Attack", "Get Hit", "Death", "Jump", "Fall"]}
idle_h = max(f.getbbox()[3] - f.getbbox()[1] for f in A["Idle"])
K = TARGET_H / idle_h           # fator final (~2.6)


def shift(rgb, f):
    r, g, b = [x / 255 for x in rgb]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if f < 0:
        h = h + ((0.66 if h > .2 else 0.62) - h) * min(.15, -f * .3)
        s = min(1, s * (1 - f * .2))
        v = v * (1 + f * .5)
    else:
        h = h + ((0.12 if h < .6 else 1.12) - h) * min(.1, f * .2)
        s = s * (1 - f * .2)
        v = min(1, v * (1 + f * .4) + f * .05)
    rr, gg, bb = colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v)))
    return np.array([rr * 255, gg * 255, bb * 255])


def detail(cell):
    """cell 100x100 → RGBA na resolução dobrada, com volume e contorno leve"""
    a = np.asarray(cell).copy()
    a[..., 3] = np.where(a[..., 3] > 100, 255, 0)
    src_rgb = a[..., :3].copy()
    big = scale2x(scale2x(a))                                    # 400x400, bordas suaves
    keys_big = scale2x(scale2x(np.dstack([src_rgb, a[..., 3:]])))
    out_size = round(400 * K / 4)
    al = Image.fromarray(big).resize((out_size, out_size), Image.NEAREST)
    arr = np.asarray(al).astype(float)
    alpha = arr[..., 3] > 0
    H, W = alpha.shape
    rgb = arr[..., :3]
    key = (rgb[..., 0].astype(int) << 16) | (rgb[..., 1].astype(int) << 8) | rgb[..., 2].astype(int)
    # altura = silhueta geral + volume de cada mancha de cor
    hgt = ndimage.gaussian_filter(alpha.astype(float), 4) * .5
    loc = np.zeros((H, W))
    for k in np.unique(key[alpha]):
        m = (key == k) & alpha
        lab, n = ndimage.label(m)
        for i in range(1, n + 1):
            mi = lab == i
            if mi.sum() < 6:
                continue
            loc[mi] = ndimage.gaussian_filter(mi.astype(float), 2.2)[mi]
    hgt += loc * .5
    gy, gx = np.gradient(hgt)
    lit = -(gx * -.62 + gy * -.78) * 13
    rows = np.where(alpha.any(1))[0]
    if len(rows):
        y0, y1 = rows.min(), rows.max()
        yy = np.clip((np.arange(H)[:, None] - y0) / max(1, y1 - y0), 0, 1)
        lit = lit - np.clip(yy - .78, 0, 1) * 1.3
    out = arr.copy()
    q = np.round(np.clip(lit, -1.4, 1.1) * 2.2) / 2.2
    for y, x in zip(*np.nonzero(alpha & (np.abs(q) >= .2))):
        out[y, x, :3] = shift(rgb[y, x], q[y, x] * .65)
    # brilho de borda (alto/esquerda)
    up = np.zeros_like(alpha); up[1:] = alpha[:-1]
    lf = np.zeros_like(alpha); lf[:, 1:] = alpha[:, :-1]
    rim = alpha & (~up | ~lf)
    for y, x in zip(*np.nonzero(rim)):
        if rgb[y, x].sum() > 120:
            out[y, x, :3] = shift(out[y, x, :3], .35)
    # contorno leve: borda externa = mesma cor, ~40% mais escura
    edge = alpha & ~ndimage.binary_erosion(alpha)
    out[edge, :3] = out[edge, :3] * .45
    out[..., 3] = np.where(alpha, 255, 0)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def place(img, ref_cx=None):
    bb = img.getbbox()
    crop = img.crop(bb)
    if ref_cx is None:
        al = np.asarray(crop)[..., 3] > 0
        ys, xs = np.nonzero(al[int(al.shape[0] * .45):])
        ref_cx = float(np.median(xs))
    else:
        ref_cx = ref_cx - bb[0]
    o = Image.new("RGBA", (128, 128))
    o.alpha_composite(crop, (round(CX - ref_cx), FOOT - crop.height + 1))
    return o


# centro de referência: tronco do quadro parado (mesmo para todas as animações → nada "pula")
D = {n: [detail(f) for f in fr] for n, fr in A.items()}
ref = D["Idle"][0]
bb = ref.getbbox()
al = np.asarray(ref)[..., 3] > 0
ys, xs = np.nonzero(al[bb[1] + int((bb[3] - bb[1]) * .2):bb[1] + int((bb[3] - bb[1]) * .55)])
REF_X = float(np.median(xs))

idle, run, atk, hit, death, jump, fall = (D[n] for n in ["Idle", "Run", "Attack", "Get Hit", "Death", "Jump", "Fall"])
pick = {
    "idle0": idle[0], "idle1": idle[3], "idle2": idle[5], "idle3": idle[8], "idlevar0": idle[2], "idlevar1": idle[7],
    **{f"walk{i}": run[c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    **{f"run{i}": run[c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    "windupA": atk[1], "windup": atk[2], "hitA": atk[3], "hit": atk[4], "recovery": atk[5],
    "guardStart": atk[1], "guard": atk[2],
    "hurt": hit[0], "hurtB": hit[1], "stunA": hit[1], "stunB": hit[2],
    "dashA": run[2], "dash": run[5],
    "castA": atk[2], "cast": atk[3], "castC": atk[4],
    "deathA": death[3], "deathB": death[6], "deathC": death[9],
    "upA": jump[0], "upB": fall[0],
}
frames = [place(pick[k], REF_X) for k in ORDER]
EXTRA = len(frames)
frames += [place(f, REF_X) for f in run] + [place(f, REF_X) for f in idle]
top = min(f.getbbox()[1] for f in frames[:4])
h = FOOT - top
n = len(frames)
HIRES = 68 / h
hb = round(22 / HIRES)
# rosto: ponto mais alto da cabeça + deslocado para a frente
upd = {"scale": round(.69 * 68 / h, 3), "footY": FOOT, "hires": round(HIRES, 3),
       "pcrop": [CX - hb // 2 + 6, top - 1, hb, hb],
       "anchors": [[CX + 22, top + int(h * .4)]] * n, "torso": [[CX, top + int(h * .5)]] * n,
       "head": [[CX + 3, top + int(h * .12)]] * n}
sheet = Image.new("RGBA", (128 * n, 128))
for i, f in enumerate(frames):
    sheet.alpha_composite(f, (i * 128, 0))
for o in OUTS:
    if not os.path.isdir(o):
        continue
    sheet.save(os.path.join(o, "archer-pack-body.png"))
    for t in range(5):
        sheet.save(os.path.join(o, f"archer-pack-t{t}-body.png"))
    jp = os.path.join(o, "archer-pack.json")
    if os.path.exists(jp):
        lay = json.load(open(jp))
        lay.update(upd)
        lay["map"]["walk"] = list(range(EXTRA, EXTRA + 8))
        lay["map"]["run"] = list(range(EXTRA, EXTRA + 8))
        json.dump(lay, open(jp, "w"), separators=(",", ":"))
# flecha do pacote
ar = Image.open(os.path.join(SRC, "Arrow", "Static.png")).convert("RGBA")
ar = ar.crop(ar.getbbox())
ar.resize((ar.width * 3 // 4 if ar.width > 20 else ar.width, max(3, ar.height * 3 // 4)), Image.NEAREST)\
  .save(os.path.join(ROOT, "assets", "pixel-art", "characters", "proj-elf-arrow.png"))
sheet.resize((sheet.width // 2, 64), Image.NEAREST).save(os.path.join(ROOT, "scripts", "huntress_preview.png"))
print("caçadora: altura", h, "escala", upd["scale"], "hires", upd["hires"])
