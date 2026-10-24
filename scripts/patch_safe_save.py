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
function __safeRoomId(c){try{const r=c.roomManager?.activeRoom;if(__roomSafe(r)&&!__fightNear(c))c.__safeRoom=r.id;return c.__safeRoom??null}catch(e){return null}}
function __fightNear(c){const p=c.player;if(!p)return!1;for(const e of c.enemies?.getChildren?.()||[])if(!e.dead&&e.active&&Math.hypot(e.x-p.x,e.y-p.y)<320&&(e.ai?.aggro||e.aggro))return!0;return!!(c.boss&&!c.boss.dead&&c.boss.active)}
'''
s = s + T + SRC + "/*§*/" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("save em local seguro aplicado")
