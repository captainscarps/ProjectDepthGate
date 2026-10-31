"""
Visual Magmatic Planet para o Vulcão de Cinzas. Usado por build_volcano_map.py (MP = True):
o mapa (platôs, fendas, rios, correntes, pontes, colisão e dados da lava) continua o mesmo; aqui só se
troca a textura de cada região pelos ladrilhos do pacote e os adereços desenhados nas imagens do cenário
pelos do pacote.
Os ladrilhos originais do pacote NÃO vão para o repositório (público; a licença proíbe redistribuir o
pacote). Para gerar de novo: extraia o Magmatic_Planet.zip e rode
    python3 scripts/volcano_mp.py "caminho/Magmatic Planet"
que copia só os ladrilhos usados para scripts/volcano_mp_src/ (ignorada pelo git); depois
    python3 scripts/build_volcano_map.py
"""
import glob
import os
import random

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = os.environ.get("MP_SRC") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "volcano_mp_src")
T = 32


def _tiles(folder):
    return [np.asarray(Image.open(f).convert("RGB"), np.float32) for f in sorted(glob.glob(os.path.join(SRC, folder, "*.png")))]


def tile_fill(h, w, folder, seed, spin=False, weights=None, cut=0):
    """chão inteiro coberto pelos ladrilhos de uma pasta, sorteados célula a célula.
    cut: pixels da moldura escura de cada ladrilho que são descartados (senão aparece a grade)"""
    ts = _tiles(folder)
    if cut:
        ts = [t[cut:-cut, cut:-cut] for t in ts]
    S = ts[0].shape[0]
    r = random.Random(seed)
    out = np.zeros((h, w, 3), np.float32)
    for y in range(0, h, S):
        for x in range(0, w, S):
            t = r.choices(ts, weights)[0] if weights else r.choice(ts)
            if r.random() < .5:
                t = t[:, ::-1]
            if spin:
                t = np.rot90(t, r.randrange(4))
            out[y:y + S, x:x + S] = t[:min(S, h - y), :min(S, w - x)]
    return out


def ramp_from(folder):
    """paleta da pedra do pacote, do escuro ao claro"""
    px = np.concatenate([t.reshape(-1, 3) for t in _tiles(folder)])
    lum = px @ [.3, .59, .11]
    order = np.argsort(lum)
    return np.array([px[order[int(q * (len(order) - 1))]] for q in np.linspace(.02, .98, 12)])


def remap(rgb, ramp, lo=None, hi=None):
    """troca as cores de uma área pela paleta do pacote mantendo luz e sombra"""
    lum = rgb @ np.array([.3, .59, .11], np.float32)
    lo = np.percentile(lum, 2) if lo is None else lo
    hi = np.percentile(lum, 98) if hi is None else hi
    t = np.clip((lum - lo) / max(1., hi - lo), 0, 1) * (len(ramp) - 1)
    i = np.floor(t).astype(int)
    j = np.minimum(i + 1, len(ramp) - 1)
    f = (t - i)[..., None]
    return ramp[i] * (1 - f) + ramp[j] * f


