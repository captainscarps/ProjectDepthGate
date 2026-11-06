---
name: verify-and-publish
description: >-
  Use esta skill sempre que fizer qualquer alteração, correção de bug ou nova funcionalidade no projeto.
  Executa a suíte completa de verificação (sintaxe dos bundles, integridade de métodos, teste funcional do Refúgio e auditoria de vazamento de memória)
  e, após aprovação em 100% dos testes, publica automaticamente as alterações no repositório Git com mensagem descritiva.
---

# Verify and Publish (QA & Deploy Contínuo)

Esta skill estabelece o fluxo obrigatório de garantia de qualidade (QA) e publicação no repositório do **DEPTHGATE**.

## Quando Usar

* Sempre após concluir qualquer edição de código, correção de bugs ou adição de novos recursos.
* Quando o usuário pedir para "testar e publicar", "commitar", "enviar para o git" ou "verificar se está tudo certo".

---

## Procedimento de 4 Etapas

### 1. Sincronização de Bundles
Se você alterou arquivos em `scripts/source/` (como `hub-village.js`, `hub-ui.js`, `dorf-caves.js`, etc.), execute o script de patch correspondente para garantir que os bundles compilados estejam atualizados:
* Para alterações no Refúgio / Vila:
  ```powershell
  python scripts/patch_hub_village.py
  ```
* Para alterações em Cavernas Dorf:
  ```powershell
  python scripts/update_dorf_source_in_bundles.py
  ```

### 2. Execução da Suíte de Testes Automatizada (QA)
Execute a suíte de verificação completa:
```powershell
node --experimental-vm-modules ".agents/skills/verify-and-publish/scripts/verify-all.js"
```

A suíte valida automaticamente:
1. **Sintaxe ES Module de todos os bundles** (`assets/index-D6qIWtA7-p209.js` e espelho em `Projeto atualizado/`).
2. **Integridade de Métodos**: Detecta se algum método `this.__*` foi chamado sem estar implementado (prevenindo travamentos como o do menu de pausa).
3. **Teste Funcional Unitário Headless**: Simula o ciclo completo de abertura, navegação, confirmação e encerramento do menu de pausa e painéis do Refúgio.
4. **Auditoria de Recursos**: Detecta timers e loops órfãos.

> [!IMPORTANT]
> Se qualquer teste falhar, **NÃO publique**. Corrija o erro reportado e re-execute a verificação até obter `[SUCESSO] Todos os testes passaram!`.

### 3. Publicação no Repositório Git
Após passar com sucesso em todos os testes, execute o script de publicação:
```powershell
node ".agents/skills/verify-and-publish/scripts/publish.js" "<mensagem de commit>"
```
Ou manualmente via git:
```powershell
git status -s
git add -A
git commit -m "<mensagem clara>"
git pull --rebase origin main
git push origin main
```

### 4. Confirmação Final
* Verifique o hash do commit gerado (`git log -1 --oneline`).
* Confirme ao usuário que a verificação passou em 100% dos testes e o código foi publicado com sucesso.

