/* ══ Ícones próprios das passivas (árvores do Modo Infinito) ══
   Atlas assets/pixel-art/ui/passives.png/.json (scripts/build_passive_icons.py): um quadro por nó p · top · nm.
   No fim do carregamento cada quadro vira a textura "ip-<id>" e o nó passa a usá-la (árvore e janela de escolha). */
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      this.textures.exists("ipas") || L.atlas("ipas", "assets/pixel-art/ui/passives.png", "assets/pixel-art/ui/passives.json");
      L.setPath(op);
      L.once("complete", () => {
        try {
          const T = this.textures; if (!T.exists("ipas")) return;
          const src = T.get("ipas"), img = src.getSourceImage();
          for (const name of src.getFrameNames()) {
            const k = "ip-" + name, f = src.get(name), nd = __ETIDX?.[name]?.n;
            if (!T.exists(k)) {
              const c = T.createCanvas(k, f.cutWidth, f.cutHeight);
              c.context.imageSmoothingEnabled = !1;
              c.context.drawImage(img, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
              c.refresh();
            }
            nd && (nd.ic = k);
          }
        } catch (e) { console.warn("[passivas]", e) }
      });
    } catch (e) {}
    return r;
  };
}
