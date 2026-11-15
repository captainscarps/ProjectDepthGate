import time, json, os
os.makedirs('/tmp/qa', exist_ok=True)
from playwright.sync_api import sync_playwright
PAD_INIT = """
(() => {
  const mk = () => ({ pressed: false, touched: false, value: 0 });
  const pad = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0,
    buttons: Array.from({ length: 17 }, mk), axes: [0, 0, 0, 0], vibrationActuator: null };
  window.__pad = pad; window.__padOn = false;
  const orig = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : () => [];
  navigator.getGamepads = () => { if (!window.__padOn) return [null, null, null, null]; pad.timestamp = performance.now(); return [pad, null, null, null]; };
  window.__padConnect = () => { window.__padOn = true; try { const e = new Event('gamepadconnected'); e.gamepad = pad; window.dispatchEvent(e); } catch (e) {} };
  window.__padBtn = (i, v) => { pad.buttons[i] = { pressed: !!v, touched: !!v, value: v ? 1 : 0 }; };
  window.__padAxis = (i, v) => { pad.axes[i] = v; };
})();
"""
class QA:
    def __init__(s, p, touch=False, w=1280, h=720):
        s.b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"])
        s.ctx = s.b.new_context(viewport={"width": w, "height": h}, service_workers="block", has_touch=touch, is_mobile=touch, locale="pt-BR")
        s.ctx.add_init_script(PAD_INIT)
        s.pg = s.ctx.new_page(); s.errs = []; s.warns = []
        s.pg.on("pageerror", lambda e: s.errs.append("PAGEERROR " + str(e)[:300]))
        s.pg.on("console", lambda m: (m.type == "error" and s.errs.append("CONSOLE " + m.text[:300])) or (("anti-trava" in m.text) and s.warns.append(m.text[:200])))
        s.pg.on("requestfailed", lambda r: s.errs.append("REQFAIL " + r.url[-120:]) if "localhost" in r.url else None)
        s.pg.on("response", lambda r: s.errs.append(f"HTTP{r.status} " + r.url[-120:]) if r.status >= 400 and "localhost" in r.url else None)
        s.w, s.h = w, h
    def boot(s):
        s.pg.goto("http://localhost:5300/", wait_until="load"); time.sleep(16)
        s.pg.mouse.click(s.w//2, s.h*0.42); time.sleep(1.0)
        for _ in range(3):
            if s.ev("()=>(window.__padUI||0)>0"): s.pg.keyboard.press("Escape"); time.sleep(1.5)
        time.sleep(1.0)
    def ev(s, js, arg=None):
        return s.pg.evaluate(js, arg) if arg is not None else s.pg.evaluate(js)
    def scenes(s): return s.ev("()=>window.__DED_GAME.scene.getScenes(true).map(x=>x.sys.settings.key)")
    def key(s, k, hold=0.08):
        s.pg.keyboard.down(k); time.sleep(hold); s.pg.keyboard.up(k); time.sleep(0.35)
    def pad(s, btn, hold=0.12):
        s.ev(f"()=>{{window.__padConnect();window.__padBtn({btn},1)}}"); time.sleep(hold); s.ev(f"()=>window.__padBtn({btn},0)"); time.sleep(0.4)
    def tap(s, x, y):
        s.pg.touchscreen.tap(x, y); time.sleep(0.45)
    def click(s, x, y):
        s.pg.mouse.click(x, y); time.sleep(0.45)
    def shot(s, name): s.pg.screenshot(path=f"/tmp/qa/{name}.png")
    def start(s, scene, data):
        s.ev("""([sc,d])=>{const g=window.__DED_GAME; g.registry.set('mode',d.mode||'campaign');
          g.scene.getScenes(true).forEach(x=>{const k=x.sys.settings.key;if(k!=='LazyMaps')g.scene.stop(k)}); g.scene.start(sc,d)}""", [scene, data])
    def fps(s, secs=3):
        return s.ev(f"""()=>new Promise(r=>{{const t=[];let last=performance.now();const f=(n)=>{{t.push(n-last);last=n;if(t.length<{int(secs*60)})requestAnimationFrame(f);else{{t.sort((a,b)=>a-b);const avg=t.reduce((a,b)=>a+b,0)/t.length;r({{fps:+(1000/avg).toFixed(1),p95:+t[Math.floor(t.length*.95)].toFixed(1),max:+t[t.length-1].toFixed(1),loopFps:+window.__DED_GAME.loop.actualFps.toFixed(1)}})}}}};requestAnimationFrame(f)}})""")
    def close(s): s.b.close()

CLICKABLES = """(scKey)=>{const g=window.__DED_GAME,S=g.scene.getScene(scKey);const cv=g.canvas.getBoundingClientRect(),k=cv.width/g.scale.width;
 const cam=S.cameras.main,z=cam.zoom,ox=cam.width*cam.originX,oy=cam.height*cam.originY;
 const T=(x,y,sf)=>[cam.x+ox+(x-cam.scrollX*sf-ox)*z, cam.y+oy+(y-cam.scrollY*sf-oy)*z];
 const out=[];const walk=(l,vis,sfp)=>{for(const o of l){const v=vis&&o.visible!==false&&(o.alpha??1)>0.05;const sf=o.scrollFactorX??sfp??1;if(o.list)walk(o.list,v,sf);if(v&&o.input?.enabled&&o.getBounds){const b0=o.getBounds();if(b0.width<4||b0.height<4)continue;const sfo=(o.parentContainer?.scrollFactorX??o.scrollFactorX??1);const [cx,cy]=T(b0.centerX,b0.centerY,sfo);const b={centerX:cx,centerY:cy,width:b0.width*z,height:b0.height*z};
  let t=o.text;if(t==null&&o.parentContainer){const tt=o.parentContainer.list.find(x=>typeof x.text==='string'&&Math.abs(x.x-o.x)<80&&Math.abs(x.y-o.y)<20);t=tt?.text}
  out.push({t:String(t??'').slice(0,40),x:cv.left+b.centerX*k,y:cv.top+b.centerY*k,w:b.width,h:b.height})}}};walk(S.children.list,true,1);return out}"""
def clickables(s, scene): return s.ev(CLICKABLES, scene)
