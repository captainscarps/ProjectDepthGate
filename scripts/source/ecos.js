/* ══ Ecos dos amigos no Refúgio (Modo Infinito) ══
   Os heróis dos amigos aparecem no Refúgio como "ecos": não é tempo real — cada amigo publica a vitrine do herói
   (classe, nível, equipamento, recorde) e o Refúgio monta o eco aqui, de corpo inteiro: o mesmo boneco do herói,
   com colisão (esbarra no jogador e nos outros ecos, não atravessa paredes), vestindo o equipamento do amigo
   (lendária tira o capacete e põe capa; peça do ferreiro brilha). Cada eco sai do portal azul e segue uma rotina:
   fogueira, bonecos de treino, pesca no píer, mural, vendedor, santuário, cachorro, passeio.
   Interagir: conversa (diálogo especial quando é o mesmo herói do jogador) → vitrine do amigo → saudar (1x/dia).
   Fonte dos dados: window.__ecoSource(H) → lista de vitrines (etapa 5: amigos do Supabase). Enquanto não há
   amigos reais, "?ecos=teste" na URL liga 4 amigos de teste (fica salvo; "?ecos=0" desliga).            */
const __ECO_MAX = 6, __ECO_SPEED = 46;
/* pontos de pesca do píer (os mesmos do jogador): onde fica e onde cai a boia */
const __ECO_FISH = [{ at: [720, 920], w: [722, 990] }, { at: [632, 1000], w: [604, 1064] }, { at: [906, 872], w: [956, 912] }];
const __ECO_KEY_TEST = "depthgate:ecoTest", __ECO_KEY_GREET = "depthgate:ecoGreet", __ECO_KEY_CACHE = "depthgate:ecoCache";
try {
  const q = new URLSearchParams(location.search).get("ecos");
  if (q === "teste" || q === "1") localStorage.setItem(__ECO_KEY_TEST, "1");
  else if (q === "0") localStorage.removeItem(__ECO_KEY_TEST);
} catch (e) {}
const __ecoTestOn = () => { try { return localStorage.getItem(__ECO_KEY_TEST) === "1" } catch (e) { return !1 } };
function __ecoTestList(me) {
  const alt = (a, b) => (a === me ? b : a);
  const st = (cid, r) => ({ id: xh[cid] || "sword", rarity: r });
  return [
    { uid: "teste-1", name: "Lucas", classId: me, level: 24, maxDepth: 31, score: 52840,
      equipment: { weapon: st(me, "LEGENDARY"), armor: { id: "ancient_dragon_armor", rarity: "LEGENDARY" } } },
    { uid: "teste-2", name: "Bia", classId: alt("ARCHER", "ROGUE"), level: 17, maxDepth: 19, score: 28410,
      equipment: { weapon: st(alt("ARCHER", "ROGUE"), "EPIC"), armor: { id: "armor_forge_aurora", rarity: "UNIQUE" } } },
    { uid: "teste-3", name: "Thiago", classId: alt("MAGE", "NECROMANCER"), level: 12, maxDepth: 11, score: 14200,
      equipment: { weapon: st(alt("MAGE", "NECROMANCER"), "RARE"), armor: { id: "dragon_armor", rarity: "RARE" } } },
    { uid: "teste-4", name: "Carol", classId: alt("BERSERKER", "DRUID"), level: 20, maxDepth: 24, score: 33900,
      equipment: { weapon: st(alt("BERSERKER", "DRUID"), "EPIC"), armor: { id: "armor_forge_brasa", rarity: "UNIQUE" } } }];
}
function __ecoList(H, me) {
  let L = null;
  try { if (typeof window.__ecoSource === "function") L = window.__ecoSource(H, me) } catch (e) { L = null }
  if (!Array.isArray(L) || !L.length) {
    try { const c = JSON.parse(localStorage.getItem(__ECO_KEY_CACHE) || "null"); if (Array.isArray(c) && c.length) L = c } catch (e) {}
  }
  if ((!Array.isArray(L) || !L.length) && __ecoTestOn()) L = __ecoTestList(me);
  return (Array.isArray(L) ? L : []).filter(d => d && pe[d.classId]).slice(0, __ECO_MAX);
}
const __ecoToday = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` };
const __ecoGreetGet = () => { try { return JSON.parse(localStorage.getItem(__ECO_KEY_GREET) || "{}") || {} } catch (e) { return {} } };
const __ecoHero = cid => (__HN?.[cid] || W(`class.${cid}`) || cid);
const __ecoPor = cid => `hero-${String(cid).toLowerCase()}`;

/* falas — mesmo herói (o jogador encontra outra versão de si) */
function __ecoSameLines(H, e) {
  const L3 = __L3, me = H.classDef.id, hn = __ecoHero(me).toUpperCase(), en = `${hn} · ${e.d.name}`, dep = e.d.maxDepth || 1;
  const P = (t, x = "talk") => ({ name: hn, por: __ecoPor(me), e: x, t }), E = (t, x = "talk") => ({ name: en, por: __ecoPor(me), e: x, t });
  const V = [
    [P(L3("Nossa… parece que os portais trouxeram outras versões minhas.", "Whoa… looks like the portals brought other versions of me.", "Vaya… parece que los portales trajeron otras versiones de mí.")),
     E(L3("Ou foi você que caiu na minha história. Os portais não escolhem lados.", "Or you fell into my story. The portals don't pick sides.", "O fuiste tú quien cayó en mi historia. Los portales no eligen bandos.")),
     P(L3("Então que pelo menos um de nós chegue mais fundo.", "Then at least one of us should go deeper.", "Entonces que al menos uno de nosotros llegue más hondo."))],
    [P(L3("Espera… esse rosto. Essa armadura. Sou eu?", "Wait… that face. That armor. Is that me?", "Espera… esa cara. Esa armadura. ¿Soy yo?")),
     E(L3(`Uma versão que já desceu ${dep} profundidades. Ainda tem muito abismo pra você.`, `A version that has already gone ${dep} depths down. There's plenty of abyss left for you.`, `Una versión que ya bajó ${dep} profundidades. Aún te queda mucho abismo.`)),
     P(L3("Vamos ver quem volta primeiro.", "Let's see who comes back first.", "Veamos quién vuelve primero."))],
    [E(L3("Já te vi antes… num reflexo do Templo.", "I've seen you before… in a reflection at the Temple.", "Ya te vi antes… en un reflejo del Templo.")),
     P(L3("Se até os meus ecos param no Refúgio, o abismo deve estar cansado de nós.", "If even my echoes end up at the Refuge, the abyss must be tired of us.", "Si hasta mis ecos paran en el Refugio, el abismo debe estar harto de nosotros.")),
     E(L3("Cansado não. Com fome.", "Not tired. Hungry.", "Harto no. Hambriento."))]];
  return V[(e.talks++) % V.length];
}
/* falas — herói diferente: cada herói tem o seu jeito */
const __ECO_VOICE = {
  WARRIOR: ["Draven, de Valdrak. O escudo aguenta — e eu também.", "Draven, of Valdrak. The shield holds — and so do I.", "Draven, de Valdrak. El escudo aguanta — y yo también."],
  ARCHER: ["Hayato. Daqui do Refúgio eu acerto qualquer boneco de olhos fechados.", "Hayato. From here I can hit any dummy with my eyes closed.", "Hayato. Desde aquí acierto cualquier muñeco con los ojos cerrados."],
  MAGE: ["Arthelia. As runas deste lugar ainda zumbem… você ouve?", "Arthelia. The runes here still hum… can you hear them?", "Arthelia. Las runas de este lugar aún zumban… ¿las oyes?"],
  ROGUE: ["Seris. Relaxa, não vou mexer na sua bolsa. Hoje.", "Seris. Relax, I won't touch your bag. Today.", "Seris. Tranquilo, no tocaré tu bolsa. Hoy."],
  NECROMANCER: ["Valthor. Os mortos do abismo mandam lembranças.", "Valthor. The dead of the abyss send their regards.", "Valthor. Los muertos del abismo mandan saludos."],
  SHAMAN: ["Araí. Os espíritos me trouxeram até aqui pra te ver de perto.", "Araí. The spirits brought me here to see you up close.", "Araí. Los espíritus me trajeron para verte de cerca."],
  BERSERKER: ["Akihiro. Um corte limpo vale mais que cem golpes.", "Akihiro. One clean cut is worth a hundred blows.", "Akihiro. Un corte limpio vale más que cien golpes."],
  HUNTER: ["Kael. Meu lobo farejou você assim que eu saí do portal.", "Kael. My wolf smelled you the moment I left the portal.", "Kael. Mi lobo te olió en cuanto salí del portal."],
  DRUID: ["Tharion. Até as raízes do Refúgio sentem quando um eco chega.", "Tharion. Even the Refuge's roots feel when an echo arrives.", "Tharion. Hasta las raíces del Refugio sienten cuando llega un eco."]};
