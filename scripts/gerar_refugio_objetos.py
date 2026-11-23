"""Barraca do vendedor e santuário novos do Refúgio (p216.108) — PixelLab generate-image-v2 com o sprite antigo como
referência de estilo. Saída: scripts/art-src/refugio-objetos/<nome>.png (pula o que já existe)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/refugio-objetos"); os.makedirs(D, exist_ok=True)
HUB = os.path.join(ROOT, "assets/pixel-art/hub")
A = {
 "barraca": ("stall.png", 112, 96, "a cozy medieval village market stall seen from the front in 3/4 top-down RPG view: wooden frame with a red and cream striped cloth awning, a wooden counter displaying a short sword, a round shield, a few potion bottles, a coil of rope and small crates, a hanging lantern, a small wooden price sign, pixel art game prop, transparent background"),
 "santuario": ("shrine.png", 80, 96, "a small village stone shrine seen from the front in 3/4 top-down RPG view: carved grey stone arch with moss and ivy, a softly glowing pale golden statue of a kneeling guardian goddess in the alcove, lit candles and fresh flower offerings on the stone step, pixel art game prop, transparent background"),
}
want = sys.argv[1:]
for k, (ref, w, h, desc) in A.items():
    if want and k not in want: continue
    p = os.path.join(D, k + ".png")
    if os.path.exists(p): continue
    r = Image.open(os.path.join(HUB, ref)).convert("RGBA")
    body = {"description": desc, "image_size": {"width": w, "height": h}, "no_background": True,
            "reference_images": [{"image": b64(r), "size": {"width": r.width, "height": r.height}, "usage_description": "the same game object to redesign: keep its role and pixel art style, much more detailed"}]}
    images_of(job(post("/generate-image-v2", body)))[0].save(p); print(k, flush=True)
