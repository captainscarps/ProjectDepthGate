"""Hakama do Kyūdō — armadura do ferreiro para o Arqueiro (p216.139) — PixelLab.
Visual (ideia do Rafael: arqueiro de kyūdō): sem elmo nem armadura, cabelo preto longo num rabo alto, barba por fazer,
quimono azul-marinho quase preto com a manga direita tirada (ombro, braço e peito direitos à mostra), hakama plissada
verde-floresta até o tornozelo, faixa obi verde-sálvia, tabi brancas com sandálias de palha, braçadeiras de couro,
arco yumi bem alto com empunhadura de cordão dourado e aljava escura.
Referências (edit-images-v2 sobre o Arqueiro): armaduras/kyudo/ref-front-5.png (frente) e ref-back-9.png (costas).
transfer-outfit-v2 aplica a roupa nas MESMAS animações do Arqueiro (scripts/art-src/arqueiro/*.png, quadros 192×192,
3 por pedido) → scripts/art-src/armaduras/kyudo-<anim>.png; build_armaduras_unicas.py kyudo monta as folhas do jogo.
Uso: python3 scripts/gerar_armadura_kyudo.py [anim…]"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "scripts/art-src/arqueiro"); O = os.path.join(ROOT, "scripts/art-src/armaduras"); K = os.path.join(O, "kyudo"); F = 192
FRONT = os.path.join(K, "ref-front-5.png"); BACK = os.path.join(K, "ref-back-9.png")
SIDE = "side view facing right"
ANIMS = {"idle": (FRONT, "the archer stands facing right in three-quarter view"), "walk": (FRONT, SIDE + ", walking"), "run": (FRONT, SIDE + ", running"),
         "attack": (FRONT, SIDE + ", drawing the bow and shooting an arrow"), "cast": (FRONT, SIDE + ", shooting"), "hurt": (FRONT, SIDE + ", getting hit"),
         "death": (FRONT, SIDE + ", falling down defeated"), "sk-charge": (FRONT, SIDE + ", charging a powerful shot"), "sk-fence": (FRONT, SIDE + ", shooting arrows"),
         "sk-multi": (FRONT, SIDE + ", shooting several arrows"), "sk-repulse": (FRONT, SIDE + ", pushing enemies away")}
for d, ref, h in [("south", FRONT, "front view, walking toward the viewer"), ("se", FRONT, "three-quarter front view, moving down-right"),
                  ("north", BACK, "back view, moving away from the viewer, the bare right shoulder is on the right side of the image like in the reference"),
                  ("ne", BACK, "three-quarter back view, moving up-right away from the viewer, the bare right shoulder like in the reference")]:
    for m in ("walk", "run"): ANIMS[f"dirs2-{d}-{m}"] = (ref, h + (", running" if m == "run" else ""))
# pesca (p216.49): as mesmas poses do Arqueiro com a vara → scripts/art-src/pesca/archer-kyudo-<k>.png
P = os.path.join(ROOT, "scripts/art-src/pesca")
for k in ("rod", "cast", "wait", "reel", "catch"): ANIMS["pesca-" + k] = (FRONT, "the archer is fishing with a fishing rod, side view facing right; keep the fishing rod exactly as it is")
EXTRA = "keep exactly the same pose, motion, body position, bow and arrows of each frame; only change the hair and clothes to match the reference outfit (no helmet, no armor)"
def chunks(n):
    out, i = [], 0
    while i < n:
        if n - i == 4: out += [(i, i + 2), (i + 2, n)]; break
        out.append((i, min(n, i + 3))); i += 3
    if out and out[-1][1] - out[-1][0] == 1: a, b = out.pop(); out[-1] = (out[-1][0], b - 1); out.append((b - 2, b))
    return out
def one(name):
    fish = name.startswith("pesca-")
    dst = os.path.join(P, f"archer-kyudo-{name[6:]}.png") if fish else os.path.join(O, f"kyudo-{name}.png")
    if os.path.exists(dst): return name + " já existe"
    st = Image.open(os.path.join(P, f"archer-{name[6:]}.png") if fish else os.path.join(A, name + ".png")).convert("RGBA")
    F = st.height; n = st.width // F
    fr = [st.crop((i * F, 0, i * F + F, F)) for i in range(n)]; out = [None] * n
    if n == 1: fr = fr * 2; n = 2; out = [None, None]            # vara parada: um quadro só (o pedido pede ≥ 2)
    ref, hint = ANIMS[name]
    for x, y in chunks(n):
        r = job(post("/transfer-outfit-v2", {"reference_image": {"image": b64(Image.open(ref).convert("RGBA").resize((F, F), Image.NEAREST) if F != 192 else ref), "size": {"width": F, "height": F}},
            "frames": [{"image": b64(f), "size": {"width": F, "height": F}} for f in fr[x:y]], "image_size": {"width": F, "height": F},
            "no_background": True, "additional_instructions": hint + "; " + EXTRA, "seed": 7}))
        for i, im in zip(range(x, y), images_of(r)): out[i] = im
    if fish and name == "pesca-rod": out, fr, n = out[:1], fr[:1], 1
    sh = Image.new("RGBA", (F * n, F))
    for i, im in enumerate(out): sh.paste(im if im is not None else fr[i], (i * F, 0))
    sh.save(dst); return f"{name} {n}"
want = sys.argv[1:] or list(ANIMS)
with ThreadPoolExecutor(5) as ex:
    for r in ex.map(one, want): print(r, flush=True)
