/* ══ Arsenal do Ferreiro: armas exclusivas de cada herói (p216.127) ════════════════════════════════════════════════
   39 armas forjadas em Pedra Cobalto, cada herói vê só as dele na aba ARMAS da armaria (no topo da lista):
   Samurai (katanas rápida e pesada, sai, corrente ninja), Caçador (bestas, bastão, cutelo), Guerreiro (montante,
   espadas curtas gêmeas), Maga (grimório, tomo, luvas, cajados de fogo/gelo/trovão), Druida (cajados da seiva e da
   tempestade, bastão, lança, besta), Xamã (arco, zarabatana, espada, bastão, lança), Arqueiro (arco longo, curto,
   gêmeo e tridente), Necromante (foice, cajado, tomo, livro), Ladina (facas, espada curta, sais, bastão, nunchaku).
   • Ícone próprio de cada uma no atlas items-hd (scripts/icon_arsenal.py, mesmo padrão vetorial dos outros).
   • Animação própria: a arma aparece fazendo o golpe dela (corte com rastro, estocadas, giro do bastão, corrente que
     vai e volta, nunchaku girando, livro que abre e solta páginas, cajado erguido com o elemento, besta com recuo…),
     por cima do golpe normal (meia-lua/estocada de combate-alcance.js).
   • Comportamento próprio: sais e nunchaku acertam mais de uma vez, corrente/lança alcançam longe, bastões giram em
     volta, bestas atravessam, arco gêmeo/tridente soltam 2/3 flechas, facas em leque, tomo explode, cajados com
     queimadura/gelo/veneno, zarabatana com curare…
   Como as outras peças do ferreiro: quebram se morrer na campanha; no Infinito duram N runs (conserto na forja). */
