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


# ── ícones HD (80×80) no mesmo acabamento dos ícones do jogo: desenhados a 4×, contorno escuro grosso,
#    gradiente vertical, reflexo, halo alaranjado e brilhos. Desenho próprio do conjunto. ──
from PIL import ImageFilter

S4 = 4                      # super-amostragem
N = 80 * S4
OUT_C = (22, 12, 14, 255)
OBS = ((84, 66, 76), (30, 20, 26))        # obsidiana: topo, base
RED = ((214, 66, 50), (112, 22, 26))      # carmesim
GLD = ((255, 222, 120), (176, 116, 36))   # ouro
EMB = ((255, 236, 150), (255, 110, 30))   # brasa
STEEL = ((255, 246, 214), (236, 150, 70)) # lâmina aquecida


def P(pts):
    return [(x * S4, y * S4) for x, y in pts]


def grad_fill(img, shape, top, bot, box=None):
    """shape: função(draw) que desenha a máscara em branco. Preenche com gradiente vertical."""
    m = Image.new("L", (N, N), 0); shape(ImageDraw.Draw(m))
    bb = m.getbbox()
    if not bb:
        return m
    y0, y1 = (box or bb)[1], (box or bb)[3]
    g = Image.new("RGBA", (N, N))
    gd = ImageDraw.Draw(g)
    for y in range(N):
        t = 0 if y <= y0 else 1 if y >= y1 else (y - y0) / max(1, y1 - y0)
        gd.line((0, y, N, y), fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,))
    img.paste(g, (0, 0), m)
    return m


def outline(img, mask, w=10):
    o = mask.filter(ImageFilter.MaxFilter(w * 2 + 1))
    base = Image.new("RGBA", (N, N), OUT_C)
    under = Image.new("RGBA", (N, N), (0, 0, 0, 0)); under.paste(base, (0, 0), o)
    under.alpha_composite(img)
    return under


def poly(d, pts, **k):
    d.polygon(P(pts), **k)


def shine(img, pts, a=90):
    lay = Image.new("RGBA", (N, N)); ImageDraw.Draw(lay).polygon(P(pts), fill=(255, 255, 255, a))
    img.alpha_composite(lay)


def finish(img, glow=(255, 140, 50), sparks=((62, 14), (15, 58))):
    a = img.split()[3]
    halo = a.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(12))
    g = Image.new("RGBA", (N, N), glow + (0,)); g.putalpha(halo.point(lambda v: int(v * .5)))
    g.alpha_composite(img)
    d = ImageDraw.Draw(g)
    for x, y in sparks:                                    # brilhos em cruz
        X, Y = x * S4, y * S4
        d.polygon([(X, Y - 14), (X + 3, Y - 3), (X + 14, Y), (X + 3, Y + 3), (X, Y + 14), (X - 3, Y + 3), (X - 14, Y), (X - 3, Y - 3)], fill=(255, 250, 230, 235))
    return g.resize((80, 80), Image.LANCZOS)


def scale_rows(img, region, rows, cols, col=(90, 16, 22, 255), hi=(236, 104, 70, 200)):
    """escamas de dragão: meias-luas em fileiras alternadas dentro da máscara region"""
    lay = Image.new("RGBA", (N, N)); d = ImageDraw.Draw(lay)
    x0, y0, x1, y1 = region.getbbox()
    sw, sh = (x1 - x0) / cols, (y1 - y0) / rows
    for r in range(rows + 1):
        for c in range(-1, cols + 1):
            cx = x0 + c * sw + (sw / 2 if r % 2 else 0); cy = y0 + r * sh
            d.arc((cx - sw / 2, cy - sh * .9, cx + sw / 2, cy + sh * .9), 20, 160, fill=col, width=7)
            d.arc((cx - sw / 2 + 6, cy - sh * .9 + 6, cx + sw / 2 - 6, cy + sh * .9 - 6), 40, 140, fill=hi, width=4)
    clip = Image.new("RGBA", (N, N)); clip.paste(lay, (0, 0), region)
    img.alpha_composite(clip)


