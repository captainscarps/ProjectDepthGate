"""
Cabana da bruxa a partir do pack "Main Characters Home" (CraftPix, fora do repositório pela licença).
Gera em assets/pixel-art/props/:
  wh-cabin.png     casa recolorida para bruxa (telhado roxo-escuro, paredes sujas, janelas com brilho verde)
  wh-smoke.png     6 quadros 48x31 de fumaça da chaminé (tingida de verde no jogo)
  wh-interior.png  fundo do interior 192x160 (parede de pedra, piso, rodapé, janelas, tapetes)
  wh-props.png/.json  móveis recortados do Interior.png (cama, estantes, mesa de poções, ervas...)
Tudo em escala nativa (ladrilho de 16 px); no jogo é desenhado em 2x.
Uso: WH_PACK="/pasta/PNG" python3 scripts/build_witch_house.py
"""
import colorsys
import json
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACK = os.environ.get("WH_PACK", "/tmp/mc/a/PNG")


def recolor(im, fn):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            o = fn(h * 360, s, l)
            if o:
                rr, gg, bb = colorsys.hls_to_rgb(o[0] / 360, o[2], o[1])
                px[x, y] = (int(rr * 255), int(gg * 255), int(bb * 255), a)
    return im


def witchy(h, s, l):
    if (h < 22 or h > 340) and s > .35:            # telhado vermelho -> roxo escuro
        return (276, s * .32, l * .62)
    if 200 < h < 260 and s > .25 and l > .35:       # vidro azul -> verde aceso
        return (105, .72, min(.62, l * 1.05))
    if 30 <= h < 60 and l > .6:                     # reboco creme -> cinza sujo
        return (40, s * .35, l * .62)
    if s < .2:                                       # pedra cinza -> mais escura
        return (h, s, l * .78)
    if 15 <= h < 45:                                 # madeira -> mais escura
        return (h, s * .8, l * .72)
    return None


def main():
    P = lambda f: Image.open(os.path.join(PACK, f)).convert("RGBA")
    ext, inter, wf, smoke = P("exterior.png"), P("Interior.png"), P("walls_floor.png"), P("Smoke_animation.png")
    out = {}
    out["wh-cabin"] = recolor(ext.crop((14, 0, 142, 127)), witchy)
    out["wh-smoke"] = Image.new("RGBA", (288, 31))
    for k in range(6):
        fr = smoke.crop((k * 48, 0, k * 48 + 48, 31))
        out["wh-smoke"].paste(fr, (k * 48, 0))
    # interior 192x160 (nativo): parede ao fundo, piso, bordas
    W, H = 192, 160
    bg = Image.new("RGBA", (W, H), (24, 20, 26, 255))
    floor = recolor(wf.crop((112, 64, 144, 96)), lambda h, s, l: (h, s * .8, l * .78))
    for y in range(32, 144, 32):
        for x in range(16, 176, 32):
            bg.paste(floor, (x, y))
    wall = recolor(wf.crop((0, 96, 48, 128)), lambda h, s, l: (h, s, l * .82) if s < .25 else None)
    for x in range(8, 184, 48):
        bg.paste(wall, (x, 2), wall)
    cream = wf.getpixel((60, 4))
    for x in range(8, 184):
        for y in range(0, 3):
            bg.putpixel((x, y), cream)
    for y in range(0, 148):
        for x in list(range(12, 16)) + list(range(176, 180)):
            bg.putpixel((x, y), cream if x in (15, 176) else (40, 34, 40, 255))
    for x in range(0, W):
        for y in range(148, H):
            bg.putpixel((x, y), (24, 20, 26, 255))
    for x in range(12, 180):
        for y in range(144, 148):
            bg.putpixel((x, y), cream if y == 144 else (40, 34, 40, 255))
    # vão da porta embaixo, no meio
    for x in range(88, 104):
        for y in range(144, 160):
            bg.putpixel((x, y), (58, 44, 34, 255) if y < 156 else (24, 20, 26, 255))
    win = recolor(wf.crop((88, 66, 106, 88)), witchy)
    for x in (66, 108):
        bg.paste(win, (x, 6), win)
    rug = inter.crop((11, 279, 103, 360))
    for cx0, cy0 in ((0, 0), (rug.width - 12, 0), (0, rug.height - 12), (rug.width - 12, rug.height - 12)):
        for yy in range(cy0, cy0 + 12):
            for xx in range(cx0, cx0 + 12):
                rug.putpixel((xx, yy), (0, 0, 0, 0))
    rug = recolor(rug, lambda h, s, l: (285, s * .55, l * .75) if s > .1 else None)
    bg.paste(rug, (50, 62), rug)
    out["wh-interior"] = bg
    # móveis
    crops = {
        "bed": (50, 0, 25, 40), "bookshelf": (162, 80, 28, 46), "shelf-jars": (5, 84, 53, 57), "shelf": (114, 80, 44, 46),
        "potions-table": (83, 35, 28, 40), "round-table": (8, 145, 65, 57), "pot1": (111, 230, 18, 24), "pot2": (129, 232, 13, 17),
        "herbs": (82, 201, 24, 33), "garlic": (172, 187, 16, 42), "barrel": (156, 1, 18, 26), "box": (177, 6, 15, 19), "chair": (12, 207, 13, 26), "crate": (85, 1, 21, 29),
    }
    sheet = Image.new("RGBA", (256, 160)); meta = {}; x = y = rowh = 0
    for name, (cx, cy, cw, ch) in crops.items():
        if x + cw > 256:
            x = 0; y += rowh + 1; rowh = 0
        sheet.paste(inter.crop((cx, cy, cx + cw, cy + ch)), (x, y)); meta[name] = [x, y, cw, ch]; x += cw + 1; rowh = max(rowh, ch)
    out["wh-props"] = sheet
    d = os.path.join(ROOT, "assets", "pixel-art", "props")
    for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
        dd = os.path.join(base, "assets", "pixel-art", "props")
        if not os.path.isdir(dd):
            continue
        for k, im in out.items():
            im.save(os.path.join(dd, k + ".png"), optimize=True)
        json.dump(meta, open(os.path.join(dd, "wh-props.json"), "w"), separators=(",", ":"))
    print({k: v.size for k, v in out.items()})


if __name__ == "__main__":
    main()
