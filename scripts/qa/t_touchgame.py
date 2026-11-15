import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
G="window.__DED_GAME.scene.getScene('Game')"; U="window.__DED_GAME.scene.getScene('UI')"
R=[]
def ok(name,cond,info=""): R.append((name,bool(cond),str(info)[:300])); print(("OK  " if cond else "FAIL"),name,str(info)[:300]); sys.stdout.flush()
OPEN=f"""()=>{{const u={U},S={G},g=window.__DED_GAME;const o=[];for(const k of Object.keys(u)){{const v=u[k];if(v&&typeof v==='object'&&v.open===true)o.push(k)}}if(u.__dlgOpen)o.push('dlg');
 const sc=g.scene.getScenes(true).map(x=>x.sys.settings.key).filter(k=>!['LazyMaps','Game','UI','MainMenu'].includes(k));return {{o,sc,ui:S.uiOpen}}}}"""
def clean(s): return not s['o'] and not s['sc'] and not s['ui']
def tapText(q,scene,pred):
    cl=[c for c in clickables(q,scene) if pred(c['t'])]
    if not cl: return False
    q.tap(cl[0]['x'],cl[0]['y']); return True
with sync_playwright() as p:
    q=QA(p,touch=True); q.boot()
    q.start('Game',{'levelId':'forest','classId':'WARRIOR','slot':1}); time.sleep(13)
    t0=time.time()
    while time.time()-t0<60:
        s=q.ev(OPEN)
        if clean(s): break
        q.tap(450,380) if '__etp' in s['o'] else q.tap(640,600); time.sleep(.9)
    ok("começa limpo (toque avança diálogos)", clean(q.ev(OPEN)), q.ev(OPEN))
    hud=[c['t'] for c in clickables(q,'UI') if c['t']]; print('HUD toque:',hud)
    items=['BESTIÁRIO','COLECIONÁVEIS','HABILIDADES','CÓDICE','HALL DA FAMA','CONFIGURAÇÕES']
    for it in items:
        tapText(q,'UI',lambda t:'PAUSA' in t); time.sleep(.6)
        a=q.ev(OPEN)
        hit=tapText(q,'UI',lambda t,it=it:t.strip()==it); time.sleep(1.4); b=q.ev(OPEN); q.shot(f"tg_{it[:6]}")
        # fecha: procura voltar/✕ em todas as cenas abertas
        closed=False
        for _ in range(5):
            s=q.ev(OPEN)
            if clean(s): closed=True; break
            done=False
            for sc in (s['sc'][::-1]+['UI']):
                if tapText(q,sc,lambda t:any(w in t.upper() for w in ('VOLTAR','✕','FECHAR','CONTINUAR','BACK'))): done=True; break
            if not done: q.tap(30,30)
            time.sleep(.9)
        ok(f"toque: pausa → {it} → fecha", a['o']==['pauseMenu'] and hit and closed, {'abriu':b,'fim':q.ev(OPEN)})
        if not closed:
            for _ in range(4): q.key("Escape"); time.sleep(.5)
    tapText(q,'UI',lambda t:'INVENT' in t); time.sleep(.8); a=q.ev(OPEN); q.shot('tg_inv')
    tabs=[c['t'] for c in clickables(q,'UI') if c['t']][:20]; print('inventário toque:',tabs)
    for t in tabs[:6]:
        if any(w in t.upper() for w in ('VOLTAR','✕','FECHAR')): continue
        tapText(q,'UI',lambda x,t=t:x==t); time.sleep(.5)
    for _ in range(4):
        if clean(q.ev(OPEN)): break
        tapText(q,'UI',lambda t:any(w in t.upper() for w in ('VOLTAR','✕','FECHAR'))); time.sleep(.8)
    ok("toque: inventário abre, troca abas, fecha", 'inventoryUI' in a['o'] and clean(q.ev(OPEN)), (a,q.ev(OPEN)))
    json.dump({"R":R,"errs":q.errs},open('/tmp/qa/r_touchgame.json','w'),ensure_ascii=False)
    print("ERROS:",q.errs[:20]); q.close()
