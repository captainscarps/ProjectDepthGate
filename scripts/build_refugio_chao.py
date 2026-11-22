"""Chão novo do Refúgio (p216.107): troca a textura da grama, da praça e da areia de ground.png pelas texturas do
PixelLab (scripts/gerar_refugio_chao.py → emendar_refugio_chao.py), mantendo contornos, flores e tufos desenhados,
a água, o muro e a posição de tudo (a colisão continua valendo). Cada região é reconhecida pelas cores de base dela;
a grama mistura duas texturas em manchas grandes (some a emenda entre a vila e o campo da praia).
Re-executável: o original fica em scripts/art-src/refugio-chao/ground-orig.png."""
import os, shutil, random
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/refugio-chao"); G = os.path.join(ROOT, "assets/pixel-art/hub/village/ground.png")
O = os.path.join(D, "ground-orig.png")
if not os.path.exists(O): shutil.copy(G, O)
src = np.array(Image.open(O).convert("RGBA")); H, W = src.shape[:2]
# região de cada pixel pela cor: grama = verde liso (os tufos e folhas mais escuros desenhados ficam);
# praça = as cores dos tijolos e da argamassa; areia = as duas cores de base da praia
rgbf = src[:, :, :3].astype(np.float32); R_, G_, B_ = rgbf[..., 0], rgbf[..., 1], rgbf[..., 2]
mx = rgbf.max(-1); mn = rgbf.min(-1); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
GREEN = (G_ > R_ + 28) & (G_ > B_ + 55) & (mx > 150) & (mx < 200) & (sat > .4) & (sat < .62)
PLAZA = {(198, 171, 137), (160, 124, 109), (210, 184, 142), (173, 139, 112)}
SAND = {(232, 206, 152), (216, 188, 134), (231, 205, 151)}
def tile(n):
    t = np.array(Image.open(os.path.join(D, n + "-tile.png")).convert("RGBA"))[:, :, :3]; th, tw = t.shape[:2]
    return np.tile(t, (H // th + 1, W // tw + 1, 1))[:H, :W]
g1, g2, pz, sd = tile("grama"), tile("grama2"), tile("praca"), tile("areia")
# manchas grandes e irregulares para misturar as duas gramas (ruído de baixa frequência com pontilhado na borda)
rnd = np.random.default_rng(7); small = rnd.random((H // 40 + 2, W // 40 + 2))
big = np.array(Image.fromarray((small * 255).astype(np.uint8)).resize((W + 80, H + 80), Image.BICUBIC))[:H, :W] / 255.0
dither = (np.indices((H, W)).sum(0) % 2) * .06
gmix = np.where((big + dither) > .6, 1, 0)[..., None]
g1 = (g1.astype(np.float32) * .45 + g2.astype(np.float32) * .55)          # a grama clara puxada para a escura: manchas sutis
grass = np.where(gmix == 1, g1, g2.astype(np.float32))
# mantém o sombreado largo do chão original (bordas mais escuras, clareiras mais claras)
lum = rgbf.mean(-1); grass = np.clip(grass * np.clip(lum / 125.0, .88, 1.1)[..., None], 0, 255).astype(np.uint8)
rgb = src[:, :, :3]
key = rgb[:, :, 0].astype(np.int32) << 16 | rgb[:, :, 1].astype(np.int32) << 8 | rgb[:, :, 2]
def mask(P): return np.isin(key, np.array([int(r) << 16 | int(g) << 8 | int(b) for r, g, b in P], dtype=np.int32))
mg, mp, ms = GREEN, mask(PLAZA), mask(SAND)
SHADE = mask({(149, 127, 109), (157, 136, 112), (124, 97, 91)}) & ~GREEN   # o tijolo sombreado junto da forja vira calçamento escurecido
out = src.copy()
out[:, :, :3][mg] = grass[mg]; out[:, :, :3][mp & ~mg] = pz[mp & ~mg]; out[:, :, :3][ms & ~mg & ~mp] = sd[ms & ~mg & ~mp]
out[:, :, :3][SHADE] = (pz[SHADE].astype(np.float32) * .72).astype(np.uint8)
print("grama %.0f%% praça %.0f%% areia %.0f%%" % (mg.mean() * 100, mp.mean() * 100, ms.mean() * 100))
Image.fromarray(out).save(G, optimize=True); print("ok")
