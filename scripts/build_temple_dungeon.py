"""
Templo dos Irmãos: atlas do pack "Free 2D Top-Down Pixel Dungeon" (CraftPix, fora do repositório pela licença).
Junta as folhas usadas num atlas só (assets/pixel-art/temple/tpd-atlas.png + .json) com:
  sheets: posição de cada folha no atlas (walls_floor em grade de 13 colunas de 16 px)
  props:  recortes dos objetos (caixas, barris, vasos, ouro, escudos, escadas de mão...)
  fire:   chamas animadas (vela, braseiro pequeno, braseiro grande, tigela) 6 quadros
  chest:  baú abrindo (5 quadros 32x32)
Uso: TPD_PACK="/pasta/PNG" python3 scripts/build_temple_dungeon.py
"""
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.environ.get("TPD_PACK", "/tmp/dg/x/PNG")
TMX = os.path.join(os.path.dirname(PACK), "Tiled_files")
SHEETS = ["walls_floor.png", "Objects.png", "doors_lever_chest_animation.png", "fire_animation.png", "decorative_cracks_floor.png", "decorative_cracks_walls.png"]
PROPS = {
    "ladder": (98, 1, 12, 49), "ladder2": (114, 12, 12, 49), "chest-gold": (135, 4, 19, 18), "basket-gold": (167, 8, 19, 14),
    "gold1": (199, 7, 19, 17), "gold2": (224, 7, 16, 12), "gold3": (241, 8, 14, 10), "gold4": (197, 38, 22, 17), "gold5": (163, 36, 29, 22),
    "crates1": (258, 10, 25, 30), "crates2": (290, 5, 28, 36), "crate-tall": (328, 0, 19, 27), "crates3": (320, 32, 29, 32), "crate-barrel": (292, 48, 27, 30),
    "vase1": (353, 3, 14, 19), "vases": (368, 0, 16, 24), "vases2": (359, 32, 21, 24), "hatch": (4, 69, 24, 24),
    "box-tall": (39, 69, 19, 27), "box": (66, 67, 13, 18), "box-barrel": (80, 64, 32, 24), "box-tall2": (119, 69, 19, 27),
    "pot1": (193, 64, 14, 19), "pot2": (210, 67, 11, 16), "pot3": (228, 70, 9, 12), "urn1": (241, 64, 14, 19), "urn2": (258, 67, 11, 16),
    "barrel-box": (325, 64, 22, 29), "shield": (353, 64, 15, 20), "shield2": (368, 64, 15, 20), "stairs-wall": (14, 0, 32, 52),
}
FIRE = {"candle": (0, 37), "small": (37, 43), "big": (80, 48), "bowl": (128, 48)}


