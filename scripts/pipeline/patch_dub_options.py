import sys

sys.stdout.reconfigure(encoding='utf-8')

targets = [
    'assets/index-D6qIWtA7-p209.js',
    'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
]

for path in targets:
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update zi default voiceLang to "pt"
    target_zi = '/*__DUB__*/language:null,voiceLang:"en",bindings:{}/*§bGFuZ3VhZ2U6bnVsbCxiaW5kaW5nczp7fQ==*//*__DUB__*/'
    repl_zi   = '/*__DUB__*/language:null,voiceLang:"pt",bindings:{}/*§bGFuZ3VhZ2U6bnVsbCxiaW5kaW5nczp7fQ==*//*__DUB__*/'
    assert target_zi in code, f"target_zi not found in {path}"
    code = code.replace(target_zi, repl_zi)

    # 2. Update Kt() to default voiceLang to "pt" if not manually set to english
    target_kt = 'function Kt(){try{const c=localStorage.getItem(Ln);return c?{...zi,...JSON.parse(c)}:{...zi}}catch{return{...zi}}}'
    repl_kt   = 'function Kt(){try{const c=localStorage.getItem(Ln);if(!c)return{...zi};const s={...zi,...JSON.parse(c)};if(!s.voiceLang||(!localStorage.getItem("depthgate_voice_manual")&&s.voiceLang==="en"&&(s.language==="pt"||!s.language)))s.voiceLang="pt";return s}catch{return{...zi}}}'
    assert target_kt in code, f"target_kt not found in {path}"
    code = code.replace(target_kt, repl_kt)

    # 3. Update this.rows in Vn constructor to offer Portuguese, English and Off
    target_rows = '(__voLbl(),{key:"voiceLang",labelKey:"set.voiceLang",type:"choice",options:[["en","English"]]})'
    repl_rows   = '(__voLbl(),{key:"voiceLang",labelKey:"set.voiceLang",type:"choice",options:[["pt","Português"],["en","English"],["off","set.off"]]})'
    assert target_rows in code, f"target_rows not found in {path}"
    code = code.replace(target_rows, repl_rows)

    # 4. Update adjust in Vn to mark manual choice and stop dub on switch
    target_adj = 'else if(t.type==="choice"){const d=(t.options.findIndex(([o])=>o===this.settings[t.key])+i+t.options.length)%t.options.length;this.settings[t.key]=t.options[d][0]}'
    repl_adj   = 'else if(t.type==="choice"){const d=(t.options.findIndex(([o])=>o===this.settings[t.key])+i+t.options.length)%t.options.length;this.settings[t.key]=t.options[d][0];if(t.key==="voiceLang"){try{localStorage.setItem("depthgate_voice_manual","1")}catch(e){}window.__dubStop?.()}}'
    assert target_adj in code, f"target_adj not found in {path}"
    code = code.replace(target_adj, repl_adj)

    # 5. Update __voLbl labels
    target_volbl = 'function __voLbl(){try{Un["set.voiceLang"]="VOZ DA HISTÓRIA";Hn["set.voiceLang"]="STORY VOICE";Po["set.voiceLang"]="VOZ DE LA HISTORIA"}catch(e){}}'
    repl_volbl   = 'function __voLbl(){try{Un["set.voiceLang"]="DUBLAGEM";Hn["set.voiceLang"]="VOICE-OVER";Po["set.voiceLang"]="DOBLAJE";if(typeof __L5!=="undefined"){if(__L5.de)__L5.de["set.voiceLang"]="SYNCHRONISATION";if(__L5.ru)__L5.ru["set.voiceLang"]="ОЗВУЧКА";if(__L5.ja)__L5.ja["set.voiceLang"]="ボイス言語";if(__L5.zh)__L5.zh["set.voiceLang"]="配音语言";if(__L5.ko)__L5.ko["set.voiceLang"]="음성 언어"}}catch(e){}}'
    assert target_volbl in code, f"target_volbl not found in {path}"
    code = code.replace(target_volbl, repl_volbl)

    # 6. Update __dub to respect "off" cleanly without falling back
    target_dub = 'let L=__dubLang();if(D&&!D[L])L=D.pt?"pt":"en";if(!D||!D[L]){window.__dubOn=!1;__dubDuck(!1);onEnd&&onEnd(!1);return!1}'
    repl_dub   = 'let L=__dubLang();if(!L||L==="off"||!D){window.__dubOn=!1;__dubDuck(!1);onEnd&&onEnd(!1);return!1}if(!D[L])L=D.pt?"pt":(D.en?"en":null);if(!L||!D[L]){window.__dubOn=!1;__dubDuck(!1);onEnd&&onEnd(!1);return!1}'
    assert target_dub in code, f"target_dub not found in {path}"
    code = code.replace(target_dub, repl_dub)

    # 7. Update __dubLang #2 at bottom
    target_dublang2 = '/* Dublagem em Português (PT-BR) ativada com as novas vozes neurais da Guardiã, Narrador e Rei */\n__dubLang=function(){try{const s=Kt?.()||{};if(s.voiceLang)return s.voiceLang;const l=s.lang||localStorage.getItem("depthgate_lang")||"pt";return l.startsWith("pt")?"pt":"en"}catch(e){return"pt"}};'
    repl_dublang2   = '/* Dublagem em Português (PT-BR) ativada com opções de dublagem configuráveis */\n__dubLang=function(){try{const s=Kt?.()||{};if(s.voiceLang==="off")return"off";if(s.voiceLang)return s.voiceLang;const l=s.lang||localStorage.getItem("depthgate_lang")||"pt";return l.startsWith("pt")?"pt":"en"}catch(e){return"pt"}};'
    assert target_dublang2 in code, f"target_dublang2 not found in {path}"
    code = code.replace(target_dublang2, repl_dublang2)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

    print(f"Successfully patched {path}")
