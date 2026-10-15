/* ── Vulcão de Cinzas: lava viva + dano nas correntes rasas ─────────────────────────────
   Dados vêm de vcb-meta.json (gerado por build_volcano_map.py):
     flow  [x,y,dx,dy]  pontos de correnteza   bub   [x,y]   bolhas
     glow  [x,y,escala] brilho pulsante        hz    [x,y,w,h] zonas que queimam
     vents [x,y]        fumarolas (fumaça)                                          */
function __vcFx(S, B, M) {
  try {
    const ADD = j.BlendModes.ADD, R = Math.random;
    // 1) brilho que "respira" sobre a lava
    for (const [x, y, s] of M.glow || []) {
      const g = S.add.image(x, y, "light").setBlendMode(ADD).setTint(16739870).setScale(s).setAlpha(.1).setDepth(-1);
      S.tweens.add({ targets: g, alpha: { from: .05, to: .2 }, scale: { from: s * .92, to: s * 1.08 }, duration: 1500 + R() * 1500, yoyo: !0, repeat: -1, delay: R() * 2000, ease: "Sine.easeInOut" });
    }
    // 2) correnteza: veios claros que deslizam no sentido do rio
    for (const [x, y, dx, dy] of M.flow || []) {
      const crust = R() < .5 && S.textures.exists("vc-fx-crust1"), k = crust ? "vc-fx-crust" + (1 + ((R() * 3) | 0)) : (R() < .6 ? "vc-fx-streak" : "vc-fx-streak2");
      if (!S.textures.exists(k)) continue;
      const st = S.add.image(x, y, k).setAlpha(0).setDepth(-1).setRotation(crust ? (R() - .5) * .6 : Math.atan2(dy, dx));
      crust || st.setBlendMode(ADD);
      const sp = Math.hypot(dx, dy) || 1, L = (crust ? 22 + R() * 20 : 18 + R() * 20) * sp, dur = crust ? 4200 + R() * 3000 : 2200 + R() * 2200;
      const run = () => {
        if (!st.active) return;
        st.setPosition(x - dx * L / 2, y - dy * L / 2).setAlpha(0); crust || st.setScale(.7 + R() * .6, 1);
        S.tweens.add({ targets: st, x: x + dx * L / 2, y: y + dy * L / 2, duration: dur, ease: "Linear" });
        S.tweens.add({ targets: st, alpha: { from: 0, to: crust ? .95 : .6 + R() * .3 }, duration: dur / 2, yoyo: !0, ease: "Sine.easeInOut",
          onComplete: () => S.time.delayedCall(R() * 1600, run) });
      };
      S.time.delayedCall(R() * 3000, run);
    }
    // 3) bolhas que estouram
    if (S.textures.exists("vc-fx-bubble")) {
      S.anims.exists("vc-bubble-pop") || S.anims.create({ key: "vc-bubble-pop", frames: S.anims.generateFrameNumbers("vc-fx-bubble", { start: 0, end: 5 }), frameRate: 9, repeat: 0 });
      for (const [x, y] of M.bub || []) {
        const b = S.add.sprite(x, y, "vc-fx-bubble", 5).setDepth(-1).setVisible(!1);
        const go = () => {
          if (!b.active) return;
          b.setVisible(!0).play("vc-bubble-pop");
          b.once("animationcomplete", () => { b.setVisible(!1); S.time.delayedCall(1500 + R() * 4500, go) });
        };
        S.time.delayedCall(R() * 6000, go);
      }
    }
    // 4) luz da lava no sistema de iluminação (clareia as salas escuras perto dela)
    const big = (M.glow || []).slice().sort((a, b) => b[2] - a[2]).slice(0, 36);
    const lit = () => {
      if (!S.scene?.isActive?.()) return;
      if (!S.lighting?.addLight) { S.time.delayedCall(120, lit); return }
      for (const [x, y, s] of big) S.lighting.addLight({ x, y, radius: 48 + s * 30, flicker: .14, color: 16743466 });
    };
    S.time.delayedCall(80, lit);
    // 5) correntes rasas queimam (usa o sistema de perigo do jogo: "LAVA!", som e dano)
    const hz = () => {
      if (!S.scene?.isActive?.()) return;
      if (!S.hazards) { S.time.delayedCall(120, hz); return }
      for (const [x, y, w, h] of M.hz || []) S.hazards.zones.push({ x: x + w / 2, y: y + h / 2 + 4, halfW: w / 2, halfH: h / 2, damage: 1, sound: "sfx-lava-damage" });
    };
    S.time.delayedCall(80, hz);
    // 6) brasas subindo, cinza caindo e fumaça das fumarolas (só perto da câmera)
    const cam = S.cameras.main, F = M.flow || [], V = M.vents || [];
    const embers = [], ash = [];
    for (let k = 0; k < 48; k++) embers.push(S.add.rectangle(0, 0, 1, 1, 16761952, 1).setBlendMode(ADD).setVisible(!1).setDepth(8990));
    for (let k = 0; k < 80; k++) {
      const a = S.add.rectangle(0, 0, 1 + (R() < .3 ? 1 : 0), 1, R() < .15 ? 16756848 : 10130574, .45 + R() * .4).setDepth(8995);
      a.__vx = -5 - R() * 9; a.__vy = 9 + R() * 14; a.__ph = R() * 6.3; a.__init = !1; ash.push(a);
    }
    let te = 0, ts = 0;
    const U = (t, ms) => {
      const d = Math.min(ms, 50) / 1e3, v = cam.worldView;
      if (!v || !v.width) return;
      te += d; ts += d;
      if (te > .1 && F.length) {
        te = 0;
        for (let n = 0; n < 4; n++) {
          const p = F[(R() * F.length) | 0];
          if (p[0] < v.x - 10 || p[0] > v.right + 10 || p[1] < v.y - 10 || p[1] > v.bottom + 10) continue;
          const e = embers.find(o => !o.visible);
          if (!e) break;
          e.setPosition(p[0] + (R() - .5) * 12, p[1]).setVisible(!0).setAlpha(1).setFillStyle(R() < .5 ? 16761952 : 16740384);
          S.tweens.add({ targets: e, y: e.y - 26 - R() * 44, x: e.x + (R() - .5) * 18, alpha: 0, duration: 900 + R() * 1100, onComplete: () => e.setVisible(!1) });
        }
      }
      if (ts > .45 && V.length) {
        ts = 0;
        for (const [x, y] of V) {
          if (x < v.x - 30 || x > v.right + 30 || y < v.y - 30 || y > v.bottom + 60 || R() < .5) continue;
          const sm = S.add.image(x + (R() - .5) * 4, y - 6, "light").setTint(9014906).setAlpha(.22).setScale(.05).setDepth(y + 2);
          S.tweens.add({ targets: sm, y: y - 46 - R() * 20, x: x + (R() - .5) * 14, scale: .16 + R() * .08, alpha: 0, duration: 2200 + R() * 900, onComplete: () => sm.destroy() });
        }
      }
      for (const a of ash) {
        if (!a.__init || a.y < v.y - 40 || a.y > v.bottom + 40) { a.__init = !0; a.setPosition(v.x + R() * v.width, v.y + R() * v.height) }
        else if (a.y > v.bottom + 6 || a.x < v.x - 8 || a.x > v.right + 8) a.setPosition(v.x + R() * (v.width + 40), v.y - 4);
        a.__ph += d;
        a.x += (a.__vx + Math.sin(a.__ph * 1.7) * 6) * d;
        a.y += a.__vy * d;
      }
    };
    S.events.on("update", U);
    S.events.once("shutdown", () => S.events.off("update", U));
  } catch (e) { console.warn("vcFx", e) }
}
