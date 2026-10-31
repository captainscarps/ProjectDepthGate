/* ══ Heróis andando para cima, para baixo e nas diagonais ═══════════════════════════════════════════════════
   Folha extra "<classe>-pack-t<n>-dirs.png" (128×128 por quadro), 4 linhas × 9 colunas:
   linha 0 de frente (descendo), 1 de costas (subindo), 2 diagonal de frente (↘), 3 diagonal de costas (↗);
   coluna 0 parado, colunas 1… caminhada (n[linha] quadros: 6 na 1ª versão, 8 no prompt v2). As diagonais para a esquerda usam o espelho.
   Ataque, esquiva, magia, dano, guarda e morte continuam com o desenho de perfil. */
const __HDIRS={warrior:{t:[0],n:[6,6,8,6]}};
{const P0=bo.prototype.preload;bo.prototype.preload=function(){const r=P0.apply(this,arguments);try{const L=this.load,op=L.path;L.setPath("");
 for(const[c,o]of Object.entries(__HDIRS))for(const t of o.t){const k=`mk4b-${c}-t${t}-dirs`;this.textures.exists(k)||L.spritesheet(k,`assets/pixel-art/characters/${c}-pack-t${t}-dirs.png`,{frameWidth:128,frameHeight:128})}L.setPath(op)}catch(e){}return r}}
{const U0=Qe.prototype.update;Qe.prototype.update=function(i,t){const r=U0.apply(this,arguments);try{const m=this.mk2;if(!m||this.deadPose||window.__noHeroDirs)return r;
 const key=`${this.animPrefix}-dirs`;if(!this.scene.textures.exists(key)){this.__hd=null;return r}
 const busy=this.attackState==="attack"||(t?.dashTimer??0)>0||this.castTimer>0||this.hurtAnimT>0||!!t?.guarding;if(busy){return r}
 const vx=t?.body?.velocity.x??0,vy=t?.body?.velocity.y??0,sp=Math.hypot(vx,vy),C=this.container;
 if(sp>20){const ax=Math.abs(vx)/sp,ay=Math.abs(vy)/sp;
  if(ay<.38){this.__hd=null;return r}                              /* lado: desenho original */
  const diag=ax>=.38,row=vy>0?(diag?2:0):(diag?3:1),sg=diag?(vx<0?-1:1):1;this.__hd={row,sg}}
 else if(!this.__hd)return r;
 const{row,sg}=this.__hd,run=sp>230;sp>20?(this.__hdD=(this.__hdD??0)+sp*i):(this.__hdD=0);/* o passo acompanha a distância andada (o pé não escorrega) */const N=__HDIRS[this.animPrefix.replace(/^mk4b-|-t\d$/g,"")]?.n?.[row]??6,fr=sp>20?row*9+1+Math.floor(this.__hdD/(run?11:8)*(N/6))%N:row*9;
 m.anims.stop();m.setTexture(key,fr);this.lastSideSign=sg;C.setScale(sg*Math.abs(C.scaleX),C.scaleY);
 sp>20&&(this.__hdS=(this.__hdS??0)+i)>(run?.2:.28)&&(this.__hdS=0,this.scene.effectsRef?.burstTinted(t.x+(Math.random()<.5?-4:4),t.y+12,9076582,2))}catch(e){}return r}}
