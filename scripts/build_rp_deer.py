"""
Cervos do prólogo (Clareira dos Cervos): cervo com galhada, corça e filhote pintado.
Pixel art desenhada aqui mesmo, no estilo dos animais do pacote (contorno azul-marinho, cores suaves,
quadros 48x48, pés na linha y=32, olhando para a esquerda). Saída:
  assets/pixel-art/river-prologue/rp-deer.png   (folha)
  assets/pixel-art/river-prologue/rp-deer.json  ({espécie: {pose: [quadros]}})
Poses: S_Idle (olha, mexe a orelha, pisca, abaixa e pasta), S_Walk (6), S_Run (4, galope).
"""
import json
import math
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "river-prologue")
FW = FH = 48
GROUND = 32
OUTL = (12, 15, 42, 255)

PAL = {
    "stag": dict(base=(168, 104, 60), dark=(122, 72, 42), light=(206, 148, 94), belly=(238, 210, 164)),
    "doe": dict(base=(186, 122, 74), dark=(138, 86, 52), light=(222, 166, 112), belly=(242, 218, 176)),
    "fawn": dict(base=(196, 128, 74), dark=(146, 90, 52), light=(228, 172, 114), belly=(244, 222, 182)),
}
WHITE = (246, 240, 228)
ANTLER = (230, 212, 168)
ANTLER_D = (176, 150, 110)
HOOF = (40, 30, 34)


def rgba(c):
    return (c[0], c[1], c[2], 255)


class Canvas:
    def __init__(self):
        self.body = {}   # pixels that get an outline
        self.legs = {}   # thin legs: drawn after the outline, no outline of their own

    def put(self, x, y, c, layer="body"):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < FW and 0 <= y < FH:
            (self.body if layer == "body" else self.legs)[(x, y)] = rgba(c)

    def ellipse(self, cx, cy, rx, ry, fn):
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
                if d <= 1:
                    self.put(x, y, fn(x, y, d))

    def line(self, x0, y0, x1, y1, c, w=1, layer="body"):
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(n + 1):
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for ox in range(w):
                for oy in range(w):
                    self.put(x + ox - (w - 1) / 2, y + oy - (w - 1) / 2, c, layer)

    def image(self):
        im = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
        for (x, y), c in self.body.items():
            im.putpixel((x, y), c)
        # contorno: vizinho transparente de um pixel do corpo
        for (x, y) in list(self.body):
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (x + dx, y + dy)
                if q not in self.body and 0 <= q[0] < FW and 0 <= q[1] < FH and im.getpixel(q)[3] == 0:
                    im.putpixel(q, OUTL)
        for (x, y), c in self.legs.items():
            if (x, y) not in self.body:
                im.putpixel((x, y), c)
        return im


def deer(kind, legs, head="up", ear=0, blink=False, bob=0.0, stretch=0.0):
    """legs: 4 pares (hip_x, foot_x, foot_lift) — dianteiras (2) e traseiras (2)."""
    P = PAL[kind]
    small = kind == "fawn"
    s = 0.78 if small else 1.0
    cv = Canvas()
    gy = GROUND
    # medidas (filhote menor, sem galhada)
    bx, by = 25, gy - 13 * s - bob          # centro do corpo
    rx, ry = 8.6 * s + stretch, 4.1 * s
    hip_y = by + ry - 1

    # pernas de trás desenhadas primeiro (ficam atrás), depois o corpo, depois as da frente
    def leg(hx, fx, lift, far):
        c1 = P["dark"] if far else P["base"]
        fy = gy - lift
        kx = (hx + fx) / 2 + (0.8 if hx > bx else -0.4)
        ky = (hip_y + fy) / 2
        cv.line(hx, hip_y, kx, ky, c1, 1, "legs")
        cv.line(kx, ky, fx, fy - 1, c1, 1, "legs")
        cv.line(hx + 1, hip_y, kx + 1, ky, P["dark"], 1, "legs")
        cv.put(fx, fy, HOOF, "legs")
        cv.put(fx + 1, fy, HOOF, "legs")

    (f1, f2, b1, b2) = legs
    leg(*b1, True)
    leg(*f1, True)

    def body_px(x, y, d):
        rel = (y + .5 - by) / ry
        if rel > .45:
            return P["belly"]
        if rel < -.6:
            return P["dark"]
        if rel < -.2 and x > bx - 3:
            return P["base"]
        return P["light"] if rel > .15 else P["base"]

    cv.ellipse(bx, by, rx, ry, body_px)
    # garupa um pouco mais alta e peito cheio
    cv.ellipse(bx + rx - 3, by - 1, 3.2 * s, 3.6 * s, lambda x, y, d: P["base"] if y < by else P["light"])
    cv.ellipse(bx - rx + 2.5, by, 3.2 * s, 3.8 * s, lambda x, y, d: P["light"] if y > by - 1 else P["base"])
    # rabo branco
    tx, ty = bx + rx + .5, by - ry + 1.5
    cv.put(tx, ty, P["dark"])
    cv.put(tx + 1, ty + 1, WHITE)
    cv.put(tx, ty + 1, WHITE)
    cv.put(tx, ty + 2, WHITE)

    # pescoço e cabeça
    nx0, ny0 = bx - rx + 2, by - 1
    if head == "up":
        hx, hy = bx - rx - 2.5 * s, by - 9.5 * s
    elif head == "mid":
        hx, hy = bx - rx - 4 * s, by - 2 * s
    else:  # pastando
        hx, hy = bx - rx - 4.5 * s, gy - 3.2
    cv.line(nx0, ny0, hx + 1.5, hy + 1.5, P["base"], 3)
    cv.line(nx0 - 1, ny0 + 1, hx + .5, hy + 2.5, WHITE if head == "up" else P["light"], 1)  # garganta clara
    cv.ellipse(hx + .5, hy, 2.9 * s + .3, 2.2 * s + .2, lambda x, y, d: P["light"] if y > hy else P["base"])
    # focinho
    sx = hx - 2.6 * s
    cv.line(hx - .5, hy + .8, sx, hy + 1.2, P["light"], 2)
    cv.put(sx - .6, hy + .6, OUTL)
    # olho
    if not blink:
        cv.put(hx, hy - .4, OUTL)
    else:
        cv.put(hx, hy, P["dark"])
    # orelhas (uma mexe)
    ex, ey = hx + 2.2, hy - 2.2
    # orelha larga, inclinada para trás (a outra aparece atrás, mais escura)
    if ear:
        for (dx, dy, c) in ((0, 0, "light"), (1, 0, "base"), (2, 0, "base"), (2, -1, "base"), (3, -1, "dark")):
            cv.put(ex + dx, ey + dy, P[c])
    else:
        for (dx, dy, c) in ((0, 0, "light"), (1, -1, "base"), (1, 0, "base"), (2, -1, "base"), (2, -2, "dark")):
            cv.put(ex + dx, ey + dy, P[c])
    cv.put(ex - 1, ey - 1, P["dark"])

    if kind == "stag":
        ax, ay = hx + 1.2, hy - 2.4
        # duas hastes com pontas
        for sgn in (-1, 1):
            p0 = (ax + (0.6 if sgn > 0 else -0.2), ay)
            p1 = (p0[0] + 1.6 * sgn + 1.0, p0[1] - 3)
            p2 = (p1[0] + 1.2 * sgn + .6, p1[1] - 3)
            col = ANTLER if sgn > 0 else ANTLER_D
            cv.line(*p0, *p1, col)
            cv.line(*p1, *p2, col)
            cv.line(p1[0], p1[1], p1[0] - 1.6, p1[1] - 1.4, col)      # ponta para frente
            cv.line(p2[0], p2[1], p2[0] - 1.2, p2[1] - 1.2, col)

    if kind == "fawn":
        for (dx, dy) in ((-3, -1), (0, -2), (3, -1), (-1, 1), (2, 0), (5, -2), (-5, 0)):
            x, y = bx + dx, by + dy
            if (int(round(x)), int(round(y))) in cv.body:
                cv.put(x, y, WHITE)

    leg(*f2, False)
    leg(*b2, False)
    return cv.image()


