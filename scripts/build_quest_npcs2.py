"""NPCs das missões "Os Gatos da Vila" e "O Aprendiz do Ferreiro" (packs CraftPix fora do repositório).
  ANIMALS_PACK: "Urban Animals Sprite Sheet"  -> gato-a (Animal_1, siamês), gato-b (Animal_4, laranja)
  DWARF_PACK:   "Dwarf 2D Pixel Art Sprite"   -> aprendiz (Dwarf_2, anão de capuz e picareta)
  ELF_PACK:     "NPC Elf 2D Pixel Art Character" -> alline (Elf_3, a elfa ruiva dos gatos)
  ALLINE_FACES: folha 3x2 com os 5 rostos de fala da Alline (512 px cada; recorte do fundo por GrabCut)
  RAFAEL_FACES: folha com os 5 rostos de fala do Rafael, o ferreiro (3 em cima, 2 embaixo centralizados)
Gera em assets/pixel-art/npc/ (todas as linhas com o mesmo recorte, para o pé não "pular"):
  gato-a.png               linhas: parado 7, andando 11, pulo 10, especial 4 (Mel, siamesa)
  gato-d.png / gato-g.png  mesmas linhas, outras pelagens por troca de paleta: Carvão (preto) e Ollie (cinza rajado)
  alline.png               linhas: parada 7, parada2 7, andando 12, falando 8, especial 7
  alline-p-<expressão>.png retratos 128x128
  ferreiro.png             o ferreiro do Refúgio (peasant-1) com cabelo e barba pretos; ferreiro-p-<expressão>.png
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
EP = os.environ.get("ELF_PACK", "/tmp/dg/packs/elfnpc")
FACES = os.environ.get("ALLINE_FACES", "/tmp/dg/alline-faces.png")
RFACES = os.environ.get("RAFAEL_FACES", "/tmp/dg/ferreiro-faces.png")
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


KEEP_CATS = {"gato-a", "gato-d", "gato-g"}   # Mel (siamesa), Carvão (preto) e Ollie (cinza rajado)


def save(name, im):
    if name.startswith("gato-") and name not in KEEP_CATS:
        return
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
    meta, base_cats = {}, {}
    for key, folder in (("gato-a", "Animal_1"), ("gato-b", "Animal_4")):
        im, fw, fh, cols = sheet(os.path.join(AP, folder), [("Idle", 7), ("Walk", 11), ("Jamp", 10), ("Special", 4)])
        base_cats[key] = im.convert("RGBA")
        save(key, im)
        meta[key] = [fw, fh, cols]
    # outras pelagens: troca exata da paleta do pack (contorno e olhos ficam iguais)
    A = np.array(base_cats["gato-a"])
    Bc = np.array(base_cats["gato-b"])
    for key, base, pal in (
        ("gato-c", A, {(255, 224, 183): (246, 244, 238), (189, 164, 153): (204, 206, 214), (45, 27, 30): (222, 222, 228), (136, 110, 106): (178, 180, 190)}),   # branca
        ("gato-d", A, {(255, 224, 183): (62, 60, 70), (189, 164, 153): (42, 40, 48), (45, 27, 30): (26, 24, 30), (136, 110, 106): (34, 32, 40)}),              # preto
        ("gato-e", A, {(255, 224, 183): (172, 176, 188), (189, 164, 153): (132, 136, 150), (45, 27, 30): (84, 86, 100), (136, 110, 106): (104, 106, 120)}),     # cinza
        ("gato-f", Bc, {(140, 91, 62): (226, 134, 56), (45, 27, 30): (156, 72, 30), (136, 110, 106): (180, 98, 52), (189, 164, 153): (246, 206, 160)}),          # laranja
        ("gato-g", Bc, {(140, 91, 62): (150, 154, 164), (45, 27, 30): (62, 64, 74), (136, 110, 106): (112, 116, 128), (189, 164, 153): (214, 216, 224)}),         # cinza rajado (Ollie)
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
    # Alline: sprite do pack de elfos (Elf_3) e os rostos de fala desenhados para ela
    im, fw, fh, cols = sheet(os.path.join(EP, "Elf_3"), [("Idle", 7), ("Idle_2", 7), ("Walk", 12), ("Dialogue", 8), ("Special", 7)])
    save("alline", im)
    meta["alline"] = [fw, fh, cols]
    if os.path.isfile(FACES):
        faces = cut_faces(FACES, [(0, 0), (512, 0), (1024, 0), (0, 512), (512, 512)], leaves=True)
        for ex, k in (("talk", 0), ("calm", 0), ("smile", 1), ("aggression", 2), ("special", 3), ("sadness", 4)):
            save(f"alline-p-{ex}", faces[k])
    # Rafael, o ferreiro: o mesmo sprite do Refúgio (peasant-1) com cabelo e barba pretos, e os rostos dele
    p1 = np.array(Image.open(os.path.join(OUTS[0], "peasant-1.png")).convert("RGBA"))
    o = p1.copy()
    for src, dst in {(221, 206, 191): (78, 70, 74), (189, 164, 153): (42, 37, 41)}.items():
        mk = (p1[..., 0] == src[0]) & (p1[..., 1] == src[1]) & (p1[..., 2] == src[2]) & (p1[..., 3] > 0)
        o[mk, 0], o[mk, 1], o[mk, 2] = dst
    save("ferreiro", Image.fromarray(o))
    if os.path.isfile(RFACES):
        faces = cut_faces(RFACES, [(0, 0), (512, 0), (1024, 0), (256, 512), (768, 512)])
        for ex, k in (("talk", 0), ("calm", 0), ("smile", 1), ("aggression", 2), ("special", 3), ("sadness", 4)):
            save(f"ferreiro-p-{ex}", faces[k])
    print(json.dumps(meta))


def cut_faces(path, cells, leaves=False):
    """recorta o fundo desfocado de cada rosto (GrabCut; na Alline a folha de louro é marcada como figura)"""
    import cv2
    src = cv2.imread(path)
    out = []
    for k, (cx, cy) in enumerate(cells):
        cell = src[cy:cy + 512, cx:cx + 512].copy()
        hsv = cv2.cvtColor(cell, cv2.COLOR_BGR2HSV)
        mask = np.full(cell.shape[:2], cv2.GC_PR_BGD, np.uint8)
        cv2.rectangle(mask, (40, 25), (480, 511), cv2.GC_PR_FGD, -1)
        cv2.ellipse(mask, (250, 260), (90, 120), 0, 0, 360, cv2.GC_FGD, -1)
        green = (hsv[..., 0] > 28) & (hsv[..., 0] < 60) & (hsv[..., 1] > 90) & (hsv[..., 2] > 60)
        if not leaves:
            green[:] = False
            mask[503:, :] = cv2.GC_BGD  # brilho do fundo abaixo da linha dos ombros
        mask[green] = cv2.GC_FGD
        mask[:8, :] = cv2.GC_BGD; mask[:, :8] = cv2.GC_BGD; mask[:, -8:] = cv2.GC_BGD
        if leaves and k == 3:
            mask[120:220, 30:105] = cv2.GC_BGD  # traços de susto desenhados fora do cabelo
        bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
        cv2.grabCut(cell, mask, None, bgd, fgd, 10, cv2.GC_INIT_WITH_MASK)
        fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
        fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        keep = (lab == big).astype(np.uint8)
        for i in range(1, n):
            if i != big and st[i, cv2.CC_STAT_AREA] > 400 and green[lab == i].mean() > 0.3:
                keep[lab == i] = 1
        if not leaves:
            # óculos: a armação sai do rosto por cima do fundo; fecha a área da cabeça para não cortar o aro
            cl = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
            keep[90:380] = cl[90:380]
        inv = 1 - keep
        n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv, 4)
        for i in range(1, n2):
            x, y, w, h, a = st2[i]
            if x > 0 and y > 0 and x + w < 512 and y + h < 512:
                keep[lab2 == i] = 1
        rgba = cv2.cvtColor(cell, cv2.COLOR_BGR2RGBA)
        rgba[..., 3] = keep * 255
        im = Image.fromarray(rgba).resize((128, 128), Image.BOX)
        a = np.array(im)
        a[..., 3] = np.where(a[..., 3] >= 128, 255, 0)
        out.append(Image.fromarray(a))
    return out


if __name__ == "__main__":
    main()
