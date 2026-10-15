import re, sys

def apply_fixes(bundle_path):
    print(f"Applying portal, scenarios, and audio fixes to {bundle_path}...")
    with open(bundle_path, 'r', encoding='utf-8') as f:
        code = f.read()

    # =========================================================================
    # FIX 1: PORTAL SEALS ON NEW CHARACTER
    # =========================================================================
    
    # 1.1 In __isPortalDone:
    # Ensure fresh characters (no crystals and not restoring a save) never inherit stale disk portals!
    old_is_portal = '''function __isPortalDone(S,id){if(!id)return!1;if(__hasItem(S,__CRY[id]))return!0;if(S?.completedDungeons&&S.completedDungeons.includes(id))return!0;try{const sl=S?.game?.registry?.get("save:slot")??1;const list=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");if(list.includes(id))return!0}catch(e){}return!1}'''
    new_is_portal = '''function __isPortalDone(S,id){if(!id)return!1;if(__hasItem(S,__CRY[id]))return!0;if(S?.completedDungeons&&S.completedDungeons.includes(id))return!0;if(!S?.restoreData&&!S?.scene?.restoreData)return!1;try{const sl=S?.game?.registry?.get("save:slot")??1;const cls=(S?.classDef?.id||S?.player?.classDef?.id||S?.game?.registry?.get("hub:classId")||"").toUpperCase();const k=cls?"depthgate:portals:"+sl+":"+cls:"depthgate:portals:slot_"+sl;const list=JSON.parse(localStorage.getItem(k)||"[]");if(list.includes(id))return!0}catch(e){}return!1}'''
    assert old_is_portal in code, "old_is_portal not found!"
    code = code.replace(old_is_portal, new_is_portal, 1)
    print("  -> Updated __isPortalDone to respect fresh character state.")

    # 1.2 In __confirmGo (ClassSelect scene):
    # When starting a campaign with a character, purge any stale portals for that slot & class
    target_confirm_clean = 'this.game.registry.set("hub:classId",t),'
    replacement_confirm_clean = 'this.game.registry.set("hub:classId",t),(()=>{try{const sl=this.game.registry.get("save:slot")??1;localStorage.removeItem("depthgate:portals:slot_"+sl);localStorage.removeItem("depthgate:portals:"+sl+":"+String(t).toUpperCase());}catch(err){}})(),'
    assert target_confirm_clean in code, "target_confirm_clean not found!"
    code = code.replace(target_confirm_clean, replacement_confirm_clean, 1)
    print("  -> Added portal cleanup on new character start in __confirmGo.")

    # 1.3 In applyWorldRestore:
    target_world_restore = 'const diskP=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");this.completedDungeons=[...new Set([...savedP,...diskP])];'
    replacement_world_restore = 'const cls=(this.classDef?.id||"").toUpperCase();const k=cls?"depthgate:portals:"+sl+":"+cls:"depthgate:portals:slot_"+sl;const diskP=this.restoreData?JSON.parse(localStorage.getItem(k)||localStorage.getItem("depthgate:portals:slot_"+sl)||"[]"):[];this.completedDungeons=this.restoreData?[...new Set([...savedP,...diskP])]:[];'
    assert target_world_restore in code, "target_world_restore not found!"
    code = code.replace(target_world_restore, replacement_world_restore, 1)
    print("  -> Updated applyWorldRestore to prevent stale portal restoration on new game.")

    # =========================================================================
    # FIX 2: NEW SCENARIOS (FLORESTA NEVADA & MINA ABANDONADA) IN HUB PORTALS
    # =========================================================================

    # 2.1 Add to __HUBD, __CRY, __HUBC
    target_hubd = 'const __HUBD=["temple","catacombs","ruins","glacial","fortress","bosque","rio","morta"],__CRY={temple:"crystal_temple",catacombs:"crystal_catacombs",ruins:"crystal_ruins",glacial:"crystal_glacial",fortress:"crystal_fortress",bosque:"crystal_bosque",rio:"crystal_rio",morta:"crystal_morta"},__HUBC={temple:16769136,catacombs:9332447,ruins:15780954,glacial:7920895,fortress:16736326,bosque:5947984,rio:5942010,morta:11179730};'
    replacement_hubd = 'const __HUBD=["temple","catacombs","ruins","glacial","fortress","bosque","rio","morta","floresta_nevada","mina_abandonada"],__CRY={temple:"crystal_temple",catacombs:"crystal_catacombs",ruins:"crystal_ruins",glacial:"crystal_glacial",fortress:"crystal_fortress",bosque:"crystal_bosque",rio:"crystal_rio",morta:"crystal_morta",floresta_nevada:"crystal_floresta_nevada",mina_abandonada:"crystal_mina_abandonada"},__HUBC={temple:16769136,catacombs:9332447,ruins:15780954,glacial:7920895,fortress:16736326,bosque:5947984,rio:5942010,morta:11179730,floresta_nevada:11065578,mina_abandonada:13935475};'
    assert target_hubd in code, "target_hubd not found!"
    code = code.replace(target_hubd, replacement_hubd, 1)
    print("  -> Added floresta_nevada and mina_abandonada to __HUBD, __CRY, and __HUBC.")

    # 2.2 Add crystal items in Xt
    target_xt = 'crystal_fortress:{name:"Cristal Dracônico",type:"quest",icon:"icon-crys-fortress",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."},'
    replacement_xt = 'crystal_fortress:{name:"Cristal Dracônico",type:"quest",icon:"icon-crys-fortress",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."},crystal_floresta_nevada:{name:"Cristal da Geada Eterna",type:"quest",icon:"icon-crys-glacial",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."},crystal_mina_abandonada:{name:"Cristal das Profundezas Mineiras",type:"quest",icon:"icon-crys-catacombs",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."},'
    assert target_xt in code, "target_xt not found!"
    code = code.replace(target_xt, replacement_xt, 1)
    print("  -> Added quest crystal items for new scenarios in Xt.")

    # 2.3 Add coordinates in POS inside __hubPortals
    target_pos = 'morta:[.8,.22]};'
    replacement_pos = 'morta:[.8,.22],floresta_nevada:[.5,.22],mina_abandonada:[.66,.22]};'
    assert target_pos in code, "target_pos not found!"
    code = code.replace(target_pos, replacement_pos, 1)
    print("  -> Added portal spawn coordinates in POS for floresta_nevada and mina_abandonada.")

    # =========================================================================
    # FIX 3: REALISTIC WEAPON & ENEMY SOUND EFFECTS
    # =========================================================================

    # 3.1 Unlock Tone and Advanced Audio on user click (Cr and zr.unlock)
    target_zr_unlock = 'unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}'
    replacement_zr_unlock = 'unlock(){try{if(window.Tone&&window.Tone.context&&window.Tone.context.state!=="running")window.Tone.start().catch(()=>{});window.__advancedAudio?.unlock?.();}catch(e){}if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}'
    assert target_zr_unlock in code, "target_zr_unlock not found!"
    code = code.replace(target_zr_unlock, replacement_zr_unlock, 1)
    print("  -> Linked window.__advancedAudio and Tone.start into zr.unlock.")

    # 3.2 Upgrade weapon sound synthesis in sfx(i)
    old_weapon_sfx = '''case"weapon-sword":window.__advancedAudio?.playMetalClang?.("F4","32n");window.__advancedAudio?.playNoiseBurst?.("32n");this.noiseHit({duration:.16,filter:"bandpass",freq:1850,freqEnd:280,q:2.8,gain:.22}),this.tone({type:"sawtooth",freq:380,freqEnd:120,duration:.12,gain:.10});break;case"weapon-axe":window.__advancedAudio?.playMembraneThud?.("D1","16n");window.__advancedAudio?.playMetalClang?.("C3","32n");this.noiseHit({duration:.24,filter:"lowpass",freq:650,freqEnd:120,gain:.32}),this.tone({type:"sawtooth",freq:140,freqEnd:45,duration:.20,gain:.18});break;case"weapon-dagger":window.__advancedAudio?.playMetalClang?.("G5","64n");this.noiseHit({duration:.09,filter:"highpass",freq:3200,gain:.18}),this.tone({type:"sine",freq:880,freqEnd:420,duration:.06,gain:.08});break;case"weapon-staff":window.__advancedAudio?.playSpectralChime?.(["D4","A4","F5"],"16n");this.tone({type:"sine",freq:440,freqEnd:660,duration:.22,gain:.16}),this.tone({type:"triangle",freq:880,freqEnd:330,duration:.18,gain:.12,delay:.02}),this.noiseHit({duration:.20,filter:"bandpass",freq:1600,freqEnd:500,q:3.5,gain:.12});break;case"weapon-bow":window.__advancedAudio?.playNoiseBurst?.("16n");this.tone({type:"triangle",freq:520,freqEnd:180,duration:.08,gain:.16}),this.noiseHit({duration:.14,filter:"bandpass",freq:2100,freqEnd:480,q:3.8,gain:.18}),this.tone({type:"sine",freq:160,freqEnd:70,duration:.10,gain:.12,delay:.02});break;'''

    new_weapon_sfx = '''case"weapon-sword":window.__advancedAudio?.playMetalClang?.("A4","32n");window.__advancedAudio?.playNoiseBurst?.("16n");this.noiseHit({duration:.20,filter:"bandpass",freq:3400,freqEnd:320,q:3.4,gain:.36}),this.tone({type:"triangle",freq:580,freqEnd:180,duration:.15,gain:.18}),this.tone({type:"sawtooth",freq:240,freqEnd:80,duration:.12,gain:.12});break;case"weapon-axe":window.__advancedAudio?.playMembraneThud?.("B0","16n");window.__advancedAudio?.playMetalClang?.("D3","32n");this.noiseHit({duration:.28,filter:"lowpass",freq:750,freqEnd:75,gain:.44}),this.tone({type:"sawtooth",freq:110,freqEnd:32,duration:.24,gain:.26}),this.noiseHit({duration:.18,filter:"bandpass",freq:1200,freqEnd:150,q:2.5,gain:.28});break;case"weapon-dagger":window.__advancedAudio?.playMetalClang?.("E5","64n");this.noiseHit({duration:.11,filter:"highpass",freq:4400,freqEnd:1000,gain:.28}),this.tone({type:"sine",freq:1150,freqEnd:390,duration:.07,gain:.14});break;case"weapon-staff":window.__advancedAudio?.playSpectralChime?.(["D4","G4","C5","F5"],"16n");this.tone({type:"sine",freq:520,freqEnd:780,duration:.26,gain:.22}),this.tone({type:"triangle",freq:260,freqEnd:110,duration:.22,gain:.18,delay:.02}),this.noiseHit({duration:.24,filter:"bandpass",freq:2100,freqEnd:420,q:4.2,gain:.18});break;case"weapon-bow":window.__advancedAudio?.playMembraneThud?.("F2","32n");window.__advancedAudio?.playNoiseBurst?.("16n");this.tone({type:"triangle",freq:640,freqEnd:140,duration:.09,gain:.28}),this.noiseHit({duration:.18,filter:"bandpass",freq:2800,freqEnd:520,q:3.5,gain:.28}),this.tone({type:"sine",freq:140,freqEnd:55,duration:.10,gain:.14,delay:.02});break;'''

    assert old_weapon_sfx in code, "old_weapon_sfx not found!"
    code = code.replace(old_weapon_sfx, new_weapon_sfx, 1)
    print("  -> Replaced weapon sound synthesis with realistic acoustic profiles.")

    # 3.3 Upgrade hit and enemy attack sounds
    old_hit_sfx = '''case"hit":window.__advancedAudio?.playMembraneThud?.("G1","32n");window.__advancedAudio?.playNoiseBurst?.("32n");this.tone({type:"sawtooth",freq:180,freqEnd:40,duration:.12,gain:.26}),this.noiseHit({duration:.11,filter:"bandpass",freq:1600,freqEnd:220,q:2.2,gain:.28}),this.tone({type:"triangle",freq:420,freqEnd:120,duration:.08,gain:.14,delay:.01});break;'''
    new_hit_sfx = '''case"hit":window.__advancedAudio?.playMembraneThud?.("F1","16n");window.__advancedAudio?.playNoiseBurst?.("16n");this.tone({type:"sawtooth",freq:150,freqEnd:32,duration:.16,gain:.38}),this.noiseHit({duration:.15,filter:"lowpass",freq:880,freqEnd:100,gain:.38}),this.tone({type:"triangle",freq:340,freqEnd:90,duration:.10,gain:.18,delay:.01});break;case"satyr-attack":window.__advancedAudio?.playMonsterRoar?.("C2","8n");window.__advancedAudio?.playMembraneThud?.("D1","16n");this.noiseHit({duration:.24,filter:"bandpass",freq:2200,freqEnd:320,q:3.2,gain:.34}),this.tone({type:"sawtooth",freq:260,freqEnd:75,duration:.20,gain:.26});break;case"shadow-demon-attack":window.__advancedAudio?.playSpectralChime?.(["F2","C3","F3"],"16n");window.__advancedAudio?.playNoiseBurst?.("16n");this.noiseHit({duration:.26,filter:"bandpass",freq:3200,freqEnd:280,q:3.8,gain:.32}),this.tone({type:"sawtooth",freq:190,freqEnd:40,duration:.24,gain:.28});break;'''

    assert old_hit_sfx in code, "old_hit_sfx not found!"
    code = code.replace(old_hit_sfx, new_hit_sfx, 1)
    print("  -> Upgraded hit sound and added satyr-attack / shadow-demon-attack.")

    # 3.4 In enemy hurt / death handler:
    target_enemy_hurt_sound = 'else if(tex.includes("demon"))this.scene.audioRef?.play("sfx-demon-hurt");'
    replacement_enemy_hurt_sound = 'else if(tex.includes("satyr"))this.scene.audioRef?.play("sfx-beast-hurt");else if(tex.includes("shadow-demon")||tex.includes("demon"))this.scene.audioRef?.play("sfx-demon-hurt");'
    assert target_enemy_hurt_sound in code, "target_enemy_hurt_sound not found!"
    code = code.replace(target_enemy_hurt_sound, replacement_enemy_hurt_sound, 1)
    print("  -> Added satyr and shadow-demon to enemy hurt sound dispatcher.")

    target_enemy_death_sound = 'else if(tex.includes("demon"))this.audio?.play("sfx-demon-death");'
    replacement_enemy_death_sound = 'else if(tex.includes("satyr"))this.audio?.play("sfx-boss-death");else if(tex.includes("shadow-demon")||tex.includes("demon"))this.audio?.play("sfx-demon-death");'
    assert target_enemy_death_sound in code, "target_enemy_death_sound not found!"
    code = code.replace(target_enemy_death_sound, replacement_enemy_death_sound, 1)
    print("  -> Added satyr and shadow-demon to enemy death sound dispatcher.")

    with open(bundle_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Finished updating {bundle_path}.\n")

apply_fixes('assets/index-D6qIWtA7-p209.js')
apply_fixes('Projeto atualizado/assets/index-D6qIWtA7-p209.js')