const __ARS_P4 = Math.PI / 4;
/* golpe-base de cada tipo (oe: tempo do golpe e entrega; oa: alcance e ângulo de acerto) */
const __ARS_KIND = {
  ars_slash: { b: "sword", anim: { windupMs: 60, hitMs: 60, recoveryMs: 90 }, oa: { range: 54, angle: 150 } },
  ars_heavy: { b: "great_sword", anim: { windupMs: 230, hitMs: 100, recoveryMs: 170 }, oa: { range: 62, angle: 180 }, eff: "heavy" },
  ars_great: { b: "great_sword", anim: { windupMs: 260, hitMs: 110, recoveryMs: 190 }, oa: { range: 66, angle: 200 }, eff: "heavy" },
  ars_cleave: { b: "axe", anim: { windupMs: 180, hitMs: 90, recoveryMs: 150 }, oa: { range: 56, angle: 140 }, eff: "heavy" },
  ars_dual: { b: "dagger", anim: { windupMs: 60, hitMs: 60, recoveryMs: 80 }, oa: { range: 50, angle: 140 } },
  ars_sai: { b: "dagger", anim: { windupMs: 50, hitMs: 50, recoveryMs: 70 }, oa: { range: 50, angle: 90 } },
  ars_chain: { b: "dagger", anim: { windupMs: 120, hitMs: 90, recoveryMs: 140 }, oa: { range: 92, angle: 46 } },
  ars_spear: { b: "dagger", anim: { windupMs: 110, hitMs: 80, recoveryMs: 130 }, oa: { range: 84, angle: 42 } },
  ars_spin: { b: "club", anim: { windupMs: 90, hitMs: 90, recoveryMs: 120 }, oa: { range: 54, angle: 360 } },
  ars_scythe: { b: "axe", anim: { windupMs: 200, hitMs: 100, recoveryMs: 160 }, oa: { range: 64, angle: 220 }, eff: "heavy" },
  ars_nunchaku: { b: "club", anim: { windupMs: 60, hitMs: 60, recoveryMs: 80 }, oa: { range: 50, angle: 200 } },
  ars_bow: { b: "bow" }, ars_crossbow: { b: "bow" }, ars_knives: { b: "bow" }, ars_dart: { b: "bow" },
  ars_staff: { b: "staff" }, ars_book: { b: "staff" }, ars_tome: { b: "staff" }, ars_gloves: { b: "staff" },
};
for (const [k, K] of Object.entries(__ARS_KIND)) {
  try {
    const base = oe[K.b]; if (!base) continue;
    oe[k] = { ...base, anim: { ...base.anim, ...(K.anim || {}) }, ...(K.eff ? { effect: K.eff } : {}) };
    if (K.oa) oa[k] = K.oa;
  } catch (e) {}
}
/* tip: para onde a ponta aponta no ícone (as armas: cima-direita; os arcos: a flecha, baixo-direita) */
const __ARS = {
  // ── Samurai ──
  ars_katana_swift: { c: "BERSERKER", k: "ars_slash", a: "slash", col: 0x9fe6ff, ghosts: 2, fast: 1, price: 130, runs: 4, as: 1.35, st: { damage: 12, critChance: 20, speedAdd: 15 },
    n: ["Katana do Vento Cortante", "Cutting Wind Katana", "Katana del Viento Cortante"], d: ["Leve como um sopro: cortes rápidos que deixam um rastro de vento.", "Light as a breath: quick cuts that leave a trail of wind.", "Ligera como un soplo: cortes rápidos con estela de viento."] },
  ars_katana_great: { c: "BERSERKER", k: "ars_heavy", a: "slash", col: 0xffae1e, heavy: 1, price: 160, runs: 3, as: .75, st: { damage: 22, critChance: 12, defense: 3 },
    n: ["Nodachi do Sol Poente", "Setting Sun Nodachi", "Nodachi del Sol Poniente"], d: ["Katana longa e pesada: um corte lento que racha o chão.", "Long, heavy katana: one slow cut that splits the ground.", "Katana larga y pesada: un corte lento que parte el suelo."] },
  ars_sai_guard: { c: "BERSERKER", k: "ars_sai", a: "sai", col: 0xff6a5a, hits: 3, price: 140, runs: 4, as: 1.2, st: { damage: 7, critChance: 15, blockChance: 15 },
    n: ["Sai do Guardião", "Guardian's Sai", "Sai del Guardián"], d: ["Três estocadas por golpe; as garras aparam a lâmina inimiga.", "Three thrusts per strike; the prongs catch enemy blades.", "Tres estocadas por golpe; las garras paran la hoja enemiga."] },
  ars_kusarigama: { c: "BERSERKER", k: "ars_chain", a: "chain", col: 0xff5a4a, price: 150, runs: 4, as: .95, st: { damage: 14, critChance: 10, attackRangeAdd: 20 },
    n: ["Corrente Ninja", "Ninja Chain (Kusarigama)", "Cadena Ninja"], d: ["Kusarigama: a foice voa na ponta da corrente e volta — alcança longe.", "Kusarigama: the sickle flies on the chain and returns — long reach.", "Kusarigama: la hoz vuela con la cadena y vuelve: gran alcance."] },
  // ── Caçador ──
  ars_crossbow_hunt: { c: "HUNTER", k: "ars_crossbow", a: "hold", col: 0xffcf5a, price: 150, runs: 4, as: .7, st: { damage: 20, critChance: 18 },
    shot: { tex: "ars-bolt", speed: 660, dist: 380, pierce: 1, n: 1 },
    n: ["Besta de Caça", "Hunting Crossbow", "Ballesta de Caza"], d: ["Virote pesado que atravessa o primeiro alvo.", "Heavy bolt that pierces the first target.", "Virote pesado que atraviesa el primer objetivo."] },
  ars_crossbow_repeat: { c: "HUNTER", k: "ars_crossbow", a: "hold", col: 0xff8a5a, price: 140, runs: 4, as: 1.05, st: { damage: 10, critChance: 10, speedAdd: 10 },
    shot: { tex: "ars-bolt", speed: 600, dist: 320, n: 2, seq: 110, mult: .8 },
    n: ["Besta de Repetição", "Repeating Crossbow", "Ballesta de Repetición"], d: ["Dois virotes seguidos a cada disparo.", "Two bolts in a row per shot.", "Dos virotes seguidos por disparo."] },
  ars_hunter_pole: { c: "HUNTER", k: "ars_spin", a: "spin", col: 0xd8b070, price: 120, runs: 5, as: 1.05, st: { damage: 12, defense: 5, dodgeChance: 8 },
    n: ["Bastão de Freixo", "Ash Quarterstaff", "Bastón de Fresno"], d: ["Gira em volta do caçador e acerta tudo ao redor.", "Spins around the hunter, hitting everything nearby.", "Gira alrededor del cazador y golpea todo a su alrededor."] },
  ars_hunter_cleaver: { c: "HUNTER", k: "ars_cleave", a: "chop", col: 0xff5a4a, price: 130, runs: 4, as: .85, st: { damage: 18, critChance: 14 },
    n: ["Cutelo de Esfolar", "Skinning Cleaver", "Cuchilla de Desollar"], d: ["Desce de cima para baixo como na caça grossa.", "Comes down from above like in big-game hunting.", "Baja de arriba abajo como en la caza mayor."] },
  // ── Guerreiro ──
  ars_greatsword_oath: { c: "WARRIOR", k: "ars_great", a: "slash", col: 0xffd36a, heavy: 1, price: 170, runs: 3, as: .65, st: { damage: 24, defense: 4, maxHpAdd: 3 },
    n: ["Montante do Juramento", "Oathbound Greatsword", "Mandoble del Juramento"], d: ["Espada de duas mãos: um arco enorme e lento.", "Two-handed sword: a huge, slow arc.", "Espada a dos manos: un arco enorme y lento."] },
  ars_twin_shortswords: { c: "WARRIOR", k: "ars_dual", a: "dual", col: 0xff6a5a, hits: 2, price: 140, runs: 4, as: 1.25, st: { damage: 9, critChance: 16, speedAdd: 12 },
    n: ["Espadas Curtas Gêmeas", "Twin Shortswords", "Espadas Cortas Gemelas"], d: ["Uma em cada mão: dois cortes em X a cada golpe.", "One in each hand: two X cuts per strike.", "Una en cada mano: dos cortes en X por golpe."] },
  // ── Maga ──
  ars_spellbook: { c: "MAGE", k: "ars_book", a: "book", col: 0x6aa8ff, price: 130, runs: 4, as: 1.1, st: { magicDamage: 14, maxMana: 20, critChance: 8 },
    shot: { tex: "proj-bolt", tint: 0x6aa8ff, speed: 430, dist: 300, n: 1, magic: 1 },
    n: ["Grimório das Marés", "Grimoire of Tides", "Grimorio de las Mareas"], d: ["O livro abre e solta páginas a cada feitiço.", "The book opens and sheds pages with every spell.", "El libro se abre y suelta páginas con cada hechizo."] },
  ars_tome_eclipse: { c: "MAGE", k: "ars_tome", a: "book", col: 0xa85cff, thick: 1, price: 170, runs: 3, as: .7, st: { magicDamage: 22, maxMana: 25, critChance: 10 },
    shot: { tex: "proj-bolt", tint: 0xa85cff, speed: 260, dist: 260, n: 1, magic: 1, boom: 50, scale: 1.7 },
    n: ["Tomo do Eclipse", "Tome of the Eclipse", "Tomo del Eclipse"], d: ["Uma esfera lenta que explode numa área.", "A slow orb that explodes over an area.", "Una esfera lenta que estalla en un área."] },
  ars_arcane_gloves: { c: "MAGE", k: "ars_gloves", a: "punch", col: 0x7af6ff, price: 130, runs: 4, as: 1.55, st: { magicDamage: 8, critChance: 12, speedAdd: 12 },
    shot: { tex: "proj-bolt", tint: 0x7af6ff, speed: 560, dist: 170, n: 1, magic: 1, scale: .8 },
    n: ["Luvas do Arcano Vivo", "Gloves of Living Arcana", "Guantes del Arcano Vivo"], d: ["Socos de energia curtos e muito rápidos.", "Short, very fast punches of energy.", "Puñetazos de energía cortos y muy rápidos."] },
  ars_fire_staff: { c: "MAGE", k: "ars_staff", a: "staff", col: 0xff7a2a, price: 150, runs: 4, as: .95, st: { magicDamage: 16, maxMana: 15 }, status: { key: "BURN", duration: 2.5 },
    shot: { tex: "proj-bolt", tint: 0xff7a2a, speed: 400, dist: 300, n: 1, magic: 1, boom: 34 },
    n: ["Cajado das Brasas", "Ember Staff", "Bastón de las Brasas"], d: ["Bola de fogo que explode e queima.", "A fireball that explodes and burns.", "Bola de fuego que estalla y quema."] },
  ars_frost_staff: { c: "MAGE", k: "ars_staff", a: "staff", col: 0x9fe6ff, price: 150, runs: 4, as: 1, st: { magicDamage: 14, maxMana: 20, defense: 2 }, status: { key: "CHILL", duration: 2.5 },
    shot: { tex: "proj-bolt", tint: 0x9fe6ff, speed: 430, dist: 300, n: 1, magic: 1 },
    n: ["Cajado da Geada", "Frost Staff", "Bastón de la Escarcha"], d: ["Lança de gelo que congela os passos do alvo.", "An ice lance that chills the target's steps.", "Lanza de hielo que hiela los pasos del objetivo."] },
  ars_thunder_staff: { c: "MAGE", k: "ars_staff", a: "staff", col: 0xfff36a, price: 160, runs: 3, as: 1, st: { magicDamage: 15, critChance: 15 },
    shot: { tex: "proj-bolt", tint: 0xfff36a, speed: 640, dist: 340, n: 1, magic: 1, pierce: 2 },
    n: ["Cajado do Trovão", "Thunder Staff", "Bastón del Trueno"], d: ["Raio veloz que atravessa até três inimigos.", "A swift bolt that pierces up to three foes.", "Rayo veloz que atraviesa hasta tres enemigos."] },
  // ── Druida ──
  ars_nature_staff: { c: "DRUID", k: "ars_staff", a: "staff", col: 0x7fdf6a, price: 140, runs: 4, as: 1, st: { magicDamage: 14, maxHpAdd: 3 }, status: { key: "POISON", duration: 3, power: 1 },
    shot: { tex: "proj-bolt", tint: 0x7fdf6a, speed: 420, dist: 300, n: 1, magic: 1 },
    n: ["Cajado da Seiva", "Sap Staff", "Bastón de la Savia"], d: ["Semente de seiva que envenena.", "A seed of sap that poisons.", "Semilla de savia que envenena."] },
  ars_storm_staff: { c: "DRUID", k: "ars_staff", a: "staff", col: 0xb8d4ff, price: 150, runs: 4, as: 1, st: { magicDamage: 15, critChance: 12 }, status: { key: "SLOW", duration: 2 },
    shot: { tex: "proj-bolt", tint: 0xb8d4ff, speed: 600, dist: 320, n: 1, magic: 1, pierce: 1 },
    n: ["Cajado da Tempestade", "Storm Staff", "Bastón de la Tormenta"], d: ["Relâmpago que atravessa e atordoa os passos.", "Lightning that pierces and staggers.", "Relámpago que atraviesa y ralentiza."] },
  ars_oak_pole: { c: "DRUID", k: "ars_spin", a: "spin", col: 0x7fdf6a, price: 130, runs: 5, as: 1.05, st: { damage: 13, defense: 5, maxHpAdd: 2 },
    n: ["Bastão de Carvalho", "Oak Quarterstaff", "Bastón de Roble"], d: ["Gira em volta do druida, folhas voando.", "Spins around the druid, leaves flying.", "Gira alrededor del druida, con hojas al viento."] },
  ars_thorn_spear: { c: "DRUID", k: "ars_spear", a: "spear", col: 0x7fdf6a, price: 140, runs: 4, as: .95, st: { damage: 15, critChance: 12 },
    n: ["Lança de Espinheiro", "Thornwood Spear", "Lanza de Espino"], d: ["Estocada longa: alcança o dobro de uma espada.", "A long thrust: twice a sword's reach.", "Estocada larga: el doble de alcance de una espada."] },
  ars_root_crossbow: { c: "DRUID", k: "ars_crossbow", a: "hold", col: 0x7fdf6a, price: 150, runs: 4, as: .85, st: { damage: 16, critChance: 10 }, status: { key: "SLOW", duration: 2.5 },
    shot: { tex: "ars-thorn", speed: 600, dist: 340, n: 1 },
    n: ["Besta de Raízes", "Rootbound Crossbow", "Ballesta de Raíces"], d: ["Espinhos que prendem os pés do alvo.", "Thorns that bind the target's feet.", "Espinas que traban los pies del objetivo."] },
  // ── Xamã ──
  ars_jatoba_bow: { c: "SHAMAN", k: "ars_bow", a: "hold", col: 0xffb04a, price: 130, runs: 4, as: 1, st: { damage: 15, critChance: 14 },
    shot: { tex: "arrow", tint: 0xffd8a0, speed: 480, dist: 320, n: 1 },
    n: ["Arco de Jatobá", "Jatobá Bow", "Arco de Jatobá"], d: ["Madeira dura da mata: flecha firme e certeira.", "Hard forest wood: a firm, true arrow.", "Madera dura de la selva: flecha firme y certera."] },
  ars_curare_blowgun: { c: "SHAMAN", k: "ars_dart", a: "hold", col: 0x7fcf2a, price: 130, runs: 4, as: 1.3, st: { damage: 9, critChance: 18 }, status: { key: "POISON", duration: 4, power: 2 },
    shot: { tex: "ars-dart", speed: 640, dist: 300, n: 1 },
    n: ["Zarabatana de Curare", "Curare Blowgun", "Cerbatana de Curare"], d: ["Dardos rápidos com veneno forte.", "Fast darts with strong poison.", "Dardos rápidos con veneno fuerte."] },
  ars_spirit_sword: { c: "SHAMAN", k: "ars_slash", a: "slash", col: 0x5affb0, ghosts: 2, price: 140, runs: 4, as: 1.1, st: { damage: 15, magicDamage: 4, critChance: 8 },
    n: ["Espada dos Espíritos", "Spirit Sword", "Espada de los Espíritus"], d: ["Os espíritos da mata seguem o corte.", "The forest spirits follow the cut.", "Los espíritus de la selva siguen el corte."] },
  ars_paje_pole: { c: "SHAMAN", k: "ars_spin", a: "spin", col: 0xffb04a, price: 120, runs: 5, as: 1.05, st: { damage: 12, magicDamage: 3, defense: 4 },
    n: ["Bastão do Pajé", "Shaman's Pole", "Bastón del Chamán"], d: ["Gira com as penas sagradas e acerta em volta.", "Spins with sacred feathers, hitting all around.", "Gira con las plumas sagradas y golpea alrededor."] },
  ars_tupa_spear: { c: "SHAMAN", k: "ars_spear", a: "spear", col: 0xfff36a, bolt: 1, price: 150, runs: 4, as: .95, st: { damage: 16, critChance: 12 },
    n: ["Lança de Tupã", "Spear of Tupã", "Lanza de Tupá"], d: ["Estocada longa com o estalo do trovão.", "A long thrust with a crack of thunder.", "Estocada larga con el chasquido del trueno."] },
  // ── Arqueiro ──
  ars_yew_longbow: { c: "ARCHER", k: "ars_bow", a: "hold", col: 0xd8a868, price: 160, runs: 3, as: .7, st: { damage: 22, critChance: 20, attackRangeAdd: 40 },
    shot: { tex: "arrow", speed: 650, dist: 440, n: 1, pierce: 1 },
    n: ["Arco Longo de Teixo", "Yew Longbow", "Arco Largo de Tejo"], d: ["Pesado e lento: a flecha vai longe e atravessa.", "Heavy and slow: the arrow flies far and pierces.", "Pesado y lento: la flecha llega lejos y atraviesa."] },
  ars_falcon_shortbow: { c: "ARCHER", k: "ars_bow", a: "hold", col: 0x9cc4ff, price: 130, runs: 4, as: 1.5, st: { damage: 9, critChance: 12, speedAdd: 15 },
    shot: { tex: "arrow", speed: 520, dist: 260, n: 1 },
    n: ["Arco Curto do Falcão", "Falcon Shortbow", "Arco Corto del Halcón"], d: ["Leve e rápido: flechas em sequência.", "Light and fast: arrows in quick succession.", "Ligero y rápido: flechas en ráfaga."] },
  ars_twin_bow: { c: "ARCHER", k: "ars_bow", a: "hold", col: 0x7ab0ff, price: 150, runs: 4, as: .95, st: { damage: 11, critChance: 12 },
    shot: { tex: "arrow", speed: 520, dist: 320, n: 2, par: 7, mult: .8 },
    n: ["Arco Gêmeo", "Twin Bow", "Arco Gemelo"], d: ["Duas flechas lado a lado em cada disparo.", "Two arrows side by side per shot.", "Dos flechas lado a lado por disparo."] },
  ars_trident_bow: { c: "ARCHER", k: "ars_bow", a: "hold", col: 0xff6a5a, price: 160, runs: 3, as: .9, st: { damage: 10, critChance: 10 },
    shot: { tex: "arrow", speed: 500, dist: 300, n: 3, spread: .2, mult: .7 },
    n: ["Arco Tridente", "Trident Bow", "Arco Tridente"], d: ["Três flechas em leque em cada disparo.", "Three arrows in a fan per shot.", "Tres flechas en abanico por disparo."] },
  // ── Necromante ──
  ars_pale_scythe: { c: "NECROMANCER", k: "ars_scythe", a: "slash", col: 0x5affb0, heavy: 1, souls: 1, price: 150, runs: 4, as: .85, st: { damage: 12, magicDamage: 8, critChance: 10 },
    n: ["Foice do Ceifador Pálido", "Pale Reaper's Scythe", "Guadaña del Segador Pálido"], d: ["Ceifa em volta larga e solta almas verdes.", "Reaps in a wide sweep, releasing green souls.", "Siega en un barrido amplio y suelta almas verdes."] },
  ars_grave_staff: { c: "NECROMANCER", k: "ars_staff", a: "staff", col: 0x5affb0, price: 140, runs: 4, as: 1, st: { magicDamage: 16, maxMana: 20 }, status: { key: "SLOW", duration: 2 },
    shot: { tex: "proj-bolt", tint: 0x5affb0, speed: 420, dist: 300, n: 1, magic: 1 },
    n: ["Cajado das Lápides", "Gravestone Staff", "Bastón de las Lápidas"], d: ["Alma que pesa nos pés de quem acerta.", "A soul that weighs down whoever it hits.", "Un alma que pesa en los pies de quien toca."] },
  ars_tome_dead: { c: "NECROMANCER", k: "ars_tome", a: "book", col: 0x5affb0, thick: 1, price: 170, runs: 3, as: .7, st: { magicDamage: 21, maxMana: 25, critChance: 10 },
    shot: { tex: "proj-bolt", tint: 0x3aff9a, speed: 260, dist: 260, n: 1, magic: 1, boom: 50, scale: 1.7 },
    n: ["Tomo dos Mortos", "Tome of the Dead", "Tomo de los Muertos"], d: ["Esfera de almas lenta que explode numa área.", "A slow orb of souls that explodes over an area.", "Esfera de almas lenta que estalla en un área."] },
  ars_soul_book: { c: "NECROMANCER", k: "ars_book", a: "book", col: 0x5affb0, price: 150, runs: 4, as: 1.05, st: { magicDamage: 11, maxMana: 15, critChance: 8 },
    shot: { tex: "proj-bolt", tint: 0x8affc8, speed: 440, dist: 300, n: 2, spread: .12, mult: .75, magic: 1 },
    n: ["Livro das Almas", "Book of Souls", "Libro de las Almas"], d: ["Duas almas saem das páginas a cada feitiço.", "Two souls leave the pages with every spell.", "Dos almas salen de las páginas con cada hechizo."] },
  // ── Ladina ──
  ars_throwing_knives: { c: "ROGUE", k: "ars_knives", a: "throw", col: 0xc8d4ea, price: 140, runs: 4, as: 1.1, st: { damage: 8, critChance: 22, speedAdd: 10 },
    shot: { tex: "ars-knife", speed: 520, dist: 200, n: 3, spread: .22, mult: .7, spin: 1 },
    n: ["Facas de Arremesso", "Throwing Knives", "Cuchillos Arrojadizos"], d: ["Três facas girando em leque.", "Three spinning knives in a fan.", "Tres cuchillos girando en abanico."] },
  ars_shadow_shortsword: { c: "ROGUE", k: "ars_slash", a: "slash", col: 0xa85cff, ghosts: 2, fast: 1, price: 130, runs: 4, as: 1.3, st: { damage: 12, critChance: 25, dodgeChance: 8 },
    n: ["Espada Curta da Sombra", "Shadow Shortsword", "Espada Corta de la Sombra"], d: ["Curta e veloz, deixa sombras no corte.", "Short and swift, it leaves shadows in its cut.", "Corta y veloz, deja sombras en el corte."] },
  ars_twin_sai: { c: "ROGUE", k: "ars_sai", a: "sai", col: 0xc690ff, hits: 3, twin: 1, price: 140, runs: 4, as: 1.2, st: { damage: 6, critChance: 20, blockChance: 10 },
    n: ["Sais Gêmeos", "Twin Sai", "Sais Gemelos"], d: ["Três estocadas alternando as mãos.", "Three thrusts, alternating hands.", "Tres estocadas alternando las manos."] },
  ars_bamboo_pole: { c: "ROGUE", k: "ars_spin", a: "spin", col: 0xc8e090, price: 120, runs: 5, as: 1.1, st: { damage: 11, defense: 3, dodgeChance: 10 },
    n: ["Bastão de Bambu", "Bamboo Staff", "Bastón de Bambú"], d: ["Leve: gira em volta e afasta quem chega perto.", "Light: spins around and pushes back whoever gets close.", "Ligero: gira alrededor y aleja a quien se acerca."] },
  ars_nunchaku: { c: "ROGUE", k: "ars_nunchaku", a: "nunchaku", col: 0xffcf5a, hits: 2, price: 140, runs: 4, as: 1.3, st: { damage: 8, critChance: 15, speedAdd: 12 },
    n: ["Nunchaku de Ébano", "Ebony Nunchaku", "Nunchaku de Ébano"], d: ["Gira e acerta duas vezes a cada golpe.", "Spins and hits twice per strike.", "Gira y golpea dos veces por golpe."] },
};
const __ARS_ICON = { slash: "icon-sword", heavy: "icon-great-sword", sai: "icon-dagger", chain: "icon-dagger", hold: "icon-bow", spin: "icon-staff", chop: "icon-axe", dual: "icon-twin-fangs",
  book: "icon-arcane-staff", punch: "icon-arcane-staff", staff: "icon-staff", spear: "icon-staff", throw: "icon-dagger", nunchaku: "icon-club" };
