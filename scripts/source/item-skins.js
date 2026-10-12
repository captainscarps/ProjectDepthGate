// ═══════════════════════════════════════════════════════════════════════
//  Itens únicos, conjuntos novos e visual por equipamento ("skins")
//  (injetado no bundle por scripts/patch_item_skins.py)
// ═══════════════════════════════════════════════════════════════════════

// ── gerador determinístico (a semente fica salva no item) ───────────────
function __rng(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296 };
}

// ── cores das peças ─────────────────────────────────────────────────────
const __TINTS = [["Carmesim", 0xb03040], ["Azul-real", 0x3a62c8], ["Esmeralda", 0x2f9a5a], ["Violeta", 0x7a3fb0],
  ["Dourada", 0xd8a030], ["de Aço", 0xa6b0c0], ["Ônix", 0x34343e], ["Turquesa", 0x2aa8a8], ["Âmbar", 0xc87830], ["Nívea", 0xe8eef4]];

// ── afixos: mesma raridade, atributos diferentes ────────────────────────
const __AFX = {
  damage: { s: "da Fúria", b: 1 }, critChance: { s: "do Lince", b: 3 }, maxHp: { s: "do Urso", b: 2 },
  defense: { s: "da Muralha", b: 1 }, speed: { s: "do Vento", b: 5 }, magicDamage: { s: "Arcano", b: 1 },
  maxMana: { s: "da Lua", b: 8 },
};
const __AFX_POOL = {
  weapon: ["damage", "critChance", "speed", "maxHp"],
  armor: ["defense", "maxHp", "speed", "critChance"],
  accessory: ["damage", "critChance", "maxHp", "defense", "speed", "magicDamage"],
};
const __AFX_N = { COMMON: 0, UNCOMMON: 1, RARE: 1, EPIC: 2, LEGENDARY: 2, RELIC: 3 };

