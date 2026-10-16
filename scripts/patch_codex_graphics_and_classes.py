# -*- coding: utf-8 -*-
"""
Patch for DepthGate Codex:
1. Exact DepthGate class names and abilities for __CODEX_HEROES:
   - WARRIOR: Guerreiro
   - BERSERKER: Samurai (strictly Samurai, never Berserker)
   - ARCHER: Arqueiro (never Arqueira)
   - MAGE: Maga
   - ROGUE: Ladina
   - NECROMANCER: Necromante
   - HUNTER: Caçador
   - SHAMAN: Xamã (Tupi warrior: Raízes de Jurema, Dardos de Curare, Espírito do Gavião)
   - PALADIN: Druida (Guardiã da mata: Bear/Javali, Panther/Lobisomem, Eagle companion)

2. Complete Graphical Cartography Engine for renderBiomePage:
   - Authentic antique fantasy map plate for each biome
   - Hand-crafted terrain art (rivers, trees, magma rivers, glacial crevasses, castle flagstones, temple sands, etc.)
   - Paved stone corridors, 3D masonry room bevels, portal vortex, secret room runes, boss skull crests
   - Ornate compass rose (Rosa dos Ventos), coordinate ticks, scale bar, and top cartouche
   - Interactive room selection with tactical briefing HUD below the map
"""

import os
import re

