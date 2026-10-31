"""
Bestiário (livro): correções de paginação e espaçamento do texto. Re-executável.
Código em scripts/source/bestiary-fix.js (sobrescreve métodos de __BookScene).
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "bestiary-fix.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
M = "/*__BKFIX__*/"
while M in s:
    a = s.index(M); b = s.index(M, a + 1); s = s[:a] + s[b + len(M):]
s = s + M + "\n" + SRC + "\n" + M
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("bestiário: correções aplicadas")
