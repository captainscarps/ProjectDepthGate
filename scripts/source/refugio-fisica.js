/* ══ Refúgio: física pelos objetos, herborista e mercadorias do vendedor (p216.108) ══════════════════════════════
   • Física: a colisão do lado de fora era uma grade desenhada à mão que não batia com o que está na tela — o herói
     esbarrava no vazio e atravessava objetos. Agora, depois que todos os módulos montam o Refúgio, a grade é refeita:
     fica o que é terreno de verdade (borda do mapa, muro do topo, água do mar e do laguinho — lida no próprio chão —,
     o píer e o cercado dos pets) e cada objeto sólido ganha o "pé" dele (tronco da árvore, base da casa, do caixote,
     da barraca…). Personagens, enfeites de chão e luzes não bloqueiam.
   • Herborista: ficava atrás do caldeirão (mesmo lugar, caldeirão desenhado por cima); agora fica à esquerda e à frente.
   • Vendedor: além das melhorias, vende peças comuns e básicas que a classe pode usar, sorteadas a cada visita
     (campanha: ouro da campanha ●; modo infinito: fragmentos ◆). A peça vai para a mochila do save.
   Arte nova da barraca e do santuário: scripts/gerar_refugio_objetos.py (PixelLab). */
const __RFX = {
  L3(pt, en, es) { return typeof __L3 === "function" ? __L3(pt, en, es) : pt },
  /* pé de cada objeto: [meia-largura (fração da largura ou px), altura (fração da altura ou px), recuo do chão] */
  foot(key, fr, w, h) {
    const f = String(fr || "");
    if (key === "vh-props") {
      if (/^(tree|pine)/.test(f)) return [7, 8, 1];
      if (/^bush/.test(f)) return [w * .3, 7, 1];
      if (f === "cabin") return [w * .42, h * .5, 4];
      if (f === "ring" || f === "rope" || f === "chimney") return null;
      if (f === "dummy") return [6, 6, 1];
      return [w * .4, Math.max(6, Math.min(16, h * .35)), 1];
    }
    if (key === "vh-house") return "house";
    if (key === "vh-herb-hut") return [w * .45, h * .42, 3];
    if (key === "vh-herb-bed") return [w * .47, h * .72, 2];
    if (key === "hub-stall") return [w * .42, Math.min(22, h * .3), 1];
    if (key === "hub-shrine") return [w * .4, Math.min(18, h * .25), 1];
    if (key === "hub-portal") return w > 70 ? [14, 7, 2] : null;   // o portal da vila; o das cavernas é só luz
    if (key === "hub-campfire" || key === "pet-kennel" || key === "vh-cart" || key === "vh-table" || key === "vh-herb-shelf" || key === "vh-herb-caul" || key === "vh-hunter-tans")
      return [w * .38, Math.max(6, Math.min(14, h * .3)), 1];
    if (key === "rf-deco") return /well|crate|stump|bench|log|mush/.test(f) ? [w * .4, Math.max(5, Math.min(12, h * .3)), 1] : null;
    return null;
  },
};
function __rfxRebuild(H) {
  const M = H.M; if (!M?.coll || H.area === "in" && !H.__rfxOut) { }
  const g = M.g, GH = M.coll.length, GW = M.coll[0].length, old = M.coll;
  // cor do chão (o laguinho e o mar estão pintados nele)
  let px = null;
  try { const fl = H.textures.get(H.textures.exists("rf-ground") ? "rf-ground" : "vh-ground").getSourceImage(); let cx = fl.getContext?.("2d");
    if (!cx) { const cv = document.createElement("canvas"); cv.width = fl.width; cv.height = fl.height; cx = cv.getContext("2d"); cx.drawImage(fl, 0, 0) }
    const d = cx.getImageData(0, 0, M.w, M.h).data; px = (x, y) => { const i = ((y | 0) * M.w + (x | 0)) * 4; return [d[i], d[i + 1], d[i + 2]] } } catch (e) {}
  const DR = M.dockRect, inDock = (x, y) => DR && x >= DR[0] && x < DR[0] + DR[2] && y >= DR[1] && y < DR[1] + DR[3];
  const PEN = typeof __PEN !== "undefined" ? __PEN : null, inPen = (x, y) => PEN && x >= PEN.x - 16 && x < PEN.x + PEN.w + 16 && y >= PEN.y - 16 && y < PEN.y + PEN.h + 2;
  const water = (x, y) => { if (!px) return !1; let n = 0; for (const [dx, dy] of [[0, 0], [-2, -2], [2, 2], [-2, 2], [2, -2]]) { const [r, gg, b] = px(x + dx, y + dy); b > r + 28 && b >= gg - 6 && n++ } return n >= 3 };
  const C = [];
  for (let y = 0; y < GH; y++) { let row = ""; for (let x = 0; x < GW; x++) {
    const cx = x * g + g / 2, cy = y * g + g / 2;
    row += old[y][x] === "1" && (x < 2 || x >= GW - 2 || y < 14 || inDock(cx, cy) || inPen(cx, cy) || water(cx, cy)) ? "1" : "0";
  } C.push(row) }
  const set = (x0, y0, x1, y1) => { for (let gy = Math.max(0, Math.floor(y0 / g)); gy <= Math.min(GH - 1, Math.floor((y1 - 1) / g)); gy++) {
    let r = C[gy]; for (let gx = Math.max(0, Math.floor(x0 / g)); gx <= Math.min(GW - 1, Math.floor((x1 - 1) / g)); gx++) {
      const ox = Math.max(x0, gx * g), oy = Math.max(y0, gy * g), ow = Math.min(x1, gx * g + g) - ox, oh = Math.min(y1, gy * g + g) - oy;
      ow > 2.5 && oh > 2.5 && (r = r.slice(0, gx) + "1" + r.slice(gx + 1)) } C[gy] = r } };
  const objs = [];
  const walk = (o, ox, oy) => { if (!o || o.visible === !1) return; if (o.type === "Container") { for (const c of o.list) walk(c, ox + o.x, oy + o.y); return }
    if (!o.texture || (o.type !== "Image" && o.type !== "Sprite")) return; if ((o.depth ?? 0) < 0 || o.alpha < .3) return; objs.push([o, ox + o.x, oy + o.y]) };
  for (const o of H.children.list) walk(o, 0, 0);
  for (const [o, x, y] of objs) {
    if (inDock(x, y) || inPen(x, y)) continue;
    const w = o.displayWidth, h = o.displayHeight, F = __RFX.foot(o.texture.key, o.frame?.name, w, h); if (!F) continue;
    if (F === "house") { const Hs = M.house; set(Hs.x + 4, Hs.y + Hs.h * .38, Hs.x + Hs.w - 4, Hs.base); continue }
    const fy = y + (1 - (o.originY ?? .5)) * h - F[2], fx = x + (.5 - (o.originX ?? .5)) * w;
    set(fx - F[0], fy - F[1], fx + F[0], fy);
  }
  for (const [lx, ly] of M.lamps || []) set(lx - 3, ly - 4, lx + 3, ly);
  // pontos de uso continuam alcançáveis: nada bloqueia o próprio ponto de interação (porta, portal, placa…)
  for (const it of H.inters || []) if (it.area === "out" && (it.id === "door" || it.id === "cabin" || it.id === "portal")) { const gx = Math.floor(it.x / g), gy = Math.floor((it.y + 2) / g); C[gy] && (C[gy] = C[gy].slice(0, gx) + "0" + C[gy].slice(gx + 1)) }
  H.M = Object.assign({}, M, { coll: C });
  H.__rfxDone = 1;
}
{
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { const H = this; __rfxRebuild(H); H.time.delayedCall(350, () => { try { __rfxRebuild(H) } catch (e) { console.warn("[refugio-fisica]", e) } }) } catch (e) { console.warn("[refugio-fisica]", e) }
    try { __rfxVendor(this) } catch (e) { console.warn("[vendedor]", e) }
    return r;
  };
  /* herborista à esquerda e à frente do caldeirão (antes ficava escondida atrás dele) */
  const HB = Fl.prototype.__herbInit;
  if (HB) Fl.prototype.__herbInit = function () {
    const r = HB.apply(this, arguments);
    try { const B = this.M.herb, h = this.herb; if (h?.s && B) { h.s.setPosition(B.boiler[0] - 27, B.boiler[1] + 7).setDepth(B.boiler[1] + 7) } } catch (e) {}
    return r;
  };
}
/* ─── Vendedor: mercadorias básicas sorteadas a cada visita ─── */
function __rfxStock(H) {
  if (H.__vdStock) return H.__vdStock;
  const cid = H.classDef?.id || "WARRIOR", seen = new Set(), pool = [];
  for (const [id, d] of Object.entries(Xt)) {
    if (!d || !["weapon", "armor", "accessory", "shield"].includes(d.type)) continue;
    if (d.minRarity || d.setId || d.uniqueForge || d.encomenda || d.quest || /^(armor_forge|unique_|enc_|dh_)/.test(id) || /não pode ser vendido/.test(d.desc || "")) continue;
    if ((d.value ?? 99) > 30) continue;
    try { if (typeof Ee === "function" && !Ee(cid, d)) continue } catch (e) {}
    pool.push(id);
  }
  const rnd = Math.random, pick = (arr) => arr.splice(Math.floor(rnd() * arr.length), 1)[0], P = pool.slice(), out = [];
  const weapons = P.filter((id) => Xt[id].type === "weapon");
  if (weapons.length) { const w = weapons[Math.floor(rnd() * weapons.length)]; P.splice(P.indexOf(w), 1); out.push(w) }
  while (out.length < 6 && P.length) { const id = pick(P); const s = Xt[id].slot || Xt[id].type; if (seen.has(s) && P.length > 6 - out.length) continue; seen.add(s); out.push(id) }
  let L = null; try { L = new Bh(H) } catch (e) {}
  return (H.__vdStock = out.map((id) => {
    const rar = rnd() < .3 ? "UNCOMMON" : "COMMON", seed = 1 + Math.floor(rnd() * 2147483646), d = Xt[id];
    let it = null; try { it = L ? L.makeItem(id, rar, seed) : null } catch (e) {}
    const gold = Math.round((d.value || 10) * 2 + (rar === "UNCOMMON" ? 45 : 20));
    return { id, rar, seed, it: it || { id, name: d.name, rarity: rar, stats: d.stats || {}, icon: d.icon, type: d.type }, price: H.fromForest ? gold : Math.max(2, Math.round(gold / 9)), sold: !1 };
  }));
}
function __rfxStat(it) {
  const N = { damage: ["DANO", "DMG", "DAÑO"], magicDamage: ["MAGIA", "MAGIC", "MAGIA"], defense: ["DEF", "DEF", "DEF"], maxHp: ["VIDA", "HP", "VIDA"], critChance: ["CRÍT", "CRIT", "CRÍT"], speed: ["VEL", "SPD", "VEL"], maxMana: ["MANA", "MANA", "MANA"], blockChance: ["% BLOQ", "% BLOCK", "% BLOQ"], attackSpeed: ["VEL. ATQ", "ATK SPD", "VEL. ATQ"], maxResource: ["RECURSO", "RESOURCE", "RECURSO"] };
  return Object.entries(it.stats || {}).filter(([, v]) => v).slice(0, 3).map(([k, v]) => `+${v}${k === "critChance" ? "%" : ""}${N[k]?.[0]?.startsWith("%") ? "" : " "}${N[k] ? __RFX.L3(...N[k]) : k}`).join(" · ");
}
function __rfxVendor(H) {
  const v = (H.inters || []).find((o) => o.id === "vendor"); if (!v || v.__vd) return;
  v.__vd = 1; const up0 = v.act;
  v.desc = __RFX.L3("Comprar mercadorias", "Buy goods", "Comprar mercancías");
  v.act = () => __rfxShop(H, up0);
}
function __rfxShop(H, upgrades) {
  const L3 = __RFX.L3, cur = H.fromForest ? "●" : "◆";
  H.closePanel();
  const d = _ / 2, W0 = 420, X0 = d - W0 / 2, Y0 = 34, HH = 286;
  const o = H.add.container(H.__ox || 0, H.__oy || 0).setDepth(9800).setScrollFactor(0).setScale(H.__us || 1);
  const a = H.add.rectangle(d, st / 2, _, st, 328450, .78).setInteractive(), n = H.add.graphics();
  Dt(n, X0, Y0, W0, HH); o.add([a, n]); try { __winSkin(H, o, X0, Y0, W0, HH, 1) && n.clear() } catch (e) {}
  o.add(H.add.text(d, Y0 + 18, L3("VENDEDOR · MERCADORIAS", "VENDOR · GOODS", "VENDEDOR · MERCANCÍAS"), la).setOrigin(.5));
  o.add(H.add.text(d, Y0 + 38, L3("Coisas simples para a estrada. Chega mercadoria nova a cada visita.", "Simple things for the road. New goods every visit.", "Cosas simples para el camino. Mercancía nueva en cada visita."), { ...Le, fontStyle: "italic" }).setOrigin(.5));
  const S = __rfxStock(H);
  H.panelRows = []; H.panelSel = 0; H.__vd = { S, upgrades };
  S.forEach((e, k) => {
    const y = Y0 + 66 + k * 27;
    const ic = H.add.image(X0 + 26, y, "__DEFAULT"); try { __itSet(ic, e.it, 20) } catch (x) {}
    const row = H.add.text(X0 + 42, y, "", { ...ti, backgroundColor: "#241a10", padding: { x: 8, y: 5 }, fixedWidth: W0 - 62 }).setOrigin(0, .5).setInteractive({ useHandCursor: !0 });
    row.on("pointerover", () => { H.panelSel = k; H.refreshPanel() }); row.on("pointerdown", () => { H.panelSel = k; H.panelConfirm() });
    o.add([ic, row]); H.panelRows.push({ id: "__vd" + k, def: { max: 1 }, row, vd: e, ic });
  });
  const ur = H.add.text(d, Y0 + 66 + 6 * 27 + 4, "", { ...ti, backgroundColor: "#241a10", padding: { x: 10, y: 5 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
  ur.on("pointerover", () => { H.panelSel = S.length; H.refreshPanel() }); ur.on("pointerdown", () => { H.panelSel = S.length; H.panelConfirm() });
  o.add(ur); H.panelRows.push({ id: "__vdUp", def: { max: 1 }, row: ur });
  H.panelMsg = H.add.text(d, Y0 + 252, "", { ...Le, color: "#8ae0b0" }).setOrigin(.5);
  const b = H.add.text(d, Y0 + 272, W("hub.back"), { ...ti, color: "#e08a7a" }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
  Gt(b, 16, 12); b.on("pointerdown", () => H.closePanel()); o.add([H.panelMsg, b]);
  H.panel = o; H.refreshPanel();
}
function __rfxBuy(H, e) {
  const L3 = __RFX.L3, item = { id: e.id, rarity: e.rar, seed: e.seed };
  if (H.fromForest) {
    const c = __cData(H); if (!c?.d) return L3("Não achei o seu save.", "Couldn't find your save.", "No encontré tu partida.");
    const P = c.d.player ??= {}; P.items ??= [];
    if ((P.gold ?? 0) < e.price) return L3("Ouro da campanha insuficiente.", "Not enough campaign gold.", "Oro de campaña insuficiente.");
    if (P.items.length >= 20) return L3("Sua mochila está cheia.", "Your bag is full.", "Tu mochila está llena.");
    P.gold -= e.price; P.items.push(item);
    try { localStorage.setItem(Wt("campaign", c.sl), JSON.stringify(c.d)) } catch (x) { return L3("Não deu para salvar.", "Couldn't save.", "No se pudo guardar.") }
  } else {
    let slot = 1; try { slot = Es(H.game) } catch (x) { slot = H.game.registry.get("save:slot") ?? 1 }
    const m = Xe(); if ((m.fragments || 0) < e.price) return W("hub.noFrags");
    const s = Nn(slot); if (!s?.ok) return L3("Comece uma descida antes de comprar.", "Start a descent before buying.", "Empieza un descenso antes de comprar.");
    s.data.player = s.data.player || {}; s.data.player.items = s.data.player.items || [];
    if (s.data.player.items.length >= 20) return L3("Sua mochila está cheia.", "Your bag is full.", "Tu mochila está llena.");
    m.fragments -= e.price; tr(m); s.data.player.items.push(item);
    try { localStorage.setItem(Wt("endless", slot), JSON.stringify(s.data)) } catch (x) {}
  }
  e.sold = !0; return null;
}
{
  const R0 = Fl.prototype.refreshPanel;
  Fl.prototype.refreshPanel = function () {
    if (!this.__vd || !this.panel) return R0.apply(this, arguments);
    try { this.refreshFragments?.() } catch (e) {}
    const L3 = __RFX.L3, cur = this.fromForest ? "●" : "◆";
    this.panelRows.forEach((p, k) => {
      const on = k === this.panelSel;
      if (p.vd) {
        const e = p.vd, nm = (typeof _t === "function" ? _t(e.it) : e.it.name) || e.id, rc = bt?.[e.rar]?.color;
        p.row.setText(e.sold ? `${nm} — ${L3("VENDIDO", "SOLD", "VENDIDO")}` : `${nm}   ${__rfxStat(e.it)}   [${e.price}${cur}]`);
        p.row.setColor(e.sold ? "#6b5f4a" : on ? "#ffd24a" : rc != null ? "#" + rc.toString(16).padStart(6, "0") : "#e8dcc0");
        p.ic.setAlpha(e.sold ? .35 : 1);
      } else p.row.setText(`⚒ ${L3("Melhorias do vendedor", "Vendor upgrades", "Mejoras del vendedor")} ▸`).setColor(on ? "#ffd24a" : "#e8dcc0");
      p.row.setBackgroundColor(on ? "#3a2f1e" : "#241a10");
    });
  };
  const C0 = Fl.prototype.panelConfirm;
  Fl.prototype.panelConfirm = function () {
    if (!this.__vd || !this.panel) return C0.apply(this, arguments);
    const p = this.panelRows?.[this.panelSel]; if (!p) return;
    if (!p.vd) { const up = this.__vd.upgrades; this.__vd = null; up?.(); return }
    if (p.vd.sold) return;
    const err = __rfxBuy(this, p.vd), L3 = __RFX.L3;
    if (err) { this.game.audioEngine?.sfx("sfx-event-refuse"); this.panelMsg.setText(err).setColor("#e08a7a") }
    else { this.game.audioEngine?.sfx("sfx-item-pickup"); this.panelMsg.setText(L3(`${_t(p.vd.it)} foi para a sua mochila.`, `${_t(p.vd.it)} went into your bag.`, `${_t(p.vd.it)} fue a tu mochila.`)).setColor("#8ae0b0") }
    this.refreshPanel();
  };
  const X0 = Fl.prototype.closePanel;
  Fl.prototype.closePanel = function () { this.__vd = null; return X0.apply(this, arguments) };
}
window.__dgRFX = { rebuild: __rfxRebuild, stock: __rfxStock };
