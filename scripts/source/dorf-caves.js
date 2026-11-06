/* ── Bioma: Cavernas da Montanha Dorf (RPG Worlds Deep Cave - Szadi art) ─────────────────────────
   Cenário exploratório amplo, orgânico e procedural por entrada (sem salas e sem explorar profundidades):
   - Paredes de basalto de 3 tiles de altura em degraus curvos com vinhas luminescentes
   - Clareiras de musgo hexagonal com bordas orgânicas, terraços de pedra cinza e escadarias
   - Penínsulas rochosas abissais internas (como nas imagens de referência) criando loops naturais
   - Formações de estalagmites 2.5D com ordenação de profundidade Y (Y-sorting) e colisão na base
   - Economia de exploração: poucos baús escondidos em fendas laterais, porém valiosos,
     contendo as Moedas do Ferreiro (🪙) usadas para forjar as Armas Únicas no Refúgio.
────────────────────────────────────────────────────────────────────────────────────────────────── */
let __dorfN = 0;

/* 0) Economia global das Moedas do Ferreiro (🪙) */
const __DORF_COIN_KEY = "depthgate:forge_coins";

function __getForgeCoins(S) {
  let v = 0;
  try {
    v = parseInt(localStorage.getItem(__DORF_COIN_KEY) || "0", 10);
    if (!isFinite(v) || v < 0) v = 0;
  } catch (e) { v = 0; }
  try {
    const sl = S?.dorfSlot || S?.retSlot || S?.game?.registry?.get("save:slot") || 1;
    if (typeof Dn === "function") {
      const cr = Dn(sl);
      if (cr?.ok && typeof cr.data?.player?.forgeCoins === "number") {
        v = Math.max(v, cr.data.player.forgeCoins | 0);
      }
    }
    if (typeof Nn === "function") {
      const er = Nn(sl);
      if (er?.ok && typeof er.data?.player?.forgeCoins === "number") {
        v = Math.max(v, er.data.player.forgeCoins | 0);
      }
    }
  } catch (e) {}
  return v;
}

function __setForgeCoins(n, S) {
  const val = Math.max(0, n | 0);
  try { localStorage.setItem(__DORF_COIN_KEY, String(val)); } catch (e) {}
  try {
    const sl = S?.dorfSlot || S?.retSlot || S?.game?.registry?.get("save:slot") || 1;
    if (typeof Dn === "function") {
      const cr = Dn(sl);
      if (cr?.ok && cr.data) {
        cr.data.player = cr.data.player || {};
        cr.data.player.forgeCoins = val;
        localStorage.setItem(Wt("campaign", sl), JSON.stringify(cr.data));
      }
    }
    if (typeof Nn === "function") {
      const er = Nn(sl);
      if (er?.ok && er.data) {
        er.data.player = er.data.player || {};
        er.data.player.forgeCoins = val;
        localStorage.setItem(Wt("endless", sl), JSON.stringify(er.data));
      }
    }
  } catch (e) {}
  return val;
}

