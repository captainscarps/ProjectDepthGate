/* ══ Portais em redemoinho (pack PixelPortal, folha gerada por scripts/build_portal_swirl.py) ══
   - A textura "hub-portal" (arco de pedra) é trocada pelo redemoinho claro: todo portal que já usava
     "hub-portal" (Coração da Floresta, Refúgio, vitória da Fenda) vira redemoinho na cor que o jogo já
     aplicava. O do Refúgio usa o azul original e o do Castelo o laranja original.
   - O portal de saída de fase e o de descer de profundidade no modo infinito viram redemoinho azul.
   - Portais que a Guardiã abre (voltar ao Coração, Floresta da Cripta, casa da bruxa) são brancos e
     mais brilhantes. */
const __PP = {
  K: "pp-portal",
  anims(S) {
    const A = S.anims, T = S.textures;
    if (!T.exists(this.K)) return !1;
    for (const [k, a] of [["pp-w", 0], ["pp-b", 9], ["pp-o", 18]]) A.exists(k) || A.create({ key: k, frames: A.generateFrameNumbers(this.K, { start: a, end: a + 8 }), frameRate: 11, repeat: -1 });
    return !0;
  },
  // sprite animado com brilho somado por cima
  make(S, x, y, kind = "w", sc = 1, tint = null, depth = null) {
    if (!this.anims(S)) return null;
    const d = depth ?? y, s = S.add.sprite(x, y, this.K, 0).setOrigin(.5, 1).setScale(sc).setDepth(d);
    s.play("pp-" + kind); s.anims.setProgress(Math.random());
    tint != null && s.setTint(tint);
    const ov = S.add.sprite(x, y, this.K, 0).setOrigin(.5, 1).setScale(sc).setDepth(d + .5).setBlendMode(j.BlendModes.ADD).setAlpha(.3);
    ov.play("pp-" + kind); ov.anims.setProgress(s.anims.getProgress()); tint != null && ov.setTint(tint);
    S.tweens.add({ targets: ov, alpha: .55, duration: 1100, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" });
    const sh = S.add.ellipse(x, y - 1, 30 * sc, 8 * sc, 0, .32).setDepth(d - 1);
    return { s, ov, sh, destroy() { s.destroy(); ov.destroy(); sh.destroy() } };
  },
};
{
  // troca a textura do arco pelo redemoinho assim que tudo carregou
  const C0 = bo.prototype.create;
  bo.prototype.create = function () {
    try {
      const T = this.textures;
      if (T.exists(__PP.K)) {
        const img = T.get(__PP.K).getSourceImage();
        T.exists("hub-portal") && T.remove("hub-portal");
        T.addSpriteSheet("hub-portal", img, { frameWidth: 64, frameHeight: 64 });
        this.anims.exists("hub-portal-a") && this.anims.remove("hub-portal-a");
        this.anims.create({ key: "hub-portal-a", frames: this.anims.generateFrameNumbers("hub-portal", { start: 0, end: 8 }), frameRate: 11, repeat: -1 });
      }
    } catch (e) { console.warn("[portal]", e) }
    return C0.apply(this, arguments);
  };
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try { const L = this.load, op = L.path; L.setPath(""); this.textures.exists(__PP.K) || L.spritesheet(__PP.K, "assets/pixel-art/props/pp-portal.png", { frameWidth: 64, frameHeight: 64 }); L.setPath(op) } catch (e) {}
    return r;
  };
  // Coração da Floresta: Refúgio em azul, Castelo em laranja; selados ficam parados
  const HP = __hubPortals;
  __hubPortals = function (S) {
    const had = !!S.__hubPortals, r = HP.apply(this, arguments);
    try {
      if (had || !S.__hubPortals || !__PP.anims(S)) return r;
      for (const p of S.__hubPortals) {
        const kind = p.__level === "__refugio" ? "b" : p.__level === "castle" ? "o" : null;
        if (kind) { p.play("pp-" + kind); p.__ov?.play?.("pp-" + kind); p.__locked ? p.setTint(0x666666) : p.clearTint(); kind === "b" && p.__ov?.setTint?.(0x9fd8ff) }
        if (p.__sealed) p.anims?.pause?.();
      }
    } catch (e) {}
    return r;
  };
  // portal de saída de fase / descida do modo infinito
  const U0 = Sd.prototype.update;
  Sd.prototype.update = function () {
    const r = U0.apply(this, arguments);
    try {
      const P = this.roomManager?.portal;
      if (P && !P.__pp && P.active && __PP.anims(this)) {
        P.__pp = __PP.make(this, P.x, P.y + 26, "b", 1.15, null, P.y + 2);
        if (P.__pp) {
          P.setVisible(!1); P.halo?.setTint?.(0x3a7aff); P.glow?.setTint?.(0x5aa8ff);
          const S = this, F = () => { if (!P.active || !P.scene) { S.events.off("update", F); P.__pp?.destroy(); P.__pp = null } };
          S.events.on("update", F); S.events.once("shutdown", () => S.events.off("update", F));
        }
      }
    } catch (e) {}
    return r;
  };
  // portal que a Guardiã abre: branco e mais brilhante, na frente do herói
  const GL = __goLevel;
  __goLevel = function (S, id, extra = {}) {
    if (S.__ppGoing) return;
    try {
      const guard = !S.transitioning && S.player && (extra?.hubReturn || id === "cripta" || id === "bruxa");
      if (guard && __PP.anims(S)) {
        const x = S.player.x, y = S.player.y - 6, o = __PP.make(S, x, y, "w", .1, 0xf2f7ff, S.player.y - 2);
        if (o) {
          o.ov.setAlpha(.42); o.sh.setAlpha(0);
          S.tweens.add({ targets: [o.s, o.ov], scaleX: 1.45, scaleY: 1.45, duration: 420, ease: "Back.easeOut" });
          const gl = S.add.image(x, y - 46, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setScale(.05).setAlpha(.55).setDepth(y - 3);
          S.tweens.add({ targets: gl, scale: .55, alpha: .38, duration: 500, ease: "Quad.easeOut" });
          const gl2 = S.add.image(x, y - 46, "light").setBlendMode(j.BlendModes.ADD).setTint(0xe8f4ff).setScale(.16).setAlpha(.35).setDepth(y + 1);
          S.tweens.add({ targets: gl2, scale: .32, alpha: .3, duration: 260, yoyo: !0, repeat: -1 });
          S.lighting?.addLight?.({ x, y: y - 40, radius: 150, flicker: .1, color: 0xffffff });
          try { __FX.tex(S); __FX.ring(S, x, y - 30, 0xffffff, 60, 520, y + 2) } catch (e) {}
          S.player && S.tweens.add({ targets: S.player, alpha: .25, duration: 500, delay: 350 });
          // deixa o portal aparecer antes da passagem
          S.__ppGoing = 1; S.player?.setVelocity?.(0, 0); S.uiOpen = !0;
          const self = this, args = arguments;
          S.time.delayedCall(800, () => { S.__ppGoing = 0; if (S.scene.isActive()) GL.apply(self, args) });
          return;
        }
      }
    } catch (e) {}
    return GL.apply(this, arguments);
  };
}
