"""
Acabamento do Castelo de Valdrak sem precisar do pacote original (trabalha em cima dos pedaços já montados):
  • copas das árvores dos arredores numa camada da frente (c2ext-fg.png + "fg" no castle-data.json): o herói
    passa POR BAIXO das copas em vez de andar por cima delas; a profundidade de cada pedaço é a borda de baixo
    da copa naquela coluna (quem está mais ao sul fica na frente da árvore);
  • células quase tomadas por copa viram parede ("blk"), e trechos onde a arte não bate com a grade ganham
    barreiras em pixel (torres da guarita, fundo do portal do castelo);
  • adereços de parede que tinham ficado pintados flutuando na boca de um corredor são apagados (o piso do
    corredor é copiado de mais acima);
  • urnas da capela saem de cima da escada.
Re-executável: guarda os pedaços originais em art-src/castle2-orig/ na primeira vez e sempre parte deles.
Uso: python3 scripts/castle/fix_castle_scene.py
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from layout import FLOORS  # noqa: E402

IMG = os.path.join(ROOT, "assets", "pixel-art", "castle2")
ORIG = os.path.join(ROOT, "art-src", "castle2-orig")
DATA = os.path.join(ROOT, "assets", "castle2", "castle-data.json")
MIRRORS = [os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "castle2")]
T, CH = 32, 512

os.makedirs(ORIG, exist_ok=True)
# só os pedaços que este script altera guardam cópia original (os demais são lidos da pasta do jogo)
KEEP_ORIG = {"c2f0-0-1.png", "c2f0-3-1.png"}
D = json.load(open(DATA, encoding="utf-8"))
if not os.path.exists(os.path.join(ORIG, "castle-data.json")):
    shutil.copy(DATA, os.path.join(ORIG, "castle-data.json"))
D = json.load(open(os.path.join(ORIG, "castle-data.json"), encoding="utf-8"))


def load_floor(F):
    c = F["chunks"]
    im = Image.new("RGBA", (c["cols"] * CH, c["rows"] * CH))
    for y in range(c["rows"]):
        for x in range(c["cols"]):
            n = f"{c['prefix']}-{x}-{y}.png"
            src = os.path.join(ORIG, n) if n in KEEP_ORIG else os.path.join(IMG, n)
            im.paste(Image.open(src).convert("RGBA"), (x * CH, y * CH))
    return im


def save_floor(F, im):
    c = F["chunks"]
    for y in range(c["rows"]):
        for x in range(c["cols"]):
            n = f"{c['prefix']}-{x}-{y}.png"
            part = im.crop((x * CH, y * CH, (x + 1) * CH, (y + 1) * CH))
            cur = Image.open(os.path.join(IMG, n)).convert("RGBA")
            if cur.size == part.size and (np.asarray(cur) == np.asarray(part)).all():
                continue  # sem mudança: não regrava (evita diferença só de compressão)
            part.save(os.path.join(IMG, n), optimize=True)


def walk(F):
    w = np.zeros((F["world"]["rows"], F["world"]["cols"]), bool)
    for q in [r["rect"] for r in F["rooms"]] + F["corridors"]:
        w[q["y"]:q["y"] + q["h"], q["x"]:q["x"] + q["w"]] = True
    return w


# ─────────── arredores: copas na frente, células de copa bloqueadas, barreiras da guarita ───────────
F = D["floors"]["ext"]
im = load_floor(F)
W, H = F["world"]["cols"] * T, F["world"]["rows"] * T
a = np.asarray(im.convert("RGB")).astype(np.int32)[:H, :W]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
WK = walk(F)
# copa: verde azulado (azul perto do vermelho) e as sombras escuras dentro dela; grama tem azul bem abaixo do vermelho
canopy = ((b >= r * .93) & (g >= b * .92) & (g > r)) | ((r + g + b < 190) & (g >= r) & (b < g * 1.25))
canopy = ndimage.binary_opening(canopy, iterations=1)
canopy = ndimage.binary_closing(canopy, iterations=2)
lab, n = ndimage.label(canopy)
sizes = ndimage.sum(canopy, lab, range(1, n + 1))
canopy = np.isin(lab, np.where(sizes >= 220)[0] + 1)
# só onde alguém pode andar por perto (até 3 células)
near = ndimage.binary_dilation(WK, iterations=3)
nearpx = np.kron(near, np.ones((T, T), bool))[:H, :W]
# o fosso, o castelo e o lago ficam de fora (só a mata ao sul do fosso)
castle_rows = (F.get("moat", {}) or {}).get("y", 32) if False else 36
nearpx[:castle_rows * T] = False
fg = canopy & nearpx
# borda de baixo da copa em cada coluna: profundidade de cada pixel
bottom = np.zeros((H, W), np.int32)
run = np.full(W, -1, np.int32)
for y in range(H - 1, -1, -1):
    row = canopy[y]
    run = np.where(row, np.where(run < 0, y, run), -1)
    bottom[y] = run
# células quase todas de copa dentro da área andável viram parede
blk = []
for cy in range(F["world"]["rows"]):
    for cx in range(F["world"]["cols"]):
        if not WK[cy, cx] or cy < castle_rows:
            continue
        frac = canopy[cy * T:(cy + 1) * T, cx * T:(cx + 1) * T].mean()
        if frac > .6:
            blk.append([cx * T, cy * T, T, T])
# peças da camada da frente: faixas de 32 px pela borda de baixo, em blocos de 256 px de largura
src = np.asarray(im)[:H, :W]
pieces, atlas_parts = [], []
for band in range(0, H, 32):
    m_band = fg & (bottom >= band) & (bottom < band + 32)
    if not m_band.any():
        continue
    for x0 in range(0, W, 256):
        m = m_band[:, x0:x0 + 256]
        if m.sum() < 40:
            continue
        ys, xs = np.where(m)
        y1, y2, x1, x2 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        part = src[y1:y2, x0 + x1:x0 + x2].copy()
        part[..., 3] = np.where(m[y1:y2, x1:x2], part[..., 3], 0)
        atlas_parts.append((Image.fromarray(part), int(x0 + x1), int(y1), band + 32))
# atlas em prateleiras
AW = 2048
x = y = sh = 0
for p in atlas_parts:
    pw, ph = p[0].size
    if x + pw > AW:
        x, y, sh = 0, y + sh + 1, 0
    pieces.append({"sx": x, "sy": y, "w": pw, "h": ph, "x": p[1], "y": p[2], "d": p[3]})
    x += pw + 1
    sh = max(sh, ph)
atlas = Image.new("RGBA", (AW, y + sh + 1))
for p, q in zip(atlas_parts, pieces):
    atlas.alpha_composite(p[0], (q["sx"], q["sy"]))
atlas.save(os.path.join(IMG, "c2ext-fg.png"), optimize=True)
F["fg"] = {"tex": "c2ext-fg", "pieces": pieces}
# guarita: as torres pintadas invadem as bordas do corredor do portão; e o fundo do portal do castelo
blk += [[896, 788, 38, 236], [975, 788, 17, 236], [928, 352, 64, 30]]
F["blk"] = blk
print("arredores:", len(pieces), "peças de copa,", len(blk), "barreiras, atlas", atlas.size)


# ─────────── adereços de parede pintados na boca de corredores: apaga copiando o piso de cima ───────────
def fix_wall_props(fid):
    F = D["floors"][fid]
    L = FLOORS[fid]
    im = load_floor(F)
    corr = np.zeros((F["world"]["rows"], F["world"]["cols"]), bool)
    for q in F["corridors"]:
        corr[q["y"]:q["y"] + q["h"], q["x"]:q["x"] + q["w"]] = True
    done = 0
    for p in L["props"]:
        if not p.get("wall"):
            continue
        c0, c1 = int(np.floor(p["c"] - .65)), int(np.floor(p["c"] + .65))
        r1 = int(np.ceil(p["r"])) - 1
        for c in range(c0, c1 + 1):
            for rr in range(r1 - 2, r1 + 1):
                if 0 <= rr < corr.shape[0] and 0 <= c < corr.shape[1] and corr[rr, c]:
                    sr = rr - 3
                    while sr >= 0 and not corr[sr, c]:
                        sr += 1
                    if sr < 0 or not corr[sr, c] or sr >= rr:
                        continue
                    im.paste(im.crop((c * T, sr * T, (c + 1) * T, (sr + 1) * T)), (c * T, rr * T))
                    done += 1
    save_floor(F, im)
    print(fid, "células de corredor limpas:", done)


fix_wall_props("f0")
fix_wall_props("b1")

# ─────────── capela: urnas fora da escada ───────────
for p in D["floors"]["f0"]["props"]:
    if p["t"] == "cf-p-urns" and abs(p["x"] - 3.4 * T) < 4 and abs(p["y"] - 22.6 * T) < 4:
        p["x"], p["y"] = round(12.4 * T), round(20.3 * T)
# galeria: a estátua da direita ficava na boca do corredor e espremia a passagem
for p in D["floors"]["f0"]["props"]:
    if p["t"] == "cf-p-knight" and abs(p["x"] - 50.4 * T) < 4 and abs(p["y"] - 31.5 * T) < 4:
        p["x"], p["y"] = round(47.6 * T), round(35.4 * T)
json.dump(D, open(DATA, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
for m in MIRRORS:
    if os.path.isdir(m):
        for f in os.listdir(IMG):
            if f.startswith("c2"):
                shutil.copy(os.path.join(IMG, f), os.path.join(m, f))
        shutil.copy(DATA, os.path.join(os.path.dirname(m).replace("pixel-art", ""), "castle2", "castle-data.json")) if False else None
print("ok")
