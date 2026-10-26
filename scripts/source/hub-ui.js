/* Camada de controles do Refúgio: os MESMOS controles de toque do gameplay (joystick, ataque, dash,
   habilidades 1-4 e interagir), numa cena por cima da vila com a câmera fixa como a UI do jogo. */
class __HubUI extends j.Scene{constructor(){super("HubUI")}
create(){le(this);this.hub=this.scene.get("Hub");const T=this.tc=new Hd(this),H=this.hub;
T.gs=()=>{const h=this.hub;if(!h?.sys?.isActive?.())return null;const A=h.__abil?.()??[];return{abilities:{slots:A.map((d,k)=>({def:{icon:d.icon,cooldown:h.__cdMax?.[k]||Math.max(1.2,(d.cooldown??4)*.5),cost:0},cooldown:h.__cd?.[k]||0}))},resource:{current:1e9},dashCooldown:Math.max(0,h.__dashCd||0),potionCooldown:0,potions:{count:0},interactHint:{visible:!h.panel&&!!h.nearestStation?.()},inventory:{equipment:{}}}};
const hide=()=>{if(!T.built)return;for(const b of[T.potionBtn,T.guardBtn,T.startBtn,T.selectBtn]){if(!b)continue;for(const p of b.parts){p.setVisible(!1);p.disableInteractive?.()}}T.all=T.all.filter(b=>![T.potionBtn,T.guardBtn,T.startBtn,T.selectBtn].includes(b))};hide();
const sv=T.setVisible.bind(T);T.setVisible=v=>{sv(v);hide()};const bd=T.build.bind(T);T.build=()=>{bd();hide()};
/* START (pausa): grande, com borda e área de toque folgada, na camada de UI sem zoom (no HUD da vila o toque errava o alvo) */
{const b=this.add.text(_-10,8,"❚❚ START",{fontFamily:"'Courier New', monospace",fontStyle:"bold",fontSize:"13px",color:"#f2e6bc",backgroundColor:"#1a1410ee",padding:{x:12,y:8}}).setOrigin(1,0).setDepth(9900).setInteractive({useHandCursor:!0});Gt(b,18,14);
 const bd=this.add.graphics().setDepth(9901);bd.lineStyle(1.5,13216842,.85).strokeRoundedRect(b.x-b.width,b.y,b.width,b.height,5);this.pzBtn=b;
 b.on("pointerdown",(p,x,y,e)=>{e?.stopPropagation?.();const h=this.hub;if(!h?.sys?.isActive?.())return;b.setScale(.94);this.time.delayedCall(90,()=>b.setScale(1));h.__uiTap=!0;h.__pz?h.__pzClose():h.__pzOpen()})}
this.events.once("shutdown",()=>{const m=this.game.inputManager;m&&(m.touch.axis={x:0,y:0},m.touch.held.clear())})}
update(){const h=this.hub;if(!h?.sys?.isActive?.()){return}const show=!h.panel&&!h.__busy;/* com painel aberto as áreas de toque dos controles (por cima de tudo) não podem engolir o toque dos botões do painel */if(this.__zShow!==show){this.__zShow=show;for(const o of this.children.list)o.type==="Zone"&&o.input&&(o.input.enabled=show)}if(this.tc.built){for(const b of this.tc.all)for(const p of b.parts)p.setAlpha?.(show?(this.tc.settings.touchOpacity??.6):0)}this.tc.update()}
touchOn(){return!!this.tc?.visible}}

/* Botões de texto com área de toque ampliada (Gt): quando o texto muda (ex.: "»  Continuar  «" ao selecionar),
   o Phaser redimensionava só a largura/altura da área e mantinha o deslocamento antigo, e o toque passava a
   cair acima do botão. Agora a área ampliada é refeita a cada mudança de texto (vale para o jogo todo). */
{const G0=Gt;Gt=function(c,i=10,t=8){const r=G0.call(this,c,i,t);try{if(c?.input){c.__gtPad=[i,t];c.input.customHitArea=!0}}catch(e){}return r};
 const TP=j.GameObjects.Text.prototype,U0=TP.updateText;TP.updateText=function(){const r=U0.apply(this,arguments);try{if(this.__gtPad&&this.input&&!this.__gtIn){this.__gtIn=!0;G0(this,...this.__gtPad);this.__gtIn=!1}}catch(e){this.__gtIn=!1}return r}}
