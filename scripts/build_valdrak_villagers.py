"""
Moradores da Valdrak antiga: variações dos NPCs que o jogo já tem (camponeses, elfas e o menino), com outra
cor de cabelo, de roupa e de tom de pele. Cada variação guarda só duas fileiras de 128 px:
  linha 0 = parado, linha 1 = andando (ou falando, para quem não anda).
Saída: assets/pixel-art/valdrak/npc/<base>-<n>.png e villagers.json {chave: {idle, move, walk}}
Uso: python3 scripts/build_valdrak_villagers.py [pasta do pacote "Peasants" da craftpix]
(com o pacote: mais 3 camponeses — rapaz, camponesa e lavrador com a enxada — e suas variações)
"""
import colorsys, json, os, random
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "pixel-art", "npc"); OUT = os.path.join(ROOT, "assets", "pixel-art", "valdrak", "npc"); os.makedirs(OUT, exist_ok=True)
rnd = random.Random(5)
# base: (arquivo, linha parado, linha andando/falando, anda?, altura do quadro, quantas variações)
BASES = {
    "peasant-2": ("peasant-2", 0, 2, True, 128, 4),   # mulher de saia
    "peasant-3": ("peasant-3", 0, 1, True, 128, 5),   # homem de colete
    "peasant-4": ("peasant-4", 0, 3, False, 128, 3),  # homem de avental (fica parado conversando)
    "elf-1": ("elf-1", 0, 2, True, 128, 3),
    "elf-2": ("elf-2", 0, 2, True, 128, 4),
    "elf-3": ("elf-3", 0, 2, True, 128, 4),
    "menino": ("menino", 0, 1, True, 77, 4),
}
HAIR = [("preto", 0.07, .25, .45), ("castanho", .07, .55, .8), ("loiro", .12, .55, 1.35), ("ruivo", .03, .78, 1.0), ("grisalho", .08, .06, 1.25), ("castanho-claro", .08, .5, 1.05)]
SKIN = [1.0, .82, .64, .5]   # fator de luminosidade da pele (claro → escuro)

def classify(fr):
    a = fr[:, :, 3] > 0
    if not a.any(): return None
    ys = np.nonzero(a.any(1))[0]; top, bot = ys[0], ys[-1]; hgt = max(1, bot - top)
    rgb = fr[:, :, :3].astype(np.float32) / 255
    mx, mn = rgb.max(2), rgb.min(2); v = mx; s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    hue = np.zeros_like(v); d = np.maximum(mx - mn, 1e-6)
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    rel = (np.arange(fr.shape[0])[:, None] - top) / hgt
    outline = v < .16
    skin = a & ~outline & (hue > .02) & (hue < .11) & (s > .18) & (s < .62) & (v > .5)
    hair = a & ~outline & ~skin & (rel < .24)
    cloth = a & ~outline & ~skin & ~hair & (rel > .26) & (rel < .9) & (s > .12)
    return dict(skin=skin, hair=hair, cloth=cloth, hue=hue, s=s, v=v)

def recolor(fr, hair, skin_k, cloth_shift, cloth_sat):
    c = classify(fr)
    if c is None: return fr
    out = fr.copy().astype(np.float32)
    def set_hsv(mask, h, s, v):
        idx = np.nonzero(mask)
        for yy, xx in zip(*idx):
            rr, gg, bb = colorsys.hsv_to_rgb(h[yy, xx] % 1, min(1, max(0, s[yy, xx])), min(1, max(0, v[yy, xx])))
            out[yy, xx, :3] = (rr * 255, gg * 255, bb * 255)
    _, hh, hs, hv = hair
    m = c["hair"]; set_hsv(m, np.full_like(c["hue"], hh), np.minimum(1, c["s"] * 0 + hs * (0.6 + c["v"] * .6)), c["v"] * hv)
    m = c["skin"]; set_hsv(m, c["hue"], c["s"] * (1 + (1 - skin_k) * .35), c["v"] * skin_k)
    m = c["cloth"]; set_hsv(m, c["hue"] + cloth_shift, c["s"] * cloth_sat, c["v"])
    return np.clip(out, 0, 255).astype(np.uint8)

