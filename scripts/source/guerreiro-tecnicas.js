/* ══ Guerreiro: técnicas novas sem escudo (p216.101) ═════════════════════════════════════════════════════════════
   O nível 1 continua o Golpe Pesado. As outras cinco eram todas de escudo (Escudada, Contragolpe de Escudo, Muralha,
   Onda do Guardião, Vingança do Guardião); agora são técnicas de espada e de campo de batalha. IDs internos mantidos
   (saves, árvore do Infinito, animações) — nome, ícone, efeito e números novos:
     Nv 5  Investida (SHIELD_BASH)          avança e atravessa os inimigos com a espada à frente · 7 s
           Grito de Guerra (SHIELD_COUNTER) +3 de dano e +10% de crítico por 6 s; inimigos perto ficam lentos · 12 s
     Nv 10 Redemoinho de Aço (SHIELD_WALL)  gira com a espada e corta tudo ao redor · 8 s
           Fenda Sísmica (GUARDIAN_WAVE)    salta e crava a espada no chão à frente: área e atordoa · 9 s
     Nv 15 Juízo do Campeão (GUARDIAN_VENGEANCE) golpe final em arco: dano ×3,5 em quem tem pouca vida · 14 s
   Ícones novos (PixelLab, scripts/gerar_guerreiro_icones.py) e efeitos em pixel desenhados aqui. */
