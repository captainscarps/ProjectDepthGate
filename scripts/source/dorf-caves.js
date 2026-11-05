/* ══ Cavernas da Montanha Dorf ══
   - Masmorra procedural baseada no pack Szadi art RPG Worlds Deep Cave.
   - Portal sempre ativo no Refúgio (Hub da vila).
   - Modo Campanha: itens e ouro acumulados são guardados diretamente no save da campanha.
   - Modo Infinito (pelo Menu): joga com o personagem vigente do modo infinito e acumula no perfil infinito.
   - Cenário com paredes de basalto colunar, chão de terra e lajotas hexagonais de musgo,
     estalagmites, cogumelos brilhantes, plantas de caverna e tochas de cristal ciano. */

let __dorfN = 0;

/* 1) Registro do bioma Cavernas da Montanha Dorf */
if (typeof Ls !== "undefined" && typeof Xn !== "undefined") {
  Ls.dorf_cave = {
    ...Xn,
    id: "dorf_cave",
    name: "Cavernas da Montanha Dorf",
    tilesetKey: "tiles-dorf-cave",
    palette: {
      ...Xn.palette,
      stoneBase: 34,
      stoneMortar: "#0d0b12",
      stoneShadow: "rgba(5, 4, 8, 0.78)",
      bone: "#c0b8ac",
      magic: 3718648,        // #38bdf8 ciano
      magicBright: 9684477,  // #93c5fd
      fire: 3718648,
      fireCore: 14744511,
      gold: 16434453,        // #facc15
      goldBright: 16773530
    },
    lights: {
      ...Xn.lights,
      TORCH: { color: 3718648, radius: 125, intensity: 1.15, flicker: 0.85 },
      CANDLE: { color: 3718648, radius: 70, intensity: 0.9, flicker: 1.2 },
      PLAYER: { ...Xn.lights.PLAYER, radius: 215, warm: false }
    },
    music: { explore: "catacombs-ambience", boss: "boss-ambience" }
  };

  if (typeof ud !== "undefined") ud.dorf_cave = "Cavernas da Montanha Dorf";
  try {
    if (typeof _s !== "undefined") _s["biome.dorf_cave"] = "Dorf Mountain Caves";
    if (typeof Io !== "undefined") Io["biome.dorf_cave"] = "Cavernas de la Montaña Dorf";
  } catch (e) {}

  if (typeof ga !== "undefined") {
    // Grupos de inimigos das cavernas
    for (const g of Object.values(ga)) {
      if ((g.biomes?.includes("ruins") || g.biomes?.includes("catacombs")) && !g.biomes.includes("dorf_cave")) {
        g.biomes.push("dorf_cave");
      }
    }
  }

  if (typeof js !== "undefined") {
    js.dorf_cave = {
      gold: { min: 25, max: 70 },
      rolls: 3,
      pools: [
        "sword", "dagger", "axe", "mace", "iron_shield", "spiked_shield",
        "great_sword", "great_axe", "war_hammer", "bow", "long_bow",
        "staff", "arcane_staff", "shadow_dagger", "shadow_cloak",
        "helmet", "armor", "boots", "ring", "amulet", "potion"
      ],
      rarities: { COMMON: 15, UNCOMMON: 40, RARE: 32, EPIC: 11, LEGENDARY: 2 }
    };
  }

  if (typeof ed !== "undefined") {
    ed.dorf_cave = {
      wallTop: ["torch"],
      onWall: [],
      solid: ["col-single", "col-trio", "col-cluster"],
      flat: ["shroom-big", "shroom-cluster", "fern-1"],
      lightExtra: ["brazier"]
    };
  }
}

