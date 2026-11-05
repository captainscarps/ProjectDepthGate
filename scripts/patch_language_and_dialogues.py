"""
Patch de refinamento do sistema de idiomas, novas falas da Guardiã e reação do herói.
Aplica em:
  - assets/index-D6qIWtA7-p209.js
  - Projeto atualizado/assets/index-D6qIWtA7-p209.js
Re-executável.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

TAG_LANG = "/*__LANG_REFINE__*/"

GINTRO_FIRST_OLD = '{who:"guardia",expr:"calm",name:__GN,text:"Então você atravessou a névoa. Poucos chegam até aqui."}'
GINTRO_FIRST_NEW = '{who:"guardia",expr:"calm",name:__GN,text:"Então você atravessou a névoa. Poucos chegam até aqui.",onShow:()=>{window.__hasGuardianMagic=!1;}}'

GINTRO_TARGET = (
    '{who:"guardia",expr:"calm",name:__GN,text:"Dentro dos selos não existe tempo. '
    'Quem atravessa um portal pode ter nascido séculos antes ou depois de você… e todos chegam a este mesmo lago."}'
)

GINTRO_INJECTION = (
    TAG_LANG + "\n"
    '{who:"hero",expr:"talk",text:"Como você sabe tudo isso? Quem é você?"},\n'
    '{who:"guardia",expr:"special",name:__GN,text:"Cada um de vocês veio de terras e eras distintas, falando línguas que os outros não compreendiam. Que a bênção dos selos una nossas vozes e espíritos.",'
    'onShow:()=>{try{window.__hasGuardianMagic=!0;localStorage.setItem("depthgate:guardian_magic","1");'
    'if(window.__DED_GAME){const S=window.__DED_GAME.scene.getScene("Game");'
    'S?.cameras?.main?.flash?.(600,100,200,255);'
    'S?.effects?.burstTinted?.(S.player?.x||0,(S.player?.y||0)-16,0x38bdf8,24);'
    'S?.audio?.play?.("sfx-boss-victory")||S?.audioEngine?.sfx?.("sfx-boss-victory");}}catch(e){}}},'
    '{who:"hero",expr:"surprise",text:"Nossa, estou falando e entendendo uma língua diferente, que mágica é essa?"},'
    '{who:"guardia",expr:"smile",name:__GN,text:"É a comunhão dos DepthGates. Agora nossas mentes se tocam, e qualquer viajante que você encontrar entenderá as suas palavras."},\n'
    + TAG_LANG
)

DLG_OLD = 'const e=list[i],who=e.who;window.__currentSpeaker=(who&&who.startsWith("hero-"))?who.slice(5).toUpperCase():null;'
DLG_NEW = (
    'const e=list[i];let who=e.who;'
    'if(who==="hero"){'
    'const cId=String(S?.classDef?.id||window.__heroCls||"WARRIOR").toUpperCase();'
    'who="hero-"+cId.toLowerCase();'
    'window.__currentSpeaker=cId;'
    'if(!e.name)e.name=(typeof __HN!=="undefined"&&__HN[cId])?__HN[cId].toUpperCase():(S?.classDef?.name||"HERÓI").toUpperCase();'
    '}else{'
    'window.__currentSpeaker=(who&&who.startsWith("hero-"))?who.slice(5).toUpperCase():null;'
    '}'
)

TR_EN_INJECTION = (
    '"Explore com cuidado, herói. Não se preocupe, se acontecer algo, eu abro um portal e te trago de volta pro Refúgio.":'
    '"Explore carefully, hero. Don\'t worry, if anything happens, I\'ll open a portal and bring you back to the Refuge.",'
    '"Cada um de vocês veio de terras e eras distintas, falando línguas que os outros não compreendiam. Que a bênção dos selos una nossas vozes e espíritos.":'
    '"Each of you came from distinct lands and eras, speaking tongues others could not understand. May the blessing of the seals unite our voices and spirits.",'
    '"Nossa, estou falando e entendendo uma língua diferente, que mágica é essa?":'
    '"Wow, I\'m speaking and understanding a different language, what kind of magic is this?",'
    '"É a comunhão dos DepthGates. Agora nossas mentes se tocam, e qualquer viajante que você encontrar entenderá as suas palavras.":'
    '"It is the communion of the DepthGates. Now our minds touch, and any traveler you meet will understand your words.",'
)

TR_ES_INJECTION = (
    '"Explore com cuidado, herói. Não se preocupe, se acontecer algo, eu abro um portal e te trago de volta pro Refúgio.":'
    '"Explora con cuidado, héroe. No te preocupes, si sucede algo, abriré un portal y te traeré de vuelta al Refugio.",'
    '"Cada um de vocês veio de terras e eras distintas, falando línguas que os outros não compreendiam. Que a bênção dos selos una nossas vozes e espíritos.":'
    '"Cada uno de ustedes vino de tierras y eras distintas, hablando lenguas que los demás no comprendían. Que la bendición de los sellos una nuestras voces y espíritus.",'
    '"Nossa, estou falando e entendendo uma língua diferente, que mágica é essa?":'
    '"Vaya, estoy hablando y entendiendo un idioma diferente, ¿qué clase de magia es esta?",'
    '"É a comunhão dos DepthGates. Agora nossas mentes se tocam, e qualquer viajante que você encontrar entenderá as suas palavras.":'
    '"Es la comunión de los DepthGates. Ahora nuestras mentes se tocan, y cualquier viajero que encuentres entenderá tus palabras.",'
)

def patch_file(p):
    if not os.path.exists(p):
        print(f"Skipping {p} (does not exist)")
        return
    s = open(p, "r", encoding="utf-8").read()

    # Limpar injeção anterior se houver
    while TAG_LANG in s:
        a = s.index(TAG_LANG)
        b = s.index(TAG_LANG, a + 1) + len(TAG_LANG)
        s = s[:a] + s[b:]

    # 0. Reset de __hasGuardianMagic na primeira fala de __GINTRO
    if GINTRO_FIRST_OLD in s and "window.__hasGuardianMagic=!1" not in s:
        s = s.replace(GINTRO_FIRST_OLD, GINTRO_FIRST_NEW, 1)
        print(f"[{p}] __GINTRO first line patched with magic reset")

    # 1. Injetar novas falas em __GINTRO
    if GINTRO_TARGET in s:
        s = s.replace(GINTRO_TARGET, GINTRO_TARGET + ",\n" + GINTRO_INJECTION)
        print(f"[{p}] __GINTRO patched")
    else:
        print(f"[{p}] WARNING: GINTRO_TARGET not found")

    # 2. Patch em __dlg para suporte ao herói
    if DLG_OLD in s:
        s = s.replace(DLG_OLD, DLG_NEW)
        print(f"[{p}] __dlg patched")
    elif DLG_NEW in s:
        print(f"[{p}] __dlg already patched")
    else:
        print(f"[{p}] WARNING: DLG_OLD not found")

    # 3. Patch nas traduções __TR.en e __TR.es
    anchor_en = 'const __TR={en:{'
    if anchor_en in s and '"Explore carefully, hero.' not in s:
        s = s.replace(anchor_en, anchor_en + TR_EN_INJECTION)
        print(f"[{p}] __TR.en patched")
    else:
        print(f"[{p}] __TR.en already contains strings or anchor missing")

    anchor_es = ',es:{'
    if anchor_es in s and '"Vaya, estoy hablando' not in s:
        s = s.replace(anchor_es, anchor_es + TR_ES_INJECTION)
        print(f"[{p}] __TR.es patched")
    else:
        print(f"[{p}] __TR.es already contains strings or anchor missing")

    open(p, "w", encoding="utf-8").write(s)
    print(f"[{p}] File saved successfully.")

for f in FILES:
    patch_file(f)
