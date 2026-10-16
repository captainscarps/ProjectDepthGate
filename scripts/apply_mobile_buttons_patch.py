import hashlib
import os
import shutil
import subprocess

INDEX_FILES = [
    'assets/index-D6qIWtA7-p209.js',
    'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
]

CONTROLS_FILES = [
    'assets/ControlsPanel-kYdEPlgz-p209.js',
    'Projeto atualizado/assets/ControlsPanel-kYdEPlgz-p209.js'
]

# 1. Patches for index-D6qIWtA7-p209.js
index_replacements = [
    # 1. Global __isTouch helper
    (
        'function __usingPad(){return globalThis.__DED_GAME?.inputManager?.device==="gamepad"}',
        'function __usingPad(){return globalThis.__DED_GAME?.inputManager?.device==="gamepad"}'
        'function __isTouch(){try{const im=globalThis.__DED_GAME?.inputManager;if(im?.device==="touch")return!0;if(im?.device==="gamepad")return!1;if(typeof ci==="function"&&typeof Kt==="function"){if(ci(Kt()))return!0}const t="ontouchstart"in window||(navigator.maxTouchPoints??0)>0,c=window.matchMedia?.("(pointer: coarse)")?.matches??!1,m=/Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(navigator.userAgent);return(t&&(c||m))||(t&&window.innerWidth<=1024)}catch(e){return!1}}'
        'globalThis.__isTouch=__isTouch;'
    ),

    # 2. Touch-aware Gt(c, i, t) hitArea expansion (min 44x44px on touch)
    (
        'function Gt(c,i=10,t=8){return c.input?.hitArea?.setTo&&c.input.hitArea.setTo(-i,-t,c.width+i*2,c.height+t*2),c}',
        'function Gt(c,i=10,t=8){if(!c?.input)return c;const isT=typeof __isTouch==="function"?__isTouch():("ontouchstart"in window||(navigator.maxTouchPoints??0)>0),minW=isT?44:20,minH=isT?44:20,w=c.width||c.displayWidth||20,h=c.height||c.displayHeight||20,padX=Math.max(i,isT?Math.ceil(Math.max(0,minW-w)/2)+6:i),padY=Math.max(t,isT?Math.ceil(Math.max(0,minH-h)/2)+6:t);return c.input?.hitArea?.setTo&&c.input.hitArea.setTo(-padX,-padY,w+padX*2,h+padY*2),c}'
    ),

    # 3. InputManager touch initialization
    (
        '\nconstructor(i){\nthis.game=i;\nthis.device="keyboard";\nthis.mouseAim=null;',
        '\nconstructor(i){\nthis.game=i;\nthis.device=("ontouchstart"in window||(navigator.maxTouchPoints??0)>0||window.matchMedia?.("(pointer: coarse)")?.matches)?"touch":"keyboard";\nthis.mouseAim=null;'
    ),

    # 4. InputManager pointerdown touch detection
    (
        'window.addEventListener("pointerdown",t=>{\n  if(t.button===0){\n    this.mouseAimActive=true;\n    this.lastPointerMoveTime=performance.now();\n  }\n});',
        'window.addEventListener("pointerdown",t=>{\n  if(t.pointerType==="touch"||t.pointerType==="")this.setDevice("touch");\n  if(t.button===0){\n    this.mouseAimActive=true;\n    this.lastPointerMoveTime=performance.now();\n  }\n});'
    ),

    # 5. SettingsPanel close button and add explicit [VOLTAR] button
    (
        'this.navHint=i.add.text(214,st-10,"",{fontFamily:"\'Courier New\', monospace",fontSize:"8px",fontStyle:"bold",color:"#b8a888"}).setOrigin(0,1),this.root.add(this.navHint);const d=i.add.text(_-14,12,"✕",{fontFamily:M,fontStyle:"bold",fontSize:"15px",color:"#efe4c8"}).setOrigin(1,0).setInteractive({useHandCursor:!0});Gt(d,10,10),d.on("pointerdown",()=>this.close()),this.root.add(d);',
        'this.navHint=i.add.text(214,st-10,"",{fontFamily:"\'Courier New\', monospace",fontSize:"8px",fontStyle:"bold",color:"#b8a888"}).setOrigin(0,1),this.root.add(this.navHint);const d=i.add.text(_-14,12,"✕",{fontFamily:M,fontStyle:"bold",fontSize:"16px",color:"#efe4c8",backgroundColor:"#3a1810",padding:{x:12,y:8}}).setOrigin(1,0).setInteractive({useHandCursor:!0});Gt(d,22,18),d.on("pointerdown",()=>this.close()),this.root.add(d);const bClose=i.add.text(_-14,st-10,"[ ◀ VOLTAR ]",{fontFamily:M,fontStyle:"bold",fontSize:"11px",color:"#ffd24a",backgroundColor:"#2b1810",padding:{x:14,y:8}}).setOrigin(1,1).setInteractive({useHandCursor:!0});Gt(bClose,18,14),bClose.on("pointerdown",()=>this.close()),this.root.add(bClose);'
    ),

    # 6. SettingsPanel navHint text (hide keyboard prompts on mobile)
    (
        'this.navHint.setText(__usingPad()?`✥ AJUSTAR     ${__padL(3)} CATEGORIA     ${__padL(1)} VOLTAR`:"↑↓ ITEM     ←→ AJUSTAR     Q/E CATEGORIA     ESC VOLTAR")',
        'this.navHint.setText(__usingPad()?`✥ AJUSTAR     ${__padL(3)} CATEGORIA     ${__padL(1)} VOLTAR`:__isTouch()?"TOQUE NAS OPÇÕES PARA AJUSTAR":"↑↓ ITEM     ←→ AJUSTAR     Q/E CATEGORIA     ESC VOLTAR")'
    ),

    # 7. ClassSelect footTxt (hide ENTER/ESC, enlarge bk button)
    (
        'const bk=this.add.text(105,334,W("cls.back"),{fontFamily:G,fontStyle:"bold",fontSize:"11px",color:"#d8cdb4"}).setOrigin(.5).setDepth(3).setInteractive({useHandCursor:!0});bk.on("pointerover",()=>bk.setColor("#ffd24a")),bk.on("pointerout",()=>bk.setColor("#d8cdb4"));const hBack=()=>{if(this.__dPanel){this.__closeDiff();return}this.scene.start("MainMenu")};bk.on("pointerdown",hBack);this.footTxt=this.add.text(318,354,"↑ ↓  ESCOLHER     ENTER  COMEÇAR     ESC  VOLTAR",{fontFamily:M,fontSize:"7px",fontStyle:"bold",color:"#b8a888"}).setOrigin(.5,1).setDepth(3);',
        'const bk=this.add.text(105,334,W("cls.back"),{fontFamily:G,fontStyle:"bold",fontSize:"11px",color:"#d8cdb4",backgroundColor:"#2b1810",padding:{x:14,y:8}}).setOrigin(.5).setDepth(3).setInteractive({useHandCursor:!0});Gt(bk,18,14),bk.on("pointerover",()=>bk.setColor("#ffd24a")),bk.on("pointerout",()=>bk.setColor("#d8cdb4"));const hBack=()=>{if(this.__dPanel){this.__closeDiff();return}this.scene.start("MainMenu")};bk.on("pointerdown",hBack);this.footTxt=this.add.text(318,354,__isTouch()?"TOQUE NA CLASSE PARA ESCOLHER":"↑ ↓  ESCOLHER     ENTER  COMEÇAR     ESC  VOLTAR",{fontFamily:M,fontSize:"7px",fontStyle:"bold",color:"#b8a888"}).setOrigin(.5,1).setDepth(3);'
    ),

    # 8. Difficulty modal VOLTAR button
    (
        'const b=this.add.text(e,272,"VOLTAR",{fontFamily:"Georgia, \'Times New Roman\', serif",fontStyle:"bold",fontSize:"13px",color:"#d8cdb4"}).setOrigin(.5).setInteractive({useHandCursor:!0});b.on("pointerdown",()=>this.__closeDiff()),d.add(b)',
        'const b=this.add.text(e,272,"VOLTAR",{fontFamily:"Georgia, \'Times New Roman\', serif",fontStyle:"bold",fontSize:"13px",color:"#d8cdb4",backgroundColor:"#2b1810",padding:{x:16,y:8}}).setOrigin(.5).setInteractive({useHandCursor:!0});Gt(b,20,16),b.on("pointerdown",()=>this.__closeDiff()),d.add(b)'
    ),

    # 9. MainMenu navHint (hide ENTER/ESC on mobile)
    (
        'const s=__usingPad()?`✥ NAVEGAR    ${__padL(0)} SELECIONAR    ${__padL(1)} VOLTAR`:"↑ ↓ NAVEGAR    ENTER SELECIONAR    ESC VOLTAR";H.text!==s&&H.setText(s)',
        'const s=__usingPad()?`✥ NAVEGAR    ${__padL(0)} SELECIONAR    ${__padL(1)} VOLTAR`:__isTouch()?"TOQUE PARA SELECIONAR":"↑ ↓ NAVEGAR    ENTER SELECIONAR    ESC VOLTAR";H.text!==s&&H.setText(s)'
    ),

    # 10. EventDialog prompt text (hide [E/ENTER] and [Q/ESC] on mobile)
    (
        'refreshEventPrompt(){\n  const i=this.eventDef;\n  if(i?.options){\n    const t=i.options.map((e,d)=>{\n      const o=St(`ev.${i.id}.opt${d}`,e.label);\n      return d===this.eventSel?`» [${d+1}] ${o} «`:`[${d+1}] ${o}`\n    }).join(" · ");\n    this.eventPrompt.setText(`${t} · [Q/ESC] ${W("menu.quit")}`);\n  }else{\n    this.eventPrompt.setText(`[E/ENTER] ${W("menu.yes")} · [Q/ESC] ${W("menu.no")}`);\n  }\n  this.adjustEventBox();\n}',
        'refreshEventPrompt(){\n  const i=this.eventDef,isT=__isTouch();\n  if(i?.options){\n    const t=i.options.map((e,d)=>{\n      const o=St(`ev.${i.id}.opt${d}`,e.label);\n      return isT?o:(d===this.eventSel?`» [${d+1}] ${o} «`:`[${d+1}] ${o}`);\n    }).join(" · ");\n    this.eventPrompt.setText(isT?`Toque para escolher:  ${t}`:`${t} · [Q/ESC] ${W("menu.quit")}`);\n  }else{\n    this.eventPrompt.setText(isT?`${W("menu.yes")}   ·   ${W("menu.no")}`:`[E/ENTER] ${W("menu.yes")} · [Q/ESC] ${W("menu.no")}`);\n  }\n  this.adjustEventBox();\n}'
    ),

    # 11. EventDialog option buttons (larger padding & hitArea)
    (
        'const n=this.add.text(0,52,d.label,{fontFamily:"\'Courier New\', monospace",fontSize:"9px",fontStyle:"bold",color:"#e8dcc0",backgroundColor:"#241a10",padding:{x:6,y:5}}).setOrigin(.5).setInteractive({useHandCursor:!0});\n    Gt(n,8,8),n.on("pointerdown",()=>d.cb());',
        'const n=this.add.text(0,52,d.label,{fontFamily:"\'Courier New\', monospace",fontSize:"10px",fontStyle:"bold",color:"#e8dcc0",backgroundColor:"#241a10",padding:{x:14,y:8}}).setOrigin(.5).setInteractive({useHandCursor:!0});\n    Gt(n,18,14),n.on("pointerdown",()=>d.cb());'
    ),

    # 12. Bestiary close button
    (
        'const close = this.add.text(X1 - 4, 12, "✕", { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "13px", color: "#f3e6c4", backgroundColor: "#5a1a12", padding: { x: 6, y: 3 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 });',
        'const close = this.add.text(X1 - 4, 12, "✕", { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "16px", color: "#f3e6c4", backgroundColor: "#5a1a12", padding: { x: 12, y: 8 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 });Gt(close, 22, 18);'
    ),

    # 13. Bestiary pagination arrows
    (
        'const t = this.add.text(x, 326, s, { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "14px", color: __BK_RED }).setOrigin(.5).setInteractive({ useHandCursor: !0 });',
        'const t = this.add.text(x, 326, s, { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "16px", color: __BK_RED, padding: { x: 10, y: 8 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 });Gt(t, 20, 16);'
    ),

    # 14. Bestiary hint (hide ENTER/ESC on mobile)
    (
        'this.hint.setText(pad ? `✥ ${__L3("PÁGINAS", "PAGES", "PÁGINAS")}    A ${__L3("ABRIR", "OPEN", "ABRIR")}    B ${__L3("FECHAR", "CLOSE", "CERRAR")}    Y ${__L3("ÍNDICE", "INDEX", "ÍNDICE")}`\n      : `← → ${__L3("VIRAR PÁGINAS", "TURN PAGES", "PASAR PÁGINAS")}    ↑ ↓ ENTER ${__L3("ÍNDICE", "INDEX", "ÍNDICE")}    ESC ${__L3("FECHAR", "CLOSE", "CERRAR")}`);',
        'this.hint.setText(pad ? `✥ ${__L3("PÁGINAS", "PAGES", "PÁGINAS")}    A ${__L3("ABRIR", "OPEN", "ABRIR")}    B ${__L3("FECHAR", "CLOSE", "CERRAR")}    Y ${__L3("ÍNDICE", "INDEX", "ÍNDICE")}`\n      : __isTouch() ? "TOQUE NAS SETAS ◀ ▶ PARA VIRAR PÁGINAS  ·  ✕ FECHAR"\n      : `← → ${__L3("VIRAR PÁGINAS", "TURN PAGES", "PASAR PÁGINAS")}    ↑ ↓ ENTER ${__L3("ÍNDICE", "INDEX", "ÍNDICE")}    ESC ${__L3("FECHAR", "CLOSE", "CERRAR")}`);'
    ),

    # 15. SkillTree close button
    (
        'const d=i.add.text(586,22,"✕",{..._i,fontSize:"13px",color:"#c9a24a",backgroundColor:"#241a10",padding:{x:7,y:4}}).setOrigin(.5,0).setInteractive({useHandCursor:!0});Gt(d,8,8),d.on("pointerdown",()=>this.close())',
        'const d=i.add.text(586,22,"✕",{..._i,fontSize:"16px",color:"#c9a24a",backgroundColor:"#3a1810",padding:{x:12,y:8}}).setOrigin(.5,0).setInteractive({useHandCursor:!0});Gt(d,22,20),d.on("pointerdown",()=>this.close())'
    ),

    # 16. Portal / Rift modal close button
    (
        'const closeBtn = ui.add.text(x0 + W - 20, y0 + 10, "✕", {\n    fontFamily: F_SERIF,\n    fontStyle: "bold",\n    fontSize: "14px",\n    color: "#e8c872"\n  }).setOrigin(0.5, 0).setInteractive({ useHandCursor: !0 });',
        'const closeBtn = ui.add.text(x0 + W - 20, y0 + 10, "✕", {\n    fontFamily: F_SERIF,\n    fontStyle: "bold",\n    fontSize: "16px",\n    color: "#e8c872",\n    backgroundColor: "#2e150d",\n    padding: { x: 10, y: 6 }\n  }).setOrigin(0.5, 0).setInteractive({ useHandCursor: !0 });\n  Gt(closeBtn, 22, 20);'
    ),

    # 17. Portal / Rift modal action zones (expanded touch height)
    (
        'const enterZone = ui.add.zone(enterBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });\n\n  const bCancelBg = ui.add.graphics();\n  const cancelBtnX = cx + 76;\n  const tCancel = ui.add.text(cancelBtnX, btnY, "✕ RECUAR", {\n    fontFamily: F_SERIF,\n    fontStyle: "bold",\n    fontSize: "9px",\n    color: "#d1c7b7",\n    stroke: "#0a0604",\n    strokeThickness: 2\n  }).setOrigin(0.5, 0.5);\n  const cancelZone = ui.add.zone(cancelBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });',
        'const enterZone = ui.add.zone(enterBtnX, btnY, btnW + 16, btnH + 16).setInteractive({ useHandCursor: !0 });\n\n  const bCancelBg = ui.add.graphics();\n  const cancelBtnX = cx + 76;\n  const tCancel = ui.add.text(cancelBtnX, btnY, "✕ RECUAR", {\n    fontFamily: F_SERIF,\n    fontStyle: "bold",\n    fontSize: "9px",\n    color: "#d1c7b7",\n    stroke: "#0a0604",\n    strokeThickness: 2\n  }).setOrigin(0.5, 0.5);\n  const cancelZone = ui.add.zone(cancelBtnX, btnY, btnW + 16, btnH + 16).setInteractive({ useHandCursor: !0 });'
    ),

    # 18. Traversal pause touch button (using IIFE in comma chain)
    (
        'this.pauseUi.add(this.add.text(_/2,170,W("trav.pauseHint"),{fontFamily:"\'Courier New\', monospace",fontSize:"10px",color:"#8a7f66",align:"center"}).setOrigin(.5)),this.standalone',
        'this.pauseUi.add(this.add.text(_/2,170,__isTouch()?"TOQUE NO BOTÃO ABAIXO PARA RETOMAR":W("trav.pauseHint"),{fontFamily:"\'Courier New\', monospace",fontSize:"10px",color:"#8a7f66",align:"center"}).setOrigin(.5)),(()=>{const travResume=this.add.text(_/2,206,"[ ◀ RETOMAR ]",{fontFamily:"Georgia, serif",fontSize:"13px",fontStyle:"bold",color:"#ffd24a",backgroundColor:"#2b1810",padding:{x:16,y:8}}).setOrigin(.5).setInteractive({useHandCursor:!0});Gt(travResume,20,16),travResume.on("pointerdown",()=>this.togglePause()),this.pauseUi.add(travResume)})(),this.standalone'
    ),

    # 19. ShopUI top-right close button (using IIFE in comma chain)
    (
        'this.backBtn=this.makeButton(486,296,W("shop.back"),()=>this.close()),this.root.add([this.actionBtn,this.equipBtn,this.backBtn]),',
        'this.backBtn=this.makeButton(486,296,W("shop.back"),()=>this.close()),(()=>{const s=i.add.text(564,34,"✕",{fontFamily:"Georgia, \'Times New Roman\', serif",fontStyle:"bold",fontSize:"16px",color:"#e8c872",backgroundColor:"#2b1810",padding:{x:12,y:8}}).setOrigin(.5,.5).setInteractive({useHandCursor:!0});Gt(s,20,16),s.on("pointerdown",()=>this.close()),this.root.add(s)})(),this.root.add([this.actionBtn,this.equipBtn,this.backBtn]),'
    )
]

