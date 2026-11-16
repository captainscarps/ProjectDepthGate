/* ══ Martelo de Forjador com desgaste ══
   O martelo comprado no Ferreiro do Refúgio aguenta __HM_MAX forjas (cada fusão 3→1 gasta 1 uso). Ao chegar a zero
   ele QUEBRA: some do herói e não tem conserto — é preciso comprar outro. Os usos são de cada herói
   (etiqueta 1..4 na campanha, e1..e4 no Modo Infinito) e ficam numa chave própria do localStorage. */
const __HM_MAX = 10;
function __hmTag(S) {
  try {
    const G = S?.game || window.__DED_GAME, R = G?.registry;
    if (S?.__hubInv) return (S.mode === "endless" ? "e" : "") + (R?.get("save:slot") ?? 1);
    return window.__heroTag ? window.__heroTag(R, 1, S?.sys ? S : null) : String(R?.get("save:slot") ?? 1);
  } catch (e) { return "1" }
}
function __hmKey(S) { return "depthgate:hammer:" + __hmTag(S) }
window.__hammerLeft = function (S) {
  try {
    if (!__hasHammer(S)) return 0;
    const k = __hmKey(S); let v = parseInt(localStorage.getItem(k), 10);
    if (!(v > 0)) { v = __HM_MAX; localStorage.setItem(k, String(v)) }   // martelo recém-comprado
    return v;
  } catch (e) { return 0 }
};
function __hmBreak(S) {
  const G = S?.game || window.__DED_GAME, R = G?.registry, end = S?.__hubInv ? S.mode === "endless" : R?.get("mode") === "endless";
  try { localStorage.removeItem(__hmKey(S)) } catch (e) {}
  if (end) { const m = Xe(); m.upgrades = m.upgrades || {}; delete m.upgrades.HAMMER; tr(m); return }
  try { const ref = R?.get("campaign:refuge"); if (ref?.upgrades) delete ref.upgrades.HAMMER } catch (e) {}
  try {
    const sl = R?.get("save:slot") ?? 1, r = Dn(sl);
    if (r.ok && r.data?.campaign?.refuge?.upgrades) { delete r.data.campaign.refuge.upgrades.HAMMER; localStorage.setItem(Wt("campaign", sl), JSON.stringify(r.data)) }
  } catch (e) {}
}
window.__hammerUse = function (S) {
  try {
    if (!__hasHammer(S)) return;
    const v = window.__hammerLeft(S) - 1, ev = (S?.game || window.__DED_GAME)?.events;
    if (v <= 0) {
      __hmBreak(S);
      S?.audioRef?.play?.("sfx-event-refuse");
      setTimeout(() => ev?.emit("ui:banner", __L3("⚒ O MARTELO DE FORJADOR QUEBROU · compre outro no Ferreiro (não tem conserto)", "⚒ THE FORGER'S HAMMER BROKE · buy a new one from the Blacksmith (it can't be repaired)", "⚒ EL MARTILLO DE FORJADOR SE ROMPIÓ · compra otro al Herrero (no tiene reparación)"), "#e08a7a"), 1400);
      return;
    }
    localStorage.setItem(__hmKey(S), String(v));
    setTimeout(() => ev?.emit("ui:banner", __L3(`⚒ Martelo de Forjador: ${v} uso(s) restante(s)`, `⚒ Forger's Hammer: ${v} use(s) left`, `⚒ Martillo de Forjador: ${v} uso(s) restante(s)`), v <= 2 ? "#e8a050" : "#f2d9a0"), 1400);
  } catch (e) {}
};
try {
  Object.defineProperty(Ms.HAMMER, "desc", { configurable: !0, get() {
    let left = 0; try { const G = window.__DED_GAME; left = __hasHammer({ game: G }) ? window.__hammerLeft({ game: G }) : 0 } catch (e) {}
    return left ? __L3(`Libera a forja · restam ${left} de ${__HM_MAX} usos (quebra no fim, sem conserto)`, `Unlocks the forge · ${left} of ${__HM_MAX} uses left (breaks at the end, no repair)`, `Desbloquea la forja · quedan ${left} de ${__HM_MAX} usos (se rompe, sin reparación)`)
      : __L3(`Libera a forja · aguenta ${__HM_MAX} forjas e quebra (sem conserto)`, `Unlocks the forge · lasts ${__HM_MAX} forges, then breaks (no repair)`, `Desbloquea la forja · aguanta ${__HM_MAX} forjas y se rompe (sin reparación)`);
  } });
} catch (e) {}
