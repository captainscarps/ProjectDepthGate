"""
Portal em redemoinho (pack "PixelPortal", fora do repositório pela licença) -> assets/pixel-art/props/pp-portal.png
Folha 576x192, quadros de 64x64 (o pack vem ampliado 5x: 320x320 por quadro, 9 quadros):
  linha 0 (quadros 0-8):  versão clara neutra, para ser tingida com a cor de cada portal
  linha 1 (quadros 9-17): azul original
  linha 2 (quadros 18-26): laranja original
Uso: PP_PACK="/pasta/PixelPortal" python3 scripts/build_portal_swirl.py
"""
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.environ.get("PP_PACK", "/tmp/pp/x")


def frames(name):
    s = Image.open(os.path.join(PACK, f"{name}Portal.png")).convert("RGBA")
    return [s.crop((k * 320, 0, (k + 1) * 320, 320)).resize((64, 64), Image.NEAREST) for k in range(9)]


def main():
    blue, orange = frames("Blue"), frames("Orange")
    out = Image.new("RGBA", (576, 192))
    for k in range(9):
        b = np.array(blue[k]).astype(float)
        lum = b[:, :, 0] * .3 + b[:, :, 1] * .59 + b[:, :, 2] * .11
        mx = max(1.0, lum[b[:, :, 3] > 0].max()) if (b[:, :, 3] > 0).any() else 1.0
        v = np.clip((lum / mx) ** .8 * 255, 0, 255)
        w = b.copy(); w[:, :, 0] = w[:, :, 1] = w[:, :, 2] = v
        out.paste(Image.fromarray(w.astype("uint8")), (k * 64, 0))
        out.paste(blue[k], (k * 64, 64))
        out.paste(orange[k], (k * 64, 128))
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "props")
        if os.path.isdir(d):
            out.save(os.path.join(d, "pp-portal.png"), optimize=True)
    print("pp-portal", out.size)


if __name__ == "__main__":
    main()
