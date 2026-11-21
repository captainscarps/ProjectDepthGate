"""Monta os heróis animados da tela de escolha (p216.90–92).
Entrada (scripts/art-src/selecao-hd/): <classe>-idle.png (9 quadros 256×256: 0 = pose, 1–8 = parado respirando),
<classe>-acao.png (ação especial, começa e termina na pose) e os extras x-esqueleto-idle, x-lobo-corre, x-lobo-idle,
x-urso-idle. Saída: assets/pixel-art/heroes-sel/ (alfa em degrau, sem pontinhos soltos) + manifest.json com quadros
e pé (linha mais baixa com pixel) de cada folha.
Uso: python3 scripts/build_selecao_herois.py"""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, os.environ.get("SEL_DIR", "scripts/art-src/selecao-hd")); O = os.path.join(ROOT, "assets/pixel-art/heroes-sel")
os.makedirs(O, exist_ok=True)

def legs_x(a):
    """x do meio das pernas (últimos 38% da altura do maior pedaço): não sofre com espada/arco/magia no alto"""
    op = a[..., 3] > 0
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndimage.sum(op, lab, range(1, n + 1)); op = lab == (np.argmax(sz) + 1)
    ys = np.where(op.any(1))[0]
    if not len(ys): return None
    t, b = ys[0], ys[-1]; xs = np.where(op[int(t + (b - t) * .62):b + 1])[1]
    return float(np.median(xs)) if len(xs) > 10 else None

def build(src, dst, fw, fh, align=None):
    im = Image.open(src).convert("RGBA"); n = im.width // fw
    out = Image.new("RGBA", (fw * n, fh)); foot = 0; top = fh
    ref = legs_x(np.array(Image.open(align).convert("RGBA").crop((0, 0, fw, fh)))) if align else None   # p216.97: a ação
    # não escorrega para o lado — cada quadro tem o tronco no mesmo x da pose (a IA desloca o corpo em alguns quadros)
    for i in range(n):
        a = np.array(im.crop((i * fw, 0, i * fw + fw, fh))); a[..., 3] = np.where(a[..., 3] > 90, 255, 0)
        op = a[..., 3] > 0; lab, k = ndimage.label(op, structure=np.ones((3, 3)))
        if k > 1:
            sz = ndimage.sum(op, lab, range(1, k + 1)); a[np.isin(lab, [j + 1 for j, s in enumerate(sz) if s < 6])] = 0
        ys = np.where(a[..., 3].any(1))[0]
        if len(ys): foot = max(foot, int(ys[-1]) + 1); top = min(top, int(ys[0]))
        dx = 0
        if ref is not None:
            tx = legs_x(a)
            if tx is not None: dx = int(round(ref - tx))
            if abs(dx) < 30: dx = 0        # passo/troca de base natural fica; só corrige o corpo que escorregou (Cavaleiro: 62 px)
        out.paste(Image.fromarray(a), (i * fw + dx, 0)) if dx == 0 else out.paste(Image.fromarray(a).crop((max(0, -dx), 0, fw - max(0, dx), fh)), (i * fw + max(0, dx), 0))
    out.save(dst)
    return n, foot, top

man = {"_x": {}}
for f in sorted(os.listdir(S)):
    if not f.endswith("-idle.png") or f.startswith("x-"): continue
    c = f[:-9]; fh = Image.open(os.path.join(S, f)).height
    n, foot, top = build(os.path.join(S, f), os.path.join(O, c + ".png"), fh, fh)
    man[c] = {"size": fh, "frames": n, "foot": foot, "top": top}
    a = os.path.join(S, c + "-acao.png")
    if os.path.exists(a):
        na, _, _ = build(a, os.path.join(O, c + "-acao.png"), fh, fh, align=os.path.join(O, c + ".png")); man[c]["acao"] = na
    print(c, man[c])
for key, src in [("esqueleto", "x-esqueleto-idle.png"), ("lobo-corre", "x-lobo-corre.png"), ("lobo-idle", "x-lobo-idle.png"), ("urso-idle", "x-urso-idle.png")]:
    p = os.path.join(S, src)
    if not os.path.exists(p): continue
    base = Image.open(os.path.join(S, src.replace("-idle", "").replace("-corre", "") if os.path.exists(os.path.join(S, src.replace("-idle", "").replace("-corre", ""))) else p))
    fw, fh = base.size if base.width < Image.open(p).width else (Image.open(p).height, Image.open(p).height)
    n, foot, top = build(p, os.path.join(O, "x-" + key + ".png"), fw, fh)
    man["_x"][key] = {"w": fw, "h": fh, "frames": n, "foot": foot}
    print("x", key, man["_x"][key])
json.dump(man, open(os.path.join(O, "manifest.json"), "w"), indent=1)
