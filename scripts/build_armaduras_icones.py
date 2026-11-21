"""Monta os ícones de armadura (p216.101) no atlas items-hd.
- <id>.png bruto de scripts/art-src/armaduras-icones → quadro "<id>" (substitui no lugar ou acrescenta no fim)
- shadow_cloak / dark_leather_armor (itens com raridade) → "<id>@<RAR>" com brilho da raridade em volta
- armor__<RAR>.png → "armor@<RAR>"
- variantes <base>_v_<padrão> → ícone da base recolorido para a cor da variante (tint do item)
Re-executável: guarda o atlas original em scripts/art-src/armaduras-icones/_atlas-orig.*"""
import os, json, colorsys, shutil
from PIL import Image, ImageFilter
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/armaduras-icones"); AT = os.path.join(ROOT, "assets/pixel-art/items-hd")
for e in ("png", "json"):
    o = os.path.join(D, "_atlas-orig." + e)
    if not os.path.exists(o): shutil.copy(os.path.join(AT, "items." + e), o)
atlas = Image.open(os.path.join(D, "_atlas-orig.png")).convert("RGBA"); J = json.load(open(os.path.join(D, "_atlas-orig.json")))
F = J["frames"]
RAR = {"COMMON": (170, 170, 170), "UNCOMMON": (90, 200, 100), "RARE": (80, 150, 255), "EPIC": (180, 90, 255), "LEGENDARY": (255, 160, 40), "RELIC": (120, 240, 255)}
VAR = {"glacial": 5218262, "obsidiana": 2828342, "jade": 3050082, "sangue": 8132130, "aurea": 15655620, "cinzas": 6446682}

def fit(im):
    im = im.convert("RGBA"); bb = im.getbbox()
    if bb: im = im.crop(bb)
    s = 72 / max(im.size); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.NEAREST) if s < 1 else im
    c = Image.new("RGBA", (80, 80)); c.alpha_composite(im, ((80 - im.width) // 2, (80 - im.height) // 2)); return c

def glow(im, col, strength=1.0):
    a = im.split()[3].filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(3))
    a = a.point(lambda v: int(min(255, v * .85 * strength)))
    g = Image.new("RGBA", im.size, col + (0,)); g.putalpha(a); g.alpha_composite(im); return g

def recolor(im, tint):
    r, g, b = (tint >> 16) & 255, (tint >> 8) & 255, tint & 255
    ht, st, vt = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    A = np.asarray(im).astype(np.float32) / 255; out = A.copy()
    rgb = A[..., :3]; mx = rgb.max(-1); mn = rgb.min(-1); s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0); v = mx
    lum = rgb @ np.array([.3, .59, .11])
    # pixels coloridos (tecido/metal pintado) recebem a cor da variante; cinzas/pretos ficam, só levemente tingidos
    w = np.clip((s - .12) / .25, 0, 1)
    ns = np.where(st < .25, s * .25 + st * .5, np.clip(s * .5 + st * .6, 0, 1))
    nv = np.clip(lum * (1.25 if vt > .6 else .95) + (vt - .5) * .25, 0, 1)
    import numpy as _n
    hh = np.full_like(v, ht); h6 = hh * 6; i = np.floor(h6) % 6; f = h6 - np.floor(h6)
    p = nv * (1 - ns); q = nv * (1 - ns * f); t = nv * (1 - ns * (1 - f))
    sel = [i == k for k in range(6)]
    R = np.select(sel, [nv, q, p, p, t, nv]); G = np.select(sel, [t, nv, nv, q, p, p]); B = np.select(sel, [p, p, t, nv, nv, q])
    new = np.stack([R, G, B], -1)
    tinted = rgb * (1 - .25) + np.array([r, g, b]) / 255 * .25 * lum[..., None] * 1.6
    out[..., :3] = new * w[..., None] + np.clip(tinted, 0, 1) * (1 - w[..., None])
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA")

new = {}
for fn in sorted(os.listdir(D)):
    if fn.startswith("_") or not fn.endswith(".png"): continue
    k = fn[:-4].replace("__", "@"); im = fit(Image.open(os.path.join(D, fn)))
    if k in ("shadow_cloak", "dark_leather_armor"):
        for R, c in RAR.items(): new[k + "@" + R] = glow(im, c, .6 if R == "COMMON" else 1)
    elif k.startswith("armor@"):
        new[k] = glow(im, RAR[k[6:]], .6 if k.endswith("COMMON") else 1)
    else:
        new[k] = im
arm = json.load(open("/tmp/armors.json")) if os.path.exists("/tmp/armors.json") else []
VARIANTS = [a[0] for a in arm if "_v_" in a[0]] or json.load(open(os.path.join(D, "_variantes.json")))
json.dump(VARIANTS, open(os.path.join(D, "_variantes.json"), "w"))
for vid in VARIANTS:
    base, pat = vid.split("_v_")
    if base in new: new[vid] = recolor(new[base], VAR[pat])
# monta: substitui quadros existentes, acrescenta os novos em linhas abaixo
cols = atlas.width // 80; extra = [k for k in new if k not in F]
used = {(v["frame"]["x"], v["frame"]["y"]) for v in F.values()}
slots = [(x * 80, y * 80) for y in range(atlas.height // 80) for x in range(cols) if (x * 80, y * 80) not in used]
need = max(0, len(extra) - len(slots)); rows = -(-need // cols)
out = Image.new("RGBA", (atlas.width, atlas.height + rows * 80)); out.alpha_composite(atlas)
slots += [(x * 80, atlas.height + y * 80) for y in range(rows) for x in range(cols)]
for k in extra:
    x, y = slots.pop(0)
    F[k] = {"frame": {"x": x, "y": y, "w": 80, "h": 80}, "rotated": False, "trimmed": False, "spriteSourceSize": {"x": 0, "y": 0, "w": 80, "h": 80}, "sourceSize": {"w": 80, "h": 80}}
for k, im in new.items():
    x, y = F[k]["frame"]["x"], F[k]["frame"]["y"]
    out.paste(Image.new("RGBA", (80, 80)), (x, y)); out.alpha_composite(im, (x, y))
J["meta"]["size"] = {"w": out.width, "h": out.height}
out.save(os.path.join(AT, "items.png"), optimize=True); json.dump(J, open(os.path.join(AT, "items.json"), "w"), separators=(",", ":"))
print(len(new), "quadros;", len(extra), "novos; atlas", out.size)
