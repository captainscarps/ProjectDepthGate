"""Corrida nas 4 direções (frente, costas, diagonal de frente, diagonal de costas) para as variantes que só tinham o
andar (p216.142) — PixelLab transfer-outfit-v2.
Variantes: cabeça descoberta das 8 classes (nh-<classe>), Caçador de Dragão (dh), Saqueador, Vendaval e Ossário.
Para cada direção: referência = quadro parado do andar da própria variante naquela direção (<v>-dirs-<dir>.png),
quadros = corrida do herói base (scripts/art-src/<pasta do herói>/dirs2-<dir>-run.png, 192×192, 3 por pedido).
Saída: scripts/art-src/armaduras/<v>-dirs2-<dir>-run.png. Montagem: scripts/build_corrida_direcoes.py.
Uso: python3 scripts/gerar_corrida_direcoes.py [variante…]"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "scripts/art-src"); O = os.path.join(A, "armaduras"); F = 192
HERO = {"warrior": "cavaleiro", "archer": "arqueiro", "mage": "maga", "necromancer": "necromante", "druid": "druida", "rogue": "ladina", "berserker": "samurai", "hunter": "cacador"}
VAR = {**{f"nh-{c}": c for c in HERO}, "dh": "warrior", "saqueador": "warrior", "vendaval": "mage", "ossos": "necromancer"}
HINT = {"south": "front view, running toward the viewer", "north": "back view, running away from the viewer",
        "se": "three-quarter front view, running down-right", "ne": "three-quarter back view, running up-right away from the viewer"}
EXTRA = "keep exactly the same pose, motion, body position and weapons of each frame; only change the hair, face, clothes and armour to match the reference character"
def task(a):
    v, d = a
    dst = os.path.join(O, f"{v}-dirs2-{d}-run.png")
    if os.path.exists(dst): return f"{v} {d} já"
    ref = Image.open(os.path.join(O, f"{v}-dirs-{d}.png")).convert("RGBA").crop((0, 0, F, F))
    st = Image.open(os.path.join(A, HERO[VAR[v]], f"dirs2-{d}-run.png")).convert("RGBA"); n = st.width // F
    fr = [st.crop((i * F, 0, i * F + F, F)) for i in range(n)]; out = [None] * n
    for x in range(0, n, 3):
        y = min(n, x + 3); x0 = x if y - x >= 2 else y - 2
        r = job(post("/transfer-outfit-v2", {"reference_image": {"image": b64(ref), "size": {"width": F, "height": F}},
            "frames": [{"image": b64(f), "size": {"width": F, "height": F}} for f in fr[x0:y]], "image_size": {"width": F, "height": F},
            "no_background": True, "additional_instructions": HINT[d] + "; " + EXTRA, "seed": 7}))
        for i, im in zip(range(x0, y), images_of(r)): out[i] = im
    sh = Image.new("RGBA", (F * n, F))
    for i, im in enumerate(out): sh.paste(im if im is not None else fr[i], (i * F, 0))
    sh.save(dst); return f"{v} {d} {n}"
want = sys.argv[1:] or list(VAR)
jobs = [(v, d) for v in want for d in ("south", "north", "se", "ne")]
with ThreadPoolExecutor(8) as ex:
    for r in ex.map(task, jobs): print(r, flush=True)
