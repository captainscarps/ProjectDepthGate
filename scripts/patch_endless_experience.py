import os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR_BUNDLE = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SKILLS_UI = os.path.join(ROOT, "assets", "infinite-skills-ui.js")
MIRROR_SKILLS_UI = os.path.join(ROOT, "Projeto atualizado", "assets", "infinite-skills-ui.js")

print("Patching Endless Mode experience so all additions are immediately accessible and visible...")

# Step 1: Patch infinite-skills-ui.js
with open(SKILLS_UI, 'r', encoding='utf-8') as f:
    ui_code = f.read()

# 1.1 Points start at level 1: Math.max(1, Math.min(15, lvl))
old_points = 'const totalStd = Math.max(0, Math.min(13, lvl - 2));'
new_points = 'const totalStd = Math.max(1, Math.min(15, lvl));'
if old_points in ui_code:
    ui_code = ui_code.replace(old_points, new_points, 1)
    print("Updated getAvailablePoints to grant 1 point right at level 1")

# 1.2 Choice modal subtitle
old_sub = 'Nível 3 Alcançado: escolha o seu estilo de combate. O outro caminho ficará trancado até o fim da run.'
new_sub = 'Escolha o seu caminho do Abismo. Seu estilo definirá suas árvores de habilidades e bônus da jornada.'
if old_sub in ui_code:
    ui_code = ui_code.replace(old_sub, new_sub, 1)
    print("Updated choice modal subtitle")

with open(SKILLS_UI, 'w', encoding='utf-8') as f:
    f.write(ui_code)

shutil.copyfile(SKILLS_UI, MIRROR_SKILLS_UI)
print("Updated infinite-skills-ui.js and mirror.")

# Step 2: Patch BUNDLE
with open(BUNDLE, 'r', encoding='utf-8') as f:
    s = f.read()

def rep(old, new, desc):
    global s
    c = s.count(old)
    if c != 1:
        print(f"ERROR: Expected 1 occurrence for '{desc}', found {c}")
        sys.exit(1)
    s = s.replace(old, new)
    print(f"Applied: {desc}")

# 2.1 Patch onSkillsOpen() to route directly to infiniteSkillTree in Endless Mode
old_onSkillsOpen = 'onSkillsOpen(){this.result.isVisible()||this.pauseMenu.open||this.shopUI.open||this.storyPanel.visible||this.blessingPanel.visible||(this.inventoryUI.open&&this.inventoryUI.close(),this.skillTree.toggle())}'
new_onSkillsOpen = 'onSkillsOpen(){if(this.result.isVisible()||this.pauseMenu.open||this.shopUI.open||this.storyPanel.visible||this.blessingPanel.visible)return;this.inventoryUI.open&&this.inventoryUI.close();if(this.scene.get("Game")?.mode==="endless"&&this.infiniteSkillTree){this.infiniteSkillTree.open?this.infiniteSkillTree.close():this.infiniteSkillTree.show();return}this.skillTree.toggle()}'
rep(old_onSkillsOpen, new_onSkillsOpen, "Route onSkillsOpen to infiniteSkillTree in Endless Mode")

# 2.2 Patch Rd.prototype.toggle and Rd.prototype.show
old_rd_toggle = 'zone:a})}}toggle(){this.open?this.close():this.show()}show(){const i=this.gs();!i||i.state!=="playing"||(this.built||this.build(),this.open=!0,this.sel=0,this.buildNodes(),this.root.setVisible(!0),this.refresh(),this.ui.game.events.emit("ui:inventory",!0),this.ui.game.events.emit("skills:seen"))}'
new_rd_toggle = 'zone:a})}}toggle(){if(this.gs()?.mode==="endless"&&this.ui?.infiniteSkillTree){this.ui.infiniteSkillTree.open?this.ui.infiniteSkillTree.close():this.ui.infiniteSkillTree.show();return}this.open?this.close():this.show()}show(){const i=this.gs();if(!i||i.state!=="playing")return;if(i.mode==="endless"&&this.ui?.infiniteSkillTree){this.ui.infiniteSkillTree.show();return}(this.built||this.build(),this.open=!0,this.sel=0,this.buildNodes(),this.root.setVisible(!0),this.refresh(),this.ui.game.events.emit("ui:inventory",!0),this.ui.game.events.emit("skills:seen"))}'
rep(old_rd_toggle, new_rd_toggle, "Route Rd.prototype.toggle and show to infiniteSkillTree in Endless Mode")

