import sys,time; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
R=[]
def ok(name,cond,info=""): R.append((name,bool(cond),str(info)[:200])); print(("OK  " if cond else "FAIL"),name,str(info)[:200])
MS="window.__DED_GAME.scene.getScene('MainMenu')"
with sync_playwright() as p:
    q=QA(p); q.boot()
    sel=lambda: q.ev(f"()=>{MS}.selected")
    sp=lambda: q.ev(f"()=>!!{MS}.settingsPanel?.root?.visible||!!{MS}.settingsPanel?.open")
    print('panel keys', q.ev(f"()=>Object.keys({MS}.settingsPanel||{{}}).slice(0,40)"))
    s0=sel(); q.key("ArrowDown"); s1=sel(); q.key("ArrowUp"); s2=sel()
    ok("menu teclado ↓↑", s1!=s0 and s2==s0, (s0,s1,s2))
    q.pad(13); p1=sel(); q.pad(12); p2=sel()
    ok("menu gamepad dpad ↓↑", p1!=p2, (p1,p2))
    q.ev("()=>{window.__padAxis(1,1)}"); time.sleep(.3); q.ev("()=>{window.__padAxis(1,0)}"); time.sleep(.4); a1=sel()
    ok("menu analógico ↓", a1!=p2, (p2,a1))
    # configurações por teclado
    for _ in range(10):
        if q.ev(f"()=>{{const M={MS};return M.buttons[M.selected]?.label?.text||M.buttons[M.selected]?.t?.text||''}}")=="CONFIGURAÇÕES": break
        q.key("ArrowDown")
    print('btn', q.ev(f"()=>{{const M={MS};const b=M.buttons[M.selected];return Object.keys(b||{{}})}}"))
    q.key("Enter"); o1=sp(); q.shot("menu_settings")
    q.key("ArrowRight"); q.key("ArrowLeft"); q.key("ArrowDown")
    q.key("Escape"); c1=sp()
    ok("configurações abre/fecha teclado", o1 and not c1, (o1,c1))
    q.pad(0); o2=sp(); q.pad(5); q.pad(4); q.pad(1); c2=sp()
    ok("configurações abre/fecha gamepad (A/LB/RB/B)", o2 and not c2, (o2,c2))
    # mouse: clicar no item CONFIGURAÇÕES (x 46,y 258 em 640x360 → ×2)
    q.click(46*2+30,258*2); o3=sp(); q.click(626*2,12*2); c3=sp()
    ok("configurações abre/fecha mouse (item e ✕)", o3 and not c3, (o3,c3))
    print(q.errs); json.dump(R,open('/tmp/qa/r_menu.json','w'))
    q.close()