function __ecoOtherLines(H, e) {
  const L3 = __L3, cid = e.d.classId, en = `${__ecoHero(cid).toUpperCase()} · ${e.d.name}`, P = t => ({ name: en, por: __ecoPor(cid), e: "talk", t });
  const v = __ECO_VOICE[cid] || __ECO_VOICE.WARRIOR, out = [P(L3(v[0], v[1], v[2]))];
  out.push(P(L3(`Sou o eco que ${e.d.name} levou até a profundidade ${e.d.maxDepth || 1}. Cada queda deixa um pedaço da gente aqui.`,
    `I'm the echo ${e.d.name} took down to depth ${e.d.maxDepth || 1}. Every fall leaves a piece of us here.`,
    `Soy el eco que ${e.d.name} llevó hasta la profundidad ${e.d.maxDepth || 1}. Cada caída deja un pedazo de nosotros aquí.`)));
  const g = __ecoBest(e);
  if (g) out.push(P(g.forge ? L3(`Reparou na ${g.name}? Saiu da forja do ferreiro aqui do Refúgio.`, `Noticed the ${g.name}? It came from the Refuge blacksmith's forge.`, `¿Viste la ${g.name}? Salió de la forja del herrero del Refugio.`)
    : L3(`Reparou na ${g.name}? Achei nas Profundezas — quanto mais fundo, melhor o saque.`, `Noticed the ${g.name}? Found it in the Depths — the deeper, the better the loot.`, `¿Viste la ${g.name}? La encontré en las Profundidades — cuanto más hondo, mejor botín.`)));
  return out;
}
/* a peça que mais chama atenção (lendária / relíquia / do ferreiro) */
function __ecoBest(e) {
  let best = null, bo = -1;
  for (const it of Object.values(e.items || {})) {
    if (!it) continue;
    const forge = !!(window.__isForgeItem?.(it)), o = forge ? 9 : (bt[it.rarity]?.order ?? 0);
    if (o > bo && (forge || o >= 4)) { bo = o; best = { it, forge, name: (typeof _t === "function" ? _t(it) : it.name) || it.id } }
  }
  return best;
}

