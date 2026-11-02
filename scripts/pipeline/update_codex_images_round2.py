import os
import sys
import shutil
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

UPLOAD_DIR = "C:/Users/rafaelscarpille/.gemini/antigravity/brain/b413688e-2beb-42e0-9d5c-24c0349908a1/.user_uploaded"
ART_DIR = "C:/Users/rafaelscarpille/.gemini/antigravity/brain/b413688e-2beb-42e0-9d5c-24c0349908a1"

IMAGE_MAPPING = {
    "media_1793660983661_9c02b2df.jpg": {
        "desc": "Catacumbas Ancestrais (Arcos de Pedra, Tochas, Pedestais e Subterrâneo)",
        "preview": "codex_map_catacombs_preview.jpg",
        "targets": [
            "assets/images/codex_maps/map_catacombs.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_catacombs.jpg",
            "assets/pixel-art/story/vis-catacombs.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-catacombs.jpg"
        ]
    },
    "media_1793660983666_e0acdbba.jpg": {
        "desc": "Cidadela Glacial (Gelo, Estalactites, Maças de Espinhos e Fogo Azul)",
        "preview": "codex_map_glacial_preview.jpg",
        "targets": [
            "assets/images/codex_maps/map_glacial.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_glacial.jpg",
            "assets/pixel-art/story/vis-glacial.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-glacial.jpg"
        ]
    },
    "media_1793660983674_ebf3cc58.jpg": {
        "desc": "Deserto Esquecido / Templo (Dunas, Cactos, Armadilhas de Espinhos e Monstros)",
        "preview": "codex_map_temple_preview.jpg",
        "targets": [
            "assets/images/codex_maps/map_temple.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_temple.jpg",
            "assets/pixel-art/story/vis-temple.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-temple.jpg"
        ]
    },
    "media_1793660983682_e646dbe5.jpg": {
        "desc": "Fortaleza dos Dragões (Salão Nobre, Tapete Vermelho, Tochas e Dragão Alado)",
        "preview": "codex_map_fortress_preview.jpg",
        "targets": [
            "assets/images/codex_maps/map_fortress.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_fortress.jpg",
            "assets/pixel-art/story/vis-fortress.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-fortress.jpg"
        ]
    },
    "media_1793660983844_1a5d0123.jpg": {
        "desc": "Ruínas Antigas (Pórticos, Colunas de Pedra com Musgo e Bosque)",
        "preview": "codex_map_ruins_preview.jpg",
        "targets": [
            "assets/images/codex_maps/map_ruins.jpg",
            "Projeto atualizado/assets/images/codex_maps/map_ruins.jpg",
            "assets/pixel-art/story/vis-ruins.jpg",
            "Projeto atualizado/assets/pixel-art/story/vis-ruins.jpg"
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

    if im.mode != "RGB":
        im = im.convert("RGB")

    # Copy to preview
    dst_preview = os.path.join(ART_DIR, info["preview"])
    shutil.copy2(src_path, dst_preview)
    print(f"  -> Preview copied to {dst_preview}")

    for target in info["targets"]:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        im.save(target, "JPEG", quality=92, optimize=True)
        print(f"  -> Saved to {target} ({os.path.getsize(target)} bytes)")

print("\nAll round 2 codex images successfully copied and converted.")
