"""
Guardiã transformada (final da campanha) + nomes da Ladina.
Aplicar depois de patch_desert.py.
  • Elyndra, a Devoradora de Selos: mais vida, mais dano, mais agressiva
  • Ao ser derrotada volta à forma original e implora pela vida (diálogo + epílogo)
  • Ladino → Ladina
"""
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__guardBeg" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


J = lambda o: json.dumps(o, ensure_ascii=False)

# ── 1) mais difícil ──────────────────────────────────────────────────────
rep('subtitle:"A Guardiã Transformada",texture:"boss-guardian-fallen",scale:.85,',
    'subtitle:"A Guardiã Transformada",texture:"boss-guardian-fallen",scale:.85,'
    'maxHp:125,contactDamage:3,speed:74,attackCooldownMs:1000,xp:900,gold:{min:120,max:200},'
    'attacks:{SLAM:{damage:5,range:72,width:86,telegraphMs:540,recoverMs:400},'
    'CHARGE:{damage:5,speed:450,length:300,durationMs:650,telegraphMs:640,recoverMs:500},'
    'SHOCKWAVE:{damage:4,radius:138,telegraphMs:760,recoverMs:580}},'
    'phase2:{hpRatio:.6,speedMult:1.5,cooldownMult:.5,damageMult:1.45,radiusMult:1.4,chargeSpeedMult:1.3,tint:16729190},')

# ── 2) volta à forma original implorando pela vida ──────────────────────
BEG = [
    ("guardia", "sadness", "ELYNDRA", "Espere… por favor! Não me mate… sou eu, Elyndra."),
    ("guardia", "sadness", "ELYNDRA", "Os selos gritavam dentro de mim. Eu não era eu… eu juro."),
    ("guardia", "sadness", "ELYNDRA", "Eu imploro… deixe-me viver. Deixe-me consertar o que eu fiz."),
    ("rei", "sadness", "AELRIC, REI DE VALDRAK", "Abaixe a arma. A fome se foi — olhe nos olhos dela."),
    ("rei", "calm", "AELRIC, REI DE VALDRAK", "Ninguém mais morre por estes portões. Ela vai vigiá-los comigo… como deveria ter sido."),
    ("guardia", "sadness", "ELYNDRA", "Obrigada… Aelric… eu só queria você de volta."),
]
dlg = ",".join('{who:%s,expr:%s,name:%s,text:%s}' % (J(w), J(e), J(n), J(t)) for w, e, n, t in BEG)
OLD = ('function __guardDefeated(S,done){if(S.__gdOn)return;S.__gdOn=!0;const ui=S.scene.get("UI");S.__finK?.clearTint?.();S.uiOpen=!1;'
       '__dlg(S,[{who:"guardia",expr:"sadness",name:"ELYNDRA",text:"Aelric… eu só queria… você de volta…"},'
       '{who:"rei",expr:"sadness",name:"AELRIC, REI DE VALDRAK",text:"Eu sei, meu amor. Descanse. Eu fico com o que restou da prisão."}],'
       '()=>S.time.delayedCall(400,()=>S.scene.isActive()&&__epilogue(ui,S,"fight",done)))}')
NEW = ('function __guardDefeated(S,done){if(S.__gdOn)return;S.__gdOn=!0;const ui=S.scene.get("UI");S.__finK?.clearTint?.();S.uiOpen=!1;'
       'const G=__guardBeg(S);S.time.delayedCall(G?1900:200,()=>{if(!S.scene.isActive())return;'
       f'__dlg(S,[{dlg}],()=>{{G&&(S.tweens.killTweensOf(G),S.tweens.add({{targets:G,alpha:0,duration:1200}}));'
       'S.time.delayedCall(500,()=>S.scene.isActive()&&__epilogue(ui,S,"fight",done))})})}'
       'function __guardBeg(S){if(!S.textures.exists("guardia-sp-idle"))return null;try{__stAnims(S)}catch(e){}'
       'const P=S.player,x=S.__lastBossX??P.x+60,y=S.__lastBossY??P.y,'
       'G=S.add.sprite(x,y,"guardia-sp-idle",0).setOrigin(.5,124/128).setDepth(y).setScale((P?.displayHeight||28)*1.6/71).setAlpha(0).setTint(16729190);'
       'S.anims.exists("guardia-a-idle")&&G.play("guardia-a-idle");G.setFlipX(P.x<x);'
       'S.effects?.burstTinted?.(x,y-20,16777215,34);S.effects?.shockwaveRing?.(x,y,90);S.cameraSys?.shake?.(.006,320);'
       'const L=S.add.image(x,y-20,"light").setBlendMode(j.BlendModes.ADD).setTint(10479871).setScale(.9).setAlpha(.5).setDepth(y-1);'
       'S.tweens.add({targets:L,alpha:0,duration:2600,onComplete:()=>L.destroy()});'
       'S.tweens.add({targets:G,alpha:1,duration:900});S.time.delayedCall(900,()=>G.active&&G.clearTint());'
       'S.time.delayedCall(1000,()=>G.active&&S.tweens.add({targets:G,x:x+1.5,duration:70,yoyo:!0,repeat:-1}));'
       'S.game.events.emit("ui:banner",__L3("A GUARDIÃ VOLTA À PRÓPRIA FORMA","THE GUARDIAN RETURNS TO HER TRUE FORM","LA GUARDIANA RECUPERA SU FORMA"),"#9fe8ff");'
       'return G}')
