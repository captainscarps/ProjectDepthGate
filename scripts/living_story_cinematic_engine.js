/* =========================================================================
   DEPTHGATE - LIVING STORY CINEMATIC ENGINE (__playVideos Replacement)
   Renders high-definition illustrated storyboard cutscenes with:
   - 21:9 anamorphic letterbox
   - Cinematic camera zoom & pan (Ken Burns effect)
   - Dynamic volumetric lighting and embers / mist particles
   - Typewriter serif dialogues & speaker crests
   - Sfx, thunders and ambient orchestral music
   - Zero video compression artifacts!
   ========================================================================= */
function __playVideos(list, o = {}) {
  const root = document.body;
  const overlay = document.createElement("div");
  let done = false;
  let curIndex = 0;

  overlay.id = "depthgate-cinematic-overlay";
  overlay.style.cssText = "position:fixed;inset:0;background:#060504;z-index:99999;opacity:0;transition:opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);overflow:hidden;user-select:none;touch-action:none;font-family:Georgia,'Times New Roman',serif;";

  // Canvas para ilustrações e efeitos volumétricos
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;";
  overlay.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Letterbox 21:9 anamórfico
  const topBar = document.createElement("div");
  topBar.style.cssText = "position:absolute;top:0;left:0;right:0;height:12vh;background:#000;z-index:10;box-shadow:0 8px 30px rgba(0,0,0,0.8);";
  const botBar = document.createElement("div");
  botBar.style.cssText = "position:absolute;bottom:0;left:0;right:0;height:14vh;background:#000;z-index:10;box-shadow:0 -8px 30px rgba(0,0,0,0.8);";
  overlay.appendChild(topBar);
  overlay.appendChild(botBar);

  // Vinheta ótica escura
  const vignette = document.createElement("div");
  vignette.style.cssText = "position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%);pointer-events:none;z-index:5;";
  overlay.appendChild(vignette);

  // Container de Diálogo & Legendas Cinematográficas
  const textContainer = document.createElement("div");
  textContainer.style.cssText = "position:absolute;left:8%;right:8%;bottom:16vh;display:flex;flex-direction:column;align-items:center;text-align:center;z-index:20;pointer-events:none;";
  
  const speakerTag = document.createElement("div");
  speakerTag.style.cssText = "font-size:clamp(11px,1.4vw,14px);font-weight:bold;letter-spacing:0.25em;color:#c9a24a;text-shadow:0 0 10px rgba(201,162,74,0.4);margin-bottom:8px;text-transform:uppercase;";
  
  const textLine = document.createElement("div");
  textLine.style.cssText = "font-size:clamp(15px,2.2vw,24px);font-style:italic;line-height:1.45;color:#f4ebd0;text-shadow:0 2px 8px #000, 0 0 16px rgba(0,0,0,0.9);max-width:900px;transition:opacity 0.4s ease;";
  
  textContainer.appendChild(speakerTag);
  textContainer.appendChild(textLine);
  overlay.appendChild(textContainer);

  // Dica / Botão de Pular Elegante
  const skipBtn = document.createElement("div");
  skipBtn.innerHTML = (o.hint ?? "ESPAÇO / TOQUE PARA PULAR") + " <span style='color:#c9a24a'>▸</span>";
  skipBtn.style.cssText = "position:absolute;right:24px;bottom:4vh;font-size:11px;font-weight:bold;letter-spacing:0.18em;color:#a89d84;z-index:30;cursor:pointer;padding:6px 12px;border:1px solid rgba(201,162,74,0.25);border-radius:4px;background:rgba(10,8,6,0.6);transition:all 0.3s;";
  overlay.appendChild(skipBtn);

  skipBtn.onmouseenter = () => { skipBtn.style.color = "#ffd875"; skipBtn.style.borderColor = "#c9a24a"; };
  skipBtn.onmouseleave = () => { skipBtn.style.color = "#a89d84"; skipBtn.style.borderColor = "rgba(201,162,74,0.25)"; };

  // Cartão final (End Card)
  const endCard = document.createElement("div");
  endCard.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#000;z-index:40;opacity:0;transition:opacity 0.8s ease;pointer-events:none;";
  overlay.appendChild(endCard);

  root.appendChild(overlay);

  // Músicas e sons
  let audio = null;
  if (o.music) {
    audio = new Audio();
    audio.src = o.music + (audio.canPlayType("audio/ogg; codecs=vorbis") ? ".ogg" : ".mp3");
    audio.preload = "auto";
    audio.volume = 0;
    const targetVol = Math.min(1, Math.max(0, (globalThis.__DED_GAME?.audioEngine?.musicVolume ?? 0.55) * (o.musicVol ?? 0.85)));
    audio.loop = !!o.musicLoop;
    try {
      audio.play().then(() => {
        let v = 0;
        const fi = setInterval(() => {
          v = Math.min(targetVol, v + 0.05);
          if (audio) audio.volume = v;
          if (v >= targetVol) clearInterval(fi);
        }, 50);
      }).catch(() => {});
    } catch(e) {}
  }

  // Definições de slides cinematográficos com artes épicas de alta qualidade da pasta story
  const isEndless = list.some(u => String(u).includes("modo_infinito"));
  const slides = isEndless ? [
    {
      img: "assets/pixel-art/story/vis-catacombs.jpg",
      speaker: "AS PROFUNDEZAS ABISSAIS",
      text: "Nas entranhas esquecidas de Valdrak, os corredores nunca terminam.",
      duration: 4800,
      zoomStart: 1.0,
      zoomEnd: 1.14
    },
    {
      img: "assets/pixel-art/story/pr-3.jpg",
      speaker: "DESAFIO ETERNO",
      text: "Nenhuma tocha permanece acesa por muito tempo. Nenhum passo passa desapercebido.",
      duration: 4800,
      zoomStart: 1.12,
      zoomEnd: 1.02
    },
    {
      img: "assets/pixel-art/story/vis-morta.jpg",
      speaker: "O INFINITO",
      text: "Prove sua força diante das hordas que consumiram reinos inteiros.",
      duration: 5200,
      zoomStart: 1.0,
      zoomEnd: 1.15
    }
  ] : [
    {
      img: "assets/pixel-art/story/pr-1.jpg",
      speaker: "CRÔNICAS DE DEPTHGATE",
      text: "Durante séculos, contamos histórias sobre os portais esquecidos.",
      duration: 4600,
      zoomStart: 1.0,
      zoomEnd: 1.12
    },
    {
      img: "assets/pixel-art/story/pr-2.jpg",
      speaker: "A VERDADE OCULTA",
      text: "Diziam que os Antigos foram consumidos pelo poder. Mas eles fugiram... e deixaram a escuridão para trás.",
      duration: 5200,
      zoomStart: 1.15,
      zoomEnd: 1.03
    },
    {
      img: "assets/pixel-art/story/vis-bosque.jpg",
      speaker: "FLORESTA DE ELDERVALE",
      text: "Nas orlas do reino, raízes milenares escondem os selos proibidos que vigiam o abismo.",
      duration: 5000,
      zoomStart: 1.0,
      zoomEnd: 1.14
    },
    {
      img: "assets/pixel-art/story/pr-4.jpg",
      speaker: "A SENTINELA",
      text: "Um viajante atende ao chamado das profundezas... onde a luz do sol já não consegue alcançar.",
      duration: 5200,
      zoomStart: 1.05,
      zoomEnd: 1.16
    }
  ];

  // Partículas atmosféricas de cinzas e brasas
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.8 + 0.3),
      speedX: Math.random() * 0.6 - 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      flicker: Math.random() * 0.04
    });
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  let activeImage = new Image();
  let nextImage = new Image();
  let currentSlide = slides[0];
  let slideStartTime = performance.now();
  let isTransitioning = false;
  let transitionAlpha = 1;

  function loadSlide(idx) {
    if (idx >= slides.length) {
      triggerEndCard();
      return;
    }
    curIndex = idx;
    currentSlide = slides[idx];
    slideStartTime = performance.now();
    isTransitioning = true;
    transitionAlpha = 0;

    speakerTag.textContent = currentSlide.speaker;
    typewriter(currentSlide.text);

    // Carrega imagem
    const img = new Image();
    img.src = currentSlide.img;
    img.onload = () => {
      activeImage = img;
    };

    // Pré-carrega o próximo slide
    if (idx + 1 < slides.length) {
      nextImage = new Image();
      nextImage.src = slides[idx + 1].img;
    }

    // Trovão / som de atmosfera
    if (idx % 2 === 1 && window.__audioTone?.thunderStrike) {
      window.__audioTone.thunderStrike(0.65);
    }
  }

  function typewriter(fullText) {
    textLine.textContent = "";
    let charIdx = 0;
    const stepMs = Math.max(20, Math.min(42, Math.floor(1800 / fullText.length)));
    const timer = setInterval(() => {
      if (done || charIdx >= fullText.length) {
        clearInterval(timer);
        return;
      }
      charIdx++;
      textLine.textContent = fullText.slice(0, charIdx);
    }, stepMs);
  }

  function renderLoop() {
    if (done) return;
    requestAnimationFrame(renderLoop);

    const now = performance.now();
    const elapsed = now - slideStartTime;
    const progress = Math.min(1, elapsed / currentSlide.duration);

    ctx.fillStyle = "#060504";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (activeImage && activeImage.complete && activeImage.width > 0) {
      // Zoom & Pan cinemático suave (Ken Burns)
      const currentZoom = currentSlide.zoomStart + (currentSlide.zoomEnd - currentSlide.zoomStart) * progress;
      const aspect = activeImage.width / activeImage.height;
      const screenAspect = canvas.width / canvas.height;

      let drawW, drawH;
      if (screenAspect > aspect) {
        drawW = canvas.width * currentZoom;
        drawH = (canvas.width / aspect) * currentZoom;
      } else {
        drawH = canvas.height * currentZoom;
        drawW = (canvas.height * aspect) * currentZoom;
      }

      const drawX = (canvas.width - drawW) / 2 + (progress * 15 - 7.5);
      const drawY = (canvas.height - drawH) / 2;

      // Fade-in e Fade-out da imagem
      let alpha = 1;
      if (elapsed < 800) {
        alpha = elapsed / 800;
      } else if (elapsed > currentSlide.duration - 800) {
        alpha = Math.max(0, (currentSlide.duration - elapsed) / 800);
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(activeImage, drawX, drawY, drawW, drawH);

      // Névoa / glow quente dourado sobre a cena
      const grad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "rgba(10, 6, 2, 0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Renderiza partículas brilhantes de brasa / cinza
    ctx.fillStyle = "rgba(225, 180, 110, 0.7)";
    for (const p of particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.alpha += p.flicker;
      if (p.alpha > 0.8 || p.alpha < 0.2) p.flicker = -p.flicker;
      if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Avança para o próximo slide automaticamente
    if (elapsed >= currentSlide.duration && !done) {
      loadSlide(curIndex + 1);
    }
  }

  function triggerEndCard() {
    if (done) return;
    textContainer.style.opacity = "0";
    skipBtn.style.opacity = "0";

    if (o.endCard) {
      endCard.innerHTML = '<div style="font-size:clamp(24px,4.5vw,46px);font-weight:bold;letter-spacing:0.25em;color:#f0d890;text-shadow:0 0 20px rgba(201,162,74,0.7);text-align:center;">' + o.endCard[0] + '</div>' +
        '<div style="font-size:clamp(12px,1.8vw,18px);font-style:italic;color:#cfc3a4;letter-spacing:0.1em;text-align:center;">' + (o.endCard[1] || "") + '</div>' +
        '<div style="width:min(45vw,340px);height:1.5px;background:linear-gradient(90deg,transparent,#c9a24a,transparent);margin-top:8px;"></div>';
      endCard.style.opacity = "1";
      setTimeout(close, o.endCard[2] || 2600);
    } else {
      close();
    }
  }

  function close() {
    if (done) return;
    done = true;
    window.removeEventListener("resize", resize);
    window.removeEventListener("keydown", onKey);

    overlay.style.opacity = "0";
    if (audio) {
      let v = audio.volume;
      const fo = setInterval(() => {
        v = Math.max(0, v - 0.08);
        if (audio) audio.volume = v;
        if (v <= 0) {
          clearInterval(fo);
          try { audio.pause(); } catch(e) {}
        }
      }, 40);
    }

    setTimeout(() => {
      overlay.remove();
      o.onDone?.();
    }, 650);
  }

  function onKey(e) {
    if (e.code === "Space" || e.code === "Escape" || e.code === "Enter") {
      close();
    }
  }

  overlay.onclick = (e) => {
    // Se clicar no botão ou na tela, permite pular ou avançar
    close();
  };
  window.addEventListener("keydown", onKey);

  // Inicia animação
  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    loadSlide(0);
    renderLoop();
  });

  return { close };
}
