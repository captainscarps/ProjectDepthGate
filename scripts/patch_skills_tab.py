"""Inventário: aba HABILIDADES dentro da janela + rolagem em Atributos, Missão e Crônicas.

- HABILIDADES vira a 5ª aba do inventário: o painel de habilidades é desenhado dentro da
  janela do inventário (sem moldura, fundo nem título próprios). Abrir habilidades por
  qualquer outro caminho (tecla, botão do HUD) abre o inventário já nessa aba.
- O item HABILIDADES sai do menu de pausa; o aviso de habilidade nova aponta para o inventário.
- Atributos, Missão e Crônicas: o texto rola (roda do mouse, arrastar, barra lateral,
  ↑/↓ e W/S) e mostra uma barra de rolagem quando não cabe. Crônicas lista todas as entradas.
Aplicar depois de patch_class_select_panel.py (os dois partem do bundle original).
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__invSkills" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


# ---------------------------------------------------------------- 5ª aba
rep('C.__tabT=__L3(["EQUIPAMENTO","ATRIBUTOS","MISSÃO","CRÔNICAS"],["EQUIPMENT","ATTRIBUTES","MISSION","CHRONICLES"],["EQUIPO","ATRIBUTOS","MISIÓN","CRÓNICAS"])',
    'C.__tabT=__L3(["EQUIPAMENTO","ATRIBUTOS","MISSÃO","CRÔNICAS","HABILIDADES"],["EQUIPMENT","ATTRIBUTES","MISSION","CHRONICLES","SKILLS"],["EQUIPO","ATRIBUTOS","MISIÓN","CRÓNICAS","HABILIDADES"])')
rep('function __invTab(C,k){C.__tab=(k+4)%4;C.__chOff=0;C.__chBg?.setVisible(C.__tab===3);C.__big?.setWordWrapWidth(C.__tab===3?530:220);',
    'function __invTab(C,k){C.__tab=(k+5)%5;C.__chOff=0;C.__sy=0;C.__chBg?.setVisible(C.__tab>=3);C.__big?.setWordWrapWidth(C.__tab===3?526:192);__invSkills(C,C.__tab===4);')
rep('C.__big.setVisible(!eq);C.refresh()}function __invBig(C){',
    'C.__big.setVisible(!eq&&C.__tab!==4);C.refresh();__invScroll(C)}'
    # --- habilidades dentro da janela do inventário
    'function __invSkills(C,on){const T=C.ui.skillTree;if(!T)return;'
    'if(on){T.built||T.build();const R=T.root;'
    'if(!T.__embList){T.__embList=[R.list[0],T.panelG,T.title,...R.list.filter(o=>o.type==="Text"&&o.text==="✕")];T.__sk&&T.__embList.push(R.list[1],R.list[2])}'
    'T.__emb=!0;T.open=!0;T.sel=0;T.buildNodes();for(const o of T.__embList)o?.setVisible(!1);T.lvlText.setY(52);R.setVisible(!0);T.refresh();C.ui.game.events.emit("skills:seen")}'
    'else if(T.__emb){T.__emb=!1;T.open=!1;T.root.setVisible(!1);for(const o of T.__embList)o?.setVisible(!0);T.lvlText.setY(44)}}'
    # --- rolagem do texto das abas Atributos / Missão / Crônicas
    'function __invView(C){const w=C.__tab===3;return{top:w?58:62,bot:330,bx:w?598:248}}'
    'function __invScroll(C){const B=C.__big;if(!B)return;const G=C.__sbG;G&&G.clear();'
    'const on=C.open!==!1&&B.visible&&C.__tab>=1&&C.__tab<=3;C.__sbZ?.setVisible(on);C.__dragZ?.setVisible(on);'
    'if(!on){B.setCrop&&B.setCrop();return}const V=__invView(C),vh=V.bot-V.top,ch=B.height,mx=Math.max(0,ch-vh);'
    'C.__sy=Math.max(0,Math.min(mx,C.__sy||0));C.__syMax=mx;const sy=Math.round(C.__sy);'
    # Text em resolução 2: o recorte é em pixels da textura, e o Phaser 4 desloca o pedaço
    # recortado por esse mesmo valor sem dividir pela resolução -> compensa na posição
    'const k=B.style?.resolution||1;B.setCrop(0,sy*k,(B.width+4)*k,vh*k);B.setY(V.top-sy*k);'
    'if(!G||mx<=0){C.__sbZ?.setVisible(!1);return}'
    'const th=Math.max(18,vh*vh/ch),ty=V.top+(vh-th)*(sy/mx);'
    'G.fillStyle(2761240,.9).fillRoundedRect(V.bx,V.top,4,vh,2).fillStyle(13214282,.95).fillRoundedRect(V.bx-1,ty,6,th,3);'
    'C.__sbZ.setPosition(V.bx-6,V.top).setSize(16,vh);C.__sbZ.input&&(C.__sbZ.input.hitArea.setSize(16,vh));'
    'const dw=C.__tab===3?540:200;C.__dragZ.setPosition(44,V.top).setSize(dw,vh);C.__dragZ.input&&(C.__dragZ.input.hitArea.setSize(dw,vh))}'
    'function __invScrollSetup(C){const i=C.ui;C.__sbG=i.add.graphics();C.root.add(C.__sbG);'
    'C.__dragZ=i.add.zone(44,60,200,260).setOrigin(0).setInteractive();C.root.add(C.__dragZ);'
    'C.__sbZ=i.add.zone(0,0,16,100).setOrigin(0).setInteractive({useHandCursor:!0});C.root.add(C.__sbZ);'
    'const toThumb=p=>{const V=__invView(C),vh=V.bot-V.top;C.__sy=(p.worldY-V.top)/vh*((C.__syMax||0)+vh)-vh/2;__invScroll(C)};'
    'C.__sbZ.on("pointerdown",p=>{C.__sbDrag=!0;toThumb(p)});'
    'C.__dragZ.on("pointerdown",p=>{C.__dragY=p.worldY});'
    'i.input.on("pointermove",p=>{if(!C.open||!p.isDown)return;if(C.__sbDrag){toThumb(p);return}if(C.__dragY!=null){C.__sy=(C.__sy||0)-(p.worldY-C.__dragY);C.__dragY=p.worldY;__invScroll(C)}});'
    'i.input.on("pointerup",()=>{C.__sbDrag=!1;C.__dragY=null});'
    'i.input.on("wheel",(p,g,dx,dy)=>{if(C.open&&C.__tab>=1&&C.__tab<=3){C.__sy=(C.__sy||0)+dy*.4;__invScroll(C)}})}'
    'function __invBig(C){__invBig0(C);__invScroll(C)}'
    'function __invBig0(C){')
# Crônicas: todas as entradas (a rolagem cuida do resto)
rep('const off=Math.min(C.__chOff||0,Math.max(0,L.length-1));const out=[];for(const e of L.slice(off,off+5))out.push("◆ "+__TC(e.title).toUpperCase(),__T(e.text),"");out.push(`(${off+1}–${Math.min(L.length,off+5)} ${__L3("de","of","de")} ${L.length})   ↑ ↓ ${__L3("para rolar","to scroll","para desplazar")}`);C.__big.setText(out.join("\\n"));return}',
    'const out=[];for(const e of L)out.push("◆ "+__TC(e.title).toUpperCase(),__T(e.text),"");C.__big.setText(out.join("\\n").trimEnd());return}')
# cria a barra junto com a tela de abas
rep('C.closeBtn&&C.root.bringToTop(C.closeBtn);__invTab(C,0)}',
    'C.closeBtn&&C.root.bringToTop(C.closeBtn);__invScrollSetup(C);__invTab(C,0)}')
# teclas: ↑/↓ rolam quando o texto não cabe (Crônicas sempre)
rep('if(this.__sk&&this.__tab===3&&(i==="ArrowUp"||i==="ArrowDown"||i==="w"||i==="s")){this.__chOff=Math.max(0,(this.__chOff||0)+(i==="ArrowUp"||i==="w"?-1:1));__invBig(this);return!0}',
    'if(this.__sk&&this.__tab>=1&&this.__tab<=3&&(this.__tab===3||(this.__syMax||0)>0)&&(i==="ArrowUp"||i==="ArrowDown"||i==="w"||i==="s")){this.__sy=(this.__sy||0)+(i==="ArrowUp"||i==="w"?-28:28);__invScroll(this);return!0}')

# ---------------------------------------------------------------- ligação painel de habilidades <-> inventário
rep('this.skillTree=new Rd(this),',
    'this.skillTree=new Rd(this),(()=>{const T=this.skillTree,I=this.inventoryUI;'
    'const tc=T.close.bind(T),ts=T.show.bind(T),ic=I.close.bind(I);'
    # fechar habilidades (Esc, ✕, tecla) quando está dentro do inventário fecha o inventário
    'T.close=()=>{if(T.__emb){I.close();return}tc()};'
    # abrir habilidades por qualquer caminho abre o inventário na aba HABILIDADES
    'T.show=()=>{const g=T.gs();if(!g||g.state!=="playing")return;I.open||I.show();if(!I.__tabT)return ts();__invTab(I,4)};'
    'I.close=()=>{I.__tabT&&__invSkills(I,!1);ic()};'
    # reabrir o inventário redesenha a aba em que ele estava
    'const is=I.show.bind(I);I.show=(...a)=>{is(...a);I.__tabT&&__invTab(I,I.__tab||0)}})(),')

# ---------------------------------------------------------------- menu de pausa e aviso
rep('{label:W("sk.button"),action:()=>{this.close(!0),this.ui.skillTree?.show()}},', '')
rep('"sk.available":"NOVA HABILIDADE DISPONÍVEL — abra HABILIDADES"', '"sk.available":"NOVA HABILIDADE DISPONÍVEL — abra INVENTÁRIO › HABILIDADES"')
rep('"sk.available":"NEW SKILL AVAILABLE — open SKILLS"', '"sk.available":"NEW SKILL AVAILABLE — open INVENTORY › SKILLS"')
rep('"sk.available":"NUEVA HABILIDAD DISPONIBLE — abre HABILIDADES"', '"sk.available":"NUEVA HABILIDAD DISPONIBLE — abre INVENTARIO › HABILIDADES"')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — habilidades na aba do inventário + rolagem")
