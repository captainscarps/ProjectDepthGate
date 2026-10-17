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
    print(f"[OK] Replaced __CodexScene with standardized implementation in {rel_path}")

    # -------------------------------------------------------------
    # 3. FIX BESTIARY KILL COUNTERS (DATA NORMALIZATION & DISPLAY)
    # -------------------------------------------------------------
    p_bk = content.find("function __bkKills()")
    p_bk_end = content.find("function __bkEntries()", p_bk)
    if p_bk != -1 and p_bk_end != -1:
        new_bk_logic = """function __bkKills() {
  try {
    const raw = JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}");
    if (raw["SATYR_SISTERS"]) {
      const leg = raw["SATYR_SISTERS"], c = (typeof leg === "object" ? leg.campaign : Number(leg)) || 0, e = (typeof leg === "object" ? leg.endless : 0) || 0;
      raw["SATYR_SISTER_1"] ||= { campaign: c, endless: e, total: c + e };
      raw["SATYR_SISTER_2"] ||= { campaign: c, endless: e, total: c + e };
    }
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "number") {
        raw[k] = { campaign: v, endless: 0, total: v };
      } else if (typeof v === "object" && v !== null) {
        const c = Number(v.campaign) || 0, e = Number(v.endless) || 0, t = Number(v.total) || (c + e);
        raw[k] = { campaign: c, endless: e, total: t };
      }
    }
    return raw;
  } catch (e) { return {} }
}
function __bkKill(k, isEndless = false) {
  if (!k) return;
  const K = __bkKills();
  let entry = K[k];
  if (!entry || typeof entry !== "object") {
    const n = typeof entry === "number" ? entry : 0;
    entry = { campaign: n, endless: 0, total: n };
  }
  if (isEndless) {
    entry.endless = (entry.endless || 0) + 1;
  } else {
    entry.campaign = (entry.campaign || 0) + 1;
  }
  entry.total = (entry.campaign || 0) + (entry.endless || 0);
  K[k] = entry;
  try { localStorage.setItem("depthgate:bestiary", JSON.stringify(K)) } catch (e) { }
}
function __bestTrack(G) {
  if (!G || G.__bkTr) return; G.__bkTr = !0;
  const isEnd = () => { try { return G.registry?.get("mode") === "endless"; } catch(e) { return false; } };
  G.events.on("enemy:died", e => { e && !e.isMinion && __bkKill(e.typeKey, isEnd()) });
  G.events.on("boss:defeated", b => __bkKill(b?.typeKey, isEnd()));
}
"""
        content = content[:p_bk] + new_bk_logic + content[p_bk_end:]
        print(f"[OK] Patched __bkKills, __bkKill and __bestTrack in {rel_path}")

    # In __BookScene.pageEntryL:
    p_pe = content.find("const kd = this.K[e.k]")
    p_pe_end = content.find("this.T(L, X + PW / 2, 300, kTxt", p_pe)
    if p_pe != -1 and p_pe_end != -1:
        new_pe_kill = """const rawKd = this.K[e.k];
    let tot = 0, cK = 0, eK = 0;
    if (typeof rawKd === "number") { tot = rawKd; cK = rawKd; eK = 0; }
    else if (typeof rawKd === "object" && rawKd !== null) {
      cK = Number(rawKd.campaign) || 0;
      eK = Number(rawKd.endless) || 0;
      tot = Number(rawKd.total) || (cK + eK);
    }
    const kTxt = tot > 0 ? `${__L3("Derrotados", "Defeated", "Derrotados")}: ${tot} (Campanha: ${cK} | Infinito: ${eK})` : __L3("Ainda não derrotado", "Not yet defeated", "Aún no derrotado");
    """
        content = content[:p_pe] + new_pe_kill + content[p_pe_end:]
        print(f"[OK] Patched Bestiary pageEntryL kill display in {rel_path}")

    open(full_path, "w", encoding="utf-8").write(content)
    return True

if __name__ == "__main__":
    patch_file(r"assets\index-D6qIWtA7-p209.js")
    if os.path.exists(os.path.join(ROOT, r"Projeto atualizado\assets\index-D6qIWtA7-p209.js")):
        patch_file(r"Projeto atualizado\assets\index-D6qIWtA7-p209.js")

