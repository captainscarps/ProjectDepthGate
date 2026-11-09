"""Pets do Treino de Pets (vendedor do Refúgio) — folhas em assets/pixel-art/pets/.
Fontes (CraftPix, fora do repositório):
  URBAN = pacote "Urban Animals Sprite Sheet" (Animal_1..6, quadros 128x128, de lado, olhando para a direita)
  WILD  = pacote "Top-Down Wild Animals" (pastas 1..8, quadros 48x48; S_ = de lado, olhando para a esquerda)
Saída (uma linha por animação, 13 colunas; quadro = linha*13 + k):
  pet-lobo.png  Animal_5 (lobo negro)   105x70  parado 7 · andando 10 · mordida 5 · comendo 12
  pet-cao.png   Animal_2 (cão caramelo) 105x70  parado 7 · andando 10 · latido 5 · comendo 12
  pet-rato.png  Animal_6 (rato branco)   62x44  parado 11 · andando 8 · bote 5 · fareja de pé 13
  pet-corvo.png pasta 3 (corvo)          48x48  parado 4 · voando 4 (virado para a direita, como os outros)
Uso: URBAN=... WILD=... python3 scripts/build_pets.py
"""
import os

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URBAN = os.environ.get("URBAN", "/tmp/dg/pets/urb")
WILD = os.environ.get("WILD", "/tmp/dg/pets/wild")
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "pets"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "pets")]
COLS = 13


def save(name, im):
    for d in OUTS:
        os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, name + ".png"), optimize=True)


def urban(n, box, poses):
    x0, y0, x1, y1 = box
    fw, fh = x1 - x0, y1 - y0
    out = Image.new("RGBA", (fw * COLS, fh * len(poses)))
    for r, p in enumerate(poses):
        im = Image.open(os.path.join(URBAN, f"Animal_{n}", p + ".png")).convert("RGBA")
        for k in range(min(COLS, im.width // 128)):
            out.paste(im.crop((k * 128 + x0, y0, k * 128 + x1, y1)), (k * fw, r * fh))
    return out


def crow():
    out = Image.new("RGBA", (48 * COLS, 48 * 2))
    for r, p in enumerate(("S_Idle", "S_Fly")):
        im = Image.open(os.path.join(WILD, "3", p + ".png")).convert("RGBA")
        for k in range(im.width // 48):
            out.paste(ImageOps.mirror(im.crop((k * 48, 0, k * 48 + 48, 48))), (k * 48, r * 48))
    return out


if __name__ == "__main__":
    DOG = ["Idle", "Walk", "Attack", "Special"]
    save("pet-lobo", urban(5, (12, 58, 117, 128), DOG))
    save("pet-cao", urban(2, (12, 58, 117, 128), DOG))
    save("pet-rato", urban(6, (28, 84, 90, 128), DOG))
    save("pet-corvo", crow())
    print("ok")
