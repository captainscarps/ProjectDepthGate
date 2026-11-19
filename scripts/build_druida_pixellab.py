#!/usr/bin/env python3
"""Druida novo — monta a folha druid-pack-t*-body.png (39 quadros 128×128) a partir das animações em
scripts/art-src/druida/ (quadros 192×192): parada do Sprite-AI (druid-idle.png) e o resto do PixelLab
(PixMiniMax; o quadro 0 de cada folha é a imagem de entrada, os gerados vêm depois).

Mapa de druid-pack.json:
  idle 0-3 (+4,5 extras) · walk 6-11 · run 12-17 · windupA 18 · windup 19 · hitA 20 · hit 21 · recovery 22
  guardStart 23 · guard 24 · hurt 25 · hurtB 26 · stunA 27 · stunB 28 · dashA 29 · dash 30
  castA 31 · cast 32 · castC 33 · deathA 34 · deathB 35 · deathC 36 · upA 37 · upB 38
Os quadros são reduzidos de 192 para 128 (altura ~100 px; a escala do pacote compensa), o pé fica em footY e o corpo
no mesmo x da folha antiga. Recalcula torso/head do json; as 5 camadas (t0…t4) recebem a mesma arte.
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts/art-src/druida")
OUT = os.path.join(ROOT, "assets/pixel-art/characters")
F, S = 192, 128

def frames(name):
    im = Image.open(os.path.join(SRC, f"{name}.png")).convert("RGBA")
    return [im.crop((i * F, 0, i * F + F, F)) for i in range(im.width // F)]

I = frames("druid-idle")
W, R, K, C, H, D = (frames(n) for n in ("walk2", "run", "attack", "cast", "hurt", "death"))
seq = [
    I[0], I[1], I[2], I[3], I[4], I[5],          # 0-3 parada · 4,5 idlevar
    W[1], W[2], W[3], W[5], W[6], W[7],          # 6-11 caminhada
    R[3], R[4], R[5], R[6], R[7], R[8],          # 12-17 corrida (passadas largas)
    K[2], K[3], K[5], K[6], K[7],                # 18 windupA 19 windup 20 hitA 21 hit 22 recovery (cajado por cima e golpe)
    K[1], K[1],                                  # 23 guardStart 24 guard (cajado erguido na frente)
    H[3], H[4], H[3], H[4],                      # 25 hurt 26 hurtB 27 stunA 28 stunB
    R[4], R[5],                                  # 29 dashA 30 dash
    C[3], C[7], C[8],                            # 31 castA 32 cast 33 castC (ergue o cajado e solta a magia verde)
    D[4], D[7], D[8],                            # 34-36 morte (ajoelha, cai, deitado)
    I[0], I[0],                                  # 37 upA 38 upB (parada olhando para cima: não há vista de costas)
]
assert len(seq) == 39

def shrink(fr):
    # premultiplica para não sujar a borda, reduz e corta o alfa em degrau (pixel limpo)
    r = fr.resize((S, S), Image.LANCZOS, reducing_gap=None)
    px = r.load()
    for y in range(S):
        for x in range(S):
            c = px[x, y]
            px[x, y] = (c[0], c[1], c[2], 255) if c[3] >= 110 else (0, 0, 0, 0)
    return r

small = [shrink(f) for f in seq]

def is_blade(c):  # nada fica de fora no Druida
    return False

def body_px(im):
    px = im.load()
    return [(x, y) for y in range(S) for x in range(S) if px[x, y][3] and not is_blade(px[x, y])]

# alinhamento: pé em footY; x do corpo parado igual ao da folha antiga
meta = json.load(open(os.path.join(OUT, "druid-pack.json")))
FOOT = meta["footY"]
ox = 60.9                                        # x médio do Druida antigo parado (quadro 0)
b0 = body_px(small[0])
nx = sum(p[0] for p in b0) / len(b0)
foot0 = max(p[1] for p in b0)
dx, dy = round(ox - nx), FOOT - foot0

sheet = Image.new("RGBA", (S * 39, S), (0, 0, 0, 0))
torso, head = [], []
for i, fr in enumerate(small):
    c = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    c.alpha_composite(fr, (dx, dy)) if dx >= 0 and dy >= 0 else c.paste(fr, (dx, dy), fr)
    sheet.alpha_composite(c, (i * S, 0))
    bp = body_px(c)
    top = min(p[1] for p in bp); bot = max(p[1] for p in bp)
    hh = [p for p in bp if p[1] <= top + 10]
    tt = [p for p in bp if top + 18 <= p[1] <= top + 34] or bp
    head.append([round(sum(p[0] for p in hh) / len(hh), 1), float(top + 7)])
    torso.append([round(sum(p[0] for p in tt) / len(tt), 1), round(sum(p[1] for p in tt) / len(tt), 1)])

for t in ("", "-t0", "-t1", "-t2", "-t3", "-t4"):
    sheet.save(os.path.join(OUT, f"druid-pack{t}-body.png"), optimize=True)
meta["torso"], meta["head"] = torso, head
# mais detalhe: a figura ocupa ~100 px do quadro (a antiga, 68). A escala cai na mesma proporção para ela ficar
# do mesmo tamanho no jogo; "hires" corrige as telas de escala fixa e "pcrop" recorta o rosto do retrato do HUD.
h0 = FOOT - head[0][1] + 7                       # altura da figura parada (topo da cabeça ao pé)
k = round(68 / h0, 3)
meta["scale"], meta["hires"], meta["baseScale"] = round(.697 * k, 3), k, .697
hx, hy = head[0]
meta["pcrop"] = [round(hx - 5), round(hy - 2), 28, 28]
json.dump(meta, open(os.path.join(OUT, "druid-pack.json"), "w"), separators=(",", ":"))
print("ok dx,dy", dx, dy)
