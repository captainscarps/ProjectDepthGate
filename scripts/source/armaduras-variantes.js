/* ══ Variantes raras das armaduras únicas (p216.76) ═══════════════════════════════════════════════════════════
   • Cada armadura única do ferreiro (as que têm desenho próprio no herói) ganha DUAS variantes raras com um padrão de
     cor raro (Obsidiana, Áurea, Glacial, Sanguínea, Jade, das Cinzas — as duas mais diferentes da cor original).
   • Não se compram: caem só na CAMPANHA, como armadura ÉPICA, quando o jogo sorteia uma armadura rara ou melhor
     (mais chance em épica/lendária). Só caem as da classe do herói. Não quebram ao morrer (não são da forja) e
     têm ~85% dos atributos da original; o poder especial da armadura da forja fica só na original.
   • Visual (p216.77): a cor principal da armadura e a pele ficam; só as cores secundárias ganham o tom do padrão e as folhas de
     direções e golpes copiam a mesma pintura (__haDerive). O brilho da forja (Ossário, Vendaval) continua.     */
const __AV_PAT = [
  { k: "obsidiana", n: ["Obsidiana", "Obsidian", "Obsidiana"], main: 0x2b2836, trim: 0xb48cff, sec: 0x8a62d0 },
  { k: "aurea", n: ["Áurea", "Gilded", "Áurea"], main: 0xeee2c4, trim: 0xe6b23a, sec: 0xd2a23c },
  { k: "glacial", n: ["Glacial", "Glacial", "Glacial"], main: 0x4f9fd6, trim: 0xeaf8ff, sec: 0x5aa6d8 },
  { k: "sangue", n: ["Sanguínea", "Blood", "Sanguínea"], main: 0x7c1622, trim: 0x2a2224, sec: 0xa8283a },
  { k: "jade", n: ["Jade", "Jade", "Jade"], main: 0x2e8a62, trim: 0xdcc074, sec: 0x2e9a68 },
  { k: "cinzas", n: ["das Cinzas", "Ashen", "de Cenizas"], main: 0x625e5a, trim: 0xff8a36, sec: 0xd8782e },
];
const __AV_BASES = ["armor_forge_ossos", "armor_forge_vendaval", "armor_forge_saqueador", "armor_forge_templario", "armor_forge_penas", "armor_forge_esmeralda",
  "armor_forge_oni", "armor_forge_ronin", "armor_forge_corvo", "armor_forge_selvagem", "armor_forge_lobo", "armor_forge_rubro"];
