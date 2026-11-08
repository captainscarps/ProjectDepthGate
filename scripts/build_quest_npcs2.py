"""NPCs das missões "Os Gatos da Vila" e "O Aprendiz do Ferreiro" (packs CraftPix fora do repositório).
  ANIMALS_PACK: "Urban Animals Sprite Sheet"  -> gato-a (Animal_1, siamês), gato-b (Animal_4, laranja)
  DWARF_PACK:   "Dwarf 2D Pixel Art Sprite"   -> aprendiz (Dwarf_2, anão de capuz e picareta)
Gera em assets/pixel-art/npc/ (todas as linhas com o mesmo recorte, para o pé não "pular"):
  gato-a.png / gato-b.png  linhas: parado 7, andando 11, pulo 10, especial 4
  gato-c/d/e/f.png         mesmas linhas, outras pelagens (branca, preta, cinza, laranja) por troca de paleta
  aprendiz.png             linhas: parado 6, andando 10, correndo 10, dano 3, morte 4, parado2 6
  aprendiz-p-<expressão>.png retratos 128x128 (rosto ampliado, recorte sem franja)
Uso: ANIMALS_PACK=... DWARF_PACK=... python3 scripts/build_quest_npcs2.py
"""
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AP = os.environ.get("ANIMALS_PACK", "/tmp/dg/packs/d0453830-craftpix-net-222276-urban-animals-sprite-sheet-pixel-art-pack")
DP = os.environ.get("DWARF_PACK", "/tmp/dg/packs/74afc1dd-craftpix-net-462764-dwarf-2d-pixel-art-sprite-pack")
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "npc"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "npc")]


def frames(folder, name, n):
    s = Image.open(os.path.join(folder, name + ".png")).convert("RGBA")
    return [s.crop((k * 128, 0, k * 128 + 128, 128)) for k in range(n)]


def clean(im):
    """tira pixels quase transparentes (franja do recorte)"""
    a = np.array(im)
    a[a[..., 3] < 40] = 0
    a[a[..., 3] >= 40, 3] = 255
    return Image.fromarray(a)


def sheet(folder, rows, pad=2):
    rs = [(nm, frames(folder, nm, n)) for nm, n in rows]
    box = None
    for _, fs in rs:
        for f in fs:
            b = clean(f).getbbox()
            if b:
                box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    x0, y0, x1, y1 = box[0] - pad, box[1] - pad, box[2] + pad, box[3]
    # largura simétrica em volta do centro (128/2) para o pé ficar no meio do quadro
    half = max(64 - x0, x1 - 64)
    x0, x1 = 64 - half, 64 + half
    fw, fh = x1 - x0, y1 - y0
    cols = max(len(fs) for _, fs in rs)
    out = Image.new("RGBA", (fw * cols, fh * len(rs)))
    for r, (_, fs) in enumerate(rs):
        for k, f in enumerate(fs):
            out.paste(clean(f).crop((x0, y0, x1, y1)), (k * fw, r * fh))
    return out, fw, fh, cols


def save(name, im):
    for d in OUTS:
        os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, name + ".png"), optimize=True)


def portrait(folder, name, frame, box):
    f = clean(frames(folder, name, frame + 1)[frame]).crop(box)
    w, h = f.size
    k = 120 // max(w, h)
    f = f.resize((w * k, h * k), Image.NEAREST)
    o = Image.new("RGBA", (128, 128))
    o.paste(f, ((128 - f.width) // 2, 128 - f.height), f)
    return o


def main():
    meta = {}
    for key, folder in (("gato-a", "Animal_1"), ("gato-b", "Animal_4")):
        im, fw, fh, cols = sheet(os.path.join(AP, folder), [("Idle", 7), ("Walk", 11), ("Jamp", 10), ("Special", 4)])
        save(key, im)
        meta[key] = [fw, fh, cols]
    # outras pelagens: troca exata da paleta do pack (contorno e olhos ficam iguais)
    A = np.array(Image.open(os.path.join(OUTS[0], "gato-a.png")).convert("RGBA"))
    Bc = np.array(Image.open(os.path.join(OUTS[0], "gato-b.png")).convert("RGBA"))
    for key, base, pal in (
        ("gato-c", A, {(255, 224, 183): (246, 244, 238), (189, 164, 153): (204, 206, 214), (45, 27, 30): (222, 222, 228), (136, 110, 106): (178, 180, 190)}),   # branca
        ("gato-d", A, {(255, 224, 183): (62, 60, 70), (189, 164, 153): (42, 40, 48), (45, 27, 30): (26, 24, 30), (136, 110, 106): (34, 32, 40)}),              # preto
        ("gato-e", A, {(255, 224, 183): (172, 176, 188), (189, 164, 153): (132, 136, 150), (45, 27, 30): (84, 86, 100), (136, 110, 106): (104, 106, 120)}),     # cinza
        ("gato-f", Bc, {(140, 91, 62): (226, 134, 56), (45, 27, 30): (156, 72, 30), (136, 110, 106): (180, 98, 52), (189, 164, 153): (246, 206, 160)}),          # laranja
    ):
        o = base.copy()
        for src, dst in pal.items():
            mk = (base[..., 0] == src[0]) & (base[..., 1] == src[1]) & (base[..., 2] == src[2]) & (base[..., 3] > 0)
            o[mk, 0], o[mk, 1], o[mk, 2] = dst
        save(key, Image.fromarray(o))
        meta[key] = meta["gato-a" if base is A else "gato-b"]
    dw = os.path.join(DP, "Dwarf_2")
    im, fw, fh, cols = sheet(dw, [("Idle", 6), ("Walk", 10), ("Run", 10), ("Hurt", 3), ("Dead", 4), ("Idle_2", 6)])
    save("aprendiz", im)
    meta["aprendiz"] = [fw, fh, cols]
    # rosto: caixa em volta do capuz e da barba no quadro parado
    a = np.array(clean(frames(dw, "Idle", 1)[0]))
    ys, xs = np.where(a[..., 3] > 0)
    top = ys.min()
    head = (a[..., 3] > 0) & (np.arange(128)[:, None] < top + 26)
    hy, hx = np.where(head)
    cx = int(np.median(hx))
    box = (cx - 15, top - 2, cx + 15, top + 28)
    p = portrait(dw, "Idle", 0, box)
    for ex in ("talk", "calm", "smile", "sadness", "aggression", "special"):
        save(f"aprendiz-p-{ex}", p)
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
