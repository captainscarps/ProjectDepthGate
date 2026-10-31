"""
Árvores de Habilidades do Modo Infinito: cada herói escolhe no nível 3 a árvore defensiva ou a ofensiva
(a outra fica trancada até o fim da run). Dados, motor, habilidades novas, ganchos, itens e tela em
scripts/source/et-*.js. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
PARTS = ["et-data.js", "et-engine.js", "et-abilities.js", "et-hooks.js", "et-items.js", "skill-picks.js"]
SRC = "\n".join(open(os.path.join(ROOT, "scripts", "source", p), encoding="utf-8").read() for p in PARTS)
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__ENDLESSTREES__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
# teclado/gamepad da interface: a tela das árvores recebe as teclas antes da loja e da árvore da classe
M = "/*__ETKEY__*/"
while M in s:
    a0 = s.index(M); b0 = s.index(M, a0 + 1); inner = s[a0 + len(M):b0]; k0 = inner.rfind("/*§")
    s = s[:a0] + base64.b64decode(inner[k0 + 3:inner.rindex("*/")]).decode("utf-8") + s[b0 + len(M):]
OK = "if(this.shopUI.open){this.shopUI.handleKey(e);return}"
NK = "if(this.__etp?.open){this.__etp.handleKey(e);return}" + OK
assert s.count(OK) == 1, "cadeia de teclas da interface"
s = s.replace(OK, M + NK + "/*§" + base64.b64encode(OK.encode()).decode() + "*/" + M)
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("árvores do modo infinito:", len(SRC), "caracteres")
