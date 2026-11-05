"""
Aplica as Cavernas da Montanha Dorf no bundle principal e no espelho:
  - Carrega scripts/source/dorf-caves.js
  - Registra pré-carregamento dos assets no bo.prototype.preload
  - Conecta renderizador __dorfBake em _l.prototype.buildWallVisuals
  - Adiciona suporte a isDorfCave em Sd.prototype.create
  - Suporte a persistência e retorno no Sd.prototype.requestSave e onGameOver
  - Portal de retorno e descida para novos andares procedurais
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DORF = os.path.join(ROOT, "scripts", "source", "dorf-caves.js")
FILES = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

dorf_source = open(SRC_DORF, encoding="utf-8").read().strip()
TAG = "/*__DORF_CAVES__*/"

def patch_file(p):
    if not os.path.exists(p):
        return
    s = open(p, encoding="utf-8").read()

    # Remove versão antiga se houver
    while TAG in s:
        a = s.index(TAG)
        b = s.index(TAG, a + 1) + len(TAG)
        s = s[:a] + s[b:]

    # 1. Injetar dorf-caves.js logo antes de Ls.edesert
    anchor_ls = 'Ls.edesert = { ...Kn, id: "edesert"'
    assert anchor_ls in s, "anchor_ls not found"
    s = s.replace(anchor_ls, TAG + "\n" + dorf_source + "\n" + TAG + "\n" + anchor_ls, 1)

    # 2. bo.prototype.preload
    preload_old = 'for (const n of CFP) this.textures.exists("cf-p-" + n) || L.image("cf-p-" + n, `assets/pixel-art/castle2/cf-p-${n}.png`);'
    preload_dorf = (
        'this.textures.exists("dorf-atlas") || L.image("dorf-atlas", "assets/pixel-art/deepcave/dorf-atlas.png");'
        'this.cache.json.exists("dorf-atlas") || L.json("dorf-atlas", "assets/pixel-art/deepcave/dorf-atlas.json");'
        'this.textures.exists("tiles-dorf-cave") || L.spritesheet("tiles-dorf-cave", "assets/pixel-art/deepcave/tiles-dorf-cave.png", { frameWidth: 32, frameHeight: 32 });'
        'this.textures.exists("dorf-portal-arch") || L.image("dorf-portal-arch", "assets/pixel-art/deepcave/dorf-portal-arch.png");'
    )
    assert preload_old in s, "preload_old not found"
    s = s.replace(preload_old, preload_old + "\n" + TAG + preload_dorf + TAG, 1)

    # 3. _l.prototype.buildWallVisuals
    buildwall_old = 'if (id === "ecastelo") { try { if (__excBake(this)) return } catch (e) { console.warn("[ecastelo]", e) } }'
    buildwall_dorf = 'if (id === "dorf_cave") { try { if (__dorfBake(this)) return } catch (e) { console.warn("[dorf_cave]", e) } }'
    assert buildwall_old in s, "buildwall_old not found"
    s = s.replace(buildwall_old, buildwall_old + "\n" + TAG + buildwall_dorf + TAG, 1)

    # 4. Sd.prototype.create
    create_anchor = 'else if(i.isRift){this.isRift=!0;this.level=__buildRiftLevel(this);this.levelId="rift";ki.rift=this.level;}'
    create_dorf = (
        'else if(i.isDorfCave){'
        'this.isDorfCave=!0;'
        'this.originMode=i.originMode||(i.endless?"endless":"campaign");'
        'this.dorfSlot=i.slot||this.game.registry.get("save:slot")||1;'
        'this.levelDepth=i.depth||1;'
        'this.classDef=pe[i.classId||"WARRIOR"];'
        'const runCfg={depth:this.levelDepth,seed:"dorf_"+this.dorfSlot+"_"+this.levelDepth,biome:"dorf_cave",originMode:this.originMode};'
        'this.level=md(runCfg);'
        'this.level.id="dorf_cave";'
        'this.level.name="Cavernas da Montanha Dorf"+(this.levelDepth>1?` · Nível ${this.levelDepth}`:"");'
        'this.level.endless=!0;'
        'this.levelId="dorf_cave";'
        'ki.dorf_cave=this.level;'
        '}'
    )
    assert create_anchor in s, "create_anchor not found"
    s = s.replace(create_anchor, TAG + create_dorf + TAG + create_anchor, 1)

    # 5. Sd.prototype.requestSave
    save_old = 'this.game.registry.get("mode")==="endless"?In(this):di(this)'
    save_dorf = (
        '(this.isDorfCave&&this.originMode==="campaign"?'
        '(()=>{try{const sl=this.dorfSlot||this.game.registry.get("save:slot")||1,r=Dn(sl);'
        'if(r.ok&&r.data){if(typeof this.player?.gold==="number")r.data.player.gold=this.player.gold;'
        'if(this.inventory?.serialize)r.data.player.inventory=this.inventory.serialize();'
        'if(this.player?.xp){r.data.player.xp=this.player.xp;r.data.player.level=this.player.level||r.data.player.level;}'
        'localStorage.setItem(Wt("campaign",sl),JSON.stringify(r.data));}}catch(e){}})():'
        '(this.game.registry.get("mode")==="endless"?In(this):di(this)))'
    )
    assert save_old in s, "save_old not found"
    s = s.replace(save_old, TAG + save_dorf + TAG, 1)

    # 6. Sd.prototype.onGameOver
    gameover_anchor = 'if(this.isRift){this.state="rift_defeat";'
    gameover_dorf = (
        'if(this.isDorfCave&&this.originMode==="campaign"){'
        'this.state="dorf_defeat";'
        'const L3=typeof __L3==="function"?__L3:(pt,en)=>pt;'
        'this.game.events.emit("ui:banner",L3("VOCÊ CAIU NAS CAVERNAS! Retornando ao Refúgio com seus tesouros...","YOU FELL IN THE CAVES! Returning to Refuge with saved loot...","¡CAÍSTE EN LAS CAVERNAS! Regresando al Refugio..."),"#38bdf8");'
        '__dorfReturnToRefuge(this);'
        'return;}'
    )
    assert gameover_anchor in s, "gameover_anchor not found"
    s = s.replace(gameover_anchor, TAG + gameover_dorf + TAG + gameover_anchor, 1)

    # 7. Sd.prototype.findInteractable & act
    interact_anchor = 'n.kind==="hubportal"?__hubEnter(this,n.target):'
    interact_dorf = 'n.kind==="dorf_return"?__dorfReturnToRefuge(this):'
    assert interact_anchor in s, "interact_anchor not found"
    s = s.replace(interact_anchor, TAG + interact_dorf + TAG + interact_anchor, 1)

    find_anchor = 'const d=this.roomManager.portal;'
    find_dorf = (
        'if(this.isDorfCave&&this.__dorfReturnPortal){'
        'const dp=this.__dorfReturnPortal,dist=j.Math.Distance.Between(dp.x,dp.y,i.x,i.y);'
        'if(dist<48){'
        't={kind:"dorf_return",target:dp,label:typeof __L3==="function"?__L3("Retornar ao Refúgio","Return to Refuge","Volver al Refugio"):"Retornar ao Refúgio"};'
        'e=dist;'
        '}'
        '}'
    )
    assert find_anchor in s, "find_anchor not found"
    s = s.replace(find_anchor, TAG + find_dorf + TAG + find_anchor, 1)

    # 8. descendEndless: aprofundar nas cavernas de Dorf
    descend_anchor = 'this.transitioning = true;\n  this.endChallenge();\n\n  i.depth++;'
    descend_dorf = (
        'if(this.isDorfCave){\n'
        '  this.levelDepth=(this.levelDepth||1)+1;\n'
        '  const isCamp=this.originMode==="campaign";\n'
        '  if(isCamp){\n'
        '    try{\n'
        '      const sl=this.dorfSlot||1,r=Dn(sl);\n'
        '      if(r.ok&&r.data){\n'
        '        if(typeof this.player?.gold==="number")r.data.player.gold=this.player.gold;\n'
        '        if(this.inventory?.serialize)r.data.player.inventory=this.inventory.serialize();\n'
        '        localStorage.setItem(Wt("campaign",sl),JSON.stringify(r.data));\n'
        '      }\n'
        '    }catch(e){}\n'
        '  }\n'
        '  this.audio?.play?.("sfx-endless-descent")||this.audio?.play?.("portal");\n'
        '  const L3=typeof __L3==="function"?__L3:(pt,en)=>pt;\n'
        '  this.game.events.emit("ui:banner",L3(`Aprofundando nas Cavernas Dorf (Nível ${this.levelDepth})...`,`Descending deeper into Dorf Caves (Level ${this.levelDepth})...`,`Descendiendo en las Cavernas Dorf (Nivel ${this.levelDepth})...`),"#38bdf8");\n'
        '  this.cameraSys?.fadeOut(450,()=>{\n'
        '    let rData=null;\n'
        '    if(isCamp){try{const cr=Dn(this.dorfSlot);if(cr?.ok)rData=cr.data}catch(e){}}\n'
        '    this.scene.start("Game",{\n'
        '      isDorfCave:true,\n'
        '      originMode:this.originMode,\n'
        '      endless:!isCamp,\n'
        '      depth:this.levelDepth,\n'
        '      slot:this.dorfSlot,\n'
        '      classId:this.classDef.id,\n'
        '      restore:rData\n'
        '    });\n'
        '  });\n'
        '  return;\n'
        '}\n'
    )
    assert descend_anchor in s, "descend_anchor not found"
    s = s.replace(descend_anchor, TAG + descend_dorf + TAG + descend_anchor, 1)

    with open(p, "w", encoding="utf-8") as f:
        f.write(s)
    print(f"Patched {p} successfully!")

for p in FILES:
    patch_file(p)
print("Todas as alterações de Cavernas da Montanha Dorf foram aplicadas!")
