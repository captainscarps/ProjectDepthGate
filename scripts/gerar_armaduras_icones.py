"""Ícones de todas as armaduras do jogo (p216.101) — PixelLab generate-image-v2, 80×80 (tamanho do atlas items-hd).
Armaduras com desenho próprio usam o sprite do herói com aquela armadura como referência (cores e detalhes);
as outras vêm da descrição. As variantes (<base>_v_<padrão>) não são geradas: build_armaduras_icones.py recolore o
ícone da base. Saída bruta: scripts/art-src/armaduras-icones/<id>.png (pula o que já existe).
Uso: python3 scripts/gerar_armaduras_icones.py [id…]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/armaduras-icones"); CH = os.path.join(ROOT, "assets/pixel-art/characters")
os.makedirs(D, exist_ok=True)
A = {
 "dragon_armor": ("red dragon-scale chest armour with gold trim and small horned pauldrons", None),
 "ancient_dragon_armor": ("ornate ancient dragon plate armour, dark crimson scales, gold filigree, horned pauldrons, glowing ember gem", None),
 "shadow_cloak": ("a hooded shadow cloak of deep black-purple cloth with a silver clasp", None),
 "dark_leather_armor": ("a black studded leather jerkin with straps and buckles", None),
 "colossus_plate": ("a massive stone-grey colossus plate cuirass carved with glowing amber runes", None),
 "hunter_cloak": ("a green hooded hunter's cloak with leather straps and a quiver strap", None),
 "icebound_armor": ("an icy blue frozen plate armour covered in frost crystals", None),
 "wolf_coat": ("a grey wolf-fur coat with a wolf-head pelt collar and leather belts", None),
 "sun_plate": ("a golden sunrise plate cuirass with a radiant sun emblem on the chest", None),
 "grove_mantle": ("an ancient forest mantle woven from green leaves, moss and bark with a wooden clasp", None),
 "abyss_robe": ("a dark violet abyss robe with glowing purple runes", None),
 "urucum_paint": ("a clay bowl of bright red urucum paint with a feather brush and red tribal pattern strokes", None),
 "jenipapo_paint": ("a clay bowl of dark blue-black jenipapo paint with a brush and black tribal pattern strokes", None),
 "tabatinga_paint": ("a clay bowl of white tabatinga clay paint with a brush and white tribal dots", None),
 "caulim_paint": ("a clay bowl of golden saffron yellow paint with a brush and yellow tribal strokes", None),
 "armor_forge_brasa": ("a dark iron cuirass with glowing orange ember cracks and orange trim, embers floating", None),
 "armor_forge_geada": ("a pale icy-blue mantle with white frost trim and ice crystals", None),
 "armor_forge_penumbra": ("dark purple shadow robes with bright violet trim and wisps of shadow", None),
 "armor_forge_raizes": ("a green cuirass woven of living roots with golden trim and small flowers", None),
 "armor_forge_aurora": ("a polished cream-white and gold plate armour with a golden halo above the collar", None),
 "armor_forge_cobalto": ("royal blue cobalt plate armour with glowing cyan geometric rune lines (abstract symbols, no letters, no text)", None),
 "armor_forge_ossos": ("dark ossuary robes decorated with bones and skulls", "necromancer-ossos-body.png"),
 "armor_forge_vendaval": ("storm mage robes with wind swirl patterns", "mage-vendaval-body.png"),
 "armor_forge_saqueador": ("a raider's armour of leather, fur and iron", "warrior-saqueador-body.png"),
 "armor_forge_templario": ("a white templar plate armour with a tabard", "warrior-templario-body.png"),
 "armor_templario": ("a white templar plate armour with a tabard", "warrior-templario-body.png"),
 "armor_forge_penas": ("sacred feather robes of a tribal shaman", "shaman-penas-body.png"),
 "armor_forge_esmeralda": ("emerald silk rogue garments", "rogue-esmeralda-body.png"),
 "armor_forge_oni": ("an oni samurai armour", "berserker-oni-body.png"),
 "armor_forge_ronin": ("a ronin samurai armour", "berserker-ronin-body.png"),
 "armor_forge_corvo": ("a crow-and-wolf druid mantle of black feathers and fur", "druid-corvo-body.png"),
 "armor_forge_selvagem": ("a savage war-paint harness with bone ornaments", "druid-selvagem-body.png"),
 "armor_forge_lobo": ("a northern hunter's wolf-pelt mantle with leather straps", "hunter-lobo-body.png"),
 "armor_forge_rubro": ("a crimson moon samurai archer armour", "archer-rubro-body.png"),
 "armor_forge_kyudo": ("a folded kyudo archer outfit: a dark navy kimono top over pleated forest-green hakama with a sage-green obi sash and brown leather wrist guards", "archer-kyudo-body.png"),
 "dh_plate": ("a dragon hunter's plate cuirass made of dark scales", "warrior-dh-body.png"),
 "unique_forge_executioner_mantle": ("an executioner's black hooded mantle with blood-red lining and iron chains", None),
 "armor@COMMON": ("a simple grey iron chainmail vest with a leather belt", None),
 "armor@UNCOMMON": ("a steel breastplate with green cloth trim", None),
 "armor@RARE": ("a silver plate cuirass with blue enamel trim and a sapphire", None),
 "armor@EPIC": ("a dark steel plate armour with purple glowing runes and an amethyst", None),
 "armor@LEGENDARY": ("an ornate golden plate armour with crimson cloth and a ruby, golden glow", None),
 "armor@RELIC": ("a radiant diamond-ice plate armour glowing cyan with sparkles", None),
}
PRE = "game inventory item icon of "
POST = ", the armour piece shown alone with no person wearing it (no head, no arms, no legs), front view, centered, bold dark outline, rich shading, pixel art, transparent background"
want = sys.argv[1:]
for k, (desc, ref) in A.items():
    if want and k not in want: continue
    p = os.path.join(D, k.replace("@", "__") + ".png")
    if os.path.exists(p): continue
    body = {"description": PRE + desc + POST, "image_size": {"width": 80, "height": 80}, "no_background": True}
    if ref:
        im = Image.open(os.path.join(CH, ref)).convert("RGBA").crop((0, 0, 128, 128))
        body["reference_images"] = [{"image": b64(im), "size": {"width": 128, "height": 128}, "usage_description": "the hero wearing this armour: copy the armour's colours, materials and ornaments only, not the person"}]
    images_of(job(post("/generate-image-v2", body)))[0].save(p); print(k, flush=True)
