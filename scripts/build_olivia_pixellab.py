#!/usr/bin/env python3
"""Olivia refeita (p216.47) — PixelLab, com o rosto do retrato das falas (trança de lado, olhos castanhos).
Fontes: scripts/art-src/npcs/olivia-src.png (pose base) e olivia-run/-jump/-reach.png (tiras 192×192; quadro 0 = base).
Saída npc/olivia.png em quadros de 192×192 (15 × 3), nas posições usadas por olivia.js:
  0–9 correndo (10 quadros) · 15 parada · 16–29 pulando/brincando · 30–33 acenando.
A escala no jogo é a antiga × K (olivia.js), para ficar do mesmo tamanho e mais nítida."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/npcs")
F = 192

def frames(n):
    im = Image.open(os.path.join(SRC, f"olivia-{n}.png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

run, jump, reach = frames("run"), frames("jump"), frames("reach")
base = Image.open(os.path.join(SRC, "olivia-src.png")).convert("RGBA")
slots = {i: f for i, f in enumerate(run[3:13])}
slots[15] = base
slots.update({16 + i: f for i, f in enumerate(jump[1:15])})
slots.update({30 + i: f for i, f in enumerate(reach[1:5])})
sh = Image.new("RGBA", (F * 15, F * 3))
for i, f in slots.items(): sh.paste(f, ((i % 15) * F, (i // 15) * F + 5), f)    # pé de 186 → 191 (o sprite é preso pela base)
sh.save(os.path.join(ROOT, "assets/pixel-art/npc/olivia.png"), optimize=True)
b = base.getbbox(); print("olivia", sh.size, "altura parada", b[3] - b[1], "K", round(70 / (b[3] - b[1]), 4))
