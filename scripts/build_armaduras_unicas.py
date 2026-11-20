#!/usr/bin/env python3
"""Armaduras únicas refeitas sobre a arte nova dos heróis (p216.41) — PixelLab.
Para cada armadura monta, no mesmo esquema do herói (mesmo mapa de quadros, mesmo pé, mesmo tamanho no jogo):
  <classe>-<nome>-body.png   perfil (39 quadros, mapa do <classe>-pack.json)
  <classe>-<nome>-dirs.png   frente / costas / diagonal de frente / diagonal de costas (4 × 9)
  <classe>-<nome>-sk.png     golpe e habilidades, nas MESMAS linhas da folha "sk" do herói
  …-glow.png                 brilho (olhos e gema do Ossário, bordado do Vendaval) para cada uma das três folhas
Fontes: scripts/art-src/armaduras/<nome>-*.png (quadros 192×192; o quadro 0 é a imagem de entrada).
Quadros em que a IA tingiu o corpo todo viram o anterior; a capa escura que a IA inventa no Caçador de Dragão sai."""
import colorsys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/armaduras")
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
S, F = 128, 192
E8 = [2, 3, 4, 5, 6, 7, 8, 8]
WAR_SK = {"atk": "attack", "slam": "sk-slam", "bash": "sk-bash", "draw": "sk-draw", "spin": "sk-spin", "quake": "sk-quake", "cry": "sk-cry"}
ARM = {
    "ossos": ("necromancer", {"atk": "attack", "cast": "cast", "summon": "sk-summon", "reap": "sk-reap", "armor": "sk-armor"},
              lambda h, s, v: (250 <= h <= 310 and s > .35 and v > .6)),                       # olhos e gema roxos
    "vendaval": ("mage", {"atk": "attack", "cast": "cast", "bolt": "sk-bolt", "nova": "sk-nova", "ice": "sk-ice"},
                 lambda h, s, v: (32 <= h <= 56 and s > .35 and v > .62)),                      # bordado dourado
    "saqueador": ("warrior", WAR_SK, None),
    "dh": ("warrior", WAR_SK, None),
    "templario": ("warrior", WAR_SK, None),                                            # p216.52: Armadura do Templário
    "penas": ("shaman", {"atk": "attack", "cast": "cast"}, None),                      # p216.53: Vestes da Pena Sagrada (Araí)
    "esmeralda": ("rogue", {"atk": "attack", "cast": "cast"}, None),                   # p216.57: Sedas de Esmeralda (Ladina)
    "oni": ("berserker", {"atk": "attack", "cast": "cast"}, None),                     # p216.59: Armadura do Oni (Samurai)
    "ronin": ("berserker", {"atk": "attack", "cast": "cast"}, None),                   # p216.60: Armadura do Ronin (Samurai)
    "corvo": ("druid", {"atk": "attack", "cast": "cast"}, None),                       # p216.61: Manto do Corvo-Lobo (Druida)
    "selvagem": ("druid", {"atk": "attack", "cast": "cast"}, None),                    # p216.62: Pintura de Guerra Selvagem (Druida)
    "urso": ("druid", {"atk": "attack", "cast": "cast"}, None),                        # p216.63: Forma de Urso Pardo (Druida) — habilidades usam o rugido
}
DECAPE = {"nh-warrior"}                            # (o preto da armadura do Caçador de Dragão confundia o filtro de capa)
FLOAT = {"saqueador"}                       # nas direções a IA deixou uma espada solta flutuando acima da cabeça

def solid(im):
    a = np.array(im); op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n < 2: return im
    sz = ndimage.sum(op, lab, range(1, n + 1)); big = sz.max()
    a[~np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= big * .2])] = 0
    return Image.fromarray(a, "RGBA")

def dust(im, small=30):
    """p216.54b: pontinhos soltos (sujeira da IA) somem"""
    a = np.array(im); op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n < 2: return im
    sz = ndimage.sum(op, lab, range(1, n + 1))
    a[np.isin(lab, [i + 1 for i, s in enumerate(sz) if s < small])] = 0
    return Image.fromarray(a, "RGBA")

