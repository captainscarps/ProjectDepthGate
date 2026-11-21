"""Arte da tela de morte do Modo Infinito (p216.87b) — PixelLab generate-image-v2.
Gera o emblema central (espada partida cravada nos escombros, elmo rachado, brasas) em fundo transparente.
Saída bruta: scripts/art-src/tela-morte/; a final vai para assets/pixel-art/ui/tela-morte/.
Uso: python3 scripts/gerar_tela_morte.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, balance
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "scripts/art-src/tela-morte")
os.makedirs(OUT, exist_ok=True)
PROMPTS = {
 "caverna-queda": "a dropped miner's pickaxe and a cracked oil lantern lying on cave rubble, a spilled leather pouch with glowing blue cobalt ore crystals scattered and rolling away, small dust cloud, dark fantasy game icon, high detail pixel art, centered",
 "caverna-volta": "a heap of glowing blue cobalt ore crystals in a small wooden mining cart, a miner's pickaxe leaning on it, warm lantern hanging, sparkles, triumphant dark fantasy game icon, high detail pixel art, centered",
 "emblema": "a broken knight longsword stabbed into a small mound of rubble and skulls, a cracked steel helmet resting beside it, torn red banner, faint crimson embers, dark fantasy game icon, side-lit, high detail pixel art, centered",
}
print("saldo", balance())
for k, p in PROMPTS.items():
    if os.path.exists(os.path.join(OUT, f"{k}-0.png")): continue
    r = post("/generate-image-v2", {"description": p, "image_size": {"width": 192, "height": 192}, "no_background": True})
    lr = job(r)
    ims = images_of(lr)
    print(k, len(ims), json.dumps({kk: vv for kk, vv in lr.items() if kk not in ("images", "frames")})[:200])
    for i, im in enumerate(ims):
        im.save(os.path.join(OUT, f"{k}-{i}.png"))
