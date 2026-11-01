"""
Ícones das habilidades extras (escolha por nível) no estilo dos ícones do jogo: 24×24, moldura arredondada,
fundo em degradê na cor do elemento, desenho com contorno escuro. Saída: assets/pixel-art/ui/icons/<ID>.png
(e no espelho). O jogo usa "ix-<ID>" automaticamente quando a textura existe (skill-picks.js carrega).
Uso: python3 scripts/build_skill_icons.py [pasta-de-prévia]
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "ui", "icons"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "ui", "icons")]

THEME = {
    "steel": (64, 84, 118), "red": (132, 36, 38), "purple": (88, 48, 136), "green": (46, 104, 56), "teal": (28, 104, 104),
    "gold": (142, 104, 36), "brown": (104, 66, 38), "ice": (52, 112, 164), "toxic": (74, 120, 34), "night": (40, 36, 70), "fire": (150, 62, 24),
}
INK = (18, 14, 22, 255)
W = (240, 236, 224, 255)
STEEL = [(90, 96, 110, 255), (150, 158, 172, 255), (210, 216, 226, 255)]
GOLD = [(150, 100, 30, 255), (214, 164, 54, 255), (255, 226, 120, 255)]
WOOD = [(86, 52, 28, 255), (128, 82, 44, 255), (168, 116, 64, 255)]
BONE = [(150, 136, 110, 255), (206, 194, 166, 255), (244, 238, 220, 255)]
ICE = [(80, 150, 200, 255), (150, 210, 240, 255), (230, 250, 255, 255)]
FIRE = [(200, 60, 20, 255), (250, 140, 30, 255), (255, 230, 120, 255)]
GRN = [(40, 120, 40, 255), (90, 180, 60, 255), (190, 240, 120, 255)]
TOX = [(70, 120, 20, 255), (140, 200, 40, 255), (220, 255, 120, 255)]
RED = [(130, 20, 24, 255), (200, 40, 40, 255), (255, 120, 110, 255)]
PUR = [(90, 40, 140, 255), (160, 90, 220, 255), (230, 190, 255, 255)]
GREY = [(70, 66, 72, 255), (120, 114, 118, 255), (176, 170, 168, 255)]


def frame(theme):
    c = np.array(THEME[theme], np.float32)
    im = Image.new("RGBA", (24, 24))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, 23, 23), 4, fill=INK)
    for y in range(1, 23):
        t = (y - 1) / 21
        col = tuple(int(v) for v in np.clip(c * (1.35 - .75 * t), 0, 255)) + (255,)
        d.line((2 if y in (1, 22) else 1, y, 21 if y in (1, 22) else 22, y), fill=col)
    hl = tuple(int(v) for v in np.clip(c * 1.8 + 20, 0, 255)) + (255,)
    d.line((3, 1, 20, 1), fill=hl)
    d.line((1, 3, 1, 12), fill=hl)
    return im


def finish(theme, draw_fn):
    base = frame(theme)
    g = Image.new("RGBA", (24, 24))
    draw_fn(ImageDraw.Draw(g), g)
    a = np.asarray(g)[..., 3] > 0
    ring = ndimage.binary_dilation(a, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & ~a
    ring[[0, -1], :] = False
    ring[:, [0, -1]] = False
    o = np.asarray(base).copy()
    o[ring] = INK
    out = Image.fromarray(o)
    out.alpha_composite(g)
    # recorta de novo os cantos arredondados
    m = Image.new("L", (24, 24), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, 23, 23), 4, fill=255)
    out.putalpha(Image.fromarray(np.minimum(np.asarray(out)[..., 3], np.asarray(m))))
    return out


def blade(d, x0, y0, x1, y1, pal=STEEL, w=1):
    d.line((x0, y0, x1, y1), fill=pal[1], width=w + 1)
    d.line((x0, y0, x1, y1), fill=pal[2], width=1)


def arrow(d, x0, y0, x1, y1, head=FIRE, shaft=WOOD, fl=W):
    d.line((x0, y0, x1, y1), fill=shaft[2], width=1)
    a = math.atan2(y1 - y0, x1 - x0)
    hx, hy = x1, y1
    p = [(hx + math.cos(a) * 2, hy + math.sin(a) * 2), (hx + math.cos(a + 2.5) * 3, hy + math.sin(a + 2.5) * 3), (hx + math.cos(a - 2.5) * 3, hy + math.sin(a - 2.5) * 3)]
    d.polygon(p, fill=head[1])
    for s in (2.4, -2.4):
        d.line((x0, y0, x0 + math.cos(a + s) * 2.5, y0 + math.sin(a + s) * 2.5), fill=fl)


def star(d, cx, cy, r1, r2, n, fill):
    p = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = -math.pi / 2 + i * math.pi / n
        p.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    d.polygon(p, fill=fill)


ICONS = {}


def icon(id_, theme):
    def deco(fn):
        ICONS[id_] = (theme, fn)
        return fn
    return deco


# ─── Guerreiro ───
@icon("ET_CHARGE", "steel")
def _(d, g):
    for y, l in ((8, 5), (12, 7), (16, 4)):
        d.line((3, y, 3 + l, y), fill=(200, 210, 230, 200))
    blade(d, 8, 15, 19, 6, w=2)
    d.line((8, 12, 11, 16), fill=GOLD[1], width=2)
    d.point((7, 17), fill=GOLD[2])


@icon("ET_CLAN_CRY", "red")
def _(d, g):
    d.polygon([(5, 14), (11, 9), (13, 9), (13, 17), (11, 17)], fill=BONE[1])
    d.line((5, 14, 11, 9), fill=BONE[2])
    d.rectangle((13, 10, 14, 16), fill=GOLD[1])
    for r in (3, 6):
        d.arc((14 - r, 13 - r - 2, 14 + r + 4, 13 + r + 2), -50, 50, fill=GOLD[2])


@icon("ET_SPIN", "steel")
def _(d, g):
    d.arc((4, 4, 19, 19), 200, 520, fill=(200, 210, 230, 255), width=2)
    d.arc((7, 7, 16, 16), 20, 300, fill=(150, 160, 180, 255), width=1)
    blade(d, 11, 12, 19, 5, w=1)
    d.rectangle((10, 11, 12, 13), fill=GOLD[1])


@icon("ET_AEGIS", "green")
def _(d, g):
    d.ellipse((5, 4, 18, 19), fill=WOOD[1])
    d.ellipse((7, 6, 16, 17), fill=WOOD[2])
    d.ellipse((10, 9, 13, 14), fill=GOLD[1])
    d.polygon([(11, 3), (14, 6), (11, 8), (8, 6)], fill=GRN[2])


# ─── Samurai ───
@icon("ET_TSUBAME", "red")
def _(d, g):
    d.arc((2, 3, 20, 21), 210, 330, fill=W, width=2)
    d.arc((4, 3, 22, 21), 30, 150, fill=(255, 190, 200, 255), width=2)
    d.polygon([(11, 10), (15, 12), (11, 13), (8, 12)], fill=(40, 40, 60, 255))
    d.line((8, 11, 5, 9), fill=(40, 40, 60, 255))
    d.line((15, 12, 18, 10), fill=(40, 40, 60, 255))


@icon("ET_PARRY", "ice")
def _(d, g):
    blade(d, 4, 15, 18, 8, pal=STEEL, w=1)
    d.rectangle((4, 15, 6, 17), fill=(60, 30, 30, 255))
    star(d, 13, 10, 5, 2, 4, (255, 255, 220, 255))
    d.point((13, 10), fill=W)


@icon("ET_QUAKE", "brown")
def _(d, g):
    d.rectangle((3, 15, 20, 20), fill=GREY[1])
    d.line((11, 15, 9, 18), fill=INK)
    d.line((9, 18, 12, 20), fill=INK)
    d.line((14, 15, 16, 19), fill=INK)
    for x, y in ((6, 11), (11, 8), (17, 11)):
        d.rectangle((x, y, x + 2, y + 2), fill=GREY[2])
    d.line((4, 13, 19, 13), fill=FIRE[1])


@icon("ET_IRON_WALL", "steel")
def _(d, g):
    d.rectangle((4, 5, 19, 18), fill=GREY[1])
    for y in (5, 9, 13):
        d.line((4, y, 19, y), fill=GREY[0])
    for y, off in ((5, 0), (9, 3), (13, 0)):
        for x in range(4 + off, 20, 6):
            d.line((x, y, x, y + 4), fill=GREY[0])
    d.line((4, 5, 19, 5), fill=GREY[2])


# ─── Arqueiro ───
@icon("ET_CHARGED", "gold")
def _(d, g):
    d.arc((2, 3, 12, 20), -90, 90, fill=WOOD[2], width=2)
    d.line((7, 3, 7, 20), fill=W)
    d.line((7, 11, 20, 11), fill=(255, 240, 160, 255))
    d.polygon([(20, 11), (17, 9), (17, 13)], fill=(255, 250, 200, 255))
    for x in (11, 14):
        d.point((x, 9), fill=(255, 255, 255, 255))
        d.point((x + 1, 13), fill=(255, 255, 255, 255))


@icon("ET_BACKFLIP", "teal")
def _(d, g):
    d.arc((4, 4, 18, 18), 300, 210, fill=W, width=2)
    d.polygon([(4, 10), (2, 13), (7, 13)], fill=W)
    arrow(d, 10, 14, 19, 14, head=STEEL)


@icon("ET_FENCE", "green")
def _(d, g):
    for x in (5, 9, 13, 17):
        d.line((x, 6, x, 17), fill=WOOD[2])
        d.polygon([(x, 18), (x - 1, 16), (x + 1, 16)], fill=STEEL[2])
        d.line((x - 1, 5, x + 1, 5), fill=W)
    d.line((3, 19, 20, 19), fill=WOOD[0])


@icon("ET_ARROW_STORM", "gold")
def _(d, g):
    for a in (-.6, -.3, 0, .3, .6):
        x1, y1 = 12 + math.sin(a) * 9, 19 - math.cos(a) * 14
        arrow(d, 12 + math.sin(a) * 2, 19, x1, y1, head=STEEL)


# ─── Maga ───
@icon("ET_ICE_COMET", "ice")
def _(d, g):
    for k in range(5):
        d.line((4 + k, 18 - k, 9 + k, 13 - k), fill=ICE[1] if k % 2 else ICE[0])
    star(d, 15, 8, 5, 2.5, 6, ICE[2])
    d.ellipse((13, 6, 17, 10), fill=W)


@icon("ET_SUN_MIRROR", "gold")
def _(d, g):
    for i in range(8):
        a = i * math.pi / 4
        d.line((12 + math.cos(a) * 6, 12 + math.sin(a) * 6, 12 + math.cos(a) * 9, 12 + math.sin(a) * 9), fill=GOLD[2])
    d.ellipse((7, 7, 16, 16), fill=GOLD[1])
    d.ellipse((9, 9, 14, 14), fill=(255, 250, 220, 255))


@icon("ET_ICE_PRISON", "ice")
def _(d, g):
    d.polygon([(12, 3), (19, 8), (19, 16), (12, 21), (5, 16), (5, 8)], fill=ICE[1])
    d.polygon([(12, 3), (19, 8), (12, 12), (5, 8)], fill=ICE[2])
    d.line((12, 12, 12, 21), fill=ICE[0])
    d.rectangle((10, 13, 13, 17), fill=(60, 80, 120, 255))


@icon("ET_STARFALL", "fire")
def _(d, g):
    for k in range(6):
        d.line((3 + k, 20 - k, 9 + k, 14 - k), fill=FIRE[k % 2])
    star(d, 15, 8, 6, 2.5, 5, FIRE[2])
    d.point((15, 8), fill=W)


# ─── Ladina ───
@icon("ET_DEATH_MARK", "red")
def _(d, g):
    d.ellipse((4, 4, 19, 19), outline=RED[2], width=1)
    for x0, y0, x1, y1 in ((12, 2, 12, 6), (12, 17, 12, 21), (2, 12, 6, 12), (17, 12, 21, 12)):
        d.line((x0, y0, x1, y1), fill=RED[2])
    d.ellipse((8, 7, 15, 14), fill=BONE[2])
    d.rectangle((9, 13, 14, 16), fill=BONE[2])
    d.point((10, 10), fill=INK)
    d.point((13, 10), fill=INK)


@icon("ET_ROLL", "night")
def _(d, g):
    d.arc((4, 4, 19, 19), 0, 300, fill=PUR[2], width=2)
    d.polygon([(19, 12), (16, 9), (21, 9)], fill=PUR[2])
    d.ellipse((9, 9, 14, 14), fill=PUR[1])
    for x in (4, 7, 10):
        d.point((x, 20), fill=GREY[2])


@icon("ET_TOXIC_SMOKE", "toxic")
def _(d, g):
    for x, y, r in ((8, 13, 5), (14, 12, 5), (11, 8, 5), (16, 16, 3)):
        d.ellipse((x - r, y - r, x + r, y + r), fill=TOX[1])
    d.ellipse((9, 9, 13, 13), fill=TOX[2])
    d.point((10, 11), fill=INK)
    d.point((12, 11), fill=INK)


@icon("ET_BLADE_DANCE", "purple")
def _(d, g):
    for k in range(5):
        a = k * 2 * math.pi / 5 - math.pi / 2
        blade(d, 12 + math.cos(a) * 3, 12 + math.sin(a) * 3, 12 + math.cos(a) * 9, 12 + math.sin(a) * 9)
    d.ellipse((10, 10, 14, 14), fill=PUR[2])


# ─── Necromante ───
@icon("ET_PLAGUE", "toxic")
def _(d, g):
    for x, y, r in ((8, 10, 5), (15, 10, 5), (12, 7, 4)):
        d.ellipse((x - r, y - r, x + r, y + r), fill=(110, 140, 50, 255))
    for x in (7, 12, 16):
        d.line((x, 15, x, 18), fill=TOX[2])
        d.point((x, 19), fill=TOX[1])


@icon("ET_BONE_ARMOR", "night")
def _(d, g):
    d.line((12, 4, 12, 19), fill=BONE[2], width=2)
    for y in (6, 9, 12, 15):
        d.arc((5, y - 2, 19, y + 5), 200, 340, fill=BONE[1], width=1)
    d.ellipse((10, 2, 14, 5), fill=BONE[2])


@icon("ET_REAP", "purple")
def _(d, g):
    d.line((7, 20, 15, 4), fill=WOOD[2], width=1)
    d.arc((7, 2, 23, 14), 180, 300, fill=STEEL[2], width=2)
    d.arc((5, 6, 19, 22), 200, 260, fill=(120, 255, 170, 255), width=1)


@icon("ET_BONE_STORM", "night")
def _(d, g):
    for k in range(8):
        a = k * math.pi / 4
        x, y = 12 + math.cos(a) * 7, 12 + math.sin(a) * 7
        d.line((x - math.cos(a) * 2, y - math.sin(a) * 2, x + math.cos(a) * 2, y + math.sin(a) * 2), fill=BONE[2], width=1)
    d.ellipse((9, 9, 14, 14), fill=(120, 255, 170, 255))


# ─── Caçador ───
@icon("ET_DOUBLE_SHOT", "brown")
def _(d, g):
    arrow(d, 4, 9, 19, 9, head=STEEL)
    arrow(d, 4, 15, 19, 15, head=STEEL)


@icon("ET_CAMPFIRE", "fire")
def _(d, g):
    d.line((5, 19, 18, 15), fill=WOOD[1], width=2)
    d.line((5, 15, 18, 19), fill=WOOD[2], width=2)
    d.polygon([(12, 4), (17, 13), (12, 16), (7, 13)], fill=FIRE[1])
    d.polygon([(12, 8), (15, 13), (12, 15), (9, 13)], fill=FIRE[2])


@icon("ET_COORD", "teal")
def _(d, g):
    for x, y in ((6, 7), (9, 5), (13, 5), (16, 7)):
        d.ellipse((x - 1, y - 1, x + 1, y + 1), fill=BONE[2])
    d.ellipse((7, 9, 15, 15), fill=BONE[2])
    arrow(d, 4, 19, 20, 13, head=STEEL)


@icon("ET_PROTECT_HOWL", "ice")
def _(d, g):
    d.polygon([(6, 18), (8, 9), (11, 6), (13, 3), (15, 8), (18, 10), (13, 13), (12, 18)], fill=GREY[2])
    d.point((13, 8), fill=INK)
    d.arc((2, 2, 22, 22), 200, 340, fill=ICE[2], width=1)


# ─── Xamã ───
@icon("ET_DART_HAIL", "green")
def _(d, g):
    for a in (-.5, -.15, .2, .55):
        x0, y0 = 5, 18
        x1, y1 = x0 + math.cos(a - .8) * 14, y0 + math.sin(a - .8) * 14
        d.line((x0 + (x1 - x0) * .3, y0 + (y1 - y0) * .3, x1, y1), fill=TOX[2])
        d.point((int(x0 + (x1 - x0) * .3), int(y0 + (y1 - y0) * .3)), fill=RED[1])


@icon("ET_BARK", "brown")
def _(d, g):
    d.ellipse((4, 4, 19, 19), fill=WOOD[1])
    for r in (5, 3):
        d.ellipse((12 - r, 12 - r, 11 + r, 11 + r), outline=WOOD[0])
    d.line((4, 12, 19, 12), fill=WOOD[2])
    d.polygon([(17, 3), (20, 6), (17, 7)], fill=GRN[2])


@icon("ET_WAR_DANCE", "red")
def _(d, g):
    d.arc((3, 3, 20, 20), 0, 280, fill=FIRE[2], width=2)
    d.polygon([(12, 5), (15, 12), (12, 19), (9, 12)], fill=GRN[1])
    d.line((12, 5, 12, 19), fill=GRN[2])
    d.point((12, 4), fill=RED[1])


@icon("ET_JAGUAR", "gold")
def _(d, g):
    for k in range(3):
        d.line((6 + k * 4, 4, 9 + k * 4, 20), fill=(255, 210, 120, 255), width=2)
        d.line((6 + k * 4, 4, 9 + k * 4, 20), fill=W, width=1)


# ─── Druida ───
@icon("ET_BLOOD_HOWL", "red")
def _(d, g):
    d.ellipse((7, 3, 19, 15), fill=RED[1])
    d.ellipse((9, 4, 19, 13), fill=(70, 14, 20, 255))
    d.polygon([(5, 20), (8, 12), (11, 20)], fill=BONE[2])
    d.polygon([(11, 20), (14, 14), (17, 20)], fill=BONE[2])


@icon("ET_OAK_RING", "green")
def _(d, g):
    for k in range(6):
        a = k * math.pi / 3
        x, y = 12 + math.cos(a) * 7, 12 + math.sin(a) * 7
        d.ellipse((x - 2, y - 3, x + 2, y + 1), fill=GRN[1])
        d.line((x, y + 1, x, y + 3), fill=WOOD[1])
    d.ellipse((10, 10, 14, 14), outline=GRN[2])


@icon("ET_MISTLETOE", "gold")
def _(d, g):
    d.arc((5, 4, 19, 18), 160, 380, fill=GOLD[2], width=2)
    d.line((7, 15, 5, 20), fill=WOOD[1], width=2)
    for x, y in ((12, 13), (15, 15), (10, 16)):
        d.ellipse((x - 1, y - 1, x + 1, y + 1), fill=W)
    d.polygon([(13, 11), (17, 10), (15, 13)], fill=GRN[2])


@icon("ET_BEAR", "brown")
def _(d, g):
    d.ellipse((6, 10, 18, 20), fill=(70, 46, 30, 255))
    for x, y in ((6, 7), (10, 5), (14, 5), (18, 7)):
        d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(70, 46, 30, 255))
        d.point((x, y - 3), fill=BONE[2])
    d.ellipse((9, 13, 15, 18), fill=(110, 76, 50, 255))


def main():
    pv = sys.argv[1] if len(sys.argv) > 1 else None
    out = {}
    for id_, (th, fn) in ICONS.items():
        im = finish(th, fn)
        out[id_] = im
        for o in OUTS:
            if os.path.isdir(os.path.dirname(o)):
                os.makedirs(o, exist_ok=True)
                im.save(os.path.join(o, id_ + ".png"))
    if pv:
        S = Image.new("RGBA", (10 * 84, 4 * 84), (30, 28, 34, 255))
        for i, im in enumerate(out.values()):
            S.alpha_composite(im.resize((72, 72), Image.NEAREST), ((i % 10) * 84 + 6, (i // 10) * 84 + 6))
        S.save(pv)
    print(len(out), "ícones")


main()
