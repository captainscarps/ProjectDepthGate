"""Titã de Magma: variante do Golem de Lava com corpo de obsidiana azulada e fissuras de magma dourado-branco."""
import colorsys, os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = os.path.join(ROOT, "assets", "pixel-art", "bosses")
im = Image.open(os.path.join(B, "boss-lava-golem.png")).convert("RGBA")
a = np.asarray(im).astype(np.float32) / 255
rgb = a[..., :3]
mx, mn = rgb.max(-1), rgb.min(-1)
s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
out = rgb.copy()
hot = (s > .45) & (mx > .45) & (rgb[..., 0] >= rgb[..., 2])          # magma
body = ~hot & (a[..., 3] > 0)
# corpo: obsidiana azulada, mais escura
lum = rgb.mean(-1, keepdims=True)
out[body] = (lum[body] * np.array([.78, .86, 1.12]) * .9)
# fissuras: mais quentes (amarelo → branco)
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
LAVA = np.array([(120, 18, 8), (190, 34, 10), (232, 70, 16), (250, 120, 30), (255, 190, 80), (255, 244, 200)]) / 255.
hv = np.clip((g - .2) / .75, 0, 1) ** 1.6
idx = np.clip(np.round(hv * (len(LAVA) - 1)), 0, len(LAVA) - 1).astype(int)
out[hot] = LAVA[idx][hot]
a[..., :3] = np.clip(out, 0, 1)
Image.fromarray((a * 255).astype(np.uint8)).save(os.path.join(B, "boss-magma-titan.png"))
prev = Image.fromarray((a * 255).astype(np.uint8)).crop((0, 0, 128 * 6, 128))
prev.save(os.path.join(ROOT, "scripts", "magma_titan_preview.png"))
print("ok")
