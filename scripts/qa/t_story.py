import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
B="()=>{const g=window.__DED_GAME,S=g.scene.getScene('Game'),u=g.scene.getScene('UI');let big=0;const walk=l=>{for(const x of l){if(!x.visible||x.alpha<0.05)continue;if(x.type==='Rectangle'&&x.input?.enabled&&x.width>=300)big++;if(x.list)walk(x.list)}};walk(u.children.list);return {ui:S.uiOpen,big}}"
for mode in ['mouse','touch']:
    with sync_playwright() as p:
        q=QA(p,touch=(mode=='touch')); q.boot()
        q.start('Game',{'levelId':'rio','classId':'WARRIOR','slot':1}); time.sleep(17)
        a=q.ev(B); n=0
        for n in range(1,6):
            if mode=='kb': q.key("Enter")
            elif mode=='pad': q.pad(0)
            else:
                if q.ev("()=>!!window.__DED_GAME.scene.getScene('UI').__etp?.open"):
                    (q.tap if mode=='touch' else q.click)(450,380); time.sleep(1.2); print('  escolheu a carta'); continue
                cl=[c for c in clickables(q,'UI') if 'CONTINUAR' in c['t']]
                if not cl: print('  sem botão CONTINUAR clicável', [c['t'] for c in clickables(q,'UI')][:8])
                (q.tap if mode=='touch' else q.click)(cl[0]['x'] if cl else 640, cl[0]['y'] if cl else 636)
            time.sleep(1.2); b=q.ev(B)
            if not b['big']: break
        print('  pressões:',n)
        print(mode,'antes',a,'depois',b, 'OK' if a['big'] and not b['big'] else 'FALHOU'); sys.stdout.flush()
        q.close()