/* arcos: no ícone a flecha aponta para baixo-direita */
for (const id of ["ars_jatoba_bow", "ars_yew_longbow", "ars_falcon_shortbow", "ars_twin_bow", "ars_trident_bow"]) __ARS[id].tip = __ARS_P4;
const __ARS_STAT = { damage: ["DANO", "DAMAGE"], magicDamage: ["PODER MÁGICO", "MAGIC POWER"], critChance: ["% CRÍTICO", "% CRIT"], speedAdd: ["VEL", "SPEED"], defense: ["DEFESA", "DEFENSE"],
  maxHpAdd: ["VIDA", "HEALTH"], blockChance: ["% BLOQUEIO", "% BLOCK"], dodgeChance: ["% ESQUIVA", "% DODGE"], maxMana: ["MANA", "MANA"], attackRangeAdd: ["ALCANCE", "RANGE"], cooldownReduction: ["% RECARGA", "% COOLDOWN"] };
function __arsStats(A, en) {
  return Object.entries(A.st).map(([k, v]) => { const L = __ARS_STAT[k]; if (!L) return null; const l = L[en ? 1 : 0];
    return k === "cooldownReduction" ? `-${Math.round(v * 100)}${l}` : l.startsWith("%") ? `+${v}${l}` : `+${v} ${l}` }).filter(Boolean).join(" · ");
}
/* itens */
for (const [id, A] of Object.entries(__ARS)) {
  try {
    Xt[id] = { type: "weapon", slot: "weapon", icon: __ARS_ICON[A.a] || "icon-sword", minRarity: "UNIQUE", classRequirement: A.c, visualKey: A.k, stats: A.st, attackSpeed: A.as,
      value: A.price * 2, uniqueForge: !0, breaksOnDeath: !0, arsenal: !0, ...(A.status ? { status: A.status } : {}),
      get name() { return __L3(...A.n) }, get desc() { return __L3(...A.d) + " " + __L3("Arma do Ferreiro: quebra se morrer na run.", "Blacksmith weapon: breaks if you die in a run.", "Arma del Herrero: se rompe si mueres en la run.") } };
    _s["item." + id] = A.n[1]; Io["item." + id] = A.n[2];
  } catch (e) {}
}
try { if (typeof __FORGE_RUNS !== "undefined") for (const [id, A] of Object.entries(__ARS)) __FORGE_RUNS[id] = A.runs } catch (e) {}

