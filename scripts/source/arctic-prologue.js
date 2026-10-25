/* ── Prólogo do Rio da Floresta (antes da Floresta de Eldervale) ─────────────────────────────────────
   Depois do vídeo de abertura da campanha o herói chega de barco e desce um rio longo no meio da mata:
     1. remando (o herói não aparece, só o barco): lago enevoado → garganta com corredeira → ruínas da ponte
        dos Antigos → segundo lago com ilhota e vitórias-régias → rio até o píer. A correnteza leva o barco
        (mesmo sem remar ele desce devagar), a câmera antecipa o caminho e as falas ficam espaçadas no trajeto.
     2. no píer aparece "Desembarcar"; o herói desce e explora a clareira
     3. um barco naufragado na margem e uma estátua antiga contam um pouco da história
     4. a trilha entre as árvores leva à Floresta de Eldervale (fase normal)
   A Guardiã narra o caminho (voz em scripts/voice_extra_lines.json); as falas entram numa fila e nunca se
   cortam. Sons: correnteza, corredeira, água no casco, remadas, rangidos, vento na mata com rajadas que
   mexem as folhas e as árvores (assets/audio/ambient, scripts/build_river_audio.py).
   Botão "Pular prólogo" sempre visível.
   Mapa assado: assets/pixel-art/river-prologue (scripts/build_river_prologue.py), mesmo padrão do Bosque
   Amaldiçoado. Do pacote Arctic Viking só o barco (assets/pixel-art/arctic).                          */
/* a Guardiã reconhece a língua do herói e explica que a magia dela faz qualquer língua ser compreendida */
const __ARC_LANG={WARRIOR:["Você fala a língua da minha terra, Draven. Mas saiba: minha magia faz qualquer língua deste mundo ser compreendida.","You speak the tongue of my homeland, Draven. But know this: my magic lets any language in this world be understood.","Hablas la lengua de mi tierra, Draven. Pero debes saberlo: mi magia hace que cualquier lengua de este mundo se entienda."],
 BERSERKER:["Japonês… a língua das ilhas de fogo, Akihiro. Não se preocupe: minha magia faz qualquer língua ser compreendida. Você me entende, e todos vão entender você.","Japanese… the tongue of the fire islands, Akihiro. Don't worry: my magic lets any language be understood. You understand me, and everyone will understand you.","Japonés… la lengua de las islas de fuego, Akihiro. No te preocupes: mi magia hace que cualquier lengua se entienda. Tú me entiendes, y todos te entenderán."],
 ARCHER:["Japonês… você fala como o seu irmão, Hayato. Não se preocupe: minha magia faz qualquer língua ser compreendida. Você me entende, e todos vão entender você.","Japanese… you speak just like your brother, Hayato. Don't worry: my magic lets any language be understood. You understand me, and everyone will understand you.","Japonés… hablas igual que tu hermano, Hayato. No te preocupes: mi magia hace que cualquier lengua se entienda. Tú me entiendes, y todos te entenderán."],
 HUNTER:["Você fala como os caçadores do norte gelado, Kael. Aonde quer que vá, minha magia faz qualquer língua ser compreendida.","You speak like the hunters of the frozen north, Kael. Wherever you go, my magic lets any language be understood.","Hablas como los cazadores del norte helado, Kael. Vayas a donde vayas, mi magia hace que cualquier lengua se entienda."],
 DRUID:["Grego… a língua dos bosques sagrados, Tharion. Não tema: minha magia faz qualquer língua ser compreendida, por mim e por todos que você encontrar.","Greek… the tongue of the sacred groves, Tharion. Fear not: my magic lets any language be understood, by me and by everyone you meet.","Griego… la lengua de los bosques sagrados, Tharion. No temas: mi magia hace que cualquier lengua se entienda, por mí y por todos los que encuentres."],
 NECROMANCER:["Polonês… uma língua que até os mortos respeitam, Valthor. Minha magia faz qualquer língua ser compreendida. Fale, e todos vão entender.","Polish… a tongue even the dead respect, Valthor. My magic lets any language be understood. Speak, and everyone will understand.","Polaco… una lengua que hasta los muertos respetan, Valthor. Mi magia hace que cualquier lengua se entienda. Habla, y todos entenderán."],
 MAGE:["A língua das margens do Nilo, Arthelia. Não se preocupe: minha magia faz qualquer língua ser compreendida. Você me entende, e todos vão entender você.","The tongue of the banks of the Nile, Arthelia. Don't worry: my magic lets any language be understood. You understand me, and everyone will understand you.","La lengua de las orillas del Nilo, Arthelia. No te preocupes: mi magia hace que cualquier lengua se entienda. Tú me entiendes, y todos te entenderán."],
 ROGUE:["O francês das ilhas, Seris. Fale à vontade: minha magia faz qualquer língua ser compreendida, por quem quer que seja.","The French of the islands, Seris. Speak freely: my magic lets any language be understood, by anyone at all.","El francés de las islas, Seris. Habla con libertad: mi magia hace que cualquier lengua se entienda, por quien sea."],
 SHAMAN:["Nheengatu… a língua boa da mata, Araí. Minha magia leva as suas palavras a qualquer ouvido, e traz as minhas até você.","Nheengatu… the good tongue of the forest, Araí. My magic carries your words to any ear, and brings mine to you.","Ñeengatú… la buena lengua del bosque, Araí. Mi magia lleva tus palabras a cualquier oído, y trae las mías hasta ti."]};
function __arcLangLine(){const c=String(window.__heroCls||"WARRIOR").toUpperCase();return __ARC_LANG[c]||__ARC_LANG.WARRIOR}
function __arcLines(){const L=__L3;return[
 L("Desperte, viajante. O rio te trouxe mais longe do que qualquer barco deveria ir.","Wake, traveler. The river carried you farther than any boat should go.","Despierta, viajero. El río te trajo más lejos de lo que cualquier barco debería ir."),
 L("A floresta se lembra de quem cruzou antes de você. Siga a correnteza.","The forest remembers those who crossed before you. Follow the current.","El bosque recuerda a quienes cruzaron antes que tú. Sigue la corriente."),
 L("Estas águas já marcaram a fronteira dos Antigos. Poucos ousaram cruzá-la.","These waters once marked the border of the Ancients. Few dared to cross it.","Estas aguas marcaron la frontera de los Antiguos. Pocos se atrevieron a cruzarla."),
 L("Ali, a margem. Daqui em diante, você caminha.","There, the shore. From here on, you walk.","Allí, la orilla. De aquí en adelante, caminas."),
 L("Ouça a floresta. É a última voz sincera antes das Profundezas.","Listen to the forest. It is the last honest voice before the Depths.","Escucha el bosque. Es la última voz sincera antes de las Profundidades."),
 L("Outro barco, outro viajante. Nem todos chegaram até mim.","Another boat, another traveler. Not all of them reached me.","Otro barco, otro viajero. No todos llegaron hasta mí."),
 L("Esta estátua assistiu à primeira selagem. Logo você vai entender o que ela guardava.","This statue watched the first sealing. Soon you will understand what it guarded.","Esta estatua presenció el primer sellado. Pronto entenderás lo que guardaba."),
 L("Além das árvores fica o Coração da Floresta. Estou esperando por você lá.","Beyond the trees lies the Heart of the Forest. I am waiting for you there.","Más allá de los árboles está el Corazón del Bosque. Te espero allí."),
 L("Sinta o vento. Ele carrega os sussurros de quem se perdeu nestas águas.","Feel the wind. It carries the whispers of those who were lost in these waters.","Siente el viento. Lleva los susurros de quienes se perdieron en estas aguas."),
 L("Esta ponte uniu dois reinos, até a escuridão rachar suas pedras.","This bridge once joined two kingdoms, until the darkness cracked its stones.","Este puente unió dos reinos, hasta que la oscuridad agrietó sus piedras."),
 L("Os vaga-lumes guiam quem ainda tem esperança. Deixe que te levem até a margem.","The fireflies guide those who still have hope. Let them lead you to the shore.","Las luciérnagas guían a quien aún tiene esperanza. Deja que te lleven a la orilla."),
 L("A vida ainda resiste nesta mata. Ande devagar… os animais daqui ainda não conhecem o medo das Profundezas.","Life still endures in these woods. Walk slowly… the animals here have not yet learned to fear the Depths.","La vida aún resiste en este bosque. Camina despacio… los animales de aquí aún no conocen el miedo a las Profundidades."),
 L("Este lago reflete o céu de antes das Profundezas. Guarde esta imagem quando a escuridão chegar.","This lake reflects the sky from before the Depths. Keep this image with you when the darkness comes.","Este lago refleja el cielo de antes de las Profundidades. Guarda esta imagen cuando llegue la oscuridad."),
 L("Estas pedras foram um posto dos guardiões do selo. Eu conheci cada um deles… há muito tempo.","These stones were an outpost of the seal's guardians. I knew every one of them… long ago.","Estas piedras fueron un puesto de los guardianes del sello. Conocí a cada uno de ellos… hace mucho tiempo."),
 L("As aves se calaram de repente. Mesmo aqui, sinto olhos nos observando. Siga a trilha para o leste.","The birds suddenly went quiet. Even here, I feel eyes watching us. Follow the trail east.","Las aves se callaron de repente. Incluso aquí, siento ojos que nos observan. Sigue el sendero hacia el este."),
 L(...__arcLangLine())]}
const __ARC_EXPR=["calm","talk","sadness","talk","special","sadness","calm","smile","calm","sadness","smile","smile","calm","sadness","aggression","smile"];
/* o herói ainda não sabe quem é a voz: responde depois de algumas falas */
function __arcHero(i){const L=__L3;return({0:L("Quem… quem está falando comigo?","Who… who is speaking to me?","¿Quién… quién me está hablando?"),
 1:L("Essa voz… parece vir de todos os lados.","That voice… it seems to come from everywhere.","Esa voz… parece venir de todas partes."),
 9:L("Como você sabe tudo isso? Quem é você?","How do you know all this? Who are you?","¿Cómo sabes todo eso? ¿Quién eres?"),
 4:L("Mostre-se! Por que não aparece?","Show yourself! Why won't you appear?","¡Muéstrate! ¿Por qué no apareces?"),
 7:L("Coração da Floresta… então é lá que vou descobrir quem é essa voz.","The Heart of the Forest… so that's where I'll find out whose voice this is.","El Corazón del Bosque… entonces allí descubriré de quién es esta voz."),
 12:L("Faz tanto tempo que não vejo uma água tão limpa…","It's been so long since I've seen water this clear…","Hace tanto que no veo un agua tan limpia…"),
 13:L("Guardiões do selo… e você era um deles? Quem é você, afinal?","Guardians of the seal… and you were one of them? Who are you, really?","Guardianes del sello… ¿y tú eras una de ellos? ¿Quién eres, en realidad?"),
 14:L("Eu também sinto… como se algo me vigiasse entre as árvores.","I feel it too… as if something were watching me from the trees.","Yo también lo siento… como si algo me vigilara entre los árboles.")})[i]??null}
/* comentários do herói sobre os animais */
function __arcHeroEv(k){const L=__L3;return({flee:L("Calma, pequeno… não vou te machucar.","Easy, little one… I won't hurt you.","Tranquilo, pequeño… no te haré daño."),
 back:L("Voltaram… só que em outro canto. Espertos.","They came back… just somewhere else. Clever.","Volvieron… solo que en otro rincón. Listos."),
 birds:L("Até os pássaros fogem… preciso aprender a andar mais leve.","Even the birds fly off… I need to learn to step lighter.","Hasta los pájaros huyen… tengo que aprender a pisar más suave."),
 duck:L("Patos! Faz tempo que não vejo um lago cheio de vida.","Ducks! It's been ages since I saw a lake so full of life.","¡Patos! Hace tiempo que no veía un lago tan lleno de vida.")})[k]}
