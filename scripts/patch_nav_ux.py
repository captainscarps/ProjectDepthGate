"""
Etapa 5 do visual novo: navegação por gamepad/toque/teclado, dicas traduzidas, Configurações e HUD do computador
no estilo "C · limpo e moderno". Código em scripts/source/nav-ux.js. Re-executável. Rodar antes de patch_item_icons.py.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "nav-ux.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__NAVUX__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rfind("/*§")
    s = s[:a] + (base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") if k >= 0 else "") + s[b + len(T):]

# dicas que existiam só em português
REPL = [
    ('__usingPad()?`✥ NAVEGAR    ${__padL(0)} SELECIONAR    ${__padL(1)} VOLTAR`:__isTouch()?"TOQUE PARA SELECIONAR":"↑ ↓ NAVEGAR    ENTER SELECIONAR    ESC VOLTAR"', "__hintMenu()"),
    ('__usingPad()?`✥  ESCOLHER     ${__padL(0)}  COMEÇAR     ${__padL(1)}  VOLTAR`:"↑ ↓  ESCOLHER     ENTER  COMEÇAR     ESC  VOLTAR"', "__hintHero()"),
    ('setText(lk?"BLOQUEADA":"COMEÇAR  ▸")', 'setText(lk?__L3("BLOQUEADA","LOCKED","BLOQUEADA"):__L3("COMEÇAR  ▸","START  ▸","EMPEZAR  ▸"))'),
    ('this.statTxt=["VIDA","DANO","DEFESA","VELOCIDADE"]', 'this.statTxt=[__L3("VIDA","HEALTH","VIDA"),__L3("DANO","DAMAGE","DAÑO"),__L3("DEFESA","DEFENSE","DEFENSA"),__L3("VELOCIDADE","SPEED","VELOCIDAD")]'),
]
for old, new in REPL:
    assert s.count(old) == 1, old[:50]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T)
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("navegação: repetição no gamepad, dicas traduzidas, Configurações e HUD no estilo novo")
