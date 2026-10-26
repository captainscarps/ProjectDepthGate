"""
Forja no inventário com gamepad (e teclado) sem conflitos:
  • antes a janela da forja lia o gamepad sozinha E recebia as teclas que a ponte do gamepad simula — cada
    botão contava duas vezes (pulava linhas, forjava em dobro) e o inventário por trás também reagia (A equipava,
    B fechava o inventário inteiro). Agora todas as teclas passam por um único lugar enquanto a forja está aberta.
  • Y abre/fecha a forja no inventário; ↑↓ escolhe a raridade; A forja; B fecha só a forja.
  • Inventário: ao mover a seleção para outro item, a ficha de atributos do item anterior fecha (abre de novo
    com A / Enter / clique).
  • Martelo de Forjador: vendido no Ferreiro do Refúgio (160 de ouro na campanha / 40 fragmentos no modo infinito);
    sem ele a forja fica trancada. A forja ganhou a linha DESMONTAR (o item focado na mochila vira ouro).
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
rep("  const H = 270;", "  const H = 322;")
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
      selectedRow = (selectedRow - 1 + __FROWS) % __FROWS;
      drawRows();
      S.game?.audioEngine?.sfx?.("sfx-ui-tab");
    } else if (key === "ArrowDown" || key === "s" || key === "S") {
      selectedRow = (selectedRow + 1) % __FROWS;
      drawRows();
      S.game?.audioEngine?.sfx?.("sfx-ui-tab");
    } else if (key === "Enter" || key === " ") {
      selectedRow === __FORGE_RARITIES.length ? dismantle() : executeForge(__FORGE_RARITIES[selectedRow].key);
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
  };""")
# desmontar: 7ª linha da janela (o item selecionado/focado no inventário vira ouro)
rep("  let selectedRow = 0; // 0..5 (COMMON..RELIC)", """  let selectedRow = 0; // 0..5 (COMMON..RELIC), 6 = desmontar
  const __FROWS = __FORGE_RARITIES.length + 1;
  const __DM_GOLD = { COMMON: 8, UNCOMMON: 20, RARE: 45, EPIC: 100, LEGENDARY: 220, RELIC: 500 };
  const dmTarget = () => {
    let it = null;
    try {
      if (invUi.selected?.source === "inv") it = invUi.selectedItem?.();
      else if (invUi.focus?.area === "inv") it = S.inventory.items[invUi.focus.index] ?? null;
    } catch (e) {}
    return it && it.type !== "quest" ? it : null;
  };
  let lastDm = 0;
  const dismantle = () => {
    if (Date.now() - lastDm < 300) return;
    lastDm = Date.now();
    const it = dmTarget();
    if (!it) { S.audioRef?.play?.("sfx-event-refuse"); return; }
    const gold = __DM_GOLD[it.rarity] ?? 8;
    const nm = typeof _t === "function" ? _t(it) : (it.name || "Item");
    S.inventory.remove(it);
    try { S.stats?.addGold ? S.stats.addGold(gold) : (S.stats.gold = (S.stats.gold || 0) + gold); } catch (e) {}
    try { S.audioRef?.play?.("sfx-chest-open"); S.effects?.burstTinted?.(S.player?.x || 0, (S.player?.y || 0) - 8, 0xc9a24a, 14); } catch (e) {}
    S.game.events.emit("ui:banner", __L3(`⚒ DESMONTADO: ${nm} (+${gold} ouro)`, `⚒ DISMANTLED: ${nm} (+${gold} gold)`, `⚒ DESMONTADO: ${nm} (+${gold} oro)`), "#e8c872");
    invUi.selected = null;
    try { fi(S); } catch (e) {}
    invUi.refresh();
    drawRows();
    S.requestSave?.(500);
  };""")
