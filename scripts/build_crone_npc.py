"""
A velha da cabana (pack "Priest Pixel Art Character Sprite Sheets", CraftPix, fora do repositório pela licença).
Usa Priests_1 (a senhora encapuzada). Gera assets/pixel-art/npc/velha.png: quadros de 48x68
  linha 0: parada (8)   linha 1: falando (11)   linha 2: andando (12)
e velha-face.png (rosto ampliado para o retrato do diálogo).
Uso: PRIEST_PACK="/pasta/do/pack" python3 scripts/build_crone_npc.py
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.environ.get("PRIEST_PACK", "/tmp/pr/x")
FW, FH, X0, Y0 = 48, 68, 42, 60


def main():
    rows = [("Idle", 8), ("Dialogue", 11), ("Walk", 12)]
    out = Image.new("RGBA", (FW * 12, FH * len(rows)))
    for r, (name, n) in enumerate(rows):
        s = Image.open(os.path.join(PACK, "Priests_1", name + ".png")).convert("RGBA")
        for k in range(n):
            out.paste(s.crop((k * 128 + X0, Y0, k * 128 + X0 + FW, Y0 + FH)), (k * FW, r * FH))
    idle = Image.open(os.path.join(PACK, "Priests_1", "Idle.png")).convert("RGBA")
    face = idle.crop((55, 58, 79, 82)).resize((120, 120), Image.NEAREST)
    pf = Image.new("RGBA", (128, 128)); pf.paste(face, (4, 8), face)
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        d = os.path.join(base, "assets", "pixel-art", "npc")
        os.makedirs(d, exist_ok=True)
        out.save(os.path.join(d, "velha.png"), optimize=True)
        pf.save(os.path.join(d, "velha-face.png"), optimize=True)
    print("velha", out.size)


if __name__ == "__main__":
    main()
