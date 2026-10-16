"""
Script para adicionar manchas de neve no chão e montículos de neve no cenário gélido (glacial).
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js')
]

# 1. no["tiles-frozen"] config: add snowPatches:!0
OLD_TILES_FROZEN = '"tiles-frozen":{floorRGB:c=>`rgb(${c-8},${c+2},${c+14})`,wallRGB:c=>`rgb(${c-10},${c-2},${c+12})`,moss:"rgba(170,215,255,0.3)",mossHeavy:!0,emberCracks:!0,emberColor:"rgba(122,200,255,0.7)",ashFlecks:!0,fleckColor:"rgba(230,242,255,0.5)"}'
NEW_TILES_FROZEN = '"tiles-frozen":{floorRGB:c=>`rgb(${c-8},${c+2},${c+14})`,wallRGB:c=>`rgb(${c-10},${c-2},${c+12})`,moss:"rgba(170,215,255,0.3)",mossHeavy:!0,emberCracks:!0,emberColor:"rgba(122,200,255,0.7)",ashFlecks:!0,fleckColor:"rgba(230,242,255,0.5)",snowPatches:!0}'

# 2. In Ue: snow patches on floor tiles
OLD_UE_ASH = 'if(o.ashFlecks){c.fillStyle=o.fleckColor??"rgba(120,112,104,0.35)";for(let v=0;v<4;v++){const f=i+Math.floor(Ot(t*37+v,v*11)*(a-6))+2,m=Math.floor(Ot(v*17,t*41+v)*(a-6))+2;c.fillRect(f,m,2,1),v%2&&c.fillRect(f+1,m+1,1,1)}}'
NEW_UE_ASH = 'if(o.ashFlecks){c.fillStyle=o.fleckColor??"rgba(120,112,104,0.35)";for(let v=0;v<4;v++){const f=i+Math.floor(Ot(t*37+v,v*11)*(a-6))+2,m=Math.floor(Ot(v*17,t*41+v)*(a-6))+2;c.fillRect(f,m,2,1),v%2&&c.fillRect(f+1,m+1,1,1)}}if(o.snowPatches){const sn=Ot(t*43,t*19+7);if(sn>.35){const sx=i+Math.floor(Ot(t*31,5)*(a-16))+2,sy=Math.floor(Ot(7,t*29)*(a-14))+2,sw=8+Math.floor(sn*14),sh=5+Math.floor(sn*8);c.fillStyle="rgba(145,195,230,0.65)",c.fillRect(sx,sy+sh-1,sw,2),c.fillRect(sx+sw-1,sy,2,sh),c.fillStyle="rgba(232,244,255,0.92)",c.fillRect(sx,sy,sw,sh),c.fillRect(sx+1,sy-1,sw-2,1),c.fillRect(sx+2,sy+sh,sw-4,1),c.fillStyle="rgba(255,255,255,0.98)",c.fillRect(sx+1,sy,Math.max(2,sw-3),2),c.fillRect(sx+2,sy+2,Math.max(1,sw-5),1)}}'

# 3. Add more snow-pile decor to glacial rooms (dl)
OLD_DL_1 = '{type:"snow-pile",col:30,row:46},{type:"frozen-corpse",col:34,row:46},{type:"chains",col:27,row:40},{type:"chains",col:35,row:40},{type:"snow-pile",col:28,row:46}'
NEW_DL_1 = '{type:"snow-pile",col:30,row:46},{type:"frozen-corpse",col:34,row:46},{type:"chains",col:27,row:40},{type:"chains",col:35,row:40},{type:"snow-pile",col:28,row:46},{type:"snow-pile",col:29,row:43},{type:"snow-pile",col:33,row:45},{type:"snow-pile",col:31,row:42}'

OLD_DL_2 = '{type:"frozen-corpse",col:24,row:34},{type:"frozen-corpse",col:33,row:35},{type:"snow-pile",col:29,row:35}'
NEW_DL_2 = '{type:"frozen-corpse",col:24,row:34},{type:"frozen-corpse",col:33,row:35},{type:"snow-pile",col:29,row:35},{type:"snow-pile",col:25,row:31},{type:"snow-pile",col:36,row:34},{type:"snow-pile",col:28,row:36},{type:"snow-pile",col:34,row:30}'

OLD_DL_3 = '{type:"dead-tree-frozen",col:12,row:28,solid:!0},{type:"frost-torch",col:10,row:26},{type:"snow-pile",col:13,row:35},{type:"ice-crystal",col:6,row:33}'
NEW_DL_3 = '{type:"dead-tree-frozen",col:12,row:28,solid:!0},{type:"frost-torch",col:10,row:26},{type:"snow-pile",col:13,row:35},{type:"ice-crystal",col:6,row:33},{type:"snow-pile",col:8,row:29},{type:"snow-pile",col:15,row:33},{type:"snow-pile",col:6,row:34},{type:"snow-pile",col:12,row:35}'

OLD_DL_4 = '{type:"frozen-corpse",col:45,row:31},{type:"snow-pile",col:53,row:33},{type:"trap-frost",col:50,row:31}'
NEW_DL_4 = '{type:"frozen-corpse",col:45,row:31},{type:"snow-pile",col:53,row:33},{type:"trap-frost",col:50,row:31},{type:"snow-pile",col:47,row:32},{type:"snow-pile",col:52,row:29},{type:"snow-pile",col:48,row:35},{type:"snow-pile",col:54,row:34}'

OLD_DL_5 = '{type:"snow-pile",col:26,row:12},{type:"snow-pile",col:36,row:12},{type:"frozen-corpse",col:40,row:5}'
NEW_DL_5 = '{type:"snow-pile",col:26,row:12},{type:"snow-pile",col:36,row:12},{type:"frozen-corpse",col:40,row:5},{type:"snow-pile",col:23,row:5},{type:"snow-pile",col:39,row:5},{type:"snow-pile",col:24,row:11},{type:"snow-pile",col:38,row:11},{type:"snow-pile",col:29,row:13},{type:"snow-pile",col:33,row:13}'

for path in TARGETS:
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()

    assert OLD_TILES_FROZEN in src, f"OLD_TILES_FROZEN not found in {path}"
    src = src.replace(OLD_TILES_FROZEN, NEW_TILES_FROZEN, 1)

    assert OLD_UE_ASH in src, f"OLD_UE_ASH not found in {path}"
    src = src.replace(OLD_UE_ASH, NEW_UE_ASH, 1)

    assert OLD_DL_1 in src, f"OLD_DL_1 not found in {path}"
    src = src.replace(OLD_DL_1, NEW_DL_1, 1)

    assert OLD_DL_2 in src, f"OLD_DL_2 not found in {path}"
    src = src.replace(OLD_DL_2, NEW_DL_2, 1)

    assert OLD_DL_3 in src, f"OLD_DL_3 not found in {path}"
    src = src.replace(OLD_DL_3, NEW_DL_3, 1)

    assert OLD_DL_4 in src, f"OLD_DL_4 not found in {path}"
    src = src.replace(OLD_DL_4, NEW_DL_4, 1)

    assert OLD_DL_5 in src, f"OLD_DL_5 not found in {path}"
    src = src.replace(OLD_DL_5, NEW_DL_5, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print(f"[OK] Patched {path} with floor snow patches and snowdrifts!")

print("[SUCCESS] All files updated with ground snow in the glacial scenario!")
