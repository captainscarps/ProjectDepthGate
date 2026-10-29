import sys

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target_hair = 'i("pv-hair-warlock",12,9,e=>{e.fillStyle="#1e1428",e.fillRect(0,0,12,7),e.fillStyle="#2e2040",e.fillRect(1,0,10,5),e.fillStyle="#463060",e.fillRect(3,0,6,1),e.fillStyle="#a45ae0",e.fillRect(3,4,2,1),e.fillRect(7,4,2,1),e.fillStyle="#14101c",e.fillRect(0,6,12,3)})'
    
    shaman_addition = (
        'i("pv-hair-warlock",12,9,e=>{e.fillStyle="#1e1428",e.fillRect(0,0,12,7),e.fillStyle="#2e2040",e.fillRect(1,0,10,5),e.fillStyle="#463060",e.fillRect(3,0,6,1),e.fillStyle="#a45ae0",e.fillRect(3,4,2,1),e.fillRect(7,4,2,1),e.fillStyle="#14101c",e.fillRect(0,6,12,3)}),'
        'i("pv-body-shaman",14,12,e=>{e.fillStyle="#5a361c",e.fillRect(0,0,14,12),e.fillStyle="#8a4a26",e.fillRect(1,0,12,9),e.fillStyle="#2e5a2c",e.fillRect(2,0,10,2),e.fillStyle="#d49a3a",e.fillRect(4,2,6,2),e.fillStyle="#c03828",e.fillRect(6,4,2,5),e.fillStyle="#1e3a1e",e.fillRect(0,8,14,4)}),'
        'i("pv-hair-shaman",12,8,e=>{e.fillStyle="#141018",e.fillRect(0,0,12,7),e.fillStyle="#241e2c",e.fillRect(1,0,10,5),e.fillStyle="#c03828",e.fillRect(2,2,8,1),e.fillStyle="#e8a838",e.fillRect(5,0,2,3),e.fillStyle="#141018",e.fillRect(0,5,12,3)})'
    )

    if target_hair in content:
        content = content.replace(target_hair, shaman_addition, 1)
        print(f"Patched textures in {filepath}")
    else:
        print(f"Target textures not found in {filepath} (already patched?)")

    target_body_assign = 'this.body=s.image(0,1,`pv-body-${n}`),this.armorImg=s.image(0,0,"pv-armor-1").setVisible(!1),this.armBack=s.image(-7,0,"pv-arm").setOrigin(.5,.15),this.shieldImg=s.image(-9,2,"gear-shield").setOrigin(.5,.4).setVisible(!1),this.head=s.image(0,-9,"pv-head"),this.hair=s.image(0,-12,`pv-hair-${n}`)'
    
    safe_body_assign = 'this.body=s.image(0,1,i.textures.exists(`pv-body-${n}`)?`pv-body-${n}`:"pv-body-warrior"),this.armorImg=s.image(0,0,"pv-armor-1").setVisible(!1),this.armBack=s.image(-7,0,"pv-arm").setOrigin(.5,.15),this.shieldImg=s.image(-9,2,"gear-shield").setOrigin(.5,.4).setVisible(!1),this.head=s.image(0,-9,"pv-head"),this.hair=s.image(0,-12,i.textures.exists(`pv-hair-${n}`)?`pv-hair-${n}`:"pv-hair-warrior")'

    if target_body_assign in content:
        content = content.replace(target_body_assign, safe_body_assign, 1)
        print(f"Patched safe body/hair assignment in {filepath}")
    else:
        print(f"Target body assign not found in {filepath} (already patched?)")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch_file('assets/index-D6qIWtA7-p209.js')
    patch_file('Projeto atualizado/assets/index-D6qIWtA7-p209.js')
