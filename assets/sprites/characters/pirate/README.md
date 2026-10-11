# Capitão Scarpa (classe PIRATE): sprites animados

Fontes: as folhas 5×5 de `scripts/source/pirata-25/` (parado, andando, correndo e atacando, 25 quadros cada, fundo transparente) e `scripts/source/capitao-scarpa-folha-v3.png` (só a morte). Cada folha veio numa escala, que foi igualada pela área do corpo e pela largura da cabeça:
- **parado:** ciclo de respiração de 25 quadros; usa um sim, um não (12 quadros, 6 fps, 2 s por ciclo);
- **andando:** a folha tem 2 ciclos de passos, porque o quadro 12 repete o 0. Usa um ciclo (12 quadros, 13 fps);
- **correndo:** a folha mistura duas corridas fora de ordem. Usa a do sabre baixo, ordenada pelo pé no chão: quadros 17, 5, 6, 7, 11, 21 (6 quadros, 14 fps);
- **atacando:** combo de giro de 2 s. O golpe simples usa os quadros de perfil 0, 3, 5, 6 (corte com rastro), 14, 17, 20 e 24. Os quadros de costas ficam fora.

Os GIFs não foram usados, porque têm a marca d'água sobre o personagem. A folha do jogo fica em grade de 16 colunas (2048×384), uma textura segura no celular.

Cada animação fica em um PNG próprio. É uma tira horizontal de células de **128×128**, com fundo transparente. Os pés ficam na linha **y = 118** de cada célula.

**Padrão visual:** é a mesma arte dos quadros separados, reduzida com fidelidade, nas regras dos outros heróis:
- altura de cerca de 68 px com o contorno, escala 0.7 no jogo e pés na linha 118;
- redução por média de área. As cores são as da própria arte, então barba, tapa-olho, tatuagens, camisa, faixa e acabamento dourado continuam no lugar;
- nitidez depois da redução, para as bordas ficarem firmes como nos outros heróis;
- uma paleta única de 20 cores para todas as animações, tirada da própria arte, com um pouco mais de contraste;
- limpeza de pixels soltos e contorno de 1 px por fora na cor (5,4,3), a mesma de todos os outros heróis.

| Arquivo | Quadros | Tamanho | Velocidade | Repete |
|---|---|---|---|---|
| `pirate_idle.png` | 12 | 1536×128 | 6 fps | sim |
| `pirate_walk.png` | 12 | 1536×128 | 13 fps | sim |
| `pirate_run.png` | 6 | 768×128 | 14 fps | sim |
| `pirate_attack.png` | 8 | 1024×128 | pelo tempo da arma (680 ms) | não |
| `pirate_death.png` | 8 | 1024×128 | 9 fps | não, fica no último |

O `pirate_config.json` traz os mesmos dados em formato de máquina: quadros, fps, de qual quadro da folha veio cada um e o mapa de estados.

## Como o jogo usa

O jogo não cria um sistema novo de animação. Ele usa o mesmo formato "pack" dos outros heróis:

- `scripts/build_pirate_sprites.py` gera as tiras acima e as junta na folha que o jogo carrega, `assets/pixel-art/characters/pirate-g25a-body.png` (40 células) com `pirate-g25a.json`. No JSON ficam o mapa de estados e as velocidades (`fps`).
- **Parado, andando e correndo** viram animações em loop (`mk4b-pirate-idle`, `-walk`, `-run`). Para ele correr, o direcional precisa estar inclinado acima de 62%, a mesma regra do jogo para todos os heróis. No teclado ele sempre corre.
- **Ataque:** a imagem acompanha as fases da arma, e o dano sai no fim da preparação, no tempo do jogo:
  - preparação (320 ms): quadros 0 (postura), 1 (ergue) e 2 (sabre no alto);
  - golpe (120 ms): quadros 3 (corte com rastro) e 4 (continuação baixa);
  - recuperação (240 ms): quadros 5, 6 e 7 (volta à postura).

  O ataque não reinicia a cada atualização e, ao terminar, volta ao estado atual (parado, andando ou correndo).
- **Morte:** tem prioridade sobre tudo. Toca os 8 quadros uma vez e fica no último até o jogo remover o corpo.
- **Habilidades** usam quadros destas tiras. A Fúria Pirata usa a postura do ataque, um quadro de corrida para o salto e o corte (ataque 4).
- Virar para a esquerda espelha o sprite, como em todos os heróis do jogo.

## Para corrigir ou trocar um quadro

1. Edite a folha de origem, ou troque a origem na tabela `ANIMS` do script.
2. Rode `python scripts/build_pirate_sprites.py`.
3. Se mudar a folha do jogo, troque o nome (`KEY` no script e o `"g25a"` no `scripts/patch_pirate_class.py`). Sem isso, o cache offline do navegador continua mostrando a versão antiga.

## Andando e correndo

Andar usa o gamepad com o direcional pouco inclinado: são os quadros 12 a 23 da folha. Correr usa o direcional todo inclinado ou o teclado: quadros 24 a 29.
