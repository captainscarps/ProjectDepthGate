import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
exec(open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'t_')+'trans.py').read().split("with sync_playwright")[0])
CNT="""()=>{const g=window.__DED_GAME;const ev=g.events;const n={};for(const k of ev.eventNames())n[String(k)]=ev.listenerCount(k);const S=g.scene.getScene('Game');const sn={};if(S)for(const k of S.events.eventNames())sn[String(k)]=S.events.listenerCount(k);return {game:n,scene:sn}}"""
with sync_playwright() as p:
    q=QA(p); q.boot(); q.ev("()=>{window.__gtDone=()=>true;const g=window.__DED_GAME;g.registry.set('mode','campaign');g.registry.set('hub:fromForest',{slot:1})}")
    seq=[('Game',{'levelId':'forest','classId':'WARRIOR','slot':1}),('Hub',{'fromForest':True,'slot':1}),('Game',{'levelId':'templo','classId':'WARRIOR','slot':1}),('Game',{'levelId':'castle','classId':'WARRIOR','slot':1,'castleFloor':'ext'})]
    snaps=[]
    for rnd in range(3):
        for scn,d in seq:
            q.start(scn,d); wait_scene(q,scn); time.sleep(2.5)
        q.start('Game',{'levelId':'forest','classId':'WARRIOR','slot':1}); wait_scene(q,'Game'); time.sleep(3)
        snaps.append(q.ev(CNT))
    a,b,c=snaps
    for kind in ('game','scene'):
        grow={k:(a[kind].get(k,0),b[kind].get(k,0),c[kind].get(k,0)) for k in set(a[kind])|set(c[kind]) if c[kind].get(k,0)>a[kind].get(k,0)}
        print(kind,'cresceu:',grow)
    print('erros', [x[:140] for x in q.errs if 'logo' not in x][:8])
