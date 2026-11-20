#!/usr/bin/env python3
"""Heróis pescando (p216.49) — PixelLab. Cada herói refeito segura uma vara de pescar de verdade no desenho.
Fontes: scripts/art-src/pesca/<classe>-rod.png (herói com a vara, 192) e <classe>-cast/-wait/-reel/-catch.png
(tiras 256×256, o quadro 0 é a pose com a vara; o herói está no mesmo tamanho dos pacotes novos).
Saída: assets/pixel-art/characters/<classe>-fish.png — quadros de 208×208 (o quadro de 128 do herói com 40 px de
folga de cada lado, para a vara caber), 4 linhas × 8: 0 arremesso, 1 esperando, 2 brigando com o peixe, 3 pegou.
O pé e o meio das pernas ficam no mesmo lugar do quadro parado do herói (+40), então o sprite troca de folha sem
pular. assets/pixel-art/characters/pesca-herois.json: ponta da vara em cada quadro (de onde sai a linha)."""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/pesca")
CH = os.path.join(ROOT, "assets/pixel-art/characters")
G, S2, FS, M = 256, 170, 208, 40
ROWS = ["cast", "wait", "reel", "catch"]
# quadros (0–7) em que a IA desenhou a linha esticada ou o peixe: trocados pelo quadro bom mais perto
BAD = {"archer": {"reel": (0, 1), "catch": (0, 1)}, "necromancer": {"reel": (1,)}, "shaman": {"catch": (0, 1)},
       "rogue": {"catch": (0,)}, "berserker": {"reel": (0, 1), "catch": (0, 1)},
       "necromancer-ossos": {"reel": (0, 1), "catch": (0,)}, "mage-vendaval": {"catch": (6,)},
       "warrior-saqueador": {"cast": (5,), "catch": (0,)}, "warrior-dh": {"reel": (0, 1)},
       "warrior-nh": {"reel": (0, 1)}, "necromancer-nh": {"wait": (1, 2), "reel": (0, 1, 2), "catch": (0,)},
       "mage-nh": {"reel": (0, 1)}, "warrior-templario": {"reel": (0, 1), "catch": (0,)}, "rogue-nh": {"catch": (0, 1, 2)}, "hunter-nh": {"catch": (4, 5)}}
CLS = ["warrior", "archer", "mage", "necromancer", "druid", "shaman", "rogue", "berserker", "hunter"]
# p216.51: armaduras únicas e cabeça descoberta (lendárias) — folha própria <variante>-fish.png, alinhada à folha
# de perfil da variante (<variante>-body.png)
VARS = ["necromancer-ossos", "mage-vendaval", "warrior-saqueador", "warrior-dh", "warrior-templario"] + \
       [c + "-nh" for c in ["warrior", "berserker", "archer", "hunter", "druid", "necromancer", "mage", "rogue"]]

def shrink(fr):
    a = np.array(fr.crop((0, 0, 255, 255)).resize((S2, S2), Image.LANCZOS, reducing_gap=None))
    a[..., 3] = np.where(a[..., 3] >= 90, 255, 0); a[a[..., 3] == 0] = 0
    # linha de pesca que a IA às vezes desenha (clara, fina): a linha de verdade é desenhada pelo jogo
    for _ in range(3):
        op = a[..., 3] > 0; p = np.pad(op, 1)
        n4 = p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
        rgb = a[..., :3].astype(int); light = (rgb.max(axis=2) - rgb.min(axis=2) < 40) & (rgb.max(axis=2) > 130)
        kill = op & light & (n4 <= 2)
        if not kill.any(): break
        a[kill] = 0
    op = a[..., 3] > 0                                        # sujeira solta (pontinhos de poeira)
    lab, n = ndimage.label(op, structure=np.ones((3, 3)))
    if n > 1:
        sz = ndimage.sum(op, lab, range(1, n + 1))
        a[np.isin(lab, [i + 1 for i, s in enumerate(sz) if s < 40])] = 0     # pedacinhos soltos (o peixe/isca que a IA desenhou)
    return a

def legs(a):
    """meio das pernas (faixa de 70% a 95% da altura) e y do pé"""
    ys, xs = np.nonzero(a[..., 3] > 0); top, bot = ys.min(), ys.max()
    sel = (ys >= top + (bot - top) * .7) & (ys <= top + (bot - top) * .95)
    xx = np.sort(xs[sel]); return (xx[len(xx) // 10] + xx[-len(xx) // 10 - 1]) / 2, bot

out = {}
for c in CLS + VARS:
    if not os.path.exists(os.path.join(SRC, f"{c}-catch.png")): continue
    body = f"{c}-pack-t0-body.png" if c in CLS else f"{c}-body.png"
    pack = np.array(Image.open(os.path.join(CH, body)).convert("RGBA").crop((0, 0, 128, 128)))
    pm, pf = legs(pack)
    fr = {k: [shrink(Image.open(os.path.join(SRC, f"{c}-{k}.png")).convert("RGBA").crop((i * G, 0, i * G + G, G))) for i in range(9)] for k in ROWS}
    fm, ff = legs(fr["wait"][0])
    dx, dy = round(pm + M - fm), round(pf + M - ff)
    sheet = Image.new("RGBA", (FS * 8, FS * 4)); tips = []
    cx, cy = pm + M, pf + M - 60                              # perto do peito: a ponta da vara é o ponto mais longe daqui
    def hanging(a):
        """a IA desenhou a linha pendurada (pixels à frente do herói, abaixo das mãos): o jogo desenha a dele"""
        ys, xs = np.nonzero(a[..., 3] > 0); xs = xs + dx; ys = ys + dy
        return np.count_nonzero((xs > pm + M + 30) & (ys > pf + M - 40)) > 4
    def reach(a):
        ys, xs = np.nonzero(a[..., 3] > 0); xs = xs + dx; ys = ys + dy; ok = ys < pf + M - 30
        return np.sqrt(((xs[ok] - cx) ** 2 + (ys[ok] - cy) ** 2).max())
    for r, k in enumerate(ROWS):
        seq = fr[k][1:9]; rr = [reach(a) for a in seq]; med = float(np.median(rr))
        clean = [not hanging(a) and i not in BAD.get(c, {}).get(k, ()) for i, a in enumerate(seq)]
        if any(clean):
            seq = [a if clean[i] else seq[min((j for j in range(8) if clean[j]), key=lambda j: (abs(j - i), -j))] for i, a in enumerate(seq)]
        for i in range(8):
            a = seq[i]; im = Image.new("RGBA", (FS, FS)); im.paste(Image.fromarray(a, "RGBA"), (dx, dy), Image.fromarray(a, "RGBA"))
            sheet.alpha_composite(im, (i * FS, r * FS))
            b = np.array(im)[..., 3] > 0; ys, xs = np.nonzero(b)
            ok = ys < pf + M - 30
            d = (xs[ok] - cx) ** 2 + (ys[ok] - cy) ** 2; j = int(np.argmax(d))
            tips.append([int(xs[ok][j]), int(ys[ok][j])])
    sheet.save(os.path.join(CH, f"{c}-fish.png"), optimize=True)
    out[c] = tips
    print(c, "deslocamento", dx, dy, "ponta parado", tips[8])
json.dump({"fs": FS, "tips": out}, open(os.path.join(CH, "pesca-herois.json"), "w"), separators=(",", ":"))
