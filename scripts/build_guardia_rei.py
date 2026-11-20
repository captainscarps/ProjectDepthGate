#!/usr/bin/env python3
"""Guardiã e Rei refeitos (PixelLab): story/<nome>-sp-idle.png e -sp-talk.png, quadros 128×128, mesmo tamanho e
posição das folhas antigas (altura ~71/73 px, base do vestido/bota na linha 126; o jogo prende em 124/128).
Fontes scripts/art-src/historia/<nome>-idle/-talk.png (192×192; quadro 0 = imagem de entrada).
A parada da Guardiã saiu acinzentada na IA: ela usa os primeiros quadros (ainda parados) da fala."""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/historia"); OUT = os.path.join(ROOT, "assets/pixel-art/story")
F, S = 192, 128
T = {"guardia": (71, 63.5), "rei": (73, 59.5)}      # altura e centro x das folhas antigas

def frames(n, k):
    im = Image.open(os.path.join(SRC, f"{n}-{k}.png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

for n, (H, CX) in T.items():
    src = Image.open(os.path.join(SRC, f"{n}-src.png")).convert("RGBA")
    ys, xs = np.nonzero(np.array(src)[..., 3] > 0); h0 = ys.max() - ys.min()
    k = H / h0; size = round(F * k)
    def put(fr, dx, dy):
        a = np.array(fr.resize((size, size), Image.LANCZOS)); a[..., 3] = np.where(a[..., 3] >= 110, 255, 0); a[a[..., 3] == 0] = 0
        s = Image.fromarray(a, "RGBA"); c = Image.new("RGBA", (S, S)); c.paste(s, (dx, dy), s); return c
    r0 = Image.fromarray(np.array(src.resize((size, size), Image.LANCZOS)), "RGBA"); a0 = np.array(r0)[..., 3] >= 110
    yy, xx = np.nonzero(a0); dx, dy = round(CX - xx.mean()), 126 - yy.max()
    talk = frames(n, "talk"); idle = frames(n, "idle")
    seq = {"idle": ([talk[i] for i in (0, 1, 2, 3, 2, 1, 0)] if n == "guardia" else idle[1:8]), "talk": talk[1:9]}
    for a, fr in seq.items():
        sh = Image.new("RGBA", (S * len(fr), S))
        for i, f in enumerate(fr): sh.alpha_composite(put(f, dx, dy), (i * S, 0))
        sh.save(os.path.join(OUT, f"{n}-sp-{a}.png"), optimize=True)
    print(n, "escala", round(k, 3), "dx,dy", dx, dy)
