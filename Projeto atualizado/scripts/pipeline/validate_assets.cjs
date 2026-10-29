/**
 * DEPTHGATE — Validador Automatizado de Assets e Animações (Pipeline Gráfico)
 * 
 * Inspeciona todos os spritesheets de personagens, equipamentos, layouts JSON,
 * dimensões, canais alfa, consistência de frames e pontos de ancoragem (sockets).
 * Produz relatório detalhado e acionável sem depender de bibliotecas externas pesadas.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CHAR_DIR = path.join(ROOT, 'assets', 'pixel-art', 'characters');
const EQUIP_DIR = path.join(ROOT, 'assets', 'pixel-art', 'equipment');

/**
 * Lê o cabeçalho binário IHDR de um arquivo PNG.
 * Retorna { width, height, bitDepth, colorType, hasAlpha } ou null se inválido.
 */
function readPngHeader(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 24) return null;
    // Assinatura PNG: 0x89 50 4E 47 0D 0A 1A 0A
    if (buf.readUInt32BE(0) !== 0x89504E47 || buf.readUInt32BE(4) !== 0x0D0A1A0A) {
      return null;
    }
    // Chunk IHDR: comprimento (bytes 8-11), tipo (12-15 = 'IHDR'), dados (16-28)
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const bitDepth = buf[24];
    const colorType = buf[25]; // 0=Grayscale, 2=RGB, 3=Indexed, 4=Grayscale+Alpha, 6=RGBA
    const hasAlpha = colorType === 6 || colorType === 4;
    return { width, height, bitDepth, colorType, hasAlpha, fileSize: buf.length };
  } catch (e) {
    return null;
  }
}

// Animações canônicas esperadas para personagens MK4
const CANONICAL_ANIM_KEYS = [
  'idle', 'walk', 'run', 'windup', 'hit', 'recovery',
  'guard', 'hurt', 'dash', 'cast', 'death'
];

