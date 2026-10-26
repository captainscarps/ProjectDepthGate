/* ── Ícones de itens em alta definição (atlas items-hd, gerado por scripts/build_item_icons.py) ─────────────
   quadro "<id do item>" para itens com desenho próprio (Mata-Dragões, Coração do Inverno, conjuntos…)
   quadro "<id>@<RARIDADE>" para os itens comuns (cada raridade tem seu visual; Lendário e Relíquia são únicos) */
{const P0=bo.prototype.preload;bo.prototype.preload=function(){const r=P0.apply(this,arguments);try{if(!this.textures.exists("items-hd")){const L=this.load,op=L.path;L.setPath("");L.atlas("items-hd","assets/pixel-art/items-hd/items.png","assets/pixel-art/items-hd/items.json");L.setPath(op)}}catch(e){}return r}}
function __itFrame(T,it){if(!it||!T?.exists?.("items-hd"))return null;const tx=T.get("items-hd");if(it.id&&tx.has(it.id))return it.id;const k=it.id+"@"+it.rarity;if(tx.has(k))return k;if(it.icon&&tx.has(it.icon))return it.icon;return null}
function __itSet(img,it,size){try{const T=img.scene.textures,f=__itFrame(T,it);if(f){(img.texture.key!=="items-hd"||img.frame.name!==f)&&img.setTexture("items-hd",f);img.setDisplaySize(size,size);return img}
 if(it?.icon&&T.exists(it.icon)){img.texture.key!==it.icon&&img.setTexture(it.icon);img.setScale(Math.min(1.4,size/Math.max(img.width,img.height)))}}catch(e){}return img}
/* inventário */
{const R0=Cd.prototype.refresh;Cd.prototype.refresh=function(){const r=R0.apply(this,arguments);try{if(!this.open)return r;const inv=this.gs().inventory;
 for(const o of this.equipUi||[]){const it=inv.equipment[o.slotName];it&&o.icon.visible&&__itSet(o.icon,it,36)}
 (this.gridUi||[]).forEach((o,k)=>{const it=inv.items[k];it&&o.icon.visible&&__itSet(o.icon,it,36)})}catch(e){}return r}}
/* loja */
{const R1=bd.prototype.refresh;bd.prototype.refresh=function(){const r=R1.apply(this,arguments);try{const L=this.currentList?.()||[];(this.rows||[]).forEach((a,d)=>{const it=L[d+(this.scroll||0)];it&&a.icon?.visible&&__itSet(a.icon,it,26)})}catch(e){}return r}}
/* item no chão */
{const C0=ca;ca=class extends C0{constructor(i,t,e,d){super(i,t,e,d);try{d?.item&&__itSet(this.icon,d.item,22)}catch(e){}}}}
