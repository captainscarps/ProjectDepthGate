# Handoff: missões secundárias (branch `missoes-wip`)

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

## O que já está pronto

O arquivo `scripts/source/quests.js` tem cerca de 560 linhas:

- **Motor de missões:** o estado fica salvo por slot, como `q_*` dentro de `depthgate:story:<slot>`.
- **NPC genérico** com animações de fala.
- **Diário:** abre com a tecla **J** ou com o botão 📜 no HUD.
- **Bônus:** aplicados por um wrap do `Eh.recompute`.

| Missão | Situação |
|---|---|
| **Bispo e Freira** (4 selos) | ✅ Testada: a bênção de +20% funciona, e confrontar o bispo gera o chefe `BISPO_CAIDO`, que dá +5% de crítico ao morrer. |
| **Lâmina Faminta** (5 selos) | ✅ Testada: a compra, o bônus por morte, os sussurros a partir de 80 mortes e o chefe `ESPIRITO_LAMINA` funcionam. |
| **Pajé** (2 selos) | ⚠️ A conversa inicial e o sorteio dos 3 objetos (maracá, muiraquitã e cuia, em rio, bosque e morta) funcionam. **O ritual final não grava `pj=3`** (bug abaixo). |
| **Irmãos** (Akihiro ou Hayato, 3 selos) | ⏳ Escrita, mas **não testada**: carta → templo → irmão segue e ataca o Tengu → +8% de dano. |
| **Criança perdida** (6 selos) | ⏳ Escrita, mas **não testada** na masmorra. A versão fantasma no hub aparece. |
| **Contratos do modo infinito** | ⏳ Escrita, mas **não testada**: um desafio por profundidade, que paga cristais do Refúgio. |

## O que falta (em ordem)

1. **Bug do ritual do pajé** em `__qPajeTalk`, perto da linha 225 de `quests.js`.
   - **Sintoma:** depois de fechar o diálogo "Tudo aqui…", os anéis aparecem, mas o `S.time.delayedCall(1600, …)` não grava `pj=3`.
   - **Primeira coisa a fazer:** colocar `console.log` dentro do callback.
   - **Suspeita:** algo dentro do `try` falha e sai antes do `delayedCall`. Mover o `delayedCall` para antes dos efeitos visuais pode resolver.
   - **Atenção ao testar:** a tecla **Enter** abre o menu de pausa quando não há diálogo aberto. Para avançar o texto, use **z**.
2. **Testar a missão dos Irmãos.**
   - Comece em `forest` com `BERSERKER`, defina `g.completedDungeons=['temple','catacombs','ruins']` e chame `__dgQ.irm(g)`.
   - Confira se o irmão (rig `Qe`) aparece no templo perto de (56,15) em tiles, se ele segue o herói e se causa dano ao `RIVER_TENGU`.
   - Se o `new Qe(...)` falhar, use o `hero-<cls>-hud` como reserva; isso já está no código.
3. **Testar a Criança perdida.**
   - Vá para `rio` com 6 selos e chame `__dgQ.kid(g)`.
   - Confira se o menino segue o herói, perde vida perto de inimigos e se a derrota do chefe paga 60 cristais e 80 de ouro.
4. **Testar os Contratos.**
   - Inicie no modo `endless` e confira se o texto aparece no HUD.
   - Confira se `S.endlessRun()` existe nessa cena e se `roomManager.spawnEndlessPortal` é chamado no fim da profundidade.
5. **Ajustes visuais.** Tire prints do hub com o pajé, o bispo, a freira e o mercador.
   - O pajé sentado nos troncos ficou escuro, então talvez seja preciso usar `setTint` ou mudar a profundidade (depth).
   - Talvez a escala do bispo, hoje em 0.62, também precise de ajuste.
6. **Lançamento:** suba o cache e o `?v`, rode `build_asset_versions.py`, faça o merge de `missoes-wip` em `main` e dê push.

## Decisões já tomadas (não perguntar de novo)

- **Pajé:** vale para todos os heróis. Com a Araí há falas extras e uma pista do Observador.
- **Bispo:** acreditar no bispo dá −15% de vida até o próximo selo.
- **Lâmina:** purificar dá +10% de dano; dominar dá +40%, mas exige vencer um chefe.
- **Criança:** se ela morre, o fantasma aparece no hub.
- **Regra dos cenários:** nada de lados retos, visual realista e acabamento igual ao das referências dos packs.