/* lista da armaria (hub-village.js chama window.__arsList): só as do herói que está no Refúgio */
window.__arsList = function (H) {
  try {
    const c = H?.classDef?.id; if (!c) return [];
    const en = (typeof __L3 === "function" ? __L3("p", "e", "e") : "p") !== "p";
    return Object.entries(__ARS).filter(([, A]) => A.c === c).map(([id, A]) => ({ id, name: __L3(...A.n), price: A.price, icon: Xt[id]?.icon || "icon-sword",
      stats: __arsStats(A, en), color: "#" + A.col.toString(16).padStart(6, "0"), ars: !0 }));
  } catch (e) { return [] }
};
window.__ARS = __ARS;

/* ── texturas dos projéteis novos (desenhadas uma vez) ── */
function __arsTex(S) {
  const T = S.textures, mk = (k, w, h, f) => { if (T.exists(k)) return; const c = T.createCanvas(k, w, h); const g = c.getContext(); f(g); c.refresh() };
  try {
    mk("ars-bolt", 26, 8, (g) => { g.fillStyle = "#2a1a10"; g.fillRect(2, 3, 18, 2); g.fillStyle = "#c8a070"; g.fillRect(3, 3.4, 16, 1.2);
      g.fillStyle = "#d8dce4"; g.beginPath(); g.moveTo(19, 1); g.lineTo(26, 4); g.lineTo(19, 7); g.closePath(); g.fill(); g.fillStyle = "#b03030"; g.fillRect(0, 1, 5, 2); g.fillRect(0, 5, 5, 2) });
    mk("ars-thorn", 24, 10, (g) => { g.fillStyle = "#3a5a1a"; g.fillRect(1, 4, 16, 2); g.fillStyle = "#9de08a"; g.beginPath(); g.moveTo(15, 1); g.lineTo(24, 5); g.lineTo(15, 9); g.closePath(); g.fill();
      g.fillStyle = "#5a8a2a"; for (const x of [5, 10]) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x + 2, 0); g.lineTo(x + 3, 4); g.fill(); g.beginPath(); g.moveTo(x, 6); g.lineTo(x + 2, 10); g.lineTo(x + 3, 6); g.fill() } });
    mk("ars-dart", 20, 6, (g) => { g.fillStyle = "#e8e0c8"; g.fillRect(3, 2.5, 12, 1.2); g.fillStyle = "#2fd07a"; g.beginPath(); g.moveTo(14, 1); g.lineTo(20, 3); g.lineTo(14, 5); g.closePath(); g.fill(); g.fillStyle = "#e8382a"; g.fillRect(0, 1, 4, 4) });
    mk("ars-knife", 20, 10, (g) => { g.fillStyle = "#1a1a24"; g.fillRect(0, 3, 7, 4); g.fillStyle = "#56607a"; g.fillRect(6, 1, 2, 8); g.fillStyle = "#e8eef8"; g.beginPath(); g.moveTo(8, 2); g.lineTo(20, 5); g.lineTo(8, 8); g.closePath(); g.fill();
      g.fillStyle = "#ffffff"; g.fillRect(9, 4, 8, 1) });
  } catch (e) {}
}

