#!/usr/bin/env python3
"""Cavaleiro (Guerreiro) novo — PixelLab. Monta:
  • warrior-pack-t0-body.png … t4 (39 quadros 128×128, mesmo mapa de warrior-pack.json) e warrior-pack-body.png;
  • warrior-pack-t0-dirs.png … t4 (4 linhas × 9: frente, costas, diagonal de frente ↘, diagonal de costas ↗;
    coluna 0 parado, 1…8 caminhada) para scripts/source/hero-dirs.js.
Camadas da armadura (t1 Couro, t2 Aço Cobalto, t3 Arcano, t4 Dourado): o metal da arte nova é repintado na rampa de
cores de cada conjunto (as mesmas de scripts/generate_warrior_tiers.cjs), pela luz de cada pixel.

Fontes em scripts/art-src/cavaleiro/ (quadros 192×192, ou 128×128 no dirs-ne; o quadro 0 é a imagem de entrada).
A IA insiste em desenhar uma capa escura nos movimentos: decape() tira as manchas escuras grossas na borda da
silhueta (as sombras de dentro do corpo ficam).
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/cavaleiro")
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
S = 128
OLD_H, OLD_SCALE, OX = 64, .75, 63.0          # Guerreiro antigo: altura no quadro, escala do pacote, x médio parado

def frames(name):
    im = Image.open(os.path.join(SRC, f"{name}.png")).convert("RGBA")
    f = im.height
    return [im.crop((i * f, 0, i * f + f, f)) for i in range(im.width // f)]

def decape(fr, thr=48, it=2):
    a = np.array(fr.convert("RGBA")).astype(int)
    op = a[..., 3] > 0
    dark = op & (a[..., :3].max(axis=2) < thr)
    thick = ndimage.binary_dilation(ndimage.binary_opening(dark, iterations=it), iterations=1) & dark
    lab, n = ndimage.label(thick)
    sizes = ndimage.sum(thick, lab, range(1, n + 1))
    rm = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 25])
    orig = a.copy()
    a[rm, 3] = 0
    tr = a[..., 3] == 0                                   # buraco fechado dentro do corpo volta
    lab, n = ndimage.label(tr)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    hole = tr & ~np.isin(lab, list(border))
    a[hole] = orig[hole]
    op = a[..., 3] > 0                                    # sobras soltas
    lab, n = ndimage.label(op)
    if n > 1:
        sizes = ndimage.sum(op, lab, range(1, n + 1))
        a[np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s < 40]), 3] = 0
    return Image.fromarray(a.astype(np.uint8), "RGBA")

def shrink(fr):
    if fr.width != S:
        fr = fr.resize((S, S), Image.LANCZOS, reducing_gap=None)
    a = np.array(fr.convert("RGBA"))
    a[..., 3] = np.where(a[..., 3] >= 110, 255, 0)
    a[a[..., 3] == 0] = 0
    return Image.fromarray(a, "RGBA")

def bbox_pts(im):
    a = np.array(im)[..., 3] > 0
    ys, xs = np.nonzero(a)
    return xs, ys

# ── perfil (39 quadros) ─────────────────────────────────────────────────────────────────────────────────────
I = frames("idle")
W = frames("walk3")
R = [decape(f) for f in frames("run")]
K = [decape(f) for f in frames("attack3")]
G = frames("guard")
H = [decape(f) for f in frames("hurt")]
C = [decape(f) for f in frames("cast3")]
D = [decape(f) for f in frames("death")]
seq = [
    I[1], I[3], I[5], I[7], I[2], I[6],          # 0-3 parada · 4,5 idlevar
    W[1], W[2], W[3], W[5], W[6], W[7],          # 6-11 caminhada
    R[3], R[4], R[5], R[6], R[7], R[8],          # 12-17 corrida
    K[3], K[4], K[5], K[6], K[8],                # 18 windupA 19 windup 20 hitA 21 hit 22 recovery (espada por cima e golpe)
    G[2], G[3],                                  # 23 guardStart 24 guard (escudo na frente)
    H[2], H[3], H[2], H[3],                      # 25 hurt 26 hurtB 27 stunA 28 stunB
    R[4], R[5],                                  # 29 dashA 30 dash
    C[4], C[5], C[8],                            # 31 castA 32 cast 33 castC (ergue a espada e golpeia com força)
    D[5], D[7], D[8],                            # 34-36 morte
    I[1], I[1],                                  # 37 upA 38 upB (de costas fica com hero-dirs)
]
assert len(seq) == 39
# p216.34 — folha extra por camada (warrior-pack-t<n>-sk.png, 8 colunas × 7 linhas, para não estourar o tamanho
# máximo de textura do celular): linha 0 golpe básico fluido, 1… uma animação por habilidade. Lida por
# scripts/source/herois-skills.js pelo "sk" do json.
EXTRA = {"atk": [K[2], K[3], K[4], K[5], K[6], K[7], K[8], K[8]]}
for key in ("slam", "bash", "draw", "spin", "quake", "cry"):
    EXTRA[key] = [decape(f) for f in frames(f"sk-{key}")][1:9]
small = [shrink(f) for f in seq]
meta = json.load(open(os.path.join(OUT, "warrior-pack.json")))
FOOT = meta["footY"]
xs, ys = bbox_pts(small[0])
dx, dy = round(OX - xs.mean()), FOOT - ys.max()
body = Image.new("RGBA", (S * 39, S))
torso, head = [], []
for i, fr in enumerate(small):
    c = Image.new("RGBA", (S, S)); c.paste(fr, (dx, dy), fr)
    body.alpha_composite(c, (i * S, 0))
    xs, ys = bbox_pts(c)
    top = ys.min()
    hh = xs[ys <= top + 10]; band = (ys >= top + 18) & (ys <= top + 34)
    head.append([round(float(hh.mean()), 1), float(top + 7)])
    torso.append([round(float(xs[band].mean()), 1), round(float(ys[band].mean()), 1)])
h0 = FOOT - head[0][1] + 7
k = round(OLD_H / h0, 3)
meta.pop("atk", None); meta.pop("skills", None)
meta["sk"] = {"cols": 8, "rows": {k: r for r, k in enumerate(EXTRA)}}
sk = Image.new("RGBA", (S * 8, S * len(EXTRA)))
for r, fr in enumerate(EXTRA.values()):
    for kk, f in enumerate(fr):
        f = shrink(f); c = Image.new("RGBA", (S, S)); c.paste(f, (dx, dy), f)
        sk.alpha_composite(c, (kk * S, r * S))
meta.update(torso=torso, head=head, scale=round(OLD_SCALE * k, 3), hires=k, baseScale=OLD_SCALE,
            pcrop=[round(head[0][0] - 14), round(head[0][1] - 9), 28, 28])

# ── direções (frente, costas, ↘, ↗) ────────────────────────────────────────────────────────────────────────
def mid_foot(im):
    xs, ys = bbox_pts(im)
    top, bot = ys.min(), ys.max()
    band = (ys >= top + (bot - top) * .25) & (ys <= top + (bot - top) * .55)
    b = np.sort(xs[band])
    return (b[len(b) // 10] + b[-len(b) // 10 - 1]) / 2, bot, top

dirs = Image.new("RGBA", (S * 9, S * 4))
for r, name in enumerate(("south", "north", "se", "ne")):
    fr = [shrink(decape(f) if name == "se" else f) for f in frames(f"dirs-{name}")][:9]   # só a ↘ veio com capa
    mx, bot, top0 = mid_foot(fr[0])
    ddx, ddy = round(64 - mx), FOOT - bot
    for kk, f in enumerate(fr):
        a = np.array(f)
        a[: max(0, top0 - 1)] = 0                      # pluma/fumaça que a IA põe acima do elmo
        tip = a[: top0 + 6]                             # e o fiapo branco grudado no topo do elmo (o pelo fica mais embaixo)
        tip[(tip[..., :3].min(axis=2) > 200)] = 0
        f = Image.fromarray(a, "RGBA")
        c = Image.new("RGBA", (S, S)); c.paste(f, (ddx, ddy), f)
        dirs.alpha_composite(c, (kk * S, r * S))

# ── camadas da armadura ─────────────────────────────────────────────────────────────────────────────────────
PAL = {
    1: ["#e8b87d", "#d4a36a", "#be854d", "#9c6232", "#73431f", "#4e2a12", "#31190a"],   # Couro
    2: ["#e0f2fe", "#bae6fd", "#38bdf8", "#0284c7", "#0369a1", "#075985", "#082f49"],   # Aço Cobalto
    3: ["#a6f4ff", "#f0c8ff", "#d48eff", "#a850e6", "#6e28ad", "#451275", "#280a47"],   # Arcano
    4: ["#fffbe0", "#ffe680", "#ffd23f", "#e5a812", "#ab7305", "#734c00", "#472e00"],   # Dourado
}
STOPS = np.array([245, 223, 205, 170, 112, 80, 42], float)                             # luz do aço de cada degrau

def recolor(im, tier):
    a = np.array(im).astype(float)
    rgb = a[..., :3]; mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    L = rgb.mean(axis=2)
    metal = (a[..., 3] > 0) & (mx - mn < 48) & (rgb[..., 2] >= rgb[..., 0] - 4) & (mx > 40)   # aço frio (o pelo é quente)
    pal = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PAL[tier]], float)
    x = np.clip(L, STOPS[-1], STOPS[0])
    out = np.zeros_like(rgb)
    for c in range(3):
        out[..., c] = np.interp(-x, -STOPS, pal[:, c])
    rgb[metal] = out[metal]
    a[..., :3] = rgb
    return Image.fromarray(a.astype(np.uint8), "RGBA")

for t in range(5):
    b = body if t == 0 else recolor(body, t)
    d = dirs if t == 0 else recolor(dirs, t)
    (sk if t == 0 else recolor(sk, t)).save(os.path.join(OUT, f"warrior-pack-t{t}-sk.png"), optimize=True)
    b.save(os.path.join(OUT, f"warrior-pack-t{t}-body.png"), optimize=True)
    d.save(os.path.join(OUT, f"warrior-pack-t{t}-dirs.png"), optimize=True)
    if t == 0:
        b.save(os.path.join(OUT, "warrior-pack-body.png"), optimize=True)
json.dump(meta, open(os.path.join(OUT, "warrior-pack.json"), "w"), separators=(",", ":"))
print("ok dx,dy", dx, dy, "scale", meta["scale"], "hires", k, "pcrop", meta["pcrop"])
