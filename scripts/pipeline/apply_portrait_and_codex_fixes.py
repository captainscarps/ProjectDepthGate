import os
import sys
import subprocess

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. BUNDLE MODIFICATIONS
bundles = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

# A) Old and new __dlg hook
old_dlg_hook = '''__dlg = function (S, list, done) {
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

new_dlg_hook = '''__dlg = function (S, list, done) {
    try {
      const M = byName(), T = S.textures;
      const curCls = String(S?.classDef?.id || S?.player?.heroClass || window.__heroCls || S?.classId || "WARRIOR").toLowerCase();
      list = (list || []).map((e) => {
        if (!e) return e;
        const curWho = String(e.who || "").toLowerCase();
        const nm = String(e.name || "").toUpperCase().trim();

        // 1. Guardiã falando -> estritamente retrato da Guardiã
        if (curWho === "guardia" || (!curWho && (nm === "A GUARDIÃ" || nm === "GUARDIÃ" || nm === "GUARDIA" || nm.includes("GUARDI")))) {
          return { ...e, who: "guardia", expr: e.expr || "talk" };
        }

        // 2. Rei falando -> estritamente retrato do Rei
        if (curWho === "rei" || (!curWho && (nm === "O REI" || nm === "REI" || nm.includes("VALDRAK")))) {
          return { ...e, who: "rei", expr: e.expr || "talk" };
        }

        // 3. Herói falando -> estritamente retrato do Herói correspondente
        let c = null;
        if (curWho.startsWith("hero-")) {
          c = curWho.replace("hero-", "");
        } else if (!curWho && (e.isHero || nm === "HERÓI" || nm === "HEROI" || nm === "HERO" || M[nm])) {
          c = M[nm] || curCls;
        }

        if (c && T.exists(`hero-${c}-p-talk`)) {
          const ex = e.expr && T.exists(`hero-${c}-p-${e.expr}`) ? e.expr : "talk";
          return { ...e, who: "hero-" + c, expr: ex };
        }

        // 4. Outros personagens/narrador -> não atribui foto de herói
        return e;
      });
    } catch (e) {}
    return D0.call(this, S, list, done);
  };'''

# B) Old and new codex map preload in Preload scene
old_preload_maps = 'for(const m of["forest","castle","catacombs","ruins","temple","glacial","vulcao","fortress","bosque","rio","morta","cripta","bruxa"])this.load.image("codex-map-"+m,"assets/images/codex_maps/map_"+m+".jpg");'
new_preload_maps = 'for(const m of["forest","castle","catacombs","ruins","temple","glacial","vulcao","fortress","bosque","rio","morta","cripta","bruxa"])this.load.image("codex-map-"+m,"assets/images/codex_maps/map_"+m+".jpg?v=5.71");'

# C) Self-healing image rendering in renderBiomePage
old_render_img = '''    // IMAGEM DO MAPA
    const mapKey = `codex-map-${b.id}`;
    if (this.textures.exists(mapKey)) {
      const mapImg = this.add.image(mapX + mapW / 2, mapY + mapH / 2, mapKey);
      mapImg.setDisplaySize(mapW - 6, mapH - 6);
      L.add(mapImg);

      const vig = this.add.graphics();
      vig.lineStyle(2, 0x160f0a, 0.65).strokeRoundedRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, 4);
      vig.lineStyle(1, 0xc9a24a, 0.75).strokeRoundedRect(mapX + 1, mapY + 1, mapW - 2, mapH - 2, 5);
      L.add(vig);
    }'''

new_render_img = '''    // IMAGEM DO MAPA
    const mapKey = `codex-map-${b.id}`;
    if (this.textures.exists(mapKey)) {
      const mapImg = this.add.image(mapX + mapW / 2, mapY + mapH / 2, mapKey);
      mapImg.setDisplaySize(mapW - 6, mapH - 6);
      L.add(mapImg);

      const vig = this.add.graphics();
      vig.lineStyle(2, 0x160f0a, 0.65).strokeRoundedRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, 4);
      vig.lineStyle(1, 0xc9a24a, 0.75).strokeRoundedRect(mapX + 1, mapY + 1, mapW - 2, mapH - 2, 5);
      L.add(vig);
    } else {
      try {
        this.load.image(mapKey, `assets/images/codex_maps/map_${b.id}.jpg?v=5.71`);
        this.load.once("complete", () => {
          if (this.sys?.isActive?.() && this.spread === (this.BIOMES_START + idx)) this.render();
        });
        this.load.start();
      } catch (err) {}
    }'''

# D) Add cripta and bruxa to __CODEX_BIOMES
old_biomes_end = '''    tip: "Inimigos espectrais ignoram certas colisões e surgem de dentro das árvores mortas. Fique atento aos murmúrios sonoros que precedem suas investidas."
  }
];'''

new_biomes_end = '''    tip: "Inimigos espectrais ignoram certas colisões e surgem de dentro das árvores mortas. Fique atento aos murmúrios sonoros que precedem suas investidas."
  },
  {
    id: "cripta",
    name: "Floresta da Cripta",
    title: "O Purgatório dos Esquecidos",
    icon: "icon-crys-catacombs",
    danger: "★★★★☆",
    climate: "Névoa espessa, sepulturas violadas e terra gélida",
    threat: "Cérbero da Podridão, Zumbis e Esqueletos",
    boss: "Cérbero da Podridão",
    rooms: [
      { id: "cr-00", x: 2, y: 7, w: 3, h: 2, label: "Entrada" },
      { id: "cr-01", x: 2, y: 4, w: 4, h: 2, label: "Túmulos" },
      { id: "cr-02", x: 6, y: 4, w: 3, h: 2, label: "Névoa" },
      { id: "cr-03", x: 6, y: 1, w: 2, h: 2, secret: true, label: "Portão ?" },
      { id: "cr-04", x: 6, y: 7, w: 4, h: 2, boss: true, label: "Covil" }
    ],
    chronicle: "Além do cemitério comum, a Floresta da Cripta é um domínio sombrio sob ameaça do Cérbero da Podridão, que abre as fendas para que os mortos caminhem entre as lápides.",
    secrets: "Lápides antigas escondem bênçãos de proteção e passagens secretas que levam à cabana isolada na névoa.",
    tip: "O veneno dos mortos corrói a cada passo. Mantenha distância do Cérbero e utilize os altares para purificar o terreno."
  },
  {
    id: "bruxa",
    name: "Cabana da Bruxa",
    title: "O Recanto Oculto do Feitiço",
    icon: "icon-crys-temple",
    danger: "★★★★★",
    climate: "Penumbra misteriosa, aroma de ervas e luz esmeralda",
    threat: "Bruxa das Sepulturas, Feitiços e Poções",
    boss: "Bruxa das Sepulturas",
    rooms: [
      { id: "bx-00", x: 4, y: 4, w: 6, h: 4, boss: true, label: "Cabana" }
    ],
    chronicle: "Escondida no coração da Floresta da Cripta, a cabana de palafitas da velha bruxa é o epicentro do envenenamento mágico que aflige os heróis desavisados.",
    secrets: "Atrás dos caldeirões borbulhantes encontram-se receitas de antídotos ancestrais capazes de quebrar a maldição.",
    tip: "A bruxa conjura maldições em área. Desvie dos projéteis arcanos verdes e ataque-a durante o intervalo de canalização."
  }
];'''

for bp in bundles:
    if not os.path.exists(bp):
        continue
    with open(bp, "r", encoding="utf-8") as f:
        code = f.read()

    # Dlg hook
    if old_dlg_hook in code:
        code = code.replace(old_dlg_hook, new_dlg_hook)
        print(f"Updated __dlg hook in {bp}")
    else:
        print(f"Note: old __dlg hook pattern not found in {bp} (might already be patched)")

    # Preload maps
    if old_preload_maps in code:
        code = code.replace(old_preload_maps, new_preload_maps)
        print(f"Updated preload maps with ?v=5.71 in {bp}")

    # Render img
    if old_render_img in code:
        code = code.replace(old_render_img, new_render_img)
        print(f"Updated renderBiomePage with self-healing loading in {bp}")

    # Codex biomes
    if old_biomes_end in code:
        code = code.replace(old_biomes_end, new_biomes_end)
        print(f"Added cripta and bruxa biomes to __CODEX_BIOMES in {bp}")

    with open(bp, "w", encoding="utf-8") as f:
        f.write(code)

# 2. SW.JS BUMP
sw_files = [
    os.path.join(ROOT, "sw.js"),
    os.path.join(ROOT, "Projeto atualizado", "sw.js")
]
old_cache = 'const CACHE = "ded-web-v5.46.0-missoes";'
new_cache = 'const CACHE = "ded-web-v5.71.0-codex-hd";'

for swp in sw_files:
    if os.path.exists(swp):
        with open(swp, "r", encoding="utf-8") as f:
            sc = f.read()
        if old_cache in sc:
            sc = sc.replace(old_cache, new_cache)
            with open(swp, "w", encoding="utf-8") as f:
                f.write(sc)
            print(f"Updated CACHE in {swp}")

# 3. INDEX.HTML BUMP
html_files = [
    os.path.join(ROOT, "index.html"),
    os.path.join(ROOT, "Projeto atualizado", "index.html")
]
for hp in html_files:
    if os.path.exists(hp):
        with open(hp, "r", encoding="utf-8") as f:
            hc = f.read()
        if "?v=5.70" in hc:
            hc = hc.replace("?v=5.70", "?v=5.71")
            with open(hp, "w", encoding="utf-8") as f:
                f.write(hc)
            print(f"Bumped ?v=5.71 in {hp}")

# 4. RUN BUILD_ASSET_VERSIONS.PY
print("\nRunning scripts/build_asset_versions.py...")
res = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "build_asset_versions.py")], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print("Errors:", res.stderr)

print("All fixes applied successfully!")