/* animais: espécies (folha rp-animals, poses D/U/S; S olha para a esquerda) */
const __RPAN={sheep:{n:4,zones:["m1"],walk:16,flee:62,fleeR:115,kind:"ground",sc:1.05,idle:"Idle",move:"Walk",herd:1},
 rabbit:{n:7,zones:["m1","m2","g1"],walk:26,flee:125,fleeR:120,kind:"ground",sc:.95,idle:"Idle",move:"Walk"},
 frog:{n:3,zones:["bank"],walk:10,flee:55,fleeR:70,kind:"frog",sc:.95,idle:"Idle",move:"Walk"},
 worm:{n:3,zones:["m1","m2"],walk:4,flee:0,fleeR:42,kind:"worm",sc:.8,idle:"Walk",move:"Walk"},
 sparrow:{n:7,zones:["m1","m2"],walk:14,flee:150,fleeR:105,kind:"bird",sc:.9,idle:"Idle",move:"Idle",fly:"Fly",flock:1},
 crow:{n:3,zones:["g1","m2"],walk:12,flee:140,fleeR:135,kind:"bird",sc:1,idle:"Idle",move:"Idle",fly:"Fly",flock:1},
 duck:{n:3,zones:["pond"],walk:9,flee:120,fleeR:105,kind:"duck",sc:1,idle:"Idle",move:"Idle",fly:"Fly"},
 fish:{n:4,zones:["pond"],walk:14,flee:80,fleeR:60,kind:"fish",sc:.9,idle:"Swim",move:"Swim"},
 /* família de cervos da Clareira dos Cervos (folha própria: scripts/build_rp_deer.py) */
 deer:{n:1,zones:["g1"],walk:13,flee:150,fleeR:150,kind:"ground",sc:1,idle:"Idle",move:"Walk",run:"Run",herd:1,grp:"deer",tex:"rp-deer",oy:.667,pad:30,shw:18},
 doe:{n:2,zones:["g1"],walk:13,flee:150,fleeR:150,kind:"ground",sc:.96,idle:"Idle",move:"Walk",run:"Run",herd:1,grp:"deer",tex:"rp-deer",oy:.667,pad:30,shw:17},
 fawn:{n:1,zones:["g1"],walk:15,flee:160,fleeR:150,kind:"ground",sc:1,idle:"Idle",move:"Walk",run:"Run",herd:1,grp:"deer",tex:"rp-deer",oy:.667,pad:30,shw:13}};
const __RPA=["river-flow","river-rapids","river-wind","boat-glide","boat-sfx"];
const __RPZL={m1:11,bank:12,g1:13,m2:14};
/* títulos de região (aparecem grandes no alto da tela ao chegar em cada lugar) */
const __RPREG={lagoA:["Lago das Brumas","Lake of Mists","Lago de las Brumas"],gorge:["Garganta dos Sussurros","Gorge of Whispers","Garganta de los Susurros"],
 bridge:["Ponte dos Dois Reinos","Bridge of Two Kingdoms","Puente de los Dos Reinos"],lakeB:["Lago Espelhado","Mirror Lake","Lago Espejo"],
 dock:["Clareira do Desembarque","Landing Glade","Claro del Desembarco"],m1:["Prado das Flores","Flower Meadow","Prado de las Flores"],
 g1:["Clareira dos Cervos","Glade of the Deer","Claro de los Ciervos"],pond:["Lagoa dos Juncos","Reed Pond","Laguna de los Juncos"],
 m2:["Recanto dos Vaga-lumes","Firefly Hollow","Rincón de las Luciérnagas"]};
const __RPLAKEB=[1650,560,330];

class __ArcticPrologue extends j.Scene{constructor(){super("ArcticPrologue")}
init(d){this.next=d?.next??{key:"Game",data:{levelId:"forest"}};this.classId=d?.classId??this.next.data?.classId??"WARRIOR";this.leaving=!1}
preload(){this.textures.exists("arc-boat-red")||this.load.image("arc-boat-red","assets/pixel-art/arctic/arc-boat-red.png");this.textures.exists("arc-boat-teal")||this.load.image("arc-boat-teal","assets/pixel-art/arctic/arc-boat-teal.png");
 this.textures.exists("rf-props")||this.load.atlas("rf-props","assets/pixel-art/ruins-forest/rf-props.png","assets/pixel-art/ruins-forest/rf-props.json");
 this.textures.exists("fr-bridge")||this.load.image("fr-bridge","assets/pixel-art/forest-open/fr-bridge.png");
 this.textures.exists("rp2-props")||this.load.atlas("rp2-props","assets/pixel-art/river-prologue/rp2-props.png","assets/pixel-art/river-prologue/rp2-props.json");
 this.textures.exists("rp-animals")||this.load.spritesheet("rp-animals","assets/pixel-art/river-prologue/rp-animals.png",{frameWidth:48,frameHeight:48});
 this.cache.json.exists("rp-animals-meta")||this.load.json("rp-animals-meta","assets/pixel-art/river-prologue/rp-animals.json");
 this.textures.exists("rp-deer")||this.load.spritesheet("rp-deer","assets/pixel-art/river-prologue/rp-deer.png",{frameWidth:48,frameHeight:48});
 this.cache.json.exists("rp-deer-meta")||this.load.json("rp-deer-meta","assets/pixel-art/river-prologue/rp-deer.json");
 const more=M=>{for(const[k]of M.chunks)this.textures.exists(k)||this.load.image(k,`assets/pixel-art/river-prologue/${k}.png`);
  for(const[k]of M.deco||[])if(!/^(rf|n)-/.test(k)&&!this.textures.exists("rpx-"+k))this.load.image("rpx-"+k,k==="rp-pillar"?"assets/pixel-art/river-prologue/rp-pillar.png":`assets/pixel-art/props-extra/${k}.png`)};
 this.cache.json.exists("rp-meta")||this.load.json("rp-meta","assets/pixel-art/river-prologue/rp-meta.json");
 this.load.once("filecomplete-json-rp-meta",()=>more(this.cache.json.get("rp-meta")));
 if(this.cache.json.exists("rp-meta"))more(this.cache.json.get("rp-meta"))}
create(){const S=this,M=S.cache.json.get("rp-meta"),R=Math.random,L3=__L3;window.__heroCls=String(S.classId||"WARRIOR").toUpperCase();S.M=M;S.W=M.w;S.H=M.h;le(S);const cam=S.cameras.main;cam.setBounds(0,0,S.W,S.H).setBackgroundColor(0x0d1a12);
 S.uiCam=S.cameras.add(0,0,cam.width,cam.height);S.uiCam.setZoom(cam.zoom).centerOn(_/2,st/2);S.ui=S.add.container(0,0).setDepth(5e3);cam.ignore(S.ui);
 const w=o=>(S.uiCam.ignore(o),o);S.w=w;
 const raw=atob(M.grid);S.grid=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)S.grid[i]=raw.charCodeAt(i);
 for(const[k,x,y]of M.chunks)w(S.add.image(x,y,k).setOrigin(0).setDepth(0));
 /* trajeto do rio: correnteza e roteiro da narração */
 S.P=M.path||[];S.flow=M.flow||[];S.pi=0;S.prog=0;S.cues=Object.entries(M.cues||{}).map(([k,v])=>[+k,v]).sort((a,b)=>a[1]-b[1]);
 S.gorge=S.P.filter((p,i)=>(S.flow[i]||0)>50);
 /* água viva: brilho que desliza e fios de correnteza que descem o rio */
 for(let k=0;k<130;k++){const p=S.freeCell(2);if(!p)break;const gl=w(S.add.ellipse(p.x,p.y,6+R()*10,1.4,0xcfeee4,0).setDepth(.6));S.tweens.add({targets:gl,alpha:{from:0,to:.45},x:"+=14",duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*3e3})}
 S.streaks=[];for(let k=0;k<44;k++){const e=w(S.add.ellipse(-99,-99,14+R()*16,1.3,0xe4fff6,0).setDepth(.7));e.life=0;e.max=1;S.streaks.push(e)}
 /* árvores e moitas da borda, com profundidade (balançam com o vento) */
 S.lobs=[];S.sway=[];for(const[k,x,y]of M.props){const at=k.startsWith("n-")?"rp2-props":"rf-props";if(!S.textures.get(at).has(k))continue;const im=w(S.add.image(x,y,at,k).setOrigin(.5,1).setDepth(y));R()<.5&&im.setFlipX(!0);im.ph=R()*6.28;im.amp=/Bush/.test(k)?.6:1;S.sway.push(im);S.lobs.push({x,y:y-6,r:/Bush/.test(k)?10:13})}
 /* ruínas da ponte, pedras da corredeira, troncos caídos */
 for(const[k,x,y,sc,fl]of M.deco||[]){const nn=k.startsWith("n-"),rf=nn||/^rf-/.test(k),key=nn?"rp2-props":rf?"rf-props":"rpx-"+k;if(rf?!S.textures.get(key).has(k):!S.textures.exists(key))continue;const im=w((rf?S.add.image(x,y,key,k):S.add.image(x,y,key)).setOrigin(.5,1).setScale(sc).setFlipX(!!fl).setDepth(y));
  /^dx-rock/.test(k)&&im.setTint(0xa9b4a2);/^dx-ruin/.test(k)&&im.setTint(0xb8b8a8);
  if(k==="rp-pillar"||/^dx-rock/.test(k)){const ring=w(S.add.ellipse(x,y-4,im.displayWidth*.9,7,0xe6fff4,0).setStrokeStyle(1,0xe6fff4,.5).setDepth(.8));S.tweens.add({targets:ring,scaleX:1.25,scaleY:1.3,alpha:{from:.9,to:0},duration:1500,repeat:-1,delay:R()*1500})}
  if(nn){/Ruin/.test(k)?S.lobs.push({x,y:y-10,r:Math.max(14,im.displayWidth*.28)}):/stone/.test(k)&&S.lobs.push({x,y:y-6,r:11});/reeds/.test(k)&&(im.ph=R()*6.28,im.amp=1.6,S.sway.push(im));continue}
  !rf||/Broken/.test(k)?0:S.lobs.push({x,y:y-6,r:18})}
 S.wobs=(M.wobs||[]).map(([x,y,r])=>({x,y,r}));
 /* píer de madeira: do chão da clareira até o remanso */
 const D=M.dock,Lp=M.land;S.dock={x:D[0],y:D[1]};for(let y=Lp[1]-6;y<=D[1]+10;y+=14)w(S.add.image(D[0],y,"fr-bridge").setScale(.7,.5).setDepth(1.5));
 for(const dx of[-11,11])for(const y of[Lp[1]+16,D[1]+8])w(S.add.rectangle(D[0]+dx,y,4,10,0x4a3424).setDepth(1.6));
 /* naufrágio e estátua */
 S.poi=[];const Wr=M.wreck,St=M.statue;w(S.add.image(Wr[0],Wr[1],"arc-boat-teal").setScale(.42).setRotation(1.9).setTint(0x6b6a5c).setAlpha(.92).setDepth(Wr[1]));S.lobs.push({x:Wr[0],y:Wr[1],r:22});
 S.poi.push({x:Wr[0],y:Wr[1]-18,line:5,label:L3("Examinar o barco naufragado","Examine the wrecked boat","Examinar el barco naufragado")});
 w(S.add.image(St[0],St[1],"rf-props","rf-Ruin_grass4").setOrigin(.5,1).setDepth(St[1]));S.lobs.push({x:St[0],y:St[1]-6,r:18});const sg=w(S.add.image(St[0],St[1]-40,"light").setScale(.4).setBlendMode(j.BlendModes.ADD).setTint(0x9fe8a8).setAlpha(.3).setDepth(St[1]+1));S.tweens.add({targets:sg,alpha:.12,duration:1300,yoyo:!0,repeat:-1});
 S.poi.push({x:St[0],y:St[1]+14,line:6,label:L3("Examinar a estátua antiga","Examine the ancient statue","Examinar la estatua antigua")});
 /* saída: luz entre as árvores */
 const E=M.exit,ex=w(S.add.image(E[0],E[1]+10,"light").setScale(.7).setBlendMode(j.BlendModes.ADD).setTint(0xfff1c4).setAlpha(.3).setDepth(2));S.tweens.add({targets:ex,alpha:.14,duration:1400,yoyo:!0,repeat:-1});
 /* névoa sobre os lagos e feixes de luz entre as copas */
 for(const[mx,my,rx,ry]of M.mist||[])for(let k=0;k<7;k++){const m=w(S.add.ellipse(mx+(R()-.5)*rx,my+(R()-.5)*ry,rx*(.5+R()*.5),ry*(.35+R()*.3),0xdfeee8,0).setDepth(3900));S.tweens.add({targets:m,alpha:{from:.02,to:.09},x:"+="+(30+R()*50),duration:6e3+R()*5e3,yoyo:!0,repeat:-1,delay:R()*4e3})}
 for(let k=0;k<16;k++){const x=R()*S.W,y=R()*S.H,ray=w(S.add.image(x,y,"light").setScale(.9,5).setRotation(.55).setBlendMode(j.BlendModes.ADD).setTint(0xfff3c8).setAlpha(0).setDepth(3950));S.tweens.add({targets:ray,alpha:{from:0,to:.07},duration:4e3+R()*3e3,yoyo:!0,repeat:-1,delay:R()*5e3})}
 /* barco */
 S.mode="boat";const P0=M.start;S.boat=w(S.add.image(P0[0],P0[1],"arc-boat-red").setScale(.5).setDepth(P0[1]));S.bv={x:0,y:0};S.wakeT=0;S.bt=0;
 const p1=S.P[3]||[P0[0]+10,P0[1]-10];S.bang=Math.atan2(p1[1]-P0[1],p1[0]-P0[0]);
 /* herói (aparece ao desembarcar) */
 const cls=String(S.classId||"WARRIOR").toLowerCase(),key=[`mk4b-${cls}-t0`,`mk4b-${cls}`].find(k=>S.textures.exists(k));S.lay=S.cache.json.get(`mk4b-${cls}-layout`);S.hkey=key;
 S.hero=key?w(S.add.sprite(0,0,key,0).setScale(S.lay?.scale??.67).setOrigin(.5,(S.lay?.footY??(S.lay?.frameH??128)-8)/(S.lay?.frameH??128)).setVisible(!1)):null;S.hsh=w(S.add.ellipse(0,0,22,7,0,.3).setVisible(!1).setDepth(1.7));
 cam.startFollow(S.boat,!0,.05,.05);S.look={x:0,y:0};cam.centerOn(P0[0],P0[1]);
 /* folhas caindo (o vento empurra) e vaga-lumes */
 S.leaves=[];for(let k=0;k<48;k++){const f=w(S.add.rectangle(R()*S.W,R()*S.H,3,2,[0x9cc46a,0xc9b25a,0x6f9a4a][k%3],.85).setDepth(4e3));f.vx=10+R()*14;f.vy=14+R()*16;f.ph=R()*6;S.leaves.push(f)}
 for(let k=0;k<70;k++){const p=S.freeCell(R()<.5?1:2);if(!p)continue;const ff=w(S.add.image(p.x,p.y,"light").setScale(.05).setBlendMode(j.BlendModes.ADD).setTint(0xd8ff9a).setAlpha(0).setDepth(3e3));S.tweens.add({targets:ff,alpha:{from:0,to:.8},x:"+="+(R()*30-15),y:"-="+(R()*20),duration:1500+R()*1500,yoyo:!0,repeat:-1,delay:R()*3e3})}
 try{window.__dubPrefetch?.(__arcLines())}catch(e){}
 S.buildUI();S.lineDone=new Set;S.queue=[];S.lineTok=0;S.heroDone=new Set;S.time.delayedCall(1600,()=>S.say(0));
 S.initAnimals();S.initLife();
 try{S.game.audioEngine?.music?.("forest")}catch(e){}
 S.gust=.4;S.windEnv=null;fetch("assets/audio/ambient/river-wind.json").then(r=>r.json()).then(j_=>{S.windEnv=j_}).catch(()=>{});
 S.audioInit();S.events.once("shutdown",()=>S.audioStop());
 S.input.keyboard?.on("keydown-ESC",()=>S.togglePause());S.input.keyboard?.on("keydown-P",()=>S.togglePause());S.keyE=S.input.keyboard?.addKey?.("E");
 cam.fadeIn(1200,0,0,0)}
