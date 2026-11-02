import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

bundle_files = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

target_code = '''const i=it,isM=typeof it==="object",t=isM?it.mono:__arcLines()[i],ex=isM?"talk":__ARC_EXPR[i]||"talk";
 S.por.setVisible(!isM);S.porH?.setVisible(isM);S.narName.setText(isM?S.heroName:(typeof __GN!=="undefined"?__GN:"A GUARDIÃ"));
 !isM&&S.textures.exists("guardia-p-"+ex)&&S.por.setTexture("guardia-p-"+ex);'''

replacement_code = '''const i=it,isM=typeof it==="object",t=isM?it.mono:__arcLines()[i],ex=isM?"talk":__ARC_EXPR[i]||"talk";
const _hc=String(S.classId||"warrior").toLowerCase(),_hk=`hero-${_hc}-p-${ex}`;
if(isM){if(S.textures.exists(_hk)){S.por.setTexture(_hk).setVisible(!0);S.porH?.setVisible(!1)}else if(S.textures.exists(`hero-${_hc}-p-talk`)){S.por.setTexture(`hero-${_hc}-p-talk`).setVisible(!0);S.porH?.setVisible(!1)}else{S.por.setVisible(!1);S.porH?.setVisible(!0)}}else{S.porH?.setVisible(!1);S.textures.exists("guardia-p-"+ex)&&S.por.setTexture("guardia-p-"+ex).setVisible(!0)};
S.narName.setText(isM?S.heroName:(typeof __GN!=="undefined"?__GN:"A GUARDIÃ"));'''

# Also in portal preload: ensure hero portraits are loaded
preload_target = 'preload(){this.textures.exists("arc-boat-red")||this.load.image("arc-boat-red","assets/pixel-art/arctic/arc-boat-red.png");'
preload_replacement = 'preload(){try{const _hc=String(this.classId||"warrior").toLowerCase(),_D="assets/pixel-art/heroes-p/";for(const _e of["calm","talk","smile","sadness","aggression","special"])this.textures.exists(`hero-${_hc}-p-${_e}`)||this.load.image(`hero-${_hc}-p-${_e}`,`${_D}${_hc}-p-${_e}.png`);this.textures.exists(`hero-${_hc}-hud`)||this.load.image(`hero-${_hc}-hud`,`${_D}${_hc}-hud.png`)}catch(e){}this.textures.exists("arc-boat-red")||this.load.image("arc-boat-red","assets/pixel-art/arctic/arc-boat-red.png");'

for bf in bundle_files:
    if not os.path.exists(bf):
        print("Not found:", bf)
        continue
    with open(bf, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False
    if target_code in content:
        content = content.replace(target_code, replacement_code, 1)
        changed = True
        print(f"Patched speaker switch in {bf}")
    else:
        print(f"Target speaker switch not found in {bf}")

    if preload_target in content:
        content = content.replace(preload_target, preload_replacement, 1)
        changed = True
        print(f"Patched preload in {bf}")
    else:
        print(f"Preload target not found in {bf}")

    if changed:
        with open(bf, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Saved {bf}")

print("Portal hero portrait patch complete.")
