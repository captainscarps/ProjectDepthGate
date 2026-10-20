"""
Conserta a tela dividida ao abrir CONTROLES.

O index.html carrega o jogo como "index-D6qIWtA7-p209.js?v=…", mas o pedaço ControlsPanel-kYdEPlgz-p209.js
importava "./index-D6qIWtA7-p209.js" (sem o ?v=). Para o navegador são dois módulos diferentes: ao abrir os
controles ele executava o jogo inteiro de novo — um segundo jogo nascia ao lado (tela dividida, menu principal
aparecendo, abas e painéis desconfigurados).

Agora o jogo publica as funções que o painel usa em window.__dgMod e o painel lê de lá, sem importar o
arquivo de novo — funciona com qualquer ?v= no index.html.
Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__DGMOD__*/"


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


EXP = "export{st as G,_ as a,Dt as d,_r as g,qr as k,W as t};"
put(EXP, "window.__dgMod={G:st,a:_,d:Dt,g:_r,k:qr,t:W};" + EXP)
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)

OLD = 'import{G as p,a as u,d as x,t as e,k as y,g as O}from"./index-D6qIWtA7-p209.js";'
NEW = "const{G:p,a:u,d:x,t:e,k:y,g:O}=window.__dgMod;"
for base in ("assets", os.path.join("Projeto atualizado", "assets")):
    f = os.path.join(ROOT, base, "ControlsPanel-kYdEPlgz-p209.js")
    if not os.path.exists(f):
        continue
    c = open(f, encoding="utf-8").read()
    if OLD in c:
        c = c.replace(OLD, NEW, 1)
    # rodapé do painel não passa por baixo do botão VOLTAR
    for a, b in (('wordWrap:{width:W-230}}),this.root.add(this.info);', 'wordWrap:{width:W-345}}),this.root.add(this.info);'),
                 ('this.hint=t.add.text(214,H-10,"",{fontFamily:"\'Courier New\', monospace",fontSize:"8px",',
                  'this.hint=t.add.text(214,H-10,"",{fontFamily:"\'Courier New\', monospace",fontSize:"7px",wordWrap:{width:W-345},')):
        if a in c:
            c = c.replace(a, b, 1)
        assert b in c, b[:50]
    assert NEW in c and "index-D6qIWtA7" not in c, f
    open(f, "w", encoding="utf-8").write(c)
print("painel de controles sem reimportar o jogo")
