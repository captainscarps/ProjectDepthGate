import os
import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HUB_JS = os.path.join(ROOT, "scripts", "source", "hub-village.js")
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR_BUNDLE = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")

print("=== STEP 1: Updating scripts/source/hub-village.js ===")
with open(HUB_JS, 'r', encoding='utf-8') as f:
    hub_code = f.read()

# 1.1 Update rack spot interaction to open __forgeWeaponsShop()
old_rack = '''ins({id:"rack",x:I.spots.rack[0],y:I.spots.rack[1],ay:I.spots.rack[1]-12,r:30,label:L3("ARMAS","WEAPONS","ARMAS"),desc:L3("Admirar o trabalho","Admire the work","Admirar el trabajo"),act:()=>this.__say(I.spots.rack[0],I.spots.rack[1]-40,L3("Lâminas equilibradas. Nenhuma está à venda… ainda.","Well-balanced blades. None for sale… yet.","Hojas equilibradas. Ninguna a la venta… aún."))});'''
new_rack = '''ins({id:"rack",x:I.spots.rack[0],y:I.spots.rack[1],ay:I.spots.rack[1]-12,r:30,label:L3("ARMAS ÚNICAS","UNIQUE WEAPONS","ARMAS ÚNICAS"),desc:L3("Armaria do Ferreiro (Ouro)","Blacksmith Armory (Gold)","Armería del Herrero (Oro)"),act:()=>this.__forgeWeaponsShop()});'''

if old_rack in hub_code:
    hub_code = hub_code.replace(old_rack, new_rack, 1)
    print("✓ Updated rack interaction to __forgeWeaponsShop()")
elif new_rack in hub_code:
    print("✓ rack interaction already updated")
else:
    print("! Warning: old_rack pattern not found verbatim")

# 1.2 Update __smithTalk to also provide direct access to __forgeWeaponsShop()
old_smith_call = 'this.time.delayedCall(350,()=>{this.openBlacksmith();this.__resumeSmith=!0})'
new_smith_call = 'this.time.delayedCall(350,()=>{this.__forgeWeaponsShop();this.__resumeSmith=!0})'

if old_smith_call in hub_code:
    hub_code = hub_code.replace(old_smith_call, new_smith_call, 1)
    print("✓ Updated __smithTalk to open __forgeWeaponsShop()")
elif new_smith_call in hub_code:
    print("✓ __smithTalk already updated")

