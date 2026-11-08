"""Modificações de visual das armaduras lendárias: herói sem capacete/capuz + ponto da capa.

Para cada classe (folha "pack" de 128×128, 39 quadros), a partir do traje base (t0):
  - acha em cada quadro a cabeça (capacete/capuz): topo do corpo, ignorando a lâmina fina da arma;
  - grava uma máscara com os pixels do capacete (assets/pixel-art/characters/mods/<classe>-helm.png) — as
    folhas t1..t4 e as recoloridas têm os mesmos pixels nos mesmos lugares, então a máscara vale para todas;
  - grava onde desenhar a cabeça descoberta e o ponto da nuca, de onde sai a capa (<classe>-mods.json);
  - a cabeça descoberta é desenhada aqui em pixel art (de perfil, olhando para a direita, como a folha).
O jogo (scripts/source/hero-mods.js) recorta o capacete e cola a cabeça na hora em que a armadura é equipada.

Uso: python3 scripts/build_hero_mods.py [classe ...]
"""
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "assets", "pixel-art", "characters")
OUT = os.path.join(CH, "mods")

# cabeças descobertas (de perfil, olhando para a direita): contorno O, cabelo H/h, pele S/s, olho E, barba B/b,
# e cores próprias de cada herói (faixa, tiara, máscara, chifres, penas). PALS troca a paleta por herói.
BASE = {".": None, "O": (26, 18, 16), "H": (64, 40, 26), "h": (104, 68, 40), "S": (226, 170, 124),
        "s": (182, 120, 82), "E": (30, 20, 16), "B": (70, 44, 28), "b": (100, 66, 42), "W": (238, 236, 230),
        "w": (176, 172, 168), "G": (218, 170, 60), "R": (176, 36, 36), "P": (226, 222, 214), "p": (176, 170, 164),
        "Y": (236, 196, 64), "K": (52, 120, 70), "A": (120, 84, 50)}