NEW_CODEX_HEROES_JS = '''const __CODEX_HEROES = [
  {
    id: "WARRIOR",
    name: "Guerreiro",
    subtitle: "Bastião de Aço & Guarda Inabalável",
    spriteKey: "player-warrior",
    era: "Primeira Dinastia de Valdrak (Era dos Reinos Antigos)",
    dimension: "Plano Material Primário (Terra Firme)",
    role: "Linha de Frente, Defesa & Controle de Multidão",
    weapon: "Espada Larga Imperial & Escudo de Carvalho Reforçado",
    lore: "Veterano condecorado da guarda pessoal do imperador ancestral, o Guerreiro jurou manter o escudo erguido até que a última alma inocente estivesse a salvo. Durante o colapso da Grande Fenda, ele permaneceu na retaguarda segurando a maré de criaturas do Abismo até ser engolido pelo vórtice.",
    motivation: "Restabelecer a ordem e a honra de sua legião caída, provando que a coragem e a disciplina de aço podem superar os horrores das Profundezas.",
    abilities: [
      "Golpe de Escudo (Shield Bash): Avanço demolidor com o broquel que atordoa e abre brechas na guarda inimiga.",
      "Muralha de Escudos (Shield Wall): Postura defensiva impenetrável que mitiga danos frontais e repele projéteis.",
      "Golpe Pesado (Heavy Strike): Golpe vertical de espada com tremendo impacto, causando dano físico massivo em área."
    ]
  },
  {
    id: "BERSERKER",
    name: "Samurai",
    subtitle: "Mestre da Katana & Disciplina do Vento",
    spriteKey: "player-berserker",
    era: "Período Shogunal do Lótus Carmesim",
    dimension: "Plano Oriental das Brumas Cortantes",
    role: "Dano Físico Rápido, Cortes Críticos & Mobilidade",
    weapon: "Katana Forjada em Aço Sagrado & Estilo Iaijutsu",
    lore: "Criado nos mosteiros isolados dos picos enevoados, este espadachim dedicou toda a existência ao domínio supremo de um único corte perfeito. Quando uma fenda dimensional devorou seu templo ancestral, ele embainhou sua katana e atravessou o vórtice em busca de equilíbrio e purificação.",
    motivation: "Atingir a perfeição espiritual da espada, cortar a corrupção abissal na raiz e honrar os ancestrais de seu clã.",
    abilities: [
      "Iaijutsu: Saque ultra-rápido da katana em velocidade relâmpago, fatiando todos os oponentes em uma linha reta.",
      "Kiai: Grito de batalha espiritual que canaliza o foco interno, ampliando o poder de ataque e velocidade.",
      "Kaze-Giri: Corte do vento que projeta uma lâmina de ar cortante à distância, rasgando defesas inimigas."
    ]
  },
  {
    id: "ARCHER",
    name: "Arqueiro",
    subtitle: "Vigilante dos Horizontes & Precisão Letal",
    spriteKey: "player-archer",
    era: "Era das Florestas Eternas (Pacto Verde)",
    dimension: "Reinos das Fronteiras Silvestres",
    role: "Dano à Distância, Precisão Crítica & Agilidade",
    weapon: "Arco Longo Élfico & Flechas com Ponta Perfurante",
    lore: "Um patrulheiro lendário das florestas fronteiriças cuja visão alcança o bater de asas de um pássaro a centenas de passos. Quando os selos ancestrais ruíram e criaturas da escuridão invadiram as copas sagradas, ele seguiu o rastro das fendas para caçar as abominações em sua própria origem.",
    motivation: "Impedir que a podridão do Abismo alcance as florestas de seu povo e garantir que nenhuma flecha seja disparada em vão.",
    abilities: [
      "Disparo Múltiplo (Multi-shot): Dispara simultaneamente uma salva de flechas em arco, limpando fileiras de agressores.",
      "Flecha Explosiva: Flecha infundida com pólvora arcana que detona no impacto, espalhando estilhaços incandescentes.",
      "Repulsão (Repulse): Disparo tático à queima-roupa com onda de choque, repelindo inimigos que tentam encurralá-lo."
    ]
  },
  {
    id: "MAGE",
    name: "Maga",
    subtitle: "Erudita do Fogo & Canalizadora Arcana",
    spriteKey: "player-mage",
    era: "Século Dourado da Academia Arcana de Dal-Vor",
    dimension: "Plano das Correntes de Éter",
    role: "Dano Mágico Massivo em Área & Aniquilação",
    weapon: "Cajado de Cristal de Éter & Tomo de Piromancia",
    lore: "Prodígio dos círculos superiores de magia, dedicou anos decifrando manuscritos sobre as portas proibidas que conectavam os planos. Quando um experimento com fendas instáveis ameaçou consumir a biblioteca sagrada, ela usou sua própria mana para conter o colapso e adentrou o portal para selá-lo por dentro.",
    motivation: "Compreender a natureza cósmica das Profundezas e extrair o conhecimento arcano necessário para fechar as brechas para sempre.",
    abilities: [
      "Bola de Fogo (Fireball): Projétil ígneo concentrado que explode violentamente ao atingir o alvo, incinerando a área.",
      "Explosão Arcana: Detonação circular de energia pura ao redor da maga que dissipa enxames de inimigos.",
      "Meteoro: Invoca uma rocha estelar incandescente dos céus que desaba com força sísmica devastadora."
    ]
  },
  {
    id: "ROGUE",
    name: "Ladina",
    subtitle: "Sombra das Vielas & Carrasco Silencioso",
    spriteKey: "player-rogue",
    era: "Era dos Sindicatos das Cidades Flutuantes",
    dimension: "Plano Umbral das Cidades Subterrâneas",
    role: "Furtividade, Assassinato Rápido & Dano Crítico Extremo",
    weapon: "Adagas Gêmeas de Aço Negro Envenenadas",
    lore: "Nascida no submundo onde apenas os mais rápidos sobrevivem, dominou as técnicas de infiltração e eliminação cirúrgica antes de atingir a maioridade. Atraída pelos rumores de relíquias inestimáveis e tesouros esquecidos nos cofres de Valdrak, ela usou os portais como passagem secreta definitiva.",
    motivation: "Saquear os maiores segredos e tesouros das câmaras esquecidas enquanto testa suas adagas contra os horrores do Abismo.",
    abilities: [
      "Passo das Sombras (Shadow Step): Teletransporte instantâneo pelas trevas diretamente para trás do adversário.",
      "Golpe Traiçoeiro (Backstab): Punhalada letal nas costas que desfere dano crítico multiplicador devastador.",
      "Leque de Lâminas: Giro acrobático arremessando lâminas envenenadas em todas as direções."
    ]
  },
  {
    id: "NECROMANCER",
    name: "Necromante",
    subtitle: "Comandante das Almas & Senhor dos Ossos",
    spriteKey: "player-necromancer",
    era: "Era da Lua Pálida & Cisma dos Mortos",
    dimension: "Plano das Cinzas & Sepulcros Sem Fim",
    role: "Invocação de Lacaios, Magia Sombria & Controle",
    weapon: "Cajado de Marfim Necrótico & Foice de Almas",
    lore: "Um erudito rejeitado que compreendeu que a morte não é um fim, mas uma ferramenta de ordem cósmica. Enquanto outros temiam as profundezas, ele viu nos miasmas abissais a oportunidade suprema de erguer um exército imortal capaz de sobrepujar a própria escuridão com seus próprios métodos.",
    motivation: "Descobrir a fonte primordial que reanima os mortos nos calabouços de Valdrak e submeter as entidades profanas à sua vontade.",
    abilities: [
      "Invocar Esqueleto (Summon Skeleton): Ergue soldados esqueléticos do solo que lutam lealmente e absorvem ataques.",
      "Lança de Ossos (Bone Spear): Dispara um projétil de ossos pontiagudos que perfura múltiplos alvos em sequência.",
      "Nova Maldita (Curse Nova): Expansão de energia necrótica que enfraquece, amaldiçoa e drena a vitalidade dos alvos."
    ]
  },
  {
    id: "HUNTER",
    name: "Caçador",
    subtitle: "Rastreador das Terras Selvagens & Alfa da Matilha",
    spriteKey: "player-hunter",
    era: "Era Pré-Imperial das Savanas & Cordilheiras",
    dimension: "Territórios Ermos do Norte",
    role: "Combate com Companheiro Bestial, Armadilhas & Disparo Preciso",
    weapon: "Arco Composto de Chifre, Dardos Silenciosos & Fera",
    lore: "Cresceu nas fronteiras mais hostis onde os homens são presas fáceis. Ao lado de seu fiel lobo espiritual, aprendeu a ler cada pegada, galho quebrado e mudança nos ventos. Atravessou a fenda quando feras corrompidas começaram a transbordar para suas terras sagradas de caça.",
    motivation: "Rastrear a besta suprema que lidera a corrupção das criaturas e garantir a sobrevivência de sua matilha.",
    abilities: [
      "Companheiro Lobo (Wolf Companion): Invoca seu leal lobo alfa para combater inimigos, flanquear e proteger seu mestre.",
      "Tiro Preciso (Aimed Shot): Disparo cuidadosamente calculado que atravessa armaduras e causa ferimentos críticos.",
      "Armadilha de Espinhos (Snare Trap): Planta uma armadilha no solo que imobiliza e dilacera quem passar sobre ela."
    ]
  },
  {
    id: "SHAMAN",
    name: "Xamã",
    subtitle: "Guerreira Tupi & Guardiã dos Espíritos Sagrados",
    spriteKey: "player-shaman",
    era: "Tempo Ancestral das Matas Virgens de Pindorama",
    dimension: "Plano Espiritual das Grandes Florestas Primordiais",
    role: "Magia Primal, Controle de Raízes, Venenos & Força da Mata",
    weapon: "Lâmina Xamânica Cerimonial, Cocar de Penas & Maracá Sagrado",
    lore: "Escolhida pelos pajés e pelos espíritos dos rios e das matas após receber a visão de que sombras estrangeiras de outras eras estavam aprisionando as forças da natureza. Com sua lâmina xamânica afiada e pinturas de guerra sagradas, ela cruzou os portais com a bênção dos trovões de Tupã.",
    motivation: "Expulsar a podridão dimensional que ameaça os espíritos ancestrais da floresta e restaurar a harmonia da terra viva.",
    abilities: [
      "Raízes de Jurema: Faz brotar do solo raízes sagradas de Jurema que enredam, imobilizam e sufocam os agressores.",
      "Dardos de Curare: Lança dardos com o mais potente veneno da floresta, causando paralisia e dano contínuo corrosivo.",
      "Espírito do Gavião: Invoca o espírito celestial do gavião que mergulha dos céus com garras fulminantes de trovão."
    ]
  },
  {
    id: "PALADIN",
    name: "Druida",
    subtitle: "Guardiã da Mata & Senhora das Feras",
    spriteKey: "player-paladin",
    era: "Era do Carvalho Primordial & Pacto da Vida",
    dimension: "Plano Silvestre dos Círculos Druídicos",
    role: "Metamorfose Bestial, Resistência Natural & Aliados Alados",
    weapon: "Garras Selvagens, Magia da Terra & Garras da Fera",
    lore: "Consagrada nos círculos druídicos que mantinham os pilares da vida em harmonia. Quando as fendas começaram a rasgar as árvores-mãe, ela canalizou a fúria dos predadores primordiais, abandonando sua forma humana quando necessário para defender o solo com dentes e garras.",
    motivation: "Proteger os santuários naturais da profanação das trevas e esmagar as abominações que desonram a cadeia natural.",
    abilities: [
      "Forma de Javali / Urso (Bear Form): Metamorfoseia-se em uma fera maciça e impetuosa, ganhando defesa colossal e atropelo.",
      "Forma de Pantera / Lobo (Panther Form): Transforma-se em um predador ágil e furtivo, rasgando oponentes com ataques velozes.",
      "Águia Companheira (Eagle Companion): Convoca uma águia sagrada que sobrevoa a batalha, fustigando olhos e distraindo ameaças."
    ]
  }
];'''

