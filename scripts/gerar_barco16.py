"""Barco do prólogo em 16 direções (p216.140) — PixelLab. Herói da classe remando, vista de cima inclinada.
1) poses: generate-8-rotations-v3 a partir da pose de frente (barco-<classe> linha "s", 128×128) → v16/A-0…7
   e, a partir da mesma pose girada −22° (/rotate), → v16/B-0…7; N22 = B-4 girado +22° (/rotate).
2) remada: animate-pixminimax com 12 quadros em cada uma das 9 direções desenhadas (E, ESE, SE, SSE, S, ENE, NE, NNE, N);
   o lado oeste é o espelho no jogo. Saída: scripts/art-src/barco/v16/<classe>-<dir>.png (quadro 0 = parado).
Uso: python3 scripts/gerar_barco16.py [classe]   (por enquanto: warrior)"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pixellab_api import post, job, images_of, b64
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = os.path.join(ROOT, "scripts/art-src/barco/v16"); F = 128
cls = (sys.argv[1:] or ["warrior"])[0]
# poses escolhidas pelo olho (as rotações automáticas não saem exatamente nos ângulos pedidos): de leste ao sul
# B-2, A-2, B-1, B-0, A-0; de leste ao norte B-2, A-3, B-3, N22 (B-4 girado 22°) e B-4. A-1 e A-4 sobraram (v16/sobra/).
ROWS = [("e", "B-2", "east"), ("ese", "A-2", None), ("se", "B-1", "south-east"), ("sse", "B-0", None), ("s", "A-0", "south"),
        ("ene", "A-3", None), ("ne", "B-3", "north-east"), ("nne", "N22", None), ("n", "B-4", "north")]
SUBJ = "a knight in steel plate armour with a white fur collar sitting in a small wooden rowing boat"
ROW = ("rowing the boat with both oars in a smooth steady rhythm: the oar blades dip into the water, pull back, lift out and swing forward again, "
       "the knight leans forward and back with each stroke, the boat itself keeps the same heading and position")
def one(a):
    d, src, dr = a
    dst = os.path.join(V, f"{cls}-{d}.png")
    if os.path.exists(dst): return d + " já"
    body = {"first_frame": b64(os.path.join(V, src + ".png")), "description": ROW, "frame_count": 12, "no_background": True,
            "drift_threshold": 0, "subject_description": SUBJ, "view": "high top-down"}
    if dr: body["direction"] = dr
    fr = images_of(job(post("/animate-pixminimax", body)))
    st = Image.new("RGBA", (F * len(fr), F))
    for i, f in enumerate(fr): st.paste(f, (i * F, 0))
    st.save(dst); return f"{d} {len(fr)}"
with ThreadPoolExecutor(3) as ex:
    for r in ex.map(one, ROWS): print(r, flush=True)
