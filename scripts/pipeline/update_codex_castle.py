import os
import sys
import shutil
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

UPLOAD_DIR = "C:/Users/rafaelscarpille/.gemini/antigravity/brain/b413688e-2beb-42e0-9d5c-24c0349908a1/.user_uploaded"
ART_DIR = "C:/Users/rafaelscarpille/.gemini/antigravity/brain/b413688e-2beb-42e0-9d5c-24c0349908a1"

src_name = "media_1793661809863_44a23c51.jpg"
src_path = os.path.join(UPLOAD_DIR, src_name)

if not os.path.exists(src_path):
    print(f"ERROR: File not found: {src_path}")
    sys.exit(1)

im = Image.open(src_path)
print(f"Source image: {im.size}, mode: {im.mode}")
if im.mode != "RGB":
    im = im.convert("RGB")

# Copy preview
dst_preview = os.path.join(ART_DIR, "codex_map_castle_preview.jpg")
shutil.copy2(src_path, dst_preview)
print(f"Preview saved to {dst_preview}")

targets = [
    "assets/images/codex_maps/map_castle.jpg",
    "Projeto atualizado/assets/images/codex_maps/map_castle.jpg",
    "assets/pixel-art/story/vis-castle.jpg",
    "Projeto atualizado/assets/pixel-art/story/vis-castle.jpg"
]

for target in targets:
    os.makedirs(os.path.dirname(target), exist_ok=True)
    im.save(target, "JPEG", quality=92, optimize=True)
    print(f"Saved to {target} ({os.path.getsize(target)} bytes)")

# Update bundles to preload vis-castle as well
old_p = '["pr-1","pr-2","pr-3","pr-4","pr-5","pr-6","vis-catacombs","vis-ruins","vis-glacial","vis-fortress","vis-bosque","vis-rio","vis-morta","vis-temple"]'
new_p = '["pr-1","pr-2","pr-3","pr-4","pr-5","pr-6","vis-catacombs","vis-ruins","vis-glacial","vis-fortress","vis-bosque","vis-rio","vis-morta","vis-temple","vis-castle"]'

bundles = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

for b in bundles:
    with open(b, "r", encoding="utf-8") as f:
        content = f.read()
    if old_p in content:
        content = content.replace(old_p, new_p)
        with open(b, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {b} with vis-castle preload.")
    elif new_p in content:
        print(f"{b} already has vis-castle preload.")
    else:
        print(f"Pattern not found in {b}")

print("\nCastle map successfully updated!")