def icon_helm():
    img = Image.new("RGBA", (N, N))
    shell = [(17, 66), (16, 38), (22, 24), (32, 17), (48, 17), (58, 24), (64, 38), (63, 66)]
    fins = [[(25, 23), (29, 9), (35, 20)], [(34, 19), (40, 6), (46, 19)], [(45, 20), (51, 10), (55, 24)]]
    mf = Image.new("L", (N, N))
    for f in fins:
        poly(ImageDraw.Draw(mf), f, fill=255)
    for f in fins:
        grad_fill(img, lambda d, f=f: poly(d, f, fill=255), RED[0], GLD[1])
    m = grad_fill(img, lambda d: poly(d, shell, fill=255), OBS[0], OBS[1])
    band = Image.new("L", (N, N)); poly(ImageDraw.Draw(band), [(20, 26), (60, 26), (63, 38), (17, 38)], fill=255)
    band = Image.composite(band, Image.new("L", (N, N)), m)
    grad_fill(img, lambda d: poly(d, [(20, 26), (60, 26), (63, 38), (17, 38)], fill=255), RED[0], RED[1])
    scale_rows(img, band, 2, 6)
    d = ImageDraw.Draw(img)
    poly(d, [(18, 40), (62, 40), (62, 48), (18, 48)], fill=(16, 8, 10, 255))           # viseira
    poly(d, [(42, 42), (56, 42), (55, 46), (43, 46)], fill=EMB[1] + (255,))
    poly(d, [(44, 42.5), (53, 42.5), (52, 44), (45, 44)], fill=EMB[0] + (255,))
    poly(d, [(38, 48), (42, 48), (41, 64), (39, 64)], fill=(16, 8, 10, 255))             # respiro
    grad_fill(img, lambda d: poly(d, [(15, 62), (65, 62), (66, 69), (14, 69)], fill=255), GLD[0], GLD[1])   # aba dourada
    for x in (22, 58):
        ImageDraw.Draw(img).ellipse(P([(x - 2, 52), (x + 2, 56)]), fill=GLD[0] + (255,))
    shine(img, [(22, 26), (28, 20), (32, 20), (24, 36), (21, 36)], 80)
    full = Image.composite(Image.new("L", (N, N), 255), Image.new("L", (N, N)), img.split()[3])
    return finish(outline(img, full, 9), sparks=((66, 30), (12, 16)))


def icon_plate():
    img = Image.new("RGBA", (N, N))
    body = [(22, 22), (32, 15), (48, 15), (58, 22), (58, 66), (50, 71), (30, 71), (22, 66)]
    m = grad_fill(img, lambda d: poly(d, body, fill=255), RED[0], RED[1])
    scale_rows(img, m, 6, 5)
    d = ImageDraw.Draw(img)
    grad_fill(img, lambda d: poly(d, [(30, 15), (40, 27), (50, 15)], fill=255), OBS[0], OBS[1])       # gola
    grad_fill(img, lambda d: poly(d, [(37, 26), (43, 26), (43, 70), (37, 70)], fill=255), OBS[0], OBS[1])  # quilha central
    for side in (1, -1):                                                                  # ombreiras
        pts = [(40 + side * 14, 16), (40 + side * 30, 22), (40 + side * 33, 33), (40 + side * 22, 36), (40 + side * 13, 28)]
        grad_fill(img, lambda d, pts=pts: poly(d, pts, fill=255), GLD[0], GLD[1])
        tip = [(40 + side * 26, 20), (40 + side * 34, 12), (40 + side * 31, 24)]
        grad_fill(img, lambda d, tip=tip: poly(d, tip, fill=255), RED[0], RED[1])
    grad_fill(img, lambda d: poly(d, [(22, 58), (58, 58), (58, 63), (22, 63)], fill=255), GLD[0], GLD[1])  # cinto
    ImageDraw.Draw(img).ellipse(P([(34, 32), (46, 44)]), fill=OUT_C)
    grad_fill(img, lambda d: d.ellipse(P([(35.5, 33.5), (44.5, 42.5)]), fill=255), EMB[0], EMB[1])
    shine(img, [(25, 24), (31, 19), (33, 21), (27, 40), (25, 40)], 70)
    full = Image.composite(Image.new("L", (N, N), 255), Image.new("L", (N, N)), img.split()[3])
    return finish(outline(img, full, 9), sparks=((14, 54), (66, 50)))


def icon_boots():
    img = Image.new("RGBA", (N, N))
    boot = [(26, 16), (48, 16), (48, 50), (62, 56), (66, 64), (64, 70), (22, 70), (24, 44)]
    m = grad_fill(img, lambda d: poly(d, boot, fill=255), RED[0], RED[1])
    shin = Image.new("L", (N, N)); poly(ImageDraw.Draw(shin), [(26, 22), (48, 22), (48, 50), (25, 50)], fill=255)
    scale_rows(img, Image.composite(shin, Image.new("L", (N, N)), m), 4, 3)
    grad_fill(img, lambda d: poly(d, [(46, 52), (62, 56), (66, 64), (64, 70), (40, 70), (40, 54)], fill=255), OBS[0], OBS[1])  # biqueira
    grad_fill(img, lambda d: poly(d, [(20, 66), (66, 66), (65, 72), (21, 72)], fill=255), (60, 44, 50), (24, 16, 20))           # sola
    grad_fill(img, lambda d: poly(d, [(23, 12), (51, 12), (51, 21), (23, 21)], fill=255), GLD[0], GLD[1])                     # punho
    grad_fill(img, lambda d: poly(d, [(48, 14), (60, 4), (55, 18)], fill=255), RED[0], GLD[1])                                # barbatana
    grad_fill(img, lambda d: poly(d, [(24, 40), (16, 34), (24, 48)], fill=255), RED[0], RED[1])
    ImageDraw.Draw(img).ellipse(P([(33, 13.5), (39, 19.5)]), fill=EMB[1] + (255,))
    shine(img, [(28, 24), (31, 24), (30, 46), (27, 46)], 90)
    full = Image.composite(Image.new("L", (N, N), 255), Image.new("L", (N, N)), img.split()[3])
    return finish(outline(img, full, 9), sparks=((66, 22), (14, 62)))


