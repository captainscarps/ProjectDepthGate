"""História antes da escolha dos heróis como vídeo: cada slide de __playLivingStory passa a mostrar uma cena animada
(assets/video/historia_<n>.webm/.mp4, laços de 10 s no estilo gravura, scripts/build_engraving_videos.py) em vez da
imagem parada com zoom. As cenas emendam com uma fusão; a narração, as legendas, o toque para avançar e o PULAR
continuam iguais (cada cena dura o tempo da narração dela, em qualquer idioma). Se o vídeo não carregar, volta a imagem.
Re-executável.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
           os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")]

SETUP = """  // Carregamento de Imagens
  /*__LSVID__*/const __lsV = SLIDES.map((_, i) => {
    try {
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = i < 2 ? "auto" : "metadata";
      v.src = "assets/video/historia_" + (i + 1) + (v.canPlayType('video/webm; codecs="vp9"') ? ".webm" : ".mp4");
      return v;
    } catch (e) { return null; }
  });
  let __lsCur = -1, __lsPrev = null, __lsT0 = 0;
  const __lsCover = (v, w, h, a) => {
    const vw = v.videoWidth || 1280, vh = v.videoHeight || 720, k = Math.max(w / vw, h / vh);
    ctx.globalAlpha = a; ctx.drawImage(v, (w - vw * k) / 2, (h - vh * k) / 2, vw * k, vh * k); ctx.globalAlpha = 1;
  };
  const __lsDraw = (w, h) => {
    const v = __lsV[curSlide];
    if (!v) return false;
    if (__lsCur !== curSlide) {
      __lsPrev = __lsCur >= 0 ? __lsV[__lsCur] : null; __lsCur = curSlide; __lsT0 = performance.now();
      try { v.currentTime = 0; } catch (e) {}
      const p = v.play(); p && p.catch && p.catch(() => {});
      const nx = __lsV[curSlide + 1]; if (nx && nx.preload !== "auto") { nx.preload = "auto"; try { nx.load(); } catch (e) {} }
    }
    if (v.readyState < 2) return false;
    const k = Math.min(1, (performance.now() - __lsT0) / 900);
    if (__lsPrev && __lsPrev.readyState >= 2 && k < 1) __lsCover(__lsPrev, w, h, 1);
    else if (__lsPrev && k >= 1) { try { __lsPrev.pause(); } catch (e) {} __lsPrev = null; }
    __lsCover(v, w, h, __lsPrev ? k : 1);
    return true;
  };
  const __lsStop = () => __lsV.forEach(v => { try { v && (v.pause(), v.removeAttribute("src"), v.load()); } catch (e) {} });/*__LSVID__*/
"""

REPL = [
    ("  // Carregamento de Imagens\n", SETUP),
    ("    const s = SLIDES[curSlide];\n    const img = loadedImages[s.imgSrc];\n    if (img && img.complete) {",
     "    const s = SLIDES[curSlide];\n    if (__lsDraw(w, h)) return;/*__LSVID2__*/\n    const img = loadedImages[s.imgSrc];\n    if (img && img.complete) {"),
    ("    /*__DUB__*/isClosing = true; window.__dubStop?.();",
     "    /*__DUB__*/isClosing = true; window.__dubStop?.();__lsStop();/*__LSVID3__*/"),
]


def patch(path):
    s = open(path, encoding="utf-8").read()
    i = s.index("function __playLivingStory")
    j = s.index("\n/*__DSW__*/", i)
    body = s[i:j]
    n = 0
    for old, new in REPL:
        if new in body:
            continue
        if body.count(old) != 1:
            raise SystemExit(f"padrão não encontrado em {path}: {old[:60]!r}")
        body = body.replace(old, new)
        n += 1
    open(path, "w", encoding="utf-8").write(s[:i] + body + s[j:])
    print(f"{os.path.relpath(path, ROOT)}: {n} trocas")


for t in TARGETS:
    if os.path.isfile(t):
        patch(t)
