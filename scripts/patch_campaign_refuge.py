"""
Refúgio × modos de jogo + "jogo novo é tudo novo".
  - Pelo MENU: melhorias continuam no modo infinito (fragmentos abissais, como antes).
  - Pela CAMPANHA (portal no Coração da Floresta): melhorias valem só para a campanha atual do herói,
    pagas com o OURO da campanha, guardadas dentro do save (campaign.refuge) e aplicadas no jogo.
  - Jogo novo num slot: zera portais concluídos (inclusive o que ficava preso na cena), crônicas,
    história e melhorias da campanha.
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__CREF__*/"


def rep(old, new):
    global s
    if T + new + T in s:
        return
    assert s.count(old) == 1, old[:70]
    s = s.replace(old, T + new + T)


# funções de apoio (ouro da campanha, melhorias da campanha)
HELP = (r'function __cBon(ref){const r={};for(const[t,e]of Object.entries(ref?.upgrades??{})){const d=Ms[t];if(!d||e<=0)continue;for(const[o,a]of Object.entries(d.bonus(Math.min(e,d.max))))r[o]=(r[o]??0)+a}return r}'
        r'function __cCost(d,l){return er(d,l)*4}'
        r'function __cData(S){const sl=S.retSlot??S.game.registry.get("save:slot")??1,r=Dn(sl);return r.ok?{sl,d:r.data}:null}'
        r'function __cmeta(S){const c=__cData(S);if(!c)return{fragments:0,upgrades:{}};c.d.campaign.refuge??={upgrades:{}};return{fragments:c.d.player?.gold??0,upgrades:c.d.campaign.refuge.upgrades??{}}}'
        r'function __cBuy(S,id){const c=__cData(S),t=Ms[id];if(!c||!t)return!1;const ref=c.d.campaign.refuge??={upgrades:{}};ref.upgrades??={};const lv=ref.upgrades[id]??0;if(lv>=t.max)return!1;const cost=__cCost(t,lv);if((c.d.player.gold??0)<cost)return!1;c.d.player.gold-=cost;ref.upgrades[id]=lv+1;try{localStorage.setItem(Wt("campaign",c.sl),JSON.stringify(c.d))}catch(e){return!1}S.game.registry.set("campaign:refuge",ref);return!0}'
        r'function __cReset(g,sl){try{for(const k of Object.keys(localStorage))(k.startsWith("depthgate:portals:"+sl+":")||k.startsWith("depthgate:chron:"+sl+":")||k==="depthgate:chron:"+sl||k==="depthgate:portals:slot_"+sl||k==="depthgate:story:"+sl)&&localStorage.removeItem(k)}catch(e){}g.registry.set("campaign:refuge",{upgrades:{}})}')
if T + HELP + T not in s:
    assert s.count("function Ll(c){") == 1
    s = s.replace("function Ll(c){", T + HELP + T + "function Ll(c){")

# salva e carrega as melhorias da campanha junto do save
rep('completedDungeons:__HUBD.filter(id=>__isPortalDone(c,id)),',
    'completedDungeons:__HUBD.filter(id=>__isPortalDone(c,id)),refuge:i.get("campaign:refuge")??{upgrades:{}},')
rep('d.set("campaign:seed",e.campaign.seed??null),',
    'd.set("campaign:seed",e.campaign.seed??null),d.set("campaign:refuge",e.campaign.refuge??{upgrades:{}}),')
# aplica no jogo (infinito: fragmentos; campanha: melhorias da campanha) e não herda portais de outra partida
rep('this.metaBonuses=i.endless?Pl():{}',
    'this.metaBonuses=i.endless?Pl():this.game.registry.get("mode")==="campaign"?__cBon(this.game.registry.get("campaign:refuge")):{},(!i.carry&&!i.restore&&!i.endless&&(this.completedDungeons=[],this.__cryDropped=null))')
# jogo novo: tudo novo
rep('(()=>{try{const sl=this.game.registry.get("save:slot")??1;localStorage.removeItem("depthgate:portals:slot_"+sl);localStorage.removeItem("depthgate:portals:"+sl+":"+String(t).toUpperCase());}catch(err){}})(),',
    '(()=>{try{const sl=this.game.registry.get("save:slot")??1;this.game.registry.get("mode")!=="endless"&&__cReset(this.game,sl);localStorage.removeItem("depthgate:portals:slot_"+sl);localStorage.removeItem("depthgate:portals:"+sl+":"+String(t).toUpperCase());}catch(err){}})(),')
rep('__startNewGame(){try{const sl=this.game.registry.get("save:slot")??1;localStorage.removeItem("depthgate:story:"+sl);localStorage.removeItem("depthgate:portals:slot_"+sl);}catch(e){}',
    '__startNewGame(){try{const sl=this.game.registry.get("save:slot")??1;localStorage.removeItem("depthgate:story:"+sl);localStorage.removeItem("depthgate:portals:slot_"+sl);__cReset(this.game,sl)}catch(e){}')

# diálogo fechado durante a troca de cena não quebra (física já desligada)
rep('if(!was){S.uiOpen=!1;S.physics?.resume?.()}', 'if(!was){S.uiOpen=!1;try{S.sys?.isActive?.()&&S.physics?.resume?.()}catch(e){}}')

rep('function __guardianTalkAnim(S,on){const g=S.__guard?.spr;g&&S.anims.exists("guardia-a-talk")', 'function __guardianTalkAnim(S,on){const g=S.__guard?.spr;g?.active&&g.anims&&S.anims?.exists("guardia-a-talk")')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("melhorias por modo + jogo novo limpo aplicados")