def gait(kind, ph, run=False):
    s = 0.78 if kind == "fawn" else 1.0
    bx, rx = 25, 8.6 * s
    fh, bh = bx - rx + 3, bx + rx - 3   # quadril dianteiro e traseiro
    if run:
        # galope: estendido / recolhido
        ext = [(-5, 2), (-1, 0), (3, 1), (5, 2)][ph]
        f = [(fh, fh + ext[0] * 1.2, ext[1]), (fh + 1, fh + ext[0] * 1.2 + 1.5, ext[1])]
        b = [(bh, bh - ext[0] * 1.3, ext[1]), (bh + 1, bh - ext[0] * 1.3 + 1.5, ext[1])]
        return (f[0], f[1], b[0], b[1])
    a = ph / 6 * 2 * math.pi
    sw = lambda o: math.sin(a + o) * 2.6
    lf = lambda o: max(0, math.cos(a + o)) * 1.6
    return ((fh, fh + sw(0), lf(0)), (fh + 1.5, fh + 1.5 + sw(math.pi), lf(math.pi)),
            (bh, bh + sw(math.pi), lf(math.pi)), (bh + 1.5, bh + 1.5 + sw(0), lf(0)))


def stand(kind):
    s = 0.78 if kind == "fawn" else 1.0
    bx, rx = 25, 8.6 * s
    fh, bh = bx - rx + 3, bx + rx - 3
    return ((fh, fh - .5, 0), (fh + 1.5, fh + 2, 0), (bh, bh - .5, 0), (bh + 1.5, bh + 1.5, 0))


def main():
    frames, meta = [], {}
    for kind, name in (("stag", "deer"), ("doe", "doe"), ("fawn", "fawn")):
        st = stand(kind)
        idle = [deer(kind, st), deer(kind, st, ear=1), deer(kind, st, blink=True),
                deer(kind, st, head="mid"), deer(kind, st, head="down"), deer(kind, st, head="down", bob=-.4)]
        walk = [deer(kind, gait(kind, i), bob=(.5 if i % 3 == 1 else 0)) for i in range(6)]
        run = [deer(kind, gait(kind, i, True), head="up", bob=[1, 0, 1.5, 2][i], stretch=[1, 0, -.5, .5][i]) for i in range(4)]
        b = len(frames)
        frames += idle + walk + run
        I = list(range(b, b + 6))
        meta[name] = {
            # olha, mexe a orelha, pisca, abaixa a cabeça e pasta um pouco, volta a olhar
            "S_Idle": [I[0]] * 4 + [I[1], I[0], I[0], I[2]] + [I[0]] * 3 + [I[3], I[4], I[5], I[4], I[5], I[4], I[5], I[3]],
            "S_Walk": list(range(b + 6, b + 12)),
            "S_Run": list(range(b + 12, b + 16)),
        }
    cols = 8
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGBA", (cols * FW, rows * FH), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, ((i % cols) * FW, (i // cols) * FH))
    sheet.save(os.path.join(OUT, "rp-deer.png"))
    json.dump(meta, open(os.path.join(OUT, "rp-deer.json"), "w"), separators=(",", ":"))
    print("cervos:", len(frames), "quadros")


if __name__ == "__main__":
    main()
