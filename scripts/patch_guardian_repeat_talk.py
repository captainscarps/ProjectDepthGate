"""
Guardiã no Coração da Floresta: volta a falar (com voz) toda vez que o herói conversa com ela.
Antes, depois da primeira conversa em cada etapa ela ficava muda e só abria a escolha da fenda.
Agora as falas da etapa atual tocam de novo (narradas) e, ao terminar, a escolha da fenda abre como antes.
A fala do herói da primeira conversa continua acontecendo uma vez só.
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__GTALK__*/"


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


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


put('if(__stFlag(S,tk)){if(__pNum>=1)__offerRiftPrompt(S);return}__stFlag(S,tk,!0);',
    '__stFlag(S,tk)||__stFlag(S,tk,!0);')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("guardiã volta a falar em toda conversa")
