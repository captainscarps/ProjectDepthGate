"""
Gera as folhas de inimigos (28 quadros, ordem padrão "At" do jogo) a partir dos
pacotes enviados (goblins craftpix, Mini Dragão, Dracônicos, Urso Glacial).

Uso:  python3 scripts/build_enemy_sheets.py <pasta-com-os-pacotes>

Ordem At: idle 0-3 | walk 4-9 | run 10-15 | alert 16 | windup 17-18 |
          strike 19-20 | recover 21 | hurt 22-23 | death 24-27
Todos os pacotes são normalizados para olhar para a DIREITA (padrão do jogo).
"""
import colorsys
import glob
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "enemies"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "enemies")]
PK = sys.argv[1]


def find(*parts):
    pat = os.path.join(PK, "**", *parts)
    r = glob.glob(pat, recursive=True)
    assert r, pat
    return r[0]


def strip(path, fw=None):
    im = Image.open(path).convert("RGBA")
    fw = fw or im.height
    return [im.crop((i * fw, 0, i * fw + fw, im.height)) for i in range(im.width // fw)]


def is_flash(f):
    """quadro de 'flash' (silhueta de uma cor só) — o jogo já pisca sozinho."""
    from collections import Counter
    c = Counter(p for p in f.getdata() if p[3] > 0)
    tot = sum(c.values())
    return tot and c.most_common(1)[0][1] / tot > 0.7


def no_flash(frames):
    r = [f for f in frames if not is_flash(f)]
    return r or frames


def pick(frames, n, lo=0.0, hi=1.0):
    a = int(round(lo * (len(frames) - 1)))
    b = int(round(hi * (len(frames) - 1)))
    if n == 1:
        return [frames[(a + b) // 2]]
    return [frames[int(round(a + (b - a) * i / (n - 1)))] for i in range(n)]


def build(src):
    """src: dict anim->list of frames (already chosen)."""
    order = ["idle", "walk", "run", "alert", "windup", "strike", "recover", "hurt", "death"]
    counts = [4, 6, 6, 1, 2, 2, 1, 2, 4]
    seq = []
    for k, c in zip(order, counts):
        fr = src[k]
        assert len(fr) == c, (k, len(fr))
        seq += fr
    return seq


def sheet(seq, flip=False, pad=1):
    if flip:
        seq = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in seq]
    # centro horizontal do corpo = média dos quadros idle/walk
    cx = []
    top = bot = None
    l = r = None
    for i, f in enumerate(seq):
        bb = f.getbbox()
        if not bb:
            continue
        if i < 10:
            cx.append((bb[0] + bb[2]) / 2)
        top = bb[1] if top is None else min(top, bb[1])
        bot = bb[3] if bot is None else max(bot, bb[3])
        l = bb[0] if l is None else min(l, bb[0])
        r = bb[2] if r is None else max(r, bb[2])
    c = sum(cx) / len(cx)
    half = int(max(c - l, r - c) + 0.999) + pad
    x0 = int(round(c)) - half
    w = half * 2
    h = bot - top + pad
    out = Image.new("RGBA", (w * len(seq), h))
    for i, f in enumerate(seq):
        out.paste(f.crop((x0, top - pad, x0 + w, bot)), (i * w, 0))
    # altura visível típica (quadros idle)
    vis = max((f.getbbox()[3] - f.getbbox()[1]) for f in seq[:4] if f.getbbox())
    return out, w, h, vis


def recolor(im, fn):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            h, s, v = fn(h * 360, s, v)
            rr, gg, bb = colorsys.hsv_to_rgb((h % 360) / 360, max(0, min(1, s)), max(0, min(1, v)))
            px[x, y] = (int(rr * 255), int(gg * 255), int(bb * 255), a)
    return im


def in_range(h, lo, hi):
    return lo <= h <= hi if lo <= hi else (h >= lo or h <= hi)


# ── recolorações ────────────────────────────────────────────────────────
def frost_skin(lo, hi):
    """pele (faixa de matiz lo..hi) → azul-claro gelado; resto levemente esfriado."""
    def f(h, s, v):
        if in_range(h, lo, hi) and s > 0.12:
            return 200, s * 0.55, min(1, v * 1.35 + 0.18)
        return (h * 0.5 + 215 * 0.5) if s > 0.1 else h, s * 0.6, min(1, v * 1.1 + 0.04)
    return f


def frost_all(h, s, v):
    if s < 0.12:  # brancos/cinzas/pretos ficam, só puxa pra azul
        return 205, s + 0.08, v
    return 198, s * 0.6, min(1, v * 1.15 + 0.22)


def shadow_all(h, s, v):
    if s < 0.12:
        return 270, s + 0.05, v * 0.85
    # vermelhos → violeta escuro, amarelos/laranjas (asas/barriga) → lilás
    if in_range(h, 20, 70):
        return 285, s * 0.7, v * 0.95
    return 275, min(1, s * 1.05), v * 0.7


def elite_skin(h, s, v):
    # goblin de elite: pele verde-azulada → oliva/ocre-escuro com olhos marcados
    if in_range(h, 80, 200) and s > 0.12:
        return 75, min(1, s * 1.15), v * 0.95
    return h, s, v


def yeti_fur(h, s, v):
    # laranja/vermelho → pelagem branca com sombras azul-gelo (cores do Yeti)
    if s > 0.35 and in_range(h, 330, 45):
        return 205, min(0.55, 0.06 + (1 - v) * 1.6), min(1, 0.72 + 0.28 * v)
    return h, s, v


def troll_skin(h, s, v):
    # laranja/vermelho → verde-musgo (cores do Troll)
    if s > 0.35 and in_range(h, 330, 45):
        return 88 + (h if h < 180 else h - 360) * 0.4, s * 0.62, v * 0.62
    return h, s, v


def husky():
    d = os.path.dirname(find("Troll e Yete", "Husky.png"))
    S = lambda nm: strip(os.path.join(d, nm + ".png"), 42)
    idle, walk, a, hurt, dead = S("Husky_idle"), S("Husky_walk"), S("Husky_attack"), no_flash(S("Husky_hurt")), S("Husky_death")
    return build({
        "idle": pick(idle, 4), "walk": pick(walk, 6), "run": pick(walk, 6),
        "alert": [idle[0]], "windup": [a[0], a[1]], "strike": [a[2], a[2]],
        "recover": [a[3]], "hurt": pick(hurt, 2, 0.3, 1), "death": pick(dead, 4),
    })


# ── fontes ──────────────────────────────────────────────────────────────
def goblin(n, atk, run="Run"):
    d = os.path.dirname(find(f"Goblin_{n}", "Idle.png"))
    S = lambda nm: strip(os.path.join(d, nm + ".png"))
    idle, walk, runf, a, hurt, dead = S("Idle"), S("Walk"), S(run), S(atk), S("Hurt"), S("Dead")
    return build({
        "idle": pick(idle, 4), "walk": pick(walk, 6), "run": pick(runf, 6),
        "alert": [a[0]], "windup": pick(a, 2, 0.15, 0.4), "strike": pick(a, 2, 0.55, 0.8),
        "recover": [a[-1]], "hurt": pick(hurt, 2, 0.3, 1), "death": pick(dead, 4),
    })


def minidragon():
    d = os.path.dirname(find("Mini Drag*", "Idle.png"))
    S = lambda nm: strip(os.path.join(d, nm + ".png"))
    idle, walk, a, hurt, dead = S("Idle"), S("Walk"), S("Attack_1"), S("Hurt"), S("Dead")
    return build({
        "idle": pick(idle, 4), "walk": pick(walk, 6), "run": pick(walk, 6, 0.0, 1.0),
        "alert": [a[0]], "windup": pick(a, 2, 0.1, 0.35), "strike": pick(a, 2, 0.55, 0.8),
        "recover": [a[-1]], "hurt": pick(hurt, 2, 0.3, 1), "death": pick(dead, 4),
    })


def boss_pack(folder_glob, base, fw, has_idle, hurt_idx=None):
    d = os.path.dirname(find(folder_glob, base + ".png"))
    S = lambda nm: strip(os.path.join(d, nm + ".png"), fw)
    walk, a, hurt, dead, sneer = S(base + "_walk"), S(base + "_attack1"), S(base + "_hurt"), S(base + "_death"), S(base + "_sneer")
    run = S(base + "_run") if os.path.exists(os.path.join(d, base + "_run.png")) else walk
    idle = S(base + "_idle") if has_idle else (S(base) * 4)
    hurt = no_flash(hurt)
    hurt_fr = pick(hurt, 2, 0.3, 1) if len(hurt) > 1 else hurt * 2
    return build({
        "idle": pick(idle, 4), "walk": pick(walk, 6), "run": pick(run, 6),
        "alert": [sneer[len(sneer) // 2]], "windup": pick(a, 2, 0.1, 0.4), "strike": pick(a, 2, 0.55, 0.85),
        "recover": [a[-1]], "hurt": hurt_fr, "death": pick(dead, 4),
    })


def main():
    jobs = []
    g3 = goblin(3, "Attack_1")
    g2 = goblin(2, "Attack_2")
    g1 = goblin(1, "Attack_1")
    jobs += [("goblin-v4", g3, False, None),
             ("goblin-archer-v4", g2, False, None),
             ("goblin-elite-v4", g1, False, elite_skin),
             ("frost-goblin-v4", g3, False, frost_skin(80, 200)),
             ("frost-goblin-archer-v4", g2, False, frost_skin(330, 40))]
    md = minidragon()
    jobs += [("wyrmling-v4", md, False, None),
             ("wyrmling-frost-v4", md, False, frost_all),
             ("wyrmling-shadow-v4", md, False, shadow_all)]
    jobs += [("dragon-knight-v4", boss_pack("Cavaleiro*", "Demon_Boss", 96, False), True, None),
             ("dragon-priest-v4", boss_pack("Sacerdote*", "Mage_boss", 64, False), True, None),
             ("frost-bear-v4", boss_pack("Urso Glacial", "Magic_bear", 72, True), True, None)]
    hk = husky()
    jobs += [("troll-v4", hk, True, troll_skin),
             ("yeti-v4", hk, True, yeti_fur)]
    meta = {}
    for name, seq, flip, rc in jobs:
        seq = [f.copy() for f in seq]
        if rc:
            seq = [recolor(f, rc) for f in seq]
        out, w, h, vis = sheet(seq, flip)
        for o in OUTS:
            if os.path.isdir(o):
                out.save(os.path.join(o, name + ".png"))
        meta[name] = {"w": w, "h": h, "vis": vis}
        print(f"{name:24s} quadro {w}x{h}  altura visível {vis}")
    json.dump(meta, open(os.path.join(ROOT, "scripts", "enemy_sheets_v4.json"), "w"), indent=1)


main()
