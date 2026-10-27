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
# Colecionáveis: quadrados e caixas em grafite (antes marrom), destaque âmbar
M2 = "/*__UCCOL__*/"
while M2 in s:
    a0 = s.index(M2); b0 = s.index(M2, a0 + 1); inner = s[a0 + len(M2):b0]; k0 = inner.rfind("/*§")
    s = s[:a0] + base64.b64decode(inner[k0 + 3:inner.rindex("*/")]).decode("utf-8") + s[b0 + len(M2):]
ca = s.index("class __CollectiblesScene"); cb = s.index("function __codexOpen", ca)
seg = s[ca:cb]
for old, new in [
    ("fillStyle(isSel ? 0x22180e : (isCollected ? 0x140e08 : 0x0a0806)", "fillStyle(isSel ? 0x2a2f3a : (isCollected ? 0x1b1f28 : 0x15181f)"),
    ("lineStyle(2, 0xffd24a, 1).strokeRoundedRect(x, y, w, h, 6)", "lineStyle(2, 0xffc14d, 1).strokeRoundedRect(x, y, w, h, 6)"),
    ("lineStyle(1, 0xffea88, 0.4)", "lineStyle(1, 0xffc14d, 0.3)"),
    ("lineStyle(1.5, 0xc9a24a, 0.75)", "lineStyle(1.5, 0xffffff, 0.22)"),
    ("lineStyle(1, 0x3a2c1e, 0.6)", "lineStyle(1, 0xffffff, 0.08)"),
    ("lineStyle(1, 0xc9a24a, 0.35)", "lineStyle(1, 0xffffff, 0.1)"),
    ("fillStyle(0x0a0705, 0.95)", "fillStyle(0x0f1218, 0.95)"),
    ("lineStyle(1, isCollected ? 0xc9a24a : 0x3a281a, 0.8)", "lineStyle(1, isCollected ? 0xffc14d : 0x3a404c, 0.8)"),
    ("lineStyle(1, 0x4a3822, 0.4)", "lineStyle(1, 0xffffff, 0.1)"),
    ("fillStyle(0x090604, 0.95)", "fillStyle(0x0f1218, 0.95)"),
    ("lineStyle(1, isCollected ? 0xc9a24a : 0x3a281a, 0.5)", "lineStyle(1, isCollected ? 0xffc14d : 0x3a404c, 0.5)"),
]:
    assert seg.count(old) == 1, old
    seg = seg.replace(old, M2 + new + "/*§" + base64.b64encode(old.encode()).decode() + "*/" + M2)
s = s[:ca] + seg + s[cb:]
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("telas no estilo novo")
