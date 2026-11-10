"""Pets do Treino de Pets (vendedor do Refúgio) — folhas em assets/pixel-art/pets/.
Fontes (CraftPix, fora do repositório):
  URBAN = pacote "Urban Animals Sprite Sheet" (Animal_1..6, quadros 128x128, de lado, olhando para a direita)
  WILD  = pacote "Top-Down Wild Animals" (pastas 1..8, quadros 48x48; S_ = de lado, olhando para a esquerda)
Saída (uma linha por animação, 13 colunas; quadro = linha*13 + k):
  pet-lobo.png  Animal_5 (lobo negro)   105x70  parado 7 · andando 10 · mordida 5 · comendo 12
  pet-cao.png   Animal_2 (cão caramelo) 105x70  parado 7 · andando 10 · latido 5 · comendo 12
  pet-rato.png  Animal_6 (rato branco)   62x44  parado 11 · andando 8 · bote 5 · fareja de pé 13
  pet-corvo.png pasta 3 (corvo)          48x48  parado 4 · voando 4 (virado para a direita, como os outros)
Canto dos Pets no Refúgio (cercado onde os pets descansam):
  pet-pen-back.png / pet-pen-front.png  cercado de madeira montado com as peças da cerca do pacote
                   "Main Characters Home" (HOME = PNG/exterior.png); a frente (só a faixa de baixo, 16 px) fica separada
                   para os bichos passarem por trás dela
  pet-kennel.png, pet-bowl.png, pet-trough.png, pet-hay.png   casinha, tigela de ração, cocho de água e
                   cama de feno (desenhados aqui, na paleta da cerca)
Uso: URBAN=... WILD=... HOME=.../exterior.png python3 scripts/build_pets.py
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


HOME = os.environ.get("HOME_PNG", "/tmp/dg/pen/a/PNG/exterior.png")
PEN_COLS, PEN_ROWS = 20, 5          # colunas de mourão no meio e faixas laterais: 176 x 112 px


def pen():
    """Cercado: colunas [esquerda] + meio * N + [direita]; faixas [topo] + lado * K + [base] (passo de 8 px)."""
    src = Image.open(HOME).convert("RGBA")
    cols = [(169, 177)] + [(177, 185)] * PEN_COLS + [(193, 201)]
    bands = [(16, 32)] + [(32, 48)] * PEN_ROWS + [(48, 64)]
    W, H = 8 * len(cols), 16 * len(bands)
    back, front = Image.new("RGBA", (W, H)), Image.new("RGBA", (W, H))
    for bi, (y0, y1) in enumerate(bands):
        for ci, (x0, x1) in enumerate(cols):
            if 0 < bi < len(bands) - 1 and 0 < ci < len(cols) - 1:
                continue                                  # o miolo do cercado é grama: nas faixas do meio só entram os lados
            (front if bi == len(bands) - 1 else back).alpha_composite(src.crop((x0, y0, x1, y1)), (ci * 8, bi * 16))
    return back, front.crop((0, H - 16, W, H))          # a frente é só a faixa de baixo (textura justa)


def px(d, pts, c):
    for p in pts:
        d.point(p, fill=c)


def kennel():
    from PIL import ImageDraw
    im = Image.new("RGBA", (34, 32)); d = ImageDraw.Draw(im)
    O, W1, W2, W3 = (40, 22, 18, 255), (150, 92, 56, 255), (118, 70, 42, 255), (176, 116, 72, 255)
    R1, R2, R3 = (170, 52, 40, 255), (126, 34, 30, 255), (206, 84, 60, 255)
    d.ellipse((2, 27, 31, 31), fill=(20, 40, 18, 90))                          # sombra
    d.rectangle((5, 13, 28, 29), fill=W1, outline=O)                          # paredes de tábua
    for x in (10, 15, 20, 25): d.line((x, 14, x, 28), fill=W2)
    d.line((6, 14, 6, 28), fill=W3)
    d.polygon([(16, 2), (33, 15), (30, 17), (16, 7), (3, 17), (0, 15)], fill=R1, outline=O)   # telhado
    d.polygon([(16, 7), (30, 17), (27, 17), (16, 10), (6, 17), (3, 17)], fill=R2)
    d.line((2, 15, 16, 4), fill=R3)
    d.pieslice((10, 16, 22, 34), 180, 360, fill=(30, 18, 16, 255), outline=O)   # porta em arco
    d.rectangle((11, 25, 21, 29), fill=(30, 18, 16, 255))
    d.line((11, 29, 21, 29), fill=O)
    d.rectangle((13, 9, 19, 12), fill=(232, 206, 150, 255), outline=O)        # plaquinha
    return im


def bowl():
    from PIL import ImageDraw
    im = Image.new("RGBA", (14, 9)); d = ImageDraw.Draw(im)
    O = (40, 22, 18, 255)
    d.ellipse((0, 4, 13, 8), fill=(20, 40, 18, 80))
    d.ellipse((1, 2, 12, 7), fill=(126, 66, 40, 255), outline=O)
    d.ellipse((3, 2, 10, 5), fill=(196, 140, 72, 255))
    px(d, [(4, 3), (6, 2), (8, 3), (5, 4), (9, 4), (7, 3)], (150, 96, 46, 255))
    return im


def trough():
    from PIL import ImageDraw
    im = Image.new("RGBA", (24, 12)); d = ImageDraw.Draw(im)
    O = (40, 22, 18, 255)
    d.ellipse((0, 7, 23, 11), fill=(20, 40, 18, 80))
    d.rounded_rectangle((1, 2, 22, 9), radius=3, fill=(150, 92, 56, 255), outline=O)
    d.rounded_rectangle((3, 3, 20, 6), radius=2, fill=(86, 150, 200, 255))
    d.line((5, 4, 10, 4), fill=(170, 214, 240, 255))
    d.line((3, 9, 20, 9), fill=(118, 70, 42, 255))
    return im


def hay():
    from PIL import ImageDraw
    import random
    random.seed(7)
    im = Image.new("RGBA", (30, 14)); d = ImageDraw.Draw(im)
    d.ellipse((0, 8, 29, 13), fill=(20, 40, 18, 80))
    d.ellipse((1, 3, 28, 12), fill=(196, 160, 72, 255), outline=(110, 80, 30, 255))
    for _ in range(40):
        x, y = random.randint(4, 25), random.randint(5, 10)
        d.line((x, y, x + random.choice((-2, -1, 1, 2)), y - 1), fill=random.choice([(230, 200, 110, 255), (170, 130, 50, 255), (214, 180, 88, 255)]))
    return im


if __name__ == "__main__":
    DOG = ["Idle", "Walk", "Attack", "Special"]
    save("pet-lobo", urban(5, (12, 58, 117, 128), DOG))
    save("pet-cao", urban(2, (12, 58, 117, 128), DOG))
    save("pet-rato", urban(6, (28, 84, 90, 128), DOG))
    save("pet-corvo", crow())
    b, f = pen()
    save("pet-pen-back", b); save("pet-pen-front", f)
    save("pet-kennel", kennel()); save("pet-bowl", bowl()); save("pet-trough", trough()); save("pet-hay", hay())
    print("ok")
