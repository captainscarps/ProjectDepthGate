"""
Telas no estilo "C · limpo e moderno" (escolha de herói, dificuldade, painéis genéricos, livros…).
Código em scripts/source/ui-screens.js. Re-executável. Rodar antes de patch_item_icons.py.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "ui-screens.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__UISCREENS__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
# diálogos (Guardiã, heróis…) na fonte nova
import base64
M = "/*__UCDLG__*/"
while M in s:
    a0 = s.index(M); b0 = s.index(M, a0 + 1); inner = s[a0 + len(M):b0]; k0 = inner.rfind("/*§")
    s = s[:a0] + base64.b64decode(inner[k0 + 3:inner.rindex("*/")]).decode("utf-8") + s[b0 + len(M):]
OD = 'ui.__dlgOpen=!0;const F="Georgia, \'Times New Roman\', serif",was=!!S.uiOpen;'
ND = 'ui.__dlgOpen=!0;const F=typeof __UC_F!=="undefined"?__UC_F:"Georgia, \'Times New Roman\', serif",was=!!S.uiOpen;'
assert s.count(OD) == 1, "diálogo"
s = s.replace(OD, M + ND + "/*§" + base64.b64encode(OD.encode()).decode() + "*/" + M)
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("telas no estilo novo")
