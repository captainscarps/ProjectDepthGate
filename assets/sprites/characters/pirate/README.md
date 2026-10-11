# Capitão Scarpa (classe PIRATE): sprites animados

Fonte atual: `scripts/source/pirata-casaco/folha-6x6.jpg`, o pirata de casaco marrom. São 6 linhas: parado 6, andar 6, correr 6, ataque 6, golpe por cima 6 e investida 5.
- O JPG veio com o xadrez de "transparência" pintado no fundo. O recorte (`folha-6x6-recortada.png`) tira o cinza do xadrez ligado à borda. Os pedacinhos de xadrez presos entre perna e casaco saem pelos dois tons exatos do xadrez, e a lâmina, que tem degradê, fica.
- As figuras são separadas por peças conectadas, porque a lâmina de uma figura passa por cima das colunas da vizinha.
- A escala segue a largura da cabeça: parado, andar e correr têm o mesmo tamanho (pirata em pé com cerca de 205 px), e os dois ataques foram desenhados cerca de 13% menores, o que é compensado.
- A morte continua com os quadros da folha v3, que é o mesmo pirata de casaco.

Animações no jogo:
- **parado:** 6 quadros a 5 fps;
- **andar:** 6 quadros a 11 fps e **correr:** 6 quadros a 15 fps, os mesmos números do Guerreiro. Agora os passos vêm desenhados na própria folha, com as pernas alternando, e não do esqueleto;
- **ataque:** postura e sabre erguido à frente (preparação), corte para baixo (golpe), sabre subindo e postura (volta);
- **Fúria Pirata:** usa a linha do golpe por cima. Sabre atrás (guarda), duas mãos no alto (impulso e no ar) e o golpe embaixo quando a âncora bate;
- **dano, atordoado e morte:** folha v3 (8 quadros de morte, 9 fps, fica no último).

O pirata de colete azul (`scripts/source/pirata-pixel/` com o esqueleto de pernas em `scripts/pirate_leg_rig.py`) continua no script. Para voltar a ele, use `CASACO = False`.

Os GIFs não foram usados, porque têm a marca d'água sobre o personagem. A folha do jogo fica em grade de 16 colunas (2048×384), uma textura segura no celular.

Cada animação fica em um PNG próprio. É uma tira horizontal de células de **128×128**, com fundo transparente. Os pés ficam na linha **y = 126** de cada célula.

**Alta definição (pedido do usuário: "definido como no sprite" e maior, por ser berserker):**
- textura com o pirata em pé com 96 px e pés na linha 126 da célula de 128;
- escala 0.56 no jogo com `hiRes: true`: fica com cerca de 54 px na tela, uns 15% maior que os outros heróis (cerca de 48 px). Cada pixel da textura ocupa cerca de 1 pixel real da tela, então não fica "pixelado";
- cores da própria arte, sem ajuste (a arte em pixel art já vem bem iluminada);
- sem paleta reduzida, sem contorno de pixel art, bordas suaves (alfa da redução) e nitidez leve;
- `hiRes` faz a seleção de classe, a introdução, o retrato do HUD (recorte 32×32) e a caixa de colisão compensarem a escala.
- O modo pixel art antigo continua no script (`HD = False`).

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

- `scripts/build_pirate_sprites.py` gera as tiras acima e as junta na folha que o jogo carrega, `assets/pixel-art/characters/pirate-cs1-body.png` (40 células) com `pirate-cs1.json`. No JSON ficam o mapa de estados e as velocidades (`fps`).
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
3. Se mudar a folha do jogo, troque o nome (`KEY` no script e o `"cs1"` no `scripts/patch_pirate_class.py`). Sem isso, o cache offline do navegador continua mostrando a versão antiga.

## Andando e correndo

Andar usa os quadros 6 a 11 da folha do jogo, e correr usa os quadros 12 a 17, desenhados na folha do casaco.
