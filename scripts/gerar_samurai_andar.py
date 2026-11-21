"""Samurai: caminhada e corrida refeitas em todas as direções (p216.96) — PixelLab.
Poses paradas de cada direção: generate-8-rotations-v3 a partir do quadro parado de perfil (walk.png[0]) → v2/rot-*.png
(rot-7 frente, rot-3 costas, rot-6 diagonal de frente ↘, rot-4 diagonal de costas ↗). Perfil usa o próprio walk.png[0].
animate-pixminimax: perfil com 12 quadros (o jogo usa 6, um sim um não → ciclo uniforme), direções com 8 quadros.
Saída (substitui as fontes de build_samurai_pixellab.py e build_herois_dirs.py): walk.png, run.png e
dirs2-<dir>-walk/run.png em scripts/art-src/samurai/ (originais em scripts/art-src/samurai/v1/).
Uso: python3 scripts/gerar_samurai_andar.py [nome…]"""
import os, sys, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/samurai"); V1 = os.path.join(S, "v1"); V2 = os.path.join(S, "v2")
os.makedirs(V1, exist_ok=True)
SUBJ = "a samurai warrior in dark navy blue o-yoroi armour with gold trim, a kabuto helmet and a red menpo face mask, katana sheathed at his left hip"
WALK = "walking forward at a steady calm pace, natural alternating leg steps with clear foot lifts, arms swinging slightly, armour skirt plates bouncing gently, the katana stays sheathed at the left hip, no weapon drawn"
RUN = "running forward fast with long strides, body leaning forward, one hand steadying the sheathed katana at the hip, armour plates bouncing, no weapon drawn"
prof = Image.open(os.path.join(V1 if os.path.exists(os.path.join(V1, "walk.png")) else S, "walk.png")).convert("RGBA").crop((0, 0, 192, 192))
JOBS = {
 "walk": (prof, WALK, 12, "east", "standing in three-quarter view facing right"),
 "run": (prof, RUN, 12, "east", "standing in three-quarter view facing right"),
 "dirs2-south-walk": ("rot-7", WALK, 8, "south", "standing facing the viewer"),
 "dirs2-north-walk": ("rot-3", WALK, 8, "north", "standing with his back to the viewer"),
 "dirs2-se-walk": ("rot-6", WALK, 8, "south-east", "standing facing down-right"),
 "dirs2-ne-walk": ("rot-4", WALK, 8, "north-east", "standing facing up-right, back partly to the viewer"),
 "dirs2-south-run": ("rot-7", RUN, 8, "south", "standing facing the viewer"),
 "dirs2-north-run": ("rot-3", RUN, 8, "north", "standing with his back to the viewer"),
 "dirs2-se-run": ("rot-6", RUN, 8, "south-east", "standing facing down-right"),
 "dirs2-ne-run": ("rot-4", RUN, 8, "north-east", "standing facing up-right, back partly to the viewer"),
}
want = sys.argv[1:]
for name, (src, desc, n, dr, pose) in JOBS.items():
    if want and name not in want: continue
    dst = os.path.join(V2, name + ".png")
    if os.path.exists(dst): continue
    im = src if isinstance(src, Image.Image) else Image.open(os.path.join(V2, src + ".png")).convert("RGBA")
    fr = images_of(job(post("/animate-pixminimax", {"first_frame": b64(im), "description": desc, "frame_count": n, "no_background": True,
         "drift_threshold": 0, "direction": dr, "subject_description": SUBJ, "initial_pose": pose})))
    st = Image.new("RGBA", (192 * len(fr), 192))
    for i, f in enumerate(fr): st.paste(f, (i * 192, 0))
    st.save(dst); print(name, len(fr), flush=True)
