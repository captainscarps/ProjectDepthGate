"""
Troca a cena do Refúgio (classe Fl, cena "Hub") pela vila jogável de scripts/source/hub-village.js.
Mantém os painéis de melhoria do Refúgio antigo (vendedor, ferreiro, santuário), só que presos à tela.
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "hub-village.js"), encoding="utf-8").read().strip()
s = open(BUNDLE, encoding="utf-8").read()

HEAD = 'class Fl extends j.Scene{'
END = '}const Ct={PLAYER_HURT:'
PB, PE = "/*__HUBV_PANEL_BEGIN__*/", "/*__HUBV_PANEL_END__*/"
a = s.index(HEAD)
b = s.index(END, a)
body = s[a + len(HEAD):b]
assert s.count(HEAD) == 1

if PB in body:
    panel = body[body.index(PB) + len(PB):body.index(PE)]
else:
    p0 = body.index("refreshFragments(){")
    p1 = body.index("update(i,t){", p0)
    panel = body[p0:p1]
    OLD = 'openMetaPanel(i,t,e){this.closePanel();const d=_/2,o=this.add.container(0,0).setDepth(800)'
    assert panel.count(OLD) == 1
    panel = panel.replace(OLD, 'openMetaPanel(i,t,e){this.closePanel();const d=_/2,o=this.add.container(this.__ox||0,this.__oy||0).setDepth(9800).setScrollFactor(0)')
    # o vendedor/ferreiro antigos ficavam "perto" pela posição X; aqui a proximidade é 2D (métodos novos)
    for name in ("nearestStation(){", "tryInteract(){"):
        i = panel.find(name)
        if i >= 0:
            depth, k = 0, panel.index("{", i)
            for k2 in range(k, len(panel)):
                depth += panel[k2] == "{"
                depth -= panel[k2] == "}"
                if depth == 0:
                    panel = panel[:i] + panel[k2 + 1:]
                    break

OPEN = 'o=this.add.container(this.__ox||0,this.__oy||0).setDepth(9800).setScrollFactor(0)'
if OPEN + '.setScale' not in panel:
    assert panel.count(OPEN) == 1
    panel = panel.replace(OPEN, OPEN + '.setScale(this.__us||1)')
new = HEAD + SRC + PB + panel + PE
s = s[:a] + new + s[b:]

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("Refúgio jogável aplicado")