/* caminho só pela vila de fora (mesma grade do herói) */
function __ecoPath(H, sx0, sy0, tx, ty) {
  const M = H.M, g = M.g, rows = M.coll, GH = rows.length, GW = rows[0].length;
  const solid = (x, y) => { const gx = Math.floor(x / g), gy = Math.floor(y / g), r = rows[gy]; return !r || gx < 0 || gx >= r.length || r[gx] === "1" };
  const free = (x, y) => !solid(x - 3.5, y - 1) && !solid(x + 3.5, y - 1) && !solid(x - 3.5, y - 5) && !solid(x + 3.5, y - 5);
  const cell = (x, y) => [Math.floor(x / g), Math.floor((y - 3) / g)], ok = (cx, cy) => cy >= 0 && cy < GH && cx >= 0 && cx < GW && rows[cy][cx] !== "1" && free(cx * g + g / 2, cy * g + g / 2 + 3);
  let [sx, sy] = cell(sx0, sy0), [ex, ey] = cell(tx, ty);
  const near = (cx0, cy0) => { if (ok(cx0, cy0)) return [cx0, cy0]; let b = null, bd = 1e9; for (let r = 1; r < 10 && !b; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const cx = cx0 + dx, cy = cy0 + dy; if (ok(cx, cy)) { const d = dx * dx + dy * dy; d < bd && (bd = d, b = [cx, cy]) } } return b };
  const s2 = near(sx, sy), e2 = near(ex, ey); if (!s2 || !e2) return null;[sx, sy] = s2;[ex, ey] = e2;
  const K = (x, y) => y * GW + x, open = [[sx, sy, 0, Math.hypot(ex - sx, ey - sy)]], came = new Map, gs = new Map([[K(sx, sy), 0]]), closed = new Set;
  let n = 0, found = !1;
  while (open.length && n++ < 6000) {
    let bi = 0; for (let i = 1; i < open.length; i++) open[i][3] < open[bi][3] && (bi = i);
    const [x, y] = open.splice(bi, 1)[0], kk = K(x, y); if (closed.has(kk)) continue; closed.add(kk);
    if (x === ex && y === ey) { found = !0; break }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
      if (!ok(nx, ny) || dx && dy && (!ok(x + dx, y) || !ok(x, y + dy))) continue;
      const ng = gs.get(kk) + (dx && dy ? 1.414 : 1), k = K(nx, ny);
      if (ng < (gs.get(k) ?? 1e9)) { gs.set(k, ng); came.set(k, [x, y]); open.push([nx, ny, ng, ng + Math.hypot(ex - nx, ey - ny)]) }
    }
  }
  if (!found) return null;
  const P = []; let c = [ex, ey];
  while (c && !(c[0] === sx && c[1] === sy)) { P.unshift([c[0] * g + g / 2, c[1] * g + g / 2 + 3]); c = came.get(K(c[0], c[1])) }
  return P.filter((p, i) => i % 2 === 0 || i === P.length - 1);
}

/* atividades: para onde o eco vai, de que lado olha e o que faz lá */
function __ecoActs(H) {
  const S = H.M.spots, A = [
    { k: "fire", w: 3, pos: n => { const a = Math.PI * (.15 + .7 * ((n * .37) % 1)); return [S.campfire[0] + Math.cos(a) * 30, S.campfire[1] + 4 + Math.sin(a) * 16] }, look: () => S.campfire, dwell: [7, 12] },
    { k: "train", w: 3, dwell: [6, 9] },
    { k: "fish", w: 2, pos: n => __ECO_FISH[n % __ECO_FISH.length].at, bob: n => __ECO_FISH[n % __ECO_FISH.length].w, face: { x: 0, y: 1 }, dwell: [10, 16] },
    { k: "board", w: 1, pos: () => [S.board[0] + 14, S.board[1] + 20], face: { x: 0, y: -1 }, dwell: [4, 6] },
    { k: "vendor", w: 1, pos: () => [S.vendor[0] - 18, S.vendor[1] + 20], face: { x: 0, y: -1 }, dwell: [4, 6] },
    { k: "shrine", w: 1, pos: () => [S.shrine[0], S.shrine[1] + 18], face: { x: 0, y: -1 }, dwell: [5, 7] },
    { k: "dog", w: 1, dwell: [3, 4] },
    { k: "walk", w: 2, dwell: [1, 3] }];
  return A;
}

{
  const C0 = Fl.prototype.create;
  Fl.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try { this.__ecosInit() } catch (e) { console.warn("[ecos]", e) }
    try { this.__ecoSocial() } catch (e) { console.warn("[ecos] social", e) }
    return r;
  };
  const U0 = Fl.prototype.update;
  Fl.prototype.update = function (t, dt) {
    const r = U0.apply(this, arguments);
    try { this.__ecosTick(Math.min((dt || 16) / 1e3, .05)) } catch (e) { console.warn("[ecos]", e); this.ecos = [] }
    return r;
  };
}

