"""
Liga o banco de sons gerado (assets/audio/sfx/sfx-bank.*) ao motor de áudio do jogo:
toca uma variação aleatória (nunca a mesma duas vezes seguidas) com leve mudança de tom e volume,
respeita o pan/distância de sfxAt e o limite de vozes; se o som não existir no banco, usa o sintetizado antigo.
Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__SFXB__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


SB = (r'const __SB={st:0,buf:null,m:null,al:{},last:{},load(E){if(this.st||!E.ctx)return;this.st=1;'
      r'fetch("assets/audio/sfx/sfx-bank.json").then(r=>r.json()).then(m=>{this.m=m.sounds;this.al=m.alias||{};return fetch("assets/audio/sfx/sfx-bank.mp3")})'
      r'.then(r=>r.arrayBuffer()).then(a=>new Promise((ok,ko)=>E.ctx.decodeAudioData(a,ok,ko))).then(b=>{this.buf=b;this.st=2}).catch(()=>{this.st=3})},'
      r'has(key){const k=key.replace(/^sfx-/,"");return this.st===2&&!!this.m[this.al[k]||k]},'
      r'play(E,key){if(this.st!==2)return!1;let k=key.replace(/^sfx-/,"");k=this.al[k]||k;const s=this.m[k];if(!s)return!1;const V=s.v;let n=Math.floor(Math.random()*V.length);'
      r'if(V.length>1&&n===this.last[k])n=(n+1)%V.length;this.last[k]=n;const[o,l]=V[n];if(!E.claimVoice(2,l))return!0;const c=E.ctx,src=c.createBufferSource(),g=c.createGain();'
      r'src.buffer=this.buf;src.playbackRate.value=.94+Math.random()*.12;g.gain.value=s.g*(.86+Math.random()*.22);src.connect(g);g.connect(E._out??E.sfxBus);'
      r'src.start(c.currentTime+.005,o,l+.02);src.onended=()=>{try{src.disconnect();g.disconnect()}catch(e){}};return!0}};window.__SB=__SB;')
put("class zr{constructor(){", SB + "class zr{constructor(){")
put("this.chiptune=new Hr(this)}", "this.chiptune=new Hr(this);__SB.load(this)}")
put('sfx(i){if(!this.ready)return;switch(', 'sfx(i){if(!this.ready)return;if(__SB.play(this,i))return;switch(')
for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("banco de sons ligado ao motor de áudio")
