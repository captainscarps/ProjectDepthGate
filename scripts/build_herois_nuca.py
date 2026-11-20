#!/usr/bin/env python3
"""Nuca de cada quadro dos heróis refeitos (onde a capa das armaduras raras/épicas/lendárias se prende).
Grava assets/pixel-art/characters/mods/<classe>-mods.json com {frames, dirs, sk}: uma lista [x, y] (ou null) por
quadro da folha de perfil, da folha de direções (-dirs) e da folha de golpes (-sk). Lido por hero-mods.js.
Topo da cabeça = 1ª linha com um trecho contínuo de 5+ pixels (ignora espada/arco/cajado finos acima da cabeça);
nuca = topo + 19% da altura do herói parado; x = meio do trecho mais largo nessa linha."""
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "assets/pixel-art/characters")
S = 128

def runs(row):
    out, st = [], None
    for x, v in enumerate(list(row) + [False]):
        if v and st is None: st = x
        if not v and st is not None: out.append((st, x)); st = None
    return out

def neck(a, H, S=S):
    for y in range(S):
        r = [q for q in runs(a[y]) if q[1] - q[0] >= 5]
        if r:
            ny = min(S - 1, y + round(.19 * H))
            rr = runs(a[ny]) or r
            b = max(rr, key=lambda q: q[1] - q[0])
            return [round((b[0] + b[1]) / 2), int(ny)]
    return None

def sheet(path, H, S=S):
    if not os.path.exists(path): return None
    im = np.array(Image.open(path).convert("RGBA"))[..., 3] > 0
    rows, cols = im.shape[0] // S, im.shape[1] // S
    return [(lambda n: {"neck": n} if n else None)(neck(im[r * S:(r + 1) * S, c * S:(c + 1) * S], H, S)) for r in range(rows) for c in range(cols)]

for cls in ["warrior", "berserker", "archer", "hunter", "druid", "necromancer", "mage", "rogue", "shaman"]:
    meta = json.load(open(os.path.join(CH, f"{cls}-pack.json")))
    if not meta.get("hires"): continue
    body = np.array(Image.open(os.path.join(CH, f"{cls}-pack-t0-body.png")).convert("RGBA"))[..., 3] > 0
    f0 = body[:, :S]; ys = np.nonzero(f0.any(axis=1))[0]
    H = meta["footY"] - ys.min()
    sk = f"{cls}-pack-t0-sk.png" if os.path.exists(os.path.join(CH, f"{cls}-pack-t0-sk.png")) else f"{cls}-pack-sk.png"
    dr = f"{cls}-pack-t0-dirs.png" if os.path.exists(os.path.join(CH, f"{cls}-pack-t0-dirs.png")) else f"{cls}-pack-dirs.png"
    out = {"frames": sheet(os.path.join(CH, f"{cls}-pack-t0-body.png"), H), "dirs": sheet(os.path.join(CH, dr), H),
           "sk": sheet(os.path.join(CH, sk), H), "hd": 1,
           # p216.51: pescando (quadros de 208; a cabeça descoberta e as armaduras únicas têm folha própria)
           "fish": sheet(os.path.join(CH, f"{cls}-fish.png"), H, 208),
           "fishv": {v: sheet(os.path.join(CH, f"{cls}-{'nh' if v == 'nh' else v}-fish.png"), H, 208) for v in ("nh", "ossos", "vendaval", "saqueador", "dh")
                     if os.path.exists(os.path.join(CH, f"{cls}-{v}-fish.png"))}}
    json.dump(out, open(os.path.join(CH, "mods", f"{cls}-mods.json"), "w"), separators=(",", ":"))
    print(cls, "H", H, "nuca parado", out["frames"][0])
