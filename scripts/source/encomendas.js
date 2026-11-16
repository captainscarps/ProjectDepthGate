/* ══ Encomendas especiais do ferreiro ══
   Peças que o ferreiro só forja para quem fez algo excepcional. Na loja da forja, aba 📜 ENCOMENDAS: as trancadas
   aparecem como silhueta com a pista do feito; cumprido o feito, a peça fica à venda em Pedra Cobalto, com
   durabilidade em runs como as outras peças do ferreiro. Os feitos são de cada herói (etiqueta 1..4 / e1..e4).
   · Coroa do Abismo ........ chegar à profundidade 30 (Modo Infinito)
   · Anel do Intocado ....... vencer um chefe sem levar dano
   · Manto do Carrasco ...... 500 abates numa única run (Modo Infinito)
   · Botas do Peregrino ..... morrer 25 vezes com o mesmo herói (Modo Infinito)
   · Martelo do Mestre ...... 30 forjas com o Martelo de Forjador → o martelo nunca mais quebra (entregue de graça)
   · ??? (secreta) .......... vencer um chefe usando só a arma inicial da classe → Amuleto da Origem */
const __ENC = [
  { id: "unique_forge_abyss_crown", slot: "helmet", price: 190, runs: 4, icon: "icon-helmet", color: "#c084fc",
    name: ["Coroa do Abismo", "Crown of the Abyss", "Corona del Abismo"], stats: { defense: 6, damage: 5, critChance: 8 },
    st: ["+6 DEFESA · +5 DANO · +8% CRÍTICO", "+6 DEFENSE · +5 DAMAGE · +8% CRIT"],
    hint: ["Só forjo esta para quem viu a profundidade 30 do Abismo.", "I only forge this for someone who has seen depth 30 of the Abyss.", "Solo la forjo para quien vio la profundidad 30 del Abismo."],
    desc: "Feita com cobalto que só aparece abaixo do trigésimo andar. Pesa como uma promessa." },
  { id: "unique_forge_untouched_ring", slot: "accessory", price: 170, runs: 4, icon: "icon-ring", color: "#fde68a",
    name: ["Anel do Intocado", "Ring of the Untouched", "Anillo del Intocado"], stats: { critChance: 15, damage: 4, speed: 10 },
    st: ["+15% CRÍTICO · +4 DANO · +10 VEL", "+15% CRIT · +4 DAMAGE · +10 SPEED"],
    hint: ["Derrube um chefe sem que ele encoste um dedo em você.", "Bring down a boss without it laying a finger on you.", "Derriba a un jefe sin que te toque."],
    desc: "Um aro liso, sem nenhum arranhão — como quem o conquistou." },
  { id: "unique_forge_executioner_mantle", slot: "armor", price: 200, runs: 3, icon: "icon-armor", color: "#f87171",
    name: ["Manto do Carrasco", "Executioner's Mantle", "Manto del Verdugo"], stats: { defense: 8, damage: 8, critChance: 6 },
    st: ["+8 DEFESA · +8 DANO · +6% CRÍTICO", "+8 DEFENSE · +8 DAMAGE · +6% CRIT"],
    hint: ["Quinhentos abates numa única descida. Nem um a menos.", "Five hundred kills in a single descent. Not one less.", "Quinientos abates en un solo descenso. Ni uno menos."],
    desc: "Tingido de um vermelho que não sai. Os inimigos sabem quem o veste." },
  { id: "unique_forge_pilgrim_boots", slot: "boots", price: 140, runs: 6, icon: "icon-boots", color: "#86efac",
    name: ["Botas do Peregrino", "Pilgrim's Boots", "Botas del Peregrino"], stats: { speed: 25, maxHp: 6, defense: 3 },
    st: ["+25 VEL · +6 VIDA · +3 DEFESA", "+25 SPEED · +6 HEALTH · +3 DEFENSE"],
    hint: ["Caia vinte e cinco vezes com o mesmo herói — e continue voltando.", "Fall twenty-five times with the same hero — and keep coming back.", "Cae veinticinco veces con el mismo héroe — y sigue volviendo."],
    desc: "Gastas de tanto voltar. Quem insiste assim merece um passo mais leve." },
  { id: "enc_master_hammer", special: "hammer", price: 0, icon: "icon-club", color: "#93c5fd",
    name: ["Martelo do Mestre-Ferreiro", "Master Smith's Hammer", "Martillo del Maestro Herrero"],
    st: ["SEU MARTELO DE FORJADOR NUNCA MAIS QUEBRA", "YOUR FORGER'S HAMMER NEVER BREAKS AGAIN"],
    hint: ["Forje trinta vezes com o Martelo de Forjador. Aí conversamos de mestre para mestre.", "Forge thirty times with the Forger's Hammer. Then we'll talk master to master.", "Forja treinta veces con el Martillo de Forjador. Luego hablamos de maestro a maestro."],
    desc: "" },
  { id: "unique_forge_origin_amulet", slot: "accessory", price: 210, runs: 3, icon: "icon-amulet", color: "#fcd34d", secret: !0,
    name: ["Amuleto da Origem", "Amulet of Origin", "Amuleto del Origen"], stats: { damage: 6, maxHp: 6, defense: 4, maxMana: 20 },
    st: ["+6 DANO · +6 VIDA · +4 DEFESA · +20 MANA", "+6 DAMAGE · +6 HEALTH · +4 DEFENSE · +20 MANA"],
    hint: ["???", "???", "???"],
    found: ["Venceu um chefe só com a arma com que começou.", "Defeated a boss with only the weapon you started with.", "Venció a un jefe solo con el arma con la que empezó."],
    desc: "Guarda o calor da primeira arma. Lembra de onde você veio." },
];
for (const e of __ENC) {
  if (e.special) continue;
  Xt[e.id] = { name: e.name[0], type: e.slot === "accessory" ? "accessory" : "armor", slot: e.slot, icon: e.icon, minRarity: "UNIQUE", stats: e.stats,
    value: e.price * 2, uniqueForge: !0, breaksOnDeath: !0, encomenda: !0, desc: e.desc + " Encomenda especial do ferreiro." };
  try { _s["item." + e.id] = e.name[1]; Io["item." + e.id] = e.name[2] } catch (x) {}
  try { window.__FORGE_RUNS && (window.__FORGE_RUNS[e.id] = e.runs) } catch (x) {}
}

