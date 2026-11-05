import os
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "source", "hub-village.js")

with open(SRC, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Replace __smith sprite creation
old_smith_create = 's.f=this.add.sprite(A[0],A[1],"vh-smith-forge",0).setOrigin(.5,1).setDepth(A[1]).play("vh-sf");'
new_smith_create = 's.f=this.add.sprite(A[0],A[1]+2,"peasant-1",0).setOrigin(.5,1).setDepth(A[1]).play("peasant-1-idle");'
assert old_smith_create in text, "old_smith_create not found"
text = text.replace(old_smith_create, new_smith_create, 1)
print("1. Smith sprite replaced with peasant-1.")

# 2. Update __smithTick and __smithTalk
old_smith_talk_anim = 's.state==="forge"?s.f.play("vh-sf",!0):s.walking&&s.w.play("vh-si-"+(s.face||"d"),!0)'
new_smith_talk_anim = 's.f.play("peasant-1-idle",!0)'
if old_smith_talk_anim in text:
    text = text.replace(old_smith_talk_anim, new_smith_talk_anim, 1)

old_smith_talk = 'if(s.state==="forge")s.f.play("vh-sfi",!0);else if(s.walking){const f=Math.abs(this.playerX-s.w.x)>Math.abs(this.playerY-s.w.y)?this.playerX<s.w.x?"l":"r":this.playerY<s.w.y?"u":"d";s.w.play("vh-si-"+f,!0)}'
new_smith_talk = 's.f.play("peasant-1-talk",!0);'
assert old_smith_talk in text, "old_smith_talk not found"
text = text.replace(old_smith_talk, new_smith_talk, 1)
print("2. Smith talk animation updated to peasant-1-talk.")

# 3. Replace __herbInit sprite creation
old_herb_create = '/* fora da campanha (modo infinito) ela não está: só o caldeirão fervendo */const on=this.fromForest,s=this.add.sprite(B.boiler[0],B.boiler[1],on?"vh-herb-boil":"vh-herb-caul",0).setOrigin(.5,1).setDepth(B.boiler[1]);const an=on?"vh-herb-a":"vh-herb-c";this.anims.exists(an)&&s.play(an);this.herb={s,x:B.boiler[0],y:B.boiler[1],hi:!on,bt:0,on};'
new_herb_create = 'this.add.sprite(B.boiler[0],B.boiler[1],"vh-herb-caul",0).setOrigin(.5,1).setDepth(B.boiler[1]+1).play("vh-herb-c");const s=this.add.sprite(B.boiler[0]-14,B.boiler[1]+2,"elf-1",0).setOrigin(.5,1).setDepth(B.boiler[1]).play("elf-1-idle");this.herb={s,x:B.boiler[0],y:B.boiler[1],hi:!1,bt:0,on:!0};'
assert old_herb_create in text, "old_herb_create not found"
text = text.replace(old_herb_create, new_herb_create, 1)
print("3. Herbalist sprite replaced with elf-1.")

# 4. Update __herbTick to play elf-1-talk
old_herb_tick_say = 'if(!h.hi&&!this.panel&&Math.hypot(this.playerX-h.x,this.playerY-h.y)<84){h.hi=!0;this.__say(h.x,h.y-70,__L3("Psst! Poções fresquinhas, direto do caldeirão!","Psst! Fresh potions, straight from the cauldron!","¡Psst! ¡Pociones frescas, recién salidas del caldero!"),2600,"#c8f0b0","female")}'
new_herb_tick_say = 'if(!h.hi&&!this.panel&&Math.hypot(this.playerX-h.x,this.playerY-h.y)<84){h.hi=!0;h.s&&h.s.play("elf-1-talk",!0);this.time.delayedCall(2800,()=>h.s&&h.s.play("elf-1-idle",!0));this.__say(h.x,h.y-70,__L3("Psst! Poções fresquinhas, direto do caldeirão!","Psst! Fresh potions, straight from the cauldron!","¡Psst! ¡Pociones frescas, recién salidas del caldero!"),2800,"#c8f0b0","female")}'
assert old_herb_tick_say in text, "old_herb_tick_say not found"
text = text.replace(old_herb_tick_say, new_herb_tick_say, 1)
print("4. Herbalist tick updated with talk anim.")

# 5. Update __herbShop to play elf-1-talk
old_herb_shop_say = 'h&&this.__say(h.x,h.y-70,t[this.__hbN%t.length],2600,"#c8f0b0","female");'
new_herb_shop_say = 'h&&h.s&&h.s.play("elf-1-talk",!0);this.time.delayedCall(3200,()=>h&&h.s&&h.s.play("elf-1-idle",!0));h&&this.__say(h.x,h.y-70,t[this.__hbN%t.length],3200,"#c8f0b0","female");'
assert old_herb_shop_say in text, "old_herb_shop_say not found"
text = text.replace(old_herb_shop_say, new_herb_shop_say, 1)
print("5. Herbalist shop updated with talk anim.")

# Salvar hub-village.js
with open(SRC, "w", encoding="utf-8") as f:
    f.write(text)

print("hub-village.js salvo com sucesso!")

# Executar patch_hub_village.py
print("Executando patch_hub_village.py...")
res = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "patch_hub_village.py")], capture_output=True, text=True)
print("patch_hub_village stdout:", res.stdout)
if res.stderr:
    print("patch_hub_village stderr:", res.stderr)
assert res.returncode == 0, f"patch_hub_village failed with code {res.returncode}"
print("=== APLICAÇÃO FINAL COMPLETA COM SUCESSO! ===")
