"""Set lendário "Matador de Dragões" (Guerreiro) — folhas do herói com o conjunto completo.
Parte das folhas do Guerreiro (traje da classe, t0) e troca o aço azulado por aço enegrecido com escamas
carmesim e acabamento de bronze; no elmo, dois chifres de osso de dragão voltados para trás e uma fileira de
espinhos; a fresta do visor ganha um brilho de brasa.
Saída: assets/pixel-art/characters/warrior-pack-dragon-body.png (perfil, 39 quadros)
       assets/pixel-art/characters/warrior-pack-dragon-dirs.png (4 linhas: frente, costas, diagonal frente, diagonal costas)
Uso: python3 scripts/build_dragonslayer.py
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "assets", "pixel-art", "characters")
OUTS = [CH, os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
F = 128

# aço azulado do traje -> aço enegrecido, carmesim e bronze
REMAP = {
    (40, 44, 60): (26, 22, 28), (39, 43, 59): (26, 22, 28), (33, 36, 50): (24, 20, 26), (36, 34, 52): (26, 22, 28),
    (72, 82, 98): (92, 22, 26), (51, 57, 65): (70, 20, 24),
    (94, 113, 142): (142, 34, 30),
    (163, 167, 194): (74, 68, 78), (166, 158, 154): (96, 88, 94), (128, 123, 122): (66, 58, 64),
    (184, 204, 216): (120, 110, 118), (203, 198, 193): (150, 136, 130),
    (220, 234, 238): (238, 186, 92), (223, 224, 232): (226, 172, 84), (185, 191, 251): (255, 214, 130),
}
OL = (14, 8, 8, 255)
BONE = [(242, 232, 204, 255), (214, 196, 156, 255), (160, 132, 96, 255)]   # claro, médio, sombra
EMBER = (255, 140, 40, 255)


def recolor(im):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            p = px[x, y]
            if p[3] > 0 and p[:3] in REMAP:
                px[x, y] = REMAP[p[:3]] + (p[3],)
    return im


def helmet_top(fr):
    """primeira linha (de cima) com um trecho opaco contínuo de 5+ px: o topo do elmo (a lâmina é fina)"""
    px = fr.load()
    for y in range(F):
        run, best = 0, None
        for x in range(F + 1):
            if x < F and px[x, y][3] > 100:
                run += 1
            else:
                if run >= 5 and (best is None or run > best[1] - best[0]):
                    best = (x - run, x - 1)
                run = 0
        if best:
            return y, best[0], best[1]
    return None


def put(fr, pts, col):
    px = fr.load()
    for x, y in pts:
        if 0 <= x < F and 0 <= y < F:
            px[x, y] = col


def horn(fr, x, y, d, up=1.0):
    """chifre voltado para trás (d = -1: para a esquerda): base grossa e ponta curva para cima"""
    body = [(0, 0), (0, 1), (d, 0), (d, 1), (2 * d, 0), (2 * d, 1), (3 * d, 0), (4 * d, 0), (4 * d, -1), (5 * d, -1), (6 * d, -2), (7 * d, -3)]
    if up < 1:
        body = [(a, b if b >= 0 else int(b * up)) for a, b in body]
    pts = [(x + a, y + b) for a, b in body]
    ring = {(px + i, py + k) for px, py in pts for i in (-1, 0, 1) for k in (-1, 0, 1)} - set(pts)
    px = fr.load()
    for q in ring:
        if 0 <= q[0] < F and 0 <= q[1] < F and px[q][3] < 100:
            px[q] = OL
    for i, q in enumerate(pts):
        put(fr, [q], BONE[0] if i in (2, 4, 6) else BONE[2] if i in (1, 3) else BONE[1])


def spines(fr, x0, x1, y):
    """espinhos de escama no alto do elmo"""
    for x in range(x0, x1 + 1, 2):
        put(fr, [(x, y - 1)], (150, 40, 30, 255))
        put(fr, [(x, y - 2)], OL)


def ember_eye(fr, xs, xe, yt, face):
    """brilho de brasa na fresta do visor: o pixel mais escuro da frente do elmo, 3-6 px abaixo do topo"""
    px = fr.load()
    cand = []
    for y in range(yt + 3, yt + 7):
        for x in range(xs, xe + 1):
            p = px[x, y]
            if p[3] > 200 and sum(p[:3]) < 60:
                cand.append((abs(x - (xe if face > 0 else xs)), x, y))
    if cand:
        cand.sort()
        _, x, y = cand[0]
        put(fr, [(x, y)], EMBER)


def dress(fr, kind):
    """kind: 'side' (perfil olhando à direita), 'front', 'back', 'dfront', 'dback'"""
    t = helmet_top(fr)
    if not t:
        return fr
    y, x0, x1 = t
    w = x1 - x0
    if w > 18:                         # pose estranha (caído): não mexe
        return fr
    if kind == "side":
        horn(fr, x0 + 1, y + 2, -1)
        spines(fr, x0 + 2, x1 - 2, y)
        ember_eye(fr, x0, x1, y, 1)
    elif kind in ("front", "back"):
        horn(fr, x0, y + 2, -1, .7)
        horn(fr, x1, y + 2, 1, .7)
        kind == "front" and ember_eye(fr, x0 + 2, x1 - 2, y, 0)
    else:
        horn(fr, x0 + 1, y + 2, -1)
        horn(fr, x1 - 1, y + 1, 1, .5)
        kind == "dfront" and ember_eye(fr, x0, x1, y, 1)
    return fr


def build():
    body = recolor(Image.open(os.path.join(CH, "warrior-pack-t0-body.png")).convert("RGBA"))
    for i in range(body.width // F):
        fr = body.crop((i * F, 0, i * F + F, F))
        body.paste(dress(fr, "side"), (i * F, 0))
    dirs = recolor(Image.open(os.path.join(CH, "warrior-pack-t0-dirs.png")).convert("RGBA"))
    kinds = ["front", "back", "dfront", "dback"]
    for r in range(dirs.height // F):
        for c in range(dirs.width // F):
            fr = dirs.crop((c * F, r * F, c * F + F, r * F + F))
            if fr.getbbox():
                dirs.paste(dress(fr, kinds[r]), (c * F, r * F))
    for d in OUTS:
        if os.path.isdir(d):
            body.save(os.path.join(d, "warrior-pack-dragon-body.png"), optimize=True)
            dirs.save(os.path.join(d, "warrior-pack-dragon-dirs.png"), optimize=True)
    return body, dirs


if __name__ == "__main__":
    build()
    print("ok")
