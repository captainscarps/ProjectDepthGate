/* ══ Refúgio: a Doca (setor aberto para o mar, ao sul do portal) ══
   O chão novo (grama, caminho de tijolo, margem, mar, chão do píer e barcos) já vem no ground.png e a colisão no
   village.json (scripts/build_refugio_dock.py). Aqui: os objetos altos da doca com profundidade pela base (casa,
   rede, tubarão, caixotes, barris, varal de peixes, postes), peixes pulando no mar, brilho na água e o nome do lugar.
   Arte: CraftPix "2D Pixel Fishing Village" (só cenário e peixes; os personagens do pacote não entram). */
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      this.textures.exists("rf-dock") || L.atlas("rf-dock", "assets/pixel-art/hub/refugio/dock.png", "assets/pixel-art/hub/refugio/dock.json");
      for (const k of ["fish-jump", "fish-jump2"]) this.textures.exists("rf-" + k) || L.spritesheet("rf-" + k, `assets/pixel-art/hub/refugio/${k}.png`, { frameWidth: 32, frameHeight: 32 });
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.textures.exists("rf-dock") && __rfDock(this) } catch (e) { console.warn("[doca]", e) }
    return r;
  };
}
function __rfDock(H) {
  const M = H.M, D = M.dockProps, R = M.dockRect; if (!D || !R) return;
  const LIVE = H.__rfLive || [], keep = o => (LIVE.push(o), o), rnd = Math.random;
  for (const [k, x, y] of D) H.add.image(x, y, "rf-dock", k).setOrigin(.5, 1).setDepth(y);
  const A = H.anims;
  A.exists("rf-fj1") || A.create({ key: "rf-fj1", frames: A.generateFrameNumbers("rf-fish-jump", { start: 0, end: 8 }), frameRate: 11 });
  A.exists("rf-fj2") || A.create({ key: "rf-fj2", frames: A.generateFrameNumbers("rf-fish-jump2", { start: 0, end: 8 }), frameRate: 11 });
  const g = M.g, inDock = (x, y) => x > R[0] - 10 && x < R[0] + R[2] + 10 && y > R[1] - 10 && y < R[1] + R[3] + 10;
  const sea = (x, y) => { if (y < M.seaTop + 14 || y > M.h - 16 || x < 24 || x > M.w - 24 || inDock(x, y)) return !1; const r = M.coll[Math.floor(y / g)]; return !!r && r[Math.floor(x / g)] === "1" && r[Math.floor(x / g) + 2] === "1" && r[Math.floor(x / g) - 2] === "1" };
  const spot = () => { for (let i = 0; i < 20; i++) { const x = 30 + rnd() * (M.w - 60), y = M.seaTop + 20 + rnd() * (M.h - M.seaTop - 40); if (sea(x, y)) return [x, y] } return null };
  // peixes pulando de vez em quando
  keep(((ev) => ({ destroy: () => ev.remove() }))(H.time.addEvent({ delay: 2200, loop: !0, callback: () => {
    if (H.area !== "out" || rnd() < .45) return; const p = spot(); if (!p) return;
    const f = H.add.sprite(p[0], p[1], rnd() < .5 ? "rf-fish-jump" : "rf-fish-jump2", 0).setOrigin(.5, .8).setDepth(p[1]).setFlipX(rnd() < .5);
    f.play(f.texture.key === "rf-fish-jump" ? "rf-fj1" : "rf-fj2"); f.once("animationcomplete", () => f.destroy());
  } })));
  // brilho na água: risquinhos claros que acendem e apagam
  __rfTex?.(H);
  for (let i = 0; i < 34; i++) {
    const p = spot(); if (!p) continue;
    const s = keep(H.add.image(p[0], p[1], "rf-px")).setDisplaySize(4 + ((rnd() * 4) | 0) * 2, 1).setTint(0xd8f0ff).setAlpha(0).setDepth(-20);
    keep(H.tweens.add({ targets: s, alpha: { from: 0, to: .7 }, duration: 700 + rnd() * 700, yoyo: !0, repeat: -1, repeatDelay: 1200 + rnd() * 3000, delay: rnd() * 3000 }));
  }
  // nome do lugar
  const sp = M.spots.dock || [R[0] + 150, R[1] + 118];
  const lab = H.add.text(sp[0] + 60, R[1] + 10, __L3("DOCA", "DOCK", "MUELLE"), { ...Le, fontSize: "8px", color: "#a8d8f0", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.7).setDepth(9100).setAlpha(.9);
  H.labels.push(lab);
}
