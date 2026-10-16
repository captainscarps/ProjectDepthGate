import os

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"
JS_PATHS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

with open(os.path.join(ROOT, "scripts", "codex_source.js"), "r", encoding="utf-8") as f:
    CODEX_CODE = f.read()

for path in JS_PATHS:
    print(f"Processando: {path}")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Preload de imagens de retrato do Códice
    preload_textures = 'this.load.image("slide3_king_valdrak_eye","assets/images/cinematic/slide3_king_valdrak_eye.jpg");this.load.image("slide6_guardian_altar","assets/images/cinematic/slide6_guardian_altar.jpg");'
    if 'this.load.image("slide3_king_valdrak_eye"' not in content:
        preload_anchor = 'class bo extends j.Scene{constructor(){super("Preload")}preload(){le(this),'
        if preload_anchor in content:
            content = content.replace(preload_anchor, preload_anchor + preload_textures)
            print("  [OK] Imagens do Rei e Guardiã pré-carregadas no Preload.")

    # 2. AudioEngine: adicionar sfx page-turn
    page_turn_case = 'case"page-turn":case"ui-page":this.noiseHit({duration:.18,filter:"bandpass",freq:1200,freqEnd:400,q:1.8,gain:.12,bus:this.uiBus}),this.tone({type:"triangle",freq:320,freqEnd:210,duration:.12,gain:.04,bus:this.uiBus});break;'
    if 'case"page-turn":' not in content:
        tab_case = 'case"ui-tab":this.tone({type:"square",freq:587,duration:.035,gain:.05,bus:this.uiBus});break;'
        if tab_case in content:
            content = content.replace(tab_case, page_turn_case + tab_case)
            print("  [OK] Efeito sonoro page-turn adicionado ao AudioEngine.")

    # 3. Bestiário (__BookScene): som page-turn e gesto Touch Swipe
    # In __BookScene.go:
    bestiary_go_old = 'this.game.audioEngine?.sfx("sfx-ui-tab");'
    bestiary_go_new = 'this.game.audioEngine?.sfx("page-turn");'
    if bestiary_go_old in content:
        # replace inside __BookScene
        idx_b = content.find('class __BookScene extends j.Scene')
        if idx_b != -1:
            idx_go = content.find(bestiary_go_old, idx_b)
            if idx_go != -1 and idx_go < idx_b + 50000:
                content = content[:idx_go] + bestiary_go_new + content[idx_go + len(bestiary_go_old):]
                print("  [OK] Bestiário agora usa o som page-turn ao virar páginas.")

    # In __BookScene.create: adicionar touch swipe
    bestiary_swipe_needle = 'let bTouchX=0,bTouchY=0,bTouching=!1;this.input.on("pointerdown",p=>{bTouchX=p.x,bTouchY=p.y,bTouching=!0}),this.input.on("pointerup",p=>{if(!bTouching)return;bTouching=!1;const dx=p.x-bTouchX,dy=p.y-bTouchY;Math.abs(dx)>38&&Math.abs(dx)>Math.abs(dy)*1.3&&(dx<0?this.go(this.spread+1):this.go(this.spread-1))});'
    if 'bTouching' not in content:
        b_wheel_anchor = 'this.input.on("wheel", (p, g, dx, dy) => { Math.abs(dy) > 4 && this.go(this.spread + (dy > 0 ? 1 : -1)) });'
        if b_wheel_anchor in content:
            content = content.replace(b_wheel_anchor, b_wheel_anchor + bestiary_swipe_needle)
            print("  [OK] Gesto Touch Swipe adicionado ao Bestiário.")

    # 4. Inserir __CodexScene e __codexOpen
    if 'class __CodexScene' not in content:
        insert_anchor = 'class __BookScene extends j.Scene'
        if insert_anchor in content:
            content = content.replace(insert_anchor, CODEX_CODE + "\n" + insert_anchor)
            print("  [OK] __CodexScene e __codexOpen injetados com sucesso.")

    # 5. MainMenu: adicionar botão CÓDICE e otimizar espaçamento
    mm_old_btn = '{label:__L3("COLECIONÁVEIS","COLLECTIBLES","COLECCIONABLES"),enabled:!0,action:()=>__collectiblesOpen(this)},'
    mm_new_btn = '{label:__L3("COLECIONÁVEIS","COLLECTIBLES","COLECCIONABLES"),enabled:!0,action:()=>__collectiblesOpen(this)},{label:__L3("CÓDICE","CODEX","CÓDICE"),enabled:!0,action:()=>__codexOpen(this)},'
    if mm_old_btn in content and '__codexOpen(this)' not in content:
        content = content.replace(mm_old_btn, mm_new_btn)
        print("  [OK] Botão CÓDICE adicionado ao MainMenu.")

    # MainMenu spacing adjustment for 9 buttons
    mm_calc_old = 's.forEach((l,h)=>{const u=(s.length>6?118:142)+h*(s.length>6?24:28),'
    mm_calc_new = 's.forEach((l,h)=>{const u=(s.length>7?104:(s.length>6?118:142))+h*(s.length>7?22:(s.length>6?24:28)),'
    if mm_calc_old in content:
        content = content.replace(mm_calc_old, mm_calc_new)
        print("  [OK] Layout e espaçamento vertical do MainMenu ajustados.")

    mm_font_old = 'fontSize:s.length>6?"16px":"19px"'
    mm_font_new = 'fontSize:s.length>7?"14px":(s.length>6?"16px":"19px")'
    if mm_font_old in content:
        content = content.replace(mm_font_old, mm_font_new)
        print("  [OK] Tamanho de fonte do MainMenu ajustado para 9 botões.")

    # 6. PauseMenu: adicionar botão CÓDICE
    pm_old_btn = '{label:__L3("COLECIONÁVEIS","COLLECTIBLES","COLECCIONABLES"),action:()=>__collectiblesOpen(this.ui)},'
    pm_new_btn = '{label:__L3("COLECIONÁVEIS","COLLECTIBLES","COLECCIONABLES"),action:()=>__collectiblesOpen(this.ui)},{label:__L3("CÓDICE","CODEX","CÓDICE"),action:()=>__codexOpen(this.ui)},'
    if pm_old_btn in content and '__codexOpen(this.ui)' not in content:
        content = content.replace(pm_old_btn, pm_new_btn)
        print("  [OK] Botão CÓDICE adicionado ao Menu de Pausa.")

    # PauseMenu panel height and button spacing
    pm_panel_old = '__ornatePanel(this.panelG,t-122,66,244,246),this.root.add([e,this.panelG]),(this.__sk=__winSkin(i,this.root,t-122,66,244,246,1))'
    pm_panel_new = '__ornatePanel(this.panelG,t-122,54,244,272),this.root.add([e,this.panelG]),(this.__sk=__winSkin(i,this.root,t-122,54,244,272,1))'
    if pm_panel_old in content:
        content = content.replace(pm_panel_old, pm_panel_new)
        print("  [OK] Altura do painel de pausa expandida para acomodar o Códice.")

    pm_spacing_old = 'const n=134+a*24,'
    pm_spacing_new = 'const n=122+a*22,'
    if pm_spacing_old in content:
        content = content.replace(pm_spacing_old, pm_spacing_new)
        print("  [OK] Espaçamento dos botões de pausa ajustado.")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  [OK] Salvo: {path} ({len(content)} bytes)\n")

print("Patch do Códice concluído com sucesso!")
