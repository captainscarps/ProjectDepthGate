import os
import re

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"

def patch_file(rel_path):
    full_path = os.path.join(ROOT, rel_path)
    content = open(full_path, "r", encoding="utf-8").read()

    # -------------------------------------------------------------
    # 1. FIX CLASS SELECT ABILITIES POSITION ON WIDESCREEN / STRETCH
    # -------------------------------------------------------------
    # In ClassSelect.refreshDetails():
    # Replace the hardcoded position 533+(k-1)*34 with cx+(k-1)*34, where cx = this.nameTxt?.x ?? 533
    old_ab = 'y+=4*13+8;const ab=(t.abilities??[]).slice(0,3);this.abIcons.forEach((im,k)=>{const a=ab[k]&&Ye[ab[k]];a&&this.textures.exists(a.icon)?im.setTexture(a.icon).setPosition(533+(k-1)*34,y+12).setVisible(!0).setAlpha(lk?.35:1):im.setVisible(!1)}),this.abTxt.setY(y+28).setText(ab.map(id=>St(`abn.${id}`,Ye[id]?.name??id)).join("  ·  "));this.redraw()}'
    
    # Check if string has unicode replacement or exact characters
    if old_ab not in content:
        # Try finding via regex
        m = re.search(r'y\+=4\*13\+8;const ab=\(t\.abilities\?\?\[\]\)\.slice\(0,3\);this\.abIcons\.forEach\(\(im,k\)=>\{const a=ab\[k\]&&Ye\[ab\[k\]\];a&&this\.textures\.exists\(a\.icon\)\?im\.setTexture\(a\.icon\)\.setPosition\(533\+\(k-1\)\*34,y\+12\)\.setVisible\(!0\)\.setAlpha\(lk\?\.35:1\):im\.setVisible\(!1\)\}\),this\.abTxt\.setY\(y\+28\)\.setText\(ab\.map\(id=>St\(`abn\.\$\{id\}`,Ye\[id\]\?\.name\?\?id\)\)\.join\([^\)]+\)\);this\.redraw\(\)\}', content)
        if m:
            matched_str = m.group(0)
            new_ab = 'y+=4*13+8;const ab=(t.abilities??[]).slice(0,3),cx=this.nameTxt?.x??(533+Math.round((_-640)/2));this.abIcons.forEach((im,k)=>{const a=ab[k]&&Ye[ab[k]];a&&this.textures.exists(a.icon)?im.setTexture(a.icon).setPosition(cx+(k-1)*34,y+12).setVisible(!0).setAlpha(lk?.35:1):im.setVisible(!1)}),this.abTxt.setX(cx).setY(y+28).setText(ab.map(id=>St(`abn.${id}`,Ye[id]?.name??id)).join("  ·  "));this.redraw()}'
            content = content.replace(matched_str, new_ab, 1)
            print(f"[OK] Patched ClassSelect abilities in {rel_path}")
        else:
            print(f"[WARN] Could not find ClassSelect abilities pattern in {rel_path}")
    else:
        new_ab = 'y+=4*13+8;const ab=(t.abilities??[]).slice(0,3),cx=this.nameTxt?.x??(533+Math.round((_-640)/2));this.abIcons.forEach((im,k)=>{const a=ab[k]&&Ye[ab[k]];a&&this.textures.exists(a.icon)?im.setTexture(a.icon).setPosition(cx+(k-1)*34,y+12).setVisible(!0).setAlpha(lk?.35:1):im.setVisible(!1)}),this.abTxt.setX(cx).setY(y+28).setText(ab.map(id=>St(`abn.${id}`,Ye[id]?.name??id)).join("  ·  "));this.redraw()}'
        content = content.replace(old_ab, new_ab, 1)
        print(f"[OK] Patched ClassSelect abilities in {rel_path}")

    # -------------------------------------------------------------
    # 2. STANDARDIZE CODEX TO MATCH BESTIARY EXACTLY
    # -------------------------------------------------------------
    # Locate class __CodexScene up to class __BookScene
    codex_start = content.find('class __CodexScene extends')
    codex_end = content.find('class __BookScene extends')
    if codex_start == -1 or codex_end == -1:
        print(f"[ERROR] Could not find __CodexScene bounds in {rel_path}")
        return False

    old_codex = content[codex_start:codex_end]

    # Load our updated standardized __CodexScene definition
    # We will read it from scripts/standardized_codex.js
    new_codex = open(os.path.join(ROOT, "scripts", "standardized_codex.js"), "r", encoding="utf-8").read()

    content = content[:codex_start] + new_codex + content[codex_end:]
    open(full_path, "w", encoding="utf-8").write(content)
    print(f"[OK] Replaced __CodexScene with standardized implementation in {rel_path}")
    return True

if __name__ == "__main__":
    patch_file(r"assets\index-D6qIWtA7-p209.js")
    if os.path.exists(os.path.join(ROOT, r"Projeto atualizado\assets\index-D6qIWtA7-p209.js")):
        patch_file(r"Projeto atualizado\assets\index-D6qIWtA7-p209.js")