/* ── sons ── */
audioInit(){const S=this,E=S.game.audioEngine;S.au={};const go=()=>{if(!S.sys?.isActive?.()||S.leaving)return;if(!E?.ctx||!E.ambientBus){S.time.delayedCall(600,go);return}const C=E.ctx,ogg=(new Audio).canPlayType("audio/ogg; codecs=vorbis")?"ogg":"mp3";window.__rpBuf=window.__rpBuf||{};
  fetch("assets/audio/ambient/boat-sfx.json").then(r=>r.json()).then(j_=>{S.sfxMap=j_}).catch(()=>{});
  for(const n of __RPA){const use=b=>{if(!S.sys?.isActive?.()||S.leaving)return;if(n==="boat-sfx"){S.sfxBuf=b;return}const src=C.createBufferSource();src.buffer=b;src.loop=!0;const g=C.createGain();g.gain.value=0;src.connect(g);g.connect(E.ambientBus);src.start(0,Math.random()*b.duration);S.au[n]={src,g}};
   if(window.__rpBuf[n]){use(window.__rpBuf[n]);continue}fetch(`assets/audio/ambient/${n}.${ogg}`).then(r=>r.arrayBuffer()).then(b=>C.decodeAudioData(b)).then(b=>{window.__rpBuf[n]=b;use(b)}).catch(()=>{})}};S.time.delayedCall(200,go)}
gain(n,v,tc=.35){const a=this.au?.[n],C=this.game.audioEngine?.ctx;if(!a||!C)return;a.g.gain.setTargetAtTime(Math.max(0,v),C.currentTime,tc)}
sfx(kind,vol=1,pan=0){const S=this,E=S.game.audioEngine,C=E?.ctx,L=S.sfxMap?.[kind];if(!C||!S.sfxBuf||!L||!L.length)return;const[o,d]=L[Math.floor(Math.random()*L.length)];try{const src=C.createBufferSource();src.buffer=S.sfxBuf;src.playbackRate.value=.92+Math.random()*.16;const g=C.createGain();g.gain.value=vol;let out=g;if(C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}src.connect(g);out.connect(E.sfxBus||E.ambientBus);src.start(0,o,d)}catch(e){}}
audioStop(){const S=this,C=S.game.audioEngine?.ctx;for(const n in S.au||{}){const a=S.au[n];try{a.g.gain.setTargetAtTime(0,C.currentTime,.25);setTimeout(()=>{try{a.src.stop();a.src.disconnect()}catch(e){}},1200)}catch(e){}}S.au={}}
cell(x,y){const M=this.M,i=Math.floor(x/M.cell),j_=Math.floor(y/M.cell);if(i<0||j_<0||i>=M.gw||j_>=M.gh)return 0;return this.grid[j_*M.gw+i]}
freeCell(v){for(let t=0;t<60;t++){const x=Math.random()*this.W,y=Math.random()*this.H;if(this.cell(x,y)===v&&this.cell(x+10,y)===v&&this.cell(x-10,y)===v)return{x,y}}return null}
okArea(x,y,v,r){return this.cell(x,y)===v&&this.cell(x+r,y)===v&&this.cell(x-r,y)===v&&this.cell(x,y+r)===v&&this.cell(x,y-r)===v}
/* ponto do trajeto mais perto (busca local a partir do último) */
near(x,y,from){const P=this.P;if(!P.length)return-1;let b=-1,bd=1e18;const a0=from==null?0:Math.max(0,from-14),a1=from==null?P.length:Math.min(P.length,from+15);for(let i=a0;i<a1;i++){const d=(P[i][0]-x)**2+(P[i][1]-y)**2;if(d<bd){bd=d;b=i}}return b}
tan(i){const P=this.P,a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1;return{x:dx/m,y:dy/m}}
buildUI(){const S=this,L3=__L3,U=S.ui,F="Georgia, 'Times New Roman', serif";
 const px=_/2,py=st-48;S.nar=S.add.container(px,py).setAlpha(0);const bg=S.add.graphics();bg.fillStyle(0x0b0f16,.82).fillRoundedRect(-250,-30,500,60,8).lineStyle(1,0xc9a24a,.7).strokeRoundedRect(-250,-30,500,60,8);
 S.por=S.add.image(-222,28,"guardia-p-talk").setOrigin(.5,1).setScale(.5);S.narName=S.add.text(-182,-24,typeof __GN!=="undefined"?__GN:"A GUARDIÃ",{fontFamily:F,fontStyle:"bold",fontSize:"10px",color:"#f2d9a0"});
 S.narTx=S.add.text(-182,-10,"",{fontFamily:F,fontSize:"10px",color:"#ece2cc",wordWrap:{width:420},lineSpacing:2});S.nar.add([bg,S.por,S.narName,S.narTx]);U.add(S.nar);
 S.act=S.add.container(_-92,st-118).setVisible(!1);const ab=S.add.graphics();ab.fillStyle(0x1d2a20,.9).fillRoundedRect(-80,-15,160,30,8).lineStyle(1.5,0x8ae08a,.9).strokeRoundedRect(-80,-15,160,30,8);S.actTx=S.add.text(0,0,"",{fontFamily:F,fontStyle:"bold",fontSize:"10px",color:"#e8ffe0"}).setOrigin(.5);S.act.add([ab,S.actTx]);
 const az=S.add.zone(0,0,160,30).setInteractive({useHandCursor:!0});az.on("pointerdown",()=>{S.uiTap=!0;S.doAct()});S.act.add(az);U.add(S.act);
 const btn=(x,y,t,ox,fn)=>{const b=S.add.text(x,y,t,{fontFamily:"'Courier New', monospace",fontStyle:"bold",fontSize:"9px",color:"#e8dcb0",backgroundColor:"#1a120cdd",padding:{x:7,y:5}}).setOrigin(ox,0).setInteractive({useHandCursor:!0});b.on("pointerdown",()=>{S.uiTap=!0;fn()});U.add(b);return b};
 S.startBtn=btn(_-10,10,"❚❚ START",1,()=>S.togglePause());
 S.skipBtn=btn(_/2+250,st-102,L3("PULAR DIÁLOGO ▸","SKIP DIALOGUE ▸","SALTAR DIÁLOGO ▸"),1,()=>S.skipLine()).setVisible(!1);
 /* menu de pausa */
 const PZ=S.add.container(0,0).setVisible(!1);const dim=S.add.rectangle(_/2,st/2,_*1.4,st*1.4,0x05070a,.72).setInteractive();const pb=S.add.graphics();pb.fillStyle(0x0f141c,.95).fillRoundedRect(_/2-120,st/2-78,240,156,10).lineStyle(1.5,0xc9a24a,.85).strokeRoundedRect(_/2-120,st/2-78,240,156,10);
 PZ.add([dim,pb,S.add.text(_/2,st/2-56,L3("PAUSA","PAUSED","PAUSA"),{fontFamily:F,fontStyle:"bold",fontSize:"16px",color:"#f2d9a0",letterSpacing:4}).setOrigin(.5)]);
 const pbtn=(y,t,fn)=>{const b=S.add.text(_/2,y,t,{fontFamily:F,fontStyle:"bold",fontSize:"12px",color:"#ece2cc",backgroundColor:"#2a2116",padding:{x:14,y:6}}).setOrigin(.5).setInteractive({useHandCursor:!0});b.on("pointerover",()=>b.setColor("#ffd24a"));b.on("pointerout",()=>b.setColor("#ece2cc"));b.on("pointerdown",()=>{S.uiTap=!0;fn()});PZ.add(b);return b};
 pbtn(st/2-14,L3("CONTINUAR","RESUME","CONTINUAR"),()=>S.togglePause(!1));pbtn(st/2+26,L3("VOLTAR AO MENU","BACK TO MENU","VOLVER AL MENÚ"),()=>{S.togglePause(!1);S.leaving=!0;try{window.__dubStop?.()}catch(e){}S.audioStop();S.scene.start("MainMenu")});
 PZ.setDepth(9e3);U.add(PZ);S.pz=PZ;
 S.joy={on:!1,ox:0,oy:0,x:0,y:0,id:null};const jb=S.add.circle(0,0,26,0xffffff,.12).setStrokeStyle(2,0xffffff,.35).setVisible(!1),jt=S.add.circle(0,0,11,0xffffff,.35).setVisible(!1);U.add([jb,jt]);
 const toUI=p=>({x:(p.x-S.uiCam.width/2)/S.uiCam.zoom+_/2,y:(p.y-S.uiCam.height/2)/S.uiCam.zoom+st/2});
 S.input.on("pointerdown",p=>{if(S.uiTap){S.uiTap=!1;return}const q=toUI(p);S.joy={on:!0,ox:q.x,oy:q.y,x:0,y:0,id:p.id};jb.setPosition(q.x,q.y).setVisible(!0);jt.setPosition(q.x,q.y).setVisible(!0)});
 S.input.on("pointermove",p=>{if(!S.joy.on||p.id!==S.joy.id)return;const q=toUI(p);let dx=q.x-S.joy.ox,dy=q.y-S.joy.oy;const m=Math.hypot(dx,dy);if(m>26){dx*=26/m;dy*=26/m}S.joy.x=dx/26;S.joy.y=dy/26;jt.setPosition(S.joy.ox+dx,S.joy.oy+dy)});
 const up=p=>{if(p.id!==S.joy.id)return;S.joy.on=!1;S.joy.x=S.joy.y=0;jb.setVisible(!1);jt.setVisible(!1)};S.input.on("pointerup",up);S.input.on("pointerupoutside",up)}