NEW_RENDER_BIOME_PAGE_JS = '''renderBiomePage(idx, LX, RX, PW) {
    const b = __CODEX_BIOMES[idx];
    if (!b) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: CARTA CARTOGRÁFICA GRÁFICA & TOPOGRAFIA ===
    L.add(this.add.text(LX + 10, 34, b.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold", color: "#2b190c"
    }));

    L.add(this.add.text(LX + 10, 48, `Carta Cartográfica • ${b.title}`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7px", color: "#7a5c36"
    }));

    // Canvas do Mapa Gráfico Topográfico
    const mapG = this.add.graphics();
    const mapX = LX + 8, mapY = 60, mapW = PW - 16, mapH = 142;

    // Paleta de terreno específica por bioma
    const biomePalettes = {
      forest:   { bg: 0x122214, border: 0x3d7032, path: 0x5a4832, room: 0x223820, roomB: 0x528c40, water: 0x286080, accent: 0x44aa44 },
      castle:   { bg: 0x181822, border: 0x685e82, path: 0x383648, room: 0x282838, roomB: 0x8a7cb0, water: 0x121028, accent: 0xa02828 },
      catacombs:{ bg: 0x181514, border: 0x7a6250, path: 0x3e322a, room: 0x28211c, roomB: 0x9c7e68, water: 0x1a2e22, accent: 0xbb3322 },
      ruins:    { bg: 0x1d2016, border: 0x6e784c, path: 0x484232, room: 0x2a301e, roomB: 0x8a985e, water: 0x244240, accent: 0xd4a030 },
      temple:   { bg: 0x2a2012, border: 0xa88438, path: 0x5a4628, room: 0x3c2e1a, roomB: 0xd8ac4c, water: 0x207068, accent: 0xe0a020 },
      glacial:  { bg: 0x101c29, border: 0x4a7ea8, path: 0x243e58, room: 0x1c3044, roomB: 0x76b2db, water: 0x0a121c, accent: 0x9be2ff },
      vulcao:   { bg: 0x1c1210, border: 0x9c3620, path: 0x4a2218, room: 0x301814, roomB: 0xde4e2c, water: 0xff4800, accent: 0xffaa00 },
      fortress: { bg: 0x1c1414, border: 0x8a3838, path: 0x442626, room: 0x2c1c1c, roomB: 0xb84444, water: 0x301010, accent: 0xd43030 },
      bosque:   { bg: 0x0f2215, border: 0x2e6e3e, path: 0x463b22, room: 0x1a3822, roomB: 0x429658, water: 0x163e32, accent: 0x2ed664 },
      rio:      { bg: 0x0d1a29, border: 0x386894, path: 0x4a4434, room: 0x182c40, roomB: 0x5894cc, water: 0x143452, accent: 0x38b8e0 },
      morta:    { bg: 0x1a1622, border: 0x5a486e, path: 0x362c42, room: 0x282035, roomB: 0x826c9c, water: 0x14101a, accent: 0x9b59b6 }
    };
    const pal = biomePalettes[b.id] || biomePalettes.forest;

    // Fundo pergaminho escuro envelhecido
    mapG.fillStyle(pal.bg, 0.96).fillRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(1.5, pal.border, 0.85).strokeRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(0.5, 0xecd79b, 0.25).strokeRoundedRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, 5);

    // Cantoneiras douradas decorativas da moldura
    const cSize = 6;
    mapG.lineStyle(1.5, 0xc9a24a, 0.9);
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + 3, mapX + 3 + cSize, mapY + 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + 3, mapX + 3, mapY + 3 + cSize));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + 3, mapX + mapW - 3 - cSize, mapY + 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + 3, mapX + mapW - 3, mapY + 3 + cSize));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + mapH - 3, mapX + 3 + cSize, mapY + mapH - 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + mapH - 3, mapX + 3, mapY + mapH - 3 - cSize));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + mapH - 3, mapX + mapW - 3 - cSize, mapY + mapH - 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + mapH - 3, mapX + mapW - 3, mapY + mapH - 3 - cSize));

    // Elementos gráficos de terreno específicos desenhados no relevo
    if (b.id === "forest" || b.id === "bosque") {
      // Rio / riacho sinuoso
      mapG.lineStyle(4, pal.water, 0.7);
      mapG.beginPath();
      mapG.moveTo(mapX + mapW * 0.48, mapY + 8);
      mapG.lineTo(mapX + mapW * 0.52, mapY + mapH * 0.45);
      mapG.lineTo(mapX + mapW * 0.46, mapY + mapH * 0.88);
      mapG.strokePath();
      // Árvores da copa ilustradas
      mapG.fillStyle(pal.roomB, 0.25);
      [ [12, 12], [mapW - 16, 14], [14, mapH - 16], [mapW * 0.5, 16], [mapW * 0.45, mapH - 18] ].forEach(([ox, oy]) => {
        mapG.fillCircle(mapX + ox, mapY + oy, 7);
      });
    } else if (b.id === "castle") {
      // Fosso abissal / linhas de muralha
      mapG.lineStyle(1, 0x3d3852, 0.5);
      mapG.strokeRect(mapX + 10, mapY + 12, mapW - 20, mapH - 24);
      // Tapete vermelho do trono real
      mapG.fillStyle(0x8a1818, 0.4).fillRect(mapX + mapW * 0.48, mapY + mapH * 0.5, 8, mapH * 0.35);
    } else if (b.id === "vulcao") {
      // Rios de magma incandescentes
      mapG.lineStyle(3, 0xff5500, 0.8);
      mapG.beginPath();
      mapG.moveTo(mapX + mapW * 0.15, mapY + 10);
      mapG.lineTo(mapX + mapW * 0.45, mapY + mapH * 0.5);
      mapG.lineTo(mapX + mapW * 0.85, mapY + mapH * 0.85);
      mapG.strokePath();
      mapG.lineStyle(1.5, 0xffbb00, 0.95);
      mapG.strokePath();
    } else if (b.id === "glacial") {
      // Fissuras profundas no gelo
      mapG.lineStyle(2, 0x081018, 0.8);
      mapG.beginPath();
      mapG.moveTo(mapX + 15, mapY + mapH * 0.4);
      mapG.lineTo(mapX + mapW * 0.5, mapY + mapH * 0.48);
      mapG.lineTo(mapX + mapW - 20, mapY + mapH * 0.42);
      mapG.strokePath();
      mapG.lineStyle(1, 0x9be2ff, 0.4);
      mapG.strokePath();
    } else if (b.id === "rio") {
      // Ondas e ilhas
      mapG.lineStyle(1, 0x20507a, 0.4);
      for (let w = 0; w < 4; w++) {
        mapG.strokeCircle(mapX + mapW * 0.5, mapY + mapH * 0.5, 20 + w * 18);
      }
    } else if (b.id === "temple") {
      // Dunas de areia onduladas
      mapG.lineStyle(1, 0x785a28, 0.35);
      for (let d = 0; d < 3; d++) {
        mapG.beginPath();
        mapG.moveTo(mapX + 10, mapY + 30 + d * 35);
        mapG.lineTo(mapX + mapW - 10, mapY + 40 + d * 35);
        mapG.strokePath();
      }
    }

    // Grid e cálculo de coordenadas para salas
    const cellW = mapW / 11, cellH = mapH / 10;

    // Corredores de pedra conectando salas (desenhados com borda de alvenaria)
    mapG.lineStyle(3.5, 0x0c0906, 0.7);
    for (let i = 0; i < b.rooms.length - 1; i++) {
      const r1 = b.rooms[i], r2 = b.rooms[i + 1];
      const cx1 = mapX + (r1.x + r1.w / 2) * cellW;
      const cy1 = mapY + (r1.y + r1.h / 2) * cellH;
      const cx2 = mapX + (r2.x + r2.w / 2) * cellW;
      const cy2 = mapY + (r2.y + r2.h / 2) * cellH;
      mapG.lineBetween(cx1, cy1, cx2, cy2);
    }
    mapG.lineStyle(2, pal.path, 0.95);
    for (let i = 0; i < b.rooms.length - 1; i++) {
      const r1 = b.rooms[i], r2 = b.rooms[i + 1];
      const cx1 = mapX + (r1.x + r1.w / 2) * cellW;
      const cy1 = mapY + (r1.y + r1.h / 2) * cellH;
      const cx2 = mapX + (r2.x + r2.w / 2) * cellW;
      const cy2 = mapY + (r2.y + r2.h / 2) * cellH;
      mapG.lineBetween(cx1, cy1, cx2, cy2);
    }

    // Desenhar cada câmara com relevo 3D de alvenaria e insígnias
    b.rooms.forEach((rm, rIdx) => {
      const rx = mapX + rm.x * cellW, ry = mapY + rm.y * cellH;
      const rw = rm.w * cellW, rh = rm.h * cellH;

      // Sombra exterior de profundidade das paredes
      mapG.fillStyle(0x060403, 0.65).fillRoundedRect(rx + 1.5, ry + 2, rw, rh, 3);

      if (rm.boss) {
        // Câmara do Chefe / Lorde
        mapG.fillStyle(0x4a1210, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.5, 0xe23c2c, 0.95).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0xffaa88, 0.5).strokeRoundedRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3, 2);
      } else if (rm.secret) {
        // Câmara Oculta / Segredo Arcano
        mapG.fillStyle(0x2d123d, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.5, 0xb04fe6, 0.95).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0xe2a8ff, 0.5).strokeRoundedRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3, 2);
      } else if (rIdx === 0) {
        // Câmara de Entrada / Portal Dimensional
        mapG.fillStyle(0x122434, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.5, 0x38a0d4, 0.95).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0x8ce0ff, 0.5).strokeRoundedRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3, 2);
      } else {
        // Câmaras Regulares com piso temático
        mapG.fillStyle(pal.room, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.2, pal.roomB, 0.85).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0xd0c4a4, 0.2).strokeRoundedRect(rx + 1, ry + 1, rw - 2, rh - 2, 2);
      }

      // Rótulo da câmara
      let prefix = "";
      let color = "#e6dcc8";
      if (rm.boss) { prefix = "☠ "; color = "#ff9a8a"; }
      else if (rm.secret) { prefix = "★ "; color = "#deb8ff"; }
      else if (rIdx === 0) { prefix = "◈ "; color = "#9fe2ff"; }

      const lbl = L.add(this.add.text(rx + rw / 2, ry + rh / 2, prefix + rm.label, {
        fontFamily: "'Courier New', monospace", fontSize: "6.5px", fontStyle: "bold", color: color
      }).setOrigin(0.5));

      // Área interativa da câmara
      const hitZone = this.add.zone(rx + rw / 2, ry + rh / 2, rw, rh).setOrigin(0.5).setInteractive({ useHandCursor: true });
      hitZone.on("pointerdown", () => {
        this.game.audioEngine?.sfx("sfx-ui-click");
        this.updateRoomBriefing(b, rm, rIdx);
      });
      hitZone.on("pointerover", () => lbl.setColor("#ffff55"));
      hitZone.on("pointerout", () => lbl.setColor(color));
      L.add(hitZone);
    });

    // Rosa dos Ventos (Compass Rose) em estilo cartográfico antigo no canto superior
    const roseX = mapX + mapW - 15, roseY = mapY + 15;
    mapG.fillStyle(0x0a0705, 0.75).fillCircle(roseX, roseY, 10);
    mapG.lineStyle(1, 0xc9a24a, 0.85).strokeCircle(roseX, roseY, 10);
    mapG.lineStyle(1.5, 0xc9a24a, 1);
    mapG.strokeLineShape(new Phaser.Geom.Line(roseX, roseY - 9, roseX, roseY + 9));
    mapG.strokeLineShape(new Phaser.Geom.Line(roseX - 9, roseY, roseX + 9, roseY));
    mapG.fillStyle(0xdf3824, 1).fillTriangle(roseX, roseY - 9, roseX - 2.5, roseY - 1, roseX + 2.5, roseY - 1);
    mapG.fillStyle(0xecd79b, 0.8).fillTriangle(roseX, roseY + 9, roseX - 2, roseY + 1, roseX + 2, roseY + 1);
    L.add(this.add.text(roseX, roseY - 10, "N", { fontFamily: "'Courier New', monospace", fontSize: "5.5px", fontStyle: "bold", color: "#ecd79b" }).setOrigin(0.5, 1));

    // Barra de escala cartográfica no canto inferior
    mapG.lineStyle(1, 0xc9a24a, 0.8);
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 7, mapX + 38, mapY + mapH - 7));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 9, mapX + 8, mapY + mapH - 5));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 23, mapY + mapH - 8, mapX + 23, mapY + mapH - 6));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 38, mapY + mapH - 9, mapX + 38, mapY + mapH - 5));
    L.add(this.add.text(mapX + 23, mapY + mapH - 11, "50 braças", { fontFamily: "'Courier New', monospace", fontSize: "5px", color: "#b89e6e" }).setOrigin(0.5, 1));

    // Fita cartouche no topo do mapa
    L.add(this.add.text(mapX + 10, mapY + 5, "TOPOGRAFIA REGIONAL", {
      fontFamily: "'Courier New', monospace", fontSize: "6px", fontStyle: "bold", color: "#ecd79b"
    }));

    L.add(mapG);

    // Painel de Parâmetros Geográficos & Ameaças
    const legY = 206;
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0x130e09, 0.08).fillRoundedRect(LX + 8, legY, PW - 16, 82, 4);
    hudBox.lineStyle(1, 0x8a6230, 0.45).strokeRoundedRect(LX + 8, legY, PW - 16, 82, 4);
    L.add(hudBox);

    L.add(this.add.text(LX + 12, legY + 4, "DADOS CARTOGRÁFICOS & AMEAÇAS", {
      fontFamily: "'Courier New', monospace", fontSize: "6.5px", fontStyle: "bold", color: "#8a5822"
    }));

    const rows = [
      ["Grau de Perigo:", b.danger, "#a03020"],
      ["Atmosfera / Clima:", b.climate, "#4a3520"],
      ["Inimigos Típicos:", b.threat, "#3a2614"],
      ["Ameaça Suprema:", b.boss, "#8a2418"]
    ];

    rows.forEach(([k, v, c], i) => {
      const yy = legY + 14 + i * 14;
      L.add(this.add.text(LX + 12, yy, k, {
        fontFamily: "'Courier New', monospace", fontSize: "6px", fontStyle: "bold", color: "#7a6244"
      }));
      L.add(this.add.text(LX + 76, yy, v, {
        fontFamily: "Georgia, serif", fontSize: "6.5px", color: c, wordWrap: { width: PW - 88 }
      }));
    });

    // Faixa interativa de briefing de sala selecionada
    this.roomBriefingText = this.add.text(LX + 12, legY + 70, `[✦ Clique nas câmaras no mapa para inspecionar]`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "6px", color: "#8a5822", wordWrap: { width: PW - 24 }
    });
    L.add(this.roomBriefingText);

    // === PÁGINA DIREITA: CRÔNICA, SEGREDOS E DICAS ===
    R.add(this.add.text(RX + 10, 36, "CRÔNICA DA REGIÃO", {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold", color: "#2b190c"
    }));

    R.add(this.add.text(RX + 10, 52, b.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "7.5px", lineSpacing: 2, color: "#3a2818", wordWrap: { width: PW - 20 }
    }));

    // Segredos Arcanos
    const secY = 135;
    R.add(this.add.text(RX + 10, secY, "✦ ARQUITETURA & SEGREDOS OCULTOS", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#8a5822"
    }));

    R.add(this.add.text(RX + 10, secY + 14, b.secrets, {
      fontFamily: "Georgia, serif", fontSize: "7.5px", lineSpacing: 2, color: "#4a3520", wordWrap: { width: PW - 20 }
    }));

    // Caixa de Dica de Sobrevivência
    const tipBox = this.add.graphics();
    const tbX = RX + 8, tbY = 220, tbW = PW - 16, tbH = 75;
    tipBox.fillStyle(0x130e09, 0.08).fillRoundedRect(tbX, tbY, tbW, tbH, 4);
    tipBox.lineStyle(1, 0x8a6230, 0.5).strokeRoundedRect(tbX, tbY, tbW, tbH, 4);
    R.add(tipBox);

    R.add(this.add.text(tbX + 8, tbY + 6, "CONSELHO DO EXPLORADOR:", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#8a5822"
    }));

    R.add(this.add.text(tbX + 8, tbY + 18, b.tip, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7.5px", lineSpacing: 2, color: "#3a2818", wordWrap: { width: tbW - 16 }
    }));
  }

  updateRoomBriefing(b, rm, rIdx) {
    if (!this.roomBriefingText) return;
    let desc = "";
    if (rm.boss) {
      desc = `[COVIL DO CHEFE] ${rm.label}: Santuário do lorde supremo ${b.boss}. Prepare-se antes de cruzar!`;
    } else if (rm.secret) {
      desc = `[SEGREDO OCULTO] ${rm.label}: Câmara selada por runas. Contém oferendas raras e baús esquecidos.`;
    } else if (rIdx === 0) {
      desc = `[PORTAL DE ENTRADA] ${rm.label}: Ponto de chegada do vórtice dimensional e refúgio temporário.`;
    } else {
      desc = `[CÂMARA] ${rm.label}: Corredores patrulhados por ${b.threat.split(' e ')[0] || 'inimigos hostis'}.`;
    }
    this.roomBriefingText.setText(desc);
    this.roomBriefingText.setColor(rm.boss ? "#a02818" : rm.secret ? "#6e2ca0" : "#1e4828");
  }'''

