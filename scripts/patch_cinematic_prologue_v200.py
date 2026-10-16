# -*- coding: utf-8 -*-
"""
Script de atualização cinematográfica v2.0.0:
Substitui o antigo vídeo de introdução da campanha pelo novo Living Cinematic Engine
utilizando as 5 ilustrações oficiais de alta fidelidade fornecidas pelo usuário:
- Slide 1: Portal de pedra nas ruínas (ruínas de Eldervale ao sol)
  "Durante séculos, contamos a mesma história..."
- Slide 2: Zoom cinematográfico contínuo em direção ao vórtice azul do portal
  "Eles não foram destruídos. Eles fugiram... e deixaram algo para trás."
- Slide 3: O Rei de Valdrak no castelo diante do olho descomunal emergindo do portal abissal
  "Em Valdrak, um rei abriu as portas do castelo para salvar o seu povo..."
- Slide 4: O selo rúnico ancestral estilhaçando com chamas e energias abissais roxas
  "Por séculos, os selos permaneceram intactos. Até esta noite..."
- Slide 5: Todos os heróis (Paladino, Samurai com katanas, Arqueira, Mago, Ladina, Xamã) diante do portal
  "Eu procurei aqueles que poderiam atravessar os portais. Convocados de eras e dimensões distintas..."
- Slide 6: A Guardiã com cajado no altar sagrado falando diretamente aos heróis
  "“Vocês não foram escolhidos por serem os mais fortes...” “Escolha quem vai atravessar.”"
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]

# 1. Garantir que as imagens estejam nas duas pastas de assets
IMG_NAMES = [
    'slide1_portal_ruins.jpg',
    'slide3_king_valdrak_eye.jpg',
    'slide4_shattered_seal.jpg',
    'slide5_heroes_convergence.jpg',
    'slide6_guardian_altar.jpg'
]

uploaded_dir = 'C:/Users/rafaelscarpille/.gemini/antigravity/brain/f32dd795-4fc4-4eee-a304-6a2759fd9a03/.user_uploaded'
uploaded_map = {
    'slide1_portal_ruins.jpg': 'media_1792170214102_39119aef.jpg',
    'slide3_king_valdrak_eye.jpg': 'media_1792170214134_0b3b7756.jpg',
    'slide4_shattered_seal.jpg': 'media_1792170214112_363ddd48.jpg',
    'slide5_heroes_convergence.jpg': 'media_1792170214126_d43b8156.jpg',
    'slide6_guardian_altar.jpg': 'media_1792170214138_0cd59000.jpg'
}

dest_dirs = [
    os.path.join(ROOT, 'assets', 'images', 'cinematic'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'images', 'cinematic')
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)

for dest_name, src_name in uploaded_map.items():
    src_path = os.path.join(uploaded_dir, src_name)
    if os.path.exists(src_path):
        for d in dest_dirs:
            shutil.copyfile(src_path, os.path.join(d, dest_name))
            print(f"[OK] Imagem copiada: {dest_name} para {d}")

# 2. Código do Living Cinematic Engine
LIVING_CINEMATIC_ENGINE = '''
/* =========================================================================
   DEPTHGATE - LIVING CINEMATIC ENGINE (__playLivingStory)
   Motor cinematográfico de alta definição para o prólogo da Campanha:
   - Apresenta as 6 cenas/slides com as artes oficiais do jogo em alta fidelidade
   - Efeito Ken Burns com panning e zoom dinâmicos
   - Partículas atmosféricas realistas (brumas, brasas abissais, faíscas)
   - Barra anamórfica 21:9 de cinema e vinheta de profundidade
   - Tipografia clássica serifada com destaques dourados e legendas sincronizadas
   - Suporte completo a mouse, teclado e touch mobile com botão de pular expandido
   ========================================================================= */
function __playLivingStory(options = {}) {
  const root = document.body;
  const overlay = document.createElement("div");
  overlay.id = "depthgate-cinematic-overlay";
  overlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:999999;opacity:0;transition:opacity 0.6s ease;overflow:hidden;user-select:none;touch-action:none;font-family:Georgia,'Times New Roman',serif;";
  root.appendChild(overlay);

  // Canvas de alta definição
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  overlay.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Barras pretas de cinema (Letterbox 21:9)
  const topBar = document.createElement("div");
  topBar.style.cssText = "position:absolute;top:0;left:0;right:0;height:10vh;background:linear-gradient(to bottom,#000 70%,transparent);z-index:20;pointer-events:none;";
  const botBar = document.createElement("div");
  botBar.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:12vh;background:linear-gradient(to top,#000 70%,transparent);z-index:20;pointer-events:none;";
  overlay.appendChild(topBar);
  overlay.appendChild(botBar);

  // Vinheta óptica suave
  const vignette = document.createElement("div");
  vignette.style.cssText = "position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.85) 100%);pointer-events:none;z-index:15;";
  overlay.appendChild(vignette);

  // Container de Diálogo & Legendas
  const textContainer = document.createElement("div");
  textContainer.style.cssText = "position:absolute;left:6%;right:6%;bottom:12vh;display:flex;flex-direction:column;align-items:center;text-align:center;z-index:30;pointer-events:none;";
  
  const speakerBadge = document.createElement("div");
  speakerBadge.style.cssText = "font-size:clamp(10px,1.4vw,13px);font-weight:bold;letter-spacing:0.25em;color:#ffd24a;text-shadow:0 0 10px rgba(255,210,74,0.5);margin-bottom:8px;text-transform:uppercase;opacity:0;transition:opacity 0.4s ease;";
  
  const textBox = document.createElement("div");
  textBox.style.cssText = "background:rgba(8,6,5,0.72);border:1px solid rgba(201,162,74,0.45);box-shadow:0 8px 32px rgba(0,0,0,0.8);border-radius:6px;padding:12px 28px;max-width:880px;backdrop-filter:blur(4px);";
  
  const textLine = document.createElement("div");
  textLine.style.cssText = "font-size:clamp(13px,1.9vw,21px);font-style:italic;line-height:1.45;color:#fdf6e6;text-shadow:0 2px 10px #000;opacity:0;transition:opacity 0.45s ease;";
  
  textBox.appendChild(textLine);
  textContainer.appendChild(speakerBadge);
  textContainer.appendChild(textBox);
  overlay.appendChild(textContainer);

  // Botão Pular com área de toque confortável (Gt standard)
  const skipBtn = document.createElement("div");
  skipBtn.innerHTML = "PULAR INTRO &#10005;";
  skipBtn.style.cssText = "position:absolute;top:3.5vh;right:4vw;z-index:40;background:rgba(30,18,12,0.85);border:1px solid #c9a24a;color:#d8cdb4;font-family:'Courier New',monospace;font-size:11px;font-weight:bold;padding:10px 18px;border-radius:4px;cursor:pointer;letter-spacing:0.1em;box-shadow:0 4px 16px rgba(0,0,0,0.6);transition:all 0.2s ease;";
  skipBtn.onmouseenter = () => { skipBtn.style.background = "#c9a24a"; skipBtn.style.color = "#110b06"; };
  skipBtn.onmouseleave = () => { skipBtn.style.background = "rgba(30,18,12,0.85)"; skipBtn.style.color = "#d8cdb4"; };
  overlay.appendChild(skipBtn);

  // Dica de navegação inferior
  const navHint = document.createElement("div");
  navHint.innerHTML = "CLIQUE OU TOQUE PARA AVANÇAR";
  navHint.style.cssText = "position:absolute;bottom:3vh;right:4vw;z-index:30;color:#8a7860;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;opacity:0.75;pointer-events:none;";
  overlay.appendChild(navHint);

  // Configuração dos 6 Slides
  const SLIDES = [
    {
      imgSrc: "assets/images/cinematic/slide1_portal_ruins.jpg",
      panStart: { s: 1.05, x: 0, y: 0 },
      panEnd: { s: 1.14, x: -15, y: -8 },
      particles: "dust",
      lines: [
        "Durante séculos, contamos a mesma história.",
        "Dissemos que eram portas para lugares esquecidos.",
        "Dissemos que os antigos foram destruídos pelo poder que encontraram.",
        "Mas mentimos."
      ]
    },
    {
      imgSrc: "assets/images/cinematic/slide1_portal_ruins.jpg",
      panStart: { s: 1.14, x: -15, y: -8 },
      panEnd: { s: 1.36, x: 28, y: -18 }, // Zoom dramático direto no vórtice do portal
      particles: "blue_portal",
      lines: [
        "Eles não foram destruídos.",
        "Eles fugiram...",
        "...e deixaram algo para trás."
      ]
    },
    {
      imgSrc: "assets/images/cinematic/slide3_king_valdrak_eye.jpg",
      panStart: { s: 1.05, x: 20, y: 0 },
      panEnd: { s: 1.18, x: -15, y: -10 },
      particles: "void_purple",
      lines: [
        "Em Valdrak, um rei abriu as portas do castelo para salvar o seu povo...",
        "O que entrou... nunca mais saiu dos olhos dele."
      ]
    },
    {
      imgSrc: "assets/images/cinematic/slide4_shattered_seal.jpg",
      panStart: { s: 1.18, x: 0, y: 12 },
      panEnd: { s: 1.06, x: 0, y: -10 },
      particles: "shatter_purple",
      lines: [
        "Por séculos, os selos permaneceram intactos.",
        "Até esta noite.",
        "O colapso rasgou o tecido das eras e dimensões... e agora as Profundezas estão despertando."
      ]
    },
    {
      imgSrc: "assets/images/cinematic/slide5_heroes_convergence.jpg",
      panStart: { s: 1.05, x: -18, y: 6 },
      panEnd: { s: 1.16, x: 14, y: -6 },
      particles: "wind_leaves",
      lines: [
        "Eu procurei aqueles que poderiam atravessar os portais.",
        "Convocados através de fendas de eras e dimensões distintas...",
        "...alguns vieram em busca de respostas. Alguns, por vingança.",
        "Alguns, porque os próprios segredos estavam escondidos lá.",
        "E alguns... porque os mortos pediram que viessem."
      ]
    },
    {
      imgSrc: "assets/images/cinematic/slide6_guardian_altar.jpg",
      speaker: "✦ A GUARDIÃ ✦",
      panStart: { s: 1.04, x: 0, y: 8 },
      panEnd: { s: 1.15, x: -12, y: -8 },
      particles: "gold_light",
      lines: [
        "“Vocês não foram escolhidos por serem os mais fortes.”",
        "“Foram escolhidos porque já foram tocados pelas profundezas.”",
        "“Lá dentro está a resposta.”",
        "“Escolha quem vai atravessar.”"
      ]
    }
  ];

  // Carregamento de Imagens
  const loadedImages = {};
  let imagesReady = 0;
  const uniqueSrcs = [...new Set(SLIDES.map(s => s.imgSrc))];
  uniqueSrcs.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedImages[src] = img;
      imagesReady++;
      if (imagesReady >= uniqueSrcs.length) startCinematic();
    };
    img.onerror = () => {
      imagesReady++;
      if (imagesReady >= uniqueSrcs.length) startCinematic();
    };
  });

  // Áudio da Cinemática
  let audioEl = null;
  try {
    audioEl = new Audio();
    audioEl.src = options.music || "assets/audio/cinematic_intro.mp3";
    audioEl.volume = 0;
    audioEl.loop = true;
    audioEl.play().then(() => {
      let v = 0;
      const targetVol = options.musicVol || 0.55;
      const ramp = setInterval(() => {
        if (!audioEl || audioEl.paused) { clearInterval(ramp); return; }
        v = Math.min(targetVol, v + 0.05);
        audioEl.volume = v;
        if (v >= targetVol) clearInterval(ramp);
      }, 100);
    }).catch(() => {});
  } catch(e) {}

  let curSlide = 0;
  let curLine = 0;
  let slideTime = 0;
  let animId = null;
  let isClosing = false;

  // Partículas volumétricas
  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: -0.0003 - Math.random() * 0.0008,
      size: 1 + Math.random() * 2.5,
      alpha: 0.15 + Math.random() * 0.55,
      pulse: Math.random() * Math.PI * 2
    });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function startCinematic() {
    overlay.style.opacity = "1";
    showLine();
    let lastT = performance.now();

    function loop(now) {
      if (isClosing) return;
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      slideTime += dt;

      renderFrame(slideTime);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
  }

  function renderFrame(st) {
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const s = SLIDES[curSlide];
    const img = loadedImages[s.imgSrc];
    if (img && img.complete) {
      const duration = 14;
      const progress = Math.min(1, Math.max(0, st / duration));
      
      // Interpolação suave de câmera Ken Burns
      const curScale = s.panStart.s + (s.panEnd.s - s.panStart.s) * progress;
      const curX = s.panStart.x + (s.panEnd.x - s.panStart.x) * progress;
      const curY = s.panStart.y + (s.panEnd.y - s.panStart.y) * progress;

      const imgAspect = img.width / img.height;
      const screenAspect = w / h;
      let drawW, drawH;
      if (screenAspect > imgAspect) {
        drawW = w * curScale;
        drawH = drawW / imgAspect;
      } else {
        drawH = h * curScale;
        drawW = drawH * imgAspect;
      }

      const dx = (w - drawW) / 2 + curX * (w / 1000);
      const dy = (h - drawH) / 2 + curY * (h / 1000);

      ctx.save();
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    }

    // Renderizar partículas atmosféricas temáticas
    ctx.save();
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.03;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;

      const px = p.x * w;
      const py = p.y * h;
      const al = p.alpha * (0.65 + Math.sin(p.pulse) * 0.35);

      if (s.particles === "blue_portal") {
        ctx.fillStyle = `rgba(120, 200, 255, ${al})`;
      } else if (s.particles === "void_purple" || s.particles === "shatter_purple") {
        ctx.fillStyle = `rgba(180, 110, 255, ${al})`;
      } else if (s.particles === "gold_light") {
        ctx.fillStyle = `rgba(255, 215, 120, ${al * 1.2})`;
      } else {
        ctx.fillStyle = `rgba(240, 220, 180, ${al * 0.7})`;
      }
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function showLine() {
    const s = SLIDES[curSlide];
    if (s.speaker) {
      speakerBadge.textContent = s.speaker;
      speakerBadge.style.opacity = "1";
    } else {
      speakerBadge.style.opacity = "0";
    }

    textLine.style.opacity = "0";
    setTimeout(() => {
      if (isClosing) return;
      textLine.textContent = s.lines[curLine] || "";
      textLine.style.opacity = "1";
    }, 180);
  }

  function next() {
    if (isClosing) return;
    const s = SLIDES[curSlide];
    curLine++;
    if (curLine < s.lines.length) {
      showLine();
    } else {
      curSlide++;
      curLine = 0;
      slideTime = 0;
      if (curSlide < SLIDES.length) {
        showLine();
      } else {
        finish();
      }
    }
  }

  function finish() {
    if (isClosing) return;
    isClosing = true;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keydown", onKeyDown);

    overlay.style.opacity = "0";
    if (audioEl) {
      let v = audioEl.volume;
      const fadeAudio = setInterval(() => {
        v = Math.max(0, v - 0.08);
        audioEl.volume = v;
        if (v <= 0) {
          clearInterval(fadeAudio);
          audioEl.pause();
          audioEl = null;
        }
      }, 60);
    }

    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (typeof options.onDone === "function") options.onDone();
    }, 650);
  }

  const onKeyDown = ev => {
    if (ev.key === "Escape") { finish(); }
    else if (["Enter", " ", "ArrowRight", "ArrowDown"].includes(ev.key)) { next(); }
  };
  window.addEventListener("keydown", onKeyDown);

  overlay.addEventListener("click", ev => {
    if (ev.target === skipBtn) {
      finish();
    } else {
      next();
    }
  });

  skipBtn.addEventListener("click", ev => {
    ev.stopPropagation();
    finish();
  });

  return { close: finish };
}
'''

def apply_patches():
    with open(TARGETS[0], "r", encoding="utf-8") as f:
        src = f.read()

    orig_len = len(src)
    print(f"Lendo {TARGETS[0]} ({orig_len} bytes)")

    # 1. Injetar o LIVING_CINEMATIC_ENGINE logo antes de __playVideos
    pv_target = 'function __playVideos(list,o={}){const root=document.body,'
    assert pv_target in src, "Função __playVideos não encontrada para injeção"
    src = src.replace(pv_target, LIVING_CINEMATIC_ENGINE + '\n' + pv_target)
    print("1. Living Cinematic Engine injetado com sucesso!")

    # 2. Substituir a chamada na cena de introdução
    old_intro_call = '''if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(.6),this.cam.setBackgroundColor(0),this.skipHint.setVisible(!1),__holdM(!0),this.game.audioEngine&&(this.game.audioEngine.desiredMusic=null),this.__vid=__playVideos([
  "assets/video/campanha_1",
  "assets/video/campanha_2",
  "assets/video/campanha_3",
  "assets/video/campanha_4"
], {
  muted: !0,
  music: "assets/audio/cinematic_intro.mp3",
  musicVol: .50,
  musicLoop: !0,
  subs: [
    [0.6, 9.2, W("intro.l1") + " " + W("intro.l2")],
    [10.4, 19.2, W("intro.l3") + " " + W("intro.l4")],
    [20.4, 29.2, W("intro.l5") + " " + W("intro.l6")],
    [30.4, 39.2, W("intro.l7")]
  ],
  endCard: [W("intro.chapter"), W("intro.chapterSub"), 3200],
  onDone: () => {
    __holdM(!1);
    this.skipped = !0;
    this.finish();
  }
});return}'''

    new_intro_call = '''if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(.6),this.cam.setBackgroundColor(0),this.skipHint.setVisible(!1),__holdM(!0),this.game.audioEngine&&(this.game.audioEngine.desiredMusic=null),this.__vid=__playLivingStory({
  music: "assets/audio/cinematic_intro.mp3",
  musicVol: .55,
  onDone: () => {
    __holdM(!1);
    this.skipped = !0;
    this.finish();
  }
});return}'''

    assert old_intro_call in src, "Chamada antiga de campanha_1 não encontrada"
    src = src.replace(old_intro_call, new_intro_call)
    print("2. Cena de introdução da campanha vinculada ao novo Living Cinematic Engine!")

    # 3. Gravar em ambos os arquivos
    for target in TARGETS:
        with open(target, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"Gravado com sucesso em: {target} ({len(src)} bytes)")

    # 4. Atualizar versão no Launcher.cs para v2.0.0
    launcher_path = os.path.join(ROOT, "scripts", "Launcher.cs")
    if os.path.exists(launcher_path):
        with open(launcher_path, "r", encoding="utf-8") as f:
            l_src = f.read()
        l_src_new = l_src.replace('v1.9.9', 'v2.0.0')
        with open(launcher_path, "w", encoding="utf-8") as f:
            f.write(l_src_new)
        print("4. Launcher.cs atualizado para v2.0.0!")

if __name__ == "__main__":
    apply_patches()
