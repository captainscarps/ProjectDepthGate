"""
Arqueiro = Hayato, arqueiro oriental (irmão do samurai Akihiro).
Pacote "Archer" (128x128, mesma escala dos outros heróis) recolorido para
VERDE e PRATA: vermelhos/vinhos → verdes; laranjas/dourados → prata.

Uso: python3 scripts/build_kyudo_archer.py <pasta Archer>
"""
import colorsys
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
SRC = sys.argv[1]
FOOT, CX = 119, 62
ORDER = ["idle0", "idle1", "idle2", "idle3", "idlevar0", "idlevar1", "walk0", "walk1", "walk2", "walk3", "walk4", "walk5",
         "run0", "run1", "run2", "run3", "run4", "run5", "windupA", "windup", "hitA", "hit", "recovery", "guardStart", "guard",
         "hurt", "hurtB", "stunA", "stunB", "dashA", "dash", "castA", "cast", "castC", "deathA", "deathB", "deathC", "upA", "upB"]


def recolor_px(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    H = h * 360
    if s < .15:
        return r, g, b                                        # branco, preto, cinzas
    # pele (tons rosados pouco saturados e claros) fica igual
    if (H < 26 or H > 340) and s < .52 and v > .5:
        return r, g, b
    if H >= 290 or H < 14:                                    # vermelhos / vinhos → verde
        nh, ns, nv = 142, min(1, s * .62), v * .82
    elif H < 52:                                              # laranjas / dourados → prata
        nh, ns, nv = 210, .07 + s * .06, min(1, .25 + v * .78)
    else:
        return r, g, b
    rr, gg, bb = colorsys.hsv_to_rgb(nh / 360, ns, nv)
    return int(rr * 255), int(gg * 255), int(bb * 255)


def recolor(img):
    a = np.asarray(img).copy()
    cache = {}
    m = a[..., 3] > 0
    for y, x in zip(*np.nonzero(m)):
        c = tuple(int(v) for v in a[y, x, :3])
        if c not in cache:
            cache[c] = recolor_px(*c)
        a[y, x, :3] = cache[c]
    return Image.fromarray(a)


def strip(name):
    im = recolor(Image.open(os.path.join(SRC, name + ".png")).convert("RGBA"))
    return [im.crop((i * 128, 0, i * 128 + 128, 128)) for i in range(im.width // 128)]


A = {n: strip(n) for n in ["Idle", "Walk", "Run", "Shot", "Hurt", "Dead"]}
# deslocamento único (as folhas do artista já são alinhadas entre si)
ref = np.asarray(A["Idle"][0])[..., 3] > 0
ys, xs = np.nonzero(ref[90:120])
DX = round(CX - np.median(xs))
bottom = max(f.getbbox()[3] for f in A["Idle"])
DY = FOOT - bottom + 1


def place(f):
    o = Image.new("RGBA", (128, 128))
    o.alpha_composite(f, (DX, DY))
    return o


idle, walk, run, shot, hurt, dead = (A[n] for n in ["Idle", "Walk", "Run", "Shot", "Hurt", "Dead"])
pick = {
    "idle0": idle[0], "idle1": idle[2], "idle2": idle[4], "idle3": idle[6], "idlevar0": idle[1], "idlevar1": idle[5],
    **{f"walk{i}": walk[c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    **{f"run{i}": run[c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    "windupA": shot[2], "windup": shot[4], "hitA": shot[6], "hit": shot[7], "recovery": shot[11],
    "guardStart": shot[1], "guard": shot[3],
    "hurt": hurt[0], "hurtB": hurt[1], "stunA": hurt[1], "stunB": hurt[2],
    "dashA": run[2], "dash": run[5],
    "castA": shot[4], "cast": shot[6], "castC": shot[8],
    "deathA": dead[2], "deathB": dead[3], "deathC": dead[4],
    "upA": run[3], "upB": idle[0],
}
frames = [place(pick[k]) for k in ORDER]
EXTRA = len(frames)
frames += [place(f) for f in walk] + [place(f) for f in run]
top = min(f.getbbox()[1] for f in frames[EXTRA:EXTRA + 8])     # topo do chapéu (o arco em pé não conta)
h = FOOT - top
n = len(frames)
upd = {"scale": round(.69 * 68 / h, 3), "footY": FOOT, "bakedWeapon": True,
       "anchors": [[CX + 22, top + int(h * .42)]] * n, "torso": [[CX, top + int(h * .5)]] * n,
       "head": [[CX + 2, top + int(h * .14)]] * n}
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
        for k in ("hires", "pcrop", "walkFull", "runFull"):
            lay.pop(k, None)
        lay.update(upd)
        lay["map"]["walk"] = list(range(EXTRA, EXTRA + 8))
        lay["map"]["run"] = list(range(EXTRA + 8, EXTRA + 16))
        json.dump(lay, open(jp, "w"), separators=(",", ":"))
ar = recolor(Image.open(os.path.join(SRC, "Arrow.png")).convert("RGBA"))
ar = ar.crop(ar.getbbox())
ar.resize((ar.width // 2, max(3, ar.height // 2 + 1)), Image.NEAREST)\
  .save(os.path.join(ROOT, "assets", "pixel-art", "characters", "proj-elf-arrow.png"))
sheet.resize((sheet.width // 2, 64), Image.NEAREST).save(os.path.join(ROOT, "scripts", "kyudo_preview.png"))
print("hayato: altura", h, "escala", upd["scale"], "DX", DX, "DY", DY)
