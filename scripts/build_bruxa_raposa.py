#!/usr/bin/env python3
"""Bruxa da Raposa (chefe da Floresta Morta, p216.80): a folha antiga boss-witch.png (32 quadros: parada, golpe de
cauda com vento, desaparecer em fogo-fátuo, invocar raposas-de-fogo) não tinha caminhada. A caminhada foi feita no
PixelLab (animate-pixminimax a partir do quadro 0; fonte scripts/art-src/chefes/bruxa-raposa/walk.png) e entra no
fim da folha: assets/pixel-art/bosses/boss-witch-v2.png = 32 quadros antigos + 8 da caminhada (32–39)."""
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
old = Image.open(os.path.join(ROOT, "assets/pixel-art/bosses/boss-witch.png")).convert("RGBA")
w = Image.open(os.path.join(ROOT, "scripts/art-src/chefes/bruxa-raposa/walk.png")).convert("RGBA")
out = Image.new("RGBA", (128 * 40, 128)); out.alpha_composite(old.crop((0, 0, 128 * 32, 128)), (0, 0))
for i in range(8):
    a = np.array(w.crop(((i + 1) * 128, 0, (i + 2) * 128, 128))); a[..., 3] = np.where(a[..., 3] > 90, 255, 0)
    out.alpha_composite(Image.fromarray(a), ((32 + i) * 128, 0))
out.save(os.path.join(ROOT, "assets/pixel-art/bosses/boss-witch-v2.png")); print("boss-witch-v2", out.size)
