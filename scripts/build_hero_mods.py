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
    "mage": {"H": (18, 14, 16), "h": (44, 34, 30), "S": (176, 116, 74), "s": (136, 84, 52)},
    "rogue": {"H": (42, 26, 54), "h": (82, 52, 104), "S": (196, 138, 98), "s": (152, 98, 66)},
    "shaman": {"R": (196, 40, 32), "K": (46, 140, 70), "Y": (240, 200, 60)},
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
    "mage": [   # Arthelia: cabelo preto em franja reta, tiara dourada
        "...OOOOOO...",
        "..OHHHHhHO..",
        ".OHHHHHHHHO.",
        ".OHGGGGGGGO.",
        ".OHHHHHSSSO.",
        ".OHHHSSSESO.",
        ".OHHHSSSSSSO",
        ".OHHHSSSSSO.",
        ".OHHHSSSSSO.",
        ".OHHHOSSSO..",
        ".OHHHO.OO...",
        "..OOO.......",
    ],
    "rogue": [   # Seris: sem o capuz e a máscara, cabelo curto arroxeado
        "...OOOOOO...",
        "..OHHHHHHO..",
        ".OHHHHhHHHO.",
        ".OHHHHHHHHHO",
        ".OHHHHSSSSO.",
        ".OHHHSSSESO.",
        ".OHHHSSSSSSO",
        ".OHHsSSSSSO.",
        ".OHHSSSSSSO.",
        "..OHOSSSSO..",
        "...O.OOOO...",
        "............",
    ],
    "shaman": [   # Araí: cocar de penas por cima do cabelo (a cabeça dela fica como é)
        "R.K.Y.K.R...",
        "RRKKYYKKRR..",
        ".OOOOOOOOO..",
    ],
}
# máscara do capacete: meia largura, altura, e onde a cabeça nova entra (dx, dy em relação ao centro/topo)
MASK = {"warrior": (7, 13, 1, 1), "berserker": (7, 14, 1, 1), "archer": (8, 14, 1, 1), "hunter": (13, 9, 1, 2),
        "druid": (7, 12, 1, 0), "necromancer": (7, 13, 1, 1), "mage": (7, 13, 1, 1), "rogue": (8, 14, 1, 1), "shaman": (0, 0, 0, -3)}


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


def hat_mask(f, top, cx, hw, hh):
    """a copa (as linhas de cima) sai inteira; na aba, só fora do rosto"""
    a = f[:, :, 3] > 100
    m = np.zeros(a.shape, bool)
    for y in range(max(0, int(top) - 1), min(a.shape[0], int(top + hh + 1))):
        for x in range(max(0, int(cx - hw - 2)), min(a.shape[1], int(cx + hw + 3))):
            if a[y, x] and (y < top + 7 or abs(x - cx) > 4):
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
    for i, f in enumerate(F):
        hb = head_box(f)
        if not hb:
            info["frames"].append(None)
            continue
        top, cx = hb
        hw, hh_, dx, dy = MASK.get(cls, (7, 13, 1, 1))
        m = (hat_mask(f, top, cx, hw, hh_) if cls in HAT else helm_mask(f, top, cx, hw, hh_)) if hw else np.zeros(f.shape[:2], bool)
        mask[:, i * 128:(i + 1) * 128][m] = (255, 255, 255, 255)
        # cabeça: encostada no topo do capacete, um pixel mais baixa (o capacete é maior que a cabeça)
        hx, hy = int(round(cx - hwid / 2 + dx)), int(top + dy)
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
