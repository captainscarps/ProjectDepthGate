# Vozes em português que faltam (Gemini TTS)

Total: **53 falas** — Falas exclusivas de cada herói: 30, Ecos dos Antigos: 23.

Gerado por `scripts/pt_voice_todo.py` a partir do manifesto (`assets/audio/voice/voice-manifest.json`) e do jogo; rode de novo para atualizar a lista (o que já foi gravado sai dela).

O prólogo e os monólogos da volta já estão completos (cada herói com a sua voz). As falas abaixo já tocam no jogo, mas foram gravadas antes da direção de voz atual (algumas com a voz de outro personagem); regravar deixa cada personagem com uma voz só, no tom e no sentimento certos.

## Como gerar em outro computador

1. Clone o repositório e instale: Python 3 com `numpy librosa lameenc`, o `ffmpeg` no PATH e Node com `npm i acorn acorn-walk` (numa pasta qualquer; aponte `NODE_PATH` para a `node_modules` dela).
2. Defina a chave **só no terminal** (nunca grave em arquivo do repositório): `export GEMINI_API_KEY=...` (Windows PowerShell: `$env:GEMINI_API_KEY="..."`).
3. Rode cada etapa primeiro com `gemini-2.5-pro-preview-tts`; quando parar com 429 (cota do dia), repita a mesma etapa com `gemini-2.5-flash-preview-tts`. Os scripts só fazem o que falta, então dá para parar e voltar no dia seguinte.

   - Falas exclusivas de cada herói: `python3 -u scripts/generate_pt_fixes_gemini.py exclusivas --model gemini-2.5-pro-preview-tts`
   - Ecos dos Antigos: `python3 -u scripts/generate_pt_fixes_gemini.py ecos --model gemini-2.5-pro-preview-tts`

4. Confira com `python3 scripts/audit_pt_voices.py` e com `python3 scripts/pt_voice_todo.py` (a lista deve zerar).
5. Faça commit de `assets/audio/voice/pt/` e do `voice-manifest.json` e envie para o GitHub.

Como cada fala é dirigida (já está nos scripts, em `scripts/pt_voice_direction.py`): no máximo 2 tiradas por fala; cada personagem tem a sua voz Gemini, que nenhum outro usa; a instrução diz a persona e o sentimento lido do texto; o tom é medido e ajustado em no máximo 8% para ficar no tom médio do personagem; os ecos recebem o efeito de fantasma.

## Vozes

| Personagem | Voz Gemini | Persona |
|---|---|---|
| BERSERKER | Schedar | um samurai intenso e contido, de poucas palavras |
| WARRIOR | Alnilam | um guerreiro veterano, voz grave, firme e calejada |
| ARCHER | Puck | um arqueiro jovem, atento e de fala leve |
| ROGUE | Leda | uma ladina astuta, irônica e rápida |
| MAGE | Kore | uma maga culta, confiante e elegante |
| HUNTER | Algenib | um caçador do norte, rústico, calmo e observador |
| NECROMANCER | Enceladus | um necromante sombrio, voz baixa, culta e controlada |
| DRUID | Charon | um druida sereno, sábio e ligado à natureza |
| SHAMAN | Zephyr | uma xamã indígena, calorosa, espiritual e firme |
| echo-m | Orus | o eco de um homem antigo, distante e solene |
| echo-f | Vindemiatrix | o eco de uma mulher antiga, distante e melancólica |

## Falas exclusivas de cada herói (30)