# 1.3 Add __forgeWeaponsShop() implementation to hub-village.js
shop_method = '''
/* ── ARMARIA DO FERREIRO: Armas Únicas compráveis com ouro ── */
__forgeWeaponsShop(){
  if(this.panel||this.__busy)return;
  const L3=__L3,d=_/2,Y=12,HH=336;
  const o=this.add.container(this.__ox,this.__oy).setDepth(9800).setScrollFactor(0).setScale(this.__us);
  const bg=this.add.rectangle(d,st/2,_,st,328450,.82).setInteractive();
  const n=this.add.graphics();
  Dt(n,d-210,Y,420,HH);
  o.add([bg,n]);
  __winSkin(this,o,d-210,Y,420,HH,1)&&n.clear();

  const isCamp=this.fromForest;
  let slot=isCamp?this.retSlot:(this.game.registry.get("save:slot")??1);
  if(!isCamp){
    for(const s of [1,2,3,4]){if(Nn(s).ok){slot=s;break;}}
  }
  const getGold=()=>{
    if(isCamp){
      const c=__cData(this);
      return c?.d?.player?.gold??0;
    }else{
      const e=Nn(slot);
      return e.ok?(e.data.player?.gold??0):0;
    }
  };
  let curGold=getGold();

  o.add(this.add.text(d,Y+16,L3("FORJA ANCESTRAL · ARMARIA LENDÁRIA","ANCIENT FORGE · LEGENDARY ARMORY","FORJA ANCESTRAL · ARMERÍA LEGENDARIA"),{...ti,fontSize:"12px",color:"#ffd24a"}).setOrigin(.5));
  o.add(this.add.text(d,Y+30,L3("Armas únicas de imenso poder. Quebram-se se você morrer em uma run!","Unique weapons of immense power. They break if you die in a run!","¡Armas únicas de inmenso poder. ¡Se rompen si mueres en una run!"),{...Le,fontSize:"8px",fontStyle:"italic",color:"#f87171"}).setOrigin(.5));

  const weaponsList=[
    {id:"unique_forge_eclipse",name:L3("Lâmina do Eclipse Negro","Dark Eclipse Blade","Hoja del Eclipse Oscuro"),price:350,icon:"icon-sword",stats:"+16 DANO · +22% CRÍTICO · +5 DANO MÁGICO",color:"#c084fc"},
    {id:"unique_forge_cataclysm",name:L3("Machado do Cataclismo","Cataclysm Axe","Hacha del Cataclismo"),price:380,icon:"icon-axe",stats:"+24 DANO · +4 DEFESA · +15% CRÍTICO",color:"#f87171"},
    {id:"unique_forge_shadowfangs",name:L3("Presas do Vácuo Eterno","Fangs of the Void","Colmillos del Vacío"),price:360,icon:"icon-twin-fangs",stats:"+12 DANO · +35% CRÍTICO · +25 VEL · +12% ESQUIVA",color:"#38bdf8"},
    {id:"unique_forge_starfall",name:L3("Arco Estelar de Dorf","Dorf Starfall Bow","Arco Estelar de Dorf"),price:370,icon:"icon-long-bow",stats:"+18 DANO · +25% CRÍTICO · +40 ALCANCE",color:"#fbbf24"},
    {id:"unique_forge_abyss_scepter",name:L3("Cetro da Ruína Astral","Astral Ruin Scepter","Cetro de la Ruina Astral"),price:390,icon:"icon-arcane-staff",stats:"+22 PODER MÁGICO · +35 MANA · -20% RECARGA",color:"#a855f7"},
    {id:"unique_forge_aegis",name:L3("Espada-Baluarte da Aurora","Aurora Bastion Edge","Espada Baluarte de la Aurora"),price:340,icon:"icon-dragon-sword",stats:"+15 DANO · +8 DEFESA · +4 VIDA · +18% BLOQUEIO",color:"#34d399"}
  ];

  const goldText=this.add.text(d,Y+276,`${L3("SEU OURO","YOUR GOLD","TU ORO")}: ${curGold} 🪙`,{...ti,fontSize:"11px",color:"#ffd24a"}).setOrigin(.5);
  const msgText=this.add.text(d,Y+292,"",{...Le,fontSize:"9px",color:"#4ade80"}).setOrigin(.5);
  o.add([goldText,msgText]);

  weaponsList.forEach((wp,idx)=>{
    const ry=Y+44+idx*37;
    const box=this.add.graphics();
    const z=this.add.zone(d,ry+16,400,34).setInteractive({useHandCursor:!0});
    const icKey=this.textures.exists(wp.icon)?wp.icon:"icon-sword";
    const im=this.add.image(d-176,ry+16,icKey).setScale(1.1);
    const nm=this.add.text(d-154,ry+4,wp.name.toUpperCase(),{...ti,fontSize:"10px",color:wp.color});
    const stT=this.add.text(d-154,ry+18,wp.stats,{...Le,fontSize:"7px",color:"#e2e8f0"});
    const prT=this.add.text(d+186,ry+10,`${wp.price} 🪙`,{...ti,fontSize:"11px",color:"#ffd24a"}).setOrigin(1,0);

    const drawRow=(hover)=>{
      box.clear();
      box.fillStyle(hover?0x3d2818:0x1a120b,hover?0.92:0.65);
      box.fillRoundedRect(d-200,ry,400,34,4);
      box.lineStyle(1,hover?0xffd24a:0x5a4832,hover?1:0.5);
      box.strokeRoundedRect(d-200,ry,400,34,4);
    };
    drawRow(!1);

    z.on("pointerover",()=>drawRow(!0));
    z.on("pointerout",()=>drawRow(!1));
    z.on("pointerdown",()=>{
      curGold=getGold();
      if(curGold<wp.price){
        msgText.setText(L3("Ouro insuficiente para forjar esta arma!","Not enough gold to forge this weapon!","¡Oro insuficiente para forjar esta arma!")).setColor("#f87171");
        this.game.audioEngine?.sfx?.("sfx-door-locked");
        return;
      }
      if(isCamp){
        const c=__cData(this);
        if(c&&c.d){
          c.d.player=c.d.player||{};
          c.d.player.gold=(c.d.player.gold||0)-wp.price;
          c.d.player.items=c.d.player.items||[];
          c.d.player.items.push({id:wp.id,rarity:"UNIQUE",seed:Date.now(),uniqueForge:!0,breaksOnDeath:!0});
          localStorage.setItem(Wt("campaign",c.sl),JSON.stringify(c.d));
        }
      }else{
        let e=Nn(slot);
        if(e.ok){
          e.data.player=e.data.player||{};
          e.data.player.gold=(e.data.player.gold||0)-wp.price;
          e.data.player.items=e.data.player.items||[];
          e.data.player.items.push({id:wp.id,rarity:"UNIQUE",seed:Date.now(),uniqueForge:!0,breaksOnDeath:!0});
          localStorage.setItem(Wt("endless",slot),JSON.stringify(e.data));
        }
      }
      curGold=getGold();
      goldText.setText(`${L3("SEU OURO","YOUR GOLD","TU ORO")}: ${curGold} 🪙`);
      msgText.setText(L3(`Forjado: ${wp.name}! (Quebra se morrer na run)`,`Forged: ${wp.name}! (Breaks on death in run)`,`¡Forjado: ${wp.name}! (Se rompe si mueres en run)`)).setColor("#4ade80");
      window.__advancedAudio?.playMetalClang?.("E5");
      this.game.audioEngine?.sfx?.("sfx-item-pickup");
      const I=this.M?.interior;
      if(I?.spots?.rack)this.__sparks(I.spots.rack[0],I.spots.rack[1]-14,12);
    });

    o.add([box,im,nm,stT,prT,z]);
  });

  const swBtn=this.add.text(d-100,Y+HH-16,L3("⚙ MELHORIAS DA FORJA","⚙ FORGE UPGRADES","⚙ MEJORAS DE FORJA"),{...ti,fontSize:"10px",color:"#8fd8ff"}).setOrigin(.5).setInteractive({useHandCursor:!0});
  swBtn.on("pointerover",()=>swBtn.setColor("#ffffff"));
  swBtn.on("pointerout",()=>swBtn.setColor("#8fd8ff"));
  swBtn.on("pointerdown",()=>{o.destroy();this.panel=null;this.openBlacksmith();});

  const cBtn=this.add.text(d+100,Y+HH-16,L3("✕ FECHAR","✕ CLOSE","✕ CERRAR"),{...ti,fontSize:"10px",color:"#d8cdb4"}).setOrigin(.5).setInteractive({useHandCursor:!0});
  cBtn.on("pointerover",()=>cBtn.setColor("#ffd24a"));
  cBtn.on("pointerout",()=>cBtn.setColor("#d8cdb4"));
  cBtn.on("pointerdown",()=>{o.destroy();this.panel=null;this.__busy=!1;});

  o.add([swBtn,cBtn]);
  this.panel=o;
}
'''