meta = {}
for base, (f, ri, rm, walks, fh, nv) in BASES.items():
    im = np.array(Image.open(os.path.join(SRC, f + ".png")).convert("RGBA"))
    fw = 64 if base == "menino" else 128; cols = im.shape[1] // fw
    def row(r):
        frames = [im[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] for c in range(cols)]
        return [x for x in frames if x[:, :, 3].max() > 0]
    idle, move = row(ri), row(rm)
    for n in range(nv):
        hair = HAIR[(n * 2 + len(base)) % len(HAIR)] if n else HAIR[rnd.randrange(len(HAIR))]
        skin_k = SKIN[(n + len(base)) % len(SKIN)]
        shift, sat = rnd.uniform(.08, .92), rnd.uniform(.7, 1.2)
        sheet = Image.new("RGBA", (fw * max(len(idle), len(move)), fh * 2))
        for i, fr in enumerate(idle): sheet.paste(Image.fromarray(recolor(fr, hair, skin_k, shift, sat)), (i * fw, 0))
        for i, fr in enumerate(move): sheet.paste(Image.fromarray(recolor(fr, hair, skin_k, shift, sat)), (i * fw, fh))
        key = f"{base}-{n}"; sheet.save(os.path.join(OUT, key + ".png"), optimize=True)
        meta[key] = {"idle": len(idle), "move": len(move), "walk": walks, "cols": sheet.width // fw, "fw": fw, "fh": fh, "kid": base == "menino"}
# pacote "Peasants" (craftpix): faixas Idle.png / Walk.png por personagem
import sys
if len(sys.argv) > 1:
    PK = sys.argv[1]
    for base, folder, nv in (("camp-rapaz", "Peasants_1", 4), ("camp-moca", "Peasants_2", 4), ("camp-lavrador", "Peasants_3", 4)):
        strip = lambda n: [x for x in (lambda a: [a[:, c * 128:(c + 1) * 128] for c in range(a.shape[1] // 128)])(np.array(Image.open(os.path.join(PK, folder, n + ".png")).convert("RGBA"))) if x[:, :, 3].max() > 0]
        idle, move = strip("Idle"), strip("Walk")
        for n in range(nv):
            hair = HAIR[(n * 3 + len(base)) % len(HAIR)]; skin_k = 1.0 if base == "camp-moca" else SKIN[(n * 3 + len(folder)) % len(SKIN)]   # a blusa bege da camponesa parece pele para o filtro: não mexe no tom
            shift, sat = (0.0, 1.0) if n == 0 else (rnd.uniform(.1, .9), rnd.uniform(.75, 1.15))
            sheet = Image.new("RGBA", (128 * max(len(idle), len(move)), 256))
            for i, fr in enumerate(idle): sheet.paste(Image.fromarray(fr if n == 0 else recolor(fr, hair, skin_k, shift, sat)), (i * 128, 0))
            for i, fr in enumerate(move): sheet.paste(Image.fromarray(fr if n == 0 else recolor(fr, hair, skin_k, shift, sat)), (i * 128, 128))
            key = f"{base}-{n}"; sheet.save(os.path.join(OUT, key + ".png"), optimize=True)
            meta[key] = {"idle": len(idle), "move": len(move), "walk": True, "cols": sheet.width // 128, "fw": 128, "fh": 128, "kid": False, "farm": base == "camp-lavrador"}
# personagens da história com visual próprio (não entram na multidão)
SPECIAL = {"bram": ("peasant-4", 0, 3, ("grisalho", .08, .06, 1.3), 1.0, 0.0, .75)}
for key, (f, ri, rm, hair, skin_k, shift, sat) in SPECIAL.items():
    im = np.array(Image.open(os.path.join(SRC, f + ".png")).convert("RGBA")); fh = 128
    rowf = lambda r: [x for x in (im[r * fh:(r + 1) * fh, c * 128:(c + 1) * 128] for c in range(im.shape[1] // 128)) if x[:, :, 3].max() > 0]
    idle, move = rowf(ri), rowf(rm); sheet = Image.new("RGBA", (128 * max(len(idle), len(move)), fh * 2))
    for i, fr in enumerate(idle): sheet.paste(Image.fromarray(recolor(fr, hair, skin_k, shift, sat)), (i * 128, 0))
    for i, fr in enumerate(move): sheet.paste(Image.fromarray(recolor(fr, hair, skin_k, shift, sat)), (i * 128, fh))
    sheet.save(os.path.join(OUT, key + ".png"), optimize=True)
    meta[key] = {"idle": len(idle), "move": len(move), "walk": False, "cols": sheet.width // 128, "fw": 128, "fh": fh, "kid": False, "special": True}
json.dump(meta, open(os.path.join(OUT, "villagers.json"), "w"), indent=1)
# prévia
keys = list(meta); P = Image.new("RGBA", (len(keys) * 64, 80), (110, 140, 90, 255))
for i, k in enumerate(keys):
    s = Image.open(os.path.join(OUT, k + ".png")); fw = meta[k]["fw"]; P.alpha_composite(s.crop((0, 0, fw, meta[k]["fh"])).resize((64 * fw // 128, int(64 * meta[k]["fh"] / 128))), (i * 64, 0))
P.resize((P.width * 2, P.height * 2), Image.NEAREST).save("/tmp/villagers_preview.png")
print(len(meta), "variações", sum(os.path.getsize(os.path.join(OUT, k + ".png")) for k in meta) // 1024, "KB")
