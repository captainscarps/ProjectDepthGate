/* ══ Elyndra, a Devoradora de Selos (luta final da campanha) ══
   - transformação expressiva: tela escurece, câmera aproxima, os quatro selos voam até ela e são
     absorvidos, energia em espiral, ela cresce, clarão e explosão de sangue e selos
   - forma transformada bem maior, com aura vermelha permanente
   - luta mais difícil: mais vida, golpes mais fortes e rápidos, chuva de selos, rugido,
     golpe exclusivo "Fúria dos Selos" e segunda fase com fala e aceleração */
__FX.PAL.blood = { core: 0xffe0e6, mid: 0xff4a6a, out: 0xc81a3c, deep: 0x4a0612, smoke: 0x2a0a10, light: 0xff5a78 };
__BEL.GUARDIAN_FALLEN = "blood";
__SIGN.blood = ["FÚRIA DOS SELOS", "FURY OF THE SEALS", "FURIA DE LOS SELLOS"];
const __ELY = {
  data() {
    const D = Yt.GUARDIAN_FALLEN;
    if (!D || D.__ely) return;
    D.__ely = 1;
    Object.assign(D, {
      scale: 1.32, bodySize: 60, maxHp: 210, contactDamage: 4, speed: 82, attackCooldownMs: 850,
      attacks: {
        SLAM: { damage: 6, range: 88, width: 100, telegraphMs: 480, recoverMs: 320, maxDist: 140 },
        CHARGE: { damage: 6, speed: 540, length: 360, durationMs: 650, telegraphMs: 560, recoverMs: 420, minDist: 110 },
        SHOCKWAVE: { damage: 5, radius: 156, telegraphMs: 680, recoverMs: 460, maxDist: 210 },
        ROCKS: { damage: 5, count: 5, spacing: 54, radius: 34, staggerMs: 110, telegraphMs: 680, recoverMs: 460, minDist: 70 },
        ROAR: { damage: 4, radius: 176, telegraphMs: 600, recoverMs: 480, knockback: 1.7 },
      },
      attackPools: { 1: ["SLAM", "CHARGE", "SHOCKWAVE", "ROCKS"], 2: ["SLAM", "CHARGE", "SHOCKWAVE", "ROCKS", "ROAR"], 3: ["SLAM", "CHARGE", "SHOCKWAVE", "ROCKS", "ROAR"] },
      phase2: { hpRatio: .6, speedMult: 1.55, cooldownMult: .45, damageMult: 1.5, radiusMult: 1.35, chargeSpeedMult: 1.35, tint: 16729190 },
    });
  },
  T(pt, en, es) { try { return __L3(pt, en, es) } catch (e) { return pt } },
};
/* transformação */
__guardFight = function (ui, S, done) {
  const G = S.__finG;
  S.__guardFight = { done };
  __dlg(S, [
    { who: "guardia", expr: "aggression", name: "ELYNDRA", text: "Você ousa me negar? Depois de tudo que fiz por este reino?" },
    { who: "guardia", expr: "special", name: "ELYNDRA", text: "Se ninguém vai salvar Aelric… então os selos serão MEUS." },
    { who: "rei", expr: "sadness", name: "AELRIC, REI DE VALDRAK", text: "Elyndra, não! Eles vão te consumir como me consumiram!" },
  ], () => {
    if (!S.scene.isActive()) return;
    __ELY.data();
    S.__elyT = S.time.now;
    const x = G?.x ?? S.player.x + 80, y = G?.y ?? S.player.y - 40, cam = S.cameras.main, z0 = cam.zoom, P = __FX.PAL.blood;
    __FX.tex(S);
    S.uiOpen = !0;
    try { S.physics?.pause?.() } catch (e) {}
    S.game.events.emit("ui:banner", __ELY.T("A GUARDIÃ CONSOME OS SELOS!", "THE GUARDIAN DEVOURS THE SEALS!", "¡LA GUARDIANA DEVORA LOS SELLOS!"), "#ff4a6a");
    S.audioRef?.play?.("sfx-ancient-dragon-phase");
    // tela escurece em volta dela, câmera aproxima
    const dark = S.add.rectangle(x, y, 4000, 4000, 0x14020a, 0).setDepth(y - 2);
    S.tweens.add({ targets: dark, fillAlpha: .62, duration: 900 });
    try { cam.stopFollow(); cam.pan(x, y - 20, 700, "Sine.easeInOut"); cam.zoomTo(z0 * 1.3, 900, "Sine.easeInOut") } catch (e) {}
    const halo = S.add.image(x, y - 26, "light").setBlendMode(j.BlendModes.ADD).setTint(P.light).setScale(.2).setAlpha(0).setDepth(y - 1);
    S.tweens.add({ targets: halo, alpha: .7, scale: .9, duration: 2400, ease: "Quad.easeIn" });
    if (G) {
      S.tweens.add({ targets: G, y: y - 16, duration: 1600, ease: "Sine.easeInOut" });
      S.tweens.add({ targets: G, x: G.x + 2, duration: 50, yoyo: !0, repeat: 44 });
      S.time.addEvent({ delay: 160, repeat: 14, callback: () => { if (G.active) G.setTint(Math.random() < .5 ? P.mid : 0xffffff) } });
    }
    // energia em espiral convergindo para ela
    let vort = null;
    if (__FX.ok()) {
      vort = S.add.particles(0, 0, "fx2-dot", { emitZone: { type: "edge", source: new j.Geom.Circle(x, y - 24, 150), quantity: 48 }, moveToX: x, moveToY: y - 24, frequency: 18, lifespan: 700, scale: { start: 1, end: .2 }, alpha: { start: .9, end: .2 }, tint: [P.mid, P.out, P.core], blendMode: "ADD" }).setDepth(y + 5);
      __FX.live++;
    }
    // os quatro selos voam até ela
    const SEALS = [0x6ae08a, 0x7ac8ff, 0xffa64a, 0xb07aff];
    SEALS.forEach((col, k) => S.time.delayedCall(350 + k * 380, () => {
      if (!S.scene.isActive()) return;
      const a = k / 4 * 6.28 + .6, sx = x + Math.cos(a) * 170, sy = y - 24 + Math.sin(a) * 110;
      const orb = S.add.image(sx, sy, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(.12).setDepth(y + 6);
      const core = S.add.image(sx, sy, "fx2-star").setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setScale(1.6).setDepth(y + 7);
      const tr = __FX.follow(S, orb, "arcane", { size: .8, light: !1 });
      tr?.ems.forEach((e) => { e.particleTint = col });
      S.tweens.add({ targets: [orb, core], x, y: y - 24, duration: 520, ease: "Quad.easeIn", onComplete: () => {
        tr?.stop(); orb.destroy(); core.destroy();
        __FX.impact(S, x, y - 24, "blood", 1.3); __FX.ring(S, x, y - 24, col, 46, 380, y + 8);
        S.cameraSys?.shake?.(.006, 160); __sealFx(S, "seal-break", x, y, .9);
        G?.active && S.tweens.add({ targets: G, scaleX: G.scaleX * 1.12, scaleY: G.scaleY * 1.12, duration: 160 });
      } });
    }));
    // clímax: ela cresce, clarão, explosão e a forma nova surge
    S.time.delayedCall(2300, () => {
      if (!S.scene.isActive()) return;
      G?.active && S.tweens.add({ targets: G, scaleX: G.scaleX * 1.9, scaleY: G.scaleY * 1.9, alpha: 0, duration: 380, ease: "Quad.easeIn", onComplete: () => G.destroy() });
    });
    S.time.delayedCall(2650, () => {
      if (!S.scene.isActive()) return;
      vort?.stop(); vort && S.time.delayedCall(800, () => { __FX.live--; vort.destroy() });
      try { cam.flash(320, 255, 90, 120) } catch (e) {}
      S.cameraSys?.shake?.(.02, 650);
      S.audioRef?.play?.("sfx-ancient-dragon-roar");
      __FX.impact(S, x, y - 20, "blood", 3.4);
      for (let k = 0; k < 3; k++) S.time.delayedCall(k * 120, () => __FX.ring(S, x, y, P.mid, 120 + k * 60, 620, y + 8));
      __BX.debris(S, x, y, 14, [0x4a0612, 0xc81a3c, 0x2a1418]); __BX.crack(S, x, y, 110, 0x2a0408); __BX.dust(S, x, y, 80, 0x3a1a20, 18);
      __sealFx(S, "seal-break", x, y, 1.6);
      S.tweens.add({ targets: halo, alpha: 0, scale: 1.6, duration: 700, onComplete: () => halo.destroy() });
      const b = S.spawnBoss("GUARDIAN_FALLEN", x, y, {});
      const br = [...S.roomManager.byId.values()].find((r) => r.hasBoss);
      br && (b.arenaBounds = S.roomManager.arenaBoundsFor(br), br.state = "active");
      b.setFlipX?.(S.player.x < b.x);
      b.state_ = "recover"; b.stateTimer = 1.6;
      const sc = b.scaleX; b.setScale(sc * .35); b.setAlpha(.2);
      S.tweens.add({ targets: b, scaleX: sc, scaleY: sc, alpha: 1, duration: 620, ease: "Back.easeOut" });
      b.data_.anims?.phase && b.play(`${b.data_.texture}-phase`, !0);
      b.__fxAura = __FX.follow(S, b, "blood", { size: 1.8, oy: -b.displayHeight * .3, zone: { w: b.displayWidth * .5, h: b.displayHeight * .55 }, lightScale: .45, lightAlpha: .22 });
      b.__fxAura?.ems.forEach((e) => { e.frequency = e.frequency * 1.8 });
      S.game.events.emit("boss:spawned", b.data_.name, b.data_.subtitle);
      __bossLine(S, "GUARDIAN_FALLEN", 0, b);
      S.time.delayedCall(700, () => {
        S.tweens.add({ targets: dark, fillAlpha: 0, duration: 900, onComplete: () => dark.destroy() });
        try { cam.zoomTo(z0, 700, "Sine.easeInOut"); cam.startFollow(S.player, !0, .1, .1) } catch (e) {}
        try { S.physics?.resume?.() } catch (e) {}
        S.uiOpen = !1; S.state = "playing";
      });
    });
  });
};
/* golpe exclusivo dela: selos em pentagrama + foice cruzada de sangue */
{
  const SIG0 = __bossSignature;
  __bossSignature = function (b) {
    if (b?.typeKey !== "GUARDIAN_FALLEN") return SIG0(b);
    const S = b.scene, p = S.player, T = S.telegraphs, Pa = __FX.PAL.blood;
    const dmg = b.scaledDamage(6);
    b.state_ = "telegraph"; b.currentAttack = "SIGNATURE"; b.setVelocity(0, 0);
    try { S.effects.floatText(b.x, b.y - b.displayHeight * .7, __ELY.T(...__SIGN.blood), "#ff4a6a", 12) } catch (e) {}
    S.audioRef?.play?.("sfx-ancient-dragon-roar");
    let pending = 0;
    const done = () => { if (--pending <= 0 && !b.dead && b.currentAttack === "SIGNATURE") b.recover(700) };
    const hit = (ok, fx, fy) => { if (!ok || b.dead || p.dead) return; const l = Math.hypot(p.x - fx, p.y - fy) || 1; b.hitPlayer(dmg, { x: (p.x - fx) / l, y: (p.y - fy) / l }) };
    const cols = [0x6ae08a, 0x7ac8ff, 0xffa64a, 0xb07aff, 0xff4a6a];
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * 6.28 - 1.57, x = p.x + Math.cos(a) * 82, y = p.y + Math.sin(a) * 60;
      pending++;
      T.circle(x, y, 30, 820, cols[k], () => { if (!b.dead) { S.__fxBossEl = "blood"; try { __FX.impact(S, x, y, "blood", 1.5); __sealFx(S, "seal-break", x, y, .7); hit(S.damageSystem.circleHit(x, y, 30, p.x, p.y, p.body.width / 2), x, y) } finally { S.__fxBossEl = null } } done() });
    }
    const ang = Math.atan2(p.y - b.y, p.x - b.x);
    for (const s of [-1, 1]) {
      pending++;
      S.time.delayedCall(520, () => {
        if (b.dead) return done();
        const cx = p.x, cy = p.y, rot = ang + s * .78, w = 400, h = 46;
        T.rect(cx, cy, w, h, rot, 760, Pa.out, () => {
          if (!b.dead) { const c = Math.cos(rot), n = Math.sin(rot); for (let q = -2; q <= 2; q++) __FX.impact(S, cx + c * q * w * .2, cy + n * q * w * .2, "blood", .9); __FX.bolt(S, cx - c * w / 2, cy - n * w / 2, cx + c * w / 2, cy + n * w / 2, Pa.mid, 240); hit(S.damageSystem.rectHit(cx, cy, w, h, rot, p.x, p.y), b.x, b.y) }
          done();
        });
      });
    }
  };
}
/* segunda fase dela: fala, cresce um pouco e acelera o golpe exclusivo */
{
  const E2 = hh.prototype.enterPhase2;
  hh.prototype.enterPhase2 = function () {
    const r = E2.apply(this, arguments);
    try {
      if (this.typeKey === "GUARDIAN_FALLEN") {
        const S = this.scene;
        S.game.events.emit("ui:banner", __ELY.T("NÃO! OS SELOS SÃO MEUS!", "NO! THE SEALS ARE MINE!", "¡NO! ¡LOS SELLOS SON MÍOS!"), "#ff4a6a");
        const sc = this.scaleX; S.tweens.add({ targets: this, scaleX: sc * 1.12, scaleY: sc * 1.12, duration: 500, ease: "Back.easeOut" });
        this.__sigT = 2.5;
      }
    } catch (e) {}
    return r;
  };
  const U1 = hh.prototype.update;
  hh.prototype.update = function (dt) {
    if (this.typeKey === "GUARDIAN_FALLEN" && this.phase >= 2 && this.__sigT > 6) this.__sigT = 6;
    return U1.apply(this, arguments);
  };
}
/* chuva de selos (ROCKS dela) cai como orbes vermelhos, não pedras */
{
  const F0 = __BX.fall;
  __BX.fall = function (S, x, y, ms, el, kind) {
    if (kind === "rock" && S.boss?.typeKey === "GUARDIAN_FALLEN") return F0.call(this, S, x, y, ms, "blood", "meteor");
    return F0.apply(this, arguments);
  };
}
try { window.__dgEly = (S) => __guardFight(S.scene.get("UI"), S, () => {}) } catch (e) {}
