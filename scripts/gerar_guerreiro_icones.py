"""Ícones das técnicas novas do Guerreiro (p216.101) — PixelLab generate-image-v2 48×48 (o jogo usa 24×24).
Saída bruta: scripts/art-src/guerreiro-icones/<nome>.png"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/guerreiro-icones")
BASE = "square game skill icon, thick dark iron frame with thin gold trim, bold readable emblem in the centre, high contrast, pixel art, "
I = {
 "investida": BASE + "a knight's longsword thrusting forward with long white speed lines and dust behind it, steel blue background",
 "grito": BASE + "a roaring knight's closed great helm with orange shockwave rings bursting out of it, dark orange background",
 "redemoinho": BASE + "a longsword spinning in a full circle leaving a bright white circular slash trail, slate grey background",
 "fenda": BASE + "a longsword driven point-down into cracked earth with rocks and dust bursting up, brown background",
 "juizo": BASE + "a golden longsword making a huge wide arc slash with a radiant golden glow, a crown above, deep crimson background",
}
for k, d in I.items():
    p = os.path.join(D, k + ".png")
    if os.path.exists(p): continue
    images_of(job(post("/generate-image-v2", {"description": d, "image_size": {"width": 48, "height": 48}, "no_background": False})))[0].save(p); print(k, flush=True)
