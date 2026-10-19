"""
Enigmas da Cidadela Glacial + luz realista (normal maps) e sombras dinâmicas nos personagens.
Código em scripts/source/glacial-puzzles.js; posições abaixo (verificadas: chão livre, fora da trilha).
O bloco de gelo foi conferido por um resolvedor (busca em largura): solução mínima de 6 empurrões.
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
SRC = open(os.path.join(ROOT, "scripts", "source", "glacial-puzzles.js"), encoding="utf-8").read()
T = "/*__GSPZ__*/"
DEF = {
    "ice": {"blocks": [[49, 61], [50, 63]], "plates": [[51, 62], [43, 65]], "reset": [53, 60], "chest": [52, 64]},
    "mirror": {"source": [7, 59], "target": [9, 64], "mirrors": [[18, 59, "/"], [18, 64, "\\"], [16, 66, "/"]], "chest": [10, 66]},
    "levers": {"pos": [[8, 58], [5, 62], [7, 65]], "order": [1, 0, 2], "plaque": [6, 60], "chest": [7, 62]},
    "braziers": {"pos": [[22, 52], [29, 51], [36, 51], [40, 52]], "burn": 9, "chest": [33, 52]},
    "runes": {"pos": [[26, 43], [36, 43], [26, 46], [36, 46]], "chest": [33, 47]},
}


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


code = "const __GSPZ_DEF=" + json.dumps(DEF, separators=(",", ":")) + ";\n" + SRC + "\n"
put("function __vidLock(on){", code + "function __vidLock(on){")
put("sprite:(c,i,t)=>new Ql(c,i,t),merchant:", '"gs-puzzles":(c,i,t)=>__gsPuzzles(c,i,t),sprite:(c,i,t)=>new Ql(c,i,t),merchant:')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("enigmas e luz da Cidadela Glacial aplicados")