function __addForgeCoins(delta, S, wx, wy) {
  const cur = __getForgeCoins(S);
  const next = __setForgeCoins(cur + (delta | 0), S);
  if (S) {
    try {
      if (S.__dorfCoinTxt?.active) {
        const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
        S.__dorfCoinTxt.setText(`🪙 ${L3("Moedas do Ferreiro", "Blacksmith Coins", "Monedas del Herrero")}: ${next}`);
        S.tweens?.add({ targets: S.__dorfCoinTxt, scale: { from: 1.18, to: 1 }, duration: 260, ease: "Back.easeOut" });
      }
      if (wx != null && wy != null && S.add) {
        const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
        const label = delta > 1
          ? L3(`+${delta} 🪙 MOEDAS DO FERREIRO!`, `+${delta} 🪙 BLACKSMITH COINS!`, `¡+${delta} 🪙 MONEDAS DEL HERRERO!`)
          : L3(`+1 🪙 MOEDA DO FERREIRO!`, `+1 🪙 BLACKSMITH COIN!`, `¡+1 🪙 MONEDA DEL HERRERO!`);
        const t = S.add.text(wx, wy - 18, label, {
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#ffd24a",
          stroke: "#120c08",
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(9500);
        S.tweens?.add({
          targets: t,
          y: wy - 48,
          alpha: { from: 1, to: 0 },
          duration: 1800,
          ease: "Cubic.easeOut",
          onComplete: () => t.destroy()
        });
      }
      window.__advancedAudio?.playMetalClang?.("E5");
    } catch (e) {}
  }
  return next;
}

if (typeof window !== "undefined") {
  window.__getForgeCoins = __getForgeCoins;
  window.__setForgeCoins = __setForgeCoins;
  window.__addForgeCoins = __addForgeCoins;
}

/* 1) Registro de Tema, Inimigos Reais e Tabelas de Loot Escasso e Valioso */
(function __registerDorfBiome() {
  if (typeof Ls === "undefined") return;
  const baseTheme = Ls.catacombs || Ls.ruins || Object.values(Ls)[0];
  Ls.dorf_cave = {
    ...baseTheme,
    id: "dorf_cave",
    name: "Cavernas da Montanha Dorf",
    tilesetKey: "tiles-dorf-cave",
    ambient: 0.62,
    fogColor: 0x0d0a10,
    fogDensity: 0.006,
    music: "catacombs-theme",
    palette: {
      floor: 0x4b3834,
      wall: 0x5c4454,
      accent: 0x38bdf8,
      light: 0x67e8f9
    },
    lightPreset: {
      color: 0x67e8f9,
      radius: 155,
      intensity: 0.96
    }
  };

  if (typeof ud !== "undefined") ud.dorf_cave = "Cavernas da Montanha Dorf";
  try {
    if (typeof Ns !== "undefined") Ns["biome.dorf_cave"] = "Cavernas da Montanha Dorf";
    if (typeof _s !== "undefined") _s["biome.dorf_cave"] = "Dorf Mountain Caves";
    if (typeof Io !== "undefined") Io["biome.dorf_cave"] = "Cavernas de la Montaña Dorf";
  } catch (e) {}

  try {
    if (typeof td !== "undefined" && Array.isArray(td)) {
      for (const g of td) {
        if ((g.biomes?.includes("ruins") || g.biomes?.includes("catacombs")) && !g.biomes.includes("dorf_cave")) {
          g.biomes.push("dorf_cave");
        }
      }
    }
    if (typeof js !== "undefined") {
      const refPools = js.fortress?.pools || js.ruins?.pools || [
        "dragon_sword", "bulwark_blade", "tower_shield", "ember_bow", "inferno_staff",
        "soul_reaper", "great_sword", "war_hammer", "long_bow", "arcane_staff",
        "assassin_dagger", "colossus_sword", "hunter_bow", "ruins_staff",
        "colossus_plate", "armor", "helmet", "ring", "amulet", "potion"
      ];
      // Poucos baús na caverna, mas cada um guarda equipamento Raro, Épico ou Lendário + Moedas do Ferreiro
      js.dorf_cave = {
        rolls: 2,
        gold: { min: 22, max: 45 },
        pools: refPools,
        rarities: { COMMON: 0, UNCOMMON: 10, RARE: 52, EPIC: 28, LEGENDARY: 10 }
      };
    }
    if (typeof ed !== "undefined") {
      ed.dorf_cave = {
        common: ["GOBLIN", "GOBLIN_ARCHER", "GOBLIN_ASSASSIN", "SKELETON", "SKELETON_WARRIOR", "ORC"],
        uncommon: ["ORC_WARRIOR", "ORC_BRUTE", "SKELETON_MAGE", "NECRO_SHADE", "MB_CINDER_STALKER", "MB_CRYSTAL_SAGE"],
        elite: ["MB_BASALT_COLOSSUS", "TROLL", "CYCLOPS", "DEMON"],
        bosses: ["ANCIENT_COLOSSUS", "ABYSS_GUARDIAN"]
      };
    }
  } catch (e) {}

  // Hook em _l.prototype.carve para usar diretamente a malha orgânica (__organicGrid) antes de criar wallLayer
  if (typeof _l !== "undefined" && _l.prototype && !_l.prototype.__dorfCarveHooked) {
    _l.prototype.__dorfCarveHooked = true;
    const __origCarve = _l.prototype.carve;
    _l.prototype.carve = function () {
      if (this.level?.__organicGrid) {
        this.grid = this.level.__organicGrid.map((row) => row.slice());
        return;
      }
      return __origCarve.apply(this, arguments);
    };
  }

  // Hook no Minimapa (class Id) para desenhar o contorno orgânico da caverna em vez de retângulos de salas
  if (typeof Id !== "undefined" && Id.prototype && !Id.prototype.__dorfMinimapHooked) {
    Id.prototype.__dorfMinimapHooked = true;
    const __origRedraw = Id.prototype.redraw;
    Id.prototype.redraw = function (i, t) {
      const gs = this.scene?.scene?.get?.("Game");
      if (gs?.isDorfCave && gs.level?.__organicGrid) {
        if (this.touchOn) {
          this.panel?.setVisible(false);
          this.parch?.setVisible(false);
          this.map?.setVisible(false);
          this.title?.setVisible(false);
          return;
        }
        this.panel?.setVisible(true);
        this.parch?.setVisible(true);
        this.map?.setVisible(true);
        this.title?.setVisible(true);
        const __n = performance.now();
        if (this.__rl && __n - this.__rl < 80) return;
        this.__rl = __n;
        const e = this.map;
        const C = gs.level.world.cols, R = gs.level.world.rows;
        if (this.setWorld(C, R)) this.layout();
        const d = this.mapScale;
        const __tk = "dorf_cave|" + this.width;
        e.clear();
        if (this.__tk !== __tk) {
          this.__tk = __tk;
          this.title.setText("CAVERNAS DORF");
        }
        e.fillStyle(0x5c4438, 0.88);
        for (const sp of gs.level.corridors || []) {
          e.fillRect(this.tx(sp.x), this.ty(sp.y), Math.max(1, sp.w * d), Math.max(1, d + 0.35));
        }
        e.fillStyle(0x3b6e4c, 0.85);
        for (const mz of gs.level.__mossZones || []) {
          e.fillCircle(this.tx(mz.cx), this.ty(mz.cy), Math.max(2, mz.rx * d * 0.65));
        }
        const pts = gs.__dorfPortals || (gs.__dorfReturnPortal ? [gs.__dorfReturnPortal] : []);
        for (const pt of pts) {
          e.fillStyle(0x38bdf8, 1);
          e.fillCircle(this.tx(pt.x / 32), this.ty(pt.y / 32), 2.5);
        }
        if (t) {
          e.fillStyle(0x2c2013, 1).fillCircle(this.tx(t.x / 32), this.ty(t.y / 32), 3);
          e.fillStyle(0xffd24a, 1).fillCircle(this.tx(t.x / 32), this.ty(t.y / 32), 2);
        }
        return;
      }
      return __origRedraw.apply(this, arguments);
    };
  }
})();

/* 2) Gerador Procedural Amplo e Orgânico por Entrada (__buildDorfCaveLevel)
      Não explora profundidades e não usa salas retangulares padrão. */
function __buildDorfCaveLevel(runCfg = {}) {
  const salt = runCfg.freshSeed || `${Date.now()}_${Math.floor(Math.random() * 1e9)}_${++__dorfN}`;
  const seedStr = `${runCfg.seed || "dorf"}_${salt}`;
  let sd = seedStr.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 19) >>> 0;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (a) => a[(rnd() * a.length) | 0];
  const between = (a, b) => a + rnd() * (b - a);

  // Mapa amplo de caverna (88x68 tiles = 2816x2176 px)
  const C = 88, R = 68;
  const grid = Array.from({ length: R }, () => new Array(C).fill(1));

  const flipX = rnd() < 0.5;
  const tx = (x) => (flipX ? C - 1 - x : x);
  const jitX = (x, m = 3) => Math.max(10, Math.min(C - 11, Math.round(tx(x) + between(-m, m))));
  const jitY = (y, m = 3) => Math.max(11, Math.min(R - 10, Math.round(y + between(-m, m))));

  // Escolher proceduralmente uma entre 4 arquiteturas macro de caverna a cada entrada
  const archStyle = Math.floor(rnd() * 4);
  let nodes = [];
  let edges = [];
  let rockIslands = [];

  if (archStyle === 0) {
    // Arquitetura A: Caldeira de Musgo Central & Penínsulas Abissais (inspirada na Imagem de Referência 3)
    nodes = [
      { id: "entrada", name: "Fenda Norte de Basalto", cx: jitX(18, 2), cy: jitY(14, 1), rx: 7.5, ry: 5.2, kind: "START" },
      { id: "terraco_musgo_sup", name: "Santuário do Musgo Antigo", cx: jitX(38, 2), cy: jitY(19, 2), rx: 11.2, ry: 7.4, kind: "MOSS" },
      { id: "galeria_leste", name: "Galeria das Colunas Rubras", cx: jitX(65, 2), cy: jitY(21, 2), rx: 9.6, ry: 6.8, kind: "DARK_ROCK" },
      { id: "alcova_noroeste", name: "Fenda Oculta do Ferreiro", cx: jitX(74, 2), cy: jitY(12, 1), rx: 5.5, ry: 4.3, kind: "ALCOVE_LOOT" },
      { id: "vale_subterraneo", name: "Vale Subterrâneo de Dorf", cx: jitX(26, 2), cy: jitY(39, 2), rx: 9.8, ry: 6.5, kind: "OPEN" },
      { id: "terraco_musgo_inf", name: "Jardim dos Vasos Luminescentes", cx: jitX(58, 2), cy: jitY(44, 2), rx: 10.4, ry: 6.8, kind: "MOSS" },
      { id: "alcova_sudoeste", name: "Recanto das Relíquias", cx: jitX(14, 2), cy: jitY(54, 2), rx: 5.8, ry: 4.5, kind: "ALCOVE_LOOT" },
      { id: "alcova_sudeste", name: "Gruta dos Cristais Azuis", cx: jitX(74, 2), cy: jitY(54, 2), rx: 5.8, ry: 4.4, kind: "ALCOVE_LOOT" },
      { id: "coracao_dorf", name: "Coração da Montanha Dorf", cx: jitX(44, 3), cy: jitY(55, 2), rx: 9.2, ry: 6.0, kind: "SANCTUARY" }
    ];
    edges = [
      [0, 1], [1, 2], [2, 3], [0, 4], [1, 4], [1, 5], [2, 5],
      [4, 6], [5, 7], [4, 8], [5, 8]
    ];
    rockIslands = [
      { cx: jitX(48, 1), cy: jitY(32, 1), rx: 5.2, ry: 4.2 },
      { cx: jitX(29, 1), cy: jitY(27, 1), rx: 4.4, ry: 3.6 }
    ];
  } else if (archStyle === 1) {
    // Arquitetura B: Galerias Gêmeas & Anel Subterrâneo Amplo
    nodes = [
      { id: "entrada", name: "Pórtico da Montanha", cx: jitX(44, 3), cy: jitY(13, 1), rx: 8.0, ry: 5.2, kind: "START" },
      { id: "salao_oeste", name: "Clareira Hexagonal Oeste", cx: jitX(22, 2), cy: jitY(24, 2), rx: 10.8, ry: 7.2, kind: "MOSS" },
      { id: "salao_leste", name: "Floresta de Estalagmites", cx: jitX(66, 2), cy: jitY(24, 2), rx: 10.6, ry: 7.0, kind: "DARK_ROCK" },
      { id: "alcova_1", name: "Fenda da Bigorna Antiga", cx: jitX(13, 1), cy: jitY(13, 1), rx: 5.4, ry: 4.2, kind: "ALCOVE_LOOT" },
      { id: "ponte_central", name: "Encruzilhada de Basalto", cx: jitX(44, 2), cy: jitY(35, 2), rx: 9.4, ry: 6.4, kind: "OPEN" },
      { id: "alcova_2", name: "Câmara da Forja Perdida", cx: jitX(75, 1), cy: jitY(41, 2), rx: 5.6, ry: 4.4, kind: "ALCOVE_LOOT" },
      { id: "santuario_musgo", name: "Terraço Verdejante Sul", cx: jitX(25, 2), cy: jitY(48, 2), rx: 10.2, ry: 6.8, kind: "MOSS" },
      { id: "alcova_3", name: "Fenda dos Veios de Ouro", cx: jitX(15, 2), cy: jitY(57, 1), rx: 5.5, ry: 4.3, kind: "ALCOVE_LOOT" },
      { id: "coracao_dorf", name: "Santuário Profundo de Dorf", cx: jitX(58, 2), cy: jitY(54, 2), rx: 9.6, ry: 6.2, kind: "SANCTUARY" }
    ];
    edges = [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5],
      [1, 6], [4, 6], [6, 7], [4, 8], [6, 8]
    ];
    rockIslands = [
      { cx: jitX(44, 1), cy: jitY(23, 1), rx: 5.5, ry: 4.0 },
      { cx: jitX(42, 1), cy: jitY(47, 1), rx: 5.0, ry: 3.8 }
    ];
  } else if (archStyle === 2) {
    // Arquitetura C: Anfiteatro Curvo em Crescente com Fendas Laterais
    nodes = [
      { id: "entrada", name: "Entrada das Falésias", cx: jitX(68, 2), cy: jitY(14, 1), rx: 7.8, ry: 5.2, kind: "START" },
      { id: "galeria_norte", name: "Terraço Superior de Dorf", cx: jitX(42, 2), cy: jitY(17, 2), rx: 11.4, ry: 7.0, kind: "MOSS" },
      { id: "alcova_norte", name: "Fenda Norte do Ferreiro", cx: jitX(15, 2), cy: jitY(15, 1), rx: 5.8, ry: 4.4, kind: "ALCOVE_LOOT" },
      { id: "curva_oeste", name: "Passagem das Samambaias Gigantes", cx: jitX(20, 2), cy: jitY(33, 2), rx: 9.8, ry: 6.8, kind: "OPEN" },
      { id: "galeria_central", name: "Salão das Colunas de Basalto", cx: jitX(48, 2), cy: jitY(36, 2), rx: 10.5, ry: 6.8, kind: "DARK_ROCK" },
      { id: "alcova_leste", name: "Recanto da Forja Cristalina", cx: jitX(74, 2), cy: jitY(35, 2), rx: 5.6, ry: 4.4, kind: "ALCOVE_LOOT" },
      { id: "terraco_sul", name: "Clareira do Musgo Luminoso", cx: jitX(30, 2), cy: jitY(52, 2), rx: 10.6, ry: 6.8, kind: "MOSS" },
      { id: "alcova_sul", name: "Gruta Esquecida", cx: jitX(73, 2), cy: jitY(55, 1), rx: 5.6, ry: 4.3, kind: "ALCOVE_LOOT" },
      { id: "coracao_dorf", name: "Altar da Montanha Dorf", cx: jitX(54, 2), cy: jitY(54, 2), rx: 9.2, ry: 6.0, kind: "SANCTUARY" }
    ];
    edges = [
      [0, 1], [1, 2], [1, 3], [1, 4], [3, 4], [4, 5],
      [3, 6], [4, 6], [6, 8], [4, 8], [8, 7]
    ];
    rockIslands = [
      { cx: jitX(34, 1), cy: jitY(27, 1), rx: 4.8, ry: 3.8 },
      { cx: jitX(61, 1), cy: jitY(26, 1), rx: 5.2, ry: 4.0 }
    ];
  } else {
    // Arquitetura D: Grande Caverna Exploratória Multi-Lobular
    nodes = [
      { id: "entrada", name: "Arco de Basalto", cx: jitX(26, 2), cy: jitY(14, 1), rx: 7.6, ry: 5.0, kind: "START" },
      { id: "clareira_1", name: "Clareira dos Brotos Dourados", cx: jitX(24, 2), cy: jitY(29, 2), rx: 10.6, ry: 7.0, kind: "MOSS" },
      { id: "clareira_2", name: "Galeria dos Cogumelos Gigantes", cx: jitX(52, 2), cy: jitY(20, 2), rx: 10.4, ry: 6.8, kind: "OPEN" },
      { id: "alcova_1", name: "Fenda Secreta Leste", cx: jitX(75, 1), cy: jitY(16, 1), rx: 5.6, ry: 4.3, kind: "ALCOVE_LOOT" },
      { id: "clareira_3", name: "Terraço das Estalagmites Rubras", cx: jitX(62, 2), cy: jitY(38, 2), rx: 11.0, ry: 7.2, kind: "MOSS" },
      { id: "alcova_2", name: "Fenda Profunda Oeste", cx: jitX(13, 1), cy: jitY(46, 2), rx: 5.6, ry: 4.4, kind: "ALCOVE_LOOT" },
      { id: "clareira_4", name: "Vale das Sombras Antigas", cx: jitX(34, 2), cy: jitY(49, 2), rx: 9.8, ry: 6.6, kind: "DARK_ROCK" },
      { id: "alcova_3", name: "Arca do Ferreiro Ancestral", cx: jitX(75, 1), cy: jitY(55, 1), rx: 5.6, ry: 4.3, kind: "ALCOVE_LOOT" },
      { id: "coracao_dorf", name: "Pórtico Sul da Montanha", cx: jitX(54, 2), cy: jitY(55, 2), rx: 9.4, ry: 6.0, kind: "SANCTUARY" }
    ];
    edges = [
      [0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [1, 4],
      [1, 5], [1, 6], [4, 6], [6, 8], [4, 8], [8, 7]
    ];
    rockIslands = [
      { cx: jitX(41, 1), cy: jitY(33, 1), rx: 5.4, ry: 4.2 }
    ];
  }

  const carveDisk = (cx, cy, rx, ry, ph1 = 0, ph2 = 0, val = 0) => {
    const x0 = Math.max(4, Math.floor(cx - rx - 3));
    const x1 = Math.min(C - 5, Math.ceil(cx + rx + 3));
    const y0 = Math.max(6, Math.floor(cy - ry - 3));
    const y1 = Math.min(R - 5, Math.ceil(cy + ry + 3));
    for (let r = y0; r <= y1; r++) {
      for (let c = x0; c <= x1; c++) {
        const ang = Math.atan2(r - cy, c - cx);
        const wob = 1.0 + 0.15 * Math.sin(ang * 3 + ph1) + 0.10 * Math.cos(ang * 5 + ph2);
        const d2 = ((c - cx) / (rx * wob)) ** 2 + ((r - cy) / (ry * wob)) ** 2;
        if (d2 <= 1.0) grid[r][c] = val;
      }
    }
  };

  // 1) Esculpir grandes clareiras multi-lobulares orgânicas
  for (const nd of nodes) {
    const p1 = between(0, 6.28), p2 = between(0, 6.28);
    carveDisk(nd.cx, nd.cy, nd.rx, nd.ry, p1, p2, 0);
    const lobes = nd.kind === "ALCOVE_LOOT" ? 2 : 3;
    for (let k = 0; k < lobes; k++) {
      const a = between(0, 6.28);
      const ox = nd.cx + Math.cos(a) * nd.rx * 0.52;
      const oy = nd.cy + Math.sin(a) * nd.ry * 0.46;
      carveDisk(ox, oy, nd.rx * 0.62, nd.ry * 0.58, p1 + k * 1.7, p2 - k * 1.3, 0);
    }
  }

  // 2) Esculpir galerias curvas largas entre as clareiras (e fendas mais estreitas para as alcovas de baú)
  for (const [i, j] of edges) {
    const A = nodes[i], B = nodes[j];
    const isAlcove = A.kind === "ALCOVE_LOOT" || B.kind === "ALCOVE_LOOT";
    const mx = (A.cx + B.cx) * 0.5 + between(-7, 7);
    const my = (A.cy + B.cy) * 0.5 + between(-5, 5);
    const steps = 52;
    const ph = between(0, 6.28);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      const x = u * u * A.cx + 2 * u * t * mx + t * t * B.cx;
      const y = u * u * A.cy + 2 * u * t * my + t * t * B.cy;
      const wRx = (isAlcove ? 2.4 : 3.8) + 0.55 * Math.sin(t * Math.PI * 3 + ph);
      const wRy = (isAlcove ? 2.1 : 3.2) + 0.45 * Math.cos(t * Math.PI * 2 + ph);
      carveDisk(x, y, wRx, wRy, ph, ph * 0.6, 0);
    }
  }

  // 2b) Inserir penínsulas/ilhas rochosas abissais entre os grandes salões (como na Imagem 3)
  for (const isl of rockIslands) {
    carveDisk(isl.cx, isl.cy, isl.rx, isl.ry, between(0, 6.28), between(0, 6.28), 1);
  }

  // 3) Garantir nicho de entrada norte para o Arco do Portal de Entrada
  const st = nodes[0];
  let spCol = Math.round(st.cx), spRow = Math.round(st.cy) - 1;
  while (spRow > 6 && grid[spRow - 1][spCol] === 0) spRow--;
  for (let dc = -2; dc <= 1; dc++) {
    const cc = Math.max(5, Math.min(C - 6, spCol + dc));
    for (let r = 0; r < spRow; r++) grid[r][cc] = 1;
    for (let r = spRow; r <= spRow + 4 && r < R - 4; r++) grid[r][cc] = 0;
  }
  const playerSpawn = { col: spCol, row: spRow + 2 };

  // 4) Suavização celular (Cellular Automata) para contornos 100% naturais
  for (let pass = 0; pass < 2; pass++) {
    const next = grid.map((r) => r.slice());
    for (let r = 6; r < R - 4; r++) {
      for (let c = 4; c < C - 4; c++) {
        if (Math.abs(c - spCol) <= 3 && Math.abs(r - spRow) <= 3) continue;
        let floors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (grid[r + dy][c + dx] === 0) floors++;
          }
        }
        if (grid[r][c] === 1 && floors >= 5) next[r][c] = 0;
        else if (grid[r][c] === 0 && floors <= 2) next[r][c] = 1;
      }
    }
    for (let r = 6; r < R - 4; r++) for (let c = 4; c < C - 4; c++) grid[r][c] = next[r][c];
  }

  // 5) Quebrar paredes horizontais longas (> 3 colunas) para criar o efeito de falésias de basalto em degraus
  for (let r = 6; r < R - 5; r++) {
    let run = 0;
    for (let c = 4; c < C - 4; c++) {
      if (Math.abs(c - spCol) <= 3 && Math.abs(r - spRow) <= 3) { run = 0; continue; }
      if (grid[r][c] === 0 && grid[r - 1][c] === 1) {
        run++;
        if (run >= 3 && rnd() < 0.62) {
          if (r + 3 < R - 4 && grid[r + 1][c] === 0 && grid[r + 2][c] === 0) {
            grid[r][c] = 1;
          }
          run = 0;
        }
      } else {
        run = 0;
      }
    }
  }

  // 6) Regra de espessura vertical de parede (>= 5 tiles) para falésias de basalto de 3 tiles + borda sul + abismo
  for (let c = 0; c < C; c++) {
    for (let r = 0; r < 5; r++) grid[r][c] = 1;
    for (let r = R - 3; r < R; r++) grid[r][c] = 1;
  }
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < 3; c++) grid[r][c] = 1;
    for (let c = C - 3; c < C; c++) grid[r][c] = 1;
  }
  for (let iter = 0; iter < 3; iter++) {
    for (let c = 3; c < C - 3; c++) {
      let r = 0;
      while (r < R) {
        if (grid[r][c] === 1) {
          const r0 = r;
          while (r < R && grid[r][c] === 1) r++;
          const r1 = r;
          if (r0 > 0 && r1 < R) {
            const h = r1 - r0;
            if (h <= 2) {
              for (let rr = r0; rr < r1; rr++) grid[rr][c] = 0;
            } else if (h < 5) {
              const need = 5 - h;
              for (let k = 0; k < need; k++) {
                if (r1 + k < R - 3) grid[r1 + k][c] = 1;
              }
            }
          }
        } else {
          r++;
        }
      }
    }
  }

  // 7) Garantir conectividade total a partir de playerSpawn via Flood Fill (BFS)
  const ensureConnected = () => {
    const vis = Array.from({ length: R }, () => new Array(C).fill(false));
    const q = [[playerSpawn.col, playerSpawn.row]];
    grid[playerSpawn.row][playerSpawn.col] = 0;
    vis[playerSpawn.row][playerSpawn.col] = true;
    while (q.length) {
      const [cx, cy] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 3 && nx < C - 3 && ny >= 5 && ny < R - 3 && !vis[ny][nx] && grid[ny][nx] === 0) {
          vis[ny][nx] = true;
          q.push([nx, ny]);
        }
      }
    }
    return vis;
  };

  let vis = ensureConnected();
  // Se algum nó importante ficou desconectado por uma ilha rochosa, abrir passagem de 3 tiles até playerSpawn
  for (const nd of nodes) {
    const nc = Math.max(5, Math.min(C - 6, Math.round(nd.cx)));
    const nr = Math.max(7, Math.min(R - 6, Math.round(nd.cy)));
    if (!vis[nr]?.[nc]) {
      const steps = 40;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = Math.round(playerSpawn.col + (nc - playerSpawn.col) * t);
        const y = Math.round(playerSpawn.row + (nr - playerSpawn.row) * t);
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (y + dy >= 6 && y + dy < R - 4 && x + dx >= 4 && x + dx < C - 4) {
              grid[y + dy][x + dx] = 0;
            }
          }
        }
      }
    }
  }
  vis = ensureConnected();
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0 && !vis[r][c]) grid[r][c] = 1;
    }
  }

  const nearestFloor = (tc, tr, minClear = 1) => {
    tc = Math.round(tc); tr = Math.round(tr);
    for (let rad = 0; rad < 22; rad++) {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const c = tc + dx, r = tr + dy;
          if (c < 4 || c >= C - 4 || r < 6 || r >= R - 4) continue;
          let ok = true;
          for (let yy = -minClear; yy <= minClear && ok; yy++) {
            for (let xx = -minClear; xx <= minClear && ok; xx++) {
              if (grid[r + yy]?.[c + xx] !== 0) ok = false;
            }
          }
          if (ok) return { col: c, row: r };
        }
      }
    }
    return { col: playerSpawn.col, row: playerSpawn.row + 1 };
  };

  // 8) Spans horizontais em `corridors` (usados pelo minimapa orgânico)
  const corridors = [];
  for (let r = 0; r < R; r++) {
    let c = 0;
    while (c < C) {
      if (grid[r][c] === 0) {
        const c0 = c;
        while (c < C && grid[r][c] === 0) c++;
        corridors.push({ x: c0, y: r, w: c - c0, h: 1 });
      } else {
        c++;
      }
    }
  }

  // 9) Inimigos reais do jogo (chaves validadas em `ee`) e poucos baús valiosos nas fendas ocultas
  const enemyPools = {
    common: ["GOBLIN", "GOBLIN_ARCHER", "GOBLIN_ASSASSIN", "SKELETON", "SKELETON_WARRIOR", "ORC"],
    mid: ["ORC_WARRIOR", "ORC_BRUTE", "SKELETON_MAGE", "NECRO_SHADE", "MB_CINDER_STALKER", "MB_CRYSTAL_SAGE"],
    elite: ["MB_BASALT_COLOSSUS", "TROLL", "CYCLOPS", "DEMON"]
  };

  const mossZones = [];
  const darkZones = [];
  const decor = [];
  const caveEnemies = [];
  let sanctuaryNode = null;

  // Escolher no máximo 2 ou 3 alcovas para conter os baús raros (escassos e valiosos!)
  const alcoveNodes = nodes.filter((n) => n.kind === "ALCOVE_LOOT");
  const maxAlcoveChests = rnd() < 0.45 ? 3 : 2;
  const activeChestAlcoves = new Set(alcoveNodes.slice(0, maxAlcoveChests).map((n) => n.id));

  nodes.forEach((nd) => {
    const center = nearestFloor(nd.cx, nd.cy, 1);
    nd.cx = center.col;
    nd.cy = center.row;

    if (nd.kind === "MOSS") {
      mossZones.push({ cx: center.col, cy: center.row, rx: nd.rx * 0.72, ry: nd.ry * 0.66 });
    } else if (nd.kind === "DARK_ROCK" || nd.kind === "SANCTUARY") {
      darkZones.push({ cx: center.col, cy: center.row, rx: nd.rx * 0.76, ry: nd.ry * 0.72 });
    }

    if (nd.kind === "START") {
      // Entrada pacífica junto ao portal
      return;
    }

    if (nd.kind === "ALCOVE_LOOT") {
      if (activeChestAlcoves.has(nd.id)) {
        const chSpot = nearestFloor(center.col, center.row - 1, 1);
        const tier = rnd() < 0.18 ? "LEGENDARY" : rnd() < 0.55 ? "EPIC" : "RARE";
        decor.push({
          type: "chest",
          col: chSpot.col,
          row: chSpot.row,
          tier: tier,
          noMimic: true,
          dorfCache: true
        });
      }
      const guardCount = 2;
      for (let k = 0; k < guardCount; k++) {
        const ep = nearestFloor(center.col + (k ? 2 : -2), center.row + 1, 0);
        caveEnemies.push({
          type: pick(k === 0 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: k === 0 && rnd() < 0.35
        });
      }
    } else if (nd.kind === "SANCTUARY") {
      sanctuaryNode = nd;
      const bossSpot = nearestFloor(center.col, center.row, 1);
      caveEnemies.push({
        type: pick(enemyPools.elite),
        col: bossSpot.col,
        row: bossSpot.row,
        elite: true
      });
      for (let k = 0; k < 3; k++) {
        const ang = (k / 3) * Math.PI * 2;
        const ep = nearestFloor(center.col + Math.cos(ang) * 3.5, center.row + Math.sin(ang) * 2.5, 0);
        caveEnemies.push({
          type: pick(rnd() < 0.5 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: false
        });
      }
      // 1 Arca Ancestral guardada pelo Elite no Santuário se houver apenas 2 alcovas ativas
      if (activeChestAlcoves.size <= 2) {
        const cSpot = nearestFloor(center.col + 3, center.row - 1, 1);
        decor.push({
          type: "chest",
          col: cSpot.col,
          row: cSpot.row,
          tier: rnd() < 0.35 ? "LEGENDARY" : "EPIC",
          noMimic: true,
          dorfCache: true
        });
      }
    } else {
      // Grandes clareiras abertas de exploração: patrulhas naturais espalhadas
      const count = 2 + (rnd() < 0.65 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 2 + between(-0.4, 0.4);
        const ep = nearestFloor(center.col + Math.cos(ang) * 4.0, center.row + Math.sin(ang) * 2.8, 0);
        caveEnemies.push({
          type: pick(k === 0 && rnd() < 0.5 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: k === 0 && rnd() < 0.18
        });
      }
    }
  });

  // 1 única zona contínua abrangendo toda a caverna para não existir transição/trancamento de salas!
  const rooms = [
    {
      id: "dorf_expanse",
      name: "Cavernas da Montanha Dorf",
      roomType: "START",
      rect: { x: 2, y: 2, w: C - 4, h: R - 4 },
      walls: [],
      enemies: [],
      decor: decor,
      ambient: 0.62,
      exit: false
    }
  ];

  return {
    id: "dorf_cave",
    biome: "dorf_cave",
    name: "Cavernas da Montanha Dorf",
    depth: 1,
    seed: seedStr,
    endless: false,
    next: null,
    theme: Ls.dorf_cave,
    world: { cols: C, rows: R },
    playerSpawn: playerSpawn,
    rooms: rooms,
    corridors: corridors,
    doors: [], // Zero portas: cenário exploratório contínuo!
    __organicGrid: grid,
    __mossZones: mossZones,
    __darkZones: darkZones,
    __nodes: nodes,
    __sanctuaryNode: sanctuaryNode,
    __caveEnemies: caveEnemies
  };
}

if (typeof window !== "undefined") {
  window.__buildDorfCaveLevel = __buildDorfCaveLevel;
}

/* 3) Renderizador 2.5D Realista das Cavernas Dorf (__dorfBake) */
function __dorfBake(B) {
  const S = B.scene, M = S.cache.json.get("dorf-atlas");
  if (!M || !S.textures.exists("dorf-atlas")) return false;

  if (B.level?.__organicGrid) {
    for (let r = 0; r < B.rows; r++) {
      for (let c = 0; c < B.cols; c++) {
        B.grid[r][c] = B.level.__organicGrid[r]?.[c] ?? 1;
      }
    }
  }

  const texObj = S.textures.get("dorf-atlas");
  if (M.frames && texObj && !texObj.has("p-col-tall-fern")) {
    for (const [k, rect] of Object.entries(M.frames)) {
      if (!texObj.has(k)) texObj.add(k, 0, rect[0], rect[1], rect[2], rect[3]);
    }
  }

  const src = texObj.getSourceImage();
  const C = B.cols, R = B.rows, T = dt || 32, key = "dorfb-" + ++__dorfN;
  const tx = S.textures.createCanvas(key, C * T, R * T), g = tx.getContext();
  g.imageSmoothingEnabled = false;

  let sd = String(B.level.seed ?? "dorf")
    .split("")
    .reduce((a, c) => ((a * 31 + c.charCodeAt(0)) | 0), 13) >>> 0;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (a) => a[(rnd() * a.length) | 0];
  const F = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !B.isWallTile(c, r);
  const D = (q, x, y, sw = q[2], sh = q[3]) => {
    if (!q) return;
    g.drawImage(src, q[0], q[1], q[2], q[3], Math.round(x), Math.round(y), Math.round(sw), Math.round(sh));
  };

  // 1) Fundo abissal escuro (#0d0a10)
  g.fillStyle = "#0d0a10";
  g.fillRect(0, 0, C * T, R * T);

  // 2) Mapa de musgo hexagonal orgânico e solo vulcânico escuro
  const isMoss = Array.from({ length: R }, () => new Array(C).fill(false));
  const isDark = Array.from({ length: R }, () => new Array(C).fill(false));
  const mossZones = B.level.__mossZones || [];
  const darkZones = B.level.__darkZones || [];

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r)) continue;
      for (const mz of mossZones) {
        const ang = Math.atan2(r - mz.cy, c - mz.cx);
        const wob = 1.0 + 0.14 * Math.sin(ang * 3 + mz.cx) + 0.09 * Math.cos(ang * 4 - mz.cy);
        const d2 = ((c - mz.cx) / (mz.rx * wob)) ** 2 + ((r - mz.cy) / (mz.ry * wob)) ** 2;
        if (d2 <= 1.0 && F(c, r - 1) && F(c, r + 1) && F(c - 1, r) && F(c + 1, r)) {
          isMoss[r][c] = true;
          break;
        }
      }
      if (!isMoss[r][c]) {
        for (const dz of darkZones) {
          const d2 = ((c - dz.cx) / dz.rx) ** 2 + ((r - dz.cy) / dz.ry) ** 2;
          if (d2 <= 1.0) {
            isDark[r][c] = true;
            break;
          }
        }
      }
    }
  }

  // 3) Desenhar Pisos (Terra Marrom, Solo Escuro, Musgo Hexagonal com Bordas Autotile, Crateras e Tufos)
  const mb = M.floor.mossBorder;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r)) continue;
      const x = c * T, y = r * T;
      if (isMoss[r][c] && mb) {
        const mn = isMoss[r - 1]?.[c] ?? false;
        const ms = isMoss[r + 1]?.[c] ?? false;
        const mw = isMoss[r]?.[c - 1] ?? false;
        const me = isMoss[r]?.[c + 1] ?? false;
        if (!mn && !mw) D(mb.nw, x, y);
        else if (!mn && !me) D(mb.ne, x, y);
        else if (!ms && !mw) D(mb.sw, x, y);
        else if (!ms && !me) D(mb.se, x, y);
        else if (!mn) D(pick(mb.n), x, y);
        else if (!ms) D(pick(mb.s), x, y);
        else if (!mw) D(pick(mb.w), x, y);
        else if (!me) D(pick(mb.e), x, y);
        else D(pick(M.floor.moss), x, y);
      } else if (isDark[r][c] && M.floor.dark?.length) {
        D(pick(M.floor.dark), x, y);
      } else {
        const p = rnd();
        if (p < 0.068 && M.floor.craters?.length) {
          D(pick(M.floor.craters), x, y);
        } else if (p < 0.155 && M.floor.tufts?.length) {
          D(pick(M.floor.tufts), x, y);
        } else {
          D(pick(M.floor.dirt), x, y);
        }
      }
    }
  }

  // 4) Marcar células ocupadas pelas paredes norte de basalto (3 tiles de altura: r-1, r-2, r-3)
  const hasNCol = Array.from({ length: R }, () => new Array(C).fill(false));
  for (let r = 1; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (F(c, r) && !F(c, r - 1)) {
        for (let k = 1; k <= 3; k++) {
          if (r - k >= 0) hasNCol[r - k][c] = true;
        }
      }
    }
  }

  // 5) Bordas Laterais (Leste/Oeste) e Borda Sul de Basalto (incluindo penínsulas rochosas internas!)
  if (M.wall.south && M.wall.sideL && M.wall.sideR) {
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (F(c, r) || hasNCol[r][c]) continue;
        const fn = F(c, r - 1);
        const fw = F(c - 1, r);
        const fe = F(c + 1, r);
        const x = c * T, y = r * T;
        if (fn) {
          D(M.wall.south[(c + r) % M.wall.south.length], x, y);
        } else if (fe) {
          D(M.wall.sideL[r % M.wall.sideL.length], x, y);
        } else if (fw) {
          D(M.wall.sideR[r % M.wall.sideR.length], x, y);
        } else if (F(c + 1, r - 1) && M.wall.cornerSW) {
          D(M.wall.cornerSW, x, y);
        } else if (F(c - 1, r - 1) && M.wall.cornerSE) {
          D(M.wall.cornerSE, x, y);
        } else if (F(c + 1, r + 1) && M.wall.cornerNW) {
          D(M.wall.cornerNW, x, y);
        } else if (F(c - 1, r + 1) && M.wall.cornerNE) {
          D(M.wall.cornerNE, x, y);
        }
      }
    }
  }

  // 6) Paredes Norte de Basalto de 3 Tiles de Altura (cap + mid + base + vinhas luminescentes)
  const grottoSpots = [];
  const sp = B.level.playerSpawn || { col: 18, row: 14 };

  for (let r = 1; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r) || F(c, r - 1)) continue;
      const x = c * T;
      const useGlow = rnd() < 0.26 && M.wall.glowCap?.length;
      const k = (c * 3 + r * 5) % M.wall.cap.length;
      const gk = (c * 3 + r * 5) % (M.wall.glowCap?.length || 1);

      if (useGlow) {
        if (r - 3 >= 0) D(M.wall.glowCap[gk], x, (r - 3) * T);
        if (r - 2 >= 0) D(M.wall.faceGlow[gk], x, (r - 2) * T);
        D(M.wall.glowBase[gk], x, (r - 1) * T);
      } else {
        if (r - 3 >= 0) D(M.wall.cap[k], x, (r - 3) * T);
        if (r - 2 >= 0) D(M.wall.mid[k], x, (r - 2) * T);
        D(M.wall.base[k], x, (r - 1) * T);
      }

      g.fillStyle = "rgba(8, 5, 12, 0.34)";
      g.fillRect(x, r * T, T, 6);

      if (
        c > 5 && c < C - 6 &&
        Math.hypot(c - sp.col, r - sp.row) > 9 &&
        F(c + 1, r) && !F(c + 1, r - 1) &&
        rnd() < 0.16
      ) {
        grottoSpots.push({ col: c, row: r });
      }
    }
  }

  // 7) Embutir Grotas Escuras (cave-grotto) na parede norte (como na Imagem de Referência 3)
  if (M.arches?.grotto) {
    let placedGrottos = 0;
    for (const gs of grottoSpots) {
      if (placedGrottos >= 4) break;
      if (grottoSpots.some((o) => o !== gs && o.__used && Math.hypot(o.col - gs.col, o.row - gs.row) < 11)) continue;
      gs.__used = true;
      placedGrottos++;
      D(M.arches.grotto, gs.col * T, (gs.row - 3) * T);
    }
  }

  // 8) Terraços de Pedra Cinza e Escadarias ao redor das Clareiras de Musgo (Imagens de Referência 2 e 3)
  const stairTiles = new Set();
  if (M.ledge) {
    for (const mz of mossZones) {
      const sc = Math.round(mz.cx);
      let sRow = Math.round(mz.cy);
      while (sRow < R - 4 && isMoss[sRow]?.[sc]) sRow++;
      if (F(sc, sRow) && F(sc + 1, sRow)) {
        D(M.stairs, sc * T, (sRow - 1) * T + 12);
        stairTiles.add(`${sc},${sRow}`);
        stairTiles.add(`${sc + 1},${sRow}`);
        stairTiles.add(`${sc},${sRow - 1}`);
        stairTiles.add(`${sc + 1},${sRow - 1}`);
      }
      let wCol = Math.round(mz.cx);
      while (wCol > 4 && isMoss[Math.round(mz.cy)]?.[wCol]) wCol--;
      let eCol = Math.round(mz.cx);
      while (eCol < C - 5 && isMoss[Math.round(mz.cy)]?.[eCol]) eCol++;
      if (F(wCol - 1, Math.round(mz.cy)) && M.ledge.pillarL) {
        D(M.ledge.pillarL, (wCol - 1) * T, (Math.round(mz.cy) - 1) * T);
      }
      if (F(eCol, Math.round(mz.cy)) && M.ledge.pillarR) {
        D(M.ledge.pillarR, eCol * T, (Math.round(mz.cy) - 1) * T);
      }
    }

    for (let r = 2; r < R - 2; r++) {
      for (let c = 2; c < C - 2; c++) {
        if (!F(c, r) || isMoss[r][c] || stairTiles.has(`${c},${r}`)) continue;
        const mn = isMoss[r - 1]?.[c] ?? false;
        const ms = isMoss[r + 1]?.[c] ?? false;
        const mw = isMoss[r]?.[c - 1] ?? false;
        const me = isMoss[r]?.[c + 1] ?? false;
        if (mn) {
          D(M.ledge.s[(c + r) % M.ledge.s.length], c * T, r * T);
        } else if (me && !mn && !ms) {
          D(M.ledge.l[r % M.ledge.l.length], c * T, r * T);
        } else if (mw && !mn && !ms) {
          D(M.ledge.r[r % M.ledge.r.length], c * T, r * T);
        }
      }
    }
  }

  // 9) Animações de Chamas de Cristal Ciano e Verde (32x64 por frame, 6 frames suaves sem piscar!)
  ["cyan", "green", "fire"].forEach((colKey) => {
    const frames = M.lights[colKey];
    if (!frames || !frames.length) return;
    frames.forEach((rect, idx) => {
      const fKey = `dorf-l32-${colKey}-${idx}`;
      if (!S.textures.exists(fKey)) {
        const c = S.textures.createCanvas(fKey, rect[2], rect[3]);
        const ctx = c.getContext();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
        c.refresh();
      }
    });
    const animKey = `dorf-light32-${colKey}`;
    if (!S.anims.exists(animKey)) {
      S.anims.create({
        key: animKey,
        frames: frames.map((_, idx) => ({ key: `dorf-l32-${colKey}-${idx}` })),
        frameRate: 8,
        repeat: -1
      });
    }
  });

  const spawnBrazier = (wx, wy, colKey = "cyan") => {
    const spr = S.add.sprite(wx, wy, `dorf-l32-${colKey}-0`)
      .setOrigin(0.5, 0.92)
      .setDepth(wy + 4);
    spr.play(`dorf-light32-${colKey}`);
    const tint = colKey === "cyan" ? 0x38bdf8 : colKey === "green" ? 0x4ade80 : 0xfbbf24;
    const gl = S.add.image(wx, wy - 16, "light")
      .setBlendMode(j.BlendModes.ADD)
      .setTint(tint)
      .setScale(0.52)
      .setAlpha(0.28)
      .setDepth(wy + 3);
    S.tweens.add({
      targets: gl,
      alpha: { from: 0.20, to: 0.34 },
      scale: { from: 0.48, to: 0.56 },
      duration: 1100 + Math.random() * 400,
      yoyo: true,
      repeat: -1
    });
    B.lightSources?.push({ x: wx, y: wy - 14, type: "MAGIC_CRYSTAL", color: tint, radius: 140 });
    return spr;
  };

  // 10) Portais de Retorno ao Refúgio (Entrada Norte + Santuário Distante)
  let wallRow = sp.row;
  while (wallRow > 3 && F(sp.col, wallRow - 1)) wallRow--;
  const archX = (sp.col - 2) * T;
  const archY = (wallRow - 3) * T;
  if (M.portalArch) {
    D(M.portalArch, archX, archY);
  }
  const spX = sp.col * T;
  const spY = wallRow * T + 8;

  spawnBrazier(spX - 38, spY + 2, "cyan");
  spawnBrazier(spX + 38, spY + 2, "cyan");

  // Segundo Portal de Retorno no Santuário Distante (para sair após explorar sem precisar voltar tudo a pé)
  let farPortalPos = null;
  const sNode = B.level.__sanctuaryNode;
  if (sNode) {
    let fCol = Math.round(sNode.cx), fRow = Math.round(sNode.cy);
    while (fRow > 5 && F(fCol, fRow - 1)) fRow--;
    if (!F(fCol, fRow - 1) && F(fCol - 1, fRow) && F(fCol + 1, fRow)) {
      if (M.portalArch) D(M.portalArch, (fCol - 2) * T, (fRow - 3) * T);
      farPortalPos = { x: fCol * T, y: fRow * T + 8, col: fCol, row: fRow };
      spawnBrazier(farPortalPos.x - 38, farPortalPos.y + 2, "cyan");
      spawnBrazier(farPortalPos.x + 38, farPortalPos.y + 2, "cyan");
    }
  }

  // 11) Adereços 2.5D com Y-Sorting Real e Proporções 1:1 (Estalagmites, Cogumelos, Samambaias, Vasos)
  const usedCells = new Set();
  const markUsed = (c, r, rad = 1) => {
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) usedCells.add(`${c + dx},${r + dy}`);
    }
  };
  markUsed(sp.col, sp.row, 3);
  markUsed(sp.col, wallRow, 3);
  if (farPortalPos) markUsed(farPortalPos.col, farPortalPos.row, 3);
  for (const rm of B.level.rooms || []) {
    for (const dc of rm.decor || []) markUsed(dc.col, dc.row, 2);
  }
  for (const en of B.level.__caveEnemies || []) {
    markUsed(en.col, en.row, 1);
  }

  if (!B.__dorfSolids && S.physics?.add) {
    B.__dorfSolids = S.physics.add.staticGroup();
  }

  const spawnProp25D = (frameKey, wx, wy, solidW = 0, solidH = 0, depthOffset = 0) => {
    if (!texObj.has(frameKey)) return null;
    const im = S.add.image(wx, wy, "dorf-atlas", frameKey)
      .setOrigin(0.5, 1)
      .setDepth(wy + depthOffset);
    if (solidW > 0 && solidH > 0 && B.__dorfSolids) {
      const z = S.add.zone(wx, wy - solidH * 0.5, solidW, solidH);
      S.physics.add.existing(z, true);
      B.__dorfSolids.add(z);
    }
    return im;
  };

  // A) Grandes formações de estalagmites encostadas nas falésias norte e curvas da caverna (Imagens 1, 2 e 3)
  const cliffCols = [
    "p-col-red-tall-fern", "p-col-red-spire-fern", "p-col-red-massive", "p-col-tall-fern",
    "p-col-spire-fern", "p-col-wide-fern", "p-col-massive-fern", "p-col-cluster", "p-col-red-cluster"
  ];
  for (let r = 6; r < R - 5; r++) {
    for (let c = 5; c < C - 5; c++) {
      if (!F(c, r) || F(c, r - 1)) continue;
      if (usedCells.has(`${c},${r}`)) continue;
      if (!F(c, r + 1) || !F(c, r + 2) || !F(c, r + 3) || !F(c - 1, r + 1) || !F(c + 1, r + 1)) continue;
      if (rnd() < 0.16) {
        const fk = isMoss[r + 1]?.[c]
          ? pick(["p-col-red-tall-fern", "p-col-red-spire-fern", "p-col-red-massive", "p-col-red-cluster"])
          : pick(cliffCols);
        const wx = c * T + T * 0.5;
        const wy = r * T + 24;
        spawnProp25D(fk, wx, wy, 28, 14, 0);
        markUsed(c, r, 3);
      }
    }
  }

  // B) Pilares de rocha internos nas clareiras amplas + Vasos de Brotos no Musgo Hexagonal
  const midCols = ["p-col-trio", "p-col-red-trio", "p-col-cone", "p-col-red-cone", "p-col-pillar", "p-col-twin-fern", "p-rock-trio", "p-rock-red-trio"];
  const shroomKeys = ["p-shroom-big", "p-shroom-big-2", "p-shroom-cluster", "p-shroom-med-1", "p-shroom-med-2", "p-shroom-tiny"];
  const fernKeys = ["p-fern-big", "p-fern-med", "p-fern-small", "p-reeds-big", "p-reeds-small"];

  for (let r = 7; r < R - 5; r++) {
    for (let c = 5; c < C - 5; c++) {
      if (!F(c, r) || usedCells.has(`${c},${r}`)) continue;
      const wx = c * T + (rnd() - 0.5) * 8 + T * 0.5;
      const wy = r * T + (rnd() - 0.5) * 8 + T * 0.75;

      let open3x3 = true;
      for (let dy = -1; dy <= 1 && open3x3; dy++) {
        for (let dx = -1; dx <= 1 && open3x3; dx++) {
          if (!F(c + dx, r + dy)) open3x3 = false;
        }
      }

      if (isMoss[r][c]) {
        if (open3x3 && rnd() < 0.065) {
          spawnProp25D(rnd() < 0.5 ? "p-sprout-pot-1" : "p-sprout-pot-2", wx, wy, 14, 10, 0);
          markUsed(c, r, 2);
        } else if (rnd() < 0.05) {
          spawnProp25D(pick(["p-reeds-small", "p-fern-tiny"]), wx, wy, 0, 0, -12);
          markUsed(c, r, 1);
        }
      } else {
        const nearWall = !F(c - 1, r) || !F(c + 1, r) || !F(c, r - 1) || !F(c, r + 1);
        if (open3x3 && rnd() < 0.032 && F(c, r + 2) && F(c, r - 2)) {
          const fk = pick(midCols);
          spawnProp25D(fk, wx, wy, 20, 12, 0);
          markUsed(c, r, 2);
        } else if (nearWall && rnd() < 0.12) {
          const sk = pick(shroomKeys);
          const isBig = sk.includes("big") || sk.includes("cluster");
          spawnProp25D(sk, wx, wy, isBig ? 14 : 0, isBig ? 10 : 0, isBig ? 0 : -8);
          if (isBig) {
            const sgl = S.add.image(wx, wy - 12, "light")
              .setBlendMode(j.BlendModes.ADD)
              .setTint(0xa7f3d0)
              .setScale(0.24)
              .setAlpha(0.18)
              .setDepth(wy - 1);
            S.tweens.add({ targets: sgl, alpha: 0.09, duration: 1300 + Math.random() * 500, yoyo: true, repeat: -1 });
          }
          markUsed(c, r, 1);
        } else if (rnd() < 0.08) {
          spawnProp25D(pick(fernKeys), wx, wy, 0, 0, -12);
          markUsed(c, r, 1);
        }
      }
    }
  }

  // C) Braseiros de Cristal Ciano/Verde distribuídos nas escadarias dos terraços, fendas e encruzilhadas
  for (const mz of mossZones) {
    const sc = Math.round(mz.cx);
    let sRow = Math.round(mz.cy);
    while (sRow < R - 4 && isMoss[sRow]?.[sc]) sRow++;
    if (F(sc - 2, sRow)) spawnBrazier((sc - 2) * T + 16, sRow * T + 14, "cyan");
    if (F(sc + 3, sRow)) spawnBrazier((sc + 3) * T + 16, sRow * T + 14, "cyan");
  }
  for (const nd of B.level.__nodes || []) {
    if (nd.kind === "START") continue;
    const bx = (nd.cx + (rnd() < 0.5 ? -2 : 2)) * T + 16;
    const by = (nd.cy - 1) * T + 16;
    if (F(Math.floor(bx / T), Math.floor(by / T))) {
      spawnBrazier(bx, by, nd.kind === "ALCOVE_LOOT" ? "green" : "cyan");
    }
  }

  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0, 0).setDepth(0.5);
  B.groundLayer?.setVisible?.(false);
  B.wallLayer?.setVisible?.(false);

  // 12) Configurar Portais de Retorno ao Refúgio, Inimigos de Patrulha, Colisões 2.5D e Moedas do Ferreiro
  if (S.isDorfCave) {
    const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
    S.__dorfReturnPortal = { x: spX, y: spY - 52, r: 44 };
    S.__dorfPortals = [S.__dorfReturnPortal];

    const addReturnVortex = (px, py) => {
      const retVortex = S.add.sprite(px, py - 4, "portal", 0)
        .setScale(0.85)
        .setTint(0x38bdf8)
        .setAlpha(0.78)
        .setDepth(py - 2);
      if (S.anims.exists("portal-spin")) retVortex.play("portal-spin");
      S.add.text(px, py - 34, L3("SAÍDA · REFÚGIO", "EXIT · REFUGE", "SALIDA · REFUGIO"), {
        fontFamily: "'Cinzel', Georgia, serif",
        fontSize: "8px",
        color: "#7dd3fc",
        stroke: "#090d16",
        strokeThickness: 3
      }).setOrigin(0.5, 1).setDepth(9100);
    };

    addReturnVortex(spX, spY - 52);
    if (farPortalPos) {
      const fp = { x: farPortalPos.x, y: farPortalPos.y - 44, r: 44 };
      S.__dorfPortals.push(fp);
      addReturnVortex(fp.x, fp.y);
    }

    let postInitDone = false;
    const runPostInit = () => {
      if (postInitDone || !S.scene?.isActive()) return;
      postInitDone = true;

      // Limpar qualquer pendência ou estado aberto de __SPPanel na caverna Dorf
      try {
        const U = S.scene?.get?.("UI");
        if (U?.__etp) {
          U.__etp.open = false;
          U.__etp.queue = [];
          try { U.__etp.root?.destroy?.(true); } catch (_) {}
          U.__etp.root = null;
        }
      } catch (_) {}

      if (B.__dorfSolids && S.player) {
        S.physics.add.collider(S.player, B.__dorfSolids);
        if (S.enemies) S.physics.add.collider(S.enemies, B.__dorfSolids);
      }

      // Instanciar criaturas patrulhando naturalmente pela caverna ampla (sem trancar salas)
      if (!S.__dorfEnemiesSpawned && Array.isArray(B.level.__caveEnemies)) {
        S.__dorfEnemiesSpawned = true;
        for (const en of B.level.__caveEnemies) {
          try {
            const validType = typeof ee !== "undefined" && ee[en.type] ? en.type : "SKELETON_WARRIOR";
            S.spawnEnemy?.(validType, en.col, en.row, { elite: !!en.elite, eliteRoll: false });
          } catch (e) {}
        }
        if (B.__dorfSolids && S.enemies) {
          S.physics.add.collider(S.enemies, B.__dorfSolids);
        }
      }

      // Atualizar HUD superior direito para exibir EXPLORAÇÃO LIVRE em vez de SALAS: 0/0
      try {
        const uiScene = S.scene?.get?.("UI");
        if (uiScene && uiScene.hud && !uiScene.hud.__dorfPatched) {
          uiScene.hud.__dorfPatched = true;
          const origHudRedraw = uiScene.hud.redraw.bind(uiScene.hud);
          uiScene.hud.redraw = function () {
            origHudRedraw();
            if (S.isDorfCave && this.statusText) {
              this.statusText.setText(L3("EXPLORAÇÃO LIVRE", "FREE EXPLORATION", "EXPLORACIÓN LIBRE"));
            }
          };
          uiScene.hud.redraw();
        }
      } catch (e) {}

      // Indicador de Moedas do Ferreiro na HUD da caverna
      if (!S.__dorfCoinTxt) {
        const curCoins = __getForgeCoins(S);
        S.__dorfCoinTxt = S.add.text(16, 54, `🪙 ${L3("Moedas do Ferreiro", "Blacksmith Coins", "Monedas del Herrero")}: ${curCoins}`, {
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: "10px",
          fontStyle: "bold",
          color: "#ffd24a",
          backgroundColor: "#120c08cc",
          padding: { x: 7, y: 4 },
          stroke: "#000000",
          strokeThickness: 2
        }).setScrollFactor(0).setDepth(9600);
      }

      // Hook no sistema de loot para entregar as Moedas do Ferreiro (escassas e valiosas!)
      if (S.lootSystem && !S.lootSystem.__dorfHooked) {
        S.lootSystem.__dorfHooked = true;
        const origOpenChest = S.lootSystem.openChest.bind(S.lootSystem);
        S.lootSystem.openChest = function (chest) {
          origOpenChest(chest);
          if (S.isDorfCave && !chest.__dorfCoinGiven) {
            chest.__dorfCoinGiven = true;
            // 1 a 2 moedas por arca oculta para manter o incentivo de explorar novas cavernas!
            const coins = Math.random() < 0.35 ? 2 : 1;
            __addForgeCoins(coins, S, chest.x, chest.y);
          }
        };

        const origDropEnemy = S.lootSystem.dropFromEnemy.bind(S.lootSystem);
        S.lootSystem.dropFromEnemy = function (enemy) {
          if (S.isDorfCave && enemy) {
            enemy.goldMult = (enemy.goldMult ?? 1) * 0.3;
            if (enemy.isElite && !enemy.respawned && Math.random() < 0.5) {
              __addForgeCoins(1, S, enemy.x, enemy.y);
            }
          }
          return origDropEnemy(enemy);
        };
      }
    };
    S.time?.delayedCall(120, runPostInit);
    setTimeout(runPostInit, 160);
  }

  return true;
}

