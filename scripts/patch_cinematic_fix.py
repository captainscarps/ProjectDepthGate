import os
import shutil

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"
JS_PATHS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

# 1. Target in Cutscene (class Xd extends j.Scene)
# Currently:
# if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(.6),this.cam.setBackgroundColor(0),this.skipHint.setVisible(!1),__holdM(!0),this.game.audioEngine&&(this.game.audioEngine.desiredMusic=null),this.__vid=__playLivingStory({
#   music: "assets/audio/cinematic_intro.mp3",
#   musicVol: .55,
#   onDone: () => {
#     __holdM(!1);
#     this.skipped = !0;
#     this.finish();
#   }
# });return}

# Replacement for Cutscene (restore original campanha_1..4):
ORIGINAL_CUTSCENE_INTRO = """if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(.6),this.cam.setBackgroundColor(0),this.skipHint.setVisible(!1),__holdM(!0),this.game.audioEngine&&(this.game.audioEngine.desiredMusic=null),this.__vid=__playVideos([
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
});return}"""

# 2. Target in __prologue(S)
TARGET_PROLOGUE = """function __prologue(S){S.__prologueOn=!0;__panels(S,__PROLOGUE,()=>{S.__prologueOn=!1})}"""

REPLACEMENT_PROLOGUE = """function __prologue(S){
  S.__prologueOn=!0;
  S.game?.audioEngine?.stopMusic?.(0.3);
  __holdM(!0);
  __playLivingStory({
    music: "assets/audio/cinematic_intro.mp3",
    musicVol: .55,
    onDone: () => {
      S.__prologueOn = !1;
      __holdM(!1);
      S.game?.audioEngine?.music("select");
    }
  });
}"""

for path in JS_PATHS:
    print(f"Processando: {path}")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check Cutscene intro
    cutscene_needle_start = 'if(this.scriptKey==="intro"){this.game.audioEngine?.stopMusic?.(.6),this.cam.setBackgroundColor(0),this.skipHint.setVisible(!1),__holdM(!0),this.game.audioEngine&&(this.game.audioEngine.desiredMusic=null),this.__vid=__playLivingStory({'
    idx_cs = content.find(cutscene_needle_start)
    if idx_cs != -1:
        # Find closing });return}
        end_idx = content.find("});return}", idx_cs)
        if end_idx != -1:
            full_match = content[idx_cs:end_idx + len("});return}")]
            content = content[:idx_cs] + ORIGINAL_CUTSCENE_INTRO + content[end_idx + len("});return}"):]
            print("  [OK] Cutscene original restaurada com sucesso (campanha_1..4).")
        else:
            print("  [ERRO] Nao encontrou fim do bloco Cutscene.")
    else:
        print("  [AVISO] Bloco Cutscene com __playLivingStory nao encontrado (ja pode estar restaurado).")

    # Check __prologue
    if TARGET_PROLOGUE in content:
        content = content.replace(TARGET_PROLOGUE, REPLACEMENT_PROLOGUE)
        print("  [OK] __prologue atualizado para invocar __playLivingStory.")
    else:
        print("  [AVISO] TARGET_PROLOGUE nao encontrado textualmente, verificando regex...")
        import re
        content, count = re.subn(
            r'function __prologue\s*\(S\)\s*\{[^}]*\}',
            REPLACEMENT_PROLOGUE,
            content
        )
        if count > 0:
            print(f"  [OK] __prologue substituido via regex ({count} ocorrencia).")
        else:
            print("  [ERRO] __prologue nao encontrado.")

    # Also make sure __playLivingStory overlay has opacity: 1 right from the start so there is zero flash of ClassSelect
    if 'overlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:999999;opacity:0;' in content:
        content = content.replace(
            'overlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:999999;opacity:0;',
            'overlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:999999;opacity:1;'
        )
        print("  [OK] Overlay inicial ajustado para opacity: 1 (zero flicker do fundo).")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  [OK] Salvo: {path} ({len(content)} bytes)\n")

print("Patch executado!")
