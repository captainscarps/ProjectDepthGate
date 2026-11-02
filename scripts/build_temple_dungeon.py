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
SHEETS = ["walls_floor.png", "Objects.png", "doors_lever_chest_animation.png", "fire_animation.png", "decorative_cracks_floor.png"]
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
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "temple")
        os.makedirs(d, exist_ok=True)
        atlas.save(os.path.join(d, "tpd-atlas.png"), optimize=True)
        json.dump(meta, open(os.path.join(d, "tpd-atlas.json"), "w"), separators=(",", ":"))
    print("tpd-atlas", atlas.size)


if __name__ == "__main__":
    main()
