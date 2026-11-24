"""
Ícones do Arsenal do Ferreiro (armas exclusivas de cada herói), no mesmo padrão vetorial de icon_svg.py:
contorno escuro, materiais com gradiente, gemas facetadas, brilho/aura. Todas as armas apontam para cima-direita
(o grupo gira 45°), como as outras — o jogo usa isso para animar a arma na direção do golpe.
Usado por scripts/build_item_icons.py (UNIQ).
"""
import math
from icon_svg import (OUT, MAT, GEM, gem, star, blade, guard, grip, pommel, weapon_group, sword, greatsword, dagger,
                      staff, bow, scythe, flame, runes, P)

MAT.setdefault("lacquer", ("#ff8a7a", "#a3191f", "#3a0508"))
MAT.setdefault("bamboo", ("#e8e49a", "#a8a84a", "#4a4a16"))
MAT.setdefault("ebony", ("#6a5a5a", "#2a2020", "#0a0606"))
MAT.setdefault("yew", ("#e0a868", "#9a5a2a", "#4a2410"))
MAT.setdefault("pale", ("#ffffff", "#d8e4e0", "#7a8c88"))
MAT.setdefault("ashwood", ("#e8d2a8", "#b0905a", "#5a4420"))


def _wrap_diamonds(I, y0, y1, w, col):
    s = ""
    y = y0 + 2
    while y < y1 - 4:
        s += f'<path d="M0 {y} L{w/2-1} {y+3.5} L0 {y+7} L{-w/2+1} {y+3.5}Z" fill="{col}" opacity=".9"/>'
        y += 7
    I.body.append(s)


