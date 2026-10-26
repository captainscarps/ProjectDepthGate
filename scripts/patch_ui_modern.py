"""
Visual "C · limpo e moderno" (por etapas). Código em scripts/source/ui-modern.js. Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "ui-modern.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__UIMODERN__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("visual moderno: etapas 1-3 (controles, HUD, ícones, menus e janelas)")
