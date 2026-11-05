"""
Extrai e processa os novos NPCs dos dois packs CraftPix:
  1. Elfos (3 personagens: elf-1, elf-2, elf-3)
  2. Aldeões (4 personagens: peasant-1, peasant-2, peasant-3, peasant-4)

Gera:
  - Spritesheets compostos e padronizados em assets/pixel-art/npc/
  - Retratos de diálogo 128x128 em assets/pixel-art/npc/*-p-*.png
  - Pastas com todos os sprites originais preservados
  - Espelho completo em Projeto atualizado/assets/pixel-art/npc/
"""

import os
import sys
import zipfile
import io
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP_ELF = r"c:\Users\rafaelscarpille\Downloads\craftpix_net_514604_npc_elf_2d_pixel_art_character_sprite_pack_1.zip"
ZIP_PEASANT = r"c:\Users\rafaelscarpille\Downloads\craftpix_net_126405_village_npc_pixel_art_character_sprite_pack.zip"

NPC_DIR = os.path.join(ROOT, "assets", "pixel-art", "npc")
MIRROR_DIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "npc")
os.makedirs(NPC_DIR, exist_ok=True)
os.makedirs(MIRROR_DIR, exist_ok=True)

def create_bust_portrait(char_frame, zoom=1.75):
    """
    Cria um retrato de diálogo 128x128 focando no rosto/busto do personagem.
    char_frame é uma imagem 128x128 transparente do personagem.
    """
    bbox = char_frame.getbbox()
    if not bbox:
        return char_frame
    
    # Busto: x centrado em 64, y da cabeça até a cintura
    min_x, min_y, max_x, max_y = bbox
    head_cx = (min_x + max_x) // 2
    # Pegar os 45% superiores do corpo
    char_h = max_y - min_y
    bust_h = int(char_h * 0.58)
    bust_y2 = min_y + bust_h
    bust_w = int(bust_h * 0.9)
    bust_x1 = max(0, head_cx - bust_w // 2)
    bust_x2 = min(128, bust_x1 + bust_w)
    
    cropped = char_frame.crop((bust_x1, min_y, bust_x2, bust_y2))
    
    # Redimensionar proporcionalmente para caber em ~110x110
    target_size = int(128 * 0.88)
    ratio = min(target_size / cropped.width, target_size / cropped.height)
    new_w = int(cropped.width * ratio)
    new_h = int(cropped.height * ratio)
    resized = cropped.resize((new_w, new_h), Image.Resampling.NEAREST)
    
    portrait = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    paste_x = (128 - new_w) // 2
    paste_y = 128 - new_h - 4
    portrait.paste(resized, (paste_x, paste_y), resized)
    return portrait

def build_composite_sheet(rows_images, cols=16, frame_size=128):
    """
    rows_images: lista de imagens PIL para cada linha (row 0, row 1, etc.)
    Cada linha terá cols frames de frame_size x frame_size.
    """
    total_rows = len(rows_images)
    sheet_w = cols * frame_size
    sheet_h = total_rows * frame_size
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    
    for r_idx, row_img in enumerate(rows_images):
        if not row_img:
            continue
        num_frames = min(cols, row_img.width // frame_size)
        crop_w = num_frames * frame_size
        chunk = row_img.crop((0, 0, crop_w, frame_size))
        sheet.paste(chunk, (0, r_idx * frame_size), chunk)
        
    return sheet

# 1. Processar Elfos
print("=== Processando Elfos ===")
with zipfile.ZipFile(ZIP_ELF, "r") as z:
    for elf_id, zip_folder in [("elf-1", "Elf_1"), ("elf-2", "Elf_2"), ("elf-3", "Elf_3")]:
        print(f"Processando {elf_id} ({zip_folder})...")
        out_sub = os.path.join(NPC_DIR, elf_id)
        os.makedirs(out_sub, exist_ok=True)
        
        # Extrair originais
        imgs = {}
        for item in z.namelist():
            if item.startswith(zip_folder + "/") and item.endswith(".png") and "__MACOSX" not in item:
                fname = os.path.basename(item)
                data = z.read(item)
                with open(os.path.join(out_sub, fname), "wb") as f:
                    f.write(data)
                imgs[fname.lower()] = Image.open(io.BytesIO(data))
        
        # Mapear linhas:
        # row 0: idle
        # row 1: idle2
        # row 2: walk
        # row 3: dialogue / talk
        # row 4: special
        idle = imgs.get("idle.png")
        idle2 = imgs.get("idle 2.png") or imgs.get("idle_2.png") or imgs.get("iale 2.png")
        walk = imgs.get("walk.png")
        talk = imgs.get("dialogue.png")
        special = imgs.get("special.png")
        
        rows = [idle, idle2, walk, talk, special]
        sheet = build_composite_sheet(rows, cols=16, frame_size=128)
        sheet_path = os.path.join(NPC_DIR, f"{elf_id}.png")
        sheet.save(sheet_path)
        print(f"  Salvo: {sheet_path} ({sheet.size})")
        
        # Gerar retratos
        ref_frame = (talk or idle).crop((0, 0, 128, 128))
        portrait = create_bust_portrait(ref_frame)
        for expr in ["talk", "calm", "smile", "sadness", "aggression", "special"]:
            p_path = os.path.join(NPC_DIR, f"{elf_id}-p-{expr}.png")
            portrait.save(p_path)
        print(f"  Retratos gerados para {elf_id}")

# 2. Processar Aldeões (Peasants)
print("\n=== Processando Aldeões (Peasants) ===")
with zipfile.ZipFile(ZIP_PEASANT, "r") as z:
    for p_id, zip_folder in [
        ("peasant-1", "Peasants_1"),
        ("peasant-2", "Peasants_2"),
        ("peasant-3", "Peasants_3"),
        ("peasant-4", "Peasants_4"),
    ]:
        print(f"Processando {p_id} ({zip_folder})...")
        out_sub = os.path.join(NPC_DIR, p_id)
        os.makedirs(out_sub, exist_ok=True)
        
        # Extrair originais
        imgs = {}
        for item in z.namelist():
            if item.startswith(zip_folder + "/") and item.endswith(".png") and "__MACOSX" not in item:
                fname = os.path.basename(item)
                data = z.read(item)
                with open(os.path.join(out_sub, fname), "wb") as f:
                    f.write(data)
                imgs[fname.lower()] = Image.open(io.BytesIO(data))
        
        idle = imgs.get("idle.png")
        idle2 = imgs.get("idle_2.png")
        walk = imgs.get("walk.png")
        talk = imgs.get("dialogue.png") or idle
        sell = imgs.get("sell.png")
        
        if p_id == "peasant-1":
            rows = [idle, idle2, walk or idle, talk]
        elif p_id == "peasant-2":
            rows = [idle, idle2, walk, talk]
        elif p_id == "peasant-3":
            rows = [idle, walk, talk, sell]
        elif p_id == "peasant-4":
            rows = [idle, walk, sell, talk]
            
        sheet = build_composite_sheet(rows, cols=16, frame_size=128)
        sheet_path = os.path.join(NPC_DIR, f"{p_id}.png")
        sheet.save(sheet_path)
        print(f"  Salvo: {sheet_path} ({sheet.size})")
        
        # Gerar retratos
        ref_frame = (talk or idle).crop((0, 0, 128, 128))
        portrait = create_bust_portrait(ref_frame)
        for expr in ["talk", "calm", "smile", "sadness", "aggression", "special"]:
            p_path = os.path.join(NPC_DIR, f"{p_id}-p-{expr}.png")
            portrait.save(p_path)
        print(f"  Retratos gerados para {p_id}")

# 3. Espelhar em Projeto atualizado/assets/pixel-art/npc/
print("\n=== Espelhando para Projeto atualizado ===")
import shutil
for item in os.listdir(NPC_DIR):
    s_item = os.path.join(NPC_DIR, item)
    d_item = os.path.join(MIRROR_DIR, item)
    if os.path.isdir(s_item):
        if os.path.exists(d_item):
            shutil.rmtree(d_item)
        shutil.copytree(s_item, d_item)
    else:
        shutil.copy2(s_item, d_item)

print("Espelhamento concluído com sucesso!")