Fl.prototype.__ecosInit = function () {
  this.ecos = [];
  if (this.fromForest) return;                       // só no Refúgio do Modo Infinito
  const me = this.classDef?.id || "WARRIOR", list = __ecoList(this, me);
  if (!list.length) return;
  this.__ecoPlanned = list.length;
  const S = this.M.spots, L = new Bh(this);
  list.forEach((d, k) => this.time.delayedCall(900 + k * 1400, () => { try { this.__ecoSpawn(d, k, L) } catch (e) { console.warn("[ecos] spawn", e) } }));
  // o herói da história com a mesma classe de um eco sai de cena (não ficam dois Dravens)
  const cls = new Set(list.map(d => d.classId));
  for (const h of this.heroes || []) {
    if (!cls.has(h.id)) continue;
    h.hidden = !0; h.rig.container.setVisible(!1);
    const nm = (__HN[h.id] ?? W(`class.${h.id}`)).toUpperCase();
    for (const lb of this.labels) if (lb.text === nm && Math.abs(lb.x - h.x) < 4) { lb.setVisible(!1); lb.x = -9999 }
    this.inters = this.inters.filter(o => o.id !== "hero-" + h.id);
  }
};

/* amigos de verdade: resgata saudações recebidas, publica a vitrine e atualiza a lista em segundo plano */
Fl.prototype.__ecoSocial = function () {
  if (this.fromForest) return;
  const F = window.DGFriends; if (!F) return;
  try { F.trackBest(); F.publish?.().catch(() => {}) } catch (e) {}
  F.claimGreetings?.().then(list => {
    if (!list?.length || !this.sys?.isActive?.()) return;
    const n = list.reduce((s, x) => s + (x.n || 0), 0); if (!n) return;
    try { const m = Xe(); m.fragments = (m.fragments || 0) + 5 * n; m.totalEarned = (m.totalEarned || 0) + 5 * n; tr(m); this.meta = m; this.fragText?.setText?.(`◆ ${m.fragments}`) } catch (e) {}
    const who = list.map(x => x.from_name).slice(0, 3).join(", ") + (list.length > 3 ? "…" : "");
    this.time.delayedCall(1200, () => this.__ecoBanner(__L3(`${who} te saudou no Refúgio · +${5 * n} fragmentos`, `${who} greeted you at the Refuge · +${5 * n} fragments`, `${who} te saludó en el Refugio · +${5 * n} fragmentos`)));
    this.game.audioEngine?.sfx?.("sfx-chest-open");
  }).catch(() => {});
  F.refresh?.().catch(() => {});
};
/* a lista de amigos chegou depois do Refúgio abrir: os ecos entram agora */
window.addEventListener("depthgate:friends", () => {
  try {
    const H = window.__DED_GAME?.scene?.getScene("Hub");
    if (H?.sys?.isActive?.() && !H.fromForest && !(H.ecos || []).length && !H.__ecoPlanned) H.__ecosInit();
  } catch (e) {}
});

