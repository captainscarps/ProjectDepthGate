for path in ['assets/index-D6qIWtA7-p209.js', 'Projeto atualizado/assets/index-D6qIWtA7-p209.js']:
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    target = '/* por enquanto a dublagem é só em inglês (o português volta quando as vozes brasileiras estiverem aprovadas) */\n__dubLang=function(){return"en"};'
    replacement = '/* Dublagem em Português (PT-BR) ativada com as novas vozes neurais da Guardiã, Narrador e Rei */\n__dubLang=function(){try{const s=Kt?.()||{};if(s.voiceLang)return s.voiceLang;const l=s.lang||localStorage.getItem("depthgate_lang")||"pt";return l.startsWith("pt")?"pt":"en"}catch(e){return"pt"}};'
    
    if target in code:
        code = code.replace(target, replacement)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(code)
        print('Updated', path)
    else:
        print('Target not found in', path)
