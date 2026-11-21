#!/usr/bin/env python3
"""Chefes: preparo e golpe (p216.78) — PixelLab animate-pixminimax a partir do quadro parado (scripts/art-src/chefes/anim/
<chefe>-idle.png → <chefe>-windup.png; o "strike" foi gerado a partir do último quadro do windup).
A IA muitas vezes já faz o golpe dentro do "windup": aqui escolhemos, por chefe, quais quadros (W = tira windup,
S = tira strike) formam o PREPARO e quais formam o GOLPE. Saída: assets/pixel-art/bosses/anim/<chefe>-windup.png e
-strike.png, no tamanho de quadro da folha do chefe (a Anhangá, de 72 px, foi animada em 144 e volta para 72)."""
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/chefes/anim"); O = os.path.join(ROOT, "assets/pixel-art/bosses/anim")
R = lambda t, a, b: [(t, i) for i in range(a, b + 1)]
M = {
    "boss-minotaur": (R("W", 0, 4), R("W", 5, 8)),
    "boss-gorgon": (R("W", 0, 3), R("S", 4, 8), "norm"),
    "boss-lava-golem": (R("W", 0, 8), R("S", 3, 8)),
    "boss-magma-titan": (R("W", 0, 4), R("S", 1, 8)),
    "boss-icegolem": (R("W", 0, 8), R("S", 3, 8)),
    "boss-dragon3": (R("W", 0, 8), R("S", 2, 5)),
    "boss-anhanga": (R("W", 0, 4), R("W", 5, 8)),
    "boss-gorgon-forest": (R("W", 0, 5), R("W", 6, 8) + [("S", 8)]),
    "boss-necro-queen": (R("W", 0, 8), R("S", 2, 8)),
    "boss-cerberus": (R("W", 0, 8), R("S", 0, 8)),
    "boss-pale-dragon": (R("W", 0, 8), R("S", 0, 2) + [("W", 8)]),
    "boss-ent": (R("W", 0, 8), R("S", 0, 8)),
    "boss-observer": (R("W", 0, 4), R("S", 3, 5)),
    "boss-guardian-fallen": (R("W", 0, 6), R("S", 2, 6)),
    "boss-tengu": (R("W", 0, 8), R("S", 3, 8)),
}
def frames(path):
    im = Image.open(path).convert("RGBA"); w = im.height
    return [im.crop((i * w, 0, i * w + w, w)) for i in range(im.width // w)]
def bbox_h(f):
    a = np.array(f)[..., 3] > 90; ys = np.where(a.any(1))[0]
    return (ys[0], ys[-1]) if len(ys) else (0, 0)
def norm(f, T):
    """reduz quadros que a IA desenhou maiores que o chefe parado (até 1,2× a altura), presos pelo pé"""
    y0, y1 = bbox_h(f); h = y1 - y0 + 1
    if h <= T * 1.2: return f
    k = T * 1.2 / h; w = f.width
    g = f.resize((max(1, round(w * k)), max(1, round(w * k))), Image.LANCZOS)
    out = Image.new("RGBA", f.size); out.alpha_composite(g, ((w - g.width) // 2, int(y1 + 1 - (y1 + 1) * k)))
    return out
os.makedirs(O, exist_ok=True)
for k, spec in M.items():
    W, Sx = frames(os.path.join(S, f"{k}-windup.png")), frames(os.path.join(S, f"{k}-strike.png"))
    idle = Image.open(os.path.join(S, f"{k}-idle.png")).convert("RGBA"); fw = idle.width
    y0, y1 = bbox_h(idle); T = y1 - y0 + 1
    for name, sel in (("windup", spec[0]), ("strike", spec[1])):
        fr = [(W if t == "W" else Sx)[i] for t, i in sel]
        if fr[0].width != fw: fr = [f.resize((fw, fw), Image.LANCZOS) for f in fr]
        if len(spec) > 2 and spec[2] == "norm": fr = [norm(f, T) for f in fr]
        sheet = Image.new("RGBA", (fw * len(fr), fw))
        for i, f in enumerate(fr):
            a = np.array(f); a[..., 3] = np.where(a[..., 3] > 90, 255, 0); sheet.alpha_composite(Image.fromarray(a), (i * fw, 0))
        sheet.save(os.path.join(O, f"{k}-{name}.png"))
    print(k, len(spec[0]), len(spec[1]))
