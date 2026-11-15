import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
H="window.__DED_GAME.scene.getScene('Hub')"
R=[]
def ok(name,cond,info=""): R.append((name,bool(cond),str(info)[:300])); print(("OK  " if cond else "FAIL"),name,str(info)[:300]); sys.stdout.flush()
ST=f"""()=>{{const h={H},g=window.__DED_GAME;const sc=g.scene.getScenes(true).map(x=>x.sys.settings.key).filter(k=>!['LazyMaps','Hub','HubUI'].includes(k));
  const hu=g.scene.getScene('HubUI');const op=[];for(const o of [h,hu])if(o)for(const k of Object.keys(o)){{const v=o[k];if(v&&typeof v==='object'&&v.open===true&&!/^sys|input|scene/.test(k))op.push(k)}}
  return {{sc,panel:!!h.panel,busy:!!h.__busy,dlg:!!h.__hubDlgO,area:h.area,op,pq:!!(h.__pqReel||h.__pqJ),px:Math.round(h.playerX),py:Math.round(h.playerY)}}}}"""
def st(q): return q.ev(ST)
def clean(s): return not s['sc'] and not s['panel'] and not s['busy'] and not s['dlg'] and not s['op'] and not s['pq']
SKIP={'portal','sign','cave_portal','exit','door','fish','pesca-ponta','pesca-escada','pesca-fundo'}
mode=sys.argv[1] if len(sys.argv)>1 else 'kb'
with sync_playwright() as p:
    q=QA(p); q.boot(); q.ev("()=>{window.__gtDone=()=>true}")
    q.ev("()=>{const g=window.__DED_GAME;g.registry.set('hub:fromForest',{slot:1});g.registry.set('save:slot',1)}")
    q.start('Hub',{'fromForest':True,'slot':1}); time.sleep(12)
    print('herb?', q.ev(f"()=>{H}.inters.some(o=>o.id==='herb')"), q.ev(f"()=>{H}.fromForest"))
    q.ev("()=>{const h=window.__DED_GAME.scene.getScene('Hub');h.__dbgNoWalk=1}")
    L=q.ev(f"()=>{H}.inters.map((o,i)=>[i,o.area,o.id])")
    for i,area,id_ in L:
        if id_ in SKIP: continue
        # vai para a área certa e para perto do ponto
        s0=st(q)
        if s0['area']!=area:
            q.ev(f"()=>{{const h={H};h.__area?h.__area('{area}'):(h.area='{area}')}}"); time.sleep(1.2)
        pos=q.ev(f"""()=>{{const h={H};const o=h.inters.find(o=>o.id==='{id_}');let x=o.x,y=o.y;if(o.dyn){{const d=o.dyn();x=d?.x??x;y=d?.y??y}}if(typeof x!=='number')return null;h.playerX=x;h.playerY=(o.ay??y)+6;if(h.player){{h.player.x=h.playerX;h.player.y=h.playerY}}return [x,y]}}""")
        if not pos: ok(f"{id_}: posição", False, "sem posição"); continue
        time.sleep(.5)
        if mode=='kb': q.key("KeyE")
        else: q.pad(0)
        time.sleep(1.3); s1=st(q)
        opened = not clean(s1)
        q.shot(f"hub_{mode}_{id_}")
        closed=False; how=[]
        for t in range(10):
            s=st(q)
            if clean(s): closed=True; break
            if s['dlg'] or (s['busy'] and not s['panel']):
                (q.key("Enter") if mode=='kb' else q.pad(0)); how.append('avança')
            else:
                (q.key("Escape") if mode=='kb' else q.pad(1)); how.append('fecha')
            time.sleep(.7)
        time.sleep(.5); s2=st(q)
        ok(f"{id_} ({mode})", closed and clean(s2), {'abriu':opened,'aberto':{k:v for k,v in s1.items() if v and k not in('area','px','py')},'passos':how,'fim':{k:v for k,v in s2.items() if v and k not in('area','px','py')}})
        if not clean(s2):
            for _ in range(6): q.key("Escape"); time.sleep(.4); q.pad(1); time.sleep(.3)
    # anda?
    a=st(q); q.pg.keyboard.down("KeyD"); time.sleep(.6); q.pg.keyboard.up("KeyD"); b=st(q)
    ok(f"herói anda no fim ({mode})", abs(b['px']-a['px'])+abs(b['py']-a['py'])>3, (a['px'],b['px']))
    json.dump({"R":R,"errs":q.errs,"warns":q.warns},open(f'/tmp/qa/r_hub_{mode}.json','w'),ensure_ascii=False)
    print("ERROS:",q.errs[:20]); print("ANTITRAVA:",q.warns[:10]); q.close()
