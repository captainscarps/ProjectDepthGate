/* ── Relíquias dos enigmas: efeito próprio de cada uma, coleção com bônus, página no Códice e falas da Guardiã ──
   Efeitos (só com a relíquia equipada):
     Coração do Inverno · golpes congelam o inimigo por um instante
     Olho do Sol        · a cada 6 s o próximo golpe é solar (+60% de dano)
     Lanterna dos Antigos · luz em volta do herói e +1 de mana por segundo
     Sinete das Fechaduras · baús dão ouro extra
     Escama do Carcereiro · com menos da metade da vida, recebe 25% menos dano
     Semente do Anhangá · recupera 1 de vida a cada 5 s
     Pérola da Maré     · +2 de mana por segundo
     Sino dos Mortos    · cada inimigo derrotado cura 1 de vida
     Núcleo de Brasa    · quem acerta o herói de perto leva 2 de dano de fogo
   Coleção (por slot; vale mesmo sem equipar): 3 relíquias +5% de dano · 6: +10% de dano e −10% de dano recebido ·
   9: Bênção dos Relicários, +15% de dano, −15% de dano recebido e 1 de vida a cada 8 s.                       */
const __RELICS=[
 ["winter_heart","glacial",["Golpes congelam o inimigo por um instante.","Hits freeze the enemy for a moment.","Los golpes congelan al enemigo un instante."],["O gelo eterno… você o libertou. Ele bate como o meu, sabia?","Eternal ice… you set it free. It beats like mine, you know?","Hielo eterno… lo liberaste. Late como el mío, ¿sabías?"]],
 ["sun_eye","temple",["A cada 6 s, o próximo golpe é solar: +60% de dano.","Every 6 s, your next hit is solar: +60% damage.","Cada 6 s, el próximo golpe es solar: +60% de daño."],["O Olho do Sol. O templo ainda guardava a luz do meio-dia.","The Eye of the Sun. The temple still kept the noon light.","El Ojo del Sol. El templo aún guardaba la luz del mediodía."]],
 ["ancients_lantern","catacombs",["Ilumina em volta do herói e dá +1 de mana por segundo.","Lights up around the hero and gives +1 mana per second.","Ilumina alrededor del héroe y da +1 de maná por segundo."],["A Lanterna dos Antigos… eles a deixaram acesa para alguém voltar.","The Lantern of the Ancients… they left it lit for someone to return.","La Linterna de los Antiguos… la dejaron encendida para que alguien volviera."]],
 ["lock_sigil","ruins",["Baús dão ouro extra.","Chests give extra gold.","Los cofres dan oro extra."],["Esse sinete fechou as primeiras fechaduras. Cuidado com o que ele ainda abre.","This signet closed the first locks. Careful with what it still opens.","Este sello cerró las primeras cerraduras. Cuidado con lo que aún abre."]],
 ["warden_scale","fortress",["Com menos da metade da vida, recebe 25% menos dano.","Below half health, you take 25% less damage.","Con menos de la mitad de vida, recibes 25% menos daño."],["Uma escama do carcereiro. Ele protegia a prisão até o último fôlego.","A warden's scale. He guarded the prison to his last breath.","Una escama del carcelero. Protegió la prisión hasta su último aliento."]],
 ["anhanga_seed","bosque",["Recupera 1 de vida a cada 5 s.","Recovers 1 health every 5 s.","Recupera 1 de vida cada 5 s."],["A Semente do Anhangá. A mata ainda respira através dela.","The Anhangá Seed. The forest still breathes through it.","La Semilla del Anhangá. La selva todavía respira a través de ella."]],
 ["tide_pearl","rio",["+2 de mana por segundo.","+2 mana per second.","+2 de maná por segundo."],["A Pérola da Maré… quem constrói portais nas Ilhas a procurava.","The Tide Pearl… whoever builds portals on the Isles was looking for it.","La Perla de la Marea… quien construye portales en las Islas la buscaba."]],
 ["dead_bell","morta",["Cada inimigo derrotado cura 1 de vida.","Each defeated enemy heals 1 health.","Cada enemigo derrotado cura 1 de vida."],["O Sino dos Mortos. Se ele tocar sozinho… não acorde ninguém.","The Bell of the Dead. If it rings by itself… wake no one.","La Campana de los Muertos. Si suena sola… no despiertes a nadie."]],
 ["ember_core","vulcao",["Quem acerta o herói de perto leva 2 de dano de fogo.","Whoever hits the hero up close takes 2 fire damage.","Quien golpea al héroe de cerca recibe 2 de daño de fuego."],["O Núcleo de Brasa. O vulcão ainda pulsa nele — e agora em você.","The Ember Core. The volcano still pulses in it — and now in you.","El Núcleo de Brasa. El volcán aún late en él, y ahora en ti."]]];
