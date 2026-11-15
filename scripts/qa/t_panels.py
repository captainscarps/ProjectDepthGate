import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
H="window.__DED_GAME.scene.getScene('Hub')"
mode=sys.argv[1] if len(sys.argv)>1 else 'mouse'
R=[]
def ok(name,cond,info=""): R.append((name,bool(cond),str(info)[:300])); print(("OK  " if cond else "FAIL"),name,str(info)[:300]); sys.stdout.flush()
ST=f"()=>{{const h={H};return {{panel:!!h.panel,busy:!!h.__busy,dlg:!!h.__hubDlgO,gold:h.__gold?.()??null}}}}"
def go(q,id_):
    area=q.ev(f"()=>{H}.inters.find(o=>o.id==='{id_}').area")
    if q.ev(f"()=>{H}.area")!=area: q.ev(f"()=>{H}.__area('{area}')"); time.sleep(1.2)
    q.ev(f"""()=>{{const h={H};const o=h.inters.find(o=>o.id==='{id_}');let x=o.x,y=o.y;if(o.dyn){{const d=o.dyn();x=d?.x??x;y=d?.y??y}}h.playerX=x;h.playerY=(o.ay??y)+6;if(h.player){{h.player.x=h.playerX;h.player.y=h.playerY}}}}"""); time.sleep(.5)
def press(q,x,y):
    if mode=='touch': q.tap(x,y)
    else: q.click(x,y)
with sync_playwright() as p:
    q=QA(p, touch=(mode=='touch')); q.boot(); q.ev("()=>{window.__gtDone=()=>true}")
    q.ev("()=>{const g=window.__DED_GAME;g.registry.set('hub:fromForest',{slot:1});g.registry.set('save:slot',1)}")
    q.start('Hub',{'fromForest':True,'slot':1}); time.sleep(12)
    for id_ in ['vendor','pets','herb','shrine','rack','board']:
        go(q,id_)
        # abre tocando/clicando no botão de interação da tela se houver; senão E
        cl=clickables(q,'HubUI')+clickables(q,'Hub')
        btn=[c for c in cl if c['t'] and ('E' == c['t'].strip() or 'INTERAG' in c['t'].upper() or c['t'].strip() in ('!','A'))]
        if btn: press(q,btn[0]['x'],btn[0]['y'])
        else: q.key("KeyE")
        time.sleep(1.2); s1=q.ev(ST)
        if not s1['panel']: q.key("KeyE"); time.sleep(1.2); s1=q.ev(ST)
        items=[c for c in clickables(q,'Hub') if c['w']<500]
        q.shot(f"panel_{mode}_{id_}")
        names=[c['t'] for c in items]
        # clica em até 4 itens/abas que não sejam voltar/fechar
        n=0
        for c in items:
            if any(w in c['t'].upper() for w in ('VOLTAR','✕','FECHAR','SAIR','BACK')): continue
            press(q,c['x'],c['y']); time.sleep(.4); n+=1
            if not q.ev(ST)['panel']: break
            if n>=4: break
        s2=q.ev(ST)
        # fecha pelo botão voltar/✕ da tela
        cl=[c for c in clickables(q,'Hub') if any(w in c['t'].upper() for w in ('VOLTAR','✕','FECHAR','BACK'))]
        if cl: press(q,cl[-1]['x'],cl[-1]['y']); time.sleep(.8)
        s3=q.ev(ST)
        if s3['panel']: q.key("Escape"); time.sleep(.6)
        s4=q.ev(ST)
        ok(f"{id_} ({mode}) abre, clica {n} itens, fecha pelo botão", s1['panel'] and not s3['panel'] and not s3['busy'], {'botões':names[:8],'fecharBotao':bool(cl),'depoisEsc':s4})
    a=q.ev(f"()=>[{H}.playerX,{H}.playerY]"); q.pg.keyboard.down("KeyD"); time.sleep(.6); q.pg.keyboard.up("KeyD"); b=q.ev(f"()=>[{H}.playerX,{H}.playerY]")
    ok(f"herói anda ({mode})", abs(b[0]-a[0])>3, (a,b))
    json.dump({"R":R,"errs":q.errs},open(f'/tmp/qa/r_panels_{mode}.json','w'),ensure_ascii=False)
    print("ERROS:",q.errs[:20]); q.close()
