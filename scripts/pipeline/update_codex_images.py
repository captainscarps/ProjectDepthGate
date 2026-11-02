import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

UPLOAD_DIR = "C:/Users/rafaelscarpille/.gemini/antigravity/brain/b413688e-2beb-42e0-9d5c-24c0349908a1/.user_uploaded"

IMAGE_MAPPING = {
    "media_1793660922961_d0c9e138.jpg": {
        "desc": "Profundezas Amazônicas (Sumaúma, Aldeia, Arara e Selva)",
        "targets": [
            "assets/images/codex_maps/map_bosque.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_bosque.jpg",
            "assets/pixel-art/story/vis-bosque.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-bosque.jpg"
        ]
    },
    "media_1793660922953_0a8be27b.jpg": {
        "desc": "Vulcão de Cinzas (Lava, Pontes de Pedra e Portal com Crânio)",
        "targets": [
            "assets/images/codex_maps/map_vulcao.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_vulcao.jpg"
        ]
    },
    "media_1793660922945_50d1d594.jpg": {
        "desc": "Ilhas & Rios do Abismo (Praias Tropicais, Palmeiras e Fortaleza)",
        "targets": [
            "assets/images/codex_maps/map_rio.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_rio.jpg",
            "assets/pixel-art/story/vis-rio.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-rio.jpg"
        ]
    },
    "media_1793660922939_0e308ee9.jpg": {
        "desc": "Floresta Morta & Cemitério (Árvores Secas, Esqueletos e Almas)",
        "targets": [
            "assets/images/codex_maps/map_morta.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_morta.jpg",
            "assets/images/codex_maps/map_cripta.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_cripta.jpg",
            "assets/pixel-art/story/vis-morta.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-morta.jpg"
        ]
    },
    "media_1793660922936_ea40c664.jpg": {
        "desc": "Cabana da Bruxa & Floresta da Cripta (Casa na Floresta com Luz Verde)",
        "targets": [
            "assets/images/codex_maps/map_bruxa.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_bruxa.jpg"
        ]
    }
}

for fname, info in IMAGE_MAPPING.items():
    src_path = os.path.join(UPLOAD_DIR, fname)
    if not os.path.exists(src_path):
        print(f"ERROR: Source image not found: {src_path}")
        continue

    print(f"\nProcessing {info['desc']} ({fname})...")
    im = Image.open(src_path)
    print(f"  Source size: {im.size}, mode: {im.mode}")

    # Convert to RGB if necessary
    if im.mode != "RGB":
        im = im.convert("RGB")

    for target in info["targets"]:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        # Save high quality JPEG (quality=92)
        im.save(target, "JPEG", quality=92, optimize=True)
        print(f"  -> Saved to {target} ({os.path.getsize(target)} bytes)")

print("\nAll codex images successfully copied and converted.")