// ── conjuntos novos (peças de elmo / armadura / botas / acessório) ──────
const __NEW_SETS = {
  GREY_WOLF: { name: "Vestes do Lobo Cinzento", tint: 0x9aa4b4, aura: 0xc8d4e8, pieces: {
      wolf_helm: ["helmet", "Elmo do Lobo Cinzento", { defense: 2, speed: 6 }, "Pelagem de lobo sobre aço leve."],
      wolf_coat: ["armor", "Gibão do Lobo Cinzento", { defense: 3, speed: 8 }, "Leve como a matilha, firme como o inverno."],
      wolf_boots: ["boots", "Botas do Lobo Cinzento", { defense: 1, speed: 14 }, "Nenhuma presa ouve a sua chegada."] },
    bonuses: { 2: { label: "+15 velocidade", stats: { speed: 15 } }, 3: { label: "+6% crítico · +2 dano", stats: { critChance: 6, damage: 2 } } } },
  RISING_SUN: { name: "Armadura do Sol Nascente", tint: 0xd8a030, aura: 0xffd060, pieces: {
      sun_helm: ["helmet", "Kabuto do Sol Nascente", { defense: 3, maxHp: 1 }, "O sol pintado na testa nunca se põe."],
      sun_plate: ["armor", "Couraça do Sol Nascente", { defense: 5, maxHp: 2 }, "Lâminas douradas presas com seda vermelha."],
      sun_greaves: ["boots", "Grevas do Sol Nascente", { defense: 2, speed: 6 }, "Pisam firme como raízes."] },
    bonuses: { 2: { label: "+4 vida · +1 defesa", stats: { maxHp: 4, defense: 1 } }, 3: { label: "+3 defesa · +2 dano", stats: { defense: 3, damage: 2 } } } },
  ANCIENT_GROVE: { name: "Manto da Floresta Ancestral", tint: 0x2f9a5a, aura: 0x7ae08a, pieces: {
      grove_hood: ["helmet", "Capuz de Folhas Ancestrais", { defense: 1, maxMana: 10 }, "Ainda brotam folhas novas nele."],
      grove_mantle: ["armor", "Manto da Floresta Ancestral", { defense: 3, maxHp: 2 }, "Tecido de casca e musgo vivo."],
      grove_boots: ["boots", "Sandálias de Raiz", { defense: 1, speed: 10 }, "A terra parece empurrar cada passo."] },
    bonuses: { 2: { label: "+2 dano mágico · +10 mana", stats: { magicDamage: 2, maxMana: 10 } }, 3: { label: "+4 vida · -10% recarga", stats: { maxHp: 4, cooldownReduction: .1 } } } },
  ABYSS_SHROUD: { name: "Vestes do Abismo", tint: 0x7a3fb0, aura: 0xb070ff, pieces: {
      abyss_hood: ["helmet", "Capuz do Abismo", { defense: 1, critChance: 4 }, "Por dentro, só escuridão."],
      abyss_robe: ["armor", "Veste do Abismo", { defense: 3, critChance: 3 }, "Costurada com fios de sombra."],
      abyss_boots: ["boots", "Passos do Abismo", { defense: 1, speed: 12 }, "Não deixam pegadas."] },
    bonuses: { 2: { label: "+8% crítico", stats: { critChance: 8 } }, 3: { label: "+3 dano · +2 dano mágico", stats: { damage: 3, magicDamage: 2 } } } },
  TUPA_ADORNS: { name: "Adornos de Tupã", tint: 0xc83a2a, aura: 0xffa040, cls: "SHAMAN", pieces: {
      cocar_tupa: ["helmet", "Cocar de Penas de Arara", { defense: 1, magicDamage: 2 }, "Cada pena é um voo que o espírito lembra."],
      urucum_paint: ["armor", "Pintura de Urucum", { defense: 2, maxHp: 3 }, "O vermelho do urucum afasta os maus espíritos."],
      colar_onca: ["accessory", "Colar de Dentes de Onça", { damage: 2, critChance: 4 }, "A força da onça agora caça com você."],
      tornozeleira: ["boots", "Tornozeleira de Sementes", { defense: 1, speed: 14 }, "Chocalha a cada passo, chamando a chuva."] },
    bonuses: { 2: { label: "+2 dano · +3 vida", stats: { damage: 2, maxHp: 3 } }, 3: { label: "+2 dano mágico · +10 velocidade", stats: { magicDamage: 2, speed: 10 } },
      4: { label: "+6% crítico · +3 defesa", stats: { critChance: 6, defense: 3 } } } },
};
// pinturas avulsas da Xamã (sem conjunto): mudam a cor da tinta corporal
const __SHAMAN_PAINTS = {
  jenipapo_paint: ["Pintura de Jenipapo", 0x23304a, { defense: 3, speed: 6 }, "O preto-azulado do jenipapo dura semanas na pele."],
  tabatinga_paint: ["Pintura de Tabatinga", 0xe8e4d8, { defense: 2, maxMana: 12 }, "Argila branca dos rios, sagrada para os pajés antigos."],
  caulim_paint: ["Pintura de Açafrão", 0xe0b030, { defense: 2, critChance: 4 }, "O amarelo do sol na pele de quem caça."],
};
// cores (aura) dos conjuntos que já existiam
const __SET_AURA = { ASSASSIN: 0x9a70d0, COLOSSUS: 0x8ad08a, HUNTER: 0x9ad070, ARCANIST: 0x70a0ff, FROST_GUARDIAN: 0xa0e8ff };