def frames(name, key):
    im = Image.open(os.path.join(SRC, f"{name}-{key}.png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

def decape(fr, thr=40):
    a = np.array(fr).astype(int); op = a[..., 3] > 0
    dark = op & (a[..., :3].max(axis=2) < thr)
    thick = ndimage.binary_dilation(ndimage.binary_opening(dark, iterations=2), iterations=1) & dark
    lab, n = ndimage.label(thick); sz = ndimage.sum(thick, lab, range(1, n + 1))
    rm = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s >= 25]); orig = a.copy(); a[rm, 3] = 0
    tr = a[..., 3] == 0; lab, n = ndimage.label(tr)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    hole = tr & ~np.isin(lab, list(border)); a[hole] = orig[hole]
    # p216.54b: só sai o escuro que fica FORA do contorno do corpo (capa pendurada); o que está dentro do contorno
    # fechado do corpo (couraça escura de costas, sombra entre escudo e perna) volta — sem buracos transparentes
    body = (a[..., 3] > 0)
    hull = ndimage.binary_fill_holes(ndimage.binary_closing(np.pad(body, 8), structure=np.ones((3, 3)), iterations=4))[8:-8, 8:-8]
    back = rm & hull & (orig[..., 3] > 0); a[back] = orig[back]
    return Image.fromarray(a.astype(np.uint8), "RGBA")

def shrink(fr, size):
    a = np.array(fr.resize((size, size), Image.LANCZOS, reducing_gap=None))
    a[..., 3] = np.where(a[..., 3] >= 110, 255, 0); a[a[..., 3] == 0] = 0
    return Image.fromarray(a, "RGBA")

def mean_col(im):
    a = np.array(im).astype(float); m = a[..., 3] > 0
    return a[..., :3][m].mean(axis=0) if m.any() else np.zeros(3)

def bbox(im):
    ys, xs = np.nonzero(np.array(im)[..., 3] > 0)
    return xs, ys

def glow_of(im, test):
    a = np.array(im); g = np.zeros_like(a)
    for y, x in zip(*np.nonzero(a[..., 3] > 0)):
        r, gg, b = a[y, x, :3] / 255.
        h, s, v = colorsys.rgb_to_hsv(r, gg, b)
        if test(h * 360, s, v): g[y, x] = a[y, x]
    return Image.fromarray(g, "RGBA")

def save(img, name, test):
    img.save(os.path.join(OUT, name + ".png"), optimize=True)
    if test: glow_of(img, test).save(os.path.join(OUT, name + "-glow.png"), optimize=True)

# p216.42: cabeça descoberta das armaduras lendárias — versão sem capacete/capuz de cada herói refeito
# (fontes nh-<classe>-*.png; saída <classe>-nh-body/-dirs/-sk; as linhas de golpes saem de "sk-<linha>")
import sys
for c in ["warrior", "berserker", "archer", "hunter", "druid", "necromancer", "mage", "rogue"]:
    ARM["nh-" + c] = (c, None, None)
