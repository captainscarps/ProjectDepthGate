// Infinite Mode Skill Trees & Roguelike System
// Auto-generated from Árvores de Habilidades do Modo Infinito design document
(() => {
  const INFINITE_TREES = [
  {
    "heroId": "WARRIOR",
    "heroName": "Draven",
    "treeKey": "defense",
    "treeName": "Guarda de Valdrak",
    "shape": "V",
    "mechanic": "Fortificação: cada uma reduz o dano recebido em 4% por 8 s, máximo 5.",
    "nodes": [
      {
        "id": "warrior_def_postura_do_escudo",
        "name": "Postura do Escudo",
        "category": "passive",
        "maxRank": 3,
        "req": "Escudo",
        "rawType": "Passiva I–III",
        "desc": "Bloquear reduz mais 10 / 20 / 30% do dano",
        "requires": [],
        "x": 130,
        "y": 65,
        "nav": {
          "up": null,
          "down": "warrior_def_gide_de_carvalho",
          "left": null,
          "right": "warrior_def_pele_de_ferro"
        }
      },
      {
        "id": "warrior_def_gide_de_carvalho",
        "name": "Égide de Carvalho",
        "category": "active",
        "maxRank": 2,
        "req": "Escudo",
        "rawType": "Ativa I–II",
        "desc": "Escudo que absorve 25% da vida máxima por 6 s; recarga 14 s (II: 10 s)",
        "requires": [
          "warrior_def_postura_do_escudo"
        ],
        "x": 130,
        "y": 115,
        "nav": {
          "up": "warrior_def_postura_do_escudo",
          "down": "warrior_def_gide_espinhosa",
          "left": null,
          "right": "warrior_def_muralha_viva"
        }
      },
      {
        "id": "warrior_def_gide_espinhosa",
        "name": "Égide Espinhosa",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Escudo",
        "rawType": "Aprimora",
        "desc": "Enquanto a Égide dura, projéteis voltam para quem atirou",
        "requires": [
          "warrior_def_gide_de_carvalho"
        ],
        "x": 130,
        "y": 165,
        "nav": {
          "up": "warrior_def_gide_de_carvalho",
          "down": "warrior_def_muralha_viva",
          "left": null,
          "right": "warrior_def_muralha_viva"
        }
      },
      {
        "id": "warrior_def_pele_de_ferro",
        "name": "Pele de Ferro",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "+8 / 16 / 24% de defesa",
        "requires": [],
        "x": 270,
        "y": 65,
        "nav": {
          "up": null,
          "down": "warrior_def_brado_do_cl",
          "left": "warrior_def_postura_do_escudo",
          "right": null
        }
      },
      {
        "id": "warrior_def_brado_do_cl",
        "name": "Brado do Clã",
        "category": "active",
        "maxRank": 2,
        "req": null,
        "rawType": "Ativa I–II",
        "desc": "Puxa inimigos num raio de 4 m e dá 1 Fortificação por inimigo; recarga 12 s (II: 9 s)",
        "requires": [
          "warrior_def_pele_de_ferro"
        ],
        "x": 270,
        "y": 115,
        "nav": {
          "up": "warrior_def_pele_de_ferro",
          "down": "warrior_def_eco_do_brado",
          "left": "warrior_def_muralha_viva",
          "right": null
        }
      },
      {
        "id": "warrior_def_eco_do_brado",
        "name": "Eco do Brado",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora",
        "desc": "Os puxados ficam 40% mais Brado                                            lentos por 3 s",
        "requires": [
          "warrior_def_brado_do_cl"
        ],
        "x": 270,
        "y": 165,
        "nav": {
          "up": "warrior_def_brado_do_cl",
          "down": "warrior_def_muralha_viva",
          "left": "warrior_def_muralha_viva",
          "right": null
        }
      },
      {
        "id": "warrior_def_muralha_viva",
        "name": "Muralha Viva",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Égide Espinhosa + Usar o Brado recarrega metade Eco do Brado                  da Égide",
        "requires": [
          "warrior_def_gide_espinhosa"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "warrior_def_gide_espinhosa",
          "down": "warrior_def_ltimo_rei_de_p",
          "left": "warrior_def_ltimo_rei_de_p",
          "right": "warrior_def_baluarte"
        }
      },
      {
        "id": "warrior_def_ltimo_rei_de_p",
        "name": "Último Rei de Pé",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo",
        "desc": "Uma vez por andar, um golpe fatal deixa 1 de vida e gasta a Fortificação curando 10% por ponto",
        "requires": [
          "warrior_def_muralha_viva"
        ],
        "x": 145,
        "y": 255,
        "nav": {
          "up": "warrior_def_muralha_viva",
          "down": "warrior_def_pedra_de_valdrak",
          "left": null,
          "right": "warrior_def_muralha_viva"
        }
      },
      {
        "id": "warrior_def_baluarte",
        "name": "Baluarte",
        "category": "apex",
        "maxRank": 1,
        "req": "Escudo",
        "rawType": "Topo",
        "desc": "Cada Fortificação também dá (escolha 1)                                      +4% de dano",
        "requires": [
          "warrior_def_muralha_viva"
        ],
        "x": 255,
        "y": 255,
        "nav": {
          "up": "warrior_def_muralha_viva",
          "down": "warrior_def_carvalho_eterno",
          "left": "warrior_def_muralha_viva",
          "right": null
        }
      },
      {
        "id": "warrior_def_pedra_de_valdrak",
        "name": "Pedra de Valdrak",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "warrior_def_ltimo_rei_de_p"
        ],
        "x": 145,
        "y": 298,
        "nav": {
          "up": "warrior_def_ltimo_rei_de_p",
          "down": null,
          "left": null,
          "right": "warrior_def_carvalho_eterno"
        }
      },
      {
        "id": "warrior_def_carvalho_eterno",
        "name": "Carvalho Eterno",
        "category": "nightmare",
        "maxRank": 5,
        "req": "Escudo",
        "rawType": "Pesadelo 1–5",
        "desc": "A Égide absorve ×1,4 por grau",
        "requires": [
          "warrior_def_baluarte"
        ],
        "x": 255,
        "y": 298,
        "nav": {
          "up": "warrior_def_baluarte",
          "down": null,
          "left": "warrior_def_pedra_de_valdrak",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "warrior_def_postura_do_escudo",
        "warrior_def_gide_de_carvalho"
      ],
      [
        "warrior_def_gide_de_carvalho",
        "warrior_def_gide_espinhosa"
      ],
      [
        "warrior_def_pele_de_ferro",
        "warrior_def_brado_do_cl"
      ],
      [
        "warrior_def_brado_do_cl",
        "warrior_def_eco_do_brado"
      ],
      [
        "warrior_def_gide_espinhosa",
        "warrior_def_muralha_viva"
      ],
      [
        "warrior_def_eco_do_brado",
        "warrior_def_muralha_viva"
      ],
      [
        "warrior_def_muralha_viva",
        "warrior_def_ltimo_rei_de_p"
      ],
      [
        "warrior_def_muralha_viva",
        "warrior_def_baluarte"
      ],
      [
        "warrior_def_ltimo_rei_de_p",
        "warrior_def_pedra_de_valdrak"
      ],
      [
        "warrior_def_baluarte",
        "warrior_def_carvalho_eterno"
      ]
    ]
  },
  {
    "heroId": "WARRIOR",
    "heroName": "Draven",
    "treeKey": "attack",
    "treeName": "Fúria das Terras Altas",
    "shape": "Y",
    "mechanic": "Tronco comum se divide em espada (velocidade/crítico) e machado (área/execução).",
    "nodes": [
      {
        "id": "warrior_att_mpeto_4",
        "name": "Ímpeto 4 ===",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "Cada abate dá +5 / 10 / 15% de velocidade por 4 s",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "warrior_att_golpe_pesado_partido",
          "left": "warrior_att_fio_de_a_o",
          "right": "warrior_att_l_mina_do_herdeiro"
        }
      },
      {
        "id": "warrior_att_golpe_pesado_partido",
        "name": "Golpe Pesado Partido",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Golpe",
        "desc": "O alvo perde 30% de defesa por 5 s",
        "requires": [
          "warrior_att_mpeto_4"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "warrior_att_mpeto_4",
          "down": "warrior_att_fio_de_a_o",
          "left": "warrior_att_fio_de_a_o",
          "right": "warrior_att_l_mina_do_herdeiro"
        }
      },
      {
        "id": "warrior_att_fio_de_a_o",
        "name": "Fio de Aço",
        "category": "passive",
        "maxRank": 3,
        "req": "Espada",
        "rawType": "Passiva I–III",
        "desc": "+4 / 8 / 12% de crítico",
        "requires": [
          "warrior_att_golpe_pesado_partido"
        ],
        "x": 130,
        "y": 155,
        "nav": {
          "up": "warrior_att_golpe_pesado_partido",
          "down": "warrior_att_investida_escocesa",
          "left": null,
          "right": "warrior_att_golpe_pesado_partido"
        }
      },
      {
        "id": "warrior_att_investida_escocesa",
        "name": "Investida Escocesa",
        "category": "active",
        "maxRank": 1,
        "req": "Espada",
        "rawType": "Ativa",
        "desc": "Avança 5 m e derruba quem estiver no caminho; recarga 9 s",
        "requires": [
          "warrior_att_fio_de_a_o"
        ],
        "x": 120,
        "y": 205,
        "nav": {
          "up": "warrior_att_fio_de_a_o",
          "down": "warrior_att_investida_em_cadeia",
          "left": null,
          "right": "warrior_att_golpe_pesado_partido"
        }
      },
      {
        "id": "warrior_att_investida_em_cadeia",
        "name": "Investida em Cadeia",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Espada",
        "rawType": "Aprimora",
        "desc": "Matar com a investida zera a recarga",
        "requires": [
          "warrior_att_investida_escocesa"
        ],
        "x": 115,
        "y": 250,
        "nav": {
          "up": "warrior_att_investida_escocesa",
          "down": "warrior_att_redemoinho_puxador",
          "left": null,
          "right": "warrior_att_redemoinho_puxador"
        }
      },
      {
        "id": "warrior_att_l_mina_do_herdeiro",
        "name": "Lâmina do Herdeiro",
        "category": "apex",
        "maxRank": 1,
        "req": "Espada",
        "rawType": "Topo (escolha 1)",
        "desc": "Cada 5º golpe solta uma onda de corte à frente",
        "requires": [
          "warrior_att_golpe_pesado_partido"
        ],
        "x": 270,
        "y": 155,
        "nav": {
          "up": "warrior_att_golpe_pesado_partido",
          "down": "warrior_att_peso_do_machado",
          "left": "warrior_att_golpe_pesado_partido",
          "right": null
        }
      },
      {
        "id": "warrior_att_peso_do_machado",
        "name": "Peso do Machado",
        "category": "passive",
        "maxRank": 3,
        "req": "Machado/Maça",
        "rawType": "Passiva I–III",
        "desc": "+10 / 20 / 30% de dano em atordoados ou com defesa quebrada",
        "requires": [
          "warrior_att_l_mina_do_herdeiro"
        ],
        "x": 280,
        "y": 205,
        "nav": {
          "up": "warrior_att_l_mina_do_herdeiro",
          "down": "warrior_att_redemoinho",
          "left": "warrior_att_golpe_pesado_partido",
          "right": null
        }
      },
      {
        "id": "warrior_att_redemoinho",
        "name": "Redemoinho",
        "category": "active",
        "maxRank": 1,
        "req": "Machado/Maça",
        "rawType": "Ativa",
        "desc": "Gira por 2 s causando dano em área; recarga 11 s",
        "requires": [
          "warrior_att_peso_do_machado"
        ],
        "x": 285,
        "y": 250,
        "nav": {
          "up": "warrior_att_peso_do_machado",
          "down": "warrior_att_executor_de_valdrak",
          "left": "warrior_att_executor_de_valdrak",
          "right": null
        }
      },
      {
        "id": "warrior_att_redemoinho_puxador",
        "name": "Redemoinho Puxador",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Machado/Maça",
        "rawType": "Aprimora",
        "desc": "O giro puxa os inimigos para o centro",
        "requires": [
          "warrior_att_investida_em_cadeia"
        ],
        "x": 150,
        "y": 280,
        "nav": {
          "up": "warrior_att_investida_em_cadeia",
          "down": "warrior_att_f_ria_antiga",
          "left": "warrior_att_investida_em_cadeia",
          "right": "warrior_att_executor_de_valdrak"
        }
      },
      {
        "id": "warrior_att_executor_de_valdrak",
        "name": "Executor de Valdrak",
        "category": "apex",
        "maxRank": 1,
        "req": "Machado/Maça",
        "rawType": "Topo (escolha 1)",
        "desc": "Inimigos abaixo de 15% de vida morrem com qualquer golpe",
        "requires": [
          "warrior_att_redemoinho"
        ],
        "x": 250,
        "y": 280,
        "nav": {
          "up": "warrior_att_redemoinho",
          "down": "warrior_att_sangue_das_terras_altas",
          "left": "warrior_att_redemoinho_puxador",
          "right": "warrior_att_redemoinho"
        }
      },
      {
        "id": "warrior_att_f_ria_antiga",
        "name": "Fúria Antiga",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano ×1,3 por grau",
        "requires": [
          "warrior_att_redemoinho_puxador"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "warrior_att_redemoinho_puxador",
          "down": null,
          "left": null,
          "right": "warrior_att_executor_de_valdrak"
        }
      },
      {
        "id": "warrior_att_sangue_das_terras_altas",
        "name": "Sangue das Terras Altas",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Cada abate cura 1% da vida por grau",
        "requires": [
          "warrior_att_executor_de_valdrak"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "warrior_att_executor_de_valdrak",
          "down": null,
          "left": "warrior_att_redemoinho_puxador",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "warrior_att_mpeto_4",
        "warrior_att_golpe_pesado_partido"
      ],
      [
        "warrior_att_golpe_pesado_partido",
        "warrior_att_fio_de_a_o"
      ],
      [
        "warrior_att_fio_de_a_o",
        "warrior_att_investida_escocesa"
      ],
      [
        "warrior_att_investida_escocesa",
        "warrior_att_investida_em_cadeia"
      ],
      [
        "warrior_att_golpe_pesado_partido",
        "warrior_att_l_mina_do_herdeiro"
      ],
      [
        "warrior_att_l_mina_do_herdeiro",
        "warrior_att_peso_do_machado"
      ],
      [
        "warrior_att_peso_do_machado",
        "warrior_att_redemoinho"
      ],
      [
        "warrior_att_investida_em_cadeia",
        "warrior_att_redemoinho_puxador"
      ],
      [
        "warrior_att_redemoinho",
        "warrior_att_executor_de_valdrak"
      ],
      [
        "warrior_att_redemoinho_puxador",
        "warrior_att_f_ria_antiga"
      ],
      [
        "warrior_att_executor_de_valdrak",
        "warrior_att_sangue_das_terras_altas"
      ]
    ]
  },
  {
    "heroId": "BERSERKER",
    "heroName": "Akihiro",
    "treeKey": "defense",
    "treeName": "Caminho do Vento Calmo",
    "shape": "DIAMOND",
    "mechanic": "Começa na Respiração, abre em aparar e espírito, fecha na Mente Vazia.",
    "nodes": [
      {
        "id": "berserker_def_respira_o",
        "name": "Respiração",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "Parado ou bloqueando, regenera 0,5 / 1 / 1,5% da vida por segundo",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "berserker_def_kamae",
          "left": "berserker_def_kamae",
          "right": "berserker_def_p_s_de_cinza"
        }
      },
      {
        "id": "berserker_def_kamae",
        "name": "Kamae",
        "category": "passive",
        "maxRank": 2,
        "req": "Montante",
        "rawType": "Passiva I–II",
        "desc": "+15 / 30% de defesa nos 2 s depois de atacar",
        "requires": [
          "berserker_def_respira_o"
        ],
        "x": 130,
        "y": 115,
        "nav": {
          "up": "berserker_def_respira_o",
          "down": "berserker_def_aparar_uke",
          "left": null,
          "right": "berserker_def_respira_o"
        }
      },
      {
        "id": "berserker_def_p_s_de_cinza",
        "name": "Pés de Cinza",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "O dash fica invulnerável por mais 0,15 / 0,3 s",
        "requires": [
          "berserker_def_respira_o"
        ],
        "x": 270,
        "y": 115,
        "nav": {
          "up": "berserker_def_respira_o",
          "down": "berserker_def_aparar_perfeito",
          "left": "berserker_def_respira_o",
          "right": null
        }
      },
      {
        "id": "berserker_def_aparar_uke",
        "name": "Aparar (Uke)",
        "category": "active",
        "maxRank": 2,
        "req": "Montante",
        "rawType": "Ativa I–II",
        "desc": "Janela de 0,4 s: o golpe recebido é anulado e devolvido com um corte; recarga 8 s (II: 6 s)",
        "requires": [
          "berserker_def_kamae"
        ],
        "x": 120,
        "y": 165,
        "nav": {
          "up": "berserker_def_kamae",
          "down": "berserker_def_kiai_inabal_vel",
          "left": null,
          "right": "berserker_def_mente_vazia"
        }
      },
      {
        "id": "berserker_def_aparar_perfeito",
        "name": "Aparar Perfeito",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Montante",
        "rawType": "Aprimora Aparar",
        "desc": "O contra-ataque do Aparar é + Iaijutsu                                        um Iaijutsu sem gastar recarga",
        "requires": [
          "berserker_def_p_s_de_cinza"
        ],
        "x": 280,
        "y": 165,
        "nav": {
          "up": "berserker_def_p_s_de_cinza",
          "down": "berserker_def_disciplina",
          "left": "berserker_def_mente_vazia",
          "right": null
        }
      },
      {
        "id": "berserker_def_kiai_inabal_vel",
        "name": "Kiai Inabalável",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Kiai",
        "desc": "O Kiai remove lentidão e atordoamento",
        "requires": [
          "berserker_def_aparar_uke"
        ],
        "x": 130,
        "y": 215,
        "nav": {
          "up": "berserker_def_aparar_uke",
          "down": "berserker_def_juramento_de_satsuma",
          "left": null,
          "right": "berserker_def_mente_vazia"
        }
      },
      {
        "id": "berserker_def_disciplina",
        "name": "Disciplina",
        "category": "passive",
        "maxRank": 2,
        "req": "Kiai Inabalável",
        "rawType": "Passiva I–II",
        "desc": "O Kiai também dá um escudo de 10 / 20% da vida",
        "requires": [
          "berserker_def_aparar_perfeito"
        ],
        "x": 270,
        "y": 215,
        "nav": {
          "up": "berserker_def_aparar_perfeito",
          "down": "berserker_def_montanha",
          "left": "berserker_def_mente_vazia",
          "right": null
        }
      },
      {
        "id": "berserker_def_mente_vazia",
        "name": "Mente Vazia",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Aparar Perfeito + Cada aparar cura 5% e renova Disciplina               o escudo do Kiai",
        "requires": [
          "berserker_def_kiai_inabal_vel"
        ],
        "x": 200,
        "y": 235,
        "nav": {
          "up": "berserker_def_aparar_uke",
          "down": "berserker_def_juramento_de_satsuma",
          "left": "berserker_def_juramento_de_satsuma",
          "right": "berserker_def_montanha"
        }
      },
      {
        "id": "berserker_def_juramento_de_satsuma",
        "name": "Juramento de Satsuma",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Abaixo de 30% de vida, dano recebido −50% por 5 s (uma vez por sala)",
        "requires": [
          "berserker_def_mente_vazia"
        ],
        "x": 145,
        "y": 270,
        "nav": {
          "up": "berserker_def_kiai_inabal_vel",
          "down": "berserker_def_pele_de_cinza",
          "left": null,
          "right": "berserker_def_mente_vazia"
        }
      },
      {
        "id": "berserker_def_montanha",
        "name": "Montanha",
        "category": "apex",
        "maxRank": 1,
        "req": "Pesada",
        "rawType": "Topo (escolha 1)",
        "desc": "Ganha a ativa Muro de Ferro: −60% de dano por 4 s, e quem bate em você queima",
        "requires": [
          "berserker_def_mente_vazia"
        ],
        "x": 255,
        "y": 270,
        "nav": {
          "up": "berserker_def_disciplina",
          "down": "berserker_def_respira_o_profunda",
          "left": "berserker_def_mente_vazia",
          "right": null
        }
      },
      {
        "id": "berserker_def_pele_de_cinza",
        "name": "Pele de Cinza",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "berserker_def_juramento_de_satsuma"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "berserker_def_juramento_de_satsuma",
          "down": null,
          "left": null,
          "right": "berserker_def_mente_vazia"
        }
      },
      {
        "id": "berserker_def_respira_o_profunda",
        "name": "Respiração Profunda",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "A cura da Respiração ×1,5 por grau",
        "requires": [
          "berserker_def_montanha"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "berserker_def_montanha",
          "down": null,
          "left": "berserker_def_mente_vazia",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "berserker_def_respira_o",
        "berserker_def_kamae"
      ],
      [
        "berserker_def_respira_o",
        "berserker_def_p_s_de_cinza"
      ],
      [
        "berserker_def_kamae",
        "berserker_def_aparar_uke"
      ],
      [
        "berserker_def_p_s_de_cinza",
        "berserker_def_aparar_perfeito"
      ],
      [
        "berserker_def_aparar_uke",
        "berserker_def_kiai_inabal_vel"
      ],
      [
        "berserker_def_aparar_perfeito",
        "berserker_def_disciplina"
      ],
      [
        "berserker_def_kiai_inabal_vel",
        "berserker_def_mente_vazia"
      ],
      [
        "berserker_def_disciplina",
        "berserker_def_mente_vazia"
      ],
      [
        "berserker_def_mente_vazia",
        "berserker_def_juramento_de_satsuma"
      ],
      [
        "berserker_def_mente_vazia",
        "berserker_def_montanha"
      ],
      [
        "berserker_def_juramento_de_satsuma",
        "berserker_def_pele_de_cinza"
      ],
      [
        "berserker_def_montanha",
        "berserker_def_respira_o_profunda"
      ]
    ]
  },
  {
    "heroId": "BERSERKER",
    "heroName": "Akihiro",
    "treeKey": "attack",
    "treeName": "Corte Único",
    "shape": "STAIRS",
    "mechanic": "Espinha em zigue-zague de quatro degraus com nós opcionais laterais para armas pesadas.",
    "nodes": [
      {
        "id": "berserker_att_l_mina_afiada",
        "name": "Lâmina Afiada",
        "category": "passive",
        "maxRank": 3,
        "req": "Montante",
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de crítico",
        "requires": [],
        "x": 180,
        "y": 65,
        "nav": {
          "up": null,
          "down": "berserker_att_tsubame_gaeshi",
          "left": "berserker_att_marca_do_corte",
          "right": "berserker_att_tsubame_gaeshi"
        }
      },
      {
        "id": "berserker_att_marca_do_corte",
        "name": "Marca do Corte",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Golpes marcam; 3 marcas causam sangramento por 4 s",
        "requires": [
          "berserker_att_l_mina_afiada"
        ],
        "x": 110,
        "y": 65,
        "nav": {
          "up": null,
          "down": "berserker_att_kaze_giri_duplo",
          "left": null,
          "right": "berserker_att_l_mina_afiada"
        }
      },
      {
        "id": "berserker_att_tsubame_gaeshi",
        "name": "Tsubame- gaeshi",
        "category": "active",
        "maxRank": 1,
        "req": "Montante",
        "rawType": "Ativa",
        "desc": "Corte de ida e volta; recarga 7 s",
        "requires": [
          "berserker_att_l_mina_afiada"
        ],
        "x": 220,
        "y": 115,
        "nav": {
          "up": "berserker_att_l_mina_afiada",
          "down": "berserker_att_iaijutsu_rel_mpago",
          "left": "berserker_att_l_mina_afiada",
          "right": "berserker_att_mil_cortes"
        }
      },
      {
        "id": "berserker_att_mil_cortes",
        "name": "Mil Cortes",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Tsubame-gaeshi + A volta do corte consome as Marca do Corte                marcas: +40% de dano por marca",
        "requires": [
          "berserker_att_tsubame_gaeshi"
        ],
        "x": 290,
        "y": 115,
        "nav": {
          "up": null,
          "down": "berserker_att_terremoto_de_cinzas",
          "left": "berserker_att_tsubame_gaeshi",
          "right": null
        }
      },
      {
        "id": "berserker_att_iaijutsu_rel_mpago",
        "name": "Iaijutsu Relâmpago",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Montante",
        "rawType": "Aprimora",
        "desc": "O Iaijutsu atravessa e marca todos que toca",
        "requires": [
          "berserker_att_tsubame_gaeshi"
        ],
        "x": 180,
        "y": 165,
        "nav": {
          "up": "berserker_att_tsubame_gaeshi",
          "down": "berserker_att_peso_total",
          "left": "berserker_att_kaze_giri_duplo",
          "right": "berserker_att_tsubame_gaeshi"
        }
      },
      {
        "id": "berserker_att_kaze_giri_duplo",
        "name": "Kaze-Giri Duplo",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora",
        "desc": "Lança dois cortes em V Kaze-Giri",
        "requires": [
          "berserker_att_iaijutsu_rel_mpago"
        ],
        "x": 110,
        "y": 165,
        "nav": {
          "up": "berserker_att_marca_do_corte",
          "down": "berserker_att_batto_jutsu",
          "left": null,
          "right": "berserker_att_iaijutsu_rel_mpago"
        }
      },
      {
        "id": "berserker_att_peso_total",
        "name": "Peso Total",
        "category": "passive",
        "maxRank": 3,
        "req": "Pesada",
        "rawType": "Passiva I–III",
        "desc": "Golpes carregados +15 / 30 / 45% de dano",
        "requires": [
          "berserker_att_iaijutsu_rel_mpago"
        ],
        "x": 220,
        "y": 215,
        "nav": {
          "up": "berserker_att_iaijutsu_rel_mpago",
          "down": "berserker_att_sakurajima_desperta",
          "left": "berserker_att_iaijutsu_rel_mpago",
          "right": "berserker_att_sakurajima_desperta"
        }
      },
      {
        "id": "berserker_att_terremoto_de_cinzas",
        "name": "Terremoto de Cinzas",
        "category": "active",
        "maxRank": 1,
        "req": "Pesada",
        "rawType": "Ativa",
        "desc": "Golpe no chão: área de 3 m, derruba; recarga 10 s",
        "requires": [
          "berserker_att_peso_total"
        ],
        "x": 290,
        "y": 215,
        "nav": {
          "up": "berserker_att_mil_cortes",
          "down": "berserker_att_sakurajima_desperta",
          "left": "berserker_att_sakurajima_desperta",
          "right": null
        }
      },
      {
        "id": "berserker_att_batto_jutsu",
        "name": "Batto-jutsu",
        "category": "apex",
        "maxRank": 1,
        "req": "Montante",
        "rawType": "Topo (escolha",
        "desc": "O primeiro golpe em cada sala é 1)                                                crítico ×3",
        "requires": [
          "berserker_att_peso_total"
        ],
        "x": 145,
        "y": 265,
        "nav": {
          "up": "berserker_att_peso_total",
          "down": "berserker_att_fio_da_alma",
          "left": null,
          "right": "berserker_att_peso_total"
        }
      },
      {
        "id": "berserker_att_sakurajima_desperta",
        "name": "Sakurajima Desperta",
        "category": "apex",
        "maxRank": 1,
        "req": "Pesada",
        "rawType": "Topo (escolha",
        "desc": "O Terremoto vira erupção e deixa lava no chão por 4 s",
        "requires": [
          "berserker_att_peso_total"
        ],
        "x": 255,
        "y": 265,
        "nav": {
          "up": "berserker_att_peso_total",
          "down": "berserker_att_kiai_de_guerra",
          "left": "berserker_att_peso_total",
          "right": "berserker_att_terremoto_de_cinzas"
        }
      },
      {
        "id": "berserker_att_fio_da_alma",
        "name": "Fio da Alma",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano crítico ×1,35 por grau",
        "requires": [
          "berserker_att_batto_jutsu"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "berserker_att_batto_jutsu",
          "down": null,
          "left": null,
          "right": "berserker_att_kiai_de_guerra"
        }
      },
      {
        "id": "berserker_att_kiai_de_guerra",
        "name": "Kiai de Guerra",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Durante o Kiai, dano ×1,2 por grau",
        "requires": [
          "berserker_att_sakurajima_desperta"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "berserker_att_sakurajima_desperta",
          "down": null,
          "left": "berserker_att_fio_da_alma",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "berserker_att_l_mina_afiada",
        "berserker_att_tsubame_gaeshi"
      ],
      [
        "berserker_att_tsubame_gaeshi",
        "berserker_att_iaijutsu_rel_mpago"
      ],
      [
        "berserker_att_iaijutsu_rel_mpago",
        "berserker_att_peso_total"
      ],
      [
        "berserker_att_l_mina_afiada",
        "berserker_att_marca_do_corte"
      ],
      [
        "berserker_att_tsubame_gaeshi",
        "berserker_att_mil_cortes"
      ],
      [
        "berserker_att_iaijutsu_rel_mpago",
        "berserker_att_kaze_giri_duplo"
      ],
      [
        "berserker_att_peso_total",
        "berserker_att_terremoto_de_cinzas"
      ],
      [
        "berserker_att_peso_total",
        "berserker_att_batto_jutsu"
      ],
      [
        "berserker_att_peso_total",
        "berserker_att_sakurajima_desperta"
      ],
      [
        "berserker_att_batto_jutsu",
        "berserker_att_fio_da_alma"
      ],
      [
        "berserker_att_sakurajima_desperta",
        "berserker_att_kiai_de_guerra"
      ]
    ]
  },
  {
    "heroId": "ARCHER",
    "heroName": "Hayato",
    "treeKey": "defense",
    "treeName": "Vento de Cinzas",
    "shape": "Y_INV",
    "mechanic": "Duas entradas (mobilidade e posição) que se juntam num tronco só.",
    "nodes": [
      {
        "id": "archer_def_passo_leve",
        "name": "Passo Leve",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de velocidade",
        "requires": [],
        "x": 130,
        "y": 65,
        "nav": {
          "up": null,
          "down": "archer_def_salto_para_tr_s",
          "left": null,
          "right": "archer_def_repuls_o_forte"
        }
      },
      {
        "id": "archer_def_salto_para_tr_s",
        "name": "Salto Para Trás",
        "category": "active",
        "maxRank": 2,
        "req": "Arco curto",
        "rawType": "Ativa I–II",
        "desc": "Recua 4 m e atira ao pousar; recarga 8 s (II: 2 cargas)",
        "requires": [
          "archer_def_passo_leve"
        ],
        "x": 145,
        "y": 115,
        "nav": {
          "up": "archer_def_passo_leve",
          "down": "archer_def_repuls_o_forte",
          "left": null,
          "right": "archer_def_repuls_o_forte"
        }
      },
      {
        "id": "archer_def_dist_ncia_segura",
        "name": "Distância Segura",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "Sem inimigo a menos de 3 m: +8 / 16 / 24% de defesa",
        "requires": [],
        "x": 270,
        "y": 65,
        "nav": {
          "up": null,
          "down": "archer_def_barreira_de_flechas",
          "left": "archer_def_repuls_o_forte",
          "right": null
        }
      },
      {
        "id": "archer_def_barreira_de_flechas",
        "name": "Barreira de Flechas",
        "category": "active",
        "maxRank": 2,
        "req": "Arco longo",
        "rawType": "Ativa I–II",
        "desc": "Crava flechas numa cerca que bloqueia inimigos por 4 s; recarga 14 s (II: 10 s)",
        "requires": [
          "archer_def_dist_ncia_segura"
        ],
        "x": 255,
        "y": 115,
        "nav": {
          "up": "archer_def_dist_ncia_segura",
          "down": "archer_def_repuls_o_forte",
          "left": "archer_def_repuls_o_forte",
          "right": null
        }
      },
      {
        "id": "archer_def_repuls_o_forte",
        "name": "Repulsão Forte",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora",
        "desc": "Empurra 50% mais longe e atordoa por 0,5 s",
        "requires": [
          "archer_def_salto_para_tr_s"
        ],
        "x": 200,
        "y": 165,
        "nav": {
          "up": "archer_def_salto_para_tr_s",
          "down": "archer_def_dan_a_do_vento",
          "left": "archer_def_salto_para_tr_s",
          "right": "archer_def_barreira_de_flechas"
        }
      },
      {
        "id": "archer_def_dan_a_do_vento",
        "name": "Dança do Vento",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Passo Leve III + Depois de esquivar, 1 s sem receber dano",
        "requires": [
          "archer_def_repuls_o_forte"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "archer_def_repuls_o_forte",
          "down": "archer_def_fantasma_de_cinza",
          "left": "archer_def_fantasma_de_cinza",
          "right": "archer_def_torre_de_vigia"
        }
      },
      {
        "id": "archer_def_fantasma_de_cinza",
        "name": "Fantasma de Cinza",
        "category": "apex",
        "maxRank": 1,
        "req": "Arco curto",
        "rawType": "Topo (escolha",
        "desc": "Esquivar deixa uma cópia que atira por 3 s",
        "requires": [
          "archer_def_dan_a_do_vento"
        ],
        "x": 145,
        "y": 255,
        "nav": {
          "up": "archer_def_dan_a_do_vento",
          "down": "archer_def_vento_cortante",
          "left": null,
          "right": "archer_def_dan_a_do_vento"
        }
      },
      {
        "id": "archer_def_torre_de_vigia",
        "name": "Torre de Vigia",
        "category": "apex",
        "maxRank": 1,
        "req": "Arco longo",
        "rawType": "Topo (escolha",
        "desc": "Parado por 2 s: alcance e dano 1)                                                  +40%",
        "requires": [
          "archer_def_dan_a_do_vento"
        ],
        "x": 255,
        "y": 255,
        "nav": {
          "up": "archer_def_dan_a_do_vento",
          "down": "archer_def_pena_de_cinza",
          "left": "archer_def_dan_a_do_vento",
          "right": null
        }
      },
      {
        "id": "archer_def_vento_cortante",
        "name": "Vento Cortante",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "archer_def_fantasma_de_cinza"
        ],
        "x": 145,
        "y": 300,
        "nav": {
          "up": "archer_def_fantasma_de_cinza",
          "down": null,
          "left": null,
          "right": "archer_def_pena_de_cinza"
        }
      },
      {
        "id": "archer_def_pena_de_cinza",
        "name": "Pena de Cinza",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano de projéteis recebido ×0,8 por grau",
        "requires": [
          "archer_def_torre_de_vigia"
        ],
        "x": 255,
        "y": 300,
        "nav": {
          "up": "archer_def_torre_de_vigia",
          "down": null,
          "left": "archer_def_vento_cortante",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "archer_def_passo_leve",
        "archer_def_salto_para_tr_s"
      ],
      [
        "archer_def_dist_ncia_segura",
        "archer_def_barreira_de_flechas"
      ],
      [
        "archer_def_salto_para_tr_s",
        "archer_def_repuls_o_forte"
      ],
      [
        "archer_def_barreira_de_flechas",
        "archer_def_repuls_o_forte"
      ],
      [
        "archer_def_repuls_o_forte",
        "archer_def_dan_a_do_vento"
      ],
      [
        "archer_def_dan_a_do_vento",
        "archer_def_fantasma_de_cinza"
      ],
      [
        "archer_def_dan_a_do_vento",
        "archer_def_torre_de_vigia"
      ],
      [
        "archer_def_fantasma_de_cinza",
        "archer_def_vento_cortante"
      ],
      [
        "archer_def_torre_de_vigia",
        "archer_def_pena_de_cinza"
      ]
    ]
  },
  {
    "heroId": "ARCHER",
    "heroName": "Hayato",
    "treeKey": "attack",
    "treeName": "Flecha Certeira",
    "shape": "TRIDENT",
    "mechanic": "Tronco curto se abre em três pontas: arco curto (cadência), arco longo (tiro carregado) e explosivos.",
    "nodes": [
      {
        "id": "archer_att_ponta_perfurante",
        "name": "Ponta Perfurante",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "As flechas atravessam 1 / 2 inimigos",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "archer_att_marca_do_ca_ador_8",
          "left": "archer_att_tiro_r_pido",
          "right": "archer_att_explosiva_em_cacho"
        }
      },
      {
        "id": "archer_att_marca_do_ca_ador_8",
        "name": "Marca do Caçador 8 ===",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "Críticos marcam; marcados recebem +10 / 20% de dano",
        "requires": [
          "archer_att_ponta_perfurante"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "archer_att_ponta_perfurante",
          "down": "archer_att_tiro_carregado",
          "left": "archer_att_tiro_r_pido",
          "right": "archer_att_explosiva_em_cacho"
        }
      },
      {
        "id": "archer_att_tiro_r_pido",
        "name": "Tiro Rápido",
        "category": "passive",
        "maxRank": 3,
        "req": "Arco curto",
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de velocidade de ataque",
        "requires": [
          "archer_att_marca_do_ca_ador_8"
        ],
        "x": 110,
        "y": 160,
        "nav": {
          "up": "archer_att_ponta_perfurante",
          "down": "archer_att_leque_de_flechas",
          "left": null,
          "right": "archer_att_tiro_carregado"
        }
      },
      {
        "id": "archer_att_leque_de_flechas",
        "name": "Leque de Flechas",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Arco curto",
        "rawType": "Aprimora",
        "desc": "+2 flechas no Disparo Múltiplo",
        "requires": [
          "archer_att_tiro_r_pido"
        ],
        "x": 100,
        "y": 210,
        "nav": {
          "up": "archer_att_tiro_r_pido",
          "down": "archer_att_flecha_de_sakurajima",
          "left": null,
          "right": "archer_att_atravessa_tudo"
        }
      },
      {
        "id": "archer_att_flecha_de_sakurajima",
        "name": "Flecha de Sakurajima",
        "category": "apex",
        "maxRank": 1,
        "req": "Arco curto",
        "rawType": "Topo (escolha 1)",
        "desc": "A cada 10 flechas, uma de fogo vulcânico que explode",
        "requires": [
          "archer_att_leque_de_flechas"
        ],
        "x": 100,
        "y": 260,
        "nav": {
          "up": "archer_att_leque_de_flechas",
          "down": "archer_att_mira_do_vulc_o",
          "left": null,
          "right": "archer_att_mira_do_vulc_o"
        }
      },
      {
        "id": "archer_att_tiro_carregado",
        "name": "Tiro Carregado",
        "category": "active",
        "maxRank": 2,
        "req": "Arco longo",
        "rawType": "Ativa I–II",
        "desc": "Segura até 1,5 s para até 3× de dano; recarga 6 s (II: 4 s)",
        "requires": [
          "archer_att_marca_do_ca_ador_8"
        ],
        "x": 200,
        "y": 160,
        "nav": {
          "up": "archer_att_marca_do_ca_ador_8",
          "down": "archer_att_atravessa_tudo",
          "left": "archer_att_tiro_r_pido",
          "right": "archer_att_explosiva_em_cacho"
        }
      },
      {
        "id": "archer_att_atravessa_tudo",
        "name": "Atravessa Tudo",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Arco longo",
        "rawType": "Aprimora Tiro",
        "desc": "Carregado no máximo, atravessa todos os inimigos",
        "requires": [
          "archer_att_tiro_carregado"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "archer_att_tiro_carregado",
          "down": "archer_att_um_tiro_uma_vida",
          "left": "archer_att_leque_de_flechas",
          "right": "archer_att_chuva_de_flechas"
        }
      },
      {
        "id": "archer_att_um_tiro_uma_vida",
        "name": "Um Tiro, Uma Vida",
        "category": "apex",
        "maxRank": 1,
        "req": "Arco longo",
        "rawType": "Topo (escolha 1)",
        "desc": "Carregado no máximo, mata quem estiver abaixo de 25% de vida",
        "requires": [
          "archer_att_atravessa_tudo"
        ],
        "x": 200,
        "y": 260,
        "nav": {
          "up": "archer_att_atravessa_tudo",
          "down": "archer_att_mira_do_vulc_o",
          "left": "archer_att_mira_do_vulc_o",
          "right": "archer_att_vento_de_satsuma"
        }
      },
      {
        "id": "archer_att_explosiva_em_cacho",
        "name": "Explosiva em Cacho",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Flecha",
        "desc": "A explosão solta 3 bombas menores",
        "requires": [
          "archer_att_marca_do_ca_ador_8"
        ],
        "x": 290,
        "y": 160,
        "nav": {
          "up": "archer_att_ponta_perfurante",
          "down": "archer_att_chuva_de_flechas",
          "left": "archer_att_tiro_carregado",
          "right": null
        }
      },
      {
        "id": "archer_att_chuva_de_flechas",
        "name": "Chuva de Flechas",
        "category": "active",
        "maxRank": 1,
        "req": null,
        "rawType": "Ativa",
        "desc": "Chuva de flechas numa área por 3 s; recarga 12 s",
        "requires": [
          "archer_att_explosiva_em_cacho"
        ],
        "x": 300,
        "y": 210,
        "nav": {
          "up": "archer_att_explosiva_em_cacho",
          "down": "archer_att_chuva_explosiva",
          "left": "archer_att_atravessa_tudo",
          "right": null
        }
      },
      {
        "id": "archer_att_chuva_explosiva",
        "name": "Chuva Explosiva",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Explosiva em Cacho + Parte das flechas da chuva explode",
        "requires": [
          "archer_att_chuva_de_flechas"
        ],
        "x": 300,
        "y": 260,
        "nav": {
          "up": "archer_att_chuva_de_flechas",
          "down": "archer_att_vento_de_satsuma",
          "left": "archer_att_vento_de_satsuma",
          "right": null
        }
      },
      {
        "id": "archer_att_mira_do_vulc_o",
        "name": "Mira do Vulcão",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano ×1,3 por grau",
        "requires": [
          "archer_att_flecha_de_sakurajima"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "archer_att_flecha_de_sakurajima",
          "down": null,
          "left": "archer_att_flecha_de_sakurajima",
          "right": "archer_att_um_tiro_uma_vida"
        }
      },
      {
        "id": "archer_att_vento_de_satsuma",
        "name": "Vento de Satsuma",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Velocidade de ataque ×1,1 por grau",
        "requires": [
          "archer_att_chuva_explosiva"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "archer_att_chuva_explosiva",
          "down": null,
          "left": "archer_att_um_tiro_uma_vida",
          "right": "archer_att_chuva_explosiva"
        }
      }
    ],
    "connections": [
      [
        "archer_att_ponta_perfurante",
        "archer_att_marca_do_ca_ador_8"
      ],
      [
        "archer_att_marca_do_ca_ador_8",
        "archer_att_tiro_r_pido"
      ],
      [
        "archer_att_tiro_r_pido",
        "archer_att_leque_de_flechas"
      ],
      [
        "archer_att_leque_de_flechas",
        "archer_att_flecha_de_sakurajima"
      ],
      [
        "archer_att_marca_do_ca_ador_8",
        "archer_att_tiro_carregado"
      ],
      [
        "archer_att_tiro_carregado",
        "archer_att_atravessa_tudo"
      ],
      [
        "archer_att_atravessa_tudo",
        "archer_att_um_tiro_uma_vida"
      ],
      [
        "archer_att_marca_do_ca_ador_8",
        "archer_att_explosiva_em_cacho"
      ],
      [
        "archer_att_explosiva_em_cacho",
        "archer_att_chuva_de_flechas"
      ],
      [
        "archer_att_chuva_de_flechas",
        "archer_att_chuva_explosiva"
      ],
      [
        "archer_att_flecha_de_sakurajima",
        "archer_att_mira_do_vulc_o"
      ],
      [
        "archer_att_chuva_explosiva",
        "archer_att_vento_de_satsuma"
      ]
    ]
  },
  {
    "heroId": "MAGE",
    "heroName": "Arthelia",
    "treeKey": "defense",
    "treeName": "Espelhos de Ra-Khem",
    "shape": "V",
    "mechanic": "Uma coluna de mana e uma de espelhos que se juntam no Hieróglifo Vivo.",
    "nodes": [
      {
        "id": "mage_def_manto_de_mana",
        "name": "Manto de Mana",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "10 / 20 / 30% do dano sai da mana antes da vida",
        "requires": [],
        "x": 130,
        "y": 65,
        "nav": {
          "up": null,
          "down": "mage_def_concentra_o",
          "left": null,
          "right": "mage_def_espelho_solar"
        }
      },
      {
        "id": "mage_def_concentra_o",
        "name": "Concentração",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "Parada, a mana volta 50 / 100% mais rápido",
        "requires": [
          "mage_def_manto_de_mana"
        ],
        "x": 130,
        "y": 115,
        "nav": {
          "up": "mage_def_manto_de_mana",
          "down": "mage_def_explos_o_defensiva",
          "left": null,
          "right": "mage_def_pele_de_gelo"
        }
      },
      {
        "id": "mage_def_explos_o_defensiva",
        "name": "Explosão Defensiva",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora",
        "desc": "A Explosão Arcana dá um escudo de 15% da vida Arcana",
        "requires": [
          "mage_def_concentra_o"
        ],
        "x": 130,
        "y": 165,
        "nav": {
          "up": "mage_def_concentra_o",
          "down": "mage_def_pele_de_gelo",
          "left": null,
          "right": "mage_def_pele_de_gelo"
        }
      },
      {
        "id": "mage_def_espelho_solar",
        "name": "Espelho Solar",
        "category": "active",
        "maxRank": 2,
        "req": "Cajado arcano",
        "rawType": "Ativa I–II",
        "desc": "Reflete projéteis por 3 s; recarga 12 s (II: 9 s)",
        "requires": [],
        "x": 270,
        "y": 65,
        "nav": {
          "up": null,
          "down": "mage_def_espelho_duplo",
          "left": "mage_def_manto_de_mana",
          "right": null
        }
      },
      {
        "id": "mage_def_espelho_duplo",
        "name": "Espelho Duplo",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Cajado arcano",
        "rawType": "Aprimora",
        "desc": "O espelho acompanha você Espelho                                               enquanto dura",
        "requires": [
          "mage_def_espelho_solar"
        ],
        "x": 270,
        "y": 115,
        "nav": {
          "up": "mage_def_espelho_solar",
          "down": "mage_def_hier_glifo_vivo",
          "left": "mage_def_pele_de_gelo",
          "right": null
        }
      },
      {
        "id": "mage_def_hier_glifo_vivo",
        "name": "Hieróglifo Vivo",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Espelho Duplo + Cada projétil refletido Explosão Defensiva            devolve 2% de mana",
        "requires": [
          "mage_def_espelho_duplo"
        ],
        "x": 270,
        "y": 165,
        "nav": {
          "up": "mage_def_espelho_duplo",
          "down": "mage_def_pele_de_gelo",
          "left": "mage_def_pele_de_gelo",
          "right": null
        }
      },
      {
        "id": "mage_def_pele_de_gelo",
        "name": "Pele de Gelo",
        "category": "passive",
        "maxRank": 3,
        "req": "Cajado de gelo",
        "rawType": "Passiva I–III",
        "desc": "Quem ataca corpo a corpo (solta)                                               fica 15 / 25 / 35% mais lento",
        "requires": [
          "mage_def_explos_o_defensiva"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "mage_def_explos_o_defensiva",
          "down": "mage_def_sarc_fago",
          "left": "mage_def_sarc_fago",
          "right": "mage_def_inverno_de_ra_khem"
        }
      },
      {
        "id": "mage_def_sarc_fago",
        "name": "Sarcófago",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Uma vez por andar, ao cair fica presa num cristal por 3 s e volta com 40% de vida",
        "requires": [
          "mage_def_pele_de_gelo"
        ],
        "x": 145,
        "y": 255,
        "nav": {
          "up": "mage_def_pele_de_gelo",
          "down": "mage_def_manto_antigo",
          "left": null,
          "right": "mage_def_pele_de_gelo"
        }
      },
      {
        "id": "mage_def_inverno_de_ra_khem",
        "name": "Inverno de Ra- Khem",
        "category": "apex",
        "maxRank": 1,
        "req": "Cajado de gelo",
        "rawType": "Topo (escolha 1)",
        "desc": "Ganha a ativa Prisão de Gelo: 2 s imune dentro do gelo, congelando quem estiver perto",
        "requires": [
          "mage_def_pele_de_gelo"
        ],
        "x": 255,
        "y": 255,
        "nav": {
          "up": "mage_def_pele_de_gelo",
          "down": "mage_def_po_o_de_mana",
          "left": "mage_def_pele_de_gelo",
          "right": null
        }
      },
      {
        "id": "mage_def_manto_antigo",
        "name": "Manto Antigo",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "mage_def_sarc_fago"
        ],
        "x": 145,
        "y": 298,
        "nav": {
          "up": "mage_def_sarc_fago",
          "down": null,
          "left": null,
          "right": "mage_def_po_o_de_mana"
        }
      },
      {
        "id": "mage_def_po_o_de_mana",
        "name": "Poço de Mana",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Mana máxima ×1,25 por grau",
        "requires": [
          "mage_def_inverno_de_ra_khem"
        ],
        "x": 255,
        "y": 298,
        "nav": {
          "up": "mage_def_inverno_de_ra_khem",
          "down": null,
          "left": "mage_def_manto_antigo",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "mage_def_manto_de_mana",
        "mage_def_concentra_o"
      ],
      [
        "mage_def_concentra_o",
        "mage_def_explos_o_defensiva"
      ],
      [
        "mage_def_espelho_solar",
        "mage_def_espelho_duplo"
      ],
      [
        "mage_def_espelho_duplo",
        "mage_def_hier_glifo_vivo"
      ],
      [
        "mage_def_explos_o_defensiva",
        "mage_def_pele_de_gelo"
      ],
      [
        "mage_def_hier_glifo_vivo",
        "mage_def_pele_de_gelo"
      ],
      [
        "mage_def_pele_de_gelo",
        "mage_def_sarc_fago"
      ],
      [
        "mage_def_pele_de_gelo",
        "mage_def_inverno_de_ra_khem"
      ],
      [
        "mage_def_sarc_fago",
        "mage_def_manto_antigo"
      ],
      [
        "mage_def_inverno_de_ra_khem",
        "mage_def_po_o_de_mana"
      ]
    ]
  },
  {
    "heroId": "MAGE",
    "heroName": "Arthelia",
    "treeKey": "attack",
    "treeName": "Fogo do Deserto",
    "shape": "Y",
    "mechanic": "Tronco arcano que se divide por fogo (área/queimadura) ou gelo (controle/estilhaços).",
    "nodes": [
      {
        "id": "mage_att_precis_o_arcana_10",
        "name": "Precisão Arcana 10 ===",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "+4 / 8 / 12% de crítico mágico",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "mage_att_sobrecarga",
          "left": "mage_att_combust_o",
          "right": "mage_att_sol_de_ra_khem"
        }
      },
      {
        "id": "mage_att_sobrecarga",
        "name": "Sobrecarga",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Cada 4º feitiço causa o dobro de dano",
        "requires": [
          "mage_att_precis_o_arcana_10"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "mage_att_precis_o_arcana_10",
          "down": "mage_att_combust_o",
          "left": "mage_att_combust_o",
          "right": "mage_att_sol_de_ra_khem"
        }
      },
      {
        "id": "mage_att_combust_o",
        "name": "Combustão",
        "category": "passive",
        "maxRank": 3,
        "req": "Cajado de",
        "rawType": "Passiva I–III",
        "desc": "Queimaduras duram +1 / 2 / 3 s fogo",
        "requires": [
          "mage_att_sobrecarga"
        ],
        "x": 130,
        "y": 155,
        "nav": {
          "up": "mage_att_sobrecarga",
          "down": "mage_att_bola_de_fogo_tripla",
          "left": null,
          "right": "mage_att_sobrecarga"
        }
      },
      {
        "id": "mage_att_bola_de_fogo_tripla",
        "name": "Bola de Fogo Tripla",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Aprimora Bola de",
        "desc": "Três bolas em leque fogo",
        "requires": [
          "mage_att_combust_o"
        ],
        "x": 120,
        "y": 205,
        "nav": {
          "up": "mage_att_combust_o",
          "down": "mage_att_meteoro_duplo",
          "left": null,
          "right": "mage_att_sobrecarga"
        }
      },
      {
        "id": "mage_att_meteoro_duplo",
        "name": "Meteoro Duplo",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Aprimora",
        "desc": "Um segundo meteoro cai 1 s depois Meteoro                 fogo",
        "requires": [
          "mage_att_bola_de_fogo_tripla"
        ],
        "x": 115,
        "y": 250,
        "nav": {
          "up": "mage_att_bola_de_fogo_tripla",
          "down": "mage_att_cometa_estilha_ante",
          "left": null,
          "right": "mage_att_cometa_estilha_ante"
        }
      },
      {
        "id": "mage_att_sol_de_ra_khem",
        "name": "Sol de Ra-Khem",
        "category": "apex",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Topo (escolha 1)",
        "desc": "O Meteoro deixa um sol que queima fogo              a área por 5 s",
        "requires": [
          "mage_att_sobrecarga"
        ],
        "x": 270,
        "y": 155,
        "nav": {
          "up": "mage_att_sobrecarga",
          "down": "mage_att_frio_cortante",
          "left": "mage_att_sobrecarga",
          "right": null
        }
      },
      {
        "id": "mage_att_frio_cortante",
        "name": "Frio Cortante",
        "category": "passive",
        "maxRank": 3,
        "req": "Cajado de",
        "rawType": "Passiva I–III",
        "desc": "Inimigos lentos recebem +10 / 20 / gelo              30% de dano",
        "requires": [
          "mage_att_sol_de_ra_khem"
        ],
        "x": 280,
        "y": 205,
        "nav": {
          "up": "mage_att_sol_de_ra_khem",
          "down": "mage_att_cometa_de_gelo",
          "left": "mage_att_sobrecarga",
          "right": null
        }
      },
      {
        "id": "mage_att_cometa_de_gelo",
        "name": "Cometa de Gelo",
        "category": "active",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Ativa",
        "desc": "Projétil que estilhaça e deixa lento; gelo              recarga 7 s",
        "requires": [
          "mage_att_frio_cortante"
        ],
        "x": 285,
        "y": 250,
        "nav": {
          "up": "mage_att_frio_cortante",
          "down": "mage_att_zero_absoluto",
          "left": "mage_att_zero_absoluto",
          "right": null
        }
      },
      {
        "id": "mage_att_cometa_estilha_ante",
        "name": "Cometa Estilhaçante",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Aprimora",
        "desc": "Os estilhaços congelam por 1 s gelo",
        "requires": [
          "mage_att_meteoro_duplo"
        ],
        "x": 150,
        "y": 280,
        "nav": {
          "up": "mage_att_meteoro_duplo",
          "down": "mage_att_chama_eterna",
          "left": "mage_att_meteoro_duplo",
          "right": "mage_att_zero_absoluto"
        }
      },
      {
        "id": "mage_att_zero_absoluto",
        "name": "Zero Absoluto",
        "category": "apex",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Topo (escolha 1)",
        "desc": "Inimigo congelado 3 vezes explode gelo",
        "requires": [
          "mage_att_cometa_de_gelo"
        ],
        "x": 250,
        "y": 280,
        "nav": {
          "up": "mage_att_cometa_de_gelo",
          "down": "mage_att_sobrecarga_arcana",
          "left": "mage_att_cometa_estilha_ante",
          "right": "mage_att_cometa_de_gelo"
        }
      },
      {
        "id": "mage_att_chama_eterna",
        "name": "Chama Eterna",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano de feitiços ×1,3 por grau",
        "requires": [
          "mage_att_cometa_estilha_ante"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "mage_att_cometa_estilha_ante",
          "down": null,
          "left": null,
          "right": "mage_att_zero_absoluto"
        }
      },
      {
        "id": "mage_att_sobrecarga_arcana",
        "name": "Sobrecarga Arcana",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "O 4º feitiço ×1,5 por grau",
        "requires": [
          "mage_att_zero_absoluto"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "mage_att_zero_absoluto",
          "down": null,
          "left": "mage_att_cometa_estilha_ante",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "mage_att_precis_o_arcana_10",
        "mage_att_sobrecarga"
      ],
      [
        "mage_att_sobrecarga",
        "mage_att_combust_o"
      ],
      [
        "mage_att_combust_o",
        "mage_att_bola_de_fogo_tripla"
      ],
      [
        "mage_att_bola_de_fogo_tripla",
        "mage_att_meteoro_duplo"
      ],
      [
        "mage_att_sobrecarga",
        "mage_att_sol_de_ra_khem"
      ],
      [
        "mage_att_sol_de_ra_khem",
        "mage_att_frio_cortante"
      ],
      [
        "mage_att_frio_cortante",
        "mage_att_cometa_de_gelo"
      ],
      [
        "mage_att_meteoro_duplo",
        "mage_att_cometa_estilha_ante"
      ],
      [
        "mage_att_cometa_de_gelo",
        "mage_att_zero_absoluto"
      ],
      [
        "mage_att_cometa_estilha_ante",
        "mage_att_chama_eterna"
      ],
      [
        "mage_att_zero_absoluto",
        "mage_att_sobrecarga_arcana"
      ]
    ]
  },
  {
    "heroId": "ROGUE",
    "heroName": "Seris",
    "treeKey": "defense",
    "treeName": "Neblina de Mahé",
    "shape": "STAIRS",
    "mechanic": "Espinha de esquiva em zigue-zague com nós laterais: fumaça, isca e sombra.",
    "nodes": [
      {
        "id": "rogue_def_reflexos",
        "name": "Reflexos",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "4 / 8 / 12% de chance de esquivar de um golpe",
        "requires": [],
        "x": 180,
        "y": 65,
        "nav": {
          "up": null,
          "down": "rogue_def_contra_ataque_na_sombra",
          "left": "rogue_def_rolamento",
          "right": "rogue_def_contra_ataque_na_sombra"
        }
      },
      {
        "id": "rogue_def_rolamento",
        "name": "Rolamento",
        "category": "active",
        "maxRank": 2,
        "req": "Adagas gêmeas",
        "rawType": "Ativa I–II",
        "desc": "Rola atravessando inimigos; recarga 6 s (II: 2 cargas)",
        "requires": [
          "rogue_def_reflexos"
        ],
        "x": 110,
        "y": 65,
        "nav": {
          "up": null,
          "down": "rogue_def_isca",
          "left": null,
          "right": "rogue_def_reflexos"
        }
      },
      {
        "id": "rogue_def_contra_ataque_na_sombra",
        "name": "Contra-ataque na Sombra",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Depois de esquivar, o próximo golpe é crítico",
        "requires": [
          "rogue_def_reflexos"
        ],
        "x": 220,
        "y": 115,
        "nav": {
          "up": "rogue_def_reflexos",
          "down": "rogue_def_fuma_a_t_xica",
          "left": "rogue_def_reflexos",
          "right": "rogue_def_mar_baixa"
        }
      },
      {
        "id": "rogue_def_mar_baixa",
        "name": "Maré Baixa",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Reflexos III + Esquivar de um golpe Rolamento II            recarrega o Rolamento",
        "requires": [
          "rogue_def_contra_ataque_na_sombra"
        ],
        "x": 290,
        "y": 115,
        "nav": {
          "up": null,
          "down": "rogue_def_sombra_fugidia",
          "left": "rogue_def_contra_ataque_na_sombra",
          "right": null
        }
      },
      {
        "id": "rogue_def_fuma_a_t_xica",
        "name": "Fumaça Tóxica",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Bomba",
        "desc": "A fumaça envenena quem fica de Fumaça                                        nela",
        "requires": [
          "rogue_def_contra_ataque_na_sombra"
        ],
        "x": 180,
        "y": 165,
        "nav": {
          "up": "rogue_def_contra_ataque_na_sombra",
          "down": "rogue_def_isca_explosiva",
          "left": "rogue_def_isca",
          "right": "rogue_def_contra_ataque_na_sombra"
        }
      },
      {
        "id": "rogue_def_isca",
        "name": "Isca",
        "category": "active",
        "maxRank": 2,
        "req": "Adaga única",
        "rawType": "Ativa I–II",
        "desc": "Deixa um boneco que atrai os inimigos por 3 s; recarga 14 s (II: 10 s)",
        "requires": [
          "rogue_def_fuma_a_t_xica"
        ],
        "x": 110,
        "y": 165,
        "nav": {
          "up": "rogue_def_rolamento",
          "down": "rogue_def_ningu_m_me_v",
          "left": null,
          "right": "rogue_def_fuma_a_t_xica"
        }
      },
      {
        "id": "rogue_def_isca_explosiva",
        "name": "Isca Explosiva",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Adaga única",
        "rawType": "Aprimora Isca",
        "desc": "O boneco explode quando some",
        "requires": [
          "rogue_def_fuma_a_t_xica"
        ],
        "x": 220,
        "y": 215,
        "nav": {
          "up": "rogue_def_fuma_a_t_xica",
          "down": "rogue_def_l_mina_na_fuma_a",
          "left": "rogue_def_fuma_a_t_xica",
          "right": "rogue_def_l_mina_na_fuma_a"
        }
      },
      {
        "id": "rogue_def_sombra_fugidia",
        "name": "Sombra Fugidia",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Passo",
        "desc": "Depois do Passo Sombrio, 1 s Sombrio                                          invisível",
        "requires": [
          "rogue_def_isca_explosiva"
        ],
        "x": 290,
        "y": 215,
        "nav": {
          "up": "rogue_def_mar_baixa",
          "down": "rogue_def_l_mina_na_fuma_a",
          "left": "rogue_def_l_mina_na_fuma_a",
          "right": null
        }
      },
      {
        "id": "rogue_def_ningu_m_me_v",
        "name": "Ninguém me Vê",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Uma vez por sala, um golpe fatal vira um teleporte com 2 s de invisibilidade",
        "requires": [
          "rogue_def_isca_explosiva"
        ],
        "x": 145,
        "y": 265,
        "nav": {
          "up": "rogue_def_isca_explosiva",
          "down": "rogue_def_n_voa_densa",
          "left": null,
          "right": "rogue_def_isca_explosiva"
        }
      },
      {
        "id": "rogue_def_l_mina_na_fuma_a",
        "name": "Lâmina na Fumaça",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Dentro da fumaça: +50% de dano e −30% de dano recebido",
        "requires": [
          "rogue_def_isca_explosiva"
        ],
        "x": 255,
        "y": 265,
        "nav": {
          "up": "rogue_def_isca_explosiva",
          "down": "rogue_def_passos_de_gato",
          "left": "rogue_def_isca_explosiva",
          "right": "rogue_def_sombra_fugidia"
        }
      },
      {
        "id": "rogue_def_n_voa_densa",
        "name": "Névoa Densa",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "rogue_def_ningu_m_me_v"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "rogue_def_ningu_m_me_v",
          "down": null,
          "left": null,
          "right": "rogue_def_passos_de_gato"
        }
      },
      {
        "id": "rogue_def_passos_de_gato",
        "name": "Passos de Gato",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Chance de esquiva ×1,2 por grau (máximo 40%)",
        "requires": [
          "rogue_def_l_mina_na_fuma_a"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "rogue_def_l_mina_na_fuma_a",
          "down": null,
          "left": "rogue_def_n_voa_densa",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "rogue_def_reflexos",
        "rogue_def_contra_ataque_na_sombra"
      ],
      [
        "rogue_def_contra_ataque_na_sombra",
        "rogue_def_fuma_a_t_xica"
      ],
      [
        "rogue_def_fuma_a_t_xica",
        "rogue_def_isca_explosiva"
      ],
      [
        "rogue_def_reflexos",
        "rogue_def_rolamento"
      ],
      [
        "rogue_def_contra_ataque_na_sombra",
        "rogue_def_mar_baixa"
      ],
      [
        "rogue_def_fuma_a_t_xica",
        "rogue_def_isca"
      ],
      [
        "rogue_def_isca_explosiva",
        "rogue_def_sombra_fugidia"
      ],
      [
        "rogue_def_isca_explosiva",
        "rogue_def_ningu_m_me_v"
      ],
      [
        "rogue_def_isca_explosiva",
        "rogue_def_l_mina_na_fuma_a"
      ],
      [
        "rogue_def_ningu_m_me_v",
        "rogue_def_n_voa_densa"
      ],
      [
        "rogue_def_l_mina_na_fuma_a",
        "rogue_def_passos_de_gato"
      ]
    ]
  },
  {
    "heroId": "ROGUE",
    "heroName": "Seris",
    "treeKey": "attack",
    "treeName": "Lâmina do Limiar",
    "shape": "Y",
    "mechanic": "Tronco comum se divide em adagas gêmeas (veneno/combos) e adaga única (marca/execução).",
    "nodes": [
      {
        "id": "rogue_att_pressa",
        "name": "Pressa",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "Cada abate dá +6 / 12 / 18% de velocidade de ataque por 4 s",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "rogue_att_golpe_trai_oeiro_letal",
          "left": "rogue_att_veneno_nas_l_minas",
          "right": "rogue_att_mil_presas"
        }
      },
      {
        "id": "rogue_att_golpe_trai_oeiro_letal",
        "name": "Golpe Traiçoeiro Letal",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Golpe",
        "desc": "×1,5 de dano em envenenados ou marcados",
        "requires": [
          "rogue_att_pressa"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "rogue_att_pressa",
          "down": "rogue_att_veneno_nas_l_minas",
          "left": "rogue_att_veneno_nas_l_minas",
          "right": "rogue_att_mil_presas"
        }
      },
      {
        "id": "rogue_att_veneno_nas_l_minas",
        "name": "Veneno nas Lâminas",
        "category": "passive",
        "maxRank": 3,
        "req": "Adagas gêmeas",
        "rawType": "Passiva I–III",
        "desc": "Golpes envenenam: 2 / 4 / 6 de dano por segundo, por 4 s",
        "requires": [
          "rogue_att_golpe_trai_oeiro_letal"
        ],
        "x": 130,
        "y": 155,
        "nav": {
          "up": "rogue_att_golpe_trai_oeiro_letal",
          "down": "rogue_att_dan_a_das_l_minas",
          "left": null,
          "right": "rogue_att_golpe_trai_oeiro_letal"
        }
      },
      {
        "id": "rogue_att_dan_a_das_l_minas",
        "name": "Dança das Lâminas",
        "category": "active",
        "maxRank": 1,
        "req": "Adagas gêmeas",
        "rawType": "Ativa",
        "desc": "Cinco golpes rápidos seguidos; recarga 9 s",
        "requires": [
          "rogue_att_veneno_nas_l_minas"
        ],
        "x": 120,
        "y": 205,
        "nav": {
          "up": "rogue_att_veneno_nas_l_minas",
          "down": "rogue_att_ferroada",
          "left": null,
          "right": "rogue_att_golpe_trai_oeiro_letal"
        }
      },
      {
        "id": "rogue_att_ferroada",
        "name": "Ferroada",
        "category": "synergy",
        "maxRank": 1,
        "req": "Dança das",
        "rawType": "Sinergia",
        "desc": "O último golpe da Dança Lâminas + Veneno          detona os venenos de uma vez III",
        "requires": [
          "rogue_att_dan_a_das_l_minas"
        ],
        "x": 115,
        "y": 250,
        "nav": {
          "up": "rogue_att_dan_a_das_l_minas",
          "down": "rogue_att_marca_saltitante",
          "left": null,
          "right": "rogue_att_marca_saltitante"
        }
      },
      {
        "id": "rogue_att_mil_presas",
        "name": "Mil Presas",
        "category": "apex",
        "maxRank": 1,
        "req": "Adagas gêmeas",
        "rawType": "Topo (escolha 1)",
        "desc": "A Dança vira dez golpes",
        "requires": [
          "rogue_att_golpe_trai_oeiro_letal"
        ],
        "x": 270,
        "y": 155,
        "nav": {
          "up": "rogue_att_golpe_trai_oeiro_letal",
          "down": "rogue_att_golpe_certeiro",
          "left": "rogue_att_golpe_trai_oeiro_letal",
          "right": null
        }
      },
      {
        "id": "rogue_att_golpe_certeiro",
        "name": "Golpe Certeiro",
        "category": "passive",
        "maxRank": 3,
        "req": "Adaga única",
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de crítico",
        "requires": [
          "rogue_att_mil_presas"
        ],
        "x": 280,
        "y": 205,
        "nav": {
          "up": "rogue_att_mil_presas",
          "down": "rogue_att_marca_da_morte",
          "left": "rogue_att_golpe_trai_oeiro_letal",
          "right": null
        }
      },
      {
        "id": "rogue_att_marca_da_morte",
        "name": "Marca da Morte",
        "category": "active",
        "maxRank": 1,
        "req": "Adaga única",
        "rawType": "Ativa",
        "desc": "Marca um alvo: ele recebe +30% de dano; se morrer, zera as recargas; recarga 12 s",
        "requires": [
          "rogue_att_golpe_certeiro"
        ],
        "x": 285,
        "y": 250,
        "nav": {
          "up": "rogue_att_golpe_certeiro",
          "down": "rogue_att_execu_o_silenciosa",
          "left": "rogue_att_execu_o_silenciosa",
          "right": null
        }
      },
      {
        "id": "rogue_att_marca_saltitante",
        "name": "Marca Saltitante",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Adaga única",
        "rawType": "Aprimora Marca",
        "desc": "Quando o marcado morre, a marca pula para o mais próximo",
        "requires": [
          "rogue_att_ferroada"
        ],
        "x": 150,
        "y": 280,
        "nav": {
          "up": "rogue_att_ferroada",
          "down": "rogue_att_veneno_do_limiar",
          "left": "rogue_att_ferroada",
          "right": "rogue_att_execu_o_silenciosa"
        }
      },
      {
        "id": "rogue_att_execu_o_silenciosa",
        "name": "Execução Silenciosa",
        "category": "apex",
        "maxRank": 1,
        "req": "Adaga única",
        "rawType": "Topo (escolha 1)",
        "desc": "O Golpe Traiçoeiro mata quem estiver abaixo de 30% de vida",
        "requires": [
          "rogue_att_marca_da_morte"
        ],
        "x": 250,
        "y": 280,
        "nav": {
          "up": "rogue_att_marca_da_morte",
          "down": "rogue_att_contrato_de_sangue",
          "left": "rogue_att_marca_saltitante",
          "right": "rogue_att_marca_da_morte"
        }
      },
      {
        "id": "rogue_att_veneno_do_limiar",
        "name": "Veneno do Limiar",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano de veneno ×1,4 por grau",
        "requires": [
          "rogue_att_marca_saltitante"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "rogue_att_marca_saltitante",
          "down": null,
          "left": null,
          "right": "rogue_att_execu_o_silenciosa"
        }
      },
      {
        "id": "rogue_att_contrato_de_sangue",
        "name": "Contrato de Sangue",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano crítico ×1,3 por grau",
        "requires": [
          "rogue_att_execu_o_silenciosa"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "rogue_att_execu_o_silenciosa",
          "down": null,
          "left": "rogue_att_marca_saltitante",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "rogue_att_pressa",
        "rogue_att_golpe_trai_oeiro_letal"
      ],
      [
        "rogue_att_golpe_trai_oeiro_letal",
        "rogue_att_veneno_nas_l_minas"
      ],
      [
        "rogue_att_veneno_nas_l_minas",
        "rogue_att_dan_a_das_l_minas"
      ],
      [
        "rogue_att_dan_a_das_l_minas",
        "rogue_att_ferroada"
      ],
      [
        "rogue_att_golpe_trai_oeiro_letal",
        "rogue_att_mil_presas"
      ],
      [
        "rogue_att_mil_presas",
        "rogue_att_golpe_certeiro"
      ],
      [
        "rogue_att_golpe_certeiro",
        "rogue_att_marca_da_morte"
      ],
      [
        "rogue_att_ferroada",
        "rogue_att_marca_saltitante"
      ],
      [
        "rogue_att_marca_da_morte",
        "rogue_att_execu_o_silenciosa"
      ],
      [
        "rogue_att_marca_saltitante",
        "rogue_att_veneno_do_limiar"
      ],
      [
        "rogue_att_execu_o_silenciosa",
        "rogue_att_contrato_de_sangue"
      ]
    ]
  },
  {
    "heroId": "NECROMANCER",
    "heroName": "Valthor",
    "treeKey": "defense",
    "treeName": "Ossos de Białowieża",
    "shape": "DIAMOND",
    "mechanic": "Começa no Pacto, abre em lacaios e armadura de ossos, fecha no Exército Imortal.",
    "nodes": [
      {
        "id": "necromancer_def_pacto",
        "name": "Pacto",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "10 / 20 / 30% do dano recebido passa para um esqueleto vivo",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "necromancer_def_ossos_duros",
          "left": "necromancer_def_ossos_duros",
          "right": "necromancer_def_esqueletos_escudeiros"
        }
      },
      {
        "id": "necromancer_def_ossos_duros",
        "name": "Ossos Duros",
        "category": "passive",
        "maxRank": 2,
        "req": "Cajado de osso",
        "rawType": "Passiva I–II",
        "desc": "Esqueletos com +30 / 60% de vida",
        "requires": [
          "necromancer_def_pacto"
        ],
        "x": 130,
        "y": 115,
        "nav": {
          "up": "necromancer_def_pacto",
          "down": "necromancer_def_armadura_de_ossos",
          "left": null,
          "right": "necromancer_def_pacto"
        }
      },
      {
        "id": "necromancer_def_esqueletos_escudeiros",
        "name": "Esqueletos Escudeiros",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Cajado de osso",
        "rawType": "Aprimora Invocar",
        "desc": "Os esqueletos ganham escudo e atraem os inimigos",
        "requires": [
          "necromancer_def_pacto"
        ],
        "x": 270,
        "y": 115,
        "nav": {
          "up": "necromancer_def_pacto",
          "down": "necromancer_def_armadura_estilha_ante",
          "left": "necromancer_def_pacto",
          "right": null
        }
      },
      {
        "id": "necromancer_def_armadura_de_ossos",
        "name": "Armadura de Ossos",
        "category": "active",
        "maxRank": 2,
        "req": null,
        "rawType": "Ativa I–II",
        "desc": "Absorve 3 golpes (II: 5); recarga 15 s",
        "requires": [
          "necromancer_def_ossos_duros"
        ],
        "x": 120,
        "y": 165,
        "nav": {
          "up": "necromancer_def_ossos_duros",
          "down": "necromancer_def_ex_rcito_imortal",
          "left": null,
          "right": "necromancer_def_rei_dos_mortos"
        }
      },
      {
        "id": "necromancer_def_armadura_estilha_ante",
        "name": "Armadura Estilhaçante",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora",
        "desc": "Quando a armadura quebra, solta lanças em de Ossos                                                  volta",
        "requires": [
          "necromancer_def_esqueletos_escudeiros"
        ],
        "x": 280,
        "y": 165,
        "nav": {
          "up": "necromancer_def_esqueletos_escudeiros",
          "down": "necromancer_def_medo",
          "left": "necromancer_def_rei_dos_mortos",
          "right": null
        }
      },
      {
        "id": "necromancer_def_ex_rcito_imortal",
        "name": "Exército Imortal",
        "category": "synergy",
        "maxRank": 1,
        "req": "Esqueletos Escudeiros",
        "rawType": "Sinergia",
        "desc": "Um esqueleto destruído volta depois de 3 s Estilhaçante",
        "requires": [
          "necromancer_def_armadura_de_ossos"
        ],
        "x": 130,
        "y": 215,
        "nav": {
          "up": "necromancer_def_armadura_de_ossos",
          "down": "necromancer_def_n_o_morto",
          "left": null,
          "right": "necromancer_def_rei_dos_mortos"
        }
      },
      {
        "id": "necromancer_def_medo",
        "name": "Medo",
        "category": "passive",
        "maxRank": 2,
        "req": "Cetro",
        "rawType": "Passiva I–II",
        "desc": "Inimigos perto de você causam −8 / 16% de dano",
        "requires": [
          "necromancer_def_armadura_estilha_ante"
        ],
        "x": 270,
        "y": 215,
        "nav": {
          "up": "necromancer_def_armadura_estilha_ante",
          "down": "necromancer_def_ossos_de_ferro",
          "left": "necromancer_def_rei_dos_mortos",
          "right": null
        }
      },
      {
        "id": "necromancer_def_rei_dos_mortos",
        "name": "Rei dos Mortos",
        "category": "apex",
        "maxRank": 1,
        "req": "Cajado de osso",
        "rawType": "Topo (escolha 1)",
        "desc": "Invoca um Cavaleiro Esqueleto que fica com você a run toda",
        "requires": [
          "necromancer_def_ex_rcito_imortal"
        ],
        "x": 200,
        "y": 235,
        "nav": {
          "up": "necromancer_def_armadura_de_ossos",
          "down": "necromancer_def_n_o_morto",
          "left": "necromancer_def_n_o_morto",
          "right": "necromancer_def_ossos_de_ferro"
        }
      },
      {
        "id": "necromancer_def_n_o_morto",
        "name": "Não Morto",
        "category": "apex",
        "maxRank": 1,
        "req": "Cetro",
        "rawType": "Topo (escolha 1)",
        "desc": "Uma vez por andar, ao cair vira espectro por 6 s; matando 3 inimigos nesse tempo, volta com 30%",
        "requires": [
          "necromancer_def_rei_dos_mortos"
        ],
        "x": 145,
        "y": 270,
        "nav": {
          "up": "necromancer_def_ex_rcito_imortal",
          "down": "necromancer_def_legi_o",
          "left": null,
          "right": "necromancer_def_rei_dos_mortos"
        }
      },
      {
        "id": "necromancer_def_ossos_de_ferro",
        "name": "Ossos de Ferro",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "necromancer_def_rei_dos_mortos"
        ],
        "x": 255,
        "y": 270,
        "nav": {
          "up": "necromancer_def_medo",
          "down": null,
          "left": "necromancer_def_rei_dos_mortos",
          "right": null
        }
      },
      {
        "id": "necromancer_def_legi_o",
        "name": "Legião",
        "category": "nightmare",
        "maxRank": 5,
        "req": "Cajado de osso",
        "rawType": "Pesadelo 1–5",
        "desc": "Vida dos esqueletos ×1,5 por grau",
        "requires": [
          "necromancer_def_n_o_morto"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "necromancer_def_n_o_morto",
          "down": null,
          "left": null,
          "right": "necromancer_def_rei_dos_mortos"
        }
      }
    ],
    "connections": [
      [
        "necromancer_def_pacto",
        "necromancer_def_ossos_duros"
      ],
      [
        "necromancer_def_pacto",
        "necromancer_def_esqueletos_escudeiros"
      ],
      [
        "necromancer_def_ossos_duros",
        "necromancer_def_armadura_de_ossos"
      ],
      [
        "necromancer_def_esqueletos_escudeiros",
        "necromancer_def_armadura_estilha_ante"
      ],
      [
        "necromancer_def_armadura_de_ossos",
        "necromancer_def_ex_rcito_imortal"
      ],
      [
        "necromancer_def_armadura_estilha_ante",
        "necromancer_def_medo"
      ],
      [
        "necromancer_def_ex_rcito_imortal",
        "necromancer_def_rei_dos_mortos"
      ],
      [
        "necromancer_def_medo",
        "necromancer_def_rei_dos_mortos"
      ],
      [
        "necromancer_def_rei_dos_mortos",
        "necromancer_def_n_o_morto"
      ],
      [
        "necromancer_def_rei_dos_mortos",
        "necromancer_def_ossos_de_ferro"
      ],
      [
        "necromancer_def_n_o_morto",
        "necromancer_def_legi_o"
      ]
    ]
  },
  {
    "heroId": "NECROMANCER",
    "heroName": "Valthor",
    "treeKey": "attack",
    "treeName": "Peste de Cracóvia",
    "shape": "Y_INV",
    "mechanic": "Duas entradas: cetro (maldição/praga) e foice (ceifa/drenagem), unem-se em cadáveres.",
    "nodes": [
      {
        "id": "necromancer_att_maldi_o_profunda",
        "name": "Maldição Profunda",
        "category": "passive",
        "maxRank": 3,
        "req": "Cetro",
        "rawType": "Passiva I–III",
        "desc": "A Nova Maldita dura +2 / 4 / 6 s",
        "requires": [],
        "x": 130,
        "y": 65,
        "nav": {
          "up": null,
          "down": "necromancer_att_praga",
          "left": null,
          "right": "necromancer_att_explos_o_de_cad_ver"
        }
      },
      {
        "id": "necromancer_att_praga",
        "name": "Praga",
        "category": "active",
        "maxRank": 2,
        "req": "Cetro",
        "rawType": "Ativa I–II",
        "desc": "Nuvem que causa dano contínuo por 5 s; recarga 10 s (II: 7 s)",
        "requires": [
          "necromancer_att_maldi_o_profunda"
        ],
        "x": 145,
        "y": 115,
        "nav": {
          "up": "necromancer_att_maldi_o_profunda",
          "down": "necromancer_att_explos_o_de_cad_ver",
          "left": null,
          "right": "necromancer_att_explos_o_de_cad_ver"
        }
      },
      {
        "id": "necromancer_att_colheita",
        "name": "Colheita",
        "category": "passive",
        "maxRank": 3,
        "req": "Foice",
        "rawType": "Passiva I–III",
        "desc": "Cada abate devolve 3 / 6 / 9% de mana",
        "requires": [],
        "x": 270,
        "y": 65,
        "nav": {
          "up": null,
          "down": "necromancer_att_ceifa",
          "left": "necromancer_att_explos_o_de_cad_ver",
          "right": null
        }
      },
      {
        "id": "necromancer_att_ceifa",
        "name": "Ceifa",
        "category": "active",
        "maxRank": 2,
        "req": "Foice",
        "rawType": "Ativa I–II",
        "desc": "Giro da foice que drena vida dos atingidos; recarga 8 s (II: 6 s)",
        "requires": [
          "necromancer_att_colheita"
        ],
        "x": 255,
        "y": 115,
        "nav": {
          "up": "necromancer_att_colheita",
          "down": "necromancer_att_explos_o_de_cad_ver",
          "left": "necromancer_att_explos_o_de_cad_ver",
          "right": null
        }
      },
      {
        "id": "necromancer_att_explos_o_de_cad_ver",
        "name": "Explosão de Cadáver",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Amaldiçoados explodem ao morrer",
        "requires": [
          "necromancer_att_praga"
        ],
        "x": 200,
        "y": 165,
        "nav": {
          "up": "necromancer_att_praga",
          "down": "necromancer_att_lan_a_tripla",
          "left": "necromancer_att_praga",
          "right": "necromancer_att_ceifa"
        }
      },
      {
        "id": "necromancer_att_lan_a_tripla",
        "name": "Lança Tripla",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Lança de",
        "desc": "Três lanças em leque Ossos",
        "requires": [
          "necromancer_att_explos_o_de_cad_ver"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "necromancer_att_explos_o_de_cad_ver",
          "down": "necromancer_att_peste_negra",
          "left": "necromancer_att_peste_negra",
          "right": "necromancer_att_ceifador_de_almas"
        }
      },
      {
        "id": "necromancer_att_peste_negra",
        "name": "Peste Negra",
        "category": "apex",
        "maxRank": 1,
        "req": "Cetro",
        "rawType": "Topo (escolha 1)",
        "desc": "A Praga cobre a sala inteira por 3 s",
        "requires": [
          "necromancer_att_lan_a_tripla"
        ],
        "x": 145,
        "y": 255,
        "nav": {
          "up": "necromancer_att_lan_a_tripla",
          "down": "necromancer_att_pandemia",
          "left": null,
          "right": "necromancer_att_lan_a_tripla"
        }
      },
      {
        "id": "necromancer_att_ceifador_de_almas",
        "name": "Ceifador de Almas",
        "category": "apex",
        "maxRank": 1,
        "req": "Foice",
        "rawType": "Topo (escolha 1)",
        "desc": "Cada alma colhida dá +2% de dano até sair da sala",
        "requires": [
          "necromancer_att_lan_a_tripla"
        ],
        "x": 255,
        "y": 255,
        "nav": {
          "up": "necromancer_att_lan_a_tripla",
          "down": "necromancer_att_fome_dos_mortos",
          "left": "necromancer_att_lan_a_tripla",
          "right": null
        }
      },
      {
        "id": "necromancer_att_pandemia",
        "name": "Pandemia",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano de maldição e praga ×1,35 por grau",
        "requires": [
          "necromancer_att_peste_negra"
        ],
        "x": 145,
        "y": 300,
        "nav": {
          "up": "necromancer_att_peste_negra",
          "down": null,
          "left": null,
          "right": "necromancer_att_fome_dos_mortos"
        }
      },
      {
        "id": "necromancer_att_fome_dos_mortos",
        "name": "Fome dos Mortos",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Drenagem de vida ×1,5 por grau",
        "requires": [
          "necromancer_att_ceifador_de_almas"
        ],
        "x": 255,
        "y": 300,
        "nav": {
          "up": "necromancer_att_ceifador_de_almas",
          "down": null,
          "left": "necromancer_att_pandemia",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "necromancer_att_maldi_o_profunda",
        "necromancer_att_praga"
      ],
      [
        "necromancer_att_colheita",
        "necromancer_att_ceifa"
      ],
      [
        "necromancer_att_praga",
        "necromancer_att_explos_o_de_cad_ver"
      ],
      [
        "necromancer_att_ceifa",
        "necromancer_att_explos_o_de_cad_ver"
      ],
      [
        "necromancer_att_explos_o_de_cad_ver",
        "necromancer_att_lan_a_tripla"
      ],
      [
        "necromancer_att_lan_a_tripla",
        "necromancer_att_peste_negra"
      ],
      [
        "necromancer_att_lan_a_tripla",
        "necromancer_att_ceifador_de_almas"
      ],
      [
        "necromancer_att_peste_negra",
        "necromancer_att_pandemia"
      ],
      [
        "necromancer_att_ceifador_de_almas",
        "necromancer_att_fome_dos_mortos"
      ]
    ]
  },
  {
    "heroId": "HUNTER",
    "heroName": "Kael",
    "treeKey": "defense",
    "treeName": "Matilha do Yukon",
    "shape": "TRIDENT",
    "mechanic": "Tronco de resistência que se abre em três pontas: lobo protetor, fogueira e armadilhas.",
    "nodes": [
      {
        "id": "hunter_def_pelagem_grossa",
        "name": "Pelagem Grossa",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "+6 / 12 / 18% de defesa e imunidade à lentidão do gelo",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "hunter_def_lobo_leal",
          "left": "hunter_def_uivo_de_prote_o",
          "right": "hunter_def_armadilha_defensiva"
        }
      },
      {
        "id": "hunter_def_lobo_leal",
        "name": "Lobo Leal",
        "category": "passive",
        "maxRank": 2,
        "req": "Apito do Lobo",
        "rawType": "Passiva I–II",
        "desc": "O lobo tem +40 / 80% de vida Lobo",
        "requires": [
          "hunter_def_pelagem_grossa"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "hunter_def_pelagem_grossa",
          "down": "hunter_def_fogueira",
          "left": "hunter_def_uivo_de_prote_o",
          "right": "hunter_def_armadilha_defensiva"
        }
      },
      {
        "id": "hunter_def_uivo_de_prote_o",
        "name": "Uivo de Proteção",
        "category": "active",
        "maxRank": 2,
        "req": "Apito do Lobo",
        "rawType": "Ativa I–II",
        "desc": "Por 5 s, o lobo recebe metade do Lobo             dano que seria seu; recarga 16 s (II: 12 s)",
        "requires": [
          "hunter_def_lobo_leal"
        ],
        "x": 110,
        "y": 160,
        "nav": {
          "up": "hunter_def_pelagem_grossa",
          "down": "hunter_def_uivo_ressonante",
          "left": null,
          "right": "hunter_def_fogueira"
        }
      },
      {
        "id": "hunter_def_uivo_ressonante",
        "name": "Uivo Ressonante",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Apito do Lobo",
        "rawType": "Aprimora Uivo",
        "desc": "O uivo atordoa os inimigos perto Lobo             por 1 s",
        "requires": [
          "hunter_def_uivo_de_prote_o"
        ],
        "x": 100,
        "y": 210,
        "nav": {
          "up": "hunter_def_uivo_de_prote_o",
          "down": "hunter_def_esp_rito_h_n",
          "left": null,
          "right": "hunter_def_fogueira_ancestral"
        }
      },
      {
        "id": "hunter_def_esp_rito_h_n",
        "name": "Espírito Hän",
        "category": "apex",
        "maxRank": 1,
        "req": "Apito do Lobo",
        "rawType": "Topo (escolha 1)",
        "desc": "Uma vez por andar, ao cair, o Lobo             lobo espiritual te traz de volta com 50% de vida",
        "requires": [
          "hunter_def_uivo_ressonante"
        ],
        "x": 100,
        "y": 260,
        "nav": {
          "up": "hunter_def_uivo_ressonante",
          "down": "hunter_def_couro_do_norte",
          "left": null,
          "right": "hunter_def_couro_do_norte"
        }
      },
      {
        "id": "hunter_def_fogueira",
        "name": "Fogueira",
        "category": "active",
        "maxRank": 2,
        "req": null,
        "rawType": "Ativa I–II",
        "desc": "Planta uma fogueira que cura 2% da vida por segundo na área por 6 s; recarga 20 s (II: 15 s)",
        "requires": [
          "hunter_def_lobo_leal"
        ],
        "x": 200,
        "y": 160,
        "nav": {
          "up": "hunter_def_lobo_leal",
          "down": "hunter_def_fogueira_ancestral",
          "left": "hunter_def_uivo_de_prote_o",
          "right": "hunter_def_armadilha_defensiva"
        }
      },
      {
        "id": "hunter_def_fogueira_ancestral",
        "name": "Fogueira Ancestral",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Fogueira",
        "desc": "Inimigos evitam entrar na luz da fogueira",
        "requires": [
          "hunter_def_fogueira"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "hunter_def_fogueira",
          "down": "hunter_def_acampamento",
          "left": "hunter_def_uivo_ressonante",
          "right": "hunter_def_armadilha_dupla"
        }
      },
      {
        "id": "hunter_def_acampamento",
        "name": "Acampamento",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Ao plantar a fogueira, três armadilhas aparecem em volta",
        "requires": [
          "hunter_def_fogueira_ancestral"
        ],
        "x": 200,
        "y": 260,
        "nav": {
          "up": "hunter_def_fogueira_ancestral",
          "down": "hunter_def_couro_do_norte",
          "left": "hunter_def_couro_do_norte",
          "right": "hunter_def_alfa_imortal"
        }
      },
      {
        "id": "hunter_def_armadilha_defensiva",
        "name": "Armadilha Defensiva",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Ao levar um golpe, planta uma Armadilha de Espinhos aos seus pés (no máximo a cada 10 s)",
        "requires": [
          "hunter_def_lobo_leal"
        ],
        "x": 290,
        "y": 160,
        "nav": {
          "up": "hunter_def_pelagem_grossa",
          "down": "hunter_def_armadilha_dupla",
          "left": "hunter_def_fogueira",
          "right": null
        }
      },
      {
        "id": "hunter_def_armadilha_dupla",
        "name": "Armadilha Dupla",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Armadilha",
        "desc": "A armadilha ganha 2 cargas de Espinhos",
        "requires": [
          "hunter_def_armadilha_defensiva"
        ],
        "x": 300,
        "y": 210,
        "nav": {
          "up": "hunter_def_armadilha_defensiva",
          "down": "hunter_def_rastro_gelado",
          "left": "hunter_def_fogueira_ancestral",
          "right": null
        }
      },
      {
        "id": "hunter_def_rastro_gelado",
        "name": "Rastro Gelado",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Inimigos presos numa armadilha ficam congelados por 2 s",
        "requires": [
          "hunter_def_armadilha_dupla"
        ],
        "x": 300,
        "y": 260,
        "nav": {
          "up": "hunter_def_armadilha_dupla",
          "down": "hunter_def_alfa_imortal",
          "left": "hunter_def_alfa_imortal",
          "right": null
        }
      },
      {
        "id": "hunter_def_couro_do_norte",
        "name": "Couro do Norte",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "hunter_def_esp_rito_h_n"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "hunter_def_esp_rito_h_n",
          "down": null,
          "left": "hunter_def_esp_rito_h_n",
          "right": "hunter_def_acampamento"
        }
      },
      {
        "id": "hunter_def_alfa_imortal",
        "name": "Alfa Imortal",
        "category": "nightmare",
        "maxRank": 5,
        "req": "Apito do Lobo",
        "rawType": "Pesadelo 1–5",
        "desc": "Vida do lobo ×1,5 por grau Lobo",
        "requires": [
          "hunter_def_rastro_gelado"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "hunter_def_rastro_gelado",
          "down": null,
          "left": "hunter_def_acampamento",
          "right": "hunter_def_rastro_gelado"
        }
      }
    ],
    "connections": [
      [
        "hunter_def_pelagem_grossa",
        "hunter_def_lobo_leal"
      ],
      [
        "hunter_def_lobo_leal",
        "hunter_def_uivo_de_prote_o"
      ],
      [
        "hunter_def_uivo_de_prote_o",
        "hunter_def_uivo_ressonante"
      ],
      [
        "hunter_def_uivo_ressonante",
        "hunter_def_esp_rito_h_n"
      ],
      [
        "hunter_def_lobo_leal",
        "hunter_def_fogueira"
      ],
      [
        "hunter_def_fogueira",
        "hunter_def_fogueira_ancestral"
      ],
      [
        "hunter_def_fogueira_ancestral",
        "hunter_def_acampamento"
      ],
      [
        "hunter_def_lobo_leal",
        "hunter_def_armadilha_defensiva"
      ],
      [
        "hunter_def_armadilha_defensiva",
        "hunter_def_armadilha_dupla"
      ],
      [
        "hunter_def_armadilha_dupla",
        "hunter_def_rastro_gelado"
      ],
      [
        "hunter_def_esp_rito_h_n",
        "hunter_def_couro_do_norte"
      ],
      [
        "hunter_def_rastro_gelado",
        "hunter_def_alfa_imortal"
      ]
    ]
  },
  {
    "heroId": "HUNTER",
    "heroName": "Kael",
    "treeKey": "attack",
    "treeName": "Caçada",
    "shape": "V",
    "mechanic": "Coluna do arco longo e coluna do lobo que se juntam na Caçada Perfeita.",
    "nodes": [
      {
        "id": "hunter_att_olho_do_rastreador",
        "name": "Olho do Rastreador",
        "category": "passive",
        "maxRank": 3,
        "req": "Arco longo",
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de crítico",
        "requires": [],
        "x": 130,
        "y": 65,
        "nav": {
          "up": null,
          "down": "hunter_att_tiro_preciso_perfurante",
          "left": null,
          "right": "hunter_att_f_ria_da_matilha"
        }
      },
      {
        "id": "hunter_att_tiro_preciso_perfurante",
        "name": "Tiro Preciso Perfurante",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Arco longo",
        "rawType": "Aprimora Tiro",
        "desc": "O Tiro Preciso atravessa e faz sangrar",
        "requires": [
          "hunter_att_olho_do_rastreador"
        ],
        "x": 130,
        "y": 115,
        "nav": {
          "up": "hunter_att_olho_do_rastreador",
          "down": "hunter_att_tiro_duplo",
          "left": null,
          "right": "hunter_att_f_ria_da_matilha"
        }
      },
      {
        "id": "hunter_att_tiro_duplo",
        "name": "Tiro Duplo",
        "category": "active",
        "maxRank": 1,
        "req": "Arco curto",
        "rawType": "Ativa (solta)",
        "desc": "Duas flechas rápidas; recarga 5 s",
        "requires": [
          "hunter_att_tiro_preciso_perfurante"
        ],
        "x": 130,
        "y": 165,
        "nav": {
          "up": "hunter_att_tiro_preciso_perfurante",
          "down": "hunter_att_ponto_fraco",
          "left": null,
          "right": "hunter_att_f_ria_da_matilha"
        }
      },
      {
        "id": "hunter_att_presas",
        "name": "Presas",
        "category": "passive",
        "maxRank": 3,
        "req": "Apito do Lobo",
        "rawType": "Passiva I–III",
        "desc": "O lobo causa +15 / 30 / 45% de dano",
        "requires": [],
        "x": 270,
        "y": 65,
        "nav": {
          "up": null,
          "down": "hunter_att_ataque_coordenado",
          "left": "hunter_att_f_ria_da_matilha",
          "right": null
        }
      },
      {
        "id": "hunter_att_ataque_coordenado",
        "name": "Ataque Coordenado",
        "category": "active",
        "maxRank": 2,
        "req": "Apito do Lobo",
        "rawType": "Ativa I–II",
        "desc": "Você e o lobo atacam o mesmo alvo com +50% de dano por 4 s; recarga 12 s (II: 9 s)",
        "requires": [
          "hunter_att_presas"
        ],
        "x": 270,
        "y": 115,
        "nav": {
          "up": "hunter_att_presas",
          "down": "hunter_att_matilha",
          "left": "hunter_att_f_ria_da_matilha",
          "right": null
        }
      },
      {
        "id": "hunter_att_matilha",
        "name": "Matilha",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Apito do Lobo",
        "rawType": "Aprimora",
        "desc": "Chama mais dois lobos Companheiro                                                menores por 10 s Lobo",
        "requires": [
          "hunter_att_ataque_coordenado"
        ],
        "x": 270,
        "y": 165,
        "nav": {
          "up": "hunter_att_ataque_coordenado",
          "down": "hunter_att_ponto_fraco",
          "left": "hunter_att_f_ria_da_matilha",
          "right": null
        }
      },
      {
        "id": "hunter_att_ponto_fraco",
        "name": "Ponto Fraco",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "+15 / 30% de dano contra inimigos presos em armadilha",
        "requires": [
          "hunter_att_tiro_duplo"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "hunter_att_f_ria_da_matilha",
          "down": "hunter_att_ca_ada_perfeita",
          "left": "hunter_att_ca_ada_perfeita",
          "right": "hunter_att_tiro_da_corrida_do_ouro"
        }
      },
      {
        "id": "hunter_att_ca_ada_perfeita",
        "name": "Caçada Perfeita",
        "category": "synergy",
        "maxRank": 1,
        "req": "Tiro Preciso Perfurante",
        "rawType": "Sinergia",
        "desc": "O Tiro Preciso no alvo do + Ataque Coordenado             Ataque Coordenado é sempre crítico",
        "requires": [
          "hunter_att_ponto_fraco"
        ],
        "x": 145,
        "y": 255,
        "nav": {
          "up": "hunter_att_ponto_fraco",
          "down": "hunter_att_rei_da_matilha",
          "left": null,
          "right": "hunter_att_ponto_fraco"
        }
      },
      {
        "id": "hunter_att_tiro_da_corrida_do_ouro",
        "name": "Tiro da Corrida do Ouro",
        "category": "apex",
        "maxRank": 1,
        "req": "Arco longo",
        "rawType": "Topo (escolha 1)",
        "desc": "O Tiro Preciso mata elites abaixo de 40% de vida",
        "requires": [
          "hunter_att_ponto_fraco"
        ],
        "x": 255,
        "y": 255,
        "nav": {
          "up": "hunter_att_ponto_fraco",
          "down": "hunter_att_ca_a_grossa",
          "left": "hunter_att_ponto_fraco",
          "right": null
        }
      },
      {
        "id": "hunter_att_rei_da_matilha",
        "name": "Rei da Matilha",
        "category": "apex",
        "maxRank": 1,
        "req": "Apito do Lobo",
        "rawType": "Topo (escolha 1)",
        "desc": "Por 10 s, o lobo vira um alfa gigante",
        "requires": [
          "hunter_att_ca_ada_perfeita"
        ],
        "x": 145,
        "y": 298,
        "nav": {
          "up": "hunter_att_ca_ada_perfeita",
          "down": null,
          "left": null,
          "right": "hunter_att_ca_a_grossa"
        }
      },
      {
        "id": "hunter_att_ca_a_grossa",
        "name": "Caça Grossa",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano ×1,3 por grau",
        "requires": [
          "hunter_att_tiro_da_corrida_do_ouro"
        ],
        "x": 255,
        "y": 298,
        "nav": {
          "up": "hunter_att_tiro_da_corrida_do_ouro",
          "down": null,
          "left": "hunter_att_rei_da_matilha",
          "right": null
        }
      },
      {
        "id": "hunter_att_f_ria_da_matilha",
        "name": "Fúria da Matilha",
        "category": "nightmare",
        "maxRank": 5,
        "req": "Apito do Lobo",
        "rawType": "Pesadelo 1–5",
        "desc": "Dano do lobo ×1,5 por grau",
        "requires": [],
        "x": 200,
        "y": 140,
        "nav": {
          "up": "hunter_att_olho_do_rastreador",
          "down": "hunter_att_ponto_fraco",
          "left": "hunter_att_tiro_preciso_perfurante",
          "right": "hunter_att_ataque_coordenado"
        }
      }
    ],
    "connections": [
      [
        "hunter_att_olho_do_rastreador",
        "hunter_att_tiro_preciso_perfurante"
      ],
      [
        "hunter_att_tiro_preciso_perfurante",
        "hunter_att_tiro_duplo"
      ],
      [
        "hunter_att_presas",
        "hunter_att_ataque_coordenado"
      ],
      [
        "hunter_att_ataque_coordenado",
        "hunter_att_matilha"
      ],
      [
        "hunter_att_tiro_duplo",
        "hunter_att_ponto_fraco"
      ],
      [
        "hunter_att_matilha",
        "hunter_att_ponto_fraco"
      ],
      [
        "hunter_att_ponto_fraco",
        "hunter_att_ca_ada_perfeita"
      ],
      [
        "hunter_att_ponto_fraco",
        "hunter_att_tiro_da_corrida_do_ouro"
      ],
      [
        "hunter_att_ca_ada_perfeita",
        "hunter_att_rei_da_matilha"
      ],
      [
        "hunter_att_tiro_da_corrida_do_ouro",
        "hunter_att_ca_a_grossa"
      ]
    ]
  },
  {
    "heroId": "SHAMAN",
    "heroName": "Araí",
    "treeKey": "defense",
    "treeName": "Bênção da Mata",
    "shape": "Y",
    "mechanic": "Tronco de pintura e firmeza que se divide: maracá (cura/espíritos) e lâmina (casca de sumaúma).",
    "nodes": [
      {
        "id": "shaman_def_pele_de_jenipapo",
        "name": "Pele de Jenipapo",
        "category": "passive",
        "maxRank": 3,
        "req": null,
        "rawType": "Passiva I–III",
        "desc": "As pinturas de guerra dão +6 / 12 / 18% de defesa",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "shaman_def_ra_zes_firmes",
          "left": "shaman_def_c_rculo_de_jurema",
          "right": "shaman_def_trov_o_de_tup"
        }
      },
      {
        "id": "shaman_def_ra_zes_firmes",
        "name": "Raízes Firmes",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Não pode ser empurrada nem derrubada",
        "requires": [
          "shaman_def_pele_de_jenipapo"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "shaman_def_pele_de_jenipapo",
          "down": "shaman_def_c_rculo_de_jurema",
          "left": "shaman_def_c_rculo_de_jurema",
          "right": "shaman_def_trov_o_de_tup"
        }
      },
      {
        "id": "shaman_def_c_rculo_de_jurema",
        "name": "Círculo de Jurema",
        "category": "active",
        "maxRank": 2,
        "req": "Maracá Sagrado",
        "rawType": "Ativa I–II",
        "desc": "Uma área por 6 s que cura 2% da vida por segundo e prende quem entra; recarga 18 s (II: 14 s)",
        "requires": [
          "shaman_def_ra_zes_firmes"
        ],
        "x": 130,
        "y": 155,
        "nav": {
          "up": "shaman_def_ra_zes_firmes",
          "down": "shaman_def_ra_zes_que_abra_am",
          "left": null,
          "right": "shaman_def_ra_zes_firmes"
        }
      },
      {
        "id": "shaman_def_ra_zes_que_abra_am",
        "name": "Raízes que Abraçam",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Raízes de",
        "desc": "As raízes também curam você Jurema",
        "requires": [
          "shaman_def_c_rculo_de_jurema"
        ],
        "x": 120,
        "y": 205,
        "nav": {
          "up": "shaman_def_c_rculo_de_jurema",
          "down": "shaman_def_esp_rito_guardi_o",
          "left": null,
          "right": "shaman_def_ra_zes_firmes"
        }
      },
      {
        "id": "shaman_def_esp_rito_guardi_o",
        "name": "Espírito Guardião",
        "category": "passive",
        "maxRank": 2,
        "req": "Maracá Sagrado",
        "rawType": "Passiva I–II",
        "desc": "O gavião intercepta um projétil a cada 6 / 4 s",
        "requires": [
          "shaman_def_ra_zes_que_abra_am"
        ],
        "x": 115,
        "y": 250,
        "nav": {
          "up": "shaman_def_ra_zes_que_abra_am",
          "down": "shaman_def_suma_ma",
          "left": null,
          "right": "shaman_def_suma_ma"
        }
      },
      {
        "id": "shaman_def_trov_o_de_tup",
        "name": "Trovão de Tupã",
        "category": "apex",
        "maxRank": 1,
        "req": "Maracá Sagrado",
        "rawType": "Topo (escolha 1)",
        "desc": "Ao levar um golpe acima de 15% da Sagrado            vida, um raio cai em todos em volta (recarga 8 s)",
        "requires": [
          "shaman_def_ra_zes_firmes"
        ],
        "x": 270,
        "y": 155,
        "nav": {
          "up": "shaman_def_ra_zes_firmes",
          "down": "shaman_def_escudo_de_casca",
          "left": "shaman_def_ra_zes_firmes",
          "right": null
        }
      },
      {
        "id": "shaman_def_escudo_de_casca",
        "name": "Escudo de Casca",
        "category": "active",
        "maxRank": 2,
        "req": "Lâmina",
        "rawType": "Ativa I–II",
        "desc": "Casca de sumaúma que absorve 20% da vida por 6 s; recarga 14 s (II: 10 s)",
        "requires": [
          "shaman_def_trov_o_de_tup"
        ],
        "x": 280,
        "y": 205,
        "nav": {
          "up": "shaman_def_trov_o_de_tup",
          "down": "shaman_def_casca_espinhosa",
          "left": "shaman_def_ra_zes_firmes",
          "right": null
        }
      },
      {
        "id": "shaman_def_casca_espinhosa",
        "name": "Casca Espinhosa",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Lâmina",
        "rawType": "Aprimora Escudo",
        "desc": "Devolve 30% do dano corpo a corpo",
        "requires": [
          "shaman_def_escudo_de_casca"
        ],
        "x": 285,
        "y": 250,
        "nav": {
          "up": "shaman_def_escudo_de_casca",
          "down": "shaman_def_seiva_da_suma_ma",
          "left": "shaman_def_seiva_da_suma_ma",
          "right": null
        }
      },
      {
        "id": "shaman_def_suma_ma",
        "name": "Sumaúma",
        "category": "apex",
        "maxRank": 1,
        "req": "Lâmina",
        "rawType": "Topo (escolha 1)",
        "desc": "Quando o Escudo de Casca acaba, ele se renova uma vez sozinho",
        "requires": [
          "shaman_def_esp_rito_guardi_o"
        ],
        "x": 150,
        "y": 280,
        "nav": {
          "up": "shaman_def_esp_rito_guardi_o",
          "down": "shaman_def_cura_do_igap",
          "left": "shaman_def_esp_rito_guardi_o",
          "right": "shaman_def_seiva_da_suma_ma"
        }
      },
      {
        "id": "shaman_def_seiva_da_suma_ma",
        "name": "Seiva da Sumaúma",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "shaman_def_casca_espinhosa"
        ],
        "x": 250,
        "y": 280,
        "nav": {
          "up": "shaman_def_casca_espinhosa",
          "down": null,
          "left": "shaman_def_suma_ma",
          "right": "shaman_def_casca_espinhosa"
        }
      },
      {
        "id": "shaman_def_cura_do_igap",
        "name": "Cura do Igapó",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Cura recebida ×1,4 por grau",
        "requires": [
          "shaman_def_suma_ma"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "shaman_def_suma_ma",
          "down": null,
          "left": null,
          "right": "shaman_def_seiva_da_suma_ma"
        }
      }
    ],
    "connections": [
      [
        "shaman_def_pele_de_jenipapo",
        "shaman_def_ra_zes_firmes"
      ],
      [
        "shaman_def_ra_zes_firmes",
        "shaman_def_c_rculo_de_jurema"
      ],
      [
        "shaman_def_c_rculo_de_jurema",
        "shaman_def_ra_zes_que_abra_am"
      ],
      [
        "shaman_def_ra_zes_que_abra_am",
        "shaman_def_esp_rito_guardi_o"
      ],
      [
        "shaman_def_ra_zes_firmes",
        "shaman_def_trov_o_de_tup"
      ],
      [
        "shaman_def_trov_o_de_tup",
        "shaman_def_escudo_de_casca"
      ],
      [
        "shaman_def_escudo_de_casca",
        "shaman_def_casca_espinhosa"
      ],
      [
        "shaman_def_esp_rito_guardi_o",
        "shaman_def_suma_ma"
      ],
      [
        "shaman_def_casca_espinhosa",
        "shaman_def_seiva_da_suma_ma"
      ],
      [
        "shaman_def_suma_ma",
        "shaman_def_cura_do_igap"
      ]
    ]
  },
  {
    "heroId": "SHAMAN",
    "heroName": "Araí",
    "treeKey": "attack",
    "treeName": "Veneno do Curare",
    "shape": "STAIRS",
    "mechanic": "Espinha de veneno e paralisia (zarabatana ou arco), com nós de lâmina e gavião nos lados.",
    "nodes": [
      {
        "id": "shaman_att_ponta_de_curare",
        "name": "Ponta de Curare",
        "category": "passive",
        "maxRank": 3,
        "req": "Zarabatana ou arco",
        "rawType": "Passiva I–III",
        "desc": "Os golpes envenenam; o veneno acumula até 3 / 4 / 5 vezes",
        "requires": [],
        "x": 180,
        "y": 65,
        "nav": {
          "up": null,
          "down": "shaman_att_saraivada_de_dardos",
          "left": "shaman_att_paralisia",
          "right": "shaman_att_saraivada_de_dardos"
        }
      },
      {
        "id": "shaman_att_paralisia",
        "name": "Paralisia",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Três acúmulos de curare paralisam por 1 s",
        "requires": [
          "shaman_att_ponta_de_curare"
        ],
        "x": 110,
        "y": 65,
        "nav": {
          "up": null,
          "down": "shaman_att_mergulho_do_gavi_o",
          "left": null,
          "right": "shaman_att_ponta_de_curare"
        }
      },
      {
        "id": "shaman_att_saraivada_de_dardos",
        "name": "Saraivada de Dardos",
        "category": "active",
        "maxRank": 1,
        "req": "Zarabatana ou arco",
        "rawType": "Ativa",
        "desc": "Cinco dardos em leque; recarga 8 s",
        "requires": [
          "shaman_att_ponta_de_curare"
        ],
        "x": 220,
        "y": 115,
        "nav": {
          "up": "shaman_att_ponta_de_curare",
          "down": "shaman_att_selva_faminta",
          "left": "shaman_att_ponta_de_curare",
          "right": "shaman_att_curare_mortal"
        }
      },
      {
        "id": "shaman_att_curare_mortal",
        "name": "Curare Mortal",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Dardos",
        "desc": "Dano contínuo +50% de Curare",
        "requires": [
          "shaman_att_saraivada_de_dardos"
        ],
        "x": 290,
        "y": 115,
        "nav": {
          "up": null,
          "down": "shaman_att_dan_a_de_guerra",
          "left": "shaman_att_saraivada_de_dardos",
          "right": null
        }
      },
      {
        "id": "shaman_att_selva_faminta",
        "name": "Selva Faminta",
        "category": "synergy",
        "maxRank": 1,
        "req": null,
        "rawType": "Sinergia",
        "desc": "Paralisia + Curare Paralisados sempre recebem Mortal                   crítico",
        "requires": [
          "shaman_att_saraivada_de_dardos"
        ],
        "x": 180,
        "y": 165,
        "nav": {
          "up": "shaman_att_saraivada_de_dardos",
          "down": "shaman_att_fio_da_l_mina",
          "left": "shaman_att_mergulho_do_gavi_o",
          "right": "shaman_att_saraivada_de_dardos"
        }
      },
      {
        "id": "shaman_att_mergulho_do_gavi_o",
        "name": "Mergulho do Gavião",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Maracá Sagrado",
        "rawType": "Aprimora Espírito",
        "desc": "O gavião mergulha duas vezes do Gavião",
        "requires": [
          "shaman_att_selva_faminta"
        ],
        "x": 110,
        "y": 165,
        "nav": {
          "up": "shaman_att_paralisia",
          "down": "shaman_att_revoada",
          "left": null,
          "right": "shaman_att_selva_faminta"
        }
      },
      {
        "id": "shaman_att_fio_da_l_mina",
        "name": "Fio da Lâmina",
        "category": "passive",
        "maxRank": 3,
        "req": "Lâmina",
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de crítico",
        "requires": [
          "shaman_att_selva_faminta"
        ],
        "x": 220,
        "y": 215,
        "nav": {
          "up": "shaman_att_selva_faminta",
          "down": "shaman_att_garra_da_on_a",
          "left": "shaman_att_selva_faminta",
          "right": "shaman_att_garra_da_on_a"
        }
      },
      {
        "id": "shaman_att_dan_a_de_guerra",
        "name": "Dança de Guerra",
        "category": "active",
        "maxRank": 1,
        "req": "Lâmina",
        "rawType": "Ativa",
        "desc": "Giro de três golpes em volta; recarga 9 s",
        "requires": [
          "shaman_att_fio_da_l_mina"
        ],
        "x": 290,
        "y": 215,
        "nav": {
          "up": "shaman_att_curare_mortal",
          "down": "shaman_att_garra_da_on_a",
          "left": "shaman_att_garra_da_on_a",
          "right": null
        }
      },
      {
        "id": "shaman_att_revoada",
        "name": "Revoada",
        "category": "apex",
        "maxRank": 1,
        "req": "Maracá Sagrado",
        "rawType": "Topo (escolha 1)",
        "desc": "Gaviões caem sobre todos os inimigos envenenados",
        "requires": [
          "shaman_att_fio_da_l_mina"
        ],
        "x": 145,
        "y": 265,
        "nav": {
          "up": "shaman_att_fio_da_l_mina",
          "down": "shaman_att_veneno_da_mata",
          "left": null,
          "right": "shaman_att_fio_da_l_mina"
        }
      },
      {
        "id": "shaman_att_garra_da_on_a",
        "name": "Garra da Onça",
        "category": "apex",
        "maxRank": 1,
        "req": "Lâmina",
        "rawType": "Topo (escolha 1)",
        "desc": "Golpe carregado em salto que atravessa a sala",
        "requires": [
          "shaman_att_fio_da_l_mina"
        ],
        "x": 255,
        "y": 265,
        "nav": {
          "up": "shaman_att_fio_da_l_mina",
          "down": "shaman_att_f_ria_de_guerreira",
          "left": "shaman_att_fio_da_l_mina",
          "right": "shaman_att_dan_a_de_guerra"
        }
      },
      {
        "id": "shaman_att_veneno_da_mata",
        "name": "Veneno da Mata",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano de veneno ×1,4 por grau",
        "requires": [
          "shaman_att_revoada"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "shaman_att_revoada",
          "down": null,
          "left": null,
          "right": "shaman_att_f_ria_de_guerreira"
        }
      },
      {
        "id": "shaman_att_f_ria_de_guerreira",
        "name": "Fúria de Guerreira",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano ×1,3 por grau",
        "requires": [
          "shaman_att_garra_da_on_a"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "shaman_att_garra_da_on_a",
          "down": null,
          "left": "shaman_att_veneno_da_mata",
          "right": null
        }
      }
    ],
    "connections": [
      [
        "shaman_att_ponta_de_curare",
        "shaman_att_saraivada_de_dardos"
      ],
      [
        "shaman_att_saraivada_de_dardos",
        "shaman_att_selva_faminta"
      ],
      [
        "shaman_att_selva_faminta",
        "shaman_att_fio_da_l_mina"
      ],
      [
        "shaman_att_ponta_de_curare",
        "shaman_att_paralisia"
      ],
      [
        "shaman_att_saraivada_de_dardos",
        "shaman_att_curare_mortal"
      ],
      [
        "shaman_att_selva_faminta",
        "shaman_att_mergulho_do_gavi_o"
      ],
      [
        "shaman_att_fio_da_l_mina",
        "shaman_att_dan_a_de_guerra"
      ],
      [
        "shaman_att_fio_da_l_mina",
        "shaman_att_revoada"
      ],
      [
        "shaman_att_fio_da_l_mina",
        "shaman_att_garra_da_on_a"
      ],
      [
        "shaman_att_revoada",
        "shaman_att_veneno_da_mata"
      ],
      [
        "shaman_att_garra_da_on_a",
        "shaman_att_f_ria_de_guerreira"
      ]
    ]
  },
  {
    "heroId": "DRUID",
    "heroName": "Tharion",
    "treeKey": "defense",
    "treeName": "Juramento do Carvalho",
    "shape": "Y_INV",
    "mechanic": "Duas entradas (javali e carvalho) que se juntam num tronco de instinto.",
    "nodes": [
      {
        "id": "druid_def_couro_de_javali",
        "name": "Couro de Javali",
        "category": "passive",
        "maxRank": 3,
        "req": "Forma de",
        "rawType": "Passiva I–III",
        "desc": "+15 / 30 / 45% de vida na forma Javali",
        "requires": [],
        "x": 130,
        "y": 65,
        "nav": {
          "up": null,
          "down": "druid_def_pisoteio",
          "left": null,
          "right": "druid_def_javali_ancestral"
        }
      },
      {
        "id": "druid_def_pisoteio",
        "name": "Pisoteio",
        "category": "active",
        "maxRank": 2,
        "req": "Forma de",
        "rawType": "Ativa I–II",
        "desc": "Investida que derruba; recarga 8 Javali              s (II: 2 cargas)",
        "requires": [
          "druid_def_couro_de_javali"
        ],
        "x": 145,
        "y": 115,
        "nav": {
          "up": "druid_def_couro_de_javali",
          "down": "druid_def_instinto_animal",
          "left": null,
          "right": "druid_def_javali_ancestral"
        }
      },
      {
        "id": "druid_def_casca_de_carvalho",
        "name": "Casca de Carvalho",
        "category": "passive",
        "maxRank": 3,
        "req": "Cajado de",
        "rawType": "Passiva I–III",
        "desc": "+6 / 12 / 18% de defesa carvalho",
        "requires": [],
        "x": 270,
        "y": 65,
        "nav": {
          "up": null,
          "down": "druid_def_c_rculo_de_carvalhos",
          "left": "druid_def_javali_ancestral",
          "right": null
        }
      },
      {
        "id": "druid_def_c_rculo_de_carvalhos",
        "name": "Círculo de Carvalhos",
        "category": "active",
        "maxRank": 2,
        "req": "Cajado de",
        "rawType": "Ativa I–II",
        "desc": "Um anel de árvores bloqueia os inimigos por 4 s; recarga 16 s (II: 12 s)",
        "requires": [
          "druid_def_casca_de_carvalho"
        ],
        "x": 255,
        "y": 115,
        "nav": {
          "up": "druid_def_casca_de_carvalho",
          "down": "druid_def_instinto_animal",
          "left": "druid_def_javali_ancestral",
          "right": null
        }
      },
      {
        "id": "druid_def_instinto_animal",
        "name": "Instinto Animal",
        "category": "passive",
        "maxRank": 1,
        "req": null,
        "rawType": "Passiva",
        "desc": "Trocar de forma remove lentidão, veneno e atordoamento",
        "requires": [
          "druid_def_pisoteio"
        ],
        "x": 200,
        "y": 165,
        "nav": {
          "up": "druid_def_javali_ancestral",
          "down": "druid_def_visco_sagrado",
          "left": "druid_def_pisoteio",
          "right": "druid_def_c_rculo_de_carvalhos"
        }
      },
      {
        "id": "druid_def_visco_sagrado",
        "name": "Visco Sagrado",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "Trocar de forma cura 3 / 6% da vida",
        "requires": [
          "druid_def_instinto_animal"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "druid_def_instinto_animal",
          "down": "druid_def_guia_protetora",
          "left": "druid_def_guia_protetora",
          "right": "druid_def_guardi_o_da_umava"
        }
      },
      {
        "id": "druid_def_guia_protetora",
        "name": "Águia Protetora",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Águia",
        "desc": "A águia intercepta projéteis Companheira",
        "requires": [
          "druid_def_visco_sagrado"
        ],
        "x": 145,
        "y": 255,
        "nav": {
          "up": "druid_def_visco_sagrado",
          "down": "druid_def_renascer",
          "left": null,
          "right": "druid_def_visco_sagrado"
        }
      },
      {
        "id": "druid_def_guardi_o_da_umava",
        "name": "Guardião da Šumava",
        "category": "apex",
        "maxRank": 1,
        "req": "Cajado de",
        "rawType": "Topo (escolha 1)",
        "desc": "Forma de urso colossal por 8 s; recarga 60 s",
        "requires": [
          "druid_def_visco_sagrado"
        ],
        "x": 255,
        "y": 255,
        "nav": {
          "up": "druid_def_visco_sagrado",
          "down": "druid_def_cerne_do_carvalho",
          "left": "druid_def_visco_sagrado",
          "right": null
        }
      },
      {
        "id": "druid_def_renascer",
        "name": "Renascer",
        "category": "apex",
        "maxRank": 1,
        "req": null,
        "rawType": "Topo (escolha 1)",
        "desc": "Uma vez por andar, ao cair vira árvore por 3 s e volta com 50% de vida",
        "requires": [
          "druid_def_guia_protetora"
        ],
        "x": 145,
        "y": 300,
        "nav": {
          "up": "druid_def_guia_protetora",
          "down": null,
          "left": null,
          "right": "druid_def_cerne_do_carvalho"
        }
      },
      {
        "id": "druid_def_cerne_do_carvalho",
        "name": "Cerne do Carvalho",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano recebido ×0,85 por grau",
        "requires": [
          "druid_def_guardi_o_da_umava"
        ],
        "x": 255,
        "y": 300,
        "nav": {
          "up": "druid_def_guardi_o_da_umava",
          "down": null,
          "left": "druid_def_renascer",
          "right": null
        }
      },
      {
        "id": "druid_def_javali_ancestral",
        "name": "Javali Ancestral",
        "category": "nightmare",
        "maxRank": 5,
        "req": "Forma de",
        "rawType": "Pesadelo 1–5",
        "desc": "Vida na forma ×1,5 por grau Javali",
        "requires": [],
        "x": 200,
        "y": 115,
        "nav": {
          "up": "druid_def_couro_de_javali",
          "down": "druid_def_instinto_animal",
          "left": "druid_def_pisoteio",
          "right": "druid_def_c_rculo_de_carvalhos"
        }
      }
    ],
    "connections": [
      [
        "druid_def_couro_de_javali",
        "druid_def_pisoteio"
      ],
      [
        "druid_def_casca_de_carvalho",
        "druid_def_c_rculo_de_carvalhos"
      ],
      [
        "druid_def_pisoteio",
        "druid_def_instinto_animal"
      ],
      [
        "druid_def_c_rculo_de_carvalhos",
        "druid_def_instinto_animal"
      ],
      [
        "druid_def_instinto_animal",
        "druid_def_visco_sagrado"
      ],
      [
        "druid_def_visco_sagrado",
        "druid_def_guia_protetora"
      ],
      [
        "druid_def_visco_sagrado",
        "druid_def_guardi_o_da_umava"
      ],
      [
        "druid_def_guia_protetora",
        "druid_def_renascer"
      ],
      [
        "druid_def_guardi_o_da_umava",
        "druid_def_cerne_do_carvalho"
      ]
    ]
  },
  {
    "heroId": "DRUID",
    "heroName": "Tharion",
    "treeKey": "attack",
    "treeName": "Fúria Boia",
    "shape": "TRIDENT",
    "mechanic": "Tronco de garras que se abre em três pontas: lobisomem, foice e águia.",
    "nodes": [
      {
        "id": "druid_att_garras_afiadas",
        "name": "Garras Afiadas",
        "category": "passive",
        "maxRank": 3,
        "req": "Forma de",
        "rawType": "Passiva I–III",
        "desc": "+5 / 10 / 15% de crítico na Lobisomem              forma",
        "requires": [],
        "x": 200,
        "y": 65,
        "nav": {
          "up": null,
          "down": "druid_att_sangue_celta",
          "left": "druid_att_uivo_sanguin_rio",
          "right": "druid_att_mergulho_da_guia"
        }
      },
      {
        "id": "druid_att_sangue_celta",
        "name": "Sangue Celta",
        "category": "passive",
        "maxRank": 1,
        "req": "Forma de",
        "rawType": "Passiva",
        "desc": "Cada abate na forma a Lobisomem              estende em 2 s",
        "requires": [
          "druid_att_garras_afiadas"
        ],
        "x": 200,
        "y": 110,
        "nav": {
          "up": "druid_att_garras_afiadas",
          "down": "druid_att_corte_da_foice",
          "left": "druid_att_uivo_sanguin_rio",
          "right": "druid_att_mergulho_da_guia"
        }
      },
      {
        "id": "druid_att_uivo_sanguin_rio",
        "name": "Uivo Sanguinário",
        "category": "active",
        "maxRank": 1,
        "req": "Forma de",
        "rawType": "Ativa",
        "desc": "+30% de velocidade de ataque por 6 s; recarga 14 s",
        "requires": [
          "druid_att_sangue_celta"
        ],
        "x": 110,
        "y": 160,
        "nav": {
          "up": "druid_att_garras_afiadas",
          "down": "druid_att_matilha_interior",
          "left": null,
          "right": "druid_att_corte_da_foice"
        }
      },
      {
        "id": "druid_att_matilha_interior",
        "name": "Matilha Interior",
        "category": "upgrade",
        "maxRank": 1,
        "req": "Forma de",
        "rawType": "Aprimora Uivo",
        "desc": "Durante o uivo, ele salta de Lobisomem              inimigo em inimigo",
        "requires": [
          "druid_att_uivo_sanguin_rio"
        ],
        "x": 100,
        "y": 210,
        "nav": {
          "up": "druid_att_uivo_sanguin_rio",
          "down": "druid_att_lua_de_z_vist",
          "left": null,
          "right": "druid_att_colheita_do_visco"
        }
      },
      {
        "id": "druid_att_lua_de_z_vist",
        "name": "Lua de Závist",
        "category": "apex",
        "maxRank": 1,
        "req": "Forma de",
        "rawType": "Topo (escolha 1)",
        "desc": "Em sala de chefe, a Forma de Lobisomem              Lobisomem não acaba",
        "requires": [
          "druid_att_matilha_interior"
        ],
        "x": 100,
        "y": 260,
        "nav": {
          "up": "druid_att_matilha_interior",
          "down": "druid_att_f_ria_ancestral",
          "left": null,
          "right": "druid_att_f_ria_ancestral"
        }
      },
      {
        "id": "druid_att_corte_da_foice",
        "name": "Corte da Foice",
        "category": "passive",
        "maxRank": 3,
        "req": "Foice de Ouro",
        "rawType": "Passiva I–III",
        "desc": "Ataque básico +10 / 20 / 30% de dano",
        "requires": [
          "druid_att_sangue_celta"
        ],
        "x": 200,
        "y": 160,
        "nav": {
          "up": "druid_att_sangue_celta",
          "down": "druid_att_colheita_do_visco",
          "left": "druid_att_uivo_sanguin_rio",
          "right": "druid_att_mergulho_da_guia"
        }
      },
      {
        "id": "druid_att_colheita_do_visco",
        "name": "Colheita do Visco",
        "category": "active",
        "maxRank": 1,
        "req": "Foice de Ouro",
        "rawType": "Ativa",
        "desc": "Foice giratória que drena vida; recarga 10 s",
        "requires": [
          "druid_att_corte_da_foice"
        ],
        "x": 200,
        "y": 210,
        "nav": {
          "up": "druid_att_corte_da_foice",
          "down": "druid_att_foice_de_samhain",
          "left": "druid_att_matilha_interior",
          "right": "druid_att_c_u_boio"
        }
      },
      {
        "id": "druid_att_foice_de_samhain",
        "name": "Foice de Samhain",
        "category": "apex",
        "maxRank": 1,
        "req": "Foice de Ouro",
        "rawType": "Topo (escolha 1)",
        "desc": "A Colheita solta ondas de corte em volta por 3 s",
        "requires": [
          "druid_att_colheita_do_visco"
        ],
        "x": 200,
        "y": 260,
        "nav": {
          "up": "druid_att_colheita_do_visco",
          "down": "druid_att_f_ria_ancestral",
          "left": "druid_att_f_ria_ancestral",
          "right": "druid_att_lua_cheia"
        }
      },
      {
        "id": "druid_att_mergulho_da_guia",
        "name": "Mergulho da Águia",
        "category": "upgrade",
        "maxRank": 1,
        "req": null,
        "rawType": "Aprimora Águia",
        "desc": "A águia marca os alvos; marcados recebem +20% de dano",
        "requires": [
          "druid_att_sangue_celta"
        ],
        "x": 290,
        "y": 160,
        "nav": {
          "up": "druid_att_garras_afiadas",
          "down": "druid_att_c_u_boio",
          "left": "druid_att_corte_da_foice",
          "right": null
        }
      },
      {
        "id": "druid_att_c_u_boio",
        "name": "Céu Boio",
        "category": "passive",
        "maxRank": 2,
        "req": null,
        "rawType": "Passiva I–II",
        "desc": "A águia ataca 30 / 60% mais rápido",
        "requires": [
          "druid_att_mergulho_da_guia"
        ],
        "x": 300,
        "y": 210,
        "nav": {
          "up": "druid_att_mergulho_da_guia",
          "down": "druid_att_tempestade_de_penas",
          "left": "druid_att_colheita_do_visco",
          "right": null
        }
      },
      {
        "id": "druid_att_tempestade_de_penas",
        "name": "Tempestade de Penas",
        "category": "apex",
        "maxRank": 1,
        "req": "Mergulho da",
        "rawType": "Topo (escolha 1)",
        "desc": "A águia vira um bando de cinco por 8 s",
        "requires": [
          "druid_att_c_u_boio"
        ],
        "x": 300,
        "y": 260,
        "nav": {
          "up": "druid_att_c_u_boio",
          "down": "druid_att_lua_cheia",
          "left": "druid_att_lua_cheia",
          "right": null
        }
      },
      {
        "id": "druid_att_f_ria_ancestral",
        "name": "Fúria Ancestral",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Dano ×1,3 por grau",
        "requires": [
          "druid_att_lua_de_z_vist"
        ],
        "x": 145,
        "y": 305,
        "nav": {
          "up": "druid_att_lua_de_z_vist",
          "down": null,
          "left": "druid_att_lua_de_z_vist",
          "right": "druid_att_foice_de_samhain"
        }
      },
      {
        "id": "druid_att_lua_cheia",
        "name": "Lua Cheia",
        "category": "nightmare",
        "maxRank": 5,
        "req": null,
        "rawType": "Pesadelo 1–5",
        "desc": "Duração das formas ×1,3 por grau",
        "requires": [
          "druid_att_tempestade_de_penas"
        ],
        "x": 255,
        "y": 305,
        "nav": {
          "up": "druid_att_tempestade_de_penas",
          "down": null,
          "left": "druid_att_foice_de_samhain",
          "right": "druid_att_tempestade_de_penas"
        }
      }
    ],
    "connections": [
      [
        "druid_att_garras_afiadas",
        "druid_att_sangue_celta"
      ],
      [
        "druid_att_sangue_celta",
        "druid_att_uivo_sanguin_rio"
      ],
      [
        "druid_att_uivo_sanguin_rio",
        "druid_att_matilha_interior"
      ],
      [
        "druid_att_matilha_interior",
        "druid_att_lua_de_z_vist"
      ],
      [
        "druid_att_sangue_celta",
        "druid_att_corte_da_foice"
      ],
      [
        "druid_att_corte_da_foice",
        "druid_att_colheita_do_visco"
      ],
      [
        "druid_att_colheita_do_visco",
        "druid_att_foice_de_samhain"
      ],
      [
        "druid_att_sangue_celta",
        "druid_att_mergulho_da_guia"
      ],
      [
        "druid_att_mergulho_da_guia",
        "druid_att_c_u_boio"
      ],
      [
        "druid_att_c_u_boio",
        "druid_att_tempestade_de_penas"
      ],
      [
        "druid_att_lua_de_z_vist",
        "druid_att_f_ria_ancestral"
      ],
      [
        "druid_att_tempestade_de_penas",
        "druid_att_lua_cheia"
      ]
    ]
  }
];
  const INFINITE_NEW_ITEMS = {
  "wolf_whistle": {
    "id": "wolf_whistle",
    "name": "Apito do Lobo",
    "type": "accessory",
    "slot": "accessory",
    "icon": "icon-amulet",
    "minRarity": "RARE",
    "weaponCategory": "HUNTER",
    "classRequirement": "HUNTER",
    "stats": {
      "maxHp": 4,
      "speed": 10,
      "critChance": 5
    },
    "value": 35,
    "desc": "Amuleto entalhado em presa de lobo. Liga as habilidades do lobo nas árvores do Caçador."
  },
  "sacred_maraca": {
    "id": "sacred_maraca",
    "name": "Maracá Sagrado",
    "type": "accessory",
    "slot": "accessory",
    "icon": "icon-arcane-orb",
    "minRarity": "RARE",
    "weaponCategory": "SHAMAN",
    "classRequirement": "SHAMAN",
    "stats": {
      "magicDamage": 4,
      "maxMana": 25,
      "defense": 2
    },
    "value": 35,
    "desc": "Instrumento sagrado preenchido com sementes de jurema. Liga o gavião e os espíritos da mata."
  },
  "blowpipe": {
    "id": "blowpipe",
    "name": "Zarabatana Xamânica",
    "type": "weapon",
    "slot": "weapon",
    "icon": "icon-bow",
    "weaponCategory": "SHAMAN",
    "classRequirement": "SHAMAN",
    "minRarity": "UNCOMMON",
    "stats": {
      "damage": 3,
      "attackSpeed": 1.4
    },
    "value": 24,
    "desc": "Arma tradicional de bambu para dardos de curare envenenados. Ataques rápidos e precisos."
  },
  "golden_scythe": {
    "id": "golden_scythe",
    "name": "Foice de Ouro",
    "type": "weapon",
    "slot": "weapon",
    "icon": "icon-cleaver",
    "weaponCategory": "DRUID",
    "classRequirement": "DRUID",
    "minRarity": "RARE",
    "stats": {
      "damage": 5,
      "magicDamage": 3,
      "critChance": 8
    },
    "attackSpeed": 1.1,
    "value": 45,
    "desc": "A lendária foice dos druidas, usada para ceifar o visco sagrado e canalizar a Fúria Boia."
  },
  "profane_ivory_staff": {
    "id": "profane_ivory_staff",
    "name": "Cajado de Marfim Profano",
    "type": "weapon",
    "slot": "weapon",
    "icon": "icon-arcane-staff",
    "weaponCategory": "NECROMANCER",
    "classRequirement": "NECROMANCER",
    "minRarity": "RARE",
    "stats": {
      "magicDamage": 6,
      "maxMana": 20,
      "maxHp": 3
    },
    "attackSpeed": 1.0,
    "value": 40,
    "desc": "Cajado de osso entalhado em marfim antigo. Fortalece lacaios e absorção necrótica."
  },
  "ancestral_bone_staff": {
    "id": "ancestral_bone_staff",
    "name": "Cajado dos Ancestrais",
    "type": "weapon",
    "slot": "weapon",
    "icon": "icon-arcane-staff",
    "weaponCategory": "NECROMANCER",
    "classRequirement": "NECROMANCER",
    "minRarity": "EPIC",
    "stats": {
      "magicDamage": 8,
      "maxMana": 30,
      "defense": 3
    },
    "attackSpeed": 1.05,
    "value": 65,
    "desc": "Cajado ancestral de Białowieża. Canaliza o poder dos reis túmulo e seus exércitos."
  },
  "midnight_scythe": {
    "id": "midnight_scythe",
    "name": "Ceifador da Meia-Noite",
    "type": "weapon",
    "slot": "weapon",
    "icon": "icon-skull-scepter",
    "weaponCategory": "NECROMANCER",
    "classRequirement": "NECROMANCER",
    "minRarity": "EPIC",
    "stats": {
      "damage": 7,
      "magicDamage": 6,
      "critChance": 10
    },
    "attackSpeed": 1.15,
    "value": 70,
    "desc": "Foice forjada em obsidiana e sombras sepulcrais. Drena a força vital de tudo que corta."
  }
};

  // Expose to window / global scope
  window.__INFINITE_TREES = INFINITE_TREES;
  window.__INFINITE_NEW_ITEMS = INFINITE_NEW_ITEMS;

  // Register new items into item table Xt if present
  if (typeof Xt !== 'undefined') {
    Object.assign(Xt, INFINITE_NEW_ITEMS);
  }

  window.__getHeroInfiniteTrees = function(heroId) {
    const hid = String(heroId || '').toUpperCase();
    const defTree = INFINITE_TREES.find(t => t.heroId === hid && t.treeKey === 'defense');
    const atkTree = INFINITE_TREES.find(t => t.heroId === hid && t.treeKey === 'attack');
    return { defense: defTree, attack: atkTree };
  };

  window.__checkNodeWeaponReq = function(req, equipment, druidForm) {
    if (!req || req === '—' || req === '') return { active: true, label: '' };
    const wep = equipment?.weapon;
    const off = equipment?.offhand;
    const acc = equipment?.accessory;
    const wepName = (wep?.name || '').toLowerCase();
    const wepId = (wep?.id || '').toLowerCase();
    const offName = (off?.name || '').toLowerCase();
    const offId = (off?.id || '').toLowerCase();
    const accName = (acc?.name || '').toLowerCase();
    const accId = (acc?.id || '').toLowerCase();
    const reqLower = req.toLowerCase();
    // Check adaptation secondaryFamily (e.g. from Altar of Adaptation)
    const secFam = (wep?.secondaryFamily || '').toLowerCase();
    if (secFam && reqLower.includes(secFam)) return { active: true, label: `${req} (Adaptada)` };

    if (reqLower.includes('escudo')) {
      const hasShield = offId.includes('shield') || offName.includes('escudo');
      return { active: hasShield, label: 'Escudo' };
    }
    if (reqLower.includes('apito')) {
      const hasWhistle = accId.includes('whistle') || accName.includes('apito');
      return { active: hasWhistle, label: 'Apito do Lobo' };
    }
    if (reqLower.includes('maracá') || reqLower.includes('maraca')) {
      const hasMaraca = accId.includes('maraca') || accName.includes('maracá') || accName.includes('maraca');
      return { active: hasMaraca, label: 'Maracá Sagrado' };
    }
    if (reqLower.includes('forma de javali')) {
      return { active: druidForm === 'boar', label: 'Forma de Javali' };
    }
    if (reqLower.includes('forma de lobisomem')) {
      return { active: druidForm === 'werewolf', label: 'Forma de Lobisomem' };
    }
    if (reqLower.includes('zarabatana')) {
      const hasBlow = wepId.includes('blowpipe') || wepName.includes('zarabatana') || wepId.includes('bow') || wepName.includes('arco');
      return { active: hasBlow, label: 'Zarabatana ou Arco' };
    }
    if (reqLower.includes('foice de ouro')) {
      const hasGoldScythe = wepId.includes('golden_scythe') || wepName.includes('foice de ouro');
      return { active: hasGoldScythe, label: 'Foice de Ouro' };
    }
    if (reqLower.includes('foice')) {
      const hasScythe = wepId.includes('scythe') || wepId.includes('reaper') || wepName.includes('foice') || wepName.includes('ceifador');
      return { active: hasScythe, label: 'Foice' };
    }
    if (reqLower.includes('cetro')) {
      const hasScepter = wepId.includes('scepter') || wepName.includes('cetro');
      return { active: hasScepter, label: 'Cetro' };
    }
    if (reqLower.includes('cajado de osso')) {
      const hasBone = wepId.includes('bone') || wepName.includes('osso') || wepId.includes('ivory');
      return { active: hasBone, label: 'Cajado de osso' };
    }
    if (reqLower.includes('cajado de carvalho')) {
      const hasOak = wepId.includes('oak') || wepName.includes('carvalho') || wepId.includes('wand') || wepId.includes('bastao');
      return { active: hasOak, label: 'Cajado de carvalho' };
    }
    if (reqLower.includes('cajado de fogo')) {
      const hasFire = wepId.includes('infernal') || wepName.includes('fogo') || wepName.includes('pira') || wepName.includes('drac');
      return { active: hasFire, label: 'Cajado de fogo' };
    }
    if (reqLower.includes('cajado de gelo')) {
      const hasIce = wepId.includes('frost') || wepName.includes('gelo') || wepName.includes('inverno') || wepName.includes('cometa');
      return { active: hasIce, label: 'Cajado de gelo' };
    }
    if (reqLower.includes('cajado arcano') || reqLower.includes('cajado')) {
      const hasStaff = wepId.includes('staff') || wepName.includes('cajado');
      return { active: hasStaff, label: 'Cajado Arcano' };
    }
    if (reqLower.includes('adagas gêmeas') || reqLower.includes('gemeas')) {
      const hasTwin = wepId.includes('twin') || wepId.includes('fangs') || wepName.includes('gêmeas') || wepName.includes('presas');
      return { active: hasTwin, label: 'Adagas Gêmeas' };
    }
    if (reqLower.includes('adaga única') || reqLower.includes('adaga')) {
      const hasDagger = wepId.includes('dagger') || wepName.includes('adaga') || wepName.includes('navalha');
      return { active: hasDagger, label: 'Adaga' };
    }
    if (reqLower.includes('arco curto')) {
      const hasShort = wepId.includes('shortbow') || (wepName.includes('arco') && !wepName.includes('longo'));
      return { active: hasShort, label: 'Arco curto' };
    }
    if (reqLower.includes('arco longo')) {
      const hasLong = wepId.includes('longbow') || wepName.includes('longo');
      return { active: hasLong, label: 'Arco longo' };
    }
    if (reqLower.includes('montante')) {
      const hasGreatsword = wepId.includes('greatsword') || wepName.includes('montante') || wepName.includes('katana');
      return { active: hasGreatsword, label: 'Montante' };
    }
    if (reqLower.includes('pesada')) {
      const hasHeavy = wepId.includes('hammer') || wepId.includes('greataxe') || wepName.includes('martelo') || wepName.includes('grande machado');
      return { active: hasHeavy, label: 'Arma Pesada' };
    }
    if (reqLower.includes('machado') || reqLower.includes('maça') || reqLower.includes('maca')) {
      const hasAxe = wepId.includes('axe') || wepId.includes('mace') || wepId.includes('cleaver') || wepName.includes('machado') || wepName.includes('maça') || wepName.includes('cutelo');
      return { active: hasAxe, label: 'Machado/Maça' };
    }
    if (reqLower.includes('espada') || reqLower.includes('lâmina')) {
      const hasSword = wepId.includes('sword') || wepId.includes('blade') || wepName.includes('espada') || wepName.includes('lâmina');
      return { active: hasSword, label: 'Espada' };
    }

    return { active: true, label: req };
  };

  window.__countItemActiveSkills = function(heroId, chosenTreeKey, item) {
    if (!heroId || !chosenTreeKey || !item) return 0;
    const trees = window.__getHeroInfiniteTrees(heroId);
    const tree = trees[chosenTreeKey];
    if (!tree) return 0;
    const mockEq = { weapon: item, offhand: item, accessory: item };
    let count = 0;
    for (const node of tree.nodes) {
      if (node.req && node.req !== '—') {
        const check = window.__checkNodeWeaponReq(node.req, mockEq);
        if (check.active) count++;
      }
    }
    return count;
  };

  // Compute dynamic modifiers to feed into getRunModifiers()
  window.__computeInfiniteSkillsModifiers = function(scene) {
    if (!scene || scene.mode !== 'endless') return {};
    const skillsState = scene.registry?.get('endless:skills');
    if (!skillsState || !skillsState.chosenTree) return {};

    const heroId = scene.classDef?.id;
    const trees = window.__getHeroInfiniteTrees(heroId);
    const tree = trees[skillsState.chosenTree];
    if (!tree) return {};

    const eq = scene.inventory?.equipment;
    const druidForm = scene.druidForm || null;
    const invested = skillsState.invested || {};

    let damageMult = 0;
    let defenseAdd = 0;
    let critAdd = 0;
    let speedMult = 0;
    let maxHpAdd = 0;
    let cooldownReduction = 0;

    for (const node of tree.nodes) {
      const rank = invested[node.id] || 0;
      if (rank <= 0) continue;

      // Check weapon requirement
      const reqCheck = window.__checkNodeWeaponReq(node.req, eq, druidForm);
      if (!reqCheck.active) continue; // Inactive due to weapon mismatch

      const desc = (node.desc || '').toLowerCase();
      const name = (node.name || '').toLowerCase();

      // Parse stat effects
      if (desc.includes('defesa') || desc.includes('armadura')) {
        defenseAdd += rank * 2;
      }
      if (desc.includes('dano') || desc.includes('ataque básico')) {
        if (node.category === 'nightmare') {
          damageMult += (Math.pow(1.3, rank) - 1);
        } else {
          damageMult += rank * 0.08;
        }
      }
      if (desc.includes('crítico') || desc.includes('critico')) {
        critAdd += rank * 4;
      }
      if (desc.includes('velocidade')) {
        speedMult += rank * 0.06;
      }
      if (desc.includes('vida') && (desc.includes('+') || desc.includes('%'))) {
        maxHpAdd += rank * 2;
      }
      if (node.category === 'nightmare' && (desc.includes('dano recebido') || desc.includes('×0,85'))) {
        defenseAdd += Math.round((1 - Math.pow(0.85, rank)) * 12);
      }
    }

    return {
      damageMult,
      defenseAdd,
      critAdd,
      speedMult,
      maxHpAdd,
      cooldownReduction
    };
  };

  // Register Infinite Mode Active Abilities into Ye
  window.__registerInfiniteActiveAbilities = function() {
    if (typeof window.Ye === 'undefined') return;

    const abilities = {
      WARRIOR_VALDRAK_EGIDE: {
        id: "WARRIOR_VALDRAK_EGIDE", name: "Égide de Carvalho", icon: "icon-shield-wall", type: "buff",
        req: "Escudo", cooldown: 14, duration: 6, buff: { stat: "defense", amount: 16 },
        desc: "Escudo que absorve 25% da vida máxima por 6 s."
      },
      WARRIOR_VALDRAK_BRADO: {
        id: "WARRIOR_VALDRAK_BRADO", name: "Brado do Clã", icon: "icon-roar", type: "aoe",
        req: null, cooldown: 12, damageMult: 1.2, radius: 100,
        desc: "Puxa inimigos num raio de 4 m e dá Fortificação."
      },
      WARRIOR_FURIA_INVESTIDA: {
        id: "WARRIOR_FURIA_INVESTIDA", name: "Investida Escocesa", icon: "icon-charge", type: "dash",
        req: "Espada", cooldown: 9, speedMult: 2.2, duration: 0.35,
        desc: "Avança 5 m e derruba quem estiver no caminho."
      },
      WARRIOR_FURIA_REDEMOINHO: {
        id: "WARRIOR_FURIA_REDEMOINHO", name: "Redemoinho", icon: "icon-whirlwind", type: "aoe",
        req: "Machado/Maça", cooldown: 11, damageMult: 2.5, radius: 90,
        desc: "Gira causando dano cortante em área ao redor."
      },
      BERSERKER_UKE_APARAR: {
        id: "BERSERKER_UKE_APARAR", name: "Aparar (Uke)", icon: "icon-parry", type: "buff",
        req: "Montante", cooldown: 8, duration: 0.5, buff: { stat: "defense", amount: 99 },
        desc: "Janela de aparar: golpe recebido é anulado e contra-atacado."
      },
      BERSERKER_TSUBAME: {
        id: "BERSERKER_TSUBAME", name: "Tsubame-gaeshi", icon: "icon-iaijutsu", type: "melee-heavy",
        req: "Montante", cooldown: 7, damageMult: 3.0,
        desc: "Corte lendário de andorinha de ida e volta."
      },
      BERSERKER_TERREMOTO: {
        id: "BERSERKER_TERREMOTO", name: "Terremoto de Cinzas", icon: "icon-ground-slam", type: "aoe",
        req: "Pesada", cooldown: 10, damageMult: 3.5, radius: 110,
        desc: "Golpe colossal no chão que derruba inimigos."
      },
      ARCHER_SALTO_TRAS: {
        id: "ARCHER_SALTO_TRAS", name: "Salto Para Trás", icon: "icon-tumble", type: "dash",
        req: "Arco curto", cooldown: 8, speedMult: 2.0, duration: 0.3,
        desc: "Recua 4 m em acrobacia e dispara uma flecha veloz."
      },
      ARCHER_BARREIRA: {
        id: "ARCHER_BARREIRA", name: "Barreira de Flechas", icon: "icon-volley", type: "buff",
        req: "Arco longo", cooldown: 14, duration: 4, buff: { stat: "defense", amount: 15 },
        desc: "Crava flechas numa cerca que bloqueia inimigos."
      },
      ARCHER_FLECHA_EXPLOSIVA: {
        id: "ARCHER_FLECHA_EXPLOSIVA", name: "Flecha Explosiva", icon: "icon-explosive-arrow", type: "projectile",
        req: null, cooldown: 8, damageMult: 3.2,
        desc: "Dispara uma flecha embebida em pólvora que explode ao impacto."
      },
      MAGE_BARREIRA_ESPELHOS: {
        id: "MAGE_BARREIRA_ESPELHOS", name: "Barreira de Espelhos", icon: "icon-mirror-barrier", type: "buff",
        req: "Cajado arcano", cooldown: 12, duration: 5, buff: { stat: "defense", amount: 18 },
        desc: "Espelhos prismáticos que desviam feitiços inimigos."
      },
      MAGE_COMETA_GELO: {
        id: "MAGE_COMETA_GELO", name: "Cometa de Gelo", icon: "icon-ice-comet", type: "projectile",
        req: "Cajado de gelo", cooldown: 8, damageMult: 3.4,
        desc: "Invoca um meteoro de gelo glacial que congela a área."
      },
      ROGUE_ROLAMENTO: {
        id: "ROGUE_ROLAMENTO", name: "Rolamento", icon: "icon-tumble", type: "dash",
        req: "Adagas gêmeas", cooldown: 6, speedMult: 2.5, duration: 0.35,
        desc: "Rola atravessando inimigos sem sofrer dano."
      },
      ROGUE_DANCA_ADAGAS: {
        id: "ROGUE_DANCA_ADAGAS", name: "Dança das Adagas", icon: "icon-daggers", type: "melee-heavy",
        req: "Adagas gêmeas", cooldown: 7, damageMult: 3.5,
        desc: "Cinco golpes ultra rápidos seguidos em turbilhão."
      },
      ROGUE_MARCA_MORTE: {
        id: "ROGUE_MARCA_MORTE", name: "Marca da Morte", icon: "icon-death-mark", type: "buff",
        req: "Adaga única", cooldown: 8, duration: 6, buff: { stat: "damage", amount: 8 },
        desc: "Marca o alvo: ele recebe dano amplificado em 30%."
      },
      NECROMANCER_ARMADURA_OSSEA: {
        id: "NECROMANCER_ARMADURA_OSSEA", name: "Armadura Óssea", icon: "icon-bone-armor", type: "buff",
        req: null, cooldown: 14, duration: 6, buff: { stat: "defense", amount: 20 },
        desc: "Absorve completamente até 5 golpes recebidos."
      },
      NECROMANCER_PRAGA: {
        id: "NECROMANCER_PRAGA", name: "Praga", icon: "icon-plague", type: "aoe",
        req: "Cetro", cooldown: 10, damageMult: 2.2, radius: 100,
        desc: "Nuvem necrótica que sufoca e drena os infectados."
      },
      NECROMANCER_CEIFA: {
        id: "NECROMANCER_CEIFA", name: "Ceifa", icon: "icon-scythe", type: "aoe",
        req: "Foice", cooldown: 8, damageMult: 2.8, radius: 85,
        desc: "Giro da foice que arranca a alma e cura vida."
      },
      HUNTER_UIVO_PROTECAO: {
        id: "HUNTER_UIVO_PROTECAO", name: "Uivo de Proteção", icon: "icon-wolf-howl", type: "buff",
        req: "Apito do Lobo", cooldown: 16, duration: 5, buff: { stat: "defense", amount: 15 },
        desc: "O lobo absorve metade do dano sofrido por você."
      },
      HUNTER_TIRO_DUPLO: {
        id: "HUNTER_TIRO_DUPLO", name: "Tiro Duplo", icon: "icon-double-shot", type: "projectile",
        req: "Arco curto", cooldown: 5, damageMult: 2.4,
        desc: "Duas flechas em sequência com cadência dobrada."
      },
      HUNTER_ATAQUE_COORDENADO: {
        id: "HUNTER_ATAQUE_COORDENADO", name: "Ataque Coordenado", icon: "icon-coordinated-strike", type: "buff",
        req: "Apito do Lobo", cooldown: 12, duration: 4, buff: { stat: "damage", amount: 10 },
        desc: "Você e o lobo concentram presas e flechas no mesmo alvo."
      },
      SHAMAN_CIRCULO_JUREMA: {
        id: "SHAMAN_CIRCULO_JUREMA", name: "Círculo de Jurema", icon: "icon-nature-circle", type: "buff",
        req: "Maracá Sagrado", cooldown: 16, duration: 6, buff: { stat: "maxHp", amount: 6 },
        desc: "Raízes ancestrais que curam aliados e imobilizam invasores."
      },
      SHAMAN_ESCUDO_CASCA: {
        id: "SHAMAN_ESCUDO_CASCA", name: "Escudo de Casca", icon: "icon-bark-shield", type: "buff",
        req: "Lâmina", cooldown: 14, duration: 6, buff: { stat: "defense", amount: 14 },
        desc: "Casca viva de sumaúma que absorve o impacto de golpes."
      },
      SHAMAN_DARDOS: {
        id: "SHAMAN_DARDOS", name: "Saraivada de Dardos", icon: "icon-poison-darts", type: "projectile",
        req: "Zarabatana ou arco", cooldown: 8, damageMult: 2.8,
        desc: "Cinco dardos venenosos em leque carregados com curare."
      },
      SHAMAN_DANCA_GUERRA: {
        id: "SHAMAN_DANCA_GUERRA", name: "Dança de Guerra", icon: "icon-war-dance", type: "aoe",
        req: "Lâmina", cooldown: 9, damageMult: 3.0, radius: 80,
        desc: "Giro veloz de três golpes consagrados aos espíritos."
      },
      DRUID_PISOTEIO: {
        id: "DRUID_PISOTEIO", name: "Pisoteio", icon: "icon-boar-charge", type: "dash",
        req: "Forma de Javali", cooldown: 8, speedMult: 2.2, duration: 0.4,
        desc: "Investida brutal de javali que atropela tudo à frente."
      },
      DRUID_CIRCULO_CARVALHOS: {
        id: "DRUID_CIRCULO_CARVALHOS", name: "Círculo de Carvalhos", icon: "icon-oak-circle", type: "buff",
        req: "Cajado de carvalho", cooldown: 16, duration: 5, buff: { stat: "defense", amount: 16 },
        desc: "Anel de carvalhos centenários que protege contra projéteis."
      },
      DRUID_UIVO_SANGUINARIO: {
        id: "DRUID_UIVO_SANGUINARIO", name: "Uivo Sanguinário", icon: "icon-blood-howl", type: "buff",
        req: "Forma de Lobisomem", cooldown: 14, duration: 6, buff: { stat: "damage", amount: 12 },
        desc: "Fúria lupina que concede velocidade de ataque frenética."
      },
      DRUID_COLHEITA_VISCO: {
        id: "DRUID_COLHEITA_VISCO", name: "Colheita do Visco", icon: "icon-scythe-harvest", type: "aoe",
        req: "Foice de Ouro", cooldown: 10, damageMult: 3.0, radius: 85,
        desc: "Corte ritualístico em arco que drena a essência vital."
      }
    };

    Object.assign(window.Ye, abilities);
  };

  // Helper to re-spec spent points in Endless Mode
  window.__resetInfiniteSkills = function(scene) {
    if (!scene || scene.mode !== 'endless') return !1;
    const skillsState = scene.registry?.get('endless:skills');
    if (!skillsState) return !1;

    skillsState.invested = {};
    skillsState.spentPoints = 0;
    skillsState.spentNmPoints = 0;

    scene.stats?.recompute();
    scene.game?.audioEngine?.sfx?.("sfx-shrine-use");
    scene.game.events.emit("ui:banner", "PONTOS DA ÁRVORE REDISTRIBUÍDOS!", "#00ff88");
    return !0;
  };

  // Helper to record Endless Run into Hall of Fame
  window.__recordEndlessRun = function(scene) {
    if (!scene || scene.mode !== 'endless') return;
    try {
      const skillsState = scene.registry?.get('endless:skills') || {};
      const stats = scene.stats || {};
      const heroId = scene.classDef?.name || 'Guerreiro';
      const tree = skillsState.chosenTree === 'defense' ? 'Defensivo' : 'Ofensivo';
      const depth = scene.endlessDepth || 1;
      const kills = scene.endlessKills || 0;
      const nm = stats.nm || 0;

      const record = {
        date: new Date().toLocaleDateString('pt-BR'),
        hero: heroId,
        tree: tree,
        depth: depth,
        nightmare: nm,
        kills: kills
      };

      const key = "dungeon-crawler:hall_of_fame";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(record);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 10)));
    } catch(e) {}
  };

})();