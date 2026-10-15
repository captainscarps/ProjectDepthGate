import os
import random
import json
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK_ART = os.path.join(ROOT, "assets", "pixel-art", "scenery", "fantasy_pack", "art")
PACK_DIR = os.path.join(ROOT, "assets", "pixel-art", "scenery", "fantasy_pack")
PACK_DIR_PROJ = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "scenery", "fantasy_pack")
OUT_MAPS = os.path.join(ROOT, "assets", "pixel-art", "newmaps")
OUT_MAPS_PROJ = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "newmaps")

T = 32
COLS, ROWS = 80, 48
W, H = COLS * T, ROWS * T
CHUNK = 512

print(f"Building polished pixel-art Floresta Nevada ({W}x{H})...")

# 1. Road tileset winterization
tr = Image.open(os.path.join(PACK_ART, "Tileset_Road.png")).convert("RGBA")
tr = tr.resize((tr.width * 2, tr.height * 2), Image.Resampling.NEAREST)
pix_r = bytearray(tr.tobytes())
for i in range(0, len(pix_r), 4):
    r, g, b, a = pix_r[i], pix_r[i+1], pix_r[i+2], pix_r[i+3]
    if a < 10:
        continue
    lum = (r*0.299 + g*0.587 + b*0.114) / 255.0
    if r > 120 and g > 90 and r > b + 20:
        pix_r[i]   = min(255, int(68 + lum * 105))
        pix_r[i+1] = min(255, int(88 + lum * 105))
        pix_r[i+2] = min(255, int(115 + lum * 115))
    elif g > r and g > b:
        pix_r[i]   = min(255, int(228 + lum * 27))
        pix_r[i+1] = min(255, int(238 + lum * 17))
        pix_r[i+2] = min(255, int(252 + lum * 3))
snow_road = Image.frombytes("RGBA", tr.size, bytes(pix_r))

def get_road_tile(idx):
    col = idx % 6
    row = idx // 6
    return snow_road.crop((col * 32, row * 32, (col + 1) * 32, (row + 1) * 32))

# 2. Master Ground Canvas
master = Image.new("RGBA", (W, H), (232, 242, 252, 255))
d = ImageDraw.Draw(master)
rnd = random.Random(101)

snow_palette = [
    (246, 250, 255, 255),
    (240, 246, 253, 255),
    (234, 242, 250, 255),
    (226, 238, 248, 255),
    (218, 232, 246, 255)
]
for y in range(0, H, 32):
    for x in range(0, W, 32):
        c = rnd.choice(snow_palette)
        d.rectangle([x, y, x + 31, y + 31], fill=c)
        if rnd.random() < 0.2:
            d.line([x + 6, y + 16, x + 26, y + 16], fill=(210, 226, 242, 255), width=2)

# Frozen Lake (cols 8..28, rows 19..36)
lake_cx, lake_cy = 18 * T, 27 * T
lake_rx, lake_ry = 10 * T, 8 * T
for r in range(18, 37):
    for c in range(7, 30):
        x, y = c * 32, r * 32
        dist = ((x + 16 - lake_cx) / lake_rx)**2 + ((y + 16 - lake_cy) / lake_ry)**2
        if dist <= 1.08:
            if dist > 0.85:
                col = (185, 222, 248, 255)
            elif dist > 0.55:
                col = (140, 202, 242, 255)
            else:
                col = (110, 180, 235, 255)
            d.rectangle([x, y, x + 31, y + 31], fill=col)
            if rnd.random() < 0.3:
                d.line([x + rnd.randint(2, 12), y + rnd.randint(4, 28),
                        x + rnd.randint(14, 30), y + rnd.randint(4, 28)],
                       fill=(235, 248, 255, 255), width=1)

# Cobblestone road paths
road_cells = set()
for r in range(28, 48):
    for c in [41, 42, 43]:
        road_cells.add((c, r))
for r in range(39, 44):
    for c in range(39, 46):
        road_cells.add((c, r))
for c in range(27, 42):
    road_cells.add((c, 31))
    road_cells.add((c, 32))
