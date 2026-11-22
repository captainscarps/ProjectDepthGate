"""Texturas novas do chão do Refúgio (p216.107) — PixelLab generate-image-v2, 128×128, feitas para repetir sem emenda.
Saída: scripts/art-src/refugio-chao/<nome>.png (pula o que já existe). Uso: python3 scripts/gerar_refugio_chao.py [nome…]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/refugio-chao"); os.makedirs(D, exist_ok=True)
G = Image.open(os.path.join(ROOT, "assets/pixel-art/hub/village/ground.png")).convert("RGBA")
REF = {"grama": (40, 600, 168, 728), "praca": (360, 200, 488, 328), "areia": (60, 800, 188, 928), "mar": (100, 940, 228, 1068)}
T = {
 "grama": "seamless tileable top-down game ground texture of lush meadow grass: many small grass blade clumps in several greens, a few tiny clover leaves, subtle light and dark patches, no flowers, no objects, flat even lighting, pixel art",
 "grama2": "seamless tileable top-down game ground texture of meadow grass with tiny white and yellow wildflowers and clover scattered sparsely, small grass blade clumps, flat even lighting, pixel art",
 "praca": "seamless tileable top-down game ground texture of an old village cobblestone plaza: irregular rounded flagstones in warm beige and tan, thin dark gaps with a little moss, some cracked stones, flat even lighting, pixel art",
 "mar": "seamless tileable top-down game texture of calm deep blue sea water with small soft wave highlights and gentle ripples, flat even lighting, pixel art",
 "areia": "seamless tileable top-down game ground texture of warm beach sand with tiny pebbles, small shells and gentle wind ripples, flat even lighting, pixel art",
}
want = sys.argv[1:]
for k, desc in T.items():
    if want and k not in want: continue
    p = os.path.join(D, k + ".png")
    if os.path.exists(p): continue
    r = REF.get(k.rstrip("2"), REF["grama"]); ref = G.crop(r)
    body = {"description": desc, "image_size": {"width": 128, "height": 128}, "no_background": False,
            "style_image": {"image": b64(ref), "size": {"width": 128, "height": 128}}}
    images_of(job(post("/generate-image-v2", body)))[0].save(p); print(k, flush=True)
