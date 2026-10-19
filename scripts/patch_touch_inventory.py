"""Toque: o botão de INVENTÁRIO (e o START) ganham uma área exclusiva.
O joystick flutuante ocupa a metade esquerda da tela; um toque perto do botão de inventário
abria o analógico. Agora a área em volta desses botões (até a borda de baixo) é só deles:
o joystick ignora toques ali e o toque aciona o botão. Re-executável."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
FN = ('/*__JOYX__*/function __joyExcl(H){const J=H.joystick;if(!J)return;J.__excl=[[H.selectBtn,"INVENTORY"],[H.startBtn,"PAUSE"]].filter(([b])=>b?.text).map(([b,act])=>{const t=b.text,w=t.displayWidth,h=t.displayHeight,x0=t.x-w/2-18,y0=t.y-h/2-14;'
      'return{t,r:new j.Geom.Rectangle(x0,y0,w+36,Math.max(h+28,st-y0)),fn:()=>{H.mgr.markTouchConsumed();t.setBackgroundColor("#3a2f1e");H.mgr.touchPress(act);H.scene.time.delayedCall(150,()=>t.setBackgroundColor("#1a1410"))}}})}')
REPL = [
    ('this.zone.on("pointerdown",p=>{this.pointerId==null&&(this.pointerId=p.id,',
     'this.zone.on("pointerdown",p=>{const __x=this.__excl?.find(o=>o.t.visible&&o.r.contains(p.x/Pt,p.y/Pt));if(__x){__x.fn();return}this.pointerId==null&&(this.pointerId=p.id,'),
    ('this.selectBtn.setPosition(a/2-62,v),this.startBtn.setPosition(a/2+58,v);',
     'this.selectBtn.setPosition(a/2-62,v),this.startBtn.setPosition(a/2+58,v);__joyExcl(this);'),
    ('class Ud{', FN + 'class Ud{'),
]
for old, new in REPL:
    if new not in s:
        assert s.count(old) == 1, old[:60]
        s = s.replace(old, new)
for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("área exclusiva do botão de inventário aplicada")
