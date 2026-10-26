"""
Forja no inventário com gamepad (e teclado) sem conflitos:
  • antes a janela da forja lia o gamepad sozinha E recebia as teclas que a ponte do gamepad simula — cada
    botão contava duas vezes (pulava linhas, forjava em dobro) e o inventário por trás também reagia (A equipava,
    B fechava o inventário inteiro). Agora todas as teclas passam por um único lugar enquanto a forja está aberta.
  • Y abre/fecha a forja no inventário; ↑↓ escolhe a raridade; A forja; B fecha só a forja.
  • Inventário: ao mover a seleção para outro item, a ficha de atributos do item anterior fecha (abre de novo
    com A / Enter / clique).
Re-executável (marcador + original em base64).
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__FORGEPAD__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rfind("/*§")
    s = s[:a] + (base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") if k >= 0 else "") + s[b + len(T):]

i = s.index("const __FORGE_RARITIES")
j = s.index("\n  drawRows();\n}", i) + len("\n  drawRows();\n}")
old = s[i:j]
new = old


def rep(a, b):
    global new
    assert new.count(a) == 1, a[:80]
    new = new.replace(a, b)


# janela um pouco mais alta para caber a linha de ajuda dos botões
rep("  const H = 270;", "  const H = 290;")
# fechar: também desliga o roteador de teclas
rep("""    if (invUi.__forgeModal) {
      ui.input.keyboard?.off("keydown", keyHandler);
      invUi.__forgeModal.destroy();""", """    invUi.__forgeKey = null;
    if (invUi.__forgeModal) {
      invUi.__forgeModal.destroy();""")
# teclas: um só roteador (o inventário chama enquanto a forja está aberta; a ponte do gamepad vira tecla)
a = new.index("  const keyHandler = ev => {")
b = new.index("  dim.on(\"pointerdown\", () => closeForge());")
new = new[:a] + """  invUi.__forgeKey = key => {
    if (closed) return true;
    if (key === "Escape" || key === "Backspace" || key === "q" || key === "Q" || key === "t" || key === "T") {
      closeForge();
    } else if (key === "ArrowUp" || key === "w" || key === "W") {
      selectedRow = (selectedRow - 1 + __FORGE_RARITIES.length) % __FORGE_RARITIES.length;
      drawRows();
      S.game?.audioEngine?.sfx?.("sfx-ui-tab");
    } else if (key === "ArrowDown" || key === "s" || key === "S") {
      selectedRow = (selectedRow + 1) % __FORGE_RARITIES.length;
      drawRows();
      S.game?.audioEngine?.sfx?.("sfx-ui-tab");
    } else if (key === "Enter" || key === " ") {
      executeForge(__FORGE_RARITIES[selectedRow].key);
    }
    return true;
  };
""" + new[b:]
# sem leitura própria do gamepad (a ponte do jogo já transforma os botões em teclas)
a = new.index("  // Navegação direta com GAMEPAD")
b = new.index("  // Botão fechar (X)")
new = new[:a] + new[b:]
# ajuda dos botões + cristais um pouco acima
rep("    const tFrags = ui.add.text(cx, y0 + H - 18,", "    const tFrags = ui.add.text(cx, y0 + H - 34,")
rep("    rowsContainer.add(tFrags);\n  };", """    rowsContainer.add(tFrags);
    const pad = S.game?.inputManager?.device === "gamepad";
    const help = pad
      ? __L3("Ⓐ forjar   ·   ↑↓ escolher   ·   Ⓑ fechar", "Ⓐ forge   ·   ↑↓ choose   ·   Ⓑ close", "Ⓐ forjar   ·   ↑↓ elegir   ·   Ⓑ cerrar")
      : __L3("Enter / toque: forjar   ·   ↑↓ escolher   ·   Esc: fechar", "Enter / tap: forge   ·   ↑↓ choose   ·   Esc: close", "Enter / toque: forjar   ·   ↑↓ elegir   ·   Esc: cerrar");
    rowsContainer.add(ui.add.text(cx, y0 + H - 14, help, { fontFamily: F_MONO, fontSize: "8px", color: "#e8c872", stroke: "#0a0604", strokeThickness: 2 }).setOrigin(0.5, 0.5));
  };""")
# não forjar duas vezes com um toque só
rep("  const executeForge = (rarKey) => {", "  let lastForge = 0;\n  const executeForge = (rarKey) => {\n    if (Date.now() - lastForge < 300) return;\n    lastForge = Date.now();")
assert "keyHandler" not in new and "padPoll" not in new

WRAP = """
/* inventário: com a forja aberta todas as teclas (e botões do gamepad) vão só para ela; Y abre/fecha a forja;
   mover a seleção fecha a ficha de atributos do item anterior */
{const H0=Cd.prototype.handleKey;Cd.prototype.handleKey=function(k){if(this.open&&this.__forgeModal&&this.__forgeKey)return this.__forgeKey(k);
 if(this.open&&this.selected&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)&&!(this.__sk&&this.__tab>=1))this.selected=null;return H0.apply(this,arguments)};
 const C0=Cd.prototype.close;Cd.prototype.close=function(){if(this.open&&this.__forgeModal&&this.__forgeKey){this.__forgeKey("Escape");return}return C0.apply(this,arguments)};
 const S0=Cd.prototype.show;Cd.prototype.show=function(){const r=S0.apply(this,arguments);try{if(!this.__forgeT){this.__forgeT=!0;this.ui.input.keyboard?.on("keydown-T",()=>{if(!this.open||this.ui.shopUI?.open||this.ui.settingsPanel?.open)return;this.__forgeModal&&this.__forgeKey?this.__forgeKey("t"):__openForge(this)})}}catch(e){}/* no gamepad o botão mostra qual botão abre a forja */
 try{const t=this.forgeBtn;if(t?.setText){t.setText(__L3("FORJA","FORGE","FORJA")+(this.ui.game.inputManager?.device==="gamepad"?" Ⓨ":""));t.input?.hitArea?.setTo?.(-8,-5,t.width+16,t.height+10)}}catch(e){}return r}}
"""
s = s[:i] + T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T + s[j:]
s = s + T + WRAP + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("forja com gamepad e ficha do item")