| # | Arquivo | Personagem | Voz | Sentimento pedido | Texto |
|---|---|---|---|---|---|
| 1 | `9fd43e11.mp3 e 9fd43e11-BERSERKER.mp3` | BERSERKER | Schedar | como um samurai intenso e contido, de poucas palavras, pensativo, com pausas naturais | Esta cinza… é a mesma que caía sobre Sakurajima. O vulcão da minha terra. |
| 2 | `c40c6daf.mp3 e c40c6daf-BERSERKER.mp3` | BERSERKER | Schedar | como um samurai intenso e contido, de poucas palavras, intrigado, perguntando de verdade | Meu clã guardava as forjas da cratera. O que atravessou o fogo até aqui? |
| 3 | `2516f408.mp3 e 2516f408-BERSERKER.mp3` | BERSERKER | Schedar | como um samurai intenso e contido, de poucas palavras, pensativo, com pausas naturais | Hayato… se você me seguiu até aqui, perdoe o seu irmão teimoso. Eu precisava descer sozinho. |
| 4 | `2b395b2d.mp3 e 2b395b2d-BERSERKER.mp3` | BERSERKER | Schedar | como um samurai intenso e contido, de poucas palavras, de forma natural, como quem conversa | Meus ancestrais forjaram as fechaduras nesta lava. E juraram nunca contar por quê. |
| 5 | `695e116a.mp3 e 695e116a-WARRIOR.mp3` | WARRIOR | Alnilam | como um guerreiro veterano, voz grave, firme e calejada, de forma natural, como quem conversa | Minha família guardou a memória destes corredores por séculos. Meu ancestral, o Rei de Valdrak, abriu estes portões para salvar o nosso povo. |
| 6 | `5bae4e80.mp3 e 5bae4e80-WARRIOR.mp3` | WARRIOR | Alnilam | como um guerreiro veterano, voz grave, firme e calejada, pensativo, com pausas naturais | Se ainda restar alguma coisa dele aqui dentro… quem vai encontrá-lo sou eu. |
| 7 | `7ef26727.mp3 e 7ef26727-WARRIOR.mp3` | WARRIOR | Alnilam | como um guerreiro veterano, voz grave, firme e calejada, em tom grave e pesaroso, devagar | Este trono pertenceu ao meu sangue. As Profundezas não vão usá-lo como coroa. |
| 8 | `501c03e8.mp3 e 501c03e8-ARCHER.mp3` | ARCHER | Puck | como um arqueiro jovem, atento e de fala leve, em tom grave e pesaroso, devagar | Eu treinava o arco no alto de Sakurajima, contra o vento de cinzas. |
| 9 | `91ce803d.mp3 e 91ce803d-ARCHER.mp3` | ARCHER | Puck | como um arqueiro jovem, atento e de fala leve, com alívio e uma esperança cansada | Este não é o meu vulcão… mas a cinza tem o mesmo cheiro de casa. |
| 10 | `483ad510.mp3 e 483ad510-ARCHER.mp3` | ARCHER | Puck | como um arqueiro jovem, atento e de fala leve, pensativo, com pausas naturais | Estas marcas na rocha… são do corte do Akihiro. Meu irmão passou por aqui. |
| 11 | `d6557bba.mp3 e d6557bba-ARCHER.mp3` | ARCHER | Puck | como um arqueiro jovem, atento e de fala leve, de forma natural, como quem conversa | O Dragão Pálido guardava a cratera como quem guarda um portão. Sakurajima precisa saber disso. |
| 12 | `f632d45a.mp3 e f632d45a-ROGUE.mp3` | ROGUE | Leda | como uma ladina astuta, irônica e rápida, de forma natural, como quem conversa | Nasci nestas ilhas, entre contrabandistas. Conheço cada enseada — e estas marcas não estavam aqui. |
| 13 | `1cb19678.mp3 e 1cb19678-ROGUE.mp3` | ROGUE | Leda | como uma ladina astuta, irônica e rápida, de forma natural, como quem conversa | Alguém está construindo portais novos. |
| 14 | `a73701ab.mp3 e a73701ab-ROGUE.mp3` | ROGUE | Leda | como uma ladina astuta, irônica e rápida, pensativo, com pausas naturais | Pedras marcadas, barcos sem bandeira… a Ordem do Limiar é real. |
| 15 | `cc448887.mp3 e cc448887-MAGE.mp3` | MAGE | Kore | como uma maga culta, confiante e elegante, pensativo, com pausas naturais | Cresci entre as dunas de Ra-Khem. Os espelhos do templo nunca apontaram para baixo… até agora. |
| 16 | `9a00de42.mp3 e 9a00de42-MAGE.mp3` | MAGE | Kore | como uma maga culta, confiante e elegante, de forma natural, como quem conversa | Os portais não são aleatórios. Formam um círculo — e este é um dos elos. |
| 17 | `2aa3cf23.mp3 e 2aa3cf23-MAGE.mp3` | MAGE | Kore | como uma maga culta, confiante e elegante, em voz baixa e tensa, desconfiado | O templo não queimava as trevas. Prendia-as. Isto não é uma porta… é uma cela. |
| 18 | `94e711b0.mp3 e 94e711b0-HUNTER.mp3` | HUNTER | Algenib | como um caçador do norte, rústico, calmo e observador, em voz baixa e tensa, desconfiado | Neve que não derrete, vento que corta a pele… parece o Yukon. Mas o Yukon nunca teve este silêncio. |
| 19 | `6b3eca99.mp3 e 6b3eca99-HUNTER.mp3` | HUNTER | Algenib | como um caçador do norte, rústico, calmo e observador, de forma natural, como quem conversa | Os lobos do norte não uivam mais aqui. Alguma coisa os calou. |
| 20 | `25c9f25a.mp3 e 25c9f25a-HUNTER.mp3` | HUNTER | Algenib | como um caçador do norte, rústico, calmo e observador, em voz baixa e tensa, desconfiado | No Yukon, os mineiros cavaram fundo demais numa geleira. O que saiu de lá tinha o mesmo frio deste lugar. |
| 21 | `f0ce0a9d.mp3 e f0ce0a9d-HUNTER.mp3` | HUNTER | Algenib | como um caçador do norte, rústico, calmo e observador, de forma natural, como quem conversa | O Golem de Gelo não caçava. Vigiava. As feras fugiam da prisão, não dele. |
| 22 | `dc0eb544.mp3 e dc0eb544-WARRIOR.mp3` | WARRIOR | Alnilam | como um guerreiro veterano, voz grave, firme e calejada, de forma natural, como quem conversa | Você fala como quem já esteve lá dentro. |
| 23 | `2a3e2061.mp3 e 2a3e2061-ARCHER.mp3` | ARCHER | Puck | como um arqueiro jovem, atento e de fala leve, intrigado, perguntando de verdade | Estas trilhas não aparecem em nenhum mapa. Como você as conhece? |
| 24 | `5484cdea.mp3 e 5484cdea-MAGE.mp3` | MAGE | Kore | como uma maga culta, confiante e elegante, de forma natural, como quem conversa | Seu manto tem runas dos Antigos. Isso não se compra. |
| 25 | `73f99743.mp3 e 73f99743-ROGUE.mp3` | ROGUE | Leda | como uma ladina astuta, irônica e rápida, intrigado, perguntando de verdade | Quem paga as suas contas, Guardiã? |
| 26 | `fad018c5.mp3 e fad018c5-NECROMANCER.mp3` | NECROMANCER | Enceladus | como um necromante sombrio, voz baixa, culta e controlada, em tom grave e pesaroso, devagar | Os mortos daqui ficam em silêncio quando você fala. |
| 27 | `8fc2fba5.mp3 e 8fc2fba5-BERSERKER.mp3` | BERSERKER | Schedar | como um samurai intenso e contido, de poucas palavras, pensativo, com pausas naturais | Esse símbolo no seu cajado… é o brasão do meu clã. |
| 28 | `bdfc9941.mp3 e bdfc9941-HUNTER.mp3` | HUNTER | Algenib | como um caçador do norte, rústico, calmo e observador, intrigado, perguntando de verdade | As feras se afastam de você. Por quê? |
| 29 | `e59b25e1.mp3 e e59b25e1-DRUID.mp3` | DRUID | Charon | como um druida sereno, sábio e ligado à natureza, de forma natural, como quem conversa | As árvores não crescem perto de você. |
| 30 | `9203c20c.mp3 e 9203c20c-SHAMAN.mp3` | SHAMAN | Zephyr | como uma xamã indígena, calorosa, espiritual e firme, de forma natural, como quem conversa | Os espíritos da mata sussurram o seu nome, Guardiã. E não é com carinho. |

