/* ══ Árvores do Modo Infinito · itens novos ═════════════════════════════════════════════════════════════════
   Apito do Lobo (Kael), Maracá Sagrado e Zarabatana (Araí), Foice de Ouro (Tharion), dois cajados de osso e uma
   foice sombria (Valthor). Caem com mais frequência no modo infinito para o herói que os usa. */
{const I=(id,o,n,d)=>{Xt[id]={...o,get name(){return n[0]},get desc(){return __L3(d[0],d[1],d[2])}};_s[`item.${id}`]=n[1];Io[`item.${id}`]=n[2]};
 I("wolf_whistle",{type:"accessory",slot:"accessory",icon:"icon-amulet",classRequirement:"HUNTER",stats:{critChance:3,maxHp:2},value:40},["Apito do Lobo","Wolf Whistle","Silbato del Lobo"],
  ["Osso do Yukon. Liga as habilidades do lobo da Árvore do Infinito.","Yukon bone. Powers the wolf skills of the Endless Tree.","Hueso del Yukón. Activa las habilidades del lobo del Árbol del Infinito."]);
 I("sacred_maraca",{type:"accessory",slot:"accessory",icon:"icon-amulet",classRequirement:"SHAMAN",stats:{magicDamage:2,maxHp:2},value:40},["Maracá Sagrado","Sacred Maraca","Maraca Sagrada"],
  ["Cabaça pintada de urucum. Chama os espíritos da Árvore do Infinito.","A gourd painted with annatto. Calls the spirits of the Endless Tree.","Calabaza pintada con achiote. Llama a los espíritus del Árbol del Infinito."]);
 I("blowgun",{type:"weapon",slot:"weapon",icon:"icon-bow",weaponCategory:"ARCHER",classRequirement:"SHAMAN",visualKey:"bow",stats:{damage:3,critChance:8},attackSpeed:1,value:32},["Zarabatana","Blowgun","Cerbatana"],
  ["Taboca leve e certeira. A arma natural dos dardos de curare.","Light, precise cane. The natural weapon for curare darts.","Caña ligera y certera. El arma natural de los dardos de curare."]);
 I("golden_sickle",{type:"weapon",slot:"weapon",icon:"icon-dagger",classRequirement:"DRUID",visualKey:"dagger",stats:{damage:3,magicDamage:2,critChance:5},attackSpeed:1,value:34},["Foice de Ouro","Golden Sickle","Hoz de Oro"],
  ["A foice dos druidas, a que corta o visco.","The druids' sickle, the one that cuts the mistletoe.","La hoz de los druidas, la que corta el muérdago."]);
 I("marrow_staff",{type:"weapon",slot:"weapon",icon:"icon-staff",weaponCategory:"NECROMANCER",classRequirement:"NECROMANCER",visualKey:"staff",stats:{magicDamage:6,maxMana:6},attackSpeed:1,value:26,minRarity:"UNCOMMON"},["Cajado de Medula","Marrow Staff","Bastón de Médula"],
  ["Osso longo ainda quente por dentro.","A long bone, still warm inside.","Hueso largo, aún tibio por dentro."]);
 I("crypt_staff",{type:"weapon",slot:"weapon",icon:"icon-staff",weaponCategory:"NECROMANCER",classRequirement:"NECROMANCER",visualKey:"staff",stats:{magicDamage:9,maxMana:10},attackSpeed:1,value:44,minRarity:"RARE"},["Cajado da Cripta","Crypt Staff","Bastón de la Cripta"],
  ["Tirado de uma cripta de Białowieża. Os ossos obedecem.","Taken from a crypt in Białowieża. The bones obey.","Sacado de una cripta de Białowieża. Los huesos obedecen."]);
 I("grim_scythe",{type:"weapon",slot:"weapon",icon:"icon-skull-scepter",weaponCategory:"NECROMANCER",classRequirement:"NECROMANCER",visualKey:"arcane_staff",stats:{magicDamage:8,maxMana:10,critChance:3},attackSpeed:1,value:46,minRarity:"RARE"},["Foice Sombria","Grim Scythe","Guadaña Sombría"],
  ["Ceifa almas como trigo.","Reaps souls like wheat.","Siega almas como trigo."])}
const __ETITEMS={HUNTER:["wolf_whistle"],SHAMAN:["sacred_maraca","blowgun"],DRUID:["golden_sickle"],NECROMANCER:["marrow_staff","crypt_staff","grim_scythe"]};
{const PL0=Bh.prototype.scaledPools;Bh.prototype.scaledPools=function(i){const r=PL0.apply(this,arguments);try{if(this.endlessDepth?.()==null)return r;const add=__ETITEMS[this.scene?.classDef?.id];if(add)return[...r,...add,...add]}catch(e){}return r}}
/* ficha do item: "Ativa N habilidades da sua árvore" */
function __etItemFams(it){const f=[];for(const[k,F]of Object.entries(__ETFAM)){if(F.form)continue;if(F.slot){it.slot==="offhand"&&f.push(k);continue}if(F.acc){F.acc.includes(it.id)&&f.push(k);continue}if(it.slot!=="weapon")continue;
 if(F.ids){F.ids.includes(it.id)&&f.push(k);continue}const del=(oe[it.visualKey??it.id]??oe[it.id])?.delivery;F.melee&&del==="melee"&&f.push(k);F.ranged&&(it.id==="blowgun"||del==="arrow")&&f.push(k)}return f}
{const T0=Cd.prototype.refreshTooltip;Cd.prototype.refreshTooltip=function(){let it=null,d0,mod=!1;try{const S=this.gs();it=this.selectedItem?.();if(it&&__etOn(S)){const fams=__etItemFams(it);if(fams.length){const st=__etSt(S),T=__ET[S.classDef.id],sides=st.tree?[st.tree]:["d","a"];
  let n=0;for(const k of sides)for(const q of T[k].nodes)fams.includes(q.w)&&n++;if(n>0){d0=it.desc;mod=!0;it.desc=(d0?d0+"\n":"")+"★ "+(st.tree?__L3(`Ativa ${n} habilidades da sua árvore`,`Powers ${n} skills of your tree`,`Activa ${n} habilidades de tu árbol`):__L3(`Ativa ${n} habilidades das Árvores do Infinito`,`Powers ${n} Endless Tree skills`,`Activa ${n} habilidades de los Árboles del Infinito`))}}}}catch(e){}
 try{return T0.apply(this,arguments)}finally{if(it&&mod)it.desc=d0}}}
