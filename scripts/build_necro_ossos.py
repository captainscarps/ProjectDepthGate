"""Armadura do ferreiro "Vestes do Ossário" (Necromante): folha do herói esqueleto de capuz roxo.
Parte de assets/pixel-art/characters/necromancer-pack-t0-body.png (39 quadros 128x128, mesma ordem) e troca:
manto preto -> roxo com luz de contorno, sombra descendo e barra rasgada; rosto -> caveira com olho roxo;
mãos e canelas -> osso com falanges; peito -> costelas com cavidade escura e vértebras; cinto e punhos dourados;
cajado escuro com gema roxa; magia azul -> roxa.
Saída: necromancer-ossos-body.png e necromancer-ossos-glow.png (só os pontos que brilham, para o pulso roxo).
Uso: python3 scripts/build_necro_ossos.py
"""
import os
import numpy as np
from PIL import Image
C = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'pixel-art', 'characters') + os.sep
REMAP = {
    (39, 31, 27): (62, 42, 98), (40, 31, 27): (62, 42, 98), (41, 33, 30): (62, 42, 98), (46, 39, 35): (70, 50, 108), (42, 35, 31): (62, 42, 98), (40, 33, 31): (62, 42, 98), (41, 32, 27): (62, 42, 98), (42, 36, 35): (62, 42, 98),
    (23, 24, 25): (40, 28, 66), (27, 28, 29): (40, 28, 66), (31, 32, 34): (48, 34, 78), (27, 29, 33): (44, 32, 72), (22, 22, 27): (36, 26, 60),
    (20, 18, 29): (30, 20, 52), (36, 34, 52): (78, 56, 124), (44, 42, 59): (84, 62, 132),
    (51, 57, 65): (112, 82, 160), (52, 57, 65): (112, 82, 160), (52, 59, 68): (112, 82, 160), (54, 60, 68): (120, 90, 170), (40, 44, 60): (92, 68, 142),
    (66, 36, 51): (216, 208, 188), (65, 36, 50): (216, 208, 188), (69, 40, 55): (236, 230, 212), (59, 23, 37): (150, 140, 124),
    (233, 181, 163): (238, 232, 214), (178, 139, 120): (200, 192, 172), (175, 137, 118): (200, 192, 172), (176, 137, 119): (200, 192, 172), (142, 82, 82): (110, 100, 96),
    (187, 117, 71): (78, 68, 84), (113, 65, 59): (46, 38, 52), (115, 68, 62): (46, 38, 52),
    (138, 161, 246): (178, 110, 255), (241, 242, 255): (238, 218, 255),
}
BONE = {(238, 232, 214), (216, 208, 188), (236, 230, 212)}
STAFF = {(78, 68, 84), (46, 38, 52)}

