"""
Arqueiro élfico — monta a folha "pack" (39 quadros 128x128) a partir da folha do elfo
(uma imagem com 5 fileiras: parado, andando, correndo, morte, ataque + flecha).

O herói é desenhado em RESOLUÇÃO DOBRADA (≈94 px de altura no quadro; o jogo
mostra em escala 0,5 → mesmo tamanho dos outros heróis, 2x mais definição).
Para ficar próximo dos heróis existentes: paleta reduzida (cores chapadas,
sem degradê de redimensionamento), contorno escuro e leve reforço de contraste.

Uso: python3 scripts/build_elf_archer.py <folha.png>
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
        os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
SRC = sys.argv[1]
FOOT, CX = 119, 62
TARGET_H = 94             # altura do elfo parado no quadro (2x a dos outros heróis)
HIRES = 68 / TARGET_H     # fator para telas que usam escala fixa (portrait, seleção…)
ORDER = ["idle0", "idle1", "idle2", "idle3", "idlevar0", "idlevar1", "walk0", "walk1", "walk2", "walk3", "walk4", "walk5",
         "run0", "run1", "run2", "run3", "run4", "run5", "windupA", "windup", "hitA", "hit", "recovery", "guardStart", "guard",
         "hurt", "hurtB", "stunA", "stunB", "dashA", "dash", "castA", "cast", "castC", "deathA", "deathB", "deathC", "upA", "upB"]

a = np.array(Image.open(SRC).convert("RGBA"))
a[a[..., 3] < 100] = 0
a[..., 3] = np.where(a[..., 3] > 0, 255, 0)
m = a[..., 3] > 0
rows = m.any(1)
bands, s = [], None
for y, v in enumerate(rows):
    if v and s is None:
        s = y
    if not v and s is not None:
        if y - s > 20:
            bands.append((s, y))
        s = None
assert len(bands) == 5, bands

FR = []        # por fileira: lista de (máscara recortada RGBA, bbox global)
for (y0, y1) in bands:
    sub = a[y0:y1]
    lab, n = ndimage.label(sub[..., 3] > 0, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1))
    big = [i + 1 for i, sz in enumerate(sizes) if sz > 1500]
    cent = {i: ndimage.center_of_mass(lab == i)[1] for i in big}
    owner = np.zeros(n + 1, int)
    for i in range(1, n + 1):
        if i in big:
            owner[i] = i
        else:   # pedacinhos soltos → figura mais próxima (a flecha solta fica de fora)
            sl = ndimage.find_objects((lab == i).astype(int))[0]
            hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
            if ww > 3 * hh and ww > 60:
                continue
            cx = ndimage.center_of_mass(lab == i)[1]
            owner[i] = min(big, key=lambda b: abs(cent[b] - cx))
    lab2 = owner[lab]
    figs = []
    for b in sorted(big, key=lambda b: cent[b]):
        mk = lab2 == b
        ys, xs = np.nonzero(mk)
        img = np.zeros_like(sub)
        img[mk] = sub[mk]
        figs.append(Image.fromarray(img[ys.min():ys.max() + 1, xs.min():xs.max() + 1]))
    FR.append(figs)
print("quadros por fileira:", [len(f) for f in FR])
idle, walk, run, death, atk = FR
ATK = atk[:5]

# a flecha (pequena) da última fileira → projétil
sub = a[bands[4][0]:bands[4][1]]
lab, n = ndimage.label(sub[..., 3] > 0, structure=np.ones((3, 3)))
for sl in ndimage.find_objects(lab):
    h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
    if w > 3 * h and w > 60:
        arrow = Image.fromarray(sub[sl])
        break

S = TARGET_H / idle[0].height

# paleta comum (cores chapadas), montada de todos os quadros já reduzidos
def shrink(f):
    w, h = max(1, round(f.width * S)), max(1, round(f.height * S))
    q = np.asarray(f.resize((w, h), Image.LANCZOS)).copy()
    q[..., 3] = np.where(q[..., 3] >= 120, 255, 0)
    im = Image.fromarray(q)
    rgb = ImageEnhance.Contrast(im.convert("RGB")).enhance(1.12)
    rgb = ImageEnhance.Color(rgb).enhance(1.08)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1, percent=60, threshold=2))
    out = rgb.convert("RGBA")
    out.putalpha(im.getchannel("A"))
    return out


ALL = [f for row in FR for f in row]
small = {id(f): shrink(f) for f in ALL}
atlas_w = sum(v.width for v in small.values())
atlas = Image.new("RGB", (atlas_w, max(v.height for v in small.values())), (0, 0, 0))
x = 0
for v in small.values():
    atlas.paste(v.convert("RGB"), (x, 0), v)
    x += v.width
PAL = atlas.quantize(colors=56, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
OUTLINE = (24, 18, 14, 255)


def stylize(f):
    v = small[id(f)]
    q = v.convert("RGB").quantize(palette=PAL, dither=Image.Dither.NONE).convert("RGBA")
    q.putalpha(v.getchannel("A"))
    arr = np.asarray(q).copy()
    al = arr[..., 3] > 0
    pad = np.pad(al, 1)
    ring = ndimage.binary_dilation(pad) & ~pad
    out = np.zeros((arr.shape[0] + 2, arr.shape[1] + 2, 4), np.uint8)
    out[1:-1, 1:-1] = arr
    out[ring] = OUTLINE
    return Image.fromarray(out)


def body_x(img):
    """centro do corpo: centro de massa da metade de baixo (pernas), robusto a capa/arco"""
    al = np.asarray(img)[..., 3] > 0
    h = al.shape[0]
    ys, xs = np.nonzero(al[int(h * .45):])
    return float(np.median(xs)) if len(xs) else img.width / 2


def place(f, ref_x=None):
    st = stylize(f)
    bx = body_x(st) if ref_x is None else ref_x
    out = Image.new("RGBA", (128, 128))
    out.alpha_composite(st, (round(CX - bx), FOOT - st.height + 1))
    return out


pick = {
    "idle0": idle[0], "idle1": idle[2], "idle2": idle[4], "idle3": idle[6], "idlevar0": idle[1], "idlevar1": idle[5],
    **{f"walk{i}": walk[c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    **{f"run{i}": run[c] for i, c in enumerate([0, 1, 3, 4, 5, 7])},
    "windupA": ATK[1], "windup": ATK[2], "hitA": ATK[3], "hit": ATK[4], "recovery": ATK[1],
    "guardStart": ATK[1], "guard": ATK[2],
    "hurt": death[0], "hurtB": death[1], "stunA": death[1], "stunB": death[2],
    "dashA": run[2], "dash": run[6],
    "castA": ATK[2], "cast": ATK[3], "castC": ATK[4],
    "deathA": death[3], "deathB": death[4], "deathC": death[6],
    "upA": death[2], "upB": idle[0],
}
# ataque e morte: usa o mesmo centro do quadro parado para não "pular"
ref_atk = body_x(stylize(ATK[0]))
frames = []
for k in ORDER:
    f = pick[k]
    if k.startswith(("windup", "hit", "recovery", "guard", "cast")):
        frames.append(place(f, ref_atk))
    elif k.startswith("death"):
        st = stylize(f)
        out = Image.new("RGBA", (128, 128))
        out.alpha_composite(st, (max(0, CX - st.width // 2), FOOT - st.height + 1))
        frames.append(out)
    else:
        frames.append(place(f))

top = min(fr.getbbox()[1] for fr in frames[:4])
h = FOOT - top
n = len(frames)
# cabeça (para o retrato do HUD): caixa 22x22 da arte normal → aqui 22/HIRES
hb = round(22 / HIRES)
hx = CX - hb // 2 + 4
upd = {"scale": round(.69 * 68 / h, 3), "footY": FOOT, "hires": round(HIRES, 3),
       "pcrop": [hx, top - 1, hb, hb],
       "anchors": [[CX + 24, top + int(h * .42)]] * n, "torso": [[CX, top + int(h * .5)]] * n,
       "head": [[CX + 3, top + int(h * .12)]] * n}
sheet = Image.new("RGBA", (128 * n, 128))
for i, f in enumerate(frames):
    sheet.alpha_composite(f, (i * 128, 0))
for o in OUTS:
    if not os.path.isdir(o):
        continue
    sheet.save(os.path.join(o, "archer-pack-body.png"))
    for t in range(5):
        sheet.save(os.path.join(o, f"archer-pack-t{t}-body.png"))
    jp = os.path.join(o, "archer-pack.json")
    if os.path.exists(jp):
        lay = json.load(open(jp))
        lay.update(upd)
        json.dump(lay, open(jp, "w"), separators=(",", ":"))
# projétil: flecha verde do pacote (mesma escala)
_bb = arrow.getbbox(); arrow = arrow.crop(_bb); _k = 18 / arrow.width
ar = arrow.resize((18, max(3, round(arrow.height * _k))), Image.LANCZOS)
q = np.asarray(ar).copy(); q[..., 3] = np.where(q[..., 3] >= 110, 255, 0)
Image.fromarray(q).save(os.path.join(ROOT, "assets", "pixel-art", "characters", "proj-elf-arrow.png"))
sheet.resize((sheet.width // 2, 64), Image.NEAREST).save(os.path.join(ROOT, "scripts", "elf_archer_preview.png"))
print("arqueiro élfico: altura", h, "escala", upd["scale"], "hires", upd["hires"])
