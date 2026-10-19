"""
Enigmas da Cidadela Glacial + luz realista (normal maps) e sombras dinâmicas nos personagens.
Código em scripts/source/glacial-puzzles.js; posições em scripts/glacial_puzzles_def.json.
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
# posições das peças: scripts/glacial_puzzles_def.json (também lido por build_glacial_snow.py, que deixa
# o lugar de cada peça livre de árvores e pedras na frente)
DEF = json.load(open(os.path.join(ROOT, "scripts", "glacial_puzzles_def.json"), encoding="utf-8"))


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
# ícone do Coração do Inverno (desenhado junto com os outros ícones de item)
put('vt(c,"icon-dragon-heart",', 'vt(c,"icon-winter-heart",i=>{i.fillStyle="#1d3f63",i.beginPath(),i.arc(7,8,4.6,0,Math.PI*2),i.arc(13,8,4.6,0,Math.PI*2),i.fill(),i.beginPath(),i.moveTo(2.6,9.6),i.lineTo(10,18.6),i.lineTo(17.4,9.6),i.closePath(),i.fill(),i.fillStyle="#7fd6ff",i.beginPath(),i.arc(7,8,3.4,0,Math.PI*2),i.arc(13,8,3.4,0,Math.PI*2),i.fill(),i.beginPath(),i.moveTo(4,9.6),i.lineTo(10,16.8),i.lineTo(16,9.6),i.closePath(),i.fill(),i.fillStyle="#d9f6ff",i.fillRect(5,6,3,2),i.fillRect(10,10,2,4),i.fillStyle="#ffffff",i.fillRect(6,6,1,1),i.fillRect(16,3,1,3),i.fillRect(15,4,3,1)}),vt(c,"icon-dragon-heart",')
put("sprite:(c,i,t)=>new Ql(c,i,t),merchant:", '"gs-puzzles":(c,i,t)=>__gsPuzzles(c,i,t),sprite:(c,i,t)=>new Ql(c,i,t),merchant:')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("enigmas e luz da Cidadela Glacial aplicados")
