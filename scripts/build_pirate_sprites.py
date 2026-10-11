"""Constrói a spritesheet do Capitão Scarpa (classe PIRATE) no formato "pack" do jogo.

Entrada : scripts/source/capitao-scarpa-folha.png  (folha com fundo marrom esfumaçado)
Saída   : assets/sprites/characters/pirate/pirate_{idle,walk,run,attack,death,extra}.png
          (uma tira horizontal por animação, células 128x128, fundo transparente)
          + pirate_config.json (quadros, fps, origem de cada quadro)
          assets/pixel-art/characters/pirate-hd3*.png + pirate-hd3.json
          (folha "pack" que o jogo carrega = as tiras acima em sequência + mapa)

Fidelidade à arte enviada:
- o personagem fica com ~98 px de altura no quadro e o jogo o desenha com
  escala 0.5 ("hiRes"), ou seja, praticamente 1 pixel da textura por pixel de tela.
  (os outros heróis têm ~70 px com escala 0.7 — mesmo tamanho final na tela);
- as cores são as da folha original: sem redução de paleta, sem contraste extra
  e sem contorno adicionado (o desenho já tem o próprio contorno);
- o recorte tira 1 px da borda para não carregar o marrom do fundo.

Uso:  python scripts/build_pirate_sprites.py [previa.png]
"""
import json
import os
import sys

import cv2
import numpy as np
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "source", "capitao-scarpa-folha-v2.png")
OUT_DIRS = [os.path.join(ROOT, "assets", "pixel-art", "characters"),
            os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "characters")]
PREVIEW = sys.argv[1] if len(sys.argv) > 1 else None

FW = FH = 128
FOOT = 126            # linha dos pés no quadro: embaixo da célula, para caber o pirata em alta definição
STAND_H = 96          # altura em pé na textura (alta definição: ~1 pixel da textura = 1 pixel da tela)
SHARP = 0.35          # nitidez leve depois da redução
GAME_SCALE = 0.56     # 96 px x 0.56 ≈ 54 px na tela: ~15% maior que os outros heróis (~48 px), é um berserker
HD = True             # alta definição: cores da arte, bordas suaves, sem paleta reduzida nem contorno de pixel art

# ---------------------------------------------------------------- recorte
img = cv2.cvtColor(cv2.imread(SRC, cv2.IMREAD_UNCHANGED)[:, :, :3], cv2.COLOR_BGR2RGB).astype(np.float32)
H, W = img.shape[:2]

fig = np.zeros((H, W), bool)
for _ in range(4):  # fundo = média borrada só dos pixels que não são figura
    w = (~fig).astype(np.float32)
    bg = cv2.GaussianBlur(img * w[..., None], (0, 0), 18) / (cv2.GaussianBlur(w, (0, 0), 18)[..., None] + 1e-4)
    fig = ndi.binary_dilation(ndi.binary_opening(np.sqrt(((img - bg) ** 2).sum(2)) > 22), iterations=2)
diff = np.sqrt(((img - bg) ** 2).sum(2))
for y0, y1 in [(10, 50), (232, 270), (440, 478), (645, 682), (852, 892)]:
    diff[y0:y1, 0:160] = 0  # rótulos de texto ("PARADO", "ANDANDO"...)

mask = ndi.binary_fill_holes(ndi.binary_closing(diff > 27, iterations=3))
# brilho difuso em volta do sabre (cinza-amarronzado, sem saturação) — não faz parte do sprite
r_, g_, b_ = img[..., 0], img[..., 1], img[..., 2]
lum = 0.3 * r_ + 0.59 * g_ + 0.11 * b_
glow = (img.max(2) - img.min(2) < 22) & (lum > 60) & (lum < 118) & (r_ >= b_) & (diff < 75)
glow[:640] = False
mask &= ~glow
mask = ndi.binary_opening(mask, iterations=1)
lab, _ = ndi.label(mask)
objs = ndi.find_objects(lab)
big, small = [], []
for i, sl in enumerate(objs):
    area = int((lab[sl] == i + 1).sum())
    f = dict(id=i + 1, x0=sl[1].start, x1=sl[1].stop, y0=sl[0].start, y1=sl[0].stop, area=area)
    (big if area > 2500 else small).append(f)
for s in small:  # pedaços soltos (barra do casaco, ponta do sabre) voltam para a figura mais próxima
    if s["area"] < 15:
        continue
    cx, cy = (s["x0"] + s["x1"]) / 2, (s["y0"] + s["y1"]) / 2
    dist = lambda b: np.hypot(max(b["x0"] - cx, 0, cx - b["x1"]), max(b["y0"] - cy, 0, cy - b["y1"]))
    best = min(big, key=dist)
    if dist(best) < 14:
        lab[lab == s["id"]] = best["id"]
        best.update(x0=min(best["x0"], s["x0"]), x1=max(best["x1"], s["x1"]),
                    y0=min(best["y0"], s["y0"]), y1=max(best["y1"], s["y1"]))

ROWS = {"idle": (0, 235), "walk": (235, 440), "run": (440, 645), "atk": (645, 850), "death": (850, 1024)}
figs = {k: sorted([f for f in big if a <= (f["y0"] + f["y1"]) / 2 < b], key=lambda f: f["x0"]) for k, (a, b) in ROWS.items()}
for _fs in figs.values():
    for _f in _fs:
        _f["src"] = (img, lab)


