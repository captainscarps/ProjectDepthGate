import os, io, zipfile
from PIL import Image

def process_assets():
    base_dirs = [
        r'assets',
        r'Projeto atualizado\assets'
    ]

    satyr_zip = r'c:\Users\rafaelscarpille\Downloads\Chefe duplo - irmãs Satiro.zip'
    demon_zip = r'c:\Users\rafaelscarpille\Downloads\Inimigo comum novo - Demon das sombras.zip'
    floresta_zip = r'c:\Users\rafaelscarpille\Downloads\Floresta nevada.zip'
    mina_zip = r'c:\Users\rafaelscarpille\Downloads\Mina abandonada.zip'

    print("--- 1. Processing Satyr Sisters ---")
    with zipfile.ZipFile(satyr_zip, 'r') as z:
        # Satyr 1: Idle(7), Walk(12), Attack(4), Charge(10), Hurt(4), Dead(4)
        # Total = 41 frames = 5248x128
        s1_anims = ['Idle.png', 'Walk.png', 'Attack.png', 'Charge.png', 'Hurt.png', 'Dead.png']
        s1_imgs = []
        for anim in s1_anims:
            match = [n for n in z.namelist() if 'Satyr_1' in n and n.endswith(anim)][0]
            img = Image.open(io.BytesIO(z.read(match))).convert('RGBA')
            s1_imgs.append(img)
        total_w = sum(img.width for img in s1_imgs)
        satyr1_sheet = Image.new('RGBA', (total_w, 128), (0, 0, 0, 0))
        cur_x = 0
        for img in s1_imgs:
            satyr1_sheet.paste(img, (cur_x, 0))
            cur_x += img.width
        print(f"Satyr 1 sheet: {satyr1_sheet.size} ({total_w // 128} frames)")

        # Satyr 2: Idle(7), Walk(12), Attack(8), Charge(8), Hurt(4), Dead(4)
        # Total = 43 frames = 5504x128
        s2_anims = ['Idle.png', 'Walk.png', 'Attack.png', 'Charge.png', 'Hurt.png', 'Dead.png']
        s2_imgs = []
        for anim in s2_anims:
            match = [n for n in z.namelist() if 'Satyr_2' in n and n.endswith(anim)][0]
            img = Image.open(io.BytesIO(z.read(match))).convert('RGBA')
            s2_imgs.append(img)
        total_w2 = sum(img.width for img in s2_imgs)
        satyr2_sheet = Image.new('RGBA', (total_w2, 128), (0, 0, 0, 0))
        cur_x = 0
        for img in s2_imgs:
            satyr2_sheet.paste(img, (cur_x, 0))
            cur_x += img.width
        print(f"Satyr 2 sheet: {satyr2_sheet.size} ({total_w2 // 128} frames)")

    print("--- 2. Processing Shadow Demons ---")
    with zipfile.ZipFile(demon_zip, 'r') as z:
        # Demon 1: Idle(8), Walk(10), Attack(6), Hurt(6), Dead(11)
        # Total = 41 frames = 5248x128
        d1_anims = ['Idle.png', 'Walk.png', 'Attack.png', 'Hurt.png', 'Dead.png']
        d1_imgs = []
        for anim in d1_anims:
            match = [n for n in z.namelist() if ('sombras 1' in n or 'sombras_1' in n) and n.endswith(anim)][0]
            img = Image.open(io.BytesIO(z.read(match))).convert('RGBA')
            d1_imgs.append(img)
        total_wd1 = sum(img.width for img in d1_imgs)
        demon1_sheet = Image.new('RGBA', (total_wd1, 128), (0, 0, 0, 0))
        cur_x = 0
        for img in d1_imgs:
            demon1_sheet.paste(img, (cur_x, 0))
            cur_x += img.width
        print(f"Demon 1 sheet: {demon1_sheet.size} ({total_wd1 // 128} frames)")

        # Demon 2: Idle(8), Walk(10), Attack(7), Charge(7 scaled 2x), Hurt(6), Dead(12)
        # Total = 50 frames = 6400x128
        d2_anims = ['Idle.png', 'Walk.png', 'Attack.png', 'Charge.png', 'Hurt.png', 'Dead.png']
        d2_imgs = []
        for anim in d2_anims:
            match = [n for n in z.namelist() if 'vers' in n and n.endswith(anim)][0]
            img = Image.open(io.BytesIO(z.read(match))).convert('RGBA')
            if anim == 'Charge.png' and img.height == 64:
                # Upscale 2x nearest-neighbor to match 128 height
                img = img.resize((img.width * 2, img.height * 2), Image.Resampling.NEAREST)
            d2_imgs.append(img)
        total_wd2 = sum(img.width for img in d2_imgs)
        demon2_sheet = Image.new('RGBA', (total_wd2, 128), (0, 0, 0, 0))
        cur_x = 0
        for img in d2_imgs:
            demon2_sheet.paste(img, (cur_x, 0))
            cur_x += img.width
        print(f"Demon 2 sheet: {demon2_sheet.size} ({total_wd2 // 128} frames)")

    print("--- 3. Processing Floresta Nevada ---")
    with zipfile.ZipFile(floresta_zip, 'r') as z:
        match_32 = [n for n in z.namelist() if '32x32.png' in n][0]
        floresta_tiles_32 = Image.open(io.BytesIO(z.read(match_32))).convert('RGBA')
        print(f"Floresta nevada tiles 32x32: {floresta_tiles_32.size}")

        floresta_decor_files = {}
        for n in z.namelist():
            if n.endswith('.png') and ('RPG' in n or 'All Tileset' in n):
                bn = os.path.basename(n)
                floresta_decor_files[bn] = Image.open(io.BytesIO(z.read(n))).convert('RGBA')

    print("--- 4. Processing Mina Abandonada ---")
    with zipfile.ZipFile(mina_zip, 'r') as z:
        match_mina_32 = [n for n in z.namelist() if '32x32.png' in n][0]
        mina_tiles_32 = Image.open(io.BytesIO(z.read(match_mina_32))).convert('RGBA')
        print(f"Mina abandonada tiles 32x32: {mina_tiles_32.size}")

        mina_decor_files = {}
        for n in z.namelist():
            if n.endswith('.png'):
                bn = os.path.basename(n)
                mina_decor_files[bn] = Image.open(io.BytesIO(z.read(n))).convert('RGBA')

    print("--- 5. Saving to target directories ---")
    for base in base_dirs:
        boss_dir = os.path.join(base, 'pixel-art', 'bosses')
        enemy_dir = os.path.join(base, 'pixel-art', 'enemies')
        tile_dir = os.path.join(base, 'pixel-art', 'tiles')
        scenery_dir = os.path.join(base, 'pixel-art', 'scenery')

        os.makedirs(boss_dir, exist_ok=True)
        os.makedirs(enemy_dir, exist_ok=True)
        os.makedirs(tile_dir, exist_ok=True)
        os.makedirs(os.path.join(scenery_dir, 'floresta_nevada'), exist_ok=True)
        os.makedirs(os.path.join(scenery_dir, 'mina_abandonada'), exist_ok=True)

        satyr1_sheet.save(os.path.join(boss_dir, 'boss-satyr-sister1.png'), 'PNG')
        satyr2_sheet.save(os.path.join(boss_dir, 'boss-satyr-sister2.png'), 'PNG')
        demon1_sheet.save(os.path.join(enemy_dir, 'enemy-shadow-demon1.png'), 'PNG')
        demon2_sheet.save(os.path.join(enemy_dir, 'enemy-shadow-demon2.png'), 'PNG')

        floresta_tiles_32.save(os.path.join(tile_dir, 'tiles-floresta-nevada.png'), 'PNG')
        mina_tiles_32.save(os.path.join(tile_dir, 'tiles-mina-abandonada.png'), 'PNG')

        for fname, img in floresta_decor_files.items():
            img.save(os.path.join(scenery_dir, 'floresta_nevada', fname), 'PNG')
        for fname, img in mina_decor_files.items():
            img.save(os.path.join(scenery_dir, 'mina_abandonada', fname), 'PNG')

        print(f"Saved all processed assets to: {base}")

process_assets()
