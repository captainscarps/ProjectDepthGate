/* ══ Memória: folhas extras só do herói em jogo (p216.102) ══════════════════════════════════════════════════════
   O jogo carregava, já no menu, as folhas de andar para cima/baixo ("-dirs"), de golpes ("-sk") e de pesca ("-fish")
   de TODAS as classes, armaduras únicas e cabeças descobertas: ~650 MB de textura. Somado ao resto passava de 1,5 GB
   e o Safari do iPhone matava a aba ao abrir a fase (tela preta → branca → jogo recarregando).
   Agora essas folhas ficam guardadas como "pendentes" e só são baixadas quando um herói daquela classe aparece em
   jogo (Refúgio, fase, barco). Ao entrar com outra classe, as da anterior são liberadas. Todo código que usa essas
   folhas já confere textures.exists — enquanto não chegam, o herói usa o desenho de perfil.
   A arte da tela de escolha de heróis (sel-*, selx-*) é liberada quando a tela fecha e recarregada ao voltar. */
const __MM = { cls: ["warrior", "archer", "mage", "rogue", "necromancer", "shaman", "berserker", "druid", "hunter"], on: new Set(), def: {}, dq: new Map(), busy: new Set() };
__MM.re = new RegExp(`^mk4b-(${__MM.cls.join("|")})-(?:.+-)?(?:dirs|sk|fish)(?:-glow)?$`);
{const LP = j.Loader?.LoaderPlugin?.prototype; if (LP && !LP.__mm) { const o = LP.addFile;
  LP.addFile = function (f) { try { const A = Array.isArray(f) ? f : [f], keep = [];
    for (const x of A) { const m = x && x.type === "spritesheet" && typeof x.key === "string" && __MM.re.exec(x.key);
      if (m && !__MM.on.has(m[1])) { __MM.def[x.key] = { c: m[1], url: x.url, cfg: x.config }; continue } keep.push(x) }
    if (!keep.length) return; f = keep } catch (e) {} return o.call(this, f) };
  LP.__mm = 1 }}
/* tira texturas e as animações que apontam para elas (uma animação com quadros de textura destruída quebra o desenho) */
function __mmFree(T, AM, keys) {
  const K = new Set(keys.filter(k => T.exists(k))); if (!K.size) return 0;
  try { for (const A of AM?.anims?.getArray?.() ?? []) if (A.frames?.some(f => K.has(f.textureKey))) AM.remove(A.key) } catch (e) {}
  for (const k of K) try { T.remove(k) } catch (e) {}
  return K.size;
}
/* pinturas de armadura (herois-armaduras.js) feitas antes da folha chegar: refeitas quando ela chega */
try { const D0 = __haDerive; __haDerive = function (scene, srcKey, key, inBase, outBase, sufs, sync) {
  try { __MM.dq.set([srcKey, key, inBase ?? srcKey, outBase ?? key].join("|"), [srcKey, key, inBase ?? srcKey, outBase ?? key, sufs ?? ["-dirs", "-sk"], sync]) } catch (e) {}
  return D0.apply(this, arguments) } } catch (e) {}
function __mmNeed(S, c) {
  if (!c || __MM.on.has(c) || !S?.load) return;
  /* outra classe estava ativa e nenhum herói dela está vivo: libera as folhas extras dela (originais e pintadas) */
  const T = S.textures, live = new Set(); try { for (const sc of S.game.scene.getScenes(!0)) for (const v of sc.__mmHeroes || []) v.container?.active !== !1 && v.__mmC && live.add(v.__mmC) } catch (e) {}
  for (const o of [...__MM.on]) { if (live.has(o)) continue; __MM.on.delete(o);
    __mmFree(T, S.game.anims, T.getTextureKeys().filter(k => { const m = __MM.re.exec(k); return m && m[1] === o })) }
  __MM.on.add(c);
  const L = S.load, todo = Object.entries(__MM.def).filter(([k, d]) => d && d.c === c && !T.exists(k) && !__MM.busy.has(k));
  if (!todo.length) return;
  const op = L.path; L.setPath("");
  for (const [k, d] of todo) { __MM.busy.add(k); L.spritesheet(k, d.url, d.cfg);
    L.once("filecomplete-spritesheet-" + k, () => { __MM.busy.delete(k); try { for (const a of __MM.dq.values()) __haDerive(S, ...a) } catch (e) {} }) }
  L.setPath(op); L.on("loaderror", f => __MM.busy.delete(f?.key));
  L.isLoading() || L.start();
}
{const U0 = Qe.prototype.update; Qe.prototype.update = function () {
  try { if (!this.isPreview && !this.__mmC) { const m = /^mk4b-([a-z]+)/.exec(this.animPrefix || ""), c = m && __MM.cls.includes(m[1]) ? m[1] : null;
      if (c) { this.__mmC = c; (this.scene.__mmHeroes = this.scene.__mmHeroes || new Set()).add(this); __mmNeed(this.scene, c) } }
    else if (this.__mmC && !__MM.on.has(this.__mmC)) __mmNeed(this.scene, this.__mmC) } catch (e) {}
  return U0.apply(this, arguments) }}
/* tela de escolha: solta a arte grande ao sair (selecao-herois.js recarrega se precisar) */
{const C0 = bl.prototype.create; bl.prototype.create = function () { const r = C0.apply(this, arguments);
  try { this.events.once("shutdown", () => { try { const T = this.textures; __mmFree(T, this.game.anims, T.getTextureKeys().filter(k => /^selx?-/.test(k))) } catch (e) {} }) } catch (e) {}
  return r }}
