"""Correções de bugs do jogo original (bundle compilado).

- Santuário Esquecido travava ao abrir: a decoração "statue-fire" (e a "fireplace") é criada
  como imagem estática (classe Ut, um Image) e o código chamava .play() da animação nela ->
  "s.play is not a function" no meio da criação da fase. Agora a imagem fica invisível só
  para a colisão e um sprite animado é colocado no mesmo lugar.
Aplicar por último (depois de patch_bestiary.py).
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__decoAnim" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


HELPER = ('function __decoAnim(c,s,key){const a=c.add.sprite(s.x,s.y,s.texture.key,0).setOrigin(s.originX,s.originY).setDepth(s.depth);'
          'c.anims.exists(key)&&a.play(key);s.setVisible(!1);s.once?.("destroy",()=>a.destroy());return a}')
rep('function ql(c,i,t){const e=jl[i.type];', HELPER + 'function ql(c,i,t){const e=jl[i.type];')
rep('s.play("fireplace-fire-burn");', '__decoAnim(c,s,"fireplace-fire-burn");')
rep('s.play("statue-fire-burn");', '__decoAnim(c,s,"statue-fire-burn");')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — correções (estátua de fogo / lareira)")
