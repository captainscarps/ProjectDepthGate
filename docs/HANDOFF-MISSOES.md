# Handoff: missões secundárias

Este guia é para continuar o trabalho no Antigravity ou em qualquer outro agente/IDE.
Tudo o que é preciso está nesta branch. Os packs licenciados **não** estão no repositório,
mas as imagens geradas a partir deles (`assets/pixel-art/npc/*`) já estão.

## Como o projeto funciona (leia antes de mexer)

- **O jogo é um bundle único:** `assets/index-D6qIWtA7-p209.js`, com Phaser 4 já minificado.
  - **Nunca edite o bundle direto.** O código novo fica em `scripts/source/*.js`.
  - O `scripts/patch_endless_trees.py` monta esses arquivos dentro do bundle, na ordem da lista `PARTS`.
  - A missão nova está em `scripts/source/quests.js`, que já está no `PARTS`, depois de `temple.js`.
- **Depois de editar um source:**
  ```bash
  python3 scripts/patch_endless_trees.py && node --check assets/index-D6qIWtA7-p209.js
  ```
  O script também copia o resultado para o espelho `Projeto atualizado/`.
- **Testar localmente:**
  - rode `python3 -m http.server 8765` na raiz;
  - abra `http://localhost:8765/index.html`;
  - pelo console, `window.__dgQ` dá acesso às funções das missões.
- **Ao lançar uma versão:**
  1. Suba a constante `CACHE` em `sw.js` e em `Projeto atualizado/sw.js`. A atual é `ded-web-v5.45.8-templo-reto`; a próxima pode ser `ded-web-v5.46.0-missoes`.
  2. Suba o `?v=` em `index.html` e no espelho, de 5.69 para 5.70.
  3. Rode `python3 scripts/build_asset_versions.py`.
- **Commits:** a mensagem termina com a linha `Co-Authored-By` do agente. Não suba arquivos de teste.

### Nomes internos do bundle que as missões usam

| Nome | O que é |
|---|---|
| `Sd` | cena Game |
| `bo` | Preload |
| `Eh` | atributos; use `recompute()` |
| `Uh` | sistema de dano (`apply`) |
| `Yt` | definições de chefes |
| `ki` | fases |
| `Qe` | rig dos heróis |
| `__dlg(S, falas, done)` | diálogo |
| `__wqAsk(S, opcoes, cb)` | escolha |
| `__hubSetup` | chamado em toda fase |
| `__hubReturnTalk` | fala de retorno ao Coração |
| `__guardianTalk` | fala da Guardiã |
| `__goLevel(S, id)` | troca de fase |
| `__hubProg(S).n` | quantidade de selos fechados |
| `__stKey(S)` | chave do localStorage da história do slot |

## Situação final (publicado na `main`, versão 5.70 / cache `ded-web-v5.46.0-missoes`)

Todas as missões foram testadas no navegador:

| Missão | Situação |
|---|---|
| Bispo e Freira | ✅ Bênção, confronto e chefe `BISPO_CAIDO` |
| Lâmina Faminta | ✅ Compra, bônus por morte, sussurros e chefe `ESPIRITO_LAMINA` |
| Pajé | ✅ Objetos nas masmorras e ritual (+12% de vida); corrigido: o ritual grava antes dos efeitos |
| Irmãos | ✅ Carta, templo, o irmão segue o herói e causa dano ao Tengu |
| Criança perdida | ✅ Escolta e recompensa (60 cristais e 80 de ouro); o fantasma aparece no hub |
| Contratos do infinito | ✅ Desafio aparece no HUD a cada profundidade |

### O que ainda poderia melhorar (opcional)
- Ninguém jogou do começo ao fim com saves reais. Os testes forçaram os selos.
- Equilibrar os valores: vida do bispo (95) e da lâmina (85), recompensas dos contratos.
- O mercador encapuzado usa o sprite do vendedor com outra cor. Um sprite próprio ficaria melhor.

### Dicas de teste
- Para avançar o diálogo, use **z**. Quando não há diálogo aberto, **Enter** abre o menu de pausa.
- Ao reiniciar a cena por script, não pare a cena `Game` antes do `scene.start`.
- No console, `window.__dgQ` dá acesso às funções de cada missão.

## Decisões já tomadas (não perguntar de novo)

- **Pajé:** vale para todos os heróis. Com a Araí há falas extras e uma pista do Observador.
- **Bispo:** acreditar no bispo dá −15% de vida até o próximo selo.
- **Lâmina:** purificar dá +10% de dano; dominar dá +40%, mas exige vencer um chefe.
- **Criança:** se ela morre, o fantasma aparece no hub.
- **Regra dos cenários:** nada de lados retos, visual realista e acabamento igual ao das referências dos packs.