/* 2) Gerador e montagem procedural do cenário (__dorfBake) */
function __dorfBake(B) {
  const S = B.scene;
  const M = S.cache.json.get("dorf-atlas");
  if (!M || !S.textures.exists("dorf-atlas")) return false;

  const src = S.textures.get("dorf-atlas").getSourceImage();
  const C = B.cols, R = B.rows, T = dt || 32, key = "dorfb-" + ++__dorfN;
  const tx = S.textures.createCanvas(key, C * T, R * T), g = tx.getContext();
  g.imageSmoothingEnabled = false;

  let sd = (String(B.level.seed ?? "dorf") + (B.level.depth || 1)).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0) | 0), 17) >>> 0;
  const rnd = () => (sd = (sd * 1664525 + 1013904223 >>> 0)) / 4294967296;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const F = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !B.isWallTile(c, r);
  const D = (q, x, y, sx = 0, sy = 0, sw = q[2], sh = q[3]) => {
    if (!q) return;
    g.drawImage(src, q[0] + sx, q[1] + sy, sw, sh, x, y, sw, sh);
  };

  // Fundo geral da caverna: rocha escura profunda
  g.fillStyle = "rgb(10, 8, 14)";
  g.fillRect(0, 0, C * T, R * T);

  const rooms = B.level.rooms || [];

  // Mapear piso de cada ladrilho
  // Salas de combate/chefe: lajotas de musgo verde no centro e terra escura na borda
  // Salas especiais (LOJA, TESOURO): piso de pedra polida
  const kind = new Array(C * R).fill("dirt");
  for (const rm of rooms) {
    const t = rm.roomType, r = rm.rect;
    if (!r) continue;
    const isSpecial = ["SHOP", "REST", "TREASURE", "MERCHANT"].includes(t);
    const cx = r.x + Math.floor(r.w / 2), cy = r.y + Math.floor(r.h / 2);
    const radiusMoss = Math.max(1, Math.min(Math.floor(r.w / 2) - 1, Math.floor(r.h / 2) - 1));

    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (!F(x, y)) continue;
        if (isSpecial) {
          kind[y * C + x] = "pave";
        } else {
          const dx = x - cx, dy = y - cy;
          // mancha hexagonal de musgo no centro
          if (Math.abs(dx) + Math.abs(dy) <= radiusMoss + (rnd() < 0.3 ? 1 : 0)) {
            kind[y * C + x] = "moss";
          } else {
            kind[y * C + x] = "dirt";
          }
        }
      }
    }
  }

  // Pintar ladrilhos de chão
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (F(c, r)) {
        const k = kind[r * C + c];
        const tilePool = M.floor[k] || M.floor.dirt;
        D(pick(tilePool), c * T, r * T);
      }
    }
  }

  // Paredes: colunas de basalto vertical
  // Para ladrilhos de parede diretamente acima do chão: 2 fileiras de face de basalto + 1 topo facetado
  const face = new Int8Array(C * R);
  for (let x = 0; x < C; x++) {
    for (let y = 1; y < R; y++) {
      if (F(x, y) && !F(x, y - 1)) {
        for (const [k, v] of [[1, 1], [2, 1], [3, 2]]) {
          const yy = y - k;
          if (yy < 0 || F(x, yy)) break;
          face[yy * C + x] = v;
        }
      }
    }
  }

  const isBot = (x, y) => face[y * C + x] === 1 && (y + 1 >= R || face[(y + 1) * C + x] !== 1);
  const wallSpots = [];

  for (let y = 0; y < R; y++) {
    for (let x = 0; x < C;) {
      if (!isBot(x, y)) { x++; continue; }
      const x0 = x;
      while (x < C && isBot(x, y)) x++;
      for (let c = x0; c < x; c++) {
        const glowFace = rnd() < 0.25;
        const facePool = glowFace ? M.wall.faceGlow : M.wall.face;
        D(pick(facePool), c * T, (y - 1) * T);
        if (glowFace && y < R && F(c, y)) {
          // Luz suave da vinha brilhante
          S.lighting?.addLight?.({ x: c * T + 16, y: (y - 0.5) * T, radius: 45, color: 0x4ade80, intensity: 0.6, flicker: 0.5 });
        }
      }
      for (let c = x0 + 1; c < x - 1; c++) {
        if (face[(y - 1) * C + c] === 1) wallSpots.push([c, y]);
      }
    }
  }

  // Topo das paredes de basalto (facetas hexagonais arredondadas)
  for (let y = 0; y < R; y++) {
    for (let x = 0; x < C;) {
      if (face[y * C + x] !== 2) { x++; continue; }
      const x0 = x;
      while (x < C && face[y * C + x] === 2) x++;
      for (let c = x0; c < x; c++) {
        D(pick(M.wall.top), c * T, y * T);
      }
    }
  }

  // Sombras ao pé das paredes e profundidade da caverna
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r)) continue;
      if (!F(c, r - 1)) {
        const q = g.createLinearGradient(0, r * T, 0, r * T + 14);
        q.addColorStop(0, "rgba(5, 3, 8, 0.65)");
        q.addColorStop(1, "rgba(5, 3, 8, 0)");
        g.fillStyle = q;
        g.fillRect(c * T, r * T, T, 14);
      }
      if (!F(c - 1, r)) {
        const q = g.createLinearGradient(c * T, 0, c * T + 10, 0);
        q.addColorStop(0, "rgba(5, 3, 8, 0.45)");
        q.addColorStop(1, "rgba(5, 3, 8, 0)");
        g.fillStyle = q;
        g.fillRect(c * T, r * T, 10, T);
      }
      if (!F(c + 1, r)) {
        const q = g.createLinearGradient(c * T + 22, 0, c * T + 32, 0);
        q.addColorStop(0, "rgba(5, 3, 8, 0)");
        q.addColorStop(1, "rgba(5, 3, 8, 0.45)");
        g.fillStyle = q;
        g.fillRect(c * T + 22, r * T, 10, T);
      }
    }
  }

  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0).setDepth(-2);
  B.groundLayer?.setVisible(false);
  B.wallLayer?.setVisible(false);
  S.cameras.main.setBackgroundColor("rgb(10, 8, 14)");

  // 3) Adereços cênicos (estalagmites, cogumelos, plantas de caverna)
  const propList = Object.keys(M.props || {});
  const shrooms = propList.filter(k => k.startsWith("shroom"));
  const columns = propList.filter(k => k.startsWith("col"));
  const ferns = propList.filter(k => k.startsWith("fern") || k.startsWith("sprout"));

  for (const rm of rooms) {
    const r = rm.rect;
    if (!r) continue;

    // Colunas de estalagmite nos cantos da sala
    for (const [dx, dy] of [[1, 1], [r.w - 2, 1], [1, r.h - 2], [r.w - 2, r.h - 2]]) {
      const px = r.x + dx, py = r.y + dy;
      if (F(px, py) && rnd() < 0.7) {
        const pKey = pick(columns);
        const rect = M.props[pKey];
        if (rect) {
          const sp = S.add.image(px * T + 16, py * T + 24, "dorf-atlas", `p-${pKey}`)
            .setOrigin(0.5, 1)
            .setDepth(py * T + 16);
          // Adicionar corpo sólido para colunas grandes
          if (pKey.includes("cluster") || pKey.includes("tall") || pKey.includes("massive")) {
            const solid = B.solids?.create(px * T + 16, py * T + 16, "rock");
            if (solid) {
              solid.setVisible(false).setDisplaySize(rect[2] * 0.7, rect[3] * 0.4);
              solid.refreshBody?.();
            }
          }
        }
      }
    }

    // Cogumelos brilhantes e plantas espalhadas nas bordas
    for (let y = r.y + 1; y < r.y + r.h - 1; y++) {
      for (let x = r.x + 1; x < r.x + r.w - 1; x++) {
        if (!F(x, y)) continue;
        const nearW = !F(x - 1, y) || !F(x + 1, y) || !F(x, y - 1) || !F(x, y + 1);
        if (nearW && rnd() < 0.18) {
          const isShroom = rnd() < 0.6;
          const pKey = isShroom ? pick(shrooms) : pick(ferns);
          const sp = S.add.image(x * T + 8 + rnd() * 16, y * T + 20, "dorf-atlas", `p-${pKey}`)
            .setOrigin(0.5, 1)
            .setDepth(y * T + 10);
          if (isShroom) {
            // Respiração luminosa sutil nos cogumelos
            S.tweens.add({
              targets: sp,
              alpha: { from: 1, to: 0.72 },
              duration: 1200 + rnd() * 800,
              yoyo: true,
              repeat: -1
            });
            S.lighting?.addLight?.({
              x: sp.x,
              y: sp.y - 8,
              radius: 40,
              color: 0x86efac,
              intensity: 0.5,
              flicker: 0.3
            });
          }
        }
      }
    }
  }

  // 4) Tochas de cristal ciano nas paredes
  const takenWalls = new Set();
  for (const [c, y] of wallSpots) {
    if (rnd() > 0.35 || takenWalls.has(c - 1 + "," + y) || takenWalls.has(c + "," + y) || takenWalls.has(c + 1 + "," + y)) continue;
    takenWalls.add(c + "," + y);
    const bx = c * T + 16, by = (y + 1) * T - 12;

    // Tocha de cristal ciano (light1C)
    const bz = S.add.sprite(bx, by, "dorf-atlas", "light-cyan-0").setOrigin(0.5, 1).setDepth(by + 1);
    if (!S.anims.exists("dorf-light-cyan")) {
      S.anims.create({
        key: "dorf-light-cyan",
        frames: [
          { key: "dorf-atlas", frame: "light-cyan-0" },
          { key: "dorf-atlas", frame: "light-cyan-1" },
          { key: "dorf-atlas", frame: "light-cyan-2" }
        ],
        frameRate: 6,
        repeat: -1
      });
    }
    bz.play("dorf-light-cyan");

    // Luz dinâmica ciano e brilho sutil
    const gl = S.add.image(bx, by - 16, "light")
      .setScale(0.35)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0x38bdf8)
      .setAlpha(0.4)
      .setDepth(by);
    S.tweens.add({ targets: gl, alpha: 0.22, scale: 0.3, duration: 800 + rnd() * 400, yoyo: true, repeat: -1 });
    S.lighting?.addLight?.({ x: bx, y: by - 16, radius: 110, color: 0x38bdf8, intensity: 1.1, flicker: 0.8 });
  }

  // 5) Na sala de INÍCIO: colocar o portal de retorno ao Refúgio!
  const startRoom = rooms.find(rm => rm.roomType === "START") || rooms[0];
  if (startRoom) {
    const spX = (startRoom.rect.x + Math.floor(startRoom.rect.w / 2)) * T + 16;
    const spY = (startRoom.rect.y + 2) * T;

    // Portal de retorno com a arte do portal arch de Dorf
    const retGate = S.add.image(spX, spY + 4, "dorf-portal-arch").setOrigin(0.5, 1).setDepth(spY - 0.2);
    const swirl = S.add.sprite(spX, spY - 40, "hub-portal", 0).setOrigin(0.5, 0.5).setDepth(spY).setScale(0.75).setTint(0x38bdf8);
    swirl.play("hub-portal-a");
    const swirlAdd = S.add.sprite(spX, spY - 40, "hub-portal", 0).setOrigin(0.5, 0.5).setDepth(spY + 0.1).setScale(0.75).setTint(0x93c5fd).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.35);
    swirlAdd.play("hub-portal-a");
    S.tweens.add({ targets: swirlAdd, alpha: 0.7, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    S.lighting?.addLight?.({ x: spX, y: spY - 40, radius: 95, color: 0x38bdf8, intensity: 1, flicker: 0.6 });

    // Rótulo flutuante
    const labTxt = typeof __L3 === "function" ?
      __L3("PORTAL DO REFÚGIO [E]", "REFUGE PORTAL [E]", "PORTAL DEL REFUGIO [E]") : "PORTAL DO REFÚGIO [E]";
    const lab = S.add.text(spX, spY - 110, labTxt, {
      fontFamily: "'Courier New', monospace",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#38bdf8",
      backgroundColor: "#0a080ee0",
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(8999);

    // Registro para interação
    S.__dorfReturnPortal = { x: spX, y: spY, r: 44 };
  }

  S.events.once("shutdown", () => {
    if (S.textures.exists(key)) S.textures.remove(key);
  });

  return true;
}

/* 3) Função de retorno ao Refúgio com persistência da economia */
function __dorfReturnToRefuge(S) {
  if (S.__leavingDorf) return;
  S.__leavingDorf = true;

  const L3 = typeof __L3 === "function" ? __L3 : (pt, en) => pt;
  const isCamp = S.originMode === "campaign" || (!S.endlessRun && S.dorfSlot);
  const sl = S.dorfSlot || S.game?.registry?.get("save:slot") || 1;

  // Persistir ouro, itens e progresso
  if (isCamp && typeof Dn === "function" && typeof Wt === "function") {
    try {
      const r = Dn(sl);
      if (r.ok && r.data) {
        if (typeof S.player?.gold === "number") {
          r.data.player.gold = S.player.gold;
        }
        if (S.inventory?.serialize) {
          r.data.player.inventory = S.inventory.serialize();
        }
        if (S.player?.xp) {
          r.data.player.xp = S.player.xp;
          r.data.player.level = S.player.level || r.data.player.level;
        }
        localStorage.setItem(Wt("campaign", sl), JSON.stringify(r.data));
      }
    } catch (e) {
      console.warn("[dorf_cave] erro ao salvar campanha:", e);
    }
  } else if (typeof In === "function") {
    try {
      In(S);
    } catch (e) {}
  }

  S.game?.audioEngine?.stinger?.("portal") || S.audio?.play?.("portal");
  S.game?.events?.emit("ui:banner", L3("RETORNANDO AO REFÚGIO COM SEUS TESOUROS!", "RETURNING TO REFUGE WITH YOUR LOOT!", "¡REGRESANDO AL REFUGIO CON TUS TESOROS!"), "#38bdf8");

  S.time?.delayedCall(900, () => {
    S.cameraSys?.fadeOut(500, () => {
      S.scene.stop("UI");
      S.scene.start("Hub", {
        fromForest: isCamp,
        slot: sl
      });
    });
  });
}
