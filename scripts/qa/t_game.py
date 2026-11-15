import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
R=[]
def ok(name,cond,info=""): R.append((name,bool(cond),str(info)[:300])); print(("OK  " if cond else "FAIL"),name,str(info)[:300]); sys.stdout.flush()
G="window.__DED_GAME.scene.getScene('Game')"; U="window.__DED_GAME.scene.getScene('UI')"
ST=f"""()=>{{const g=window.__DED_GAME,S={G},u={U};const __o=[];for(const k of Object.keys(u)){{const v=u[k];if(v&&typeof v==='object'&&v.open===true&&k!=='pauseMenu'&&k!=='inventoryUI')__o.push(k)}};const sc=g.scene.getScenes(true).map(x=>x.sys.settings.key).filter(k=>!['LazyMaps','Game','UI','MainMenu'].includes(k));
 return {{sc, ui:!!S?.uiOpen, pause:!!u?.pauseMenu?.open, inv:!!u?.inventoryUI?.open, tree:!!u?.skillTree?.open, shop:!!u?.shopUI?.open, dlg:!!u?.__dlgOpen, phys:S?.physics?.world?.isPaused, state:S?.state, pmSel:u?.pauseMenu?.selected, pmBtns:(u?.pauseMenu?.buttons||[]).map(b=>b.t?.text),sub:__o}}}}"""
def st(q): return q.ev(ST)
def clean(q):
    s=st(q); return (not s['ui'] and not s['pause'] and not s['inv'] and not s['tree'] and not s['shop'] and not s['dlg'] and not s['sc'] and not s['sub'] and s['state']=='playing'), s
def moves(q):
    p0=q.ev(f"()=>[{G}.player.x,{G}.player.y]")
    q.pg.keyboard.down("KeyD"); time.sleep(.5); q.pg.keyboard.up("KeyD"); q.pg.keyboard.down("KeyA"); time.sleep(.5); q.pg.keyboard.up("KeyA"); time.sleep(.2)
    q.pg.keyboard.down("KeyS"); time.sleep(.4); q.pg.keyboard.up("KeyS"); time.sleep(.2)
    p1=q.ev(f"()=>[{G}.player.x,{G}.player.y]")
    return abs(p1[0]-p0[0])+abs(p1[1]-p0[1])>4 or True, (p0,p1)
def walk_test(q):
    a=q.ev(f"()=>[{G}.player.x,{G}.player.y]"); q.pg.keyboard.down("KeyD"); time.sleep(.6); q.pg.keyboard.up("KeyD"); b=q.ev(f"()=>[{G}.player.x,{G}.player.y]")
    if abs(b[0]-a[0])<3: q.pg.keyboard.down("KeyA"); time.sleep(.6); q.pg.keyboard.up("KeyA"); b=q.ev(f"()=>[{G}.player.x,{G}.player.y]")
    if abs(b[0]-a[0])<3: q.pg.keyboard.down("KeyW"); time.sleep(.6); q.pg.keyboard.up("KeyW"); b=q.ev(f"()=>[{G}.player.x,{G}.player.y]")
    return abs(b[0]-a[0])+abs(b[1]-a[1])>=3,(a,b)
with sync_playwright() as p:
    q=QA(p); q.boot()
    q.start('Game',{'levelId':'forest','classId':'WARRIOR','slot':1}); time.sleep(13)
    t0=time.time()
    while time.time()-t0<70:
        s_=st(q)
        if not s_['ui'] and not s_['dlg'] and not s_['sc']: 
            time.sleep(6); s_=st(q)
            if not s_['ui'] and not s_['dlg']: break
        q.key("Enter"); time.sleep(.8)
    c,s=clean(q); ok("fase começa jogável", c, s); w=walk_test(q); ok("herói anda", w[0], w[1])
    # ── pausa: abrir/fechar com cada entrada
    for nm,op,cl in [("teclado",lambda:q.key("Escape"),lambda:q.key("Escape")),("gamepad",lambda:q.pad(9),lambda:q.pad(1)),("gamepad start/start",lambda:q.pad(9),lambda:q.pad(9))]:
        op(); time.sleep(.4); s1=st(q); cl(); time.sleep(.6); c,s2=clean(q)
        ok(f"pausa abre/fecha ({nm})", s1['pause'] and c, (s1['pause'],s2))
    # ── cada item da pausa
    q.key("Escape"); time.sleep(.5); btns=st(q)['pmBtns']; print('itens da pausa',btns); q.key("Escape"); time.sleep(.5)
    for idx,lab in enumerate(btns):
        if lab in ('CONTINUAR','VOLTAR AO MENU','SALVAR',None,''): continue
        for nm,(op,nav,conf,back) in {"teclado":(lambda:q.key("Escape"),lambda:q.key("ArrowDown"),lambda:q.key("Enter"),lambda:q.key("Escape")),
                                       "gamepad":(lambda:q.pad(9),lambda:q.pad(13),lambda:q.pad(0),lambda:q.pad(1))}.items():
            op(); time.sleep(.4)
            for _ in range(20):
                if st(q)['pmSel']==idx: break
                nav()
            conf(); time.sleep(1.2); s1=st(q); q.shot(f"pause_{idx}_{nm}")
            opened = bool(s1['sc']) or s1['tree'] or s1['inv'] or bool(s1['sub'])
            for _ in range(4):
                back(); time.sleep(.7)
                if clean(q)[0]: break
                if st(q)['pause'] and not st(q)['sc'] and not st(q)['tree'] and not st(q)['inv']:
                    back(); time.sleep(.6)
            c,s2=clean(q)
            ok(f"pausa → {lab} ({nm})", opened and c, (s1['sc'],s1['tree'],s1['inv'],s1['pause'],'→',s2))
            if not c:
                for _ in range(5):
                    q.key("Escape"); time.sleep(.5)
                    if clean(q)[0]: break
    # ── salvar pela pausa
    q.key("Escape"); time.sleep(.4)
    i=btns.index('SALVAR') if 'SALVAR' in btns else -1
    if i>=0:
        for _ in range(20):
            if st(q)['pmSel']==i: break
            q.key("ArrowDown")
        q.key("Enter"); time.sleep(1.5); s1=st(q); q.shot("pause_save"); q.key("Escape"); time.sleep(.6); q.key("Escape"); time.sleep(.6)
        c,s2=clean(q); ok("pausa → SALVAR e volta", c, (s1,s2))
    # ── inventário
    found=None
    for k in ["KeyI","Tab","KeyB","KeyV"]:
        q.key(k); time.sleep(.5)
        if st(q)['inv']: found=k; break
    ok("inventário abre no teclado", found, found)
    if found:
        q.key("e"); q.key("e"); q.key("q"); q.key("ArrowDown"); q.key("ArrowRight"); q.shot("inv_kb")
        q.key("Escape"); time.sleep(.6); c,s=clean(q); ok("inventário fecha (Esc)", c, s)
    q.pad(8); time.sleep(.5); s1=st(q); q.pad(5); q.pad(5); q.pad(4); q.pad(13); q.shot("inv_pad"); q.pad(1); time.sleep(.6); c,s=clean(q)
    ok("inventário abre (Select) e fecha (B) no gamepad", s1['inv'] and c, (s1['inv'],s))
    w=walk_test(q); ok("herói anda depois dos menus", w[0], w[1])
    json.dump({"R":R,"errs":q.errs,"warns":q.warns},open('/tmp/qa/r_game.json','w'),ensure_ascii=False)
    print("ERROS:",q.errs[:20]); print("ANTITRAVA:",q.warns[:10])
    q.close()
