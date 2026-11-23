/* ══ Desempenho (p216.114) ═══════════════════════════════════════════════════════════════════════════════════════
   No navegador do celular o jogo rodava com poucos quadros por segundo. Medindo uma fase do Modo Infinito: ~960
   objetos desenhados por quadro e ~800 deles FORA da tela (paredes, topos de parede, ossos, tochas da fase inteira).
   O Phaser só deixa de desenhar o que está fora da câmera nos mapas de tiles; o resto ele processa um por um, todo
   quadro. Agora:
   • RECORTE: imagens e sprites PARADOS do cenário (fora de grupos, que andam com a câmera normal) guardam a própria
     caixa; se a caixa está fora da vista da câmera (com folga), não são desenhados naquele quadro. Mexeu (posição,
     escala, giro, quadro) → a caixa deixa de valer até a próxima medição, então nada some por engano.
   • CELULAR (toque): a queda automática de qualidade gráfica (luz.js) age mais cedo — abaixo de 40 FPS por 3 s
     baixa um nível nesta sessão (no PC continua 26 FPS por 5 s); e telas de 90/120 Hz ficam limitadas a ~60 quadros/s.                                                    */
{
  const TOUCH = (() => { try { return matchMedia("(pointer:coarse)").matches || navigator.maxTouchPoints > 0 && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) } catch (e) { return !1 } })();
  if (TOUCH) { window.__gfxMinFps = window.__gfxMinFps || 40; window.__gfxDropMs = window.__gfxDropMs || 3000 }
  const M = 48, GO = j.GameObjects;
  for (const C of [GO.Image, GO.Sprite]) {
    const P = C?.prototype; if (!P || P.__cull) continue;
    const W0 = P.willRender;
    P.willRender = function (cam) {
      const b = this.__cb;
      if (b && !window.__noCull && this.x === b[4] && this.y === b[5] && this.scaleX === b[6] && this.scaleY === b[7] && this.rotation === b[8] && this.frame === b[9]) {
        const v = cam.worldView;
        if (b[2] < v.x - M || b[0] > v.x + v.width + M || b[3] < v.y - M || b[1] > v.y + v.height + M) return !1;
      }
      return W0.call(this, cam);
    };
    P.__cull = 1;
  }
  /* mede as caixas (só o que está solto na cena, rolando junto com a câmera) */
  const scan = (S) => {
    const L = S.children?.list; if (!L) return;
    for (let i = 0; i < L.length; i++) {
      const o = L[i];
      if (!(o instanceof GO.Image || o instanceof GO.Sprite) || o.scrollFactorX !== 1 || o.scrollFactorY !== 1 || o.parentContainer || o.__noCull) continue;
      const b = o.__cb;
      if (b && o.x === b[4] && o.y === b[5] && o.scaleX === b[6] && o.scaleY === b[7] && o.rotation === b[8] && o.frame === b[9]) continue;
      try { const r = o.getBounds(); o.__cb = [r.x, r.y, r.right, r.bottom, o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.frame] } catch (e) { o.__cb = null }
    }
  };
  const hook = () => {
    const g = window.__DED_GAME; if (!g?.events) return setTimeout(hook, 400);
    let t = 0;
    /* celular com tela de 90/120 Hz: o jogo tentava 120 quadros por segundo (dobro de trabalho, esquenta e engasga);
       limitado a ~60 */
    try { TOUCH && !window.__noFpsCap && g.loop.setFPSLimit?.(62) } catch (e) {}
    g.events.on("poststep", (time, d) => {
      if ((t -= d) > 0) return; t = 400;
      for (const k of ["Game", "Hub"]) { try { const S = g.scene.getScene(k); S?.sys?.isActive() && scan(S) } catch (e) {} }
    });
  };
  hook();
}
