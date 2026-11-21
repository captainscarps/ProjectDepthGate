"""Ícones das habilidades novas do Samurai e da katana (p216.100) — PixelLab generate-image-v2 (48×48 → 24×24 no build).
Saída bruta: scripts/art-src/samurai-foco/<nome>.png"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/samurai-foco")
BASE = "square game skill icon, thick dark navy frame with thin gold trim, bold readable emblem in the centre, high contrast, pixel art, "
I = {
 "kesa": BASE + "a single bright white diagonal katana slash arc cutting from top-left to bottom-right over a deep blue background, small sparks",
 "zanshin": BASE + "a calm glowing blue eye of focus above a vertical katana hilt, concentric light blue aura rings, dark teal background",
 "sennosen": BASE + "a katana blade raised horizontally blocking, a white star flash where an incoming strike is parried, steel grey background",
 "shippu": BASE + "a dashing katana blade with long white and cyan wind streaks speeding to the right, sky blue background",
 "sakura": BASE + "a spiral whirlwind of pink cherry blossom petals around a silver katana, dusk purple background",
 "muso": BASE + "many golden and white katana slashes crossing in a starburst, a faint red rising sun behind, crimson background",
}
for k, d in I.items():
    p = os.path.join(D, k + ".png")
    if os.path.exists(p): continue
    images_of(job(post("/generate-image-v2", {"description": d, "image_size": {"width": 48, "height": 48}, "no_background": False})))[0].save(p); print(k, flush=True)
p = os.path.join(D, "katana.png")
if not os.path.exists(p):
    images_of(job(post("/generate-image-v2", {"description": "a japanese katana in its black lacquered sheath with red cord wrapped hilt and gold tsuba, diagonal from bottom-left to top-right, game item icon, pixel art", "image_size": {"width": 32, "height": 32}, "no_background": True})))[0].save(p); print("katana")
