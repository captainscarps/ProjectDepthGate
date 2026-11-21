/* ══ Inimigos do cemitério com movimento de verdade (p216.79) ══════════════════════════════════════════════════════
   As folhas gw-* (zumbi, coveiro, sudário, espantalho, múmia, bruxa, lobisomem, abominação, vampiro) tinham só as 8
   direções do personagem parado: a "caminhada" girava o boneco em volta de si mesmo e ele deslizava pelo chão.
   Agora cada um tem caminhada, respiração parado e golpe (preparo + ataque) desenhados de perfil — PixelLab
   animate-pixminimax a partir do quadro de perfil (scripts/build_inimigos_gw.py → assets/pixel-art/enemies/v2/).
   Folha nova <textura>-v2: linha 0 andando, 1 parado, 2 golpe (0–3 preparo, 4–7 ataque); quadros de 64 px.   */
const __GW_V2 = ["gw-zombie", "gw-skeleton-gravedigger", "gw-sheet-ghost", "gw-pumpkin-scarecrow", "gw-mummy", "gw-witch", "gw-werewolf", "gw-stitched-brute", "gw-vampire"];
{
  const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  for (const d of Object.values(ee)) {
    if (!d || !__GW_V2.includes(d.texture)) continue;
    const t = d.texture + "-v2";
    try { Si[t] = Si[d.texture] ?? 1 } catch (e) {}
    d.texture = t;
    d.anims = { idle: { frames: R(8, 15), frameRate: 6, repeat: -1 }, walk: { frames: R(0, 7), frameRate: 10, repeat: -1 }, hurt: { frames: [8], frameRate: 8, repeat: 0 },
      death: { frames: [8], frameRate: 4, repeat: 0 }, alert: { frames: [8, 9], frameRate: 6, repeat: 0 }, windup: { frames: R(16, 19), frameRate: 8, repeat: 0 },
      strike: { frames: R(20, 23), frameRate: 14, repeat: 0 }, attack: { frames: R(16, 23), frameRate: 12, repeat: 0 } };
  }
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const k of __GW_V2) this.textures.exists(k + "-v2") || L.spritesheet(k + "-v2", `assets/pixel-art/enemies/v2/${k}.png`, { frameWidth: 64, frameHeight: 64 });
  L.setPath(op) } catch (e) {} return r }}