/* narração: UMA fila para a Guardiã (número da fala) e o herói (texto) — nada fala por cima de nada */
say(i){const S=this;if(S.lineDone.has(i))return;S.lineDone.add(i);S.queue.push(i);S.speaking||S.nextLine()}
hsay(key,t){const S=this;if(!t||S.heroDone.has(key))return;S.heroDone.add(key);S.queue.push(t);S.speaking||S.nextLine()}
nextLine(){const S=this,tok=++S.lineTok;S.typer?.remove();if(!S.queue.length){S.speaking=!1;S.skipBtn?.setVisible(!1);S.tweens.add({targets:S.nar,alpha:0,duration:600});return}S.speaking=!0;S.skipBtn?.setVisible(!0);const it=S.queue.shift();
 if(typeof it==="string"){const fadeMs=S.nar.alpha>.05?300:0;S.tweens.add({targets:S.nar,alpha:0,duration:Math.max(1,fadeMs-40)});const vd=(window.__dubDur?.(it)||0)*1e3,d=Math.max(2600,it.length*48,vd+500);
  S.time.delayedCall(fadeMs,()=>{if(tok!==S.lineTok)return;S.heroSay(it,d);let fin=!1;const nx=()=>{if(fin||tok!==S.lineTok||!S.sys.isActive())return;fin=!0;S.nextLine()};
   try{vd&&window.__dub?.(it,ok=>ok&&S.time.delayedCall(450,nx))}catch(e){}S.time.delayedCall(d+700,nx)});return}
 const i=it,t=__arcLines()[i],ex=__ARC_EXPR[i]||"talk";
 S.textures.exists("guardia-p-"+ex)&&S.por.setTexture("guardia-p-"+ex);S.narTx.setText("");S.tweens.add({targets:S.nar,alpha:1,duration:300});let n=0;
 i===8&&(S.gustBoost=1);
 let fin=!1;const done=ok=>{if(fin||tok!==S.lineTok)return;fin=!0;const hl=__arcHero(i);hl&&!S.heroDone.has("g"+i)&&(S.heroDone.add("g"+i),S.queue.unshift(hl));i===0&&!S.lineDone.has(15)&&(S.lineDone.add(15),S.queue.splice(hl?1:0,0,15));S.time.delayedCall(ok?900:Math.max(3e3,t.length*60),()=>tok===S.lineTok&&S.sys.isActive()&&S.nextLine())};
 try{window.__dub?window.__dub(t,done):done(!1)}catch(e){done(!1)}
 /* o texto acompanha a voz (começa quando ela começa e termina junto) */
 S.typer=S.time.addEvent({delay:24,loop:!0,callback:()=>{if(tok!==S.lineTok){S.typer?.remove();return}n=window.__dubType?window.__dubType(t,n,1):Math.min(t.length,n+1);S.narTx.setText(t.slice(0,n));n>=t.length&&S.typer.remove()}})}
skipLine(){const S=this;if(!S.speaking||S.pauseOn)return;try{window.__dubStop?.()}catch(e){}S.typer?.remove();if(S.hbox){S.hbox.destroy();S.hbox=null}
 const cur=S.narTx.text;S.lineTok++;/* a resposta do herói à fala pulada continua na fila */S.nextLine()}
togglePause(on){const S=this;on=on??!S.pauseOn;if(on===!!S.pauseOn||S.leaving)return;S.pauseOn=on;S.pz.setVisible(on);const C=S.game.audioEngine?.ctx;
 if(on){S.tweens.pauseAll();S.time.paused=!0;S.anims.pauseAll();try{C&&C.state==="running"&&C.suspend()}catch(e){}S.joy.on=!1}
 else{S.tweens.resumeAll();S.time.paused=!1;S.anims.resumeAll();try{C&&C.state==="suspended"&&C.resume()}catch(e){}}}
heroSay(t,dur=2800){const S=this,tgt=()=>S.mode==="boat"?S.boat:S.hero;if(!tgt())return;S.hbox?.destroy?.();const tx=S.add.text(0,0,t,{fontFamily:"Georgia, 'Times New Roman', serif",fontStyle:"italic",fontSize:"12px",color:"#1d2433",align:"center",wordWrap:{width:190}}).setOrigin(.5),w=tx.width+18,h=tx.height+10,bg=S.add.graphics();
 bg.fillStyle(15660798,.94).lineStyle(1.5,4877680,.9).fillRoundedRect(-w/2,-h/2,w,h,7).strokeRoundedRect(-w/2,-h/2,w,h,7).fillStyle(15660798,.94).fillTriangle(-6,h/2-1,6,h/2-1,0,h/2+7);
 const box=S.w(S.add.container(0,0,[bg,tx]).setDepth(4600).setAlpha(0).setScale(.85));S.hbox=box;const fol=()=>{const o=tgt();o&&box.active&&box.setPosition(o.x,o.y-(S.mode==="boat"?48:70)-h/2)};fol();S.events.on("update",fol);box.once("destroy",()=>S.events.off("update",fol));
 S.tweens.add({targets:box,alpha:1,scale:1,duration:220,ease:"Back.easeOut"});S.time.delayedCall(dur,()=>box.active&&S.tweens.add({targets:box,alpha:0,duration:300,onComplete:()=>{box.destroy();S.hbox===box&&(S.hbox=null)}}))}
/* ── animais: vivem nas clareiras e no lago; fogem quando o herói chega perto e, quando tudo fica quieto,
   voltam — mas em outro lugar (o coelho sai da mata, o pardal pousa em outro canto, o pato volta voando) ── */
zonePt(z,kind,near,avoid,minD=0,pad=10){const S=this,Z=S.M.zones?.[z];if(!Z)return null;const wat=kind==="duck"||kind==="fish";
 for(let k=0;k<60;k++){let x,y;if(near){const a=Math.random()*6.283,r=Math.random()*(near.r||45);x=near.x+Math.cos(a)*r;y=near.y+Math.sin(a)*r}else{const a=Math.random()*6.283,r=Math.sqrt(Math.random());x=Z[0]+Math.cos(a)*Z[2]*r;y=Z[1]+Math.sin(a)*Z[3]*r}
  if(((x-Z[0])/Z[2])**2+((y-Z[1])/Z[3])**2>1)continue;if(wat?!S.okArea(x,y,2,wat&&kind==="duck"?10:6):!S.okArea(x,y,1,5))continue;
  if(avoid&&Math.hypot(x-avoid.x,y-avoid.y)<minD)continue;if(!wat&&S.lobs.some(q=>Math.hypot(x-q.x,y-q.y)<q.r+pad))continue;return{x,y}}return null}
initAnimals(){const S=this,M=S.M,AM=Object.assign({},S.cache.json.get("rp-animals-meta")||{},S.textures.exists("rp-deer")&&S.cache.json.get("rp-deer-meta")||{}),R=Math.random;S.animals=[];S.heroSeenFlee=!1;if(!AM.sheep||!S.textures.exists("rp-animals")||!M.zones)return;S.AM=AM;
 const rate={Idle:4,Walk:8,Fly:12,Swim:6,Run:11};for(const[sp,P]of Object.entries(AM))for(const[pose,fr]of Object.entries(P)){const k=`rpa-${sp}-${pose}`,tx=__RPAN[sp]?.tex||"rp-animals";S.anims.exists(k)||S.anims.create({key:k,frames:fr.map(f=>({key:tx,frame:f})),frameRate:(rate[pose.split("_")[1]]??6)*(.85+R()*.3),repeat:-1})}
 const groups={};for(const[sp,C]of Object.entries(__RPAN)){if(!AM[sp])continue;for(let i=0;i<C.n;i++){const z=C.zones[i%C.zones.length],gk=(C.grp||sp)+":"+z;let p;
   if(C.herd||C.flock){const Zc=S.M.zones[z];groups[gk]=groups[gk]||C.pad&&Zc&&S.zonePt(z,C.kind,{x:Zc[0],y:Zc[1]+15,r:50},null,0,C.pad)||S.zonePt(z,C.kind,null,null,0,C.pad||10);p=groups[gk]&&(S.zonePt(z,C.kind,{x:groups[gk].x,y:groups[gk].y,r:C.herd?55:40},null,0,C.pad||10)||S.zonePt(z,C.kind,{x:groups[gk].x,y:groups[gk].y,r:C.herd?55:40}))}else p=S.zonePt(z,C.kind);if(!p)continue;
   const fish=C.kind==="fish",spr=S.w(S.add.sprite(p.x,p.y,C.tex||"rp-animals",0).setOrigin(.5,C.oy||.62).setScale(C.sc).setDepth(fish?.65:p.y));fish&&spr.setAlpha(.5).setTint(0x9ad0e8);
   const sh=fish||C.kind==="worm"?null:S.w(S.add.ellipse(p.x,p.y+2,C.shw||(C.kind==="duck"?12:sp==="sheep"?16:9),3,0,C.kind==="duck"?.12:.22).setDepth(1.8));
   const a={sp,C,s:spr,sh,x:p.x,y:p.y,st:"idle",t:R()*4,zone:z,alt:0,vx:0,vy:R()<.5?1:-1,base:fish?.5:1};S.animals.push(a);S.anPose(a,0,1)}}}
anPose(a,vx,vy,pose){const S=this,C=a.C;pose=pose||(Math.hypot(vx,vy)>2?C.move:C.idle);const P=S.AM?.[a.sp]||{};let d="S";
 if(Math.abs(vx)>Math.abs(vy)*.8){d="S";a.s.setFlipX(vx>0)}else if(vy>0)d="D";else d="U";let k=`${d}_${pose}`;if(!P[k])k=P[`S_${pose}`]?`S_${pose}`:Object.keys(P).find(q=>q.endsWith(pose))||Object.keys(P)[0];
 const key=`rpa-${a.sp}-${k}`;a.s.anims.currentAnim?.key!==key&&S.anims.exists(key)&&a.s.play(key,!0)}
anFlee(a,h,chain=!0){const S=this,C=a.C,R=Math.random;if(a.st==="flee"||a.st==="fly"||a.st==="gone"||a.st==="hide")return;
 let dx=a.x-h.x,dy=a.y-h.y,m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;a.t=0;
 if(C.kind==="bird"||C.kind==="duck"){a.st="fly";const ang=Math.atan2(dy,dx)+(R()-.5)*.9;a.vx=Math.cos(ang)*C.flee;a.vy=Math.sin(ang)*C.flee-40;a.s.setDepth(4500);C.kind==="duck"&&S.ring(a.x,a.y,14);S.heroSeenFlee=!0;S.hsay(C.kind==="duck"?"birds":"birds",__arcHeroEv("birds"))}
 else if(C.kind==="worm"){a.st="hide";S.tweens.add({targets:a.s,alpha:0,scaleY:.2,duration:500})}
 else if(C.kind==="fish"){a.st="flee";a.vx=dx*C.flee;a.vy=dy*C.flee;S.tweens.add({targets:a.s,alpha:0,duration:650})}
 else if(C.kind==="frog"){a.st="flee";let best=null,bd=1e9;for(let k=0;k<24;k++){const an=k/24*6.283,x=a.x+Math.cos(an)*70,y=a.y+Math.sin(an)*70;if(S.cell(x,y)===2){const d=Math.hypot(x-h.x,y-h.y);if(-d<bd){bd=-d;best={x,y}}}}const g=best||{x:a.x+dx*60,y:a.y+dy*60};const gm=Math.hypot(g.x-a.x,g.y-a.y)||1;a.vx=(g.x-a.x)/gm*C.flee;a.vy=(g.y-a.y)/gm*C.flee}
 else{a.st="flee";/* corre para a mata mais próxima longe do herói */let best=null,bs=-1e9;for(let k=0;k<20;k++){const an=Math.atan2(dy,dx)+(k/19-.5)*2.2;for(let r=30;r<=260;r+=20){const x=a.x+Math.cos(an)*r,y=a.y+Math.sin(an)*r;if(S.cell(x,y)===0){const sc=-r+Math.hypot(x-h.x,y-h.y)*.6;sc>bs&&(bs=sc,best={x,y});break}}}
  const g=best||{x:a.x+dx*200,y:a.y+dy*200},gm=Math.hypot(g.x-a.x,g.y-a.y)||1;a.vx=(g.x-a.x)/gm*C.flee;a.vy=(g.y-a.y)/gm*C.flee;S.heroSeenFlee=!0;S.hsay("flee",__arcHeroEv("flee"))}
 if(chain)for(const b of S.animals)b!==a&&(b.C.grp||b.sp)===(a.C.grp||a.sp)&&Math.hypot(b.x-a.x,b.y-a.y)<(C.grp?150:95)&&S.time.delayedCall(80+Math.random()*260,()=>S.anFlee(b,h,!1))}
anSplash(a,dt){const S=this;a.spT=(a.spT||0)-dt;if(a.spT>0)return;a.spT=.32;S.ring(a.x,a.y+1,6);S.drops(a.x,a.y,3);const d=Math.hypot(a.x-(S.hx??0),a.y-(S.hy??0));d<260&&S.sfx("wade",.18*(1-d/260)+.05,0)}
drops(x,y,n){const S=this;for(let k=0;k<n;k++){const c=S.w(S.add.circle(x,y-2,1.1,0xe8fff8,.9).setDepth(y+2));S.tweens.add({targets:c,x:x+(Math.random()-.5)*12,y:y-5-Math.random()*7,alpha:0,duration:380,ease:"Quad.easeOut",onComplete:()=>c.destroy()})}}
/* herói pode entrar na água rasa da beira (mais devagar, com respingos e som de passos na água) */
shallow(x,y){const S=this,c=S.cell(x,y);const near=(v,r)=>{for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]])for(let k=8;k<=r;k+=8)if(S.cell(x+ox*k,y+oy*k)===v)return!0;return!1};
 return c===1?near(2,12):c===2?near(1,26):near(1,16)&&near(2,16)}
