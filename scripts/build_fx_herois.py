#!/usr/bin/env python3
"""Efeitos das habilidades (PixelLab /vfx) → faixas horizontais em assets/pixel-art/fx-herois/<nome>.png e um
manifesto fx-herois.json {nome: {w, h, n, fps, ax, ay}} (ax/ay = âncora do efeito em pixels do quadro).
Fontes: scripts/art-src/fx/<nome>__<nome>.png + .json (folha em grade + quadros, como o PixelLab entrega)."""
import json, os, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/fx")
OUT = os.path.join(ROOT, "assets/pixel-art/fx-herois")
os.makedirs(OUT, exist_ok=True)
man = {}
for js in sorted(glob.glob(os.path.join(SRC, "*__*.json"))):
    name = os.path.basename(js).split("__")[0]
    meta = json.load(open(js))
    sheet = Image.open(js[:-5] + ".png").convert("RGBA")
    fr = meta["frames"] if isinstance(meta["frames"], list) else list(meta["frames"].values())
    w, h = fr[0]["sourceSize"]["w"], fr[0]["sourceSize"]["h"]
    strip = Image.new("RGBA", (w * len(fr), h))
    for i, f in enumerate(fr):
        r = f["frame"]; s = f.get("spriteSourceSize", {"x": 0, "y": 0})
        strip.alpha_composite(sheet.crop((r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"])), (i * w + s["x"], s["y"]))
    strip.save(os.path.join(OUT, name + ".png"), optimize=True)
    dur = sum(f.get("duration", 83) for f in fr) / len(fr)
    piv = fr[0].get("pivot", {"x": .5, "y": .5})
    man[name] = {"w": w, "h": h, "n": len(fr), "fps": round(1000 / dur), "ax": round(piv["x"] * w), "ay": round(piv["y"] * h)}
json.dump(man, open(os.path.join(OUT, "fx-herois.json"), "w"), indent=1)
print(json.dumps(man))
