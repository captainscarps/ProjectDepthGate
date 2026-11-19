#!/usr/bin/env python3
"""Araí e Druida andando para baixo (de frente) e para cima (de costas) — folhas <classe>-pack-dirs.png.

Fontes (PixelLab, quadros 192×192; o quadro 0 é a pose parada, 1…8 a caminhada):
  scripts/art-src/<pasta>/dirs-south.png  (de frente)   scripts/art-src/<pasta>/dirs-north.png  (de costas)
Saída no formato de scripts/source/hero-dirs.js: 128×128 por quadro, 4 linhas × 9 colunas
(linha 0 frente, 1 costas, 2 e 3 diagonais — sem uso, repetem frente e costas), coluna 0 parado, 1…8 caminhada.
Mesmo tamanho dos pacotes novos (192 → 128); o pé fica em footY e o corpo no meio do quadro.
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
F, S, NC = 192, 128, 9
HEROES = {"druid": "druida", "shaman": "arai"}

def frames(path):
    im = Image.open(path).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

def shrink(fr):
    r = fr.resize((S, S), Image.LANCZOS, reducing_gap=None)
    px = r.load()
    for y in range(S):
        for x in range(S):
            c = px[x, y]
            px[x, y] = (c[0], c[1], c[2], 255) if c[3] >= 110 else (0, 0, 0, 0)
    return r

def body_mid(im):
    """x do meio do tronco (faixa do meio da altura, sem arma pendurada nas pontas) e y do pé."""
    px = im.load()
    pts = [(x, y) for y in range(S) for x in range(S) if px[x, y][3]]
    top, bot = min(p[1] for p in pts), max(p[1] for p in pts)
    band = [p for p in pts if top + (bot - top) * .25 <= p[1] <= top + (bot - top) * .55]
    xs = sorted(p[0] for p in band)
    mid = (xs[len(xs) // 10] + xs[-len(xs) // 10 - 1]) / 2           # corta 10% de cada lado (cajado/espada)
    return mid, bot

for cls, folder in HEROES.items():
    meta = json.load(open(os.path.join(OUT, f"{cls}-pack.json")))
    foot = meta["footY"]
    rows = []
    for name in ("south", "north"):
        fr = [shrink(f) for f in frames(os.path.join(ROOT, "scripts/art-src", folder, f"dirs-{name}.png"))][:NC]
        mx, bot = body_mid(fr[0])
        dx, dy = round(64 - mx), foot - bot
        row = []
        for f in fr:
            c = Image.new("RGBA", (S, S))
            c.paste(f, (dx, dy), f)
            row.append(c)
        rows.append(row)
    rows += [rows[0], rows[1]]                                       # diagonais (desligadas) = frente e costas
    sheet = Image.new("RGBA", (S * NC, S * 4))
    for r, row in enumerate(rows):
        for k, c in enumerate(row):
            sheet.alpha_composite(c, (k * S, r * S))
    out = os.path.join(OUT, f"{cls}-pack-dirs.png")
    sheet.save(out, optimize=True)
    print(os.path.relpath(out, ROOT), sheet.size)
