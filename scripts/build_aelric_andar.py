"""Monta as folhas de caminhada do Aelric jovem em todas as direções (p216.137) a partir de scripts/art-src/aelric-jovem/
(gerar_aelric_andar.py). Escala e pés iguais ao aelric-young-walk.png antigo (mesmo tamanho no mapa).
Saída: assets/pixel-art/valdrak/aelric-young-w-<e|s|n|se|ne>.png — quadros 128×128; quadro 0 = parado na direção,
1…N = passos. Oeste/noroeste/sudoeste: o jogo espelha leste/nordeste/sudeste. O perfil antigo fica em
scripts/art-src/aelric-jovem/walk-antigo.png."""
import os, shutil
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/aelric-jovem"); O = os.path.join(ROOT, "assets/pixel-art/valdrak"); F = 128
def bbox(im):
    a = np.array(im)[..., 3] > 40; ys, xs = np.where(a); return xs.min(), ys.min(), xs.max(), ys.max()
old = Image.open(os.path.join(O, "aelric-young-walk.png")).convert("RGBA")
ob = [bbox(old.crop((i * F, 0, i * F + F, F))) for i in range(old.width // F)]
oh = np.median([b[3] - b[1] for b in ob]); ofeet = int(np.median([b[3] for b in ob])); ocx = np.median([(b[0] + b[2]) / 2 for b in ob])
ref = Image.open(os.path.join(S, "walk-east.png")).convert("RGBA")
rb = [bbox(ref.crop((i * F, 0, i * F + F, F))) for i in range(ref.width // F)]
k = oh / np.median([b[3] - b[1] for b in rb])
print("escala", round(k, 3), "pés", ofeet)
for d, tag in [("east", "e"), ("south", "s"), ("north", "n"), ("south-east", "se"), ("north-east", "ne")]:
    st = Image.open(os.path.join(S, f"walk-{d}.png")).convert("RGBA"); n = st.width // F
    fr = [Image.open(os.path.join(S, f"pose-{d}.png")).convert("RGBA")] + [st.crop((i * F, 0, i * F + F, F)) for i in range(1, n)]
    feet = int(np.median([bbox(f)[3] for f in fr])); cx = np.median([(bbox(f)[0] + bbox(f)[2]) / 2 for f in fr])
    out = Image.new("RGBA", (F * len(fr), F))
    for i, f in enumerate(fr):
        g = f.resize((round(F * k), round(F * k)), Image.NEAREST)
        # pés no mesmo y do antigo; centro horizontal do quadro igual ao do antigo
        ox = round(ocx - cx * k); oy = round(ofeet - feet * k)
        out.alpha_composite(g, (i * F + ox, oy)) if 0 <= ox and ox + g.width <= F else out.paste(g.crop((max(0, -ox), max(0, -oy), max(0, -ox) + min(F, g.width), max(0, -oy) + min(F, g.height))), (i * F + max(0, ox), max(0, oy)))
    out.save(os.path.join(O, f"aelric-young-w-{tag}.png"), optimize=True); print(tag, len(fr))