function validateAssets() {
  console.log('================================================================');
  console.log('DEPTHGATE — VALIDADOR AUTOMATIZADO DE ASSETS (PIPELINE GRÁFICO)');
  console.log('================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    characters: {},
    equipment: {},
    summary: {
      charactersChecked: 0,
      charactersValid: 0,
      equipmentChecked: 0,
      equipmentValid: 0,
      warningsCount: 0,
      errorsCount: 0
    },
    issues: []
  };

  // 1. Mapeamento e Validação de Personagens
  if (!fs.existsSync(CHAR_DIR)) {
    report.issues.push({ level: 'ERROR', message: `Diretório não encontrado: ${CHAR_DIR}` });
    report.summary.errorsCount++;
  } else {
    const charFiles = fs.readdirSync(CHAR_DIR);
    const layoutFiles = charFiles.filter(f => f.endsWith('.json'));

    for (const jsonFile of layoutFiles) {
      report.summary.charactersChecked++;
      const baseKey = jsonFile.replace(/\.json$/, '');
      const jsonPath = path.join(CHAR_DIR, jsonFile);

      let layout;
      try {
        layout = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (err) {
        report.issues.push({
          level: 'ERROR',
          category: 'character',
          key: baseKey,
          message: `JSON de layout corrompido: ${jsonFile} (${err.message})`
        });
        report.summary.errorsCount++;
        continue;
      }

      // Possíveis nomes de arquivo de imagem do spritesheet
      const candidatePngs = [
        `${baseKey}-body.png`,
        `${baseKey}.png`
      ];

      let foundPng = null;
      let pngPath = null;
      for (const c of candidatePngs) {
        const p = path.join(CHAR_DIR, c);
        if (fs.existsSync(p)) {
          foundPng = c;
          pngPath = p;
          break;
        }
      }

      if (!foundPng) {
        report.issues.push({
          level: 'ERROR',
          category: 'character',
          key: baseKey,
          message: `Spritesheet PNG correspondente não encontrado para ${jsonFile} (buscou: ${candidatePngs.join(', ')})`
        });
        report.summary.errorsCount++;
        continue;
      }

      const pngInfo = readPngHeader(pngPath);
      if (!pngInfo) {
        report.issues.push({
          level: 'ERROR',
          category: 'character',
          key: baseKey,
          message: `Arquivo PNG corrompido ou formato não suportado: ${foundPng}`
        });
        report.summary.errorsCount++;
        continue;
      }

      // Validação de proporções e dimensões
      const frameW = layout.frameW;
      const frameH = layout.frameH;
      let charValid = true;

      if (!frameW || !frameH) {
        report.issues.push({
          level: 'ERROR',
          category: 'character',
          key: baseKey,
          message: `Layout ${jsonFile} não especifica frameW e frameH`
        });
        report.summary.errorsCount++;
        charValid = false;
      } else {
        if (pngInfo.height !== frameH) {
          report.issues.push({
            level: 'ERROR',
            category: 'character',
            key: baseKey,
            message: `Altura da imagem (${pngInfo.height}px) não corresponde a frameH do layout (${frameH}px)`
          });
          report.summary.errorsCount++;
          charValid = false;
        }

        if (pngInfo.width % frameW !== 0) {
          report.issues.push({
            level: 'ERROR',
            category: 'character',
            key: baseKey,
            message: `Largura da imagem (${pngInfo.width}px) não é múltipla inteira de frameW (${frameW}px)`
          });
          report.summary.errorsCount++;
          charValid = false;
        }
      }

      // Validação de transparência alfa
      if (!pngInfo.hasAlpha) {
        report.issues.push({
          level: 'WARNING',
          category: 'character',
          key: baseKey,
          message: `Spritesheet ${foundPng} não possui canal de transparência alfa (colorType=${pngInfo.colorType})`
        });
        report.summary.warningsCount++;
      }

      // Validação de Sockets / Anchors
      const totalFrames = frameW ? Math.floor(pngInfo.width / frameW) : 0;
      let anchorsCount = 0;
      if (Array.isArray(layout.anchors)) {
        anchorsCount = layout.anchors.length;
        if (anchorsCount < totalFrames) {
          report.issues.push({
            level: 'WARNING',
            category: 'character',
            key: baseKey,
            message: `Número de pontos de ancoragem (${anchorsCount}) menor que o total de frames (${totalFrames})`
          });
          report.summary.warningsCount++;
        }
      } else {
        report.issues.push({
          level: 'WARNING',
          category: 'character',
          key: baseKey,
          message: `Layout ${jsonFile} não possui array de 'anchors'`
        });
        report.summary.warningsCount++;
      }

      // Validação de tags de animação
      const mapKeys = layout.map ? Object.keys(layout.map) : [];
      const missingCanonical = CANONICAL_ANIM_KEYS.filter(k => {
        // Aceita variações como windup / windupA, hit / hitA, death / deathA
        return !mapKeys.some(mk => mk.toLowerCase().startsWith(k));
      });

      if (missingCanonical.length > 0) {
        report.issues.push({
          level: 'INFO',
          category: 'character',
          key: baseKey,
          message: `Animações recomendadas não mapeadas: [${missingCanonical.join(', ')}]`
        });
      }

      report.characters[baseKey] = {
        png: foundPng,
        json: jsonFile,
        frameW,
        frameH,
        totalFrames,
        anchorsCount,
        hasAlpha: pngInfo.hasAlpha,
        dimensions: `${pngInfo.width}x${pngInfo.height}`,
        mappedAnims: mapKeys,
        status: charValid ? 'VALID' : 'INVALID'
      };

      if (charValid) report.summary.charactersValid++;
    }
  }

  // 2. Mapeamento e Validação de Equipamentos (Armas, Escudos, Elmos, Armaduras)
  if (!fs.existsSync(EQUIP_DIR)) {
    report.issues.push({ level: 'WARNING', message: `Diretório de equipamentos não encontrado: ${EQUIP_DIR}` });
  } else {
    const equipFiles = fs.readdirSync(EQUIP_DIR).filter(f => f.endsWith('.png'));

    for (const equipFile of equipFiles) {
      report.summary.equipmentChecked++;
      const p = path.join(EQUIP_DIR, equipFile);
      const pngInfo = readPngHeader(p);

      if (!pngInfo) {
        report.issues.push({
          level: 'ERROR',
          category: 'equipment',
          key: equipFile,
          message: `Equipamento com PNG corrompido: ${equipFile}`
        });
        report.summary.errorsCount++;
        continue;
      }

      // Validação de categoria por prefixo
      let category = 'unknown';
      if (equipFile.startsWith('weapon-')) category = 'weapon';
      else if (equipFile.startsWith('gear-shield')) category = 'shield';
      else if (equipFile.startsWith('helmet-')) category = 'helmet';
      else if (equipFile.startsWith('armor-')) category = 'armor';
      else if (equipFile.startsWith('proj-')) category = 'projectile';

      let isValid = true;
      if (!pngInfo.hasAlpha) {
        report.issues.push({
          level: 'WARNING',
          category: 'equipment',
          key: equipFile,
          message: `Equipamento sem canal alfa: ${equipFile}`
        });
        report.summary.warningsCount++;
      }

      report.equipment[equipFile] = {
        category,
        dimensions: `${pngInfo.width}x${pngInfo.height}`,
        hasAlpha: pngInfo.hasAlpha,
        fileSize: pngInfo.fileSize,
        status: isValid ? 'VALID' : 'INVALID'
      };

      if (isValid) report.summary.equipmentValid++;
    }
  }

  // 3. Exibição do Relatório
  console.log(`📦 Personagens verificados:  ${report.summary.charactersChecked} (${report.summary.charactersValid} válidos)`);
  console.log(`🛡️  Equipamentos verificados: ${report.summary.equipmentChecked} (${report.summary.equipmentValid} válidos)`);
  console.log(`⚠️  Avisos encontrados:       ${report.summary.warningsCount}`);
  console.log(`❌ Erros encontrados:        ${report.summary.errorsCount}\n`);

  if (report.issues.length > 0) {
    console.log('--- DETALHES DAS NOTIFICAÇÕES ---');
    for (const issue of report.issues) {
      const icon = issue.level === 'ERROR' ? '❌' : issue.level === 'WARNING' ? '⚠️ ' : 'ℹ️ ';
      console.log(`${icon} [${issue.level}] ${issue.key ? `(${issue.key}) ` : ''}${issue.message}`);
    }
    console.log('---------------------------------\n');
  } else {
    console.log('✨ Todos os assets e animações passaram na validação com 100% de integridade!\n');
  }

  // Salva o relatório estruturado em JSON para ferramentas de CI/CD
  const reportPath = path.join(ROOT, 'assets', 'asset-pipeline-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`📄 Relatório salvo em: assets/asset-pipeline-report.json\n`);

  return report;
}

if (require.main === module) {
  const result = validateAssets();
  if (result.summary.errorsCount > 0) {
    process.exit(1);
  }
}

module.exports = { validateAssets, readPngHeader };
