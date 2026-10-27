import os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR_BUNDLE = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
PACTS_JS = os.path.join(ROOT, "assets", "abyss-portals-and-pacts.js")
MIRROR_PACTS_JS = os.path.join(ROOT, "Projeto atualizado", "assets", "abyss-portals-and-pacts.js")

print("Starting Branching Portals, Cursed Pacts, and Visual Auras patch...")

# Step 1: Update abyss-portals-and-pacts.js to ensure robust gamepad key aliases
with open(PACTS_JS, 'r', encoding='utf-8') as f:
    pacts_code = f.read()

# Update key handling for AbyssPortalChoiceUI
old_portal_keys = '''      if (key === "ArrowLeft" || key === "a" || key === "A") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowRight" || key === "d" || key === "D") {
        if (this.selectedIdx < this.cards.length - 1) {
          this.selectedIdx++;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Enter" || key === " " || key === "Space") {
        this.confirmChoice(this.selectedIdx);
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B") {'''

new_portal_keys = '''      if (key === "ArrowLeft" || key === "a" || key === "A" || key === "Left" || key === "LEFT") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowRight" || key === "d" || key === "D" || key === "Right" || key === "RIGHT") {
        if (this.selectedIdx < this.cards.length - 1) {
          this.selectedIdx++;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM" || key === "z" || key === "Z") {
        this.confirmChoice(this.selectedIdx);
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B" || key === "CANCEL" || key === "x" || key === "X") {'''

if old_portal_keys in pacts_code:
    pacts_code = pacts_code.replace(old_portal_keys, new_portal_keys, 1)

# Update key handling for AbyssPactsUI
old_pact_keys = '''      if (key === "ArrowLeft" || key === "a" || key === "A") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowRight" || key === "d" || key === "D") {
        if (this.selectedIdx < this.pacts.length - 1) {
          this.selectedIdx++;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Enter" || key === " " || key === "Space") {
        this.acceptPact(this.selectedIdx);
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B") {'''

new_pact_keys = '''      if (key === "ArrowLeft" || key === "a" || key === "A" || key === "Left" || key === "LEFT") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowRight" || key === "d" || key === "D" || key === "Right" || key === "RIGHT") {
        if (this.selectedIdx < this.pacts.length - 1) {
          this.selectedIdx++;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM" || key === "z" || key === "Z") {
        this.acceptPact(this.selectedIdx);
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B" || key === "CANCEL" || key === "x" || key === "X") {'''

if old_pact_keys in pacts_code:
    pacts_code = pacts_code.replace(old_pact_keys, new_pact_keys, 1)

with open(PACTS_JS, 'w', encoding='utf-8') as f:
    f.write(pacts_code)

shutil.copyfile(PACTS_JS, MIRROR_PACTS_JS)
print("Updated abyss-portals-and-pacts.js and mirror.")

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
    print(f"Successfully applied: {desc}")

# A. Hook getRunModifiers to merge pact modifiers
old_getrun = 'getRunModifiers(){const i=this.endlessRun(),t=i?_h(i.blessings??[]):{},e=this.metaBonuses??{},inf=(typeof window!=="undefined"&&window.__computeInfiniteSkillsModifiers?.(this))||{};return{damageMult:(t.damageMult??0)+(inf.damageMult??0),speedMult:(t.speedMult??0)+(inf.speedMult??0),critAdd:(t.critAdd??0)+(e.critAdd??0)+(inf.critAdd??0),maxHpAdd:(t.maxHpAdd??0)+(e.maxHpAdd??0)+(inf.maxHpAdd??0),defenseAdd:(t.defenseAdd??0)+(inf.defenseAdd??0),damageAdd:(e.damageAdd??0)+(inf.damageAdd??0),speedAdd:(e.speedAdd??0)+(inf.speedAdd??0),cooldownReduction:(t.cooldownReduction??0)+(inf.cooldownReduction??0),effectDuration:(t.effectDuration??0)+(inf.effectDuration??0),summonCap:(t.summonCap??0)+(inf.summonCap??0),potionPower:(t.potionPower??0)+(e.potionPower??0),goldMult:t.goldMult??0}}'

