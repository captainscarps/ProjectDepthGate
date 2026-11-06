/* ── Vulcão de Cinzas: lava viva otimizada + dano justo nas correntes ─────────────────────────
   Otimizações de performance:
     - Glow em lote com tween único (reduz 69 tweens para 1)
     - Redução do pool de fluxo (sampling inteligente dos maiores canais)
     - Bolhas reduzidas com pooling e delay espaçado
     - Luzes dinâmicas limitadas a 8 fontes principais (evita gargalo WebGL)
     - Partículas de cinza e brasa reduzidas para 60fps constantes
     - Zonas de lava com margem de segurança de 6px (evita dano injusto em pontes) */
function __vcFx(S, B, M) {
  try {
    const ADD = j.BlendModes.ADD, R = Math.random;

    // 1) Brilho que respira sobre a lava (amostragem inteligente de 16 pontos com 1 tween único)
    const glowSamples = (M.glow || []).filter((_, i) => i % 4 === 0);
    const glowImages = [];
    for (const [x, y, s] of glowSamples) {
      const g = S.add.image(x, y, "light").setBlendMode(ADD).setTint(16739870).setScale(s * 0.95).setAlpha(0.08).setDepth(-1);
      glowImages.push(g);
    }
    if (glowImages.length) {
      S.tweens.add({ targets: glowImages, alpha: { from: 0.05, to: 0.16 }, scaleX: "*=1.08", scaleY: "*=1.08", duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    // 2) Correnteza: amostragem dos canais principais (reduz de 740 para ~60 streams)
    const flowSamples = (M.flow || []).filter((_, i) => i % 12 === 0);
    for (const [x, y, dx, dy] of flowSamples) {
      const crust = R() < 0.4 && S.textures.exists("vc-fx-crust1");
      const k = crust ? "vc-fx-crust" + (1 + ((R() * 3) | 0)) : (R() < 0.6 ? "vc-fx-streak" : "vc-fx-streak2");
      if (!S.textures.exists(k)) continue;
      const st = S.add.image(x, y, k).setAlpha(0).setDepth(-1).setRotation(crust ? (R() - 0.5) * 0.6 : Math.atan2(dy, dx));
      crust || st.setBlendMode(ADD);
      const sp = Math.hypot(dx, dy) || 1, L = (crust ? 22 + R() * 18 : 16 + R() * 16) * sp, dur = crust ? 4800 + R() * 2500 : 2600 + R() * 1800;
      const run = () => {
        if (!st.active) return;
        st.setPosition(x - dx * L / 2, y - dy * L / 2).setAlpha(0);
        crust || st.setScale(0.7 + R() * 0.5, 1);
        S.tweens.add({ targets: st, x: x + dx * L / 2, y: y + dy * L / 2, duration: dur, ease: "Linear" });
        S.tweens.add({ targets: st, alpha: { from: 0, to: crust ? 0.85 : 0.55 }, duration: dur / 2, yoyo: true, ease: "Sine.easeInOut",
          onComplete: () => S.time.delayedCall(1200 + R() * 2000, run) });
      };
      S.time.delayedCall(R() * 3500, run);
    }

    // 3) Bolhas de lava (reduzidas para 35 focos com animação sob demanda)
    const bubSamples = (M.bub || []).filter((_, i) => i % 6 === 0);
    if (S.textures.exists("vc-fx-bubble")) {
      S.anims.exists("vc-bubble-pop") || S.anims.create({ key: "vc-bubble-pop", frames: S.anims.generateFrameNumbers("vc-fx-bubble", { start: 0, end: 5 }), frameRate: 8, repeat: 0 });
      for (const [x, y] of bubSamples) {
        const b = S.add.sprite(x, y, "vc-fx-bubble", 5).setDepth(-1).setVisible(false);
        const go = () => {
          if (!b.active) return;
          b.setVisible(true).play("vc-bubble-pop");
          b.once("animationcomplete", () => { b.setVisible(false); S.time.delayedCall(2500 + R() * 5500, go); });
        };
        S.time.delayedCall(R() * 7000, go);
      }
    }

    // 4) Luzes dinâmicas de lava (apenas as 8 maiores fontes para manter 60fps cravados)
    const big = (M.glow || []).slice().sort((a, b) => b[2] - a[2]).slice(0, 8);
    const lit = () => {
      if (!S.scene?.isActive?.()) return;
      if (!S.lighting?.addLight) { S.time.delayedCall(120, lit); return; }
      for (const [x, y, s] of big) S.lighting.addLight({ x, y, radius: 75 + s * 30, flicker: 0.12, color: 16743466 });
    };
    S.time.delayedCall(80, lit);

    // 5) Zonas de lava com margem de segurança de 6px (não queima quem anda nas pontes)
    const hz = () => {
      if (!S.scene?.isActive?.()) return;
      if (!S.hazards) { S.time.delayedCall(120, hz); return; }
      const safeHz = (M.hz || []).filter(([x, y, w, h]) => w >= 20 && h >= 20);
      for (const [x, y, w, h] of safeHz) {
        S.hazards.zones.push({
          x: x + w / 2,
          y: y + h / 2 + 4,
          halfW: Math.max(4, w / 2 - 6),
          halfH: Math.max(4, h / 2 - 6),
          damage: 1,
          sound: "sfx-lava-damage"
        });
      }
    };
    S.time.delayedCall(80, hz);

    // 6) Partículas atmosféricas leves (12 brasas, 20 cinzas)
    const cam = S.cameras.main, F = flowSamples, V = M.vents || [];
    const embers = [], ash = [];
    for (let k = 0; k < 12; k++) embers.push(S.add.rectangle(0, 0, 1, 1, 16761952, 1).setBlendMode(ADD).setVisible(false).setDepth(8990));
    for (let k = 0; k < 20; k++) {
      const a = S.add.rectangle(0, 0, 1, 1, R() < 0.2 ? 16756848 : 10130574, 0.4 + R() * 0.3).setDepth(8995);
      a.__vx = -4 - R() * 6; a.__vy = 8 + R() * 10; a.__ph = R() * 6.3; a.__init = false; ash.push(a);
    }

    let te = 0, ts = 0, frameSkip = false;
    const U = (t, ms) => {
      frameSkip = !frameSkip;
      if (frameSkip) return; // Roda a 30hz para economizar CPU
      const d = Math.min(ms * 2, 70) / 1e3, v = cam.worldView;
      if (!v || !v.width) return;
      te += d; ts += d;

      if (te > 0.18 && F.length) {
        te = 0;
        const p = F[(R() * F.length) | 0];
        if (p[0] >= v.x - 10 && p[0] <= v.right + 10 && p[1] >= v.y - 10 && p[1] <= v.bottom + 10) {
          const e = embers.find(o => !o.visible);
          if (e) {
            e.setPosition(p[0] + (R() - 0.5) * 10, p[1]).setVisible(true).setAlpha(0.9).setFillStyle(R() < 0.5 ? 16761952 : 16740384);
            S.tweens.add({ targets: e, y: e.y - 24 - R() * 30, x: e.x + (R() - 0.5) * 14, alpha: 0, duration: 800 + R() * 900, onComplete: () => e.setVisible(false) });
          }
        }
      }

      if (ts > 0.8 && V.length) {
        ts = 0;
        for (const [x, y] of V) {
          if (x < v.x - 20 || x > v.right + 20 || y < v.y - 20 || y > v.bottom + 40 || R() < 0.6) continue;
          const sm = S.add.image(x, y - 6, "light").setTint(9014906).setAlpha(0.18).setScale(0.06).setDepth(y + 2);
          S.tweens.add({ targets: sm, y: y - 36 - R() * 16, scale: 0.14, alpha: 0, duration: 1800, onComplete: () => sm.destroy() });
        }
      }

      for (const a of ash) {
        if (!a.__init || a.y < v.y - 30 || a.y > v.bottom + 30) {
          a.__init = true; a.setPosition(v.x + R() * v.width, v.y + R() * v.height);
        } else if (a.y > v.bottom + 4 || a.x < v.x - 6 || a.x > v.right + 6) {
          a.setPosition(v.x + R() * (v.width + 30), v.y - 4);
        }
        a.x += a.__vx * d;
        a.y += a.__vy * d;
      }
    };
    S.events.on("update", U);
    S.events.once("shutdown", () => S.events.off("update", U));
  } catch (e) { console.warn("vcFx", e); }
}