def skin(fr, face_dir=1):
    a = np.asarray(fr).copy()
    h, w = a.shape[:2]
    MAR = {(66, 36, 51), (65, 36, 50), (69, 40, 55), (59, 23, 37)}
    for y in range(h):                       # faixa de cor vinho comprida = cinto (fica dourado); bolinhas = mãos (viram osso)
        run = 0
        for x in range(w + 1):
            if x < w and a[y, x, 3] and tuple(a[y, x, :3]) in MAR: run += 1; continue
            if run >= 5:
                for k in range(x - run, x): a[y, k, :3] = (200, 150, 64) if tuple(a[y, k, :3]) != (59, 23, 37) else (130, 92, 36)
            run = 0
    for y in range(h):
        for x in range(w):
            p = tuple(a[y, x, :3])
            if a[y, x, 3] and p in REMAP: a[y, x, :3] = REMAP[p]
    # caveira: redesenha o rosto inteiro (órbitas, olho roxo, nariz, dentes)
    bone = [(y, x) for y in range(h) for x in range(w) if a[y, x, 3] and tuple(a[y, x, :3]) in BONE]
    if bone:
        ytop = min(y for y, _ in bone)
        head = [(y, x) for y, x in bone if y <= ytop + 6]
        xs = [x for _, x in head]; x0, x1 = min(xs), max(xs)
        f = face_dir
        ex = x1 - 1 if f > 0 else x0 + 1          # olho da frente
        D, P, G, Bn, Bs = (30, 18, 40), (150, 70, 230), (230, 170, 255), (238, 232, 214), (184, 176, 158)
        def px(y, x, c):
            if 0 <= y < h and 0 <= x < w and a[y, x, 3]: a[y, x, :3] = c
        for y, x in head:
            lx = (x - x0) / max(1, x1 - x0); lx = lx if f > 0 else 1 - lx
            c = (244, 238, 222) if y <= ytop + 1 else (226, 218, 198) if y <= ytop + 3 else (178, 168, 150)
            if lx < .3: c = tuple(int(v * .78) for v in c)                      # lado de trás da cabeça na sombra
            px(y, x, c)
        px(ytop + 2, ex, G); px(ytop + 2, ex - f, D); px(ytop + 3, ex, P); px(ytop + 3, ex - f, D); px(ytop + 1, ex - f, (120, 112, 100))
        px(ytop + 3, ex - 2 * f, (150, 140, 124))   # maçã do rosto
        px(ytop + 2, ex - 3 * f, D)
        px(ytop + 4, x1 if f > 0 else x0, D)
        for k, x in enumerate(range(x0, x1 + 1)):
            px(ytop + 5, x, D if k % 2 else (226, 218, 198))
        px(ytop + 6, ex, (150, 140, 124))
        for dy, dx in ((0, f), (1, f), (-1, 0), (2, f)):                        # brilho roxo vazando no capuz
            y, x = ytop + 2 + dy, ex + dx
            if 0 <= y < h and 0 <= x < w and a[y, x, 3] and tuple(a[y, x, :3]) not in BONE and int(a[y, x, :3].astype(int).sum()) < 300:
                a[y, x, :3] = np.clip(a[y, x, :3] * .5 + np.array([140, 60, 220]) * .5, 0, 255)
    # costelas no peito, entre as lapelas do manto
    gold = [(y, x) for y in range(h) for x in range(w) if a[y, x, 3] and tuple(a[y, x, :3]) == (214, 168, 81)]
    if gold:
        yc = max(y for y, _ in gold)
        CH = {(112, 82, 160), (120, 90, 170), (92, 68, 142), (78, 56, 124)}
        cols = [x for y in range(yc + 1, yc + 11) for x in range(w) if a[y, x, 3] and tuple(a[y, x, :3]) in CH]
        mid = int(np.median(cols)) if cols else None
        rows = {}
        for y in range(yc + 1, min(h, yc + 10)):
            xs_ = [x for x in range(w) if a[y, x, 3] and tuple(a[y, x, :3]) in CH]
            if xs_: rows[y] = (min(xs_), max(xs_), xs_)
        for y, (lo, hi, xs_) in rows.items():
            for x in xs_:
                t = abs(x - (mid if mid is not None else (lo + hi) / 2)) / max(1, (hi - lo) / 2 + .5)
                if mid is not None and x == mid:
                    a[y, x, :3] = (214, 206, 186) if y % 2 else (150, 140, 124)        # vértebras
                elif (y - yc) % 2 == 1:
                    a[y, x, :3] = (240, 234, 216) if t < .45 else (206, 198, 178) if t < .8 else (158, 148, 132)
                else:
                    a[y, x, :3] = (22, 14, 30) if t < .7 else (46, 32, 60)               # vão: cavidade escura
        # brilho roxo dentro da caixa torácica (alma)
        if rows and mid is not None:
            yy = sorted(rows)[len(rows) // 2]
            if (yy - yc) % 2 == 0 and a[yy, mid - 1, 3]: a[yy, mid - 1, :3] = (120, 50, 190)
    # manto rasgado: barra de baixo irregular e furos
    rng = np.random.default_rng(int(a[..., 3].sum()) % 9999)
    ROBE = {(62, 42, 98), (40, 28, 66), (30, 20, 52), (78, 56, 124), (70, 50, 108), (48, 34, 78), (44, 32, 72), (36, 26, 60), (84, 62, 132)}
    for x in range(w):
        col = [y for y in range(h) if a[y, x, 3] and tuple(a[y, x, :3]) in ROBE]
        if not col: continue
        yb = max(col)
        if yb > h * .7 and rng.random() < .4:
            cut = int(rng.integers(1, 4))
            for y in range(yb - cut + 1, yb + 1):
                if tuple(a[y, x, :3]) in ROBE: a[y, x, 3] = 0
            if yb - cut >= 0 and a[yb - cut, x, 3]: a[yb - cut, x, :3] = (14, 8, 20)
    # acabamento dourado na beirada da frente do manto (onde o manto encosta nas costelas)
    if gold:
        for y in range(yc + 1, min(h, yc + 18)):
            for x in range(1, w - 1):
                if a[y, x, 3] and tuple(a[y, x, :3]) in ROBE:
                    nb = [tuple(a[y, x + d, :3]) for d in (-1, 1)]
                    if any(c in ((240, 234, 216), (206, 198, 178), (158, 148, 132), (22, 14, 30), (46, 32, 60)) for c in nb):
                        a[y, x, :3] = (196, 150, 62) if y % 3 else (150, 108, 40)
    # ── acabamento final: profundidade no capuz, luz de contorno, sombra descendo, punhos dourados, dedos ──
    ROBE2 = ROBE | {(112, 82, 160), (120, 90, 170), (92, 68, 142)}
    isrobe = lambda y, x: 0 <= y < h and 0 <= x < w and a[y, x, 3] and tuple(a[y, x, :3]) in ROBE2
    isbone = lambda y, x: 0 <= y < h and 0 <= x < w and a[y, x, 3] and int(a[y, x, :3].astype(int).sum()) > 520
    b2 = a.copy()
    if bone:
        for y in range(max(0, ytop - 2), min(h, ytop + 8)):            # capuz fundo e escuro em volta da caveira
            for x in range(w):
                if isrobe(y, x) and any(isbone(y + dy, x + dx) for dy in (-1, 0, 1) for dx in (-2, -1, 1, 2)):
                    b2[y, x, :3] = (16, 8, 26)
    ys = [y for y in range(h) for x in range(w) if a[y, x, 3]]
    yb0, yb1 = (min(ys), max(ys)) if ys else (0, h)
    for y in range(h):
        for x in range(w):
            if not isrobe(y, x) or tuple(b2[y, x, :3]) == (16, 8, 26): continue
            c = b2[y, x, :3].astype(float)
            c *= 1.05 - .35 * (y - yb0) / max(1, yb1 - yb0)                 # escurece descendo
            nx = x + face_dir
            if not (0 <= nx < w) or not a[y, nx, 3] or int(a[y, nx, :3].astype(int).sum()) < 12:  # luz de contorno do lado da frente
                c = c * .45 + np.array([186, 150, 240]) * .55
            b2[y, x, :3] = np.clip(c, 0, 255)
    # punhos dourados: manto colado na mão de osso
    for y in range(h):
        for x in range(w):
            if isrobe(y, x) and any(tuple(a[y + dy, x + dx, :3]) in ((216, 208, 188), (236, 230, 212), (150, 140, 124)) and y + dy > (ytop + 7 if bone else 0)
                                    for dy, dx in ((0, -1), (0, 1), (1, 0)) if 0 <= y + dy < h and 0 <= x + dx < w and a[y + dy, x + dx, 3]):
                b2[y, x, :3] = (204, 156, 66)
    # dedos: mão de osso ganha falanges (claro/escuro alternado)
    for y in range(h):
        for x in range(w):
            if tuple(a[y, x, :3]) in ((216, 208, 188), (236, 230, 212)) and a[y, x, 3] and (x + y) % 2 == 0:
                b2[y, x, :3] = (176, 166, 148)
    a = b2
    # gema roxa na ponta do cajado
    st = [(y, x) for y in range(h) for x in range(w) if a[y, x, 3] and tuple(a[y, x, :3]) in STAFF]
    if st:
        y, x = min(st)
        for dy, dx, col in ((0, 0, (220, 160, 255)), (-1, 0, (170, 90, 240)), (0, -1, (140, 60, 220)), (0, 1, (140, 60, 220)), (-2, 0, (120, 40, 200))):
            if 0 <= y + dy < h and 0 <= x + dx < w: a[y + dy, x + dx, :3] = col; a[y + dy, x + dx, 3] = 255
    return Image.fromarray(a)

src = Image.open(C + 'necromancer-pack-t0-body.png').convert('RGBA')
n = src.width // 128
out = Image.new('RGBA', src.size)
for i in range(n):
    out.paste(skin(src.crop((i * 128, 0, i * 128 + 128, 128))), (i * 128, 0))
out.save(C + 'necromancer-ossos-body.png', optimize=True)
# brilho: só olhos, gema e alma (roxos saturados e claros)
a = np.asarray(out).copy()
r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
m = (a[..., 3] > 0) & (b > 180) & (r > 110) & (g < 180) & (b - g > 60)
glow = np.zeros_like(a); glow[m] = a[m]
Image.fromarray(glow).save(C + 'necromancer-ossos-glow.png', optimize=True)
print('ok', n, int(m.sum()))