/* 4) Retorno seguro das Cavernas de Dorf para o Refúgio (salvando ouro, itens e Moedas do Ferreiro) */
function __dorfReturnToRefuge(S) {
  if (!S || S.__dorfExiting) return;
  S.__dorfExiting = true;

  // Descongelar timers, física, tweens e flags de UI para evitar qualquer travamento
  try {
    S.uiOpen = false;
    if (S.time) S.time.paused = false;
    S.physics?.resume?.();
    S.tweens?.resumeAll?.();
    if (S.player?.body) {
      S.player.body.enable = false;
      S.player.setVelocity?.(0, 0);
    }
    for (const e of (S.enemies?.getChildren?.() || [])) {
      if (e.active && !e.dead) e.setVelocity?.(0, 0);
    }
    const U = S.scene?.get?.("UI");
    if (U?.__etp) {
      U.__etp.open = false;
      U.__etp.queue = [];
      try { U.__etp.root?.destroy?.(true); } catch (_) {}
      U.__etp.root = null;
    }
  } catch (e) {
    console.warn("[dorf_cave] erro ao descongelar física/tweens:", e);
  }

  S.audio?.play?.("portal") || S.game?.audioEngine?.sfx?.("portal");

  const isCamp = S.originMode === "campaign";
  const slot = S.dorfSlot || S.game?.registry?.get("save:slot") || 1;
  const curForgeCoins = __getForgeCoins(S);

  try {
    if (isCamp && typeof Dn === "function") {
      const res = Dn(slot);
      if (res?.ok && res.data) {
        const d = res.data;
        d.player = d.player || {};
        // Ao retornar (seja vivo ou derrotado), garante HP recuperado no Refúgio
        const maxHp = S.player?.maxHp || S.stats?.maxHp || d.player.maxHp || 6;
        d.player.hp = Math.max(1, maxHp);
        d.player.dead = false;
        if (typeof S.stats?.gold === "number") d.player.gold = S.stats.gold;
        else if (typeof S.player?.gold === "number") d.player.gold = S.player.gold;
        d.player.forgeCoins = curForgeCoins;
        if (S.inventory?.serialize) {
          const inv = S.inventory.serialize();
          d.player.inventory = inv;
          if (inv.items) d.player.items = inv.items;
          if (inv.equipment) d.player.equipment = inv.equipment;
          if (typeof inv.potions === "number") d.player.potions = inv.potions;
        }
        if (typeof S.stats?.xp === "number") d.player.xp = S.stats.xp;
        if (typeof S.stats?.level === "number") d.player.level = S.stats.level;
        localStorage.setItem(Wt("campaign", slot), JSON.stringify(d));
      }
    } else if (!isCamp && typeof In === "function") {
      try { In(S); } catch (e) {}
      __setForgeCoins(curForgeCoins, S);
    }
  } catch (e) {
    console.warn("[dorf_cave] erro ao salvar retorno:", e);
  }

  let returned = false;
  const doReturn = () => {
    if (returned) return;
    returned = true;
    try { S.scene.stop("UI"); } catch (e) {}
    if (isCamp) {
      S.game.registry.set("hub:fromForest", { slot: slot });
    } else {
      S.game.registry.remove("hub:fromForest");
    }
    S.game.registry.set("hub:classId", S.classDef?.id || "WARRIOR");
    S.scene.start("Hub");
  };
  try { S.cameras?.main?.fadeEffect?.reset?.(); } catch (e) {}
  S.cameraSys?.fadeOut(350, doReturn);
  setTimeout(doReturn, 400);
}
try { if (typeof window !== "undefined") window.__dorfReturnToRefuge = __dorfReturnToRefuge; } catch (e) {}
