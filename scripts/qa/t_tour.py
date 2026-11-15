import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
from PIL import Image, ImageStat
def lum(path):
    im=Image.open(path).convert('L'); return round(ImageStat.Stat(im).mean[0],1)
def settle(q):
    for _ in range(40):
        st=q.ev("()=>{const g=window.__DED_GAME,S=g.scene.getScene('Game'),u=g.scene.getScene('UI');if(!S?.sys?.isActive())return 'nogame';return (S.uiOpen||u?.__dlgOpen||u?.__etp?.open)?'busy':'ok'}")
        if st!='busy': return st
        q.key("Enter"); time.sleep(.7)
    return 'busy'
LV=['forest','templo','temple','catacombs','ruins','glacial','fortress','bosque','rio','morta','vulcao','bruxa']
R=[]
with sync_playwright() as p:
    q=QA(p); q.boot()
    plan=[('Game',{'levelId':l,'classId':'WARRIOR','slot':1},l) for l in LV]
    plan+=[('Game',{'levelId':'castle','classId':'WARRIOR','slot':1,'castleFloor':f},'castelo-'+f) for f in ('ext','f0','b1')]
    plan+=[('Game',{'endless':True,'classId':'MAGE','mode':'endless'},'infinito')]
    for scn,d,nm in plan:
        e0=len(q.errs)
        q.start(scn,d); time.sleep(12); st=settle(q)
        info=q.ev("()=>{const S=window.__DED_GAME.scene.getScene('Game');return {lvl:S?.levelId||S?.level?.id, player:!!S?.player, rooms:S?.dungeon?.level?.rooms?.length, fade:+(S?.cameras?.main?.fadeEffect?.alpha??0).toFixed(2)}}")
        a=q.ev("()=>{const P=window.__DED_GAME.scene.getScene('Game').player;return P?[P.x,P.y]:null}")
        for k in ("KeyD","KeyS","KeyA","KeyW"):
            q.pg.keyboard.down(k); time.sleep(.35); q.pg.keyboard.up(k)
        b=q.ev("()=>{const P=window.__DED_GAME.scene.getScene('Game').player;return P?[P.x,P.y]:null}")
        q.shot('tour_'+nm); L=lum('/tmp/qa/tour_'+nm+'.png')
        moved= a and b and (abs(a[0]-b[0])+abs(a[1]-b[1])>2)
        new=[x for x in q.errs[e0:] if 'dark-epic-dungeons-logo' not in x]
        ok_= st=='ok' and info['player'] and L>12 and moved and not new
        R.append((nm,ok_,st,info,L,moved,new[:5]))
        print(('OK  ' if ok_ else 'FAIL'),nm,st,info,'luz',L,'andou',moved,new[:4]); sys.stdout.flush()
    json.dump({"R":R,"errs":q.errs},open('/tmp/qa/r_tour.json','w'),ensure_ascii=False)
    q.close()