function __skinsInit() {
  if (__skinsInit.done) return; __skinsInit.done = !0;
  const icon = { helmet: "icon-helmet", armor: "icon-armor", boots: "icon-boots", accessory: "icon-ring" };
  for (const [sid, S] of Object.entries(__NEW_SETS)) {
    for (const [id, [slot, name, stats, desc]] of Object.entries(S.pieces)) {
      Xt[id] = { name, type: slot === "accessory" ? "accessory" : "armor", slot, icon: icon[slot], minRarity: "RARE", setId: sid,
        stats, value: 60, desc, tint: S.tint, ...(S.cls ? { classRequirement: S.cls } : {}) };
    }
    ps[sid] = { name: S.name, pieces: Object.keys(S.pieces), bonuses: S.bonuses };
    __SET_AURA[sid] = S.aura;
  }
  for (const [id, [name, tint, stats, desc]] of Object.entries(__SHAMAN_PAINTS))
    Xt[id] = { name, type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNCOMMON", classRequirement: "SHAMAN", stats, value: 40, desc, tint };
}
__skinsInit();

// troca peça genérica (elmo/armadura/botas/amuleto) por peça de conjunto às vezes
function __maybeSetPiece(id, rarity, classId) {
  const base = Xt[id]; if (!base || base.setId || base.classRequirement) return id;
  const slot = base.slot; if (!["helmet", "armor", "boots", "accessory"].includes(slot)) return id;
  const ord = bt[rarity]?.order ?? 0;
  const chance = ord >= 3 ? .45 : ord >= 2 ? .28 : 0;
  if (Math.random() >= chance) return id;
  const cand = [];
  for (const [sid, S] of Object.entries(__NEW_SETS)) {
    if (S.cls && S.cls !== classId) continue;
    for (const [pid, p] of Object.entries(S.pieces)) if (p[0] === slot) cand.push(pid);
  }
  if (classId === "SHAMAN" && slot === "armor") cand.push(...Object.keys(__SHAMAN_PAINTS));
  return cand.length ? cand[Math.floor(Math.random() * cand.length)] : id;
}

// deixa o item único: variação nos atributos, afixos extras e cor própria
function __itemUnique(it, seed) {
  if (!it || !["armor", "weapon", "accessory"].includes(it.type)) return it;
  const def = Xt[it.id] ?? {};
  if (seed === void 0) seed = 1 + Math.floor(Math.random() * 2147483646);
  it.seed = seed;
  const R = __rng(seed);
  if (def.tint != null) it.tint = def.tint;
  else if (it.type === "armor") { const t = __TINTS[Math.floor(R() * __TINTS.length)]; it.tint = t[1]; it.tintName = t[0] }
  if (!seed) return it;                                   // itens antigos (sem semente) ficam como eram
  const mult = bt[it.rarity]?.mult ?? 1;
  for (const k of Object.keys(it.stats)) it.stats[k] = Math.max(1, Math.round(it.stats[k] * (.85 + R() * .35)));
  const kind = it.type === "weapon" ? "weapon" : it.type === "accessory" ? "accessory" : "armor";
  let pool = __AFX_POOL[kind].slice();
  if (kind === "weapon" && it.stats.magicDamage) pool = pool.map(k => k === "damage" ? "magicDamage" : k);
  const n = __AFX_N[it.rarity] ?? 0, got = [];
  for (let i = 0; i < n && pool.length; i++) {
    const k = pool.splice(Math.floor(R() * pool.length), 1)[0];
    const v = Math.max(1, Math.round(__AFX[k].b * mult * (.7 + R() * .6)));
    it.stats[k] = (it.stats[k] ?? 0) + v; got.push(k);
  }
  if (got.length && !it.setId) { it.name = `${it.name} ${__AFX[got[0]].s}`; it.affixes = got }
  else if (!it.setId && it.tintName && it.type === "armor") it.name = `${it.name} ${it.tintName}`;
  it.value = Math.round(it.value * (1 + .12 * got.length));
  return it;
}

// ── visual: recolorir a roupa do herói com a cor da armadura ────────────
const __HSV = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; return [h, mx ? d / mx : 0, mx / 255] };
const __RGB = (h, s, v) => { const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)] };
const __in = (h, a, b) => a <= b ? h >= a && h <= b : h >= a || h <= b;
// que pixels são "a roupa" de cada classe
const __GARMENT = {
  warrior: (h, s, v) => s < .22 && v > .42,                                   // armadura de aço
  berserker: (h, s, v) => __in(h, 195, 262) && s > .25,                        // armadura azul-marinho
  archer: (h, s, v) => __in(h, 100, 178) && s > .2,                            // roupa verde
  mage: (h, s, v) => __in(h, 322, 14) && s > .4 && v < .82,                    // túnica vermelha
  rogue: (h, s, v) => __in(h, 12, 46) && s > .25 && v < .6,                    // couro
  necromancer: (h, s, v) => __in(h, 0, 50) && v < .42 && s > .12,              // manto
  shaman: (h, s, v) => (__in(h, 80, 178) && s > .25) || (__in(h, 340, 12) && s > .55 && v > .4),  // tangas e tinta corporal
  hunter: (h, s, v) => __in(h, 15, 42) && s > .3 && v > .72,                   // pelagem
  paladin: (h, s, v) => __in(h, 70, 160) && s > .2,                            // manto verde
};
function __skinTex(scene, srcKey, cls, color) {
  const key = `${srcKey}-c${color.toString(16)}`;
  if (scene.textures.exists(key)) return key;
  const test = __GARMENT[cls]; if (!test || !scene.textures.exists(srcKey)) return null;
  const src = scene.textures.get(srcKey), img = src.getSourceImage();
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
  const D = cx.getImageData(0, 0, cv.width, cv.height), p = D.data;
  // brilho de referência da roupa original (mediana)
  const vs = [];
  for (let i = 0; i < p.length; i += 4 * 7) { if (p[i + 3] < 128) continue; const [h, s, v] = __HSV(p[i], p[i + 1], p[i + 2]); test(h, s, v) && vs.push(v) }
  vs.sort((a, b) => a - b); const ref = vs.length ? vs[vs.length >> 1] : .5;
  const [th, ts, tv] = __HSV((color >> 16) & 255, (color >> 8) & 255, color & 255);
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 128) continue;
    const [h, s, v] = __HSV(p[i], p[i + 1], p[i + 2]);
    if (!test(h, s, v)) continue;
    const nv = Math.max(0, Math.min(1, v * (tv * .9 + .08) / Math.max(.12, ref)));
    const ns = Math.min(1, ts * (s < .22 ? .62 : .75 + .25 * Math.min(1, s)));
    const [r, g, b] = __RGB(th, ns, nv); p[i] = r; p[i + 1] = g; p[i + 2] = b;
  }
  cx.putImageData(D, 0, 0);
  const t = scene.textures.addCanvas(key, cv);
  const fw = src.get(0)?.width ?? 128, fh = src.get(0)?.height ?? 128, n = Math.floor(img.width / fw);
  for (let i = 0; i < n; i++) t.add(i, 0, i * fw, 0, fw, fh);
  if (src.source[0]?.scaleMode != null) t.setFilter(j.Textures.FilterMode.NEAREST);
  // animações iguais às da folha original
  for (const a of ["idle", "idlevar", "walk", "run"]) {
    const A = scene.anims.get(`${srcKey}-${a}`); if (!A || scene.anims.exists(`${key}-${a}`)) continue;
    scene.anims.create({ key: `${key}-${a}`, frames: A.frames.map(f => ({ key, frame: f.frame.name })), frameRate: A.frameRate, repeat: A.repeat });
  }
  return key;
}
function __skinFor(scene, skin, classId, eq) {
  const arm = eq?.armor; if (!skin || !arm || arm.tint == null) return skin;
  // a cor da armadura parte do traje base da classe (as outras folhas têm cores próprias)
  const base = `mk4b-${classId.toLowerCase()}-t0`, src = scene.textures.exists(base) ? base : skin.sheet;
  try { const k = __skinTex(scene, src, classId.toLowerCase(), arm.tint); return k ? { ...skin, sheet: k } : skin } catch (e) { return skin }
}
// conjuntos completos ativos (para a aura)
function __fullSet(eq) {
  const cnt = {};
  for (const o of Object.values(eq ?? {})) o?.setId && (cnt[o.setId] = (cnt[o.setId] ?? 0) + 1);
  for (const [sid, n] of Object.entries(cnt)) { const S = ps[sid]; if (S && n >= Math.min(3, S.pieces.length)) return sid }
  return null;
}
// adornos (Xamã) + aura de conjunto
function __adorn(V, eq) {
  const sc = V.scene, cls = V.classDef?.id;
  if (cls === "SHAMAN") {
    const hm = eq?.helmet, ac = eq?.accessory1 ?? eq?.accessory2 ?? eq?.accessory;
    if (hm && sc.textures.exists("adorn-cocar")) {
      const tribal = hm.id === "cocar_tupa";
      V.helmetImg.setTexture(tribal ? "adorn-cocar" : "adorn-cocar-w").setOrigin(.5, .92).setVisible(!0);
      tribal || hm.tint == null ? V.helmetImg.clearTint() : V.helmetImg.setTint(hm.tint);
    }
    if (ac && sc.textures.exists("adorn-colar")) {
      V.armorImg.setTexture("adorn-colar").setOrigin(.5, .3).setVisible(!0);
      ac.id === "colar_onca" ? V.armorImg.clearTint() : V.armorImg.setTint(ac.tint ?? 0xf0e8d0);
    }
  }
  const sid = __fullSet(eq), col = sid ? __SET_AURA[sid] ?? 0xffe08a : null;
  if (!col) { V.__aura?.setVisible(!1); return }
  if (!V.__aura) {
    V.__aura = sc.add.image(0, 13, "light").setBlendMode(j.BlendModes.ADD).setScale(.32, .12).setAlpha(.0);
    V.container.addAt(V.__aura, 0);
    sc.tweens.add({ targets: V.__aura, alpha: { from: .35, to: .7 }, scaleX: { from: .3, to: .36 }, duration: 1100, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" });
  }
  V.__aura.setTint(col).setVisible(!0);
}
