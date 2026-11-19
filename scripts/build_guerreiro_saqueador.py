"""Armadura do ferreiro "Vestes do Saqueador" (Guerreiro): folha do herói viking.
Parte de assets/pixel-art/characters/warrior-pack-t0-body.png (39 quadros 128x128, mesma ordem): elmo -> cabelo
loiro comprido, rosto e barba trançada; placas de aço -> couro com tachas e ombreiras de ferro; gola de pele
marrom; escudo redondo de madeira com raios vermelhos, umbo e aro de ferro; calça azul e perneiras amarradas.
Saída: warrior-saqueador-body.png. Uso: python3 scripts/build_guerreiro_saqueador.py
"""
import os
import numpy as np
from PIL import Image
from collections import deque
C = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'pixel-art', 'characters') + os.sep
STEEL = {(163, 167, 194), (220, 234, 238), (94, 113, 142), (40, 44, 60), (39, 43, 59), (33, 36, 50), (72, 82, 98), (51, 57, 65), (184, 204, 216), (185, 191, 251), (23, 21, 22)}
FURC = {(223, 224, 232), (166, 158, 154), (128, 123, 122), (203, 198, 193)}
OL = (20, 12, 10)
HAIR = [(252, 232, 160), (232, 196, 112), (190, 148, 74), (130, 94, 46)]
SKIN = [(238, 190, 152), (210, 154, 118), (164, 108, 84)]
LEA = [(64, 40, 26), (98, 64, 40), (138, 92, 56), (176, 124, 76)]      # couro: sombra → luz
IRON = [(52, 54, 62), (86, 90, 100), (136, 142, 154), (196, 202, 214)]
FUR = [(62, 44, 30), (96, 70, 46), (138, 104, 70), (176, 140, 96)]
PANT = [(56, 74, 108), (82, 104, 142), (124, 146, 182)]
WRAP = [(70, 48, 32), (112, 80, 52), (150, 112, 74)]
T = lambda a, y, x: tuple(int(v) for v in a[y, x, :3])
lum = lambda c: c[0] * .3 + c[1] * .59 + c[2] * .11
def lvl(c, pal):
    L = lum(c); return pal[0] if L < 55 else pal[1] if L < 105 else pal[2] if L < 175 else pal[min(3, len(pal) - 1)]

def comps(a, op, pred, h, w, y0=0):
    seen = np.zeros((h, w), bool); out = []
    for yy in range(y0, h):
        for xx in range(w):
            if seen[yy, xx] or not op[yy, xx] or not pred(yy, xx): continue
            c = []; q = deque([(yy, xx)]); seen[yy, xx] = 1
            while q:
                y, x = q.popleft(); c.append((y, x))
                for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                    Y, X = y + dy, x + dx
                    if 0 <= Y < h and 0 <= X < w and not seen[Y, X] and op[Y, X] and pred(Y, X): seen[Y, X] = 1; q.append((Y, X))
            out.append(c)
    return out

