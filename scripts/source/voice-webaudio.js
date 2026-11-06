/* ── Dublagem tocada pelo Web Audio (o mesmo áudio do jogo, já liberado pelo primeiro toque) ──
   Antes cada fala criava um <audio> novo: no iPhone/Safari isso só toca dentro de um toque do jogador, então
   falas que abrem sozinhas (Guardiã ao se aproximar, retorno ao Coração da Floresta, páginas que avançam sozinhas)
   ficavam mudas. Também: se a lista de falas ainda não tinha carregado, a primeira fala saía sem voz.
   Agora: espera a lista carregar (até 4 s), decodifica o mp3 no Web Audio (com cache) e toca; se não der, usa o <audio>. */
(function(){
const BUF=new Map(),ORD=[];
let manP=null;
let natP=null;
if(typeof window!=="undefined")window.__DUB=__DUB;
__dubInit=function(){
  if(!natP||__DUB.n===undefined){
    __DUB.n=null;
    natP=fetch("assets/audio/voice/voice-native.json").then(r=>r.json()).then(m=>{__DUB.n=m}).catch(()=>{__DUB.n={k:{},d:{}}});
  }
  if(!manP||!__DUB.m||!__DUB.m.k||Object.keys(__DUB.m.k).length===0){
    __DUB.m={k:{},d:{}};
    manP=fetch("assets/audio/voice/voice-manifest.json").then(r=>r.json()).then(m=>{__DUB.m=m}).catch(()=>{__DUB.m={k:{},d:{}}});
  }
  return Promise.all([manP,natP]);
};

/* Sistema de Idiomas e Comunicação:
   Cada personagem possui sua língua nativa antes da bênção da Guardiã.
   Após a intervenção mágica da Guardiã (window.__hasGuardianMagic ou flag no storage),
   todos passam a falar e compreender o idioma selecionado pelo jogador nas configurações (PT ou EN). */
const hasMagic=()=>{
  if(typeof window!=="undefined"&&window.__hasGuardianMagic!==undefined)return !!window.__hasGuardianMagic;
  try{
    if(typeof localStorage!=="undefined"){
      if(localStorage.getItem("depthgate:guardian_magic")==="1")return true;
      for(let i=0;i<=3;i++){
        const s=localStorage.getItem("depthgate:story:"+i);
        if(s&&(s.indexOf('"gIntro":1')!==-1||s.indexOf('"gIntro":true')!==-1))return true;
      }
    }
  }catch(e){}
  return false;
};
const natOf=text=>{
  if(hasMagic())return null;
  const N=__DUB.n;if(!N||!N.k)return null;const id=N.k[__dubH(text)],nd=id&&N.d[id];if(!nd)return null;
  const cls=String(window.__currentSpeaker||window.__heroCls||"").toUpperCase(),ks=Object.keys(nd),ck=nd[cls]!=null?cls:ks.length===1?ks[0]:null;
  return ck?{url:"assets/audio/voice/nat/"+id+"-"+ck+".mp3",dur:nd[ck],id}:null;
};

window.__dubDur=function(text){
  const n=natOf(text);if(n)return n.dur;
  const id=__DUB.m?.k?.[__dubH(text)],D=id&&__DUB.m.d[id];if(!D)return 0;
  const L=__dubLang();
  const cls=String(window.__currentSpeaker||window.__heroCls||"").toUpperCase();
  if(D.byClass&&D.byClass[L]&&D.byClass[L][cls])return D.byClass[L][cls];
  return D[L]||D.pt||D.en||0;
};

const ctxOf=()=>{const E=window.__DED_GAME?.audioEngine;const c=E?.ctx;if(c&&c.state==="suspended")try{c.resume()}catch(e){}return c||null};
const getBuf=(url,c)=>{if(BUF.has(url))return BUF.get(url);const p=fetch(url).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,no)=>{const q=c.decodeAudioData(b,ok,no);q&&q.then&&q.then(ok,no)}));BUF.set(url,p);ORD.push(url);if(ORD.length>48)BUF.delete(ORD.shift());p.catch(()=>BUF.delete(url));return p};
const htmlPlay=(url,L,id,onDone)=>{const a=new Audio(url);a.volume=__dubVol();let fin=!1;const F=ok=>{if(fin)return;fin=!0;onDone(ok)};a.onended=()=>F(!0);a.play().catch(()=>F(!1));return a};

