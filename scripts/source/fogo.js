/* p216.111 — fogo melhorado: chama "torch-flame" redesenhada em pixel art (16 quadros em laço, línguas que sobem,
   núcleo branco, brasa que se solta), cada tocha começa num quadro e ritmo diferentes (não pulsam todas juntas),
   o brilho em volta tremula, fogueiras ganham línguas laterais e braseiros soltam fagulhas. */
function __fogoFlame() {
  const FW = 14, FH = 20, N = 16, cv = document.createElement("canvas");
  cv.width = FW * N; cv.height = FH;
  const g = cv.getContext("2d"), img = g.createImageData(FW * N, FH), D = img.data;
  const PAL = [[150, 28, 10], [214, 60, 14], [255, 128, 28], [255, 196, 64], [255, 240, 170], [255, 252, 236]];
  const CUT = [.1, .24, .4, .58, .76, .9];
  const put = (px, py, c, a) => { const i = (py * FW * N + px) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = a; };
  for (let f = 0; f < N; f++) {
    const t = f / N * Math.PI * 2, ox = f * FW, cx = 6.5, base = 18.4;
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const h = (base - y) / 15.5; if (h < -.08 || h > 1.05) continue;
      const hh = Math.max(0, h);
      const sway = Math.sin(t + hh * 3.1) * 1.5 * hh + Math.sin(2 * t + hh * 5.3 + 1) * .55 * hh;
      const env = h < .2 ? .55 + h / .2 * .45 : Math.max(0, 1 - Math.pow((h - .2) / .85, .8));
      const w = 5.6 * env + .3;
      const dx = x + .5 - cx - sway;
      let heat = 1 - Math.abs(dx) / w;
      heat += .2 * hh * Math.cos(dx * 1.9 + 2 * t + hh * 4.5);                  // línguas
      heat -= .45 * hh * hh;                                                    // afina no alto
      heat -= .2 * hh * (.5 + .5 * Math.sin(y * 1.15 + 3 * t + x * .8));        // ondas subindo
      heat -= .1 * hh * (.5 + .5 * Math.sin(y * 2.3 - x * 1.3 + 2 * t + 2));
      if (h < 0) heat -= (-h) * 9;                                              // base arredondada
      heat += .12 * (1 - hh) - (h < .1 ? (.1 - h) * 2.2 : 0);
      let k = -1; for (let i = 0; i < CUT.length; i++) if (heat > CUT[i]) k = i;
      if (k >= 0) put(ox + x, y, PAL[k], k === 0 ? 225 : 255);
    }
    // língua que se solta e sobe (uma por ciclo)
    const p = f / N, by = 9 - p * 9, bx = cx + Math.sin(t * 1.5) * 1.6, r = 1.5 * (1 - p) + .3;
    for (let y = Math.floor(by - 2); y <= by + 2; y++) for (let x = Math.floor(bx - 2); x <= bx + 2; x++) {
      if (x < 0 || y < 0 || x >= FW || y >= FH) continue;
      const d = Math.hypot(x + .5 - bx, y + .5 - by); if (d > r) continue;
      const i = ((y * FW * N) + ox + x) * 4; if (D[i + 3]) continue;
      put(ox + x, y, d < r * .45 && p < .5 ? PAL[3] : PAL[p < .55 ? 2 : 1], 255);
    }
    // fagulhas
    for (let s = 0; s < 2; s++) {
      const q = (p + s * .5) % 1, sy = Math.round(12 - q * 12), sx = Math.round(cx + Math.sin(t * 2 + s * 3) * 3.2);
      if (sy >= 0 && sx >= 0 && sx < FW) { const i = ((sy * FW * N) + ox + sx) * 4; D[i + 3] || put(ox + sx, sy, q < .5 ? PAL[4] : PAL[3], q < .7 ? 255 : 170); }
    }
  }
  g.putImageData(img, 0, 0);
  return cv;
}
(() => {
  const SP = j.GameObjects.Sprite.prototype, P0 = SP.play;
  let EMB = 0;
  SP.play = function (key, ign) {
    if (key === "torch-flame-burn" && !this.__fogo) {
      this.__fogo = 1;
      const r = P0.call(this, { key, randomFrame: !0, timeScale: .82 + Math.random() * .36 }, ign);
      const S = this.scene; S && S.time && S.time.delayedCall(0, () => { try { __fogoVida(S, this); } catch (e) {} });
      return r;
    }
    return P0.call(this, key, ign);
  };
  function __fogoVida(S, f) {
    if (!f.active) return;
    const sc = Math.abs(f.scaleX || 1);
    // brilho que tremula: luzes ADD perto da chama
    for (const o of S.children.list) {
      if (o === f || o.__fogoLuz || S.tweens.isTweening(o) || o.type !== "Image" || o.blendMode !== j.BlendModes.ADD) continue;
      if (Math.abs(o.x - f.x) > 22 * sc || Math.abs(o.y - f.y) > 30 * sc) continue;
      o.__fogoLuz = 1; const a = o.alpha, s = o.scaleX;
      S.tweens.add({ targets: o, alpha: a * .74, duration: 110 + Math.random() * 90, yoyo: !0, repeat: -1, ease: "Sine.easeInOut", repeatDelay: Math.random() * 120 });
      S.tweens.add({ targets: o, scaleX: s * 1.07, scaleY: o.scaleY * 1.07, duration: 700 + Math.random() * 500, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" });
    }
    // fogueiras: línguas laterais para o fogo ficar cheio
    if (sc >= 1.6) {
      for (const dx of [-1, 1]) {
        const e = S.add.sprite(f.x + dx * 4.5 * sc / 1.7, f.y + 1, "torch-flame", 0).setOrigin(f.originX, f.originY).setScale(sc * .62).setFlipX(dx > 0).setDepth(f.depth - .1).setAlpha(.95);
        e.__fogo = 1; P0.call(e, { key: "torch-flame-burn", randomFrame: !0, timeScale: .9 + Math.random() * .3 });
        f.parentContainer && f.parentContainer.add(e);
        f.once("destroy", () => e.destroy());
      }
    }
    // braseiros/fogueiras: fagulhas subindo (só perto da câmera, com limite global)
    if (sc >= 1.1 && !f.parentContainer) {
      const ev = S.time.addEvent({ delay: 260 + Math.random() * 200, loop: !0, callback: () => {
        if (!f.active) { ev.remove(); return; }
        if (!f.visible || EMB > 60) return;
        const cam = S.cameras.main, v = cam.worldView;
        if (f.x < v.x - 20 || f.x > v.right + 20 || f.y < v.y - 40 || f.y > v.bottom + 20) return;
        const top = f.y - f.displayHeight * (f.originY - .25);
        const e = S.add.rectangle(f.x + (Math.random() - .5) * 6 * sc, top, 1.4, 1.4, Math.random() < .5 ? 0xffd24a : 0xff8a2a).setDepth(f.depth + 1).setBlendMode(j.BlendModes.ADD);
        EMB++;
        S.tweens.add({ targets: e, y: top - 22 - Math.random() * 26 * sc, x: e.x + (Math.random() - .5) * 16, alpha: 0, duration: 900 + Math.random() * 700, ease: "Sine.easeOut", onComplete: () => { EMB--; e.destroy(); } });
      } });
      f.once("destroy", () => ev.remove());
    }
  }
})();
