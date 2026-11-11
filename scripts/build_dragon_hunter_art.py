"""
Arte do conjunto lendário "Caçador de Dragão" (Guerreiro).
Gera, a partir da folha do Guerreiro (warrior-pack-t0-body.png), uma folha nova com a armadura de escamas
de dragão (placas carmesim, bordas de obsidiana, brilhos dourados, manto de pele escura e crista de escamas
no elmo) e os 5 ícones dos itens. Re-executável.
  python3 scripts/build_dragon_hunter_art.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "assets", "pixel-art", "characters")
SRC = os.path.join(CH, "warrior-pack-t0-body.png")
OUT = os.path.join(CH, "warrior-dh-body.png")
ICONS = os.path.join(ROOT, "assets", "pixel-art", "items-hd", "dh")
FW = FH = 128
SKIP_CREST = {34, 35, 36}  # morte (deitado)

# paleta: aço do Guerreiro -> escamas de dragão
MAP = {
    (40, 44, 60): (24, 14, 18),      # sombra mais funda da placa
    (72, 82, 98): (46, 22, 28),      # sombra da placa
    (94, 113, 142): (112, 26, 30),   # meio-tom
    (163, 167, 194): (138, 34, 34),  # placa (cor principal)
    (184, 204, 216): (196, 74, 46),  # luz
    (220, 234, 238): (240, 190, 92), # brilho dourado
    (223, 224, 232): (96, 86, 82),   # pele do colar -> pele escura
    (166, 158, 154): (62, 54, 52),
    (128, 123, 122): (42, 36, 36),
    (103, 57, 49): (70, 40, 30),     # couro -> couro tostado
    (79, 52, 47): (52, 30, 24),
    (59, 32, 39): (40, 20, 22),
    (133, 95, 57): (150, 98, 40),
    (211, 151, 65): (246, 196, 84),  # fivela dourada
}
PLATE_MAIN = (138, 34, 34)
PLATE_SCALE = (100, 24, 28)
SOLID = set(MAP)
OUTLINE = (14, 8, 8)
CREST = [(200, 52, 36), (240, 120, 50), (246, 196, 84)]


def near(c, table):
    best, bd = None, 1e9
    for k in table:
        d = sum((a - b) ** 2 for a, b in zip(c, k))
        if d < bd:
            best, bd = k, d
    return best if bd <= 300 else None


def recolor(fr):
    px = fr.load()
    for y in range(FH):
        for x in range(FW):
            r, g, b, a = px[x, y]
            if a < 128:
                continue
            k = near((r, g, b), MAP)
            if not k:
                continue
            c = MAP[k]
            # textura de escamas nas placas: pequenas meias-luas escuras em fileiras alternadas
            if c == PLATE_MAIN and y % 3 == 0 and (x + (y // 3) * 2) % 4 == 0:
                c = PLATE_SCALE
            px[x, y] = (*c, a)


def helmet_top(fr):
    """Topo do elmo: primeira linha com um trecho sólido largo que continua sólido por várias linhas abaixo."""
    px = fr.load()

    def runs(y):
        out, s = [], None
        for x in range(FW + 1):
            on = x < FW and px[x, y][3] >= 128
            if on and s is None:
                s = x
            elif not on and s is not None:
                out.append((s, x - 1)); s = None
        return out

    for y in range(FH - 8):
        for a, b in runs(y):
            if b - a + 1 < 6:
                continue
            ok = True
            for dy in range(1, 6):
                if not any(min(b, b2) - max(a, a2) >= 4 for a2, b2 in runs(y + dy)):
                    ok = False; break
            if ok:
                return y, a, b
    return None


def crest(fr):
    t = helmet_top(fr)
    if not t:
        return
    y0, a, b = t
    px = fr.load()
    cx = (a + b) // 2
    # crista de escamas: barbatanas do fundo (esquerda) para a frente, como a espinha de um dragão
    fins = [(cx - 4, 2), (cx - 2, 3), (cx, 4), (cx + 2, 2)]
    for fx, h in fins:
        for i in range(h):
            yy = y0 - 1 - i
            if yy < 0:
                continue
            col = CREST[0] if i < h - 2 else CREST[1] if i < h - 1 else CREST[2]
            for xx in (fx, fx + 1) if i < h - 1 else (fx + 1,):
                px[xx, yy] = (*col, 255)
    # contorno escuro da crista
    pts = [(x, y) for y in range(FH) for x in range(FW) if px[x, y][3] and px[x, y][:3] in CREST]
    for x, y in pts:
        for dx, dy in ((-1, 0), (1, 0), (0, -1)):
            X, Y = x + dx, y + dy
            if 0 <= X < FW and 0 <= Y < FH and px[X, Y][3] < 128:
                px[X, Y] = (*OUTLINE, 255)
    # olho em brasa na viseira: pixel escuro mais à direita, cercado de placa, logo abaixo do topo
    for yy in range(y0 + 3, y0 + 8):
        for xx in range(b, a, -1):
            c = px[xx, yy]
            if c[3] >= 128 and sum(c[:3]) < 60:
                up, dn = px[xx, yy - 1], px[xx, yy + 1]
                if up[3] >= 128 and dn[3] >= 128 and sum(up[:3]) > 150 and sum(dn[:3]) > 150:
                    px[xx, yy] = (255, 150, 48, 255)
                    return


def build_sheet():
    im = Image.open(SRC).convert("RGBA")
    n = im.width // FW
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    for i in range(n):
        fr = im.crop((i * FW, 0, i * FW + FW, FH))
        if i not in SKIP_CREST:
            crest(fr)
        recolor(fr)
        out.paste(fr, (i * FW, 0))
    out.save(OUT, optimize=True)
    print("folha:", os.path.relpath(OUT, ROOT), n, "quadros")


# ── ícones (80×80, mesmo estilo dos ícones HD: contorno escuro, brilho e halo) ──
O = (20, 10, 12, 255)
RED, RED_D, RED_L = (168, 40, 36, 255), (104, 22, 26, 255), (214, 84, 56, 255)
OBS, OBS_L = (44, 30, 36, 255), (78, 60, 66, 255)
GOLD, GOLD_D = (242, 192, 88, 255), (176, 120, 44, 255)
EMBER = (255, 150, 48, 255)


def scales(d, box, step=6):
    x0, y0, x1, y1 = box
    for r, y in enumerate(range(y0, y1, step)):
        for x in range(x0 + (r % 2) * (step // 2), x1, step):
            d.arc((x - 3, y - 2, x + 3, y + 4), 0, 180, fill=RED_D, width=1)


def halo(img):
    g = Image.new("RGBA", img.size, (0, 0, 0, 0))
    a = img.split()[3].point(lambda v: 255 if v else 0)
    for r in (3, 2, 1):
        m = a.resize((80 + 2 * r, 80 + 2 * r)).crop((r, r, 80 + r, 80 + r))
        g.paste((255, 170, 70, 40 * (4 - r)), (0, 0), m)
    g.alpha_composite(img)
    return g


def icon_helm():
    im = Image.new("RGBA", (80, 80)); d = ImageDraw.Draw(im)
    d.polygon([(20, 62), (18, 34), (28, 18), (52, 18), (62, 34), (60, 62)], fill=RED, outline=O)
    d.polygon([(24, 58), (23, 36), (31, 24), (40, 22), (40, 58)], fill=RED_L)
    scales(d, (26, 28, 56, 44))
    d.rectangle((24, 40, 56, 47), fill=OBS, outline=O)
    d.rectangle((44, 42, 48, 45), fill=EMBER)
    d.line((40, 47, 40, 60), fill=O, width=2)
    for i, (x, h) in enumerate([(26, 8), (33, 12), (40, 15), (47, 11)]):
        d.polygon([(x, 20), (x + 6, 20), (x + 2, 20 - h)], fill=GOLD if i == 2 else (220, 80, 40, 255), outline=O)
    d.line((20, 62, 60, 62), fill=GOLD_D, width=2)
    return halo(im)


def icon_armor():
    im = Image.new("RGBA", (80, 80)); d = ImageDraw.Draw(im)
    d.polygon([(14, 26), (28, 16), (52, 16), (66, 26), (60, 40), (56, 36), (56, 66), (24, 66), (24, 36), (20, 40)], fill=RED, outline=O)
    scales(d, (27, 24, 54, 64))
    d.polygon([(30, 16), (40, 26), (50, 16)], fill=OBS, outline=O)
    d.polygon([(12, 26), (26, 18), (30, 28), (18, 34)], fill=GOLD, outline=O)
    d.polygon([(68, 26), (54, 18), (50, 28), (62, 34)], fill=GOLD, outline=O)
    d.ellipse((35, 32, 45, 42), fill=EMBER, outline=O)
    d.line((24, 58, 56, 58), fill=GOLD_D, width=3)
    return halo(im)


def icon_boots():
    im = Image.new("RGBA", (80, 80)); d = ImageDraw.Draw(im)
    for ox in (0, 20):
        d.polygon([(18 + ox, 14), (34 + ox, 14), (34 + ox, 52), (44 + ox, 58), (44 + ox, 66), (16 + ox, 66), (16 + ox, 40)], fill=RED, outline=O)
        scales(d, (20 + ox, 20, 32 + ox, 50), 5)
        d.rectangle((16 + ox, 14, 34 + ox, 19), fill=OBS, outline=O)
        d.polygon([(34 + ox, 22), (40 + ox, 18), (36 + ox, 28)], fill=GOLD, outline=O)
        d.line((16 + ox, 64, 44 + ox, 64), fill=GOLD_D, width=3)
    return halo(im)


def icon_shield():
    im = Image.new("RGBA", (80, 80)); d = ImageDraw.Draw(im)
    d.polygon([(14, 14), (66, 14), (64, 44), (40, 70), (16, 44)], fill=GOLD, outline=O)
    d.polygon([(19, 19), (61, 19), (59, 43), (40, 64), (21, 43)], fill=OBS)
    # asas de dragão estilizadas em brasa
    d.polygon([(40, 30), (24, 22), (28, 34), (22, 38), (34, 42)], fill=RED, outline=O)
    d.polygon([(40, 30), (56, 22), (52, 34), (58, 38), (46, 42)], fill=RED, outline=O)
    d.polygon([(36, 28), (44, 28), (42, 54), (38, 54)], fill=RED_L, outline=O)
    d.ellipse((36, 26, 44, 34), fill=EMBER, outline=O)
    return halo(im)


def icon_sword():
    im = Image.new("RGBA", (80, 80)); d = ImageDraw.Draw(im)
    d.polygon([(58, 10), (66, 14), (32, 50), (26, 46)], fill=(250, 214, 150, 255), outline=O)
    d.polygon([(60, 12), (64, 14), (32, 48), (30, 46)], fill=(255, 140, 60, 255))
    for t in range(3):
        x, y = 50 - t * 8, 22 + t * 8
        d.polygon([(x, y), (x + 4, y - 6), (x + 3, y + 2)], fill=RED_L, outline=O)
    d.polygon([(18, 40), (24, 36), (40, 54), (34, 58)], fill=GOLD, outline=O)
    d.line((28, 50, 14, 64), fill=OBS, width=6)
    d.line((28, 50, 14, 64), fill=(96, 52, 40, 255), width=3)
    d.ellipse((9, 61, 17, 69), fill=EMBER, outline=O)
    return halo(im)


def build_icons():
    os.makedirs(ICONS, exist_ok=True)
    for name, fn in [("dh_helm", icon_helm), ("dh_plate", icon_armor), ("dh_boots", icon_boots),
                     ("dh_shield", icon_shield), ("dh_sword", icon_sword)]:
        fn().save(os.path.join(ICONS, name + ".png"), optimize=True)
    print("ícones:", os.path.relpath(ICONS, ROOT))


if __name__ == "__main__":
    build_sheet()
    build_icons()
