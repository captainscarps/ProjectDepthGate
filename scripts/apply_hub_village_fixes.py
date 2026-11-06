import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(ROOT, 'scripts', 'source', 'hub-village.js')
s = open(path, 'r', encoding='utf-8').read()

# 1. Preload brazier
s1_old = 'this.textures.exists("dorf-portal-arch")||this.load.image("dorf-portal-arch","assets/pixel-art/deepcave/dorf-portal-arch.png");'
s1_new = s1_old + 'this.textures.exists("dorf-brazier")||this.load.spritesheet("dorf-brazier","assets/pixel-art/deepcave/dorf-brazier.png",{frameWidth:32,frameHeight:32});'
assert s1_old in s, 's1_old not found'
s = s.replace(s1_old, s1_new, 1)

# 2. Brazier anim
s2_old = 'this.textures.exists("elf-1")&&(mk("elf-1-idle","elf-1",0,5,6),mk("elf-1-talk","elf-1",48,54,7));'
s2_new = s2_old + 'this.textures.exists("dorf-brazier")&&mk("dorf-brazier-a","dorf-brazier",0,5,8,-1);'
assert s2_old in s, 's2_old not found'
s = s.replace(s2_old, s2_new, 1)

# 3. Portal arch & braziers
s3_old = '/* portal */\nthis.add.image(S.portal[0],S.portal[1]-4,"dorf-portal-arch").setOrigin(.5,1).setDepth(S.portal[1]-.2);const po=this.add.sprite(S.portal[0],S.portal[1]-44,"hub-portal",0).setOrigin(.5,.5).setDepth(S.portal[1]).setScale(.85).setTint(3718648);po.play("hub-portal-a");const po2=this.add.sprite(S.portal[0],S.portal[1]-44,"hub-portal",0).setOrigin(.5,.5).setDepth(S.portal[1]+.1).setScale(.85).setTint(9684477).setBlendMode(ADD).setAlpha(.35);po2.play("hub-portal-a");this.tweens.add({targets:po2,alpha:.75,duration:1200,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});this.__glow(S.portal[0],S.portal[1]-44,.85,3718648,.45,1100);'
s3_new = '/* portal */\nthis.add.image(S.portal[0],S.portal[1]-4,"dorf-portal-arch").setOrigin(.5,1).setDepth(S.portal[1]-.2);const po=this.add.sprite(S.portal[0],S.portal[1]-42,"hub-portal",0).setOrigin(.5,.5).setDepth(S.portal[1]-.1).setScale(.62).setTint(3718648);po.play("hub-portal-a");const po2=this.add.sprite(S.portal[0],S.portal[1]-42,"hub-portal",0).setOrigin(.5,.5).setDepth(S.portal[1]-.05).setScale(.62).setTint(9684477).setBlendMode(ADD).setAlpha(.35);po2.play("hub-portal-a");this.tweens.add({targets:po2,alpha:.75,duration:1200,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});this.add.sprite(S.portal[0]-42,S.portal[1]-6,"dorf-brazier",0).setOrigin(.5,1).setDepth(S.portal[1]).play("dorf-brazier-a");this.add.sprite(S.portal[0]+42,S.portal[1]-6,"dorf-brazier",0).setOrigin(.5,1).setDepth(S.portal[1]).play("dorf-brazier-a");this.__glow(S.portal[0]-42,S.portal[1]-22,.35,3718648,.4,900);this.__glow(S.portal[0]+42,S.portal[1]-22,.35,3718648,.4,900);this.__glow(S.portal[0],S.portal[1]-42,.75,3718648,.45,1100);'
assert s3_old in s, 's3_old not found'
s = s.replace(s3_old, s3_new, 1)

# 4. Portal sign label Y
s4_old = 'lab(S.portal[0],S.portal[1]-138,L3("CAVERNAS DA MONTANHA DORF","DORF MOUNTAIN CAVES","CAVERNAS DE LA MONTAÑA DORF"),"#38bdf8");'
s4_new = 'lab(S.portal[0],S.portal[1]-108,L3("CAVERNAS DA MONTANHA DORF","DORF MOUNTAIN CAVES","CAVERNAS DE LA MONTAÑA DORF"),"#38bdf8");'
assert s4_old in s, 's4_old not found'
s = s.replace(s4_old, s4_new, 1)