for(const[id,,fx]of __RELICS)Xt[id]&&(Xt[id].desc=Xt[id].desc+" Efeito: "+fx[0]);
function __relicKey(S){return"depthgate:relics:"+(S?.game?.registry?.get("save:slot")??1)}
function __relicGot(S){try{return JSON.parse(localStorage.getItem(__relicKey(S))||"[]")}catch(e){return[]}}
function __relicHas(S,id){const I=S.inventory;return!!(I&&((I.items||[]).some(q=>q&&q.id===id)||Object.values(I.equipment||{}).some(q=>q&&q.id===id)))}
function __relicEq(S,id){const E=S.inventory?.equipment;return!!E&&Object.values(E).some(q=>q&&q.id===id)}

function __relicFx(S){const D=S.damageSystem;if(!D||D.__rfx)return;if(!S.lootSystem||!S.inventory||!S.time){S.time?.delayedCall?.(0,()=>__relicFx(S));return}D.__rfx=1;const ap=D.apply.bind(D),L3=__L3;let sunT=0,tA=0,tB=0,tC=0,tM=0,lamp=null,got=new Set(__relicGot(S));
const n=()=>got.size;
D.apply=o=>{const P=S.player;let o2=o;try{if(o&&P&&o.target===P&&!P.dead){let m=n()>=9?.85:n()>=6?.9:1;__relicEq(S,"warden_scale")&&P.hp<P.maxHp*.5&&(m*=.75);m<1&&(o2={...o,amount:Math.max(1,Math.round(o.amount*m))});
const src=o.source;if(__relicEq(S,"ember_core")&&src&&src!==P&&src.takeDamage&&!src.dead&&Math.hypot(src.x-P.x,src.y-P.y)<80&&S.time.now>(src.__emb||0)){src.__emb=S.time.now+500;S.time.delayedCall(0,()=>{if(src.active&&!src.dead){src.takeDamage(2,null,0);S.effectsRef?.burstTinted(src.x,src.y-8,16742400,6);S.effects?.floatText(src.x,src.y-26,"2","#ff9a3a")}})}}
else if(o&&P&&o.source===P&&o.target&&!o.target.dead){let m=n()>=9?1.15:n()>=6?1.1:n()>=3?1.05:1;if(__relicEq(S,"sun_eye")&&S.time.now>=sunT){sunT=S.time.now+6e3;m*=1.6;S.effects?.floatText(P.x,P.y-34,L3("SOLAR!","SOLAR!","¡SOLAR!"),"#ffd24a",11);S.effectsRef?.burstTinted(o.target.x,o.target.y-8,16766040,10)}m!==1&&(o2={...o,amount:Math.max(1,Math.round(o.amount*m))})}}catch(e){o2=o}
const r=ap(o2);try{const t=o?.target;if(o&&P&&o.source===P&&t&&t!==P){if(__relicEq(S,"winter_heart")&&t.active&&!t.dead&&t.ai){t.chillTimer=Math.max(t.chillTimer||0,1.2);t.setTint?.(10146032)}
if(__relicEq(S,"dead_bell")&&t.dead&&!t.__bell){t.__bell=1;if(P.hp<P.maxHp){P.hp=Math.min(P.maxHp,P.hp+1);S.game.events.emit("hud:hp",P.hp,P.maxHp);S.effects?.floatText(P.x,P.y-28,"+1","#8ae08a")}}}}catch(e){}return r};
/* Sinete das Fechaduras: ouro extra nos baús */
const LS=S.lootSystem;if(LS&&!LS.__rfx){LS.__rfx=1;const oc=LS.openChest.bind(LS);LS.openChest=i=>{const r=oc(i);try{__relicEq(S,"lock_sigil")&&i&&LS.spawnGold(i.x,i.y,18+Math.floor(Math.random()*16))}catch(e){}return r}}
const heal=k=>{const P=S.player;if(P&&!P.dead&&P.hp<P.maxHp){P.hp=Math.min(P.maxHp,P.hp+k);S.game.events.emit("hud:hp",P.hp,P.maxHp);S.effects?.floatText(P.x,P.y-28,"+"+k,"#8ae08a")}};
const upd=(t,ms)=>{const P=S.player;if(!P||P.dead||S.state!=="playing")return;const dt=ms/1e3;tA+=dt;tB+=dt;tC+=dt;tM+=dt;
if(tA>=5){tA=0;__relicEq(S,"anhanga_seed")&&heal(1)}if(tB>=8){tB=0;n()>=9&&heal(1)}
if(tM>=.5){const rs=S.resource,g=(__relicEq(S,"ancients_lantern")?1:0)+(__relicEq(S,"tide_pearl")?2:0);g&&rs&&rs.type!=="fury"&&rs.gain(g*tM);tM=0}
const wl=__relicEq(S,"ancients_lantern");if(wl&&!lamp&&S.lighting?.addLight){lamp=S.lighting.addLight({x:P.x,y:P.y,radius:170,intensity:1.1,color:15265023})}else if(!wl&&lamp){const L=S.lighting?.lights;if(L){const k=L.indexOf(lamp);k>=0&&L.splice(k,1)}lamp=null}lamp&&(lamp.x=P.x,lamp.y=P.y-10);
if(tC>=1){tC=0;let nw=0;for(const[id]of __RELICS)if(!got.has(id)&&__relicHas(S,id)){got.add(id);nw++}if(nw){try{localStorage.setItem(__relicKey(S),JSON.stringify([...got]))}catch(e){}const c=got.size;S.game.events.emit("ui:banner",L3("RELÍQUIA REGISTRADA NO CÓDICE ","RELIC RECORDED IN THE CODEX ","RELIQUIA REGISTRADA EN EL CÓDICE ")+c+"/9","#ffd98a");
const tier=c===9?L3("BÊNÇÃO DOS RELICÁRIOS: +15% de dano, −15% de dano recebido e vida que volta sozinha","BLESSING OF THE RELIQUARIES: +15% damage, −15% damage taken and self-healing","BENDICIÓN DE LOS RELICARIOS: +15% de daño, −15% de daño recibido y vida que vuelve sola"):c===6?L3("Coleção: +10% de dano e −10% de dano recebido","Collection: +10% damage and −10% damage taken","Colección: +10% de daño y −10% de daño recibido"):c===3?L3("Coleção: +5% de dano","Collection: +5% damage","Colección: +5% de daño"):null;tier&&S.time.delayedCall(2600,()=>S.game.events.emit("ui:banner",tier,"#ffe9a8"))}}};
S.events.on("update",upd);S.events.once("shutdown",()=>{S.events.off("update",upd);lamp=null})}

