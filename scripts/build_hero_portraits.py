"""
Retratos de fala e foto do HUD dos 9 heróis (folhas de expressões enviadas pelo usuário).
Cada folha é uma grade de rostos sobre fundo branco. O script remove o fundo e a franja clara,
recorta cada célula, escolhe 6 expressões e reduz com alfa pré-multiplicado (sem borda).
Gera assets/pixel-art/heroes-p/<classe>-p-<expressão>.png (128x128) e <classe>-hud.png (64x64, redondo).
Uso: HP_DIR=/pasta/com/as/folhas python3 scripts/build_hero_portraits.py
  (nomes das folhas: warrior.png necromancer.png druid.png mage.png hunter.png rogue.png berserker.png archer.png shaman.png)
"""
import os

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.environ.get("HP_DIR", "/tmp/hp/src")
# índice da célula (linha a linha) para cada expressão
PICK = {
    "warrior":     dict(calm=0, talk=6, smile=1, sadness=9, aggression=3, special=4),
    "necromancer": dict(calm=0, talk=2, smile=1, sadness=9, aggression=3, special=6),
    "druid":       dict(calm=0, talk=2, smile=3, sadness=9, aggression=7, special=6),
    "mage":        dict(calm=0, talk=3, smile=1, sadness=10, aggression=5, special=6),
    "hunter":      dict(calm=0, talk=2, smile=3, sadness=8, aggression=7, special=6),
    "rogue":       dict(calm=0, talk=1, smile=3, sadness=13, aggression=7, special=6),
    "berserker":   dict(calm=0, talk=1, smile=9, sadness=3, aggression=7, special=6),
    "archer":      dict(calm=0, talk=2, smile=1, sadness=3, aggression=7, special=6),
    "shaman":      dict(calm=0, talk=1, smile=7, sadness=3, aggression=2, special=6),
}


def clean(path):
    a = np.array(Image.open(path).convert("RGBA")).astype(np.int32)
    mn, mx = a[..., :3].min(2), a[..., :3].max(2)
    white = (mn >= 247) & (mx - mn < 10)
    lab, n = ndimage.label(white)
    sizes = ndimage.sum(white, lab, range(1, n + 1))
    kill = np.zeros(n + 1, bool); kill[1:] = sizes > 1500
    for k in set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}:
        kill[k] = True
    alpha = np.where(kill[lab], 0, 255)
    for _ in range(2):
        edge = (alpha > 0) & ndimage.binary_dilation(alpha == 0)
        alpha = np.where(edge & (mn > 236) & (mx - mn < 18), 0, alpha)
    a[..., 3] = alpha
    return a


def spans(proj, gap=12, minlen=40):
    on = proj > 0; out = []; i = 0; n = len(on)
    while i < n:
        if on[i]:
            j = i
            while j < n and (on[j] or (j + gap < n and on[j:j + gap].any())):
                j += 1
            if j - i >= minlen: out.append((i, j))
            i = j
        else:
            i += 1
    return out


ROWS = dict(warrior=4, necromancer=4, druid=4, mage=4, hunter=3, rogue=4, berserker=3, archer=3, shaman=2)