def segment_dark_sheet(path, erase=()):
    """Folha de andar/correr (2 linhas x 8 quadros, fundo escuro com brilho avermelhado).

    Botas e calças escuras quase somem no fundo: limiar baixo ligado às partes fortes
    da figura, aceitando só pixels mais escuros ou mais saturados que o fundo.
    """
    from skimage.filters import apply_hysteresis_threshold
    im = cv2.cvtColor(cv2.imread(path, cv2.IMREAD_UNCHANGED)[:, :, :3], cv2.COLOR_BGR2RGB).astype(np.float32)
    for (y0, y1, x0, x1) in erase:                      # rótulos de texto: vira fundo
        im[y0:y1, x0:x1] = im[y0:y1, x1:x1 + 1]
    fg = np.zeros(im.shape[:2], bool)
    for _ in range(4):
        w = (~fg).astype(np.float32)
        bgi = cv2.GaussianBlur(im * w[..., None], (0, 0), 18) / (cv2.GaussianBlur(w, (0, 0), 18)[..., None] + 1e-4)
        fg = ndi.binary_dilation(ndi.binary_opening(np.sqrt(((im - bgi) ** 2).sum(2)) > 22), iterations=2)
    df = np.sqrt(((im - bgi) ** 2).sum(2))
    weak = (df > 11) & ((im.mean(2) < bgi.mean(2) - 6) | (im.max(2) - im.min(2) > bgi.max(2) - bgi.min(2) + 18))
    mk = apply_hysteresis_threshold(np.where(weak | (df > 27), df, 0), 11, 27)
    mk = ndi.binary_opening(ndi.binary_fill_holes(ndi.binary_closing(mk, iterations=2)), iterations=1)
    lb, _ = ndi.label(mk)
    bigs, smalls = [], []
    for i, sl in enumerate(ndi.find_objects(lb)):
        area = int((lb[sl] == i + 1).sum())
        f = dict(id=i + 1, x0=sl[1].start, x1=sl[1].stop, y0=sl[0].start, y1=sl[0].stop, area=area, src=(im, lb))
        (bigs if area > 2500 else smalls).append(f)
    for sm in smalls:
        if sm["area"] < 15:
            continue
        cx, cy = (sm["x0"] + sm["x1"]) / 2, (sm["y0"] + sm["y1"]) / 2
        dist = lambda bb: np.hypot(max(bb["x0"] - cx, 0, cx - bb["x1"]), max(bb["y0"] - cy, 0, cy - bb["y1"]))
        best = min(bigs, key=dist)
        if dist(best) < 14:
            lb[lb == sm["id"]] = best["id"]
            best.update(x0=min(best["x0"], sm["x0"]), x1=max(best["x1"], sm["x1"]),
                        y0=min(best["y0"], sm["y0"]), y1=max(best["y1"], sm["y1"]))
    return bigs


# Folha v3 (scripts/source/capitao-scarpa-folha-v3.png): todas as animações do mesmo
# desenho e na mesma escala — PARADO, ANDANDO, CORRENDO, MORRENDO e ATACANDO, 8 quadros cada.
V3_SRC = os.path.join(ROOT, "scripts", "source", "capitao-scarpa-folha-v3.png")
_v3 = segment_dark_sheet(V3_SRC, erase=[(10, 48, 0, 160), (218, 256, 0, 160), (424, 462, 0, 160),
                                        (616, 656, 0, 160), (806, 846, 0, 160)])
for _n, _a, _b in [("idle", 0, 215), ("walk", 215, 420), ("run", 420, 612), ("death", 612, 805), ("atk", 805, 1024)]:
    figs[_n] = sorted([f for f in _v3 if _a <= (f["y0"] + f["y1"]) / 2 < _b], key=lambda f: f["x0"])

# a folha v2 desenha todas as linhas na mesma escala: uma escala só para todas as animações
# (o personagem em pé mede ~177 px na folha → STAND_H no jogo)
SCALE = {k: STAND_H / 177 for k in ("idle", "walk", "run", "atk", "death")}
# folha de andar/correr (scripts/source/capitao-scarpa-andar-correr.png): pirata com ~282 px
# folha v3: o pirata em pé mede ~189 px; a mesma escala para todas as animações
SCALE = {k: STAND_H / 189 for k in ("idle", "walk", "run", "atk", "death")}

# Quadros separados refinados (scripts/source/pirata-separados/<pasta>/<pasta>_NN.png):
# 222x444, fundo transparente, todos na mesma tela e na mesma escala (pirata em pé ≈ 372 px).
# Substituem parado, andando, correndo e atacando; a morte continua vindo da folha v3.
SEP_DIR = os.path.join(ROOT, "scripts", "source", "pirata-separados")


def load_separated(folder):
    out = []
    for k in range(1, 9):
        rgba = cv2.imread(os.path.join(SEP_DIR, folder, f"{folder}_{k:02d}.png"), cv2.IMREAD_UNCHANGED)
        out.append(canvas_fig(rgba))
    return out