/* feitos do herói */
function __encTag(S) { try { return window.__heroTag ? window.__heroTag((S?.game || window.__DED_GAME).registry, 1, S?.sys ? S : null) : "1" } catch (e) { return "1" } }
function __encGet(S) { let o = {}; try { o = JSON.parse(localStorage.getItem("depthgate:feats:" + __encTag(S)) || "{}") || {} } catch (e) {} o.u ??= {}; o.told ??= {}; return o }
function __encSet(S, o) { try { localStorage.setItem("depthgate:feats:" + __encTag(S), JSON.stringify(o)) } catch (e) {} }
function __encUnlock(S, id) {
  const F = __encGet(S); if (F.u[id]) return !1;
  F.u[id] = Date.now(); __encSet(S, F);
  const E = __ENC.find(e => e.id === id); if (!E) return !0;
  const nm = __L3(...E.name), ev = (S?.game || window.__DED_GAME)?.events;
  try { S?.audioRef?.play?.("sfx-boss-victory") || S?.game?.audioEngine?.sfx?.("sfx-boss-victory") } catch (e) {}
  setTimeout(() => ev?.emit("ui:banner", __L3(`📜 O FERREIRO OUVIU FALAR DO SEU FEITO · ${nm.toUpperCase()}`, `📜 THE BLACKSMITH HEARD OF YOUR DEED · ${nm.toUpperCase()}`, `📜 EL HERRERO OYÓ DE TU HAZAÑA · ${nm.toUpperCase()}`), "#ffd24a"), 900);
  return !0;
}
window.__encUnlocked = (S, id) => !!__encGet(S).u[id];
window.__encList = S => { const F = __encGet(S); return __ENC.map(e => ({ ...e, locked: !F.u[e.id] })) };
window.__encUntold = S => { const F = __encGet(S); return __ENC.filter(e => F.u[e.id] && !F.told[e.id]) };
window.__encTold = (S, ids) => { const F = __encGet(S); ids.forEach(id => F.told[id] = 1); __encSet(S, F) };

