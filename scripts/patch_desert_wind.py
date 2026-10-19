"""
Deserto Esquecido (fase "temple"): vento de tempestade de areia + areia passando na tela.

  - som: assets/audio/ambient/desert-wind.* (gerado por build_snow_wind.py --desert), em laço contínuo
    no canal de Ambiente; mais baixo dentro da Pirâmide
  - areia no ar levada pelo vento (grãos e riscos), mais forte nas rajadas do som
  - fitas de areia correndo rente ao chão (por baixo dos personagens)
  - névoa de poeira quente nas rajadas e, de vez em quando, um redemoinho de areia
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__DSW__*/"


def strip_all():
    global s
    while T in s:
        a = s.index(T)
        b = s.index(T, a + 1)
        inner = s[a + len(T):b]
        k = inner.rindex("/*§")
        orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8")
        s = s[:a] + orig + s[b + len(T):]


strip_all()


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


FN = (r'function __dsWind(B){if(B.level?.id!=="temple")return;const d=B.scene,R=Math.random,E=d.game.audioEngine;let W=null,gv=.4,lastIn=0,WD=48,WE=[];'
      r'fetch("assets/audio/ambient/desert-wind.json").then(r=>r.json()).then(j=>{WD=j.dur||48;WE=j.env||[]}).catch(()=>{});'
      r'const wplay=buf=>{if(!d.sys?.isActive?.()||W||!E?.ctx||!E.ambientBus)return;const src=E.ctx.createBufferSource();src.buffer=buf;src.loop=!0;const g=E.ctx.createGain();g.gain.value=0;src.connect(g);g.connect(E.ambientBus);src.start();W={src,g,t0:E.ctx.currentTime}};'
      r'const wload=()=>{if(!d.sys?.isActive?.())return;if(!E?.ctx||!E.ambientBus){d.time.delayedCall(600,wload);return}if(window.__dsWindBuf){wplay(window.__dsWindBuf);return}const ogg=(new Audio).canPlayType("audio/ogg; codecs=vorbis");fetch("assets/audio/ambient/desert-wind."+(ogg?"ogg":"mp3")).then(r=>r.arrayBuffer()).then(b=>E.ctx.decodeAudioData(b)).then(buf=>{window.__dsWindBuf=buf;wplay(buf)}).catch(()=>{})};d.time.delayedCall(300,wload);'
      r'd.events.once("shutdown",()=>{if(W){try{W.g.gain.setTargetAtTime(0,E.ctx.currentTime,.15);const S=W.src;setTimeout(()=>{try{S.stop();S.disconnect()}catch(e){}},500)}catch(e){}W=null}});'
      r'const haze=d.add.rectangle(0,0,d.scale.width*2,d.scale.height*2,14201466).setOrigin(0).setScrollFactor(0).setDepth(8999).setAlpha(0);'
      # dentro da pirâmide o vento fica abafado e quase não entra areia
      r'const wt=()=>{const p=d.player;if(!p||!d.sys.isActive())return;const rm=d.roomManager?.activeRoom?.id||"",inF=rm==="deserto-piramide"?.25:1;'
      r'if(W&&E?.ctx){const ph=((E.ctx.currentTime-W.t0)%WD+WD)%WD;gv=WE.length?WE[Math.min(WE.length-1,Math.floor(ph*4))]:.5;W.g.gain.setTargetAtTime(inF*.9,E.ctx.currentTime,.8)}else gv=.45+.3*Math.sin(d.time.now/4e3);'
      r'lastIn+=(inF-lastIn)*.03;haze.setAlpha(lastIn*(.015+Math.max(0,gv-.35)*.22))};d.events.on("update",wt);d.events.once("shutdown",()=>d.events.off("update",wt));'
      r'const COL=[16180928,15323032,11565632,9395760,16773072];'
      r'const fl=()=>{if(!d.sys?.isActive?.())return;const V=d.cameras.main.worldView;if(lastIn>.05){const g=gv,n=Math.round((1+g*7)*lastIn),wx=V.width*(1.1+g*.9);'
      # grãos e riscos de areia no ar, da esquerda para a direita
      r'for(let k=0;k<n;k++){const x=V.x-20-R()*60,y=V.y+R()*V.height,dur=(1500+R()*900)*(1-g*.4),str=g>.55&&R()<.55;'
      r'const c=str?d.add.rectangle(x,y,8+R()*14,1.2,COL[k%5]).setRotation(.08+R()*.1):d.add.circle(x,y,.7+R()*1.1,COL[(k+2)%5]);c.setAlpha((.5+R()*.45)*Math.min(1,lastIn*1.4)).setDepth(9e3);'
      r'd.tweens.add({targets:c,x:x+wx+R()*80,y:y+V.height*(.06+R()*.12)+(R()-.5)*30,duration:dur,ease:"Linear",onComplete:()=>c.destroy()})}'
      # fitas de areia correndo rente ao chão (por baixo dos personagens)
      r'if(R()<.25+g*.65){const p=d.player,y=p.y+(R()-.4)*V.height*.8,x=V.x-60,w=40+R()*90,e=d.add.ellipse(x,y,w,1.5+R()*2.5,COL[R()<.6?0:4]).setAlpha(0).setDepth(.7);d.tweens.add({targets:e,alpha:.22+R()*.22+g*.15,duration:350,yoyo:!0,hold:700});'
      r'd.tweens.add({targets:e,x:x+V.width+160,y:y+(R()-.5)*16,scaleX:1.3,duration:(1300+R()*700)*(1-g*.3),ease:"Sine.easeIn",onComplete:()=>e.destroy()})}}d.time.delayedCall(45,fl)};d.time.delayedCall(200,fl);'
      # redemoinho de areia de vez em quando, atravessando a tela
      r'const dv=()=>{if(!d.sys?.isActive?.())return;const V=d.cameras.main.worldView;if(lastIn>.6&&(d.roomManager?.activeRoom?.id||"")!=="deserto-piramide"){const y0=V.y+V.height*(.3+R()*.5),x0=V.x-30,x1=V.x+V.width+30,dur=5e3+R()*2e3,o={x:x0,y:y0,t:0},ps=[];'
      r'for(let k=0;k<34;k++)ps.push(d.add.circle(x0,y0,.6+R()*1.2,COL[k%5]).setAlpha(0).setDepth(9e3));const U=(tt,ms)=>{o.t+=ms/1e3;const f=o.t*1e3/dur;if(f>=1){d.events.off("update",U);ps.forEach(q=>q.destroy());return}const cx=x0+(x1-x0)*f,cy=y0+Math.sin(f*6)*10,fade=Math.sin(f*Math.PI);'
      r'ps.forEach((q,k)=>{const h=k/34,a=o.t*(7+h*5)+k*1.7,r=3+h*16;q.setPosition(cx+Math.cos(a)*r,cy-h*44+Math.sin(a)*r*.35).setAlpha(fade*(.25+.45*(1-h)))})};d.events.on("update",U);d.events.once("shutdown",()=>d.events.off("update",U))}d.time.delayedCall(14e3+R()*16e3,dv)};d.time.delayedCall(6e3,dv)}')
put("/*__VLOCK__*/", FN + "/*__VLOCK__*/")
put("this.buildWallVisuals(),this.buildObjects(),", "this.buildWallVisuals(),__dsWind(this),this.buildObjects(),")

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("vento e areia do deserto aplicados")
