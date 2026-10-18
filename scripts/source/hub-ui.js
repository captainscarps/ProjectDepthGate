/* Camada de controles do Refúgio: os MESMOS controles de toque do gameplay (joystick, ataque, dash,
   habilidades 1-4 e interagir), numa cena por cima da vila com a câmera fixa como a UI do jogo. */
class __HubUI extends j.Scene{constructor(){super("HubUI")}
create(){le(this);this.hub=this.scene.get("Hub");const T=this.tc=new Hd(this),H=this.hub;
T.gs=()=>{const h=this.hub;if(!h?.sys?.isActive?.())return null;const A=h.__abil?.()??[];return{abilities:{slots:A.map((d,k)=>({def:{icon:d.icon,cooldown:h.__cdMax?.[k]||Math.max(1.2,(d.cooldown??4)*.5),cost:0},cooldown:h.__cd?.[k]||0}))},resource:{current:1e9},dashCooldown:Math.max(0,h.__dashCd||0),potionCooldown:0,potions:{count:0},interactHint:{visible:!h.panel&&!!h.nearestStation?.()},inventory:{equipment:{}}}};
const hide=()=>{if(!T.built)return;for(const b of[T.potionBtn,T.guardBtn,T.startBtn,T.selectBtn]){if(!b)continue;for(const p of b.parts){p.setVisible(!1);p.disableInteractive?.()}}T.all=T.all.filter(b=>![T.potionBtn,T.guardBtn,T.startBtn,T.selectBtn].includes(b))};hide();
const sv=T.setVisible.bind(T);T.setVisible=v=>{sv(v);hide()};const bd=T.build.bind(T);T.build=()=>{bd();hide()};
this.events.once("shutdown",()=>{const m=this.game.inputManager;m&&(m.touch.axis={x:0,y:0},m.touch.held.clear())})}
update(){const h=this.hub;if(!h?.sys?.isActive?.()){return}const show=!h.panel&&!h.__busy;if(this.tc.built){for(const b of this.tc.all)for(const p of b.parts)p.setAlpha?.(show?(this.tc.settings.touchOpacity??.6):0)}this.tc.update()}
touchOn(){return!!this.tc?.visible}}