__dub=function(text,onEnd){__dubInit();if(__DUB.a){try{__DUB.a.onended=null;__DUB.a.pause()}catch(e){}__DUB.a=null}
 const tok=__DUB.tok,stamp=(__DUB.__s=(__DUB.__s||0)+1);__DUB.cur=text;__DUB.t0=performance.now();
 const go=()=>{if(__DUB.tok!==tok||__DUB.__s!==stamp)return!1;
  const nat=natOf(text);
  const id=nat?nat.id:__DUB.m?.k?.[__dubH(text)];
  const D=nat?{nat:nat.dur}:id&&__DUB.m.d[id];
  let L=nat?"nat":__dubLang();
  if(!nat&&D&&!D[L])L=D.pt?"pt":"en";
  if(!D||!D[L]){__DUB.cur===text&&(__DUB.cur=null);window.__dubOn=!1;__dubDuck(!1);onEnd&&onEnd(!1);return!1}

  const cls=String(window.__currentSpeaker||window.__heroCls||"").toUpperCase();
  let url=nat?nat.url:"assets/audio/voice/"+L+"/"+id+".mp3";
  let dur=D[L];
  if(!nat&&D?.byClass?.[L]?.[cls]){
    url="assets/audio/voice/"+L+"/"+id+"-"+cls+".mp3";
    dur=D.byClass[L][cls];
  }

  const c=ctxOf();__DUB.d=dur;window.__dubOn=!0;__dubDuck(!0);let fin=!1;
  const H={onended:null,_src:null,_t0:0,_dur:dur,_html:null,_text:text,pause(){fin=!0;try{this._src&&(this._src.onended=null,this._src.stop())}catch(e){}try{this._html&&this._html.pause()}catch(e){}},get currentTime(){return this._html?this._html.currentTime:this._t0&&c?Math.max(0,c.currentTime-this._t0):0},get duration(){return this._html?.duration||this._dur}};
  const F=ok=>{if(fin)return;fin=!0;__DUB.cur===text&&(__DUB.cur=null);if(__DUB.a===H){__DUB.a=null;window.__dubOn=!1;__dubDuck(!1)}onEnd&&onEnd(ok)};H.onended=()=>F(!0);__DUB.a=H;
  const fallback=()=>{if(fin||__DUB.a!==H)return;H._html=htmlPlay(url,L,id,ok=>F(ok))};
  if(!c){fallback();return!0}
  getBuf(url,c).then(buf=>{if(fin||__DUB.a!==H)return;const src=c.createBufferSource(),g=c.createGain();src.buffer=buf;g.gain.value=__dubVol();src.connect(g);g.connect(c.destination);src.onended=()=>F(!0);H._src=src;H._dur=buf.duration;H._t0=c.currentTime||1e-3;src.start()}).catch(fallback);
  return!0};
 if(Object.keys(__DUB.m?.k||{}).length&&__DUB.n)return go();
 /* lista ainda carregando: espera um pouco em vez de perder a fala */
 let done=!1;const t=setTimeout(()=>{done||(done=!0,go()||0)},4e3);Promise.all([manP,natP]).then(()=>{if(!done){done=!0;clearTimeout(t);go()}}).catch(()=>{if(!done){done=!0;clearTimeout(t);go()}});return!0};

/* voz e texto juntos: quanto do texto já deveria aparecer (0..1) pelo ponto em que a voz está */
window.__dubProg=function(full){if(!full||__DUB.cur!==full)return null;const H=__DUB.a;if(!H||H._text!==full)return performance.now()-(__DUB.t0||0)<1200?0:null;
 const started=H._html?H._html.currentTime>0:H._t0>0;if(!started)return performance.now()-(__DUB.t0||0)<1200?0:null;const d=H.duration||H._dur||0;if(!d)return null;return Math.min(1,H.currentTime/(d*.86)+.03)};
window.__dubType=function(full,cur,step){const f=window.__dubProg(full);return f==null?Math.min(full.length,cur+step):Math.max(cur,Math.min(full.length,Math.floor(full.length*f)))};

/* baixa e prepara as vozes de uma conversa inteira antes de ela começar */
window.__dubPrefetch=function(list){try{const run=()=>{const c=ctxOf();if(!c)return;for(const t of list||[]){const nt=natOf(t);if(nt){getBuf(nt.url,c).catch(()=>{});continue}const id=__DUB.m?.k?.[__dubH(t)],D=id&&__DUB.m.d[id];if(!D)continue;let L=__dubLang();if(!D[L])L=D.pt?"pt":"en";if(!D[L])continue;getBuf("assets/audio/voice/"+L+"/"+id+".mp3",c).catch(()=>{})}};
 const P=__dubInit();Object.keys(__DUB.m?.k||{}).length&&__DUB.n?run():Promise.resolve(P).then(run)}catch(e){}};
__dubHas=function(t){if(natOf(t))return!0;const id=__DUB.m?.k?.[__dubH(t)];return!!(id&&__DUB.m.d[id])};
window.__dub=__dub;window.__dubHas=__dubHas;window.__dubInit=__dubInit;
})();

/* O idioma da dublagem respeita a configuração do usuário (Português ou Inglês) */
__dubLang=function(){
  try{
    const s=typeof Kt==="function"?Kt():JSON.parse(localStorage.getItem("dungeon-crawler:settings")||"{}");
    const l=s.voiceLang||s.language||"pt";
    return(l==="pt"||l==="pt-BR")?"pt":"en";
  }catch(e){
    return"pt";
  }
};
window.__dubLang=__dubLang;
