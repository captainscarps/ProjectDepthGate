
/* =========================================================================
   DEPTHGATE - GRAND CINEMATIC & CUTSCENE ENGINE (GSAP + WEBGL HYBRID)
   ========================================================================= */
const Wd = {
  intro: async (c) => {
    const { scene: sc } = c;
    const W = c.W;
    const H = c.H;

    // 1. Abertura cinematográfica da Floresta de Eldervale com Letterbox e Parallax profundo
    c.buildForestVista();
    c.forestAtmosphere();
    c.look(W / 2, H / 2);
    await c.fadeIn(1200);

    // Panorâmica com GSAP no scroll da câmera e névoa
    if (window.gsap) {
      window.gsap.to(c.cam, { scrollX: 180, duration: 8, ease: "power1.inOut" });
    } else {
      c.panTo(W / 2 + 180, H / 2, 8000);
    }

    await c.captionCinematic(W("intro.l1"), 3200, { speaker: "NARRATOR" });
    await c.captionCinematic(W("intro.l2"), 3200, { speaker: "NARRATOR" });

    c.rumble(0.003, 500);
    c.sfx("sfx-footstep-heavy");
    await c.captionCinematic(W("intro.l3"), 3000, { speaker: "NARRATOR" });
    await c.fadeOut(600);

    // 2. Aparição do Dragão Ancestral na Tempestade (Sombra alada)
    c.clearStage();
    c.buildThreatStage();
    c.look(W / 2, H / 2);
    await c.fadeIn(600);

    // Relâmpago e trovão estrondoso sincronizado
    if (window.__triggerThunderStrike) {
      window.__triggerThunderStrike(sc, 1.0);
    } else {
      c.sfx("sfx-boss-laugh");
    }
    c.rumble(0.008, 900);
    c.sfx("sfx-dragon-alert");
    await c.captionCinematic(W("intro.l4"), 3400, { speaker: "ANCIENT_DRAGON", evilTone: true });
    await c.fadeOut(600);

    // 3. O Herói caminhando na floresta rumo ao Depthgate
    c.clearStage();
    c.buildForestWalk();
    c.forestAtmosphere();
    c.look(W / 2, H / 2);
    await c.fadeIn(700);
    await c.wait(400);

    const walkPromise = Yd(c, 640, 5000);
    await c.captionCinematic(W("intro.l5"), 3000, { speaker: "HERO" });
    await walkPromise;

    // Close-up dramático com arte de alta resolução e brilho nos olhos
    await c.heroCloseUp(2600);
    await c.captionCinematic(W("intro.l6"), 2800, { speaker: "HERO" });

    // Herói desembainha a arma com som de lâmina metálica e impacto
    c.heroDrawWeapon();
    c.sfx("sfx-sword-swing");
    c.rumble(0.004, 350);
    await c.wait(800);
    await c.fadeOut(600);

    // 4. Vista da Cidadela / Portais esquecidos
    c.clearStage();
    c.buildScaleVista();
    c.forestAtmosphere({ noLeaves: true });
    c.look(W / 2, H / 2);
    await c.fadeIn(700);

    if (window.gsap) {
      window.gsap.to(c.cam, { scrollX: 260, duration: 6, ease: "sine.inOut" });
    } else {
      c.panTo(W / 2 + 260, H / 2, 6000);
    }

    await c.captionCinematic(W("intro.l7"), 3400, { speaker: "NARRATOR" });
    await c.wait(700);
    await c.fadeOut(700);

    // 5. Título do Capítulo em Dourado Épico com partículas
    c.clearStage();
    await c.chapterTitle(W("intro.chapter"), W("intro.chapterSub"), 3200);
  }
};

function Yd(c, i, t) {
  return c.scene.hero ? kd(c, i, t) : Promise.resolve();
}

