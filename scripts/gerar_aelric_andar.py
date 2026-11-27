"""Aelric jovem (o Rei quando príncipe, Valdrak antiga): caminhada em todas as direções (p216.137) — PixelLab.
1) generate-8-rotations-v3 a partir do quadro de perfil de aelric-young-walk.png (olhando para a direita) → rot-<dir>.png
2) animate-pixminimax: andar em cada direção (perfil 12 quadros, as outras 8) → walk-<dir>.png (quadros 128×128)
Oeste/noroeste/sudoeste saem espelhando leste/nordeste/sudeste no build (scripts/build_aelric_andar.py).
Fontes em scripts/art-src/aelric-jovem/. Uso: python3 scripts/gerar_aelric_andar.py [etapa…]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/aelric-jovem"); os.makedirs(S, exist_ok=True)
F = 128
SUBJ = "a young teenage prince with short messy platinum blond hair, shirtless with light skin, dark baggy trousers, dark red boots, carrying a long thin wooden spear upright"
WALK = "walking at a steady calm pace, head and eyes facing the walking direction, natural alternating leg steps with clear foot lifts, free arm swinging gently, the other hand holding the spear upright, small body bob"
src = Image.open(os.path.join(ROOT, "assets/pixel-art/valdrak/aelric-young-walk.png")).convert("RGBA").crop((0, 0, F, F))
src.save(os.path.join(S, "ref-perfil.png"))
want = sys.argv[1:]
ORDER = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
if (not want or "rot" in want) and not os.path.exists(os.path.join(S, "pose-south.png")):
    r = job(post("/generate-8-rotations-v3", {"first_frame": b64(src), "first_frame_direction": "east", "description": SUBJ, "no_background": True}))
    ims = images_of(r)
    # a resposta veio girando a partir do leste: 0 leste, 1 nordeste, 3 costas, 5 oeste, 6 sudoeste, 7 frente
    os.makedirs(os.path.join(S, "raw"), exist_ok=True)
    for i, im in enumerate(ims): im.save(os.path.join(S, "raw", f"out{i}.png"))
    ims[7].save(os.path.join(S, "pose-south.png")); ims[3].save(os.path.join(S, "pose-north.png")); ims[1].save(os.path.join(S, "pose-north-east.png"))
    ImageOps.mirror(ims[6]).save(os.path.join(S, "pose-south-east.png")); ImageOps.mirror(ims[5]).save(os.path.join(S, "pose-east.png"))
POSE = {"east": "standing in side view facing right", "south": "standing facing the viewer", "north": "standing with his back to the viewer",
        "south-east": "standing facing down-right", "north-east": "standing facing up-right, back partly to the viewer"}
for d, n in [("east", 12), ("south", 8), ("north", 8), ("south-east", 8), ("north-east", 8)]:
    name = "walk-" + d
    if want and name not in want and "walk" not in want: continue
    dst = os.path.join(S, name + ".png")
    if os.path.exists(dst): continue
    im = Image.open(os.path.join(S, f"pose-{d}.png")).convert("RGBA")
    fr = images_of(job(post("/animate-pixminimax", {"first_frame": b64(im), "description": WALK, "frame_count": n, "no_background": True,
         "drift_threshold": 0, "direction": d, "subject_description": SUBJ, "initial_pose": POSE[d]})))
    w, h = fr[0].size
    st = Image.new("RGBA", (w * len(fr), h))
    for i, f in enumerate(fr): st.paste(f, (i * w, 0))
    st.save(dst); print(name, len(fr), fr[0].size, flush=True)