PALS = {
    "berserker": {"H": (22, 20, 28), "h": (44, 40, 54), "S": (232, 186, 140), "s": (190, 136, 96)},
    "archer": {"H": (20, 18, 24), "h": (40, 36, 46), "S": (236, 192, 148), "s": (196, 142, 102), "G": (56, 150, 92)},
    "hunter": {"H": (18, 16, 20), "h": (40, 34, 40)},
    "druid": {"W": (196, 196, 192), "w": (140, 140, 138), "B": (170, 170, 166), "b": (128, 128, 126)},
    "necromancer": {"W": (232, 232, 238), "w": (170, 172, 184), "R": (220, 30, 40)},
    "mage": {"O": (12, 8, 14), "H": (22, 18, 28), "h": (40, 36, 58), "L": (70, 70, 104), "S": (222, 168, 132),
             "s": (178, 118, 92), "E": (24, 16, 20), "e": (10, 8, 10), "M": (176, 84, 82), "g": (160, 112, 34),
             "Q": (52, 104, 200)},
    "rogue": {"O": (14, 10, 18), "H": (46, 30, 62), "h": (78, 50, 104), "L": (128, 92, 160), "S": (246, 222, 210),
              "s": (206, 166, 158), "E": (40, 24, 50), "e": (14, 10, 18), "M": (200, 110, 120)},
    "shaman": {"O": (30, 18, 10), "R": (196, 40, 32), "K": (46, 140, 70), "Y": (240, 200, 60), "B": (40, 110, 190),
               "A": (120, 70, 36), "G": (240, 200, 60)},
}
HEADS = {
    "warrior": [   # Draven: cabelo castanho curto penteado para trás, barba cheia
        "...OOOOOO...",
        "..OHhhHHHO..",
        ".OHHHHHHHHO.",
        ".OHHHHHHHSO.",
        ".OHHHSSSSSO.",
        ".OHHsSSSESO.",
        ".OHsSSSSSSSO",
        ".OHHSSSSSSO.",
        ".OBBbSSSSBO.",
        "..OBBBBBBO..",
        "...OBBBBO...",
        "....OOOO....",
    ],
    "berserker": [   # Akihiro: coque de samurai, a máscara vermelha vira um lenço no rosto
        ".....OOO....",
        "....OHHHO...",
        "...OOHhHOO..",
        "..OHHHHHHHO.",
        ".OHHHHHHHHO.",
        ".OHHHHSSSSO.",
        ".OHHHSSSESO.",
        ".OHHsSSSSSSO",
        ".OHHRRRRRRO.",
        ".OHRRRRRRRO.",
        "..ORRRRRRO..",
        "...OOOOOO...",
    ],
    "archer": [   # Hayato: cabelo preto preso, faixa verde na testa
        "...OOOOOO...",
        "..OHHHhHHO..",
        ".OHHHHHHHHO.",
        "OHGGGGGGGGO.",
        "OHHHHHSSSSO.",
        "OHHHHSSSESO.",
        ".OHHsSSSSSSO",
        ".OHHsSSSSSO.",
        ".OHHSSSSSSO.",
        "OHHO.OSSSO..",
        "OHO...OOO...",
        ".O..........",
    ],
    "hunter": [   # Kael: sem o chapéu de palha, cabelo preto até o pescoço (só a parte de cima; o rosto é o original)
        "...OOOOOOO...",
        "..OHHHhhHHO..",
        ".OHHHHHHHHHO.",
        "OHHHHHHHHHHHO",
        "OHHHHHHHHHO..",
        "OHHH.........",
        "OHH..........",
    ],
    "druid": [   # Tharion: cabelo e barba grisalhos, os chifres do capuz viram uma coroa
        "OA........AO",
        ".OA..OO..AO.",
        "..OAOWWOAO..",
        "..OWWWWWWO..",
        ".OWWwWWWWWO.",
        ".OWWWWSSSSO.",
        ".OWWwSSSESO.",
        ".OWWsSSSSSSO",
        ".OWWBBSSSSO.",
        "..OBBBBbBBO.",
        "...OBBBBBO..",
        "....OOOOO...",
    ],
    "necromancer": [   # Valthor: cabelo branco comprido, pele pálida, olho vermelho
        "...OOOOOO...",
        "..OWWWWWWO..",
        ".OWWWwWWWWO.",
        ".OWWWWWWWWO.",
        ".OWWWWPPPPO.",
        ".OWWWpPPPRO.",
        ".OWWWPPPPPPO",
        ".OWWWpPPPPO.",
        ".OWWWPPPPPO.",
        ".OWWWOPPPO..",
        ".OWWO.OOO...",
        "..OO........",
    ],
    "mage": [   # Arthelia: cabelo preto liso e comprido com franja reta, tiara dourada com lápis-lazúli, olho delineado
        "....OOOOOO....",
        "...OHHhhLHOO..",
        "..OHHhhhLLhHO.",
        ".OHGgGGGGQGGO.",
        ".OHHHhHHHHHHO.",
        ".OHHHHhHHSSSO.",
        ".OHHHHHHsSeES.",
        ".OHHhHHHSSSSSO",
        ".OHHhHHHsSSSO.",
        ".OHHhHHHHsSMO.",
        ".OHHhHHHOSSO..",
        ".OHHhHHHOsO...",
        ".OHHhHHHO.....",
        "..OHhHHO......",
        "...OOOO.......",
    ],
    "rogue": [   # Seris: sem o capuz, cabelo curto violeta com a franja caindo de lado, pele clara como a dos braços
        "...OOOOOO.....",
        "..OHHhLLhOO...",
        ".OHHhhLLhhHO..",
        ".OHHHhhhhhHHO.",
        "OHHHHHHHHhHHO.",
        "OHHHHHHHHHHSO.",
        "OHHHHHsSSHSSO.",
        ".OHHHsSSSeESO.",
        ".OHHHSSSSSSSSO",
        ".OHHhHsSSSSSO.",
        "..OHHHOsSSMO..",
        "..OHhO.OsSO...",
        "...OO...OO....",
    ],
    "shaman": [   # Araí: cocar de penas por cima do cabelo (a cabeça dela fica como é)
        ".R.Y.K.B.R.",
        "RRYYKKBBRR.",
        "RY.YKKB.BR.",
        "OAAGAAGAAO.",
    ],
}
# máscara do capacete: meia largura, altura, e onde a cabeça nova entra (dx, dy em relação ao centro/topo)
MASK = {"warrior": (7, 13, 1, 1), "berserker": (7, 14, 1, 1), "archer": (8, 14, 1, 1), "hunter": (13, 9, 1, 2),
        "druid": (7, 12, 1, 0), "necromancer": (7, 13, 1, 1), "mage": (8, 14, 1, 0, 1), "rogue": (9, 14, 1, 0, 2), "shaman": (0, 0, 0, -3)}
