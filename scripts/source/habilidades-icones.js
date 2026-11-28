/* ══ Ícones que faltavam nas habilidades (p216.142) ══
   Estas habilidades ainda mostravam os desenhos provisórios de 20 px (icon-whirlwind, icon-repulse, icon-holy-…).
   Agora têm ícone próprio no estilo dos outros (assets/pixel-art/ui/icons/<ID>.png, scripts/gerar_habilidades_icones.py).
   Os 80 nós das árvores do Infinito sem desenho no atlas de passivas (habilidades e melhorias) passam a usar o ícone da
   habilidade correspondente (NODE: nó → ID). */
{
  const IDS = ["WHIRLWIND", "IRON_SKIN", "DEMOLISHING_BLOW", "FRENZY", "RUPTURE", "ARCANE_BLAST", "SHADOW_STEP", "SMOKE_BOMB", "REPULSE", "BLOODLUST",
    "HOLY_SMITE", "CONSECRATION", "AEGIS", "HOLY_NOVA", "DIVINE_LANCE", "JUDGMENT", "RAIZES_JUREMA", "DARDOS_CURARE", "ESPIRITO_GAVIAO", "SOPRO_PAJE",
    "ESPIRITO_GUARA", "TEMPESTADE_TUPA", "ET_DECOY", "ET_JUREMA_CIRCLE", "ET_TRAMPLE", "ICE_COMET", "ICE_COMET_SHATTER", "SKELETON_SHIELD", "ANCESTRAL_FIRE"];
  const NODE = {"wd_egide":"AEGIS","wd_brado":"GUARDIAN_WAVE","wd_espin":"SHIELD_COUNTER","wd_eco":"TEMPORAL_VEIL","wd_mural":"SHIELD_WALL","wa_gpp":"HEAVY_STRIKE","wa_inv":"SHADOW_STRIKE","wa_invc":"KAZE_GIRI","wa_redm":"WHIRLWIND","wa_redp":"RUPTURE","bd_apa":"SHIELD_COUNTER","bd_kiai":"KIAI","bd_apap":"IAIJUTSU","bd_mente":"TEMPORAL_VEIL","ba_tsu":"TSUMUJI","ba_terr":"RUPTURE","ba_mil":"FAN_OF_BLADES","ba_kaze":"KAZE_GIRI","ba_iai":"IAIJUTSU","ard_salto":"FALCON_DIVE","ard_barr":"VOLLEY","ard_rep":"REPULSE","ard_danca":"SHADOW_DANCE","ara_carr":"AIMED_SHOT","ara_cacho":"EXPLOSIVE_ARROW","ara_leq":"MULTI_SHOT","ara_atr":"PIERCING_ARROW","ara_chuva":"ARROW_RAIN","md_esp":"HOLY_NOVA","md_espd":"MIRROR_STEP","md_expl":"ELEMENTAL_NOVA","md_hier":"JUDGMENT","ma_bft":"FIREBALL","ma_met2":"METEOR","ma_com":"ICE_COMET","ma_come":"ICE_COMET_SHATTER","rd_rol":"SHADOW_STRIKE","rd_isca":"MIRROR_STEP","rd_fum":"SMOKE_BOMB","rd_iscae":"EXPLOSIVE_ARROW","rd_mare":"VEIL_OF_DUSK","rd_somb":"SHADOW_BLINK","ra_gtl":"BACKSTAB","ra_danca":"FAN_OF_BLADES","ra_marca":"DEADLY_MARK","ra_ferr":"GARROTE","ra_msalt":"MIRROR_STEP","nd_arm":"SKELETON_ARMY","nd_escud":"SKELETON_SHIELD","nd_arme":"BONE_SPEAR","nd_exer":"SKELETON_ARMY","na_praga":"VOID_NOVA","na_ceifa":"SOUL_SIPHON","na_lanca":"BONE_SPEAR","hd_fog":"CONSECRATION","hd_uivo":"WILD_PACK","hd_foga":"ANCESTRAL_FIRE","hd_dupla":"SNARE_TRAP","hd_uivr":"KIAI","ha_td":"MULTI_SHOT","ha_tpp":"PIERCING_ARROW","ha_coord":"DEADLY_MARK","ha_mat":"WILD_PACK","ha_perf":"KAISHAKU","sd_circ":"HOLY_NOVA","sd_casca":"AEGIS","sd_rab":"RAIZES_JUREMA","sd_cesp":"THORN_VOLLEY","sa_dguer":"TSUMUJI","sa_curm":"DARDOS_CURARE","sa_sara":"VOLLEY","sa_merg":"ESPIRITO_GAVIAO","sa_selva":"NATURES_WRATH","dd_pis":"DEMOLISHING_BLOW","dd_cc":"ENTANGLING_ROOTS","dd_aguia":"EAGLE_COMPANION","da_merg":"FALCON_DIVE","da_uivo":"BLOODLUST","da_colh":"NIGHT_HARVEST","da_mat":"WILD_PACK"};
  const NEED = [...new Set(Object.values(NODE))];
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      for (const id of IDS) this.textures.exists("ix-" + id) || L.image("ix-" + id, `assets/pixel-art/ui/icons/${id}.png`);
      L.setPath(op);
      for (const id of NEED) this.textures.exists("ix-" + id) || L.image("ix-" + id, `assets/pixel-art/ui/icons/${id}.png`);
      L.once("complete", () => {
        for (const id of IDS) typeof Ye !== "undefined" && Ye[id] && this.textures.exists("ix-" + id) && (Ye[id].icon = "ix-" + id);
        // nós das árvores do Infinito sem desenho no atlas de passivas: usam o ícone da habilidade (antes, o provisório de 20 px)
        try { for (const id in NODE) { const n = __ETIDX?.[id]?.n; n && this.textures.exists("ix-" + NODE[id]) && !String(n.ic).startsWith("ip-") && (n.ic = "ix-" + NODE[id]) } } catch (e) {}
      });
    } catch (e) {}
    return r;
  };
}
