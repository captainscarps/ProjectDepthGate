"""
Atlas completo do bioma "Cavernas da Montanha Dorf" (pack Szadi art RPG Worlds Deep Cave).
Extrai pisos puros, bordas de musgo hexagonal, crateras, paredes de basalto de 3 tiles de altura,
terraços de pedra cinza com escadas, grotas escuras, formações de estalagmites completas (com e sem
vegetação na base, variantes cinza-púrpura e rubras), cogumelos luminescentes, samambaias e braseiros.
"""
import json
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

MAIN_LEV = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "MainLev.png")
DECOR = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Decorative.png")
LIGHT_CYAN = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Anim", "light1C.png")
LIGHT_GREEN = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Anim", "light1A.png")
LIGHT_FIRE = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Anim", "light1B.png")

T = 32

def tile(im, c, r, w=1, h=1):
    return im.crop((c * T, r * T, (c + w) * T, (r + h) * T))

def main():
    main_im = Image.open(MAIN_LEV).convert("RGBA")
    dec_im = Image.open(DECOR).convert("RGBA")
    l_cyan = Image.open(LIGHT_CYAN).convert("RGBA")
    l_green = Image.open(LIGHT_GREEN).convert("RGBA")
    l_fire = Image.open(LIGHT_FIRE).convert("RGBA")

    pieces = []  # list of (name, PIL.Image)

    # 1. Pure Brown Cave Dirt (cols 1..3, rows 17..19 -> 9 tiles)
    idx = 0
    for r in (17, 18, 19):
        for c in (1, 2, 3):
            pieces.append((f"f-dirt-{idx}", tile(main_im, c, r)))
            idx += 1

    # 2. Pure Dark Cave Dirt (cols 6..8, rows 17..19 -> 9 tiles)
    idx = 0
    for r in (17, 18, 19):
        for c in (6, 7, 8):
            pieces.append((f"f-dark-{idx}", tile(main_im, c, r)))
            idx += 1

    # 3. Pure Hexagonal Green Moss (cols 16..18, rows 17..19 -> 9 tiles)
    idx = 0
    for r in (17, 18, 19):
        for c in (16, 17, 18):
            pieces.append((f"f-moss-{idx}", tile(main_im, c, r)))
            idx += 1

    # 4. Moss-on-Dirt Autotile Borders (outer edges around moss patch: cols 15..19, rows 16..20)
    # Top edge (moss has dirt to North): row 16, cols 16..18
    for i, c in enumerate((16, 17, 18)):
        pieces.append((f"f-moss-n-{i}", tile(main_im, c, 16)))
    # Bottom edge (moss has dirt to South): row 20, cols 16..18
    for i, c in enumerate((16, 17, 18)):
        pieces.append((f"f-moss-s-{i}", tile(main_im, c, 20)))
    # Left edge (moss has dirt to West): col 15, rows 17..19
    for i, r in enumerate((17, 18, 19)):
        pieces.append((f"f-moss-w-{i}", tile(main_im, 15, r)))
    # Right edge (moss has dirt to East): col 19, rows 17..19
    for i, r in enumerate((17, 18, 19)):
        pieces.append((f"f-moss-e-{i}", tile(main_im, 19, r)))
    # Outer corners of moss patch
    pieces.append(("f-moss-nw", tile(main_im, 15, 16)))
    pieces.append(("f-moss-ne", tile(main_im, 19, 16)))
    pieces.append(("f-moss-sw", tile(main_im, 15, 20)))
    pieces.append(("f-moss-se", tile(main_im, 19, 20)))

    # 5. Ground Craters / Holes on Brown Dirt (cols 6..8, rows 24..26 -> 9 pure opaque tiles)
    idx = 0
    for r in (24, 25, 26):
        for c in (6, 7, 8):
            pieces.append((f"f-crater-{idx}", tile(main_im, c, r)))
            idx += 1

    # 6. Moss Tufts & Pebbles on Brown Dirt (cols 16..19, rows 14..15 -> 8 pure opaque tiles)
    idx = 0
    for r in (14, 15):
        for c in (16, 17, 18, 19):
            pieces.append((f"f-tuft-{idx}", tile(main_im, c, r)))
            idx += 1

    # 7. Basalt Cliff Walls (3-tile-tall system: cap=row 4, mid=row 5, base=row 6 + glowing vine variants + rims)
    for i, c in enumerate((1, 2, 3, 4)):
        pieces.append((f"w-cap-{i}", tile(main_im, c, 4)))
        pieces.append((f"w-mid-{i}", tile(main_im, c, 5)))
        pieces.append((f"w-base-{i}", tile(main_im, c, 6)))
        pieces.append((f"w-top-{i}", tile(main_im, c, 0)))
        pieces.append((f"w-south-{i}", tile(main_im, c, 10)))

    # Glowing yellow-green vine basalt columns (cap=row 11, mid=row 12, base=row 13, cols 0..7)
    for i in range(8):
        pieces.append((f"w-glow-cap-{i}", tile(main_im, i, 11)))
        pieces.append((f"w-glow-mid-{i}", tile(main_im, i, 12)))
        pieces.append((f"w-glow-base-{i}", tile(main_im, i, 13)))

    # Side vertical basalt rims (col 0 = Left wall, col 5 = Right wall, rows 1..3)
    for i, r in enumerate((1, 2, 3)):
        pieces.append((f"w-side-l-{i}", tile(main_im, 0, r)))
        pieces.append((f"w-side-r-{i}", tile(main_im, 5, r)))

    # Corner basalt rims
    pieces.append(("w-corner-nw", tile(main_im, 0, 0)))
    pieces.append(("w-corner-ne", tile(main_im, 5, 0)))
    pieces.append(("w-corner-sw", tile(main_im, 0, 10)))
    pieces.append(("w-corner-se", tile(main_im, 5, 10)))
    # Lower corner columns where side wall turns into north wall (col 0 and 5, rows 4..6)
    pieces.append(("w-turn-l-cap", tile(main_im, 0, 4)))
    pieces.append(("w-turn-l-mid", tile(main_im, 0, 5)))
    pieces.append(("w-turn-l-base", tile(main_im, 0, 6)))
    pieces.append(("w-turn-r-cap", tile(main_im, 5, 4)))
    pieces.append(("w-turn-r-mid", tile(main_im, 5, 5)))
    pieces.append(("w-turn-r-base", tile(main_im, 5, 6)))

    # 8. Grey Stone Terrace Ledges & Staircases (cols 32..37, rows 0..10)
    for i, c in enumerate((33, 34, 35, 36)):
        pieces.append((f"ledge-n-top-{i}", tile(main_im, c, 5)))
        pieces.append((f"ledge-n-bot-{i}", tile(main_im, c, 6)))
        pieces.append((f"ledge-s-{i}", tile(main_im, c, 7)))
        pieces.append((f"ledge-curb-n-{i}", tile(main_im, c, 0)))
    for i, r in enumerate((1, 2, 3, 4)):
        pieces.append((f"ledge-l-{i}", tile(main_im, 32, r)))
        pieces.append((f"ledge-r-{i}", tile(main_im, 37, r)))
    pieces.append(("ledge-nw", tile(main_im, 32, 0)))
    pieces.append(("ledge-ne", tile(main_im, 37, 0)))
    pieces.append(("ledge-sw-top", tile(main_im, 32, 4)))
    pieces.append(("ledge-sw-bot", tile(main_im, 32, 5)))
    pieces.append(("ledge-se-top", tile(main_im, 37, 4)))
    pieces.append(("ledge-se-bot", tile(main_im, 37, 5)))
    pieces.append(("stairs", tile(main_im, 34, 10, 2, 1)))
    pieces.append(("stairs-top", tile(main_im, 34, 9, 2, 1)))
    pieces.append(("ledge-pillar-l", tile(main_im, 32, 9, 2, 2)))
    pieces.append(("ledge-pillar-r", tile(main_im, 36, 9, 2, 2)))

    # 9. Cave Archways & Grottos (cols 12..15, rows 0..5)
    pieces.append(("tunnel-arch", tile(main_im, 12, 0, 4, 3)))   # 128x96 dark tunnel with stairs
    pieces.append(("cave-grotto", tile(main_im, 12, 3, 2, 3)))   # 64x96 dark jagged grotto with stalagmites
    pieces.append(("stone-doorway", tile(main_im, 14, 3, 2, 3))) # 64x96 stone lintel doorway frame

    # 10. Exact Props from Decorative.png (verified via connected-components BFS)
    props_def = {
        # Grey-purple stalagmites & columns (bare)
        "col-cone": (11, 0, 51, 55),
        "col-single": (67, 7, 92, 52),
        "col-pillar": (98, 0, 126, 61),
        "col-trio": (128, 0, 190, 62),
        "col-cluster": (224, 13, 288, 91),
        "col-twin": (11, 75, 52, 144),
        "col-wide": (66, 74, 192, 156),
        "col-massive": (198, 109, 299, 245),
        "col-tall": (4, 166, 88, 275),
        "col-spire": (99, 179, 161, 283),
        "rock-trio": (205, 256, 249, 314),
        # Grey-purple stalagmites with ferns/reeds at base
        "col-twin-fern": (1, 299, 52, 371),
        "col-wide-fern": (66, 298, 192, 384),
        "col-massive-fern": (192, 333, 310, 475),
        "col-tall-fern": (0, 390, 95, 509),
        "col-spire-fern": (97, 403, 161, 507),
        # Reddish-brown stalagmites & columns (matching Ref Images 2 & 3!)
        "col-red-cone": (11, 512, 51, 567),
        "col-red-trio": (128, 512, 190, 574),
        "col-red-cluster": (224, 525, 288, 603),
        "col-red-twin": (11, 587, 52, 656),
        "col-red-wide": (66, 586, 192, 668),
        "col-red-massive": (198, 621, 299, 757),
        "col-red-tall": (4, 678, 88, 787),
        "col-red-spire": (99, 691, 161, 795),
        "col-red-tall-fern": (0, 902, 95, 1021),
        "col-red-spire-fern": (97, 915, 161, 1019),
        "rock-red-trio": (205, 768, 249, 826),
        # Cave ferns & reeds
        "fern-big": (288, 0, 320, 32),
        "fern-med": (324, 8, 349, 32),
        "fern-small": (293, 43, 315, 64),
        "fern-tiny": (331, 42, 344, 56),
        "reeds-big": (320, 193, 351, 222),
        "reeds-small": (296, 196, 312, 218),
        # Glowing mushrooms & sprout pots
        "sprout-pot-1": (194, 483, 221, 511),
        "sprout-pot-2": (227, 485, 252, 510),
        "shroom-big": (288, 992, 320, 1024),
        "shroom-big-2": (321, 992, 350, 1024),
        "shroom-cluster": (448, 992, 480, 1024),
        "shroom-med-1": (359, 1005, 377, 1024),
        "shroom-med-2": (388, 998, 409, 1024),
        "shroom-tiny": (426, 1003, 438, 1015),
        # Brazier pedestal
        "brazier-stand": (198, 994, 218, 1024),
    }

    for name, box in props_def.items():
        cropped = dec_im.crop(box)
        bb = cropped.getbbox()
        if bb:
            cropped = cropped.crop(bb)
        pieces.append((f"p-{name}", cropped))

    # 11. Animated crystal light frames (64x64 each)
    pieces.append(("light-cyan-0", l_cyan.crop((0, 0, 64, 64))))
    pieces.append(("light-cyan-1", l_cyan.crop((64, 0, 128, 64))))
    pieces.append(("light-cyan-2", l_cyan.crop((0, 64, 64, 128))))

    pieces.append(("light-green-0", l_green.crop((0, 0, 64, 64))))
    pieces.append(("light-green-1", l_green.crop((64, 0, 128, 64))))
    pieces.append(("light-green-2", l_green.crop((0, 64, 64, 128))))

    pieces.append(("light-fire-0", l_fire.crop((0, 0, 64, 64))))
    pieces.append(("light-fire-1", l_fire.crop((64, 0, 128, 64))))
    pieces.append(("light-fire-2", l_fire.crop((0, 64, 64, 128))))

    # 12. Composite Entrance Portal Arch (stone doorway + basalt side columns + stairs)
    # Build a clean 128x112 archway composition from MainLev tiles
    arch_im = Image.new("RGBA", (128, 112), (0, 0, 0, 0))
    # Left & right basalt column flanks
    arch_im.paste(tile(main_im, 1, 4), (0, 0), tile(main_im, 1, 4))
    arch_im.paste(tile(main_im, 1, 5), (0, 32), tile(main_im, 1, 5))
    arch_im.paste(tile(main_im, 1, 6), (0, 64), tile(main_im, 1, 6))
    arch_im.paste(tile(main_im, 4, 4), (96, 0), tile(main_im, 4, 4))
    arch_im.paste(tile(main_im, 4, 5), (96, 32), tile(main_im, 4, 5))
    arch_im.paste(tile(main_im, 4, 6), (96, 64), tile(main_im, 4, 6))
    # Dark tunnel interior + stone doorway lintel in center (x=32..96)
    tunnel_center = tile(main_im, 13, 0, 2, 3)
    doorway_frame = tile(main_im, 14, 3, 2, 3)
    arch_im.paste(tunnel_center, (32, 0), tunnel_center)
    arch_im.paste(doorway_frame, (32, 4), doorway_frame)
    # Stone steps at the threshold (x=32..96, y=80..112)
    steps_im = tile(main_im, 34, 10, 2, 1)
    arch_im.paste(steps_im, (32, 80), steps_im)
    pieces.append(("portal-arch", arch_im))

    # Pack into texture atlas (width 1024 for compact height)
    W, x, y, rh, rects = 1024, 0, 0, 0, {}
    for n, im in pieces:
        if x + im.width > W:
            x, y, rh = 0, y + rh + 2, 0
        rects[n] = [x, y, im.width, im.height]
        x += im.width + 2
        rh = max(rh, im.height)

    atlas = Image.new("RGBA", (W, y + rh + 4), (0, 0, 0, 0))
    for n, im in pieces:
        atlas.paste(im, tuple(rects[n][:2]))

    meta = {
        "floor": {
            "dirt": [rects[f"f-dirt-{i}"] for i in range(9)],
            "dark": [rects[f"f-dark-{i}"] for i in range(9)],
            "moss": [rects[f"f-moss-{i}"] for i in range(9)],
            "pave": [rects[f"f-dark-{i}"] for i in range(4)],
            "craters": [rects[f"f-crater-{i}"] for i in range(9)],
            "tufts": [rects[f"f-tuft-{i}"] for i in range(8)],
            "mossBorder": {
                "n": [rects[f"f-moss-n-{i}"] for i in range(3)],
                "s": [rects[f"f-moss-s-{i}"] for i in range(3)],
                "w": [rects[f"f-moss-w-{i}"] for i in range(3)],
                "e": [rects[f"f-moss-e-{i}"] for i in range(3)],
                "nw": rects["f-moss-nw"],
                "ne": rects["f-moss-ne"],
                "sw": rects["f-moss-sw"],
                "se": rects["f-moss-se"],
            },
        },
        "stairs": rects["stairs"],
        "stairsTop": rects["stairs-top"],
        "wall": {
            "cap": [rects[f"w-cap-{i}"] for i in range(4)],
            "mid": [rects[f"w-mid-{i}"] for i in range(4)],
            "base": [rects[f"w-base-{i}"] for i in range(4)],
            "face": [rects[f"w-mid-{i}"] for i in range(4)],
            "glowCap": [rects[f"w-glow-cap-{i}"] for i in range(8)],
            "faceGlow": [rects[f"w-glow-mid-{i}"] for i in range(8)],
            "glowBase": [rects[f"w-glow-base-{i}"] for i in range(8)],
            "top": [rects[f"w-top-{i}"] for i in range(4)],
            "south": [rects[f"w-south-{i}"] for i in range(4)],
            "sideL": [rects[f"w-side-l-{i}"] for i in range(3)],
            "sideR": [rects[f"w-side-r-{i}"] for i in range(3)],
            "cornerNW": rects["w-corner-nw"],
            "cornerNE": rects["w-corner-ne"],
            "cornerSW": rects["w-corner-sw"],
            "cornerSE": rects["w-corner-se"],
        },
        "ledge": {
            "nTop": [rects[f"ledge-n-top-{i}"] for i in range(4)],
            "nBot": [rects[f"ledge-n-bot-{i}"] for i in range(4)],
            "s": [rects[f"ledge-s-{i}"] for i in range(4)],
            "l": [rects[f"ledge-l-{i}"] for i in range(4)],
            "r": [rects[f"ledge-r-{i}"] for i in range(4)],
            "nw": rects["ledge-nw"],
            "ne": rects["ledge-ne"],
            "swTop": rects["ledge-sw-top"],
            "swBot": rects["ledge-sw-bot"],
            "seTop": rects["ledge-se-top"],
            "seBot": rects["ledge-se-bot"],
            "pillarL": rects["ledge-pillar-l"],
            "pillarR": rects["ledge-pillar-r"],
        },
        "arches": {
            "tunnel": rects["tunnel-arch"],
            "grotto": rects["cave-grotto"],
            "doorway": rects["stone-doorway"],
        },
        "props": {k: rects[f"p-{k}"] for k in props_def.keys()},
        "lights": {
            "cyan": [rects[f"light-cyan-{i}"] for i in range(3)],
            "green": [rects[f"light-green-{i}"] for i in range(3)],
            "fire": [rects[f"light-fire-{i}"] for i in range(3)],
        },
        "portalArch": rects["portal-arch"],
        "frames": rects,
    }

    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "deepcave")
        os.makedirs(d, exist_ok=True)
        atlas_path = os.path.join(d, "dorf-atlas.png")
        json_path = os.path.join(d, "dorf-atlas.json")
        arch_path = os.path.join(d, "dorf-portal-arch.png")
        atlas.save(atlas_path, optimize=True)
        arch_im.save(arch_path, optimize=True)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        print(f"Saved {atlas_path} ({os.path.getsize(atlas_path)} bytes, {atlas.size[0]}x{atlas.size[1]})")

if __name__ == "__main__":
    main()
