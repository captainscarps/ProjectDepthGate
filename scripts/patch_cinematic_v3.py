import os

path = 'assets/index-D6qIWtA7-p209.js'
with open(path, 'r', encoding='utf-8') as f:
    bundle = f.read()

# 1. __playVideos
pvid_start = bundle.find('function __playVideos(list,o={}){')
pvid_end = bundle.find('let __logoShown=', pvid_start)
assert pvid_start != -1 and pvid_end != -1, 'pvid markers not found'

new_play_videos = '''function __playVideos(list,o={}){const root=document.body,ov=document.createElement("div");let done=!1,cur=0,started=[!0];ov.style.cssText="position:fixed;inset:0;background:#030202;z-index:99999;opacity:0;transition:opacity .6s ease;cursor:pointer;touch-action:none;overflow:hidden";const topBar=document.createElement("div");topBar.style.cssText="position:absolute;top:0;left:0;right:0;height:9vh;background:linear-gradient(to bottom,#000 65%,transparent);z-index:15;pointer-events:none";ov.appendChild(topBar);const botBar=document.createElement("div");botBar.style.cssText="position:absolute;bottom:0;left:0;right:0;height:11vh;background:linear-gradient(to top,#000 65%,transparent);z-index:15;pointer-events:none";ov.appendChild(botBar);const vig=document.createElement("div");vig.style.cssText="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 52%,rgba(0,0,0,0.88) 100%);pointer-events:none;z-index:12";ov.appendChild(vig);const vids=list.map((u,k)=>{const v=document.createElement("video");for(const[ext,ty]of[["mp4","video/mp4"],["webm","video/webm"]]){const so=document.createElement("source");so.src=`${u}.${ext}`,so.type=ty,v.appendChild(so)}v.preload="auto",v.playsInline=!0,v.setAttribute("playsinline",""),v.muted=!0,v.volume=0;v.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.1) saturate(1.15) brightness(0.96);background:#000;opacity:0;transition:opacity .85s ease-in-out";ov.appendChild(v);return v});const sub=document.createElement("div");sub.style.cssText="position:absolute;left:8%;right:8%;bottom:12vh;text-align:center;font:italic 500 clamp(12px,1.35vw,16px) Georgia,'Times New Roman',serif;color:#f6edd4;text-shadow:0 2px 6px #000,0 0 14px rgba(0,0,0,0.92);line-height:1.45;letter-spacing:0.04em;opacity:0;transition:opacity .35s ease;pointer-events:none;z-index:25;background:rgba(6,5,4,0.72);padding:7px 18px;border-radius:6px;border:1px solid rgba(201,162,74,0.3);max-width:680px;margin:0 auto;box-shadow:0 4px 20px rgba(0,0,0,0.6)";ov.appendChild(sub);let t0=0,si=-1,subT=null;const tick=()=>{if(done||!t0)return;const e=(performance.now()-t0)/1e3,S=o.subs??[];let k=S.findIndex(q=>e>=q[0]&&e<q[1]);k!==si&&(si=k,sub.style.opacity="0",setTimeout(()=>{k===si&&k>=0&&(sub.textContent=S[k][2],sub.style.opacity="1")},k>=0?220:0))};subT=setInterval(tick,100);const card=document.createElement("div");card.style.cssText="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#000;opacity:0;transition:opacity .7s ease;pointer-events:none";ov.appendChild(card);const hint=document.createElement("div");hint.textContent=o.hint??"Pular  ▸";hint.style.cssText="position:absolute;right:18px;bottom:14px;font:bold 12px Georgia,serif;letter-spacing:1px;color:#e8dcb0;opacity:.0;transition:opacity .6s;text-shadow:0 1px 3px #000";ov.appendChild(hint),root.appendChild(ov);let au=null;if(o.music){au=new Audio();au.src=o.music.endsWith(".mp3")?o.music:(o.music+(au.canPlayType("audio/ogg; codecs=vorbis")&&!o.preferMp3?".ogg":".mp3"));au.preload="auto",au.volume=0;const tv=Math.min(1,Math.max(0,(globalThis.__DED_GAME?.audioEngine?.musicVolume??.55)*1.4*(o.musicVol??1)));au.__tv=tv,au.loop=!!o.musicLoop}const fadeAu=(to,ms,end)=>{if(!au)return;const f=au.volume,st=performance.now(),iv=setInterval(()=>{const k=Math.min(1,(performance.now()-st)/ms);au.volume=Math.max(0,Math.min(1,f+(to-f)*k)),k>=1&&(clearInterval(iv),end?.())},40)};const play=v=>{v.muted=!0;v.volume=0;const p=v.play();p&&p.catch(()=>{try{v.muted=!0;v.play()}catch(e){close()}})};let carded=!1;const close=()=>{if(done)return;if(o.endCard&&!carded){carded=!0,sub.style.opacity="0",clearInterval(subT);card.innerHTML=`<div style="font:700 clamp(22px,4.2vw,46px) Georgia,serif;letter-spacing:.18em;color:#f0d890;text-shadow:0 0 18px #6a4a10">${o.endCard[0]}</div><div style="font:italic clamp(12px,1.8vw,19px) Georgia,serif;color:#cfc3a4;letter-spacing:.08em">${o.endCard[1]??""}</div><div style="width:min(40vw,320px);height:1px;background:linear-gradient(90deg,transparent,#c9a24a,transparent);margin-top:4px"></div>`;card.style.opacity="1",vids.forEach(v=>{v.style.opacity="0"});setTimeout(()=>{vids.forEach(v=>{try{v.pause()}catch(e){}})},900);setTimeout(close,o.endCard[2]??2800);return}done=!0,clearInterval(subT),window.removeEventListener("keydown",key,!0),ov.style.opacity="0",vids.forEach(v=>{v.style.opacity="0"});fadeAu(0,700,()=>{try{au.pause()}catch(e){}});setTimeout(()=>{vids.forEach(v=>{try{v.pause(),v.innerHTML="",v.load()}catch(e){}});ov.remove(),o.onDone?.()},480)};const next=()=>{if(cur+1>=vids.length)return;const a=vids[cur],b=vids[cur+1];cur++,started[cur]=!0;play(b);b.style.opacity="1";a.style.opacity="0";setTimeout(()=>{try{a.pause()}catch(e){}},900)};let pvWatch=setInterval(()=>{if(done){clearInterval(pvWatch);return}const cv=vids[cur];if(cv&&!cv.paused&&cv.currentTime>0){if(Math.abs(cv.currentTime-(cv.__lastT||0))<0.02){cv.__stuck=(cv.__stuck||0)+1;if(cv.__stuck>=9){clearInterval(pvWatch);close()}}else{cv.__lastT=cv.currentTime;cv.__stuck=0}}},500);let pvMaxT=setTimeout(()=>{if(!done)close()},Math.max(68000,(list.length+1)*12500));vids.forEach((v,k)=>{v.addEventListener("timeupdate",()=>{if(k===cur&&!done&&v.duration){const rem=v.duration-v.currentTime;if(rem<1.6&&k+1<vids.length&&!vids[k+1].__primed){vids[k+1].__primed=!0;play(vids[k+1])}if(rem<0.85&&k+1<vids.length&&!started[k+1]){next()}}});v.addEventListener("ended",()=>{k===vids.length-1&&close()});const onVe=()=>{k===cur&&(k+1<vids.length?next():close())};v.addEventListener("error",onVe);Array.from(v.children).forEach(s=>s.addEventListener?.("error",onVe))});const key=e=>{e.stopImmediatePropagation?.(),e.preventDefault?.(),carded&&(o.endCard=null),close()};const go=()=>{if(done)return;ov.style.opacity="1",vids[0].style.opacity="1",play(vids[0]),t0=performance.now();au&&(au.play()?.catch?.(()=>{}),fadeAu(au.__tv,1400));setTimeout(()=>{hint.style.opacity=".85",ov.addEventListener("pointerdown",close),window.addEventListener("keydown",key,!0)},o.skipDelay??700)};if(o.gate){const G=document.createElement("div");G.textContent=o.gate;G.style.cssText="position:absolute;left:0;right:0;bottom:12%;text-align:center;font:600 clamp(12px,2vw,20px) Georgia,serif;letter-spacing:.2em;color:#e8dcb0;text-shadow:0 0 12px #000;animation:__gp 1.6s ease-in-out infinite";ov.appendChild(G);const st=document.createElement("style");st.textContent="@keyframes __gp{0%,100%{opacity:.35}50%{opacity:1}}";ov.appendChild(st),ov.style.opacity="1";const once=e=>{window.removeEventListener("keydown",once,!0),ov.removeEventListener("pointerdown",once),e.preventDefault?.(),e.stopImmediatePropagation?.(),G.remove(),setTimeout(go,60)};setTimeout(()=>{window.addEventListener("keydown",once,!0),ov.addEventListener("pointerdown",once)},50)}else setTimeout(go,30);return{close}}'''

