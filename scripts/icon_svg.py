"""
Biblioteca de desenho dos ícones de itens (SVG vetorial, renderizado pelo Chromium em scripts/build_item_icons.py).
Cada ícone é montado com peças (lâmina, guarda, cabo, pomo, cabeça de machado, orbe…) e materiais com gradiente,
contorno escuro, brilhos, runas, gemas facetadas, aura e faíscas. Tela de 128x128.
"""
import math
import random

OUT = "#0b0d13"   # contorno

# materiais: (claro, médio, escuro)
MAT = {
    "iron": ("#eef1f5", "#a7aeb9", "#565d69"),
    "steel": ("#f7fbff", "#bccbdd", "#566883"),
    "silver": ("#ffffff", "#d6dde8", "#7d8899"),
    "bronze": ("#ffd9a0", "#c58a45", "#6e4317"),
    "gold": ("#fff4c2", "#f2c14e", "#93620e"),
    "darksteel": ("#a9aec6", "#4f546d", "#1d1f2d"),
    "obsidian": ("#9f86e0", "#3d2b6e", "#120b24"),
    "ice": ("#ffffff", "#a9e7ff", "#3b8fd2"),
    "lava": ("#ffe39a", "#ff7b2c", "#7d1b08"),
    "bone": ("#fffbea", "#e3d6ae", "#8a7a52"),
    "wood": ("#d29a5c", "#8c5b2b", "#45290f"),
    "darkwood": ("#8a5a3a", "#4e2f1c", "#1f120a"),
    "leather": ("#b9784a", "#76401f", "#371a0b"),
    "greenleather": ("#7fbf6a", "#3f7f3a", "#173a17"),
    "cloth_red": ("#ff8a7a", "#c0352a", "#5a120c"),
    "cloth_blue": ("#9cc4ff", "#3d6fd0", "#16285e"),
    "cloth_green": ("#9de08a", "#3f9a4a", "#14401c"),
    "cloth_purple": ("#c9a2ff", "#6e3fb3", "#2a1450"),
    "cloth_black": ("#6d6f80", "#2b2c38", "#0d0d14"),
    "cloth_grey": ("#e2e6ee", "#9aa4b4", "#4c5464"),
    "stone": ("#d8d4cc", "#8f8a80", "#45413a"),
    "crimson": ("#ff9b8a", "#c42b2b", "#4f0b0b"),
    "jade": ("#b8ffd8", "#3fbf7a", "#0f4a2a"),
    "aurora": ("#d6fff4", "#5fd6c4", "#1f5e8a"),
    "toxic": ("#e6ff9a", "#7fcf2a", "#2a4a08"),
}
GEM = {
    "ruby": ("#ffd0d0", "#ff3b4e", "#7a0718"),
    "sapphire": ("#d6e8ff", "#3d7bff", "#0b2a7a"),
    "emerald": ("#d0ffe0", "#2fd07a", "#06502a"),
    "amethyst": ("#f0d8ff", "#a85cff", "#3f0f7a"),
    "topaz": ("#fff3c8", "#ffb21e", "#7a4a00"),
    "diamond": ("#ffffff", "#c8f4ff", "#5aa8d0"),
    "onyx": ("#8c8ca0", "#2a2a38", "#08080e"),
    "soul": ("#e6fff0", "#5affb0", "#0a6a40"),
    "void": ("#e8d0ff", "#7a2cff", "#1a0440"),
    "amber": ("#fff0b0", "#ff9f1a", "#7a3a00"),
}


