"""
Atualiza o código de scripts/source/dorf-caves.js e todos os blocos de integração
nas Cavernas da Montanha Dorf nos dois bundles mantendo todos os outros hooks intactos.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, "scripts", "source", "dorf-caves.js"), encoding="utf-8").read().strip()
FILES = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

TAG = "/*__DORF_CAVES__*/"
ANCHOR_BEFORE = " 3) biomas novos */\n" + TAG + "\n"
ANCHOR_AFTER = "\n" + TAG + "\nLs.edesert = { ...Kn, id: \"edesert\""

NEW_CREATE_BLOCK = (
    TAG +
    'else if(i.isDorfCave){'
    'this.isDorfCave=!0;'
    'this.originMode=i.originMode||(i.endless?"endless":"campaign");'
    'this.dorfSlot=i.slot||this.game.registry.get("save:slot")||1;'
    'this.levelDepth=1;'
    'this.classDef=pe[i.classId||"WARRIOR"];'
    'if(this.restoreData){this.restoreData={...this.restoreData,campaign:{...(this.restoreData.campaign||{}),rooms:{},roomId:null},world:{openedChests:[]}};}'
    'const runCfg={depth:1,seed:"dorf_"+Date.now()+"_"+Math.floor(Math.random()*1e9),freshSeed:i.freshSeed||(Date.now()+"_"+Math.floor(Math.random()*1e9)),biome:"dorf_cave",originMode:this.originMode};'
    'this.level=typeof __buildDorfCaveLevel==="function"?__buildDorfCaveLevel(runCfg):md(runCfg);'
    'this.level.id="dorf_cave";'
    'this.level.name="Cavernas da Montanha Dorf";'
    'this.level.endless=!1;'
    'this.level.next=null;'
    'this.levelId="dorf_cave";'
    'ki.dorf_cave=this.level;'
    '}' +
    TAG
)

NEW_DESCEND_BLOCK = (
    TAG +
    'if(this.isDorfCave){__dorfReturnToRefuge(this);return;}\n' +
    TAG
)

NEW_GAMEOVER_BLOCK = (
    TAG +
    'if(this.isDorfCave){'
    'this.state="dorf_defeat";'
    'const L3=typeof __L3==="function"?__L3:(pt,en)=>pt;'
    'this.game.events.emit("ui:banner",L3("VOCÊ CAIU NAS CAVERNAS! Retornando ao Refúgio com seus tesouros...","YOU FELL IN THE CAVES! Returning to Refuge with saved loot...","¡CAÍSTE EN LAS CAVERNAS! Regresando al Refugio..."),"#38bdf8");'
    '__dorfReturnToRefuge(this);'
    'return;}' +
    TAG
)

NEW_FIND_BLOCK = (
    TAG +
    'if(this.isDorfCave){'
    'const pts=this.__dorfPortals||(this.__dorfReturnPortal?[this.__dorfReturnPortal]:[]);'
    'for(const dp of pts){'
    'const dist=j.Math.Distance.Between(dp.x,dp.y,i.x,i.y);'
    'if(dist<52&&dist<e){'
    't={kind:"dorf_return",target:dp,label:typeof __L3==="function"?__L3("Retornar ao Refúgio","Return to Refuge","Volver al Refugio"):"Retornar ao Refúgio"};'
    'e=dist;'
    '}'
    '}'
    '}' +
    TAG
)

for p in FILES:
    if not os.path.exists(p):
        continue
    s = open(p, "r", encoding="utf-8").read()

    # 1. Garantir que i.endless nunca intercepte i.isDorfCave em Sd.prototype.create
    s = s.replace(
        'this.restoreEndless=i.restoreEndless??null,i.endless){',
        'this.restoreEndless=i.restoreEndless??null,i.endless&&!i.isDorfCave){'
    )

    # 2. Atualizar Block 1 (create)
    c_anchor = 'else if(i.isRift){this.isRift=!0;'
    c_end = s.index(c_anchor)
    c_start = s.rindex(TAG, 0, c_end - len(TAG))
    s = s[:c_start] + NEW_CREATE_BLOCK + s[c_end:]

    # 3. Atualizar Block 2 (descendEndless)
    d_anchor = 'this.transitioning = true;\n  this.endChallenge();\n\n  i.depth++;'
    d_end = s.index(d_anchor)
    d_start = s.rindex(TAG, 0, d_end - len(TAG))
    s = s[:d_start] + NEW_DESCEND_BLOCK + s[d_end:]

    # 4. Atualizar Block 4 (onGameOver)
    g_anchor = 'if(this.isRift){this.state="rift_defeat";'
    g_end = s.index(g_anchor)
    g_start = s.rindex(TAG, 0, g_end - len(TAG))
    s = s[:g_start] + NEW_GAMEOVER_BLOCK + s[g_end:]

    # 5. Atualizar Block 5 (findInteractable)
    f_anchor = 'const d=this.roomManager.portal;'
    f_end = s.index(f_anchor)
    f_start = s.rindex(TAG, 0, f_end - len(TAG))
    s = s[:f_start] + NEW_FIND_BLOCK + s[f_end:]

    # 6. Atualizar Block 7 (dorf-caves.js)
    assert ANCHOR_BEFORE in s and ANCHOR_AFTER in s, f"Anchors not found in {p}"
    idx1 = s.index(ANCHOR_BEFORE) + len(ANCHOR_BEFORE)
    idx2 = s.index(ANCHOR_AFTER, idx1)
    s = s[:idx1] + SRC + s[idx2:]

    open(p, "w", encoding="utf-8").write(s)
    print(f"Updated dorf-caves.js and hooks in {p} successfully.")

print("Done updating dorf-caves.js in all bundles.")
