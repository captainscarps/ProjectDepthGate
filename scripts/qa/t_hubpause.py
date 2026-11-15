import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
H="window.__DED_GAME.scene.getScene('Hub')"
PZ=f"()=>{{const h={H};return {{pz:!!h.__pz,busy:!!h.__busy,panel:!!h.panel}}}}"
for mode in ['kb','pad','touch']:
    with sync_playwright() as p:
        q=QA(p,touch=(mode=='touch')); q.boot(); q.ev("()=>{window.__gtDone=()=>true;window.__DED_GAME.registry.set('hub:fromForest',{slot:1})}")
        q.start('Hub',{'fromForest':True,'slot':1}); time.sleep(12)
        if mode=='kb': q.key("Escape")
        elif mode=='pad': q.pad(9)
        else: q.tap(1173,46)
        time.sleep(1); a=q.ev(PZ)
        if mode=='kb': q.key("ArrowDown"); q.key("ArrowUp"); q.key("Escape")
        elif mode=='pad': q.pad(13); q.pad(12); q.pad(1)
        else:
            cl=[c for c in clickables(q,'Hub') if 'Continuar' in c['t']]; q.tap(cl[0]['x'],cl[0]['y']) if cl else q.tap(640,300)
        time.sleep(1); b=q.ev(PZ)
        # e no menu principal em toque
        print(('OK  ' if a['pz'] and not b['pz'] and not b['busy'] else 'FAIL'), 'pausa do Refúgio', mode, a, '→', b); sys.stdout.flush()
        if mode=='touch':
            q.start('MainMenu',{}); time.sleep(4)
            MS="window.__DED_GAME.scene.getScene('MainMenu')"
            q.tap(46*2+40,258*2); time.sleep(1); o=q.ev(f"()=>!!{MS}.settingsPanel?.open")
            q.tap(1212,60); time.sleep(1); c=q.ev(f"()=>!!{MS}.settingsPanel?.open")
            q.tap(46*2+40,170*2); time.sleep(2); bs=q.scenes()
            print(('OK  ' if o and not c and 'BestiaryBook' in bs else 'FAIL'),'menu principal em toque: configurações abre/fecha, bestiário abre', o, c, bs)
        q.close()