def repaint(img, M):
    """M: máscaras do mapa (FLOOR, TOP, FM, FC, LV, STR, BRp, PM) e a sombra ao pé dos platôs (foot)"""
    H, W = img.shape[:2]
    FLOOR, TOP, FM, FC, LV, STR, BRp, PM = (M[k] for k in ("FLOOR", "TOP", "FM", "FC", "LV", "STR", "BRp", "PM"))
    stone = ramp_from("rock-bank")
    # chão: rocha lisa do pacote, com a sombra ao pé dos platôs
    floor = tile_fill(H, W, "rock-floor-plain", 301, cut=2)
    floor *= (1 - M["foot"][..., None] * .55)
    flE = FLOOR & ndimage.binary_dilation(PM, iterations=2)
    floor[flE] *= .6
    sel = FLOOR & ~BRp
    img[sel] = floor[sel]
    # platôs: pedregulho (terreno áspero), um pouco mais escuro, com lábio claro e contorno
    bank = tile_fill(H, W, "rock-bank", 302, cut=2) * .72
    img[TOP] = bank[TOP]
    lipT = TOP & ndimage.binary_dilation(FM, iterations=2)
    img[lipT] = np.minimum(255, img[lipT] * 1.35 + 8)
    edgeT = TOP & ~ndimage.binary_erosion(TOP, iterations=1)
    img[edgeT] = img[edgeT] * .4
    rimT = TOP & ~ndimage.binary_erosion(TOP, iterations=3) & ~edgeT
    img[rimT] = np.minimum(255, img[rimT] * 1.25 + 6)
    # paredes dos platôs e das fendas: as mesmas colunas, na cor da pedra do pacote
    if FM.any():
        img[FM] = remap(img[FM], stone[:9])
    if FC.any():
        orig = img[FC].copy()
        warm = np.clip((orig[:, 0] - orig[:, 2]) / 200, 0, 1)[:, None]  # brilho da lava na parede
        img[FC] = remap(orig, stone[:9]) * (1 - warm * .6) + orig * (warm * .6)
    # pontes: mesma forma, pedra do pacote
    if BRp.any():
        img[BRp] = remap(img[BRp], stone)
    # lava do pacote, com a margem escurecendo para dentro
    lava = tile_fill(H, W, "lava", 303, spin=True, weights=[3, 1])
    inner = ndimage.distance_transform_edt(LV)
    k = np.clip(inner / 6, .55, 1)[..., None]
    lava = lava * k + np.array([90, 20, 8], np.float32) * (1 - k)
    # manchas largas mais frias e mais quentes, para a lava não parecer um ladrilho repetido
    nz = ndimage.zoom(np.random.RandomState(305).rand(H // 64 + 2, W // 64 + 2), 64, order=3)[:H, :W]
    lava *= (.78 + nz * .3)[..., None]
    img[LV] = lava[LV]
    # margem: crosta escura e borda acesa
    rimA = ndimage.binary_dilation(LV, iterations=4) & FLOOR & ~BRp
    rimB = ndimage.binary_dilation(LV, iterations=1) & FLOOR & ~BRp
    img[rimA] = img[rimA] * .45 + np.array([20, 10, 10]) * .55
    img[rimB] = (120, 34, 14)
    # correntes rasas (caminháveis, queimam): crosta de lava resfriada com veios acesos
    if STR.any():
        crust = tile_fill(H, W, "cooled-lava-crust", 304, spin=True, cut=1)
        sin_ = ndimage.distance_transform_edt(STR)
        hot = np.clip(.35 + sin_ / 8, 0, .85)[..., None]   # miolo aceso: queima
        mix = crust * (1 - hot) + lava * hot
        img[STR] = mix[STR]
        rimS = ndimage.binary_dilation(STR, iterations=3) & FLOOR & ~STR
        img[rimS] = img[rimS] * .5 + np.array([20, 10, 10]) * .5
        rimS1 = ndimage.binary_dilation(STR, iterations=1) & FLOOR & ~STR
        img[rimS1] = (140, 40, 14)
    return img


def _trim(f):
    im = Image.open(f).convert("RGBA")
    return im.crop(im.getbbox())


def _p(prefix):
    return _trim(glob.glob(os.path.join(SRC, "props", prefix + "-*.png"))[0])


def props():
    """adereços desenhados nas imagens do cenário (mesmas chaves do gerador antigo)"""
    d = os.path.join(SRC, "props")
    pick = lambda pre, key: _trim(next(f for f in sorted(glob.glob(os.path.join(d, pre + "-*.png"))) if key in f))
    return {
        "vc-bigcolumns": pick("02", "bundle"), "vc-columns3": pick("01", "cluster-of-three-tall"),
        "vc-columns2": pick("05", "pair"), "vc-columns1": pick("00", "single-tall"),
        "vc-boulder1": pick("00", "rounded-boulder"), "vc-boulder2": pick("08", "mound"), "vc-boulder3": pick("13", "cracked"),
        "vc-boulder4": pick("14", "half"), "vc-boulder5": pick("03", "three"),
        "vc-obsidian1": pick("rep00", "obsidian"), "vc-obsidian2": pick("21", "glass"), "vc-obsidian3": pick("rep10", "obsidian"),
        "vc-stump": pick("01", "dead-ash"), "vc-vent": pick("16", "vent"), "vc-sulfur": pick("rep39", "sulfur"),
    }


def small_rocks():
    d = os.path.join(SRC, "props")
    return [_trim(f) for f in sorted(glob.glob(os.path.join(d, "r2-*.png")))]


PROPS_USADOS = {
    "basalt-columns-spires": ["00", "01", "02", "05"],
    "boulders-rubble-scree": ["00", "03", "08", "13", "14", "r2-42", "r2-43", "r2-51", "r2-52", "r2-59"],
    "crystal-obsidian-sulfur-nodes": ["21", "rep00", "rep10", "rep39"],
    "ash-trees-giant-fungi": ["01"],
    "geysers-vents-spatter-cones": ["16"],
}

if __name__ == "__main__":
    import shutil
    import sys
    pk = sys.argv[1]
    for t in ("rock-floor-plain", "rock-bank", "cooled-lava-crust"):
        shutil.copytree(os.path.join(pk, "terrain", t), os.path.join(SRC, t), dirs_exist_ok=True)
    os.makedirs(os.path.join(SRC, "lava"), exist_ok=True)
    shutil.copy(os.path.join(pk, "terrain", "lava-path", "tile_17.png"), os.path.join(SRC, "lava", "a.png"))
    shutil.copy(os.path.join(pk, "terrain", "rock-lava-edges", "00_0000.png"), os.path.join(SRC, "lava", "b.png"))
    os.makedirs(os.path.join(SRC, "props"), exist_ok=True)
    for d, pres in PROPS_USADOS.items():
        for f in os.listdir(os.path.join(pk, "props", d)):
            if any(f.startswith(p + ("" if p.endswith("-") else "-")) for p in pres):
                shutil.copy(os.path.join(pk, "props", d, f), os.path.join(SRC, "props", f))
    print("ladrilhos copiados para", SRC)
