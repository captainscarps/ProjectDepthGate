#!/usr/bin/env python3
"""Arqueiro novo (samurai) — PixelLab. Monta archer-pack-t0…t4-body.png e archer-pack-body.png no mapa de
archer-pack.json (55 quadros 128×128: caminhada 39-46 e corrida 47-54 com 8 quadros; 6-17 repetem as duas).
Fontes em scripts/art-src/arqueiro/ (quadros 192×192; o quadro 0 de cada folha é a imagem de entrada).
As direções (frente, costas, diagonais) saem de scripts/build_herois_dirs.py (archer-pack-dirs.png).
"""
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/arqueiro")
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
S, F = 128, 192
OLD_H, OLD_SCALE, OX = 70, .67, 59.3          # Arqueiro antigo: altura do corpo (sem o arco erguido), escala do pacote, x médio parado

def frames(name):
    im = Image.open(os.path.join(SRC, f"{name}.png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

def shrink(fr):
    a = np.array(fr.resize((S, S), Image.LANCZOS, reducing_gap=None))
    a[..., 3] = np.where(a[..., 3] >= 110, 255, 0); a[a[..., 3] == 0] = 0
    return Image.fromarray(a, "RGBA")

def pts(im):
    ys, xs = np.nonzero(np.array(im)[..., 3] > 0)
    return xs, ys

I, W, R, A, C, H, D = (frames(n) for n in ("idle", "walk", "run", "attack", "cast", "hurt", "death"))
seq = [
    I[1], I[3], I[5], I[7], I[2], I[6],                  # 0-3 parada · 4,5 idlevar
    W[1], W[2], W[3], W[5], W[6], W[7],                  # 6-11 (cópia da caminhada)
    R[3], R[4], R[5], R[6], R[7], R[8],                  # 12-17 (cópia da corrida)
    A[2], A[4], A[6], A[7], A[8],                        # 18 windupA 19 windup (puxa a corda) 20 hitA 21 hit (solta) 22 recovery
    A[2], A[2],                                          # 23 guardStart 24 guard (arco erguido)
    H[2], H[3], H[2], H[3],                              # 25-28 dano / atordoado
    R[4], R[5],                                          # 29 dashA 30 dash
    C[3], C[5], C[8],                                    # 31 castA 32 cast 33 castC (mira no alto e dispara a flecha brilhante)
    D[3], D[6], D[8],                                    # 34-36 morte
    I[1], I[1],                                          # 37 upA 38 upB
    *W[1:9],                                             # 39-46 caminhada (8)
    *R[1:9],                                             # 47-54 corrida (8)
]
assert len(seq) == 55
small = [shrink(f) for f in seq]
meta = json.load(open(os.path.join(OUT, "archer-pack.json")))
FOOT = meta["footY"]
xs, ys = pts(small[0])
dx, dy = round(OX - xs.mean()), FOOT - ys.max()
sheet = Image.new("RGBA", (S * 55, S))
torso, head = [], []
for i, fr in enumerate(small):
    c = Image.new("RGBA", (S, S)); c.paste(fr, (dx, dy), fr)
    sheet.alpha_composite(c, (i * S, 0))
    xs, ys = pts(c); top = ys.min()
    band = (ys >= top + 18) & (ys <= top + 34)
    head.append([round(float(xs[ys <= top + 10].mean()), 1), float(top + 7)])
    torso.append([round(float(xs[band].mean()), 1), round(float(ys[band].mean()), 1)])
for t in ("", "-t0", "-t1", "-t2", "-t3", "-t4"):
    sheet.save(os.path.join(OUT, f"archer-pack{t}-body.png"), optimize=True)
h0 = FOOT - head[0][1] + 7
k = round(OLD_H / h0, 3)
hx, hy = head[0]
meta.update(torso=torso, head=head, scale=round(OLD_SCALE * k, 3), hires=k, baseScale=OLD_SCALE, pcrop=[round(hx - 14), round(hy - 5), 28, 28])
json.dump(meta, open(os.path.join(OUT, "archer-pack.json"), "w"), separators=(",", ":"))
print("ok dx,dy", dx, dy, "scale", meta["scale"], "hires", k, "pcrop", meta["pcrop"])