Fl.prototype.__ecoSpawn = function (d, k, L) {
  if (!this.sys?.isActive?.()) return;
  const S = this.M.spots, x = S.portal[0] + (k % 2 ? 10 : -10), y = S.portal[1] + 12, L3 = __L3;
  const rig = new Qe(this, pe[d.classId], { x, y, scale: .6, isPreview: !0 });
  const items = {};
  for (const [slot, v] of Object.entries(d.equipment || {})) { try { items[slot] = v ? L.makeItem(v.id, v.rarity || "COMMON", v.seed ?? 0) : null } catch (e) { items[slot] = null } }
  try { rig.refreshEquipment({ equipment: items, items: [] }) } catch (e) {}
  rig.container.setDepth(y).setAlpha(0);
  this.tweens.add({ targets: rig.container, alpha: 1, duration: 500 });
  { const b = this.add.image(x, y - 16, "light").setBlendMode(j.BlendModes.ADD).setTint(10125264).setScale(.2).setAlpha(.9).setDepth(y + 2); this.tweens.add({ targets: b, scale: .7, alpha: 0, duration: 700, onComplete: () => b.destroy() }) }
  this.__sparks?.(x, y - 14, 14, 10125264);
  this.game.audioEngine?.sfx?.("sfx-ui-open");
  const hn = __ecoHero(d.classId).toUpperCase(), col = __clsCol?.[d.classId] ?? "#e8c873";
  const lab = this.add.text(x, y - 36, hn, { ...Le, fontSize: "8px", color: col, stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.62).setDepth(9100);
  const sub = this.add.text(x, y - 30, L3(`eco de ${d.name} · Nv ${d.level ?? "?"}`, `${d.name}'s echo · Lv ${d.level ?? "?"}`, `eco de ${d.name} · Nv ${d.level ?? "?"}`), { ...Le, fontSize: "7px", color: "#c9b8ff", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.62).setDepth(9100);
  const e = { d, k, x, y, rig, lab, sub, items, face: { x: 0, y: 1 }, body: { velocity: { x: 0, y: 0 } }, path: null, act: null, t: 1.2, state: "arrive", talks: 0, near: 0, wait: 0, stuck: 0, line: null };
  this.ecos.push(e);
  this.inters.push({ area: "out", id: "eco-" + (d.uid || k), x, y, ay: y + 14, r: 26, dyn: () => ({ x: e.x, y: e.y }), label: `${hn} · ${d.name}`, desc: L3("Conversar", "Talk", "Hablar"), act: () => this.__ecoTalk(e) });
};

Fl.prototype.__ecoPick = function (e) {
  const A = __ecoActs(this), busy = new Set(this.ecos.filter(o => o !== e && o.act).map(o => o.act.k + ":" + (o.act.slot ?? "")));
  let tot = 0; for (const a of A) tot += a.w; let r = Math.random() * tot, a = A[A.length - 1];
  for (const x of A) { if ((r -= x.w) <= 0) { a = x; break } }
  if (e.act?.k === a.k && a.k !== "walk") a = A[A.length - 1];
  const S = this.M.spots, act = { k: a.k, dwell: a.dwell[0] + Math.random() * (a.dwell[1] - a.dwell[0]), face: a.face || null, look: a.look?.() || null };
  if (a.k === "train") {
    const free = (this.dummies || []).map((d, i) => i).filter(i => !busy.has("train:" + i));
    const i = free.length ? free[Math.floor(Math.random() * free.length)] : 0, dm = this.dummies?.[i];
    if (!dm) return this.__ecoGo(e, { k: "walk", dwell: 1 }, this.M.dog[Math.floor(Math.random() * this.M.dog.length)]);
    act.slot = i; act.dummy = dm; const side = e.x < dm.x ? -1 : 1;
    return this.__ecoGo(e, act, [dm.x + side * 22, dm.y + 3]);
  }
  if (a.k === "dog") { if (!this.dog) return this.__ecoGo(e, { k: "walk", dwell: 1 }, this.M.dog[0]); act.dogRef = !0; return this.__ecoGo(e, act, [this.dog.x + 16, this.dog.y + 4]) }
  if (a.k === "walk") return this.__ecoGo(e, act, this.M.dog[Math.floor(Math.random() * this.M.dog.length)]);
  let slot = 0; while (busy.has(a.k + ":" + slot) && slot < 5) slot++;
  if (a.k === "fish") {   // um eco por ponto, e nunca no ponto onde o jogador está
    const ok = __ECO_FISH.map((f, i) => i).filter(i => !busy.has("fish:" + i) && Math.hypot(this.playerX - __ECO_FISH[i].at[0], this.playerY - __ECO_FISH[i].at[1]) > 30);
    if (!ok.length) return this.__ecoGo(e, { k: "walk", dwell: 1 }, this.M.dog[Math.floor(Math.random() * this.M.dog.length)]);
    slot = ok[Math.floor(Math.random() * ok.length)]; act.slot = slot; act.bob = a.bob(slot);
    return this.__ecoGo(e, act, a.pos(slot));
  }
  act.slot = slot;
  return this.__ecoGo(e, act, a.pos(slot + e.k));
};
Fl.prototype.__ecoGo = function (e, act, to) {
  e.act = act; e.path = __ecoPath(this, e.x, e.y, to[0], to[1]); e.state = e.path?.length ? "walk" : "do"; e.t = act.dwell; e.stuck = 0;
  if (!e.path?.length && act.k !== "walk") { e.act = { k: "walk", dwell: 1 }; e.t = 1; e.state = "do" }
};
/* o eco esbarra: não entra no jogador nem em outro eco */
Fl.prototype.__ecoBlocked = function (e, nx, ny) {
  if (this.area === "out" && Math.hypot(nx - this.playerX, (ny - this.playerY) * 1.6) < 11 && Math.hypot(nx - this.playerX, ny - this.playerY) < Math.hypot(e.x - this.playerX, e.y - this.playerY)) return !0;
  for (const o of this.ecos) if (o !== e && Math.hypot(nx - o.x, (ny - o.y) * 1.6) < 10 && Math.hypot(nx - o.x, ny - o.y) < Math.hypot(e.x - o.x, e.y - o.y)) return !0;
  return !1;
};
/* o jogador também esbarra nos ecos */
Fl.prototype.__pfree = function (x, y) {
  if (!this.__free(x, y)) return !1;
  if (this.area !== "out" || !this.ecos?.length) return !0;
  for (const o of this.ecos) if (Math.hypot(x - o.x, (y - o.y) * 1.6) < 10 && Math.hypot(x - o.x, y - o.y) < Math.hypot(this.playerX - o.x, this.playerY - o.y)) return !1;
  return !0;
};

Fl.prototype.__ecosTick = function (dt) {
  if (!this.ecos?.length) return;
  for (const e of this.ecos) {
    let vx = 0, vy = 0;
    const dP = Math.hypot(this.playerX - e.x, this.playerY - e.y), playerNear = this.area === "out" && dP < 52;
    if (e.state === "talk") { /* parado conversando */ }
    else if (e.state === "walk" && e.path?.length) {
      const [tx, ty] = e.path[0], dx = tx - e.x, dy = ty - e.y, dd = Math.hypot(dx, dy);
      if (dd < 2.5) { e.path.shift(); if (!e.path.length) { e.state = "do"; this.__ecoArrive(e) } }
      else {
        const sx = dx / dd * __ECO_SPEED * dt, sy = dy / dd * __ECO_SPEED * dt;
        if (this.__ecoBlocked(e, e.x + sx, e.y + sy)) { e.wait += dt; if (e.wait > 2.4) { e.wait = 0; this.__ecoPick(e) } }
        else { e.wait = 0; e.x += sx; e.y += sy; vx = dx / dd; vy = dy / dd; Math.abs(vx) > Math.abs(vy) ? e.face = { x: Math.sign(vx), y: 0 } : e.face = { x: 0, y: Math.sign(vy) } }
      }
    } else if (e.state === "arrive") { e.t -= dt; if (e.t <= 0) this.__ecoPick(e) }
    else {
      e.t -= dt;
      this.__ecoDoing(e, dt, playerNear);
      if (e.t <= 0) { this.__ecoLeave(e); this.__ecoPick(e) }
    }
    // chega perto: o eco olha pra você; se você fica do lado, ele faz um gesto
    if (playerNear && e.state !== "walk") {
      const dx = this.playerX - e.x, dy = this.playerY - e.y;
      if (!e.act || !["train", "fish"].includes(e.act.k) || e.state === "talk") e.face = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      e.near += dt;
      if (e.near > 2.6 && e.state !== "talk") { e.near = -6; this.__ecoGesture(e) }
    } else e.near = Math.max(0, e.near - dt);
    e.body.velocity.x = vx * __ECO_SPEED; e.body.velocity.y = vy * __ECO_SPEED;
    e.rig.container.setPosition(e.x, e.y).setDepth(e.y);
    e.rig.update(dt, { x: e.x, y: e.y, facing: e.face, body: e.body, dead: !1, invuln: 0 });
    e.lab.setPosition(e.x, e.y - 27); e.sub.setPosition(e.x, e.y - 22);
    const show = this.area === "out" && !this.panel;
    e.lab.setVisible(show).setAlpha(dP < 30 ? .35 : .95); e.sub.setVisible(show && dP < 140).setAlpha(dP < 30 ? .35 : .9);
    if (e.line) this.__ecoLine(e);
  }
};
Fl.prototype.__ecoArrive = function (e) {
  const a = e.act; if (!a) return;
  if (a.face) e.face = a.face;
  if (a.look) { const dx = a.look[0] - e.x, dy = a.look[1] - e.y; e.face = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) } }
  if (a.dummy) { const dx = a.dummy.x - e.x; e.face = { x: Math.sign(dx) || 1, y: 0 }; a.hitT = .4 }
  if (a.dogRef && this.dog) { const dx = this.dog.x - e.x; e.face = { x: Math.sign(dx) || 1, y: 0 }; this.__ecoHearts(e) }
  if (a.k === "fish") {
    const b = a.bob || [e.x + 8, e.y + 26], dx = b[0] - e.x, dy = b[1] - e.y;
    e.face = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) || 1 };
    e.line = { t: 0, bob: b }; a.biteT = 3 + Math.random() * 5;
  }
  if (a.k === "shrine") { try { e.rig.playCast?.(16771496, 500) } catch (x) {} }
};
Fl.prototype.__ecoDoing = function (e, dt, playerNear) {
  const a = e.act; if (!a) return;
  if (a.k === "train" && a.dummy) {
    a.hitT -= dt;
    if (a.hitT <= 0) {
      a.hitT = .8 + Math.random() * .5;
      const C = pe[e.d.classId], ranged = C?.attackType === "projectile";
      try { ranged ? e.rig.playCast?.(C.basicProjectile?.damageType === "magical" ? 9089279 : 16767334, 240) : e.rig.playAttack() } catch (x) {}
      const dm = a.dummy, lvl = e.d.level || 1;
      this.time.delayedCall(ranged ? 160 : 110, () => {
        if (!dm?.active || !this.sys?.isActive?.()) return;
        const v = Math.round((4 + lvl * 1.6) * (.8 + Math.random() * .5)), crit = Math.random() < .18, r = { v: crit ? Math.round(v * 1.8) : v, crit };
        /* golpe próprio do eco (não conta no combo/dano do jogador) */
        const near = this.area === "out" && Math.hypot(this.playerX - dm.x, this.playerY - dm.y) < 200;
        near && this.game.audioEngine?.sfx?.(crit ? "sfx-heavy-smash" : "sfx-hit");
        this.tweens.killTweensOf(dm); dm.angle = 0;
        this.tweens.add({ targets: dm, angle: { from: Math.sign(dm.x - e.x || 1) * 12, to: 0 }, duration: 420, ease: "Elastic.easeOut" });
        dm.setTint(14535935); this.time.delayedCall(90, () => dm.active && dm.clearTint());
        near && this.__dmgText?.(dm.x, dm.y - 46, r, crit ? "#ffd24a" : "#c9b8ff");
      });
    }
  }
  if (a.k === "fish" && e.line) {
    a.biteT -= dt;
    if (a.biteT <= 0) {
      a.biteT = 99; e.line.bite = .8;
      this.time.delayedCall(800, () => {
        if (!e.line) return;
        const got = Math.random() < .55, [bx, by] = e.line.bob;
        for (let i = 0; i < 6; i++) { const p = this.add.rectangle(bx, by, 2, 2, 13431551).setDepth(by + 1); this.tweens.add({ targets: p, x: bx + Phaser_rand(-8, 8), y: by - 6 - Math.random() * 8, alpha: 0, duration: 500, onComplete: () => p.destroy() }) }
        if (got) { const f = this.add.text(e.x, e.y - 40, "🐟", { fontSize: "10px" }).setOrigin(.5).setDepth(9200).setScale(.8); this.tweens.add({ targets: f, y: f.y - 16, alpha: 0, duration: 1300, onComplete: () => f.destroy() }) }
      });
    }
  }
};
const Phaser_rand = (a, b) => a + Math.random() * (b - a);
Fl.prototype.__ecoLine = function (e) {
  const L = e.line;
  if (!L.g) L.g = this.add.graphics();
  L.t += (this.game.loop.delta || 16) / 1e3;
  const [bx, by0] = L.bob, by = by0 + Math.sin(L.t * 3) * .8 + (L.bite > 0 ? 2.5 : 0);
  if (L.bite > 0) L.bite -= (this.game.loop.delta || 16) / 1e3;
  const hx = e.x + (e.face.x || 0) * 6 + 4, hy = e.y - 18;
  L.g.clear().setDepth(e.y + 1).lineStyle(1, 15263976, .7).beginPath().moveTo(hx, hy).lineTo(hx + 4, hy - 8).lineTo(bx, by).strokePath();
  L.g.fillStyle(16731212, 1).fillCircle(bx, by, 1.6).fillStyle(16777215, 1).fillCircle(bx, by - 1, .9);
};
Fl.prototype.__ecoLeave = function (e) {
  if (e.line) { e.line.g?.destroy(); e.line = null }
};
Fl.prototype.__ecoHearts = function (e) {
  for (let i = 0; i < 3; i++) { const h = this.add.text(e.x + Phaser_rand(-6, 6), e.y - 26, "♥", { fontFamily: "monospace", fontSize: "9px", color: "#ff7a9a" }).setOrigin(.5).setDepth(9500); this.tweens.add({ targets: h, y: h.y - 20 - i * 4, alpha: 0, delay: i * 150, duration: 800, onComplete: () => h.destroy() }) }
};
Fl.prototype.__ecoGesture = function (e) {
  const C = pe[e.d.classId], L3 = __L3;
  try { C?.attackType === "projectile" ? e.rig.playCast?.(__clsCol?.[e.d.classId] ? parseInt(String(__clsCol[e.d.classId]).slice(1), 16) : 16767334, 420) : e.rig.playAttack() } catch (x) {}
  const t = this.add.text(e.x, e.y - 44, ["👋", "✦", "!"][e.k % 3], { ...Le, fontSize: "10px", color: "#ffe9a8", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5).setScale(.8).setDepth(9200);
  this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 1200, delay: 300, onComplete: () => t.destroy() });
};