def cells(a, nrows, ncols=4):
    """grade regular; cada célula fica só com o maior bloco (tira pedaço do vizinho)"""
    H, W = a.shape[:2]; out = []
    for r in range(nrows):
        for c in range(ncols):
            out.append((c * W // ncols, r * H // nrows, W // ncols, H // nrows))
    return out


def resize_pm(c, size):
    c = c.astype(np.float64); al = c[..., 3] / 255.0
    ch = []
    for i in range(4):
        v = c[..., i] * (al if i < 3 else 1)
        ch.append(np.array(Image.fromarray(np.clip(v, 0, 255).astype(np.uint8), "L").resize(size, Image.LANCZOS)).astype(np.float64))
    A = ch[3]; out = np.zeros((size[1], size[0], 4), np.uint8)
    keep = A >= 100
    for i in range(3):
        out[..., i] = np.where(keep, np.clip(ch[i] / np.maximum(A, 1) * 255, 0, 255), 0)
    out[..., 3] = np.where(keep, 255, 0)
    o = out.astype(np.int32); mn, mx = o[..., :3].min(2), o[..., :3].max(2)
    bad = keep & ndimage.binary_dilation(~keep) & (mn > 232) & (mx - mn < 20)
    out[bad] = 0
    return out


def portrait(a, box):
    x, y, w, h = box
    c = a[y:y + h, x:x + w].copy()
    fg = c[..., 3] > 0
    lab, n = ndimage.label(ndimage.binary_dilation(fg, iterations=3))
    if n > 1:
        sz = ndimage.sum(fg, lab, range(1, n + 1)); big = 1 + int(np.argmax(sz))
        keep = np.zeros(n + 1, bool); keep[big] = True
        # mantém blocos grandes também (ex.: marcas de susto "!" ficam fora)
        c[~keep[lab]] = 0
    ys, xs = np.where(c[..., 3] > 0)
    c = c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = c.shape[:2]
    side = max(h, int(w * .8))
    sq = np.zeros((side, side, 4), np.uint8)
    ox = (side - w) // 2; oy = side - h
    sx0, dx0 = max(0, -ox), max(0, ox)
    ww = min(w - sx0, side - dx0)
    sq[oy:oy + h, dx0:dx0 + ww] = c[:, sx0:sx0 + ww]
    return resize_pm(sq, (120, 120))


def face_center(p):
    """centro do rosto: média dos pixels de pele (sem pele, o centro do conteúdo)"""
    import colorsys
    a = p.astype(np.float64) / 255; H, W = a.shape[:2]; pts = []
    for y in range(H):
        for x in range(W):
            if a[y, x, 3] < .5: continue
            h, s_, v = colorsys.rgb_to_hsv(*a[y, x, :3])
            if (h < .1 or h > .97) and .22 < s_ < .62 and .38 < v < .96 and a[y, x, 0] > a[y, x, 2] + .12: pts.append((x, y))
    if len(pts) > 120:
        P = np.array(pts); return float(np.median(P[:, 0])), float(np.median(P[:, 1]))
    ys, xs = np.where(p[..., 3] > 0); return float(xs.mean()), float(ys.mean())


def main():
    outs = [os.path.join(ROOT, "assets", "pixel-art", "heroes-p"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "heroes-p")]
    for o in outs: os.makedirs(o, exist_ok=True)
    for cls, pick in PICK.items():
        a = clean(os.path.join(SRC, cls + ".png"))
        cs = cells(a, ROWS[cls])
        assert len(cs) >= 8, (cls, len(cs))
        for ex, idx in pick.items():
            p = portrait(a, cs[idx])
            im = Image.new("RGBA", (128, 128)); im.paste(Image.fromarray(p), (4, 8))
            for o in outs: im.save(os.path.join(o, f"{cls}-p-{ex}.png"), optimize=True)
            if ex == "calm":
                cx, cy = face_center(p)
                S = 80 if cls != "warrior" else 92
                x0 = int(min(max(0, cx - S / 2), 120 - S)); y0 = int(min(max(0, cy - S / 2), 120 - S))
                face = Image.fromarray(p).crop((x0, y0, x0 + S, y0 + S)).resize((64, 64), Image.LANCZOS)
                fa = np.array(face); fa[..., 3] = np.where(fa[..., 3] > 100, 255, 0); face = Image.fromarray(fa)
                m = Image.new("L", (64, 64), 0); ImageDraw.Draw(m).ellipse((0, 0, 63, 63), fill=255)
                bg = Image.new("RGBA", (64, 64), (24, 18, 22, 255)); bg.paste(face, (0, 0), face)
                hud = Image.new("RGBA", (64, 64)); hud.paste(bg, (0, 0), m)
                for o in outs: hud.save(os.path.join(o, f"{cls}-hud.png"), optimize=True)
        print(cls, len(cs), "células")


if __name__ == "__main__":
    main()
