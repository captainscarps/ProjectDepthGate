"""Heróis da tela de escolha em pixel art: pose de apresentação + animação parado (p216.90) — PixelLab.
1) generate-image-v2 com o sprite do jogo (quadro de frente de <classe>-pack(-t0)-dirs, salvo em <classe>-ref.png)
   como referência E como estilo (mesmo pixel, contorno, sombreado e paleta) → herói numa pose de apresentação,
   tela de 144×144 (todos com o mesmo tamanho de pixel; o jogo mostra em 2×);
2) animate-pixminimax → 8 quadros de "parado respirando" (o quadro 0 devolvido é a própria pose).
Saída: scripts/art-src/selecao/<classe>-pose.png e <classe>-idle.png (tira 9 quadros).
Uso: python3 scripts/gerar_selecao_herois.py [classe…]   (pula o que já existe)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, os.environ.get("SEL_DIR", "scripts/art-src/selecao"))
N = int(os.environ.get("SEL_N", "144"))
NOSTYLE = os.environ.get("SEL_NOSTYLE") == "1"
HERO = {
 "warrior": ("a knight in full silver plate armour with a closed great helm, white fur collar, brown leather cross straps and tasset, round steel shield and a longsword",
             "heroic presentation pose facing the viewer, longsword planted point-down in front of him with both hands resting on the pommel, round shield strapped on his back, proud stance",
             "slow idle breathing, chest rising and falling, fur collar and tasset gently swaying, tiny weight shift"),
 "archer": ("a samurai archer in green lacquered lamellar armour with a horned kabuto helmet, white chest plate, a tall yumi longbow and a quiver of arrows",
            "heroic presentation pose facing the viewer, holding the tall longbow upright at his side, other hand resting near the quiver, steady proud stance",
            "slow idle breathing, armour plates and sleeves gently swaying, bow string vibrating slightly"),
 "mage": ("a sorceress in a dark purple hooded cloak and a long crimson robe with a gold sash, a swirling violet arcane orb",
          "heroic presentation pose facing the viewer, one hand raised holding a swirling violet arcane orb above her palm, other hand at her side, cloak flowing, confident stance",
          "slow idle breathing, cloak hem gently fluttering, the violet orb swirling and pulsing above her palm"),
 "rogue": ("an agile rogue woman with long dark auburn hair, a dark brown leather hood and scarf, fitted brown leather corset, bracers, belts with pouches, leather trousers and tall boots, two curved steel daggers",
           "dynamic heroic presentation pose facing the viewer three-quarter, slight crouch, one dagger raised in reverse grip near her shoulder, the other dagger held low and forward, determined sly look",
           "slow idle breathing in a ready crouch, hair and scarf ends swaying, a glint running along the dagger blades"),
 "necromancer": ("a necromancer in a tattered dark brown hooded robe with a pale skull-like face shadowed by the hood, a staff topped with a glowing crimson rune",
                 "heroic presentation pose facing the viewer, staff held upright beside him, free hand raised with faint dark energy, ominous stance",
                 "slow idle breathing, tattered robe hem drifting, the crimson rune on the staff pulsing, wisps of dark mist"),
 "shaman": ("an indigenous warrior woman with long black hair, red face paint, bare shoulders, green loincloth and leg wraps, holding a sword with a glowing blue blade",
            "heroic presentation pose facing the viewer, blue sword held low in one hand, other hand on her hip, fierce proud stance",
            "slow idle breathing, hair and loincloth gently swaying, the blue blade shimmering"),
 "berserker": ("a samurai warrior in dark navy blue o-yoroi armour with a kabuto helmet and a red menpo face mask, a katana at his waist",
               "heroic presentation pose facing the viewer, one hand on the hilt of the sheathed katana at his hip, other arm relaxed, imposing stance",
               "slow idle breathing, armour skirt plates and cords gently swaying, slight weight shift"),
 "hunter": ("a wandering hunter with a wide conical straw hat, a bulky orange straw rain cape, dark trousers, a crossbow and a katana",
            "heroic presentation pose facing the viewer, crossbow resting on one shoulder, other hand on the katana hilt, calm stance",
            "slow idle breathing, straw cape fibres gently swaying in the wind, hat brim tilting slightly"),
 "druid": ("a druid in a green leafy hooded cloak with small antlers, brown leather belts, holding a gnarled wooden staff with a glowing green tip",
           "heroic presentation pose facing the viewer, staff planted at his side with one hand, other hand open with a tiny green glow, serene stance",
           "slow idle breathing, leafy cloak rustling gently, green glow on the staff pulsing, a few leaves drifting"),
}
for c in sys.argv[1:] or HERO:
    subj, pose, motion = HERO[c]
    ref = Image.open(os.path.join(ROOT, "scripts/art-src/selecao", f"{c}-ref.png")).convert("RGBA")
    R = {"image": b64(ref), "size": {"width": ref.width, "height": ref.height}}
    pp, ip = os.path.join(D, f"{c}-pose.png"), os.path.join(D, f"{c}-idle.png")
    if not os.path.exists(pp):
        r = post("/generate-image-v2", {"description": f"{subj}, {pose}, full body filling the whole canvas from head to feet, highly detailed pixel art game character with fine pixels, same design and colours as the reference",
                 "image_size": {"width": N, "height": N}, "no_background": True,
                 "reference_images": [{**R, "usage_description": "this is the exact character: keep the same outfit, colours and equipment"}],
                 **({} if NOSTYLE else {"style_image": R, "style_options": {"color_palette": True, "outline": True, "detail": True, "shading": True}})})
        images_of(job(r))[0].save(pp); print(c, "pose ok", flush=True)
    if os.path.exists(ip): continue
    im = Image.open(pp).convert("RGBA")
    r = post("/animate-pixminimax", {"first_frame": b64(im), "description": motion, "frame_count": 8, "no_background": True,
             "direction": "south", "subject_description": subj[:290], "initial_pose": pose[:290]})
    fr = images_of(job(r)); print(c, "idle", len(fr), flush=True)
    W = fr[0].width; strip = Image.new("RGBA", (W * len(fr), fr[0].height))
    for i, f in enumerate(fr): strip.paste(f, (i * W, 0))
    strip.save(ip)
