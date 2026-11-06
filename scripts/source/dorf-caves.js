/* ── Bioma: Cavernas da Montanha Dorf (RPG Worlds Deep Cave - Szadi art) ─────────────────────────
   Cenário exploratório orgânico e procedural (sem salas retangulares e sem portas trancadas):
   - Paredes de basalto de 3 tiles de altura em degraus curvos com vinhas luminescentes
   - Clareiras de musgo hexagonal com bordas orgânicas, terraços de pedra cinza e escadarias
   - Formações de estalagmites 2.5D com ordenação de profundidade Y (Y-sorting) e colisão na base
   - Economia de exploração: poucos baús escondidos em fendas profundas, porém valiosos,
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

/* 1) Registro de Tema, Inimigos e Tabelas de Loot Escasso e Valioso */
(function __registerDorfBiome() {
  if (typeof Ls === "undefined") return;
  const baseTheme = Ls.catacombs || Ls.ruins || Object.values(Ls)[0];
  Ls.dorf_cave = {
    ...baseTheme,
    id: "dorf_cave",
    name: "Cavernas da Montanha Dorf",
    tilesetKey: "tiles-dorf-cave",
    ambient: 0.56,
    fogColor: 0x0d0a10,
    fogDensity: 0.008,
    music: "catacombs-theme",
    palette: {
      floor: 0x4b3834,
      wall: 0x5c4454,
      accent: 0x38bdf8,
      light: 0x67e8f9
    },
    lightPreset: {
      color: 0x67e8f9,
      radius: 145,
      intensity: 0.95
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
      // Poucos baús, mas com itens raros/épicos/lendários garantidos
      js.dorf_cave = {
        rolls: 2,
        gold: { min: 18, max: 34 },
        pools: ["weapons_tier2", "weapons_tier3", "armor_tier2", "armor_tier3", "rings", "amulets", "relics_pool"],
        rarities: { COMMON: 0, UNCOMMON: 12, RARE: 52, EPIC: 26, LEGENDARY: 10 }
      };
    }
    if (typeof ed !== "undefined") {
      ed.dorf_cave = {
        common: ["BAT", "SPIDER", "GOBLIN", "SKELETON", "SLIME"],
        uncommon: ["CAVE_TROLL", "GHOUL", "DARK_MAGE", "WRAITH", "GARGOYLE"],
        elite: ["GOLEM", "VOID_STALKER", "DEATH_KNIGHT", "LICH"],
        bosses: ["ANCIENT_COLOSSUS", "ABYSS_GUARDIAN", "BEHOLDER"]
      };
    }
  } catch (e) {}
})();

