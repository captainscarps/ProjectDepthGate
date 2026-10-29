# DEPTHGATE — ART SOURCE REPOSITORY (ARQUIVOS-FONTE EDITÁVEIS)

Este diretório armazena os arquivos-fonte editáveis de arte pixel art do jogo DEPTHGATE, separados dos arquivos de produção (`assets/pixel-art/`).

## 📁 Estrutura de Diretórios

```
art-source/
  ├── characters/       # Arquivos de personagens (.aseprite, .psd, .kra)
  │     ├── warrior/
  │     ├── mage/
  │     ├── rogue/
  │     ├── archer/
  │     └── druid/
  ├── equipment/        # Armas, elmos, armaduras e escudos
  │     ├── weapons/
  │     ├── armor/
  │     └── shields/
  └── effects/          # Partículas, impactos, projéteis e magias
```

## 🛠️ Padrões e Convenções

1. **Formato Preferencial**: `.aseprite` ou `.ase` (Aseprite) com paleta indexada ou RGBA.
2. **Resolução de Frame**:
   - Personagens MK4: 48×60 px por frame (39 frames canônicos por spritesheet).
   - Armas: 24×24 a 32×32 px com socket de empunhadura centralizado ou especificado.
3. **Tags de Animação Obrigatórias no Aseprite**:
   - `idle`, `idlevar`, `walk`, `run`, `windup`, `hit`, `recovery`, `guard`, `hurt`, `stun`, `dash`, `cast`, `death`.
4. **Camadas (Layers)**:
   - `body`: Corpo e silhueta.
   - `head`: Cabeça e cabelo.
   - `weapon_socket`: Fatia (slice) ou ponto guia de ancoragem de empunhadura.
   - `shield_socket`: Ponto guia de ancoragem para escudo/mão secundária.

## 🔄 Exportação para Produção

Se o Aseprite CLI estiver instalado e disponível no `PATH`:
```bash
node scripts/pipeline/export_aseprite.cjs
```

Caso não possua o Aseprite CLI instalado, você pode exportar manualmente os spritesheets para `assets/pixel-art/characters/[classe]-mk4-body.png` e os metadados JSON para `assets/pixel-art/characters/[classe]-mk4.json`. O validador do pipeline verificará a conformidade automaticamente:
```bash
node scripts/pipeline/validate_assets.cjs
```