/* ── animações das armas: a própria arma (ícone do atlas) faz o golpe ── */
const __ARSFX = {
  img(S, id, x, y, d, size = 26) {
    const ok = S.textures.exists("items-hd") && S.textures.get("items-hd").has(id);
    const m = ok ? S.add.image(x, y, "items-hd", id) : S.add.image(x, y, Xt[id]?.icon || "icon-sword");
    m.setDisplaySize(size, size).setDepth(d); return m;
  },
  mote(S, x, y, col, sc, d) { return S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(sc).setDepth(d) },
  sparks(S, x, y, col, n, d, spd = 22) {
    for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, v = spd * (.4 + Math.random() * .6), m = __ARSFX.mote(S, x, y, col, .018 + Math.random() * .014, d);
      S.tweens.add({ targets: m, x: x + Math.cos(a) * v, y: y + Math.sin(a) * v * .7, alpha: 0, scale: .002, duration: 260 + Math.random() * 160, onComplete: () => m.destroy() }) }
  },
  fade(S, m, delay, dur = 140) { S.tweens.add({ targets: m, alpha: 0, delay, duration: dur, onComplete: () => m.destroy() }) },
  /* corte: a arma gira em volta da mão, de um lado ao outro do arco, com cópias-fantasma atrás */
  slash(S, id, A, P, ang, arc, side) {
    const sp = (arc ?? 150) * Math.PI / 180, a0 = ang - side * sp / 2, a1 = ang + side * sp / 2, dur = A.heavy ? 230 : A.fast ? 110 : 150, size = A.heavy ? 44 : 36;
    const tip = A.tip ?? -__ARS_P4, n = 1 + (A.ghosts || (A.heavy ? 1 : 0));
    for (let g = 0; g < n; g++) {
      const m = __ARSFX.img(S, id, P.x, P.y, P.d + 3 - g, size).setOrigin(.2, .8).setAlpha(g ? .42 / g : 1);
      g && m.setTint(A.col).setBlendMode(j.BlendModes.ADD);
      const o = { t: 0 }, upd = () => { const a = a0 + (a1 - a0) * (1 - Math.pow(1 - o.t, 3)); m.setPosition(P.x + Math.cos(a) * 5, P.y + Math.sin(a) * 4).setRotation(a - tip) };
      upd(); S.tweens.add({ targets: o, t: 1, duration: dur, delay: g * 28, onUpdate: upd, onComplete: () => __ARSFX.fade(S, m, 40) });
    }
    if (A.souls) for (let k = 0; k < 3; k++) S.time.delayedCall(dur * .6 + k * 50, () => { const a = a0 + (a1 - a0) * (k / 2), x = P.x + Math.cos(a) * 40, y = P.y + Math.sin(a) * 30;
      const s = __ARSFX.mote(S, x, y, A.col, .05, P.d + 2); S.tweens.add({ targets: s, y: y - 26, alpha: 0, scale: .01, duration: 600, onComplete: () => s.destroy() }) });
    if (A.heavy) S.time.delayedCall(dur, () => { try { S.cameras.main.shake(70, .003) } catch (e) {} __ARSFX.sparks(S, P.x + Math.cos(a1) * 34, P.y + Math.sin(a1) * 26, A.col, 6, P.d + 2) });
  },
  /* golpe de cima para baixo (cutelo) */
  chop(S, id, A, P, ang, side) {
    const m = __ARSFX.img(S, id, P.x, P.y, P.d + 3, 38).setOrigin(.2, .8), tip = -__ARS_P4, up = -Math.PI / 2 - side * .3, dn = ang + side * .5;
    const o = { t: 0 }, upd = () => { const e = o.t < .4 ? o.t / .4 : 1, a = o.t < .4 ? up : up + (dn - up) * Math.pow((o.t - .4) / .6, 2); m.setPosition(P.x + Math.cos(ang) * 6, P.y - 4).setRotation(a - tip).setScale(m.scaleX, m.scaleY) };
    upd(); S.tweens.add({ targets: o, t: 1, duration: 230, onUpdate: upd, onComplete: () => { __ARSFX.sparks(S, P.x + Math.cos(ang) * 30, P.y + Math.sin(ang) * 22 + 4, A.col, 7, P.d + 2); __ARSFX.fade(S, m, 60) } });
  },
  /* estocadas (sai, lança): a arma avança e volta; n vezes, alternando o lado */
  thrust(S, id, A, P, ang, reach, n, gap) {
    const tip = A.tip ?? -__ARS_P4, nx = -Math.sin(ang), ny = Math.cos(ang);
    for (let k = 0; k < n; k++) S.time.delayedCall(k * gap, () => {
      const off = n > 1 ? (k % 2 ? 6 : -6) : 0, x0 = P.x + nx * off + Math.cos(ang) * 6, y0 = P.y + ny * off + Math.sin(ang) * 6;
      const m = __ARSFX.img(S, id, x0, y0, P.d + 3, A.k === "ars_spear" ? 42 : 30).setRotation(ang - tip);
      if (A.twin) m.setFlipY(k % 2 === 1);
      S.tweens.add({ targets: m, x: x0 + Math.cos(ang) * reach, y: y0 + Math.sin(ang) * reach, duration: gap * .45, yoyo: !0, ease: "Quad.easeOut", onComplete: () => m.destroy() });
      S.time.delayedCall(gap * .45, () => __ARSFX.sparks(S, x0 + Math.cos(ang) * (reach + 12), y0 + Math.sin(ang) * (reach + 12), A.col, 3, P.d + 2, 14));
    });
    if (A.bolt) S.time.delayedCall(gap * .45, () => {   // Tupã: um raio corre a lança até a ponta
      const g = S.add.graphics().setDepth(P.d + 4).setBlendMode(j.BlendModes.ADD); let x = P.x, y = P.y; g.lineStyle(2, 0xfff36a, 1).beginPath().moveTo(x, y);
      for (let k = 1; k <= 5; k++) { x = P.x + Math.cos(ang) * reach * 1.6 * k / 5 + (Math.random() - .5) * 8; y = P.y + Math.sin(ang) * reach * 1.6 * k / 5 + (Math.random() - .5) * 8; g.lineTo(x, y) }
      g.strokePath(); S.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() });
    });
  },
  /* giro do bastão: o bastão gira em volta do herói, com um anel */
  spin(S, id, A, P) {
    const m = __ARSFX.img(S, id, P.x, P.y, P.d + 3, 48).setOrigin(.5);
    S.tweens.add({ targets: m, rotation: m.rotation + Math.PI * 2 * 1.5, duration: 280, ease: "Quad.easeOut", onComplete: () => __ARSFX.fade(S, m, 0, 120) });
    const r = S.add.ellipse(P.x, P.y + 4, 30, 14).setStrokeStyle(2, A.col, .8).setDepth(P.d - 1).setBlendMode(j.BlendModes.ADD);
    S.tweens.add({ targets: r, scaleX: 3.4, scaleY: 3.4, alpha: 0, duration: 320, onComplete: () => r.destroy() });
    if (A.c === "DRUID") for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, l = S.add.ellipse(P.x, P.y, 6, 3, 0x7fdf6a, .9).setDepth(P.d + 2).setRotation(a);
      S.tweens.add({ targets: l, x: P.x + Math.cos(a) * 46, y: P.y + Math.sin(a) * 30, rotation: a + 4, alpha: 0, duration: 500, onComplete: () => l.destroy() }) }
  },
  /* corrente ninja: a foice voa até a ponta do alcance e volta, com os elos desenhados */
  chain(S, id, A, P, ang, reach) {
    const h = __ARSFX.img(S, id, P.x, P.y, P.d + 3, 22).setOrigin(.5), g = S.add.graphics().setDepth(P.d + 2), o = { t: 0 };
    const upd = () => { const k = o.t < .5 ? o.t / .5 : 1 - (o.t - .5) / .5, d = reach * Math.sin(k * Math.PI / 2), x = P.x + Math.cos(ang) * d, y = P.y + Math.sin(ang) * d;
      h.setPosition(x, y).setRotation(o.t * Math.PI * 5); g.clear(); const n = Math.max(2, Math.round(d / 7));
      for (let i = 1; i < n; i++) { const t = i / n, cx = P.x + (x - P.x) * t, cy = P.y + (y - P.y) * t + Math.sin(t * Math.PI) * 5 * (1 - k); g.fillStyle(0x1a1a24, 1).fillCircle(cx, cy, 2.2); g.fillStyle(0xb8c0cc, 1).fillCircle(cx, cy, 1.2) } };
    upd(); S.tweens.add({ targets: o, t: 1, duration: 320, onUpdate: upd, onComplete: () => { h.destroy(); g.destroy() } });
    S.time.delayedCall(160, () => __ARSFX.sparks(S, P.x + Math.cos(ang) * reach, P.y + Math.sin(ang) * reach, A.col, 5, P.d + 2));
  },
  /* nunchaku: gira duas voltas na mão */
  nunchaku(S, id, A, P, ang) {
    const m = __ARSFX.img(S, id, P.x + Math.cos(ang) * 8, P.y + Math.sin(ang) * 6, P.d + 3, 32).setOrigin(.25, .75);
    S.tweens.add({ targets: m, rotation: Math.PI * 4, duration: 240, ease: "Linear", onComplete: () => __ARSFX.fade(S, m, 0, 100) });
    const r = S.add.circle(P.x + Math.cos(ang) * 14, P.y + Math.sin(ang) * 10, 16).setStrokeStyle(2, A.col, .7).setDepth(P.d + 2).setBlendMode(j.BlendModes.ADD);
    S.tweens.add({ targets: r, scale: 1.6, alpha: 0, duration: 260, onComplete: () => r.destroy() });
  },
  /* espadas gêmeas: dois cortes que se cruzam em X */
  dual(S, id, A, P, ang) {
    for (const [k, s] of [[0, 1], [1, -1]]) S.time.delayedCall(k * 90, () => {
      const m = __ARSFX.img(S, id, P.x, P.y, P.d + 3, 34).setOrigin(.5), a0 = ang - s * 1, a1 = ang + s * 1;
      const o = { t: 0 }, upd = () => { const a = a0 + (a1 - a0) * o.t; m.setPosition(P.x + Math.cos(ang) * 14 + Math.cos(a) * 6, P.y + Math.sin(ang) * 10 + Math.sin(a) * 6).setRotation(a + __ARS_P4) };
      upd(); S.tweens.add({ targets: o, t: 1, duration: 110, onUpdate: upd, onComplete: () => __ARSFX.fade(S, m, 20, 100) });
    });
  },
  /* armas de disparo: a arma aparece na mão apontando, dá o tranco e some */
  hold(S, id, A, P, ang) {
    const tip = A.tip ?? -__ARS_P4, x = P.x + Math.cos(ang) * 12, y = P.y + Math.sin(ang) * 9, m = __ARSFX.img(S, id, x, y, P.d + 3, 34).setRotation(ang - tip).setScale(0);
    const sc = 34 / (m.frame?.width || 80);
    S.tweens.add({ targets: m, scale: sc, duration: 80, ease: "Back.easeOut", onComplete: () => S.tweens.add({ targets: m, x: x - Math.cos(ang) * 4, y: y - Math.sin(ang) * 3, duration: 70, yoyo: !0, onComplete: () => __ARSFX.fade(S, m, 60, 120) }) });
    __ARSFX.sparks(S, x + Math.cos(ang) * 12, y + Math.sin(ang) * 10, A.col, 3, P.d + 4, 12);
  },
  /* facas: a mão estala e as facas saem (sem a arma na mão) */
  throw(S, id, A, P, ang) { __ARSFX.sparks(S, P.x + Math.cos(ang) * 10, P.y + Math.sin(ang) * 8, A.col, 4, P.d + 3, 14) },
  /* luvas: o punho avança com um clarão */
  punch(S, id, A, P, ang) {
    const x = P.x + Math.cos(ang) * 6, y = P.y + Math.sin(ang) * 5, m = __ARSFX.img(S, id, x, y, P.d + 3, 30).setRotation(ang + Math.PI / 2 - .2);
    S.tweens.add({ targets: m, x: x + Math.cos(ang) * 12, y: y + Math.sin(ang) * 9, duration: 70, yoyo: !0, onComplete: () => m.destroy() });
    const f = __ARSFX.mote(S, x + Math.cos(ang) * 18, y + Math.sin(ang) * 14, A.col, .09, P.d + 4); S.tweens.add({ targets: f, scale: .01, alpha: 0, duration: 200, onComplete: () => f.destroy() });
  },
  /* cajado: erguido ao lado do herói, o elemento acende na ponta */
  staff(S, id, A, P, ang) {
    const side = Math.cos(ang) < 0 ? -1 : 1, x = P.x + side * 10, y = P.y - 6, m = __ARSFX.img(S, id, x, y + 6, P.d + 3, 42).setRotation(-Math.PI / 2 + __ARS_P4 + side * .25).setAlpha(0);
    S.tweens.add({ targets: m, y, alpha: 1, duration: 90, onComplete: () => __ARSFX.fade(S, m, 160, 140) });
    const tx = x + side * 6, ty = y - 15, f = __ARSFX.mote(S, tx, ty, A.col, .02, P.d + 4);
    S.tweens.add({ targets: f, scale: .1, alpha: 0, duration: 320, onComplete: () => f.destroy() });
    __ARSFX.sparks(S, tx, ty, A.col, 5, P.d + 4, 16);
  },
  /* livro/tomo: flutua à frente, abre (vira) e solta páginas */
  book(S, id, A, P, ang) {
    const x = P.x + Math.cos(ang) * 14, y = P.y - 10, sz = A.thick ? 30 : 26, m = __ARSFX.img(S, id, x, y + 6, P.d + 3, sz).setAlpha(0), sx = m.scaleX;
    S.tweens.add({ targets: m, y, alpha: 1, duration: 100, onComplete: () => S.tweens.add({ targets: m, scaleX: -sx, duration: 140, yoyo: !0, onComplete: () => __ARSFX.fade(S, m, 40, 140) }) });
    for (let k = 0; k < (A.thick ? 2 : 3); k++) S.time.delayedCall(80 + k * 50, () => {
      const p = S.add.rectangle(x, y, 5, 6, 0xfbf4dc, 1).setStrokeStyle(1, 0x8a7a52).setDepth(P.d + 4), a = ang + (Math.random() - .5) * 1.6;
      S.tweens.add({ targets: p, x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 18 - 10, rotation: (Math.random() - .5) * 6, alpha: 0, duration: 520, onComplete: () => p.destroy() });
    });
    const f = __ARSFX.mote(S, x, y, A.col, .03, P.d + 2); S.tweens.add({ targets: f, scale: .11, alpha: 0, duration: 360, onComplete: () => f.destroy() });
  },
};
window.__ARSFX = __ARSFX;

