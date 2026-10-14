const fs = require('fs');

const bundlePath = 'assets/index-D6qIWtA7-p209.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

const targetCall = 'this.__vid=__playVideos(["assets/video/intro_campanha"],{muted:!1,music:"assets/audio/opening",musicVol:.32,musicLoop:!0,endCard:[W("intro.chapter"),W("intro.chapterSub"),2800],onDone:()=>{__holdM(!1),this.skipped=!0,this.finish()}});return';

if (!bundle.includes(targetCall)) {
  console.error("Target call not found!");
  process.exit(1);
}

const enhancedCall = `this.__vid=__playVideos(["assets/video/intro_campanha"],{
  muted:!1,
  music:"assets/audio/opening",
  musicVol:.35,
  musicLoop:!0,
  subs:[
    [0.8, 3.8, W("intro.l1")],
    [4.2, 7.8, W("intro.l2")],
    [8.2, 11.5, W("intro.l3")],
    [12.0, 16.0, W("intro.l4")],
    [16.5, 20.2, W("intro.l5")],
    [20.8, 25.0, W("intro.l6")],
    [25.5, 30.5, W("intro.l7")]
  ],
  endCard:[W("intro.chapter"),W("intro.chapterSub"),3200],
  onDone:()=>{__holdM(!1),this.skipped=!0,this.finish()}
});return`;

bundle = bundle.replace(targetCall, enhancedCall);

// Agora vamos aprimorar o player __playVideos adicionando:
// 1. Letterbox 21:9 anamórfico de cinema (barras pretas elegantes)
// 2. Filtro visual nos vídeos: contraste, brilho e saturação de filme de fantasia épica
// 3. Legendas em caixa estilizada com borda dourada e efeito suave de transição
// 4. Somente para intro da campanha e modo infinito, sem quebrar os outros

const oldPlayVidsStart = 'function __playVideos(list,o={}){const root=document.body,ov=document.createElement("div");let done=!1,cur=0,started=[!0];ov.style.cssText="position:fixed;inset:0;background:#000;z-index:99999;opacity:0;transition:opacity .45s ease;cursor:pointer;touch-action:none";const vids=list.map((u,k)=>{const v=document.createElement("video");for(const[ext,ty]of[["mp4","video/mp4"],["webm","video/webm"]]){const so=document.createElement("source");so.src=`${u}.${ext}`,so.type=ty,v.appendChild(so)}v.preload="auto",v.playsInline=!0,v.setAttribute("playsinline",""),v.muted=!!o.muted,v.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;opacity:0;transition:opacity .9s ease",ov.appendChild(v);return v});const sub=document.createElement("div");sub.style.cssText="position:absolute;left:8%;right:8%;bottom:9%;text-align:center;font:italic 600 clamp(14px,2.4vw,26px) Georgia,\'Times New Roman\',serif;color:#f2e8cc;text-shadow:0 2px 6px #000,0 0 14px #000;opacity:0;transition:opacity .5s ease;pointer-events:none",ov.appendChild(sub);';

const newPlayVidsStart = 'function __playVideos(list,o={}){const root=document.body,ov=document.createElement("div");let done=!1,cur=0,started=[!0];ov.style.cssText="position:fixed;inset:0;background:#050403;z-index:99999;opacity:0;transition:opacity .55s ease;cursor:pointer;touch-action:none;overflow:hidden";' +
'const topBar=document.createElement("div");topBar.style.cssText="position:absolute;top:0;left:0;right:0;height:10vh;background:#000;z-index:15;pointer-events:none;box-shadow:0 8px 30px rgba(0,0,0,0.9)";ov.appendChild(topBar);' +
'const botBar=document.createElement("div");botBar.style.cssText="position:absolute;bottom:0;left:0;right:0;height:12vh;background:#000;z-index:15;pointer-events:none;box-shadow:0 -8px 30px rgba(0,0,0,0.9)";ov.appendChild(botBar);' +
'const vig=document.createElement("div");vig.style.cssText="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.85) 100%);pointer-events:none;z-index:12";ov.appendChild(vig);' +
'const vids=list.map((u,k)=>{const v=document.createElement("video");for(const[ext,ty]of[["mp4","video/mp4"],["webm","video/webm"]]){const so=document.createElement("source");so.src=`${u}.${ext}`,so.type=ty,v.appendChild(so)}v.preload="auto",v.playsInline=!0,v.setAttribute("playsinline",""),v.muted=!!o.muted,v.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.12) saturate(1.15) brightness(0.96);background:#000;opacity:0;transition:opacity .9s ease",ov.appendChild(v);return v});' +
'const sub=document.createElement("div");sub.style.cssText="position:absolute;left:10%;right:10%;bottom:14vh;text-align:center;font:italic 600 clamp(16px,2.4vw,28px) Georgia,\'Times New Roman\',serif;color:#f6edd4;text-shadow:0 2px 8px #000,0 0 18px rgba(0,0,0,0.95);line-height:1.4;opacity:0;transition:opacity .45s ease;pointer-events:none;z-index:25;background:rgba(8,6,4,0.65);padding:10px 22px;border-radius:6px;border:1px solid rgba(201,162,74,0.3);max-width:860px;margin:0 auto",ov.appendChild(sub);';

if (!bundle.includes(oldPlayVidsStart)) {
  console.error("oldPlayVidsStart not found!");
  process.exit(1);
}

bundle = bundle.replace(oldPlayVidsStart, newPlayVidsStart);

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log("Successfully patched video intro subtitles and cinematic player!");

const mirrorPath = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js';
if (fs.existsSync(mirrorPath)) {
  fs.writeFileSync(mirrorPath, bundle, 'utf8');
  console.log("Successfully synced to Projeto atualizado!");
}