def canvas_fig(rgba):
    """Uma tela RGBA (BGRA do OpenCV) com um quadro -> figura limpa para shrink()."""
    if True:
        rgba = cv2.copyMakeBorder(rgba, 4, 4, 4, 4, cv2.BORDER_CONSTANT, value=(0, 0, 0, 0))
        im = cv2.cvtColor(rgba[:, :, :3], cv2.COLOR_BGR2RGB).astype(np.float32)
        # fica só o corpo e o que encosta nele: pedaços do quadro vizinho que vieram no recorte
        # (mão/sabre cortados na borda esquerda/direita) e poeira solta saem
        solid = rgba[:, :, 3] > 128
        lb, n = ndi.label(solid)
        sizes = ndi.sum(np.ones_like(lb), lb, range(1, n + 1))
        main = 1 + int(np.argmax(sizes))
        near = ndi.binary_dilation(lb == main, iterations=6)
        keep = [main]
        W_ = solid.shape[1]
        for i in range(1, n + 1):
            if i == main or sizes[i - 1] < 30:
                continue
            xs_i = np.nonzero((lb == i).any(0))[0]
            edge = xs_i.min() <= 5 or xs_i.max() >= W_ - 6
            if (near & (lb == i)).any() and not edge:
                keep.append(i)
        lb = np.isin(lb, keep).astype(np.int32)

        ys, xs = np.nonzero(lb)
        return dict(id=1, x0=int(xs.min()), x1=int(xs.max()) + 1, y0=int(ys.min()), y1=int(ys.max()) + 1,
                    area=int(lb.sum()), src=(im, lb))


for _n, _folder in [("idle", "parado"), ("walk", "andando"), ("run", "correndo"), ("atk", "atacando")]:
    figs[_n] = load_separated(_folder)
    SCALE[_n] = STAND_H / 372

# Folhas 5x5 (scripts/source/pirata-25/<anim>.png, 25 quadros cada, fundo transparente).
# Substituem parado, andando, correndo e atacando. Cada folha veio numa escala: medida pela
# área do corpo e largura da cabeça, o pirata em pé no "parado" e no "atacando" mede ~151 px;
# o "andando" está 1.46x maior e o "correndo" ~1.1x (entre a medida da área e a da cabeça).
GRID_DIR = os.path.join(ROOT, "scripts", "source", "pirata-25")
GRID = {
    # parado: um ciclo de respiração de 25 quadros; um sim, um não (12) mantém o ciclo de 2 s
    "idle": ("parado", list(range(0, 24, 2)), 1.0),
    # andando: a folha tem 2 ciclos de passos (o quadro 12 repete o 0); um ciclo = 12 quadros
    "walk": ("andando", list(range(12)), 1.46),
    # correndo: a folha mistura duas corridas fora de ordem. Fica a do sabre baixo (combina com
    # andar e parado), em ordem pelo pé no chão: apoio, desce, impulso, passagem, sobe, voo
    "run":  ("correndo", [17, 5, 6, 7, 11, 21], 1.10),
    # atacando: combo de giro de 2 s; para o golpe simples ficam os quadros de perfil:
    # postura, ergue, sabre no alto, corte (com o rastro) e continuação baixa, e a volta
    "atk":  ("atacando", [0, 3, 5, 6, 14, 17, 20, 24], 1.0),
}


