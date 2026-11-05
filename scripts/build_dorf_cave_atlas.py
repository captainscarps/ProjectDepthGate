"""
Atlas do bioma "Cavernas da Montanha Dorf" (pack Szadi art RPG Worlds Deep Cave).
Extrai pisos, paredes de basalto, adereços, tochas e o portal de entrada em um atlas
único otimizado (dorf-atlas.png + dorf-atlas.json).
"""
import json
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

MAIN_LEV = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "MainLev.png")
DECOR = os.path.join(ROOT, "assets", "pixel-art/deepcave/Decorative.png")
LIGHT_CYAN = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Anim", "light1C.png")
LIGHT_GREEN = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Anim", "light1A.png")
LIGHT_FIRE = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Anim", "light1B.png")
SCR2 = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "Help_SCR2.psd.png")

T = 32

def main():
    main_im = Image.open(MAIN_LEV).convert("RGBA")
    dec_im = Image.open(DECOR).convert("RGBA")
    l_cyan = Image.open(LIGHT_CYAN).convert("RGBA")
    l_green = Image.open(LIGHT_GREEN).convert("RGBA")
    l_fire = Image.open(LIGHT_FIRE).convert("RGBA")
    scr2_im = Image.open(SCR2).convert("RGBA")

    pieces = [] # list of (name, PIL.Image)

    # 1. Dirt floors (32x32)
    # Row 14, 15, cols 0..3
    for i, c in enumerate(range(4)):
        pieces.append((f"f-dirt-{i}", main_im.crop((c * T, 14 * T, (c + 1) * T, 15 * T))))
        pieces.append((f"f-dirt-{i+4}", main_im.crop((c * T, 15 * T, (c + 1) * T, 16 * T))))

    # 2. Hexagonal moss tiles (32x32)
    # Rows 17, 18, 19, cols 16, 17, 18
    idx = 0
    for r in [17, 18, 19]:
        for c in [16, 17, 18]:
            pieces.append((f"f-moss-{idx}", main_im.crop((c * T, r * T, (c + 1) * T, (r + 1) * T))))
            idx += 1

    # 3. Paved dark stone floor (32x32)
    for i, c in enumerate(range(4)):
        pieces.append((f"f-pave-{i}", main_im.crop((c * T, 8 * T, (c + 1) * T, 9 * T))))

    # 4. Basalt wall faces (vertical facade, 32x32)
    # Row 4, cols 1..4 (plain basalt columns)
    for i, c in enumerate(range(1, 5)):
        pieces.append((f"w-face-{i}", main_im.crop((c * T, 4 * T, (c + 1) * T, 5 * T))))
    # Row 10, cols 0..3 (basalt with glowing vines)
    for i, c in enumerate(range(4)):
        pieces.append((f"w-face-glow-{i}", main_im.crop((c * T, 10 * T, (c + 1) * T, 11 * T))))

    # 5. Basalt wall tops (hexagonal facets, 32x32)
    # Row 0, cols 1..4
    for i, c in enumerate(range(1, 5)):
        pieces.append((f"w-top-{i}", main_im.crop((c * T, 0, (c + 1) * T, T))))

    # 6. Stairs (32x32 and 64x32)
    # From SCR2 or MainLev: stairs at col 14, 15 row 8
    stairs_crop = scr2_im.crop((160, 486, 224, 518))
    pieces.append(("stairs", stairs_crop))

    # 7. Props from Decorative
    props_def = {
        "col-single": (12, 0, 48, 36),
        "col-trio": (10, 46, 56, 92),
        "col-cluster": (70, 46, 126, 100),
        "col-tall": (4, 104, 88, 172),
        "col-spire": (96, 110, 160, 176),
        "col-massive": (196, 70, 296, 156),
        "fern-1": (286, 0, 318, 22),
        "fern-2": (290, 26, 316, 40),
        "fern-tall": (292, 120, 312, 176),
        "shroom-big": (284, 480, 318, 510),
        "shroom-cluster": (124, 480, 160, 510),
        "shroom-tiny": (98, 488, 120, 510),
        "sprout-pot": (190, 480, 218, 510),
        "brazier-stand": (192, 480+512-20, 224, 480+512+12),
    }
    for name, box in props_def.items():
        cropped = dec_im.crop(box)
        bb = cropped.getbbox()
        if bb:
            cropped = cropped.crop(bb)
        pieces.append((f"p-{name}", cropped))

    # 8. Animated light frames (64x64 each)
    # light1C (cyan crystal flame)
    pieces.append(("light-cyan-0", l_cyan.crop((0, 0, 64, 64))))
    pieces.append(("light-cyan-1", l_cyan.crop((64, 0, 128, 64))))
    pieces.append(("light-cyan-2", l_cyan.crop((0, 64, 64, 128))))

    # light1A (green crystal flame)
    pieces.append(("light-green-0", l_green.crop((0, 0, 64, 64))))
    pieces.append(("light-green-1", l_green.crop((64, 0, 128, 64))))
    pieces.append(("light-green-2", l_green.crop((0, 64, 64, 128))))

    # light1B (fire flame)
    pieces.append(("light-fire-0", l_fire.crop((0, 0, 64, 64))))
    pieces.append(("light-fire-1", l_fire.crop((64, 0, 128, 64))))
    pieces.append(("light-fire-2", l_fire.crop((0, 64, 64, 128))))

    # 9. Grand Portal Arch (cutout from SCR2)
    # Size 144 x 132 px
    portal_arch = scr2_im.crop((96, 396, 240, 528)).convert("RGBA")
    # Make background outside the columns and lintel transparent
    # The portal doorway is at x: 44..96, y: 16..84
    # Let's keep the basalt columns, lintel, steps, and braziers
    pieces.append(("portal-arch", portal_arch))

    # Pack into texture atlas (width 512)
    W, x, y, rh, rects = 512, 0, 0, 0, {}
    for n, im in pieces:
        if x + im.width > W:
            x, y, rh = 0, y + rh + 2, 0
        rects[n] = [x, y, im.width, im.height]
        x += im.width + 2
        rh = max(rh, im.height)

    atlas = Image.new("RGBA", (W, y + rh + 4), (0, 0, 0, 0))
    for n, im in pieces:
        atlas.paste(im, tuple(rects[n][:2]))

    # Meta catalog
    meta = {
        "floor": {
            "dirt": [rects[f"f-dirt-{i}"] for i in range(8)],
            "moss": [rects[f"f-moss-{i}"] for i in range(9)],
            "pave": [rects[f"f-pave-{i}"] for i in range(4)],
        },
        "stairs": rects["stairs"],
        "wall": {
            "face": [rects[f"w-face-{i}"] for i in range(4)],
            "faceGlow": [rects[f"w-face-glow-{i}"] for i in range(4)],
            "top": [rects[f"w-top-{i}"] for i in range(4)],
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

    # Save to both asset directories
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "deepcave")
        os.makedirs(d, exist_ok=True)
        atlas_path = os.path.join(d, "dorf-atlas.png")
        json_path = os.path.join(d, "dorf-atlas.json")
        atlas.save(atlas_path, optimize=True)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        print(f"Saved {atlas_path} ({os.path.getsize(atlas_path)} bytes)")

if __name__ == "__main__":
    main()
