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
VO = (r'function __voOf(e){if(!e)return null;if(e.corrupt)return e.who==="guardia"?"demonf":"demon";if(e.who==="guardia")return"guardia";if(e.who==="rei")return"rei";if(e.voice)return e.voice;'
      r'const nm=String(e.name||"");if(!nm)return null;const lo=nm.toLowerCase();let hf=!1;try{hf=["ROGUE","MAGE","SHAMAN"].some(k=>{const h=String(__HN?.[k]||"").toLowerCase();return h&&lo.includes(h)})}catch(_){}return hf||/seris|arthelia|ladina|maga|xam|guardi|rainha|queen|bruxa/i.test(nm)?"female":/rei|king|velho|anci|mestre|ferreiro/i.test(nm)?"old":"male"}'
      r'function __voTick(sc,e,full,n){if(window.__dubOn)return;if(e&&(e.who==="guardia"||e.who==="rei")&&window.__dubReady?.())return;const v=__voOf(e);if(!v||!sc)return;const st=sc.__voSt||(sc.__voSt={n:0,t:0});if(n<st.n)st.n=0;const ch=full.slice(st.n,n);st.n=n;'
      r'if(!/[A-Za-zÀ-ÿ]/.test(ch))return;const now=performance.now();if(now-st.t<(v==="demon"?150:v==="guardia"?120:95))return;st.t=now;window.__DED_GAME?.audioEngine?.sfx?.("sfx-vo-talk-"+v)}'
      r'function __voHeroF(id){return/rogue|shaman|mage|huntress/i.test(id||"")}')
put("class zr{constructor(){", SB + VO + "class zr{constructor(){")
put("this.chiptune=new Hr(this)}", "this.chiptune=new Hr(this);__SB.load(this)}")
put('sfx(i){if(!this.ready)return;switch(', 'sfx(i){if(!this.ready)return;if(__SB.play(this,i))return;switch(')
# vozes nos diálogos (fala inventada enquanto o texto aparece)
put('shown=Math.min(full.length,shown+2);tx.setText(full.slice(0,shown));', 'shown=Math.min(full.length,shown+2);tx.setText(full.slice(0,shown));__voTick(ui,e,full,shown);')
put('n=Math.min(full.length,n+1);tx.setText(full.slice(0,n));', 'n=Math.min(full.length,n+1);tx.setText(full.slice(0,n));__voTick(S,{who:P.who,corrupt:P.corrupt},full,n);')
# dor do herói: arqueiro (Hayato) é homem; ladina, maga e xamã são mulheres
put('.match(/archer|huntress|rogue|shaman|mage/i)?"sfx-hero-hurt-female"', '.match(/huntress|rogue|shaman|mage/i)?"sfx-hero-hurt-female"')
# grito de morte do herói
put('die(){this.dead=!0,this.setVelocity(0,0),this.scene.playerVisual?.playDeath(),', 'die(){this.dead=!0,this.setVelocity(0,0),this.scene.game.audioEngine?.sfx?.(__voHeroF(this.scene.classDef?.id)?"sfx-hero-death-female":"sfx-hero-death-male"),this.scene.playerVisual?.playDeath(),')

for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("banco de sons ligado ao motor de áudio")
