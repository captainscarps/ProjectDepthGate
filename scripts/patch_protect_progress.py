"""
Protege o progresso da campanha (portais concluídos) contra apagamento.

  • Começar uma partida do MODO INFINITO apagava a lista de portais concluídos da CAMPANHA com o mesmo número
    de espaço (infinito no espaço 1 → apagava os portais do save 1 da campanha, para aquele herói).
    Agora isso só acontece ao começar uma campanha NOVA naquele espaço.
  • Cada salvamento reescrevia a lista de portais só com o que estava visível naquele momento: se algo
    faltasse, a lista encolhia para sempre. Agora ela só cresce (junta com o que já estava guardado).
Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__KEEPPROG__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


put('this.game.registry.get("mode")!=="endless"&&__cReset(this.game,sl);localStorage.removeItem("depthgate:portals:slot_"+sl);localStorage.removeItem("depthgate:portals:"+sl+":"+String(t).toUpperCase());',
    'this.game.registry.get("mode")!=="endless"&&(__cReset(this.game,sl),localStorage.removeItem("depthgate:portals:slot_"+sl),localStorage.removeItem("depthgate:portals:"+sl+":"+String(t).toUpperCase()));')
put('const dList=__HUBD.filter(id=>__isPortalDone(c,id));localStorage.setItem("depthgate:portals:slot_"+sl,JSON.stringify(dList));',
    'let dList=__HUBD.filter(id=>__isPortalDone(c,id));try{const old=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");dList=[...new Set([...old,...dList])].filter(id=>__HUBD.includes(id))}catch(e){}localStorage.setItem("depthgate:portals:slot_"+sl,JSON.stringify(dList));')
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("progresso da campanha protegido")
