"""
Arqueiro e Ladina — monta as folhas "pack" (39 quadros 128x128, mesmo mapa do jogo)
a partir dos pacotes enviados (ArcherHero / Ladino).

Uso: python3 scripts/build_hero_sheets.py <pasta ArcherHero/Final> <pasta Ladino>
Grava archer-pack*.png / rogue-pack*.png (base + t0..t4) e atualiza os .json.
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
ARCH, ROG = sys.argv[1], sys.argv[2]
FOOT = 119          # linha logo abaixo dos pés
CX = 62             # centro do corpo no quadro de 128
ORDER = ["idle0", "idle1", "idle2", "idle3", "idlevar0", "idlevar1", "walk0", "walk1", "walk2", "walk3", "walk4", "walk5",
         "run0", "run1", "run2", "run3", "run4", "run5", "windupA", "windup", "hitA", "hit", "recovery", "guardStart", "guard",
         "hurt", "hurtB", "stunA", "stunB", "dashA", "dash", "castA", "cast", "castC", "deathA", "deathB", "deathC", "upA", "upB"]


def cells(path, cw, y0=0):
    im = Image.open(path).convert("RGBA")
    g = {}
    for r in range(im.height // cw):
        for c in range(im.width // cw):
            f = im.crop((c * cw, r * cw + y0, c * cw + cw, r * cw + cw))
            if f.getbbox():
                g[(r, c)] = f
    return g


def frame(art, body_cx, body_bottom, k=1):
    """coloca a arte num quadro 128 com os pés em FOOT e o corpo em CX"""
    if k != 1:
        art = art.resize((art.width * k, art.height * k), Image.NEAREST)
    out = Image.new("RGBA", (128, 128))
    out.alpha_composite(art, (round(CX - body_cx * k), FOOT - body_bottom * k))
    return out


def fallen(art, deg):
    """quadro de queda: gira a pose em torno dos pés"""
    bb = art.getbbox()
    big = Image.new("RGBA", (256, 256))
    big.alpha_composite(art, (128 - (bb[0] + bb[2]) // 2, 200 - bb[3]))
    big = big.rotate(deg, resample=Image.NEAREST, center=(128, 200))
    bb2 = big.getbbox()
    out = Image.new("RGBA", (128, 128))
    out.alpha_composite(big.crop(bb2), (CX - (bb2[2] - bb2[0]) // 2, FOOT - (bb2[3] - bb2[1])))
    return out


def save(name, frames, layout_update):
    sheet = Image.new("RGBA", (128 * len(frames), 128))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (i * 128, 0))
    for o in OUTS:
        if not os.path.isdir(o):
            continue
        sheet.save(os.path.join(o, f"{name}-pack-body.png"))
        for t in range(5):
            sheet.save(os.path.join(o, f"{name}-pack-t{t}-body.png"))
        jp = os.path.join(o, f"{name}-pack.json")
        if os.path.exists(jp):
            lay = json.load(open(jp))
            lay.update(layout_update)
            json.dump(lay, open(jp, "w"), separators=(",", ":"))
    return sheet


# ═══════════════════════════ Arqueiro ════════════════════════════════════
A = {n: cells(os.path.join(ARCH, n + ".png"), 64, 0) for n in
     ["Idle and running", "Normal Attack", "High Attack", "Low attack", "Dash", "death"]}
# limpa as letras das legendas que vazam no topo de alguns quadros
for g in A.values():
    for key, f in g.items():
        px = f.load()
        for y in range(0, 6):
            for x in range(64):
                px[x, y] = (0, 0, 0, 0)
idle_a = A["Idle and running"]
BCX, BB = 36, 53      # centro do corpo / base dos pés na célula de 64
K = 2
pick = {
    "idle0": idle_a[(0, 0)], "idle1": idle_a[(0, 0)], "idle2": idle_a[(0, 1)], "idle3": idle_a[(0, 1)],
    "idlevar0": idle_a[(0, 1)], "idlevar1": idle_a[(0, 0)],
    **{f"walk{i}": idle_a[(1, c)] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    **{f"run{i}": idle_a[(1, c)] for i, c in enumerate([1, 2, 3, 5, 6, 7])},
    "windupA": A["Normal Attack"][(0, 2)], "windup": A["Normal Attack"][(0, 4)], "hitA": A["Normal Attack"][(0, 5)],
    "hit": A["Normal Attack"][(0, 6)], "recovery": A["Normal Attack"][(1, 2)],
    "guardStart": A["Low attack"][(1, 1)], "guard": A["Low attack"][(1, 2)],
    "hurt": A["death"][(1, 1)], "hurtB": A["death"][(1, 2)], "stunA": A["death"][(1, 3)], "stunB": A["death"][(1, 4)],
    "dashA": A["Dash"][(1, 1)], "dash": A["Dash"][(1, 3)],
    "castA": A["High Attack"][(1, 3)], "cast": A["High Attack"][(1, 5)], "castC": A["High Attack"][(1, 7)],
    "deathA": A["death"][(1, 6)], "deathB": A["death"][(1, 7)], "deathC": A["death"][(2, 1)],
    "upA": idle_a[(0, 0)], "upB": idle_a[(0, 1)],
}
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enhance_pixel_sprite import enhance  # noqa: E402
_cache = {}
af = []
for k in ORDER:
    key = id(pick[k])
    _cache.setdefault(key, enhance(pick[k]))
    af.append(frame(_cache[key], BCX * K, BB * K, 1))
top = min(f.getbbox()[1] for f in af[:4])
h = FOOT - top
n = len(af)
save("archer", af, {"scale": round(.69 * 68 / h, 3), "footY": FOOT - 1,
                    "anchors": [[CX + 22, top + int(h * .42)]] * n, "torso": [[CX, top + int(h * .55)]] * n,
                    "head": [[CX, top + int(h * .18)]] * n})
print("arqueiro: altura", h)

# ═══════════════════════════ Ladina ══════════════════════════════════════
R = {n: cells(os.path.join(ROG, n + ".png"), 128) for n in ["Dialogue", "Run", "Attack", "Special Attack"]}
dl, rn, at, sp = (R[n] for n in ["Dialogue", "Run", "Attack", "Special Attack"])
RCX, RB = 64, 128
pick = {
    "idle0": dl[(0, 0)], "idle1": dl[(0, 1)], "idle2": dl[(0, 2)], "idle3": dl[(0, 3)],
    "idlevar0": dl[(0, 0)], "idlevar1": dl[(0, 2)],
    **{f"walk{i}": rn[(0, c)] for i, c in enumerate([0, 2, 4, 6, 8, 10])},
    **{f"run{i}": rn[(0, c)] for i, c in enumerate([1, 3, 5, 7, 9, 11])},
    "windupA": at[(0, 0)], "windup": at[(0, 1)], "hitA": at[(0, 2)], "hit": at[(0, 2)], "recovery": at[(0, 3)],
    "guardStart": dl[(0, 0)], "guard": dl[(0, 1)],
    "dashA": rn[(0, 2)], "dash": rn[(0, 3)],
    "castA": sp[(0, 1)], "cast": sp[(0, 2)], "castC": sp[(0, 3)],
    "upA": dl[(0, 0)], "upB": dl[(0, 1)],
}
rf = []
for k in ORDER:
    if k in pick:
        rf.append(frame(pick[k], RCX, RB))
    elif k in ("hurt", "hurtB", "stunA", "stunB"):
        rf.append(fallen(frame(dl[(0, 0)], RCX, RB), {"hurt": 8, "hurtB": 12, "stunA": -6, "stunB": 6}[k]))
    else:  # morte: cai para trás
        rf.append(fallen(frame(dl[(0, 0)], RCX, RB), {"deathA": 35, "deathB": 70, "deathC": 90}[k]))
top = min(f.getbbox()[1] for f in rf[:4])
h = FOOT - top
n = len(rf)
save("rogue", rf, {"scale": round(.69 * 68 / h, 3), "footY": FOOT - 1,
                   "anchors": [[CX + 16, top + int(h * .5)]] * n, "torso": [[CX, top + int(h * .5)]] * n,
                   "head": [[CX, top + int(h * .15)]] * n})
print("ladina: altura", h)
prev = Image.new("RGBA", (39 * 128, 256), (60, 80, 100, 255))
for i, f in enumerate(af):
    prev.alpha_composite(f, (i * 128, 0))
for i, f in enumerate(rf):
    prev.alpha_composite(f, (i * 128, 128))
prev.save(os.path.join(ROOT, "scripts", "hero_sheets_preview.png"))