class Icon:
    def __init__(self, seed=1):
        self.defs, self.body, self.under, self.over = [], [], [], []
        self.n = 0
        self.R = random.Random(seed)

    def gid(self, p="g"):
        self.n += 1
        return f"{p}{self.n}"

    def lin(self, cols, x1=0, y1=0, x2=1, y2=0, stops=None):
        i = self.gid("l")
        st = stops or [k / (len(cols) - 1) for k in range(len(cols))]
        s = "".join(f'<stop offset="{o:.2f}" stop-color="{c}"/>' for o, c in zip(st, cols))
        self.defs.append(f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>')
        return f"url(#{i})"

    def rad(self, cols, cx=.5, cy=.5, r=.5, fx=None, fy=None, stops=None, op=None):
        i = self.gid("r")
        st = stops or [k / (len(cols) - 1) for k in range(len(cols))]
        ops = op or [1] * len(cols)
        s = "".join(f'<stop offset="{o:.2f}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in zip(st, cols, ops))
        f = f' fx="{fx}" fy="{fy}"' if fx is not None else ""
        self.defs.append(f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}"{f}>{s}</radialGradient>')
        return f"url(#{i})"

    def metal(self, m, vertical=False):
        a, b, c = MAT[m] if isinstance(m, str) else m
        return self.lin([a, b, c], 0, 0, 0, 1) if vertical else self.lin([a, b, b, c], 0, 0, 1, 0, [0, .35, .6, 1])

    def svg(self, glow=None, glow_r=5, sparkle=None, aura=None):
        out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">']
        d = list(self.defs)
        filt = '<filter id="fx" x="-30%" y="-30%" width="160%" height="160%">'
        if glow:
            filt += f'<feDropShadow dx="0" dy="0" stdDeviation="{glow_r}" flood-color="{glow}" flood-opacity=".95"/>'
        filt += '<feDropShadow dx="1.6" dy="2.6" stdDeviation="1.6" flood-color="#000" flood-opacity=".55"/></filter>'
        d.append(filt)
        out.append("<defs>" + "".join(d) + "</defs>")
        if aura:
            out.append(f'<circle cx="64" cy="64" r="58" fill="{self.rad([aura, aura], op=[.55, 0])}"/>')
        out += self.under
        out.append('<g filter="url(#fx)">' + "".join(self.body) + "</g>")
        out += self.over
        if sparkle:
            for (x, y, s) in sparkle:
                out.append(star(x, y, s, "#ffffff"))
        out.append("</svg>")
        return "".join(out)


def star(x, y, s, col, op=1):
    return (f'<path d="M{x} {y-s} Q{x} {y} {x+s} {y} Q{x} {y} {x} {y+s} Q{x} {y} {x-s} {y} Q{x} {y} {x} {y-s}Z" '
            f'fill="{col}" opacity="{op}"/>')


def sparkles(seed, n=4, area=(14, 114), smin=3, smax=6):
    R = random.Random(seed)
    return [(R.uniform(*area), R.uniform(*area), R.uniform(smin, smax)) for _ in range(n)]


def P(pts):
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"


def gem(I, x, y, r, g, facet=True):
    a, b, c = GEM[g]
    fill = I.rad([a, b, c], .38, .32, .75)
    s = f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{OUT}" stroke-width="2"/>'
    if facet and r >= 4:
        k = r * .55
        s += f'<path d="M{x-k} {y} L{x} {y-k} L{x+k} {y} L{x} {y+k}Z" fill="#fff" opacity=".22"/>'
    s += f'<circle cx="{x-r*.35}" cy="{y-r*.4}" r="{max(1,r*.28)}" fill="#fff" opacity=".85"/>'
    return s


def runes(I, xs, y0, y1, col, n=4, w=4):
    s = ""
    R = I.R
    step = (y1 - y0) / n
    for k in range(n):
        y = y0 + step * (k + .5)
        kind = R.randint(0, 3)
        if kind == 0:
            s += f'<path d="M{xs-w/2} {y-3} L{xs+w/2} {y+3} M{xs+w/2} {y-3} L{xs-w/2} {y+3}" stroke="{col}" stroke-width="1.6"/>'
        elif kind == 1:
            s += f'<path d="M{xs} {y-3.5} L{xs} {y+3.5} M{xs-w/2} {y-1} L{xs+w/2} {y-1}" stroke="{col}" stroke-width="1.6"/>'
        elif kind == 2:
            s += f'<circle cx="{xs}" cy="{y}" r="{w/2.2}" fill="none" stroke="{col}" stroke-width="1.5"/>'
        else:
            s += f'<path d="M{xs-w/2} {y+3} L{xs} {y-3.5} L{xs+w/2} {y+3}" fill="none" stroke="{col}" stroke-width="1.6"/>'
    return s


# ───────────────────────── peças das armas (desenhadas na vertical; o grupo gira 45°) ─────────────────────────
def blade(I, y_tip, y_base, w, mat, kind="straight", fuller=None, edge_glow=None, rune=None, serr=False):
    hw = w / 2
    if kind == "straight":
        pts = [(-hw, y_base), (-hw, y_tip + w * .9), (0, y_tip), (hw, y_tip + w * .9), (hw, y_base)]
    elif kind == "broad":
        pts = [(-hw * .85, y_base), (-hw, y_tip + w * 1.6), (-hw * .55, y_tip + w * .5), (0, y_tip), (hw * .55, y_tip + w * .5), (hw, y_tip + w * 1.6), (hw * .85, y_base)]
    elif kind == "curved":
        d = (f"M{-hw} {y_base} C{-hw-2} {(y_base+y_tip)/2} {-hw+w*.2} {y_tip+12} {hw*1.6} {y_tip} "
             f"C{hw*.9} {y_tip+18} {hw+2} {(y_base+y_tip)/2} {hw} {y_base}Z")
        pts = None
    elif kind == "jagged":
        pts = [(-hw, y_base)]
        L = y_base - y_tip
        for k in range(1, 6):
            yy = y_base - L * k / 6
            pts.append((-hw - (3 if k % 2 else 0), yy))
        pts += [(0, y_tip)]
        for k in range(5, 0, -1):
            yy = y_base - L * k / 6
            pts.append((hw + (3 if k % 2 == 0 else 0), yy))
        pts.append((hw, y_base))
    elif kind == "cleaver":
        pts = [(-hw * .5, y_base), (-hw * .5, y_tip + 4), (hw * 1.4, y_tip), (hw * 1.5, y_base - 6), (hw * .5, y_base)]
    elif kind == "fang":
        d = (f"M{-hw} {y_base} Q{-hw-4} {(y_base+y_tip)/2} {hw*.4} {y_tip} Q{hw+3} {(y_base+y_tip)/2+6} {hw} {y_base}Z")
        pts = None
    if pts is not None:
        d = P(pts)
    s = f'<path d="{d}" fill="{I.metal(mat)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
    if serr:
        L = y_base - y_tip
        for k in range(1, 6):
            yy = y_base - L * (k / 6.5)
            s += f'<path d="M{hw} {yy} l4 -3 l-4 -3Z" fill="{MAT[mat][1]}" stroke="{OUT}" stroke-width="1.6"/>'
    # gume claro
    s += f'<path d="M{-hw+2.2} {y_base-3} L{-hw+2.2} {y_tip+w*1.1}" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none"/>' if kind in ("straight", "broad", "jagged") else ""
    if fuller:
        s += f'<path d="M0 {y_base-4} L0 {y_tip+w*1.6}" stroke="{fuller}" stroke-width="{max(2,w*.18)}" stroke-linecap="round"/>'
    if edge_glow:
        s += f'<path d="{d}" fill="none" stroke="{edge_glow}" stroke-width="1.4" stroke-opacity=".9"/>'
    if rune:
        s += runes(I, 0, y_tip + w * 1.8, y_base - 4, rune, n=4, w=max(3.5, w * .35))
    I.body.append(s)


def guard(I, y, w, mat, style="bar", gem_=None):
    h = 7
    if style == "bar":
        d = f"M{-w/2} {y} h{w} v{h} h{-w}Z"
        s = f'<path d="{d}" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
    elif style == "curved":
        d = (f"M{-w/2} {y-6} Q{-w/2+4} {y+2} 0 {y+1} Q{w/2-4} {y+2} {w/2} {y-6} L{w/2+2} {y-2} "
             f"Q{w/2-2} {y+h+2} 0 {y+h+1} Q{-w/2+2} {y+h+2} {-w/2-2} {y-2}Z")
        s = f'<path d="{d}" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
    elif style == "wings":
        d = (f"M0 {y} C{-w*.25} {y-4} {-w*.45} {y-12} {-w*.62} {y-16} C{-w*.5} {y-2} {-w*.4} {y+h} 0 {y+h+2} "
             f"C{w*.4} {y+h} {w*.5} {y-2} {w*.62} {y-16} C{w*.45} {y-12} {w*.25} {y-4} 0 {y}Z")
        s = f'<path d="{d}" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
        for k in (-1, 1):
            s += f'<path d="M{k*w*.15} {y+3} Q{k*w*.35} {y-4} {k*w*.52} {y-11}" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" fill="none"/>'
    elif style == "claws":
        s = ""
        for k in (-1, 1):
            d = f"M0 {y+2} Q{k*w*.35} {y+6} {k*w*.5} {y-10} Q{k*w*.42} {y+1} {k*4} {y+h}Z"
            s += f'<path d="{d}" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="2.6" stroke-linejoin="round"/>'
        s += f'<rect x="{-w*.2}" y="{y}" width="{w*.4}" height="{h}" rx="2" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="2.6"/>'
    elif style == "disc":
        s = f'<ellipse cx="0" cy="{y+h/2}" rx="{w/2}" ry="{h*.8}" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3"/>'
    if gem_:
        s += gem(I, 0, y + h / 2, 4.6, gem_)
    I.body.append(s)


def grip(I, y0, y1, w, mat, wrap=None):
    s = f'<rect x="{-w/2}" y="{y0}" width="{w}" height="{y1-y0}" rx="{w/3}" fill="{I.metal(mat)}" stroke="{OUT}" stroke-width="3"/>'
    if wrap:
        k = y0 + 3
        while k < y1 - 2:
            s += f'<path d="M{-w/2+1} {k+3} L{w/2-1} {k}" stroke="{wrap}" stroke-width="2"/>'
            k += 5
    I.body.append(s)


def pommel(I, y, r, mat, gem_=None, kind="round"):
    if kind == "round":
        s = f'<circle cx="0" cy="{y}" r="{r}" fill="{I.rad(list(MAT[mat]), .38, .32, .8)}" stroke="{OUT}" stroke-width="3"/>'
    else:  # garra/diamante
        s = f'<path d="M0 {y-r} L{r} {y} L0 {y+r*1.3} L{-r} {y}Z" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
    if gem_:
        s += gem(I, 0, y, r * .55, gem_, facet=False)
    I.body.append(s)


def weapon_group(I, fn, scale=1.0, angle=45, dx=0, dy=0):
    """desenha as peças com fn(I) na vertical e gira o conjunto"""
    before = len(I.body)
    fn(I)
    parts = I.body[before:]
    del I.body[before:]
    I.body.append(f'<g transform="translate({64+dx} {64+dy}) rotate({angle}) scale({scale*1.14:.3f})">' + "".join(parts) + "</g>")


# ───────────────────────── armas completas ─────────────────────────
def sword(I, blade_mat="steel", guard_mat="iron", grip_mat="leather", pom_mat="iron", gstyle="bar", gem_g=None, gem_p=None,
          fuller=None, glow=None, rune=None, bkind="straight", w=12, wrap="#2a160a", serr=False, scale=1.0):
    def f(I):
        blade(I, -70, 22, w, blade_mat, bkind, fuller, glow, rune, serr)
        grip(I, 28, 56, 8, grip_mat, wrap)
        guard(I, 21, 40 if gstyle != "wings" else 46, guard_mat, gstyle, gem_g)
        pommel(I, 62, 7, pom_mat, gem_p)
    weapon_group(I, f, scale)


def greatsword(I, blade_mat="steel", guard_mat="iron", grip_mat="leather", pom_mat="iron", gstyle="bar", gem_g=None, gem_p=None,
               fuller=None, glow=None, rune=None, bkind="broad", w=19, wrap="#2a160a", serr=False, cracks=None):
    def f(I):
        blade(I, -76, 18, w, blade_mat, bkind, fuller, glow, rune, serr)
        if cracks:
            R = I.R
            s = ""
            for k in range(4):
                y = -60 + k * 18 + R.uniform(-3, 3)
                s += f'<path d="M{-w/2+2} {y} l{w*.3} 4 l{w*.25} -5 l{w*.3} 6" stroke="{cracks}" stroke-width="2" fill="none"/>'
            I.body.append(s)
        grip(I, 25, 56, 9, grip_mat, wrap)
        guard(I, 17, 54 if gstyle != "wings" else 60, guard_mat, gstyle, gem_g)
        pommel(I, 63, 8, pom_mat, gem_p)
    weapon_group(I, f, 1.0)


def dagger(I, blade_mat="steel", guard_mat="iron", grip_mat="leather", pom_mat="iron", gstyle="bar", gem_g=None, gem_p=None,
           glow=None, rune=None, bkind="straight", w=11, wrap="#2a160a", dx=0, dy=0, angle=45, scale=1.25):
    def f(I):
        blade(I, -46, 6, w, blade_mat, bkind, None, glow, rune)
        grip(I, 12, 32, 7.5, grip_mat, wrap)
        guard(I, 5, 28, guard_mat, gstyle, gem_g)
        pommel(I, 38, 6, pom_mat, gem_p)
    weapon_group(I, f, scale, angle, dx, dy)


def twin(I, **kw):
    dagger(I, angle=30, dx=-13, dy=2, scale=1.18, **kw)
    dagger(I, angle=-30 + 360, dx=13, dy=2, scale=1.18, **kw)


def axe(I, head_mat="iron", handle="wood", double=False, gem_=None, glow=None, rune=None, band="iron", spike=False):
    def f(I):
        I.body.append(f'<rect x="-4.5" y="-60" width="9" height="132" rx="4" fill="{I.metal(handle)}" stroke="{OUT}" stroke-width="3"/>')
        for y in (40, 52):
            I.body.append(f'<rect x="-6" y="{y}" width="12" height="5" rx="2" fill="{I.metal(band, True)}" stroke="{OUT}" stroke-width="2"/>')
        sides = (1, -1) if double else (1,)
        for k in sides:
            d = (f"M{k*4} -54 C{k*22} -66 {k*38} -72 {k*44} -62 C{k*50} -44 {k*50} -26 {k*44} -12 "
                 f"C{k*36} -4 {k*20} -12 {k*4} -22Z")
            I.body.append(f'<path d="{d}" fill="{I.metal(head_mat)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
            I.body.append(f'<path d="M{k*43} -60 C{k*48} -44 {k*48} -28 {k*42} -14" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/>')
            if glow:
                I.body.append(f'<path d="M{k*44} -62 C{k*50} -44 {k*50} -26 {k*44} -12" stroke="{glow}" stroke-width="2.4" fill="none"/>')
            if rune:
                I.body.append(runes(I, k * 24, -54, -22, rune, n=3, w=5))
        if spike:
            I.body.append(f'<path d="M-5 -60 L0 -76 L5 -60Z" fill="{I.metal(head_mat, True)}" stroke="{OUT}" stroke-width="2.6"/>')
        if gem_:
            I.body.append(gem(I, 0, -38, 5, gem_))
    weapon_group(I, f, .95)


def blunt(I, kind="mace", head_mat="iron", handle="wood", gem_=None, glow=None, band="iron", spikes_mat=None):
    def f(I):
        I.body.append(f'<rect x="-4.5" y="-30" width="9" height="102" rx="4" fill="{I.metal(handle)}" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<rect x="-6" y="52" width="12" height="16" rx="3" fill="{I.metal("leather")}" stroke="{OUT}" stroke-width="2.4"/>')
        if kind == "club":
            d = "M-6 -20 C-14 -40 -16 -62 -6 -72 C4 -78 16 -70 14 -54 C12 -40 8 -28 6 -20Z"
            I.body.append(f'<path d="{d}" fill="{I.metal(head_mat)}" stroke="{OUT}" stroke-width="3"/>')
            for (x, y) in ((-6, -58), (6, -48), (-2, -38)):
                I.body.append(f'<circle cx="{x}" cy="{y}" r="2.2" fill="{MAT["iron"][1]}" stroke="{OUT}" stroke-width="1.4"/>')
        elif kind == "mace":
            sm = spikes_mat or head_mat
            for a in range(0, 360, 45):
                r = math.radians(a)
                cx, cy = math.sin(r), -math.cos(r)
                x0, y0 = cx * 14, -48 + cy * 14
                x1, y1 = cx * 27, -48 + cy * 27
                px, py = -cy * 5, cx * 5
                I.body.append(f'<path d="M{x0+px} {y0+py} L{x1} {y1} L{x0-px} {y0-py}Z" fill="{I.metal(sm, True)}" stroke="{OUT}" stroke-width="2.4" stroke-linejoin="round"/>')
            I.body.append(f'<circle cx="0" cy="-48" r="17" fill="{I.rad(list(MAT[head_mat]), .38, .32, .8)}" stroke="{OUT}" stroke-width="3"/>')
            if gem_:
                I.body.append(gem(I, 0, -48, 6, gem_))
        elif kind == "hammer":
            I.body.append(f'<rect x="-30" y="-66" width="60" height="30" rx="5" fill="{I.metal(head_mat, True)}" stroke="{OUT}" stroke-width="3"/>')
            I.body.append(f'<rect x="-30" y="-56" width="60" height="9" fill="{I.metal(band, True)}" stroke="{OUT}" stroke-width="2"/>')
            I.body.append('<path d="M-27 -62 h54" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>')
            if gem_:
                I.body.append(gem(I, 0, -51, 6, gem_))
        if glow:
            I.body.append(f'<circle cx="0" cy="-48" r="22" fill="none" stroke="{glow}" stroke-width="2" stroke-opacity=".8"/>' if kind == "mace" else "")
    weapon_group(I, f, .95)


def staff(I, shaft="wood", top="orb", top_col="sapphire", claw="gold", glow=None, band="gold", length=1.0, extra=None):
    def f(I):
        I.body.append(f'<rect x="-4" y="-44" width="8" height="{118*length}" rx="4" fill="{I.metal(shaft)}" stroke="{OUT}" stroke-width="3"/>')
        for y in (-34, 30):
            I.body.append(f'<rect x="-6" y="{y}" width="12" height="5" rx="2" fill="{I.metal(band, True)}" stroke="{OUT}" stroke-width="2"/>')
        if top == "orb":
            a, b, c = GEM[top_col]
            I.body.append(f'<path d="M-4 -40 Q-16 -48 -14 -66 M4 -40 Q16 -48 14 -66" stroke="{OUT}" stroke-width="6" fill="none"/>')
            I.body.append(f'<path d="M-4 -40 Q-16 -48 -14 -66 M4 -40 Q16 -48 14 -66" stroke="{MAT[claw][1]}" stroke-width="3" fill="none"/>')
            I.body.append(f'<circle cx="0" cy="-60" r="13" fill="{I.rad([a, b, c], .38, .32, .75)}" stroke="{OUT}" stroke-width="3"/>')
            I.body.append(f'<circle cx="-4" cy="-65" r="3.6" fill="#fff" opacity=".85"/>')
        elif top == "crystal":
            a, b, c = GEM[top_col]
            I.body.append(f'<path d="M0 -84 L11 -62 L0 -42 L-11 -62Z" fill="{I.lin([a, b, c], 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
            I.body.append('<path d="M0 -84 L0 -42 M-11 -62 L11 -62" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>')
            I.body.append(f'<path d="M-5 -42 Q-12 -50 -14 -58 M5 -42 Q12 -50 14 -58" stroke="{MAT[claw][1]}" stroke-width="3" fill="none"/>')
        elif top == "skull":
            I.body.append(f'<path d="M-13 -62 C-14 -80 14 -80 13 -62 C13 -54 8 -52 7 -46 L-7 -46 C-8 -52 -13 -54 -13 -62Z" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="3"/>')
            ec = GEM[top_col][1]
            I.body.append(f'<circle cx="-5" cy="-62" r="3.4" fill="{ec}"/><circle cx="5" cy="-62" r="3.4" fill="{ec}"/>')
            I.body.append(f'<path d="M-4 -50 v4 M0 -50 v4 M4 -50 v4" stroke="{OUT}" stroke-width="1.6"/>')
        elif top == "flame":
            I.body.append(f'<path d="M-10 -44 Q-16 -40 -16 -48 L16 -48 Q16 -40 10 -44Z" fill="{I.metal(claw, True)}" stroke="{OUT}" stroke-width="2.6"/>')
            I.body.append(flame(I, 0, -50, 1.0))
        elif top == "star":
            a, b, c = GEM[top_col]
            pts = []
            for k in range(10):
                r = 16 if k % 2 == 0 else 7
                ang = math.radians(k * 36 - 90)
                pts.append((math.cos(ang) * r, -62 + math.sin(ang) * r))
            I.body.append(f'<path d="{P(pts)}" fill="{I.rad([a, b, c], .45, .4, .7)}" stroke="{OUT}" stroke-width="2.6" stroke-linejoin="round"/>')
            for (x, y, s) in ((-16, -78, 3), (15, -80, 2.4), (18, -50, 2.2)):
                I.body.append(star(x, y, s, a))
        elif top == "snowflake":
            s = ""
            for k in range(6):
                ang = math.radians(k * 60)
                x, y = math.sin(ang) * 15, -62 - math.cos(ang) * 15
                s += f'<path d="M0 -62 L{x:.1f} {y:.1f}" stroke="{OUT}" stroke-width="6" stroke-linecap="round"/>'
            for k in range(6):
                ang = math.radians(k * 60)
                x, y = math.sin(ang) * 15, -62 - math.cos(ang) * 15
                s += f'<path d="M0 -62 L{x:.1f} {y:.1f}" stroke="{GEM["diamond"][1]}" stroke-width="3" stroke-linecap="round"/>'
            s += f'<circle cx="0" cy="-62" r="5" fill="#fff" stroke="{OUT}" stroke-width="2"/>'
            I.body.append(s)
        elif top == "heart":
            I.body.append(f'<path d="M-6 -44 Q-18 -50 -16 -64 M6 -44 Q18 -50 16 -64" stroke="{OUT}" stroke-width="6" fill="none"/>')
            I.body.append(f'<path d="M-6 -44 Q-18 -50 -16 -64 M6 -44 Q18 -50 16 -64" stroke="{MAT[claw][1]}" stroke-width="3" fill="none"/>')
            I.body.append(heart_path(I, 0, -60, .62, top_col))
        elif top == "comet":
            a, b, c = GEM[top_col]
            I.body.append(f'<path d="M0 -62 L-22 -86 M4 -64 L-14 -92 M-3 -58 L-26 -76" stroke="{a}" stroke-width="3" stroke-linecap="round" opacity=".8"/>')
            I.body.append(f'<circle cx="0" cy="-60" r="12" fill="{I.rad(["#ffffff", b, c], .45, .4, .7)}" stroke="{OUT}" stroke-width="3"/>')
            I.body.append(f'<path d="M-4 -40 Q-14 -46 -12 -56 M4 -40 Q14 -46 12 -56" stroke="{MAT[claw][1]}" stroke-width="3" fill="none"/>')
        elif top == "brazier":
            I.body.append(f'<path d="M-15 -52 L15 -52 L10 -40 L-10 -40Z" fill="{I.metal(claw, True)}" stroke="{OUT}" stroke-width="2.8" stroke-linejoin="round"/>')
            I.body.append(flame(I, 0, -52, 1.15))
        elif top == "tomb":
            I.body.append(f'<path d="M-12 -44 L-12 -70 Q0 -84 12 -70 L12 -44Z" fill="{I.metal("stone", True)}" stroke="{OUT}" stroke-width="3"/>')
            I.body.append(f'<path d="M0 -72 v18 M-6 -64 h12" stroke="{GEM[top_col][1]}" stroke-width="3"/>')
        elif top == "rune":
            a, b, c = GEM[top_col]
            I.body.append(f'<path d="M-12 -44 L-14 -74 L0 -82 L14 -74 L12 -44Z" fill="{I.metal("stone", True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
            I.body.append(f'<path d="M0 -76 L-6 -62 L6 -58 L0 -48" stroke="{b}" stroke-width="3" fill="none" stroke-linejoin="round"/>')
        if glow:
            I.body.append(f'<circle cx="0" cy="-62" r="20" fill="none" stroke="{glow}" stroke-width="1.6" stroke-opacity=".7"/>')
        if extra:
            extra(I)
    weapon_group(I, f, .95)


def flame(I, x, y, s=1.0, cols=("#fff6c0", "#ffb02e", "#e2380e")):
    a, b, c = cols
    d1 = f"M{x} {y} C{x-14*s} {y-6*s} {x-12*s} {y-22*s} {x-4*s} {y-34*s} C{x-4*s} {y-24*s} {x+2*s} {y-22*s} {x+4*s} {y-30*s} C{x+14*s} {y-20*s} {x+14*s} {y-6*s} {x} {y}Z"
    d2 = f"M{x} {y-2*s} C{x-7*s} {y-6*s} {x-6*s} {y-16*s} {x-1*s} {y-24*s} C{x+1*s} {y-16*s} {x+7*s} {y-12*s} {x} {y-2*s}Z"
    return (f'<path d="{d1}" fill="{I.lin([b, c], 0, 0, 0, 1)}" stroke="{OUT}" stroke-width="2.4" stroke-linejoin="round"/>'
            f'<path d="{d2}" fill="{a}"/>')


def heart_path(I, x, y, s, g):
    a, b, c = GEM[g]
    d = (f"M{x} {y+16*s} C{x-26*s} {y} {x-22*s} {y-22*s} {x-8*s} {y-20*s} C{x-3*s} {y-19*s} {x} {y-14*s} {x} {y-12*s} "
         f"C{x} {y-14*s} {x+3*s} {y-19*s} {x+8*s} {y-20*s} C{x+22*s} {y-22*s} {x+26*s} {y} {x} {y+16*s}Z")
    return (f'<path d="{d}" fill="{I.rad([a, b, c], .4, .35, .75)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
            f'<ellipse cx="{x-9*s}" cy="{y-10*s}" rx="{4*s}" ry="{2.6*s}" fill="#fff" opacity=".8" transform="rotate(-30 {x-9*s} {y-10*s})"/>')


def bow(I, wood="wood", string="#e8e2d0", tips=None, grip_mat="leather", glow=None, long=False, gem_=None, limb_detail=None, flames=False):
    def f(I):
        L = 70 if long else 60
        bend = -30 if long else -34
        outer = f"M6 {-L} Q{bend-8} 0 6 {L}"
        inner = f"M6 {L} Q{bend+8} 0 6 {-L}"
        I.body.append(f'<path d="M6 {-L} L6 {L}" stroke="{string}" stroke-width="1.6"/>')
        I.body.append(f'<path d="{outer} L8 {L-2} {inner[1:]} Z" fill="{I.metal(wood)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        if limb_detail:
            I.body.append(f'<path d="M{bend/2+2} -30 Q{bend/2-2} 0 {bend/2+2} 30" stroke="{limb_detail}" stroke-width="2" fill="none"/>')
        I.body.append(f'<rect x="{bend/2-2}" y="-9" width="11" height="18" rx="3" fill="{I.metal(grip_mat)}" stroke="{OUT}" stroke-width="2.6"/>')
        if tips:
            for k in (-1, 1):
                I.body.append(f'<path d="M6 {k*L} q-8 {k*2} -6 {k*10}" stroke="{OUT}" stroke-width="5" fill="none" stroke-linecap="round"/>')
                I.body.append(f'<path d="M6 {k*L} q-8 {k*2} -6 {k*10}" stroke="{MAT[tips][1]}" stroke-width="2.6" fill="none" stroke-linecap="round"/>')
        if gem_:
            I.body.append(gem(I, bend / 2 + 3.5, 0, 4.6, gem_))
        if glow:
            I.body.append(f'<path d="{outer}" fill="none" stroke="{glow}" stroke-width="1.6"/>')
        if flames:
            for k in (-1, 1):
                I.body.append(flame(I, bend / 2 - 2, k * 36 + 10, .45))
        # flecha encaixada
        I.body.append(f'<path d="M{bend/2+4} 0 L44 0" stroke="{OUT}" stroke-width="4"/><path d="M{bend/2+4} 0 L44 0" stroke="#c8a070" stroke-width="2"/>')
        I.body.append(f'<path d="M44 -4 L52 0 L44 4Z" fill="{MAT["iron"][1]}" stroke="{OUT}" stroke-width="2"/>')
    weapon_group(I, f, .95, angle=45)


def shield(I, face="iron", rim="silver", emblem=None, boss="iron", kind="heater", gem_=None, spikes=False, wood=False):
    if kind == "round":
        I.body.append(f'<circle cx="64" cy="66" r="46" fill="{I.rad(list(MAT[face]), .4, .35, .8)}" stroke="{OUT}" stroke-width="3.5"/>')
        if wood:
            for x in (42, 56, 70, 84):
                I.body.append(f'<path d="M{x} 24 v84" stroke="{MAT[face][2]}" stroke-width="2" opacity=".7"/>')
        I.body.append(f'<circle cx="64" cy="66" r="46" fill="none" stroke="{MAT[rim][1]}" stroke-width="5"/>')
        I.body.append(f'<circle cx="64" cy="66" r="46" fill="none" stroke="{OUT}" stroke-width="1.5"/>')
        I.body.append(f'<circle cx="64" cy="66" r="12" fill="{I.rad(list(MAT[boss]), .38, .3, .8)}" stroke="{OUT}" stroke-width="3"/>')
        for a in range(0, 360, 45):
            r = math.radians(a)
            I.body.append(f'<circle cx="{64+math.cos(r)*39:.1f}" cy="{66+math.sin(r)*39:.1f}" r="2.4" fill="{MAT[rim][0]}" stroke="{OUT}" stroke-width="1.2"/>')
    else:
        tall = kind == "tower"
        top, bot = (12, 120) if tall else (16, 118)
        w = 42 if tall else 46
        d = (f"M64 {top} L{64+w} {top+10} L{64+w-2} {top+60 if not tall else top+76} "
             f"Q{64+w-10} {bot-16} 64 {bot} Q{64-w+10} {bot-16} {64-w+2} {top+60 if not tall else top+76} L{64-w} {top+10}Z")
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[face]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        I.body.append(f'<path d="{d}" fill="none" stroke="{MAT[rim][1]}" stroke-width="5" stroke-linejoin="round"/>')
        I.body.append(f'<path d="{d}" fill="none" stroke="{OUT}" stroke-width="1.4"/>')
        I.body.append(f'<path d="M{64-w+8} {top+16} Q64 {top+6} {64+w-8} {top+16}" stroke="#fff" stroke-opacity=".35" stroke-width="2.5" fill="none"/>')
        if emblem == "cross":
            I.body.append(f'<path d="M64 {top+22} V{bot-26} M{64-20} {top+46} H{64+20}" stroke="{OUT}" stroke-width="11" stroke-linecap="round"/>')
            I.body.append(f'<path d="M64 {top+22} V{bot-26} M{64-20} {top+46} H{64+20}" stroke="{MAT[boss][1]}" stroke-width="6" stroke-linecap="round"/>')
        elif emblem == "dragon":
            I.body.append(f'<path d="M48 78 C44 58 56 40 74 42 L84 34 L82 48 C90 52 88 66 78 66 L84 76 L70 72 C66 82 56 86 48 78Z" fill="{I.metal("gold", True)}" stroke="{OUT}" stroke-width="2.6" stroke-linejoin="round"/>')
            I.body.append('<circle cx="76" cy="52" r="2.4" fill="#ff3b2b"/>')
        elif emblem == "boss":
            I.body.append(f'<circle cx="64" cy="64" r="13" fill="{I.rad(list(MAT[boss]), .38, .3, .8)}" stroke="{OUT}" stroke-width="3"/>')
        if spikes:
            for (x, y) in ((64, 62), (44, 46), (84, 46), (52, 86), (76, 86)):
                I.body.append(f'<path d="M{x-6} {y+4} L{x} {y-10} L{x+6} {y+4}Z" fill="{I.metal("iron", True)}" stroke="{OUT}" stroke-width="2.2" stroke-linejoin="round"/>')
        if gem_:
            I.body.append(gem(I, 64, top + 30, 6, gem_))


def armor(I, mat="iron", trim="iron", kind="plate", gem_=None, emblem=None, cloth=None, spikes=False, frost=False, scales=False):
    if kind in ("plate", "scale", "leather"):
        d = "M38 30 L52 24 Q64 34 76 24 L90 30 L108 44 L100 62 L92 58 L92 106 Q64 116 36 106 L36 58 L28 62 L20 44Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        if kind == "plate":
            for y in (66, 80, 94):
                I.body.append(f'<path d="M38 {y} Q64 {y+8} 90 {y}" stroke="{OUT}" stroke-width="2.4" fill="none"/>')
                I.body.append(f'<path d="M38 {y-2} Q64 {y+6} 90 {y-2}" stroke="#fff" stroke-opacity=".3" stroke-width="1.6" fill="none"/>')
            I.body.append(f'<path d="M64 34 L64 60" stroke="{OUT}" stroke-width="2.2"/>')
        if kind == "scale" or scales:
            for row in range(5):
                for col in range(5):
                    x = 42 + col * 11 + (5 if row % 2 else 0)
                    y = 50 + row * 11
                    if x > 92:
                        continue
                    I.body.append(f'<path d="M{x-5} {y} Q{x} {y+9} {x+5} {y}" fill="none" stroke="{MAT[mat][2]}" stroke-width="2"/>')
        if kind == "leather":
            I.body.append(f'<path d="M48 40 L48 100 M80 40 L80 100" stroke="{MAT[mat][2]}" stroke-width="2" stroke-dasharray="4 3"/>')
            I.body.append(f'<rect x="36" y="80" width="56" height="9" fill="{I.metal("darkwood", True)}" stroke="{OUT}" stroke-width="2.4"/>')
            I.body.append(f'<rect x="58" y="78" width="12" height="13" rx="2" fill="{I.metal("gold", True)}" stroke="{OUT}" stroke-width="2"/>')
        # ombreiras
        for k in (-1, 1):
            cx = 64 + k * 38
            I.body.append(f'<path d="M{cx-14} 40 Q{cx} 24 {cx+14} 40 Q{cx} 50 {cx-14} 40Z" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="3"/>')
            if spikes:
                I.body.append(f'<path d="M{cx-5} 34 L{cx+k*4} 18 L{cx+5} 34Z" fill="{I.metal("darksteel", True)}" stroke="{OUT}" stroke-width="2.2"/>')
        I.body.append(f'<path d="M52 24 Q64 34 76 24" stroke="{MAT[trim][1]}" stroke-width="4" fill="none"/>')
        if frost:
            for (x, y) in ((46, 70), (78, 56), (70, 96)):
                I.body.append(star(x, y, 4, "#e8fbff"))
    elif kind == "robe":
        d = "M44 26 Q64 36 84 26 L98 40 L94 60 L102 112 Q64 120 26 112 L34 60 L30 40Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M64 34 L64 114" stroke="{MAT[trim][1]}" stroke-width="5"/><path d="M64 34 L64 114" stroke="{OUT}" stroke-width="1.2"/>')
        I.body.append(f'<path d="M34 72 Q64 80 94 72" stroke="{MAT[trim][1]}" stroke-width="5" fill="none"/>')
        I.body.append(f'<path d="M44 26 Q64 36 84 26" stroke="{MAT[trim][1]}" stroke-width="4" fill="none"/>')
    elif kind == "cloak":
        d = "M64 16 C46 16 40 30 42 44 L22 112 Q64 122 106 112 L86 44 C88 30 82 16 64 16Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M50 40 C50 28 78 28 78 40 C78 50 50 50 50 40Z" fill="{MAT[mat][2]}" stroke="{OUT}" stroke-width="2.4"/>')
        I.body.append(f'<path d="M48 60 L40 110 M80 60 L88 110 M64 56 L64 116" stroke="{MAT[mat][2]}" stroke-width="2" opacity=".8"/>')
        I.body.append(f'<circle cx="64" cy="52" r="5" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="2"/>')
    elif kind == "paint":   # urucum
        d = "M40 26 Q64 36 88 26 L96 108 Q64 118 32 108Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(["#e8b48a", "#c98a5e", "#7d4a2a"], 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5"/>')
        for y in (50, 66, 82):
            I.body.append(f'<path d="M38 {y} L50 {y+6} L62 {y} L74 {y+6} L86 {y} L92 {y+6}" stroke="#c83a2a" stroke-width="4" fill="none"/>')
        I.body.append('<circle cx="64" cy="40" r="5" fill="#c83a2a"/>')
    if gem_:
        I.body.append(gem(I, 64, 46 if kind != "cloak" else 52, 7, gem_))
    if emblem == "sun":
        I.body.append('<circle cx="64" cy="70" r="11" fill="#ff3b2b" stroke="#0b0d13" stroke-width="2.6"/>')


def helmet(I, mat="iron", trim="iron", kind="helm", gem_=None, plume=None, horns=None, eyes=None):
    if kind == "helm":
        d = "M28 74 C26 38 44 20 64 20 C84 20 102 38 100 74 L100 96 L84 100 L84 80 L44 80 L44 100 L28 96Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M40 62 L88 62 L88 70 L40 70Z" fill="{OUT}"/>')
        I.body.append(f'<path d="M64 20 L64 60" stroke="{MAT[trim][1]}" stroke-width="5"/><path d="M64 20 L64 60" stroke="{OUT}" stroke-width="1.2"/>')
        I.body.append('<path d="M38 40 Q50 26 64 24" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none"/>')
        if eyes:
            I.body.append(f'<rect x="46" y="63" width="10" height="5" fill="{eyes}"/><rect x="72" y="63" width="10" height="5" fill="{eyes}"/>')
    elif kind == "hood":
        d = "M64 18 C38 18 26 44 28 70 C30 92 24 106 20 112 L108 112 C104 106 98 92 100 70 C102 44 90 18 64 18Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M64 40 C46 40 42 60 44 78 C46 92 82 92 84 78 C86 60 82 40 64 40Z" fill="#06070b" stroke="{OUT}" stroke-width="2"/>')
        I.body.append(f'<path d="M30 70 C34 48 46 28 64 24" stroke="#fff" stroke-opacity=".25" stroke-width="2.5" fill="none"/>')
        if eyes:
            I.body.append(f'<ellipse cx="56" cy="66" rx="3.6" ry="2.4" fill="{eyes}"/><ellipse cx="72" cy="66" rx="3.6" ry="2.4" fill="{eyes}"/>')
        I.body.append(f'<path d="M24 106 L104 106" stroke="{MAT[trim][1]}" stroke-width="5"/>')
    elif kind == "kabuto":
        I.body.append(f'<path d="M24 78 Q64 60 104 78 L112 92 Q64 80 16 92Z" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<path d="M34 76 C32 44 46 28 64 28 C82 28 96 44 94 76Z" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5"/>')
        for x in (46, 56, 64, 72, 82):
            I.body.append(f'<path d="M{x} 34 L{x-2 if x<64 else x+2 if x>64 else x} 74" stroke="{MAT[mat][2]}" stroke-width="1.6"/>')
        I.body.append(f'<path d="M64 40 L40 12 L52 40 M64 40 L88 12 L76 40" fill="{I.metal("gold", True)}" stroke="{OUT}" stroke-width="2.6" stroke-linejoin="round"/>')
        I.body.append('<circle cx="64" cy="46" r="7" fill="#ff3b2b" stroke="#0b0d13" stroke-width="2.4"/>')
    elif kind == "wolf":
        I.body.append(f'<path d="M30 80 C26 44 44 24 64 24 C84 24 102 44 98 80 L86 96 L42 96Z" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5"/>')
        for k in (-1, 1):
            I.body.append(f'<path d="M{64+k*16} 30 L{64+k*30} 8 L{64+k*34} 38Z" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M44 66 L84 66 L80 74 L48 74Z" fill="{OUT}"/>')
        I.body.append('<circle cx="54" cy="70" r="2.6" fill="#bfe8ff"/><circle cx="74" cy="70" r="2.6" fill="#bfe8ff"/>')
        I.body.append(f'<path d="M40 50 Q64 40 88 50" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/>')
    elif kind == "leafhood":
        d = "M64 18 C38 18 26 44 28 70 C30 92 24 106 20 112 L108 112 C104 106 98 92 100 70 C102 44 90 18 64 18Z"
        I.body.append(f'<path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5"/>')
        I.body.append('<path d="M64 40 C46 40 42 60 44 78 C46 92 82 92 84 78 C86 60 82 40 64 40Z" fill="#06070b"/>')
        for (x, y, a) in ((38, 40, -30), (90, 40, 30), (64, 16, 0), (30, 84, -50), (98, 84, 50)):
            I.body.append(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="4.5" transform="rotate({a} {x} {y})" fill="{I.metal("jade", True)}" stroke="{OUT}" stroke-width="2"/>')
    elif kind == "cocar":
        cols = ["#e3342f", "#f6b23c", "#2f7fe0", "#3fbf5a", "#e3342f", "#f6b23c", "#2f7fe0"]
        for k, c in enumerate(cols):
            ang = math.radians(-60 + k * 20)
            x, y = 64 + math.sin(ang) * 46, 90 - math.cos(ang) * 64
            I.body.append(f'<path d="M64 90 Q{(64+x)/2-6} {(90+y)/2} {x} {y} Q{(64+x)/2+6} {(90+y)/2} 64 90Z" fill="{c}" stroke="{OUT}" stroke-width="2.2"/>')
        I.body.append(f'<path d="M28 92 Q64 76 100 92 L100 104 Q64 90 28 104Z" fill="{I.metal("gold", True)}" stroke="{OUT}" stroke-width="2.8"/>')
        for x in range(36, 96, 10):
            I.body.append(f'<circle cx="{x}" cy="{97 - (8 if 50<x<80 else 4)}" r="2.6" fill="#c83a2a"/>')
    if gem_:
        I.body.append(gem(I, 64, 46 if kind == "helm" else 34, 6.5, gem_))
    if plume:
        I.body.append(f'<path d="M64 22 C70 8 88 4 96 10 C86 12 76 18 70 26Z" fill="{plume}" stroke="{OUT}" stroke-width="2.4"/>')
    if horns:
        for k in (-1, 1):
            I.body.append(f'<path d="M{64+k*30} 46 C{64+k*46} 40 {64+k*50} 22 {64+k*44} 10 C{64+k*42} 24 {64+k*36} 32 {64+k*28} 36Z" fill="{I.metal(horns, True)}" stroke="{OUT}" stroke-width="2.8"/>')


def boots(I, mat="leather", trim="iron", kind="boot", gem_=None, frost=False, wings=None):
    if kind == "anklet":
        I.body.append(f'<ellipse cx="64" cy="70" rx="36" ry="16" fill="none" stroke="{OUT}" stroke-width="8"/>')
        I.body.append('<ellipse cx="64" cy="70" rx="36" ry="16" fill="none" stroke="#8a5a2c" stroke-width="4"/>')
        for k in range(9):
            ang = math.radians(10 + k * 20)
            x, y = 64 + math.cos(ang) * 36, 70 + math.sin(ang) * 16
            I.body.append(f'<ellipse cx="{x:.1f}" cy="{y+6:.1f}" rx="4" ry="6" fill="{["#d8b070", "#7a3a1a", "#c83a2a"][k%3]}" stroke="{OUT}" stroke-width="1.6"/>')
        return
    for k, off in ((0, -10), (1, 10)):
        x = 64 + off - 6
        a = .75 if k == 0 else 1
        d = f"M{x-10} 20 L{x+14} 20 L{x+14} 76 L{x+34} 84 Q{x+40} 98 {x+30} 104 L{x-14} 104 L{x-14} 90 Z"
        I.body.append(f'<g opacity="{a}"><path d="{d}" fill="{I.lin(list(MAT[mat]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.2" stroke-linejoin="round"/>'
                      f'<path d="M{x-12} 28 L{x+16} 28" stroke="{MAT[trim][1]}" stroke-width="7"/><path d="M{x-12} 28 L{x+16} 28" stroke="{OUT}" stroke-width="1.2"/>'
                      f'<path d="M{x-14} 98 L{x+38} 98" stroke="{OUT}" stroke-width="5"/></g>')
        if frost and k:
            I.body.append(star(x + 4, 56, 4.5, "#e8fbff") + star(x + 20, 88, 3.6, "#e8fbff"))
        if wings and k:
            I.body.append(f'<path d="M{x-12} 40 C{x-34} 32 {x-38} 48 {x-30} 56 C{x-24} 50 {x-18} 52 {x-12} 56Z" fill="{I.metal(wings, True)}" stroke="{OUT}" stroke-width="2.4"/>')
    if gem_:
        I.body.append(gem(I, 68, 30, 5, gem_))


def ring(I, band="gold", g="ruby", big=False, eye=False, coin=False, orb=False):
    I.body.append(f'<ellipse cx="64" cy="76" rx="32" ry="28" fill="none" stroke="{OUT}" stroke-width="15"/>')
    I.body.append(f'<ellipse cx="64" cy="76" rx="32" ry="28" fill="none" stroke="{I.lin(list(MAT[band]), 0, 0, 1, 1)}" stroke-width="10"/>')
    I.body.append('<path d="M38 66 Q44 52 60 48" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" fill="none"/>')
    I.body.append(f'<path d="M48 44 L80 44 L86 54 L42 54Z" fill="{I.metal(band, True)}" stroke="{OUT}" stroke-width="2.8" stroke-linejoin="round"/>')
    r = 20 if big else 15
    if eye:
        I.body.append(f'<ellipse cx="64" cy="36" rx="{r+2}" ry="{r*.8}" fill="#fff8e6" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<circle cx="64" cy="36" r="{r*.55}" fill="{I.rad(list(GEM[g]), .4, .35, .7)}" stroke="{OUT}" stroke-width="2"/>')
        I.body.append(f'<ellipse cx="64" cy="36" rx="2.6" ry="{r*.45}" fill="#05050a"/><circle cx="60" cy="32" r="2.4" fill="#fff"/>')
    elif coin:
        I.body.append(f'<circle cx="64" cy="34" r="{r}" fill="{I.rad(list(MAT["gold"]), .4, .35, .7)}" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<circle cx="64" cy="34" r="{r-5}" fill="none" stroke="{MAT["gold"][2]}" stroke-width="2"/>')
        I.body.append(f'<text x="64" y="40" font-family="Georgia" font-size="16" font-weight="bold" text-anchor="middle" fill="{MAT["gold"][2]}">$</text>')
    elif orb:
        a, b, c = GEM[g]
        I.body.append(f'<circle cx="64" cy="32" r="{r+1}" fill="{I.rad(["#ffffff", b, c], .45, .4, .7)}" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<path d="M50 32 Q64 22 78 32 Q64 42 50 32Z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>')
    else:
        a, b, c = GEM[g]
        pts = [(64, 36 - r), (64 + r, 36 - r * .2), (64 + r * .6, 36 + r * .8), (64 - r * .6, 36 + r * .8), (64 - r, 36 - r * .2)]
        I.body.append(f'<path d="{P(pts)}" fill="{I.lin([a, b, c], 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M64 {36-r} L64 {36+r*.8} M{64-r} {36-r*.2} L{64+r} {36-r*.2}" stroke="#fff" stroke-opacity=".35" stroke-width="1.4"/>')
        I.body.append(f'<circle cx="{64-r*.35}" cy="{36-r*.45}" r="{r*.18}" fill="#fff" opacity=".9"/>')


def amulet(I, chain="gold", g="sapphire", kind="gem", frame="gold", teeth=False):
    I.body.append(f'<path d="M30 14 Q34 60 64 72 Q94 60 98 14" fill="none" stroke="{OUT}" stroke-width="6"/>')
    I.body.append(f'<path d="M30 14 Q34 60 64 72 Q94 60 98 14" fill="none" stroke="{MAT[chain][1]}" stroke-width="3" stroke-dasharray="4 2"/>')
    if teeth:
        for k in range(-3, 4):
            x = 64 + k * 9
            y = 70 - abs(k) * 6
            I.body.append(f'<path d="M{x-4} {y} L{x} {y+16} L{x+4} {y}Z" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="2" stroke-linejoin="round"/>')
        I.body.append(gem(I, 64, 70, 7, g))
        return
    if kind == "gem":
        I.body.append(f'<path d="M64 66 L86 86 L64 116 L42 86Z" fill="{I.metal(frame, True)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        a, b, c = GEM[g]
        I.body.append(f'<path d="M64 74 L78 87 L64 106 L50 87Z" fill="{I.lin([a, b, c], 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="2.4" stroke-linejoin="round"/>')
        I.body.append('<path d="M64 74 L64 106 M50 87 L78 87" stroke="#fff" stroke-opacity=".4" stroke-width="1.4"/><circle cx="59" cy="82" r="2.4" fill="#fff"/>')
    elif kind == "eye":
        I.body.append(f'<circle cx="64" cy="90" r="22" fill="{I.metal(frame, True)}" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<ellipse cx="64" cy="90" rx="16" ry="11" fill="#140a22" stroke="{OUT}" stroke-width="2"/>')
        I.body.append(f'<circle cx="64" cy="90" r="8" fill="{I.rad(list(GEM[g]), .4, .35, .7)}"/><ellipse cx="64" cy="90" rx="2.4" ry="7" fill="#05050a"/>')
    elif kind == "ember":
        I.body.append(f'<circle cx="64" cy="90" r="20" fill="{I.metal(frame, True)}" stroke="{OUT}" stroke-width="3"/>')
        I.body.append(f'<circle cx="64" cy="90" r="14" fill="{I.rad(["#fff0b0", "#ff9f1a", "#7a3a00"], .4, .35, .7)}" stroke="{OUT}" stroke-width="2"/>')
        I.body.append(flame(I, 64, 98, .42))
    elif kind == "core":
        I.body.append(f'<circle cx="64" cy="90" r="22" fill="none" stroke="{OUT}" stroke-width="7"/><circle cx="64" cy="90" r="22" fill="none" stroke="{MAT[frame][1]}" stroke-width="3.5"/>')
        I.body.append(f'<path d="M42 90 H86 M64 68 V112" stroke="{MAT[frame][1]}" stroke-width="3"/>')
        I.body.append(f'<circle cx="64" cy="90" r="13" fill="{I.rad(["#ffffff", GEM[g][1], GEM[g][2]], .45, .4, .7)}" stroke="{OUT}" stroke-width="2.4"/>')
        I.body.append(f'<path d="M57 86 Q64 80 71 88 Q64 98 57 92" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>')


def heart_item(I, g="ruby", frame=None, scales=False, wings=None, snow=False, cage=None):
    if wings:
        for k in (-1, 1):
            I.body.append(f'<path d="M{64+k*20} 60 C{64+k*44} 40 {64+k*58} 52 {64+k*56} 72 C{64+k*46} 66 {64+k*40} 74 {64+k*24} 76Z" fill="{I.metal(wings, True)}" stroke="{OUT}" stroke-width="2.6"/>')
    I.body.append(heart_path(I, 64, 64, 1.55, g))
    if scales:
        for (x, y) in ((54, 64), (64, 74), (74, 64), (64, 56), (58, 82), (70, 82)):
            I.body.append(f'<path d="M{x-5} {y} Q{x} {y+7} {x+5} {y}" stroke="{GEM[g][2]}" stroke-width="2" fill="none" opacity=".8"/>')
    if snow:
        for k in range(3):
            ang = math.radians(k * 60)
            I.body.append(f'<path d="M{64+math.sin(ang)*12:.1f} {70-math.cos(ang)*12:.1f} L{64-math.sin(ang)*12:.1f} {70+math.cos(ang)*12:.1f}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>')
    if frame:
        I.body.append(f'<path d="M30 46 Q64 30 98 46" stroke="{OUT}" stroke-width="7" fill="none"/><path d="M30 46 Q64 30 98 46" stroke="{MAT[frame][1]}" stroke-width="3.5" fill="none"/>')
    if cage:
        for k in (-1, 0, 1):
            I.body.append(f'<path d="M{64+k*16} 30 Q{64+k*30} 70 {64+k*10} 100" stroke="{MAT[cage][1]}" stroke-width="2.6" fill="none"/>')


def shard(I, kind="flame"):
    cols = ("#fff1b8", "#ff9a2e", "#9a2a08") if kind == "flame" else ("#ffffff", "#9fe2ff", "#2f7ad0")
    for (x, h, w, a) in ((64, 88, 20, 0), (42, 58, 14, -24), (86, 62, 14, 22)):
        d = f"M{x} {108-h} L{x+w/2} {100-h*.35} L{x+w*.35} 106 L{x-w*.35} 106 L{x-w/2} {100-h*.35}Z"
        I.body.append(f'<path d="{d}" transform="rotate({a} {x} 106)" fill="{I.lin(list(cols), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M{x} {110-h} L{x} 104" transform="rotate({a} {x} 106)" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>')
    if kind == "flame":
        I.body.append(flame(I, 64, 64, .55))
    I.body.append(f'<ellipse cx="64" cy="108" rx="36" ry="5" fill="{OUT}" opacity=".5"/>')


def crystal(I, g="emerald"):
    a, b, c = GEM[g]
    d = "M64 10 L92 40 L84 104 L64 118 L44 104 L36 40Z"
    I.body.append(f'<path d="{d}" fill="{I.lin([a, b, c], 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
    I.body.append('<path d="M64 10 L64 118 M36 40 L64 52 L92 40 M44 104 L64 52 L84 104" stroke="#fff" stroke-opacity=".38" stroke-width="1.6" fill="none"/>')
    I.body.append('<path d="M46 40 L60 20" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>')


def potion(I, liquid=("#ffb0b0", "#ff3045", "#7a0716")):
    I.body.append(f'<path d="M54 20 L74 20 L74 40 C96 48 104 70 98 90 C92 112 36 112 30 90 C24 70 32 48 54 40Z" fill="#cfe8ff" fill-opacity=".25" stroke="{OUT}" stroke-width="3.5"/>')
    I.body.append(f'<path d="M32 76 C36 70 92 70 96 76 C100 100 86 108 64 108 C42 108 28 100 32 76Z" fill="{I.lin(list(liquid), 0, 0, 0, 1)}"/>')
    I.body.append(f'<rect x="51" y="12" width="26" height="12" rx="3" fill="{I.metal("wood", True)}" stroke="{OUT}" stroke-width="3"/>')
    I.body.append('<path d="M42 54 Q38 70 42 84" stroke="#fff" stroke-opacity=".75" stroke-width="4" stroke-linecap="round" fill="none"/>')


def razor(I):
    def f(I):
        I.body.append(f'<rect x="-6" y="-6" width="12" height="70" rx="5" fill="{I.metal("gold")}" stroke="{OUT}" stroke-width="3"/>')
        for y in (6, 22, 38):
            I.body.append(f'<circle cx="0" cy="{y}" r="2.4" fill="{GEM["ruby"][1]}" stroke="{OUT}" stroke-width="1.2"/>')
        I.body.append(f'<path d="M-6 -6 L-6 -62 Q8 -70 18 -60 L10 -6Z" fill="{I.metal("silver")}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append('<path d="M12 -58 L6 -10" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>')
    weapon_group(I, f, 1.0)


def scythe(I, shaft="darkwood", blade_mat="darksteel", glow="#5affb0", angle=15, scale=.72, dy=12):
    def f(I):
        I.body.append(f'<rect x="-4" y="-66" width="8" height="140" rx="4" fill="{I.metal(shaft)}" stroke="{OUT}" stroke-width="3"/>')
        d = "M2 -64 C-26 -80 -64 -70 -78 -44 C-58 -60 -30 -62 -6 -48Z"
        I.body.append(f'<path d="{d}" fill="{I.metal(blade_mat)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M-76 -46 C-60 -66 -30 -72 -2 -62" stroke="{glow}" stroke-width="2.4" fill="none"/>')
        I.body.append(f'<circle cx="0" cy="-58" r="6" fill="{I.rad(list(GEM["soul"]), .4, .35, .7)}" stroke="{OUT}" stroke-width="2"/>')
    weapon_group(I, f, scale, angle=angle, dx=6, dy=dy)


def totem(I):
    I.body.append(f'<path d="M44 20 L84 20 L88 112 L40 112Z" fill="{I.lin(list(MAT["wood"]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
    for y in (46, 80):
        I.body.append(f'<path d="M42 {y} L86 {y}" stroke="{OUT}" stroke-width="2.4"/>')
    I.body.append('<path d="M52 30 L60 36 L52 38Z M76 30 L68 36 L76 38Z" fill="#ff3b2b" stroke="#0b0d13" stroke-width="1.6"/>')
    I.body.append('<path d="M54 54 Q64 64 74 54 L74 70 L54 70Z" fill="#0b0d13"/><path d="M56 58 v6 M64 60 v6 M72 58 v6" stroke="#fff" stroke-width="2"/>')
    I.body.append('<path d="M52 88 L76 88 L70 104 L58 104Z" fill="#c83a2a" stroke="#0b0d13" stroke-width="2"/>')
    for k in (-1, 1):
        I.body.append(f'<path d="M{64+k*24} 24 L{64+k*40} 10 L{64+k*30} 34Z" fill="#c83a2a" stroke="#0b0d13" stroke-width="2"/>')


# ───────────── itens das Árvores do Modo Infinito ─────────────
def whistle(I):
    """Apito do Lobo: apito de osso num cordão de couro, com duas presas penduradas"""
    for d in ("M26 12 Q30 50 50 66", "M102 12 Q98 48 82 62"):
        I.body.append(f'<path d="{d}" fill="none" stroke="{OUT}" stroke-width="6"/><path d="{d}" fill="none" stroke="{MAT["leather"][1]}" stroke-width="3"/>')
    I.body.append(f'<g transform="rotate(-16 66 80)"><rect x="28" y="68" width="78" height="24" rx="11" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="3.2"/>'
                  f'<rect x="28" y="68" width="16" height="24" rx="8" fill="{MAT["bone"][2]}" stroke="{OUT}" stroke-width="2.6"/>'
                  f'<path d="M98 72 L112 76 L112 84 L98 88Z" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="2.6" stroke-linejoin="round"/>'
                  + "".join(f'<circle cx="{x}" cy="80" r="3.6" fill="{OUT}"/>' for x in (58, 72, 86)) +
                  f'<path d="M48 72 Q70 69 94 72" stroke="#fff" stroke-opacity=".65" stroke-width="2.2" fill="none"/>'
                  f'<rect x="62" y="66" width="7" height="28" fill="{MAT["leather"][1]}" stroke="{OUT}" stroke-width="2"/></g>')
    for (x, y, a) in ((54, 100, -12), (72, 104, 10)):
        I.body.append(f'<path d="M{x-5} {y} Q{x} {y+22} {x+6} {y}Z" transform="rotate({a} {x} {y})" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="2.4" stroke-linejoin="round"/>')


def maraca(I):
    """Maracá Sagrado: cabaça pintada com urucum e jenipapo, cabo de madeira e penas no topo"""
    before = len(I.body)
    _maraca(I)
    parts = I.body[before:]
    del I.body[before:]
    I.body.append('<g transform="translate(6 14) scale(.9)">' + "".join(parts) + "</g>")


def _maraca(I):
    I.body.append(f'<rect x="58" y="72" width="12" height="46" rx="5" fill="{I.metal("darkwood")}" stroke="{OUT}" stroke-width="3"/>')
    for y in (80, 100):
        I.body.append(f'<rect x="56" y="{y}" width="16" height="5" rx="2" fill="{MAT["cloth_red"][1]}" stroke="{OUT}" stroke-width="1.8"/>')
    I.body.append(f'<ellipse cx="64" cy="50" rx="30" ry="32" fill="{I.rad(["#f3d28a", "#c08a3a", "#5e3a12"], .38, .32, .78)}" stroke="{OUT}" stroke-width="3.4"/>')
    I.body.append(f'<path d="M38 50 Q64 62 90 50" stroke="{MAT["cloth_red"][1]}" stroke-width="4" fill="none"/>')
    I.body.append(f'<path d="M40 40 Q64 50 88 40" stroke="#1a1410" stroke-width="2.4" fill="none" stroke-dasharray="5 3"/>')
    for x in (50, 64, 78):
        I.body.append(f'<path d="M{x-5} 62 L{x} 70 L{x+5} 62" stroke="#1a1410" stroke-width="2.2" fill="none"/>')
    I.body.append('<ellipse cx="54" cy="36" rx="7" ry="10" fill="#fff" opacity=".35"/>')
    for (dx, col) in ((-10, "#e8382a"), (0, "#ffd23a"), (10, "#3a9aff")):
        I.body.append(f'<path d="M64 20 Q{64+dx*1.6} 0 {64+dx*2.4} -2 Q{64+dx*1.2} 10 64 20Z" fill="{col}" stroke="{OUT}" stroke-width="2"/>')


def blowgun(I):
    """Zarabatana: tubo comprido de taboca com amarrações e um dardo de curare"""
    def f(I):
        I.body.append(f'<rect x="-5" y="-74" width="10" height="150" rx="5" fill="{I.metal("wood")}" stroke="{OUT}" stroke-width="3"/>')
        for y in (-58, -20, 22, 58):
            I.body.append(f'<rect x="-7" y="{y}" width="14" height="6" rx="2" fill="{MAT["greenleather"][1]}" stroke="{OUT}" stroke-width="2"/>')
        I.body.append(f'<rect x="-7" y="-78" width="14" height="8" rx="3" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="2.4"/>')
        I.body.append('<path d="M-2 -70 L-2 70" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>')
        I.body.append(f'<path d="M18 -40 L18 10" stroke="{OUT}" stroke-width="5"/><path d="M18 -40 L18 10" stroke="#e8e0c8" stroke-width="2.4"/>'
                      f'<path d="M18 -48 L22 -38 L14 -38Z" fill="{GEM["emerald"][1]}" stroke="{OUT}" stroke-width="1.8"/><path d="M12 6 L18 16 L24 6Z" fill="#e8382a" stroke="{OUT}" stroke-width="1.6"/>')
    weapon_group(I, f, .95, angle=40)


def sickle(I):
    """Foice de Ouro: a lâmina curva dos druidas, que corta o visco"""
    def f(I):
        I.body.append(f'<rect x="-5" y="-4" width="10" height="70" rx="5" fill="{I.metal("darkwood")}" stroke="{OUT}" stroke-width="3"/>')
        for y in (10, 30, 50):
            I.body.append(f'<rect x="-6" y="{y}" width="12" height="4" rx="2" fill="{MAT["leather"][1]}" stroke="{OUT}" stroke-width="1.6"/>')
        d = "M2 -2 C40 -12 52 -56 22 -80 C34 -54 24 -26 -4 -14Z"
        I.body.append(f'<path d="{d}" fill="{I.metal("gold")}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append('<path d="M24 -76 C44 -52 34 -20 6 -8" stroke="#fff" stroke-opacity=".75" stroke-width="2.2" fill="none"/>')
        I.body.append(f'<circle cx="0" cy="-6" r="5" fill="{I.rad(list(GEM["emerald"]), .4, .35, .7)}" stroke="{OUT}" stroke-width="2"/>')
        for (x, y) in ((-16, -40), (-24, -30), (-12, -28)):
            I.body.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#f4f8ea" stroke="{OUT}" stroke-width="1.6"/>')
        I.body.append(f'<path d="M-16 -40 L-4 -14 M-24 -30 L-4 -14 M-12 -28 L-4 -14" stroke="{MAT["jade"][1]}" stroke-width="2"/>')
    weapon_group(I, f, 1.0, angle=20)
