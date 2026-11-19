"""Armadura do ferreiro "Vestes do Vendaval" (Maga): folha da heroína sem capuz.
Parte de assets/pixel-art/characters/mage-pack-t0-body.png (39 quadros 128x128, mesma ordem) e troca:
capuz -> cabelo azul-petróleo com trança e prendedor dourado, cabelo comprido nas costas; manto azul-marinho ->
carmesim com bordado dourado na beirada e na barra; vestido carmesim mais vivo; cinto dourado.
Saída: mage-vendaval-body.png e mage-vendaval-glow.png (o bordado dourado, para o pulso).
Uso: python3 scripts/build_maga_vendaval.py
"""
import os
import numpy as np
from PIL import Image
C = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'pixel-art', 'characters') + os.sep
CLOAK = {(36, 34, 52): (118, 22, 34), (20, 18, 29): (70, 12, 22), (45, 27, 30): (96, 18, 28), (12, 8, 14): (48, 8, 16)}
DRESS = {(115, 23, 45): (150, 28, 36), (59, 23, 37): (92, 16, 28), (97, 39, 33): (128, 30, 30), (180, 32, 42): (196, 46, 44)}
GOLD = {(176, 91, 44): (196, 146, 58), (232, 138, 54): (240, 200, 104), (180, 117, 56): (214, 168, 81)}
HAIR = [(24, 70, 104), (40, 104, 140), (72, 150, 178), (130, 200, 214)]
T = lambda a, y, x: tuple(int(v) for v in a[y, x, :3])

def skin(fr):
    a = np.asarray(fr).copy(); h, w = a.shape[:2]
    op = a[..., 3] > 0
    ys = np.where(op.any(1))[0]
    if not len(ys): return fr
    top = ys[0]
    face = [(y, x) for y in range(h) for x in range(w) if op[y, x] and T(a, y, x) in ((233, 181, 163), (186, 117, 106))]
    fy = min(y for y, _ in face) if face else top + 6
    fx0 = min(x for _, x in face) if face else 0; fx1 = max(x for _, x in face) if face else w
    facing = 1 if face and (fx0 + fx1) / 2 >= np.mean(np.where(op[fy])[0]) else -1
    out = a.copy()
    for y in range(h):
        for x in range(w):
            if not op[y, x]: continue
            c = T(a, y, x)
            if c in CLOAK:
                if y < fy + 6:                                   # capuz vira cabelo azul-petróleo
                    k = 3 if (x % 3 == 0 and y < fy + 1) else 2 if x % 3 == 1 else 1 if y < fy + 3 else 0
                    out[y, x, :3] = HAIR[k]; out[y, x, 3] = 254   # marca: cabelo
                else:
                    out[y, x, :3] = CLOAK[c]
            elif c in DRESS: out[y, x, :3] = DRESS[c]
            elif c in GOLD: out[y, x, :3] = GOLD[c]
    # cabeça redonda: corta a ponta do capuz, deixa só o cabelo em volta do rosto
    if face:
        cx = (fx0 + fx1) / 2 - facing * 1.5; cy = fy + 2; R = 8.2
        for y in range(h):
            for x in range(w):
                if out[y, x, 3] == 254 and ((x - cx) ** 2 + ((y - cy) * 1.1) ** 2) ** .5 > R: out[y, x, 3] = 0
        dark = lambda y, x: int(out[y, x, :3].astype(int).sum()) < 40
        for _ in range(3):                                   # contorno antigo do capuz que ficou solto
            for y in range(0, fy + 7):
                for x in range(w):
                    if out[y, x, 3] and out[y, x, 3] != 254 and dark(y, x) and not any(0 <= y + dy < h and 0 <= x + dx < w and out[y + dy, x + dx, 3] and not dark(y + dy, x + dx) for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0))):
                        out[y, x, 3] = 0
        for y in range(h):
            for x in range(w):
                if out[y, x, 3] == 254 and any(not (0 <= y + dy < h and 0 <= x + dx < w) or out[y + dy, x + dx, 3] == 0 for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0))):
                    out[y, x, :3] = (12, 22, 36)
        # cabelo comprido caindo nas costas
        bx0 = int(cx - facing * 5)
        for y in range(fy + 5, fy + 16):
            for dx in range(0, 3):
                x = bx0 - facing * dx
                if 0 <= x < w and out[y, x, 3] and T(a, y, x) in CLOAK:
                    out[y, x, :3] = HAIR[1 if (x + y) % 2 else 0] if dx < 2 else (12, 22, 36)
        out[out[..., 3] == 254, 3] = 255
    # trança caindo na frente do ombro
    if face:
        bx = fx0 - 1 if facing > 0 else fx1 + 1
        for k in range(16):
            y = fy + 4 + k
            for dx in (0, -facing):
                x = bx + dx
                if 0 <= y < h and 0 <= x < w and op[y, x]:
                    out[y, x, :3] = HAIR[2] if (k + dx) % 3 == 0 else HAIR[1] if k % 2 else HAIR[0]
        y = fy + 20
        if 0 <= y < h and 0 <= bx < w and op[y, bx]: out[y, bx, :3] = (214, 168, 81)   # prendedor dourado
    # bordado dourado: beirada do manto vermelho encostada no vestido, e barras
    for y in range(fy + 6, h):
        for x in range(1, w - 1):
            if T(a, y, x) in CLOAK and op[y, x]:
                nb = [T(a, y + dy, x + dx) for dy, dx in ((0, -1), (0, 1), (1, 0)) if 0 <= y + dy < h]
                if any(n in DRESS for n in nb) or (y + 1 < h and not op[y + 1, x]):
                    out[y, x, :3] = (214, 168, 81) if (x + y) % 2 else (168, 120, 48)
    return Image.fromarray(out)

src = Image.open(C + 'mage-pack-t0-body.png').convert('RGBA')
n = src.width // 128
out = Image.new('RGBA', src.size)
for i in range(n):
    out.paste(skin(src.crop((i * 128, 0, i * 128 + 128, 128))), (i * 128, 0))
out.save(C + 'mage-vendaval-body.png', optimize=True)
a = np.asarray(out).copy()
r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
m = (a[..., 3] > 0) & (r > 160) & (g > 110) & (b < 120) & (r - b > 90)
glow = np.zeros_like(a); glow[m] = a[m]
Image.fromarray(glow).save(C + 'mage-vendaval-glow.png', optimize=True)
print('ok', n, int(m.sum()))