walkOk(x,y){const S=this;return S.okArea(x,y,1,5)||Math.abs(x-S.dock.x)<14&&y>S.M.land[1]-10&&y<S.M.land[1]+20||S.shallow(x,y)}
ring(x,y,r){const S=this,e=S.w(S.add.ellipse(x,y,r,r*.45,0,0).setStrokeStyle(1,0xe6fff4,.8).setDepth(.9));S.tweens.add({targets:e,scaleX:2.4,scaleY:2.4,alpha:0,duration:800,onComplete:()=>e.destroy()})}
anGone(a){const S=this;a.st="gone";a.t=0;a.ret=(a.C.kind==="worm"?5:9)+Math.random()*8;a.s.setVisible(!1);a.sh&&a.sh.setVisible(!1)}
anReturn(a,h){const S=this,C=a.C,R=Math.random,z=C.zones[Math.floor(R()*C.zones.length)];let p=null;
 const fk=(C.flock||C.herd)&&S.animals.find(b=>b!==a&&(b.C.grp||b.sp)===(C.grp||a.sp)&&b.zone===z&&b.st!=="gone"&&b.st!=="fly"&&b.st!=="flee"&&b.s.visible);
 p=fk?S.zonePt(z,C.kind,{x:fk.x,y:fk.y,r:45},h,240,C.pad||10):S.zonePt(z,C.kind,null,h,260,C.pad||10);if(!p||Math.hypot(p.x-a.lx,p.y-a.ly)<120&&!fk)return;a.zone=z;
 a.s.setVisible(!0).setScale(C.sc).setAlpha(0);a.sh&&a.sh.setVisible(!0);a.t=0;
 if(C.kind==="bird"||C.kind==="duck"){const an=R()*6.283;a.x=p.x+Math.cos(an)*140;a.y=p.y+Math.sin(an)*90;a.alt=70;a.tx=p.x;a.ty=p.y;a.st="land";a.s.setDepth(4500);S.tweens.add({targets:a.s,alpha:a.base,duration:500})}
 else if(C.kind==="fish"||C.kind==="worm"){a.x=p.x;a.y=p.y;a.st="idle";a.t=1+R()*2;S.tweens.add({targets:a.s,alpha:a.base,scaleY:C.sc,duration:900})}
 else{/* sai da beira da mata andando até o ponto (nunca por cima das árvores) */let e=null,best=1e9;for(let k=0;k<16;k++){const an=k/16*6.283;let last=null;for(let r=8;r<=200;r+=6){const x=p.x+Math.cos(an)*r,y=p.y+Math.sin(an)*r;if(S.cell(x,y)!==1)break;last={x,y,r}}if(last&&last.r>24&&last.r<best&&S.cell(p.x+Math.cos(an)*(last.r+8),p.y+Math.sin(an)*(last.r+8))===0&&!S.lobs.some(q=>Math.hypot(last.x-q.x,last.y-q.y)<q.r+6)){best=last.r;e={x:p.x+Math.cos(an)*(last.r-6),y:p.y+Math.sin(an)*(last.r-6)}}}e=e||{x:p.x,y:p.y};
  a.x=e.x;a.y=e.y;a.tx=p.x;a.ty=p.y;a.st="walk";a.spd=a.C.walk*1.6;S.tweens.add({targets:a.s,alpha:1,duration:900});a.sh&&(a.sh.setAlpha(0),S.tweens.add({targets:a.sh,alpha:.22,duration:900}))}
 const v=S.cameras.main.worldView;S.heroSeenFlee&&v.contains(a.x,a.y)&&S.time.delayedCall(900,()=>S.hsay("back",__arcHeroEv("back")))}
updateAnimals(dt){const S=this;if(!S.animals?.length)return;const R=Math.random,h=S.mode==="land"&&S.hero?{x:S.hx,y:S.hy}:{x:S.boat.x,y:S.boat.y};
 const hv=Math.hypot(h.x-(S.lhx??h.x),h.y-(S.lhy??h.y))/Math.max(dt,1e-3);S.lhx=h.x;S.lhy=h.y;const moving=hv>20;const v=S.cameras.main.worldView;
 for(const a of S.animals){const C=a.C,d=Math.hypot(a.x-h.x,a.y-h.y);
  if((a.st==="idle"||a.st==="walk")&&S.mode==="land"&&d<C.fleeR*(moving?1:.55))S.anFlee(a,h);
  if(a.sp==="duck"&&a.st==="idle"&&S.mode==="land"&&d<240&&d>C.fleeR)S.hsay("duck",__arcHeroEv("duck"));
  switch(a.st){
  case"idle":a.t-=dt;if(a.t<=0){const p=S.zonePt(a.zone,C.kind,{x:a.x,y:a.y,r:C.kind==="worm"?14:C.kind==="bird"?30:80},null,0,C.pad||10);if(p){a.tx=p.x;a.ty=p.y;a.spd=C.walk*(.7+R()*.5);a.st="walk";a.t=6}else a.t=1}
   C.kind==="bird"&&R()<dt*.8&&(a.s.y-=0);break;
  case"walk":{const dx=a.tx-a.x,dy=a.ty-a.y,m=Math.hypot(dx,dy);a.t-=dt;if(m<2||a.t<=0){a.st="idle";a.t=(C.kind==="bird"?.6:1.5)+R()*(C.kind==="bird"?2:4.5);S.anPose(a,a.vx*.01,a.vy*.01,C.idle);break}
   const sp=Math.min(a.spd,m/dt);a.vx=dx/m*sp;a.vy=dy/m*sp;if(C.kind!=="bird"&&C.kind!=="duck"&&C.kind!=="fish"&&S.cell(a.x+a.vx*dt*4,a.y+a.vy*dt*4)===0&&a.s.alpha>.9){a.st="idle";a.t=.8+R()*2;S.anPose(a,a.vx*.01,a.vy*.01,C.idle);break}a.x+=a.vx*dt;a.y+=a.vy*dt;S.anPose(a,a.vx,a.vy,C.move);(C.kind=="ground"||C.kind=="frog")&&S.cell(a.x,a.y)===2&&S.anSplash(a,dt);
   C.kind==="bird"&&(a.s.y=a.y-Math.abs(Math.sin(S.time.now/90))*2);break}
  case"flee":a.t+=dt;a.x+=a.vx*dt;a.y+=a.vy*dt;S.anPose(a,a.vx,a.vy,C.run||C.move);
   if(C.kind==="frog"&&S.cell(a.x,a.y)===2){S.ring(a.x,a.y,8);a.lx=a.x;a.ly=a.y;S.anGone(a);break}
   if(C.kind==="fish"&&a.t>.7){a.lx=a.x;a.ly=a.y;S.anGone(a);break}
   if(S.cell(a.x,a.y)===2)S.anSplash(a,dt);const ed=S.cell(a.x+a.vx*.2,a.y+a.vy*.2)===0;if(ed||a.t>3){a.lx=a.x;a.ly=a.y;S.tweens.add({targets:a.s,alpha:0,duration:ed?160:300,onComplete:()=>S.anGone(a)});a.sh&&S.tweens.add({targets:a.sh,alpha:0,duration:160});a.st="hide"}break;
  case"fly":a.t+=dt;a.alt=Math.min(90,a.alt+dt*70);a.vy-=dt*10;a.x+=a.vx*dt;a.y+=a.vy*dt*.6;S.anPose(a,a.vx,a.vy,C.fly);if(a.t>2.6&&a.s.alpha>=a.base*.99){a.lx=a.x;a.ly=a.y;S.tweens.add({targets:a.s,alpha:0,duration:400,onComplete:()=>S.anGone(a)});a.st="hide"}break;
  case"land":{const dx=a.tx-a.x,dy=a.ty-a.y,m=Math.hypot(dx,dy);const sp=Math.min(C.flee*.55,m/dt);a.alt=Math.max(0,Math.min(a.alt,m*.5));if(m<3){a.x=a.tx;a.y=a.ty;a.alt=0;a.st="idle";a.t=2+R()*3;a.s.setDepth(a.y);C.kind==="duck"&&S.ring(a.x,a.y,14);S.anPose(a,a.vx*.01,a.vy*.01,C.idle);break}
   a.vx=dx/m*sp;a.vy=dy/m*sp;a.x+=a.vx*dt;a.y+=a.vy*dt;S.anPose(a,a.vx,a.vy,C.fly);break}
  case"gone":a.t+=dt;if(a.t>a.ret&&R()<dt*2)S.anReturn(a,h);continue;
  case"hide":break}
  if(a.st!=="gone"){a.s.x=a.x;a.st!=="walk"||C.kind!=="bird"?a.s.y=a.y-a.alt:0;(a.st==="idle"||a.st==="walk")&&C.kind!=="fish"&&a.s.setDepth(a.y);a.sh&&a.sh.setPosition(a.x,a.y+2).setAlpha((a.alt>2?.08:C.kind==="duck"?.12:.22))}
  if(C.kind==="duck"&&a.st==="idle"&&R()<dt*.15)S.ring(a.x,a.y,10);if(C.kind==="fish"&&a.st==="idle"&&R()<dt*.1&&v.contains(a.x,a.y))S.ring(a.x,a.y,5)}}
doAct(){const S=this,a=S.curAct;if(!a)return;if(a.kind==="land"){S.disembark();return}if(a.kind==="poi"){a.p.done=!0;S.say(a.p.line);S.game.audioEngine?.sfx?.("sfx-ui-tab");S.burst(a.p.x,a.p.y-20)}}
burst(x,y){const S=this;for(let k=0;k<10;k++){const c=S.w(S.add.circle(x,y,1.5,0xd8ff9a,.9).setDepth(5e3));S.tweens.add({targets:c,x:x+(Math.random()-.5)*50,y:y-20-Math.random()*30,alpha:0,duration:700,onComplete:()=>c.destroy()})}}
disembark(){const S=this;if(S.mode!=="boat")return;S.mode="land";S.bv={x:0,y:0};S.tweens.add({targets:S.boat,x:S.dock.x+34,y:S.dock.y+6,rotation:.25,duration:500});
 S.sfx("splash",.8);S.sfx("bump",.6);S.time.delayedCall(250,()=>S.sfx("step",.7));S.time.delayedCall(480,()=>S.sfx("step",.7));
 const Lp=S.M.land,hx=Lp[0],hy=Lp[1];S.hx=hx;S.hy=hy;S.hero&&S.hero.setPosition(hx,hy).setVisible(!0).setAlpha(0).setDepth(hy+1);S.hero&&S.tweens.add({targets:S.hero,alpha:1,duration:400});S.hsh.setPosition(hx,hy).setVisible(!0);
 S.hero&&S.anims.exists(S.hkey+"-idle")&&S.hero.play(S.hkey+"-idle");S.cameras.main.startFollow(S.hero||S.boat,!0,.08,.08);S.cameras.main.setFollowOffset(0,0);S.time.delayedCall(700,()=>S.say(4));S.time.delayedCall(900,()=>S.title("dock"))}