rep("""    // Saldo atual de Cristais do Refúgio do Herói""", """    // Linha de desmontar
    {
      const di = __FORGE_RARITIES.length, ry = rowStartY + di * rowH + 4, isSel = selectedRow === di, it = dmTarget();
      const g2 = ui.add.graphics();
      g2.fillStyle(isSel ? 0x2a1d10 : 0x15100a, 0.95).fillRoundedRect(x0 + 14, ry, W - 28, rowH - 4, 4);
      g2.lineStyle(isSel ? 2 : 1, isSel ? 0xffd24a : 0x8a6a3a, isSel ? 1 : 0.7).strokeRoundedRect(x0 + 14, ry, W - 28, rowH - 4, 4);
      rowsContainer.add(g2);
      const rc = (__FORGE_RARITIES.find(r => r.key === it?.rarity) || {}).color || "#8a7f66";
      const nm = it ? (typeof _t === "function" ? _t(it) : (it.name || "Item")) : __L3("selecione um item na mochila", "select an item in your bag", "elige un objeto de la bolsa");
      rowsContainer.add(ui.add.text(x0 + 24, ry + (rowH - 4) / 2, (isSel ? "▶ " : "") + __L3("DESMONTAR", "DISMANTLE", "DESMONTAR"), { fontFamily: F_SERIF, fontStyle: "bold", fontSize: "9px", color: isSel ? "#ffffff" : "#e8c872", stroke: "#0a0604", strokeThickness: 2 }).setOrigin(0, 0.5));
      rowsContainer.add(ui.add.text(x0 + 130, ry + (rowH - 4) / 2, nm.length > 26 ? nm.slice(0, 25) + "…" : nm, { fontFamily: F_MONO, fontSize: "8.5px", color: it ? rc : "#8a7f66", stroke: "#0a0604", strokeThickness: 2 }).setOrigin(0, 0.5));
      const bx = x0 + W - 24 - 55, by = ry + (rowH - 4) / 2, bg3 = ui.add.graphics();
      bg3.fillStyle(it ? (isSel ? 0x5a4214 : 0x3a2a0e) : 0x181410, 0.95).fillRoundedRect(bx - 55, by - 10, 110, 20, 4);
      bg3.lineStyle(isSel ? 2 : 1, isSel ? 0xffffff : (it ? 0xc9a24a : 0x3d3024), 0.95).strokeRoundedRect(bx - 55, by - 10, 110, 20, 4);
      rowsContainer.add(bg3);
      rowsContainer.add(ui.add.text(bx, by, it ? __L3(`⚒ +${__DM_GOLD[it.rarity] ?? 8} OURO`, `⚒ +${__DM_GOLD[it.rarity] ?? 8} GOLD`, `⚒ +${__DM_GOLD[it.rarity] ?? 8} ORO`) : "—", { fontFamily: F_SERIF, fontStyle: "bold", fontSize: "8px", color: it ? "#fff1c8" : "#6a6054", stroke: "#0a0604", strokeThickness: 2 }).setOrigin(0.5, 0.5));
      const z = ui.add.zone(x0 + W / 2, by, W - 28, rowH - 4).setInteractive({ useHandCursor: !0 });
      z.on("pointerover", () => { if (selectedRow !== di) { selectedRow = di; drawRows(); } });
      z.on("pointerdown", () => { selectedRow = di; dismantle(); });
      rowsContainer.add(z);
    }

    // Saldo atual de Cristais do Refúgio do Herói""")
# não forjar duas vezes com um toque só
rep("  const executeForge = (rarKey) => {", "  let lastForge = 0;\n  const executeForge = (rarKey) => {\n    if (Date.now() - lastForge < 300) return;\n    lastForge = Date.now();")
assert "keyHandler" not in new and "padPoll" not in new