## Ecos dos Antigos (23)

| # | Arquivo | Personagem | Voz | Sentimento pedido | Texto |
|---|---|---|---|---|---|
| 1 | `26cb4b1a.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, em tom grave e pesaroso, devagar | Lacrem os túmulos. Ninguém pode saber que fugimos. |
| 2 | `0e5129f2.mp3` | echo-f | Vindemiatrix | como o eco de uma mulher antiga, distante e melancólica, intrigado, perguntando de verdade | E os nomes gravados? |
| 3 | `51035584.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, de forma natural, como quem conversa | Que fiquem. Os nomes vão guardar a mentira. |
| 4 | `14aacd83.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, de forma natural, como quem conversa | O brasão vai em cada fechadura. É a nossa assinatura. |
| 5 | `cd2d06f4.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, intrigado, perguntando de verdade | E se um de nós quiser abri-las um dia? |
| 6 | `dfd4e123.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, em tom grave e pesaroso, devagar | Então que o sangue da família o impeça. |
| 7 | `e266cdf5.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, de forma natural, como quem conversa | Congele tudo. Que nada derreta esta prisão. |
| 8 | `48876132.mp3` | echo-f | Vindemiatrix | como o eco de uma mulher antiga, distante e melancólica, intrigado, perguntando de verdade | Majestade… e o Rei? |
| 9 | `15a9f6ad.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, pensativo, com pausas naturais | …O Rei já não é o Rei. |
| 10 | `6066cedd.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, de forma natural, como quem conversa | Guarde-o, velho amigo. Enquanto você vigiar, ele não acorda. |
| 11 | `63a93b2b.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, pensativo, com pausas naturais | E se um dia eu voltar… não me deixe passar. |
| 12 | `b80e4c21.mp3` | echo-f | Vindemiatrix | como o eco de uma mulher antiga, distante e melancólica, de forma natural, como quem conversa | O selo dorme debaixo da sumaúma. Ninguém derruba esta árvore. |
| 13 | `461e757d.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, intrigado, perguntando de verdade | E se gente de fora vier procurar? |
| 14 | `cda9ff63.mp3` | echo-f | Vindemiatrix | como o eco de uma mulher antiga, distante e melancólica, de forma natural, como quem conversa | O Anhangá confunde o caminho deles. A mata se protege. |
| 15 | `b11dfc99.mp3` | echo-f | Vindemiatrix | como o eco de uma mulher antiga, distante e melancólica, de forma natural, como quem conversa | Marquem as pedras. A Ordem vai precisar do caminho. |
| 16 | `d14530c3.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, intrigado, perguntando de verdade | E se os portais acordarem? |
| 17 | `80d8af75.mp3` | echo-f | Vindemiatrix | como o eco de uma mulher antiga, distante e melancólica, de forma natural, como quem conversa | É exatamente isso que eles querem. |
| 18 | `c88c1753.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, em tom grave e pesaroso, devagar | Vigie os mortos, minha sentinela. |
| 19 | `87fcebc2.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, intrigado, perguntando de verdade | Por quanto tempo, minha rainha? |
| 20 | `70aaf856.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, de forma natural, como quem conversa | Até ele dormir para sempre. |
| 21 | `24a65096.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, com energia e determinação | Aelric, não abra! Não sabemos o que ele é! |
| 22 | `06f113b8.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, de forma natural, como quem conversa | Ele prometeu salvar o reino, Elyndra. |
| 23 | `baa5ba69.mp3` | echo-m | Orus | como o eco de um homem antigo, distante e solene, pensativo, com pausas naturais | …Abram as portas. |

A lista completa, com a instrução exata enviada ao Gemini, está em `vozes-pendentes.csv` e `vozes-pendentes.json`.