def load_grid(name, picks):
    sheet = cv2.imread(os.path.join(GRID_DIR, f"{name}.png"), cv2.IMREAD_UNCHANGED)
    if sheet.ndim == 2 or sheet.shape[2] != 4:
        from PIL import Image as _PIL
        sheet = cv2.cvtColor(np.array(_PIL.open(os.path.join(GRID_DIR, f"{name}.png")).convert("RGBA")), cv2.COLOR_RGBA2BGRA)
    c = sheet.shape[0] // 5
    return [canvas_fig(sheet[(i // 5) * c:(i // 5 + 1) * c, (i % 5) * c:(i % 5 + 1) * c].copy()) for i in picks]


for _n, (_file, _picks, _rel) in GRID.items():
    figs[_n] = load_grid(_file, _picks)
    SCALE[_n] = STAND_H / 151 / _rel

# ---------------------------------------------------------------- animações
# Folha v2 (scripts/source/capitao-scarpa-folha-v2.png): todas as poses de lado e o
# sabre sempre na mesma mão. vertical: "row" mantém a altura relativa ao chão da linha
# (a corrida sobe e desce de verdade); "feet" encosta cada quadro no chão (a queda).
ANIMS = {
    # quadros separados: "canvas" = todos os quadros na posição em que foram desenhados na
    # tela comum (o sobe-e-desce e o avanço do golpe ficam como o artista fez)
    "idle":   dict(src=[("idle", i) for i in range(len(figs["idle"]))], v="row", h="canvas", fps=6, loop=True),
    # andando e correndo: folha própria com as pernas alternando (8 + 8 quadros), na ordem
    # desenhada, alinhados pelo quadril e mantendo o sobe-e-desce de cada linha
    "walk":   dict(src=[("walk", i) for i in range(len(figs["walk"]))], v="row", h="canvas", fps=13, loop=True),
    "run":    dict(src=[("run", i) for i in range(len(figs["run"]))], v="row", h="canvas", fps=14, loop=True),
    "attack": dict(src=[("atk", i) for i in range(len(figs["atk"]))], v="row", h="torso", fps=13, loop=False),
    "death":  dict(src=[("death", i) for i in range(8)], v="feet", h="bbox", fps=9, loop=False),
}
ORDER = ["idle", "walk", "run", "attack", "death"]

# ---------------------------------------------------------------- folhas em pixel art (as atuais)
# scripts/source/pirata-pixel/pirate_*.png: tiras horizontais com fundo transparente
# (idle 4, walk 8, attack 5, jump_hurt 6, dead_defend 6). Cada tira veio numa escala; medida pela
# altura em pé e largura da cabeça: no idle o pirata mede ~455 px, walk 0.63x, attack ~0.8x,
# jump_hurt 0.63x, dead_defend 0.62x. Não há corrida: correr usa o ciclo de andar mais rápido.
PS_DIR = os.path.join(ROOT, "scripts", "source", "pirata-pixel")


def load_strip(name, n, raw=False):
    """Corta a tira nas folgas entre as figuras (rastros e corpos deitados passam da divisão
    igual); figuras grudadas (o rastro do corte liga dois quadros) são separadas na coluna mais vazia."""
    a = cv2.imread(os.path.join(PS_DIR, f"pirate_{name}.png"), cv2.IMREAD_UNCHANGED)
    cov = (a[:, :, 3] > 20).sum(0)
    xs = np.nonzero(cov)[0]
    groups, s0, p0 = [], xs[0], xs[0]
    for x in xs[1:]:
        if x - p0 > 8:
            groups.append([s0, p0]); s0 = x
        p0 = x
    groups.append([s0, p0])
    while len(groups) < n:                                      # separa a figura dupla mais larga
        g = max(range(len(groups)), key=lambda i: groups[i][1] - groups[i][0])
        x0, x1 = groups[g]
        lo, hi = x0 + int((x1 - x0) * .3), x0 + int((x1 - x0) * .7)
        cut = lo + int(np.argmin(cov[lo:hi]))
        groups[g:g + 1] = [[x0, cut], [cut + 1, x1]]
    bounds = [0] + [(groups[i][1] + groups[i + 1][0]) // 2 for i in range(n - 1)] + [a.shape[1]]
    if raw:
        return [a[:, bounds[i]:bounds[i + 1]].copy() for i in range(n)]
    return [canvas_fig(a[:, bounds[i]:bounds[i + 1]].copy()) for i in range(n)]


figs["idle"], figs["walk"], figs["atk"] = load_strip("idle", 4), load_strip("walk", 8), load_strip("attack", 5)
figs["jump"] = load_strip("jump_hurt", 6)
_dd = load_strip("dead_defend", 6)
figs["death"] = [_dd[i] for i in (2, 3, 4, 5)]          # cambaleia, ajoelha, cai, caído
# andar e correr: as pernas do 1º quadro de "walk" animadas por um esqueleto (pirate_leg_rig.py)
# no ciclo dos outros heróis (a folha não tem passos: as pernas ficam paradas na mesma pose)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pirate_leg_rig import keyed_cycle_rigid as _leg_keyed, WARRIOR_WALK, WARRIOR_RUN
_wcell = cv2.copyMakeBorder(load_strip("walk", 8, raw=True)[0], 0, 0, 60, 60, cv2.BORDER_CONSTANT, value=(0, 0, 0, 0))
# poses copiadas do Guerreiro quadro a quadro (6 + 6 quadros, como todos os heróis)
figs["walk"] = [canvas_fig(f) for f in _leg_keyed(_wcell, WARRIOR_WALK)[0]]
figs["run"] = [canvas_fig(f) for f in _leg_keyed(_wcell, WARRIOR_RUN)[0]]
_IDLE_H = 455
SCALE.update(idle=STAND_H / _IDLE_H, walk=STAND_H / (_IDLE_H * .63), run=STAND_H / (_IDLE_H * .63), atk=STAND_H / (_IDLE_H * .80),
             jump=STAND_H / (_IDLE_H * .63), death=STAND_H / (_IDLE_H * .62))
ANIMS = {
    "idle":   dict(src=[("idle", i) for i in range(4)], v="row", h="torso", fps=5, loop=True),
    # andar/correr: 8 quadros do esqueleto, tronco parado no lugar ("canvas")
    "walk":   dict(src=[("walk", i) for i in range(6)], v="row", h="canvas", fps=11, loop=True),   # = padrão do jogo
    "run":    dict(src=[("run", i) for i in range(6)], v="row", h="canvas", fps=15, loop=True),    # = padrão do jogo
    "attack": dict(src=[("atk", i) for i in range(5)], v="row", h="torso", fps=13, loop=False),
    # pulo / dano: 0 agacha · 1 impulso · 2 no ar · 3 aterrissa · 4 atordoado · 5 volta
    "jump":   dict(src=[("jump", i) for i in range(6)], v="row", h="hip", fps=10, loop=False),
    "death":  dict(src=[("death", i) for i in range(4)], v="feet", h="bbox", fps=8, loop=False),
}
ORDER = ["idle", "walk", "run", "attack", "jump", "death"]
RUN_FPS = 15                                             # correr: 6 quadros a 15 fps, como os outros heróis
RUN_LEAN, RUN_BOB = 0.12, 3                              # inclinação para frente (px por px de altura) e pulo (px)
STRIP_DIR = os.path.join(ROOT, "assets", "sprites", "characters", "pirate")


def shrink(f, s):
    """Redução fiel: média de área em alfa pré-multiplicado, com as cores da própria arte.
    (A arte refinada já é limpa; reinterpretar por "materiais" apagava barba, tapa-olho,
    tatuagens e camisa.)"""
    pad = 2
    x0, x1, y0, y1 = f["x0"] - pad, f["x1"] + pad, f["y0"] - pad, f["y1"] + pad
    simg, slab = f["src"]
    m = (slab[y0:y1, x0:x1] == f["id"]).astype(np.float32)
    rgb = np.clip(simg[y0:y1, x0:x1], 0, 255) / 255.0
    ow, oh = max(1, round((x1 - x0) * s)), max(1, round((y1 - y0) * s))
    a = cv2.resize(m, (ow, oh), interpolation=cv2.INTER_AREA)
    c = cv2.resize(rgb * m[..., None], (ow, oh), interpolation=cv2.INTER_AREA) / np.maximum(a[..., None], 1e-4)
    return np.clip(c, 0, 1), a


def _feat(t):
    a = t[..., 3] / 255.0
    g = (t[..., :3].mean(2) / 255.0 * a).astype(np.float32)
    ys = np.nonzero(a.sum(1))[0]
    m = np.zeros_like(g)
    m[ys.min():int(ys.min() + (ys.max() - ys.min()) * 0.5)] = 1
    return g * m


_win = cv2.createHanningWindow((FW, FW), cv2.CV_32F)


def build_strip(name, spec):
    figs_ = [figs[r][i] for r, i in spec["src"]]
    ground = {}
    for (r, _), f in zip(spec["src"], figs_):
        ground[r] = max(ground.get(r, 0), f["y1"])
    strip = np.zeros((FH, FW * len(figs_), 4), np.uint8)
    for k, ((row, _), f) in enumerate(zip(spec["src"], figs_)):
        sc = SCALE[row]
        c, a = shrink(f, sc)
        if SHARP:                                                   # bordas firmes como nos outros heróis
            blur = cv2.GaussianBlur(c, (0, 0), 0.8)
            c = np.clip(c + (c - blur) * SHARP, 0, 1)
        m = a > 0.5
        q = (c * 255).round().astype(np.uint8)
        qa = np.where(a > 0.12, np.clip(a * 1.15, 0, 1), 0) if HD else m.astype(np.float32)  # borda suave
        ys, xs = np.nonzero(m)
        if spec["h"] == "canvas":
            gx = round((f["x0"] - 2) * sc)                          # posição do recorte na tela comum
            if k == 0:
                top = ys < ys.min() + (ys.max() - ys.min()) * 0.5
                canvas_cx = xs[top].mean() + gx                      # tronco do 1º quadro no centro
            cx = canvas_cx - gx
        elif spec["h"] == "hip":                                      # quadril: faixa entre 50% e 62% da altura
            hb = (ys > ys.min() + (ys.max() - ys.min()) * .50) & (ys < ys.min() + (ys.max() - ys.min()) * .62)
            cx = xs[hb].mean() if hb.any() else xs.mean()
        elif spec["h"] == "torso":                                    # centro do tronco: o sabre não desloca o corpo
            top = ys < (ys.min() + ys.max()) / 2
            cx = xs[top].mean() if top.any() else xs.mean()
        else:                                                       # centro da figura (corpo deitado cabe inteiro)
            cx = (xs.min() + xs.max()) / 2
        lift = round((ground[row] - f["y1"]) * sc) if spec["v"] == "row" else 0
        offx, offy = int(round(64 - cx)), FOOT - (0 if HD else 1) - lift - ys.max()   # sem HD: o contorno fica na linha dos pés
        ys, xs = np.nonzero(qa > 0)
        if xs.min() + offx < 0 or xs.max() + offx >= FW:            # não cabe: desliza o quadro para dentro
            lo_, hi_ = -xs.min(), FW - 1 - xs.max()                   # faixa de deslocamento que cabe inteiro
            offx = int(np.clip(offx, lo_, hi_)) if lo_ <= hi_ else int(round((lo_ + hi_) / 2))
        tx, ty = xs + offx, ys + offy
        ok = (tx >= 0) & (tx < FW) & (ty >= 0) & (ty < FH)
        if (~ok).any():                                             # só a ponta do rastro do corte pode passar
            solid = (~ok) & (a[ys, xs] > 0.5)
            print(f"  aviso: {name} quadro {k}: {int(solid.sum())} px fora da célula (cortados)")
            if solid.sum() > 400:
                raise SystemExit(f"{name} quadro {k}: {int(solid.sum())} px fora da célula")
            ys, xs, tx, ty = ys[ok], xs[ok], tx[ok], ty[ok]
        tile = np.zeros((FH, FW, 4), np.uint8)
        tile[ty, tx, :3] = q[ys, xs]
        tile[ty, tx, 3] = (qa[ys, xs] * 255).round().astype(np.uint8)
        strip[:, k * FW:(k + 1) * FW] = tile
    if spec["loop"] and spec["h"] == "torso":                      # alinhamento fino do tronco (sem tremer)
        base = _feat(strip[:, :FW].astype(np.float32))
        for k in range(1, len(figs_)):
            tile = strip[:, k * FW:(k + 1) * FW]
            (dx, _), _ = cv2.phaseCorrelate(base, _feat(tile.astype(np.float32)), _win)
            sx = -int(round(dx))
            if sx and abs(sx) <= 4 and not tile[:, :abs(sx)].any() and not tile[:, -abs(sx):].any():
                strip[:, k * FW:(k + 1) * FW] = np.roll(tile, sx, axis=1)
    return strip


def write_png(path, arr):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "wb").write(cv2.imencode(".png", cv2.cvtColor(arr, cv2.COLOR_RGBA2BGRA))[1].tobytes())


strips, start = {}, {}
for name in ORDER:
    strips[name] = build_strip(name, ANIMS[name])
    write_png(os.path.join(STRIP_DIR, f"pirate_{name}.png"), strips[name])

n = 0
for name in ORDER:
    start[name] = n
    n += strips[name].shape[1] // FW
    print(f"pirate_{name}.png", strips[name].shape[1] // FW, "quadros", f"{strips[name].shape[1]}x{FH}")

# folha do jogo = as animações em sequência (o formato "pack" que o jogo já usa)
# ---------------------------------------------------------------- padrão visual do jogo
# Os heróis do jogo têm ~68 px, 14-23 cores chapadas e contorno escuro. A arte enviada é
# "pintada" (centenas de tons) e cada quadro gerado muda um pouco os detalhes, o que pisca
# na tela. Aqui: (1) parado vira um único desenho com respiração de 1 px (como os outros);
# (2) paleta única de PALETTE cores para todas as animações; (3) limpeza de pixels soltos;
# (4) borda interna escurecida (contorno sem engrossar a silhueta).
PALETTE = 20


def breathe(base):
    """4 quadros de respiração: o tronco desce 1 px e volta; pernas paradas."""
    ys = np.nonzero(base[..., 3].any(1))[0]
    waist = int(ys.min() + (ys.max() - ys.min()) * 0.56)
    down = base.copy()
    top = base[:waist].copy()
    down[:waist] = 0
    sub = down[1:waist + 1]
    m = top[..., 3] > 0
    sub[m] = top[m]
    return [base, base, down, down]


OUTLINE = (5, 4, 3)    # mesma cor de contorno dos outros heróis (medida nas folhas deles)


def quantize_all(strips_):
    """Paleta única (k-means em Lab) para todas as animações, com o contraste esticado:
    a arte enviada é escura e de pouco contraste; os outros heróis vão do quase preto ao claro."""
    allpx = np.concatenate([st[st[..., 3] > 0][:, :3] for st in strips_.values()]).astype(np.float32)
    lab_px = cv2.cvtColor(allpx[None] / 255.0, cv2.COLOR_RGB2LAB)[0]
    # cores distintas pesam igual (o casaco marrom não "engole" faixa, dourado, camisa e pele)
    bins = np.round(lab_px / np.array([3, 4, 4], np.float32)).astype(np.int32)
    _, first, cnt = np.unique(bins, axis=0, return_index=True, return_counts=True)
    uniq = lab_px[first]
    w = np.sqrt(cnt).astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 80, 0.1)
    samp = np.repeat(uniq, np.maximum(1, np.round(w / w.min()).astype(int)), axis=0)
    _, _, cen = cv2.kmeans(samp.astype(np.float32), PALETTE, None, crit, 6, cv2.KMEANS_PP_CENTERS)
    lab = cen.copy()
    lab[:, 0] = np.clip(50 + (lab[:, 0] - 50) * CONTRAST + LIFT, 0, 100)   # um pouco mais claro e contrastado
    lab[:, 1:] *= CHROMA
    pal = (cv2.cvtColor(lab[None].astype(np.float32), cv2.COLOR_LAB2RGB)[0] * 255).clip(0, 255).round()
    out = {}
    for k, st in strips_.items():
        q = st.copy()
        m = st[..., 3] > 0
        lp = cv2.cvtColor(st[..., :3].astype(np.float32)[m][None] / 255.0, cv2.COLOR_RGB2LAB)[0]
        idx = ((lp[:, None, :] - cen[None]) ** 2).sum(-1).argmin(1)
        q[m, :3] = pal[idx].astype(np.uint8)
        out[k] = q
    return out, pal


CONTRAST, LIFT, CHROMA = 1.3, 14.0, 1.2
HD_CONTRAST, HD_LIFT, HD_CHROMA = 1.0, 0.0, 1.0   # a arte em pixel art já vem bem iluminada
_N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def despeckle(st):
    """Pixel solto (nenhum vizinho da mesma cor) vira a cor mais comum ao redor, como no
    pixel art desenhado à mão; pontos de brilho fortes (fio do sabre, olho) ficam."""
    st = st.copy()
    for it in range(4):
        a = st[..., 3] > 0
        code = np.where(a, (st[..., 0].astype(np.int64) << 16) | (st[..., 1].astype(np.int64) << 8) | st[..., 2], -1)
        pad = np.pad(code, 1, constant_values=-1)
        nbs = np.stack([pad[1 + dy:1 + dy + code.shape[0], 1 + dx:1 + dx + code.shape[1]] for dy, dx in _N8])
        same = (nbs == code[None]).sum(0)
        lum = st[..., :3].astype(np.float32) @ np.array([.299, .587, .114], np.float32)
        changed = 0
        for y, x in zip(*np.nonzero(a & (same <= 1))):
            v = nbs[:, y, x]
            v = v[v >= 0]
            if len(v) < 5:
                continue
            vals, cnt = np.unique(v, return_counts=True)
            if cnt.max() < 3:
                continue
            c = vals[cnt.argmax()]
            rgb = np.array([(c >> 16) & 255, (c >> 8) & 255, c & 255])
            d = abs(float(rgb @ np.array([.299, .587, .114])) - lum[y, x])
            if same[y, x] == 0 and d < 40:
                st[y, x, :3] = rgb
                changed += 1
        if not changed:
            break
    return st


def inner_lines(st):
    """Linhas internas escuras entre partes de brilho bem diferente (braço x tronco,
    casaco x camisa), como nos outros heróis: o lado mais escuro da divisa escurece."""
    st = st.copy()
    a = st[..., 3] > 0
    lum = st[..., :3].astype(np.float32) @ np.array([.299, .587, .114], np.float32)
    mark = np.zeros_like(a)
    for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0)):
        nl = np.roll(lum, (dy, dx), (0, 1))
        na = np.roll(a, (dy, dx), (0, 1))
        mark |= a & na & (nl - lum > LINE_DIFF)
    st[mark, :3] = (st[mark, :3].astype(np.float32) * 0.45).astype(np.uint8)
    return st


LINE_DIFF = 62


def outline(st):
    """Remove fiapos de 1 px e desenha o contorno de 1 px por fora, na cor dos outros heróis."""
    st = st.copy()
    a = st[..., 3] > 0
    k4 = np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]])
    nbc = ndi.convolve(a.astype(int), k4, mode="constant")
    st[a & (nbc <= 1), 3] = 0
    a = st[..., 3] > 0
    ring = ndi.binary_dilation(a, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]]) & ~a
    st[ring, :3] = OUTLINE
    st[ring, 3] = 255
    return st