# Apply to index files
for path in INDEX_FILES:
    print(f"\n--- Patching {path} ---")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for idx, (old, new) in enumerate(index_replacements, 1):
        if old not in content:
            print(f"ERROR: Replacement #{idx} not found in {path}!")
            exit(1)
        cnt = content.count(old)
        if cnt != 1:
            print(f"ERROR: Replacement #{idx} count = {cnt} in {path}!")
            exit(1)
        content = content.replace(old, new, 1)
        print(f"Applied replacement #{idx} successfully.")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully saved {path} ({len(content)} bytes)")

# 2. ControlsPanel patches
controls_replacements = [
    (
        'const cl=t.add.text(W-14,12,"✕",{fontFamily:F,fontStyle:"bold",fontSize:"15px",color:"#efe4c8"}).setOrigin(1,0).setInteractive({useHandCursor:!0});cl.on("pointerdown",()=>this.hide()),this.root.add(cl);',
        'const cl=t.add.text(W-14,12,"✕",{fontFamily:F,fontStyle:"bold",fontSize:"16px",color:"#efe4c8",backgroundColor:"#3a1810",padding:{x:12,y:8}}).setOrigin(1,0).setInteractive({useHandCursor:!0});if(cl.input?.hitArea?.setTo)cl.input.hitArea.setTo(-20,-16,cl.width+40,cl.height+32);cl.on("pointerdown",()=>this.hide()),this.root.add(cl);const bVoltar=t.add.text(W-14,H-10,"[ ◀ VOLTAR ]",{fontFamily:F,fontStyle:"bold",fontSize:"11px",color:"#ffd24a",backgroundColor:"#2b1810",padding:{x:14,y:8}}).setOrigin(1,1).setInteractive({useHandCursor:!0});if(bVoltar.input?.hitArea?.setTo)bVoltar.input.hitArea.setTo(-16,-12,bVoltar.width+32,bVoltar.height+24);bVoltar.on("pointerdown",()=>this.hide()),this.root.add(bVoltar);'
    ),
    (
        'const pad=this.mgr.device==="gamepad";this.hint.setText(this.capturing?(pad?"PRESSIONE O BOTÃO DESEJADO     ESC CANCELA":"PRESSIONE A TECLA DESEJADA     ESC CANCELA"):pad?`✥ ESCOLHER     ${O(0)} ALTERAR     ${O(1)} VOLTAR`:"↑↓ ESCOLHER     ←→ TECLADO/CONTROLE     ENTER ALTERAR     ESC VOLTAR")',
        'const pad=this.mgr.device==="gamepad",isT=typeof globalThis.__isTouch==="function"?globalThis.__isTouch():("ontouchstart"in window||(navigator.maxTouchPoints??0)>0);this.hint.setText(this.capturing?(pad?"PRESSIONE O BOTÃO DESEJADO     ESC CANCELA":"PRESSIONE A TECLA DESEJADA     ESC CANCELA"):pad?`✥ ESCOLHER     ${O(0)} ALTERAR     ${O(1)} VOLTAR`:isT?"TOQUE NO VALOR PARA ALTERAR":"↑↓ ESCOLHER     ←→ TECLADO/CONTROLE     ENTER ALTERAR     ESC VOLTAR")'
    )
]