def katana(I, blade_mat="steel", tsuba="gold", ito="#1a1a2a", same="#f4ecd8", w=9, heavy=False, glow=None, hamon="#ffffff", gem_=None):
    def f(I):
        L = -78 if heavy else -74
        ww = w + (4 if heavy else 0)
        hw = ww / 2
        d = (f"M{-hw} 16 C{-hw-1} -20 {-hw+3} {L+30} {hw*1.2} {L} C{hw*.6} {L+18} {hw+1} -20 {hw} 16Z")
        I.body.append(f'<path d="{d}" fill="{I.metal(blade_mat)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append(f'<path d="M{-hw+2.4} 12 C{-hw+2} -20 {-hw+4} {L+28} {hw*.6} {L+8}" stroke="{hamon}" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-dasharray="5 3"/>')
        if glow:
            I.body.append(f'<path d="{d}" fill="none" stroke="{glow}" stroke-width="1.5" stroke-opacity=".95"/>')
        I.body.append(f'<rect x="{-hw-1}" y="12" width="{ww+2}" height="6" rx="1.5" fill="{I.metal("gold" if tsuba == "gold" else tsuba, True)}" stroke="{OUT}" stroke-width="2"/>')
        I.body.append(f'<ellipse cx="0" cy="21" rx="{13 if not heavy else 15}" ry="4.6" fill="{I.metal(tsuba, True)}" stroke="{OUT}" stroke-width="2.8"/>')
        gl = 64 if heavy else 58
        I.body.append(f'<rect x="-4.5" y="25" width="9" height="{gl-25}" rx="3" fill="{same}" stroke="{OUT}" stroke-width="3"/>')
        _wrap_diamonds(I, 25, gl, 9, ito)
        I.body.append(f'<rect x="-5.5" y="{gl-2}" width="11" height="6" rx="2" fill="{I.metal(tsuba, True)}" stroke="{OUT}" stroke-width="2.4"/>')
        if gem_:
            I.body.append(gem(I, 0, 21, 3.6, gem_))
    weapon_group(I, f, .9 if not heavy else .88)


def sai(I, mat="steel", grip_mat="leather", wrap="#2a160a", gem_=None, glow=None, dx=0, dy=0, angle=45, scale=1.15):
    def f(I):
        I.body.append(f'<path d="M-3.5 4 L-3.5 -56 L0 -66 L3.5 -56 L3.5 4Z" fill="{I.metal(mat)}" stroke="{OUT}" stroke-width="2.8" stroke-linejoin="round"/>')
        I.body.append('<path d="M-1.2 0 L-1.2 -56" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>')
        for k in (-1, 1):
            d = f"M{k*3} 4 C{k*14} 4 {k*20} -2 {k*18} -24 L{k*14} -24 C{k*16} -6 {k*10} -2 {k*3} -4Z"
            I.body.append(f'<path d="{d}" fill="{I.metal(mat, True)}" stroke="{OUT}" stroke-width="2.6" stroke-linejoin="round"/>')
        I.body.append(f'<rect x="-4.5" y="4" width="9" height="28" rx="3" fill="{I.metal(grip_mat)}" stroke="{OUT}" stroke-width="2.8"/>')
        k = 7
        while k < 30:
            I.body.append(f'<path d="M-3.5 {k+3} L3.5 {k}" stroke="{wrap}" stroke-width="2"/>')
            k += 5
        I.body.append(f'<circle cx="0" cy="36" r="5" fill="{I.rad(list(MAT[mat]), .38, .32, .8)}" stroke="{OUT}" stroke-width="2.6"/>')
        if gem_:
            I.body.append(gem(I, 0, 4, 3.4, gem_, facet=False))
        if glow:
            I.body.append(f'<path d="M-3.5 4 L-3.5 -56 L0 -66 L3.5 -56 L3.5 4Z" fill="none" stroke="{glow}" stroke-width="1.3"/>')
    weapon_group(I, f, scale, angle, dx, dy)


def twin_sai(I, **kw):
    sai(I, angle=28, dx=-14, dy=4, scale=1.05, **kw)
    sai(I, angle=-28 + 360, dx=14, dy=4, scale=1.05, **kw)


def kusarigama(I):
    B = I.body.append
    # corrente em arco do cabo até o peso
    pts = []
    for k in range(13):
        t = k / 12
        x = 52 + (104 - 52) * t + math.sin(t * math.pi) * -6
        y = 70 + (104 - 70) * t + math.sin(t * math.pi) * 22
        pts.append((x, y))
    for k, (x, y) in enumerate(pts):
        rot = 30 if k % 2 else -40
        B(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="4.2" ry="2.6" transform="rotate({rot} {x:.1f} {y:.1f})" fill="none" stroke="{OUT}" stroke-width="3.6"/>')
        B(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="4.2" ry="2.6" transform="rotate({rot} {x:.1f} {y:.1f})" fill="none" stroke="{MAT["iron"][1]}" stroke-width="1.8"/>')
    B(f'<circle cx="108" cy="108" r="9" fill="{I.rad(list(MAT["darksteel"]), .38, .32, .8)}" stroke="{OUT}" stroke-width="3"/>')
    B('<circle cx="105" cy="105" r="2.4" fill="#fff" opacity=".7"/>')

    def f(I):
        I.body.append(f'<rect x="-4.5" y="-30" width="9" height="66" rx="4" fill="{I.metal("darkwood")}" stroke="{OUT}" stroke-width="3"/>')
        for y in (-6, 10, 26):
            I.body.append(f'<rect x="-5.5" y="{y}" width="11" height="4" rx="2" fill="{MAT["cloth_red"][1]}" stroke="{OUT}" stroke-width="1.6"/>')
        d = "M3 -28 C30 -32 46 -52 40 -74 C34 -56 22 -46 -3 -40Z"
        I.body.append(f'<path d="{d}" fill="{I.metal("steel")}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append('<path d="M38 -70 C40 -52 28 -40 6 -34" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/>')
        I.body.append(f'<rect x="-6" y="-34" width="12" height="7" rx="2" fill="{I.metal("darksteel", True)}" stroke="{OUT}" stroke-width="2.4"/>')
    weapon_group(I, f, .92, angle=30, dx=-14, dy=-8)


def crossbow(I, wood="wood", metal="iron", string="#e8e2d0", bolt_head="iron", repeat=False, thorns=False, gem_=None, glow=None):
    def f(I):
        # coronha (vertical, a seta aponta para cima)
        I.body.append(f'<path d="M-6 -50 L6 -50 L7 40 L10 66 L-10 66 L-7 40Z" fill="{I.metal(wood)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append(f'<rect x="-8" y="6" width="16" height="10" rx="2" fill="{I.metal(metal, True)}" stroke="{OUT}" stroke-width="2.4"/>')
        I.body.append(f'<path d="M-2 16 Q-10 26 -2 34" stroke="{OUT}" stroke-width="3" fill="none"/>')
        # arco (prod) na frente
        I.body.append(f'<path d="M-46 -26 Q0 -54 46 -26" stroke="{OUT}" stroke-width="9" fill="none" stroke-linecap="round"/>')
        I.body.append(f'<path d="M-46 -26 Q0 -54 46 -26" stroke="{MAT[metal][1] if not thorns else MAT["darkwood"][1]}" stroke-width="5" fill="none" stroke-linecap="round"/>')
        I.body.append(f'<path d="M-44 -28 Q0 -52 44 -28" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" fill="none"/>')
        I.body.append(f'<path d="M-46 -26 L0 -4 L46 -26" stroke="{string}" stroke-width="1.6" fill="none"/>')
        if thorns:
            for x in (-34, -18, 18, 34):
                y = -26 - (14 - abs(x) * .3)
                I.body.append(f'<path d="M{x} {y} l-3 -8 l6 2Z" fill="{MAT["greenleather"][1]}" stroke="{OUT}" stroke-width="1.4"/>')
        # virote
        bolts = (-5, 5) if repeat else (0,)
        for bx in bolts:
            I.body.append(f'<path d="M{bx} -4 L{bx} -66" stroke="{OUT}" stroke-width="4"/><path d="M{bx} -4 L{bx} -66" stroke="#c8a070" stroke-width="2"/>')
            I.body.append(f'<path d="M{bx-4} -64 L{bx} -76 L{bx+4} -64Z" fill="{I.metal(bolt_head, True)}" stroke="{OUT}" stroke-width="2"/>')
        if repeat:
            I.body.append(f'<rect x="-9" y="-48" width="18" height="22" rx="3" fill="{I.metal(metal, True)}" stroke="{OUT}" stroke-width="2.6"/>')
            I.body.append(f'<path d="M-5 -42 h10 M-5 -36 h10" stroke="{OUT}" stroke-width="1.4"/>')
        if gem_:
            I.body.append(gem(I, 0, 28, 4.4, gem_))
        if glow:
            I.body.append(f'<path d="M-46 -26 Q0 -54 46 -26" stroke="{glow}" stroke-width="1.4" fill="none"/>')
    weapon_group(I, f, .9)


def pole(I, wood="wood", band="iron", cap="iron", kind="plain", accent=None):
    def f(I):
        I.body.append(f'<rect x="-4.5" y="-78" width="9" height="156" rx="4.5" fill="{I.metal(wood)}" stroke="{OUT}" stroke-width="3"/>')
        if kind == "bamboo":
            for y in range(-62, 70, 22):
                I.body.append(f'<path d="M-5 {y} h10" stroke="{OUT}" stroke-width="2.6"/><path d="M-3 {y-2} h6" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>')
                I.body.append(f'<path d="M5 {y+2} q6 -3 10 -10 q-7 2 -10 6Z" fill="{MAT["cloth_green"][1]}" stroke="{OUT}" stroke-width="1.2"/>' if y in (-40, 26) else "")
        else:
            I.body.append('<path d="M-1.6 -72 L-1.6 72" stroke="#fff" stroke-opacity=".35" stroke-width="1.6"/>')
            for y in (-80, 72):
                I.body.append(f'<rect x="-6.5" y="{y}" width="13" height="9" rx="2.5" fill="{I.metal(cap, True)}" stroke="{OUT}" stroke-width="2.4"/>')
            for y in (-14, 6):
                I.body.append(f'<rect x="-6" y="{y}" width="12" height="7" rx="2" fill="{I.metal(band, True)}" stroke="{OUT}" stroke-width="2"/>')
        if kind == "oak":
            for (x, y, a) in ((8, -66, -30), (-9, -52, 200), (9, -38, -20)):
                I.body.append(f'<path d="M0 0 C6 -6 14 -6 18 0 C14 6 6 6 0 0Z" transform="translate({x} {y}) rotate({a})" fill="{I.lin(["#9de08a", "#3f9a4a"], 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="1.6"/>')
            I.body.append(f'<circle cx="0" cy="-30" r="4" fill="{I.rad(list(GEM["emerald"]), .4, .35, .7)}" stroke="{OUT}" stroke-width="1.6"/>')
        if kind == "feathers":
            for (dx, col) in ((-10, "#e8382a"), (0, "#ffd23a"), (10, "#3a9aff")):
                I.body.append(f'<path d="M0 -6 Q{dx*1.6} 6 {dx*1.4+2} 24 Q{dx*.6} 8 0 -6Z" fill="{col}" stroke="{OUT}" stroke-width="1.6"/>')
            I.body.append(f'<path d="M-5 -70 h10 M-5 -60 h10" stroke="{MAT["cloth_red"][1]}" stroke-width="3"/>')
        if kind == "hunter":
            I.body.append(f'<path d="M-6 30 C-16 36 -18 50 -10 58" stroke="{MAT["leather"][1]}" stroke-width="3" fill="none"/>')
            for y in (-50, 46):
                I.body.append(f'<rect x="-6" y="{y}" width="12" height="6" rx="2" fill="{MAT["leather"][1]}" stroke="{OUT}" stroke-width="1.8"/>')
        if accent:
            I.body.append(f'<rect x="-4.5" y="-78" width="9" height="156" rx="4.5" fill="none" stroke="{accent}" stroke-width="1.2" stroke-opacity=".8"/>')
    weapon_group(I, f, .8)


def spear(I, shaft="wood", head="steel", kind="leaf", cloth=None, feathers=False, glow=None, gem_=None):
    def f(I):
        I.body.append(f'<rect x="-3.8" y="-46" width="7.6" height="124" rx="3.8" fill="{I.metal(shaft)}" stroke="{OUT}" stroke-width="3"/>')
        if kind == "leaf":
            d = "M0 -86 C9 -72 10 -58 5 -46 L-5 -46 C-10 -58 -9 -72 0 -86Z"
        elif kind == "thorn":
            d = "M0 -88 L6 -70 L12 -66 L6 -60 L6 -46 L-6 -46 L-6 -60 L-12 -66 L-6 -70Z"
        else:  # raio (lança de Tupã)
            d = "M0 -90 L8 -72 L2 -70 L9 -54 L-1 -60 L4 -46 L-6 -46 L-4 -60 L-10 -58 L-4 -74 L-9 -72Z"
        I.body.append(f'<path d="{d}" fill="{I.metal(head)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
        I.body.append('<path d="M-1.5 -80 L-1.5 -50" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>')
        if glow:
            I.body.append(f'<path d="{d}" fill="none" stroke="{glow}" stroke-width="1.4"/>')
        I.body.append(f'<rect x="-6" y="-48" width="12" height="7" rx="2" fill="{I.metal("bronze" if not gem_ else "gold", True)}" stroke="{OUT}" stroke-width="2.2"/>')
        if gem_:
            I.body.append(gem(I, 0, -44, 3.2, gem_, facet=False))
        if cloth:
            I.body.append(f'<path d="M4 -40 C16 -36 20 -24 14 -14 C12 -24 8 -30 3 -32Z" fill="{I.metal(cloth, True)}" stroke="{OUT}" stroke-width="2"/>')
        if feathers:
            for (dx, col) in ((-9, "#e8382a"), (0, "#ffd23a"), (9, "#3a9aff")):
                I.body.append(f'<path d="M0 -38 Q{dx*1.5} -26 {dx*1.3} -10 Q{dx*.5} -24 0 -38Z" fill="{col}" stroke="{OUT}" stroke-width="1.4"/>')
        I.body.append(f'<rect x="-5" y="70" width="10" height="9" rx="2" fill="{I.metal("iron", True)}" stroke="{OUT}" stroke-width="2.2"/>')
    weapon_group(I, f, .8)


def book(I, cover="cloth_blue", trim="gold", emblem="star", gem_="sapphire", thick=False, chains=False, glow=None, pages_out=False):
    B = I.body.append
    x0, y0, w, h = 30, 22, 66, 84
    if thick:
        x0, y0, w, h = 26, 20, 74, 88
    th = 14 if thick else 9
    # páginas (lado) e capa
    B(f'<path d="M{x0+8} {y0+h} L{x0+w+th} {y0+h-6} L{x0+w+th} {y0+6} L{x0+w} {y0}" fill="#f4ecd4" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>')
    for k in range(1, 4):
        B(f'<path d="M{x0+w+k*th/4} {y0+3+k} L{x0+w+k*th/4} {y0+h-4-k}" stroke="#c8b890" stroke-width="1"/>')
    B(f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="5" fill="{I.lin(list(MAT[cover]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3.4"/>')
    B(f'<rect x="{x0}" y="{y0}" width="12" height="{h}" rx="4" fill="{I.metal(cover)}" stroke="{OUT}" stroke-width="2.6"/>')
    for yy in (y0 + 12, y0 + h - 16):
        B(f'<rect x="{x0-1}" y="{yy}" width="14" height="5" rx="1.5" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="1.6"/>')
    # cantoneiras
    for (cx, cy, sx, sy) in ((x0 + w, y0, -1, 1), (x0 + w, y0 + h, -1, -1)):
        B(f'<path d="M{cx} {cy} l{sx*14} 0 l{-sx*14} {sy*14}Z" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="2"/>')
    ex, ey = x0 + 12 + (w - 12) / 2, y0 + h / 2
    B(f'<rect x="{x0+18}" y="{y0+8}" width="{w-24}" height="{h-16}" rx="3" fill="none" stroke="{MAT[trim][1]}" stroke-width="1.8"/>')
    if emblem == "star":
        pts = []
        for k in range(10):
            r = 15 if k % 2 == 0 else 6.5
            a = math.radians(k * 36 - 90)
            pts.append((ex + math.cos(a) * r, ey + math.sin(a) * r))
        B(f'<path d="{P(pts)}" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="2" stroke-linejoin="round"/>')
    elif emblem == "eclipse":
        B(f'<circle cx="{ex}" cy="{ey}" r="16" fill="{I.rad(["#fff4c2", "#ffae1e", "#7a3a00"], .5, .5, .6)}" stroke="{OUT}" stroke-width="2.4"/>')
        B(f'<circle cx="{ex+5}" cy="{ey-3}" r="13" fill="#120b24" stroke="{OUT}" stroke-width="2"/>')
    elif emblem == "skull":
        B(f'<path d="M{ex-12} {ey-2} C{ex-13} {ey-20} {ex+13} {ey-20} {ex+12} {ey-2} C{ex+12} {ey+5} {ex+7} {ey+7} {ex+6} {ey+12} L{ex-6} {ey+12} C{ex-7} {ey+7} {ex-12} {ey+5} {ex-12} {ey-2}Z" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="2.4"/>')
        B(f'<circle cx="{ex-5}" cy="{ey-3}" r="3.2" fill="#5affb0"/><circle cx="{ex+5}" cy="{ey-3}" r="3.2" fill="#5affb0"/>')
    elif emblem == "eye":
        B(f'<path d="M{ex-16} {ey} Q{ex} {ey-14} {ex+16} {ey} Q{ex} {ey+14} {ex-16} {ey}Z" fill="#e8fff4" stroke="{OUT}" stroke-width="2.2"/>')
        B(gem(I, ex, ey, 6, gem_ or "soul"))
        gem_ = None
    elif emblem == "wave":
        B(f'<path d="M{ex-16} {ey+4} Q{ex-8} {ey-8} {ex} {ey+4} T{ex+16} {ey+4}" stroke="{MAT[trim][0]}" stroke-width="3.4" fill="none"/>')
        B(f'<path d="M{ex-16} {ey-6} Q{ex-8} {ey-18} {ex} {ey-6} T{ex+16} {ey-6}" stroke="{MAT[trim][1]}" stroke-width="2.4" fill="none"/>')
    if gem_:
        B(gem(I, ex, y0 + h - 14 if emblem != "star" else ey, 4.6 if emblem != "star" else 4, gem_))
    # fecho
    B(f'<rect x="{x0+w-6}" y="{ey-6}" width="{th+8}" height="12" rx="2" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="2.2"/>')
    if chains:
        for k in range(7):
            x = x0 + 8 + k * 11
            y = y0 + h * .3 + k * 5
            B(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="3" transform="rotate(25 {x} {y})" fill="none" stroke="{OUT}" stroke-width="3.6"/>'
              f'<ellipse cx="{x}" cy="{y}" rx="5" ry="3" transform="rotate(25 {x} {y})" fill="none" stroke="{MAT["iron"][1]}" stroke-width="1.8"/>')
    if pages_out:
        for (x, y, a) in ((18, 30, -24), (104, 16, 18), (110, 102, 30)):
            B(f'<rect x="{x-7}" y="{y-9}" width="14" height="18" rx="1.5" transform="rotate({a} {x} {y})" fill="#fbf4dc" stroke="{OUT}" stroke-width="1.8"/>'
              f'<path d="M{x-4} {y-4} h8 M{x-4} {y} h8 M{x-4} {y+4} h6" transform="rotate({a} {x} {y})" stroke="#8a7a52" stroke-width="1"/>')
    if glow:
        B(f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="5" fill="none" stroke="{glow}" stroke-width="1.4" stroke-opacity=".9"/>')


def gloves(I, cloth="cloth_purple", trim="gold", rune="#7af6ff", gem_="sapphire"):
    B = I.body.append
    for (dx, flip) in ((-14, -1), (16, 1)):
        g = (f"M{-14} 30 L{-16} -6 C{-17} -16 {-11} -18 {-9} -10 L{-9} -26 C{-9} -34 {-2} -34 {-2} -26 L{-2} -30 C{-2} -38 {5} -38 {5} -30 "
             f"L{5} -26 C{5} -33 {12} -33 {12} -25 L{12} -4 C{16} -10 {22} -6 {19} 2 L{14} 30Z")
        B(f'<g transform="translate({64+dx} {62}) scale({flip*1.05} 1.05) rotate({-10*flip})">'
          f'<path d="{g}" fill="{I.lin(list(MAT[cloth]), 0, 0, 1, 1)}" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
          f'<rect x="-16" y="24" width="32" height="14" rx="3" fill="{I.metal(trim, True)}" stroke="{OUT}" stroke-width="2.6"/>'
          f'<path d="M-6 6 L0 -4 L6 6 L0 14Z" fill="none" stroke="{rune}" stroke-width="2.2"/>'
          + gem(I, 0, 31, 3.4, gem_, facet=False) + '</g>')
    for (x, y, s) in ((30, 22, 4), (98, 20, 3.4), (64, 14, 3)):
        B(star(x, y, s, rune))


def elem_top(kind):
    """topo dos cajados elementais"""
    def ex(I):
        B = I.body.append
        if kind == "thunder":
            B('<path d="M2 -92 L-10 -66 L-2 -66 L-8 -46 L10 -72 L2 -72 L8 -92Z" fill="#fff36a" stroke="#0b0d13" stroke-width="2.6" stroke-linejoin="round"/>')
        elif kind == "leaf":
            for (a, s) in ((-35, 1), (35, 1), (0, 1.2)):
                B(f'<path d="M0 -44 C8 -54 10 -70 0 -84 C-10 -70 -8 -54 0 -44Z" transform="rotate({a} 0 -44) scale({s})" fill="url(#leafg)" stroke="#0b0d13" stroke-width="2.2"/>')
            I.defs.append('<linearGradient id="leafg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8ff9a"/><stop offset="1" stop-color="#2f8a3a"/></linearGradient>')
            B(gem(I, 0, -52, 5, "emerald"))
        elif kind == "storm":
            B('<circle cx="0" cy="-62" r="14" fill="#5a6a8a" stroke="#0b0d13" stroke-width="2.6"/>')
            B('<circle cx="-8" cy="-66" r="9" fill="#8a9ab8" stroke="#0b0d13" stroke-width="2.2"/><circle cx="8" cy="-68" r="10" fill="#a8b8d4" stroke="#0b0d13" stroke-width="2.2"/>')
            B('<path d="M0 -58 L-5 -46 L0 -48 L-3 -36" stroke="#fff36a" stroke-width="2.6" fill="none" stroke-linejoin="round"/>')
    return ex


# ───────────────────────────── as armas (id → função que devolve o SVG) ─────────────────────────────
def build(U, shrink):
    def twin_swords(I):
        dagger(I, "steel", "silver", "cloth_red", "silver", "bar", "ruby", None, None, None, "straight", 11, angle=30, dx=-14, dy=0, scale=1.25)
        dagger(I, "steel", "silver", "cloth_red", "silver", "bar", "ruby", None, None, None, "straight", 11, angle=330, dx=14, dy=0, scale=1.25)

    def knives(I):
        for (a, dx, dy) in ((0, -16, 8), (40, 2, 4), (80, 18, 12)):
            dagger(I, "steel", "darksteel", "cloth_black", "darksteel", "bar", None, None, None, None, "straight", 9, angle=a, dx=dx, dy=dy, scale=.9)
        I.body.append(f'<circle cx="34" cy="98" r="9" fill="none" stroke="{OUT}" stroke-width="5"/><circle cx="34" cy="98" r="9" fill="none" stroke="{MAT["leather"][1]}" stroke-width="2.6"/>')

    def nunchaku(I):
        B = I.body.append
        for (x, y, a) in ((40, 70, -28), (90, 58, 30)):
            B(f'<g transform="translate({x} {y}) rotate({a})"><rect x="-6.5" y="-30" width="13" height="60" rx="6" fill="{I.metal("ebony")}" stroke="{OUT}" stroke-width="3"/>'
              f'<rect x="-7.5" y="-30" width="15" height="7" rx="3" fill="{I.metal("gold", True)}" stroke="{OUT}" stroke-width="2.2"/>'
              f'<path d="M-3 -20 L-3 24" stroke="#fff" stroke-opacity=".3" stroke-width="1.6"/>'
              + "".join(f'<path d="M-6 {y2} L6 {y2+3}" stroke="{MAT["cloth_red"][1]}" stroke-width="2"/>' for y2 in (4, 10, 16, 22)) + '</g>')
        for k in range(9):
            t = (k + .5) / 9
            x = 26 + 79 * t
            y = 44 - 12 * t - math.sin(t * math.pi) * 16
            B(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="3.6" ry="2.4" transform="rotate({35 if k % 2 else -35} {x:.1f} {y:.1f})" fill="none" stroke="{OUT}" stroke-width="3.2"/>'
              f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="3.6" ry="2.4" transform="rotate({35 if k % 2 else -35} {x:.1f} {y:.1f})" fill="none" stroke="{MAT["iron"][1]}" stroke-width="1.6"/>')

    def trident_bow(I):
        bow(I, "darkwood", "#f0ead8", "gold", "cloth_red", None, False, "ruby", "#c42b2b")
        extra = []
        for off in (-9, 9):
            extra.append(f'<g transform="translate(64 64) rotate(45) scale(1.083)"><path d="M-6 {off} L44 {off*1.6}" stroke="{OUT}" stroke-width="4"/>'
                         f'<path d="M-6 {off} L44 {off*1.6}" stroke="#c8a070" stroke-width="2"/>'
                         f'<path d="M44 {off*1.6-4} L52 {off*1.6} L44 {off*1.6+4}Z" fill="{MAT["iron"][1]}" stroke="{OUT}" stroke-width="2"/></g>')
        I.body.extend(extra)

    def twin_bow(I):
        bow(I, "cloth_blue", "#eaf2ff", "silver", "cloth_blue", "#9cc4ff", False, "sapphire", "#3d6fd0")
        I.body.append(f'<g transform="translate(64 64) rotate(45) scale(1.083)"><path d="M-12 8 L44 8" stroke="{OUT}" stroke-width="4"/>'
                      f'<path d="M-12 8 L44 8" stroke="#c8a070" stroke-width="2"/><path d="M44 4 L52 8 L44 12Z" fill="{MAT["iron"][1]}" stroke="{OUT}" stroke-width="2"/></g>')

    def curare(I):
        def f(I):
            I.body.append(f'<rect x="-5" y="-74" width="10" height="150" rx="5" fill="{I.metal("bamboo")}" stroke="{OUT}" stroke-width="3"/>')
            for y in (-50, -10, 30):
                I.body.append(f'<path d="M-5 {y} h10" stroke="{OUT}" stroke-width="2.4"/>')
            for y in (-62, 50):
                I.body.append(f'<rect x="-7" y="{y}" width="14" height="6" rx="2" fill="{MAT["cloth_red"][1]}" stroke="{OUT}" stroke-width="2"/>')
            I.body.append(f'<rect x="-7" y="-78" width="14" height="8" rx="3" fill="{I.metal("bone", True)}" stroke="{OUT}" stroke-width="2.4"/>')
            for (dx, col) in ((-8, "#2fd07a"), (0, "#ffd23a"), (8, "#2fd07a")):
                I.body.append(f'<path d="M0 56 Q{dx*1.6} 66 {dx*1.4} 82 Q{dx*.5} 68 0 56Z" fill="{col}" stroke="{OUT}" stroke-width="1.6"/>')
            for k, x in enumerate((18, 26)):
                I.body.append(f'<path d="M{x} -46 L{x} {4-k*6}" stroke="{OUT}" stroke-width="5"/><path d="M{x} -46 L{x} {4-k*6}" stroke="#e8e0c8" stroke-width="2.4"/>'
                              f'<path d="M{x} -54 L{x+4} -44 L{x-4} -44Z" fill="{GEM["emerald"][1]}" stroke="{OUT}" stroke-width="1.8"/>')
        weapon_group(I, f, .95, angle=45)

    def spirit_sword(I):
        sword(I, "jade", "bone", "leather", "bone", "curved", "emerald", "emerald", "#e6fff0", "#b8ffd8", "#e6fff0", "broad", 14, wrap="#c83a2a")
        I.over.append(star(98, 26, 5, "#b8ffd8") + star(30, 96, 4, "#b8ffd8"))

    def staff_e(shaft, top, col, claw, glow, band, kind=None):
        return shrink(lambda I: staff(I, shaft, top, col, claw, glow, band, 1.0, elem_top(kind) if kind else None), .86, 6)

    return {
        # Samurai
        "ars_katana_swift": lambda: U(lambda I: katana(I, "steel", "silver", "#1d3a6a", "#e8f0ff", 8, False, "#9fe6ff", gem_="sapphire"), "#7ad8ff", None, 3, 201),
        "ars_katana_great": lambda: U(lambda I: katana(I, "darksteel", "gold", "#5a0c10", "#f4ecd8", 9, True, "#ffcf5a", gem_="ruby"), "#ffae1e", "#ff7a2a", 3, 202, 5),
        "ars_sai_guard": lambda: U(lambda I: sai(I, "steel", "cloth_red", "#f4ecd8", "ruby"), "#ff6a5a", None, 2, 203),
        "ars_kusarigama": lambda: U(kusarigama, "#ff5a4a", None, 2, 204),
        # Caçador
        "ars_crossbow_hunt": lambda: U(lambda I: crossbow(I, "darkwood", "iron", gem_="topaz"), "#ffcf5a", None, 2, 205),
        "ars_crossbow_repeat": lambda: U(lambda I: crossbow(I, "wood", "darksteel", repeat=True, gem_="ruby"), "#ff8a5a", None, 2, 206),
        "ars_hunter_pole": lambda: U(lambda I: pole(I, "ashwood", "bronze", "bronze", "hunter"), None, None, 0, 207),
        "ars_hunter_cleaver": lambda: U(lambda I: sword(I, "steel", "darksteel", "leather", "bronze", "bar", None, None, None, "#ff6a5a", None, "cleaver", 24, serr=True), "#c42b2b", None, 2, 208),
        # Guerreiro
        "ars_greatsword_oath": lambda: U(lambda I: greatsword(I, "steel", "gold", "cloth_blue", "gold", "wings", "sapphire", "topaz", "#4f8dff", "#ffe9a0", None, "broad", 20), "#ffd36a", "#4f8dff", 4, 209, 5),
        "ars_twin_shortswords": lambda: U(twin_swords, "#ff6a5a", None, 2, 210),
        # Maga
        "ars_spellbook": lambda: U(lambda I: book(I, "cloth_blue", "gold", "wave", "sapphire", pages_out=True), "#7ab0ff", "#4f8dff", 3, 211),
        "ars_tome_eclipse": lambda: U(lambda I: book(I, "cloth_purple", "gold", "eclipse", "amethyst", thick=True, chains=True, glow="#c690ff"), "#a85cff", "#7a2cff", 3, 212, 5),
        "ars_arcane_gloves": lambda: U(lambda I: gloves(I, "cloth_purple", "gold", "#7af6ff", "sapphire"), "#7af6ff", None, 2, 213),
        "ars_fire_staff": lambda: U(staff_e("darkwood", "brazier", "ruby", "gold", None, "gold"), "#ff7a2a", "#ff5a1a", 3, 214, 5),
        "ars_frost_staff": lambda: U(staff_e("ice", "snowflake", "diamond", "silver", "#bff6ff", "silver"), "#5ad6ff", None, 3, 215),
        "ars_thunder_staff": lambda: U(staff_e("darksteel", "none", "topaz", "gold", None, "gold", "thunder"), "#fff36a", "#ffd23a", 4, 216, 5),
        # Druida
        "ars_nature_staff": lambda: U(staff_e("darkwood", "none", "emerald", "jade", None, "jade", "leaf"), "#7fdf6a", None, 3, 217),
        "ars_storm_staff": lambda: U(staff_e("wood", "none", "sapphire", "silver", None, "silver", "storm"), "#9cc4ff", None, 3, 218),
        "ars_oak_pole": lambda: U(lambda I: pole(I, "darkwood", "jade", "bronze", "oak"), "#7fdf6a", None, 2, 219),
        "ars_thorn_spear": lambda: U(lambda I: spear(I, "darkwood", "jade", "thorn", "cloth_green", glow="#b8ffd8"), "#7fdf6a", None, 2, 220),
        "ars_root_crossbow": lambda: U(lambda I: crossbow(I, "darkwood", "bronze", "#c8e0a0", "jade", thorns=True, gem_="emerald"), "#7fdf6a", None, 2, 221),
        # Xamã
        "ars_jatoba_bow": lambda: U(lambda I: bow(I, "wood", "#f0ead8", "bronze", "cloth_red", None, True, "amber", "#c83a2a"), "#ffb04a", None, 2, 222),
        "ars_curare_blowgun": lambda: U(curare, "#7fcf2a", None, 2, 223),
        "ars_spirit_sword": lambda: U(spirit_sword, "#5affb0", None, 0, 224),
        "ars_paje_pole": lambda: U(lambda I: pole(I, "wood", "bronze", "bone", "feathers"), "#ffb04a", None, 2, 225),
        "ars_tupa_spear": lambda: U(lambda I: spear(I, "wood", "gold", "bolt", None, True, "#fff36a", "topaz"), "#fff36a", None, 3, 226),
        # Arqueiro
        "ars_yew_longbow": lambda: U(lambda I: bow(I, "yew", "#f0ead8", "iron", "leather", None, True, None, "#4a2410"), None, None, 0, 227),
        "ars_falcon_shortbow": lambda: U(shrink(lambda I: bow(I, "ashwood", "#ffffff", "silver", "cloth_blue", "#9cc4ff", False, "diamond", "#3d6fd0"), .86, 0), "#9cc4ff", None, 3, 228),
        "ars_twin_bow": lambda: U(twin_bow, "#7ab0ff", None, 3, 229),
        "ars_trident_bow": lambda: U(trident_bow, "#ff6a5a", "#c42b2b", 3, 230, 5),
        # Necromante
        "ars_pale_scythe": lambda: U(lambda I: scythe(I, "bone", "pale", "#5affb0"), "#5affb0", "#3aff9a", 3, 231),
        "ars_grave_staff": lambda: U(staff_e("darksteel", "tomb", "soul", "silver", "#5affb0", "silver"), "#5affb0", None, 2, 232),
        "ars_tome_dead": lambda: U(lambda I: book(I, "cloth_black", "silver", "skull", "soul", thick=True, chains=True, glow="#5affb0"), "#5affb0", "#1a6a40", 3, 233, 5),
        "ars_soul_book": lambda: U(lambda I: book(I, "cloth_green", "bone", "eye", "soul", pages_out=True), "#5affb0", None, 3, 234),
        # Ladina
        "ars_throwing_knives": lambda: U(knives, "#c8d4ea", None, 2, 235),
        "ars_shadow_shortsword": lambda: U(lambda I: sword(I, "obsidian", "darksteel", "cloth_black", "darksteel", "curved", "void", None, None, "#b07aff", None, "straight", 11, scale=.88), "#a85cff", None, 2, 236),
        "ars_twin_sai": lambda: U(lambda I: twin_sai(I, mat="darksteel", grip_mat="cloth_black", wrap="#a85cff", gem_="amethyst", glow="#c690ff"), "#a85cff", None, 2, 237),
        "ars_bamboo_pole": lambda: U(lambda I: pole(I, "bamboo", kind="bamboo"), "#c8e090", None, 0, 238),
        "ars_nunchaku": lambda: U(nunchaku, "#ffcf5a", None, 2, 239),
    }
