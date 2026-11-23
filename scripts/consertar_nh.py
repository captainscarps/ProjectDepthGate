"""Conserta buracos nas folhas "cabeça descoberta" (<classe>-nh-body/-dirs/-sk.png) — p216.111.
A folha -nh é o mesmo herói da folha com capacete (pack-t0), só com a cabeça trocada (e capa nas costas): abaixo da
cabeça, o corpo deveria ser igual. Algumas linhas saíram com pedaços do tronco/costas faltando (o herói ficava
"cortado/transparente" ao andar com armaduras lendárias e da forja). Aqui, quadro a quadro: alinha a folha com
capacete (desloca até 3 px) e, se a pose bate (IoU ≥ 0,75), copia dela os pixels que faltam abaixo da cabeça.
Originais em scripts/art-src/nh-orig/. Uso: python3 scripts/consertar_nh.py [classe…] [--ver]"""
import os, sys, shutil
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, "assets/pixel-art/characters"); O = os.path.join(ROOT, "scripts/art-src/nh-orig")
CLS = [a for a in sys.argv[1:] if not a.startswith("--")] or ["warrior", "berserker", "archer", "hunter", "druid", "necromancer", "mage", "rogue"]
def src_t0(cls, suf):
    for f in ([f"{cls}-pack-t0{suf or '-body'}.png"] + ([f"{cls}-pack{suf}.png"] if suf else [])):
        if os.path.exists(os.path.join(C, f)): return os.path.join(C, f)
def shift(a, dx, dy):
    o = np.zeros_like(a); H, W = a.shape[:2]
    ys, yd = (slice(0, H - dy), slice(dy, H)) if dy >= 0 else (slice(-dy, H), slice(0, H + dy))
    xs, xd = (slice(0, W - dx), slice(dx, W)) if dx >= 0 else (slice(-dx, W), slice(0, W + dx))
    o[yd, xd] = a[ys, xs]; return o
def enclosed(m, d=12):
    # só buracos: pixel com corpo dos dois lados (esq+dir ou cima+baixo) — não aumenta o contorno do herói
    L = np.zeros_like(m); R = np.zeros_like(m); U = np.zeros_like(m); D = np.zeros_like(m)
    for k in range(1, d + 1):
        L[:, k:] |= m[:, :-k]; R[:, :-k] |= m[:, k:]; U[k:] |= m[:-k]; D[:-k] |= m[k:]
    return (L & R) | (U & D)
