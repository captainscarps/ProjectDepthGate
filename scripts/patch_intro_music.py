"""
Transição suave da música: prólogo (slides da história) → escolha de herói → vídeo de abertura → jogo.

Antes: a música do menu começava e era cortada em 0,3 s pelo prólogo; no fim do prólogo a trilha
cinematográfica sumia e a música do menu voltava; ao escolher o herói a trilha cinematográfica
recomeçava do zero no vídeo (e a cena ainda disparava a música da floresta e a cancelava em seguida).

Agora é uma trilha só:
  - o prólogo entra por cima da música do menu num cruzamento lento (menu some em 1,6 s, trilha sobe em ~2,2 s)
  - ao fechar o prólogo a trilha cinematográfica não para: desce para um fundo baixo durante a escolha de herói
  - o vídeo de abertura continua a MESMA trilha do ponto em que está, só sobe o volume (sem recomeçar)
  - no fim do vídeo a trilha desce em 1,6 s enquanto a música da fase entra
  - se alguma outra música for pedida (ex.: voltar ao menu), o fundo cinematográfico some suavemente
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__CINM__*/"


def strip_all():
    global s
    while T in s:
        a = s.index(T)
        b = s.index(T, a + 1)
        inner = s[a + len(T):b]
        k = inner.rindex("/*§")
        orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8")
        s = s[:a] + orig + s[b + len(T):]


strip_all()


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


# ajudante global: desce/para o fundo cinematográfico
HELP = ('function __cinFade(to,ms,stop){const a=window.__cinAu;if(!a)return;clearInterval(a.__fi);const f=a.volume,t0=performance.now();'
        'a.__fi=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);a.volume=Math.max(0,Math.min(1,f+(to-f)*k));'
        'if(k>=1){clearInterval(a.__fi);if(stop){try{a.pause()}catch(e){}window.__cinAu===a&&(window.__cinAu=null)}}},40)}'
        # iPhone/iPad: o <audio> do vídeo de abertura só toca se já tiver sido liberado por um toque. Em qualquer toque
        # antes do vídeo prepara (sem som) o elemento da trilha; o vídeo usa esse elemento já liberado.
        # E o áudio do jogo (Web Audio) passa a tocar mesmo com o iPhone no modo silencioso, como um vídeo.
        '(function(){try{navigator.audioSession&&(navigator.audioSession.type="playback")}catch(e){}'
        'const prime=()=>{try{if(window.__cinPrimed)return;const G=window.__DED_GAME;if(G&&G.scene.isActive("Cutscene"))return;'
        'const au=new Audio("assets/audio/cinematic_intro.mp3");au.preload="auto";au.muted=!0;au.volume=0;window.__cinPrimed=au;'
        'const p=au.play();const stop=()=>{try{au.pause();au.currentTime=0}catch(e){}};p&&p.then?p.then(stop,()=>{window.__cinPrimed===au&&(window.__cinPrimed=null)}):stop()}catch(e){}};'
        '["touchend","pointerup","keydown","click"].forEach(t=>document.addEventListener(t,prime,!0))})();')
put("function __prologue(S){", HELP + "function __prologue(S){")

# prólogo: cruzamento lento com a música do menu; no fim fica a trilha como fundo (não volta a música do menu)
put("  S.game?.audioEngine?.stopMusic?.(0.3);", "  S.game?.audioEngine?.stopMusic?.(1.6);")
put('    musicVol: .55,\n    onDone: () => {\n      S.__prologueOn = !1;\n      __holdM(!1);\n      S.game?.audioEngine?.music("select");',
    '    musicVol: .55,\n    keepMusic: .2,\n    onDone: () => {\n      S.__prologueOn = !1;\n      __holdM(!1);\n      window.__cinAu||S.game?.audioEngine?.music("select");')
put("audioEl.volume = 0;\n    audioEl.loop = true;", "audioEl.volume = 0;\n    audioEl.loop = true;\n    window.__cinAu = audioEl;")
put("      v = Math.min(targetVol, v + 0.05);", "      v = Math.min(targetVol, v + 0.025);")
put("""    if (audioEl) {
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
    }""", """    if (audioEl && options.keepMusic && window.__cinAu === audioEl) {
      __cinFade(options.keepMusic, 1500);
      audioEl = null;
    } else if (audioEl) {
      let v = audioEl.volume;
      const fadeAudio = setInterval(() => {
        v = Math.max(0, v - 0.08);
        audioEl.volume = v;
        if (v <= 0) {
          clearInterval(fadeAudio);
          audioEl.pause();
          window.__cinAu === audioEl && (window.__cinAu = null);
          audioEl = null;
        }
      }, 60);
    }""")

# escolha de herói: com prólogo pendente não começa a música do menu (ela seria cortada logo em seguida)
put('(this.game.registry.set("prologue:pending",!1),', '(this.game.registry.set("prologue:pending",!1),this.__cinPro=1,')
put('Ss(this),this.game.audioEngine?.music("select"),this.selected=0',
    'Ss(this),this.__cinPro||window.__cinAu||this.game.audioEngine?.music("select"),this.selected=0')

# pedir outra música apaga o fundo cinematográfico com calma
put("music(i){if(this.desiredMusic=i,!this.ready)return;", "music(i){if(window.__cinAu&&!this.__holdMusic&&__cinFade(0,1400,!0),this.desiredMusic=i,!this.ready)return;")

# abertura: não dispara a música da floresta à toa; música do menu sai devagar
put('this.game.audioEngine?.music("forest"),this.uiCam=', 'this.scriptKey!=="intro"&&this.game.audioEngine?.music("forest"),this.uiCam=')
put('if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(.6),', 'if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(1.6),')
put("  endCard: [W(\"intro.chapter\"), W(\"intro.chapterSub\"), 3200],", "  endCard: [W(\"intro.chapter\"), W(\"intro.chapterSub\"), 3200],\n  fadeOut: 1600,")

# vídeo: continua a mesma trilha (sem recomeçar) se ela já estiver tocando como fundo
put('au=new Audio();au.src=o.music.endsWith(".mp3")?o.music:(o.music+(au.canPlayType("audio/ogg; codecs=vorbis")&&!o.preferMp3?".ogg":".mp3"));au.preload="auto",au.volume=0;',
    'const reuse=!!(window.__cinAu&&!window.__cinAu.paused&&decodeURI(window.__cinAu.src||"").endsWith(o.music));reuse&&clearInterval(window.__cinAu.__fi);'
    'au=reuse?window.__cinAu:(window.__cinPrimed?(()=>{const q=window.__cinPrimed;window.__cinPrimed=null;return q})():new Audio());au.muted=!1;reuse||(au.src=o.music.endsWith(".mp3")?o.music:(o.music+(au.canPlayType("audio/ogg; codecs=vorbis")&&!o.preferMp3?".ogg":".mp3")),au.preload="auto",au.volume=0,window.__cinAu=au);')
put("au&&(au.play()?.catch?.(()=>{}),fadeAu(au.__tv,1400))", "au&&(au.play()?.catch?.(()=>{}),fadeAu(au.__tv,2e3))")
put("fadeAu(0,700,()=>{try{au.pause()}catch(e){}})", "fadeAu(0,o.fadeOut??700,()=>{try{au.pause()}catch(e){}au===window.__cinAu&&(window.__cinAu=null)})")

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("transição da música da abertura aplicada")