# Clean re-copy ControlsPanel from git to ensure fresh state
subprocess.run(['git', 'checkout', 'assets/ControlsPanel-kYdEPlgz-p209.js'], check=True)

with open('assets/ControlsPanel-kYdEPlgz-p209.js', 'r', encoding='utf-8') as f:
    c_content = f.read()

for idx, (old, new) in enumerate(controls_replacements, 1):
    assert old in c_content, f"Old string #{idx} not found in ControlsPanel"
    c_content = c_content.replace(old, new, 1)

with open('assets/ControlsPanel-kYdEPlgz-p209.js', 'w', encoding='utf-8') as f:
    f.write(c_content)
shutil.copy('assets/ControlsPanel-kYdEPlgz-p209.js', 'Projeto atualizado/assets/ControlsPanel-kYdEPlgz-p209.js')
print("Patched and synced ControlsPanel successfully.")

# Parity checks
def sha256_file(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

h1 = sha256_file(INDEX_FILES[0])
h2 = sha256_file(INDEX_FILES[1])
print(f"\nIndex SHA-256 (assets):             {h1}")
print(f"Index SHA-256 (Projeto atualizado): {h2}")
assert h1 == h2, "INDEX PARITY FAILED!"

c1 = sha256_file(CONTROLS_FILES[0])
c2 = sha256_file(CONTROLS_FILES[1])
print(f"\nControls SHA-256 (assets):             {c1}")
print(f"Controls SHA-256 (Projeto atualizado): {c2}")
assert c1 == c2, "CONTROLS PARITY FAILED!"

print("\nALL FILES PATCHED WITH 100% BYTE PARITY!")
