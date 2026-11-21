/* ══ Samurai: recurso Foco e técnicas novas (p216.100) ═══════════════════════════════════════════════════════════
   • Recurso: Fúria (começava em 0 e só enchia batendo/apanhando, custos 25–45) → FOCO: começa cheio, recupera 9/s,
     +3 a cada golpe acertado; levar dano quebra a concentração (−8); com Foco ≥ 80 os golpes causam +15%.
   • Técnicas (as mesmas vagas/IDs internos, para manter saves, árvores e animações — nome, ícone, efeito e custo novos):
     Nv 1  Kesa-giri (IAIJUTSU)  corte diagonal pesado que faz sangrar por 3 s · 12 Foco · 4 s
     Nv 5  Zanshin (KIAI)        mente alerta: +20% crítico e +4 defesa por 5 s e recupera 25 Foco · 10 · 12 s
           Sen no Sen (MIKIRI)   antecipação: +10 defesa por 3 s e o próximo golpe é um contra-ataque · 8 · 10 s
     Nv 10 Shippū (KAZE_GIRI)    avanço de vendaval cortando tudo no caminho · 15 · 6 s
           Sakura Arashi (TSUMUJI) giro numa tempestade de pétalas ao redor · 18 · 8 s
     Nv 15 Musō no Ken (KAISHAKU) seis cortes num instante; inimigos com pouca vida sofrem ×4 · 30 · 12 s
     Ícones novos (PixelLab, scripts/gerar_samurai_icones.py) e efeitos em pixel desenhados aqui.
   • A arma inicial (great_sword) passa a se chamar Katana, com ícone próprio.
   • Tela de escolha (todas as classes): o recurso mostra o nome usado no jogo (Espírito, Natureza, Foco…) e os ícones
     mostram as habilidades que o herói realmente ganha: a inicial e as duas opções do nível 5. */
{
 const L3 = (a, b, c) => { try { return __L3(a, b, c) } catch (e) { return a } };
 const B = pe.BERSERKER;
 B.resource = { type: "focus", name: "Foco", max: 100, regen: 9, color: 0x7fd6ff };
 B.desc = ["Katana", "Foco que se recupera sozinho", "Técnicas de samurai"];
 const TXT = {
  "desc.BERSERKER": ["Katana|Foco que se recupera sozinho|Técnicas de samurai", "Katana|Focus that refills on its own|Samurai techniques", "Katana|Enfoque que se recupera solo|Técnicas de samurái"],
  "res.focus": ["Foco", "Focus", "Enfoque"],
 };
 const AB = {
  IAIJUTSU: { n: ["Kesa-giri", "Kesa-giri", "Kesa-giri"], d: ["Corte diagonal de ombro a quadril: dano alto e faz sangrar por 3s.", "A diagonal shoulder-to-hip cut: heavy damage and bleeding for 3s.", "Corte diagonal de hombro a cadera: daño alto y sangrado por 3s."],
   o: { icon: "icon-iaijutsu", type: "melee-heavy", cost: 12, cooldown: 4, damageMult: 3, rangeBonus: 28, widthBonus: 16, arc: { range: 96, angle: 90 }, knockbackMult: 1.3 } },
  KIAI: { n: ["Zanshin", "Zanshin", "Zanshin"], d: ["Mente alerta: +20% de crítico e +4 de defesa por 5s e recupera 25 de Foco.", "Alert mind: +20% crit and +4 defense for 5s, and restores 25 Focus.", "Mente alerta: +20% de crítico y +4 de defensa por 5s y recupera 25 de Enfoque."],
   o: { type: "buff", cost: 10, cooldown: 12, duration: 5, buff: void 0, buffs: [{ stat: "critChance", amount: 20 }, { stat: "defense", amount: 4 }], tint: 0x7fd6ff } },
  MIKIRI: { n: ["Sen no Sen", "Sen no Sen", "Sen no Sen"], d: ["Antecipação: +10 de defesa por 3s e o próximo golpe vira contra-ataque.", "Anticipation: +10 defense for 3s and your next blow becomes a counter.", "Anticipación: +10 de defensa por 3s y tu próximo golpe es un contraataque."],
   o: { type: "buff", cost: 8, cooldown: 10, duration: 3, buffs: void 0, buff: { stat: "defense", amount: 10 }, tint: 0xe8f4ff } },
  KAZE_GIRI: { n: ["Shippū", "Shippū", "Shippū"], d: ["Avança como um vendaval, cortando todos no caminho.", "Dashes like a gale, cutting everyone in the way.", "Avanza como un vendaval, cortando a todos a su paso."],
   o: { type: "shadow-strike", cost: 15, cooldown: 6, damageMult: 2.2, distance: 170, durationMs: 150, width: 34, tint: 0xbfeaff } },
  TSUMUJI: { n: ["Sakura Arashi", "Sakura Arashi", "Sakura Arashi"], d: ["Gira numa tempestade de pétalas, cortando todos ao redor.", "Spins in a storm of petals, cutting everyone around.", "Gira en una tormenta de pétalos, cortando a todos alrededor."],
   o: { type: "aoe-self", cost: 18, cooldown: 8, damageMult: 2, radius: 92, dashImpulse: 90 } },
  KAISHAKU: { n: ["Musō no Ken", "Musō no Ken", "Musō no Ken"], d: ["Seis cortes num instante; inimigos com pouca vida sofrem dano ×4.", "Six cuts in an instant; enemies at low life take ×4 damage.", "Seis cortes en un instante; enemigos con poca vida reciben ×4 de daño."],
   o: { type: "execute", cost: 30, cooldown: 12, damageMult: 2, executeMult: 4, threshold: .4, arc: { range: 84, angle: 200 } } },
 };
 for (const [id, a] of Object.entries(AB)) {
  const d = Ye[id]; if (!d) continue;
  Object.assign(d, a.o, { name: a.n[0], desc: a.d[0] });
  try { _s["abn." + id] = a.n[1]; _s["abd." + id] = a.d[1]; Io["abn." + id] = a.n[2]; Io["abd." + id] = a.d[2]; for (const L in __C5) { delete __C5[L]["abn." + id]; delete __C5[L]["abd." + id] } } catch (e) {}
 }
 try { for (const [k, v] of Object.entries(TXT)) { Rs.pt && (Rs.pt[k] = v[0]); Rs.en && (Rs.en[k] = v[1]); Rs.es && (Rs.es[k] = v[2]); Hn && (Hn[k] = v[0]) } } catch (e) {}
 // árvore do Infinito: os textos citavam os nomes antigos
 try {
  const RP = [[/Iaijutsu/g, "Kesa-giri"], [/Kiai/g, "Zanshin"], [/Kaze-Giri/g, "Shippū"]];
  for (const side of ["d", "a"]) for (const n of __ET.BERSERKER?.[side]?.nodes || []) for (const f of ["n", "d"]) if (Array.isArray(n[f])) n[f] = n[f].map((s) => RP.reduce((t, [r, w]) => t.replace(r, w), s));
 } catch (e) {}
 // katana
 try {
  Object.assign(Xt.great_sword, { name: "Katana", icon: "icon-katana", desc: "A lâmina do samurai: leve, afiada e fiel." });
  _s["item.great_sword"] = "Katana"; Io["item.great_sword"] = "Katana"; for (const L in __C5) __C5[L]["item.great_sword"] = "Katana";
 } catch (e) {}
 { const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath(""); this.textures.exists("icon-katana") || L.image("icon-katana", "assets/pixel-art/ui/icon-katana.png"); L.setPath(op) } catch (e) {} return r } }

 /* ── efeitos ── */
 const lay = (S, o, d) => { o.setDepth(d ?? (S.player.y + 60)); return o };
 const slash = (S, x, y, ang, len, col, w = 4, life = 220) => {
  const g = lay(S, S.add.graphics()); const o = { t: 0 };
  const draw = () => { g.clear(); const k = o.t, a0 = ang - .9, a1 = a0 + 1.8 * Math.min(1, k * 2.4);
   g.lineStyle(w, col, 1 - k).beginPath(); g.arc(x, y, len, a0, a1); g.strokePath();
   g.lineStyle(Math.max(1, w - 2), 0xffffff, (1 - k) * .9).beginPath(); g.arc(x, y, len - 3, a0 + .1, a1); g.strokePath() };
  S.tweens.add({ targets: o, t: 1, duration: life, onUpdate: draw, onComplete: () => g.destroy() });
 };
 const line = (S, x0, y0, x1, y1, col, w = 3, life = 260) => {
  const g = lay(S, S.add.graphics()); const o = { t: 0 };
  S.tweens.add({ targets: o, t: 1, duration: life, onUpdate: () => { g.clear(); g.lineStyle(w, col, 1 - o.t).lineBetween(x0, y0, x0 + (x1 - x0) * Math.min(1, o.t * 3), y0 + (y1 - y0) * Math.min(1, o.t * 3)) }, onComplete: () => g.destroy() });
 };
 const dots = (S, x, y, n, cols, o = {}) => {
  for (let i = 0; i < n; i++) {
   const a = Math.random() * 6.283, r = (o.r ?? 10) * Math.random();
   const p = lay(S, S.add.rectangle(x + Math.cos(a) * r, y + Math.sin(a) * r * .6, o.s ?? 2, o.s ?? 2, cols[i % cols.length]));
   const R = o.R ?? 40;
   S.tweens.add({ targets: p, x: p.x + Math.cos(a) * R * (.5 + Math.random()), y: p.y + Math.sin(a) * R * .6 * (.5 + Math.random()) - (o.up ?? 0), angle: o.spin ? 360 : 0, alpha: 0, duration: (o.t ?? 600) * (.7 + Math.random() * .6), ease: "Quad.easeOut", onComplete: () => p.destroy() });
  }
 };
 const ring = (S, x, y, r, col, life = 420) => {
  const c = lay(S, S.add.ellipse(x, y, 8, 4)); c.setStrokeStyle(2, col, .95);
  S.tweens.add({ targets: c, scaleX: r / 4, scaleY: r / 4, alpha: 0, duration: life, ease: "Quad.easeOut", onComplete: () => c.destroy() });
 };
 const facing = (S) => { const f = S.player.facing || { x: 1, y: 0 }, m = Math.hypot(f.x, f.y) || 1; return { x: f.x / m, y: f.y / m } };
 const SAK = [0xffc0d8, 0xff9cc2, 0xfff0f6, 0xffb0cc];

 const X0 = Yh.prototype.execute;
 Yh.prototype.execute = function (d) {
  const r = X0.apply(this, arguments), S = this.scene;
  try {
   if (S.classDef?.id !== "BERSERKER" || !S.player || d.__sf) return r;
   const P = S.player, f = facing(S), ang = Math.atan2(f.y, f.x), x = P.x, y = P.y - 14;
   if (d.id === "IAIJUTSU") {                                       // corte diagonal pesado que faz sangrar
    slash(S, x + f.x * 20, y + f.y * 10, ang - .35, 48, 0x9fe0ff, 5, 260);
    line(S, x + f.x * 6 - f.y * 34, y - 30, x + f.x * 50 + f.y * 30, y + 26, 0xffffff, 2, 220);
    try { const C = S.combat; for (const h of C.getTargets()) if (h.active && !h.dead && C.arcHit(P, f, d.arc.range, d.arc.angle, h)) { S.statusFx?.apply?.(h, "BLEED", { key: "BLEED", duration: 3 }); dots(S, h.x, h.y - 12, 6, [0xc0202a, 0x8a1018], { r: 4, R: 16, t: 500 }) } } catch (e) {}
   } else if (d.id === "KIAI") {
    S.resource?.gain?.(25); ring(S, P.x, P.y - 2, 70, 0x7fd6ff); ring(S, P.x, P.y - 2, 46, 0xffffff, 520);
    dots(S, P.x, P.y - 20, 18, [0x7fd6ff, 0xd8f4ff], { r: 18, R: 10, up: 30, t: 900 });
   } else if (d.id === "MIKIRI") {
    S.counterUntil = S.time.now + 3000;
    const g = lay(S, S.add.graphics()); g.lineStyle(3, 0xffffff, 1);
    for (let i = 0; i < 8; i++) { const a = i * .785; g.lineBetween(x + Math.cos(a) * 6, y + Math.sin(a) * 6, x + Math.cos(a) * (i % 2 ? 14 : 24), y + Math.sin(a) * (i % 2 ? 14 : 24)) }
    S.tweens.add({ targets: g, alpha: 0, scale: 1.4, duration: 380, onComplete: () => g.destroy() });
    ring(S, P.x, P.y - 2, 40, 0xe8f4ff, 320);
   } else if (d.id === "KAZE_GIRI") {
    const dist = d.distance || 170;
    for (let i = 0; i < 6; i++) { const o = (i - 2.5) * 6; line(S, x - f.y * o, y + f.x * o, x - f.y * o + f.x * dist, y + f.x * o + f.y * dist, i % 2 ? 0xbfeaff : 0xffffff, 2, 300 + i * 30) }
    S.time.delayedCall(160, () => P.active && dots(S, P.x, P.y - 14, 14, [0xffffff, 0xbfeaff], { r: 8, R: 30, t: 420 }));
   } else if (d.id === "TSUMUJI") {
    slash(S, P.x, P.y - 10, ang, 52, 0xffc0d8, 4, 300); slash(S, P.x, P.y - 10, ang + 3.14, 52, 0xffffff, 3, 300);
    dots(S, P.x, P.y - 12, 60, SAK, { r: 24, R: 100, t: 1100, s: 4, spin: !0 });
    ring(S, P.x, P.y, 92, 0xffb0cc, 500);
   } else if (d.id === "KAISHAKU") {
    for (let i = 0; i < 6; i++) S.time.delayedCall(i * 55, () => {
     if (!P.active) return; const a = Math.random() * 6.283, L = 34 + Math.random() * 20, cx = P.x + f.x * 30, cy = P.y - 14 + f.y * 14;
     line(S, cx - Math.cos(a) * L, cy - Math.sin(a) * L, cx + Math.cos(a) * L, cy + Math.sin(a) * L, i % 2 ? 0xffd86a : 0xffffff, 3, 260) });
    S.time.delayedCall(340, () => { if (!P.active) return; ring(S, P.x + f.x * 30, P.y, 70, 0xff4a3a, 460); dots(S, P.x + f.x * 30, P.y - 14, 24, [0xffd86a, 0xff6a4a, 0xffffff], { r: 14, R: 60, t: 600 }) });
    try { S.cameraSys?.shake?.(.006, 160) } catch (e) {}
   }
  } catch (e) { console.warn("[samurai]", e) }
  return r;
 };

 /* ── tela de escolha: recurso e habilidades iguais ao jogo (todas as classes) ── */
 const RN = { "Espírito": ["Espírito", "Spirit", "Espíritu"], "Natureza": ["Natureza", "Nature", "Naturaleza"], "Foco": ["Foco", "Focus", "Enfoque"], "Energia": ["Energia", "Energy", "Energía"],
  "Mana": ["Mana", "Mana", "Maná"], "Essência": ["Essência", "Essence", "Esencia"] };
 const R0 = bl.prototype.refreshDetails;
 bl.prototype.refreshDetails = function () {
  const r = R0.apply(this, arguments);
  try {
   const c = fe[this.selected], t = pe[c], lk = !this.__ok(c);
   const rn = t.resource ? (RN[t.resource.name] ? L3(...RN[t.resource.name]) : t.resource.name) : null;
   this.resTxt?.setText((W(`class.${c}`) + "  ·  " + (rn ? W("cls.resource", { name: rn }) : W("cls.noResource"))).toUpperCase());
   const T = Ps[c]; if (!T || !this.abIcons) return r;
   const ab = [T[1]?.[0], ...(T[5] || [])].filter((id) => Ye[id]).slice(0, 3);
   const ref = this.abIcons.find((q) => q.visible) || this.abIcons[0], y = ref.y, cx = this.nameTxt?.x ?? ref.x;
   this.abIcons.forEach((im, k) => { const a = ab[k] && Ye[ab[k]]; a && this.textures.exists(a.icon) ? im.setTexture(a.icon).setPosition(cx + (k - 1) * 34, y).setVisible(!0).setAlpha(lk ? .35 : 1) : im.setVisible(!1) });
   const nm = (id) => St(`abn.${id}`, Ye[id]?.name ?? id);
   this.abTxt?.setText(ab.length > 1 ? `${nm(ab[0])}  ·  ${L3("Nv 5", "Lv 5", "Nv 5")}: ${ab.slice(1).map(nm).join(L3(" ou ", " or ", " o "))}` : ab.map(nm).join(""));
  } catch (e) { console.warn("[seleção]", e) }
  return r;
 };
}