bundle = bundle[:pvid_start] + new_play_videos + bundle[pvid_end:]

# 2. Xd intro cutscene
c_idx = bundle.find('assets/video/campanha_1')
start_call = bundle.rfind('this.__vid=', 0, c_idx)
end_call = bundle.find('});return', c_idx) + 2
assert start_call != -1 and end_call != -1, 'Xd cutscene boundaries not found'

new_cutscene = '''this.__vid=__playVideos([
  "assets/video/campanha_1",
  "assets/video/campanha_2",
  "assets/video/campanha_3",
  "assets/video/campanha_4",
  "assets/video/intro_herois/" + (this.classId || "WARRIOR")
], {
  muted: !0,
  music: "assets/audio/cinematic_intro.mp3",
  musicVol: .50,
  musicLoop: !0,
  subs: [
    [0.6, 9.2, W("intro.l1") + " " + W("intro.l2")],
    [10.4, 19.2, W("intro.l3") + " " + W("intro.l4")],
    [20.4, 29.2, W("intro.l5") + " " + W("intro.l6")],
    [30.4, 39.2, W("intro.l7")],
    [40.4, 49.5, ((W("class." + (this.classId || "WARRIOR"))?.toUpperCase()) || (this.classId || "WARRIOR")) + " — " + __L3("Adentrando a Floresta de Eldervale rumo a Depthgate...", "Entering Eldervale Forest toward Depthgate...", "Entrando al Bosque de Eldervale hacia Depthgate...")]
  ],
  endCard: [W("intro.chapter"), W("intro.chapterSub"), 3200],
  onDone: () => {
    __holdM(!1);
    this.skipped = !0;
    this.finish();
  }
})'''

