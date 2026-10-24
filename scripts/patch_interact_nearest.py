"""
Interação escolhe o objeto MAIS PRÓXIMO.

O jogo comparava cada objeto com "max(melhor distância, raio)": qualquer objeto dentro do raio substituía o
anterior, mesmo estando mais longe — vencia o último da lista, não o mais perto. Com runas e alavancas a
duas casas uma da outra, apertar E perto de uma acionava a vizinha e o enigma "dava erro" (sequência ou
ordem errada). Agora cada candidato precisa estar dentro do seu raio E mais perto que o atual.
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__NEAR__*/"


def strip_all():
    global s
    while T in s:
        a = s.index(T)
        b = s.index(T, a + 1)
        inner = s[a + len(T):b]
        k = inner.rindex("/*§")
        orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8")
        s = s[:a] + orig + s[b + len(T):]


strip_all()
i = s.index("findInteractable(){")
j = s.index("pickup(i){", i)
old = s[i:j]
assert "/*__" not in old and s.count(old) == 1
new = re.sub(r"<Math\.max\(e,(\d+|hp\.__level===\"castle\"\?54:40)\)", lambda m: "<(t?Math.min(e," + m.group(1) + "):" + m.group(1) + ")", old)
assert new.count("t?Math.min(e,") == 5, new.count("t?Math.min(e,")
s = s[:i] + T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T + s[j:]
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("interação pelo objeto mais próximo")
