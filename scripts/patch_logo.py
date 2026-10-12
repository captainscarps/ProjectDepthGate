"""
Logo do menu: NUNCA mostrar o texto "DARK EPIC DUNGEONS" no lugar da imagem.
Antes, o jogo testava o logo com um pedido HEAD de no máximo 1,2 s; se a rede
demorasse (ex.: logo depois de atualizar o cache), o logo nem era carregado e
aparecia o texto. Agora o logo é sempre carregado e, se mesmo assim faltar,
o menu tenta de novo e mostra a imagem assim que chegar — sem texto.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__logoRetry" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


rep('Promise.race([t,e]).then(d=>this.registry.set("logoAvailable",d))',
    'Promise.race([t,e]).then(()=>this.registry.set("logoAvailable",!0))')
rep('this.registry.get("logoAvailable")&&this.load.image("logo-dark-epic","assets/ui/dark-epic-dungeons-logo.png");',
    'this.load.image("logo-dark-epic","assets/ui/dark-epic-dungeons-logo.png");')
rep('const l=this.add.text(i,52,"DARK EPIC DUNGEONS",{...qe,fontSize:"26px"}).setOrigin(.5);'
    'this.tweens.add({targets:l,scale:1.02,duration:1600,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"})',
    'const __logoRetry=(n)=>{if(n>5||!this.sys.isActive())return;'
    'this.load.image("logo-dark-epic","assets/ui/dark-epic-dungeons-logo.png?r="+Date.now());'
    'this.load.once("complete",()=>{if(!this.sys.isActive())return;'
    'if(!this.textures.exists("logo-dark-epic")){this.time.delayedCall(1500,()=>__logoRetry(n+1));return}'
    'this.textures.get("logo-dark-epic").setFilter(j.Textures.FilterMode.LINEAR);'
    'const l=this.add.image(160,64,"logo-dark-epic"),p=Math.min(270/l.width,84/l.height);l.setScale(p).setAlpha(0).setDepth(5);'
    'this.tweens.add({targets:l,alpha:1,duration:500,ease:"Sine.easeOut"});'
    'this.tweens.add({targets:l,scale:p*1.02,delay:500,duration:1600,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"})});'
    'this.load.start()};__logoRetry(0)')
assert "DARK EPIC DUNGEONS" not in s
open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — logo sempre como imagem")
