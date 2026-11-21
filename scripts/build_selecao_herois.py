"""Monta os heróis animados da tela de escolha (p216.90).
Entrada: scripts/art-src/selecao-hd/<classe>-idle.png (tira de 9 quadros de 256×256 — p216.91; a 1ª versão 144×144 fica em selecao/: 0 = pose, 1–8 = parado respirando).
Saída: assets/pixel-art/heroes-sel/<classe>.png (mesma tira, alfa em degrau, sem pontinhos soltos) e manifest.json
com o pé de cada herói (linha mais baixa com pixel em todos os quadros) para alinhar na sombra do palco.
Uso: python3 scripts/build_selecao_herois.py"""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, os.environ.get("SEL_DIR", "scripts/art-src/selecao-hd")); O = os.path.join(ROOT, "assets/pixel-art/heroes-sel")
os.makedirs(O, exist_ok=True)
man = {}
for f in sorted(os.listdir(S)):
    if not f.endswith("-idle.png"): continue
    c = f[:-9]; im = Image.open(os.path.join(S, f)).convert("RGBA"); fh = im.height; n = im.width // fh
    out = Image.new("RGBA", im.size); foot = 0; top = fh
    for i in range(n):
        a = np.array(im.crop((i * fh, 0, i * fh + fh, fh))); a[..., 3] = np.where(a[..., 3] > 90, 255, 0)
        op = a[..., 3] > 0; lab, k = ndimage.label(op, structure=np.ones((3, 3)))
        if k > 1:
            sz = ndimage.sum(op, lab, range(1, k + 1)); a[np.isin(lab, [j + 1 for j, s in enumerate(sz) if s < 6])] = 0
        ys = np.where(a[..., 3].any(1))[0]
        if len(ys): foot = max(foot, int(ys[-1]) + 1); top = min(top, int(ys[0]))
        out.paste(Image.fromarray(a), (i * fh, 0))
    out.save(os.path.join(O, c + ".png"))
    man[c] = {"size": fh, "frames": n, "foot": foot, "top": top}
    print(c, man[c])
json.dump(man, open(os.path.join(O, "manifest.json"), "w"), indent=1)