/* 2) Gerador Procedural Orgânico Sem Salas Retangulares (__buildDorfCaveLevel) */
function __buildDorfCaveLevel(runCfg = {}) {
  const depth = Math.max(1, runCfg.depth || 1);
  // Semente muda a cada expedição para que os túneis sempre se transformem
  const salt = runCfg.freshSeed || Math.floor(Date.now() / 1000);
  const seedStr = `${runCfg.seed || "dorf"}_${depth}_${salt}`;
  let sd = seedStr.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 17) >>> 0;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (a) => a[(rnd() * a.length) | 0];
  const between = (a, b) => a + rnd() * (b - a);

  const C = 76, R = 62;
  const grid = Array.from({ length: R }, () => new Array(C).fill(1));

  // Centros das clareiras orgânicas (dispostas em rede exploratória sinuosa, nunca em grade reta)
  const flipX = rnd() < 0.5;
  const tx = (x) => (flipX ? C - 1 - x : x);

  const nodes = [
    { id: "fenda_entrada", name: "Fenda de Basalto", cx: tx(14), cy: 13, rx: 6.2, ry: 4.5, kind: "START" },
    { id: "clareira_musgo_1", name: "Clareira do Musgo Antigo", cx: tx(31), cy: Math.round(between(14, 17)), rx: 7.8, ry: 5.4, kind: "MOSS" },
    { id: "galeria_colunas", name: "Galeria das Estalagmites", cx: tx(50), cy: Math.round(between(15, 19)), rx: 7.2, ry: 5.0, kind: "DARK_ROCK", pillar: true },
    { id: "alcova_norte", name: "Recanto Oculto da Forja", cx: tx(64), cy: Math.round(between(12, 15)), rx: 5.2, ry: 4.2, kind: "ALCOVE_LOOT" },
    { id: "jardim_subterraneo", name: "Terraço Subterrâneo de Dorf", cx: tx(42), cy: Math.round(between(33, 36)), rx: 8.2, ry: 5.6, kind: "MOSS", pillar: rnd() < 0.5 },
    { id: "alcova_sul", name: "Fenda Esquecida do Ferreiro", cx: tx(16), cy: Math.round(between(35, 39)), rx: 5.4, ry: 4.3, kind: "ALCOVE_LOOT" },
    { id: "abismo_profundo", name: "Coração da Montanha Dorf", cx: tx(58), cy: Math.round(between(46, 49)), rx: 7.6, ry: 5.2, kind: "EXIT" }
  ];

  // Arestas de túneis sinuosos conectando as clareiras e alcovas
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3], // túnel estreito para a alcova de loot 1
    [1, 4],
    [2, 4],
    [4, 5], // túnel sinuoso para a alcova de loot 2
    [4, 6]  // descida para o abismo profundo (saída)
  ];

  const carveDisk = (cx, cy, rx, ry, ph1 = 0, ph2 = 0) => {
    const x0 = Math.max(4, Math.floor(cx - rx - 2));
    const x1 = Math.min(C - 5, Math.ceil(cx + rx + 2));
    const y0 = Math.max(6, Math.floor(cy - ry - 2));
    const y1 = Math.min(R - 5, Math.ceil(cy + ry + 2));
    for (let r = y0; r <= y1; r++) {
      for (let c = x0; c <= x1; c++) {
        const ang = Math.atan2(r - cy, c - cx);
        const wob = 1.0 + 0.14 * Math.sin(ang * 3 + ph1) + 0.09 * Math.cos(ang * 5 + ph2);
        const d2 = ((c - cx) / (rx * wob)) ** 2 + ((r - cy) / (ry * wob)) ** 2;
        if (d2 <= 1.0) grid[r][c] = 0;
      }
    }
  };

  // 1) Esculpir clareiras multi-lobulares orgânicas
  for (const nd of nodes) {
    const p1 = between(0, 6.28), p2 = between(0, 6.28);
    carveDisk(nd.cx, nd.cy, nd.rx, nd.ry, p1, p2);
    // Lóbulos secundários para quebrar qualquer simetria elíptica
    for (let k = 0; k < 2; k++) {
      const a = between(0, 6.28);
      const ox = nd.cx + Math.cos(a) * nd.rx * 0.48;
      const oy = nd.cy + Math.sin(a) * nd.ry * 0.42;
      carveDisk(ox, oy, nd.rx * 0.55, nd.ry * 0.52, p1 + k, p2 - k);
    }
  }

  // 2) Esculpir túneis orgânicos curvos (curvas de Bézier com largura variável)
  for (const [i, j] of edges) {
    const A = nodes[i], B = nodes[j];
    const isAlcove = A.kind === "ALCOVE_LOOT" || B.kind === "ALCOVE_LOOT";
    const mx = (A.cx + B.cx) * 0.5 + between(-6, 6);
    const my = (A.cy + B.cy) * 0.5 + between(-5, 5);
    const steps = 44;
    const ph = between(0, 6.28);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      const x = u * u * A.cx + 2 * u * t * mx + t * t * B.cx;
      const y = u * u * A.cy + 2 * u * t * my + t * t * B.cy;
      const wRx = (isAlcove ? 2.1 : 2.6) + 0.45 * Math.sin(t * Math.PI * 3 + ph);
      const wRy = (isAlcove ? 1.9 : 2.3) + 0.35 * Math.cos(t * Math.PI * 2 + ph);
      carveDisk(x, y, wRx, wRy, ph, ph * 0.5);
    }
  }

  // 3) Garantir nicho de entrada no topo da Fenda de Entrada para o Portal de Retorno
  const st = nodes[0];
  let spCol = Math.round(st.cx), spRow = Math.round(st.cy) - 1;
  while (spRow > 6 && grid[spRow - 1][spCol] === 0) spRow--;
  // Parede norte reta de 4 colunas apenas para encaixar o arco de pedra da entrada
  for (let dc = -2; dc <= 1; dc++) {
    const cc = Math.max(5, Math.min(C - 6, spCol + dc));
    for (let r = 0; r < spRow; r++) grid[r][cc] = 1;
    for (let r = spRow; r <= spRow + 4 && r < R - 4; r++) grid[r][cc] = 0;
  }
  const playerSpawn = { col: spCol, row: spRow + 2 };

  // 4) Suavização celular (Cellular Automata) para eliminar pontas quadradas
  for (let pass = 0; pass < 2; pass++) {
    const next = grid.map((r) => r.slice());
    for (let r = 6; r < R - 4; r++) {
      for (let c = 4; c < C - 4; c++) {
        if (Math.abs(c - spCol) <= 2 && Math.abs(r - spRow) <= 3) continue;
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

  // 5) Quebrar paredes horizontais longas (> 3 colunas) para manter o efeito em degraus das imagens de referência
  for (let r = 6; r < R - 5; r++) {
    let run = 0;
    for (let c = 4; c < C - 4; c++) {
      if (Math.abs(c - spCol) <= 3 && Math.abs(r - spRow) <= 3) { run = 0; continue; }
      if (grid[r][c] === 0 && grid[r - 1][c] === 1) {
        run++;
        if (run >= 3 && rnd() < 0.65) {
          if (r + 3 < R - 4 && grid[r + 1][c] === 0 && grid[r + 2][c] === 0) {
            grid[r][c] = 1; // degrau de basalto descendo 1 tile
          }
          run = 0;
        }
      } else {
        run = 0;
      }
    }
  }

  // 6) Regra de espessura vertical de parede (>= 5 tiles) para que as colunas de basalto de 3 tiles
  //    + borda sul de 1 tile + abismo escuro nunca se sobreponham a pisos caminháveis!
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
  // Fechar bolhas isoladas inacessíveis
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0 && !vis[r][c]) grid[r][c] = 1;
    }
  }

  // Helper para achar o piso válido mais próximo de (tc, tr)
  const nearestFloor = (tc, tr, minClear = 1) => {
    tc = Math.round(tc); tr = Math.round(tr);
    for (let rad = 0; rad < 18; rad++) {
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

  // 8) Converter a malha orgânica em spans horizontais em `corridors` (para _l.prototype.carve)
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

  // 9) Definir as zonas orgânicas (sem portas!), inimigos de patrulha e os 2-3 baús raros nas alcovas
  const enemyPools = {
    common: ["BAT", "SPIDER", "GOBLIN", "SKELETON", "SLIME"],
    mid: ["GHOUL", "WRAITH", "GARGOYLE", "DARK_MAGE"],
    elite: ["GOLEM", "VOID_STALKER", "DEATH_KNIGHT"]
  };

  const rooms = [];
  const mossZones = [];
  const darkZones = [];

  nodes.forEach((nd, idx) => {
    const center = nearestFloor(nd.cx, nd.cy, 1);
    nd.cx = center.col;
    nd.cy = center.row;

    const rw = Math.max(6, Math.round(nd.rx * 1.8));
    const rh = Math.max(5, Math.round(nd.ry * 1.8));
    const rx = Math.max(3, Math.min(C - rw - 3, center.col - Math.floor(rw / 2)));
    const ry = Math.max(5, Math.min(R - rh - 3, center.row - Math.floor(rh / 2)));

    // Paredes internas dentro do bounding box da zona para que _l.prototype.carve mantenha o formato 100% orgânico!
    const walls = [];
    for (let r = ry; r < ry + rh; r++) {
      for (let c = rx; c < rx + rw; c++) {
        if (grid[r][c] === 1) walls.push({ x: c, y: r, w: 1, h: 1 });
      }
    }

    if (nd.kind === "MOSS") {
      mossZones.push({ cx: center.col, cy: center.row, rx: nd.rx * 0.68, ry: nd.ry * 0.62 });
    } else if (nd.kind === "DARK_ROCK" || nd.kind === "EXIT") {
      darkZones.push({ cx: center.col, cy: center.row, rx: nd.rx * 0.72, ry: nd.ry * 0.68 });
    }

    const enemies = [];
    const decor = [];

    if (nd.kind === "START") {
      // Zona inicial tranquila
    } else if (nd.kind === "ALCOVE_LOOT") {
      // Alcova oculta: guarda 1 Baú Valioso com Moedas do Ferreiro + 1-2 guardiões
      const chSpot = nearestFloor(center.col, center.row - 1, 1);
      const tier = depth >= 3 || rnd() < 0.42 ? "EPIC" : "RARE";
      decor.push({
        type: "chest",
        col: chSpot.col,
        row: chSpot.row,
        tier: tier,
        noMimic: true,
        dorfCache: true
      });
      const guardCount = 1 + (rnd() < 0.55 ? 1 : 0);
      for (let k = 0; k < guardCount; k++) {
        const ep = nearestFloor(center.col + (k ? 2 : -2), center.row + 1, 0);
        enemies.push({
          type: pick(depth >= 2 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: k === 0 && rnd() < 0.35
        });
      }
    } else if (nd.kind === "EXIT") {
      // Abismo Profundo: Guardião de Elite + lacaios + portal de descida ao limpar
      const bossSpot = nearestFloor(center.col, center.row, 1);
      enemies.push({
        type: pick(enemyPools.elite),
        col: bossSpot.col,
        row: bossSpot.row,
        elite: true
      });
      const minionCount = 2 + Math.min(2, Math.floor(depth / 2));
      for (let k = 0; k < minionCount; k++) {
        const ang = (k / minionCount) * Math.PI * 2;
        const ep = nearestFloor(center.col + Math.cos(ang) * 3, center.row + Math.sin(ang) * 2, 0);
        enemies.push({
          type: pick(rnd() < 0.5 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row
        });
      }
      // Chance de 1 relíquia ancestral extra no fundo do abismo a cada 2 níveis
      if (depth % 2 === 0 || rnd() < 0.35) {
        const cSpot = nearestFloor(center.col + 3, center.row - 2, 1);
        decor.push({
          type: "chest",
          col: cSpot.col,
          row: cSpot.row,
          tier: depth >= 4 ? "LEGENDARY" : "EPIC",
          noMimic: true,
          dorfCache: true
        });
      }
    } else {
      // Clareiras principais de exploração: patrulhas moderadas
      const count = 2 + (rnd() < 0.6 ? 1 : 0) + (depth >= 3 && rnd() < 0.4 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 2 + between(-0.3, 0.3);
        const ep = nearestFloor(center.col + Math.cos(ang) * 3.2, center.row + Math.sin(ang) * 2.2, 0);
        enemies.push({
          type: pick(k === 0 && rnd() < 0.45 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: k === 0 && depth >= 2 && rnd() < 0.2
        });
      }
    }

    rooms.push({
      id: nd.id + "_" + idx,
      name: nd.name,
      roomType: nd.kind === "START" ? "START" : nd.kind === "ALCOVE_LOOT" ? "TREASURE" : nd.kind === "EXIT" ? "ELITE" : "COMBAT",
      rect: { x: rx, y: ry, w: rw, h: rh },
      walls: walls,
      enemies: enemies,
      decor: decor,
      ambient: 0.56,
      exit: nd.kind === "EXIT"
    });
  });

  return {
    id: "dorf_cave",
    biome: "dorf_cave",
    name: "Cavernas da Montanha Dorf" + (depth > 1 ? ` · Nível ${depth}` : ""),
    depth: depth,
    seed: seedStr,
    endless: true,
    theme: Ls.dorf_cave,
    world: { cols: C, rows: R },
    playerSpawn: playerSpawn,
    rooms: rooms,
    corridors: corridors,
    doors: [], // Zero portas: cenário 100% exploratório e contínuo!
    __organicGrid: grid,
    __mossZones: mossZones,
    __darkZones: darkZones,
    __nodes: nodes
  };
}

if (typeof window !== "undefined") {
  window.__buildDorfCaveLevel = __buildDorfCaveLevel;
}

/* 3) Renderizador 2.5D Realista das Cavernas Dorf (__dorfBake) */
function __dorfBake(B) {
  const S = B.scene, M = S.cache.json.get("dorf-atlas");
  if (!M || !S.textures.exists("dorf-atlas")) return false;

  // Garantir que a malha de colisão B.grid seja exatamente a malha orgânica se presente
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

  let sd = (String(B.level.seed ?? "dorf") + "_" + (B.level.depth || 1))
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

  // 2) Mapa de musgo hexagonal orgânico e terraços
  const isMoss = Array.from({ length: R }, () => new Array(C).fill(false));
  const isDark = Array.from({ length: R }, () => new Array(C).fill(false));
  const mossZones = B.level.__mossZones || [];
  const darkZones = B.level.__darkZones || [];

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r)) continue;
      // O musgo hexagonal fica a pelo menos 1 tile de distância das paredes norte para o terraço respirar
      for (const mz of mossZones) {
        const ang = Math.atan2(r - mz.cy, c - mz.cx);
        const wob = 1.0 + 0.12 * Math.sin(ang * 3 + mz.cx) + 0.08 * Math.cos(ang * 4 - mz.cy);
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
        if (p < 0.065 && M.floor.craters?.length) {
          D(pick(M.floor.craters), x, y);
        } else if (p < 0.145 && M.floor.tufts?.length) {
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

  // 5) Bordas Laterais (Leste/Oeste) e Borda Sul de Basalto (desenhadas antes das colunas norte)
  if (M.wall.south && M.wall.sideL && M.wall.sideR) {
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (F(c, r) || hasNCol[r][c]) continue;
        const fn = F(c, r - 1);
        const fs = F(c, r + 1);
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
  const sp = B.level.playerSpawn || { col: 14, row: 14 };

  for (let r = 1; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r) || F(c, r - 1)) continue;
      const x = c * T;
      const useGlow = rnd() < 0.24 && M.wall.glowCap?.length;
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

      // Sombra de oclusão suave no pé da falésia de basalto
      g.fillStyle = "rgba(8, 5, 12, 0.34)";
      g.fillRect(x, r * T, T, 6);

      // Candidato para grota escura embutida na parede norte (2 colunas alinhadas longe do spawn)
      if (
        c > 5 && c < C - 6 &&
        Math.hypot(c - sp.col, r - sp.row) > 8 &&
        F(c + 1, r) && !F(c + 1, r - 1) &&
        rnd() < 0.14
      ) {
        grottoSpots.push({ col: c, row: r });
      }
    }
  }

  // 7) Embutir Grotas Escuras (cave-grotto) na parede norte (como na Imagem de Referência 3)
  if (M.arches?.grotto) {
    let placedGrottos = 0;
    for (const gs of grottoSpots) {
      if (placedGrottos >= 3) break;
      if (grottoSpots.some((o) => o !== gs && o.__used && Math.hypot(o.col - gs.col, o.row - gs.row) < 12)) continue;
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
      // Encontrar a borda sul do musgo para posicionar a escadaria de pedra de 2 tiles
      let sRow = Math.round(mz.cy);
      while (sRow < R - 4 && isMoss[sRow]?.[sc]) sRow++;
      if (F(sc, sRow) && F(sc + 1, sRow)) {
        D(M.stairs, sc * T, (sRow - 1) * T + 12);
        stairTiles.add(`${sc},${sRow}`);
        stairTiles.add(`${sc + 1},${sRow}`);
        stairTiles.add(`${sc},${sRow - 1}`);
        stairTiles.add(`${sc + 1},${sRow - 1}`);
      }
      // Pilares laterais de pedra cinza nas extremidades oeste e leste do terraço
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

  // 9) Animações de Chamas de Cristal Ciano e Verde
  if (!S.anims.exists("dorf-light-cyan")) {
    ["cyan", "green", "fire"].forEach((colKey) => {
      const frames = M.lights[colKey];
      if (!frames) return;
      frames.forEach((rect, idx) => {
        const fKey = `dorf-l-${colKey}-${idx}`;
        if (!S.textures.exists(fKey)) {
          const c = S.textures.createCanvas(fKey, rect[2], rect[3]);
          const ctx = c.getContext();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(src, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
          c.refresh();
        }
      });
      S.anims.create({
        key: `dorf-light-${colKey}`,
        frames: [
          { key: `dorf-l-${colKey}-0` },
          { key: `dorf-l-${colKey}-1` },
          { key: `dorf-l-${colKey}-2` },
          { key: `dorf-l-${colKey}-1` }
        ],
        frameRate: 6,
        repeat: -1
      });
    });
  }

  const spawnBrazier = (wx, wy, colKey = "cyan") => {
    const spr = S.add.sprite(wx, wy, `dorf-l-${colKey}-0`)
      .setOrigin(0.5, 0.72)
      .setDepth(wy + 4);
    spr.play(`dorf-light-${colKey}`);
    const tint = colKey === "cyan" ? 0x38bdf8 : colKey === "green" ? 0x4ade80 : 0xfbbf24;
    const gl = S.add.image(wx, wy - 8, "light")
      .setBlendMode(j.BlendModes.ADD)
      .setTint(tint)
      .setScale(0.52)
      .setAlpha(0.28)
      .setDepth(wy + 3);
    S.tweens.add({
      targets: gl,
      alpha: { from: 0.18, to: 0.34 },
      scale: { from: 0.46, to: 0.58 },
      duration: 950 + Math.random() * 400,
      yoyo: true,
      repeat: -1
    });
    B.lightSources?.push({ x: wx, y: wy - 6, type: "MAGIC_CRYSTAL", color: tint, radius: 135 });
    return spr;
  };

  // 10) Portal de Entrada/Retorno embutido na parede norte do spawn + Braseiros Ciano
  let wallRow = sp.row;
  while (wallRow > 3 && F(sp.col, wallRow - 1)) wallRow--;
  const archX = (sp.col - 2) * T;
  const archY = (wallRow - 3) * T;
  if (M.portalArch) {
    D(M.portalArch, archX, archY);
  }
  const spX = sp.col * T;
  const spY = wallRow * T + 8;

  spawnBrazier(spX - 36, spY - 6, "cyan");
  spawnBrazier(spX + 36, spY - 6, "cyan");

  // 11) Adereços 2.5D com Y-Sorting Real e Proporções 1:1 (Estalagmites, Cogumelos, Samambaias, Vasos)
  const usedCells = new Set();
  const markUsed = (c, r, rad = 1) => {
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) usedCells.add(`${c + dx},${r + dy}`);
    }
  };
  markUsed(sp.col, sp.row, 3);
  markUsed(sp.col, wallRow, 3);
  for (const rm of B.level.rooms || []) {
    for (const dc of rm.decor || []) markUsed(dc.col, dc.row, 2);
    for (const en of rm.enemies || []) markUsed(en.col, en.row, 1);
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

  // A) Grandes formações de estalagmites encostadas nas falésias norte e curvas da caverna
  const cliffCols = [
    "p-col-red-tall-fern", "p-col-red-spire-fern", "p-col-tall-fern",
    "p-col-spire-fern", "p-col-wide-fern", "p-col-cluster", "p-col-red-cluster"
  ];
  for (let r = 6; r < R - 5; r++) {
    for (let c = 5; c < C - 5; c++) {
      if (!F(c, r) || F(c, r - 1)) continue;
      if (usedCells.has(`${c},${r}`)) continue;
      // Garantir que há espaço livre ao sul para nunca bloquear um corredor estreito
      if (!F(c, r + 1) || !F(c, r + 2) || !F(c, r + 3) || !F(c - 1, r + 1) || !F(c + 1, r + 1)) continue;
      if (rnd() < 0.13) {
        const fk = pick(cliffCols);
        const wx = c * T + T * 0.5;
        const wy = r * T + 22;
        spawnProp25D(fk, wx, wy, 28, 14, 0);
        markUsed(c, r, 3);
      }
    }
  }

  // B) Pilares de rocha internos nas clareiras amplas + Vasos de Brotos no Musgo Hexagonal
  const midCols = ["p-col-trio", "p-col-red-trio", "p-col-cone", "p-col-red-cone", "p-col-pillar", "p-col-twin-fern"];
  const shroomKeys = ["p-shroom-big", "p-shroom-big-2", "p-shroom-cluster", "p-shroom-med-1", "p-shroom-med-2", "p-shroom-tiny"];
  const fernKeys = ["p-fern-big", "p-fern-med", "p-fern-small", "p-reeds-big", "p-reeds-small"];

  for (let r = 7; r < R - 5; r++) {
    for (let c = 5; c < C - 5; c++) {
      if (!F(c, r) || usedCells.has(`${c},${r}`)) continue;
      const wx = c * T + (rnd() - 0.5) * 8 + T * 0.5;
      const wy = r * T + (rnd() - 0.5) * 8 + T * 0.75;

      // Verificar se é interior amplo (3x3 livre ao redor)
      let open3x3 = true;
      for (let dy = -1; dy <= 1 && open3x3; dy++) {
        for (let dx = -1; dx <= 1 && open3x3; dx++) {
          if (!F(c + dx, r + dy)) open3x3 = false;
        }
      }

      if (isMoss[r][c]) {
        // Dentro da clareira de musgo: vasos luminescentes (sprout-pot) como nas Imagens 2 e 3
        if (open3x3 && rnd() < 0.055) {
          spawnProp25D(rnd() < 0.5 ? "p-sprout-pot-1" : "p-sprout-pot-2", wx, wy, 14, 10, 0);
          markUsed(c, r, 2);
        } else if (rnd() < 0.045) {
          spawnProp25D(pick(["p-reeds-small", "p-fern-tiny"]), wx, wy, 0, 0, -12);
          markUsed(c, r, 1);
        }
      } else {
        // Nas bordas de parede lateral/sul ou clareiras abertas: cogumelos, samambaias e colunas menores
        const nearWall = !F(c - 1, r) || !F(c + 1, r) || !F(c, r - 1) || !F(c, r + 1);
        if (open3x3 && rnd() < 0.025 && F(c, r + 2) && F(c, r - 2)) {
          const fk = pick(midCols);
          spawnProp25D(fk, wx, wy, 20, 12, 0);
          markUsed(c, r, 2);
        } else if (nearWall && rnd() < 0.11) {
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
        } else if (rnd() < 0.075) {
          spawnProp25D(pick(fernKeys), wx, wy, 0, 0, -12);
          markUsed(c, r, 1);
        }
      }
    }
  }

  // C) Braseiros de Cristal Ciano distribuídos nos pontos estratégicos (escadas dos terraços, alcovas e encruzilhadas)
  for (const mz of mossZones) {
    const sc = Math.round(mz.cx);
    let sRow = Math.round(mz.cy);
    while (sRow < R - 4 && isMoss[sRow]?.[sc]) sRow++;
    if (F(sc - 2, sRow)) spawnBrazier((sc - 2) * T + 16, sRow * T + 10, "cyan");
    if (F(sc + 3, sRow)) spawnBrazier((sc + 3) * T + 16, sRow * T + 10, "cyan");
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

  // 12) Configurar Portal de Retorno ao Refúgio, Colisões 2.5D, Economia de Moedas do Ferreiro e HUD
  if (S.isDorfCave) {
    S.__dorfReturnPortal = { x: spX, y: spY, r: 44 };
    const retVortex = S.add.sprite(spX, spY - 12, "portal", 0)
      .setScale(0.85)
      .setTint(0x38bdf8)
      .setAlpha(0.75)
      .setDepth(spY - 2);
    if (S.anims.exists("portal-spin")) retVortex.play("portal-spin");

    const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
    S.add.text(spX, spY - 56, L3("SAÍDA · REFÚGIO", "EXIT · REFUGE", "SALIDA · REFUGIO"), {
      fontFamily: "'Cinzel', Georgia, serif",
      fontSize: "8px",
      color: "#7dd3fc",
      stroke: "#090d16",
      strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(9100);

    // Ativar colisão física entre o jogador/inimigos e a base das estalagmites 2.5D + hooks de economia
    S.time?.delayedCall(120, () => {
      if (!S.scene?.isActive()) return;
      if (B.__dorfSolids && S.player) {
        S.physics.add.collider(S.player, B.__dorfSolids);
        if (S.enemies) S.physics.add.collider(S.enemies, B.__dorfSolids);
      }

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
            // 1 a 2 moedas por arca oculta para manter o incentivo de explorar várias fendas!
            const depth = S.levelDepth || 1;
            const coins = (depth >= 3 && Math.random() < 0.45) || Math.random() < 0.25 ? 2 : 1;
            __addForgeCoins(coins, S, chest.x, chest.y);
          }
        };

        const origDropEnemy = S.lootSystem.dropFromEnemy.bind(S.lootSystem);
        S.lootSystem.dropFromEnemy = function (enemy) {
          if (S.isDorfCave && enemy) {
            // Reduzir drop comum de inimigos normais para evitar poluição de loot
            enemy.goldMult = (enemy.goldMult ?? 1) * 0.28;
            if (enemy.isElite && !enemy.respawned && Math.random() < 0.45) {
              __addForgeCoins(1, S, enemy.x, enemy.y);
            }
          }
          return origDropEnemy(enemy);
        };
      }
    });

    // Diálogo da Guardiã na primeira vez
    try {
      if (typeof localStorage !== "undefined" && !localStorage.getItem("depthgate:dorf_cave_guardian_voice")) {
        localStorage.setItem("depthgate:dorf_cave_guardian_voice", "1");
        S.time?.delayedCall(900, () => {
          if (!S.scene?.isActive()) return;
          const msg = " A Montanha de Dorf guarda segredos antigos, tenha cuidado";
          try { if (typeof window !== "undefined" && window.__dubHas?.(msg)) window.__dub(msg); } catch (_) {}
          S.game?.events?.emit("story:show", {
            title: L3("GUARDIÃ · CAVERNAS DE DORF", "GUARDIAN · DORF CAVES", "GUARDIANA · CAVERNAS DE DORF"),
            lines: [
              L3(
                "A Montanha de Dorf guarda segredos antigos, tenha cuidado.",
                "Dorf Mountain holds ancient secrets, be careful.",
                "La Montaña de Dorf guarda secretos antiguos, ten cuidado."
              )
            ]
          });
        });
      }
    } catch (e) {}
  }

  return true;
}

/* 4) Retorno seguro das Cavernas de Dorf para o Refúgio (salvando ouro, itens e Moedas do Ferreiro) */
function __dorfReturnToRefuge(S) {
  if (!S || S.__dorfExiting) return;
  S.__dorfExiting = true;
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
        if (typeof S.player?.gold === "number") d.player.gold = S.player.gold;
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

  S.cameraSys?.fadeOut(380, () => {
    try { S.scene.stop("UI"); } catch (e) {}
    if (isCamp) {
      S.game.registry.set("hub:fromForest", { slot: slot });
    } else {
      S.game.registry.remove("hub:fromForest");
    }
    S.game.registry.set("hub:classId", S.classDef?.id || "WARRIOR");
    S.scene.start("Hub");
  });
}