# 5. Smith scale inside and outside
s5_old = 'sm&&[sm.f,sm.a,sm.w].forEach(o=>o?.setScale(a==="in"?.82:1))'
s5_new = 'sm&&[sm.f,sm.a,sm.w].forEach(o=>o?.setScale(a==="in"?.65:.45))'
assert s5_old in s, 's5_old not found'
s = s.replace(s5_old, s5_new, 1)

# 6. Interaction spot for cave_npc
s6_old = 'add({id:"cave_npc",x:S.portal[0]-28,y:S.portal[1]+10,ay:S.portal[1]+22,r:36,tap:30,label:L3("EXPLORADOR","EXPLORER","EXPLORADOR"),desc:L3("Conversar","Talk","Hablar"),act:()=>this.__talkCaveNpc(()=>this.__enterDorfCave())});'
s6_new = 'add({id:"cave_npc",x:S.portal[0]-62,y:S.portal[1]+2,ay:S.portal[1]+16,r:36,tap:30,label:L3("EXPLORADOR","EXPLORER","EXPLORADOR"),desc:L3("Conversar","Talk","Hablar"),act:()=>this.__talkCaveNpc(()=>this.__enterDorfCave())});'
assert s6_old in s, 's6_old not found'
s = s.replace(s6_old, s6_new, 1)

# 7. Cave explorer sprite & scale
s7_old = 'const cx=p[0]-28,cy=p[1]+10;\n  this.caveExplorer=this.add.sprite(cx,cy,"peasant-3",0).setOrigin(.5,1).setDepth(cy).play("peasant-3-idle");'
s7_new = 'const cx=p[0]-62,cy=p[1]+2;\n  this.caveExplorer=this.add.sprite(cx,cy,"peasant-3",0).setOrigin(.5,1).setScale(.45).setDepth(cy).play("peasant-3-idle");'
assert s7_old in s, 's7_old not found'
s = s.replace(s7_old, s7_new, 1)

# 8. Talk cave NPC bubble position
s8_old = 'const sx=s?s.x:(this.M.spots.portal[0]-28),sy=s?(s.y-44):(this.M.spots.portal[1]-34);'
s8_new = 'const sx=s?s.x:(this.M.spots.portal[0]-62),sy=s?(s.y-38):(this.M.spots.portal[1]-38);'
assert s8_old in s, 's8_old not found'
s = s.replace(s8_old, s8_new, 1)

# 9. Smith sprite init scale
s9_old = 's.f=this.add.sprite(A[0],A[1]+2,"peasant-1",0).setOrigin(.5,1).setDepth(A[1]).play("peasant-1-idle");'
s9_new = 's.f=this.add.sprite(A[0],A[1]+2,"peasant-1",0).setOrigin(.5,1).setScale(.65).setDepth(A[1]).play("peasant-1-idle");'
assert s9_old in s, 's9_old not found'
s = s.replace(s9_old, s9_new, 1)

# 10. Smith talk bubble Y
s10_old = 'this.__say(s.x,s.y-30,'
s10_new = 'this.__say(s.x,s.y-38,'
assert s10_old in s, 's10_old not found'
s = s.replace(s10_old, s10_new, 1)

# 11. Herbalist sprite scale
s11_old = 'const s=this.add.sprite(B.boiler[0]-14,B.boiler[1]+2,"elf-1",0).setOrigin(.5,1).setDepth(B.boiler[1]).play("elf-1-idle");'
s11_new = 'const s=this.add.sprite(B.boiler[0]-14,B.boiler[1]+2,"elf-1",0).setOrigin(.5,1).setScale(.44).setDepth(B.boiler[1]).play("elf-1-idle");'
assert s11_old in s, 's11_old not found'
s = s.replace(s11_old, s11_new, 1)

# 12. Herbalist bubbles Y
s12_old = 'this.__say(h.x,h.y-70,'
s12_new = 'this.__say(h.x,h.y-38,'
assert s.count(s12_old) == 2, f'Expected 2 occurrences of s12_old, found {s.count(s12_old)}'
s = s.replace(s12_old, s12_new)

open(path, 'w', encoding='utf-8').write(s)
print('Successfully patched scripts/source/hub-village.js')
