import os
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "moltenborn_extracted", "Moltenborn")
DEST = os.path.join(ROOT, "assets", "pixel-art", "enemies")
DEST_PROJ = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "enemies")
os.makedirs(DEST, exist_ok=True)
os.makedirs(DEST_PROJ, exist_ok=True)

CHARS = [
    "ash-spirit",
    "basalt-colossus",
    "cinder-stalker",
    "crystal-sage",
    "magma-brute",
    "meteoro"
]

def create_enemy_sheet(char_name):
    char_dir = os.path.join(SRC, "characters", char_name)
    se_path = os.path.join(char_dir, "south-east.png")
    s_path = os.path.join(char_dir, "south.png")
    e_path = os.path.join(char_dir, "east.png")
    
    base_se = Image.open(se_path if os.path.exists(se_path) else s_path).convert("RGBA")
    base_s = Image.open(s_path).convert("RGBA")
    base_e = Image.open(e_path if os.path.exists(e_path) else se_path).convert("RGBA")
    
    w, h = 64, 64
    total_frames = 28
    sheet = Image.new("RGBA", (w * total_frames, h), (0, 0, 0, 0))
    is_floating = (char_name == "ash-spirit")

    def transform_img(img, dx=0, dy=0, scale_y=1.0, tint_color=None, alpha_factor=1.0):
        res = img.copy()
        
        # Scaling height
        if scale_y != 1.0:
            new_h = max(1, int(round(h * scale_y)))
            res = res.resize((w, new_h), Image.NEAREST)
            
        # Color tint
        if tint_color:
            r_mult, g_mult, b_mult = tint_color
            r, g, b, a = res.split()
            r = r.point(lambda p: min(255, int(p * r_mult)))
            g = g.point(lambda p: min(255, int(p * g_mult)))
            b = b.point(lambda p: min(255, int(p * b_mult)))
            res = Image.merge("RGBA", (r, g, b, a))
            
        # Alpha
        if alpha_factor < 1.0:
            r, g, b, a = res.split()
            a = a.point(lambda p: int(p * alpha_factor))
            res = Image.merge("RGBA", (r, g, b, a))

        frame = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        # Anchor at bottom
        py = (h - res.height) + dy
        px = dx
        frame.paste(res, (px, py), res)
        return frame

    frames = []

    # --- IDLE (Frames 0..3) ---
    if is_floating:
        frames.append(transform_img(base_se, 0, 0))
        frames.append(transform_img(base_se, 0, -2))
        frames.append(transform_img(base_se, 0, -3))
        frames.append(transform_img(base_se, 0, -1))
    else:
        frames.append(transform_img(base_se, 0, 0, scale_y=1.0))
        frames.append(transform_img(base_se, 0, 0, scale_y=1.02))
        frames.append(transform_img(base_se, 0, -1, scale_y=1.03))
        frames.append(transform_img(base_se, 0, 0, scale_y=1.01))

    # --- WALK (Frames 4..9) ---
    if is_floating:
        for i, dy in enumerate([0, -1, -2, -1, 0, 1]):
            dx = 1 if i % 2 == 0 else -1
            frames.append(transform_img(base_se, dx, dy))
    else:
        frames.append(transform_img(base_se, 1, 0, scale_y=1.02))
        frames.append(transform_img(base_se, 2, -1, scale_y=1.04))
        frames.append(transform_img(base_se, 1, 1, scale_y=0.98))
        frames.append(transform_img(base_se, -1, 0, scale_y=1.02))
        frames.append(transform_img(base_se, -2, -1, scale_y=1.04))
        frames.append(transform_img(base_se, 0, 1, scale_y=0.98))

    # --- RUN (Frames 10..15) ---
    if is_floating:
        for i, dy in enumerate([-1, -2, -3, -2, -1, 0]):
            frames.append(transform_img(base_e, 2, dy))
    else:
        frames.append(transform_img(base_se, 2, 0, scale_y=1.03))
        frames.append(transform_img(base_se, 3, -2, scale_y=1.06))
        frames.append(transform_img(base_se, 2, 1, scale_y=0.97))
        frames.append(transform_img(base_se, -1, 0, scale_y=1.03))
        frames.append(transform_img(base_se, -2, -2, scale_y=1.06))
        frames.append(transform_img(base_se, 1, 1, scale_y=0.97))

    # --- ALERT (Frame 16) ---
    frames.append(transform_img(base_se, 0, -2, scale_y=1.04, tint_color=(1.2, 1.1, 0.9)))

    # --- WINDUP (Frames 17..18) ---
    frames.append(transform_img(base_se, -2, 0, scale_y=0.98, tint_color=(1.2, 0.9, 0.7)))
    frames.append(transform_img(base_se, -3, -1, scale_y=0.96, tint_color=(1.4, 1.0, 0.6)))

    # --- STRIKE (Frames 19..20) ---
    frames.append(transform_img(base_e, 4, 1, scale_y=1.05, tint_color=(1.5, 1.2, 0.7)))
    frames.append(transform_img(base_e, 3, 0, scale_y=1.02, tint_color=(1.3, 1.1, 0.8)))

    # --- RECOVER (Frame 21) ---
    frames.append(transform_img(base_se, 1, 0, scale_y=1.0))

    # --- HURT (Frames 22..23) ---
    frames.append(transform_img(base_se, -3, 0, tint_color=(2.0, 0.7, 0.7)))
    frames.append(transform_img(base_se, -2, 1, tint_color=(1.6, 0.8, 0.8)))

    # --- DEATH (Frames 24..27) ---
    frames.append(transform_img(base_se, 0, 1, scale_y=0.9, tint_color=(1.3, 0.8, 0.6), alpha_factor=0.85))
    frames.append(transform_img(base_se, 0, 4, scale_y=0.7, tint_color=(1.1, 0.6, 0.4), alpha_factor=0.65))
    frames.append(transform_img(base_se, 0, 8, scale_y=0.45, tint_color=(0.9, 0.5, 0.3), alpha_factor=0.45))
    frames.append(transform_img(base_se, 0, 12, scale_y=0.25, tint_color=(0.7, 0.4, 0.2), alpha_factor=0.20))

    assert len(frames) == total_frames, f"Frame count mismatch: {len(frames)}"
    for idx, f in enumerate(frames):
        sheet.paste(f, (idx * w, 0))

    for target_dir in [DEST, DEST_PROJ]:
        out_path = os.path.join(target_dir, f"mb-{char_name}.png")
        sheet.save(out_path)
        print(f"Generated {out_path} ({sheet.size})")

for c in CHARS:
    create_enemy_sheet(c)

print("All 6 Moltenborn enemy spritesheets built successfully with pure PIL!")
