"""
Desempenho em lutas de chefe:
  1) limita os sons sintetizados do Tone.js (scripts/source/audio-perf.js)
  2) números de dano (floatText) reaproveitam objetos de texto em vez de criar um por golpe
Re-executável: substitui a versão anterior se já tiver sido aplicado.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "audio-perf.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
TAG_A, TAG_B = "/*__AUDIO_PERF_BEGIN__*/", "/*__AUDIO_PERF_END__*/"

# 1) áudio
if TAG_A in s:
    a = s.index(TAG_A)
    b = s.index(TAG_B) + len(TAG_B)
    s = s[:a] + s[b:]
anchor = "class zr{constructor(){this.ctx=null"
assert s.count(anchor) == 1, s.count(anchor)
s = s.replace(anchor, TAG_A + SRC + TAG_B + anchor)

# 2) números de dano com reaproveitamento
OLD = ('floatText(i,t,e,d="#ffffff",o=10){const a=this.scene.add.text(i,t,e,{fontFamily:"\'Courier New\', monospace",fontSize:`${o}px`,'
       'fontStyle:"bold",color:d,stroke:"#1a120c",strokeThickness:3}).setOrigin(.5).setDepth(1500);this.scene.tweens.add({targets:a,y:t-22-o,'
       'alpha:0,duration:750,ease:"Cubic.easeOut",onComplete:()=>a.destroy()})}')
NEW = ('floatText(i,t,e,d="#ffffff",o=10){const P=this.__ftPool=(this.__ftPool||[]).filter(q=>q.active);let a=P.find(q=>q.active&&!q.visible&&q.scene===this.scene);'
       'if(a){a.setText(e);a.__fs!==o&&(a.setFontSize(o),a.__fs=o);a.__fc!==d&&(a.setColor(d),a.__fc=d);a.setPosition(i,t).setAlpha(1).setVisible(!0)}'
       'else{if(P.length>=40){const v=P.shift();v?.active&&v.destroy()}'
       'a=this.scene.add.text(i,t,e,{fontFamily:"\'Courier New\', monospace",fontSize:`${o}px`,fontStyle:"bold",color:d,stroke:"#1a120c",strokeThickness:3}).setOrigin(.5).setDepth(1500);'
       'a.__fs=o;a.__fc=d;P.push(a)}'
       'this.scene.tweens.add({targets:a,y:t-22-o,alpha:0,duration:750,ease:"Cubic.easeOut",onComplete:()=>a.active&&a.setVisible(!1)})}')
if OLD in s:
    s = s.replace(OLD, NEW)
else:
    assert NEW in s, "floatText: trecho original não encontrado"

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("desempenho de áudio e textos aplicado")
