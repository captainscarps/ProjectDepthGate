"""Barco do prólogo em 16 direções (p216.140/141) — PixelLab. Herói da classe remando, vista de cima inclinada.
1) poses (etapa "poses"), em scripts/art-src/barco/v16/<classe>/: s-128 (linha "s" do barco antigo reduzida a 128,
   o limite do /rotate), rot-22 (a mesma girada −22°), A-0…7 e B-0…7 (generate-8-rotations-v3 a partir de s-128 e de
   rot-22) e N22 (B-4 girado +22°). As rotações automáticas não caem exatamente nos ângulos pedidos: as poses de cada
   direção são escolhidas a olho (POSES abaixo).
2) remada: animate-pixminimax com 12 quadros em cada uma das 9 direções desenhadas (e, ese, se, sse, s, ene, ne, nne, n);
   o oeste é o espelho no jogo. Saída: scripts/art-src/barco/v16/<classe>-<dir>.png (quadro 0 = parado).
Uso: python3 scripts/gerar_barco16.py poses|remada [classe…]"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64, img
from PIL import Image
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, "scripts/art-src/barco/v16"); OLD = os.path.join(ROOT, "assets/pixel-art/barco"); F = 128
SUBJ = {"warrior": "a knight in steel plate armour with a white fur collar", "archer": "a samurai archer in green and silver armour with a kabuto helmet",
        "mage": "a sorceress in a dark purple hooded robe with crimson cloth", "necromancer": "a skeletal necromancer in a dark brown hooded robe",
        "druid": "a druid in a green hooded leaf cloak with small antlers", "shaman": "a tribal shaman woman with a long black ponytail, tanned skin and a green outfit",
        "rogue": "a hooded rogue woman in brown leather clothes", "berserker": "a samurai in dark navy blue armour with a kabuto helmet and a red face mask",
        "hunter": "a hunter with a straw conical hat and an orange fur coat"}
DIRS = ["e", "ese", "se", "sse", "s", "ene", "ne", "nne", "n"]
_P = dict(e="B-2", ese="A-2", se="B-1", sse="A-1", s="A-0", ene="A-3", ne="B-3", nne="N22", n="B-4")
POSES = {"warrior": dict(e="B-2", ese="A-2", se="B-1", sse="B-0", s="A-0", ene="A-3", ne="B-3", nne="N22", n="B-4"),
         "archer": {**_P, "ese": "B-1", "se": "A-2", "nne": "N22m", "n": "N22"},     # N22m = B-4 girado −22° e espelhado
         "mage": {**_P, "nne": "N22m"}, **{c: dict(_P) for c in ("necromancer", "druid", "shaman", "rogue", "berserker", "hunter")}}
NAT = dict(e="east", se="south-east", s="south", ne="north-east", n="north")
ROW = ("rowing the boat with both oars in a smooth steady rhythm: the oar blades dip into the water, pull back, lift out and swing forward again, "
       "the rower leans forward and back with each stroke, the boat itself keeps the same heading and position")
def rot(src, dc):
    r = job(post("/rotate", {"image_size": {"width": F, "height": F}, "from_image": b64(src), "from_view": "high top-down", "to_view": "high top-down", "direction_change": dc}))
    return img(r["image"])
def v3(src, c, tag):
    r = job(post("/generate-8-rotations-v3", {"first_frame": b64(src), "first_frame_direction": "south", "no_background": True, "seed": 3,
             "description": f"a small wooden rowing boat seen from a high top-down view, {SUBJ[c]} sits in the middle holding two wooden oars"}))
    for i, im in enumerate(images_of(r)): im.save(os.path.join(V, c, f"{tag}-{i}.png"))
def poses(c):
    D = os.path.join(V, c); os.makedirs(D, exist_ok=True); P = lambda n: os.path.join(D, n + ".png")
    if not os.path.exists(P("s-128")):
        s = Image.open(os.path.join(OLD, f"barco-{c}.png")).convert("RGBA").crop((0, 2 * 168, 168, 3 * 168)).resize((F, F), Image.LANCZOS)
        a = np.array(s); a[..., 3] = np.where(a[..., 3] > 100, 255, 0); Image.fromarray(a).save(P("s-128"))
    os.path.exists(P("rot-22")) or rot(P("s-128"), -22).save(P("rot-22"))
    os.path.exists(P("A-7")) or v3(P("s-128"), c, "A")
    os.path.exists(P("B-7")) or v3(P("rot-22"), c, "B")
    os.path.exists(P("N22")) or rot(P("B-4"), 22).save(P("N22"))
    return c + " poses"
def remada(c):
    out = []
    for d in DIRS:
        dst = os.path.join(V, f"{c}-{d}.png")
        if os.path.exists(dst): continue
        body = {"first_frame": b64(os.path.join(V, c, POSES[c][d] + ".png")), "description": ROW, "frame_count": 12, "no_background": True,
                "drift_threshold": 0, "subject_description": SUBJ[c] + " sitting in a small wooden rowing boat", "view": "high top-down"}
        if d in NAT: body["direction"] = NAT[d]
        fr = images_of(job(post("/animate-pixminimax", body)))
        st = Image.new("RGBA", (F * len(fr), F))
        for i, f in enumerate(fr): st.paste(f, (i * F, 0))
        st.save(dst); out.append(d)
    return f"{c} remada {out}"
if __name__ == "__main__":
    etapa, cls = sys.argv[1], sys.argv[2:] or list(SUBJ)
    with ThreadPoolExecutor(8) as ex:
        for r in ex.map(poses if etapa == "poses" else remada, cls): print(r, flush=True)
