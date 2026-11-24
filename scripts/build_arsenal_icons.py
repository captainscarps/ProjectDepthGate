"""
Ícones do Arsenal do Ferreiro (scripts/icon_arsenal.py) no atlas items-hd: desenha só as armas ars_* (SVG → PNG
80x80 pelo Chromium) e ENCAIXA no atlas existente (troca o quadro se já existe, senão ocupa um espaço livre ou uma
linha nova) — não refaz o atlas inteiro, que tem quadros de outros scripts (armaduras, itens extras).
Uso: python3 scripts/build_arsenal_icons.py
"""
import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_item_icons as B  # noqa
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AT = os.path.join(ROOT, "assets", "pixel-art", "items-hd")
keys = [k for k in B.UNIQ if k.startswith("ars_")]
new = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 80, "height": 80})
    for k in keys:
        s = B.UNIQ[k]().replace('width="128" height="128"', 'width="80" height="80"', 1)
        pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
        new[k] = Image.open(io.BytesIO(pg.screenshot(omit_background=True))).convert("RGBA")
    b.close()
J = json.load(open(os.path.join(AT, "items.json")))
F = J["frames"]
atlas = Image.open(os.path.join(AT, "items.png")).convert("RGBA")
cols = atlas.width // 80
extra = [k for k in new if k not in F]
used = {(v["frame"]["x"], v["frame"]["y"]) for v in F.values()}
slots = [(x * 80, y * 80) for y in range(atlas.height // 80) for x in range(cols) if (x * 80, y * 80) not in used]
need = max(0, len(extra) - len(slots))
rows = -(-need // cols)
out = Image.new("RGBA", (atlas.width, atlas.height + rows * 80))
out.alpha_composite(atlas)
slots += [(x * 80, atlas.height + y * 80) for y in range(rows) for x in range(cols)]
for k in extra:
    x, y = slots.pop(0)
    F[k] = {"frame": {"x": x, "y": y, "w": 80, "h": 80}, "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": 80, "h": 80}, "sourceSize": {"w": 80, "h": 80}}
for k, im in new.items():
    x, y = F[k]["frame"]["x"], F[k]["frame"]["y"]
    out.paste(Image.new("RGBA", (80, 80)), (x, y))
    out.alpha_composite(im, (x, y))
J["meta"]["size"] = {"w": out.width, "h": out.height}
out.save(os.path.join(AT, "items.png"), optimize=True)
json.dump(J, open(os.path.join(AT, "items.json"), "w"), separators=(",", ":"))
print(len(new), "armas;", len(extra), "novas; atlas", out.size)
