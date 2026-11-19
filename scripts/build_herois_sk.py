#!/usr/bin/env python3
"""Folhas extras de golpe e habilidades dos heróis refeitos (menos o Guerreiro, que sai de build_cavaleiro_pixellab.py):
<pacote>-pack-sk.png (8 colunas, uma linha por animação) + "sk" no <pacote>-pack.json, lidos por
scripts/source/herois-skills.js. Linha "atk" = golpe básico fluido, "cast" = magia genérica, o resto = uma por
habilidade (scripts/art-src/<pasta>/sk-<nome>.png, PixelLab; o quadro 0 de cada fonte é a imagem de entrada).
O alinhamento copia o do pacote: a pose parada reduzida é encaixada no quadro 0 da folha de perfil.
Quadros em que a IA pintou o corpo todo de uma cor (brilho de magia) são trocados pelo quadro anterior."""
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, "scripts/art-src")
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
S, F = 128, 192
EIGHT = [2, 3, 4, 5, 6, 7, 8, 8]
#        pacote: (pasta, (arquivo parado, quadro), linhas {nome: (arquivo, quadros)})
HEROES = {
    "archer": ("arqueiro", ("idle", 1), {"atk": ("attack", EIGHT), "cast": ("cast", EIGHT), "multi": ("sk-multi", EIGHT),
               "charge": ("sk-charge", EIGHT), "repulse": ("sk-repulse", EIGHT), "fence": ("sk-fence", EIGHT)}),
    "mage": ("maga", ("idle", 1), {"atk": ("attack", EIGHT), "cast": ("cast", [2, 3, 4, 5, 6, 8, 8, 8]), "bolt": ("sk-bolt", EIGHT),
             "nova": ("sk-nova", EIGHT), "ice": ("sk-ice", EIGHT)}),
    "necromancer": ("necromante", ("idle", 1), {"atk": ("attack", EIGHT), "cast": ("cast", EIGHT), "summon": ("sk-summon", EIGHT),
                    "reap": ("sk-reap", EIGHT), "armor": ("sk-armor", EIGHT)}),
    "druid": ("druida", ("druid-idle", 0), {"atk": ("attack", EIGHT), "cast": ("cast", EIGHT), "roots": ("sk-roots", EIGHT),
              "call": ("sk-call", EIGHT), "howl": ("sk-howl", EIGHT)}),
    "shaman": ("arai", ("arai-idle", 0), {"atk": ("arai-attack", [1, 1, 2, 2, 2, 2, 1, 0]), "cast": ("sk-spirit", EIGHT),
               "roots": ("sk-roots", EIGHT), "darts": ("sk-darts", EIGHT), "dance": ("sk-dance", EIGHT),
               "claw": ("sk-claw", EIGHT)}),
}

TINT = {"druid": 28}                                  # o verde-limão da magia fica perto do verde do manto

def frames(folder, name):
    im = Image.open(os.path.join(ART, folder, f"{name}.png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

def shrink(fr):
    a = np.array(fr.resize((S, S), Image.LANCZOS, reducing_gap=None))
    a[..., 3] = np.where(a[..., 3] >= 110, 255, 0); a[a[..., 3] == 0] = 0
    return Image.fromarray(a, "RGBA")

def bbox(im):
    ys, xs = np.nonzero(np.array(im)[..., 3] > 0)
    return xs.min(), ys.max()

def mean_col(im):
    a = np.array(im).astype(float); m = a[..., 3] > 0
    return a[..., :3][m].mean(axis=0) if m.any() else np.zeros(3)

for pack, (folder, (idle, fi), rows) in HEROES.items():
    sheet0 = Image.open(os.path.join(OUT, f"{pack}-pack-t0-body.png")).convert("RGBA").crop((0, 0, S, S))
    ref = shrink(frames(folder, idle)[fi])
    (px, pb), (rx, rb) = bbox(sheet0), bbox(ref)
    dx, dy = int(px - rx), int(pb - rb)
    base = mean_col(ref)
    out = Image.new("RGBA", (S * 8, S * len(rows)))
    for r, (key, (src, idx)) in enumerate(rows.items()):
        fr = frames(folder, src)
        prev = ref
        for k, i in enumerate(idx):
            f = shrink(fr[min(i, len(fr) - 1)])
            if np.abs(mean_col(f) - base).max() > TINT.get(pack, 40):        # corpo todo tingido: repete o anterior
                f = prev
            prev = f
            c = Image.new("RGBA", (S, S)); c.paste(f, (dx, dy), f)
            out.alpha_composite(c, (k * S, r * S))
    name = f"{pack}-pack-sk.png"
    out.save(os.path.join(OUT, name), optimize=True)
    jp = os.path.join(OUT, f"{pack}-pack.json")
    meta = json.load(open(jp))
    meta["sk"] = {"cols": 8, "rows": {k: r for r, k in enumerate(rows)}, "f": name}
    json.dump(meta, open(jp, "w"), separators=(",", ":"))
    print(pack, "dx,dy", dx, dy, out.size)
