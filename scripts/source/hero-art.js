/* ══ Arte dos heróis na escolha de personagem ═══════════════════════════════════════════════════════════════
   Ilustração sem fundo (assets/images/heroes/hero-art-<classe>.png) no lugar do sprite no centro da tela.
   Entra deslizando e com um respiro leve; herói bloqueado aparece como silhueta escura. */
const __HART=["warrior","berserker","archer","rogue","mage","shaman","hunter","druid","necromancer"];
{const P0=bo.prototype.preload;bo.prototype.preload=function(){const r=P0.apply(this,arguments);try{const L=this.load,op=L.path;L.setPath("");
 for(const c of __HART){const k=`hero-art-${c}`;this.textures.exists(k)||L.image(k,`assets/images/heroes/${k}.png`)}L.setPath(op)}catch(e){}return r}}
{const R0=bl.prototype.refreshDetails;bl.prototype.refreshDetails=function(){const r=R0.apply(this,arguments);try{const cls=fe[this.selected],k=`hero-art-${String(cls).toLowerCase()}`,lk=!this.__ok(cls);
 if(!this.textures.exists(k)){this.__art?.setVisible(!1);return r}
 this.hero?.setVisible(!1);this.__heroT?.forEach?.(q=>q.remove?.());
 const H=226,X=318,Y=294;let a=this.__art;if(!a||!a.active){a=this.__art=this.add.image(X,Y,k).setOrigin(.5,1).setDepth(3)}
 const changed=this.__artK!==k||this.__artL!==lk;this.__artK=k;this.__artL=lk;
 a.setTexture(k).setVisible(!0);const s=H/a.height;a.__s=s;lk?a.setTint(1379848).setAlpha(.92):a.clearTint();
 if(changed){this.tweens.killTweensOf(a);a.setScale(s*.96).setAlpha(0).setPosition(X,Y+10);
  this.tweens.add({targets:a,alpha:lk?.92:1,y:Y,scale:s,duration:320,ease:"Cubic.easeOut",onComplete:()=>{lk||this.tweens.add({targets:a,scaleY:s*1.012,y:Y-1,duration:1600,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"})}})}}catch(e){}return r}}
