#!/usr/bin/env python3
"""Araí, Druida e Maga andando para baixo (de frente) e para cima (de costas) — folhas <classe>-pack-dirs.png.

Fontes (PixelLab, quadros 192×192; o quadro 0 é a pose parada, 1…8 a caminhada):
  scripts/art-src/<pasta>/dirs-south.png (de frente)  dirs-north.png (de costas)
  dirs-se.png (diagonal de frente ↘)  dirs-ne.png (diagonal de costas ↗); para a esquerda o jogo espelha.
Saída no formato de scripts/source/hero-dirs.js: 128×128 por quadro, 4 linhas × 9 colunas
(linha 0 frente, 1 costas, 2 diagonal de frente, 3 diagonal de costas), coluna 0 parado, 1…8 caminhada.
Sujeira solta que a IA às vezes desenha em volta (pontinhos, letras) é apagada.
Mesmo tamanho dos pacotes novos (192 → 128); o pé fica em footY e o corpo no meio do quadro.
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
F, S, NC = 192, 128, 9
HEROES = {"druid": "druida", "shaman": "arai", "mage": "maga", "archer": "arqueiro", "necromancer": "necromante", "rogue": "ladina", "berserker": "samurai"}
SMALL = {"mage": 6}                     # a Maga tem faíscas soltas do orbe: só apaga sujeira bem miúda

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

def clean(im, small=40, white=False):
    """apaga pedaços soltos pequenos (fora do corpo) e, se pedido, pixels quase brancos (o Druida não tem branco)."""
    px = im.load(); seen = set()
    if white:
        for y in range(S):
            for x in range(S):
                c = px[x, y]
                if c[3] and min(c[:3]) > 185 and max(c[:3]) - min(c[:3]) < 40: px[x, y] = (0, 0, 0, 0)
    for y in range(S):
        for x in range(S):
            if px[x, y][3] and (x, y) not in seen:
                st, comp = [(x, y)], []
                seen.add((x, y))
                while st:
                    a, b = st.pop(); comp.append((a, b))
                    for u in (-1, 0, 1):
                        for v in (-1, 0, 1):
                            n = (a + u, b + v)
                            if 0 <= n[0] < S and 0 <= n[1] < S and n not in seen and px[n][3]:
                                seen.add(n); st.append(n)
                if len(comp) < small:
                    for q in comp: px[q] = (0, 0, 0, 0)
    return im

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
    for name in ("south", "north", "se", "ne"):
        fr = [clean(shrink(f), SMALL.get(cls, 40), white=cls in ("druid", "berserker")) for f in frames(os.path.join(ROOT, "scripts/art-src", folder, f"dirs-{name}.png"))][:NC]
        mx, bot = body_mid(fr[0])
        dx, dy = round(64 - mx), foot - bot
        row = []
        for f in fr:
            c = Image.new("RGBA", (S, S))
            c.paste(f, (dx, dy), f)
            row.append(c)
        rows.append(row)
    sheet = Image.new("RGBA", (S * NC, S * 4))
    for r, row in enumerate(rows):
        for k, c in enumerate(row):
            sheet.alpha_composite(c, (k * S, r * S))
    out = os.path.join(OUT, f"{cls}-pack-dirs.png")
    sheet.save(out, optimize=True)
    print(os.path.relpath(out, ROOT), sheet.size)
