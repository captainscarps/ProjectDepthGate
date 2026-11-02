/* ══ Retratos dos heróis ══ (assets/pixel-art/heroes-p, scripts/build_hero_portraits.py)
   - diálogos: falas do herói (nome do herói, sem retrato definido) ganham o rosto dele com expressão
   - HUD: a foto redonda no canto usa o rosto desenhado do herói */
const __HPC = ["warrior", "necromancer", "druid", "mage", "hunter", "rogue", "berserker", "archer", "shaman"], __HPE = ["calm", "talk", "smile", "sadness", "aggression", "special"];
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, D = "assets/pixel-art/heroes-p/"; L.setPath("");
      for (const c of __HPC) {
        for (const e of __HPE) this.textures.exists(`hero-${c}-p-${e}`) || L.image(`hero-${c}-p-${e}`, `${D}${c}-p-${e}.png`);
        this.textures.exists(`hero-${c}-hud`) || L.image(`hero-${c}-hud`, `${D}${c}-hud.png`);
      }
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  // falas do herói: reconhece pelo nome
  const byName = () => { const m = {}; try { for (const [k, v] of Object.entries(__HN)) m[String(v).toUpperCase()] = k.toLowerCase() } catch (e) {} return m };
  const D0 = __dlg;
  __dlg = function (S, list, done) {
    try {
      const M = byName(), T = S.textures;
      list = (list || []).map((e) => {
        if (!e || e.who) return e;
        const c = M[String(e.name || "").toUpperCase().trim()];
        if (!c || !T.exists(`hero-${c}-p-talk`)) return e;
        const ex = e.expr && T.exists(`hero-${c}-p-${e.expr}`) ? e.expr : "talk";
        return { ...e, who: "hero-" + c, expr: ex };
      });
    } catch (e) {}
    return D0.call(this, S, list, done);
  };
  // HUD: foto redonda
  const HR = __hrPor;
  __hrPor = function (sc, img, key, s0) {
    try {
      const c = /^mk4b-(\w+)$/.exec(key || "")?.[1], hk = c && `hero-${c}-hud`;
      if (hk && sc.textures.exists(hk)) { img.setTexture(hk); img.setCrop(); img.setOrigin(.5).setDisplaySize(44, 44); return img }
    } catch (e) {}
    return HR.apply(this, arguments);
  };
}
