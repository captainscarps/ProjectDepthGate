# Testes automáticos de jogo (QA)

Rodam o jogo no Chrome (Playwright) e testam menus, entradas e transições como um jogador.
Servidor local antes: `PORT=5300 node server.cjs`. Capturas e relatórios vão para `/tmp/qa/`.

| Script | O que testa |
|---|---|
| `t_menu.py` | menu principal: teclado, gamepad (direcional e analógico), mouse; configurações abrem/fecham |
| `t_game.py` | pausa e cada item dela (bestiário, colecionáveis, habilidades, códice, hall da fama, configurações, salvar) e o inventário, com teclado e gamepad; herói anda depois |
| `t_touchgame.py` | o mesmo pelo toque (botões PAUSA / INVENTÁRIO, carta de nível) |
| `t_hub.py kb` / `t_hub.py pad` | todas as interações do Refúgio abrem e fecham sem prender o herói |
| `t_panels.py mouse` / `t_panels.py touch` | painéis do Refúgio (vendedor, pets, herborista, santuário, armaria, mural) clicando nos botões |
| `t_hubpause.py` | pausa do Refúgio (Esc / Start / toque) e menu principal no toque |
| `t_story.py` | painel de história das fases fecha com cada entrada |
| `t_tour.py` | entra em todas as fases da campanha, castelo e infinito: sem erro, sem tela preta, herói anda |
| `t_trans.py` | transições reais: portal, cavernas Dorf, saída, escadas do castelo, memória de Valdrak |
| `t_perf.py` | custo por quadro da lógica de cada cena e memória em idas e voltas |
| `t_leak.py` | ouvintes de eventos não se acumulam na troca de fase |
| `t_voice.py` | vozes tocam (inclusive a voz por classe do herói) |

O gamepad é simulado (`navigator.getGamepads`), o toque usa o modo celular do Chrome.
Em máquina sem placa de vídeo o jogo roda a ~8 quadros por segundo; por isso o teste de desempenho mede o
tempo da lógica de cada cena e não os quadros por segundo.
