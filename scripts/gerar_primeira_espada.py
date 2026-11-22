"""Arte da missão "A Primeira Espada" (p216.103) — PixelLab. Saída bruta em scripts/art-src/primeira-espada/ (pula o que já existe).
Gaspar, o Corvo (chefe): pose de perfil + animações (parado, andando, golpe, dano, morte); retratos no estilo do Farias;
objetos: fita da Ivone presa na lápide, acampamento do Gaspar, a espada torta do menino e o ícone da Fita da Ivone.
Uso: python3 scripts/gerar_primeira_espada.py [nome…]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/primeira-espada"); NPC = os.path.join(ROOT, "assets/pixel-art/npc")
os.makedirs(D, exist_ok=True)
want = sys.argv[1:]
def need(n): return (not want or n in want) and not os.path.exists(os.path.join(D, n + ".png"))
def ref(path, crop=None, usage="art style reference"):
    im = Image.open(path).convert("RGBA"); im = im.crop(crop) if crop else im
    return {"image": b64(im), "size": {"width": im.width, "height": im.height}, "usage_description": usage}
def img(n, desc, w, h, refs=None, style=None):
    if not need(n): return
    body = {"description": desc, "image_size": {"width": w, "height": h}, "no_background": True}
    if refs: body["reference_images"] = refs
    if style: body["style_image"] = style
    images_of(job(post("/generate-image-v2", body)))[0].save(os.path.join(D, n + ".png")); print(n, flush=True)
def strip(fr, n):
    W, H = fr[0].width, fr[0].height; s = Image.new("RGBA", (W * len(fr), H))
    for i, f in enumerate(fr): s.paste(f, (i * W, 0))
    s.save(os.path.join(D, n + ".png")); print(n, len(fr), flush=True)
GASPAR = ("Gaspar the Crow, a gaunt old human mercenary in his sixties, long grey beard and hair with frost in it, ragged black crow-feather "
          "cloak over dented iron armour, pale frostbitten skin, glowing pale-blue eyes, holding one short crude slightly crooked steel sword "
          "in his right hand")
STY = ref(os.path.join(NPC, "bispo.png"), (0, 0, 128, 128), "game sprite style, proportions and size of the character on the canvas")
img("gaspar-pose", GASPAR + ", full body, side view facing right, standing in a combat stance, dark fantasy pixel art game sprite, the character is about 72 pixels tall in the middle of the canvas, transparent background", 128, 128, [STY])
def anim(n, desc, k, last=False):
    if not need(n): return
    first = Image.open(os.path.join(D, "gaspar-pose.png")).convert("RGBA")
    body = {"first_frame": b64(first), "description": desc, "frame_count": k, "no_background": True, "drift_threshold": 0, "direction": "east",
            "subject_description": GASPAR[:290], "initial_pose": "standing in a combat stance, sword in his right hand, facing right"}
    if last: body["last_frame"] = b64(first)
    strip(images_of(job(post("/animate-pixminimax", body))), n)
anim("gaspar-idle", "breathing slowly in his combat stance, cloak feathers moving a little in the cold wind, then back to the same pose. Only one sword.", 8, True)
anim("gaspar-walk", "walking forward to the right, steady heavy steps, sword held low, cloak swaying. Loop. Only one sword.", 8, True)
anim("gaspar-attack", "raises the sword high above his head and slams it down hard in front of him with a frosty slash, then recovers to the stance. Only one sword.", 8, True)
anim("gaspar-hurt", "flinches backwards from a hit, then recovers. Only one sword.", 4, True)
anim("gaspar-death", "drops to one knee, lets go of the sword, slowly kneels and fades, the body crumbling into snow and black feathers", 8)
FAR = ref(os.path.join(NPC, "farias-p-talk.png"), None, "portrait art style, framing and shading (a different person)")
GP = ("portrait bust of Gaspar the Crow, a gaunt old human mercenary in his sixties, long grey beard with frost, black crow-feather cloak collar, "
      "pale frostbitten skin, scar across the cheek, glowing pale-blue eyes, dark background removed, game dialogue portrait, pixel art")
img("gaspar-p-talk", GP + ", calm tired expression", 128, 128, [FAR])
img("gaspar-p-aggression", GP + ", angry shouting expression, teeth showing", 128, 128, [FAR, ref(os.path.join(D, "gaspar-p-talk.png"), None, "the same man: copy his face, beard, scar and clothes")] if os.path.exists(os.path.join(D, "gaspar-p-talk.png")) else [FAR])
img("gaspar-p-sadness", GP + ", sad regretful expression, eyes half closed", 128, 128, [FAR, ref(os.path.join(D, "gaspar-p-talk.png"), None, "the same man: copy his face, beard, scar and clothes")] if os.path.exists(os.path.join(D, "gaspar-p-talk.png")) else [FAR])
img("fita-lapide", "a small cracked old gravestone in a dark crypt with a faded red silk ribbon tied around it, fluttering, top-down rpg game prop, pixel art, transparent background", 64, 64)
img("acampamento", "an abandoned old mercenary camp: a dead campfire with ashes, a torn bedroll, a broken bottle and a big flat stone with carved letters and tally marks, top-down rpg game prop, pixel art, transparent background", 96, 64)
img("espada-menino", "game inventory item icon of a short crude handmade steel sword, slightly crooked blade, simple iron crossguard, grip wrapped in worn leather, made by a child blacksmith, pixel art, centered, transparent background", 80, 80)
img("fita-ivone", "game inventory item icon of a red silk ribbon tied in a loving bow knot with long trailing ends, a tiny golden wedding ring threaded on it, soft glow, pixel art, centered, transparent background", 80, 80)
