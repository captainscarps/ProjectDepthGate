"""Ações especiais dos heróis na tela de escolha (p216.92) — PixelLab animate-pixminimax.
Cada ação começa e termina na pose do herói (first_frame = last_frame = <classe>-pose.png), com correção de cor em
todos os quadros (drift_threshold 0) e descrição explícita da quantidade de armas, para não sair do desenho.
Também gera as artes extras: caveira que sai da terra (Necromante), lobo (Caçador) e urso (Druida).
Saída: scripts/art-src/selecao-hd/<classe>-acao.png e x-<extra>-*.png. Pula o que já existe.
Uso: python3 scripts/gerar_selecao_acoes.py [nome…]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/selecao-hd")
ACT = {
 "archer": (24, "a samurai archer in green lacquered armour with a horned kabuto helmet, carrying exactly one tall longbow and a quiver",
            "standing facing the viewer holding his one longbow upright at his side",
            "raises his one longbow, takes one arrow from the quiver and nocks it, draws the string back to his cheek and aims steadily, then slowly eases the string forward without shooting, puts the arrow back and lowers the bow to his side again. Only one bow and one arrow."),
 "mage": (24, "a sorceress in a dark purple hooded cloak and a long crimson robe with a gold sash, with one swirling violet arcane orb above her palm",
          "standing facing the viewer with one hand raised holding the violet orb above her palm",
          "lifts the violet orb high above her head, the orb flares brighter and bursts upward in a spiral of violet magic sparks, then a new small orb reforms above her palm and she lowers her hand back. She holds no staff."),
 "rogue": (24, "an agile rogue woman in a dark brown leather hood, scarf and corset, holding exactly two curved daggers",
           "in a slight crouch facing the viewer, one dagger raised in reverse grip near her shoulder, the other held low",
           "crouches lower and crosses her two daggers in front of her face, pulls the hood forward, holds still for a moment, then rises back to her ready stance. Only two daggers."),
 "necromancer": (24, "Valthor, a gaunt pale man with glowing red eyes under a black hood, dark hooded robe, holding exactly one staff topped with a glowing crimson rune orb",
                 "standing facing the viewer, staff upright in one hand, other hand raised",
                 "raises his one staff high, the crimson rune flares, he swings the staff down and points it at the ground beside him releasing a pulse of dark crimson magic, then straightens up and returns to his stance. Only one staff."),
 "shaman": (24, "an indigenous warrior woman with long black hair, red face paint, green loincloth, holding exactly one sword with a glowing blue blade",
            "standing facing the viewer, blue sword low in one hand, other hand on her hip",
            "kneels down on one knee and gently touches the earth with her free hand, small green leaves and sparkles rise around her hand, she looks up with a smile, then stands back up to her stance. Only one sword."),
 "berserker": (24, "a samurai warrior in dark navy blue armour with a kabuto helmet and red face mask, with exactly one katana in its sheath at his waist",
               "standing facing the viewer, one hand on the hilt of the sheathed katana",
               "draws his one katana in a lightning-fast horizontal slash, holds the finishing pose for a moment, then slowly slides the katana back into its sheath at his hip and returns to his stance. Only one katana."),
 "hunter": (16, "a wandering hunter with a wide conical straw hat and an orange straw rain cape, a crossbow on his shoulder and a katana",
            "standing facing the viewer, crossbow on one shoulder, other hand on the katana hilt",
            "raises his free hand to his mouth and whistles loudly with two fingers, then lowers the hand back to the katana hilt. Only one crossbow."),
 "druid": (16, "a druid in a green leafy hooded cloak with small antlers, holding exactly one gnarled wooden staff with a glowing green tip",
           "standing facing the viewer, staff planted at his side",
           "raises his one staff, green magical energy and leaves swirl rapidly around his whole body, glowing brighter, then calms down back to his stance. Only one staff."),
}
def strip(fr, path):
    W, H = fr[0].width, fr[0].height; s = Image.new("RGBA", (W * len(fr), H))
    for i, f in enumerate(fr): s.paste(f, (i * W, 0))
    s.save(path)
def gen_img(name, desc, w, h, ref):
    p = os.path.join(D, name)
    if os.path.exists(p): return Image.open(p).convert("RGBA")
    r = Image.open(os.path.join(D, ref)).convert("RGBA"); R = {"image": b64(r), "size": {"width": r.width, "height": r.height}}
    im = images_of(job(post("/generate-image-v2", {"description": desc, "image_size": {"width": w, "height": h}, "no_background": True,
         "reference_images": [{**R, "usage_description": "same creature design and colours"}]})))[0]
    im.save(p); print(name, "ok", flush=True); return im
def anim(name, first, desc, n, subj, pose, direction="south", last=None):
    p = os.path.join(D, name)
    if os.path.exists(p): return
    body = {"first_frame": b64(first), "description": desc, "frame_count": n, "no_background": True, "drift_threshold": 0,
            "direction": direction, "subject_description": subj[:290], "initial_pose": pose[:290]}
    if last is not None: body["last_frame"] = b64(last)
    strip(images_of(job(post("/animate-pixminimax", body))), p); print(name, "ok", flush=True)
want = sys.argv[1:]
for c, (n, subj, pose, desc) in ACT.items():
    if want and c not in want: continue
    im = Image.open(os.path.join(D, f"{c}-pose.png")).convert("RGBA")
    anim(f"{c}-acao.png", im, desc, n, subj, pose, last=im)
if not want or "extras" in want:
    sk = gen_img("x-esqueleto.png", "a skeleton warrior in dark rusted armour with glowing teal eyes holding one broken sword, standing facing the viewer, full body filling the whole canvas from head to feet, human-sized, highly detailed pixel art game character", 224, 224, "x-esqueleto-ref.png")
    anim("x-esqueleto-idle.png", sk, "idle swaying, jaw chattering, teal eyes flickering", 8, "a skeleton warrior in rusted armour with glowing teal eyes", "standing facing the viewer", last=sk)
    lo = gen_img("x-lobo.png", "a dark grey-brown wolf with a lighter belly standing in side view, big adult wolf, full body filling the whole canvas width, highly detailed pixel art game animal", 256, 176, "x-lobo-ref.png")
    anim("x-lobo-corre.png", lo, "running fast forward, full gallop cycle in place", 8, "a big dark grey-brown wolf", "standing in side view", direction="east")
    anim("x-lobo-idle.png", lo, "standing still, tail wagging, panting, ears twitching", 8, "a big dark grey-brown wolf", "standing in side view", direction="east", last=lo)
    ur = gen_img("x-urso.png", "a huge brown bear standing upright on its hind legs facing the viewer, green tribal leaf necklace and green armbands, full body filling the canvas, highly detailed pixel art game creature", 256, 256, "x-urso-ref.png")
    anim("x-urso-idle.png", ur, "roars with arms raised, then breathes heavily and lowers its arms", 16, "a huge brown bear standing upright with a green leaf necklace", "standing upright facing the viewer", last=ur)
