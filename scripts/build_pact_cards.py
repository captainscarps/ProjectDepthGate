"""
Cartas dos Pactos do Modo Infinito: monta a frente de cada carta (moldura do tipo + fundo + ilustração
+ número), o verso, o brilho das lendárias e as bolsas de cartas em assets/pixel-art/cards/.
Os textos (nome e efeito) são escritos pelo jogo (scripts/source não; assets/abyss-cards.js).

Os pacotes originais NÃO ficam no repositório (licenças proíbem redistribuir). Para gerar de novo:
  CARD_KIT=".../PixelCardUI_Resource" ICONS=".../pasta com icon-pack-1, icon_-_pack-2 e icon-pack-3" \
  python3 scripts/build_pact_cards.py
"""
import os
import re
import glob
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIT = os.environ.get("CARD_KIT", "/tmp/kit/PixelCardUI_Resource")
ICO = os.environ.get("ICONS", "/tmp/icons")
OUTS = [os.path.join(ROOT, "assets", "pixel-art", "cards"), os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "cards")]
K = os.path.join(KIT, "1_Sprites") + "/"
FONT = ImageFont.truetype(os.path.join(KIT, "2_Font", "NeoDunggeunmoPro-Regular.ttf"), 13)

TYPES = {"b": ("04_Green/Front_Green_01_Base_Window.png", "UI_Card_BG_Green.png"),
         "p": ("05_Purple/Front_Purple_02_Symbol_Window.png", "UI_Card_BG_Purple.png"),
         "m": ("02_Red/Front_Red_03_Hinge_Window.png", "UI_Card_BG_Brown.png"),
         "l": ("01_Basic/Front_Basic_04_Monster_Window.png", "UI_Card_BG_Blue.png")}
# id: ilustração (P = poções, L = livros, X = pingentes e runas)
ART = {"b1": "X7", "b2": "X6", "b3": "L9", "b4": "X8", "b5": "P1",
       "p6": "L4", "p7": "X3", "p8": "P5", "p9": "P9", "p10": "L3", "p11": "X4", "p12": "L7",
       "m13": "P3", "m14": "P7", "m15": "X2", "m16": "P8", "m17": "L5", "m18": "P4", "m19": "L6", "m20": "L2",
       "l1": "X5", "l2": "L8", "l3": "X10", "l4": "L10", "l5": "P10"}


def icon(code):
    n = int(code[1:])
    pats = {"P": f"**/potions ({n}).png", "L": f"**/books ({n}).png", "X": f"**/*icon-pack-3/PNG/{n}.png"}
    hits = [f for f in glob.glob(os.path.join(ICO, pats[code[0]]), recursive=True) if "/PNG/" in f]
    im = Image.open(hits[0]).convert("RGBA")
    return im.crop(im.getbbox())


def card(cid):
    t = cid[0]
    num = int(cid[1:])
    fr, bg = TYPES[t]
    c = Image.open(K + fr).convert("RGBA")
    base = Image.new("RGBA", c.size, (0, 0, 0, 0))
    b = Image.open(K + "06_Common_Decorations/" + bg).convert("RGBA").resize((108, 108), Image.NEAREST)
    base.alpha_composite(b, (23, 25))
    im = icon(ART[cid])
    s = 88 / max(im.size)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sh.putalpha(im.getchannel("A").point(lambda v: int(v * .55)))
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    cx, cy = 77, 74
    base.alpha_composite(sh, (cx - im.width // 2 + 3, cy - im.height // 2 + 4))
    base.alpha_composite(im, (cx - im.width // 2, cy - im.height // 2))
    base.alpha_composite(c)
    d = ImageDraw.Draw(base)
    d.text((20, 19), str(num), font=FONT, fill=(255, 236, 190) if t == "l" else (255, 255, 255), anchor="mm",
           stroke_width=1, stroke_fill=(30, 20, 20))
    return base


def save(im, name):
    for o in OUTS:
        if os.path.isdir(os.path.dirname(o)):
            os.makedirs(o, exist_ok=True)
            im.save(os.path.join(o, name), optimize=True)


for cid in ART:
    save(card(cid), f"card-{cid}.png")
save(Image.open(K + "07_CardPack/Back_QuestionMark.png").convert("RGBA"), "card-back.png")
save(Image.open(K + "06_Common_Decorations/UI_Card_Front_fx.png").convert("RGBA"), "card-fx.png")
for a, b in (("Normal", "pack"), ("Open", "pack-open"), ("Rare", "pack-rare"), ("Rare_Open", "pack-rare-open")):
    save(Image.open(K + f"07_CardPack/UI_Image_CardPack_{a}.png").convert("RGBA"), f"{b}.png")
print("cartas:", len(ART))