boss_trail = [
    (43, 28), (44, 28), (45, 27), (46, 27), (47, 26), (48, 25), (49, 25),
    (50, 24), (51, 23), (52, 23), (53, 22), (54, 21), (55, 20), (56, 19),
    (57, 18), (58, 17), (59, 16), (60, 15), (61, 15), (62, 14), (63, 13),
    (64, 13), (65, 12), (66, 12), (67, 12), (68, 12)
]
for c, r in boss_trail:
    road_cells.add((c, r))
    road_cells.add((c, r+1))
    road_cells.add((c+1, r))

for c, r in road_cells:
    if 0 <= c < COLS and 0 <= r < ROWS:
        top = (c, r-1) in road_cells
        bot = (c, r+1) in road_cells
        lft = (c-1, r) in road_cells
        rgt = (c+1, r) in road_cells
        
        if top and bot and lft and rgt:
            t_idx = 48
        elif not top and bot and not lft and rgt:
            t_idx = 1
        elif not top and bot and lft and not rgt:
            t_idx = 3
        elif top and not bot and not lft and rgt:
            t_idx = 13
        elif top and not bot and lft and not rgt:
            t_idx = 15
        elif not top and bot:
            t_idx = 2
        elif top and not bot:
            t_idx = 14
        elif not lft and rgt:
            t_idx = 7
        elif lft and not rgt:
            t_idx = 9
        else:
            t_idx = 48
            
        t_im = get_road_tile(t_idx)
        master.paste(t_im, (c * T, r * T), t_im)

arena_cx, arena_cy = 69 * T, 13 * T
arena_rad = 140
for y in range(arena_cy - arena_rad - 16, arena_cy + arena_rad + 16, 32):
    for x in range(arena_cx - arena_rad - 16, arena_cx + arena_rad + 16, 32):
        if (x - arena_cx)**2 + (y - arena_cy)**2 <= arena_rad**2:
            t_im = get_road_tile(48)
            master.paste(t_im, (x, y), t_im)

d.ellipse([arena_cx - 100, arena_cy - 100, arena_cx + 100, arena_cy + 100],
          outline=(100, 210, 255, 220), width=3)
d.ellipse([arena_cx - 70, arena_cy - 70, arena_cx + 70, arena_cy + 70],
          outline=(180, 235, 255, 180), width=2)

# 3. Refined Prop Placement (NO overlap with player or structures)
props = []

# Village Entrance & Plaza
# Player starts at (x: 1360, y: 1392)
props.append({"x": 1130, "y": 1330, "tex": "fp-snow-House-Hay-1"})   # Cabin 1 (left)
props.append({"x": 1580, "y": 1350, "tex": "fp-snow-House-Hay-2"})   # Cabin 2 (right)
props.append({"x": 1080, "y": 1420, "tex": "fp-snow-Well-Hay-1"})    # Well in open snow on left
props.append({"x": 1280, "y": 1420, "tex": "fp-snow-Sign-1"})        # Direction sign by path
props.append({"x": 1260, "y": 1320, "tex": "fp-snow-LampPost-3"})    # Lantern left
props.append({"x": 1460, "y": 1320, "tex": "fp-snow-LampPost-3"})    # Lantern right
props.append({"x": 1180, "y": 1360, "tex": "fp-snow-Barrel-Small-Empty"})
props.append({"x": 1195, "y": 1360, "tex": "fp-snow-Crate-Medium-Closed"})
props.append({"x": 1520, "y": 1410, "tex": "fp-snow-Bench-1"})

# Cabin by the Lake
props.append({"x": 1000, "y": 990, "tex": "fp-snow-House-Hay-1"})
props.append({"x": 930,  "y": 1020, "tex": "fp-snow-LampPost-3"})
props.append({"x": 960,  "y": 1040, "tex": "fp-snow-Barrel-Small-Empty"})

# Framing Pine Trees
props.append({"x": 1020, "y": 1350, "tex": "fn-pine-dense"})
props.append({"x": 1040, "y": 1480, "tex": "fn-pine-tall"})
props.append({"x": 1680, "y": 1350, "tex": "fn-pine-huge"})
props.append({"x": 1670, "y": 1470, "tex": "fn-pine-dense"})
props.append({"x": 1230, "y": 1470, "tex": "fn-rock-large"})
props.append({"x": 1490, "y": 1460, "tex": "fn-rock-med"})

# Bushes positioned safely away from paths
props.append({"x": 1160, "y": 1400, "tex": "fp-snow-Bush-Emerald-1"})
props.append({"x": 1470, "y": 1410, "tex": "fp-snow-Bush-Emerald-1"})