rep(OLD, NEW)
rep('GUARDIAN_FALLEN:["Os selos são meus. Séculos de espera… e você acha que pode me negar?","Aelric… eu só queria… você de volta…"]',
    'GUARDIAN_FALLEN:["Os selos são meus. Séculos de espera… e você acha que pode me negar?","Não… espere… por favor…"]')
EP_OLD = ('fight:{title:"A ÚLTIMA SENTINELA",lines:["Elyndra caiu, e com ela a fome dos selos se apagou.",'
          '"Aelric, livre do Observador e da rainha, sentou-se no trono vazio e fechou os portões por dentro.",'
          '"Valdrak voltou a dormir — agora com um rei acordado para vigiá-lo.",'
          '"{H} deixou o castelo ao amanhecer, carregando uma escolha que ninguém mais conheceria.","Mas, nas profundezas, algo sorriu."]}')
EP_LINES = ["Derrotada, Elyndra voltou à própria forma e implorou pela vida — e {H} baixou a arma.",
            "Sem a fome dos selos, ela chorou como quem acorda de um pesadelo de séculos.",
            "Aelric, livre do Observador e da rainha, sentou-se no trono vazio e fechou os portões por dentro, com Elyndra ao seu lado.",
            "{H} deixou o castelo ao amanhecer, carregando uma escolha que ninguém mais conheceria.",
            "Mas, nas profundezas, algo sorriu."]
rep(EP_OLD, 'fight:{title:"A ÚLTIMA SENTINELA",lines:' + J(EP_LINES) + '}')

# traduções (tabela __TR: frase em PT → EN / ES)
TR = {
    "Espere… por favor! Não me mate… sou eu, Elyndra.": ("Wait… please! Don't kill me… it's me, Elyndra.", "Espera… ¡por favor! No me mates… soy yo, Elyndra."),
    "Os selos gritavam dentro de mim. Eu não era eu… eu juro.": ("The seals were screaming inside me. I wasn't myself… I swear.", "Los sellos gritaban dentro de mí. No era yo… lo juro."),
    "Eu imploro… deixe-me viver. Deixe-me consertar o que eu fiz.": ("I beg you… let me live. Let me mend what I have done.", "Te lo suplico… déjame vivir. Déjame reparar lo que hice."),
    "Abaixe a arma. A fome se foi — olhe nos olhos dela.": ("Lower your weapon. The hunger is gone — look into her eyes.", "Baja el arma. El hambre se fue — mírala a los ojos."),
    "Ninguém mais morre por estes portões. Ela vai vigiá-los comigo… como deveria ter sido.": ("No one else dies for these gates. She will watch over them with me… as it should have been.", "Nadie más muere por estas puertas. Ella las vigilará conmigo… como debió ser."),
    "Obrigada… Aelric… eu só queria você de volta.": ("Thank you… Aelric… I only wanted you back.", "Gracias… Aelric… solo quería tenerte de vuelta."),
    "Não… espere… por favor…": ("No… wait… please…", "No… espera… por favor…"),
    EP_LINES[0]: ("Defeated, Elyndra returned to her true form and begged for her life — and {H} lowered the weapon.", "Derrotada, Elyndra volvió a su forma y suplicó por su vida — y {H} bajó el arma."),
    EP_LINES[1]: ("Free of the seals' hunger, she wept like someone waking from a centuries-long nightmare.", "Sin el hambre de los sellos, lloró como quien despierta de una pesadilla de siglos."),
    EP_LINES[2]: ("Aelric, free of the Observer and the queen, sat on the empty throne and shut the gates from within, with Elyndra by his side.", "Aelric, libre del Observador y de la reina, se sentó en el trono vacío y cerró las puertas por dentro, con Elyndra a su lado."),
}
i = s.index("const __TR={en:{")
k = s.index("},es:{", i)
en = "".join(f"{J(pt)}:{J(v[0])}," for pt, v in TR.items())
es = "".join(f"{J(pt)}:{J(v[1])}," for pt, v in TR.items())
s = s[:i] + "const __TR={en:{" + en + s[i + len("const __TR={en:{"):k + 0] + "},es:{" + es + s[k + len("},es:{"):]

# ── 3) Ladina ────────────────────────────────────────────────────────────
rep('ROGUE:{id:"ROGUE",name:"Ladino",', 'ROGUE:{id:"ROGUE",name:"Ladina",')
rep('ROGUE:"LADINO"', 'ROGUE:"LADINA"')
rep('"class.ROGUE":"Pícaro"', '"class.ROGUE":"Pícara"')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — Guardiã (final) + Ladina")