WRAP = """
/* Martelo de Forjador: comprado no Ferreiro do Refúgio (160 de ouro na campanha / 40 fragmentos no modo infinito);
   sem ele a forja (fundir e desmontar) fica trancada */
Ms.HAMMER={id:"HAMMER",get name(){return __L3("Martelo de Forjador","Forger's Hammer","Martillo de Forjador")},get desc(){return __L3("Libera fundir e desmontar","Unlocks fusing and dismantling","Desbloquea fundir y desmontar")},icon:"⚒",max:1,baseCost:40,costStep:0,bonus:()=>({})};
function __hasHammer(S){try{const G=S?.game||window.__DED_GAME,mode=G?.registry?.get("mode");if(mode==="endless")return(Xe().upgrades?.HAMMER??0)>0;
 if((G?.registry?.get("campaign:refuge")?.upgrades?.HAMMER??0)>0)return!0;const sl=G?.registry?.get("save:slot")??1,r=Dn(sl);return(r.ok&&(r.data?.campaign?.refuge?.upgrades?.HAMMER??0)>0)}catch(e){return!1}}
{const F0=__openForge;__openForge=function(inv){try{const S=inv?.gs?.();if(S&&!__hasHammer(S)){S.audioRef?.play?.("sfx-event-refuse");S.game.events.emit("ui:banner",__L3("🔒 Precisa do Martelo de Forjador — compre no Ferreiro do Refúgio","🔒 You need the Forger's Hammer — buy it from the Refuge Blacksmith","🔒 Necesitas el Martillo de Forjador — cómpralo al Herrero del Refugio"),"#e08a7a");return}}catch(e){}return F0.apply(this,arguments)}}
/* inventário: com a forja aberta todas as teclas (e botões do gamepad) vão só para ela; Y abre/fecha a forja;
   mover a seleção fecha a ficha de atributos do item anterior */
{const H0=Cd.prototype.handleKey;Cd.prototype.handleKey=function(k){if(this.open&&this.__forgeModal&&this.__forgeKey)return this.__forgeKey(k);
 if(this.open&&this.selected&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)&&!(this.__sk&&this.__tab>=1))this.selected=null;return H0.apply(this,arguments)};
 const C0=Cd.prototype.close;Cd.prototype.close=function(){if(this.open&&this.__forgeModal&&this.__forgeKey){this.__forgeKey("Escape");return}return C0.apply(this,arguments)};
 const S0=Cd.prototype.show;Cd.prototype.show=function(){const r=S0.apply(this,arguments);try{if(!this.__forgeT){this.__forgeT=!0;this.ui.input.keyboard?.on("keydown-T",()=>{if(!this.open||this.ui.shopUI?.open||this.ui.settingsPanel?.open)return;this.__forgeModal&&this.__forgeKey?this.__forgeKey("t"):__openForge(this)})}}catch(e){}/* no gamepad o botão mostra qual botão abre a forja */
 try{const t=this.forgeBtn;if(t?.setText){t.setText(__L3("FORJA","FORGE","FORJA")+(this.ui.game.inputManager?.device==="gamepad"?" Ⓨ":""));t.input?.hitArea?.setTo?.(-8,-5,t.width+16,t.height+10)}}catch(e){}return r}}
"""
# Ferreiro do Refúgio: martelo como 3ª linha (receitas descem para não sobrepor)
HEAD_OB = 'openBlacksmith(){this.openMetaPanel(W("hub.smith"),W("hub.smithQuote"),["MIGHT","PRECISION"]);const i=_/2,t=ir.map(d=>{const o=Xt[d.output];return`• ${d.label} → ${St(`item.${d.output}`,o?.name??d.output)}`}),e=this.add.text(i,176,[W("hub.recipes"),...t].join(`'
OB = HEAD_OB + "\n" + '`),{...Le,fontSize:"8px",lineSpacing:4,align:"center"}'
NB = OB.replace('["MIGHT","PRECISION"]', '["MIGHT","PRECISION","HAMMER"]').replace("this.add.text(i,176,", "this.add.text(i,186,").replace('fontSize:"8px",lineSpacing:4', 'fontSize:"7px",lineSpacing:2')
assert s.count(OB) == 1, "openBlacksmith"
ob = s.index(OB)
s = s[:ob] + T + NB + "/*§" + base64.b64encode(OB.encode("utf-8")).decode() + "*/" + T + s[ob + len(OB):]
OM = 'this.panelMsg.setText(W("hub.upgraded",{name:o})).setColor("#8ae0b0")'
NM = 'this.panelMsg.setText(i==="HAMMER"?__L3("Martelo comprado! Agora você pode forjar e desmontar itens.","Hammer bought! You can now forge and dismantle items.","¡Martillo comprado! Ya puedes forjar y desmontar objetos."):W("hub.upgraded",{name:o})).setColor("#8ae0b0")'
assert s.count(OM) == 1, "panelMsg"
om = s.index(OM)
s = s[:om] + T + NM + "/*§" + base64.b64encode(OM.encode("utf-8")).decode() + "*/" + T + s[om + len(OM):]
i = s.index("const __FORGE_RARITIES")
j = s.index("\n  drawRows();\n}", i) + len("\n  drawRows();\n}")
# visual "C · limpo e moderno" na janela da forja (fonte do sistema, painel grafite, destaque âmbar)
UC = [
    ('const F_SERIF = "Georgia, \'Times New Roman\', serif";', 'const F_SERIF = "system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif";'),
    ('const F_MONO = "\'Courier New\', monospace";', 'const F_MONO = "system-ui,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif";'),
    ("bg.fillStyle(0x0e0906, 0.98);", "bg.fillStyle(0x12151c, 0.98);"),
    ('name: "Comum",', 'get name() { return __L3("Comum", "Common", "Común"); },'),
    ('name: "Incomum",', 'get name() { return __L3("Incomum", "Uncommon", "Poco común"); },'),
    ('name: "Raro",', 'get name() { return __L3("Raro", "Rare", "Raro"); },'),
    ('name: "Épico",', 'get name() { return __L3("Épico", "Epic", "Épico"); },'),
    ('name: "Lendário",', 'get name() { return __L3("Lendário", "Legendary", "Legendario"); },'),
    ('name: "Relíquia (Máxima)",', 'get name() { return __L3("Relíquia (Máxima)", "Relic (Max)", "Reliquia (Máxima)"); },'),
    ("(isSelected ? 0x2b5837 : 0x1c3a24)) : (isSelected ? 0x2a221a : 0x181410)", "(isSelected ? 0x2b5837 : 0x1c3a24)) : (isSelected ? 0x2a2f3a : 0x1b1f28)"),
    ("(canForge ? (rar.key === \"RELIC\" ? 0xef4444 : 0x4ade80) : 0x3d3024)", "(canForge ? (rar.key === \"RELIC\" ? 0xef4444 : 0x4ade80) : 0x3a404c)"),
    ("(it ? 0xc9a24a : 0x3d3024)", "(it ? 0xffc14d : 0x3a404c)"),
    ("bg.lineStyle(2, 0xc9a24a, 0.95);", "bg.lineStyle(1.5, 0xffffff, 0.16);"),
    ("bg.lineStyle(1, 0x3d2c18, 0.8);", "bg.lineStyle(1, 0xffffff, 0.06);"),
    ('color: "#ffd24a",', 'color: "#ffc14d",'),
    ('stroke: "#0a0604",', 'stroke: "#0b0d12",'),
    ('color: "#d1c7b7",', 'color: "#c4cad4",'),
    ('color: "#e8c872",', 'color: "#ffffff",'),
    ('backgroundColor: "#2e150d",', 'backgroundColor: "#ffffff22",'),
    ('closeBtn.setColor("#e8c872")', 'closeBtn.setColor("#ffffff")'),
    ("rbg.fillStyle(isSelected ? 0x221a12 : (canForge ? 0x18120c : 0x100b08), 0.95);", "rbg.fillStyle(isSelected ? 0x2a2f3a : (canForge ? 0x1b1f28 : 0x15181f), 0.95);"),
    ("isSelected ? 0xffd24a : (canForge ? rar.border : 0x2e2318)", "isSelected ? 0xffc14d : (canForge ? rar.border : 0x2a2f3a)"),
    ("g2.fillStyle(isSel ? 0x2a1d10 : 0x15100a, 0.95)", "g2.fillStyle(isSel ? 0x2a2f3a : 0x1b1f28, 0.95)"),
    ("isSel ? 0xffd24a : 0x8a6a3a", "isSel ? 0xffc14d : 0x3a404c"),
    ("bg3.fillStyle(it ? (isSel ? 0x5a4214 : 0x3a2a0e) : 0x181410, 0.95)", "bg3.fillStyle(it ? (isSel ? 0x5a4718 : 0x3a3220) : 0x1b1f28, 0.95)"),
]
for a, b in UC:
    if a in new:
        new = new.replace(a, b)
    else:
        print("  (forja visual: trecho não achado)", a[:50])
s = s[:i] + T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T + s[j:]
s = s + T + WRAP + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("forja com gamepad e ficha do item")
