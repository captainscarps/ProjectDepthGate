"""Refúgio mais vivo — enfeites e bichos soltos (assets/pixel-art/hub/refugio/).
Fontes (CraftPix, fora do repositório):
  HOME_PNG  = pacote "Main Characters Home" (PNG/exterior.png, PNG/ground_grass_details.png, PNG/bird_jump_animation.png)
  WILD      = pacote "Top-Down Wild Animals" (pastas 1..8; S_ = de lado, olhando para a esquerda)
Saída:
  deco.png + deco.json   atlas (hash do Phaser): poço, tocos, tronco caído, caixotes, cogumelos, flores, tufos de
                         folhas, pedrinhas, e as peças desenhadas aqui: estandarte, hera, banco de tronco
  sheep.png  (48x48)     ovelha: anda 0-3, parada 4-7 (virada para a direita)
  rabbit.png (48x48)     coelho: pula 0-3, parado 4-7
  duck.png   (48x48)     pato: parado 0-3, voando 4-7
  butterfly.png (48x48)  borboleta: 0-3
  birds.png  (32x32)     pardal/corvinho ciscando: 20 quadros (linha 1 da folha original)
Uso: HOME_PNG=.../PNG WILD=... python3 scripts/build_refugio_deco.py
"""
import json
import os

from PIL import Image, ImageDraw, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.environ.get("HOME_PNG", "/tmp/dg/pen/a/PNG")
WILD = os.environ.get("WILD", "/tmp/dg/pets/wild")
OUTS = [os.path.join(ROOT, p, "assets", "pixel-art", "hub", "refugio") for p in ("", "Projeto atualizado")]

EXT = Image.open(os.path.join(HOME, "exterior.png")).convert("RGBA")
GG = Image.open(os.path.join(HOME, "ground_grass_details.png")).convert("RGBA")
# recortes do exterior.png (x, y, w, h)
CUT = {
    "well": (0, 497, 37, 43), "stump-up": (90, 463, 18, 26), "crates": (118, 463, 27, 39), "crate-s": (215, 435, 15, 19),
    "log": (87, 629, 38, 24), "stump": (95, 597, 31, 24), "stump-r": (128, 594, 31, 30), "stump-b": (164, 634, 39, 30),
    "mush": (55, 469, 18, 21), "mush-b": (63, 547, 34, 43),
    "fl1": (147, 754, 11, 11), "fl2": (161, 756, 13, 9), "fl3": (191, 767, 18, 18), "fl4": (211, 769, 10, 15),
    "fl5": (226, 769, 12, 14), "fl6": (159, 770, 18, 13), "fl7": (145, 773, 14, 20), "fl8": (177, 773, 13, 10), "fl9": (127, 774, 18, 25),
}


def trim(im):
    b = im.getbbox()
    return im.crop(b) if b else im


def gg_pieces():
    """tufos de folha (metade de baixo) e pedrinhas (metade de cima) do ground_grass_details, um a um"""
    import numpy as np
    from scipy import ndimage
    a = np.array(GG)[..., 3] > 0
    lab, _ = ndimage.label(ndimage.binary_dilation(a, iterations=3))
    tufts, pebbles = [], []
    for s in ndimage.find_objects(lab):
        y0, y1, x0, x1 = s[0].start, s[0].stop, s[1].start, s[1].stop
        if (x1 - x0) * (y1 - y0) < 40 or x1 - x0 > 40 or y1 - y0 > 34:
            continue
        piece = trim(GG.crop((x0, y0, x1, y1)))
        (pebbles if y0 < 130 else tufts).append(piece)
    return tufts[:14], pebbles[:12]


def banner():
    im = Image.new("RGBA", (16, 36)); d = ImageDraw.Draw(im)
    O = (24, 14, 12, 255)
    d.line((0, 1, 15, 1), fill=(90, 60, 34, 255), width=2)                        # varão
    d.point((0, 0), fill=O); d.point((15, 0), fill=O)
    d.polygon([(2, 3), (13, 3), (13, 30), (7, 35), (2, 30)], fill=(150, 34, 30, 255), outline=O)
    d.line((3, 4, 3, 29), fill=(186, 58, 44, 255))
    d.line((12, 4, 12, 30), fill=(112, 22, 22, 255))
    d.polygon([(7, 10), (10, 15), (7, 20), (4, 15)], fill=(232, 190, 86, 255), outline=(120, 80, 30, 255))   # losango dourado
    d.point((7, 15), fill=(255, 236, 160, 255))
    d.line((3, 25, 12, 25), fill=(232, 190, 86, 255))
    return im