report = {}
for cls in CLS:
    for suf in ["-dirs", ""]:  # -sk fica de fora: os golpes têm efeitos que não batem entre as folhas
        nf = os.path.join(C, f"{cls}-nh{suf or '-body'}.png"); tf = src_t0(cls, suf)
        if not os.path.exists(nf) or not tf: continue
        bk = os.path.join(O, os.path.basename(nf))
        if not os.path.exists(bk): shutil.copy(nf, bk)
        A = np.array(Image.open(bk).convert("RGBA")); B = np.array(Image.open(tf).convert("RGBA"))
        H = min(A.shape[0], B.shape[0]); W = min(A.shape[1], B.shape[1]); out = A.copy(); fixed = 0; frames = 0
        for r in range(H // 128):
            for c in range(W // 128):
                a = A[r*128:(r+1)*128, c*128:(c+1)*128]; b = B[r*128:(r+1)*128, c*128:(c+1)*128]
                am, bm = a[..., 3] > 128, b[..., 3] > 128
                if bm.sum() < 60 or am.sum() < 60: continue
                ys = np.where(bm.any(1))[0]; lim = ys[0] + int((ys[-1] - ys[0]) * .24)
                best = (-1, 0, 0)
                for dy in range(-3, 4):
                    for dx in range(-3, 4):
                        s = shift(bm, dx, dy); u = (s | am)[lim:].sum(); iou = (s & am)[lim:].sum() / max(1, u)
                        best = max(best, (iou, dx, dy))
                iou, dx, dy = best
                if iou < .75: continue
                bs = shift(b, dx, dy); need = (bs[..., 3] > 128) & ~am & enclosed(am); need[:lim + dy] = False; need[ys[0] + int((ys[-1] - ys[0]) * .68) + dy:] = False  # pernas ficam como estão
                n = int(need.sum())
                if n < 6: continue
                blk = out[r*128:(r+1)*128, c*128:(c+1)*128]; blk[need] = bs[need]; fixed += n; frames += 1
        Image.fromarray(out).save(nf, optimize=True)
        report[f"{cls}{suf or '-body'}"] = (frames, fixed)
        print(cls, suf or "-body", "quadros:", frames, "pixels:", fixed, flush=True)

# --- 2ª passada: quadros cuja pose NÃO bate com a folha com capacete (ex.: andar de lado) e que perderam um pedaço
# do tronco. Fecha os vãos horizontais curtos dentro da faixa do tronco com a cor vizinha escurecida (sombra da capa).
def fill_gaps(blk, lim, bot, maxrun=16):
    a = blk[..., 3] > 128; n = 0; src = blk.copy()
    for y in range(lim, bot):
        xs = np.where(a[y])[0]
        if len(xs) < 2: continue
        for i in range(len(xs) - 1):
            x0, x1 = xs[i], xs[i + 1]
            if 1 < x1 - x0 <= maxrun:
                up = a[max(0, y - 46):y, x0 + 1:x1].any(0).mean(); dn = a[y + 1:y + 47, x0 + 1:x1].any(0).mean()
                if up < .6 or dn < .6: continue
                L = src[y, x0, :3].astype(int); R = src[y, x1, :3].astype(int)
                for x in range(x0 + 1, x1):
                    t = (x - x0) / (x1 - x0); c = (L * (1 - t) + R * t) * .22 + np.array([44, 31, 30]) * (.78 - .12 * abs(t - .5))  # sombra de capa
                    blk[y, x, :3] = c.clip(0, 255); blk[y, x, 3] = 255; n += 1
    return n
for cls in CLS:
    for suf in ["-dirs"]:  # só as folhas de andar em 8 direções
        nf = os.path.join(C, f"{cls}-nh{suf or '-body'}.png"); tf = src_t0(cls, suf)
        if not os.path.exists(nf) or not tf: continue
        A = np.array(Image.open(nf).convert("RGBA")); B = np.array(Image.open(tf).convert("RGBA")); tot = 0; fr = 0
        for r in range(min(A.shape[0], B.shape[0]) // 128):
            for c in range(min(A.shape[1], B.shape[1]) // 128):
                blk = A[r*128:(r+1)*128, c*128:(c+1)*128]; b = B[r*128:(r+1)*128, c*128:(c+1)*128]
                am, bm = blk[..., 3] > 128, b[..., 3] > 128
                if am.sum() < 60 or bm.sum() < 60 or am.sum() > .86 * bm.sum(): continue
                ys = np.where(am.any(1))[0]; h = ys[-1] - ys[0]
                n = fill_gaps(blk, ys[0] + int(h * .15), ys[0] + int(h * .64))
                if n:  # fecha as frestas finas que sobraram entre as faixas preenchidas (até 4 px na vertical)
                    for _ in range(2):
                        a2 = blk[..., 3] > 128
                        for y in range(ys[0] + int(h * .15), ys[0] + int(h * .64)):
                            for x in np.where(~a2[y])[0]:
                                up = [k for k in range(1, 5) if a2[y - k, x]]; dn = [k for k in range(1, 5) if y + k < 128 and a2[y + k, x]]
                                lf = a2[y, max(0, x - 16):x].any(); rt = a2[y, x + 1:x + 17].any()
                                if up and dn and lf and rt:
                                    blk[y, x, :3] = (blk[y - up[0], x, :3].astype(int) + blk[y + dn[0], x, :3]) // 2; blk[y, x, 3] = 255; n += 1
                if n: tot += n; fr += 1
        if tot:
            Image.fromarray(A).save(nf, optimize=True); print("vãos", cls, suf or "-body", fr, tot, flush=True)
