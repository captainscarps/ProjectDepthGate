#!/usr/bin/env python3
"""Tapa buracos transparentes nas folhas dos heróis refeitos (p216.54b).
A remoção de fundo da IA (PixelLab no_background) às vezes apaga pedaços escuros DENTRO do herói — sombra entre o
escudo e a perna, couraça escura de costas, dobras do manto — e o chão aparece através dele. Para cada quadro:
  • fecha o contorno do herói (fechamento morfológico de raio R) e preenche os buracos fechados;
  • cada pixel transparente dentro desse contorno, em um pedaço transparente pequeno (≤ MAXA px) e rodeado de
    pixels escuros (≥ 60% com o canal mais forte < DARK), recebe a cor mais
    escura dos vizinhos opacos (fica como sombra; é uma cor que já existe na folha, então as pinturas de armadura
    continuam funcionando).
Vãos de verdade (entre as pernas, entre o braço e o corpo, maiores que ~2R px) continuam abertos.
Uso: python3 scripts/fix_buracos_herois.py [arquivos…]   (sem argumentos: todas as folhas dos heróis refeitos)
Rodar depois de qualquer build_* que regrave essas folhas."""
import glob, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "assets/pixel-art/characters")
R, MAXA, DARK = 2, 25, 80
CLS = ["warrior"]          # os outros heróis: os vãos pequenos são de verdade (besta, orbe, arco) — passar o arquivo à mão se precisar

def fix_frame(a, R=R, DARK=DARK, MAXA=MAXA, YMAX=None):
    op = a[..., 3] > 0
    if op.sum() < 150: return 0
    P = R + 2
    hull = ndimage.binary_fill_holes(ndimage.binary_closing(np.pad(op, P), structure=np.ones((3, 3)), iterations=R))[P:-P, P:-P]
    gap = hull & ~op
    if not gap.any(): return 0
    lab, n = ndimage.label(gap)
    sz = ndimage.sum(gap, lab, range(1, n + 1))
    # só buracos rodeados de escuro (a remoção de fundo comeu sombra/armadura escura); vãos rodeados de cor clara ou
    # média (corda da besta, anel do orbe, faísca, entre braço e corpo) são de verdade e ficam
    dark = op & (a[..., :3].max(axis=2) < DARK)
    keep = []
    for i, sv in enumerate(sz):
        if sv > MAXA: continue
        comp = lab == i + 1
        ring = ndimage.binary_dilation(comp, structure=np.ones((3, 3))) & op
        if ring.sum() and dark[ring].mean() >= .6: keep.append(i + 1)
    gap &= np.isin(lab, keep)
    if YMAX: gap[YMAX:] = False                            # não fecha o vão entre as pernas
    filled = 0
    lum = a[..., :3].astype(int).sum(axis=2)
    for _ in range(12):                                   # de fora para dentro
        if not gap.any(): break
        ys, xs = np.nonzero(gap & ndimage.binary_dilation(op, structure=np.ones((3, 3))))
        if not len(ys): break
        new = []
        for y, x in zip(ys, xs):
            y0, y1, x0, x1 = max(0, y - 1), y + 2, max(0, x - 1), x + 2
            m = op[y0:y1, x0:x1]
            if not m.any(): continue
            L = np.where(m, lum[y0:y1, x0:x1], 10 ** 6); k = np.unravel_index(np.argmin(L), L.shape)
            new.append((y, x, a[y0 + k[0], x0 + k[1]].copy()))
        for y, x, c in new:
            a[y, x] = c; a[y, x, 3] = 255; op[y, x] = True; gap[y, x] = False; lum[y, x] = int(c[:3].astype(int).sum()); filled += 1
    return filled

# quadros com buraco grande aberto para fora (o filtro geral não pega): tapados sem a regra do escuro
FORTE = {"warrior-pack-t0-dirs.png": [9, 45], "warrior-pack-t1-dirs.png": [9, 45], "warrior-pack-t2-dirs.png": [9, 45],
         "warrior-pack-t3-dirs.png": [9, 45], "warrior-pack-t4-dirs.png": [9, 45]}

def fix_file(path):
    S = 208 if path.endswith("-fish.png") else 128
    im = Image.open(path); a = np.array(im.convert("RGBA"))
    if a.shape[0] % S or a.shape[1] % S: return 0
    tot = 0
    for r in range(a.shape[0] // S):
        for c in range(a.shape[1] // S):
            fr = a[r * S:(r + 1) * S, c * S:(c + 1) * S]
            if r * (a.shape[1] // S) + c in FORTE.get(os.path.basename(path), ()): tot += fix_frame(fr, 7, 256, 400, 86)
            tot += fix_frame(fr)
    if tot: Image.fromarray(a, "RGBA").save(path, optimize=True)
    return tot

if __name__ == "__main__":
    files = sys.argv[1:]
    if not files:
        for c in CLS:
            files += glob.glob(os.path.join(CH, f"{c}-*.png"))
        files = [f for f in files if "-glow" not in f and not os.path.basename(f).startswith(("javali", "lobisomem")) and not any(x in f for x in ("-javali", "-lobisomem"))]
    for f in sorted(files):
        n = fix_file(f)
        if n: print(os.path.relpath(f, ROOT), n, "px")
