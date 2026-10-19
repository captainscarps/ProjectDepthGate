"""
Cabana da Herborista no canto de cima, à direita, do Refúgio (pacote craftpix "Pixel Art Herbalist's Hut").

Gera em assets/pixel-art/hub/village/:
  herb-hut.png       cabana coberta de folhagem (estática)
  herb-bed.png       canteiro de flores (fileiras do jardim)
  herb-shelf.png     estante de poções
  herb-boiler.png    herborista mexendo o caldeirão (12 quadros 32x64)
  herb-cauldron.png  só o caldeirão fervendo (12 quadros 32x48) — fora da campanha ela não está lá
e acrescenta a chave "herb" ao village.json (posições + colisão), tirando as pedras/arbustos que ocupavam o canto.

Uso: python3 scripts/build_hub_herbalist.py <pasta-do-pacote-herbalist>   (a pasta que contém Tiled_files/)
     python3 scripts/build_hub_herbalist.py --json-only                    (só reaplica no village.json)
Rodar de novo depois de build_hub_village.py (ele reescreve o village.json).
"""
import json
import os
import shutil
import sys
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "hub", "village")
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "hub", "village")
ARG = sys.argv[1] if len(sys.argv) > 1 else ""
FILES = ["herb-hut.png", "herb-bed.png", "herb-shelf.png", "herb-boiler.png", "herb-cauldron.png"]


def render(tmx, names):
    d = os.path.dirname(tmx)
    r = ET.parse(tmx).getroot()
    ts = sorted((int(t.get("firstgid")), int(t.get("columns")),
                 Image.open(os.path.join(d, t.find("image").get("source"))).convert("RGBA"),
                 int(t.get("tilewidth")), int(t.get("tileheight"))) for t in r.findall("tileset"))
    allc, cells = [], []
    for L in r.iter("layer"):
        for c in L.find("data").findall("chunk"):
            cx, cy, w = int(c.get("x")), int(c.get("y")), int(c.get("width"))
            vals = [int(v) for v in c.text.replace("\n", "").split(",") if v.strip()]
            for i, g in enumerate(vals):
                if g:
                    allc.append((cx + i % w, cy + i // w))
                    if L.get("name") in names:
                        cells.append((cx + i % w, cy + i // w, g & 0x1FFFFFFF, names.index(L.get("name"))))
    x0 = min(c[0] for c in allc)
    y0 = min(c[1] for c in allc)
    W = (max(c[0] for c in allc) - x0 + 1) * 16
    H = (max(c[1] for c in allc) - y0 + 1) * 16
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for x, y, g, o in sorted(cells, key=lambda c: c[3]):
        f = [t for t in ts if t[0] <= g][-1]
        i, col = g - f[0], f[1]
        tile = f[2].crop(((i % col) * f[3], (i // col) * f[4], (i % col + 1) * f[3], (i // col + 1) * f[4]))
        im.alpha_composite(tile, ((x - x0) * 16, (y - y0) * 16 + (16 - f[4])))
    return im


if ARG and ARG != "--json-only":
    TF = os.path.join(ARG, "Tiled_files")
    assert os.path.isdir(TF), "informe a pasta do pacote Herbalist (com Tiled_files/)"
    ext = os.path.join(TF, "Exterior.tmx")
    hut = render(ext, ["Bushes2", "House", "Bushes"]).crop((77, 146, 279, 272))
    hut.save(os.path.join(OUT, "herb-hut.png"))
    fl = render(ext, ["Flowers1", "Flowers2", "small_flowers"])
    bed = fl.crop((205, 250, 322, 362))
    bed.crop(bed.getbbox()).save(os.path.join(OUT, "herb-bed.png"))
    Image.open(os.path.join(TF, "Interior_objects.png")).convert("RGBA").crop((14, 3, 86, 62)).save(os.path.join(OUT, "herb-shelf.png"))
    Image.open(os.path.join(TF, "Herbalist_boiler_idle.png")).convert("RGBA").save(os.path.join(OUT, "herb-boiler.png"))
    Image.open(os.path.join(TF, "Boiler.png")).convert("RGBA").save(os.path.join(OUT, "herb-cauldron.png"))   # só o caldeirão (modo infinito)

# ───────────────────────────── village.json ─────────────────────────────
VJ = os.path.join(OUT, "village.json")
M = json.load(open(VJ))
G = M["g"]
coll = [list(r) for r in M["coll"]]


def setpx(x0, y0, x1, y1, v):
    for gy in range(max(0, y0 // G), min(len(coll), y1 // G + 1)):
        for gx in range(max(0, x0 // G), min(len(coll[0]), x1 // G + 1)):
            coll[gy][gx] = v


# tira o que ocupava o canto (pedras, arbustos e a arvorezinha)
GONE = [("rock-a", 900, 300, 12, 8), ("rock-s1", 940, 318, 12, 8), ("bush-g", 932, 190, 0, 0),
        ("bush-f", 760, 186, 0, 0), ("tree-s3", 680, 200, 7, 6)]
for k, x, y, fw, fh in GONE:
    M["props"] = [p for p in M["props"] if not (p[0] == k and p[1] == x and p[2] == y)]
    if fw:
        setpx(x - fw, y - fh, x + fw, y, "0")

HUT = (896, 228)            # centro x, base y
BED = (746, 250)
SHELF = (902, 276)
BOIL = (958, 290)
setpx(HUT[0] - 92, HUT[1] - 70, HUT[0] + 92, HUT[1] - 4, "1")       # cabana + folhagem
setpx(SHELF[0] - 30, SHELF[1] - 10, SHELF[0] + 30, SHELF[1], "1")   # estante
setpx(BOIL[0] - 14, BOIL[1] - 14, BOIL[0] + 14, BOIL[1], "1")       # caldeirão
setpx(BED[0] - 52, BED[1] - 96, BED[0] + 52, BED[1] - 4, "1")       # canteiro
M["coll"] = ["".join(r) for r in coll]
M["herb"] = {"hut": list(HUT), "bed": list(BED), "shelf": list(SHELF), "boiler": list(BOIL),
             "spot": [BOIL[0] - 6, BOIL[1] + 4]}
M["spots"]["herb"] = [BOIL[0], BOIL[1]]
json.dump(M, open(VJ, "w"), separators=(",", ":"))

if os.path.isdir(MIR):
    for f in FILES + ["village.json"]:
        if os.path.exists(os.path.join(OUT, f)):
            shutil.copy2(os.path.join(OUT, f), os.path.join(MIR, f))
print("herborista aplicada:", M["herb"])
