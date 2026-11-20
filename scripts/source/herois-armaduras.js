/* ══ Armaduras nos heróis refeitos (p216.41) ═══════════════════════════════════════════════════════════════════
   • Cores de armadura (comuns com cor, armaduras da forja) eram pintadas só na folha de perfil: andando de frente/
     costas ou usando golpe/habilidade o herói voltava à cor original. Agora, quando a folha colorida é criada, as
     folhas "-dirs" e "-sk" ganham a mesma pintura (e o brilho "-glow" da forja), copiando cor a cor o que a pintura
     fez na folha de perfil (as cores que só existem nas outras folhas usam a cor mais parecida).
   • O brilho da forja acompanha a folha que está na tela (perfil, direções ou golpes).
   • Lendárias: a troca do capacete pela cabeça descoberta usava máscaras da arte antiga e estragava a arte nova;
     nos heróis refeitos ela fica desligada (a capa continua, presa na nuca nova de mods/<classe>-mods.json).  */
/* folhas extras das armaduras únicas refeitas (scripts/build_armaduras_unicas.py) */
const __HA_UNI = [["necromancer", "ossos", 1], ["mage", "vendaval", 1], ["warrior", "saqueador", 0], ["warrior", "dh", 0], ["warrior", "templario", 0]];
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const [c, n, gl] of __HA_UNI) for (const suf of ["-dirs", "-sk"]) for (const g of gl ? ["", "-glow"] : [""]) {
    const k = `mk4b-${c}-${n}${suf}${g}`; this.textures.exists(k) || L.spritesheet(k, `assets/pixel-art/characters/${c}-${n}${suf}${g}.png`, { frameWidth: 128, frameHeight: 128 }) }
  L.setPath(op) } catch (e) {} return r }}
function __haCtx(scene, key) {
  const img = scene.textures.get(key).getSourceImage(), c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: !0 }); g.drawImage(img, 0, 0);
  return { c, g, d: g.getImageData(0, 0, c.width, c.height) };
}
function __haLut(scene, srcKey, dstKey, glowKey) {
  scene.__haL = scene.__haL || {};
  const id = dstKey; if (scene.__haL[id]) return scene.__haL[id];
  const S = __haCtx(scene, srcKey).d.data, D = __haCtx(scene, dstKey).d.data, G = glowKey && scene.textures.exists(glowKey) ? __haCtx(scene, glowKey).d.data : null;
  const map = new Map(), bins = new Map();
  for (let i = 0; i < S.length; i += 4) {
    if (S[i + 3] < 128) continue;
    const k = (S[i] << 16) | (S[i + 1] << 8) | S[i + 2];
    if (map.has(k)) continue;
    map.set(k, [D[i], D[i + 1], D[i + 2], G ? (G[i + 3] > 0 ? (G[i] << 16) | (G[i + 1] << 8) | G[i + 2] : -1) : -1]);
    const b = ((S[i] >> 4) << 8) | ((S[i + 1] >> 4) << 4) | (S[i + 2] >> 4);
    (bins.get(b) || bins.set(b, []).get(b)).push(k);
  }
  return (scene.__haL[id] = { map, bins, glow: !!G, cache: new Map() });
}
function __haLook(L, r, g, b) {
  const k = (r << 16) | (g << 8) | b;
  let v = L.cache.get(k); if (v !== undefined) return v;
  const e = L.map.get(k);
  if (e) v = e;
  else {
    let best = null, bd = 196;                     // até ~14 de distância (cores novas, como o cabelo da cabeça descoberta, ficam como estão)
    const br = r >> 4, bg = g >> 4, bb = b >> 4;
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const B = L.bins.get(((br + x) << 8) | ((bg + y) << 4) | (bb + z)); if (!B) continue;
      for (const q of B) { const dr = (q >> 16) - r, dg = ((q >> 8) & 255) - g, db = (q & 255) - b, d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = q } }
    }
    if (best == null) v = null;
    else {
      const m = L.map.get(best), qr = best >> 16, qg = (best >> 8) & 255, qb = best & 255;
      v = (m[0] === qr && m[1] === qg && m[2] === qb) ? null      // a pintura não mexeu nessa cor
        : [Math.max(0, Math.min(255, m[0] + r - qr)), Math.max(0, Math.min(255, m[1] + g - qg)), Math.max(0, Math.min(255, m[2] + b - qb)), m[3]];
    }
  }
  L.cache.set(k, v); return v;
}
function __haDerive(scene, srcKey, key, inBase = srcKey, outBase = key, sufs = ["-dirs", "-sk"]) {
  if (!scene?.textures?.exists(srcKey) || !scene.textures.exists(key)) return;
  for (const suf of sufs) {
    const s = inBase + suf, d = outBase + suf;
    if (!scene.textures.exists(s) || scene.textures.exists(d)) continue;
    const L = __haLut(scene, srcKey, key, key + "-glow"), X = __haCtx(scene, s), p = X.d.data;
    const gc = L.glow ? document.createElement("canvas") : null, gx = gc ? (gc.width = X.c.width, gc.height = X.c.height, gc.getContext("2d")) : null, GD = gx ? gx.createImageData(X.c.width, X.c.height) : null, q = GD?.data;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 128) continue;
      const v = __haLook(L, p[i], p[i + 1], p[i + 2]); if (!v) continue;
      p[i] = v[0]; p[i + 1] = v[1]; p[i + 2] = v[2];
      if (q && v[3] >= 0) { q[i] = v[3] >> 16; q[i + 1] = (v[3] >> 8) & 255; q[i + 2] = v[3] & 255; q[i + 3] = 255 }
    }
    X.g.putImageData(X.d, 0, 0); gx && gx.putImageData(GD, 0, 0);
    const fw = scene.textures.get(s).get(0)?.width ?? 128, fh = scene.textures.get(s).get(0)?.height ?? 128;
    for (const [k, cv] of [[d, X.c], ...(gc ? [[d + "-glow", gc]] : [])]) {
      const t = scene.textures.addCanvas(k, cv), cols = Math.floor(cv.width / fw), rows = Math.floor(cv.height / fh);
      for (let r = 0, n = 0; r < rows; r++) for (let c = 0; c < cols; c++, n++) t.add(n, 0, c * fw, r * fh, fw, fh);
      t.setFilter(j.Textures.FilterMode.NEAREST);
    }
  }
}
{const S0 = __skinTex; __skinTex = function (scene, srcKey) { const k = S0.apply(this, arguments); try { k && __haDerive(scene, srcKey, k) } catch (e) {} return k }}
{const F0 = __farmTex; __farmTex = function (scene, srcKey) { const k = F0.apply(this, arguments); try { k && __haDerive(scene, srcKey, k) } catch (e) {} return k }}
/* lendárias na arte nova (p216.42): a "cabeça descoberta" é a folha <classe>-nh (herói sem capacete/capuz, com as
   mesmas animações, direções e golpes), pintada com a cor da armadura copiando o que a pintura fez na folha base */