if "__forgeWeaponsShop()" not in hub_code:
    hub_code += "\n" + shop_method
    print("✓ Added __forgeWeaponsShop() to hub-village.js")
else:
    print("✓ __forgeWeaponsShop() already in hub-village.js")

with open(HUB_JS, 'w', encoding='utf-8') as f:
    f.write(hub_code)
print("Saved scripts/source/hub-village.js")

print("\n=== STEP 2: Running patch_hub_village.py ===")
subprocess.check_call([sys.executable, os.path.join(ROOT, "scripts", "patch_hub_village.py")])

print("\n=== STEP 3: Patching Endless 4 slots, persistence, death counter, unique weapons ===")
for target_file in [BUNDLE, MIRROR_BUNDLE]:
    if not os.path.isfile(target_file):
        continue
    print(f"Patching {target_file}...")
    with open(target_file, 'r', encoding='utf-8') as f:
        s = f.read()

    # 3.1 Endless 4 slots: ke=[1,2] -> ke=[1,2,3,4]
    if "ke=[1,2]," in s:
        s = s.replace("ke=[1,2],", "ke=[1,2,3,4],")
        print("✓ Updated ke=[1,2] to ke=[1,2,3,4]")
    elif "ke=[1,2,3,4]," in s:
        print("✓ ke=[1,2,3,4] already set")
    else:
        print("! Warning: ke=[1,2], not found")

    # 3.2 Update Ws function to include deaths in endless return
    old_ws = 'score:e.run.score??0,seed:e.run.seed,timestamp:e.timestamp}'
    new_ws = 'score:e.run.score??0,seed:e.run.seed,deaths:e.player.deaths??0,timestamp:e.timestamp}'
    if old_ws in s:
        s = s.replace(old_ws, new_ws, 1)
        print("✓ Updated Ws(c,i) to include deaths")
    elif new_ws in s:
        print("✓ Ws(c,i) already has deaths")

    # 3.3 Update showSaveSelect modal width & card layout for 4 cards
    # Ornate panel width
    old_panel = '__ornatePanel(a,e-(i==="campaign"?262:230),22,i==="campaign"?524:460,318)'
    new_panel = '__ornatePanel(a,e-(i==="endless"?292:i==="campaign"?262:230),22,i==="endless"?584:i==="campaign"?524:460,318)'
    if old_panel in s:
        s = s.replace(old_panel, new_panel, 1)
        print("✓ Updated showSaveSelect ornate panel width")
    elif new_panel in s:
        print("✓ showSaveSelect ornate panel already updated")

    # Cards width and gap
    old_cards = 'const KS=i==="campaign"?__kC:ke,CW=KS.length>2?156:196,CH=192,gp=KS.length>2?12:20,x0=e-(KS.length*CW+(KS.length-1)*gp)/2;KS.forEach('
    new_cards = 'const KS=i==="campaign"?__kC:ke,CW=KS.length>3?130:KS.length>2?156:196,CH=192,gp=KS.length>3?10:KS.length>2?12:20,x0=e-(KS.length*CW+(KS.length-1)*gp)/2;KS.forEach('
    if old_cards in s:
        s = s.replace(old_cards, new_cards, 1)
        print("✓ Updated showSaveSelect card widths and gaps for 4 slots")
    elif new_cards in s:
        print("✓ showSaveSelect card widths already updated")

    # Display death counter on endless cards
    old_card_labels = 'i==="endless"?(lab(W("rs.depth").toUpperCase(),`${v.depth}`,y+94),lab(W("rs.score").toUpperCase(),`${(v.score??0).toLocaleString("pt-BR")}`,y+120)):(lab("LOCAL",`${St(`lvl.${v.levelId}`,v.levelId)}${v.completed?"  ✓":""}`,y+94),lab("HERÓI",`${cls}  ·  ${W("rs.level")} ${v.level}`,y+120)),lab(W(i==="endless"?"sv.lastRun":"sv.lastSave").toUpperCase(),`${E.toLocaleDateString()} ${E.toLocaleTimeString().slice(0,5)}`,y+146,"#b8a888")'
    new_card_labels = 'i==="endless"?(lab(W("rs.depth").toUpperCase(),`${v.depth}`,y+92),lab(W("rs.score").toUpperCase(),`${(v.score??0).toLocaleString("pt-BR")}`,y+114),lab((typeof __L3==="function"?__L3("MORTES","DEATHS","MUERTES"):"MORTES").toUpperCase(),`💀 ${v.deaths??0}`,y+136,"#e06858"),lab(W("sv.lastRun").toUpperCase(),`${E.toLocaleDateString()} ${E.toLocaleTimeString().slice(0,5)}`,y+158,"#b8a888")):(lab("LOCAL",`${St(`lvl.${v.levelId}`,v.levelId)}${v.completed?"  ✓":""}`,y+94),lab("HERÓI",`${cls}  ·  ${W("rs.level")} ${v.level}`,y+120),lab(W("sv.lastSave").toUpperCase(),`${E.toLocaleDateString()} ${E.toLocaleTimeString().slice(0,5)}`,y+146,"#b8a888"))'
    if old_card_labels in s:
        s = s.replace(old_card_labels, new_card_labels, 1)
        print("✓ Updated card labels to render 💀 Mortes counter")
    elif new_card_labels in s:
        print("✓ Card labels already render 💀 Mortes counter")

    # 3.4 Register 6 unique blacksmith weapons into Xt catalog
    unique_weapons_json = '''unique_forge_eclipse:{name:"Lâmina do Eclipse Negro",type:"weapon",slot:"weapon",icon:"icon-sword",minRarity:"UNIQUE",stats:{damage:16,critChance:22,magicDamage:5},attackSpeed:1.15,value:350,uniqueForge:!0,breaksOnDeath:!0,desc:"Forjada em aço vulcânico temperado com sangue abissal. Quebra-se se morrer na run."},unique_forge_cataclysm:{name:"Machado do Cataclismo",type:"weapon",slot:"weapon",icon:"icon-axe",weaponClass:"heavy",minRarity:"UNIQUE",stats:{damage:24,defense:4,critChance:15},attackSpeed:.75,value:380,uniqueForge:!0,breaksOnDeath:!0,desc:"Pesado e inclemente. Rachaduras incandescentes esmagam armaduras. Quebra-se se morrer na run."},unique_forge_shadowfangs:{name:"Presas do Vácuo Eterno",type:"weapon",slot:"weapon",icon:"icon-twin-fangs",minRarity:"UNIQUE",stats:{damage:12,critChance:35,speedAdd:25,dodgeChance:12},attackSpeed:1.35,value:360,uniqueForge:!0,breaksOnDeath:!0,desc:"Adagas espectrais que rasgam a realidade com velocidade aterradora. Quebram-se se morrer na run."},unique_forge_starfall:{name:"Arco Estelar de Dorf",type:"weapon",slot:"weapon",icon:"icon-long-bow",minRarity:"UNIQUE",stats:{damage:18,critChance:25,attackRangeAdd:40},attackSpeed:1.05,value:370,uniqueForge:!0,breaksOnDeath:!0,desc:"Arco rúnico esculpido nas montanhas Dorf. Dispara setas de pura luz. Quebra-se se morrer na run."},unique_forge_abyss_scepter:{name:"Cetro da Ruína Astral",type:"weapon",slot:"weapon",icon:"icon-arcane-staff",minRarity:"UNIQUE",stats:{magicDamage:22,maxMana:35,cooldownReduction:.2},attackSpeed:.95,value:390,uniqueForge:!0,breaksOnDeath:!0,desc:"Cetro ancestral pulsando com o vácuo cósmico do Abismo. Quebra-se se morrer na run."},unique_forge_aegis:{name:"Espada-Baluarte da Aurora",type:"weapon",slot:"weapon",icon:"icon-dragon-sword",minRarity:"UNIQUE",stats:{damage:15,defense:8,maxHpAdd:4,blockChance:18},attackSpeed:1,value:340,uniqueForge:!0,breaksOnDeath:!0,desc:"Equilíbrio perfeito de corte letal e proteção inabalável da forja ancestral. Quebra-se se morrer na run."},'''

    if "unique_forge_eclipse" not in s:
        old_xt_start = 'Xt={'
        s = s.replace(old_xt_start, 'Xt={' + unique_weapons_json, 1)
        print("✓ Registered 6 unique weapons into Xt catalog")
    else:
        print("✓ Unique weapons already registered in Xt")

    # 3.5 Update Endless Game Over death logic: persistent hero, death counter, last pact, break fragile weapons
    old_endless_death = '''i.finished=!0;try{const sl=Es(this.game);Kr(sl,"endless");localStorage.removeItem(Wt("endless",sl));localStorage.removeItem(Wt("endless",1));localStorage.removeItem(Wt("endless",2));}catch(err){}'''

    new_endless_death = '''i.finished=!0;try{const sl=Es(this.game);let curSave=Nn(sl);const sv=curSave.ok?curSave.data:$r(this);sv.player=sv.player||{};sv.run=sv.run||{};sv.player.deaths=(sv.player.deaths||curSave.data?.player?.deaths||0)+1;sv.player.gold=this.stats?.gold??sv.player.gold??0;sv.player.hp=this.player?.maxHp||this.stats?.maxHp||6;sv.player.resource=this.resource?.max||100;const curPacts=(typeof window!=="undefined"&&window.__getActivePacts?.(this))||i.pacts||[];const lastPact=curPacts.length>0?curPacts[curPacts.length-1]:(sv.player.lastPact||null);sv.player.lastPact=lastPact;sv.run.pacts=lastPact?[lastPact]:[];sv.run.depth=1;sv.run.score=0;sv.run.finished=!1;sv.run.seed=Date.now();sv.run.pendingBlessing=!1;const isFragile=it=>it&&(it.breaksOnDeath||(typeof Xt!=="undefined"&&Xt[it.id]?.breaksOnDeath)||(typeof Xt!=="undefined"&&Xt[it.id]?.uniqueForge));if(sv.player.equipment){for(const slotKey in sv.player.equipment){if(isFragile(sv.player.equipment[slotKey])){sv.player.equipment[slotKey]=null;}}if(!sv.player.equipment.weapon){sv.player.equipment.weapon={id:this.classDef?.starterWeapon||"sword",rarity:"COMMON",seed:0};}}if(Array.isArray(sv.player.items)){sv.player.items=sv.player.items.filter(it=>!isFragile(it));}localStorage.setItem(Wt("endless",sl),JSON.stringify(sv));const L3=typeof __L3==="function"?__L3:(pt,en)=>pt;this.game.events.emit("ui:banner",L3("SUAS ARMAS ÚNICAS SE QUEBRARAM! O herói ressurge com seu ouro e último pacto.","YOUR UNIQUE WEAPONS BROKE! The hero returns with gold and last pact.","¡TUS ARMAS ÚNICAS SE ROMPIERON! El héroe regresa con su oro y último pacto."),"#e05a4a");}catch(err){console.warn("[endless persistent death save]",err);}'''

    if old_endless_death in s:
        s = s.replace(old_endless_death, new_endless_death, 1)
        print("✓ Updated onGameOver to keep endless hero persistent with death counter & last pact")
    elif "curSave.data?.player?.deaths" in s:
        print("✓ onGameOver endless persistent death already applied")

    # 3.6 Update onRestart to restart persistent endless hero seamlessly
    old_restart = 'onRestart(){this.cameraSys.fadeOut(350,()=>{this.scene.stop("UI"),this.scene.start("ClassSelect")})}'
    new_restart = 'onRestart(){const isEndless=this.game.registry.get("mode")==="endless",sl=Es(this.game),sv=isEndless?Nn(sl):null;if(isEndless&&sv?.ok){this.cameraSys.fadeOut(350,()=>{this.scene.stop("UI");this.scene.start("Game",{endless:!0,classId:sv.data.player.classId,restoreEndless:sv.data});});return;}this.cameraSys.fadeOut(350,()=>{this.scene.stop("UI"),this.scene.start("ClassSelect")})}'

    if old_restart in s:
        s = s.replace(old_restart, new_restart, 1)
        print("✓ Updated onRestart for endless persistent hero restart")
    elif "sv=isEndless?Nn(sl)" in s:
        print("✓ onRestart already updated for endless")

    # 3.7 In Game.create(), ensure restored endless hero gets full health and pact announced if resuming from death
    old_restore_block = 'this.player.hp=Math.min(r.hp,this.player.maxHp),r.resource!=null&&(this.resource.current=Math.min(r.resource,this.resource.max))}'
    new_restore_block = 'this.player.hp=(r.hp&&r.hp>0)?Math.min(r.hp,this.player.maxHp):this.player.maxHp,r.resource!=null&&(this.resource.current=Math.min(r.resource,this.resource.max));if(this.restoreEndless?.run?.pacts&&typeof window!=="undefined"&&window.__getActivePacts){const ap=window.__getActivePacts(this);ap.length=0;ap.push(...this.restoreEndless.run.pacts);if(ap.length>0)this.time.delayedCall(800,()=>{this.scene.isActive()&&this.game.events.emit("ui:banner",`PACTO HERDADO: ${ap[0].toUpperCase()}`,"#9333ea");});}}'

    if old_restore_block in s:
        s = s.replace(old_restore_block, new_restore_block, 1)
        print("✓ Updated Game.create() to restore pact & full HP")
    elif "PACTO HERDADO:" in s:
        print("✓ Game.create() already handles restored pact & HP")

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(s)
    print(f"✓ Saved {target_file}")

print("\n=== ALL PATCHES APPLIED SUCCESSFULLY! ===")
