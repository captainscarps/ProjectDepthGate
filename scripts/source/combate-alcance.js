/* ══ Alcance do golpe corpo a corpo igual ao que a animação mostra ══
   O arco de acerto ia ~2× além do ponto onde a arma chega no golpe (medido com o arco desenhado sobre o herói no meio
   do golpe): inimigos levavam dano onde a lâmina claramente não encostava. Agora o alcance acompanha o desenho de cada
   arma, com uma pequena folga (o tamanho do inimigo continua contando a favor). Ângulos não mudam; habilidades também não. */
{
  const R = {
    DEFAULT: 38, unarmed: 30, dagger: 33, rogue_dual: 33, shadow_dagger: 33, twin_fangs: 34, assassin_dagger: 34, frostfang: 34,
    boreal_daggers: 33, merchant_razor: 33, sword: 37, frost_blade: 37, dragon_sword: 40, club: 38, simple_staff: 36,
    axe: 42, winter_axe: 42, great_sword: 46, frost_greatsword: 46, dragon_slayer: 46, executioner_cleaver: 44
  };
  try { for (const k of Object.keys(oa)) oa[k].range = R[k] ?? Math.round(oa[k].range * .72) } catch (e) {}
}
