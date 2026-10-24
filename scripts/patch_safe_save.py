"""
Voltar ao último save sempre em local seguro.

O save guardava a sala em que o herói estava naquele instante; se o salvamento automático acontecesse no meio
de uma luta (sala ainda com inimigos), ao morrer e voltar ao save o herói reaparecia dentro da mesma luta.
Agora o save guarda a última sala SEGURA (já limpa, ou sem inimigos e sem chefe). Se o herói nunca passou por
uma, volta ao começo da fase. A vida salva é pelo menos metade da vida máxima. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__SAFESV__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


put("gold:c.stats.gold,hp:c.player.hp,resource:c.resource.current,potions:c.potions?.count??0,skills:c.skillState??null,items:t.items.map(e),equipment:Object.fromEntries(Object.entries(t.equipment).map(([a,n])=>[a,e(n)]))},campaign:{levelId:c.level.id,roomId:c.roomManager.activeRoom?.id??null,",
    "gold:c.stats.gold,hp:Math.max(c.player.hp,Math.ceil((c.player.maxHp??c.player.hp)*.5)),resource:c.resource.current,potions:c.potions?.count??0,skills:c.skillState??null,items:t.items.map(e),equipment:Object.fromEntries(Object.entries(t.equipment).map(([a,n])=>[a,e(n)]))},campaign:{levelId:c.level.id,roomId:__safeRoomId(c),")
SRC = r'''
/* sala segura para o save: limpa, ou sem inimigos e sem chefe; lembra a última segura por onde o herói passou */
function __roomSafe(r){if(!r)return!1;if(r.state==="cleared")return!0;if(r.state==="active")return!1;const d=r.def||{};return!(d.enemies?.length)&&!r.hasBoss&&!d.boss}
function __safeRoomId(c){try{const r=c.roomManager?.activeRoom;if(__roomSafe(r)&&!__fightNear(c)&&!__hubLocked(c,r))c.__safeRoom=r.id;return c.__safeRoom??null}catch(e){return null}}
/* o Coração da Floresta fica cercado de espinhos até juntar os 3 cristais: não serve de ponto de volta enquanto isso */
function __hubLocked(c,r){return!!(r?.def?.hub&&c.levelId==="forest"&&__forestCount(c)<3)}
/* save antigo que já aponta para o Coração cercado: tira o herói de dentro, para fora dos espinhos */
{const HB=__hubBarrier;__hubBarrier=function(S,on){const v=HB(S,on);if(on){try{__hubUnstuck(S)}catch(e){}S.time?.delayedCall?.(0,()=>{try{__hubUnstuck(S)}catch(e){}})}return v}}
/* progresso da floresta que já tinha sido feito mas os cristais sumiram da bolsa: se há prova guardada
   (selo da floresta marcado na história, portal de masmorra concluído ou cristal de masmorra na bolsa), devolve os 3 */
function __forestEvidence(S){try{if(__stFlag(S,"forest_done"))return!0;if(S.completedDungeons?.length)return!0;if(__HUBD.some(id=>__CRY[id]&&__hasItem(S,__CRY[id])))return!0;
 const sl=S.game.registry.get("save:slot")??1;for(const k of Object.keys(localStorage))if((k==="depthgate:portals:slot_"+sl||k.startsWith("depthgate:portals:"+sl+":"))&&JSON.parse(localStorage.getItem(k)||"[]").length)return!0}catch(e){}return!1}
{const HS=__hubSetup;__hubSetup=function(S){try{if(S.levelId==="forest"&&!S.level?.endless&&S.game.registry.get("mode")!=="endless"&&S.inventory&&__forestCount(S)<3&&__forestEvidence(S)){for(let i=1;i<=3;i++){const cid="forest_crystal_"+i;if(!__hasItem(S,cid)){const it=S.lootSystem?.makeItem?.(cid,"LEGENDARY");it&&S.inventory.items.push(it)}}S.requestSave?.(800)}}catch(e){}return HS.apply(this,arguments)}}
function __hubUnstuck(S){const p=S.player,B=S.dungeon,q=B?.level?.rooms?.find(r=>r.hub)?.rect,o=S.__hubBar;if(!p?.body||!q||!o?.length)return;
 const pc=Math.floor(p.x/dt),pr=Math.floor(p.y/dt);if(!(pc>=q.x&&pc<q.x+q.w&&pr>=q.y&&pr<q.y+q.h))return;
 const L=o.map(t=>[Math.floor(t.x/dt),Math.floor(t.y/dt)]),mid=Math.floor(L.length/2),ord=[...L.slice(mid),...L.slice(0,mid)];
 for(const[c,r]of ord){const dx=c<q.x?-1:c>=q.x+q.w?1:0,dy=r<q.y?-1:r>=q.y+q.h?1:0;for(const k of[1,2]){const tc=c+dx*k,tr=r+dy*k;if(B.isWallTile(tc,tr)||L.some(([a,b])=>a===tc&&b===tr))continue;p.body.reset(tc*dt+dt/2,tr*dt+dt/2);S.cameras?.main?.centerOn?.(p.x,p.y);return}}}
function __fightNear(c){const p=c.player;if(!p)return!1;for(const e of c.enemies?.getChildren?.()||[])if(!e.dead&&e.active&&Math.hypot(e.x-p.x,e.y-p.y)<320&&(e.ai?.aggro||e.aggro))return!0;return!!(c.boss&&!c.boss.dead&&c.boss.active)}
'''
s = s + T + SRC + "/*§*/" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("save em local seguro aplicado")
