import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

bundle_files = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

target_old = '''const byName = () => { const m = {}; try { for (const [k, v] of Object.entries(__HN)) m[String(v).toUpperCase()] = k.toLowerCase() } catch (e) {} return m };
  const D0 = __dlg;
  __dlg = function (S, list, done) {
    try {
      const M = byName(), T = S.textures;
      list = (list || []).map((e) => {
        if (!e || e.who) return e;
        const c = M[String(e.name || "").toUpperCase().trim()];
        if (!c || !T.exists(`hero-${c}-p-talk`)) return e;
        const ex = e.expr && T.exists(`hero-${c}-p-${e.expr}`) ? e.expr : "talk";
        return { ...e, who: "hero-" + c, expr: ex };
      });
    } catch (e) {}
    return D0.call(this, S, list, done);
  };'''

replacement_new = '''const byName = () => { const m = {}; try { for (const [k, v] of Object.entries(__HN)) m[String(v).toUpperCase()] = k.toLowerCase() } catch (e) {} return m };
  const D0 = __dlg;
  __dlg = function (S, list, done) {
    try {
      const M = byName(), T = S.textures;
      const curCls = String(S?.classDef?.id || S?.player?.heroClass || window.__heroCls || S?.classId || "WARRIOR").toLowerCase();
      list = (list || []).map((e) => {
        if (!e) return e;
        let c = null;
        if (e.who && e.who.startsWith("hero-")) {
          c = e.who.replace("hero-", "");
        } else if (!e.who) {
          const nm = String(e.name || "").toUpperCase().trim();
          c = M[nm] || (nm === "HERÓI" || nm === "HEROI" || nm === "HERO" ? curCls : null);
        }
        if (!c || !T.exists(`hero-${c}-p-talk`)) c = curCls;
        if (c && T.exists(`hero-${c}-p-talk`)) {
          const ex = e.expr && T.exists(`hero-${c}-p-${e.expr}`) ? e.expr : "talk";
          return { ...e, who: "hero-" + c, expr: ex };
        }
        return e;
      });
    } catch (e) {}
    return D0.call(this, S, list, done);
  };'''

for bf in bundle_files:
    if not os.path.exists(bf):
        print("Not found:", bf)
        continue
    with open(bf, "r", encoding="utf-8") as f:
        content = f.read()

    if target_old in content:
        content = content.replace(target_old, replacement_new, 1)
        with open(bf, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Successfully updated __dlg interceptor in {bf}")
    else:
        print(f"Target __dlg interceptor not found in {bf}")

# Also update the hero dialog glow in the core __dlg show function:
# glow.setVisible(!0).setTint(e.corrupt?9055202:who==="rei"?16766336:13426943);
# to:
# glow.setVisible(!0).setTint(e.corrupt?9055202:who==="rei"?16766336:who&&who.startsWith("hero-")?16766336:13426943);

glow_target = 'glow.setVisible(!0).setTint(e.corrupt?9055202:who==="rei"?16766336:13426943);'
glow_replacement = 'glow.setVisible(!0).setTint(e.corrupt?9055202:who==="rei"?16766336:who&&who.startsWith("hero-")?16766336:13426943);'
name_color_target = 'nm.setColor(e.corrupt?"#d0a8ff":"#f2d9a0");'
name_color_replacement = 'nm.setColor(e.corrupt?"#d0a8ff":who&&who.startsWith("hero-")?"#ffd27a":"#f2d9a0");'

for bf in bundle_files:
    if not os.path.exists(bf):
        continue
    with open(bf, "r", encoding="utf-8") as f:
        content = f.read()

    changed = False
    if glow_target in content:
        content = content.replace(glow_target, glow_replacement, 1)
        changed = True
        print(f"Patched glow tint in {bf}")

    if name_color_target in content:
        content = content.replace(name_color_target, name_color_replacement, 1)
        changed = True
        print(f"Patched name color in {bf}")

    if changed:
        with open(bf, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Saved {bf}")

print("Hero bundle patch complete.")
