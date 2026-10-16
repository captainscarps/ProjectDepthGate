import os

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"
JS_PATHS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

NEW_RELICS_BLOCK = '''/* =========================================================================
   SISTEMA DE COLECIONÁVEIS DA CAMPANHA (RELÍQUIAS ANCESTRAIS)
   - 11 Relíquias únicas espalhadas por todos os mapas da Campanha
   - Curiosidades históricas e narrativas sobre a campanha em cada uma
   - Compêndio interativo em Grid com silhuetas misteriosas para não localizados
   - Painel de detalhes limpo sem vazamento de texto e sem sobreposição de toques
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
    icon: "icon-crys-bosque",
    color: "#55e088",
    desc: "Estátua tribal entalhada em jacarandá ancestral com olhos de esmeralda.",
    curiosity: "As irmãs sátiro Kallisto e Thalia foram criadas juntas como sentinelas gêmeas desta selva. Mesmo quando a praga do Abismo contaminou a seiva das raízes, seu pacto de sangue fraternal sobreviveu, lutando lado a lado até o último suspiro."
  },
  {
    id: "relic_rio",
    mapId: "rio",
    mapName: "Ilhas e Águas Profundas",
    name: "Pérola dos Rios do Abismo",
    icon: "icon-crys-rio",
    color: "#55ccff",
    desc: "Pérola negra bioluminescente extraída das correntes subterrâneas.",
    curiosity: "Os rios do subterrâneo fluem através de fendas interdimensionais. Viajantes que encaram as correntes transparentes por tempo demais relatam enxergar vislumbres de metrópoles flutuantes e civilizações de outras dimensões."
  },
  {
    id: "relic_morta",
    mapId: "morta",
    mapName: "Floresta Morta",
    name: "Flor do Véu Fúnebre",
    icon: "icon-crys-morta",
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
    let px = Math.round((rx.x + rx.w / 2) * dt);
    let py = Math.round((rx.y + rx.h / 2) * dt);

    // Se estiver em sala secreta com inimigo de elite no centro, deslocar suavemente para evitar sobreposicao
    if (target.isSecretRoom) {
      py = Math.round((rx.y + 2) * dt);
    }

    // Garantir que não nasceu dentro de parede solida
    if (scene.dungeon?.isWallAtWorld?.(px, py)) {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const tx = Math.round((rx.x + rx.w / 2 + dx) * dt);
          const ty = Math.round((rx.y + rx.h / 2 + dy) * dt);
          if (!scene.dungeon.isWallAtWorld(tx, ty)) {
            px = tx;
            py = ty;
            break;
          }
        }
      }
    }

    // Pedestal do Altar com textura resiliente (ruin-altar / cx-relic / altar / shrine)
    const pedTex = scene.textures.exists("ruin-altar") ? "ruin-altar" :
                   scene.textures.exists("cx-relic") ? "cx-relic" :
                   scene.textures.exists("hub-shrine") ? "hub-shrine" :
                   scene.textures.exists("altar") ? "altar" : "shrine";
    const ped = scene.add.sprite(px, py + 10, pedTex).setScale(0.85).setOrigin(0.5, 1).setDepth(py);

    // Ícone da relíquia flutuando (sem setTint para preservar as cores originais da pixel art)
    const icoKey = scene.textures.exists(relic.icon) ? relic.icon : "icon-fragment";
    const ico = scene.add.sprite(px, py - 20, icoKey).setScale(1.25).setDepth(py + 10);
    scene.tweens.add({ targets: ico, y: py - 26, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    // Halo de luz pulsante tematica
    const colInt = parseInt(relic.color.replace("#", "0x")) || 0xffd24a;
    const gl = scene.add.image(px, py - 22, "light").setScale(0.42).setBlendMode(j.BlendModes.ADD).setTint(colInt).setAlpha(0.55).setDepth(py + 5);
    scene.tweens.add({ targets: gl, alpha: 0.25, scale: 0.5, duration: 1000, yoyo: true, repeat: -1 });
    const rLight = scene.lighting?.addLight?.({ x: px, y: py - 22, radius: 85, flicker: 0.15, color: colInt });

    // Prompt visual interativo
    const hint = scene.add.text(px, py - 40, `✦ ${relic.name.toUpperCase()} ✦`, {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold",
      color: relic.color, stroke: "#110b06", strokeThickness: 3
    }).setOrigin(0.5).setDepth(py + 15);
    scene.tweens.add({ targets: hint, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });

    // Zona de coleta ao se aproximar
    let collected = false;
    let overlapEvent = null;

    const doCollect = () => {
      if (collected || !scene.player) return;
      collected = true;
      if (overlapEvent) { overlapEvent.remove(); overlapEvent = null; }

      __saveRelic(relic.id);

      scene.audioRef?.play?.("sfx-item-pickup");
      scene.game?.audioEngine?.sfx?.("relic-drop");
      scene.audioRef?.play?.("sfx-secret-reveal");
      scene.effectsRef?.shockwaveRing?.(px, py, 75);
      scene.effectsRef?.burstTinted?.(px, py, colInt, 28);
      scene.cameraSys?.shake?.(0.007, 260);

      scene.effectsRef?.floatText?.(px, py - 35, `✦ RELÍQUIA: ${relic.name.toUpperCase()} ✦`, relic.color, 11);
      scene.game?.events?.emit("ui:banner", `RELÍQUIA ENCONTRADA: ${relic.name.toUpperCase()}`, relic.color);

      if (rLight && scene.lighting?.removeLight) {
        try { scene.lighting.removeLight(rLight); } catch(e) {}
      }

      try { hint.destroy(); } catch(e) {}
      scene.tweens.add({
        targets: [ico, gl],
        alpha: 0,
        scale: 1.8,
        duration: 350,
        onComplete: () => {
          try { ico.destroy(); gl.destroy(); } catch(e) {}
        }
      });
    };

    const checkOverlap = () => {
      if (collected || !scene.player) return;
      const d = Math.hypot(scene.player.x - px, scene.player.y - py);
      if (d < 42) {
        doCollect();
      }
    };
    overlapEvent = scene.time.addEvent({ delay: 90, loop: true, callback: checkOverlap });

    scene.events.once(j.Scenes.Events.SHUTDOWN, () => {
      if (overlapEvent) { overlapEvent.remove(); overlapEvent = null; }
    });
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
    this.selected = 0;
  }
  create() {
    le(this);
    this.collected = __getCollectedRelics();
    this.total = __CAMPAIGN_RELICS.length;
    this.count = Object.keys(this.collected).filter(id => __CAMPAIGN_RELICS.some(r => r.id === id)).length;
    this.cx = Math.round(_ / 2);
    this.cy = Math.round(st / 2);

    // Fundo escuro com vinheta
    this.add.rectangle(this.cx, this.cy, _ * 1.5, st * 1.5, 0x050403, 0.88).setInteractive();

    // Painel Ornato no padrão oficial da UI
    this.panelG = this.add.graphics();
    const pw = 580, ph = 320, px = this.cx - pw / 2, py = this.cy - ph / 2;
    if (typeof __ornatePanel === "function") {
      __ornatePanel(this.panelG, px, py, pw, ph);
    } else {
      this.panelG.fillStyle(0x130e0a, 0.98).fillRoundedRect(px, py, pw, ph, 12);
      this.panelG.lineStyle(2, 0xc9a24a, 0.85).strokeRoundedRect(px, py, pw, ph, 12);
    }

    // Cabeçalho da Janela
    this.add.text(this.cx, py + 22, "✦ RELÍQUIAS DA CAMPANHA ✦", {
      fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold", color: "#ffd24a"
    }).setOrigin(0.5);

    const pct = Math.round((this.count / this.total) * 100);
    this.add.text(this.cx, py + 38, `Colecionáveis Resgatados: ${this.count} / ${this.total} (${pct}%) · Toque em um item para examinar`, {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", color: "#a89468"
    }).setOrigin(0.5);

    // Divisor dourado sutil
    this.panelG.lineStyle(1, 0xc9a24a, 0.35).lineBetween(px + 20, py + 48, px + pw - 20, py + 48);

    // Container do Grid (Lado Esquerdo)
    this.gridContainer = this.add.container(0, 0);
    this.slotCards = [];
    this.buildGrid(px + 22, py + 58);

    // Container de Detalhes (Lado Direito)
    this.detailsX = px + 288;
    this.detailsY = py + 58;
    this.detailsW = pw - 310;
    this.detailsH = ph - 105;
    this.detailsG = this.add.graphics();
    this.detailsContainer = this.add.container(0, 0);
    this.renderDetails();

    // Rodapé / Botão Voltar
    const botY = py + ph - 24;
    const closeB = this.add.text(this.cx, botY, "[ ◀ VOLTAR ]", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", fontStyle: "bold", color: "#e8d8b8",
      backgroundColor: "#2b1810", padding: { x: 16, y: 7 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeB.on("pointerdown", () => this.close());
    typeof Gt === "function" && Gt(closeB, 20, 16);

    // Botão X no topo direito
    const xTop = this.add.text(px + pw - 24, py + 20, "✕", {
      fontFamily: "Arial, sans-serif", fontSize: "14px", fontStyle: "bold", color: "#d8cdb4",
      backgroundColor: "#3a1810", padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    xTop.on("pointerdown", () => this.close());
    typeof Gt === "function" && Gt(xTop, 22, 18);

    // Teclas de atalho com consumo de evento
    this.__kd = ev => {
      if (!this.sys.isActive()) return;
      if (ev.key === "ArrowLeft") { ev.preventDefault(); ev.stopPropagation(); this.select((this.selected - 1 + this.total) % this.total); }
      else if (ev.key === "ArrowRight") { ev.preventDefault(); ev.stopPropagation(); this.select((this.selected + 1) % this.total); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); ev.stopPropagation(); this.select((this.selected - 4 + this.total) % this.total); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); ev.stopPropagation(); this.select((this.selected + 4) % this.total); }
      else if (ev.key === "Escape" || ev.key === "Enter") { ev.preventDefault(); ev.stopPropagation(); this.close(); }
    };
    window.addEventListener("keydown", this.__kd);
  }

  buildGrid(gx, gy) {
    this.gridContainer.removeAll(true);
    this.slotCards = [];
    const cols = 4;
    const slotW = 58, slotH = 62, gapX = 8, gapY = 8;

    __CAMPAIGN_RELICS.forEach((relic, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = gx + col * (slotW + gapX);
      const sy = gy + row * (slotH + gapY);
      const isCollected = !!this.collected[relic.id];
      const isSel = this.selected === i;

      // Gráficos do Slot
      const g = this.add.graphics();
      this.drawSlotBox(g, sx, sy, slotW, slotH, isCollected, isSel);
      this.gridContainer.add(g);

      // Número do Slot
      const numTxt = this.add.text(sx + 5, sy + 4, `#${i < 9 ? "0" + (i + 1) : (i + 1)}`, {
        fontFamily: "'Courier New', monospace", fontSize: "7px", color: isCollected ? "#8ae0b0" : "#5a4530"
      });
      this.gridContainer.add(numTxt);

      // Ícone / Silhueta do Colecionável
      const icoKey = this.textures.exists(relic.icon) ? relic.icon : "icon-fragment";
      if (isCollected) {
        const ico = this.add.sprite(sx + slotW / 2, sy + slotH / 2 + 2, icoKey).setScale(1.25);
        this.gridContainer.add(ico);

        // Selo de coletado no canto
        const chk = this.add.text(sx + slotW - 6, sy + 3, "✔", {
          fontFamily: "Arial, sans-serif", fontSize: "7px", color: "#8ae0b0"
        }).setOrigin(1, 0);
        this.gridContainer.add(chk);
      } else {
        // SILHUETA MISTERIOSA: Sprite tingido de preto/sombra sem revelar o item
        const sil = this.add.sprite(sx + slotW / 2, sy + slotH / 2 + 2, icoKey)
          .setScale(1.25)
          .setTint(0x1a1510)
          .setAlpha(0.65);
        this.gridContainer.add(sil);

        const qMark = this.add.text(sx + slotW / 2, sy + slotH / 2 + 2, "?", {
          fontFamily: "Georgia, serif", fontSize: "16px", fontStyle: "bold", color: "#4a3520"
        }).setOrigin(0.5);
        this.gridContainer.add(qMark);
      }

      // Zona Interativa (Click/Touch) com área exata do slot (sem bleed que sobreponha vizinhos)
      const zone = this.add.zone(sx, sy, slotW, slotH).setOrigin(0).setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => this.select(i));
      this.gridContainer.add(zone);

      this.slotCards.push({ g, sx, sy, slotW, slotH, isCollected, i });
    });
  }

  drawSlotBox(g, x, y, w, h, isCollected, isSel) {
    g.clear();
    // Fundo do slot
    g.fillStyle(isSel ? 0x22180e : (isCollected ? 0x140e08 : 0x0a0806), 0.95);
    g.fillRoundedRect(x, y, w, h, 6);

    // Bordas
    if (isSel) {
      g.lineStyle(2, 0xffd24a, 1).strokeRoundedRect(x, y, w, h, 6);
      g.lineStyle(1, 0xffea88, 0.4).strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 8);
    } else if (isCollected) {
      g.lineStyle(1.5, 0xc9a24a, 0.75).strokeRoundedRect(x, y, w, h, 6);
    } else {
      g.lineStyle(1, 0x3a2c1e, 0.6).strokeRoundedRect(x, y, w, h, 6);
    }
  }

  select(i) {
    i = Math.max(0, Math.min(i, __CAMPAIGN_RELICS.length - 1));
    if (this.selected === i && this.detailsContainer.length > 0) return;
    const old = this.selected;
    this.selected = i;

    // Atualizar caixas de seleção no grid
    if (this.slotCards[old]) {
      const c = this.slotCards[old];
      this.drawSlotBox(c.g, c.sx, c.sy, c.slotW, c.slotH, c.isCollected, !1);
    }
    if (this.slotCards[i]) {
      const c = this.slotCards[i];
      this.drawSlotBox(c.g, c.sx, c.sy, c.slotW, c.slotH, c.isCollected, !0);
    }

    this.renderDetails();
  }

  renderDetails() {
    this.detailsG.clear();
    this.detailsContainer.removeAll(true);

    const relic = __CAMPAIGN_RELICS[this.selected];
    if (!relic) return;
    const isCollected = !!this.collected[relic.id];
    const dx = this.detailsX, dy = this.detailsY, dw = this.detailsW, dh = this.detailsH;

    // Painel de Detalhes no padrão __softPanel
    if (typeof __softPanel === "function") {
      __softPanel(this.detailsG, dx, dy, dw, dh);
    } else {
      this.detailsG.fillStyle(0x0e0a07, 0.95).fillRoundedRect(dx, dy, dw, dh, 6);
      this.detailsG.lineStyle(1, 0x5a4228, 0.6).strokeRoundedRect(dx, dy, dw, dh, 6);
    }

    // Moldura do Ícone
    const icoBox = this.add.graphics();
    icoBox.fillStyle(0x0a0705, 0.95).fillRoundedRect(dx + 12, dy + 12, 60, 60, 4);
    icoBox.lineStyle(1, isCollected ? 0xc9a24a : 0x3a281a, 0.8).strokeRoundedRect(dx + 12, dy + 12, 60, 60, 4);
    this.detailsContainer.add(icoBox);

    const icoKey = this.textures.exists(relic.icon) ? relic.icon : "icon-fragment";
    if (isCollected) {
      const ico = this.add.sprite(dx + 42, dy + 42, icoKey).setScale(1.8);
      this.detailsContainer.add(ico);
    } else {
      // Silhueta no painel de detalhes
      const sil = this.add.sprite(dx + 42, dy + 42, icoKey).setScale(1.8).setTint(0x1a1510).setAlpha(0.7);
      this.detailsContainer.add(sil);
      const q = this.add.text(dx + 42, dy + 42, "?", {
        fontFamily: "Georgia, serif", fontSize: "24px", fontStyle: "bold", color: "#4a3520"
      }).setOrigin(0.5);
      this.detailsContainer.add(q);
    }

    // Título e Status com wordWrap seguro
    const titleTxt = this.add.text(dx + 82, dy + 12, isCollected ? relic.name : "??? (Relíquia Oculta)", {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold",
      color: isCollected ? "#ffd24a" : "#7d6648",
      wordWrap: { width: dw - 94 }
    });
    this.detailsContainer.add(titleTxt);

    const titleH = titleTxt.height;
    const tagY = dy + 12 + Math.max(18, titleH + 4);

    const stTag = this.add.text(dx + 82, tagY, isCollected ? "✔ COLECIONÁVEL RESGATADO" : "✖ NÃO LOCALIZADO", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold",
      color: isCollected ? "#8ae0b0" : "#a85040"
    });
    this.detailsContainer.add(stTag);

    const numTxt = this.add.text(dx + 82, tagY + 14, `Registro Arcano #${this.selected < 9 ? "0" + (this.selected + 1) : (this.selected + 1)} de ${this.total}`, {
      fontFamily: "'Courier New', monospace", fontSize: "7px", color: "#8a7860"
    });
    this.detailsContainer.add(numTxt);

    // Divisor
    this.detailsG.lineStyle(1, 0x4a3822, 0.4).lineBetween(dx + 12, dy + 78, dx + dw - 12, dy + 78);

    // Descrição
    const desc = isCollected ? relic.desc : "Uma relíquia ancestral esquecida nas profundezas. Seu paradeiro permanece um enigma até que você a descubra em suas jornadas.";
    const descTxt = this.add.text(dx + 12, dy + 84, desc, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7.5px", color: "#d8cdb4", wordWrap: { width: dw - 24 }
    });
    this.detailsContainer.add(descTxt);

    // Caixa de Curiosidade da Campanha
    const cbX = dx + 10, cbY = dy + 118, cbW = dw - 20, cbH = dh - 126;
    const curBox = this.add.graphics();
    curBox.fillStyle(0x090604, 0.95).fillRoundedRect(cbX, cbY, cbW, cbH, 4);
    curBox.lineStyle(1, isCollected ? 0xc9a24a : 0x3a281a, 0.5).strokeRoundedRect(cbX, cbY, cbW, cbH, 4);
    this.detailsContainer.add(curBox);

    const curTitle = this.add.text(cbX + 8, cbY + 5, isCollected ? "✦ CURIOSIDADE DA CAMPANHA ✦" : "✦ SEGREDO OCULTO ✦", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: isCollected ? "#ffd24a" : "#7d6648"
    });
    this.detailsContainer.add(curTitle);

    const curText = isCollected
      ? relic.curiosity
      : "As memórias, crônicas e segredos deste artefato permanecem selados pelas brumas do tempo. Explore os caminhos e salas da campanha para encontrá-lo e revelar sua história.";
    const curBody = this.add.text(cbX + 8, cbY + 17, curText, {
      fontFamily: "Georgia, serif", fontSize: "7px", lineSpacing: 1.5, color: isCollected ? "#f4ebd0" : "#7a6e5a", wordWrap: { width: cbW - 16 }
    });
    this.detailsContainer.add(curBody);
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

for path in JS_PATHS:
    print(f"Processando: {path}")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Preload hub-shrine
    preload_needle = 'this.load.image("hub-shrine","assets/pixel-art/hub/shrine.png");'
    if preload_needle not in content:
        preload_anchor = 'class bo extends j.Scene{constructor(){super("Preload")}preload(){le(this),'
        if preload_anchor in content:
            content = content.replace(preload_anchor, preload_anchor + preload_needle)
            print("  [OK] hub-shrine preloaded globally in Preload scene.")

    # Find relic block
    idx1 = content.find('/* =========================================================================\n   SISTEMA DE COLECIONÁVEIS DA CAMPANHA (RELÍQUIAS ANCESTRAIS)')
    if idx1 == -1:
        idx1 = content.find('const __CAMPAIGN_RELICS =')
    
    idx2 = content.find('class __BookScene extends j.Scene')
    if idx1 != -1 and idx2 != -1:
        content = content[:idx1] + NEW_RELICS_BLOCK + "\n" + content[idx2:]
        print("  [OK] Bloco de Relíquias e Colecionáveis substituído com sucesso.")
    else:
        print(f"  [ERRO] Limites do bloco não encontrados: idx1={idx1}, idx2={idx2}")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  [OK] Salvo: {path} ({len(content)} bytes)\n")

print("Patch de correcao dos colecionaveis finalizado!")
