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

# cabeças descobertas (de perfil, olhando para a direita). O contorno, cabelo, pele, olho e barba de cada herói.
PAL = {".": None, "O": (26, 18, 16), "H": (64, 40, 26), "h": (104, 68, 40), "S": (226, 170, 124),
       "s": (182, 120, 82), "E": (30, 20, 16), "B": (70, 44, 28), "b": (100, 66, 42), "W": (240, 236, 228)}
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
}


def frames(path, fw=128):
    im = np.array(Image.open(path).convert("RGBA"))
    return [im[:, i * fw:(i + 1) * fw] for i in range(im.shape[1] // fw)]


def head_box(f):
    """topo do corpo: primeira linha com ≥4 pixels seguidos (a lâmina da arma tem 1–2); centro pelos 6 de cima"""
    a = f[:, :, 3] > 100
    top = None
    for y in range(a.shape[0]):
        row = a[y]
        run = best = 0
        for v in row:
            run = run + 1 if v else 0
            best = max(best, run)
        if best >= 4:
            top = y
            break
    if top is None:
        return None
    ys, xs = np.where(a)
    w, h = xs.max() - xs.min(), ys.max() - ys.min()
    if w > h * 1.15:            # deitado (morte): fica como está
        return None
    cols = []
    for y in range(top, top + 6):
        row = np.where(a[y])[0]
        if len(row):
            # o maior trecho contínuo da linha
            runs, s = [], row[0]
            for k in range(1, len(row) + 1):
                if k == len(row) or row[k] != row[k - 1] + 1:
                    runs.append((s, row[k - 1]))
                    if k < len(row):
                        s = row[k]
            r0, r1 = max(runs, key=lambda r: r[1] - r[0])
            cols.append((r0 + r1) / 2)
    cx = float(np.median(cols)) if cols else float(xs.mean())
    return top, cx


def helm_mask(f, top, cx, hw=7, hh=13):
    """pixels do capacete: elipse em volta da cabeça, sem a lâmina (pixels claros e finos fora do miolo)"""
    a = f[:, :, 3] > 100
    m = np.zeros(a.shape, bool)
    cy = top + hh / 2
    for y in range(int(top), int(top + hh)):
        for x in range(int(cx - hw - 1), int(cx + hw + 2)):
            if 0 <= x < a.shape[1] and a[y, x] and ((x - cx) / (hw + .5)) ** 2 + ((y - cy) / (hh / 2 + .5)) ** 2 <= 1.0:
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
    hh, hwid = len(head), len(head[0])
    info = {"frames": [], "headW": hwid, "headH": hh}
    for i, f in enumerate(F):
        hb = head_box(f)
        if not hb:
            info["frames"].append(None)
            continue
        top, cx = hb
        m = helm_mask(f, top, cx)
        mask[:, i * 128:(i + 1) * 128][m] = (255, 255, 255, 255)
        # cabeça: encostada no topo do capacete, um pixel mais baixa (o capacete é maior que a cabeça)
        hx, hy = int(round(cx - hwid / 2 + 1)), int(top + 1)
        info["frames"].append({"hx": hx, "hy": hy, "neck": [round(cx - 3), int(top + 12)]})
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(mask).save(os.path.join(OUT, f"{cls}-helm.png"), optimize=True)
    img = Image.new("RGBA", (hwid, hh))
    for y, row in enumerate(head):
        for x, ch in enumerate(row):
            if PAL.get(ch):
                img.putpixel((x, y), (*PAL[ch], 255))
    img.save(os.path.join(OUT, f"{cls}-head.png"))
    json.dump(info, open(os.path.join(OUT, f"{cls}-mods.json"), "w"), separators=(",", ":"))
    print(cls, "ok", sum(1 for x in info["frames"] if x), "/", len(F), "quadros")


if __name__ == "__main__":
    for c in sys.argv[1:] or list(HEADS):
        build(c)
