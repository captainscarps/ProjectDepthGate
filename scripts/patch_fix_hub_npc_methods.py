import os
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "source", "hub-village.js")

with open(SRC, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Adicionar animações dos NPCs em __anims()
anims_target = 'A.exists("hub-portal-a")||A.create({key:"hub-portal-a",frames:A.generateFrameNumbers("hub-portal",{start:0,end:13}),frameRate:10,repeat:-1})'
assert anims_target in text, "anims_target not found"

npc_anims = (
    'this.textures.exists("peasant-1")&&(mk("peasant-1-idle","peasant-1",0,11,6),mk("peasant-1-talk","peasant-1",48,58,7));'
    'this.textures.exists("peasant-3")&&(mk("peasant-3-idle","peasant-3",0,6,6),mk("peasant-3-talk","peasant-3",32,40,7));'
    'this.textures.exists("elf-1")&&(mk("elf-1-idle","elf-1",0,5,6),mk("elf-1-talk","elf-1",48,54,7));'
    + anims_target
)
text = text.replace(anims_target, npc_anims, 1)

# 2. Adicionar __caveExplorerInit, __talkCaveNpc e __enterDorfCave
steam_target = '__steam(x,y){for(let i=0;i<6;i++){const p=this.add.image(x+j.Math.Between(-8,8),y,"light").setScale(.05).setTint(13421772).setAlpha(.35).setDepth(9400);this.tweens.add({targets:p,y:y-24-Math.random()*14,scale:.12,alpha:0,delay:i*90,duration:900,onComplete:()=>p.destroy()})}}'
assert steam_target in text, "steam_target not found"

new_methods = (
    steam_target + "\n"
    '/* explorador da caverna Dorf */\n'
    '__caveExplorerInit(){\n'
    '  const p=this.M?.spots?.portal;\n'
    '  if(!p||!this.textures.exists("peasant-3"))return;\n'
    '  const cx=p[0]-28,cy=p[1]+10;\n'
    '  this.caveExplorer=this.add.sprite(cx,cy,"peasant-3",0).setOrigin(.5,1).setDepth(cy).play("peasant-3-idle");\n'
    '}\n'
    '__talkCaveNpc(onComplete){\n'
    '  const s=this.caveExplorer,L3=__L3;\n'
    '  s&&s.active&&s.play("peasant-3-talk",!0);\n'
    '  const line=L3(\n'
    '    "Essa caverna é traiçoeira, ela sempre muda a cada entrada, explore com cuidado.",\n'
    '    "This cave is treacherous, it always changes with every entrance, explore with caution.",\n'
    '    "Esta caverna es traicionera, cambia con cada entrada, explora con cuidado."\n'
    '  );\n'
    '  let dur=4600;\n'
    '  try{\n'
    '    const vd=window.__dubDur?.(line);\n'
    '    if(vd&&isFinite(vd))dur=Math.max(dur,Math.round(vd*1000+700));\n'
    '  }catch(_) {}\n'
    '  const sx=s?s.x:(this.M.spots.portal[0]-28),sy=s?(s.y-44):(this.M.spots.portal[1]-34);\n'
    '  this.__say(sx,sy,line,dur,"#fef08a","male");\n'
    '  if(onComplete){\n'
    '    this.__busy=!0;\n'
    '    this.time.delayedCall(dur,()=>{\n'
    '      this.__busy=!1;\n'
    '      s&&s.active&&s.play("peasant-3-idle",!0);\n'
    '      onComplete();\n'
    '    });\n'
    '  }else{\n'
    '    this.time.delayedCall(dur,()=>{\n'
    '      s&&s.active&&s.play("peasant-3-idle",!0);\n'
    '    });\n'
    '  }\n'
    '}\n'
    '__enterDorfCave(){\n'
    '  if(this.__busy)return;\n'
    '  this.__busy=!0;\n'
    '  this.game.audioEngine?.stinger?.("portal")||this.game.audioEngine?.sfx?.("portal");\n'
    '  const isCamp=!!this.fromForest,sl=isCamp?(this.retSlot||1):(this.game.registry.get("save:slot")||1);\n'
    '  let rData=null;\n'
    '  if(isCamp){try{const cr=Dn(sl);if(cr?.ok)rData=cr.data}catch(e){}}\n'
    '  const cam=this.cameras.main;\n'
    '  cam.fadeOut(400,0,0,0);\n'
    '  cam.once("camerafadeoutcomplete",()=>{\n'
    '    this.scene.stop("HubUI");\n'
    '    this.scene.start("Game",{\n'
    '      isDorfCave:!0,\n'
    '      originMode:isCamp?"campaign":"endless",\n'
    '      endless:!isCamp,\n'
    '      depth:1,\n'
    '      slot:sl,\n'
    '      classId:this.classDef?.id||"WARRIOR",\n'
    '      restore:rData\n'
    '    });\n'
    '  });\n'
    '}\n'
)
text = text.replace(steam_target, new_methods, 1)

with open(SRC, "w", encoding="utf-8") as f:
    f.write(text)

print("hub-village.js atualizado com os métodos do explorador e caverna Dorf.")

# Executar patch_hub_village.py
res = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "patch_hub_village.py")], capture_output=True, text=True)
print("patch_hub_village stdout:", res.stdout)
if res.stderr:
    print("patch_hub_village stderr:", res.stderr)
assert res.returncode == 0, f"patch_hub_village failed with code {res.returncode}"
print("=== SUCESSO! ===")
