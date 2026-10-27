import os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR_BUNDLE = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")

print("Patching Endless Boss Rewards, Abyss Shrines, Active Skills VFX, and Hall of Fame Result Button...")

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

# 1. Hook onBossDefeated in endless mode
old_boss_def = 'onBossDefeated(i){__bossLine(this.scene,i.typeKey,1,i);'
new_boss_def = '''onBossDefeated(i){__bossLine(this.scene,i.typeKey,1,i);if(this.scene?.mode==="endless"){const st=this.scene.stats;if(st){st.nmPoints=(st.nmPoints||0)+1}this.scene.game.events.emit("ui:banner","⚡ CHEFE DO ABISMO DERROTADO! +1 PONTO DE PESADELO 💀","#ffd24a");window.__triggerHaptic?.(300,1.0);const p21=["wolf_whistle","sacred_maraca","blowpipe","golden_scythe","profane_ivory_staff","ancestral_bone_staff","midnight_scythe"];const rItm=p21[Math.floor(Math.random()*p21.length)];if(typeof this.scene.spawnLootItem==="function"){this.scene.spawnLootItem(i.x,i.y,rItm,"LEGENDARY")}}'''
rep(old_boss_def, new_boss_def, "Hook onBossDefeated for +1 Nightmare Point and Page 21 Legendary Weapon drop")

# 2. Add [ HALL DA FAMA ] button to Result / Defeat screen
old_res_btn = 'for(const S of i.buttons)v.push(S);'
new_res_btn = 'for(const S of i.buttons)v.push(S);if(i.kind==="endless"||t.scene.get("Game")?.mode==="endless"){v.splice(v.length-1,0,{label:"[ HALL DA FAMA ]",action:()=>window.__openHallOfFame?.(t),primary:!1});}'
rep(old_res_btn, new_res_btn, "Add [ HALL DA FAMA ] button to Endless results screen")

# 3. Active ability cast combat feedback in tryUse
old_try_use_success = 'tive){this.scene.effects?.floatText?.(e.x,e.y-20,`Requer: ${d.req}`,"#ff5544");this.scene.game?.audioEngine?.sfx?.("sfx-parry");return!1;}if(!this.scene.resource.canAfford(d.cost))'
new_try_use_success = 'tive){this.scene.effects?.floatText?.(e.x,e.y-20,`Requer: ${d.req}`,"#ff5544");this.scene.game?.audioEngine?.sfx?.("sfx-parry");return!1;}if(this.scene?.mode==="endless"){this.scene.effects?.floatText?.(e.x,e.y-28,d.name.toUpperCase(),"#ffd24a",9);window.__triggerHaptic?.(40,0.3);}if(!this.scene.resource.canAfford(d.cost))'
rep(old_try_use_success, new_try_use_success, "Add floating combat text and haptics when casting active abilities")

with open(BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved patched {BUNDLE}")

with open(MIRROR_BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved mirror {MIRROR_BUNDLE}")

print("Endless Boss Rewards, Result Screen Hall of Fame button, and Ability Cast VFX successfully applied!")
