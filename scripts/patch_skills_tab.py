"""Habilidades como aba do inventário (e fora do menu de pausa).

- O inventário ganha a aba HABILIDADES ao lado de CRÔNICAS: ela fecha o inventário e abre
  o painel de habilidades; ao fechar esse painel, o inventário volta na aba EQUIPAMENTO.
- O item HABILIDADES sai do menu de pausa (Start/Esc).
- O aviso de habilidade nova passa a apontar para o inventário.
Aplicar depois de patch_class_select_panel.py (os dois partem do bundle original).
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
MARK = "__skFromInv"
if MARK in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:80]!r}"
    s = s.replace(old, new)


# 1) aba HABILIDADES no inventário
rep('C.__tabT=__L3(["EQUIPAMENTO","ATRIBUTOS","MISSÃO","CRÔNICAS"],["EQUIPMENT","ATTRIBUTES","MISSION","CHRONICLES"],["EQUIPO","ATRIBUTOS","MISIÓN","CRÓNICAS"]).map((t,k)=>{const x=52+k*86,o=i.add.text(x,34,t,{...F,fontSize:"10px",color:"#a89880"}).setOrigin(0,.5).setInteractive({useHandCursor:!0});o.on("pointerdown",()=>__invTab(C,k));C.root.add(o);return o});',
    'C.__tabT=__L3(["EQUIPAMENTO","ATRIBUTOS","MISSÃO","CRÔNICAS"],["EQUIPMENT","ATTRIBUTES","MISSION","CHRONICLES"],["EQUIPO","ATRIBUTOS","MISIÓN","CRÓNICAS"]).map((t,k)=>{const x=52+k*86,o=i.add.text(x,34,t,{...F,fontSize:"10px",color:"#a89880"}).setOrigin(0,.5).setInteractive({useHandCursor:!0});o.on("pointerdown",()=>__invTab(C,k));C.root.add(o);return o});'
    '{const o=i.add.text(0,34,__L3(["HABILIDADES"],["SKILLS"],["HABILIDADES"])[0],{...F,fontSize:"10px",color:"#a89880"}).setOrigin(0,.5).setInteractive({useHandCursor:!0});'
    'o.on("pointerover",()=>o.setColor("#ffe9a8")),o.on("pointerout",()=>o.setColor("#a89880"));'
    'o.on("pointerdown",()=>{const U=C.ui;C.close?.();U.__skFromInv=!0;U.skillTree?.show()});C.root.add(o);C.__skTab=o}')
rep('{let tx=52;for(const o of C.__tabT)o.setX(tx),tx+=o.width+30}',
    '{let tx=52;for(const o of C.__tabT)o.setX(tx),tx+=o.width+30;C.__skTab?.setX(tx)}')
# 2) fechar o painel de habilidades aberto pela aba devolve o inventário
rep('this.skillTree=new Rd(this),',
    'this.skillTree=new Rd(this),(()=>{const T=this.skillTree,c0=T.close.bind(T);T.close=(...a)=>{const r=c0(...a);'
    'if(this.__skFromInv){this.__skFromInv=!1;this.time.delayedCall(60,()=>{this.inventoryUI&&!this.inventoryUI.open&&(this.inventoryUI.show?this.inventoryUI.show():this.inventoryUI.toggle?.())})}return r}})(),')
# 3) sai do menu de pausa
rep('{label:W("sk.button"),action:()=>{this.close(!0),this.ui.skillTree?.show()}},', '')
# 4) aviso de habilidade nova
rep('"sk.available":"NOVA HABILIDADE DISPONÍVEL — abra HABILIDADES"', '"sk.available":"NOVA HABILIDADE DISPONÍVEL — abra INVENTÁRIO › HABILIDADES"')
rep('"sk.available":"NEW SKILL AVAILABLE — open SKILLS"', '"sk.available":"NEW SKILL AVAILABLE — open INVENTORY › SKILLS"')
rep('"sk.available":"NUEVA HABILIDAD DISPONIBLE — abre HABILIDADES"', '"sk.available":"NUEVA HABILIDAD DISPONIBLE — abre INVENTARIO › HABILIDADES"')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — habilidades no inventário")