new_getrun = 'getRunModifiers(){const i=this.endlessRun(),t=i?_h(i.blessings??[]):{},e=this.metaBonuses??{},inf=(typeof window!=="undefined"&&window.__computeInfiniteSkillsModifiers?.(this))||{},pct=(typeof window!=="undefined"&&window.__getAbyssPactModifiers?.(this))||{};return{damageMult:(t.damageMult??0)+(inf.damageMult??0)+(pct.damageMult??0),speedMult:(t.speedMult??0)+(inf.speedMult??0)+(pct.speedMult??0),critAdd:(t.critAdd??0)+(e.critAdd??0)+(inf.critAdd??0)+(pct.critAdd??0),maxHpAdd:(t.maxHpAdd??0)+(e.maxHpAdd??0)+(inf.maxHpAdd??0),defenseAdd:(t.defenseAdd??0)+(inf.defenseAdd??0)+(pct.defenseAdd??0),damageAdd:(e.damageAdd??0)+(inf.damageAdd??0),speedAdd:(e.speedAdd??0)+(inf.speedAdd??0),cooldownReduction:(t.cooldownReduction??0)+(inf.cooldownReduction??0),effectDuration:(t.effectDuration??0)+(inf.effectDuration??0),summonCap:(t.summonCap??0)+(inf.summonCap??0),potionPower:(t.potionPower??0)+(e.potionPower??0)+(pct.potionPower??0),goldMult:(t.goldMult??0)+(pct.goldMult??0)}}'

rep(old_getrun, new_getrun, "Add Abyss Pact modifiers to getRunModifiers")

# B. Hook descendEndless() to show Branching Portals modal
old_descend = 'descendEndless(){const i=this.endlessRun();if(!i||this.transitioning)return;this.transitioning=!0,this.endChallenge(),i.depth++,i.maxDepth=Math.max(i.maxDepth??i.depth,i.depth),i.pendingBlessing=!0,this.updateEndlessScore(),this.audio.play("sfx-endless-descent"),this.game.events.emit("ui:banner",W("g.descending"),"#9a7fd0");if(window.DepthGateNet?.status==="connected")window.DepthGateNet.sendGameEvent("DESCEND",{depth:i.depth});if(this.player2){this.p1Score=(this.p1Score||0)+500;this.p2Score=(this.p2Score||0)+500;this.updateCoopHud?.();}const t={level:this.stats.level,xp:this.stats.xp,gold:this.stats.gold,hp:this.player.hp,resource:this.resource.current,potions:this.potions.count,skills:this.skillState,items:[...this.inventory.items],equipment:{...this.inventory.equipment},p1Score:this.p1Score,p2Score:this.p2Score,p1Kills:this.p1Kills,p2Kills:this.p2Kills,p1Damage:this.p1Damage,p2Damage:this.p2Damage,p1Revives:this.p1Revives,p2Revives:this.p2Revives,p2Potions:this.p2Potions},e=this.classDef.id;this.cameraSys.fadeOut(900,()=>this.scene.restart({endless:!0,classId:e,carry:t}))}'

new_descend = 'descendEndless(){const i=this.endlessRun();if(!i||this.transitioning)return;if(typeof window!=="undefined"&&window.__openAbyssPortalModal&&!this.__portalChosen){const nextD=(i.depth||1)+1,uiS=this.scene.get("UI");if(uiS){this.transitioning=!0;window.__openAbyssPortalModal(uiS,nextD,(choice)=>{this.__portalChosen=!0;this.__chosenEndlessPath=choice;this.transitioning=!1;this.descendEndless();});return}}this.__portalChosen=!1;this.transitioning=!0,this.endChallenge(),i.depth++,i.maxDepth=Math.max(i.maxDepth??i.depth,i.depth),i.pendingBlessing=!0,this.updateEndlessScore(),this.audio.play("sfx-endless-descent"),this.game.events.emit("ui:banner",W("g.descending"),"#9a7fd0");if(window.DepthGateNet?.status==="connected")window.DepthGateNet.sendGameEvent("DESCEND",{depth:i.depth});if(this.player2){this.p1Score=(this.p1Score||0)+500;this.p2Score=(this.p2Score||0)+500;this.updateCoopHud?.();}const t={level:this.stats.level,xp:this.stats.xp,gold:this.stats.gold,hp:this.player.hp,resource:this.resource.current,potions:this.potions.count,skills:this.skillState,items:[...this.inventory.items],equipment:{...this.inventory.equipment},p1Score:this.p1Score,p2Score:this.p2Score,p1Kills:this.p1Kills,p2Kills:this.p2Kills,p1Damage:this.p1Damage,p2Damage:this.p2Damage,p1Revives:this.p1Revives,p2Revives:this.p2Revives,p2Potions:this.p2Potions,nextPath:this.__chosenEndlessPath},e=this.classDef.id;this.cameraSys.fadeOut(900,()=>this.scene.restart({endless:!0,classId:e,carry:t}))}'

