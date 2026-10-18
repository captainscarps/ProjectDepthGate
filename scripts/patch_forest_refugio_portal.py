"""
Portal para o Refúgio no Coração da Floresta (canto inferior direito da sala, longe do círculo dos
portais das masmorras). Salva a campanha, abre a vila e a placa FLORESTA traz o herói de volta.
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
TAG = "/*__REFUGIO_PORTAL__*/"
while TAG in s:
    a = s.index(TAG)
    b = s.index(TAG, a + 1) + len(TAG)
    s = s[:a] + s[b:]

PORTAL = (TAG + 'try{const rx0=1622,ry0=548,col=11796360;'
          'const rp=S.add.sprite(rx0,ry0,"hub-portal",0).setOrigin(.5,1).setDepth(ry0).setScale(.92).setTint(14744511);rp.play("hub-portal-a");'
          'const rov=S.add.sprite(rx0,ry0,"hub-portal",0).setOrigin(.5,1).setDepth(ry0+.5).setScale(.92).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.3);rov.play("hub-portal-a");'
          'S.tweens.add({targets:rov,alpha:.62,duration:1300,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});'
          'const rgl=S.add.image(rx0,ry0-30,"light").setScale(.38).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.38).setDepth(ry0-1);S.tweens.add({targets:rgl,alpha:.18,duration:1300,yoyo:!0,repeat:-1});'
          'S.lighting?.addLight?.({x:rx0,y:ry0-26,radius:72,flicker:.08,color:col});'
          'for(const ox of[-24,24]){const pg=S.add.graphics().setDepth(ry0-.2);pg.fillStyle(0,.3).fillEllipse(rx0+ox,ry0,10,4);pg.fillStyle(4864552,1).fillRect(rx0+ox-1.5,ry0-24,3,24);pg.fillStyle(2763306,1).fillRect(rx0+ox-3,ry0-28,6,4);'
          'const lf=S.add.image(rx0+ox,ry0-32,"light").setScale(.1).setBlendMode(j.BlendModes.ADD).setTint(16755268).setAlpha(.55).setDepth(ry0);S.tweens.add({targets:lf,alpha:.25,duration:300+Math.random()*200,yoyo:!0,repeat:-1})}'
          'S.add.rectangle(rx0,ry0+8,62,12,0x0a0806,.8).setDepth(8999);S.add.text(rx0,ry0+8,__L3("REFÚGIO","REFUGE","REFUGIO"),{fontFamily:"\'Courier New\', monospace",fontSize:"7.5px",fontStyle:"bold",color:"#b8f0a0",stroke:"#0a0806",strokeThickness:2}).setOrigin(.5,.5).setDepth(9000);'
          'S.add.text(rx0,ry0-70,"⌂",{fontFamily:"monospace",fontSize:"12px",color:"#d8f8c0",stroke:"#0a0806",strokeThickness:3}).setOrigin(.5).setDepth(9000);'
          'rp.__level="__refugio";rp.__glow=rgl;rp.__ov=rov;rp.__label=()=>__L3("Entrar: Refúgio (vila)","Enter: Refuge (village)","Entrar: Refugio (aldea)");P.push(rp)}catch(e){}' + TAG)
END = 'P.push(cp);S.__hubPortals=P}'
assert s.count(END) == 1
s = s.replace(END, 'P.push(cp);' + PORTAL + 'S.__hubPortals=P}')

ENTER = 'function __hubEnter(S,p){'
GO = (TAG + 'if(p.__level==="__refugio"){if(S.transitioning)return;S.transitioning=!0;S.state==="playing"&&di(S);const sl=Es(S.game);S.game.registry.set("hub:classId",S.classDef.id);S.game.registry.set("hub:fromForest",{slot:sl});'
      'S.game.audioEngine?.stinger?.("portal");S.cameraSys.fadeOut(650,()=>{S.scene.stop("UI");S.scene.start("Hub",{fromForest:!0,slot:sl})});return}' + TAG)
assert s.count(ENTER) == 1
s = s.replace(ENTER, ENTER + GO)

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("portal do Refúgio na floresta aplicado")