# Trail Trees
trail_trees = [
    (1480, 1160, "fn-pine-dense"), (1560, 1120, "fn-pine-tall"),
    (1640, 1060, "fn-pine-dense"), (1720, 990,  "fn-pine-huge"),
    (1780, 920,  "fn-pine-dense"), (1850, 850,  "fn-pine-tall"),
    (1920, 780,  "fn-pine-dense"), (1980, 700,  "fn-pine-huge"),
    (2040, 640,  "fn-pine-tall"),  (2120, 580,  "fn-pine-dense")
]
for tx, ty, tex in trail_trees:
    props.append({"x": tx, "y": ty, "tex": tex})

props.append({"x": 1500, "y": 1200, "tex": "fn-rock-large"})
props.append({"x": 1680, "y": 1040, "tex": "fn-rock-cliff"})
props.append({"x": 1820, "y": 880,  "tex": "fn-rock-large"})
props.append({"x": 2000, "y": 680,  "tex": "fn-rock-cliff"})

# Boss Arena perimeter
props.append({"x": arena_cx - 90, "y": arena_cy - 90, "tex": "fn-crystal-spire"})
props.append({"x": arena_cx + 90, "y": arena_cy - 90, "tex": "fn-crystal-spire"})
props.append({"x": arena_cx - 90, "y": arena_cy + 90, "tex": "fn-crystal-spire"})
props.append({"x": arena_cx + 90, "y": arena_cy + 90, "tex": "fn-crystal-spire"})
props.append({"x": arena_cx,      "y": arena_cy - 110, "tex": "fn-crystal-cluster"})
props.append({"x": arena_cx - 60, "y": arena_cy,      "tex": "fp-snow-LampPost-3"})
props.append({"x": arena_cx + 60, "y": arena_cy,      "tex": "fp-snow-LampPost-3"})

# Lake Crystals & Pine perimeter
lake_props = [
    (320,  720, "fn-crystal-spire"), (480,  660, "fn-crystal-cluster"),
    (640,  620, "fn-crystal-spire"), (820,  680, "fn-crystal-cluster"),
    (300,  880, "fn-crystal-cluster"), (280, 1040, "fn-crystal-spire"),
    (420, 1140, "fn-crystal-cluster"), (600, 1150, "fn-crystal-spire"),
    (780, 1120, "fn-crystal-cluster"),
    (240,  640, "fn-pine-huge"),  (220,  800, "fn-pine-dense"),
    (230,  960, "fn-pine-tall"),  (240, 1100, "fn-pine-huge"),
    (380, 1200, "fn-pine-dense"), (560, 1210, "fn-pine-tall"),
    (720, 1190, "fn-pine-dense"), (880, 1170, "fn-pine-huge")
]
for lx, ly, ltex in lake_props:
    props.append({"x": lx, "y": ly, "tex": ltex})

for col in range(2, 78, 4):
    props.append({"x": col * T + rnd.randint(-6, 6), "y": 4 * T + rnd.randint(-6, 6), "tex": "fn-pine-huge"})
    props.append({"x": col * T + rnd.randint(-6, 6), "y": 8 * T + rnd.randint(-6, 6), "tex": "fn-pine-dense"})

props.sort(key=lambda p: p["y"])
front_data = [[p["x"], p["y"], p["tex"]] for p in props]

meta = {
    "chunk": CHUNK,
    "cols": 5,
    "rows": 3,
    "front": front_data
}

# 4. Save fnb-meta.json
for dest_dir in [OUT_MAPS, OUT_MAPS_PROJ]:
    os.makedirs(dest_dir, exist_ok=True)
    with open(os.path.join(dest_dir, "fnb-meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

# 5. Export 15 Chunks (512x512)
for y_idx in range(3):
    for x_idx in range(5):
        box = (x_idx * CHUNK, y_idx * CHUNK, (x_idx + 1) * CHUNK, (y_idx + 1) * CHUNK)
        chunk_im = master.crop(box)
        fn = f"fnb-{x_idx}-{y_idx}.png"
        chunk_im.save(os.path.join(OUT_MAPS, fn))
        chunk_im.save(os.path.join(OUT_MAPS_PROJ, fn))

print(f"Exported {len(props)} props and 15 chunks cleanly!")