/* falas da Guardiã para cada relíquia que o herói traz ao Coração da Floresta */
function __relicTalk(S){const L3=__L3,nw=__RELICS.filter(([id])=>__relicHas(S,id)&&!__stFlag(S,"relic_"+id));if(!nw.length)return!1;nw.forEach(([id])=>__stFlag(S,"relic_"+id,!0));
const lines=nw.map(([id,,,tl],k)=>({who:"guardia",expr:k%2?"calm":"special",name:__GN,text:L3(...tl)}));__RELICS.every(([id])=>__stFlag(S,"relic_"+id))&&lines.push({who:"guardia",expr:"sadness",name:__GN,text:L3("As nove relíquias… ninguém reuniu todas desde a primeira selagem. Elas te protegem agora.","All nine relics… no one has gathered them since the first sealing. They protect you now.","Las nueve reliquias… nadie las reunió desde el primer sellado. Ahora te protegen.")});
__gSay(S,lines,()=>S.time.delayedCall(250,()=>S.scene.isActive()&&__guardianTalk(S)));return!0}

/* página no Códice */
function __relicPage(B,LX,RX,PW){const L=B.L,R=B.R,L3=__L3,got=new Set(__relicGot(B)),lv=id=>{try{return St(`lvl.${id}`,ki[id]?.name??id)}catch(e){return id}};
B.T(L,LX+PW/2,38,L3("RELICÁRIOS","RELIQUARIES","RELICARIOS"),13,__BK_RED,{ox:.5,st:"bold"});B.T(L,LX+PW/2,54,L3("resolva os enigmas de cada terra","solve the puzzles of each land","resuelve los enigmas de cada tierra"),7.5,__BK_FAINT,{ox:.5,st:"italic"});
__RELICS.forEach(([id,lid,fx],k)=>{const y=70+k*26,has=got.has(id),it=Xt[id],ic=it?.icon;if(ic&&B.textures.exists(ic)){const im=B.add.image(LX+16,y+8,ic).setScale(.9);has||im.setTint(3355443).setAlpha(.55);L.add(im)}
B.T(L,LX+32,y,has?St(`item.${id}`,it?.name??id):"? ? ?",8.5,has?"#5a2a10":__BK_FAINT,{st:"bold"});B.T(L,LX+32,y+11,has?L3(...fx):L3("Relicário em ","Reliquary in ","Relicario en ")+lv(lid),6.8,has?__BK_INK:__BK_FAINT,{st:has?"normal":"italic"})});
const c=got.size;B.T(R,RX+PW/2,38,L3("BÊNÇÃO DOS RELICÁRIOS","BLESSING OF THE RELIQUARIES","BENDICIÓN DE LOS RELICARIOS"),12,__BK_RED,{ox:.5,st:"bold"});B.T(R,RX+PW/2,60,c+" / 9",20,c===9?"#8a5a10":__BK_INK,{ox:.5,st:"bold"});
const TI=[[3,L3("+5% de dano","+5% damage","+5% de daño")],[6,L3("+10% de dano e −10% de dano recebido","+10% damage and −10% damage taken","+10% de daño y −10% de daño recibido")],[9,L3("+15% de dano, −15% de dano recebido e 1 de vida a cada 8 s","+15% damage, −15% damage taken and 1 health every 8 s","+15% de daño, −15% de daño recibido y 1 de vida cada 8 s")]];
TI.forEach(([q,tx],k)=>{const y=100+k*34,ok=c>=q;B.T(R,RX+14,y,(ok?"✔ ":"◇ ")+q+" "+L3("relíquias","relics","reliquias"),9,ok?"#5a3a10":__BK_FAINT,{st:"bold"});B.T(R,RX+30,y+13,tx,7.5,ok?__BK_INK:__BK_FAINT)});
B.T(R,RX+14,212,L3("A bênção vale sempre, mesmo sem equipar.","The blessing always applies, even unequipped.","La bendición vale siempre, aun sin equipar."),7.5,__BK_FAINT,{st:"italic"});B.T(R,RX+14,226,L3("O efeito próprio de cada relíquia só vale equipada.","Each relic's own effect only works when equipped.","El efecto propio de cada reliquia solo vale equipada."),7.5,__BK_FAINT,{st:"italic"});
B.T(R,RX+14,252,L3("“Cada terra guarda um selo. Cada selo, um pedaço","“Each land keeps a seal. Each seal, a piece","“Cada tierra guarda un sello. Cada sello, un pedazo"),7.5,__BK_INK,{st:"italic"});B.T(R,RX+14,264,L3("de quem fechou as Profundezas pela primeira vez.”","of whoever first closed the Depths.”","de quien cerró las Profundidades por primera vez.”"),7.5,__BK_INK,{st:"italic"})}