def apply_patches():
    js_paths = [
        'assets/index-D6qIWtA7-p209.js',
        'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
    ]
    
    for path in js_paths:
        print(f"Patching {path}...")
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Replace __CODEX_HEROES
        h_start = content.find('const __CODEX_HEROES = [')
        h_end = content.find('const __CODEX_LEGENDS = [', h_start)
        if h_start == -1 or h_end == -1:
            raise ValueError(f"Could not find __CODEX_HEROES in {path}")
        
        content = content[:h_start] + NEW_CODEX_HEROES_JS + '\n\n' + content[h_end:]
        print("  Replaced __CODEX_HEROES successfully.")

        # 2. Replace renderBiomePage
        b_start = content.find('renderBiomePage(idx, LX, RX, PW) {')
        h_render = content.find('renderHeroPage(idx, LX, RX, PW) {', b_start)
        if b_start == -1 or h_render == -1:
            raise ValueError(f"Could not find renderBiomePage in {path}")

        # Find the comment '// --- Seção II: Páginas de Heróis ---' right before renderHeroPage
        sec2_idx = content.rfind('// --- Se', b_start, h_render)
        if sec2_idx == -1:
            sec2_idx = h_render
            
        content = content[:b_start] + NEW_RENDER_BIOME_PAGE_JS + '\n\n  ' + content[sec2_idx:]
        print("  Replaced renderBiomePage successfully.")

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved {path}")

if __name__ == '__main__':
    apply_patches()