try { window.__XT = Xt } catch (e) {}
{
 const AB = {
  SHIELD_BASH: { n: ["Investida", "Charge", "Embestida"], d: ["Avança e atravessa os inimigos com a espada à frente.", "Charges forward, cutting through enemies sword-first.", "Avanza y atraviesa a los enemigos con la espada al frente."],
   o: { type: "shadow-strike", damageType: "physical", cost: 0, cooldown: 7, damageMult: 2, distance: 150, durationMs: 170, width: 36, tint: 0xd8e4ff, arc: void 0, knockbackMult: void 0 } },
  SHIELD_COUNTER: { n: ["Grito de Guerra", "War Cry", "Grito de Guerra"], d: ["+3 de dano e +10% de crítico por 6s; inimigos por perto ficam lentos.", "+3 damage and +10% crit for 6s; nearby enemies are slowed.", "+3 de daño y +10% de crítico por 6s; los enemigos cercanos se ralentizan."],
   o: { type: "buff", cost: 0, cooldown: 12, duration: 6, buff: void 0, buffs: [{ stat: "damage", amount: 3 }, { stat: "critChance", amount: 10 }], tint: 0xffb04a } },
  SHIELD_WALL: { n: ["Redemoinho de Aço", "Steel Whirlwind", "Torbellino de Acero"], d: ["Gira com a espada e corta todos ao redor.", "Spins with the sword, cutting everyone around.", "Gira con la espada y corta a todos alrededor."],
   o: { type: "aoe-self", damageType: "physical", cost: 0, cooldown: 8, damageMult: 1.9, radius: 84, dashImpulse: 60, knockbackMult: 1.4, buff: void 0, duration: void 0 } },
  GUARDIAN_WAVE: { n: ["Fenda Sísmica", "Seismic Rift", "Grieta Sísmica"], d: ["Salta e crava a espada no chão à frente: dano em área e atordoa.", "Leaps and drives the sword into the ground ahead: area damage and stun.", "Salta y clava la espada en el suelo: daño en área y aturde."],
   o: { type: "aoe-point", damageType: "physical", cost: 0, cooldown: 9, damageMult: 2.3, radius: 70, castDist: 90, color: 0xc8a070, dashImpulse: void 0, knockbackMult: void 0 } },
  GUARDIAN_VENGEANCE: { n: ["Juízo do Campeão", "Champion's Judgment", "Juicio del Campeón"], d: ["Golpe final em arco largo: dano ×3,5 em inimigos com pouca vida.", "A wide finishing arc: ×3.5 damage to enemies at low life.", "Golpe final en arco amplio: daño ×3,5 a enemigos con poca vida."],
   o: { type: "execute", damageType: "physical", cost: 0, cooldown: 14, damageMult: 2.2, executeMult: 3.5, threshold: .4, arc: { range: 92, angle: 190 }, buffs: void 0, duration: void 0 } },
 };
 for (const [id, a] of Object.entries(AB)) {
  const d = Ye[id]; if (!d) continue;
  Object.assign(d, a.o, { name: a.n[0], desc: a.d[0], icon: "ix-" + id });   // ícone novo (assets/pixel-art/ui/icons/<ID>.png); os icon-shield-* antigos ficam para os nós de escudo do Infinito
  try { _s["abn." + id] = a.n[1]; _s["abd." + id] = a.d[1]; Io["abn." + id] = a.n[2]; Io["abd." + id] = a.d[2]; for (const L in __C5) { delete __C5[L]["abn." + id]; delete __C5[L]["abd." + id] } } catch (e) {}
 }
 // o Refúgio usa a lista da classe: só técnicas que o Guerreiro tem de verdade
 pe.WARRIOR.abilities = ["HEAVY_STRIKE", "SHIELD_BASH", "SHIELD_COUNTER", "SHIELD_WALL"];

 const lay = (S, o, d) => { o.setDepth(d ?? (S.player.y + 60)); return o };
 const dots = (S, x, y, n, cols, o = {}) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = (o.r ?? 8) * Math.random(); const p = lay(S, S.add.rectangle(x + Math.cos(a) * r, y + Math.sin(a) * r * .6, o.s ?? 2, o.s ?? 2, cols[i % cols.length])); const R = o.R ?? 40;
  S.tweens.add({ targets: p, x: p.x + Math.cos(a) * R * (.5 + Math.random()), y: p.y + Math.sin(a) * R * .55 * (.5 + Math.random()) - (o.up ?? 0), alpha: 0, duration: (o.t ?? 600) * (.7 + Math.random() * .6), ease: "Quad.easeOut", onComplete: () => p.destroy() }) } };
 const ring = (S, x, y, r, col, life = 420, w = 2) => { const c = lay(S, S.add.ellipse(x, y, 8, 4)); c.setStrokeStyle(w, col, .95); S.tweens.add({ targets: c, scaleX: r / 4, scaleY: r / 4, alpha: 0, duration: life, ease: "Quad.easeOut", onComplete: () => c.destroy() }) };
 const arc = (S, x, y, r, a0, a1, col, w, life) => { const g = lay(S, S.add.graphics()), o = { t: 0 }; S.tweens.add({ targets: o, t: 1, duration: life, onUpdate: () => { g.clear(); g.lineStyle(w, col, 1 - o.t).beginPath(); g.arc(x, y, r, a0, a0 + (a1 - a0) * Math.min(1, o.t * 2.5)); g.strokePath(); g.lineStyle(Math.max(1, w - 2), 0xffffff, (1 - o.t) * .9).beginPath(); g.arc(x, y, r - 3, a0, a0 + (a1 - a0) * Math.min(1, o.t * 2.5)); g.strokePath() }, onComplete: () => g.destroy() }) };
 const X0 = Yh.prototype.execute;
 Yh.prototype.execute = function (d) {
  const r = X0.apply(this, arguments), S = this.scene;
  try {
   if (S.classDef?.id !== "WARRIOR" || !S.player) return r;
   const P = S.player, ff = P.facing || { x: 1, y: 0 }, m = Math.hypot(ff.x, ff.y) || 1, f = { x: ff.x / m, y: ff.y / m }, ang = Math.atan2(f.y, f.x);
   if (d.id === "SHIELD_BASH") {
    const x0 = P.x, y0 = P.y - 12, L = d.distance || 150, g = lay(S, S.add.graphics()), o = { t: 0 };
    S.tweens.add({ targets: o, t: 1, duration: 380, onUpdate: () => { g.clear(); for (let k = -2; k <= 2; k++) { g.lineStyle(k ? 2 : 3, k ? 0xd8e4ff : 0xffffff, (1 - o.t) * (k ? .7 : 1)); g.lineBetween(x0 - f.y * k * 7, y0 + f.x * k * 7, x0 - f.y * k * 7 + f.x * L * Math.min(1, o.t * 3), y0 + f.x * k * 7 + f.y * L * Math.min(1, o.t * 3)) } }, onComplete: () => g.destroy() });
    S.time.delayedCall(170, () => P.active && dots(S, P.x, P.y - 4, 12, [0x8a7a62, 0xb8a888], { r: 10, R: 26, t: 500 }));
   } else if (d.id === "SHIELD_COUNTER") {
    ring(S, P.x, P.y - 4, 96, 0xffb04a, 520, 3); ring(S, P.x, P.y - 4, 64, 0xffe0a0, 420);
    dots(S, P.x, P.y - 22, 20, [0xffb04a, 0xffe0a0, 0xff7a2a], { r: 10, R: 44, up: 18, t: 700 });
    try { S.cameraSys?.shake?.(.005, 180) } catch (e) {}
    try { for (const e of S.combat.getTargets()) if (e.active && !e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 110) S.statusFx?.apply?.(e, "SLOW", { key: "SLOW", duration: 3, amount: .4 }) } catch (e) {}
   } else if (d.id === "SHIELD_WALL") {
    arc(S, P.x, P.y - 10, 50, ang, ang + 6.283, 0xd8e4ff, 4, 360); S.time.delayedCall(120, () => P.active && arc(S, P.x, P.y - 10, 62, ang + 3.14, ang + 9.42, 0xffffff, 3, 360));
    dots(S, P.x, P.y - 8, 18, [0xd8e4ff, 0xffffff], { r: 30, R: 50, t: 500 });
   } else if (d.id === "GUARDIAN_WAVE") {
    const cx = P.x + f.x * Math.min(90, d.castDist || 90), cy = P.y + f.y * Math.min(90, d.castDist || 90);
    S.time.delayedCall(40, () => {
     ring(S, cx, cy, 90, 0xc8a070, 520, 3);
     const g = lay(S, S.add.graphics(), cy - 1); g.lineStyle(2, 0x2a1a10, 1);
     for (let k = 0; k < 7; k++) { let a = k * .9 + Math.random() * .4, x = cx, y = cy; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { a += (Math.random() - .5) * .7; x += Math.cos(a) * 11; y += Math.sin(a) * 6; g.lineTo(x, y) } g.strokePath() }
     S.tweens.add({ targets: g, alpha: 0, delay: 700, duration: 600, onComplete: () => g.destroy() });
     dots(S, cx, cy - 4, 26, [0x8a6a48, 0xb89068, 0x5a4030], { r: 16, R: 56, up: 22, t: 700, s: 3 });
     try { for (const e of S.combat.getTargets()) if (e.active && !e.dead && Math.hypot(e.x - cx, e.y - cy) < (d.radius || 70)) S.statusFx?.apply?.(e, "STUN", { key: "STUN", duration: 1 }) } catch (e) {}
     try { S.cameraSys?.shake?.(.008, 200) } catch (e) {}
    });
   } else if (d.id === "GUARDIAN_VENGEANCE") {
    arc(S, P.x + f.x * 10, P.y - 12, 70, ang - 1.66, ang + 1.66, 0xffd86a, 6, 420);
    S.time.delayedCall(90, () => P.active && arc(S, P.x + f.x * 10, P.y - 12, 58, ang - 1.4, ang + 1.4, 0xffffff, 3, 380));
    S.time.delayedCall(200, () => P.active && dots(S, P.x + f.x * 50, P.y - 14, 22, [0xffd86a, 0xffffff, 0xff9a3a], { r: 18, R: 50, t: 600 }));
    try { S.cameraSys?.shake?.(.007, 180) } catch (e) {}
   }
  } catch (e) { console.warn("[guerreiro]", e) }
  return r;
 };
}