axis(){const S=this,im=S.game.inputManager;try{im?.update?.()}catch(e){}let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);if(S.joy.on&&Math.hypot(S.joy.x,S.joy.y)>Math.hypot(a.x,a.y))a={x:S.joy.x,y:S.joy.y};const m=Math.hypot(a.x,a.y);return m<.15?{x:0,y:0}:{x:a.x/Math.max(1,m),y:a.y/Math.max(1,m)}}
push(o,list,rad){for(const q of list){const dx=o.x-q.x,dy=o.y-q.y,d=Math.hypot(dx,dy),m=rad+q.r;if(d<m&&d>.01){o.x=q.x+dx/d*m;o.y=q.y+dy/d*m}}}
/* anda deslizando pela borda: tenta o passo inteiro, depois só x, depois só y */
step(px,py,nx,ny,ok){if(ok(nx,ny))return[nx,ny];if(ok(nx,py))return[nx,py];if(ok(px,ny))return[px,ny];return[px,py]}
update(t,ms){const S=this;if(S.leaving)return;if(S.game.inputManager?.justDown?.("PAUSE"))S.togglePause();if(S.pauseOn)return;const dt=Math.min(.05,ms/1e3),a=S.axis(),im=S.game.inputManager,L3=__L3,M=S.M,cam=S.cameras.main;
 /* vento: envelope das rajadas do som (o mesmo laço que toca) */
 const WE=S.windEnv;let g=.45;if(WE?.env?.length){const ph=(t/1e3)%WE.dur*4,i0=Math.floor(ph),f=ph-i0;g=WE.env[i0%WE.env.length]*(1-f)+WE.env[(i0+1)%WE.env.length]*f}
 S.gustBoost=Math.max(0,(S.gustBoost||0)-dt*.12);S.gust+=(Math.min(1,g+S.gustBoost*.6)-S.gust)*Math.min(1,dt*2);const G=S.gust;
 const v=cam.worldView;for(const f of S.leaves){f.ph+=dt*2;f.x+=(f.vx*(.4+G*1.8)+Math.sin(f.ph)*10)*dt;f.y+=f.vy*(.7+G*.6)*dt;f.rotation+=dt*(2+G*3);if(f.y>v.bottom+10){f.y=v.top-10;f.x=v.x+Math.random()*v.width}if(f.x>v.right+10){f.x=v.x-5;f.y=v.y+Math.random()*v.height}}
 const tw=t/1e3;for(const im_ of S.sway){if(im_.x<v.x-80||im_.x>v.right+80||im_.y<v.y-20||im_.y>v.bottom+140)continue;im_.rotation=(Math.sin(tw*1.4+im_.ph)*.012+Math.sin(tw*3.1+im_.ph*2)*.005)*im_.amp*(.35+G*1.6)}
 /* fios de correnteza que descem com a água, perto da câmera */
 for(const e of S.streaks){if(e.life<=0){const x=v.x+Math.random()*v.width,y=v.y+Math.random()*v.height;if(S.cell(x,y)===2&&S.cell(x+12,y)===2&&S.cell(x-12,y)===2){const k=S.near(x,y);if(k>=0){const tn=S.tan(k);e.setPosition(x,y);e.vx=tn.x;e.vy=tn.y;e.sp=(S.flow[k]||30)*(.9+Math.random()*.5);e.setRotation(Math.atan2(tn.y,tn.x));e.max=e.life=1.4+Math.random()*1.4}}continue}
  e.life-=dt;e.x+=e.vx*e.sp*dt;e.y+=e.vy*e.sp*dt;const q=e.life/e.max;e.setAlpha(Math.sin(q*Math.PI)*(e.sp>55?.55:.3));if(S.cell(e.x,e.y)!==2)e.life=0}
 let act=null,flowNear=0;
 if(S.mode==="boat"){const B=S.boat,acc=170,max=100;S.pi=S.near(B.x,B.y,S.pi);const tn=S.pi>=0?S.tan(S.pi):{x:0,y:0},fl=S.pi>=0?(S.flow[S.pi]||28):0;flowNear=fl;
  S.bv.x+=a.x*acc*dt;S.bv.y+=a.y*acc*dt;const sp=Math.hypot(S.bv.x,S.bv.y);if(sp>max){S.bv.x*=max/sp;S.bv.y*=max/sp}const dr=Math.pow(.4,dt);S.bv.x*=dr;S.bv.y*=dr;
  /* correnteza: empurra rio abaixo e puxa de leve para o meio do canal */
  let cx=tn.x*fl*.85,cy=tn.y*fl*.85;if(S.pi>=0){const p=S.P[S.pi],ox=p[0]-B.x,oy=p[1]-B.y,lat=ox*-tn.y+oy*tn.x;cx+=-tn.y*lat*.35;cy+=tn.x*lat*.35}
  if(S.pi>=S.P.length-4){cx*=.2;cy*=.2}
  const vx=S.bv.x+cx,vy=S.bv.y+cy;const tx=B.x+vx*dt,ty=B.y+vy*dt;let[nx,ny]=S.step(B.x,B.y,tx,ty,(x,y)=>S.okArea(x,y,2,14));
  const o={x:nx,y:ny};S.push(o,S.wobs,12);S.okArea(o.x,o.y,2,12)&&(nx=o.x,ny=o.y);
  const hit=Math.abs(nx-tx)+Math.abs(ny-ty)>.3;if(hit){S.bv.x*=.7;S.bv.y*=.7;if(sp>45&&(S.bumpT||0)<t){S.bumpT=t+900;S.sfx("bump",Math.min(.8,sp/120));S.cameras.main.shake(120,.0015)}}
  B.setPosition(nx,ny).setDepth(ny);const tv=Math.hypot(vx,vy);S.bspd=tv;
  if(tv>6){const ang=Math.atan2(vy,vx);let d=ang-S.bang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;S.bang+=d*Math.min(1,dt*2.6)}
  S.bt+=dt;B.setRotation(S.bang+Math.PI/2+Math.sin(S.bt*1.7)*.035).setScale(.5,.5*(1+Math.sin(S.bt*2.3)*.012));
  S.wakeT+=dt;if(tv>18&&S.wakeT>.11){S.wakeT=0;for(const sd of[-1,1]){const bx=B.x-Math.cos(S.bang)*26+Math.sin(S.bang)*sd*7,by=B.y-Math.sin(S.bang)*26-Math.cos(S.bang)*sd*7,e=S.w(S.add.ellipse(bx,by,8,4,0xcfeee4,.45).setDepth(.95).setRotation(S.bang));S.tweens.add({targets:e,x:bx+Math.sin(S.bang)*sd*10,y:by-Math.cos(S.bang)*sd*10,scaleX:2.6,scaleY:1.6,alpha:0,duration:1100,onComplete:()=>e.destroy()})}}
  /* remadas (som + respingo dos dois lados) e rangidos da madeira */
  const rowing=Math.hypot(a.x,a.y)>.3;S.rowT=(S.rowT||0)-dt;if(rowing&&S.rowT<=0){S.rowT=.95+Math.random()*.2;S.side=-(S.side||1);S.sfx("paddle",.75,S.side*.35);const px_=B.x+Math.sin(S.bang)*S.side*16,py_=B.y-Math.cos(S.bang)*S.side*16;for(let k=0;k<5;k++){const c=S.w(S.add.circle(px_,py_,1.4,0xe8fff8,.9).setDepth(ny+1));S.tweens.add({targets:c,x:px_+(Math.random()-.5)*14,y:py_-6-Math.random()*8,alpha:0,duration:450,onComplete:()=>c.destroy()})}const r=S.w(S.add.ellipse(px_,py_,6,3,0,0).setStrokeStyle(1,0xe8fff8,.7).setDepth(.9));S.tweens.add({targets:r,scaleX:3.4,scaleY:3,alpha:0,duration:900,onComplete:()=>r.destroy()})}
  S.creakT=(S.creakT??3)-dt;if(S.creakT<=0){S.creakT=4+Math.random()*6;tv>12&&S.sfx("creak",.35+Math.random()*.25,(Math.random()-.5)*.6)}
  /* câmera olha um pouco à frente do barco */
  const lk=.75;S.look.x+=(-vx*lk-S.look.x)*Math.min(1,dt*1.2);S.look.y+=(-vy*lk-S.look.y)*Math.min(1,dt*1.2);cam.setFollowOffset(S.look.x,S.look.y);
  /* roteiro da narração pelo quanto já desceu o rio */
  if(S.pi>=0)S.prog=Math.max(S.prog,S.P[S.pi][2]);for(const[li,sv]of S.cues)S.prog>=sv&&S.say(li);
  if(Math.hypot(B.x-S.dock.x,B.y-S.dock.y)<70)act={kind:"land",label:L3("⚓ Desembarcar","⚓ Disembark","⚓ Desembarcar")}}
 else if(S.hero){const inW=S.cell(S.hx,S.hy)!==1&&S.shallow(S.hx,S.hy)&&!(Math.abs(S.hx-S.dock.x)<14&&S.hy<M.land[1]+20),spd=inW?66:105;let[nx,ny]=S.step(S.hx,S.hy,S.hx+a.x*spd*dt,S.hy+a.y*spd*dt,(x,y)=>S.walkOk(x,y));const o={x:nx,y:ny};S.push(o,S.lobs,8);if(!S.walkOk(o.x,o.y)){o.x=nx;o.y=ny}
  const moved=Math.hypot(o.x-S.hx,o.y-S.hy);S.hx=o.x;S.hy=o.y;
  S.hero.setPosition(o.x,o.y).setDepth(o.y+1);{const fh=S.hero.frame?.height||128,cut=inW?Math.round(fh*(1-(S.hero.originY))+ 7/Math.max(.1,S.hero.scaleY)):0;inW?S.hero.setCrop(0,0,S.hero.frame.width,fh-cut):S.hero.isCropped&&S.hero.setCrop()}S.hsh.setPosition(o.x,o.y+1);a.x&&S.hero.setFlipX(a.x<0);const moving=Math.hypot(a.x,a.y)>.1,an=S.hkey+(moving?"-walk":"-idle");S.anims.exists(an)&&S.hero.anims.currentAnim?.key!==an&&S.hero.play(an);
  if(moved>.5&&Math.abs(o.x-S.dock.x)<16&&o.y>M.land[1]+4&&!inW){S.stepT=(S.stepT||0)-dt;if(S.stepT<=0){S.stepT=.34;S.sfx("step",.5)}}
  /* água: anel em volta dos pés, gotas e som de passos na água; parado, só uma marola de vez em quando */
  S.hsh.setAlpha(inW?0:.3);S.wadeT=(S.wadeT||0)-dt;if(inW&&S.wadeT<=0){if(moved>.4){S.wadeT=.3;S.ring(o.x,o.y+1,10);S.drops(o.x,o.y,5);S.sfx("wade",.5,(Math.random()-.5)*.3)}else{S.wadeT=1.3;S.ring(o.x,o.y+1,9)}}
  if(inW&&!S.wadeSaid){S.wadeSaid=1;S.hsay("wade",__L3("Água fria… mas dá pé.","Cold water… but I can touch the bottom.","Agua fría… pero hago pie."))}
  for(const p of S.poi)if(!p.done&&Math.hypot(p.x-o.x,p.y-o.y)<48){act={kind:"poi",p,label:"✦ "+p.label};break}
  for(const[z,li]of Object.entries(__RPZL)){const Z=M.zones?.[z];if(Z&&!S.lineDone.has(li)&&((o.x-Z[0])/Z[2])**2+((o.y-Z[1])/Z[3])**2<1)S.say(li)}
  if(Math.hypot(o.x-M.exit[0],o.y-M.exit[1])<80){S.say(7);S.finish(!1)}}
 S.updateAnimals(dt);S.updateLife(dt,t,G);
 /* mixagem: rio perto, corredeira perto da garganta, casco pela velocidade, vento pelas rajadas */
 const fx=S.mode==="boat"?S.boat.x:S.hx,fy=S.mode==="boat"?S.boat.y:S.hy;let dg=1e9;for(const p of S.gorge){const d=Math.hypot(p[0]-fx,p[1]-fy);d<dg&&(dg=d)}
 if(S.au){S.gain("river-flow",S.mode==="boat"?.55:.3,.6);S.gain("river-rapids",Math.max(0,1-dg/420)**1.5*.95,.5);S.gain("boat-glide",S.mode==="boat"?Math.min(1,(S.bspd||0)/90)*.6:0,.25);S.gain("river-wind",.18+G*.5,.4)}
 S.curAct=act;S.act.setVisible(!!act);act&&S.actTx.text!==act.label&&S.actTx.setText(act.label);
 if(act&&(im?.justDown?.("INTERACT")||S.keyE&&j.Input.Keyboard.JustDown(S.keyE)))S.doAct()}
/* ── beleza e vida da abertura ─────────────────────────────────────────────────────────────────────────
   • título grande de cada região ao chegar (Lago das Brumas, Garganta dos Sussurros, Ponte dos Dois Reinos,
     Lago Espelhado, Clareira do Desembarque, Prado das Flores, Clareira dos Cervos, Lagoa dos Juncos,
     Recanto dos Vaga-lumes), com um sino suave
   • campos de flores em manchas de cor que ondulam com o vento (a onda corre pelo campo), se abrem quando o
     herói passa e soltam pétalas; nas rajadas, pétalas voam sozinhas
   • Recanto dos Vaga-lumes: flores que brilham, luzes espirituais flutuando e névoa baixa
   • lagos vivos: peixes que saltam, bolhas que sobem, e no Lago Espelhado uma criatura enorme que passa por
     baixo do barco e depois salta ao longe (uma vez só) */
