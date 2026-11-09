"""Refúgio: troca os ladrilhos "gastos" (quadrados lisos e mais escuros, de 16 px) que ficaram espalhados pela praça
de tijolos do ground.png por ladrilhos normais do mesmo pavimento — eles apareciam como manchas quadradas.
A sombra da casa da forja (faixa escura logo abaixo dela) fica como está.
Uso: python3 scripts/fix_hub_ground_patches.py   (idempotente)
"""
import os
from collections import Counter

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATHS = [os.path.join(ROOT, p, "assets", "pixel-art", "hub", "village", "ground.png") for p in ("", "Projeto atualizado")]
T = 16


def main():
    g = np.array(Image.open(PATHS[0]).convert("RGBA"))
    H, W = g.shape[:2]
    cells = {(x, y): g[y:y + T, x:x + T].copy() for y in range(0, H, T) for x in range(0, W, T)}
    cnt = Counter(c[..., :3].tobytes() for c in cells.values())
    stat = {k: (np.frombuffer(k, np.uint8).reshape(T, T, 3).astype(int)) for k, n in cnt.items() if n >= 8}
    good = [k for k, a in stat.items() if 157 <= a.mean() <= 161 and a.std() > 30]        # tijolos normais
    worn = {k for k, a in stat.items() if 138 <= a.mean() <= 153.5 and 24 <= a.std() <= 31}  # ladrilhos gastos
    good_t = [np.frombuffer(k, np.uint8).reshape(T, T, 3) for k in good]
    n = 0
    for (x, y), c in cells.items():
        if c[..., :3].tobytes() not in worn or (400 <= x <= 544 and 232 <= y <= 288):
            continue
        g[y:y + T, x:x + T, :3] = good_t[(x * 7 + y * 13) // T % len(good_t)]
        n += 1
    for p in PATHS:
        Image.fromarray(g).save(p, optimize=True)
    print("ladrilhos trocados:", n)


if __name__ == "__main__":
    main()