rep(old_descend, new_descend, "Hook descendEndless for Abyss Portal Choice Modal")

# C. Hook pendingBlessing at floor start to handle chosen path
old_blessing = '):this.tutorial?.onLevelStart(this.levelId),n&&n.pendingBlessing){n.pendingBlessing=!1;const r=qh(n,this.classDef.id,3);r.length>0&&this.time.delayedCall(700,()=>{this.scene.isActive()&&this.game.events.emit("blessing:offer",r)})};'

new_blessing = '):this.tutorial?.onLevelStart(this.levelId),n&&n.pendingBlessing){n.pendingBlessing=!1;const nextP=this.carry?.nextPath;if(nextP==="pact"){this.time.delayedCall(700,()=>{this.scene.isActive()&&window.__openAbyssPactsModal?.(this.scene.get("UI"))})}else if(nextP==="puzzle"){this.time.delayedCall(600,()=>{if(this.scene.isActive()&&window.AbyssPuzzleManager){if(!this.__abyssPuzzles)this.__abyssPuzzles=new window.AbyssPuzzleManager(this);const r=this.roomManager?.rooms?.[0],b=r?{x:r.x*(this.dungeon?.tileWidth||32),y:r.y*(this.dungeon?.tileHeight||32),width:r.w*(this.dungeon?.tileWidth||32),height:r.h*(this.dungeon?.tileHeight||32)}:null;Math.random()<0.5?this.__abyssPuzzles.startLaserPrismPuzzle(null,b,()=>{this.game.events.emit("ui:banner","✨ ENIGMA DOS PRISMAS RESOLVIDO!","#ffd24a")}):this.__abyssPuzzles.startRuneMemoryPuzzle(null,b,()=>{this.game.events.emit("ui:banner","✨ MEMÓRIA RÚNICA SINTONIZADA!","#ffd24a")})}})}else if(nextP==="elite"){this.time.delayedCall(500,()=>{this.scene.isActive()&&this.game.events.emit("ui:banner","⚠️ COVIL DE ELITE: INIMIGOS PODEROSOS E TESOUROS RAROS!","#ff4455")})}else if(nextP==="shop"){this.time.delayedCall(500,()=>{this.scene.isActive()&&this.game.events.emit("ui:banner","🪙 SANTUÁRIO DO MASCATE: RE-SPEC E FOGUEIRA","#ffd24a")})}const r=qh(n,this.classDef.id,3);(nextP!=="pact")&&r.length>0&&this.time.delayedCall(700,()=>{this.scene.isActive()&&this.game.events.emit("blessing:offer",r)})};'

rep(old_blessing, new_blessing, "Hook floor start events based on chosen branching portal path")

# D. Hook handleKey in UI scene for __portalChoiceUI and __pactsUI
old_hk_point = 'if(this.__hallOfFameUI?.open){if(this.__hallOfFameUI.handleKey(e))return}'

new_hk_point = 'if(this.__portalChoiceUI?.open){if(this.__portalChoiceUI.handleKey(e))return}if(this.__pactsUI?.open){if(this.__pactsUI.handleKey(e))return}if(this.__hallOfFameUI?.open){if(this.__hallOfFameUI.handleKey(e))return}'

rep(old_hk_point, new_hk_point, "Hook handleKey in UI for Portal and Pact modals")

# E. Hook Game update(i,t) for BuildVisualAuras
old_update = 'update(i,t){const e=Math.min(t/1e3,.05);window.__updateGameWeather(this,e);'

new_update = 'update(i,t){const e=Math.min(t/1e3,.05);window.__updateGameWeather(this,e);if(typeof window!=="undefined"&&window.BuildVisualAuras)window.BuildVisualAuras.updatePlayerAura(this);'

rep(old_update, new_update, "Hook player elemental build visual aura into Game update")

# Save patched bundle
with open(BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved patched {BUNDLE}")

with open(MIRROR_BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved mirror {MIRROR_BUNDLE}")

print("Branching Portals, Cursed Pacts, and Elemental Auras successfully integrated!")