initLife(){const S=this,M=S.M,R=Math.random;S.flowers=[];S.petals=0;
 const px=(key,w,h,pts)=>{if(S.textures.exists(key))return;const g=S.make.graphics({add:!1});for(const[x,y,c,a]of pts)g.fillStyle(c,a??1).fillRect(x,y,1,1);g.generateTexture(key,w,h);g.destroy()};
 /* flores 5x7 (pétalas, miolo, caule e folha) e tufos de capim */
 const FL=[[0xf08a3c,0xffd36a,0xc8652a],[0x5f86e8,0xe2ecff,0x3f5fb8],[0xf6f3ff,0xffdf7a,0xc9c4e0],[0xee8fbd,0xfff0f6,0xc06690],[0xffd34a,0xb8602a,0xd8a030],[0xd9d2ff,0xffffff,0xa89ee8]],G1=0x3f7a3a,G2=0x5a9a48;
 FL.forEach(([p,c,d],i)=>px("rpf-"+i,5,7,[[1,0,p],[3,0,p],[0,1,d],[1,1,p],[2,1,c],[3,1,p],[4,1,d],[1,2,d],[3,2,d],[2,3,G1],[2,4,G1],[1,4,G2],[2,5,G1],[3,5,G2],[2,6,G1]]));
 px("rpg-0",5,6,[[0,2,G2],[0,3,G1],[1,4,G1],[2,0,G2],[2,1,G2],[2,2,G1],[2,3,G1],[2,4,G1],[2,5,G1],[4,1,G2],[3,3,G1],[4,2,G2],[1,5,G1],[3,5,G1]]);
 /* a criatura do lago: sombra, dorso que sai da água e a cauda */
 if(!S.textures.exists("rp-lev")){const g=S.make.graphics({add:!1});g.fillStyle(0x06121a,1).fillEllipse(100,35,150,44).fillCircle(34,35,21).fillTriangle(165,35,203,10,193,35).fillTriangle(165,35,203,60,193,35).fillTriangle(72,28,96,2,104,27).fillTriangle(72,42,96,68,104,43);g.generateTexture("rp-lev",206,70);g.destroy()}
 if(!S.textures.exists("rp-back2")){const g=S.make.graphics({add:!1});g.fillStyle(0x16232a,1).fillEllipse(48,44,84,52);g.fillStyle(0x283d48,1).fillEllipse(45,42,72,44);g.fillStyle(0x36505c,1).fillEllipse(42,36,52,26);
  g.fillStyle(0x131e24,1).fillTriangle(54,22,68,2,76,24);g.fillStyle(0x3d5865,1).fillTriangle(60,20,67,6,66,20);g.fillStyle(0x6a8e9a,1).fillEllipse(38,23,38,5);g.fillStyle(0xb6d6dc,1).fillEllipse(34,21,14,2);
  g.fillStyle(0x7d979d,1);for(const[x,y]of[[24,32],[28,28],[58,30],[63,34],[33,36]])g.fillRect(x,y,2,1);g.generateTexture("rp-back2",96,44);g.destroy()}
 if(!S.textures.exists("rp-fluke")){const g=S.make.graphics({add:!1});g.fillStyle(0x1b2a33,1).fillTriangle(27,34,1,4,24,16).fillTriangle(27,34,53,4,30,16).fillEllipse(8,7,15,7).fillEllipse(46,7,15,7).fillRect(23,14,8,20);g.fillStyle(0x5d7f8c,1).fillEllipse(9,5,10,2).fillEllipse(45,5,10,2);g.generateTexture("rp-fluke",54,34);g.destroy()}
 /* campos de flores (manchas de uma cor só, como no campo de verdade) */
 const Z=M.zones||{};
 Z.m1&&S.plant(Z.m1[0],Z.m1[1],Z.m1[2]*.95,Z.m1[3]*.95,30,30,[0,0,0,1,1,2,4]);
 Z.g1&&S.plant(Z.g1[0],Z.g1[1],Z.g1[2],Z.g1[3],9,16,[2,4,3,2]);
 Z.bank&&S.plant(Z.bank[0],Z.bank[1],Z.bank[2],Z.bank[3],9,14,[3,2,1]);
 S.plant(M.land[0]+20,M.land[1]-40,190,110,8,14,[2,4,0,3]);
 Z.m2&&S.plant(Z.m2[0],Z.m2[1],Z.m2[2]*.95,Z.m2[3]*.95,16,28,[5,5,5,2,1],!0);
 /* tufos de capim pelas clareiras (dão profundidade e também balançam) */
 for(const z of["m1","g1","m2"]){const q=Z[z];if(!q)continue;for(let k=0;k<70;k++){const a=R()*6.283,r=Math.sqrt(R()),x=q[0]+Math.cos(a)*q[2]*r,y=q[1]+Math.sin(a)*q[3]*r;if(!S.okArea(x,y,1,4)||S.soil(x,y)||S.lobs.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+4))continue;const im=S.w(S.add.image(Math.round(x),Math.round(y),"rpg-0").setOrigin(.5,1).setDepth(y-2).setAlpha(.9));R()<.5&&im.setFlipX(!0);im.ph=x*.035;im.bend=0;im.grass=1;S.flowers.push(im)}}
 /* Recanto dos Vaga-lumes: luzes espirituais e névoa baixa */
 if(Z.m2){const[mx,my,rx,ry]=Z.m2;for(let k=0;k<28;k++){let x=0,y=0,ok=!1;for(let t=0;t<30&&!ok;t++){const a=R()*6.283,r=Math.sqrt(R());x=mx+Math.cos(a)*rx*r;y=my+Math.sin(a)*ry*r;ok=S.cell(x,y)===1}if(!ok)continue;
   const col=R()<.7?0xb8ffcf:0xd8d0ff,o=S.w(S.add.image(x,y,"light").setScale(.035+R()*.03).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(0).setDepth(4050)),c=S.w(S.add.image(x,y,"light").setScale(.016).setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setAlpha(0).setDepth(4051));
   const dx=10+R()*22,dy=6+R()*14,du=2600+R()*2600;S.tweens.add({targets:[o,c],x:"+="+dx,duration:du,yoyo:!0,repeat:-1,ease:"Sine.easeInOut",delay:R()*2e3});S.tweens.add({targets:[o,c],y:"-="+dy,duration:du*.73,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});
   S.tweens.add({targets:o,alpha:{from:.1,to:.42},duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*1500});S.tweens.add({targets:c,alpha:{from:.3,to:.95},duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*1500})}
  for(let k=0;k<6;k++){const m=S.w(S.add.ellipse(mx+(R()-.5)*rx,my+(R()-.5)*ry*.8,rx*(.5+R()*.4),ry*(.25+R()*.2),0xcfe8ff,0).setDepth(3800));S.tweens.add({targets:m,alpha:{from:.02,to:.08},x:"+="+(20+R()*40),duration:7e3+R()*4e3,yoyo:!0,repeat:-1,delay:R()*3e3})}}
 S.fjT=3;S.bbT=1.5;S.time.delayedCall(2600,()=>S.title("lagoA"))}
soil(x,y){const S=this;try{const i=Math.floor(x/512),k=Math.floor(y/512),c=S.textures.getPixel(Math.floor(x-i*512),Math.floor(y-k*512),`rpb-${i}-${k}`);return!!c&&c.red>c.green+4}catch(e){return!1}}
plant(cx,cy,rx,ry,clusters,per,pal,glow){const S=this,R=Math.random;
 for(let c=0;c<clusters;c++){let o=null;for(let t=0;t<40&&!o;t++){const a=R()*6.283,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;if(S.okArea(x,y,1,9)&&!S.soil(x,y)&&!S.lobs.some(q=>Math.hypot(x-q.x,y-q.y)<q.r+12))o={x,y}}if(!o)continue;
  const col=pal[Math.floor(R()*pal.length)],cr=16+R()*28,n=Math.round(per*(.6+R()*.8));
  for(let k=0;k<n;k++){const a=R()*6.283,r=Math.pow(R(),.7)*cr,x=o.x+Math.cos(a)*r,y=o.y+Math.sin(a)*r*.7;if(S.cell(x,y)!==1||S.soil(x,y)||S.lobs.some(q=>Math.hypot(x-q.x,y-q.y)<q.r+4))continue;
   const ci=R()<.86?col:pal[Math.floor(R()*pal.length)],im=S.w(S.add.image(Math.round(x),Math.round(y),"rpf-"+ci).setOrigin(.5,1).setDepth(y-2));R()<.5&&im.setFlipX(!0);R()<.25&&im.setScale(.8);im.ph=x*.035;im.ci=ci;im.bend=0;S.flowers.push(im);
   if(glow&&R()<.22){const gl=S.w(S.add.image(x,y-4,"light").setScale(.025+R()*.025).setBlendMode(j.BlendModes.ADD).setTint(ci===5?0xc8c0ff:0xa8ffe0).setAlpha(0).setDepth(y-1));S.tweens.add({targets:gl,alpha:{from:.04,to:.26},duration:1400+R()*1800,yoyo:!0,repeat:-1,delay:R()*2e3})}}}}
petal(x,y,ci,G){const S=this,R=Math.random,cols=[0xf08a3c,0x6f90ea,0xf6f3ff,0xee8fbd,0xffd34a,0xe2dcff],p=S.w(S.add.rectangle(x,y,2,1,cols[ci]??0xf6f3ff,.95).setDepth(4100).setRotation(R()*3));S.petals++;
 S.tweens.add({targets:p,x:x+18+G*60+R()*24,y:y-10-R()*18,rotation:p.rotation+(R()-.5)*9,alpha:0,duration:1300+R()*900,ease:"Sine.easeOut",onComplete:()=>{p.destroy();S.petals--}})}
/* título de região: um de cada vez, nunca por cima de outro */
title(id){const S=this;S.titleDone=S.titleDone||new Set;if(S.titleDone.has(id)||!__RPREG[id])return!1;S.titleDone.add(id);(S.titleQ=S.titleQ||[]).push(id);S.titleOn||S.nextTitle();return!0}
nextTitle(){const S=this,id=(S.titleQ||[]).shift();if(!id||S.leaving){S.titleOn=!1;return}S.titleOn=!0;const L=__L3,F="Georgia, 'Times New Roman', serif",[a,b,c]=__RPREG[id],name=L(a,b,c),sub=L("Floresta de Eldervale","Eldervale Forest","Bosque de Eldervale").toUpperCase();
 const C=S.add.container(_/2,st*.23).setAlpha(0),sh=S.add.image(0,3,"light").setTint(0).setAlpha(.5).setScale(2.8,.6);
 const tx=S.add.text(0,-3,name,{fontFamily:F,fontStyle:"bold",fontSize:"22px",color:"#fbf1d4",stroke:"#2a1808",strokeThickness:3}).setOrigin(.5).setShadow(0,2,"#000000",6,!0,!0).setScale(.94);
 const sb=S.add.text(0,17,sub,{fontFamily:F,fontStyle:"italic",fontSize:"8px",color:"#ecdcac",letterSpacing:3}).setOrigin(.5).setAlpha(0);
 const wl=tx.width/2+12,gl=S.add.graphics();gl.lineStyle(1,0xd9b86a,.95).lineBetween(-wl-58,-3,-wl-4,-3).lineBetween(wl+4,-3,wl+58,-3);gl.fillStyle(0xf2d78f,1);for(const sx of[-1,1]){const dx=sx*wl;gl.fillTriangle(dx-3,-3,dx,-6,dx+3,-3).fillTriangle(dx-3,-3,dx,0,dx+3,-3);gl.fillCircle(sx*(wl+60),-3,1.2)}gl.setScale(0,1);
 C.add([sh,gl,tx,sb]);S.ui.add(C);S.chime();
 S.tweens.add({targets:C,alpha:1,duration:900,ease:"Sine.easeOut"});S.tweens.add({targets:tx,scale:1,duration:1400,ease:"Sine.easeOut"});S.tweens.add({targets:gl,scaleX:1,duration:1100,delay:150,ease:"Cubic.easeOut"});S.tweens.add({targets:sb,alpha:.92,duration:900,delay:450});
 S.time.delayedCall(4300,()=>S.tweens.add({targets:C,alpha:0,y:C.y-6,duration:1100,ease:"Sine.easeIn",onComplete:()=>{C.destroy();S.time.delayedCall(500,()=>S.nextTitle())}}))}
/* sino suave (três notas que somem devagar) e o ronco grave da criatura — sintetizados, sem arquivo */
chime(){const E=this.game.audioEngine,C=E?.ctx;if(!C||C.state!=="running")return;try{const t=C.currentTime,out=E.sfxBus||E.ambientBus||C.destination;[[1046.5,.05,0],[1568,.03,.06],[2093,.016,.12]].forEach(([f,v,d])=>{const o=C.createOscillator(),g=C.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.02);g.gain.exponentialRampToValueAtTime(.0003,t+d+2.6);o.connect(g);g.connect(out);o.start(t+d);o.stop(t+d+2.7)})}catch(e){}}
rumble(v=.14,dur=2.4){const E=this.game.audioEngine,C=E?.ctx;if(!C||C.state!=="running")return;try{const t=C.currentTime,o=C.createOscillator(),g=C.createGain();o.type="sine";o.frequency.setValueAtTime(56,t);o.frequency.exponentialRampToValueAtTime(29,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.3);g.gain.exponentialRampToValueAtTime(.0004,t+dur);o.connect(g);g.connect(E.sfxBus||E.ambientBus||C.destination);o.start(t);o.stop(t+dur+.1)}catch(e){}}
waterPt(v,minR=10,away,minD=0){const S=this;for(let k=0;k<30;k++){const x=v.x+20+Math.random()*(v.width-40),y=v.y+20+Math.random()*(v.height-40);if(S.okArea(x,y,2,minR)&&(!away||Math.hypot(x-away.x,y-away.y)>minD))return{x,y}}return null}
jumpFish(x,y){const S=this,R=Math.random,fr=S.AM?.fish?.S_Swim;if(!fr)return;const dir=R()<.5?-1:1,len=22+R()*16,hgt=16+R()*12,f=S.w(S.add.sprite(x,y,"rp-animals",fr[0]).setDepth(y+30).setScale(1.05).setFlipX(dir>0));
 S.ring(x,y,9);S.drops(x,y,5);const d=Math.hypot(x-(S.mode==="boat"?S.boat.x:S.hx),y-(S.mode==="boat"?S.boat.y:S.hy));d<320&&S.sfx("splash",.22*(1-d/320)+.04,(x-S.cameras.main.midPoint.x)/300);
 S.tweens.addCounter({from:0,to:1,duration:620+R()*200,onUpdate:tw=>{const q=tw.getValue();f.setPosition(x+dir*len*q,y-Math.sin(q*Math.PI)*hgt).setRotation(dir*(-1.1+2.2*q)*.6);f.setFrame(fr[Math.floor(q*8)%fr.length])},onComplete:()=>{const ex=x+dir*len;S.ring(ex,y,11);S.drops(ex,y,6);f.destroy()}})}
