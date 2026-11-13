"""Pesca no mar (doca do Refúgio): copia as 10 animações de peixe pulando do pacote CraftPix "Fishing and Gathering
pixel art RPG icons" (32x32 por quadro) e escolhe o quadro em que o peixe aparece inteiro para servir de ícone.
Saída: assets/pixel-art/hub/pesca/fish1..10.png + pesca.json {fish: [{n quadros, icon}]}
Uso: python3 scripts/build_pesca.py <pasta PNG_n_Tiled do pacote>"""
import json, os, sys
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, "assets", "pixel-art", "hub", "pesca"); SRC = sys.argv[1]
os.makedirs(OUT, exist_ok=True); info = []
for i in range(1, 11):
    im = Image.open(os.path.join(SRC, f"Fish{i}.png")).convert("RGBA"); n = im.width // 32
    a = np.array(im)[..., 3]
    # o ícone: o quadro com mais pixels opacos na metade de cima (o peixe fora d'água, sem as ondinhas)
    score = [int((a[:, k * 32:(k + 1) * 32] > 200).sum()) for k in range(n)]
    icon = int(np.argmax(score)); im.save(os.path.join(OUT, f"fish{i}.png")); info.append({"n": n, "icon": icon})
json.dump({"fish": info}, open(os.path.join(OUT, "pesca.json"), "w")); print(info)