if os.environ.get("PIRATE_DUMP"):
    np.savez(os.environ["PIRATE_DUMP"], **strips)
if HD:
    # alta definição: cores da própria arte, só um pouco mais claras (a arte é escura e
    # sumia no chão do mapa); sem paleta reduzida, sem limpeza de pixels, sem contorno
    for _k, _st in strips.items():
        _m = _st[..., 3] > 0
        _lab = cv2.cvtColor(_st[..., :3].astype(np.float32) / 255.0, cv2.COLOR_RGB2LAB)
        _lab[..., 0] = np.clip(50 + (_lab[..., 0] - 50) * HD_CONTRAST + HD_LIFT, 0, 100)
        _lab[..., 1:] *= HD_CHROMA
        _rgb = (cv2.cvtColor(_lab, cv2.COLOR_LAB2RGB) * 255).clip(0, 255).round().astype(np.uint8)
        _st[..., :3] = np.where(_m[..., None], _rgb, 0)
        write_png(os.path.join(STRIP_DIR, f"pirate_{_k}.png"), _st)
    if "run" not in strips:                                    # correr usa os quadros de andar
        write_png(os.path.join(STRIP_DIR, "pirate_run.png"), strips["walk"])
else:
    strips, _pal = quantize_all(strips)
for k in ([] if HD else strips):
    strips[k] = np.concatenate([outline(despeckle(strips[k][:, i * FW:(i + 1) * FW]))
                                for i in range(strips[k].shape[1] // FW)], axis=1)
    write_png(os.path.join(STRIP_DIR, f"pirate_{k}.png"), strips[k])

# ---------------------------------------------------------------- movimento igual ao dos outros heróis
# Medido nas folhas dos outros: parado = um desenho só respirando (cabeça mexe 0-1 px);
# andar = cabeça e tronco parados no lugar, só as pernas mexem; correr = corpo inclinado
# para frente com sobe-e-desce. Os quadros gerados da arte foram redesenhados um a um
# (a cabeça pulava 4 px no parado e balançava 10 px no andar), então aqui:
_tiles = lambda st: [st[:, i * FW:(i + 1) * FW].copy() for i in range(st.shape[1] // FW)]


def _upper_cx(t):
    a = t[..., 3] > 0
    ys, xs = np.nonzero(a)
    top, h = ys.min(), ys.max() - ys.min()
    sel = ys < top + h * 0.45                                   # cabeça + tronco (as pernas não contam)
    return xs[sel].mean()


def _shift(t, dx, dy=0):
    out = np.zeros_like(t)
    h, w = t.shape[:2]
    ys0, ys1 = max(0, dy), min(h, h + dy)
    xs0, xs1 = max(0, dx), min(w, w + dx)
    out[ys0:ys1, xs0:xs1] = t[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return out


if "jump" in strips:                                             # folhas em pixel art (pirata-pixel)
    # 1) parado: um desenho só (o 1º) com respiração de 1 px, como os outros heróis
    strips["idle"] = np.concatenate(breathe(_tiles(strips["idle"])[0]), axis=1)
    ANIMS["idle"]["fps"] = 4
    # 2) andar e correr já vêm do esqueleto de pernas (tronco parado, passos de verdade)
    for _k in ("idle",):
        write_png(os.path.join(STRIP_DIR, f"pirate_{_k}.png"), strips[_k])

n = 0
for name in ORDER:
    start[name] = n
    n += strips[name].shape[1] // FW

_cells = [strips[k][:, i * FW:(i + 1) * FW] for k in ORDER for i in range(strips[k].shape[1] // FW)]
COLS = 16                                       # folha em grade (2048 px de largura): textura segura no celular
_rows = -(-len(_cells) // COLS)
sheet = np.zeros((_rows * FH, COLS * FW, 4), np.uint8)
for _i, _c in enumerate(_cells):
    sheet[(_i // COLS) * FH:(_i // COLS + 1) * FH, (_i % COLS) * FW:(_i % COLS + 1) * FW] = _c
I = lambda name, k=0: start[name] + k
cnt = lambda name: strips[name].shape[1] // FW
amap = {
    "idle": [I("idle", k) for k in range(cnt("idle"))],
    "idlevar": [I("idle", k) for k in (0, 2, 0)],
    "walk": [I("walk", k) for k in range(cnt("walk"))],
    "run": [I("run", k) for k in range(cnt("run"))],
    # ataque: 0 postura · 1 ergue o sabre | 2 corte (rastro) · 3 continuação (rastro) | 4 postura
    "attackW": [I("attack", k) for k in (0, 1)], "attackH": [I("attack", k) for k in (2, 3)],
    "attackR": [I("attack", 4)],
    "windupA": I("attack", 0), "windup": I("attack", 1), "hitA": I("attack", 2), "hit": I("attack", 3), "recovery": I("attack", 4),
    # Fúria Pirata: agacha (guard) -> impulso (dashA) -> no ar (dash) -> aterrissa com a âncora (cast)
    "guardStart": I("jump", 0), "guard": I("jump", 0),
    "dashA": I("jump", 1), "dash": I("jump", 2),
    "castA": I("attack", 1), "cast": I("jump", 3), "castC": I("jump", 5),
    "hurt": I("jump", 4), "hurtB": I("death", 0), "stunA": I("jump", 4), "stunB": I("death", 0),
    "deathSeq": [I("death", k) for k in range(cnt("death"))],
    "deathA": I("death", 0), "deathB": I("death", 2), "deathC": I("death", cnt("death") - 1),
}

# retrato do HUD: quadrado centrado no rosto do primeiro quadro parado
ys, xs = np.nonzero(sheet[:, :FW, 3] > 0)
top = int(ys.min())
fx = int(round(xs[ys < top + (14 if HD else 22)].mean()))     # centro da cabeça (cabelo + rosto)
P = 32 if HD else 22    # recorte do retrato (o jogo amplia para 44 px no HUD)
portrait = [fx - P // 2 + (3 if HD else 1), max(0, top - (3 if HD else 1)), P, P]

layout = {"frameW": FW, "frameH": FH, "scale": GAME_SCALE, "hiRes": HD, "footY": FOOT, "bakedWeapon": True,
          "portrait": portrait, "fps": {k: ANIMS[k]["fps"] for k in ANIMS if ANIMS[k]["fps"]} | {"idlevar": 3, "run": RUN_FPS},
          "anchors": [[64 + STAND_H // 4, FOOT - STAND_H // 2]] * n, "torso": [[64, FOOT - STAND_H // 2]] * n,
          "head": [[64, top + STAND_H // 6]] * n, "map": amap}

KEY = "pirate-px11"           # nome novo a cada mudança grande: o cache offline do jogo não serve a versão velha
png = cv2.imencode(".png", cv2.cvtColor(sheet, cv2.COLOR_RGBA2BGRA))[1].tobytes()
for d in OUT_DIRS:
    if not os.path.isdir(os.path.dirname(d)):
        continue
    os.makedirs(d, exist_ok=True)
    for name in [f"{KEY}-body.png"] + [f"{KEY}-t{t}-body.png" for t in range(5)]:
        open(os.path.join(d, name), "wb").write(png)
    json.dump(layout, open(os.path.join(d, f"{KEY}.json"), "w"), separators=(",", ":"))
    for old in [f"pirate-{k}{e}" for k in ("pack", "hd", "hd2", "hd3", "hd4", "hd5", "hd6", "hd7", "hd8", "px1", "v3a", "v3b", "sep1", "sep2", "g25a", "hd25", "px8", "px9", "px10") for e in ("-body.png", ".json")] + \
               [f"pirate-{k}-t{t}-body.png" for k in ("pack", "hd", "hd2", "hd3", "hd4", "hd5", "hd6", "hd7", "hd8", "px1", "v3a", "v3b", "sep1", "sep2", "g25a", "hd25", "px8", "px9", "px10") for t in range(5)]:
        if os.path.exists(os.path.join(d, old)):
            os.remove(os.path.join(d, old))
json.dump({"cell": [FW, FH], "scale": GAME_SCALE, "footY": FOOT,
           "animations": {k: {"frames": cnt(k), "file": f"pirate_{k}.png", "size": [cnt(k) * FW, FH],
                              "fps": ANIMS[k]["fps"], "loop": ANIMS[k]["loop"],
                              "source": [f"{r}#{i}" for r, i in ANIMS[k]["src"]]} for k in ORDER},
           "gameSheet": f"assets/pixel-art/characters/{KEY}-body.png", "map": amap},
          open(os.path.join(STRIP_DIR, "pirate_config.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(f"OK {KEY}-body.png", sheet.shape, len(png), "bytes;", n, "quadros; retrato", portrait)

if PREVIEW:  # prévia: uma linha por animação, ampliada 2x
    rows = []
    wmax = max(v.shape[1] for v in strips.values())
    for k in ORDER:
        r = np.zeros((FH, wmax, 4), np.uint8)
        r[:, :strips[k].shape[1]] = strips[k]
        rows.append(r)
    pv = np.concatenate(rows, 0)
    al = pv[..., 3:4] / 255.0
    out = (pv[..., :3] * al + np.array([38, 32, 36]) * (1 - al)).astype(np.uint8)
    for k in range(len(ORDER) + 1):
        out[k * FH - 1 if k else 0, :] = (90, 80, 70)
    out[np.arange(len(ORDER) * FH), :][..., 0]
    out = cv2.resize(out, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
    for k in range(len(ORDER)):                                     # linha do chão (footY)
        out[(k * FH + FOOT) * 2 + 1, :, :] = (70, 110, 70)
    cv2.imwrite(PREVIEW, cv2.cvtColor(out, cv2.COLOR_RGB2BGR))