ONLY = sys.argv[1:]
for nm, (cls, skrows, gtest) in ARM.items():
    if ONLY and not any(nm.startswith(o) for o in ONLY): continue
    if not os.path.exists(os.path.join(SRC, f"{nm}-idle.png")): continue
    out = f"{cls}-nh" if nm.startswith("nh-") else f"{cls}-{nm}"
    skrows = skrows or {"atk": "attack", "cast": "cast"}
    meta = json.load(open(os.path.join(OUT, f"{cls}-pack.json")))
    FOOT, MAP = meta["footY"], meta["map"]
    hero0 = Image.open(os.path.join(OUT, f"{cls}-pack-t0-body.png")).convert("RGBA").crop((0, 0, S, S))
    hx, hy = bbox(hero0); HH, OX = hy.max() - hy.min(), hx.mean()
    ref = frames(nm, "idle")[0]
    # <nome>-ref.png: a imagem do herói que a IA repintou (mesmo tamanho e lugar) — mede por ela quando a roupa
    # nova muda o contorno (o cocar de penas da Araí deixaria a heroína menor)
    rp = os.path.join(SRC, f"{nm}-ref.png"); meas = Image.open(rp).convert("RGBA").crop((0, 0, F, F)) if os.path.exists(rp) else ref
    r0 = shrink(meas, S); rx, ry = bbox(r0)
    size = round(S * HH / (ry.max() - ry.min()))                       # mesmo tamanho do herói parado
    base = mean_col(shrink(ref, size))
    def prep(fr, prev):
        f = shrink(decape(fr) if nm in DECAPE else fr, size)
        if prev is not None and np.abs(mean_col(f) - base).max() > 40: return prev
        return dust(f)
    def place(f, dx, dy):
        c = Image.new("RGBA", (S, S)); c.paste(f, (dx, dy), f); return c
    p0 = prep(ref, None); px_, py_ = bbox(shrink(meas, size))
    DX, DY = round(OX - px_.mean()), FOOT - py_.max()
    # ── perfil: mesmo mapa do herói ──
    I, W, R, K, C, H, D = (frames(nm, k) for k in ("idle", "walk", "run", "attack", "cast", "hurt", "death"))
    pick = {"idle": [I[1], I[3], I[5], I[7]], "idlevar": [I[2], I[6]], "walk": W[1:9] if len(MAP["walk"]) == 8 else [W[1], W[2], W[3], W[5], W[6], W[7]],
            "run": R[1:9] if len(MAP["run"]) == 8 else [R[3], R[4], R[5], R[6], R[7], R[8]], "windupA": K[2], "windup": K[3], "hitA": K[4], "hit": K[5], "recovery": K[7],
            "guardStart": K[2], "guard": K[2], "hurt": H[3], "hurtB": H[4], "stunA": H[3], "stunB": H[4], "dashA": R[4], "dash": R[5],
            "castA": C[3], "cast": C[5], "castC": C[7], "deathA": D[4], "deathB": D[7], "deathC": D[8], "upA": I[1], "upB": I[1]}
    n = max(max(v) if isinstance(v, list) else v for v in MAP.values()) + 1
    body = Image.new("RGBA", (S * n, S)); prev = None
    for k, idx in MAP.items():
        src = pick.get(k); idx = idx if isinstance(idx, list) else [idx]
        if src is None: continue
        src = src if isinstance(src, list) else [src] * len(idx)
        for i, fr in zip(idx, src):
            prev = prep(fr, prev); body.alpha_composite(place(prev, DX, DY), (i * S, 0))
    save(body, f"{out}-body", gtest)
    # ── direções (p216.52: com <nome>-dirs2-<dir>-walk/-run.png saem 8 linhas — 4 andando e 4 correndo) ──
    two = os.path.exists(os.path.join(SRC, f"{nm}-dirs2-south-walk.png"))
    seqs = []
    for d in ("south", "north", "se", "ne"):
        seqs.append(frames(nm, f"dirs2-{d}-walk")[:9] if two else frames(nm, f"dirs-{d}")[:9])
    if two:
        for d in ("south", "north", "se", "ne"):
            w = frames(nm, f"dirs2-{d}-walk"); seqs.append([w[0]] + frames(nm, f"dirs2-{d}-run")[1:9])
    dirs = Image.new("RGBA", (S * 9, S * len(seqs)))
    for r, fr in enumerate(seqs):
        prev = None
        f0 = prep(fr[0], None); fx, fy = bbox(f0)
        top = fy.min(); band = fx[(fy >= top + (fy.max() - top) * .25) & (fy <= top + (fy.max() - top) * .55)]; band.sort()
        mid = (band[len(band) // 10] + band[-len(band) // 10 - 1]) / 2
        dx, dy = round(64 - mid), FOOT - fy.max()
        for kk, f in enumerate(fr):
            prev = prep(f, prev); dirs.alpha_composite(place(solid(prev) if nm in FLOAT else prev, dx, dy), (kk * S, r * S))
    save(dirs, f"{out}-dirs", gtest)
    # ── golpes e habilidades: nas linhas da folha sk do herói ──
    rows = meta["sk"]["rows"]
    sk = Image.new("RGBA", (S * 8, S * len(rows)))
    for key, r in rows.items():
        src = skrows.get(key) or (f"sk-{key}" if os.path.exists(os.path.join(SRC, f"{nm}-sk-{key}.png")) else "cast")
        fr = frames(nm, src); prev = p0
        for kk, i in enumerate(E8):
            prev = prep(fr[min(i, len(fr) - 1)], prev); sk.alpha_composite(place(prev, DX, DY), (kk * S, r * S))
    save(sk, f"{out}-sk", gtest)
    print(nm, "tamanho", size, "dx,dy", DX, DY, "linhas sk", list(rows))