def ivy(seed, h):
    import random
    rnd = random.Random(seed)
    im = Image.new("RGBA", (14, h)); d = ImageDraw.Draw(im)
    x = 7
    for y in range(h):
        x = max(2, min(11, x + rnd.choice((-1, 0, 0, 1))))
        d.point((x, y), fill=(52, 92, 40, 255))
        if y % 3 == 0 and y < h - 2:
            side = rnd.choice((-1, 1))
            c = rnd.choice([(84, 150, 58, 255), (64, 124, 48, 255), (104, 170, 66, 255)])
            d.polygon([(x, y), (x + side * 3, y - 1), (x + side * 4, y + 1), (x + side * 2, y + 2)], fill=c)
            d.point((x + side * 3, y), fill=(140, 200, 90, 255))
    return im


def bench():
    """banco de tronco (horizontal) — casca, topo cortado e sombra"""
    im = Image.new("RGBA", (34, 14)); d = ImageDraw.Draw(im)
    O = (40, 24, 16, 255)
    d.ellipse((1, 9, 33, 13), fill=(20, 30, 14, 80))
    d.rounded_rectangle((3, 3, 30, 10), radius=3, fill=(120, 74, 44, 255), outline=O)
    d.line((5, 4, 28, 4), fill=(170, 116, 70, 255))
    d.line((6, 7, 14, 7), fill=(96, 58, 34, 255)); d.line((18, 8, 27, 8), fill=(96, 58, 34, 255))
    d.ellipse((26, 3, 32, 10), fill=(206, 160, 104, 255), outline=O)             # ponta cortada
    d.ellipse((28, 5, 30, 8), outline=(150, 104, 60, 255))
    return im


def atlas(pieces):
    pad, x, y, rowh, W = 2, 0, 0, 0, 256
    pos = {}
    for k, im in pieces.items():
        if x + im.width > W:
            x, y, rowh = 0, y + rowh + pad, 0
        pos[k] = (x, y, im.width, im.height)
        x += im.width + pad; rowh = max(rowh, im.height)
    out = Image.new("RGBA", (W, y + rowh))
    for k, im in pieces.items():
        out.alpha_composite(im, pos[k][:2])
    frames = {k: {"frame": {"x": a, "y": b, "w": w, "h": h}, "rotated": False, "trimmed": False,
                  "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h}, "sourceSize": {"w": w, "h": h}} for k, (a, b, w, h) in pos.items()}
    return out, {"frames": frames, "meta": {"image": "deco.png", "size": {"w": W, "h": out.height}, "scale": "1"}}


def strip(parts, fw, fh, flip=True):
    frames = []
    for path, n in parts:
        im = Image.open(path).convert("RGBA")
        for k in range(n if n else im.width // fw):
            f = im.crop((k * fw, 0, k * fw + fw, fh))
            frames.append(ImageOps.mirror(f) if flip else f)
    out = Image.new("RGBA", (fw * len(frames), fh))
    for i, f in enumerate(frames):
        out.alpha_composite(f, (i * fw, 0))
    return out


def save(name, im):
    for d in OUTS:
        os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, name), optimize=True)


if __name__ == "__main__":
    P = {k: trim(EXT.crop((x, y, x + w, y + h))) for k, (x, y, w, h) in CUT.items()}
    tufts, pebbles = gg_pieces()
    for i, t in enumerate(tufts): P[f"tuft{i}"] = t
    for i, t in enumerate(pebbles): P[f"peb{i}"] = t
    P["banner"] = banner(); P["bench"] = bench()
    for i, h in enumerate((22, 30, 18, 26)): P[f"ivy{i}"] = ivy(11 + i, h)
    im, js = atlas(P)
    save("deco.png", im)
    for d in OUTS:
        with open(os.path.join(d, "deco.json"), "w") as f:
            json.dump(js, f, separators=(",", ":"))
    W4 = lambda n, f: os.path.join(WILD, str(n), f + ".png")
    save("sheep.png", strip([(W4(1, "S_Walk"), 4), (W4(1, "S_Idle"), 4)], 48, 48))
    save("rabbit.png", strip([(W4(2, "S_Walk"), 4), (W4(2, "S_Idle"), 4)], 48, 48))
    save("duck.png", strip([(W4(4, "S_Idle"), 4), (W4(4, "S_Fly"), 4)], 48, 48))
    save("butterfly.png", strip([(W4(5, "S_Fly"), 4)], 48, 48))
    bj = Image.open(os.path.join(HOME, "bird_jump_animation.png")).convert("RGBA").crop((0, 32, 640, 64))
    save("birds.png", bj)
    print("ok", len(P), "peças;", sorted(k for k in P if k.startswith(("tuft", "peb")))[:4], "...")
