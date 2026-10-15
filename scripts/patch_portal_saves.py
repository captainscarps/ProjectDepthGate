import os

path1 = 'assets/index-D6qIWtA7-p209.js'
path2 = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js'

for target_file in [path1, path2]:
    print(f"Patching {target_file}...")
    with open(target_file, 'r', encoding='utf-8') as f:
        bundle = f.read()

    # 1. ADD __isPortalDone and update __hubProg
    old_hubprog = 'function __hubProg(S){const n=__HUBD.filter(id=>__hasItem(S,__CRY[id])).length;return{n,r:__HUBD.length?n/__HUBD.length:0}}'
    new_hubprog = '''function __isPortalDone(S,id){if(!id)return!1;if(__hasItem(S,__CRY[id]))return!0;if(S?.completedDungeons&&S.completedDungeons.includes(id))return!0;try{const sl=S?.game?.registry?.get("save:slot")??1;const list=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");if(list.includes(id))return!0}catch(e){}return!1}
function __hubProg(S){const n=__HUBD.filter(id=>__isPortalDone(S,id)).length;return{n,r:__HUBD.length?n/__HUBD.length:0}}'''
    assert old_hubprog in bundle, f"old_hubprog not found in {target_file}"
    bundle = bundle.replace(old_hubprog, new_hubprog)

    # 2. UPDATE __hubPortals to use __isPortalDone and auto-restore missing crystals
    old_hubportals = 'const P=[],done=__HUBD.filter(id=>__hasItem(S,__CRY[id])),all=done.length>=__HUBD.length,solid=new Set;'
    new_hubportals = 'const P=[],done=__HUBD.filter(id=>__isPortalDone(S,id)),all=done.length>=__HUBD.length,solid=new Set;done.forEach(id=>{const cid=__CRY[id];if(cid&&!__hasItem(S,cid)&&S.lootSystem?.makeItem){const it=S.lootSystem.makeItem(cid,"LEGENDARY");it&&S.inventory?.items?.push(it)}});'
    assert old_hubportals in bundle, f"old_hubportals not found in {target_file}"
    bundle = bundle.replace(old_hubportals, new_hubportals)

    # 3. BOSS ROOM COMPLETION GUARANTEE (i.hasBoss || i.def?.boss)
    old_complete_room = 'if(!this.__lvDone&&(this.clearedCount===this.totalCombatRooms||__cdLevelDone(this,i))&&(this.__lvDone=!0))if(__HUBD.includes(this.scene.levelId))__dropDungeonCrystal(this.scene,i);'
    new_complete_room = 'if(!this.__lvDone&&(this.clearedCount===this.totalCombatRooms||i.hasBoss||i.def?.boss||__cdLevelDone(this,i))&&(this.__lvDone=!0))if(__HUBD.includes(this.scene.levelId))__dropDungeonCrystal(this.scene,i);'
    assert old_complete_room in bundle, f"old_complete_room not found in {target_file}"
    bundle = bundle.replace(old_complete_room, new_complete_room)

    # 4. UPDATE __hubOnPickup: mark portal completed and save immediately
    old_onpickup = 'else if(Object.values(__CRY).includes(it.id)){S.game.events.emit("ui:banner","CRISTAL OBTIDO!","#c9a0ff"),S.time.delayedCall(900,()=>S.scene.isActive()&&__heroAfter(S,()=>S.scene.isActive()&&__vision(S,S.levelId,()=>S.scene.isActive()&&(S.game.events.emit("ui:banner","RETORNANDO À FLORESTA...","#c9a0ff"),S.time.delayedCall(1200,()=>S.scene.isActive()&&__goLevel(S,"forest",{hubReturn:!0,fromLevel:S.levelId}))))))}'
    new_onpickup = '''else if(Object.values(__CRY).includes(it.id)){const pid=S.levelId;(S.completedDungeons??=[]).push(pid);try{const sl=S.game.registry.get("save:slot")??1;const cur=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");if(!cur.includes(pid))cur.push(pid);localStorage.setItem("depthgate:portals:slot_"+sl,JSON.stringify(cur))}catch(e){}S.requestSave?.(100);S.game.events.emit("ui:banner","CRISTAL OBTIDO! PORTAL SELADO!","#c9a0ff"),S.time.delayedCall(900,()=>S.scene.isActive()&&__heroAfter(S,()=>S.scene.isActive()&&__vision(S,S.levelId,()=>S.scene.isActive()&&(S.game.events.emit("ui:banner","RETORNANDO À FLORESTA...","#c9a0ff"),S.time.delayedCall(1200,()=>S.scene.isActive()&&__goLevel(S,"forest",{hubReturn:!0,fromLevel:S.levelId}))))))}'''
    assert old_onpickup in bundle, f"old_onpickup not found in {target_file}"
    bundle = bundle.replace(old_onpickup, new_onpickup)

    # 5. UPDATE __hubSetup on hubReturn: register completed fromLevel
    old_hubsetup_ret = 'if(data.hubReturn){for(const r of rm.byId.values())r.state!=="cleared"&&(r.state="cleared");rm.clearedCount=rm.totalCombatRooms;const q=S.dungeon.level.rooms.find(r=>r.hub)?.rect;q&&S.player.body.reset((q.x+q.w/2)*dt,(q.y+q.h-2)*dt);S.game.events.emit("hud:progress",rm.clearedCount,rm.totalCombatRooms),S.player&&(S.player.hp=S.player.maxHp),S.resource&&(S.resource.current=S.resource.max),S.game.events.emit("hud:hp",S.player?.hp,S.player?.maxHp),S.requestSave?.(800),'
    new_hubsetup_ret = '''if(data.hubReturn){if(data.fromLevel&&__HUBD.includes(data.fromLevel)){(S.completedDungeons??=[]).push(data.fromLevel);try{const sl=S.game.registry.get("save:slot")??1;const cur=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");if(!cur.includes(data.fromLevel))cur.push(data.fromLevel);localStorage.setItem("depthgate:portals:slot_"+sl,JSON.stringify(cur))}catch(e){}}for(const r of rm.byId.values())r.state!=="cleared"&&(r.state="cleared");rm.clearedCount=rm.totalCombatRooms;const q=S.dungeon.level.rooms.find(r=>r.hub)?.rect;q&&S.player.body.reset((q.x+q.w/2)*dt,(q.y+q.h-2)*dt);S.game.events.emit("hud:progress",rm.clearedCount,rm.totalCombatRooms),S.player&&(S.player.hp=S.player.maxHp),S.resource&&(S.resource.current=S.resource.max),S.game.events.emit("hud:hp",S.player?.hp,S.player?.maxHp),S.requestSave?.(400),'''
    assert old_hubsetup_ret in bundle, f"old_hubsetup_ret not found in {target_file}"
    bundle = bundle.replace(old_hubsetup_ret, new_hubsetup_ret)

    # 6. UPDATE Wr(c) save function: persist completedDungeons in campaign and localStorage
    old_save_campaign = 'campaign:{levelId:c.level.id,roomId:c.roomManager.activeRoom?.id??null,rooms:d,completed:!!i.get("campaign:completed"),dragon:i.get("campaign:dragon")??"none",difficulty:i.get("campaign:difficulty")??"normal",seed:i.get("campaign:seed")??null,traversal:{introSeen:!!i.get("traversal:introSeen"),seenRun:!!i.get("traversal:seenRun"),cd:i.get("traversal:cd")??0,lastType:i.get("traversal:lastType")??null}},'
    new_save_campaign = 'campaign:{levelId:c.level.id,roomId:c.roomManager.activeRoom?.id??null,rooms:d,completed:!!i.get("campaign:completed"),dragon:i.get("campaign:dragon")??"none",difficulty:i.get("campaign:difficulty")??"normal",seed:i.get("campaign:seed")??null,completedDungeons:__HUBD.filter(id=>__isPortalDone(c,id)),traversal:{introSeen:!!i.get("traversal:introSeen"),seenRun:!!i.get("traversal:seenRun"),cd:i.get("traversal:cd")??0,lastType:i.get("traversal:lastType")??null}},'
    assert old_save_campaign in bundle, f"old_save_campaign not found in {target_file}"
    bundle = bundle.replace(old_save_campaign, new_save_campaign)

    old_di = 'function di(c){try{if(c.player?.dead)return!1;const i=Wr(c);return localStorage.setItem(Wt("campaign",Es(c.game)),JSON.stringify(i)),c.game.events.emit("save:done"),!0}catch{return!1}}'
    new_di = 'function di(c){try{if(c.player?.dead)return!1;const i=Wr(c);const sl=Es(c.game);localStorage.setItem(Wt("campaign",sl),JSON.stringify(i));try{const dList=__HUBD.filter(id=>__isPortalDone(c,id));localStorage.setItem("depthgate:portals:slot_"+sl,JSON.stringify(dList));}catch(err){}return c.game.events.emit("save:done"),!0}catch{return!1}}'
    assert old_di in bundle, f"old_di not found in {target_file}"
    bundle = bundle.replace(old_di, new_di)

    # 7. UPDATE Game.create(): restore completedDungeons and auto-restore crystals
    old_restore_player = ',this.restoreData){const r=this.restoreData.player;this.stats.level=r.level,this.stats.xp=r.xp,this.stats.gold=r.gold,this.inventory.items=r.items.map(l=>this.lootSystem.makeItem(l.id,l.rarity,l.seed??0));'
    new_restore_player = ''',this.restoreData){const r=this.restoreData.player;this.stats.level=r.level,this.stats.xp=r.xp,this.stats.gold=r.gold,this.inventory.items=r.items.map(l=>this.lootSystem.makeItem(l.id,l.rarity,l.seed??0));try{const sl=Es(this.game);const savedP=this.restoreData.campaign?.completedDungeons||[];const diskP=JSON.parse(localStorage.getItem("depthgate:portals:slot_"+sl)||"[]");this.completedDungeons=[...new Set([...savedP,...diskP])];for(const pid of this.completedDungeons){const cid=__CRY[pid];if(cid&&!__hasItem(this,cid)&&this.lootSystem?.makeItem){const it=this.lootSystem.makeItem(cid,"LEGENDARY");it&&this.inventory.items.push(it);}}}catch(e){}'''
    assert old_restore_player in bundle, f"old_restore_player not found in {target_file}"
    bundle = bundle.replace(old_restore_player, new_restore_player)

    # 8. UPDATE __startNewGame: only clear story and portals for current slot
    old_newgame = '__startNewGame(){try{for(let i=0;i<=3;i++)localStorage.removeItem("depthgate:story:"+i)}catch(e){}this.game.registry.remove("story:gIntro");'
    new_newgame = '__startNewGame(){try{const sl=this.game.registry.get("save:slot")??1;localStorage.removeItem("depthgate:story:"+sl);localStorage.removeItem("depthgate:portals:slot_"+sl);}catch(e){}this.game.registry.remove("story:gIntro");'
    assert old_newgame in bundle, f"old_newgame not found in {target_file}"
    bundle = bundle.replace(old_newgame, new_newgame)

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(bundle)
    print(f"Successfully patched {target_file}")

print("All JS bundles patched successfully!")
