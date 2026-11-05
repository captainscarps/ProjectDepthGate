from PIL import Image
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

MAIN_LEV = os.path.join(ROOT, "assets", "pixel-art", "deepcave", "MainLev.png")
main_im = Image.open(MAIN_LEV).convert("RGBA")
T = 32

# 14 frames of 32x32:
# 0..5: Floors (dirt and moss variants)
# 6..7: Floor shadow variants (dirt with dark cave shadow)
# 8: Floor shadow left
# 9: Floor shadow right
# 10: Wall (solid basalt column)
# 11: Wall face
# 12: Wall top (hexagonal facet)
# 13: Wall face top

sheet = Image.new("RGBA", (14 * T, T), (0, 0, 0, 0))

# 0..3: dirt floors
for i in range(4):
    f = main_im.crop((i * T, 14 * T, (i + 1) * T, 15 * T))
    sheet.paste(f, (i * T, 0))

# 4..5: moss floors
sheet.paste(main_im.crop((16 * T, 17 * T, 17 * T, 18 * T)), (4 * T, 0))
sheet.paste(main_im.crop((17 * T, 17 * T, 18 * T, 18 * T)), (5 * T, 0))

# 6..7: floor shadow
f_base = main_im.crop((0, 14 * T, T, 15 * T))
# add top shadow overlay
s6 = f_base.copy()
shadow_top = Image.new("RGBA", (T, 10), (0, 0, 0, 120))
s6.paste(shadow_top, (0, 0), shadow_top)
sheet.paste(s6, (6 * T, 0))
sheet.paste(s6, (7 * T, 0))

# 8..9: shadow left / right
s8 = f_base.copy()
shadow_left = Image.new("RGBA", (8, T), (0, 0, 0, 100))
s8.paste(shadow_left, (0, 0), shadow_left)
sheet.paste(s8, (8 * T, 0))

s9 = f_base.copy()
shadow_right = Image.new("RGBA", (8, T), (0, 0, 0, 100))
s9.paste(shadow_right, (T - 8, 0), shadow_right)
sheet.paste(s9, (9 * T, 0))

# 10: WALL (solid basalt)
sheet.paste(main_im.crop((T, 4 * T, 2 * T, 5 * T)), (10 * T, 0))

# 11: WALL_FACE
sheet.paste(main_im.crop((2 * T, 4 * T, 3 * T, 5 * T)), (11 * T, 0))

# 12: WALL_TOP
sheet.paste(main_im.crop((T, 0, 2 * T, T)), (12 * T, 0))

# 13: WALL_FACE_TOP
sheet.paste(main_im.crop((2 * T, 0, 3 * T, T)), (13 * T, 0))

for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
    d = os.path.join(base, "assets", "pixel-art", "deepcave")
    os.makedirs(d, exist_ok=True)
    out_path = os.path.join(d, "tiles-dorf-cave.png")
    sheet.save(out_path, optimize=True)
    print(f"Saved {out_path}")