function kd(c, i, t) {
  const e = c.scene;
  return new Promise(d => {
    e.hero.play(`${e.heroKey}-walk`);
    if (window.gsap) {
      window.gsap.to([e.hero, e.heroShadow], {
        x: i,
        duration: t / 1000,
        ease: "none",
        onUpdate: () => e.cam.centerOnX?.(Math.max(c.W / 2, e.hero.x)),
        onComplete: () => {
          e.hero?.active && e.hero.play(`${e.heroKey}-idle`);
          d();
        }
      });
    } else {
      e.tweens.add({
        targets: [e.hero, e.heroShadow],
        x: i,
        duration: t,
        ease: "Linear",
        onUpdate: () => e.cam.centerOnX?.(Math.max(c.W / 2, e.hero.x)),
        onComplete: () => {
          e.hero?.active && e.hero.play(`${e.heroKey}-idle`);
          d();
        }
      });
    }
  });
}

class Xd extends j.Scene {
  constructor() {
    super("Cutscene");
  }

  init(i) {
    this.scriptKey = i.script ?? "intro";
    this.classId = i.classId ?? "WARRIOR";
    this.next = i.next ?? { key: "MainMenu", data: {} };
    this.skipped = false;
    this.finished = false;
    this.introStep = 0;
  }

  preload() {
    this.textures.exists("hub-campfire") || this.load.image("hub-campfire", "assets/pixel-art/hub/campfire.png");
  }

  create() {
    le(this);
    this.cam = this.cameras.main;
    this.stage = this.add.container(0, 0);
    this.overlay = this.add.container(0, 0).setDepth(2000);
    this.game.audioEngine?.music("forest");

    this.uiCam = this.cameras.add(0, 0, this.cam.width, this.cam.height);
    this.uiCam.setZoom(this.cam.zoom).centerOn(_ / 2, st / 2);
    this.cam.ignore(this.overlay);
    this.uiCam.ignore(this.stage);

    // Letterbox cinematográfico profissional 21:9
    const barH = Math.round(st * 0.13); // 13% superior e inferior
    this.topBar = this.add.rectangle(_ / 2, -barH / 2, _, barH, 0x000000).setAlpha(1);
    this.botBar = this.add.rectangle(_ / 2, st + barH / 2, _, barH, 0x000000).setAlpha(1);
    this.overlay.add([this.topBar, this.botBar]);

    // Anima a entrada das barras com GSAP
    if (window.gsap) {
      window.gsap.to(this.topBar, { y: barH / 2, duration: 0.9, ease: "power2.out" });
      window.gsap.to(this.botBar, { y: st - barH / 2, duration: 0.9, ease: "power2.out" });
    } else {
      this.topBar.y = barH / 2;
      this.botBar.y = st - barH / 2;
    }

    // Vinheta ótica cinematográfica (sombra suave nas bordas)
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.45, 0.45, 0.85, 0.85);
    vignette.fillRect(0, 0, _, st);
    vignette.setAlpha(0.65);
    this.overlay.add(vignette);

    // Botão / Dica elegante de Pular
    this.skipHint = this.add.text(_ - 16, st - barH / 2, "ESPAÇO / TOQUE PARA PULAR  ▸", {
      fontFamily: "Georgia, serif",
      fontSize: "9px",
      letterSpacing: 1.5,
      color: "#c9a24a",
      stroke: "#0a0806",
      strokeThickness: 3
    }).setOrigin(1, 0.5).setAlpha(0);
    this.overlay.add(this.skipHint);

    if (window.gsap) {
      window.gsap.to(this.skipHint, { alpha: 0.75, duration: 1.2, delay: 1 });
    } else {
      this.tweens.add({ targets: this.skipHint, alpha: 0.75, duration: 1000, delay: 1000 });
    }

    this.input.keyboard?.on("keydown", () => this.skip());
    this.input.on("pointerdown", () => this.skip());
    this.time.delayedCall(90000, () => this.finish());