bundle = bundle[:start_call] + new_cutscene + bundle[end_call:]

# 3. __guardianIntro
g_idx = bundle.find('function __guardianIntro(')
end_g = bundle.find('function __stKey(', g_idx)
assert g_idx != -1 and end_g != -1, '__guardianIntro not found'

new_g_intro = '''function __guardianIntro(S){if(S.__guard||!S.textures.exists("guardia-sp-idle"))return;const R=S.dungeon.level.rooms.find(r=>r.id==="despertar")?.rect;if(!R)return;const x=(R.x+4.5)*dt,y=(R.y+4.5)*dt;S.__guard={...__guardianNpc(S,x,y,__GN),intro:!0};const reg=S.game.registry;if(!reg.get("story:gIntro")){const U=()=>{if(!S.player||S.uiOpen)return;if(Math.hypot(S.player.x-x,S.player.y-y)<100){S.events.off("update",U);reg.set("story:gIntro",!0);__gSay(S,__GINTRO)}};S.events.on("update",U);S.events.once("shutdown",()=>S.events.off("update",U))}}'''

bundle = bundle[:g_idx] + new_g_intro + bundle[end_g:]

# 4. __hubSetup
old_hub = 'if(n>=3||__stFlag(S,"forest_done")||data.hubReturn)'
new_hub = 'if(n>=3||data.hubReturn)'
assert old_hub in bundle, 'old_hub not found'
bundle = bundle.replace(old_hub, new_hub)

# 5. __startNewGame
old_start = '__startNewGame(){this.game.registry.set("prologue:pending",!0),this.game.registry.set("mode","campaign")'
new_start = '__startNewGame(){try{for(let i=0;i<=3;i++)localStorage.removeItem("depthgate:story:"+i)}catch(e){}this.game.registry.remove("story:gIntro");this.game.registry.set("prologue:pending",!0),this.game.registry.set("mode","campaign")'
assert old_start in bundle, 'old_start not found'
bundle = bundle.replace(old_start, new_start)

with open(path, 'w', encoding='utf-8') as f:
    f.write(bundle)
print('Successfully patched assets/index-D6qIWtA7-p209.js')

mirror_path = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
with open(mirror_path, 'w', encoding='utf-8') as f:
    f.write(bundle)
print('Successfully synced to Projeto atualizado!')