const __AV = {};   // id da variante → { base, cls, P }
{
  const rgb = c => [c >> 16 & 255, c >> 8 & 255, c & 255], dist = (a, b) => { const A = rgb(a), B = rgb(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]) };
  __AV_BASES.forEach((bid, bi) => {
    const F = typeof __FARM !== "undefined" ? __FARM[bid] : null, B = Xt[bid]; if (!F || !B || !F.cls) return;
    /* as quatro cores mais longe da original, e dessas duas (variando de armadura para armadura) */
    const far = __AV_PAT.map(P => [P, dist(P.sec, F.trim ?? F.main)]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);
    const pick = [far[bi % 4], far[(bi + 2) % 4]];
    for (const P of pick) {
      const id = `${bid}_v_${P.k}`, nm = F.name.map((s, i) => `${s} ${P.n[i] ?? P.n[0]}`);
      const st = {}; for (const [k, v] of Object.entries(F.stats || B.stats || {})) st[k] = Math.max(1, Math.round(v * .85));
      __AV[id] = { base: bid, cls: F.cls, P };
      Xt[id] = { name: nm[0], type: "armor", slot: "armor", icon: B.icon || "icon-armor", minRarity: "EPIC", stats: st, value: Math.round((B.value || 300) * .8),
        tint: P.main, classRequirement: F.cls, avBase: bid,
        desc: `Variante rara (${P.n[0].toLowerCase()}) da ${F.name[0]}: o mesmo feitio, num padrão de cores que quase ninguém viu. Só aparece na campanha.` };
      try { _s["item." + id] = nm[1]; Io["item." + id] = nm[2] } catch (e) {}
    }
  });
}
/* repinta a folha da armadura única com o padrão (corpo → cor principal, partes claras → acabamento) */
/* cores de pele da classe: tons quentes da cabeça no quadro parado da folha base (a pele não é repintada) */
const __AV_SKIN = {};
function __avSkin(scene, cls) {
  if (__AV_SKIN[cls]) return __AV_SKIN[cls];
  const out = [];
  try {
    for (const k of [`mk4b-${cls}-nh`, `mk4b-${cls}-t0`]) {
      if (!scene.textures.exists(k)) continue;
      const im = scene.textures.get(k).getSourceImage(), c = document.createElement("canvas"); c.width = 128; c.height = 128;
      const x = c.getContext("2d"); x.drawImage(im, 0, 0, 128, 128, 0, 0, 128, 128); const d = x.getImageData(0, 0, 128, 128).data;
      let y0 = 128, y1 = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { const y = (i >> 2) >> 7; y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
      const lim = y0 + (y1 - y0) * (cls === "shaman" ? .6 : .32);
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128 || ((i >> 2) >> 7) > lim) continue; const [h, s, v] = __HSV(d[i], d[i + 1], d[i + 2]); if ((h <= 50 || h >= 345) && s > .12 && v > (cls === "druid" || cls === "shaman" ? .26 : .42)) out.push([d[i], d[i + 1], d[i + 2]]); else if (s > .18 && v > .12) (out.hair ||= []).push([d[i], d[i + 1], d[i + 2]]) }
      if (out.length > 20) break;
    }
  } catch (e) {}
  return (__AV_SKIN[cls] = out);
}
function __avTex(scene, srcKey, P, cls) {
  const key = `${srcKey}-y${P.k}`, TX = scene.textures;
  if (TX.exists(key)) return key;
  if (!TX.exists(srcKey)) return null;
  const src = TX.get(srcKey), img = src.getSourceImage(), cv = document.createElement("canvas");
  cv.width = img.width; cv.height = img.height;
  const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
  const D = cx.getImageData(0, 0, cv.width, cv.height), p = D.data;
  const SK = cls ? __avSkin(scene, cls.toLowerCase()) : [], skc = new Map(), vmin = /^(druid|shaman)$/i.test(cls || "") ? .24 : .38;
  const skin = (h, s, v, r, g, b) => {                                                // pele: fica como está
    if (!((h <= 50 || h >= 345) && s > .12 && v > vmin)) return !1;
    const k = (r << 16) | (g << 8) | b; let o = skc.get(k); if (o !== undefined) return o;
    o = SK.length ? SK.some(q => Math.abs(q[0] - r) + Math.abs(q[1] - g) + Math.abs(q[2] - b) < 24) : (h >= 8 && h <= 42 && s > .2 && s < .62 && v > .45);
    skc.set(k, o); return o };
  const cloth = (h, s, v, r, g, b) => v > .08 && s > .09 && !skin(h, s, v, r, g, b);
  /* p216.77: a cor PRINCIPAL da armadura fica como está (o grupo de cor com mais área) e só as cores SECUNDÁRIAS
     (amarrações, faixas, detalhes) ganham o tom do padrão, mantendo o brilho original de cada pixel — sem estourar.
     Pele, metal sem cor e contorno não mudam. */
  const BIN = h => Math.floor(((h + 15) % 360) / 30), area = new Array(13).fill(0);
  for (let i = 0; i < p.length; i += 4 * 3) { if (p[i + 3] < 128) continue; const [h, s, v] = __HSV(p[i], p[i + 1], p[i + 2]); if (v < .1 || skin(h, s, v, p[i], p[i + 1], p[i + 2])) continue; area[s > .18 ? BIN(h) : 12]++ }
  /* principal = o grupo de cor com mais área (se o maior for metal/cinza, o maior grupo COLORIDO também conta como principal) */
  let pc = 0; for (let k = 1; k < 12; k++) area[k] > area[pc] && (pc = k);
  const P2 = new Set([pc, (pc + 1) % 12, (pc + 11) % 12]);
  const HAIR = (SK.hair || []), hc = new Map(), hair = (r, g, b) => { const k = (r << 16) | (g << 8) | b; let o = hc.get(k); if (o === undefined) { o = HAIR.some(q => Math.abs(q[0] - r) + Math.abs(q[1] - g) + Math.abs(q[2] - b) < 22); hc.set(k, o) } return o };
  const isPrim = k => P2.has(k);
  /* cabeça (cabelo, rosto, olhos) de cada quadro também fica: topo do desenho até ~24% da altura */
  const FW = 128, W = cv.width, H = cv.height, hcN = Math.floor(W / FW), rowsN = Math.floor(H / FW), headY = new Int16Array(hcN * rowsN).fill(-1);
  for (let cr = 0; cr < rowsN; cr++) for (let cc = 0; cc < hcN; cc++) {
    let t = -1, b = -1;
    for (let y = 0; y < FW && t < 0; y++) for (let x = 0; x < FW; x++) if (p[((cr * FW + y) * W + cc * FW + x) * 4 + 3] > 128) { t = y; break }
    for (let y = FW - 1; y >= 0 && b < 0; y--) for (let x = 0; x < FW; x++) if (p[((cr * FW + y) * W + cc * FW + x) * 4 + 3] > 128) { b = y; break }
    t >= 0 && (headY[cr * hcN + cc] = t + Math.round((b - t) * .24));
  }
  const inHead = i => { const q = i >> 2, x = q % W, y = (q / W) | 0, cc = (x / FW) | 0, cr = (y / FW) | 0; return y - cr * FW <= headY[cr * hcN + cc] };
  const [sh, ss] = __HSV(P.sec >> 16 & 255, P.sec >> 8 & 255, P.sec & 255);
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 128) continue;
    const [h, s, v] = __HSV(p[i], p[i + 1], p[i + 2]);
    if (v < .1 || s <= .18 || skin(h, s, v, p[i], p[i + 1], p[i + 2]) || isPrim(BIN(h)) || hair(p[i], p[i + 1], p[i + 2]) || inHead(i)) continue;
    const o = __RGB(sh, Math.min(.85, s * .55 + ss * .4), Math.min(.92, v));
    p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2];
  }
  cx.putImageData(D, 0, 0);
  const t = TX.addCanvas(key, cv), fw = src.get(0)?.width ?? 128, fh = src.get(0)?.height ?? 128, cols = Math.floor(img.width / fw), rows = Math.floor(img.height / fh);
  for (let r = 0, n = 0; r < rows; r++) for (let c = 0; c < cols; c++, n++) t.add(n, 0, c * fw, r * fh, fw, fh);
  t.setFilter(j.Textures.FilterMode.NEAREST);
  /* brilho da forja: a variante usa o mesmo da original */
  for (const suf of ["-glow", "-dirs-glow", "-sk-glow"]) {
    const gs = srcKey + suf, gd = key + suf;
    if (TX.exists(gs) && !TX.exists(gd)) { try { const gi = TX.get(gs).getSourceImage(); TX.addSpriteSheet(gd, gi, { frameWidth: fw, frameHeight: fh }) } catch (e) {} }
  }
  try { __haAnims(scene, srcKey, key) } catch (e) {}
  try { __haDerive(scene, srcKey, key) } catch (e) {}
  return key;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try {
    const a = eq?.armor, V = a && __AV[a.id];
    if (V && skin && classId === V.cls) {
      const r = SK0.call(this, scene, skin, classId, { ...eq, armor: { ...a, id: V.base, tint: undefined } });
      if (r?.sheet && r.sheet !== skin.sheet) { const k = __avTex(scene, r.sheet, V.P, V.cls); if (k) return { ...r, sheet: k } }
      return r;
    }
  } catch (e) {}
  return SK0.apply(this, arguments) }}
/* queda: só na campanha, no lugar de uma armadura rara ou melhor, para a classe do herói */
{const MP0 = __maybeSetPiece; __maybeSetPiece = function (id, rarity, classId) {
  try {
    const g = window.__DED_GAME, base = Xt[id];
    if (g?.registry?.get("mode") !== "endless" && base?.slot === "armor" && !base.setId && !base.uniqueForge && !base.avBase) {
      const ord = bt[rarity]?.order ?? 0, ch = ord >= 3 ? .14 : ord >= 2 ? .07 : 0;
      if (ch && Math.random() < ch) { const c = Object.keys(__AV).filter(v => __AV[v].cls === classId); if (c.length) return c[Math.floor(Math.random() * c.length)] }
    }
  } catch (e) {}
  return MP0.apply(this, arguments) }}
window.__AV = __AV; window.__avTex = __avTex;
