import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
from PIL import Image, ImageStat
H="window.__DED_GAME.scene.getScene('Hub')"
def lum(q,n):
    q.shot(n); return round(ImageStat.Stat(Image.open(f'/tmp/qa/{n}.png').convert('L')).mean[0],1)
def wait_scene(q,key,secs=25):
    t0=time.time()
    while time.time()-t0<secs:
        ok=q.ev(f"""()=>{{const g=window.__DED_GAME,s=g.scene.getScene('{key}');if(!s||!s.sys.isActive())return false;const fe=s.cameras?.main?.fadeEffect;return !(fe&&fe.isRunning)&&!(fe&&fe.direction===true&&fe.alpha>.5)}}""")
        if ok: return round(time.time()-t0,1)
        time.sleep(.5)
    return None
R=[]
def rep(nm,t,L,extra=""):
    ok_=t is not None and L>12
    R.append((nm,ok_,t,L,extra)); print(('OK  ' if ok_ else 'FAIL'),nm,'tempo',t,'luz',L,extra); sys.stdout.flush()
def go_inter(q,id_):
    area=q.ev(f"()=>{H}.inters.find(o=>o.id==='{id_}')?.area")
    if area and q.ev(f"()=>{H}.area")!=area: q.ev(f"()=>{H}.__area('{area}')"); time.sleep(1.2)
    q.ev(f"""()=>{{const h={H};const o=h.inters.find(o=>o.id==='{id_}');h.playerX=o.x;h.playerY=(o.ay??o.y)+6;h.player&&(h.player.x=h.playerX,h.player.y=h.playerY)}}"""); time.sleep(.6)
    q.key("KeyE"); time.sleep(1)
def settle(q):
    for _ in range(30):
        st=q.ev("()=>{const g=window.__DED_GAME,S=g.scene.getScene('Game'),u=g.scene.getScene('UI');if(!S?.sys?.isActive())return 'nogame';return (S.uiOpen||u?.__dlgOpen||u?.__etp?.open)?'busy':'ok'}")
        if st!='busy': return st
        q.key("Enter"); time.sleep(.7)
with sync_playwright() as p:
    q=QA(p); q.boot(); q.ev("()=>{window.__gtDone=()=>true;const g=window.__DED_GAME;g.registry.set('mode','campaign');g.registry.set('hub:fromForest',{slot:1})}")
    # campanha de verdade: Novo Jogo pelo menu
    e0=len(q.errs)
    q.start('Hub',{'fromForest':True,'slot':1}); t=wait_scene(q,'Hub'); rep("abrir o Refúgio",t,lum(q,'tr_hub'))
    # Refúgio → Cavernas Dorf
    go_inter(q,'cave_portal'); q.key("Enter"); time.sleep(.5)
    for _ in range(3):
        if q.ev("()=>window.__DED_GAME.scene.getScene('Game')?.sys?.isActive()"): break
        q.key("Enter"); time.sleep(1)
    t=wait_scene(q,'Game'); settle(q); rep("Refúgio → Cavernas Dorf",t,lum(q,'tr_dorf'),q.ev("()=>window.__DED_GAME.scene.getScene('Game')?.isDorfCave"))
    # Refúgio → floresta pelo portal (volta ao Refúgio primeiro)
    q.start('Hub',{'fromForest':True,'slot':1}); wait_scene(q,'Hub'); time.sleep(2)
    go_inter(q,'portal'); 
    for _ in range(4):
        if q.ev("()=>window.__DED_GAME.scene.getScene('Game')?.sys?.isActive()"): break
        q.key("Enter"); time.sleep(1)
    t=wait_scene(q,'Game'); settle(q); rep("Refúgio → portal (campanha)",t,lum(q,'tr_portal'),q.ev("()=>window.__DED_GAME.scene.getScene('Game')?.levelId"))
    # Refúgio → SAÍDA
    q.start('Hub',{'fromForest':True,'slot':1}); wait_scene(q,'Hub'); time.sleep(2)
    go_inter(q,'sign')
    for _ in range(4):
        if q.ev("()=>window.__DED_GAME.scene.getScene('Game')?.sys?.isActive()||window.__DED_GAME.scene.getScene('MainMenu')?.sys?.isActive()"): break
        q.key("Enter"); time.sleep(1)
    t=wait_scene(q,'Game',15) or wait_scene(q,'MainMenu',5); rep("Refúgio → SAÍDA",t,lum(q,'tr_sign'),q.scenes())
    # castelo: escada do térreo para o subsolo e porta para fora
    q.start('Game',{'levelId':'castle','classId':'WARRIOR','slot':1,'castleFloor':'f0'}); wait_scene(q,'Game'); settle(q); time.sleep(2)
    for sid,dest in [('capela-down','b1'),('escada','f0'),('exit','ext')]:
        ok_=q.ev(f"""()=>{{const S=window.__DED_GAME.scene.getScene('Game');const F=S.__c2?.F;const sx=F?.stairs?.find(s=>s.id==='{sid}');if(!sx)return 'sem escada';const o=S.dungeon.objects.find(o=>o.x&&Math.abs(o.x-(sx.col+(sx.w||2)/2)*32)<40&&Math.abs(o.y-(sx.row+1)*32)<80&&o.interact);if(!o)return 'sem objeto';o.interact();return 'ok'}}""")
        time.sleep(2); t=wait_scene(q,'Game'); settle(q); time.sleep(1.5)
        fl=q.ev("()=>window.__DED_GAME.scene.getScene('Game')?.level?.floorId")
        rep(f"castelo: {sid} → {dest}",t if fl==dest else None,lum(q,'tr_castle_'+sid),(ok_,fl))
    # Valdrak: memória 1 a partir do Refúgio e volta
    q.start('Hub',{'fromForest':True,'slot':1}); wait_scene(q,'Hub'); time.sleep(2)
    q.ev("()=>{const h=window.__DED_GAME.scene.getScene('Hub');h.__busy=true;h.scene.sleep();window.__valdrakNow('WARRIOR',()=>{try{h.scene.wake();h.__busy=false;window.__vkBack=1}catch(e){}},1,'mem1')}")
    t=wait_scene(q,'ValdrakAntiga'); time.sleep(3); rep("Refúgio → memória do Rei (Valdrak)",t,lum(q,'tr_valdrak'))
    q.ev("()=>{const v=window.__DED_GAME.scene.getScene('ValdrakAntiga');try{v.onDone&&v.onDone();v.scene.stop()}catch(e){}}"); time.sleep(3)
    t=wait_scene(q,'Hub'); rep("memória → volta ao Refúgio",t if q.ev("()=>!window.__DED_GAME.scene.getScene('Hub').__busy") else None,lum(q,'tr_valdrak_back'))
    new=[x for x in q.errs[e0:] if 'dark-epic-dungeons-logo' not in x]
    print("ERROS:",new[:15]); print("ANTITRAVA:",q.warns[:10])
    json.dump({"R":R,"errs":new,"warns":q.warns},open('/tmp/qa/r_trans.json','w'),ensure_ascii=False)
    q.close()
