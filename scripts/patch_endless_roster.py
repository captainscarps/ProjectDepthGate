"""Modo infinito: heróis fixos por slot, contador de mortes no ranking,
recomeço no nível 1 sem armas (menos as do ferreiro) e durabilidade de 3 runs
para as armas do ferreiro (conserto com Pedra Cobalto no Refúgio).

Re-executável: cada troca é aplicada uma vez e reconhecida pelo marcador /*__ROSTER__*/.
Os ajudantes de durabilidade (window.__forgeDur*) ficam em scripts/source/dorf-caves.js.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]

# 1) Morte no infinito: nível 1, perde as armas (menos as do ferreiro), durabilidade do ferreiro
DEATH_START = 'const isFragile=it=>it&&(it.breaksOnDeath||'
DEATH_END = '"#e05a4a");}catch(err){console.warn("[endless persistent death save]",err);}'
DEATH_NEW = (
    '/*__ROSTER__*/i.deaths=sv.player.deaths;'
    'const XD=id=>typeof Xt!=="undefined"?Xt[id]:null;'
    'const isForge=it=>!!(it&&XD(it.id)?.uniqueForge);'
    'const isWeapon=it=>!!(it&&(XD(it.id)?.slot==="weapon"||XD(it.id)?.type==="weapon"));'
    'sv.player.level=1;sv.player.xp=0;sv.player.skills=null;'
    'const FD=window.__forgeDurGet?.(sl)||{};const broke=[];'
    'const wear=it=>{const k=String(it.seed??0);FD[k]=(FD[k]||0)+1;if(FD[k]>=3){broke.push({id:it.id,rarity:it.rarity,seed:it.seed??0});return!1}return!0};'
    'const eq=sv.player.equipment;'
    'if(eq){for(const k in eq){const it=eq[k];if(!it)continue;if(isForge(it)){if(!wear(it))eq[k]=null}else if(isWeapon(it))eq[k]=null}'
    'if(!eq.weapon)eq.weapon={id:this.classDef?.starterWeapon||"sword",rarity:"COMMON",seed:0}}'
    'if(Array.isArray(sv.player.items))sv.player.items=sv.player.items.filter(it=>isForge(it)?wear(it):!isWeapon(it));'
    'window.__forgeDurSet?.(sl,FD);broke.length&&window.__forgeBrokenAdd?.(sl,broke);'
    'localStorage.setItem(Wt("endless",sl),JSON.stringify(sv));'
    'const L3=typeof __L3==="function"?__L3:(pt,en)=>pt;'
    'this.game.events.emit("ui:banner",L3("O HERÓI RECOMEÇA NO NÍVEL 1 E PERDEU SUAS ARMAS. AS DO FERREIRO RESISTEM.","THE HERO RESTARTS AT LEVEL 1 AND LOST THEIR WEAPONS. THE BLACKSMITH\'S ONES ENDURE.","EL HÉROE REINICIA EN NIVEL 1 Y PERDIÓ SUS ARMAS. LAS DEL HERRERO RESISTEN."),"#e05a4a");'
    'broke.length&&this.time.delayedCall(2600,()=>this.game.events.emit("ui:banner",L3(`${broke.length} ARMA(S) DO FERREIRO SE QUEBRARAM. CONSERTE NO REFÚGIO COM PEDRA COBALTO.`,`${broke.length} BLACKSMITH WEAPON(S) BROKE. REPAIR THEM IN THE REFUGE WITH COBALT STONE.`,`${broke.length} ARMA(S) DEL HERRERO SE ROMPIERON. REPÁRALAS CON PIEDRA COBALTO.`),"#7fb2ff"));'
    '}catch(err){console.warn("[endless persistent death save]",err);}'
)

SIMPLE = [
    # 0c) armas do ferreiro usam a raridade "UNIQUE", que não existe na tabela: montar como lendária
    ('__mk0(i,t){const e=Xt[i];e.minRarity&&bt[t].order<bt[e.minRarity].order&&(t=e.minRarity);',
     '__mk0(i,t){const e=Xt[i];bt[t]||(t="LEGENDARY");const mr=e.minRarity?(bt[e.minRarity]?e.minRarity:"LEGENDARY"):null;mr&&bt[t].order<bt[mr].order&&(t=mr)/*__ROSTER__*/;'),
    # 0a) a morte parte do estado atual do herói (inventário vivo), não do último save automático
    ('let curSave=Nn(sl);const sv=curSave.ok?curSave.data:$r(this);',
     'let curSave=Nn(sl);const sv=(()=>{try{return $r(this)}catch(e){return curSave.ok?curSave.data:{}}})()/*__ROSTER__*/;'),
    # 0b) o save automático preserva o contador de mortes do herói
    ('player:{classId:c.classDef.id,level:c.stats.level,xp:c.stats.xp,gold:c.stats.gold,',
     'player:{classId:c.classDef.id,deaths:c.restoreEndless?.player?.deaths??0/*__ROSTER__*/,level:c.stats.level,xp:c.stats.xp,gold:c.stats.gold,'),
    # 2) o registro da run leva o contador de mortes do herói
    ('elapsedMs:c.elapsedMs,bestItem:c.bestItem,date:Date.now()}',
     'elapsedMs:c.elapsedMs,bestItem:c.bestItem,deaths:c.deaths??0/*__ROSTER__*/,date:Date.now()}'),
    # 3) envio online com mortes (se a coluna não existir, reenvia sem ela)
    ('score:Math.max(0,ent.score|0),elapsed_ms:Math.max(0,ent.elapsedMs|0),seed:ent.seed??null,avatar:finalAv,version:"p209"}',
     'score:Math.max(0,ent.score|0),elapsed_ms:Math.max(0,ent.elapsedMs|0),seed:ent.seed??null,avatar:finalAv,deaths:Math.max(0,ent.deaths|0)/*__ROSTER__*/,version:"p209"}'),
    ('async function __onSubmit(e){if(!__ON.ok)return!1;try{let r=await fetch(`${__ON.cfg.url}/rest/v1/scores`,{method:"POST",headers:{...__onH(),Prefer:"return=minimal"},body:JSON.stringify(e)});',
     'async function __onSubmit(e){if(!__ON.ok)return!1;try{let r=await fetch(`${__ON.cfg.url}/rest/v1/scores`,{method:"POST",headers:{...__onH(),Prefer:"return=minimal"},body:JSON.stringify(e)});'
     'if(!r.ok&&r.status===400&&e.deaths!=null){e={...e};delete e.deaths;r=await fetch(`${__ON.cfg.url}/rest/v1/scores`,{method:"POST",headers:{...__onH(),Prefer:"return=minimal"},body:JSON.stringify(e)})}/*__ROSTER__*/'),
    # 4) leitura online tenta incluir as mortes
    ('let q=`${__ON.cfg.url}/rest/v1/scores?select=player_name,class_id,depth,score,elapsed_ms,avatar&mode=eq.${mode}&order=score.desc&limit=${lim*4}`;day&&(q+=`&day=eq.${day}`);let r=await fetch(q,{headers:__onH()});',
     'let q=`${__ON.cfg.url}/rest/v1/scores?select=player_name,class_id,depth,score,elapsed_ms,avatar,deaths&mode=eq.${mode}&order=score.desc&limit=${lim*4}`;day&&(q+=`&day=eq.${day}`);let r=await fetch(q,{headers:__onH()});'
     'if(!r.ok&&r.status===400){q=`${__ON.cfg.url}/rest/v1/scores?select=player_name,class_id,depth,score,elapsed_ms,avatar&mode=eq.${mode}&order=score.desc&limit=${lim*4}`;day&&(q+=`&day=eq.${day}`);r=await fetch(q,{headers:__onH()})}/*__ROSTER__*/'),
    ('L.map((r,l)=>({name:r.player_name,classId:r.class_id,depth:r.depth,score:r.score,elapsed_ms:r.elapsed_ms,avatar:r.avatar||null}))',
     'L.map((r,l)=>({name:r.player_name,classId:r.class_id,depth:r.depth,score:r.score,elapsed_ms:r.elapsed_ms,avatar:r.avatar||null,deaths:r.deaths/*__ROSTER__*/}))'),
    ('setRows(o.map((r,l)=>({name:r.playerName??W("hof.player"),classId:r.classId,depth:r.depth,score:r.score,elapsed_ms:r.elapsedMs,avatar:r.avatar||null})),',
     'setRows(o.map((r,l)=>({name:r.playerName??W("hof.player"),classId:r.classId,depth:r.depth,score:r.score,elapsed_ms:r.elapsedMs,avatar:r.avatar||null,deaths:r.deaths/*__ROSTER__*/})),'),
    # 5) linha do ranking: profundidade mais à esquerda e coluna de mortes
    ('const depthTxt=this.add.text(i+56,y+8,"D"+(r.depth||1),{fontFamily:"\'Courier New\', monospace",fontSize:"9px",color:"#cfc3a4"}).setOrigin(0,0.5);t.add(depthTxt);t.__rowG.push(depthTxt);',
     'const depthTxt=this.add.text(i+40,y+8,"D"+(r.depth||1),{fontFamily:"\'Courier New\', monospace",fontSize:"9px",color:"#cfc3a4"}).setOrigin(0,0.5);t.add(depthTxt);t.__rowG.push(depthTxt);'
     'if(r.deaths!=null){const dthTxt=this.add.text(i+66,y+8,"💀"+(r.deaths|0),{fontFamily:"\'Courier New\', monospace",fontSize:"8px",color:"#e06858"}).setOrigin(0,0.5);t.add(dthTxt);t.__rowG.push(dthTxt)}/*__ROSTER__*/'),
    # 6) herói fixo no slot: "novo jogo" num slot ocupado continua com o mesmo herói
    ('if(!d.empty){this.showModal(W("sv.replaceQ"),',
     'if(!d.empty){if(i==="endless"){this.loadEndlessSlot(e);return}/*__ROSTER__*/this.showModal(W("sv.replaceQ"),'),
    # 7) excluir o slot também apaga a durabilidade e as armas quebradas daquele herói
    ('function Kr(c=1,i="campaign"){localStorage.removeItem(Wt(i,c));',
     'function Kr(c=1,i="campaign"){localStorage.removeItem(Wt(i,c));if(i==="endless")try{localStorage.removeItem("depthgate:forgeDur:"+c);localStorage.removeItem("depthgate:forgeBroken:"+c)}catch(e){}/*__ROSTER__*/'),
]


def patch(path):
    with open(path, encoding="utf-8") as f:
        s = f.read()
    n = 0
    if "/*__ROSTER__*/i.deaths=sv.player.deaths;" not in s:
        a = s.index(DEATH_START)
        b = s.index(DEATH_END, a) + len(DEATH_END)
        s = s[:a] + DEATH_NEW + s[b:]
        n += 1
    for old, new in SIMPLE:
        if new in s:
            continue
        if s.count(old) != 1:
            raise SystemExit(f"padrão não encontrado (ou repetido) em {path}: {old[:70]}")
        s = s.replace(old, new)
        n += 1
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)
    print(f"{os.path.relpath(path, ROOT)}: {n} trocas")


for t in TARGETS:
    if os.path.isfile(t):
        patch(t)
