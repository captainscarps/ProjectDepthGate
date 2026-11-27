"""Aelric jovem com roupa de príncipe rebelde (p216.138) — PixelLab.
Referência: edit-images-v2 sobre as poses (scripts/art-src/aelric-jovem/roupa/pose-south-22.png frente e
pose-east-11.png perfil): gibão carmim aberto com friso dourado, camisa de linho solta, mangas arregaçadas, cinto de couro,
luvas sem dedos, meia capa azul rasgada num ombro, botas vermelhas gastas — mesmo cabelo, rosto e lança.
transfer-outfit-v2 aplica a roupa em TODAS as folhas do príncipe (3 quadros de 128×128 por pedido, mesmo movimento).
Saída: scripts/art-src/aelric-jovem/roupa/<folha>.png; o build copia para assets/pixel-art/valdrak/ (sem roupa em
scripts/art-src/aelric-jovem/sem-roupa/). Uso: python3 scripts/gerar_aelric_roupa.py [folha…]"""
import os, sys, shutil
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, "assets/pixel-art/valdrak"); S = os.path.join(ROOT, "scripts/art-src/aelric-jovem"); R = os.path.join(S, "roupa"); B = os.path.join(S, "sem-roupa")
os.makedirs(B, exist_ok=True); F = 128
FRONT = os.path.join(R, "pose-south-22.png"); SIDE = os.path.join(R, "pose-east-11.png")
BACK = os.path.join(R, "pose-north-r.png"); BACKD = os.path.join(R, "pose-north-east-r.png")   # costas: capa no ombro esquerdo (sem isso a capa trocava de lado entre os quadros)
SHEETS = {  # folha: (referência, dica de vista)
 "aelric-young-idle": (SIDE, "the character stands facing right in three-quarter view"), "aelric-young-idle2": (SIDE, "the character stands facing right in three-quarter view"),
 "aelric-young-walk": (SIDE, "side view, walking to the right"), "aelric-young-run": (SIDE, "side view, running to the right"),
 "aelric-young-attack1": (SIDE, "side view facing right, thrusting the spear"), "aelric-young-attack2": (SIDE, "side view facing right, swinging the spear"),
 "aelric-young-jump": (SIDE, "side view facing right, jumping"), "aelric-young-hurt": (SIDE, "side view facing right, getting hit"),
 "aelric-young-dead": (SIDE, "side view, falling down defeated"),
 "aelric-young-w-e": (SIDE, "side view, walking to the right"), "aelric-young-w-se": (FRONT, "three-quarter front view, walking down-right toward the viewer"),
 "aelric-young-w-s": (FRONT, "front view, walking toward the viewer"), "aelric-young-w-n": (BACK, "back view: the character walks away from the viewer, we see his back, the cape always hangs from his left shoulder down his back like in the reference"),
 "aelric-young-w-ne": (BACKD, "three-quarter back view: walking up-right away from the viewer, the cape always hangs down his back like in the reference"),
}
EXTRA = "keep exactly the same pose, motion, body position, spear and hair of each frame; only change the clothes to match the reference outfit"
def chunks(n):
    out, i = [], 0
    while i < n:
        k = 3 if n - i != 4 else 2
        if n - i == 1: out[-1] = (out[-1][0], out[-1][1] + 1); break
        out.append((i, min(n, i + k))); i += k
    return out
def one(name):
    dst = os.path.join(R, name + ".png")
    if os.path.exists(dst): return name + " já existe"
    src = os.path.join(V, name + ".png"); bk = os.path.join(B, name + ".png")
    if not os.path.exists(bk): shutil.copy(src, bk)
    st = Image.open(bk).convert("RGBA"); n = st.width // F
    fr = [st.crop((i * F, 0, i * F + F, F)) for i in range(n)]
    ref, hint = SHEETS[name]; out = [None] * n
    for a, b in chunks(n):
        if b - a > 3: a2 = b - 3; parts = [(a, a2), (a2, b)] if a2 - a >= 2 else [(a, b - 2), (b - 2, b)]
        else: parts = [(a, b)]
        for x, y in parts:
            if y - x < 2: x -= 1
            r = job(post("/transfer-outfit-v2", {"reference_image": {"image": b64(ref), "size": {"width": F, "height": F}},
                "frames": [{"image": b64(f), "size": {"width": F, "height": F}} for f in fr[x:y]], "image_size": {"width": F, "height": F},
                "no_background": True, "additional_instructions": hint + "; " + EXTRA, "seed": 7}))
            for i, im in zip(range(x, y), images_of(r)): out[i] = im
    sh = Image.new("RGBA", (F * n, F))
    for i, im in enumerate(out): sh.paste(im if im is not None else fr[i], (i * F, 0))
    sh.save(dst); return f"{name} {n} quadros"
want = [a for a in sys.argv[1:] if a in SHEETS] or ([] if "--instalar" in sys.argv else list(SHEETS))
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(one, want): print(r, flush=True)
# instala: as folhas com roupa substituem as do jogo (as sem roupa ficam em sem-roupa/)
for name in SHEETS:
    p = os.path.join(R, name + ".png")
    if os.path.exists(p): Image.open(p).convert("RGBA").save(os.path.join(V, name + ".png"), optimize=True)
print("instalado")