# 2.3 Patch __invSkills to route inventory Skills tab to infiniteSkillTree in Endless Mode
old_invSkills = 'function __invSkills(C,on){const T=C.ui.skillTree;if(!T)return;if(on){'
new_invSkills = 'function __invSkills(C,on){if((C.ui?.scene?.get("Game")?.mode==="endless"||C.gs?.()?.level?.endless)&&C.ui?.infiniteSkillTree){if(on){C.close();C.ui.infiniteSkillTree.show()}return}const T=C.ui.skillTree;if(!T)return;if(on){'
rep(old_invSkills, new_invSkills, "Route inventory Habilidades tab to infiniteSkillTree in Endless Mode")

# 2.4 Add HABILIDADES DO ABISMO to Pause Menu
old_pause_menu = '{label:__L3("CÓDICE","CODEX","CÓDICE"),action:()=>__codexOpen(this.ui)},'
new_pause_menu = '{label:__L3("HABILIDADES DO ABISMO","ABYSS SKILLS","HABILIDADES DEL ABISMO"),action:()=>{this.toggle();const ui=this.ui;if(ui.scene.get("Game")?.mode==="endless"&&ui.infiniteSkillTree)ui.infiniteSkillTree.show();else ui.skillTree.toggle()}},{label:__L3("CÓDICE","CODEX","CÓDICE"),action:()=>__codexOpen(this.ui)},'
rep(old_pause_menu, new_pause_menu, "Add Abyss Skills to Pause Menu")

# 2.5 Auto-trigger Level 1 Choice Modal and Intro Banner on Endless Mode Floor 1 start
old_endless_start = ',i.endless&&!this.carry&&!this.restoreData&&!this.restoreEndless){const r=this.game.registry.get("endless:run");r&&r.depth===1&&!r.metaApplied&&(r.metaApplied=!0,this.metaBonuses.startGold&&this.stats.addGold(this.metaBonuses.startGold))}'
new_endless_start = ',i.endless&&!this.carry&&!this.restoreData&&!this.restoreEndless){const r=this.game.registry.get("endless:run");r&&r.depth===1&&!r.metaApplied&&(r.metaApplied=!0,this.metaBonuses.startGold&&this.stats.addGold(this.metaBonuses.startGold));this.time.delayedCall(700,()=>{if(this.scene.isActive()){this.game.events.emit("ui:banner","⚡ MODO INFINITO 2.0 · ÁRVORES DO ABISMO","#ffd24a");const uiS=this.scene.get("UI");if(uiS&&uiS.infiniteSkillTree&&!uiS.infiniteSkillTree.getRunState()?.chosenTree){uiS.infiniteSkillTree.openChoiceModal()}}})}'
rep(old_endless_start, new_endless_start, "Auto-open Level 1 Choice Modal and Intro Banner at Endless start")

# 2.6 Patch keydown-H to toggle infiniteSkillTree in Endless Mode
old_key_h = 'this.input.keyboard.on("keydown-H",()=>{this.result.isVisible()||this.pauseMenu.open||this.shopUI.open||this.storyPanel.visible||this.blessingPanel.visible||this.inventoryUI.open||this.skillTree.toggle()})'
new_key_h = 'this.input.keyboard.on("keydown-H",()=>{if(this.result.isVisible()||this.pauseMenu.open||this.shopUI.open||this.storyPanel.visible||this.blessingPanel.visible)return;this.inventoryUI.open&&this.inventoryUI.close();if(this.scene.get("Game")?.mode==="endless"&&this.infiniteSkillTree){this.infiniteSkillTree.open?this.infiniteSkillTree.close():this.infiniteSkillTree.show();return}this.skillTree.toggle()})'
rep(old_key_h, new_key_h, "Route keydown-H to infiniteSkillTree in Endless Mode")

# Save patched bundle
with open(BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved patched {BUNDLE}")

with open(MIRROR_BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved mirror {MIRROR_BUNDLE}")

print("All Endless Mode experience hooks applied successfully!")
