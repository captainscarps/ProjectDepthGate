"""Arte da missão "O Carcereiro" (Durgan, o carcereiro anão da Fortaleza dos Dragões).
  carcereiro.png            sprite do anão Dwarf_3 do pack "Dwarf 2D Pixel Art Sprite" (CraftPix, fora do repositório), com a
                            barba pintada de branco (velho); linhas: parado 6, andando 10, parado2 5, dano 3, morte 4, especial 4 (86x61)
  carcereiro-p-<expressão>  retratos 128x128 a partir de art-src/carcereiro/*.png (gerados no Gemini a partir do sprite, no estilo
                            dos retratos do ferreiro e da Alline; fundo magenta recortado)
  runa-corrente.png         fechadura rúnica (pilar com correntes e runa acesa / quebrada), 2 quadros 32x48
  elo-durgan.png            ícone 20x20 do Elo de Durgan (recompensa)
Uso: DWARF_PACK=... python3 scripts/build_quest_npc_carcereiro.py
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import build_quest_npcs2 as B  # noqa: E402

DP = os.path.join(os.environ.get("DWARF_PACK", "/tmp/dg/packs/74afc1dd-craftpix-net-462764-dwarf-2d-pixel-art-sprite-pack"), "Dwarf_3")
SRC = os.path.join(ROOT, "art-src", "carcereiro")
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "npc"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "npc")]


def save(name, im):
    for d in OUTS:
        os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, name + ".png"), optimize=True)


def sprite():
    im, fw, fh, _ = B.sheet(DP, [("Idle", 6), ("Walk", 10), ("Idle_2", 5), ("Hurt", 3), ("Dead", 4), ("Special", 4)])
    a = np.array(im.convert("RGBA")).astype(int)
    out = a.copy()
    for r in range(a.shape[0] // fh):
        for c in range(a.shape[1] // fw):
            f = a[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw]
            op = f[..., 3] > 0
            if not op.any():
                continue
            R, G, Bc = f[..., 0], f[..., 1], f[..., 2]
            helm = op & (Bc > R + 15) & (R > 55)          # capacete (aço azulado)
            hy, hx = np.where(helm)
            top = op.any(1).argmax()
            sel = hy < top + 16
            hy, hx = hy[sel], hx[sel]
            if not len(hx):
                continue
            x0, x1, ybot = hx.min(), hx.max(), hy.max()
            cx = (x0 + x1) / 2
            dark = op & (R + G + Bc < 45)                  # a barba preta logo abaixo da frente do capacete
            for y in range(ybot - 2, min(fh, ybot + 11)):
                for x in range(int(cx), min(fw, x1 + 3)):
                    if not dark[y, x]:
                        continue
                    nb = [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
                    if all(0 <= p < fh and 0 <= q < fw and op[p, q] for p, q in nb):
                        col = (232, 228, 220) if (x + y) % 3 and y - ybot <= 7 else (196, 192, 186)
                        out[r * fh + y, c * fw + x, :3] = col
    save("carcereiro", Image.fromarray(out.astype(np.uint8)))


def portrait(path):
    a = np.array(Image.open(path).convert("RGB")).astype(int)
    R, G, Bc = a[..., 0], a[..., 1], a[..., 2]
    mag = (R > 150) & (Bc > 150) & (G < 120) & (np.abs(R - Bc) < 90)
    keep = cv2.morphologyEx((~mag).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(keep, 8)
    keep = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    keep = cv2.erode(keep, np.ones((3, 3), np.uint8), 1)          # tira a franja rosa
    edge = (keep == 1) & (cv2.dilate(1 - keep, np.ones((5, 5), np.uint8)) == 1)
    a[edge & (R > G + 40) & (Bc > G + 40)] = [30, 26, 34]
    pm = np.dstack([a, keep * 255]).astype(float)
    pm[..., :3] *= pm[..., 3:4] / 255                             # reduz pré-multiplicado, sem halo
    sm = np.array(Image.fromarray(pm.astype(np.uint8)).resize((128, 128), Image.BOX)).astype(float)
    al = sm[..., 3:4]
    sm[..., :3] = np.where(al > 0, sm[..., :3] * 255 / np.maximum(al, 1), 0)
    sm[..., 3] = np.where(sm[..., 3] >= 128, 255, 0)
    return Image.fromarray(sm.clip(0, 255).astype(np.uint8))


def portraits():
    P = {k: portrait(os.path.join(SRC, k + ".png")) for k in ("calm", "sadness", "smile", "aggression")}
    for ex, k in {"talk": "calm", "calm": "calm", "smile": "smile", "sadness": "sadness", "aggression": "aggression", "special": "smile"}.items():
        save(f"carcereiro-p-{ex}", P[k])


def lock_frame(broken):
    W, H = 32, 48
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    O = (14, 10, 14, 255)
    d.ellipse((3, 38, 28, 47), fill=(58, 52, 60, 255), outline=O)       # base de pedra (oval, sem canto reto)
    d.ellipse((6, 39, 25, 44), fill=(80, 74, 84, 255))
    top = 16 if broken else 8
    d.rounded_rectangle((10, top, 21, 42), radius=3, fill=(52, 54, 70, 255), outline=O)
    d.line((12, top + 2, 12, 40), fill=(84, 88, 112, 255))
    d.line((19, top + 2, 19, 40), fill=(34, 34, 46, 255))
    if broken:
        d.polygon([(10, 16), (13, 12), (15, 15), (18, 11), (21, 16)], fill=(52, 54, 70, 255), outline=O)
    else:
        d.ellipse((8, 4, 23, 12), fill=(62, 64, 82, 255), outline=O)
    for side, x0 in ((-1, 9), (1, 22)):                                  # correntes caindo dos lados
        for k in range(3 if broken else 6):
            cx, cy = x0 + side * (1 + k * 1.6), 19 + k * 3.4
            col = (78, 78, 88, 255) if broken else (124, 126, 146, 255)
            if k % 2 == 0:
                d.ellipse((cx - 1.6, cy - 2, cx + 1.6, cy + 2), outline=O, fill=col)
            else:
                d.line((cx - 1.5, cy, cx + 1.5, cy), fill=col, width=2)
    rc = (90, 86, 96, 255) if broken else (255, 92, 40, 255)            # a runa corrompida
    d.line((15, 20, 15, 32), fill=rc); d.line((15, 22, 18, 25), fill=rc); d.line((15, 26, 12, 29), fill=rc); d.line((13, 21, 17, 21), fill=rc)
    if broken:
        d.line((13, 24, 18, 30), fill=O); d.line((16, 34, 12, 38), fill=O)
    return im


def lock_and_icon():
    s = Image.new("RGBA", (64, 48))
    s.paste(lock_frame(False), (0, 0)); s.paste(lock_frame(True), (32, 0))
    save("runa-corrente", s)
    im = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    O = (18, 14, 18, 255)
    d.ellipse((2, 3, 12, 17), outline=O, width=3); d.ellipse((3, 4, 11, 16), outline=(150, 154, 172, 255), width=1)
    d.ellipse((9, 1, 18, 12), outline=O, width=3); d.ellipse((10, 2, 17, 11), outline=(110, 114, 132, 255), width=1)
    for x, y in ((7, 8), (7, 9), (7, 10), (7, 11), (8, 9), (6, 11)):
        d.point((x, y), fill=(255, 110, 40, 255))
    d.point((5, 6), fill=(220, 224, 236, 255)); d.point((12, 3), fill=(220, 224, 236, 255))
    save("elo-durgan", im)


if __name__ == "__main__":
    sprite()
    portraits()
    lock_and_icon()
    print("ok")
