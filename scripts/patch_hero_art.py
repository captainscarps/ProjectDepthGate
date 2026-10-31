"""
Arte dos heróis (sem fundo) na escolha de personagem. Código em scripts/source/hero-art.js. Re-executável.
As imagens ficam em assets/images/heroes/hero-art-<classe>.png.
"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "hero-art.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__HEROART__*/"
while T in s:
    a = s.index(T); b = s.index(T, a + 1); s = s[:a] + s[b + len(T):]
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("arte dos heróis na escolha de personagem")