def icon_shield():
    img = Image.new("RGBA", (N, N))
    rim = [(12, 12), (40, 7), (68, 12), (66, 44), (40, 73), (14, 44)]
    field = [(17, 16), (40, 12), (63, 16), (61, 43), (40, 66), (19, 43)]
    grad_fill(img, lambda d: poly(d, rim, fill=255), GLD[0], GLD[1])
    grad_fill(img, lambda d: poly(d, field, fill=255), OBS[0], OBS[1])
    # emblema próprio: cabeça de dragão de perfil, estilizada, com asa em leque
    wing = [(40, 30), (22, 20), (26, 30), (19, 33), (27, 39), (22, 45), (38, 44)]
    head = [(34, 26), (44, 21), (54, 24), (58, 30), (50, 32), (54, 37), (46, 36), (42, 46), (36, 52), (34, 42)]
    grad_fill(img, lambda d: poly(d, wing, fill=255), RED[0], RED[1])
    grad_fill(img, lambda d: poly(d, head, fill=255), (232, 84, 58), RED[1])
    d = ImageDraw.Draw(img)
    for a, b in (((38, 24), (35, 15)), ((42, 22), (41, 13))):                          # chifres pequenos
        poly(d, [a, (a[0] + 4, a[1]), b], fill=GLD[0] + (255,))
    d.ellipse(P([(45, 25.5), (49, 29.5)]), fill=EMB[1] + (255,))
    d.ellipse(P([(46, 26.3), (48, 28.3)]), fill=EMB[0] + (255,))
    for x, y in ((20, 18), (60, 18), (40, 62)):                                         # rebites
        d.ellipse(P([(x - 1.6, y - 1.6), (x + 1.6, y + 1.6)]), fill=GLD[0] + (255,))
    shine(img, [(18, 17), (30, 14), (22, 34), (19, 34)], 60)
    full = Image.composite(Image.new("L", (N, N), 255), Image.new("L", (N, N)), img.split()[3])
    return finish(outline(img, full, 9), sparks=((66, 8), (10, 52)))


def icon_sword():
    img = Image.new("RGBA", (N, N))
    import math
    ang = math.radians(-45)
    ux, uy = math.cos(ang), math.sin(ang)          # ao longo da lâmina (para cima-direita)
    vx, vy = -uy, ux                               # perpendicular

    def at(t, s):                                  # t ao longo, s de lado, origem na guarda (26,54)
        return (26 + ux * t + vx * s, 54 + uy * t + vy * s)
    blade = [at(0, -5), at(40, -5), at(52, 0), at(40, 5), at(0, 5)]
    grad_fill(img, lambda d: poly(d, blade, fill=255), STEEL[0], STEEL[1])
    core = [at(2, -1.5), at(40, -1.5), at(48, 0), at(40, 1.5), at(2, 1.5)]
    grad_fill(img, lambda d: poly(d, core, fill=255), EMB[0], EMB[1])
    for t in (8, 18, 28):                                                                # serrilha de escamas no dorso
        grad_fill(img, lambda d, t=t: poly(d, [at(t, -5), at(t + 6, -9.5), at(t + 7, -5)], fill=255), RED[0], RED[1])
    guard = [at(-1, -15), at(3, -8), at(3, 8), at(-1, 15), at(-5, 9), at(-5, -9)]          # guarda em asas
    grad_fill(img, lambda d: poly(d, guard, fill=255), GLD[0], GLD[1])
    grip = [at(-5, -2.6), at(-19, -2.6), at(-19, 2.6), at(-5, 2.6)]
    grad_fill(img, lambda d: poly(d, grip, fill=255), OBS[0], OBS[1])
    d = ImageDraw.Draw(img)
    for t in (-8, -12, -16):
        d.line(P([at(t, -2.6), at(t - 2, 2.6)]), fill=(150, 98, 40, 255), width=5)
    px, py = at(-23, 0)
    d.ellipse(P([(px - 4.5, py - 4.5), (px + 4.5, py + 4.5)]), fill=OUT_C)
    grad_fill(img, lambda d: d.ellipse(P([(px - 3.2, py - 3.2), (px + 3.2, py + 3.2)]), fill=255), EMB[0], EMB[1])
    shine(img, [at(4, -4), at(38, -4), at(38, -2.5), at(4, -2.5)], 110)
    full = Image.composite(Image.new("L", (N, N), 255), Image.new("L", (N, N)), img.split()[3])
    return finish(outline(img, full, 8), sparks=((64, 34), (40, 10)))


def build_icons():
    os.makedirs(ICONS, exist_ok=True)
    for name, fn in [("dh_helm", icon_helm), ("dh_plate", icon_plate), ("dh_boots", icon_boots),
                     ("dh_shield", icon_shield), ("dh_sword", icon_sword)]:
        fn().save(os.path.join(ICONS, name + ".png"), optimize=True)
    print("ícones:", os.path.relpath(ICONS, ROOT))


if __name__ == "__main__":
    import sys
    "--icons" in sys.argv or build_sheet()
    build_icons()
