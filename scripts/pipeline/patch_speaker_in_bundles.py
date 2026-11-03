import os

bundles = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

target_natof = 'const natOf=text=>{const N=__DUB.n;if(!N||!N.k)return null;const id=N.k[__dubH(text)],nd=id&&N.d[id];if(!nd)return null;const cls=String(window.__heroCls||"").toUpperCase(),ks=Object.keys(nd),ck=nd[cls]!=null?cls:ks.length===1?ks[0]:null;return ck?{url:"assets/audio/voice/nat/"+id+"-"+ck+".mp3",dur:nd[ck],id}:null};'
repl_natof = 'const natOf=text=>{const N=__DUB.n;if(!N||!N.k)return null;const id=N.k[__dubH(text)],nd=id&&N.d[id];if(!nd)return null;const cls=String(window.__currentSpeaker||window.__heroCls||"").toUpperCase(),ks=Object.keys(nd),ck=nd[cls]!=null?cls:ks.length===1?ks[0]:null;return ck?{url:"assets/audio/voice/nat/"+id+"-"+ck+".mp3",dur:nd[ck],id}:null};'

target_show = 'const show=()=>{if(closed||!por?.scene?.sys)return;i++;if(i>=list.length){end();return}const e=list[i],who=e.who;'
repl_show = 'const show=()=>{if(closed||!por?.scene?.sys)return;i++;if(i>=list.length){end();return}const e=list[i],who=e.who;window.__currentSpeaker=(who&&who.startsWith("hero-"))?who.slice(5).toUpperCase():null;'

for b in bundles:
    if not os.path.exists(b): continue
    with open(b, "r", encoding="utf-8") as f:
        content = f.read()
    
    count_natof = content.count(target_natof)
    count_show = content.count(target_show)
    
    if count_natof == 1 and count_show == 1:
        content = content.replace(target_natof, repl_natof)
        content = content.replace(target_show, repl_show)
        with open(b, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[{b}] Successfully patched speaker awareness!")
    else:
        print(f"[{b}] WARNING: counts natof={count_natof}, show={count_show}")