def skin(fr):
    a = np.asarray(fr).copy(); h, w = a.shape[:2]; op = a[..., 3] > 0
    ys = np.where(op.any(1))[0]
    if not len(ys): return fr
    top = ys[0]; out = a.copy(); done = np.zeros((h, w), bool)
    def put(y, x, c):
        out[y, x, :3] = c; done[y, x] = 1
    edge = lambda y, x: any(not (0 <= y + dy < h and 0 <= x + dx < w) or not op[y + dy, x + dx] for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)))
    furp = [(y, x) for y in range(top, min(h, top + 20)) for x in range(w) if op[y, x] and T(a, y, x) in FURC]
    neck = min(y for y, _ in furp) if furp else top + 9
    tx = int(np.mean(np.where(op[top])[0]))
    head = [(y, x) for y in range(top, neck) for x in range(max(0, tx - 9), min(w, tx + 10)) if op[y, x]]
    # ── cabeça: cabelo com mechas, rosto de perfil, barba cheia ──
    if head:
        hx0 = min(x for _, x in head); hx1 = max(x for _, x in head)
        fx = hx0 + (hx1 - hx0) * .45                         # rosto: parte da frente
        for y, x in head:
            if edge(y, x): put(y, x, OL); continue
            r = y - top
            if r <= 2 or x < fx - 1:                          # cabelo: luz em cima, mechas verticais, sombra embaixo
                k = 0 if r <= 1 and x % 3 != 0 else 1 if (x % 3 != 1 or r < 3) else 2
                if r > 6: k = min(3, k + 1)
                put(y, x, HAIR[k])
            elif r <= 6:
                put(y, x, SKIN[0] if x > fx + 1 and r < 6 else SKIN[1])
            else:                                             # barba
                put(y, x, HAIR[1] if (x + 2 * y) % 5 else HAIR[2])
        for y in range(neck, min(h, neck + 4)):              # queixo: o que era viseira escura vira barba
            for x in range(int(fx), hx1 + 1):
                if op[y, x] and not edge(y, x) and (lum(T(a, y, x)) < 30 or T(a, y, x) in STEEL): put(y, x, HAIR[1])
        ey = top + 4; row = [x for x in range(w) if op[ey, x] and not edge(ey, x)]; ex = (max(row) - 1) if row else hx1 - 2
        for (y, x, c) in ((ey, ex, (40, 60, 100)), (ey - 1, ex, HAIR[2]), (ey - 1, ex - 1, HAIR[2]), (top + 5, hx1 - 1, SKIN[2])):
            if 0 <= y < h and 0 <= x < w and op[y, x] and not edge(y, x): put(y, x, c)
        # barba trançada descendo no peito
        bx = hx1 - 3
        for k in range(8):
            y = neck + k
            for dx, c in ((0, HAIR[1] if k % 2 else HAIR[2]), (1, HAIR[2] if k % 2 else HAIR[1])):
                if y < h and op[y, bx + dx] and k < 7: put(y, bx + dx, c)
        if neck + 7 < h and op[neck + 7, bx]: put(neck + 7, bx, IRON[2])
        for k in range(9):                                    # cabelo comprido nas costas
            y = neck - 1 + k
            for dx, c in ((0, HAIR[3]), (1, HAIR[2]), (2, HAIR[2] if k < 5 else None)):
                x = hx0 + dx
                if c and 0 <= y < h and op[y, x] and not edge(y, x): put(y, x, c)
    # ── escudo redondo: madeira com raios vermelhos, aro e umbo de ferro ──
    big = [c for c in comps(a, op, lambda y, x: T(a, y, x) == (72, 82, 98), h, w, neck) if len(c) > 70]
    if big:
        sh = set(p for c in big for p in c)
        sy0 = min(p[0] for p in sh); sy1 = max(p[0] for p in sh); sx0 = min(p[1] for p in sh); sx1 = max(p[1] for p in sh)
        reg = set()
        for y in range(max(0, sy0 - 3), min(h, sy1 + 4)):
            for x in range(max(0, sx0 - 1), min(w, sx1 + 4)):
                if op[y, x] and T(a, y, x) in STEEL and not done[y, x]: reg.add((y, x))
        cy, cx = (sy0 + sy1) / 2, (sx0 + sx1) / 2 + 1
        for (y, x) in reg:
            if edge(y, x) or T(a, y, x) in ((23, 21, 22), (33, 36, 50)): continue
            nb_out = any(not op[y + dy, x + dx] or T(a, y + dy, x + dx) not in STEEL for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)) if 0 <= y + dy < h and 0 <= x + dx < w)
            d = ((y - cy) ** 2 + (x - cx) ** 2) ** .5
            ang = (np.degrees(np.arctan2(y - cy, x - cx)) + 360) % 45
            if nb_out: put(y, x, IRON[2] if y < cy else IRON[1])                      # aro
            elif d < 2.2: put(y, x, IRON[3] if y < cy else IRON[1])                   # umbo
            elif ang < 9: put(y, x, (168, 40, 34) if y < cy + 2 else (128, 28, 26))    # raios vermelhos
            else: put(y, x, (150, 104, 62) if x % 4 else (108, 72, 42))               # tábuas
    # ── lâmina: o único aço sem contorno preto (encosta direto no vazio); segue pela parte fina ──
    st = np.zeros((h, w), bool)
    for y in range(h):
        for x in range(w):
            st[y, x] = op[y, x] and T(a, y, x) in STEEL and T(a, y, x) not in ((94, 113, 142), (220, 234, 238)) and not done[y, x]
    pad = np.pad(st, 2); cnt = sum(pad[2 + dy:2 + dy + h, 2 + dx:2 + dx + w] for dy in range(-2, 3) for dx in range(-2, 3))
    seeds = [(y, x) for y in range(h) for x in range(w) if st[y, x] and any(0 <= y + dy < h and 0 <= x + dx < w and not op[y + dy, x + dx] for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)))]
    seen = np.zeros((h, w), bool)
    for s0 in seeds:
        if seen[s0] or cnt[s0] > 17: continue
        grp = []; q = deque([s0]); seen[s0] = 1
        while q:
            y, x = q.popleft(); grp.append((y, x))
            for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                Y, X = y + dy, x + dx
                if 0 <= Y < h and 0 <= X < w and st[Y, X] and not seen[Y, X] and cnt[Y, X] <= 17: seen[Y, X] = 1; q.append((Y, X))
        ys_ = [p[0] for p in grp]; xs_ = [p[1] for p in grp]
        if max(max(ys_) - min(ys_), max(xs_) - min(xs_)) >= 9 and len(grp) < 90 and (max(xs_) - min(xs_)) > 4:     # comprido, fino e inclinado = lâmina (perna é em pé)
            for p in grp: done[p] = 1
    belt = [y for y in range(h) for x in range(w) if op[y, x] and T(a, y, x) in ((59, 32, 39), (33, 24, 27))]
    yb = int(np.median(belt)) if belt else top + 26
    bxs = [x for y in range(h) for x in range(w) if op[y, x] and T(a, y, x) in ((59, 32, 39), (33, 24, 27))]
    bl, br = (min(bxs), max(bxs)) if bxs else (0, w)
    colbot = [max([y for y in range(h) if op[y, x]], default=0) for x in range(w)]
    # ── corpo: couro, ombreiras de ferro, pele, calça listrada, perneiras ──
    for y in range(neck, h):
        for x in range(w):
            if not op[y, x] or done[y, x]: continue
            c = T(a, y, x)
            if c in FURC:                                     # pele grossa nos ombros, com tufos
                k = 3 if (x * 5 + y * 3) % 7 == 0 else 2 if lum(c) > 180 else 1
                put(y, x, FUR[k])
                if not op[y - 1, x] or T(a, y - 1, x) not in FURC and (x % 2): out[y - 1, x, :3] = FUR[1] if op[y - 1, x] and not done[y - 1, x] else out[y - 1, x, :3]
            elif c in STEEL:
                if y > yb and (not (bl - 1 <= x <= br + 1) or colbot[x] < yb + 12) and y < yb + 12: put(y, x, lvl(c, LEA))   # braço solto: couro
                elif y > yb + 9:   put(y, x, lvl(c, WRAP) if (y % 3) else WRAP[0])        # perneiras de couro amarradas
                elif y > yb:     put(y, x, PANT[2] if x % 3 == 0 and lum(c) > 90 else lvl(c, PANT))
                elif y < neck + 6 and lum(c) > 150: put(y, x, lvl(c, IRON))          # ombreira de ferro
                else:            put(y, x, lvl(c, LEA))
    # tachas: fileira de pregos na borda de baixo das peças de couro e ferro
    for y in range(neck, yb + 1):
        for x in range(1, w - 1):
            if done[y, x] and tuple(out[y, x, :3]) in (LEA[2], LEA[3], IRON[2]) and y + 1 < h and tuple(out[y + 1, x, :3]) in ((5, 4, 3), (14, 12, 12), OL) and x % 2 == 0:
                out[y, x, :3] = IRON[3]
    return Image.fromarray(out)

src = Image.open(C + 'warrior-pack-t0-body.png').convert('RGBA')
n = src.width // 128
out = Image.new('RGBA', src.size)
for i in range(n):
    out.paste(skin(src.crop((i * 128, 0, i * 128 + 128, 128))), (i * 128, 0))
out.save(C + 'warrior-saqueador-body.png', optimize=True)
print('ok', n)