# 5º valor (opcional): a elipse da máscara anda tantos pixels para trás (o capuz cobre mais a nuca que a testa)


def frames(path, fw=128):
    im = np.array(Image.open(path).convert("RGBA"))
    return [im[:, i * fw:(i + 1) * fw] for i in range(im.shape[1] // fw)]


def head_box(f):
    """topo do corpo sem as partes finas (arma, arco, lança): abertura morfológica e o maior pedaço que sobra"""
    from scipy import ndimage as nd
    a = f[:, :, 3] > 100
    op = nd.binary_opening(a, structure=np.ones((4, 4)))
    lab, n = nd.label(op)
    if not n:
        return None
    k = 1 + int(np.argmax(nd.sum(op, lab, range(1, n + 1))))
    ys, xs = np.where(lab == k)
    w, h = xs.max() - xs.min(), ys.max() - ys.min()
    if w > h * 1.15:            # deitado (morte): fica como está
        return None
    top = int(ys.min())
    sel = ys < top + 5
    return top, float(xs[sel].mean())


def helm_mask(f, top, cx, hw=7, hh=13):
    """pixels do capacete: elipse em volta da cabeça, sem as partes finas que passam por ela (lâmina, haste)"""
    from scipy import ndimage as nd
    a = f[:, :, 3] > 100
    body = nd.binary_dilation(nd.binary_opening(a, structure=np.ones((4, 4))), iterations=1)
    m = np.zeros(a.shape, bool)
    cy = top + hh / 2
    for y in range(max(0, int(top) - 1), min(a.shape[0], int(top + hh))):
        for x in range(int(cx - hw - 1), int(cx + hw + 2)):
            if 0 <= x < a.shape[1] and a[y, x] and body[y, x] and ((x - cx) / (hw + .5)) ** 2 + ((y - cy) / (hh / 2 + .5)) ** 2 <= 1.0:
                m[y, x] = True
    return m


# chapéu largo (Kael): sai pela cor da palha, numa faixa larga e baixa (a elipse deixava a aba)
HAT = {"hunter"}
CROWN = {"shaman"}


def hat_mask(f, top, cx, hw, hh):
    """a copa (as linhas de cima) sai inteira; na aba, só fora do rosto"""
    a = f[:, :, 3] > 100
    m = np.zeros(a.shape, bool)
    for y in range(max(0, int(top) - 1), min(a.shape[0], int(top + hh + 1))):
        for x in range(max(0, int(cx - hw - 2)), min(a.shape[1], int(cx + hw + 3))):
            if a[y, x] and (y < top + 7 or abs(x - cx) > 4):
                m[y, x] = True
    return m


# capuz das heroínas: a cabeça nova encaixa pelo rosto (que aparece dentro do capuz) e o capuz sai pela cor,
# numa caixa em volta da cabeça — assim não sobra a ponta, a aba na frente do queixo nem o capuz caído na nuca
FACE = {"mage", "rogue"}


def is_skin(px):
    r, g, b = int(px[0]), int(px[1]), int(px[2])
    return r > 170 and abs(g - b) < 30 and r - b > 10


def face_spot(f, hood_cols, y0, y1):
    """o rosto: o pedaço pequeno de pele mais cercado de capuz (braço e mão são maiores e ficam longe dele)"""
    from scipy import ndimage as nd
    a = f[:, :, 3] > 100
    sk = np.zeros(a.shape, bool)
    for y in range(max(0, y0), min(128, y1)):
        for x in range(128):
            sk[y, x] = a[y, x] and is_skin(f[y, x])
    hood = np.zeros(a.shape, bool)
    for y in range(max(0, y0 - 4), min(128, y1 + 4)):
        for x in range(128):
            hood[y, x] = a[y, x] and tuple(int(v) for v in f[y, x, :3]) in hood_cols
    lab, n = nd.label(sk)
    best = None
    for k in range(1, n + 1):
        cm = lab == k
        sz = int(cm.sum())
        if not 3 <= sz <= 34:
            continue
        ring = nd.binary_dilation(cm, iterations=3) & ~cm
        sc = (hood & ring).sum() / max(1, ring.sum())
        if best is None or sc > best[0]:
            best = (sc, k)
    if not best or best[0] < .25:
        return None
    yy, xx = np.where(lab == best[1])
    return float(xx.mean()), float(yy.mean()), int(xx.max())


def hood_mask(f, hood_cols, box, fs=None):
    from scipy import ndimage as nd
    x0, y0, x1, y1 = box
    a = f[:, :, 3] > 100
    H, W = a.shape
    m = np.zeros(a.shape, bool)
    dark = lambda px: int(px[0]) + int(px[1]) + int(px[2]) < 40
    for y in range(max(0, y0), min(H, y1)):
        for x in range(max(0, x0), min(W, x1)):
            if a[y, x] and tuple(int(v) for v in f[y, x, :3]) in hood_cols:
                m[y, x] = True
    if fs:      # só o capuz que encosta no rosto (a mão e a arma, mesmo da mesma cor, ficam)
        lab, n = nd.label(m)
        near = np.zeros(m.shape, bool)
        near[max(0, int(fs[1]) - 6):int(fs[1]) + 6, max(0, int(fs[0]) - 7):int(fs[0]) + 6] = True
        keep = set(np.unique(lab[near & m]).tolist()) - {0}
        m = np.isin(lab, list(keep))
        for y, x in zip(*np.where(near & a)):     # o rosto antigo também sai (o novo fica por cima)
            if is_skin(f[y, x]):
                m[y, x] = True
    # contorno escuro só sai se não encosta em nada que fica (arma, mão, roupa)
    for y in range(max(0, y0), min(H, y1)):
        for x in range(max(0, x0), min(W, x1)):
            if a[y, x] and not m[y, x] and dark(f[y, x]):
                nb = [(y + dy, x + dx) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= y + dy < H and 0 <= x + dx < W]
                if all(not a[q] or m[q] or dark(f[q]) for q in nb):
                    m[y, x] = True
    return m


def build(cls):
    src = os.path.join(CH, f"{cls}-pack-t0-body.png")
    if not os.path.isfile(src) or cls not in HEADS:
        print("sem dados para", cls)
        return
    F = frames(src)
    mask = np.zeros((128, 128 * len(F), 4), np.uint8)
    head = HEADS[cls]
    hh, hwid = len(head), max(len(r) for r in head)
    head = [r.ljust(hwid, ".") for r in head]
    info = {"frames": [], "headW": hwid, "headH": hh}
    if cls in FACE:
        fpx = [(x, y) for y, r in enumerate(head) for x, ch in enumerate(r) if ch in "SsEeM"]
        hfx, hfy = sum(p[0] for p in fpx) / len(fpx), sum(p[1] for p in fpx) / len(fpx)
        from collections import Counter
        cnt = Counter()
        for f in F:
            hb = head_box(f)
            if not hb:
                continue
            hw, hh_, dx, dy, *bk = MASK[cls]
            hm = helm_mask(f, hb[0], hb[1] - (bk[0] if bk else 0), hw, hh_)
            for y, x in zip(*np.where(hm)):
                px = f[y, x]
                if not is_skin(px) and sum(int(v) for v in px[:3]) >= 40:
                    cnt[tuple(int(v) for v in px[:3])] += 1
        hood_cols = {c for c, n in cnt.items() if n >= 2}
    for i, f in enumerate(F):
        hb = head_box(f)
        if not hb:
            info["frames"].append(None)
            continue
        top, cx = hb
        hw, hh_, dx, dy, *bk = MASK.get(cls, (7, 13, 1, 1))
        mc = cx - (bk[0] if bk else 0)
        m = (hat_mask(f, top, cx, hw, hh_) if cls in HAT else helm_mask(f, top, mc, hw, hh_)) if hw else np.zeros(f.shape[:2], bool)
        mask[:, i * 128:(i + 1) * 128][m] = (255, 255, 255, 255)
        # cabeça: encostada no topo do capacete, um pixel mais baixa (o capacete é maior que a cabeça)
        hx, hy = int(round(cx - hwid / 2 + dx)), int(top + dy)
        if cls in FACE:
            fs = face_spot(f, hood_cols, top - 8, top + 16)
            if fs:
                hx, hy = int(round(fs[0] - hfx)), int(round(fs[1] - hfy))
                top0, cx, top = top, hx + 6, hy - dy     # a nuca (de onde sai a capa) acompanha a cabeça achada
                m = hood_mask(f, hood_cols, (hx - 7, min(top0, hy) - 3, hx + hwid + 5, hy + hh - 3), fs)
                mask[:, i * 128:(i + 1) * 128] = 0     # o rosto achado: só o capuz sai (a elipse cortava a mão erguida)
                mask[:, i * 128:(i + 1) * 128][m] = (255, 255, 255, 255)
        if cls in CROWN:        # cocar: em cima da testa, não do rabo de cavalo (que sobe mais alto atrás)
            a = f[:, :, 3] > 100
            # a frente do rosto é a pintura vermelha dela (a lança e o escudo também ficam na frente)
            pr = f[top:top + 16].astype(int)
            pys, pxs = np.where((pr[:, :, 0] > 180) & (pr[:, :, 1] < 70) & (pr[:, :, 2] < 60) & (pr[:, :, 3] > 100))
            if len(pxs) >= 3:
                fx = int(pxs.max()) + 1
            else:
                # sem a pintura à vista (de costas): a frente do cabelo dela
                hr = f[max(0, top - 4):top + 14].astype(int)
                hys, hxs = np.where((hr[:, :, 3] > 100) & (abs(hr[:, :, 0] - 20) < 6) & (abs(hr[:, :, 1] - 18) < 6) & (abs(hr[:, :, 2] - 29) < 6))
                fx = int(hxs.max()) + 1 if len(hxs) else None
                if fx is None or abs(fx - cx) > 9:     # cabeça escondida atrás do escudo: sem cocar nesse quadro
                    info["frames"].append(None)
                    continue
            if abs(fx - cx - 10) > 5:     # longe demais do lugar de sempre: a cabeça está escondida
                info["frames"].append(None)
                continue
            cols = a[top - 2:top + 14, fx - 7:fx - 1]
            tf = top - 2 + int(np.argmax(cols.any(axis=1)))
            hx, hy = fx - hwid + 1, tf - hh + 2
        info["frames"].append({"hx": hx, "hy": hy, "neck": [round(cx - 3), int(top + 12)]})
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(mask).save(os.path.join(OUT, f"{cls}-helm.png"), optimize=True)
    pal = {**BASE, **PALS.get(cls, {})}
    img = Image.new("RGBA", (hwid, hh))
    for y, row in enumerate(head):
        for x, ch in enumerate(row):
            if pal.get(ch):
                img.putpixel((x, y), (*pal[ch], 255))
    img.save(os.path.join(OUT, f"{cls}-head.png"))
    json.dump(info, open(os.path.join(OUT, f"{cls}-mods.json"), "w"), separators=(",", ":"))
    print(cls, "ok", sum(1 for x in info["frames"] if x), "/", len(F), "quadros")


if __name__ == "__main__":
    for c in sys.argv[1:] or list(HEADS):
        build(c)
