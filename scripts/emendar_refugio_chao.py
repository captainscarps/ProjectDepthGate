"""Deixa as texturas do chão do Refúgio realmente sem emenda (p216.107): tira a moldura de 2 px, desloca meia textura
(a costura vai para uma cruz no meio) e o PixelLab repinta só a cruz (inpaint-v3). Saída: <nome>-tile.png (124×124)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64, img
from PIL import Image, ImageChops, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/refugio-chao")
DESC = {"grama": "meadow grass blade clumps continuing the same grass texture", "grama2": "meadow grass with tiny wildflowers continuing the same texture",
        "praca": "irregular rounded cobblestones with thin dark gaps continuing the same paving", "areia": "warm beach sand with tiny pebbles continuing the same texture", "mar": "calm blue sea water with small wave highlights continuing the same texture"}
for k, desc in DESC.items():
    if sys.argv[1:] and k not in sys.argv[1:]: continue
    out = os.path.join(D, k + "-tile.png")
    if os.path.exists(out): continue
    t = Image.open(os.path.join(D, k + ".png")).convert("RGBA").crop((2, 2, 126, 126))
    W = t.width; h = W // 2
    r = ImageChops.offset(t, h, h)
    m = Image.new("RGBA", (W, W), (0, 0, 0, 255)); d = ImageDraw.Draw(m); bw = 9
    d.rectangle((h - bw, 0, h + bw - 1, W), fill=(255, 255, 255, 255)); d.rectangle((0, h - bw, W, h + bw - 1), fill=(255, 255, 255, 255))
    res = None
    for ep in ("/inpaint-v3", "/inpaint"):
        try:
            lr = job(post(ep, {"description": desc, "inpainting_image": {"image": b64(r), "size": {"width": W, "height": W}}, "mask_image": {"image": b64(m), "size": {"width": W, "height": W}}, "no_background": False}))
            res = [img(lr["image"])] if lr.get("image") else images_of(lr)
            break
        except SystemExit as e:
            print(ep, "falhou:", str(e)[:200])
    if not res: continue
    im = res[0].convert("RGBA").resize((W, W), Image.NEAREST) if res[0].size != (W, W) else res[0].convert("RGBA")
    # mantém exatamente o original fora da cruz (o modelo às vezes mexe um pouco no resto)
    keep = Image.composite(im, r, m.convert("L"))
    keep.save(out); print(k, "ok", res[0].size, flush=True)
