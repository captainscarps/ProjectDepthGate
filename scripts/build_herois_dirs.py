#!/usr/bin/env python3
"""Heróis refeitos andando e correndo para baixo, para cima e nas diagonais — folhas <classe>-pack-dirs.png
(Cavaleiro: warrior-pack-t0…t4-dirs.png, uma por camada de armadura).

p216.50: caminhadas refeitas (PixelLab animate-pixminimax com direção) e CORRIDA nas quatro direções.
  Fontes: scripts/art-src/<pasta>/dirs2-<dir>-walk.png e dirs2-<dir>-run.png (192×192; quadro 0 = parado).
  Saída: 8 linhas × 9 colunas — 0 frente, 1 costas, 2 diagonal de frente ↘, 3 diagonal de costas ↗ (andando),
  4…7 as mesmas direções correndo; coluna 0 parado, 1…8 o ciclo. Para a esquerda o jogo espelha.

Versão anterior (abaixo, histórico):

Fontes (PixelLab, quadros 192×192; o quadro 0 é a pose parada, 1…8 a caminhada):
  scripts/art-src/<pasta>/dirs-south.png (de frente)  dirs-north.png (de costas)
  dirs-se.png (diagonal de frente ↘)  dirs-ne.png (diagonal de costas ↗); para a esquerda o jogo espelha.
Saída no formato de scripts/source/hero-dirs.js: 128×128 por quadro, 4 linhas × 9 colunas
(linha 0 frente, 1 costas, 2 diagonal de frente, 3 diagonal de costas), coluna 0 parado, 1…8 caminhada.
Sujeira solta que a IA às vezes desenha em volta (pontinhos, letras) é apagada.
Mesmo tamanho dos pacotes novos (192 → 128); o pé fica em footY e o corpo no meio do quadro.
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
F, S, NC = 192, 128, 9
HEROES = {"warrior": "cavaleiro", "druid": "druida", "shaman": "arai", "mage": "maga", "archer": "arqueiro", "necromancer": "necromante", "rogue": "ladina", "berserker": "samurai", "hunter": "cacador"}
CLIP_TOP = {"hunter"}
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

# Cavaleiro: a IA às vezes põe uma capa preta (sai) e pluma/fiapo acima do elmo; as camadas são repintadas
def decape(fr, thr=48, it=2):
    a = np.array(fr.convert("RGBA")).astype(int)
    op = a[..., 3] > 0
    dark = op & (a[..., :3].max(axis=2) < thr)
    thick = ndimage.binary_dilation(ndimage.binary_opening(dark, iterations=it), iterations=1) & dark
    lab, n = ndimage.label(thick)
    sizes = ndimage.sum(thick, lab, range(1, n + 1))
    rm = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 25])
    orig = a.copy(); a[rm, 3] = 0
    tr = a[..., 3] == 0; lab, n = ndimage.label(tr)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    hole = tr & ~np.isin(lab, list(border)); a[hole] = orig[hole]
    # p216.54: o que foi tirado e tem corpo dos DOIS lados na mesma linha (até 40 px) era armadura escura, não capa
    # (de costas a couraça do Cavaleiro é quase preta): volta, para não deixar buracos transparentes no herói
    for _ in range(6):                          # repete enquanto houver o que voltar
      keep = a[..., 3] > 0; gone = rm & ~keep
      if not gone.any(): break
      for y in np.nonzero(gone.any(axis=1))[0]:
        k = np.nonzero(keep[y])[0]
        if not len(k): continue
        for x in np.nonzero(gone[y])[0]:
            l = k[k < x]; r = k[k > x]
            if len(l) and len(r) and x - l[-1] <= 40 and r[0] - x <= 40: a[y, x] = orig[y, x]
    return Image.fromarray(a.astype(np.uint8), "RGBA")

PAL = {   # mesmas camadas de build_cavaleiro_pixellab.py
    1: ["#e8b87d", "#d4a36a", "#be854d", "#9c6232", "#73431f", "#4e2a12", "#31190a"],
    2: ["#e0f2fe", "#bae6fd", "#38bdf8", "#0284c7", "#0369a1", "#075985", "#082f49"],
    3: ["#a6f4ff", "#f0c8ff", "#d48eff", "#a850e6", "#6e28ad", "#451275", "#280a47"],
    4: ["#fffbe0", "#ffe680", "#ffd23f", "#e5a812", "#ab7305", "#734c00", "#472e00"],
}
STOPS = np.array([245, 223, 205, 170, 112, 80, 42], float)

def recolor(im, tier):
    a = np.array(im).astype(float)
    rgb = a[..., :3]; mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    L = rgb.mean(axis=2)
    metal = (a[..., 3] > 0) & (mx - mn < 48) & (rgb[..., 2] >= rgb[..., 0] - 4) & (mx > 40)
    pal = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PAL[tier]], float)
    x = np.clip(L, STOPS[-1], STOPS[0])
    out = np.zeros_like(rgb)
    for c in range(3):
        out[..., c] = np.interp(-x, -STOPS, pal[:, c])
    rgb[metal] = out[metal]; a[..., :3] = rgb
    return Image.fromarray(a.astype(np.uint8), "RGBA")

def prep(cls, f):
    if cls == "warrior": f = decape(f)
    return clean(shrink(f), SMALL.get(cls, 40), white=cls in ("druid", "berserker", "hunter"))

for cls, folder in HEROES.items():
    meta = json.load(open(os.path.join(OUT, f"{cls}-pack.json")))
    foot = meta["footY"]
    rows = []
    for kind in ("walk", "run"):
        for name in ("south", "north", "se", "ne"):
            fw = frames(os.path.join(ROOT, "scripts/art-src", folder, f"dirs2-{name}-walk.png"))
            src = fw if kind == "walk" else [fw[0]] + frames(os.path.join(ROOT, "scripts/art-src", folder, f"dirs2-{name}-run.png"))[1:]
            fr = [prep(cls, f) for f in src][:NC]
            mx, bot = body_mid(fr[0])
            dx, dy = round(64 - mx), foot - bot
            px0 = fr[0].load()                                     # topo de verdade = 1ª linha com 6+ pixels
            top0 = next(y for y in range(S) if sum(1 for x in range(S) if px0[x, y][3]) >= 6)
            if cls in CLIP_TOP or cls == "warrior":                # raios/fumaça/pluma que a IA põe acima da cabeça
                for f in fr:
                    a = f.load()
                    for y in range(max(0, top0 - (3 if kind == "walk" else 8))):
                        for x in range(S): a[x, y] = (0, 0, 0, 0)
            row = []
            for f in fr:
                c = Image.new("RGBA", (S, S))
                c.paste(f, (dx, dy), f)
                row.append(c)
            rows.append(row)
    sheet = Image.new("RGBA", (S * NC, S * len(rows)))
    for r, row in enumerate(rows):
        for k, c in enumerate(row):
            sheet.alpha_composite(c, (k * S, r * S))
    if cls == "warrior":
        for t in range(5):
            (sheet if t == 0 else recolor(sheet, t)).save(os.path.join(OUT, f"warrior-pack-t{t}-dirs.png"), optimize=True)
        print("warrior-pack-t0…t4-dirs.png", sheet.size)
        continue
    out = os.path.join(OUT, f"{cls}-pack-dirs.png")
    sheet.save(out, optimize=True)
    print(os.path.relpath(out, ROOT), sheet.size)
