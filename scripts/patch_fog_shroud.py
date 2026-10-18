"""
Áreas ocultas (salas secretas) deixam de ser um retângulo preto: viram uma névoa preta densa,
com bordas esfumaçadas e nuvens que se mexem devagar. O miolo continua opaco (o segredo não vaza).
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
TAG = "/*__FOG_SHROUD__*/"
while TAG in s:
    a = s.index(TAG)
    b = s.index(TAG, a + 1) + len(TAG)
    s = s[:a] + s[b:]

FN = TAG + r'''function __fogTex(S){if(S.textures.exists("fog-noise"))return;const N=128,cv=document.createElement("canvas");cv.width=cv.height=N;const cx=cv.getContext("2d"),im=cx.createImageData(N,N),g=(n)=>{const a=[];for(let i=0;i<n*n;i++)a.push(Math.random());return a},oct=[[4,.5],[8,.27],[16,.15],[32,.08]].map(([n,w])=>[n,w,g(n)]);
const sm=t=>t*t*(3-2*t);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=0;for(const[n,w,G]of oct){const fx=x/N*n,fy=y/N*n,x0=Math.floor(fx),y0=Math.floor(fy),tx=sm(fx-x0),ty=sm(fy-y0),q=(i,j)=>G[((j%n+n)%n)*n+((i%n+n)%n)];v+=w*((q(x0,y0)*(1-tx)+q(x0+1,y0)*tx)*(1-ty)+(q(x0,y0+1)*(1-tx)+q(x0+1,y0+1)*tx)*ty)}
const k=(y*N+x)*4,l=Math.min(1,Math.max(0,(v-.25)*1.6));im.data[k]=8+l*26;im.data[k+1]=8+l*24;im.data[k+2]=11+l*30;im.data[k+3]=Math.round(70+l*170)}cx.putImageData(im,0,0);S.textures.addCanvas("fog-noise",cv)}
function __fogShroud(S,x,y,w,h){__fogTex(S);const c=S.add.container(0,0).setDepth(8400),L=S.textures.exists("light"),R=Math.random,TW=[];
c.add(S.add.rectangle(x+w/2,y+h/2,Math.max(8,w-52),Math.max(8,h-52),197122,1));const ts1=S.add.tileSprite(x+w/2,y+h/2,Math.max(8,w-44),Math.max(8,h-44),"fog-noise").setAlpha(.6).setTileScale(2.4,2.4),ts2=S.add.tileSprite(x+w/2,y+h/2,Math.max(8,w-44),Math.max(8,h-44),"fog-noise").setAlpha(.4).setTileScale(1.4,1.4).setFlipX(!0);c.add([ts1,ts2]);
const puff=(px,py,sc,a,tint=263172)=>{const o=L?S.add.image(px,py,"light").setScale(sc).setTint(tint).setAlpha(a):S.add.circle(px,py,128*sc,tint,a);c.add(o);return o};
const per=2*(w+h),at=t=>t<w?[x+t,y]:t<w+h?[x+w,y+t-w]:t<2*w+h?[x+w-(t-w-h),y+h]:[x,y+h-(t-2*w-h)],inw=(px,py,d)=>[px+(px<=x+1?d:px>=x+w-1?-d:0),py+(py<=y+1?d:py>=y+h-1?-d:0)];
const n=Math.max(14,Math.min(110,Math.round(per/18)));
for(let i=0;i<n*1.3;i++){const[ex,ey]=at(R()*per),[px,py]=inw(ex,ey,18+R()*30);puff(px,py,.3+R()*.22,.85+R()*.15)}
for(let i=0;i<n;i++){const[ex,ey]=at(i/n*per+R()*10),[px,py]=inw(ex,ey,6+R()*26);const o=puff(px+(R()-.5)*20,py+(R()-.5)*20,.24+R()*.3,.9+R()*.1);TW.push(S.tweens.add({targets:o,x:o.x+(R()-.5)*22,y:o.y+(R()-.5)*18,scale:o.scale*(1.1+R()*.2),alpha:.7,duration:2800+R()*3200,yoyo:!0,repeat:-1,ease:"Sine.easeInOut",delay:R()*2e3}))}
for(let i=0;i<n*.6;i++){const[ex,ey]=at(R()*per),[px,py]=inw(ex,ey,-4-R()*14);const o=puff(px,py,.16+R()*.18,.45+R()*.25);TW.push(S.tweens.add({targets:o,x:o.x+(R()-.5)*26,y:o.y+(R()-.5)*20,alpha:.15,duration:3e3+R()*3e3,yoyo:!0,repeat:-1,ease:"Sine.easeInOut",delay:R()*2e3}))}

const U=(t,dt)=>{if(!ts1.active)return;ts1.tilePositionX+=dt*.004;ts1.tilePositionY+=dt*.0015;ts2.tilePositionX-=dt*.003;ts2.tilePositionY+=dt*.0025};S.events.on("update",U);
for(let i=0;i<Math.max(6,n/2);i++){const[ex,ey]=at(R()*per),[px,py]=inw(ex,ey,R()*20);const o=puff(px,py,.14+R()*.14,.14,4210764);TW.push(S.tweens.add({targets:o,x:o.x+(R()-.5)*40,y:o.y-8-R()*14,alpha:.03,scale:o.scale*1.4,duration:3200+R()*3e3,yoyo:!0,repeat:-1,ease:"Sine.easeInOut",delay:R()*2500}))}
c.once("destroy",()=>{S.events.off("update",U);TW.forEach(t=>t.remove?.())});return c}''' + TAG
OLD = 'rm.__darknessShroud=this.scene.add.rectangle(px+pw/2,py+ph/2,pw,ph,0x050403,1.0).setDepth(8400)'
NEW = 'rm.__darknessShroud=__fogShroud(this.scene,px,py,pw,ph)'
if OLD in s:
    s = s.replace(OLD, NEW)
assert NEW in s
ANCH = "class rh{constructor(i,t){"
assert s.count(ANCH) == 1
s = s.replace(ANCH, FN + ANCH)
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("névoa das áreas ocultas aplicada")