/* ── o golpe: animação + comportamento de cada arma ── */
if (typeof dh !== "undefined" && dh.prototype?.deliverAttack) {
  const D0 = dh.prototype.deliverAttack;
  dh.prototype.deliverAttack = function (i, t, e) {
    let S, it, A;
    try { S = this.scene; it = S.inventory?.equipment?.weapon; A = it && __ARS[it.id] } catch (err) {}
    if (!A || !this.player?.active) return D0.apply(this, arguments);
    const pl = this.player;
    /* armas de disparo: os projéteis saem daqui (quantos, com que textura, veneno/fogo, atravessar, explodir) */
    if (A.shot) {
      try {
        const T = A.shot, pb = 1 + (S.stats.total.projectileBoost ?? 0), spd = T.speed * pb;
        const aim = typeof __aimDir === "function" ? __aimDir(S, spd) : null;
        aim && (pl.facing = { x: aim.x, y: aim.y }, aim.x !== 0 && pl.setFlipX(aim.x < 0));
        const m = aim ?? e ?? pl.facing, L = Math.hypot(m.x, m.y) || 1, ang = Math.atan2(m.y / L, m.x / L);
        const P = { x: pl.x, y: pl.y - 4, d: (pl.depth || pl.y) + 6 };
        try { __ARSFX[A.a]?.(S, it.id, A, P, ang) } catch (er) {}
        const mag = !!T.magic, tex = T.tex === "arrow" ? (S.textures.exists("proj-arrow-pack") ? "proj-arrow-pack" : "proj-arrow") : T.tex, n = T.n || 1;
        const fire = (k) => {
          if (!pl.active || pl.dead) return;
          const off = n > 1 && T.spread ? (k - (n - 1) / 2) * T.spread : 0, a = ang + off, dir = { x: Math.cos(a), y: Math.sin(a) };
          const par = n > 1 && T.par ? (k - (n - 1) / 2) * T.par : 0, nx = -dir.y, ny = dir.x;
          const { amount, crit } = S.stats.rollAbilityDamage(T.mult ?? 1, mag ? "magical" : "physical");
          const pr = S.projectiles.spawn({ x: pl.x + dir.x * 14 + nx * par, y: pl.y + dir.y * 14 + ny * par, dir, texture: tex, speed: spd, maxDist: T.dist * pb, tint: T.tint ?? (mag ? 9089279 : 16777215),
            damage: amount, critical: crit, damageType: mag ? "magical" : "physical", status: this.getWeaponStatus(), pierce: T.pierce ?? 0, ...(T.boom ? { explosion: { radius: T.boom } } : {}) });
          if (pr?.img) { T.scale && pr.img.setScale(T.scale); T.spin && S.tweens.add({ targets: pr.img, angle: pr.img.angle + 1440, duration: 900 }) }
        };
        for (let k = 0; k < n; k++) T.seq ? S.time.delayedCall(k * T.seq, () => fire(k)) : fire(k);
        return;
      } catch (err) { console.warn("[arsenal]", err); return D0.apply(this, arguments) }
    }
    /* corpo a corpo: o golpe normal (acerto e meia-lua) + a arma fazendo o golpe + acertos extras */
    const r = D0.apply(this, arguments);
    try {
      const d = e ?? pl.facing, L = Math.hypot(d.x, d.y) || 1, ang = Math.atan2(d.y / L, d.x / L), side = (d.x ?? 1) < 0 ? -1 : 1;
      const P = { x: pl.x, y: pl.y - 4, d: (pl.depth || pl.y) + 6 }, arc = oa[A.k]?.angle, reach = oa[A.k]?.range ?? 54;
      const f = __ARSFX;
      if (A.a === "slash") f.slash(S, it.id, A, P, ang, arc, side);
      else if (A.a === "chop") f.chop(S, it.id, A, P, ang, side);
      else if (A.a === "sai") f.thrust(S, it.id, A, P, ang, 16, A.hits || 1, 95);
      else if (A.a === "spear") f.thrust(S, it.id, A, P, ang, 30, 1, 200);
      else if (A.a === "spin") f.spin(S, it.id, A, P);
      else if (A.a === "chain") f.chain(S, it.id, A, P, ang, reach - 6);
      else if (A.a === "nunchaku") f.nunchaku(S, it.id, A, P, ang);
      else if (A.a === "dual") f.dual(S, it.id, A, P, ang);
      /* acertos extras (sai, espadas gêmeas, nunchaku): o mesmo golpe de novo, logo em seguida */
      const extra = (A.hits || 1) - 1, self = this, args = [i, t, e];
      for (let k = 1; k <= extra; k++) S.time.delayedCall(k * (A.a === "sai" ? 95 : 100), () => { try { if (pl.active && !pl.dead) D0.apply(self, args) } catch (er) {} });
    } catch (err) {}
    return r;
  };
}
/* texturas na entrada de cada fase */
{
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function () { const r = C0.apply(this, arguments); try { __arsTex(this) } catch (e) {} return r };
}
