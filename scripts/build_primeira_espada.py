"""Monta a arte da missão "A Primeira Espada" (p216.103) a partir de scripts/art-src/primeira-espada/:
- assets/pixel-art/npc/gaspar.png: folha 9×5 de 128 (parado, andando, golpe, dano, morte)
- retratos gaspar-p-<expr> (calm/smile = talk; special = aggression), objetos pe-*.png, ícone icon-fita-ivone.png (32 px)
- ícones 80×80 da Fita da Ivone e da espada vão para scripts/art-src/itens-extra/ (o build_armaduras_icones.py os põe no atlas items-hd)"""
import os, shutil
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/primeira-espada"); N = os.path.join(ROOT, "assets/pixel-art/npc"); X = os.path.join(ROOT, "scripts/art-src/itens-extra")
os.makedirs(X, exist_ok=True)
sheet = Image.new("RGBA", (9 * 128, 5 * 128))
for r, n in enumerate(["gaspar-idle", "gaspar-walk", "gaspar-attack", "gaspar-hurt", "gaspar-death"]):
    im = Image.open(os.path.join(S, n + ".png")).convert("RGBA")
    for i in range(min(9, im.width // 128)): sheet.alpha_composite(im.crop((i * 128, 0, i * 128 + 128, 128)), (i * 128, r * 128))
sheet.save(os.path.join(N, "gaspar.png"), optimize=True)
for e, src in {"talk": "talk", "calm": "talk", "smile": "talk", "sadness": "sadness", "aggression": "aggression", "special": "aggression"}.items():
    shutil.copy(os.path.join(S, f"gaspar-p-{src}.png"), os.path.join(N, f"gaspar-p-{e}.png"))
for a, b in [("fita-lapide", "pe-fita-lapide"), ("acampamento", "pe-acampamento"), ("espada-menino", "pe-espada")]:
    shutil.copy(os.path.join(S, a + ".png"), os.path.join(N, b + ".png"))
fi = Image.open(os.path.join(S, "fita-ivone.png")).convert("RGBA"); bb = fi.getbbox(); c = fi.crop(bb)
s = 30 / max(c.size); c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
o = Image.new("RGBA", (32, 32)); o.alpha_composite(c, ((32 - c.width) // 2, (32 - c.height) // 2)); o.save(os.path.join(N, "icon-fita-ivone.png"))
shutil.copy(os.path.join(S, "fita-ivone.png"), os.path.join(X, "fita_ivone.png"))
print("ok")
