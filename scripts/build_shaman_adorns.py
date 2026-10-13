"""
Xamã: âncoras por quadro (rosto/pescoço) a partir da pintura vermelha do rosto,
e os adornos (cocar e colar) usados pelo sistema de visual por equipamento.
"""
import colorsys
import json
import os

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
      os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
im = Image.open(os.path.join(CH[0], "shaman-pack-t0-body.png")).convert("RGBA")
a = np.asarray(im).astype(float) / 255
n = im.width // 128
hsv = np.zeros(a.shape[:2] + (3,))
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a[..., :3].max(-1), a[..., :3].min(-1)
v = mx
s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
red = (a[..., 3] > .5) & (s > .55) & (v > .4) & (r > g * 1.8) & (r > b * 1.8)
head, neck = [], []
last = None
for i in range(n):
    al = a[:, i * 128:(i + 1) * 128, 3] > .5
    yy0, _ = np.nonzero(al)
    top0 = yy0.min() if len(yy0) else 50
    # só a pintura do ROSTO: a faixa logo abaixo do topo da silhueta (o corpo também tem urucum)
    m = red[:, i * 128:(i + 1) * 128].copy()
    m[:top0] = False
    m[top0 + 22:] = False
    ys, xs = np.nonzero(m)
    if len(xs) >= 3:
        cx, cy = float(np.median(xs)), float(np.median(ys))
    else:
        yy, xx = np.nonzero(al)
        if not len(yy):
            cx, cy = last or (64, 59)
        else:
            top = yy.min()
            sel = yy < top + 8
            cx, cy = float(np.median(xx[sel])), float(top + 6)
    last = (cx, cy)
    head.append([round(cx - 2, 1), round(cy - 3, 1)])
    neck.append([round(cx - 3, 1), round(cy + 8, 1)])
for o in CH:
    jp = os.path.join(o, "shaman-pack.json")
    if os.path.exists(jp):
        L = json.load(open(jp))
        L["head"], L["torso"] = head, neck
        json.dump(L, open(jp, "w"), separators=(",", ":"))

# ── adornos (escala do mundo) ───────────────────────────────────────────
NM = os.path.join(ROOT, "assets", "pixel-art", "ui2")
os.makedirs(NM, exist_ok=True)


def cocar(colors, path):
    W, H = 15, 10
    c = Image.new("RGBA", (W, H))
    d = ImageDraw.Draw(c)
    # penas em leque (de trás para frente)
    fe = [(-3, 7), (-1.6, 8), (0, 9), (1.6, 8), (3, 7)]
    for k, (dx, ln) in enumerate(fe):
        col = colors[k % len(colors)]
        x0, y0 = 7.5, 8.5
        x1, y1 = x0 + dx * 1.9, y0 - ln
        d.line((x0, y0, x1, y1), fill=col, width=2)
        d.point((round(x1), round(y1)), fill=(255, 255, 255, 255) if k % 2 else col)
    d.line((3, 9, 12, 9), fill=(120, 72, 36, 255), width=1)       # faixa de palha
    d.point((7, 9), fill=(240, 200, 60, 255))
    c.save(path)


cocar([(214, 48, 40, 255), (40, 110, 220, 255), (245, 200, 40, 255), (40, 160, 70, 255)],
      os.path.join(NM, "adorn-cocar.png"))
cocar([(235, 235, 235, 255), (205, 205, 205, 255), (250, 250, 250, 255), (215, 215, 215, 255)],
      os.path.join(NM, "adorn-cocar-w.png"))


def colar(col, path):
    c = Image.new("RGBA", (9, 6))
    d = ImageDraw.Draw(c)
    d.arc((0, -4, 8, 4), 10, 170, fill=(110, 70, 40, 255))
    for x, y in [(1, 2), (4, 4), (7, 2)]:
        d.polygon([(x, y), (x + 1, y), (x + .5, y + 2)], fill=col)
    c.save(path)


colar((245, 238, 220, 255), os.path.join(NM, "adorn-colar.png"))
print("âncoras da Xamã:", len(head), "quadros; adornos gerados")