def main():
    ims = [Image.open(os.path.join(PACK, f)).convert("RGBA") for f in SHEETS]
    ims.append(Image.open(os.path.join(TMX, "water_details_animation.png")).convert("RGBA")); SHEETS.append("water_details.png")
    ims.append(Image.open(os.path.join(TMX, "trap_animation.png")).convert("RGBA")); SHEETS.append("trap_animation.png")
    W = max(i.width for i in ims); H = sum(i.height for i in ims) + 2 * len(ims)
    atlas = Image.new("RGBA", (W, H)); meta = {"sheets": {}, "props": {}, "fire": {}, "chest": None}; y = 0
    for f, im in zip(SHEETS, ims):
        atlas.paste(im, (0, y)); meta["sheets"][f.split(".")[0]] = [0, y, im.width, im.height]; y += im.height + 2
    oy = meta["sheets"]["Objects"][1]
    for k, (x, yy, w, h) in PROPS.items(): meta["props"][k] = [x, oy + yy, w, h]
    fy = meta["sheets"]["fire_animation"][1]
    for k, (x, w) in FIRE.items(): meta["fire"][k] = [x, fy, w, 48, 6]
    dy = meta["sheets"]["doors_lever_chest_animation"][1]
    meta["chest"] = [0, dy + 128, 32, 32, 5]
    meta["lever"] = [0, dy + 176, 16, 16, 5]
    # versões rachadas: para cada ladrilho de walls_floor, os ladrilhos de decorative_cracks_walls mais parecidos
    import numpy as np
    wf = np.array(ims[0]).astype(int); cw = np.array(ims[5]).astype(int)
    T = lambda a: [a[y:y + 16, x:x + 16] for y in range(0, a.shape[0], 16) for x in range(0, a.shape[1], 16)]
    A, Bq = T(wf), T(cw); cr = {}
    for j, b in enumerate(Bq):
        if b[..., 3].sum() == 0: continue
        best = max(((np.abs(a - b).sum(2) < 20).mean(), i) for i, a in enumerate(A) if a[..., 3].sum())
        if best[0] > .7: cr.setdefault(str(best[1]), []).append(j)
    meta["cracks"] = cr
    # reflexos da água: grupos de ladrilhos animados copiados do mapa de exemplo do pack (Dungeon1.tmx)
    import xml.etree.ElementTree as ET
    r = ET.parse(os.path.join(TMX, "Dungeon1.tmx")).getroot(); first = None; anim = {}
    for t in r.findall("tileset"):
        if t.get("name") == "Water_detilazation":
            first = int(t.get("firstgid"))
            for x in t.findall("tile"):
                a = x.find("animation")
                if a is not None: anim[int(x.get("id"))] = [int(f.get("tileid")) for f in a.findall("frame")]
    groups = []
    for L in r.iter("layer"):
        if not L.get("name").startswith("water_detailization"): continue
        cells = {}
        for c in L.find("data").findall("chunk"):
            x0, y0, w = int(c.get("x")), int(c.get("y")), int(c.get("width"))
            for i, v in enumerate(int(q) for q in c.text.replace("\n", "").split(",") if q.strip()):
                if v: cells[(x0 + i % w, y0 + i // w)] = (v & 0x1FFFFFFF) - first
        seen = set()
        for k in cells:
            if k in seen: continue
            st = [k]; grp = []; seen.add(k)
            while st:
                x, y = st.pop(); grp.append((x, y, cells[(x, y)]))
                for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = (x + d[0], y + d[1])
                    if n in cells and n not in seen: seen.add(n); st.append(n)
            mx, my = min(g[0] for g in grp), min(g[1] for g in grp)
            groups.append([[x - mx, y - my, i] for x, y, i in grp])
    meta["wdet"] = {"groups": groups, "anim": {str(k): v for k, v in anim.items()}, "cols": 37}
    # grades de buracos no chão: grupos da camada "traps" do exemplo, no primeiro quadro (espetos recolhidos)
    tfirst = None; tan = {}
    for t in r.findall("tileset"):
        if t.get("name") == "trap_animation":
            tfirst = int(t.get("firstgid"))
            for x in t.findall("tile"):
                a = x.find("animation")
                if a is not None: tan[int(x.get("id"))] = [int(f.get("tileid")) for f in a.findall("frame")]
    tg = []
    for L in r.iter("layer"):
        if L.get("name") != "traps": continue
        cells = {}
        for c in L.find("data").findall("chunk"):
            x0, y0, w = int(c.get("x")), int(c.get("y")), int(c.get("width"))
            for i, v in enumerate(int(q) for q in c.text.replace("\n", "").split(",") if q.strip()):
                if v: cells[(x0 + i % w, y0 + i // w)] = (v & 0x1FFFFFFF) - tfirst
        seen = set()
        for k in cells:
            if k in seen: continue
            st = [k]; grp = []; seen.add(k)
            while st:
                x, y = st.pop(); grp.append((x, y, cells[(x, y)]))
                for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = (x + d[0], y + d[1])
                    if n in cells and n not in seen: seen.add(n); st.append(n)
            mx, my = min(g[0] for g in grp), min(g[1] for g in grp)
            tg.append([[x - mx, y - my, (tan.get(i) or [i])[0]] for x, y, i in grp])
    meta["traps"] = {"groups": tg, "cols": 13}
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "temple")
        os.makedirs(d, exist_ok=True)
        atlas.save(os.path.join(d, "tpd-atlas.png"), optimize=True)
        json.dump(meta, open(os.path.join(d, "tpd-atlas.json"), "w"), separators=(",", ":"))
    print("tpd-atlas", atlas.size)


if __name__ == "__main__":
    main()
