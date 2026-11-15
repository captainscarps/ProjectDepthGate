import sys,time,json; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__))); from lib import *
exec(open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'t_')+'trans.py').read().split("with sync_playwright")[0])
with sync_playwright() as p:
    q=QA(p); q.boot()
    q.ev("""()=>{window.__vreq=[];const of=window.fetch;window.fetch=function(u,...a){if(String(u).includes('/voice/'))window.__vreq.push(String(u).split('/voice/')[1]);return of.call(this,u,...a)};
      const OA=window.Audio;window.Audio=function(u){if(u&&String(u).includes('/voice/'))window.__vreq.push('audio:'+String(u).split('/voice/')[1]);return new OA(u)}}""")
    q.start('Game',{'levelId':'forest','classId':'ARCHER','slot':1}); wait_scene(q,'Game'); settle(q); time.sleep(2)
    lines=[("guardia","A GUARDIÃ","Você caiu, herói. Eu te trouxe para se recuperar."),
           ("hero-archer","HAYATO","De novo essa voz… quem é você, afinal?"),
           ("menino","MENINO","Quando eu crescer, vou cuidar dos pets do Refúgio.")]
    for who,nm,t in lines:
        q.ev("()=>{window.__vreq=[]}")
        has=q.ev("(t)=>window.__dubHas?.(t)", t)
        q.ev(f"""(a)=>window.__dlgT(window.__DED_GAME.scene.getScene('Game'),[{{who:a[0],name:a[1],text:a[2]}}])""",[who,nm,t]); time.sleep(2.5)
        on=q.ev("()=>!!window.__dubOn"); req=q.ev("()=>window.__vreq")
        print(('OK  ' if has and req else 'FAIL'), nm, '| tem voz:',has,'| tocando:',on,'| arquivo:',req[:3]); sys.stdout.flush()
        for _ in range(4):
            q.key("Enter"); time.sleep(.6)
            if not q.ev("()=>window.__DED_GAME.scene.getScene('UI').__dlgOpen"): break
    print('erros voz:', [x for x in q.errs if 'voice' in x][:5])
