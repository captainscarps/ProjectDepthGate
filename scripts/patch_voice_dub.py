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


DUB = (r'const __DUB={m:null,a:null,d:0,tok:0};function __dubInit(){if(__DUB.m!==null)return;__DUB.m={k:{},d:{}};fetch("assets/audio/voice/voice-manifest.json").then(r=>r.json()).then(m=>{__DUB.m=m}).catch(()=>{})}'
       r'function __dubH(t){t=String(t||"").replace(/\s+/g," ").trim();let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(16).padStart(8,"0")}'
       r'function __dubLang(){let v="en";try{v=Kt().voiceLang||"en"}catch(e){}return v}'
       r'function __dubVol(){const E=window.__DED_GAME?.audioEngine;if(!E)return 1;if(E.muted)return 0;return Math.min(1,(E.masterVolume??1)*Math.max(.4,E.sfxVolume??.9)*1.15)}'
       r'function __dubDuck(on){const E=window.__DED_GAME?.audioEngine;try{E?.musicBus&&E.ctx&&E.musicBus.gain.setTargetAtTime((E.musicVolume??.4)*(on?.35:1),E.ctx.currentTime,.3)}catch(e){}'
       r'const A=window.__dubAu;if(A&&!A.paused){if(on){A.__dk||(A.__dk=A.volume||.5,A.volume=A.__dk*.4)}else if(A.__dk){A.volume=A.__dk;A.__dk=0}}}'
       r'function __dubStop(){__DUB.tok++;__DUB.q=[];if(__DUB.a){try{__DUB.a.onended=null;__DUB.a.pause()}catch(e){}__DUB.a=null}window.__dubOn=!1;__dubDuck(!1)}'
       r'function __dub(text,onEnd){__dubInit();if(__DUB.a){try{__DUB.a.onended=null;__DUB.a.pause()}catch(e){}__DUB.a=null}'
       r'const id=__DUB.m?.k?.[__dubH(text)],D=id&&__DUB.m.d[id];let L=__dubLang();if(D&&!D[L])L=D.pt?"pt":"en";if(!D||!D[L]){window.__dubOn=!1;__dubDuck(!1);onEnd&&onEnd(!1);return!1}'
       r'const a=new Audio("assets/audio/voice/"+L+"/"+id+".mp3");a.volume=__dubVol();__DUB.a=a;__DUB.d=D[L];window.__dubOn=!0;__dubDuck(!0);let fin=!1;const F=ok=>{if(fin)return;fin=!0;if(__DUB.a===a){__DUB.a=null;window.__dubOn=!1;__dubDuck(!1)}onEnd&&onEnd(ok)};'
       r'a.onended=()=>F(!0);a.play().catch(()=>F(!1));return!0}'
       r'function __dubLeft(){const a=__DUB.a;if(!a)return 0;const d=isFinite(a.duration)&&a.duration>0?a.duration:__DUB.d||0;return Math.max(0,(d-a.currentTime)*1e3)}'
       r'function __dubSeq(lines){__dubStop();const L=(lines||[]).slice(),tok=__DUB.tok;const go=()=>{if(__DUB.tok!==tok||!L.length)return;const t=L.shift();__dub(t,()=>setTimeout(go,300))};go()}'
       r'function __dubQ(text){__dubInit();(__DUB.q||(__DUB.q=[])).push(text);const tok=__DUB.tok;const go=()=>{if(__DUB.tok!==tok||__DUB.a||!__DUB.q.length)return;__dub(__DUB.q.shift(),()=>setTimeout(go,200))};go()}'
       r'function __dubAuto(text,cb){const tok=++__DUB.tok;__DUB.q=[];const fire=()=>{__DUB.tok===tok&&cb()},rd=1600+45*String(text||"").length;'
       r'__dub(text,ok=>{__DUB.tok===tok&&setTimeout(fire,ok?650:rd)})}'
       r'function __voLbl(){try{Un["set.voiceLang"]="VOZ DA HISTÓRIA";Hn["set.voiceLang"]="STORY VOICE";Po["set.voiceLang"]="VOZ DE LA HISTORIA"}catch(e){}}'
       r'function __dubHas(t){const id=__DUB.m?.k?.[__dubH(t)];return!!(id&&__DUB.m.d[id])}function __dubReady(){__dubInit();return!!(__DUB.m&&__DUB.m.k&&Object.keys(__DUB.m.k).length)}'
       r'__dubInit();window.__dubHas=__dubHas;window.__dubReady=__dubReady;window.__dub=__dub;window.__dubStop=__dubStop;window.__dubQ=__dubQ;window.__dubAuto=__dubAuto;')
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
put('textLine.textContent = s.lines[curLine] || "";', 'textLine.textContent = s.lines[curLine] || ""; window.__dubAuto?.(s.lines[curLine] || "", next);')
put('audioEl.src = options.music || "assets/audio/cinematic_intro.mp3";', 'audioEl.src = options.music || "assets/audio/cinematic_intro.mp3"; window.__dubAu = audioEl;')
# vídeo de abertura: narração das legendas
TICK = 'const tick=()=>{if(done||!t0)return;const e=(performance.now()-t0)/1e3,S=o.subs??[];let k=S.findIndex(q=>e>=q[0]&&e<q[1]);'
# legendas guiadas pela narração: cada legenda fica na tela enquanto a voz fala, e o vídeo só fecha depois da última fala
put(TICK, 'let __nar=null,__narDone=!1;const tick=()=>{if(done||!t0)return;const S0=o.subs??[];'
    'if(__nar===null&&window.__dubReady?.()){__nar=!!(window.__dubHas&&S0.length&&S0.every(q=>window.__dubHas(q[2])));'
    'if(__nar){let n=0;const show=()=>{if(done)return;if(n>=S0.length){__narDone=!0;sub.style.opacity="0";return}const q=S0[n++];sub.textContent=q[2];sub.style.opacity="1";'
    'window.__dub(q[2],ok=>{setTimeout(()=>{if(n<S0.length)sub.style.opacity="0";setTimeout(show,ok?650:(q[1]-q[0])*1e3)},ok?250:0)})};'
    'setTimeout(show,Math.max(0,S0[0][0]*1e3-(performance.now()-t0)))}}if(__nar)return;'
    + TICK[len('const tick=()=>{if(done||!t0)return;'):])
put('v.addEventListener("ended",()=>{k===vids.length-1&&close()})', 'v.addEventListener("ended",()=>{k===vids.length-1&&(function w(){__nar&&!__narDone&&!done?setTimeout(w,300):close()})()})')
put('done=!0,clearInterval(subT),', 'done=!0,window.__dubStop?.(),clearInterval(subT),')
put('au.__tv=tv,au.loop=!!o.musicLoop', 'au.__tv=tv,au.loop=!!o.musicLoop,window.__dubAu=au')
# configurações: idioma da voz (padrão inglês)
put('language:null,bindings:{}', 'language:null,voiceLang:"en",bindings:{}')
put('{key:"language",labelKey:"set.language",type:"language",options:be},', '{key:"language",labelKey:"set.language",type:"language",options:be},(__voLbl(),{key:"voiceLang",labelKey:"set.voiceLang",type:"choice",options:[["en","English"],["pt","Português"]]}),')
put('isClosing = true;', 'isClosing = true; window.__dubStop?.();')

put('this.cats=[["language","screenShake","damageNumbers"]', 'this.cats=[["language","voiceLang","screenShake","damageNumbers"]')

for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("dublagem ligada ao jogo")