/* conversa → vitrine */
Fl.prototype.__ecoTalk = function (e) {
  if (this.panel || this.__hubDlgO) return;
  const prev = e.state; e.state = "talk"; this.__ecoLeave(e);
  const dx = this.playerX - e.x, dy = this.playerY - e.y; e.face = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
  const lines = e.d.classId === this.classDef?.id ? __ecoSameLines(this, e) : __ecoOtherLines(this, e);
  this.__hubDlg(lines, () => this.__ecoShow(e, () => { e.state = "do"; e.t = Math.max(e.t, 1.5); if (!e.act) this.__ecoPick(e) }));
};
Fl.prototype.__ecoShow = function (e, done) {
  const L3 = __L3; this.closePanel();
  const d = _ / 2, o = this.add.container(this.__ox, this.__oy).setDepth(9800).setScrollFactor(0).setScale(this.__us), a = this.add.rectangle(d, st / 2, _, st, 328450, .78).setInteractive(), n = this.add.graphics();
  Dt(n, d - 200, 34, 400, 286); o.add([a, n]); __winSkin(this, o, d - 200, 34, 400, 286, 1) && n.clear();
  const D = e.d, cid = D.classId, hn = __ecoHero(cid).toUpperCase();
  o.add(this.add.text(d, 54, `${hn}`, la).setOrigin(.5));
  o.add(this.add.text(d, 74, L3(`Eco de ${D.name} · ${W(`class.${cid}`)} · Nível ${D.level ?? "?"}`, `${D.name}'s echo · ${W(`class.${cid}`)} · Level ${D.level ?? "?"}`, `Eco de ${D.name} · ${W(`class.${cid}`)} · Nivel ${D.level ?? "?"}`), { ...Le, fontSize: "9px", color: "#7a5a9a" }).setOrigin(.5));
  const stats = [[L3("MAIOR PROFUNDIDADE", "DEEPEST DEPTH", "MAYOR PROFUNDIDAD"), String(D.maxDepth ?? "—")], [L3("PONTOS", "SCORE", "PUNTOS"), Number(D.score || 0).toLocaleString("pt-BR")]];
  stats.forEach(([k, v], i) => { const x = d - 90 + i * 180; o.add(this.add.text(x, 92, k, { ...Le, fontSize: "7px", color: "#8a6a3a" }).setOrigin(.5)); o.add(this.add.text(x, 106, v, { ...ti, fontSize: "13px", color: "#3a2a1a" }).setOrigin(.5)) });
  const SL = [["weapon", L3("Arma", "Weapon", "Arma")], ["offhand", L3("Mão secundária", "Off-hand", "Mano secundaria")], ["helmet", L3("Elmo", "Helmet", "Yelmo")], ["armor", L3("Armadura", "Armor", "Armadura")], ["boots", L3("Botas", "Boots", "Botas")], ["accessory1", L3("Acessório", "Accessory", "Accesorio")]];
  let y = 130; const ln = this.add.graphics(); ln.lineStyle(1, 9053216, .5).lineBetween(d - 180, 120, d + 180, 120); o.add(ln);
  const pk = __ecoPor(cid) + "-p-talk"; if (this.textures.exists(pk)) o.add(this.add.image(d - 132, 262, pk).setOrigin(.5, 1).setScale(.62));
  for (const [slot, nm] of SL) {
    const it = e.items?.[slot]; if (!it) continue;
    const forge = !!window.__isForgeItem?.(it), ord = bt[it.rarity]?.order ?? 0, tag = forge ? L3("DO FERREIRO", "BLACKSMITH", "DEL HERRERO") : ord >= 5 ? L3("RELÍQUIA", "RELIC", "RELIQUIA") : ord >= 4 ? L3("LENDÁRIA", "LEGENDARY", "LEGENDARIA") : ((W(`rar.${it.rarity}`) !== `rar.${it.rarity}` ? W(`rar.${it.rarity}`) : bt[it.rarity]?.name) || it.rarity).toUpperCase();
    o.add(this.add.text(d - 62, y, nm, { ...Le, fontSize: "7px", color: "#8a6a3a" }));
    o.add(this.add.text(d - 62, y + 9, (typeof _t === "function" ? _t(it) : it.name) || it.id, { ...Le, fontSize: "9px", color: "#3a2a1a", fontStyle: ord >= 4 || forge ? "bold" : "normal" }));
    o.add(this.add.text(d + 178, y + 9, (forge || ord >= 4 ? "★ " : "") + tag, { ...Le, fontSize: "8px", color: forge ? "#2a58a0" : ord >= 4 ? "#a8740f" : "#6a5a4a", fontStyle: "bold" }).setOrigin(1, 0));
    y += 24;
  }
  const g = this.__ecoBest(e);
  if (g) o.add(this.add.text(d + 58, Math.max(y + 8, 228), g.forge ? L3("Peça forjada pelo ferreiro do Refúgio — você também pode encomendar a sua.", "Forged by the Refuge blacksmith — you can commission yours too.", "Forjada por el herrero del Refugio — también puedes encargar la tuya.") : L3("Saque das Profundezas — quanto mais fundo, mais chance de lendárias.", "Loot from the Depths — the deeper, the better the odds of legendaries.", "Botín de las Profundidades — cuanto más hondo, más leyendas."), { ...Le, fontSize: "8px", color: "#7a5a3a", align: "center", wordWrap: { width: 230 } }).setOrigin(.5, 0));
  const G = __ecoGreetGet(), did = G[D.uid] === __ecoToday();
  const gb = this.add.text(d - 70, 292, did ? L3("SAUDADO HOJE ✓", "GREETED TODAY ✓", "SALUDADO HOY ✓") : L3("[ SAUDAR  +5 ◆ ]", "[ GREET  +5 ◆ ]", "[ SALUDAR  +5 ◆ ]"), { ...ti, color: did ? "#7a8a6a" : "#2a7a3a" }).setOrigin(.5);
  if (!did) {
    gb.setInteractive({ useHandCursor: !0 }); Gt(gb, 14, 10);
    gb.on("pointerdown", () => {
      const G2 = __ecoGreetGet(); if (G2[D.uid] === __ecoToday()) return;
      G2[D.uid] = __ecoToday(); try { localStorage.setItem(__ECO_KEY_GREET, JSON.stringify(G2)) } catch (x) {}
      try { const m = Xe(); m.fragments = (m.fragments || 0) + 5; m.totalEarned = (m.totalEarned || 0) + 5; tr(m); this.meta = m; this.fragText?.setText?.(`◆ ${m.fragments}`) } catch (x) {}
      try { window.__ecoOnGreet?.(D) } catch (x) {}
      this.game.audioEngine?.sfx?.("sfx-chest-open"); this.__ecoHearts(e);
      gb.setText(L3("SAUDADO HOJE ✓", "GREETED TODAY ✓", "SALUDADO HOY ✓")).setColor("#7a8a6a").disableInteractive();
      this.__ecoBanner?.(L3(`Você saudou ${D.name} · +5 fragmentos`, `You greeted ${D.name} · +5 fragments`, `Saludaste a ${D.name} · +5 fragmentos`));
      this.__fnAuto?.(o, back, !0);
    });
  }
  const back = this.add.text(d + 80, 292, W("hub.back"), { ...ti, color: "#e08a7a" }).setOrigin(.5).setInteractive({ useHandCursor: !0 }); Gt(back, 16, 12);
  back.on("pointerdown", () => this.closePanel());
  o.add([gb, back]);
  this.__fixScroll?.(o); this.panel = o; this.panelRows = null; this.__ecoPanelDone = done;
  this.__fnAuto?.(o, back);
  this.game.audioEngine?.sfx("sfx-ui-open");
};
Fl.prototype.__ecoBest = function (e) { return __ecoBest(e) };
Fl.prototype.__ecoBanner = function (msg) {
  try { const cam = this.cameras.main, t = this.add.text(cam.width / 2, 96, msg, { ...ti, fontSize: "13px", color: "#c9b8ff", stroke: "#120c08", strokeThickness: 4 }).setOrigin(.5).setScrollFactor(0).setDepth(9900); this.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 600, onComplete: () => t.destroy() }) } catch (e) {}
};
/* fechar o painel por Esc/B também devolve o eco à rotina */
{
  const CP = Fl.prototype.closePanel;
  Fl.prototype.closePanel = function () {
    const r = CP.apply(this, arguments), f = this.__ecoPanelDone; this.__ecoPanelDone = null;
    if (f) try { f() } catch (e) {}
    return r;
  };
}
