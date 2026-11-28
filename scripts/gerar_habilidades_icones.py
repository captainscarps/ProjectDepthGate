"""Ícones que faltavam para as habilidades (p216.142) — PixelLab generate-image-v2 48×48 → 24×24 (estilo dos ix-<ID>).
Antes essas habilidades mostravam os desenhos provisórios de 20 px (icon-whirlwind, icon-repulse…).
Saída bruta: scripts/art-src/habilidades-icones/<ID>.png; final: assets/pixel-art/ui/icons/<ID>.png (carregados por
scripts/source/habilidades-icones.js). Uso: python3 scripts/gerar_habilidades_icones.py [ID…]"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "scripts/art-src/habilidades-icones"); OUT = os.path.join(ROOT, "assets/pixel-art/ui/icons")
BASE = "square game skill icon, thick dark iron frame with thin gold trim, one bold readable emblem in the centre, high contrast, pixel art, "
I = {
 "WHIRLWIND": "a sword spinning in a full circle inside a white and grey whirlwind of wind, slate blue background",
 "IRON_SKIN": "a clenched fist turned into shining grey iron metal with rivets, steel blue background",
 "DEMOLISHING_BLOW": "a huge war hammer smashing down onto cracked ground with rocks flying, brown background",
 "FRENZY": "two crossed bloody axes with glowing red furious eyes above them, dark red background",
 "RUPTURE": "a deep diagonal slash wound with red blood drops spraying out, dark crimson background",
 "ARCANE_BLAST": "a bursting violet arcane orb exploding with purple runic sparks, deep purple background",
 "SHADOW_STEP": "a dark hooded silhouette dashing sideways leaving purple shadow afterimages, night blue background",
 "SMOKE_BOMB": "a round black bomb with a lit fuse bursting into a big grey smoke cloud, dark grey background",
 "REPULSE": "concentric cyan shockwave rings bursting outward pushing small arrows away from the centre, teal background",
 "BLOODLUST": "a big red blood drop with two white fangs biting it, crimson background",
 "HOLY_SMITE": "a golden hammer made of light striking down with a radiant flash, warm gold background",
 "CONSECRATION": "a glowing golden holy circle of runes on the ground with light rising from it, dark gold background",
 "AEGIS": "a radiant golden round shield with a white cross glowing, light gold background",
 "HOLY_NOVA": "a burst of holy white and gold light rays exploding from a bright centre, gold background",
 "DIVINE_LANCE": "a long golden spear made of light flying diagonally upward with a bright trail, gold background",
 "JUDGMENT": "golden scales of justice above a vertical sword pointing down, deep crimson background",
 "RAIZES_JUREMA": "thick twisting green jurema tree roots bursting from the ground and coiling, forest green background",
 "DARDOS_CURARE": "a long wooden blowgun firing three darts dripping bright green poison, dark green background",
 "ESPIRITO_GAVIAO": "a glowing spectral harpy eagle spirit with spread wings, translucent cyan light, deep blue background",
 "SOPRO_PAJE": "a wooden shaman pipe blowing a swirling stream of glowing white ancestral spirit smoke, dusk purple background",
 "ESPIRITO_GUARA": "a glowing spectral maned wolf spirit with a reddish mane howling, translucent orange light, dark teal background",
 "TEMPESTADE_TUPA": "dark storm clouds striking down with several bright yellow lightning bolts, stormy blue background",
 "ET_DECOY": "a straw training dummy with two faint translucent copies of itself beside it, dark grey background",
 "ET_JUREMA_CIRCLE": "a glowing circle of green jurema leaves spinning on the ground with green healing light, green background",
 "ET_TRAMPLE": "a huge animal hoof stomping the ground with a dust shockwave ring, brown background",
 # nós das árvores do Infinito que não tinham ícone (p216.142)
 "ICE_COMET": "a big glowing ice comet with a long frosty blue tail falling diagonally, dark blue background",
 "ICE_COMET_SHATTER": "a big ice comet shattering into many sharp blue ice shards flying outward, dark blue background",
 "SKELETON_SHIELD": "a grinning skeleton warrior holding a round wooden shield in front of it, dark purple background",
 "ANCESTRAL_FIRE": "a magical campfire with tall orange flames and glowing spirit sparks rising, dark orange background",
}
def one(k):
    p = os.path.join(D, k + ".png")
    if not os.path.exists(p):
        images_of(job(post("/generate-image-v2", {"description": BASE + I[k], "image_size": {"width": 48, "height": 48}, "no_background": False})))[0].save(p)
    im = Image.open(p).convert("RGBA").resize((24, 24), Image.BOX); im.save(os.path.join(OUT, k + ".png"), optimize=True)
    return k
want = sys.argv[1:] or list(I)
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(one, want): print(r, flush=True)
