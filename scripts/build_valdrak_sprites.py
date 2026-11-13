"""
Sprites da missão "O Rei que Abriu as Portas" (Valdrak antiga), a partir dos pacotes da craftpix:
  - Aelric jovem  = Anime Warrior Man, personagem Man_3 (lança)
  - Aelric rei    = Elf King (King)
  - Elyndra rainha = Elf Queen (Queen)
Copia as faixas (quadros de 128x128, olhando para a direita) para assets/pixel-art/valdrak/ e grava
valdrak-sprites.json com o número de quadros de cada animação.
Uso: python3 scripts/build_valdrak_sprites.py <pasta do pacote elf-king-queen> <pasta do pacote anime-warrior>
"""
import json, os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "pixel-art", "valdrak"); os.makedirs(OUT, exist_ok=True)
king_dir, young_dir = sys.argv[1], sys.argv[2]
SETS = {
  "aelric-young": (os.path.join(young_dir, "Man_3"), ["Idle", "Idle_2", "Walk", "Run", "Attack_1", "Attack_2", "Run+Attack", "Jump", "Hurt", "Dead"]),
  "aelric-king": (os.path.join(king_dir, "King"), ["Idle", "Walk", "Attack", "Protection", "Special", "Dialogue"]),
  "elyndra-queen": (os.path.join(king_dir, "Queen"), ["Idle", "Walk", "Attack", "Protection", "Shield", "Charge", "Special", "Dialogue"]),
}
meta = {}
for who, (d, anims) in SETS.items():
    meta[who] = {}
    for a in anims:
        im = Image.open(os.path.join(d, a + ".png")).convert("RGBA")
        assert im.height == 128 and im.width % 128 == 0, (who, a, im.size)
        key = a.lower().replace("+", "-").replace("_", "")
        im.save(os.path.join(OUT, f"{who}-{key}.png"), optimize=True)
        meta[who][key] = im.width // 128
json.dump(meta, open(os.path.join(OUT, "valdrak-sprites.json"), "w"), indent=1)
print(json.dumps(meta))
