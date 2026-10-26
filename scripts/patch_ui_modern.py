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
# menu principal: a sombra da esquerda terminava com 15% de opacidade e cortava a tela ao meio (linha visível);
# agora ela some aos poucos até 0 numa faixa mais larga
import base64
M = "/*__UCSHADE__*/"
while M in s:
    a0 = s.index(M); b0 = s.index(M, a0 + 1); inner = s[a0 + len(M):b0]; k0 = inner.rfind("/*§")
    s = s[:a0] + base64.b64decode(inner[k0 + 3:inner.rindex("*/")]).decode("utf-8") + s[b0 + len(M):]
OS = "sh.fillGradientStyle(0,0,0,0,.55,.15,.55,.15).fillRect(0,0,_*.55,st);"
NS = "sh.fillGradientStyle(0,0,0,0,.55,0,.55,0).fillRect(0,0,_*.7,st);"
assert s.count(OS) == 1, "sombra do menu"
s = s.replace(OS, M + NS + "/*§" + base64.b64encode(OS.encode()).decode() + "*/" + M)
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("visual moderno: etapas 1-4 (controles, HUD, ícones, menus, janelas e animações)")
