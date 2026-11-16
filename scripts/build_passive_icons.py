"""
Ícones próprios das PASSIVAS das árvores do Modo Infinito (nós p · top · nm de et-data.js), no estilo dos ícones de
habilidade do jogo (24×24, moldura arredondada, degradê na cor do tema, desenho com contorno escuro).
Cada passiva tem um desenho principal + um selo pequeno no canto (o que ela faz: ↑ aumenta, ↓ reduz dano, + cura,
×2 multiplica, relógio = tempo…). Tipo do nó: topo (escolha única) ganha moldura dourada; pesadelo, moldura carmesim
com chifres. Saída: assets/pixel-art/ui/passives.png + passives.json (atlas; quadro = id do nó).
O jogo monta uma textura "ip-<id>" de cada quadro e troca o ícone do nó (et-hooks / bloco PASSICONS).
Uso: python3 scripts/build_passive_icons.py [prévia.png]
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_skill_icons import THEME, INK, W, STEEL, GOLD, WOOD, BONE, ICE, FIRE, GRN, TOX, RED, PUR, GREY, frame, star  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "ui"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "ui")]
THEME.update({"blood": (110, 20, 30), "sky": (40, 96, 150), "earth": (96, 78, 44), "rose": (130, 50, 90), "slate": (52, 60, 72)})
BLU = [(40, 80, 170, 255), (80, 140, 240, 255), (180, 220, 255, 255)]
DARK = [(30, 26, 40, 255), (70, 60, 90, 255), (130, 120, 150, 255)]
YEL = [(170, 120, 20, 255), (240, 200, 60, 255), (255, 245, 170, 255)]


# ─────────────── desenhos principais (área ~3..20) ───────────────
def shield(d, pal=STEEL, rim=GOLD, boss=True):
    d.polygon([(5, 4), (18, 4), (18, 11), (11.5, 19), (5, 11)], fill=rim[1])
    d.polygon([(7, 6), (16, 6), (16, 11), (11.5, 16.5), (7, 11)], fill=pal[1])
    d.line((7, 6, 16, 6), fill=pal[2])
    if boss:
        d.rectangle((10, 8, 13, 11), fill=rim[2])


def heart(d, pal=RED):
    d.ellipse((4, 5, 12, 13), fill=pal[1]); d.ellipse((11, 5, 19, 13), fill=pal[1])
    d.polygon([(4.5, 10), (18.5, 10), (11.5, 19)], fill=pal[1])
    d.ellipse((6, 7, 9, 10), fill=pal[2])


def sword(d, pal=STEEL, hilt=GOLD, diag=True):
    if diag:
        d.line((6, 17, 17, 6), fill=pal[1], width=3); d.line((7, 16, 17, 6), fill=pal[2], width=1)
        d.line((5, 13, 10, 18), fill=hilt[1], width=2); d.line((3, 20, 6, 17), fill=WOOD[1], width=2)
    else:
        d.rectangle((10, 3, 13, 15), fill=pal[1]); d.line((11, 3, 11, 15), fill=pal[2])
        d.rectangle((7, 15, 16, 16), fill=hilt[1]); d.rectangle((10, 17, 13, 20), fill=WOOD[1])


def greatsword(d, pal=STEEL, hilt=GOLD):
    d.polygon([(4, 18), (15, 4), (19, 4), (19, 8), (6, 20)], fill=pal[1]); d.line((6, 18, 18, 5), fill=pal[2])
    d.line((3, 15, 9, 21), fill=hilt[1], width=2)


def axe(d, head=STEEL, haft=WOOD):
    d.line((6, 20, 15, 5), fill=haft[1], width=2)
    d.pieslice((9, 2, 21, 14), 200, 380, fill=head[1]); d.arc((9, 2, 21, 14), 200, 380, fill=head[2])


def club(d):
    d.line((5, 19, 13, 9), fill=WOOD[1], width=3)
    d.ellipse((10, 3, 19, 12), fill=WOOD[2]); d.ellipse((12, 5, 15, 8), fill=WOOD[1])
    for p in ((10, 6), (18, 5), (14, 12), (19, 10)):
        d.point(p, fill=STEEL[2])


def dagger(d, pal=STEEL, hilt=GOLD):
    d.polygon([(8, 15), (16, 4), (18, 6), (10, 17)], fill=pal[1]); d.line((9, 15, 17, 5), fill=pal[2])
    d.line((6, 13, 11, 18), fill=hilt[1], width=2); d.line((4, 19, 7, 16), fill=WOOD[1], width=2)


def twin(d):
    dagger(d); d.polygon([(15, 15), (7, 4), (5, 6), (13, 17)], fill=STEEL[1]); d.line((14, 15, 6, 5), fill=STEEL[2])


def bow(d, wood=WOOD, string=W):
    d.arc((2, 3, 16, 21), -70, 70, fill=wood[1], width=2)
    d.line((12, 4, 12, 20), fill=string)
    d.line((5, 12, 20, 12), fill=WOOD[2]); d.polygon([(20, 12), (17, 10), (17, 14)], fill=STEEL[2])


def arrow(d, head=STEEL, x0=4, y0=19, x1=19, y1=4):
    d.line((x0, y0, x1, y1), fill=WOOD[2], width=1)
    a = math.atan2(y1 - y0, x1 - x0)
    d.polygon([(x1 + math.cos(a) * 2, y1 + math.sin(a) * 2), (x1 + math.cos(a + 2.5) * 4, y1 + math.sin(a + 2.5) * 4), (x1 + math.cos(a - 2.5) * 4, y1 + math.sin(a - 2.5) * 4)], fill=head[1])
    for s in (2.4, -2.4):
        d.line((x0, y0, x0 + math.cos(a + s) * 3, y0 + math.sin(a + s) * 3), fill=W)


def flame(d, pal=FIRE):
    d.polygon([(11.5, 3), (17, 11), (17, 15), (14, 19), (9, 19), (6, 15), (6, 11), (9, 7), (10, 11)], fill=pal[0])
    d.polygon([(11.5, 8), (15, 13), (14, 17), (9, 17), (8, 13)], fill=pal[1])
    d.polygon([(11.5, 12), (13, 15), (11.5, 17), (10, 15)], fill=pal[2])


def snow(d, pal=ICE):
    for a in range(0, 180, 60):
        r = math.radians(a)
        d.line((11.5 - math.cos(r) * 8, 11.5 - math.sin(r) * 8, 11.5 + math.cos(r) * 8, 11.5 + math.sin(r) * 8), fill=pal[1], width=2)
    d.ellipse((9, 9, 14, 14), fill=pal[2])


def drop(d, pal=TOX, cx=11.5, top=3, r=6):
    d.polygon([(cx, top), (cx + r, top + 10), (cx - r, top + 10)], fill=pal[1])
    d.ellipse((cx - r, top + 6, cx + r, top + 6 + 2 * r), fill=pal[1])
    d.ellipse((cx - r + 2, top + 9, cx - r + 5, top + 12), fill=pal[2])


def skull(d, pal=BONE, eyes=INK):
    d.ellipse((5, 3, 18, 15), fill=pal[1]); d.rectangle((8, 13, 15, 18), fill=pal[1])
    d.ellipse((7, 8, 10, 11), fill=eyes); d.ellipse((13, 8, 16, 11), fill=eyes)
    d.line((10, 16, 10, 18), fill=pal[0]); d.line((13, 16, 13, 18), fill=pal[0])


def bone(d):
    d.line((6, 17, 17, 6), fill=BONE[1], width=3)
    for (x, y) in ((5, 16), (7, 18), (16, 5), (18, 7)):
        d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=BONE[2])


def paw(d, pal=BONE):
    d.ellipse((7, 10, 16, 18), fill=pal[1])
    for (x, y) in ((6, 7), (10, 4), (14, 4), (18, 7)):
        d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=pal[1])


def wolf(d, pal=GREY):
    d.polygon([(5, 4), (9, 8), (14, 8), (18, 4), (18, 12), (15, 17), (11.5, 19), (8, 17), (5, 12)], fill=pal[1])
    d.polygon([(9, 13), (14, 13), (11.5, 18)], fill=pal[2])
    d.point((8, 10), fill=YEL[2]); d.point((15, 10), fill=YEL[2]); d.point((11, 17), fill=INK); d.point((12, 17), fill=INK)


def fang(d, pal=BONE):
    d.polygon([(6, 4), (11, 4), (8.5, 19)], fill=pal[1]); d.polygon([(12, 4), (17, 4), (14.5, 15)], fill=pal[2])


def feather(d, pal=W):
    d.line((6, 19, 17, 4), fill=WOOD[2])
    d.polygon([(8, 15), (14, 3), (19, 5), (13, 16)], fill=pal)
    for k in range(4):
        d.line((10 + k * 2, 14 - k * 3, 16 + k, 13 - k * 3), fill=GREY[1])


def eagle(d):
    d.polygon([(2, 9), (11.5, 13), (21, 9), (17, 15), (11.5, 16), (6, 15)], fill=WOOD[1])
    d.ellipse((9, 9, 14, 14), fill=W); d.polygon([(13, 11), (16, 12), (13, 13)], fill=YEL[1])


def leaf(d, pal=GRN):
    d.ellipse((5, 4, 18, 19), fill=pal[1]); d.line((6, 18, 17, 5), fill=pal[2])


def tree(d):
    d.rectangle((10, 12, 13, 20), fill=WOOD[1])
    d.ellipse((4, 3, 19, 15), fill=GRN[1]); d.ellipse((7, 5, 12, 9), fill=GRN[2])


def roots(d):
    d.rectangle((10, 3, 13, 11), fill=WOOD[1])
    for (x, y) in ((4, 19), (8, 20), (15, 20), (19, 19)):
        d.line((11.5, 10, x, y), fill=WOOD[2], width=2)


def crown(d, pal=GOLD):
    d.polygon([(4, 16), (4, 7), (8, 11), (11.5, 5), (15, 11), (19, 7), (19, 16)], fill=pal[1])
    d.rectangle((4, 15, 19, 18), fill=pal[0]); d.point((11, 13), fill=RED[2]); d.point((7, 14), fill=BLU[2]); d.point((16, 14), fill=GRN[2])


def eye(d, iris=RED):
    d.ellipse((3, 7, 20, 16), fill=W); d.ellipse((8, 7, 15, 16), fill=iris[1]); d.ellipse((10, 9, 13, 14), fill=INK)


def crosshair(d, pal=RED):
    d.ellipse((5, 5, 18, 18), outline=pal[1], width=2); d.ellipse((9, 9, 14, 14), fill=pal[2])
    for (a, b, c, e) in ((11.5, 2, 11.5, 7), (11.5, 16, 11.5, 21), (2, 11.5, 7, 11.5), (16, 11.5, 21, 11.5)):
        d.line((a, b, c, e), fill=W)


def hourglass(d):
    d.rectangle((5, 3, 18, 4), fill=WOOD[1]); d.rectangle((5, 19, 18, 20), fill=WOOD[1])
    d.polygon([(7, 5), (16, 5), (11.5, 11.5), (16, 18), (7, 18), (11.5, 11.5)], fill=ICE[2])
    d.polygon([(9, 15), (14, 15), (15, 18), (8, 18)], fill=YEL[1])


def wings(d, pal=W):
    for s in (-1, 1):
        cx = 11.5 + s * 1
        d.polygon([(cx, 9), (cx + s * 9, 4), (cx + s * 8, 10), (cx + s * 9, 13), (cx + s * 6, 16), (cx, 13)], fill=pal)


def boot(d):
    d.polygon([(7, 3), (13, 3), (13, 14), (19, 16), (19, 19), (7, 19)], fill=WOOD[1])
    d.line((7, 6, 13, 6), fill=WOOD[2]);
    for y in (8, 12, 16):
        d.line((2, y, 5, y), fill=(220, 230, 240, 200))


def fist(d, pal=BONE):
    d.rounded_rectangle((6, 7, 17, 17), 3, fill=pal[1])
    for x in (7, 10, 13):
        d.line((x + 1, 7, x + 1, 11), fill=pal[0])
    d.rectangle((8, 16, 15, 20), fill=WOOD[1])


def crystal(d, pal=PUR):
    d.polygon([(11.5, 2), (17, 9), (11.5, 21), (6, 9)], fill=pal[1]); d.polygon([(11.5, 2), (11.5, 21), (6, 9)], fill=pal[0])
    d.line((8, 9, 15, 9), fill=pal[2])


def moon(d, pal=YEL):
    d.ellipse((4, 4, 19, 19), fill=pal[1]); d.ellipse((8, 2, 22, 16), fill=(0, 0, 0, 0))


def sun(d):
    for a in range(0, 360, 45):
        r = math.radians(a)
        d.line((11.5 + math.cos(r) * 6, 11.5 + math.sin(r) * 6, 11.5 + math.cos(r) * 10, 11.5 + math.sin(r) * 10), fill=YEL[2], width=2)
    d.ellipse((6, 6, 17, 17), fill=FIRE[1]); d.ellipse((8, 8, 13, 13), fill=YEL[2])


def coin(d):
    d.ellipse((4, 4, 19, 19), fill=GOLD[0]); d.ellipse((6, 6, 17, 17), fill=GOLD[1]); d.text((9, 6), "$", fill=GOLD[2])


def bolt(d, pal=YEL):
    d.polygon([(13, 2), (6, 13), (11, 13), (9, 21), (17, 9), (12, 9)], fill=pal[1])


def swirl(d, pal=PUR):
    d.arc((3, 3, 20, 20), 0, 300, fill=pal[1], width=2); d.arc((7, 7, 16, 16), 120, 420, fill=pal[2], width=2); d.ellipse((10, 10, 13, 13), fill=pal[2])


def smoke(d):
    for (x, y, r) in ((8, 13, 5), (14, 11, 5), (11, 7, 4), (16, 16, 3), (6, 17, 3)):
        d.ellipse((x - r, y - r, x + r, y + r), fill=GREY[1] if r > 3 else GREY[2])


def mask(d):
    d.ellipse((4, 6, 19, 17), fill=DARK[1]); d.ellipse((6, 9, 10, 12), fill=RED[2]); d.ellipse((13, 9, 17, 12), fill=RED[2])


def scythe(d):
    d.line((7, 20, 14, 4), fill=WOOD[1], width=2)
    d.chord((3, 1, 21, 15), 190, 330, fill=STEEL[1]); d.arc((3, 1, 21, 15), 190, 330, fill=STEEL[2])


def chain(d):
    for k in range(3):
        x, y = 4 + k * 5, 15 - k * 5
        d.ellipse((x, y, x + 7, y + 6), outline=STEEL[1], width=2)


def trap(d):
    d.arc((3, 6, 20, 22), 180, 360, fill=STEEL[1], width=2)
    for x in range(5, 20, 3):
        d.polygon([(x, 14), (x + 1.5, 9), (x + 3, 14)], fill=STEEL[2])
    d.line((3, 18, 20, 18), fill=STEEL[0], width=2)


def wave(d, pal=STEEL):
    for k, r in enumerate((10, 7, 4)):
        d.arc((11.5 - r - 4, 11.5 - r, 11.5 + r - 4, 11.5 + r), -60, 60, fill=pal[2 - min(k, 1)], width=2)
    d.line((3, 12, 8, 12), fill=pal[1], width=2)


def tooth_drop(d):
    fang(d); drop(d, RED, 16, 11, 3)


def ghost(d):
    d.pieslice((5, 3, 18, 16), 180, 360, fill=(220, 230, 255, 230)); d.rectangle((5, 9, 18, 16), fill=(220, 230, 255, 230))
    for x in (5, 9, 13):
        d.polygon([(x, 16), (x + 2, 19), (x + 4, 16)], fill=(220, 230, 255, 230))
    d.ellipse((8, 8, 10, 10), fill=INK); d.ellipse((13, 8, 15, 10), fill=INK)


def bear(d):
    d.ellipse((4, 6, 19, 19), fill=WOOD[1]); d.ellipse((3, 3, 8, 8), fill=WOOD[1]); d.ellipse((15, 3, 20, 8), fill=WOOD[1])
    d.ellipse((8, 12, 15, 18), fill=WOOD[2]); d.point((8, 10), fill=INK); d.point((15, 10), fill=INK); d.point((11, 13), fill=INK); d.point((12, 13), fill=INK)


def boar(d):
    d.ellipse((4, 6, 19, 18), fill=WOOD[0]); d.ellipse((8, 12, 15, 18), fill=RED[2])
    d.polygon([(7, 15), (5, 10), (8, 13)], fill=BONE[2]); d.polygon([(16, 15), (18, 10), (15, 13)], fill=BONE[2])
    d.point((8, 9), fill=INK); d.point((15, 9), fill=INK)


def jaguar(d):
    d.ellipse((4, 4, 19, 19), fill=YEL[1])
    for (x, y) in ((7, 8), (15, 8), (6, 13), (17, 13), (11, 6)):
        d.ellipse((x - 1, y - 1, x + 1, y + 1), fill=INK)
    d.polygon([(9, 13), (14, 13), (11.5, 16)], fill=INK)


def potion(d, pal=BLU):
    d.rectangle((10, 3, 13, 7), fill=GREY[2]); d.ellipse((5, 7, 18, 20), fill=pal[1]); d.ellipse((7, 9, 10, 12), fill=pal[2])


def spikes(d, pal=GRN):
    d.ellipse((6, 6, 17, 17), fill=pal[1])
    for a in range(0, 360, 45):
        r = math.radians(a)
        d.polygon([(11.5 + math.cos(r) * 5, 11.5 + math.sin(r) * 5), (11.5 + math.cos(r + .3) * 4, 11.5 + math.sin(r + .3) * 4), (11.5 + math.cos(r) * 10, 11.5 + math.sin(r) * 10)], fill=pal[2])


def tower(d):
    d.rectangle((7, 6, 16, 20), fill=GREY[1])
    for x in (7, 10, 13, 16):
        d.rectangle((x - 1, 3, x, 6), fill=GREY[1])
    d.rectangle((10, 10, 13, 14), fill=INK)


def campfire(d):
    d.line((5, 19, 18, 15), fill=WOOD[1], width=2); d.line((5, 15, 18, 19), fill=WOOD[1], width=2)
    flame(d) if False else d.polygon([(11.5, 4), (16, 12), (14, 16), (9, 16), (7, 12)], fill=FIRE[1])
    d.polygon([(11.5, 9), (13.5, 13), (11.5, 15), (9.5, 13)], fill=FIRE[2])


def meteor(d):
    for k in range(3):
        d.line((3 + k * 3, 3, 12 + k * 2, 12), fill=FIRE[0] if k else FIRE[1], width=2)
    d.ellipse((10, 10, 19, 19), fill=FIRE[1]); d.ellipse((12, 12, 15, 15), fill=YEL[2])


def lava(d):
    d.polygon([(2, 19), (6, 9), (9, 13), (12, 5), (16, 13), (21, 19)], fill=GREY[0]); d.polygon([(9, 13), (12, 6), (15, 13), (12, 19)], fill=FIRE[1])


def mirror(d):
    d.ellipse((5, 3, 18, 17), fill=GOLD[1]); d.ellipse((7, 5, 16, 15), fill=ICE[1]); d.line((9, 7, 12, 10), fill=W)
    d.rectangle((10, 17, 13, 21), fill=GOLD[0])


def sarcophagus(d):
    d.polygon([(8, 3), (15, 3), (18, 9), (16, 20), (7, 20), (5, 9)], fill=ICE[1]); d.polygon([(10, 6), (13, 6), (14, 9), (13, 17), (10, 17), (9, 9)], fill=ICE[2])


def explosion(d, pal=FIRE):
    star(d, 11.5, 11.5, 10, 4, 8, pal[1]); star(d, 11.5, 11.5, 6, 2.5, 8, pal[2])


def plague(d):
    for (x, y, r) in ((8, 9, 4), (15, 8, 4), (12, 15, 5)):
        d.ellipse((x - r, y - r, x + r, y + r), fill=TOX[1])
    skull(d, BONE, INK) if False else None
    d.ellipse((9, 10, 14, 15), fill=TOX[2])


def soul(d):
    d.polygon([(11.5, 2), (17, 10), (16, 17), (11.5, 20), (7, 17), (6, 10)], fill=(150, 240, 220, 230))
    d.ellipse((8, 10, 15, 17), fill=(220, 255, 245, 255)); d.point((10, 12), fill=INK); d.point((13, 12), fill=INK)


def hand_skel(d):
    d.rectangle((8, 11, 15, 19), fill=BONE[1])
    for x in (8, 10, 12, 14):
        d.line((x, 4, x, 11), fill=BONE[2], width=1)


def knight(d):
    d.polygon([(6, 20), (6, 9), (11.5, 3), (17, 9), (17, 20)], fill=STEEL[1]); d.rectangle((8, 9, 15, 11), fill=INK)
    d.polygon([(11.5, 3), (13, 1), (12, 6)], fill=RED[1])


def pinwheel(d):
    for a in range(0, 360, 90):
        r = math.radians(a)
        d.polygon([(11.5, 11.5), (11.5 + math.cos(r) * 10, 11.5 + math.sin(r) * 10), (11.5 + math.cos(r + .8) * 7, 11.5 + math.sin(r + .8) * 7)], fill=STEEL[1])
    d.ellipse((9, 9, 14, 14), fill=GOLD[1])


def paint(d):
    for k, c in enumerate((RED[1], INK, RED[1])):
        y = 6 + k * 5
        d.line((4, y + 2, 8, y, 12, y + 2, 16, y, 20, y + 2), fill=c, width=2)


def stars3(d):
    star(d, 11.5, 11.5, 9, 3.5, 4, YEL[2]); star(d, 18, 5, 3, 1.2, 4, W); star(d, 5, 18, 2.5, 1, 4, W)


def anchor(d):
    d.line((11.5, 4, 11.5, 19), fill=STEEL[1], width=2); d.arc((4, 9, 19, 21), 20, 160, fill=STEEL[1], width=2); d.ellipse((9, 2, 14, 7), outline=STEEL[1], width=2)


def mana(d):
    drop(d, BLU)


def blood(d):
    drop(d, RED)


def poison(d):
    drop(d, TOX)


G = {k: v for k, v in globals().items() if callable(v) and k not in ("frame", "star", "main", "render", "badge", "sub", "finish2")}


# ─────────────── selos pequenos no canto (7×7, canto inferior direito) ───────────────
def sub(d, kind):
    x, y = 15, 15
    if not kind:
        return
    d.rounded_rectangle((x, y, x + 7, y + 7), 2, fill=INK)
    c = {"up": GRN[2], "down": ICE[2], "plus": RED[2], "x": YEL[2], "clock": W, "skull": BONE[2], "crit": YEL[2], "speed": W, "fire": FIRE[2], "drop": TOX[2], "mana": BLU[2], "one": GOLD[2]}[kind]
    if kind == "up":
        d.polygon([(x + 3.5, y + 1), (x + 6, y + 4), (x + 1, y + 4)], fill=c); d.rectangle((x + 3, y + 4, x + 4, y + 6), fill=c)
    elif kind == "down":
        d.polygon([(x + 3.5, y + 6), (x + 6, y + 3), (x + 1, y + 3)], fill=c); d.rectangle((x + 3, y + 1, x + 4, y + 3), fill=c)
    elif kind == "plus":
        d.rectangle((x + 3, y + 1, x + 4, y + 6), fill=c); d.rectangle((x + 1, y + 3, x + 6, y + 4), fill=c)
    elif kind == "x":
        d.line((x + 1, y + 1, x + 6, y + 6), fill=c); d.line((x + 1, y + 6, x + 6, y + 1), fill=c)
    elif kind == "clock":
        d.ellipse((x + 1, y + 1, x + 6, y + 6), outline=c); d.line((x + 3.5, y + 2, x + 3.5, y + 4, x + 5, y + 4), fill=c)
    elif kind == "skull":
        d.ellipse((x + 1, y + 1, x + 6, y + 5), fill=c); d.point((x + 2, y + 3), fill=INK); d.point((x + 5, y + 3), fill=INK); d.rectangle((x + 2, y + 5, x + 5, y + 6), fill=c)
    elif kind == "crit":
        star(d, x + 3.5, y + 3.5, 3.4, 1.3, 4, c)
    elif kind == "speed":
        for k in range(3):
            d.line((x + 1, y + 2 + k * 2, x + 6 - k, y + 2 + k * 2), fill=c)
    elif kind == "fire":
        d.polygon([(x + 3.5, y + 1), (x + 6, y + 5), (x + 3.5, y + 6), (x + 1, y + 5)], fill=c)
    elif kind in ("drop", "mana"):
        d.polygon([(x + 3.5, y + 1), (x + 6, y + 5), (x + 1, y + 5)], fill=c); d.ellipse((x + 1, y + 3, x + 6, y + 6), fill=c)
    elif kind == "one":
        d.rectangle((x + 3, y + 1, x + 4, y + 6), fill=c); d.point((x + 2, y + 2), fill=c)


def finish2(theme, main_fn, sub_kind, ntype):
    base = frame(theme)
    g = Image.new("RGBA", (24, 24))
    main_fn(ImageDraw.Draw(g))
    a = np.asarray(g)[..., 3] > 0
    ring = ndimage.binary_dilation(a, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & ~a
    ring[[0, -1], :] = False
    ring[:, [0, -1]] = False
    o = np.asarray(base).copy()
    o[ring] = INK
    out = Image.fromarray(o)
    out.alpha_composite(g)
    d = ImageDraw.Draw(out)
    if ntype == "top":      # escolha única: moldura dourada
        d.rounded_rectangle((0, 0, 23, 23), 4, outline=GOLD[1]); d.rounded_rectangle((1, 1, 22, 22), 3, outline=GOLD[2] if False else (255, 226, 120, 140))
    elif ntype == "nm":     # pesadelo: moldura carmesim e chifres
        d.rounded_rectangle((0, 0, 23, 23), 4, outline=(200, 30, 50, 255))
        d.polygon([(1, 5), (2, 0), (5, 2)], fill=(200, 30, 50, 255)); d.polygon([(22, 5), (21, 0), (18, 2)], fill=(200, 30, 50, 255))
    sub(d, sub_kind)
    m = Image.new("L", (24, 24), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, 23, 23), 4, fill=255)
    out.putalpha(Image.fromarray(np.minimum(np.asarray(out)[..., 3], np.asarray(m))))
    return out


def lam(fn, *a, **k):
    return lambda d: fn(d, *a, **k)


# ─────────────── cada passiva: (tema, desenho, selo) ───────────────
P = {
    # Guerreiro — defesa
    "wd_post": ("steel", shield, "down"), "wd_pele": ("slate", lam(shield, GREY, STEEL, False), "up"),
    "wd_rei": ("gold", crown, "one"), "wd_balu": ("steel", lam(shield, STEEL, RED), "x"),
    "wd_n1": ("night", lam(shield, GREY, GREY, False), "down"), "wd_n2": ("night", tree, "x"),
    # Guerreiro — ataque
    "wa_imp": ("red", boot, "speed"), "wa_fio": ("steel", sword, "crit"), "wa_her": ("gold", lam(wave, STEEL), "x"),
    "wa_peso": ("brown", axe, "up"), "wa_exec": ("blood", lam(axe, RED), "skull"),
    "wa_n1": ("night", lam(fist, RED), "x"), "wa_n2": ("night", blood, "plus"),
    # Samurai
    "bd_resp": ("teal", lam(swirl, ICE), "plus"), "bd_kam": ("steel", greatsword, "down"), "bd_pes": ("slate", feather, "clock"),
    "bd_disc": ("gold", lam(shield, GOLD, YEL), "plus"), "bd_jur": ("blood", lam(heart, RED), "down"), "bd_mon": ("brown", tower, "fire"),
    "bd_n1": ("night", lam(smoke), "down"), "bd_n2": ("night", lam(swirl, ICE), "plus"),
    "ba_afi": ("steel", greatsword, "crit"), "ba_peso": ("brown", club, "up"), "ba_marca": ("blood", lam(crosshair, RED), "drop"),
    "ba_saku": ("fire", lava, "fire"), "ba_batto": ("gold", lam(sword, STEEL, GOLD, False), "one"),
    "ba_n1": ("night", lam(eye, YEL), "crit"), "ba_n2": ("night", lam(explosion, YEL), "x"),
    # Arqueira
    "ard_fant": ("purple", ghost, "clock"), "ard_torre": ("steel", tower, "up"),
    "ard_n1": ("night", wings, "down"), "ard_n2": ("night", feather, "down"),
    "ara_pont": ("steel", lam(arrow, STEEL), "x"), "ara_marc": ("red", lam(crosshair, RED), "up"),
    "ara_um": ("gold", lam(arrow, GOLD), "skull"), "ara_n1": ("night", lam(bow, WOOD, FIRE[2]), "x"), "ara_n2": ("night", bow, "speed"),
    # Maga
    "md_manto": ("ice", mana, "down"), "md_pgelo": ("ice", snow, "down"), "md_sarc": ("ice", sarcophagus, "one"),
    "md_inv": ("ice", lam(crystal, ICE), "x"), "md_n1": ("night", lam(crystal, BLU), "down"), "md_n2": ("night", lam(potion, BLU), "up"),
    "ma_prec": ("purple", lam(crystal, PUR), "crit"), "ma_sobre": ("purple", lam(bolt, PUR), "x"), "ma_sol": ("fire", sun, "clock"),
    "ma_zero": ("ice", lam(explosion, ICE), "skull"), "ma_n1": ("night", flame, "x"), "ma_n2": ("night", lam(swirl, PUR), "x"),
    # Ladina
    "rd_refl": ("slate", feather, "up"), "rd_contra": ("night", dagger, "crit"), "rd_lamf": ("slate", smoke, "x"),
    "rd_ning": ("purple", mask, "one"), "rd_n1": ("night", smoke, "down"), "rd_n2": ("night", paw, "up"),
    "ra_pressa": ("red", lam(wings, W), "speed"), "ra_ven": ("toxic", lam(dagger, TOX), "drop"), "ra_gc": ("steel", dagger, "crit"),
    "ra_milp": ("gold", twin, "x"), "ra_exe": ("blood", lam(dagger, RED), "skull"), "ra_n1": ("night", poison, "x"), "ra_n2": ("night", lam(blood), "crit"),
    # Necromante
    "nd_pacto": ("purple", lam(heart, PUR), "down"), "nd_duro": ("night", bone, "plus"), "nd_medo": ("purple", lam(eye, PUR), "down"),
    "nd_rei": ("night", knight, "one"), "nd_nao": ("teal", soul, "one"), "nd_n1": ("night", bone, "down"), "nd_n2": ("night", hand_skel, "x"),
    "na_expl": ("toxic", lam(explosion, TOX), "skull"), "na_peste": ("toxic", plague, "x"), "na_ceif": ("night", scythe, "up"),
    "na_n1": ("night", lam(skull, TOX), "x"), "na_n2": ("night", soul, "plus"),
    # Caçador
    "hd_pel": ("brown", lam(wolf, GREY), "down"), "hd_acamp": ("brown", trap, "x"), "hd_n1": ("night", lam(paw, WOOD), "down"), "hd_n2": ("night", wolf, "plus"),
    "ha_olho": ("green", lam(eye, GRN), "crit"), "ha_pres": ("brown", fang, "up"), "ha_ponto": ("steel", chain, "up"),
    "ha_ouro": ("gold", coin, "skull"), "ha_rei": ("gold", lam(wolf, YEL), "one"), "ha_n1": ("night", lam(crosshair, YEL), "x"), "ha_n2": ("night", tooth_drop, "x"),
    # Xamã
    "sd_jen": ("earth", paint, "up"), "sd_raiz": ("green", roots, "one"), "sd_esg": ("sky", eagle, "clock"),
    "sd_n1": ("night", leaf, "down"), "sd_n2": ("night", lam(potion, GRN), "plus"),
    "sa_ponta": ("toxic", lam(arrow, TOX), "drop"), "sa_fio": ("steel", lam(sword, STEEL, WOOD), "crit"), "sa_para": ("toxic", lam(bolt, TOX), "clock"),
    "sa_onca": ("gold", jaguar, "one"), "sa_rev": ("sky", lam(feather, (200, 160, 110, 255)), "x"), "sa_n1": ("night", lam(spikes, TOX), "x"), "sa_n2": ("night", lam(fist, YEL), "x"),
    # Druida
    "dd_inst": ("green", paw, "plus"), "dd_urso": ("brown", bear, "one"), "dd_ren": ("green", tree, "one"),
    "dd_n1": ("night", lam(leaf, WOOD), "down"), "dd_n2": ("night", boar, "plus"),
    "da_garr": ("red", lam(fang, [W, W, (255, 255, 255, 255)]), "crit"), "da_corte": ("gold", scythe, "up"), "da_samh": ("night", pinwheel, "clock"),
    "da_n1": ("night", lam(paw, RED), "x"), "da_n2": ("night", moon, "clock"),
    # complementos
    "ard_passo": ("sky", boot, "speed"), "ard_dist": ("sky", lam(bow, WOOD), "down"), "ara_rap": ("green", lam(arrow, STEEL, 3, 14, 20, 9), "speed"),
    "ara_saku": ("fire", lam(arrow, FIRE), "fire"), "ara_cexp": ("fire", meteor, "x"),
    "md_conc": ("ice", lam(potion, BLU), "clock"), "ma_comb": ("fire", flame, "clock"), "ma_frio": ("ice", lam(snow, ICE), "up"),
    "na_mald": ("purple", lam(skull, PUR), "clock"), "na_colh": ("night", lam(scythe), "mana"),
    "hd_lobo": ("brown", wolf, "plus"), "hd_armd": ("brown", trap, "down"), "hd_rastro": ("ice", lam(trap), "clock"), "hd_han": ("teal", lam(ghost), "one"),
    "sd_trov": ("sky", bolt, "x"), "sd_suma": ("green", tree, "plus"),
    "dd_couro": ("brown", boar, "up"), "dd_casca": ("earth", lam(shield, WOOD, WOOD, False), "up"), "dd_visco": ("green", lam(leaf, GRN), "plus"),
    "da_sang": ("blood", lam(blood), "clock"), "da_ceu": ("sky", eagle, "speed"), "da_temp": ("sky", lam(feather, W), "x"), "da_lua": ("night", moon, "one"),
}


def node_types():
    import re
    s = open(os.path.join(ROOT, "scripts", "source", "et-data.js"), encoding="utf-8").read()
    return {m.group(1): m.group(2) for m in re.finditer(r'__ETN\("([a-z0-9_]+)","([a-z]+)"', s)}


def main():
    T = node_types()
    want = [k for k, t in T.items() if t in ("p", "top", "nm")]
    miss = [k for k in want if k not in P]
    if miss:
        print("sem ícone:", miss)
    keys = [k for k in want if k in P]
    cols = 16
    rows = (len(keys) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * 24, rows * 24))
    frames = {}
    for n, k in enumerate(keys):
        th, fn, sb = P[k]
        im = finish2(th, fn, sb, T[k])
        x, y = (n % cols) * 24, (n // cols) * 24
        sheet.alpha_composite(im, (x, y))
        frames[k] = {"frame": {"x": x, "y": y, "w": 24, "h": 24}, "rotated": False, "trimmed": False,
                     "spriteSourceSize": {"x": 0, "y": 0, "w": 24, "h": 24}, "sourceSize": {"w": 24, "h": 24}}
    meta = {"frames": frames, "meta": {"image": "passives.png", "size": {"w": sheet.width, "h": sheet.height}, "scale": "1"}}
    for o in OUTS:
        if not os.path.isdir(os.path.dirname(o)):
            continue
        os.makedirs(o, exist_ok=True)
        sheet.save(os.path.join(o, "passives.png"), optimize=True)
        json.dump(meta, open(os.path.join(o, "passives.json"), "w"), separators=(",", ":"))
    print(len(keys), "ícones de passivas")
    if len(sys.argv) > 1:
        big = Image.new("RGBA", (cols * 80 + 8, rows * 80 + 8), (24, 26, 34, 255))
        for n, k in enumerate(keys):
            th, fn, sb = P[k]
            big.alpha_composite(finish2(th, fn, sb, T[k]).resize((72, 72), Image.NEAREST), (8 + (n % cols) * 80, 8 + (n // cols) * 80))
        big.save(sys.argv[1])


if __name__ == "__main__":
    main()
