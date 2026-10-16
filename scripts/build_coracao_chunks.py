"""
Gera os novos chunks frb-2-0.png e frb-3-0.png para o Coração da Floresta circular.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF_PATH = r'C:/Users/rafaelscarpille/.gemini/antigravity/brain/f32dd795-4fc4-4eee-a304-6a2759fd9a03/.user_uploaded/media_1792109253492_dc616e7b.jpg'
QUAD_PATH = r'C:\Users\rafaelscarpille\.gemini\antigravity\brain\f32dd795-4fc4-4eee-a304-6a2759fd9a03\full_coracao_quadrant.png'

ref = Image.open(REF_PATH).convert('RGBA')
quad = Image.open(QUAD_PATH).convert('RGBA')

w, h = 1024, 512
clean = Image.new('RGBA', (w, h))

# Base de árvores da floresta original
clean.paste(quad.crop((0, 0, w, h)), (0, 0))

# Redimensionar arte do santuário circular para caber precisamente nos 1024x512 dos dois chunks
ref_resized = ref.resize((1024, 512), Image.Resampling.LANCZOS)
clean.paste(ref_resized, (0, 0))

# 1. Inpaint do personagem Hayato no centro do pátio
# Clona a lajota espelhada simétrica do lado direito
cobble_patch = ref_resized.crop((495, 215, 530, 280)).transpose(Image.FLIP_LEFT_RIGHT)
clean.paste(cobble_patch, (455, 215))

# 2. Inpaint do HUD superior
# Canto superior esquerdo (retrato do herói) -> árvores da floresta
clean.paste(quad.crop((5, 5, 125, 95)), (5, 5))
# Canto superior direito (título e salas) -> árvores da floresta
clean.paste(quad.crop((750, 10, 1015, 65)), (750, 10))
# Botão habilidades à esquerda
clean.paste(quad.crop((10, 175, 115, 225)), (10, 175))

# 3. Inpaint do HUD inferior (orbes, barra de skills e minimapa)
# Abaixo de y=415 fica a clareira verde original e árvores
clean.paste(quad.crop((0, 412, 1024, 512)), (0, 412))
# Canto inferior direito (área do minimapa na referência: x=820..1015, y=320..420)
# Substituir pelas rochas e árvores da margem do riacho
clean.paste(quad.crop((820, 320, 1015, 412)), (820, 320))

# Salvar visualização
clean.save(r'C:\Users\rafaelscarpille\.gemini\antigravity\brain\f32dd795-4fc4-4eee-a304-6a2759fd9a03\coracao_clean_final.png')

# Dividir nos dois chunks 512x512
c20 = clean.crop((0, 0, 512, 512))
c30 = clean.crop((512, 0, 1024, 512))

paths = [
    os.path.join(ROOT, 'assets', 'pixel-art', 'forest-open'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'pixel-art', 'forest-open')
]

for p in paths:
    os.makedirs(p, exist_ok=True)
    c20.save(os.path.join(p, 'frb-2-0.png'), optimize=True)
    c30.save(os.path.join(p, 'frb-3-0.png'), optimize=True)

print('[OK] Chunks frb-2-0.png e frb-3-0.png gerados e sincronizados com sucesso!')
