"""
Necromante — monta a folha "pack" (39 quadros 128x128, mesmo mapa do jogo)
a partir do pacote enviado (necromante_novo).

Uso: python3 scripts/build_necro_sheet.py <pasta do pacote>
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
SRC = sys.argv[1]
FOOT, CX = 119, 62
ORDER = ["idle0", "idle1", "idle2", "idle3", "idlevar0", "idlevar1", "walk0", "walk1", "walk2", "walk3", "walk4", "walk5",
         "run0", "run1", "run2", "run3", "run4", "run5", "windupA", "windup", "hitA", "hit", "recovery", "guardStart", "guard",
         "hurt", "hurtB", "stunA", "stunB", "dashA", "dash", "castA", "cast", "castC", "deathA", "deathB", "deathC", "upA", "upB"]


def strip(name):
    im = Image.open(os.path.join(SRC, name + ".png")).convert("RGBA")
    out = []
    for i in range(im.width // 128):
        f = im.crop((i * 128, 0, i * 128 + 128, 128))
        # remove lascas do quadro vizinho coladas nas bordas laterais
        px = f.load()
        for x in list(range(0, 3)) + list(range(125, 128)):
            for y in range(128):
                px[x, y] = (0, 0, 0, 0)
        out.append(f)
    return out


A = {n: strip(n) for n in ["Idle", "Walk", "Run", "Attack_1", "Attack_2", "Charge_1", "Hurt", "Dead", "Jump"]}
ref = A["Idle"][0].getbbox()
body_cx = 62   # o corpo (sem o cajado) fica perto do centro da célula
pick = {
    "idle0": A["Idle"][0], "idle1": A["Idle"][2], "idle2": A["Idle"][4], "idle3": A["Idle"][6],
    "idlevar0": A["Idle"][1], "idlevar1": A["Idle"][5],
    **{f"walk{i}": A["Walk"][c] for i, c in enumerate([0, 1, 2, 3, 4, 5])},
    **{f"run{i}": A["Run"][c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    "windupA": A["Attack_1"][1], "windup": A["Attack_1"][2], "hitA": A["Attack_1"][3], "hit": A["Attack_1"][4],
    "recovery": A["Attack_1"][6], "guardStart": A["Charge_1"][1], "guard": A["Charge_1"][2],
    "hurt": A["Hurt"][1], "hurtB": A["Hurt"][2], "stunA": A["Hurt"][2], "stunB": A["Hurt"][3],
    "dashA": A["Jump"][3], "dash": A["Jump"][4],
    "castA": A["Attack_2"][3], "cast": A["Attack_2"][5], "castC": A["Attack_2"][7],
    "deathA": A["Dead"][1], "deathB": A["Dead"][2], "deathC": A["Dead"][3],
    "upA": A["Idle"][0], "upB": A["Idle"][1],
}
S = 68 / 118          # arte em alta resolução → reduz com filtro suave para a altura dos outros heróis
frames = []
for k in ORDER:
    art = pick[k].resize((round(128 * S), round(128 * S)), Image.LANCZOS)
    out = Image.new("RGBA", (128, 128))
    out.alpha_composite(art, (round(CX - body_cx * S), FOOT - art.height))
    frames.append(out)
top = min(f.getbbox()[1] for f in frames[:4])
h = FOOT - top
n = len(frames)
upd = {"scale": round(.697 * 66 / h, 3), "footY": FOOT - 1,
       "anchors": [[CX + 20, top + int(h * .42)]] * n, "torso": [[CX, top + int(h * .55)]] * n,
       "head": [[CX, top + int(h * .16)]] * n}
sheet = Image.new("RGBA", (128 * n, 128))
for i, f in enumerate(frames):
    sheet.alpha_composite(f, (i * 128, 0))
for o in OUTS:
    if not os.path.isdir(o):
        continue
    sheet.save(os.path.join(o, "necromancer-pack-body.png"))
    for t in range(5):
        sheet.save(os.path.join(o, f"necromancer-pack-t{t}-body.png"))
    jp = os.path.join(o, "necromancer-pack.json")
    if os.path.exists(jp):
        lay = json.load(open(jp))
        lay.update(upd)
        json.dump(lay, open(jp, "w"), separators=(",", ":"))
sheet.resize((sheet.width // 2, 64)).save(os.path.join(ROOT, "scripts", "necro_sheet_preview.png"))
print("necromante: altura", h, "escala", upd["scale"])
