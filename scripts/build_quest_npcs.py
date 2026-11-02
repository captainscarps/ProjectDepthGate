"""
NPCs das missões secundárias (packs CraftPix fora do repositório pela licença).
  PRIEST_PACK: "Priest Pixel Art Character Sprite Sheets" -> bispo (Priests_2, também chefe) e freira (Priests_3)
  KID_PACK:    "Anime Warrior Man Character" -> menino (Man_1)
Gera em assets/pixel-art/npc/:
  bispo.png  128x128 por quadro; linhas: parado 6, andando 12, ataque 8, especial 4, falando 10
  freira.png 72x72 por quadro;  linhas: parada 8, andando 12, falando 8
  menino.png 64x77 por quadro;  linhas: parado 6, andando 12, correndo 12, dano 3
  <nome>-p-<expressão>.png retratos 128x128 (rosto ampliado)
Uso: PRIEST_PACK=... KID_PACK=... python3 scripts/build_quest_npcs.py
"""
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PP = os.environ.get("PRIEST_PACK", "/tmp/pr/x")
KP = os.environ.get("KID_PACK", "/tmp/kid/x")
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "npc"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "npc")]


def sheet(folder, rows, fw, fh, x0, y0):
    out = Image.new("RGBA", (fw * max(n for _, n in rows), fh * len(rows)))
    for r, (name, n) in enumerate(rows):
        s = Image.open(os.path.join(folder, name + ".png")).convert("RGBA")
        for k in range(n):
            out.paste(s.crop((k * 128 + x0, y0, k * 128 + x0 + fw, y0 + fh)), (k * out.width // max(n for _, n in rows) if False else k * fw, r * fh))
    return out


def face(folder, name, frame=0, size=22, dy=0):
    """rosto: centro dos pixels de pele (r > g > b, claro) no quadro parado"""
    s = np.array(Image.open(os.path.join(folder, name + ".png")).convert("RGBA"))[:, frame * 128:(frame + 1) * 128]
    a = s.astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    skin = (a[..., 3] > 0) & (r > 150) & (r > g + 15) & (g > b) & (r - b > 40)
    ys, xs = np.where(skin)
    top = ys.min(); sel = ys < top + 10
    cx, cy = int(np.median(xs[sel])), int(np.median(ys[sel]))
    im = Image.fromarray(s).crop((cx - size // 2, cy - size // 2 + dy, cx + size // 2, cy + size // 2 + dy)).resize((120, 120), Image.NEAREST)
    o = Image.new("RGBA", (128, 128)); o.paste(im, (4, 8), im); return o


def save(name, im):
    for d in OUTS:
        os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name + ".png"), optimize=True)


def main():
    p2, p3 = os.path.join(PP, "Priests_2"), os.path.join(PP, "Priests_3")
    save("bispo", sheet(p2, [("Idle", 6), ("Walk", 12), ("Attack", 8), ("Special", 4), ("Dialogue", 10)], 128, 128, 0, 0))
    save("freira", sheet(p3, [("Idle", 8), ("Walk", 12), ("Dialogue", 8)], 72, 72, 40, 56))
    save("menino", sheet(os.path.join(KP, "Man_1"), [("Idle", 6), ("Walk", 12), ("Run", 12), ("Hurt", 3)], 64, 77, 20, 51))
    for nm, folder in (("bispo", p2), ("freira", p3)):
        f = face(folder, "Idle", size=26 if nm == "bispo" else 22, dy=6 if nm == "bispo" else 2)
        for ex in ("talk", "calm", "smile", "sadness", "aggression", "special"):
            g = f.copy()
            if ex in ("aggression", "special"):
                a = np.array(g).astype(int); m = a[..., 3] > 0; a[m, 0] = np.minimum(255, a[m, 0] + (40 if ex == "aggression" else 10)); a[m, 2] = np.minimum(255, a[m, 2] + (0 if ex == "aggression" else 40)); g = Image.fromarray(a.astype("uint8"))
            save(f"{nm}-p-{ex}", g)
    f = face(os.path.join(KP, "Man_1"), "Idle", size=26, dy=0)
    for ex in ("talk", "calm", "smile", "sadness", "aggression", "special"):
        save(f"menino-p-{ex}", f)
    print("ok")


if __name__ == "__main__":
    main()