const __HA_NH = ["warrior", "berserker", "archer", "hunter", "druid", "necromancer", "mage", "rogue"];
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const c of __HA_NH) for (const suf of ["", "-dirs", "-sk"]) { const k = `mk4b-${c}-nh${suf}`; this.textures.exists(k) || L.spritesheet(k, `assets/pixel-art/characters/${c}-nh${suf ? suf : "-body"}.png`, { frameWidth: 128, frameHeight: 128 }) }
  L.setPath(op) } catch (e) {} return r }}
function __haAnims(scene, from, to) {
  for (const A0 of scene.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(from + "-") || A0.key.startsWith(to + "-")) continue;
    const nk = to + A0.key.slice(from.length);
    scene.anims.exists(nk) || scene.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: to, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
}
{const H0 = __hmodTex; __hmodTex = function (scene, srcKey, cls) {
  let hd = !1; try { hd = !!scene.cache.json.get(`mk4b-${cls}-layout`)?.hires } catch (e) {}
  if (!hd) return H0.apply(this, arguments);
  try {
    const base = `mk4b-${cls}-nh`, t0 = `mk4b-${cls}-t0`;
    if (!scene.textures.exists(base) || !srcKey?.startsWith(`mk4b-${cls}-t`)) return null;   // armaduras únicas têm folha própria
    if (srcKey === t0) { __haAnims(scene, t0, base); return base }
    const key = srcKey + "-nh";
    if (!scene.textures.exists(key)) {
      __haDerive(scene, t0, srcKey, base, key, ["", "-dirs", "-sk"]);
      if (!scene.textures.exists(key)) return null;
      __haAnims(scene, srcKey, key);
    }
    return key;
  } catch (e) { return null }
}}
/* brilho da forja na folha que estiver na tela — instalado na primeira cena, depois de todos os outros módulos
   (o das direções troca a folha no fim do update) */
function __haGlowSync(V) {
  const g = V.__fGlow, m = V.mk2;
  if (!g || !g.visible || !m) return;
  const gk = m.texture.key + "-glow";
  if (V.scene.textures.exists(gk)) { g.texture.key !== gk && g.setTexture(gk); g.setFrame(m.frame.name) } else g.setAlpha(0);
}
{const C0 = Sd.prototype.create; Sd.prototype.create = function () {
  if (!Qe.prototype.__haG) { const U0 = Qe.prototype.update; Qe.prototype.update = function () { const r = U0.apply(this, arguments); try { __haGlowSync(this) } catch (e) {} return r }; Qe.prototype.__haG = 1 }
  return C0.apply(this, arguments) }}
