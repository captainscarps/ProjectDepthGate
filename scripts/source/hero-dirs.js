/* ══ Heróis andando para cima, para baixo e nas diagonais ═══════════════════════════════════════════════════
   Folha extra "<classe>-pack-t<n>-dirs.png" (128×128 por quadro), 4 linhas × c colunas (13 na versão atual; 9 nas antigas):
   linha 0 de frente (descendo), 1 de costas (subindo), 2 diagonal de frente (↘), 3 diagonal de costas (↗);
   coluna 0 parado, colunas 1… caminhada (n[linha] quadros: 6 na 1ª versão, 8 no prompt v2). As diagonais para a esquerda usam o espelho.
   Ataque, esquiva, magia, dano, guarda e morte continuam com o desenho de perfil. */
const __HDIRS={warrior:{t:[0],n:[10,10,9,10],c:13}};
{const P0=bo.prototype.preload;bo.prototype.preload=function(){const r=P0.apply(this,arguments);try{const L=this.load,op=L.path;L.setPath("");
 for(const[c,o]of Object.entries(__HDIRS))for(const t of o.t){const k=`mk4b-${c}-t${t}-dirs`;this.textures.exists(k)||L.spritesheet(k,`assets/pixel-art/characters/${c}-pack-t${t}-dirs.png`,{frameWidth:128,frameHeight:128})}L.setPath(op)}catch(e){}return r}}
{const U0=Qe.prototype.update;Qe.prototype.update=function(i,t){const r=U0.apply(this,arguments);try{const m=this.mk2;if(!m||this.deadPose||window.__noHeroDirs)return r;
 const key=`${this.animPrefix}-dirs`;if(!this.scene.textures.exists(key)){this.__hd=null;return r}
 const busy=this.attackState==="attack"||(t?.dashTimer??0)>0||this.castTimer>0||this.hurtAnimT>0||!!t?.guarding;if(busy){return r}
 const vx=t?.body?.velocity.x??0,vy=t?.body?.velocity.y??0,sp=Math.hypot(vx,vy),C=this.container;
 if(sp>20){const ax=Math.abs(vx)/sp,ay=Math.abs(vy)/sp,pr=this.__hd?.row,h=.07;
  /* troca de direção com folga, para não ficar piscando entre perfil/diagonal/frente no analógico */
  const side=pr==null?ay<.38:ay<.38-h,dg=pr===2||pr===3?ax>=.38-h:ax>=.38+h;
  if(side){this.__hd=null;return r}
  const row=vy>0?(dg?2:0):(dg?3:1),sg=dg?(vx<0?-1:1):(this.lastSideSign??1);row!==pr&&(this.__hdD=0);this.__hd={row,sg}}
 else if(!this.__hd)return r;
 const{row,sg}=this.__hd,run=sp>230,CF=__HDIRS[this.animPrefix.replace(/^mk4b-|-t\d$/g,"")],N=CF?.n?.[row]??6,NC=CF?.c??9;
 /* um quadro a cada ~11 px andados (~14 quadros/s na velocidade normal); o desenho já tem o sobe-e-desce do corpo */
 sp>20?(this.__hdD=(this.__hdD??0)+sp*i):(this.__hdD=0);const k=Math.floor(this.__hdD/(run?14:11))%N,fr=sp>20?row*NC+1+k:row*NC;
 m.anims.stop();m.setTexture(key,fr);m.y=0;this.lastSideSign=sg;C.setScale(sg*Math.abs(C.scaleX),C.scaleY);
 /* poeira no momento em que o pé toca o chão (quadro 1 e metade do ciclo) */
 if(sp>20&&k!==this.__hdK&&(k===0||k===Math.round(N/2)))this.scene.effectsRef?.burstTinted(t.x+(k?4:-4),t.y+12,9076582,2);this.__hdK=sp>20?k:-1}catch(e){}return r}}
