import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
PROF="""(secs)=>new Promise(res=>{const g=window.__DED_GAME;const sc=g.scene.getScenes(true);const acc={};const undo=[];
 for(const s of sc){const k=s.sys.settings.key;acc[k]={t:0,n:0,max:0};const st=s.sys.step.bind(s.sys);const orig=s.sys.step;s.sys.step=function(a,b){const t0=performance.now();const r=st(a,b);const d=performance.now()-t0;acc[k].t+=d;acc[k].n++;acc[k].max=Math.max(acc[k].max,d);return r};undo.push(()=>s.sys.step=orig)}
 const h0=performance.memory?.usedJSHeapSize||0;
 setTimeout(()=>{undo.forEach(f=>f());const out={};for(const k in acc)if(acc[k].n)out[k]={avg:+(acc[k].t/acc[k].n).toFixed(2),max:+acc[k].max.toFixed(1),n:acc[k].n};
   const objs=sc.reduce((a,s)=>a+s.children.list.length,0);res({scenes:out,objs,heapMB:+((performance.memory?.usedJSHeapSize||0)/1048576).toFixed(1),tweens:sc.reduce((a,s)=>a+(s.tweens?.getTweens?.().length||0),0),timers:sc.reduce((a,s)=>a+(s.time?._active?.length||0),0)})},secs*1000)})"""
def settle(q):
    for _ in range(40):
        st=q.ev("()=>{const g=window.__DED_GAME,S=g.scene.getScene('Game'),u=g.scene.getScene('UI');if(!S?.sys?.isActive())return 'nogame';return (S.uiOpen||u?.__dlgOpen||u?.__etp?.open)?'busy':'ok'}")
        if st!='busy': return st
        q.key("Enter"); time.sleep(.7)
    return 'busy'
with sync_playwright() as p:
    q=QA(p); q.boot()
    res={}
    tests=[("floresta",'Game',{'levelId':'forest','classId':'WARRIOR','slot':1}),
           ("templo",'Game',{'levelId':'templo','classId':'WARRIOR','slot':1}),
           ("castelo (arredores)",'Game',{'levelId':'castle','classId':'WARRIOR','slot':1,'castleFloor':'ext'}),
           ("refúgio",'Hub',{'fromForest':True,'slot':1}),
           ("infinito andar 1",'Game',{'endless':True,'classId':'WARRIOR','mode':'endless'})]
    for nm,scn,d in tests:
        q.ev("()=>{window.__gtDone=()=>true;window.__DED_GAME.registry.set('hub:fromForest',{slot:1})}")
        q.start(scn,d); time.sleep(13); settle(q)
        if nm=="refúgio":
            # anda pela vila e vai até a doca
            q.ev("()=>{const h=window.__DED_GAME.scene.getScene('Hub');h.playerX=700;h.playerY=900;h.player&&(h.player.x=700,h.player.y=900)}")
        else:
            q.pg.keyboard.down("KeyD"); time.sleep(.3)
        r=q.ev(PROF,4); q.pg.keyboard.up("KeyD")
        res[nm]=r; print(nm, json.dumps(r,ensure_ascii=False)); sys.stdout.flush()
    # memória: vai e volta 5 vezes entre refúgio e floresta
    heap=[]
    for i in range(5):
        q.start('Hub',{'fromForest':True,'slot':1}); time.sleep(9)
        q.start('Game',{'levelId':'forest','classId':'WARRIOR','slot':1}); time.sleep(9)
        q.ev("()=>{try{window.gc&&window.gc()}catch(e){}}")
        heap.append(q.ev("()=>+((performance.memory?.usedJSHeapSize||0)/1048576).toFixed(1)"))
    print('memória após cada ida e volta (MB):',heap)
    res['heap']=heap
    json.dump({"res":res,"errs":q.errs},open('/tmp/qa/r_perf.json','w'),ensure_ascii=False)
    print("ERROS:",q.errs[:20]); q.close()