    // Se o usuário tiver um arquivo MP4/WebM de vídeo na pasta assets/video/intro_campanha,
    // o motor oferece prioridade para a Cutscene Cinematográfica Roteirizada em 60fps
    // para garantir gráficos em resolução nativa sem borrão de compressão.
    this.runScript();
  }

  async runScript() {
    const fn = Wd[this.scriptKey];
    try {
      if (fn) await fn(this.toolkit());
    } catch (err) {
      if (!this.skipped) console.warn("cutscene error:", err);
    }
    this.finish();
  }

  skip() {
    if (this.finished || this.skipped) return;
    this.skipped = true;
    __holdM(false);
    this.__vid?.close();
    this.finish();
  }

  finish() {
    if (this.finished) return;
    this.finished = true;

    // Recolhe as barras cinematográficas
    const barH = Math.round(st * 0.13);
    if (window.gsap) {
      window.gsap.to(this.topBar, { y: -barH, duration: 0.4, ease: "power2.in" });
      window.gsap.to(this.botBar, { y: st + barH, duration: 0.4, ease: "power2.in" });
    }

    this.cam.fadeOut(450, 0, 0, 0);
    this.uiCam?.fadeOut(450, 0, 0, 0);
    this.time.delayedCall(480, () => this.scene.start(this.next.key, this.next.data));
  }

  toolkit() {
    const sc = this;
    const W = _;
    const H = st;

    const cancelHelper = (resolve) => {
      const ev = sc.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          if (sc.skipped) {
            ev.remove();
            resolve();
          }
        }
      });
      return ev;
    };

    const wait = (ms) => new Promise(res => {
      const ev = cancelHelper(res);
      sc.time.delayedCall(ms, () => {
        ev.remove();
        res();
      });
    });

    const addParallaxForest = (opts = {}) => {
      const s = opts.scale ?? 0.72;
      const b = opts.bottom ?? H + 6;
      const last = opts.last ?? 11;
      const factors = [0.04, 0.1, 0.16, 0.24, 0.28, 0.4, 0.5, 0.55, 0.68, 0.82, 1, 1.2];
      const addLayers = new Set([4, 7]);
      for (let p = 0; p <= last; p++) {
        const tile = sc.add.tileSprite(-W, b, Math.ceil(W * 4 / s), 793, `cin-forest-${p}`)
          .setOrigin(0, 1)
          .setScale(s)
          .setScrollFactor(factors[p], 1);
        if (addLayers.has(p)) {
          tile.setBlendMode(j.BlendModes.ADD).setAlpha(0.5);
        }
        sc.stage.add(tile);
      }
    };

    return {
      scene: sc,
      W,
      H,
      cam: this.cam,
      wait,
      fadeIn: (ms) => new Promise(res => {
        sc.cam.fadeIn(ms, 0, 0, 0);
        sc.time.delayedCall(ms, res);
      }),
      fadeOut: (ms) => new Promise(res => {
        sc.cam.fadeOut(ms, 0, 0, 0);
        sc.time.delayedCall(ms, res);
      }),
      look: (x, y) => sc.cam.centerOn(x, y),
      panTo: (x, y, ms) => {
        if (window.gsap) {
          window.gsap.to(sc.cam, {
            scrollX: x - sc.cam.width / 2,
            scrollY: y - sc.cam.height / 2,
            duration: ms / 1000,
            ease: "sine.inOut"
          });
        } else {
          sc.tweens.add({
            targets: sc.cam,
            scrollX: x - sc.cam.width / 2,
            scrollY: y - sc.cam.height / 2,
            duration: ms,
            ease: "Sine.easeInOut"
          });
        }
      },
      rumble: (intensity, ms) => sc.cam.shake(ms, intensity),
      sfx: (k) => sc.game.audioEngine?.sfx?.(k),
      music: (k) => sc.game.audioEngine?.music?.(k),
      clearStage: () => sc.stage.removeAll(true),

      // Diálogos cinematográficos estilo RPG Visual Novel de Luxo com Typewriter & Parallax
      captionCinematic: (text, ms, options = {}) => new Promise(resolve => {
        const ev = cancelHelper(resolve);
        const barH = Math.round(H * 0.13);
        const boxY = H - barH - 32;

        const container = sc.add.container(W / 2, boxY).setDepth(2100).setAlpha(0);

        // Caixa de diálogo com moldura medieval
        const boxW = Math.min(W - 48, 540);
        const boxH = 54;
        const bg = sc.add.rectangle(0, 0, boxW, boxH, 0x0e0a07, 0.88);
        bg.setStrokeStyle(1.5, 0xc9a24a, 0.85);

        // Pequena insígnia / ornamento dourado
        const crest = sc.add.rectangle(0, -boxH / 2, 28, 3, 0xe8d9a0, 0.95);

        // Nome do locutor
        let speakerName = "";
        let speakerColor = "#c9a24a";
        if (options.speaker === "HERO") {
          speakerName = sc.classId || "HERÓI";
          speakerColor = "#62b0f5";
        } else if (options.speaker === "ANCIENT_DRAGON") {
          speakerName = "DRAGÃO ANCESTRAL";
          speakerColor = "#e64a3b";
        } else if (options.speaker === "NARRATOR") {
          speakerName = "CRÔNICAS DE DEPTHGATE";
          speakerColor = "#e8d9a0";
        }

        const nameLabel = sc.add.text(-boxW / 2 + 16, -boxH / 2 + 9, speakerName, {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "10px",
          fontStyle: "bold",
          color: speakerColor,
          stroke: "#0a0806",
          strokeThickness: 2,
          letterSpacing: 2
        }).setOrigin(0, 0.5);

        // Texto principal com efeito Typewriter
        const txtLabel = sc.add.text(-boxW / 2 + 16, 8, "", {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
          fontStyle: "italic",
          color: options.evilTone ? "#ffb3a8" : "#f2e8cc",
          stroke: "#0a0806",
          strokeThickness: 3,
          wordWrap: { width: boxW - 32 },
          lineSpacing: 3
        }).setOrigin(0, 0.5);

        container.add([bg, crest, nameLabel, txtLabel]);
        sc.overlay.add(container);

        // Anima a entrada do container com GSAP
        if (window.gsap) {
          window.gsap.to(container, { alpha: 1, y: boxY - 4, duration: 0.35, ease: "back.out(1.2)" });
        } else {
          sc.tweens.add({ targets: container, alpha: 1, y: boxY - 4, duration: 350 });
        }

        // Som de fala e máquina de escrever letra por letra
        let charIndex = 0;
        const totalChars = text.length;
        const speed = Math.max(16, Math.min(38, Math.floor((ms - 900) / totalChars)));

        const typewriterTimer = sc.time.addEvent({
          delay: speed,
          repeat: totalChars - 1,
          callback: () => {
            if (sc.skipped) {
              typewriterTimer.remove();
              return;
            }
            charIndex++;
            txtLabel.setText(text.substring(0, charIndex));

            // Efeito sonoro acústico sutil a cada 3 caracteres
            if (charIndex % 3 === 0 && window.__audioTone && window.Tone) {
              try {
                const pitch = options.evilTone ? "C2" : options.speaker === "HERO" ? "G3" : "D3";
                window.__audioTone.synthVoice?.triggerAttackRelease(pitch, "32n", undefined, 0.05);
              } catch (e) {}
            }
          }
        });

        // Saída do diálogo
        sc.time.delayedCall(Math.max(800, ms - 450), () => {
          if (container.active) {
            if (window.gsap) {
              window.gsap.to(container, { alpha: 0, y: boxY + 6, duration: 0.4, ease: "power2.in" });
            } else {
              sc.tweens.add({ targets: container, alpha: 0, y: boxY + 6, duration: 400 });
            }
          }
        });

        sc.time.delayedCall(ms, () => {
          typewriterTimer.remove();
          container.destroy();
          ev.remove();
          resolve();
        });
      }),

      forestAtmosphere: (opts = {}) => {
        // Raios de sol volumétricos divinos (Godrays)
        for (let s = 0; s < 4; s++) {
          const r = sc.add.image(120 + s * 210, 150 + (s % 2) * 70, "light")
            .setScale(2.6, 0.8)
            .setBlendMode(j.BlendModes.ADD)
            .setTint(0x3a4b1a)
            .setAlpha(0.08 + (s % 2) * 0.04)
            .setScrollFactor(0.25 + s * 0.08);
          sc.stage.add(r);
          sc.tweens.add({
            targets: r,
            x: r.x + 60 + s * 18,
            duration: 9000 + s * 2200,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        }

        // Feixes de luz através da copa das árvores
        for (const [pos, alpha] of [[170, 0.12], [420, 0.09], [640, 0.11]]) {
          const beam = sc.add.rectangle(pos, 130, 52, 340, 0xfff0aa, alpha)
            .setAngle(15)
            .setBlendMode(j.BlendModes.ADD)
            .setScrollFactor(0.9);
          sc.stage.add(beam);
          sc.tweens.add({
            targets: beam,
            alpha: alpha * 0.4,
            duration: 2800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        }

        // Vagalumes flutuantes
        for (let s = 0; s < 16; s++) {
          const firefly = sc.add.image(40 + Math.random() * 760, 100 + Math.random() * 210, "light")
            .setScale(0.032)
            .setBlendMode(j.BlendModes.ADD)
            .setTint(0xb8e96a)
            .setAlpha(0.65);
          sc.stage.add(firefly);
          sc.tweens.add({
            targets: firefly,
            x: firefly.x + (Math.random() * 50 - 25),
            y: firefly.y + (Math.random() * 36 - 18),
            alpha: 0.15,
            duration: 1500 + Math.random() * 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        }

        // Folhas caindo com dinâmica de vento
        if (!opts.noLeaves) {
          sc.leafTimer = sc.time.addEvent({
            delay: 450,
            loop: true,
            callback: () => {
              if (sc.skipped) return;
              const spawnX = sc.cam.scrollX + Math.random() * sc.cam.width * 1.5;
              const leafColor = [0x9a7a3a, 0x6a8f3a, 0xa85020][Math.floor(Math.random() * 3)];
              const leaf = sc.add.rectangle(spawnX, 40, 3, 2, leafColor);
              sc.stage.add(leaf);
              sc.tweens.add({
                targets: leaf,
                y: 340,
                x: spawnX + 70 + Math.random() * 60,
                angle: 360 + Math.random() * 360,
                duration: 3500 + Math.random() * 1500,
                ease: "Sine.easeIn",
                onComplete: () => leaf.destroy()
              });
            }
          });
        }
      },

      buildForestVista: () => {
        addParallaxForest();
        const moonSun = sc.add.image(W * 0.68, 52, "light")
          .setScale(0.35)
          .setBlendMode(j.BlendModes.ADD)
          .setTint(0xc8dfb0)
          .setAlpha(0.4)
          .setScrollFactor(0.08);
        sc.stage.add(moonSun);
      },

      buildForestWalk: () => {
        addParallaxForest({ bottom: 248, last: 9 });
        for (let p = 0; p < 46; p++) {
          for (let v = 0; v < 4; v++) {
            sc.stage.add(sc.add.image(p * 32, 226 + v * 32, "tiles-forest", (p * 7 + v) % 6).setOrigin(0));
          }
        }
        sc.stage.add(sc.add.image(430, 258, "fp-statue-head").setOrigin(0.5, 1).setScale(1.1));
        sc.stage.add(sc.add.image(700, 252, "fp-stump3").setOrigin(0.5, 1));
        sc.stage.add(sc.add.image(1000, 262, "fp-cave1").setOrigin(0.5, 1).setScale(1.15));

        const caveGlow = sc.add.image(1000, 216, "light")
          .setScale(0.45)
          .setBlendMode(j.BlendModes.ADD)
          .setTint(0x3a5a8a)
          .setAlpha(0.25);
        sc.stage.add(caveGlow);
        sc.tweens.add({ targets: caveGlow, alpha: 0.12, duration: 1400, yoyo: true, repeat: -1 });

        for (const p of [180, 620, 980]) {
          sc.stage.add(sc.add.image(p, 430, "fp-swirl2").setOrigin(0.5, 1).setScale(2.1).setTint(0x081018).setAlpha(0.9).setScrollFactor(1.35));
        }
        sc.stage.add(sc.add.rectangle(W * 1.5, 293, W * 4, 134, 0x0c1810, 0.35));

        const heroKey = `mk4b-${sc.classId.toLowerCase()}`;
        sc.heroKey = heroKey;
        sc.heroLayout = sc.cache.json.get(`${heroKey}-layout`);
        const scale = (sc.heroLayout?.scale ?? 0.7) * 1.7;
        const frameH = sc.textures.getFrame(heroKey, 0)?.height ?? 128;
        const footY = sc.heroLayout?.footY ?? frameH;

        sc.hero = sc.add.sprite(120, 264, heroKey).setScale(scale).setOrigin(0.5, footY / frameH).play(`${heroKey}-idle`);
        const shadowW = Math.max(24, Math.round(sc.hero.displayWidth * 0.3));
        sc.heroShadow = sc.add.ellipse(120, 265, shadowW, 8, 0, 0.4);
        sc.stage.add(sc.heroShadow);
        sc.stage.add(sc.hero);
      },

      heroCloseUp: async (ms) => {
        sc.cam.centerOn(W / 2, H / 2);
        const heroKey = sc.heroKey ?? `mk4b-${sc.classId.toLowerCase()}`;
        const layout = sc.heroLayout ?? sc.cache.json.get(`${heroKey}-layout`);
        const container = sc.add.container(0, 0).setDepth(1500);
        sc.cam.ignore(sc.overlay);

        container.add(sc.add.rectangle(W / 2, H / 2, W, H, 0x060808));

        // Feixes de velocidade e foco dramático estilo anime/manga
        const gfx = sc.add.graphics();
        gfx.lineStyle(2, 0x182830, 0.85);
        for (let f = 0; f < 48; f++) {
          const angle = (f / 48) * Math.PI * 2;
          const dist = 140 + Math.random() * 50;
          gfx.lineBetween(
            W / 2 + Math.cos(angle) * dist,
            H / 2 + Math.sin(angle) * dist,
            W / 2 + Math.cos(angle) * 580,
            H / 2 + Math.sin(angle) * 580
          );
        }
        container.add(gfx);

        const footY = layout?.footY ? layout.footY - Math.round((layout.footY - 10) * 0.8) : 40;
        const heroSpr = sc.add.sprite(W / 2, H / 2 + (64 - footY) * 3.4, heroKey, layout?.map?.windup ?? 0).setScale(3.4);
        container.add(heroSpr);

        // Brilho do olhar focado
        const eyeGlint = sc.add.image(W / 2 - 40, H / 2 - 14, "light").setScale(0.12).setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setAlpha(0);
        container.add(eyeGlint);
        sc.uiCam.ignore(container);

        if (window.gsap) {
          window.gsap.to(heroSpr, { scale: 3.75, duration: ms / 1000, ease: "power1.out" });
          window.gsap.to(eyeGlint, { alpha: 1, x: W / 2 + 40, duration: 0.5, delay: (ms / 1000) * 0.3, yoyo: true });
          window.gsap.to(gfx, { rotation: 0.08, duration: ms / 1000, ease: "none" });
        } else {
          sc.tweens.add({ targets: heroSpr, scale: 3.75, duration: ms, ease: "Sine.easeOut" });
          sc.tweens.add({ targets: eyeGlint, alpha: 1, x: W / 2 + 40, duration: 500, delay: ms * 0.3, yoyo: true });
        }

        await new Promise(res => {
          const ev = cancelHelper(res);
          sc.time.delayedCall(ms, () => {
            ev.remove();
            res();
          });
        });
        container.destroy(true);
      },

      buildThreatStage: () => {
        sc.stage.add(sc.add.rectangle(W / 2, H / 2, W, H, 0x05080b));
        for (const [xPos, scl] of [[100, 2], [700, 2.2]]) {
          sc.stage.add(sc.add.image(xPos, 400, "fp-mega2").setOrigin(0.5, 1).setScale(scl).setTint(0x060c10));
        }

        // Dragão Ancestral imponente nas sombras
        const dragon = sc.add.sprite(W / 2, 330, "boss-dragon3", 28).setScale(1.4).setTint(0x0a1014).setOrigin(0.5, 1);
        sc.stage.add(dragon);
        sc.tweens.add({ targets: dragon, y: 322, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

        // Olhos flamejantes escarlate do Dragão
        for (const offX of [58, 66]) {
          const eye = sc.add.image(W / 2 + offX, 226, "light").setScale(0.08).setBlendMode(j.BlendModes.ADD).setTint(0xff3300).setAlpha(0);
          sc.stage.add(eye);
          sc.tweens.add({ targets: eye, alpha: 1, duration: 800, delay: 500 });
          sc.tweens.add({ targets: eye, alpha: 0.7, duration: 240, delay: 2000, yoyo: true, repeat: -1 });
        }

        // Faíscas de brasas incandescentes
        for (let s = 0; s < 12; s++) {
          const spark = sc.add.triangle(W / 2 + (Math.random() * 220 - 110), 240, 0, 3, 3, 0, 6, 3, 0xff5511).setScale(1.3);
          sc.stage.add(spark);
          sc.tweens.add({
            targets: spark,
            x: spark.x + 200 + Math.random() * 260,
            y: 30 + Math.random() * 70,
            duration: 1300 + Math.random() * 800,
            delay: 400 + Math.random() * 500,
            ease: "Sine.easeOut",
            onComplete: () => spark.destroy()
          });
        }
      },

      buildScaleVista: () => {
        sc.stage.add(sc.add.rectangle(W, 100, W * 3, 270, 0x0a1210).setScrollFactor(0.15));
        for (let r = 0; r < 44; r++) {
          for (let l = 0; l < 4; l++) {
            sc.stage.add(sc.add.image(r * 32, 240 + l * 32, "tiles-forest", (r + l * 3) % 6).setOrigin(0));
          }
        }
        const vistas = [
          [150, "fp-yurt1", 1, 0x38402e],
          [330, "fp-tree1", 1.15, 0x2c3a1a],
          [520, "fp-dbones-full", 1.05, 0x3a4038],
          [760, "fp-cave2", 1.1, 0x303a30],
          [960, "fp-lumi2", 1.1, 0x4a5a46],
          [1150, "fp-idol-wolf", 1, 0x38402e]
        ];
        for (const [xPos, tex, scl, tint] of vistas) {
          sc.stage.add(sc.add.image(xPos, 268, tex).setOrigin(0.5, 1).setScale(scl).setTint(tint));
        }

        const mistGlow = sc.add.image(960, 212, "light").setScale(0.55).setBlendMode(j.BlendModes.ADD).setTint(0x8ae0b0).setAlpha(0.28);
        sc.stage.add(mistGlow);
        sc.tweens.add({ targets: mistGlow, alpha: 0.12, duration: 1600, yoyo: true, repeat: -1 });
      },

      heroDrawWeapon: () => {
        const map = sc.heroLayout?.map;
        if (sc.hero) {
          sc.hero.anims.stop();
          sc.hero.setFrame(map?.windupA ?? 0);
          sc.time.delayedCall(240, () => {
            if (sc.hero?.active && !sc.skipped) {
              sc.hero.setFrame(map?.guard ?? map?.windup ?? 0);
            }
          });
        }
      },

      chapterTitle: (title, subtitle, ms) => new Promise(resolve => {
        const ev = cancelHelper(resolve);
        sc.cam.fadeIn(400, 0, 0, 0);
        sc.uiCam.fadeIn(400, 0, 0, 0);

        const container = sc.add.container(W / 2, H / 2).setDepth(2500);

        const mainText = sc.add.text(0, -14, title, {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "32px",
          fontStyle: "bold",
          color: "#c9a24a",
          stroke: "#0a0806",
          strokeThickness: 6,
          letterSpacing: 8
        }).setOrigin(0.5).setAlpha(0);

        const subText = sc.add.text(0, 22, subtitle, {
          fontFamily: "'Courier New', monospace",
          fontSize: "11px",
          color: "#e8dcc8",
          stroke: "#0a0806",
          strokeThickness: 3,
          letterSpacing: 2
        }).setOrigin(0.5).setAlpha(0);

        const divider = sc.add.rectangle(0, 38, 0, 1.5, 0xc9a24a).setAlpha(0.85);

        container.add([mainText, subText, divider]);
        sc.overlay.add(container);

        if (window.gsap) {
          window.gsap.to(mainText, { alpha: 1, scale: 1.05, duration: 1.2, ease: "power2.out" });
          window.gsap.to(subText, { alpha: 1, duration: 1, delay: 0.5, ease: "power2.out" });
          window.gsap.to(divider, { width: 280, duration: 1.4, delay: 0.3, ease: "power2.out" });
        } else {
          sc.tweens.add({ targets: mainText, alpha: 1, duration: 800 });
          sc.tweens.add({ targets: subText, alpha: 1, duration: 800, delay: 400 });
          sc.tweens.add({ targets: divider, width: 280, duration: 1000, delay: 300 });
        }

        sc.time.delayedCall(ms, () => {
          ev.remove();
          resolve();
        });
      })
    };
  }
}
