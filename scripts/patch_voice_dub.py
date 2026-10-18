"""
Toca a dublagem da história (assets/audio/voice) quando a frase aparece na tela, em português:
diálogos (Guardiã, Rei, heróis, ecos), páginas do prólogo, painel de história das fases e cinemática.
Abaixa a música enquanto a voz fala, segura o fechamento automático até a fala terminar e
cala a "fala inventada" quando há dublagem. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__DUB__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new, count=1):
    global s
    assert s.count(old) == count, (s.count(old), old[:80])
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T)


DUB = (r'const __DUB={m:null,a:null,d:0};function __dubInit(){if(__DUB.m!==null)return;__DUB.m={};fetch("assets/audio/voice/voice-manifest.json").then(r=>r.json()).then(m=>{__DUB.m=m}).catch(()=>{})}'
       r'function __dubH(t){t=String(t||"").replace(/\s+/g," ").trim();let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,"0")}'
       r'function __dubVol(){const E=window.__DED_GAME?.audioEngine;if(!E)return 1;if(E.muted)return 0;return Math.min(1,(E.masterVolume??1)*Math.max(.4,E.sfxVolume??.9)*1.15)}'
       r'function __dubDuck(on){const E=window.__DED_GAME?.audioEngine;try{E?.musicBus&&E.ctx&&E.musicBus.gain.setTargetAtTime((E.musicVolume??.4)*(on?.35:1),E.ctx.currentTime,.3)}catch(e){}}'
       r'function __dubStop(){if(__DUB.a){try{__DUB.a.onended=null;__DUB.a.pause()}catch(e){}__DUB.a=null}__DUB.seq=null;window.__dubOn=!1;__dubDuck(!1)}'
       r'function __dub(text,onEnd){__dubInit();if(__DUB.a){try{__DUB.a.onended=null;__DUB.a.pause()}catch(e){}__DUB.a=null}let lang="pt";try{lang=Be()}catch(e){}'
       r'const h=__dubH(text),e=__DUB.m&&__DUB.m[h];if(!e||lang!=="pt"){window.__dubOn=!1;__dubDuck(!1);onEnd&&onEnd(!1);return!1}'
       r'const a=new Audio("assets/audio/voice/"+h+".mp3");a.volume=__dubVol();__DUB.a=a;__DUB.d=e.d;window.__dubOn=!0;__dubDuck(!0);'
       r'a.onended=()=>{if(__DUB.a===a){__DUB.a=null;window.__dubOn=!1;__dubDuck(!1)}onEnd&&onEnd(!0)};a.play().catch(()=>{if(__DUB.a===a){__DUB.a=null;window.__dubOn=!1;__dubDuck(!1)}});return!0}'
       r'function __dubLeft(){const a=__DUB.a;if(!a)return 0;const d=isFinite(a.duration)&&a.duration>0?a.duration:__DUB.d||0;return Math.max(0,(d-a.currentTime)*1e3)}'
       r'function __dubSeq(lines){__dubStop();const L=(lines||[]).slice(),tok={};__DUB.seq=tok;const go=()=>{if(__DUB.seq!==tok||!L.length)return;const t=L.shift();__dub(t,()=>setTimeout(go,300))};go()}'
       r'__dubInit();window.__dub=__dub;window.__dubStop=__dubStop;')
put("class Bl{constructor(i){this.scene=i,this.musicKey=null", DUB + "class Bl{constructor(i){this.scene=i,this.musicKey=null")
# diálogos
put('full=__T(e.text);shown=0;tx.setText("");e.onShow?.();', 'full=__T(e.text);shown=0;tx.setText("");e.onShow?.();__dub(full);')
put('autoCloseTimer=ui.time.delayedCall(2200,', 'autoCloseTimer=ui.time.delayedCall(Math.max(2200,__dubLeft()+700),', 2)
put('const end=()=>{if(closed)return;closed=!0;', 'const end=()=>{if(closed)return;closed=!0;__dubStop();', 2)
# páginas do prólogo / história ilustrada
put('full=__T(P.lines[l]);n=0;', 'full=__T(P.lines[l]);n=0;__dub(full);')
# painel de história das fases (narrador lê as linhas em sequência)
put('this.storyPanel.setVisible(!0).setAlpha(0)', '(__dubSeq(t),this.storyPanel).setVisible(!0).setAlpha(0)')
put('closeStory(){', 'closeStory(){__dubStop();')
# cinemática de abertura
put('textLine.textContent = s.lines[curLine] || "";', 'textLine.textContent = s.lines[curLine] || ""; window.__dub?.(s.lines[curLine] || "");')
put('isClosing = true;', 'isClosing = true; window.__dubStop?.();')

for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("dublagem ligada ao jogo")