/* Martelo do Mestre: conta as forjas; com 30, o martelo vira eterno */
{
  const H0 = __hasHammer;
  __hasHammer = function (S) { try { if (__encGet(S || { game: window.__DED_GAME }).u.enc_master_hammer) return !0 } catch (e) {} return H0.apply(this, arguments) };
  const U0 = window.__hammerUse;
  window.__hammerUse = function (S) {
    try {
      const F = __encGet(S); F.forges = (F.forges | 0) + 1; __encSet(S, F);
      if (F.u.enc_master_hammer) return;
      if (F.forges >= 30) { __encUnlock(S, "enc_master_hammer"); return }
    } catch (e) {}
    return U0?.apply(this, arguments);
  };
  const L0 = window.__hammerLeft;
  window.__hammerLeft = function (S) { try { if (__encGet(S).u.enc_master_hammer) return 0 } catch (e) {} return L0?.apply(this, arguments) ?? 0 };
}

/* ganchos da run: profundidade, abates, chefes sem dano, chefe com a arma inicial */
{
  const isEnd = S => { try { return S.game.registry.get("mode") === "endless" && !!S.endlessRun?.() } catch (e) { return !1 } };
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try {
      const S = this;
      const hurt = () => { try { for (const e of S.enemies?.getChildren?.() ?? []) e?.active && (e.isBoss || e === S.boss) && (e.__encHit = 1); S.boss && (S.boss.__encHit = 1) } catch (e) {} };
      S.game.events.on("fx:player-damaged", hurt);
      let acc = 0;
      const tick = (t, dt) => {
        acc += dt; if (acc < 1000) return; acc = 0;
        try { if (isEnd(S) && (S.endlessRun()?.depth | 0) >= 30) __encUnlock(S, "unique_forge_abyss_crown") } catch (e) {}
      };
      S.events.on("update", tick);
      S.events.once("shutdown", () => { S.game.events.off("fx:player-damaged", hurt); S.events.off("update", tick) });
    } catch (e) { console.warn("[encomendas]", e) }
    return r;
  };
  const D0 = Sd.prototype.onEnemyDied;
  Sd.prototype.onEnemyDied = function (e) {
    const r = D0.apply(this, arguments);
    try {
      const S = this;
      if (isEnd(S)) { const run = S.endlessRun(); run.__kills = (run.__kills | 0) + 1; run.__kills >= 500 && __encUnlock(S, "unique_forge_executioner_mantle") }
      if (e && (e.isBoss || e === S.boss) && !e.__encDone) {
        e.__encDone = 1;
        if (!e.__encHit && !S.player?.dead) __encUnlock(S, "unique_forge_untouched_ring");
        const cid = S.classDef?.id, start = (typeof xh !== "undefined" && xh[cid]) || "sword", w = S.inventory?.equipment?.weapon;
        if (w && w.id === start) __encUnlock(S, "unique_forge_origin_amulet");
      }
    } catch (x) {}
    return r;
  };
}
/* Botas do Peregrino: 25 mortes com o mesmo herói do Infinito (conferido na morte e ao abrir a forja) */
function __encDeaths(S, slot) { try { const d = Nn(slot); if (d.ok && (d.data.player?.deaths | 0) >= 25) __encUnlock(S, "unique_forge_pilgrim_boots") } catch (e) {} }
window.addEventListener("depthgate:endlessDeath", e => { try { const G = window.__DED_GAME, S = G?.scene?.getScene?.("Game"); __encDeaths(S?.sys ? S : { game: G }, e.detail?.slot || 1) } catch (x) {} });
window.__encDeaths = __encDeaths;