bubbles(x,y){const S=this,R=Math.random,n=3+Math.floor(R()*4);for(let k=0;k<n;k++){const bx=x+(R()-.5)*10,by=y+(R()-.5)*6,b=S.w(S.add.circle(bx,by,.9+R()*1.3,0,0).setStrokeStyle(.8,0xeafffa,.85).setDepth(.95).setScale(.4));S.tweens.add({targets:b,scale:1.3,alpha:0,duration:700+R()*600,delay:k*170+R()*120,onComplete:()=>b.destroy()})}S.time.delayedCall(n*170+300,()=>S.ring(x,y,6))}
/* a criatura do Lago Espelhado: primeiro a sombra passa por baixo do barco, depois ela salta ao longe */
levShadow(){const S=this,B=S.boat,R=Math.random;
 /* escolhe a travessia com mais água por baixo (a sombra só aparece sobre a água) */
 let ang=0,best=-1;for(let k=0;k<24;k++){const a=k/24*6.283;let n=0;for(let r=-300;r<=300;r+=20)S.cell(B.x+Math.cos(a)*r,B.y+Math.sin(a)*r)===2&&n++;const sc=n+Math.abs(Math.sin(a-S.bang))*4+R();sc>best&&(best=sc,ang=a)}
 const dx=Math.cos(ang),dy=Math.sin(ang),x0=B.x-dx*300,y0=B.y-dy*300,x1=B.x+dx*320,y1=B.y+dy*320;
 const sh=S.w(S.add.image(x0,y0,"rp-lev").setDepth(.55).setAlpha(0).setScale(1.35).setRotation(ang+Math.PI));S.rumble(.12,3.2);S.time.delayedCall(1200,()=>S.hsay("shadow",__L3("Tem alguma coisa enorme passando embaixo do barco…","Something huge is passing under the boat…","Algo enorme está pasando bajo el barco…")));
 let bt=0;S.tweens.addCounter({from:0,to:1,duration:6200,ease:"Sine.easeInOut",onUpdate:tw=>{const q=tw.getValue(),x=x0+(x1-x0)*q,y=y0+(y1-y0)*q;sh.setPosition(x,y).setScale(1.35,1.35*(1+Math.sin(q*30)*.05));const wet=S.cell(x,y)===2&&(S.cell(x+dx*50,y+dy*50)===2||S.cell(x-dx*50,y-dy*50)===2);sh.setAlpha(sh.alpha+((wet?.34:0)-sh.alpha)*.12);
   bt+=1;bt%9===0&&S.cell(x,y)===2&&S.bubbles(x-dx*60+(Math.random()-.5)*30,y-dy*60+(Math.random()-.5)*30);const dB=Math.hypot(x-B.x,y-B.y);if(dB<60&&!S.levRock){S.levRock=1;S.cameras.main.shake(700,.0022);S.sfx("creak",.6);S.sfx("bump",.35);S.bv.x+=dx*30;S.bv.y+=dy*30}},onComplete:()=>sh.destroy()})}
levBreach(){const S=this,B=S.boat,R=Math.random,v=S.cameras.main.worldView,fw={x:Math.cos(S.bang),y:Math.sin(S.bang)};let p=null;
 for(const rr of[24,18,13])for(let k=0;k<60&&!p;k++){const d=90+R()*90,a=S.bang+(R()-.5)*2.4,x=B.x+Math.cos(a)*d,y=B.y+Math.sin(a)*d;if(S.okArea(x,y,2,rr)&&v.contains(x,y-36)&&v.contains(x,y+10))p={x,y}}if(!p)p=S.waterPt(v,12,B,70);if(!p)return;
 const{x,y}=p,dir=R()<.5?-1:1;for(let k=0;k<3;k++)S.time.delayedCall(k*200,()=>S.ring(x,y,16+k*6));S.bubbles(x,y);S.bubbles(x+12,y+4);
 S.time.delayedCall(700,()=>{const bk=S.w(S.add.image(x,y,"rp-back2").setOrigin(.5,1).setDepth(y+1).setScale(1.3,0).setFlipX(dir>0)),wl=S.w(S.add.ellipse(x,y,118,9,0x24484c,.92).setDepth(y+1.4).setStrokeStyle(1.5,0xeafffa,.7));S.tweens.add({targets:wl,x:x+dir*46,duration:1700,ease:"Sine.easeInOut"});S.time.delayedCall(1700,()=>S.tweens.add({targets:wl,alpha:0,scaleX:1.6,duration:600,onComplete:()=>wl.destroy()}));S.rumble(.16,2.6);S.sfx("splash",.95);S.time.delayedCall(140,()=>S.sfx("splash",.7));S.cameras.main.shake(420,.0035);
  const foam=S.w(S.add.ellipse(x,y,40,12,0xeafffa,.55).setDepth(y+.5));S.tweens.add({targets:foam,scaleX:3.2,scaleY:2.6,alpha:0,duration:2600,onComplete:()=>foam.destroy()});
  for(let k=0;k<46;k++){const sx=x+(R()-.5)*60,c=S.w(S.add.circle(sx,y,.9+R()*1.6,0xf2fffc,.95).setDepth(y+2)),up=18+R()*46,tx=sx+(R()-.5)*50;S.tweens.add({targets:c,x:tx,y:y-up,duration:420+R()*240,ease:"Quad.easeOut",onComplete:()=>S.tweens.add({targets:c,y:y-2+R()*6,alpha:0,duration:420+R()*260,ease:"Quad.easeIn",onComplete:()=>c.destroy()})})}
  for(let k=0;k<4;k++)S.time.delayedCall(k*260,()=>S.ring(x,y,28+k*10));
  S.tweens.add({targets:bk,scaleY:1.3,duration:480,ease:"Sine.easeOut"});S.tweens.add({targets:bk,x:x+dir*46,duration:1700,ease:"Sine.easeInOut"});
  S.time.delayedCall(1150,()=>S.tweens.add({targets:bk,scaleY:0,duration:520,ease:"Sine.easeIn",onComplete:()=>bk.destroy()}));
  S.time.delayedCall(1450,()=>{const fx=x+dir*58,fl=S.w(S.add.image(fx,y,"rp-fluke").setOrigin(.5,1).setDepth(y+1).setScale(1.3,0).setRotation(dir*.12));S.tweens.add({targets:fl,scaleY:1.35,duration:420,ease:"Back.easeOut",yoyo:!0,hold:260,onComplete:()=>{fl.destroy();S.sfx("splash",.8);S.ring(fx,y,22);S.ring(fx,y,34);S.drops(fx,y,14);S.bubbles(fx,y)}})});
  S.time.delayedCall(1300,()=>S.hsay("breach",__L3("O que foi aquilo?! Algo enorme vive neste lago…","What was that?! Something huge lives in this lake…","¡¿Qué fue eso?! Algo enorme vive en este lago…")))})}
updateLife(dt,t,G){const S=this,R=Math.random,v=S.cameras.main.worldView,tw=t/1e3,land=S.mode==="land",hx=land?S.hx:-999,hy=land?S.hy:-999;
 /* flores e capim: a onda do vento corre pelo campo; o herói abre caminho e solta pétalas */
 let nearF=null;for(const f of S.flowers){if(f.x<v.x-10||f.x>v.right+10||f.y<v.y-4||f.y>v.bottom+12)continue;const wv=Math.sin(tw*2.1-f.ph+Math.sin(f.y*.02))*(.07+G*.24)+Math.sin(tw*5.3+f.ph*3)*.025;
  let tb=0;if(land){const dx=f.x-hx,dy=(f.y-hy)*1.6,d=Math.hypot(dx,dy);if(d<15){tb=(dx>=0?1:-1)*.75*(1-d/15);if(!f.grass&&d<10)nearF=f}}f.bend+=(tb-f.bend)*Math.min(1,dt*10);f.rotation=wv+f.bend}
 const hm=land&&Math.hypot(hx-(S.lfx??hx),hy-(S.lfy??hy))>.4;S.lfx=hx;S.lfy=hy;S.ptT=(S.ptT||0)-dt;if(nearF&&hm&&S.ptT<=0&&S.petals<70){S.ptT=.07;S.petal(nearF.x+(R()-.5)*6,nearF.y-4,nearF.ci,G)}
 if(G>.55&&S.petals<50&&R()<dt*G*7){const f=S.flowers[Math.floor(R()*S.flowers.length)];f&&!f.grass&&v.contains(f.x,f.y)&&S.petal(f.x,f.y-4,f.ci,G)}
 /* lagos vivos */
 S.fjT-=dt;if(S.fjT<=0){S.fjT=2.6+R()*4.4;const p=S.waterPt(v,12,S.mode==="boat"?S.boat:{x:hx,y:hy},70);p&&S.jumpFish(p.x,p.y)}
 S.bbT-=dt;if(S.bbT<=0){S.bbT=.9+R()*1.8;const p=S.waterPt(v,8);p&&S.bubbles(p.x,p.y)}
 /* títulos de região e o que acontece em cada uma */
 if(S.mode==="boat"){const B=S.boat;S.gorge?.length&&S.gorge.some(p=>Math.hypot(p[0]-B.x,p[1]-B.y)<150)&&S.title("gorge");S.M.bridge&&Math.hypot(S.M.bridge[0]-B.x,S.M.bridge[1]-B.y)<250&&S.title("bridge");
  const dL=Math.hypot(__RPLAKEB[0]-B.x,__RPLAKEB[1]-B.y);if(dL<__RPLAKEB[2]){S.title("lakeB");if(!S.levOn){S.levOn=1;S.time.delayedCall(3800,()=>S.mode==="boat"&&!S.leaving&&S.levShadow());S.time.delayedCall(12500,()=>S.mode==="boat"&&!S.leaving&&S.levBreach())}}}
 else if(land){const Z=S.M.zones||{},inZ=(q,k=1)=>q&&((hx-q[0])/(q[2]*k))**2+((hy-q[1])/(q[3]*k))**2<1;
  inZ(Z.m1)&&S.title("m1")&&(S.time.delayedCall(2500,()=>S.hsay("flowers",__L3("Quanta cor… nem parece que as Profundezas estão tão perto.","So much color… you'd never guess the Depths are this close.","Cuánto color… nadie diría que las Profundidades están tan cerca."))));
  inZ(Z.g1,1.15)&&S.title("g1");inZ(Z.pond,1.3)&&S.title("pond");
  inZ(Z.m2)&&S.title("m2")&&(S.time.delayedCall(2500,()=>S.hsay("glow",__L3("Essas flores brilham sozinhas… este lugar é encantado.","These flowers glow on their own… this place is enchanted.","Estas flores brillan solas… este lugar está encantado."))));
  if(!S.heroDone.has("deer"))for(const a of S.animals||[])if(a.C.grp==="deer"&&a.st==="idle"&&a.s.visible&&Math.hypot(a.x-hx,a.y-hy)<240){S.hsay("deer",__L3("Cervos… e um filhote. Melhor não assustá-los.","Deer… and a fawn. Better not scare them.","Ciervos… y una cría. Mejor no asustarlos."));break}}}
finish(skip){const S=this;if(S.leaving)return;S.leaving=!0;const go=()=>{try{window.__dubStop?.()}catch(e){}S.audioStop();S.scene.start(S.next.key,S.next.data)};
 S.hero&&S.anims.exists(S.hkey+"-idle")&&S.hero.play(S.hkey+"-idle");const fade=()=>{for(const n in S.au||{})S.gain(n,0,.3)};
 if(skip){fade();S.cameras.main.fadeOut(500,0,0,0);S.uiCam.fadeOut(500,0,0,0);S.time.delayedCall(520,go);return}
 let n=0;const wait=()=>{if((S.speaking||S.queue.length)&&n++<20){S.time.delayedCall(500,wait);return}fade();S.cameras.main.fadeOut(900,0,0,0);S.uiCam.fadeOut(900,0,0,0);S.time.delayedCall(920,go)};S.time.delayedCall(400,wait)}}
