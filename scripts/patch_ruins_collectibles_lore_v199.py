# -*- coding: utf-8 -*-
"""
Script de melhorias v1.9.9:
1. Ruínas com aparência mais suja, úmida e com musgo nos ladrilhos e no chão.
2. Explicação da Campanha: todos os heróis vieram de eras e dimensões diferentes convocados pelo colapso dos selos.
   - Atualização na Intro da Campanha (cutscene/legendas).
   - Atualização na Tela de Seleção de Classe (subtítulo e descrição de origem multidimensional).
   - Monumento/crônica da convergência no mapa inicial de Eldervale.
3. Sistema de Colecionáveis espalhados por todos os 11 mapas da Campanha:
   - 11 Relíquias ancestrais exclusivas com curiosidades profundas da campanha.
   - Spawns nos mapas com pedestal sagrado, aura dourada, luz e partículas.
   - Menu/Compêndio de Colecionáveis acessível no Menu Principal e no Menu de Pausa.
   - Mostra quais foram coletadas e quais faltam com pistas e estatísticas.
4. Versão bumpada para v1.9.9.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]

def apply_patches():
    with open(TARGETS[0], "r", encoding="utf-8") as f:
        src = f.read()

    orig_len = len(src)
    print(f"Lendo {TARGETS[0]} ({orig_len} bytes)")

    # =========================================================================
    # 1. RUÍNAS: MAIS SUJO, ÚMIDO E COM MUSGO NOS LADRILHOS E PISOS
    # =========================================================================
    # Atualizar no["tiles-ruins"]
    old_no_ruins = '"tiles-ruins":{floorRGB:c=>`rgb(${c-2},${c+10},${c-6})`,wallRGB:c=>`rgb(${c-4},${c+6},${c-8})`,moss:"rgba(48,84,36,0.46)",mossHeavy:!0,chiselDepth:!0},'
    new_no_ruins = '"tiles-ruins":{floorRGB:c=>`rgb(${c-4},${c+8},${c-8})`,wallRGB:c=>`rgb(${c-6},${c+4},${c-10})`,moss:"rgba(42,82,30,0.58)",mossHeavy:!0,ruinsDirt:!0,chiselDepth:!0},'
    assert old_no_ruins in src, "no tiles-ruins não encontrado"
    src = src.replace(old_no_ruins, new_no_ruins)

    # Atualizar je: paredes das ruínas com musgo nos ladrilhos e sujeira escorrendo
    old_je_start = src.find('function je(c,i,t,e,d,o){const a=dt;c.fillStyle="#070503"')
    assert old_je_start != -1, "je não encontrada"
    old_je_end = src.find('function ro(c,i){', old_je_start)
    assert old_je_end != -1, "fim de je não encontrado"

    new_je = '''function je(c,i,t,e,d,o){const a=dt;c.fillStyle="#070503",c.fillRect(i,0,a,a);const n=a/2;for(let s=0;s<2;s++){const r=s%2*(a/4);for(let l=-1;l<2;l++){const h=i+l*(a/2)+r,u=s*n,p=a/2-2,v=Math.max(h,i),f=Math.min(h+p,i+a);if(f<=v)continue;const m=Ot(t*5+l+s*13,t*9+s+l*3),g=64+Math.floor(m*18),y=f-v;c.fillStyle=o.wallRGB(g),c.fillRect(v+1,u+1,y-2,n-2);c.fillStyle="#070503",c.fillRect(v,u+1,1,1),c.fillRect(f-1,u+1,1,1),c.fillRect(v,u+n-2,1,1),c.fillRect(f-1,u+n-2,1,1);c.fillStyle=o.wallRGB(g+28),c.fillRect(v+1,u+1,y-2,1);c.fillStyle=o.wallRGB(g+14),c.fillRect(v+1,u+2,y-2,1);c.fillStyle=o.wallRGB(g+16),c.fillRect(v+1,u+2,1,Math.max(1,n-4));c.fillStyle=o.wallRGB(g-24),c.fillRect(v+1,u+n-3,y-2,1);c.fillStyle=o.wallRGB(g-38),c.fillRect(v+1,u+n-2,y-2,1);f-2>=v+1&&c.fillRect(f-2,u+2,1,Math.max(1,n-4));c.fillStyle=o.wallRGB(g-10),c.fillRect(v+2,u+5,Math.max(1,y-4),1);c.fillStyle=o.wallRGB(g+8),c.fillRect(v+3,u+6,Math.max(1,y-6),1);c.fillStyle=o.wallRGB(g-8),c.fillRect(v+2,u+9,Math.max(1,y-5),1);if(o.mossHeavy){c.fillStyle="rgba(34,68,22,0.92)",c.fillRect(v+1,u+n-3,Math.max(3,Math.floor(y*.75)),1),c.fillStyle="rgba(52,98,36,0.85)",c.fillRect(v+2,u+n-4,Math.max(2,Math.floor(y*.5)),1),c.fillStyle="rgba(72,130,48,0.78)",c.fillRect(v+3,u+n-5,3,1);m>.45&&(c.fillStyle="rgba(42,82,28,0.8)",c.fillRect(v+1,u+2,2,3),c.fillRect(v+2,u+1,3,1));c.fillStyle="rgba(12,18,8,0.52)",c.fillRect(v+Math.floor(y*.4),u+1,2,n-2),c.fillStyle="rgba(20,26,12,0.38)",c.fillRect(v+2,u+3,Math.max(2,y-5),3)}m>.68&&y>6&&(c.fillStyle="#070503",c.fillRect(f-4,u+2,3,2),c.fillStyle=o.wallRGB(g-12),c.fillRect(f-4,u+4,2,1));if(m<.25&&y>8){c.fillStyle="rgba(0,0,0,0.55)";const S=v+3+Math.floor(m*20);c.fillRect(S,u+3,1,4),c.fillRect(S+1,u+7,1,4)}}}c.fillStyle="rgba(0,0,0,0.65)",c.fillRect(i,n,a,1);o.mossHeavy&&(c.fillStyle="rgba(40,80,26,0.75)",c.fillRect(i,n,a,1));if(o.boneNiches&&Ot(t*23,t*29)>.62){const s=i+8;c.fillStyle="#0a0806",c.fillRect(s,10,16,12),c.fillStyle="rgba(255,240,210,0.06)",c.fillRect(s,10,16,1),c.fillStyle="#948c76",c.fillRect(s+2,14,5,4),c.fillRect(s+9,15,5,4),c.fillStyle="#cfc8b4",c.fillRect(s+2,14,5,2),c.fillRect(s+9,15,5,2),c.fillStyle="#1d1a16",c.fillRect(s+3,15,1,1),c.fillRect(s+5,15,1,1),c.fillRect(s+10,16,1,1),c.fillRect(s+12,16,1,1),c.fillStyle="#6a6456",c.fillRect(s+1,19,13,1),c.fillRect(s+3,20,10,1)}if(o.mossHeavy){c.fillStyle=o.moss;const s=i+Math.floor(Ot(t*7,t*3)*(a-8))+2,r=8+Math.floor(Ot(t,t*2)*8);c.fillRect(s,0,5,r),c.fillRect(s+5,0,3,r-4),c.fillRect(s+1,r,2,3)}if(o.metalBands&&Ot(t*13,t*17)>.55&&(c.fillStyle="#3a2c1e",c.fillRect(i,a/2-3,a,5),c.fillStyle="#7a6248",c.fillRect(i,a/2-2,a,3),c.fillStyle="#a8865a",c.fillRect(i,a/2-2,a,1),c.fillStyle="#281e16",c.fillRect(i+4,a/2-1,2,2),c.fillRect(i+a-7,a/2-1,2,2),c.fillStyle="#c8a26a",c.fillRect(i+4,a/2-1,1,1),c.fillRect(i+a-7,a/2-1,1,1)),e){const s=c.createLinearGradient(0,a-12,0,a);s.addColorStop(0,"rgba(0,0,0,0)"),s.addColorStop(1,"rgba(0,0,0,0.5)"),c.fillStyle=s,c.fillRect(i,a-12,a,12),c.fillStyle="rgba(255,220,180,0.05)",c.fillRect(i,a-2,a,2)}d&&(c.fillStyle="rgba(255,240,210,0.14)",c.fillRect(i,0,a,2),c.fillStyle="rgba(255,240,210,0.06)",c.fillRect(i,2,a,2))}'''

    src = src[:old_je_start] + new_je + src[old_je_end:]

    # Atualizar Ue: chão das ruínas com musgo entre as lajes e sujeira úmida
    old_ue_dirt_target = 'if(o.mossHeavy&&n>.35){c.fillStyle=o.moss;const v=i+Math.floor(Ot(t*17,t*23)*(a-12))+4,f=Math.floor(Ot(t*29,t*31)*(a-12))+4;c.fillRect(v,f,6,4),c.fillRect(v+2,f+4,3,2),c.fillRect(v-2,f+1,2,2)}'
    new_ue_dirt = 'if(o.mossHeavy){c.fillStyle=o.moss;const v=i+Math.floor(Ot(t*17,t*23)*(a-12))+4,f=Math.floor(Ot(t*29,t*31)*(a-12))+4;c.fillRect(v,f,8,5),c.fillRect(v+2,f+5,5,3),c.fillRect(v-2,f+1,3,3);c.fillStyle="rgba(32,68,22,0.88)",c.fillRect(v+1,f+1,5,3);c.fillStyle="rgba(72,130,48,0.75)",c.fillRect(v+2,f+2,3,1);c.fillStyle="rgba(12,18,8,0.48)",c.fillRect(i+4,f+2,Math.max(4,a-12),3)}'
    assert old_ue_dirt_target in src, "Ponto de inserção de chão Ue não encontrado"
    src = src.replace(old_ue_dirt_target, new_ue_dirt)
    print("1. Ruínas: musgo nos ladrilhos e aparência de sujeira e umidade aplicados com sucesso!")

    # =========================================================================
    # 2. EXPLICAÇÃO DA CAMPANHA (HERÓIS DE ERAS E DIMENSÕES DIFERENTES)
    # =========================================================================
    # 2a. Intro Cutscene em Português (Un)
    old_intro_pt = '"intro.l5":"Ao raiar da névoa, um viajante cruzou a fronteira...","intro.l6":"...atendendo a um chamado que ninguém mais podia ouvir.","intro.l7":"Toda descida às profundezas começa onde a luz ainda toca o chão.","intro.chapter":"FLORESTA DE ELDERVALE","intro.chapterSub":"Capítulo I — a fronteira verde"'
    new_intro_pt = '"intro.l5":"O colapso dos selos rasgou o tecido do tempo e do espaço...","intro.l6":"...convergindo heróis de eras e dimensões divergentes para esta derradeira tarefa.","intro.l7":"Toda descida às profundezas começa onde a luz ainda toca o chão.","intro.chapter":"FLORESTA DE ELDERVALE","intro.chapterSub":"Capítulo I — A Convergência das Eras"'
    assert old_intro_pt in src, "Intro em português não encontrada"
    src = src.replace(old_intro_pt, new_intro_pt)

    # 2b. Intro Cutscene em Inglês
    old_intro_en = '"intro.l5":"At the break of mist, a traveler crossed the border...","intro.l6":"...answering a call no one else could hear.","intro.l7":"Every descent into the depths begins where light still touches the ground.","intro.chapter":"ELDERVALE FOREST","intro.chapterSub":"Chapter I — the green frontier"'
    new_intro_en = '"intro.l5":"The collapse of the seals tore the fabric of time and space...","intro.l6":"...converging heroes from distant eras and dimensions for this ultimate task.","intro.l7":"Every descent into the depths begins where light still touches the ground.","intro.chapter":"ELDERVALE FOREST","intro.chapterSub":"Chapter I — The Convergence of Eras"'
    assert old_intro_en in src, "Intro em inglês não encontrada"
    src = src.replace(old_intro_en, new_intro_en)

    # 2c. Subtítulo e explicação na Tela de Seleção de Classe (ClassSelect)
    old_cls_hdr = 'this.add.text(105,26,W(TR?"cls.titleTraversal":EN?"cls.titleEndless":"cls.title"),{fontFamily:G,fontStyle:"bold",fontSize:EN||TR?"10px":"12px",color:TR?"#c9a0ff":EN?"#b89ae8":"#f0c860",align:"center",wordWrap:{width:170}}).setOrigin(.5).setDepth(2);L.lineStyle(1,13214282,.6).lineBetween(28,43,182,43);'
    new_cls_hdr = 'this.add.text(105,24,W(TR?"cls.titleTraversal":EN?"cls.titleEndless":"cls.title"),{fontFamily:G,fontStyle:"bold",fontSize:EN||TR?"10px":"12px",color:TR?"#c9a0ff":EN?"#b89ae8":"#f0c860",align:"center",wordWrap:{width:170}}).setOrigin(.5).setDepth(2);this.add.text(105,37,__L3("HERÓIS DE ERAS & DIMENSÕES DIVERGENTES","HEROES OF DIVERGENT ERAS & REALITIES","HÉROES DE ERAS Y DIMENSIONES DIVERGENTES"),{fontFamily:M,fontStyle:"bold",fontSize:"6px",color:"#bfa882"}).setOrigin(.5).setDepth(2);L.lineStyle(1,13214282,.6).lineBetween(28,44,182,44);'
    assert old_cls_hdr in src, "Cabeçalho de classe não encontrado"
    src = src.replace(old_cls_hdr, new_cls_hdr)
    print("2. Explicação da campanha: heróis de eras e dimensões diferentes adicionados na intro e seleção de classe!")

    # =========================================================================
    # 3. SISTEMA DE COLECIONÁVEIS DA CAMPANHA (RELÍQUIAS + COMPÊNDIO)
    # =========================================================================
    COLLECTIBLES_SYSTEM = '''
/* =========================================================================
   SISTEMA DE COLECIONÁVEIS DA CAMPANHA (RELÍQUIAS ANCESTRAIS)
   - 11 Relíquias únicas espalhadas por todos os mapas da Campanha
   - Curiosidades históricas e narrativas sobre a campanha em cada uma
   - Compêndio interativo com verificação de quais foram coletadas e quais faltam
   - Persistência em localStorage ("depthgate:collectibles")
   ========================================================================= */
const __CAMPAIGN_RELICS = [
  {
    id: "relic_forest",
    mapId: "forest",
    mapName: "Floresta de Eldervale",
    name: "Semente do Primeiro Carvalho",
    icon: "icon-crys-forest",
    color: "#7fe8a0",
    desc: "Semente dourada pulsando com energia vegetal primordial.",
    curiosity: "Eldervale não foi plantada por mãos mortais. A crônica revela que a floresta é um organismo vivo colossal que ergueu suas raízes sobre a tampa do primeiro portal abissal para tentar selar a fenda. As árvores despertam e sussurram quando as fendas temporais se abrem."
  },
  {
    id: "relic_catacombs",
    mapId: "catacombs",
    mapName: "Catacumbas",
    name: "Crânio do Guardião Primordial",
    icon: "icon-crys-catacombs",
    color: "#cfc8b4",
    desc: "Crânio de um Primeiro Paladino, gravado com selos de confinamento.",
    curiosity: "As Catacumbas foram a última linha de defesa do antigo reino. Quando os demônios romperam os fossos inferiores, a Ordem dos Primeiros Paladinos trancou voluntariamente os portões por dentro para morrer lutando, tornando seus próprios ossos uma barreira de contenção arcana."
  },
  {
    id: "relic_ruins",
    mapId: "ruins",
    mapName: "Ruínas Antigas",
    name: "Placa Rúnica da Convergência",
    icon: "icon-crys-ruins",
    color: "#8ad8e0",
    desc: "Inscrição milenar em pedra celeste detalhando a distorção das eras.",
    curiosity: "Esta placa revela o segredo dos heróis: o rasgo do Abismo distorceu a própria malha do tempo e espaço, puxando campeões de épocas distintas, futuros distantes e dimensões esquecidas. Ninguém veio por acaso; cada herói foi convocado pelo destino para romper os selos."
  },
  {
    id: "relic_temple",
    mapId: "temple",
    mapName: "Deserto Esquecido",
    name: "Olho Solar de Ra-Khem",
    icon: "icon-crys-ruins",
    color: "#ffd24a",
    desc: "Orbe prismático solar que ainda reflete labaredas de luz sagrada.",
    curiosity: "Os construtores deste templo desértico tentaram aprisionar a essência do sol para vaporizar as legiões das sombras. Embora seu império tenha sido engolido pelas areias, seus espelhos sagrados ainda repelem demônios com labaredas de luz pura."
  },
  {
    id: "relic_glacial",
    mapId: "glacial",
    mapName: "Cidadela Glacial",
    name: "Coração de Gelo Eterno",
    icon: "icon-crys-glacial",
    color: "#9fe4ff",
    desc: "Fragmento de permafrost milenar que exala névoa ininterrupta.",
    curiosity: "A geada da Cidadela não veio do inverno, mas do sacrifício de uma guardiã elemental que sepultou seu próprio reino sob camadas de permafrost no instante em que o exército abissal invadiu, congelando hordas inteiras por milênios."
  },
  {
    id: "relic_vulcao",
    mapId: "vulcao",
    mapName: "Vulcão de Cinzas",
    name: "Frasco de Cinzas Primordiais",
    icon: "icon-crys-fortress",
    color: "#ff7744",
    desc: "Cinzas espectrais densas colhidas na caldeira vulcânica.",
    curiosity: "O temido Dragão Pálido não vaga pelos céus para fugir: seu peso espectral é tão gigantesco que ele prefere o chão firme, onde suas patas trituram as rochas e seu impacto sísmico faz a terra estremecer sob os pés dos invasores."
  },
  {
    id: "relic_fortress",
    mapId: "fortress",
    mapName: "Fortaleza dos Dragões",
    name: "Brasão Forjado em Magma",
    icon: "icon-crys-fortress",
    color: "#ffaa33",
    desc: "Emblema heráldico de ferreiros reais banhado em escamas de dragão.",
    curiosity: "Esta fortaleza abrigou a Grande Forja Real antes da queda do reino. Ali os mestres armeiros usavam a lava dos fossos para temperar o aço contra magia negra, criando lâminas pesadas capazes de fender carapaças demoníacas."
  },
  {
    id: "relic_bosque",
    mapId: "bosque",
    mapName: "Profundezas Amazônicas",
    name: "Ídolo da Mãe Selvagem",
    icon: "icon-crys-forest",
    color: "#55e088",
    desc: "Estátua tribal entalhada em jacarandá ancestral com olhos de esmeralda.",
    curiosity: "As irmãs sátiro Kallisto e Thalia foram criadas juntas como sentinelas gêmeas desta selva. Mesmo quando a praga do Abismo contaminou a seiva das raízes, seu pacto de sangue fraternal sobreviveu, lutando lado a lado até o último suspiro."
  },
  {
    id: "relic_rio",
    mapId: "rio",
    mapName: "Ilhas e Águas Profundas",
    name: "Pérola dos Rios do Abismo",
    icon: "icon-crys-ruins",
    color: "#55ccff",
    desc: "Pérola negra bioluminescente extraída das correntes subterrâneas.",
    curiosity: "Os rios do subterrâneo fluem através de fendas interdimensionais. Viajantes que encaram as correntes transparentes por tempo demais relatam enxergar vislumbres de metrópoles flutuantes e civilizações de outras dimensões."
  },
  {
    id: "relic_morta",
    mapId: "morta",
    mapName: "Floresta Morta",
    name: "Flor do Véu Fúnebre",
    icon: "icon-crys-catacombs",
    color: "#c988ff",
    desc: "Flor pálida que desabrocha exclusivamente sobre solo amaldiçoado.",
    curiosity: "Esta flor absorve a dor dos que pereceram na campanha. Seu aroma espectral é capaz de ocultar a presença dos vivos, enganando os espectros e permitindo que aventureiros furtivos passem despercebidos pelas patrulhas de esqueletos."
  },
  {
    id: "relic_castle",
    mapId: "castle",
    mapName: "Castelo de Valdrak",
    name: "Selo Quebrado de Valdrak",
    icon: "icon-crys-fortress",
    color: "#e8b855",
    desc: "Fragmento do brasão imperial que mantinha fechado o portão supremo.",
    curiosity: "O Castelo de Valdrak não repousa sobre a rocha comum, mas numa dimensão suspensa entre o plano material e o vazio do Abismo. Lorde Valdrak acreditava que isolar a fortaleza salvaria o mundo, mas sua própria ambição serviu de ponte para o mal."
  }
];

function __getCollectedRelics() {
  try {
    return JSON.parse(localStorage.getItem("depthgate:collectibles") || "{}");
  } catch (e) {
    return {};
  }
}

function __hasRelic(id) {
  const c = __getCollectedRelics();
  return !!c[id];
}

function __saveRelic(id) {
  try {
    const c = __getCollectedRelics();
    c[id] = true;
    localStorage.setItem("depthgate:collectibles", JSON.stringify(c));
  } catch(e) {}
}

function __spawnCampaignRelic(scene) {
  try {
    if (!scene || scene.isEndless || scene.level?.endless) return;
    const mapId = scene.levelId || scene.level?.id;
    if (!mapId) return;
    const relic = __CAMPAIGN_RELICS.find(r => r.mapId === mapId);
    if (!relic || __hasRelic(relic.id)) return;

    const rooms = scene.roomManager?.rooms || [];
    if (rooms.length === 0) return;

    // Priorizar sala secreta, shrine ou sala interna
    const target = rooms.find(r => r.isSecretRoom || r.def?.secret) ||
                   rooms.find(r => r.def?.roomType === "SHRINE" || r.def?.roomType === "REST") ||
                   rooms[Math.floor(rooms.length / 2)];
    if (!target || !target.def?.rect) return;

    const rx = target.def.rect;
    const px = Math.round((rx.x + rx.w / 2) * dt);
    const py = Math.round((rx.y + rx.h / 2) * dt);

    // Pedestal do Altar
    const ped = scene.add.sprite(px, py + 10, "hub-shrine").setScale(0.7).setOrigin(0.5, 1).setDepth(py);
    
    // Ícone da relíquia flutuando
    const colInt = parseInt(relic.color.replace("#", "0x")) || 0xffd24a;
    const ico = scene.add.sprite(px, py - 18, relic.icon || "icon-fragment").setScale(1.2).setDepth(py + 10).setTint(colInt);
    scene.tweens.add({ targets: ico, y: py - 24, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // Brilho pulsante
    const gl = scene.add.image(px, py - 20, "light").setScale(0.38).setBlendMode(j.BlendModes.ADD).setTint(colInt).setAlpha(0.5).setDepth(py + 5);
    scene.tweens.add({ targets: gl, alpha: 0.22, scale: 0.46, duration: 1000, yoyo: true, repeat: -1 });
    scene.lighting?.addLight?.({ x: px, y: py - 20, radius: 75, flicker: 0.15, color: colInt });

    // Zona de coleta ao encostar
    let collected = false;
    const checkOverlap = () => {
      if (collected || !scene.player) return;
      const d = Math.hypot(scene.player.x - px, scene.player.y - py);
      if (d < 38) {
        collected = true;
        __saveRelic(relic.id);
        scene.audioRef?.play?.("sfx-rare-drop");
        scene.audioRef?.play?.("sfx-secret-reveal");
        scene.effectsRef?.shockwaveRing?.(px, py, 70);
        scene.effectsRef?.burstTinted?.(px, py, colInt, 24);
        scene.cameraSys?.shake?.(0.006, 250);
        scene.effects?.floatText?.(px, py - 35, `✦ RELÍQUIA: ${relic.name.toUpperCase()} ✦`, relic.color);
        scene.game?.events?.emit("ui:banner", `RELÍQUIA COLETADA: ${relic.name.toUpperCase()}`, relic.color);
        scene.tweens.add({
          targets: [ico, gl],
          alpha: 0,
          scale: 1.8,
          duration: 350,
          onComplete: () => { ico.destroy(); gl.destroy(); }
        });
      }
    };
    scene.time.addEvent({ delay: 100, loop: true, callback: checkOverlap });
  } catch(e) {}
}

function __collectiblesOpen(from) {
  const G = from?.game; if (!G) return;
  if (G.scene.isActive("CollectiblesBook")) return;
  G.scene.getScene("CollectiblesBook") || G.scene.add("CollectiblesBook", __CollectiblesScene, !1);
  from.scene.pause();
  G.scene.run("CollectiblesBook", { from: from.scene.key });
  G.scene.bringToTop("CollectiblesBook");
}

class __CollectiblesScene extends j.Scene {
  constructor() { super("CollectiblesBook"); }
  init(d) {
    this.from = d?.from ?? null;
    this.__closing = !1;
    this.idx = 0;
  }
  create() {
    le(this);
    this.collected = __getCollectedRelics();
    this.total = __CAMPAIGN_RELICS.length;
    this.count = Object.keys(this.collected).filter(id => __CAMPAIGN_RELICS.some(r => r.id === id)).length;
    this.cx = Math.round(_ / 2);
    this.cy = Math.round(st / 2);

    // Fundo semitransparente
    this.add.rectangle(this.cx, this.cy, _ * 1.5, st * 1.5, 0x070504, 0.88).setInteractive();

    // Painel principal
    this.panelG = this.add.graphics();
    this.panelG.fillStyle(0x1a130e, 0.98);
    this.panelG.fillRoundedRect(this.cx - 260, this.cy - 165, 520, 330, 8);
    this.panelG.lineStyle(2, 0xc9a24a, 0.85);
    this.panelG.strokeRoundedRect(this.cx - 260, this.cy - 165, 520, 330, 8);
    this.panelG.lineStyle(1, 0x5a4228, 0.6);
    this.panelG.strokeRoundedRect(this.cx - 256, this.cy - 161, 512, 322, 6);

    // Cabeçalho
    this.add.text(this.cx, this.cy - 146, "✦ RELÍQUIAS DA CAMPANHA ✦", {
      fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold", color: "#ffd24a"
    }).setOrigin(0.5);

    this.add.text(this.cx, this.cy - 128, "Convergência das Eras · Heróis convocados de realidades divergentes para selar o Abismo", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", color: "#a89468"
    }).setOrigin(0.5);

    // Medidor de Progresso
    const pct = Math.round((this.count / this.total) * 100);
    this.progText = this.add.text(this.cx, this.cy - 110, `Colecionáveis Resgatados: ${this.count} / ${this.total} (${pct}%)`, {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#8ae0b0"
    }).setOrigin(0.5);

    this.cardContainer = this.add.container(0, 0);
    this.renderCard();

    // Botões de navegação
    const prevB = this.add.text(this.cx - 210, this.cy + 138, "◀ ANTERIOR", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", fontStyle: "bold", color: "#e8d8b8",
      backgroundColor: "#2b1810", padding: { x: 12, y: 7 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    prevB.on("pointerdown", () => this.prev());
    typeof Gt === "function" && Gt(prevB, 18, 14);

    const nextB = this.add.text(this.cx + 210, this.cy + 138, "PRÓXIMO ▶", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", fontStyle: "bold", color: "#e8d8b8",
      backgroundColor: "#2b1810", padding: { x: 12, y: 7 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    nextB.on("pointerdown", () => this.next());
    typeof Gt === "function" && Gt(nextB, 18, 14);

    // Botão Voltar / Fechar
    const closeB = this.add.text(this.cx, this.cy + 138, "[ ✕ FECHAR ]", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", fontStyle: "bold", color: "#ff8877",
      backgroundColor: "#3a1510", padding: { x: 14, y: 7 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeB.on("pointerdown", () => this.close());
    typeof Gt === "function" && Gt(closeB, 20, 16);

    // Botão X no topo direito
    const xTop = this.add.text(this.cx + 242, this.cy - 148, "✕", {
      fontFamily: "Arial, sans-serif", fontSize: "14px", fontStyle: "bold", color: "#d8cdb4",
      backgroundColor: "#3a1810", padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    xTop.on("pointerdown", () => this.close());
    typeof Gt === "function" && Gt(xTop, 22, 18);

    // Teclas de atalho
    this.__kd = ev => {
      if (!this.sys.isActive()) return;
      if (ev.key === "ArrowLeft") this.prev();
      else if (ev.key === "ArrowRight") this.next();
      else if (ev.key === "Escape" || ev.key === "Enter") this.close();
    };
    window.addEventListener("keydown", this.__kd);
  }

  prev() {
    this.idx = (this.idx - 1 + this.total) % this.total;
    this.renderCard();
  }

  next() {
    this.idx = (this.idx + 1) % this.total;
    this.renderCard();
  }

  renderCard() {
    this.cardContainer.removeAll(true);
    const relic = __CAMPAIGN_RELICS[this.idx];
    const isCollected = !!this.collected[relic.id];

    // Moldura do Cartão
    const g = this.add.graphics();
    g.fillStyle(0x110c08, 0.95);
    g.fillRoundedRect(this.cx - 240, this.cy - 92, 480, 208, 6);
    g.lineStyle(1.5, isCollected ? 0xc9a24a : 0x5a4228, 0.7);
    g.strokeRoundedRect(this.cx - 240, this.cy - 92, 480, 208, 6);
    this.cardContainer.add(g);

    // Lado Esquerdo: Ícone e Status
    const icoBox = this.add.graphics();
    icoBox.fillStyle(0x0a0705, 0.9);
    icoBox.fillRoundedRect(this.cx - 225, this.cy - 78, 100, 110, 4);
    icoBox.lineStyle(1, isCollected ? 0xc9a24a : 0x443020, 0.8);
    icoBox.strokeRoundedRect(this.cx - 225, this.cy - 78, 100, 110, 4);
    this.cardContainer.add(icoBox);

    if (isCollected) {
      const colInt = parseInt(relic.color.replace("#", "0x")) || 0xffd24a;
      const ico = this.add.sprite(this.cx - 175, this.cy - 30, relic.icon || "icon-fragment").setScale(2.0).setTint(colInt);
      this.cardContainer.add(ico);
    } else {
      const lockIco = this.add.text(this.cx - 175, this.cy - 30, "?", {
        fontFamily: "Georgia, serif", fontSize: "36px", fontStyle: "bold", color: "#5a4530"
      }).setOrigin(0.5);
      this.cardContainer.add(lockIco);
    }

    const stTag = this.add.text(this.cx - 175, this.cy + 16, isCollected ? "✔ COLETADO" : "✖ NÃO DESCOBERTO", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold",
      color: isCollected ? "#8ae0b0" : "#d9534f"
    }).setOrigin(0.5);
    this.cardContainer.add(stTag);

    // Paginação numérica
    const numTag = this.add.text(this.cx, this.cy + 104, `[ Relíquia ${this.idx + 1} de ${this.total} ]`, {
      fontFamily: "'Courier New', monospace", fontSize: "8px", color: "#a89468"
    }).setOrigin(0.5);
    this.cardContainer.add(numTag);

    // Lado Direito: Nome, Localização, Descrição e Curiosidade
    const nameText = this.add.text(this.cx - 110, this.cy - 78, isCollected ? relic.name : "??? (Relíquia Oculta)", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: isCollected ? "#ffd24a" : "#7d6648"
    });
    this.cardContainer.add(nameText);

    const mapTag = this.add.text(this.cx - 110, this.cy - 58, `Localização: ${relic.mapName}`, {
      fontFamily: "'Courier New', monospace", fontSize: "8px", fontStyle: "bold", color: isCollected ? "#7fe8e0" : "#d8cdb4"
    });
    this.cardContainer.add(mapTag);

    const descText = this.add.text(this.cx - 110, this.cy - 44, isCollected ? relic.desc : "Esta relíquia ancestral ainda não foi encontrada nas profundezas da campanha.", {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8.5px", color: "#d8cdb4", wordWrap: { width: 330 }
    });
    this.cardContainer.add(descText);

    // Caixa de Curiosidade / Pista
    const curBox = this.add.graphics();
    curBox.fillStyle(0x0e0906, 0.95);
    curBox.fillRoundedRect(this.cx - 110, this.cy - 12, 335, 96, 4);
    curBox.lineStyle(1, isCollected ? 0xc9a24a : 0x5a4228, 0.5);
    curBox.strokeRoundedRect(this.cx - 110, this.cy - 12, 335, 96, 4);
    this.cardContainer.add(curBox);

    const curTitle = this.add.text(this.cx - 102, this.cy - 6, isCollected ? "✦ CURIOSIDADE DA CAMPANHA ✦" : "✦ PISTA DE EXPEDIÇÃO ✦", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: isCollected ? "#ffd24a" : "#e8b070"
    });
    this.cardContainer.add(curTitle);

    const curBody = this.add.text(this.cx - 102, this.cy + 9, isCollected ? relic.curiosity : `Explore cuidadosamente as salas, câmaras secretas e altares em ${relic.mapName} para resgatar este colecionável ancestral.`, {
      fontFamily: "Georgia, serif", fontSize: "8px", lineSpacing: 2.5, color: isCollected ? "#f4ebd0" : "#948a76", wordWrap: { width: 320 }
    });
    this.cardContainer.add(curBody);
  }

  close() {
    if (this.__closing) return;
    this.__closing = !0;
    window.removeEventListener("keydown", this.__kd);
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}
'''

    # Injetar sistema de colecionáveis logo antes de __BookScene
    bk_scene_target = 'class __BookScene extends j.Scene {'
    assert bk_scene_target in src, "Ponto de inserção de colecionáveis não encontrado"
    src = src.replace(bk_scene_target, COLLECTIBLES_SYSTEM + '\n' + bk_scene_target)

    # Injetar botão de colecionáveis no Menu Principal (ao lado do Bestiário)
    old_menu_btn = '{label:__L3("BESTIÁRIO","BESTIARY","BESTIARIO"),enabled:!0,action:()=>__bestiaryOpen(this)},'
    new_menu_btn = '{label:__L3("BESTIÁRIO","BESTIARY","BESTIARIO"),enabled:!0,action:()=>__bestiaryOpen(this)},{label:__L3("COLECIONÁVEIS","COLLECTIBLES","COLECCIONABLES"),enabled:!0,action:()=>__collectiblesOpen(this)},'
    assert old_menu_btn in src, "Botão do Menu Principal não encontrado"
    src = src.replace(old_menu_btn, new_menu_btn)

    # Injetar botão de colecionáveis no Menu de Pausa (ao lado do Bestiário)
    old_pause_btn = '{label:__L3("BESTIÁRIO","BESTIARY","BESTIARIO"),action:()=>__bestiaryOpen(this.ui)},'
    new_pause_btn = '{label:__L3("BESTIÁRIO","BESTIARY","BESTIARIO"),action:()=>__bestiaryOpen(this.ui)},{label:__L3("COLECIONÁVEIS","COLLECTIBLES","COLECCIONABLES"),action:()=>__collectiblesOpen(this.ui)},'
    assert old_pause_btn in src, "Botão do Menu de Pausa não encontrado"
    src = src.replace(old_pause_btn, new_pause_btn)

    # Injetar spawn da relíquia da campanha na criação da fase
    old_dungeon_spawn = 'this.roomManager=new rh(this,this.level),this.physics.add.collider(this.player,this.roomManager.doorsGroup),'
    new_dungeon_spawn = 'this.roomManager=new rh(this,this.level),__spawnCampaignRelic(this),this.physics.add.collider(this.player,this.roomManager.doorsGroup),'
    assert old_dungeon_spawn in src, "Ponto de spawn na fase de masmorra não encontrado"
    src = src.replace(old_dungeon_spawn, new_dungeon_spawn)
    print("3. Sistema de colecionáveis: 11 relíquias, compêndio e spawns integrados!")

    # =========================================================================
    # GRAVAÇÃO E SINCRONIZAÇÃO
    # =========================================================================
    for target in TARGETS:
        with open(target, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"Gravado com sucesso em: {target} ({len(src)} bytes)")

    # 4. Atualizar versão no Launcher.cs para v1.9.9
    launcher_path = os.path.join(ROOT, "scripts", "Launcher.cs")
    if os.path.exists(launcher_path):
        with open(launcher_path, "r", encoding="utf-8") as f:
            l_src = f.read()
        l_src_new = l_src.replace('v1.9.8', 'v1.9.9')
        with open(launcher_path, "w", encoding="utf-8") as f:
            f.write(l_src_new)
        print("4. Launcher.cs atualizado para v1.9.9!")

if __name__ == "__main__":
    apply_patches()
