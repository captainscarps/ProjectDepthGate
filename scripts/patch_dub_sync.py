"""
Voz e texto juntos.
Antes o texto aparecia a ~125 letras por segundo e a voz só começava depois de baixar e decodificar o áudio:
o texto terminava quase na hora e a voz ficava "atrasada" vários segundos. Agora:
  • o texto das caixas de diálogo e das páginas da história acompanha a voz (começa quando a voz começa e termina
    junto com ela); fala sem voz continua na velocidade de antes
  • as vozes de uma conversa inteira (diálogo, páginas, vídeo de abertura) são baixadas e preparadas antes
Funções __dubType/__dubProg/__dubPrefetch em scripts/source/voice-webaudio.js. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__DUBSYNC__*/"
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


put("shown=Math.min(full.length,shown+2);tx.setText(full.slice(0,shown));",
    "shown=window.__dubType?window.__dubType(full,shown,2):Math.min(full.length,shown+2);tx.setText(full.slice(0,shown));")
put("n=Math.min(full.length,n+1);tx.setText(full.slice(0,n));",
    "n=window.__dubType?window.__dubType(full,n,1):Math.min(full.length,n+1);tx.setText(full.slice(0,n));")
put('function __dlg(S,list,done){const ui=S.scene.get("UI");',
    'function __dlg(S,list,done){try{window.__dubPrefetch?.(list.map(e=>__T(e.text)))}catch(e){}const ui=S.scene.get("UI");')
put("function __panels(S,pages,done,opt={}){",
    "function __panels(S,pages,done,opt={}){try{window.__dubPrefetch?.(pages.flatMap(P=>P.lines||[]).map(t=>__T(t)))}catch(e){}")
put("if(__nar){let n=0;const show=", "if(__nar){try{window.__dubPrefetch?.(S0.map(q=>q[2]))}catch(e){}let n=0;const show=")
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("voz e texto sincronizados")
