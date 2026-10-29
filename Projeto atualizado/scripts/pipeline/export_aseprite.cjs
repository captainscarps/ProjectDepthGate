/**
 * DEPTHGATE — Pipeline de Exportação Aseprite CLI
 * 
 * Este script automatiza a exportação de arquivos .aseprite para spritesheets PNG
 * e metadados JSON no padrão canônico do DepthGate (Phaser 4).
 * 
 * Se o Aseprite CLI não estiver instalado ou acessível, o script orienta como
 * configurá-lo e faz fallback seguro sem quebrar o pipeline de validação.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_DIR = path.join(ROOT, 'art-source');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'pixel-art');

// Possíveis caminhos do executável Aseprite no Windows e Unix
const CANDIDATE_PATHS = [
  process.env.ASEPRITE_PATH,
  'aseprite',
  'C:\\Program Files\\Aseprite\\aseprite.exe',
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Aseprite\\aseprite.exe',
  'D:\\Steam\\steamapps\\common\\Aseprite\\aseprite.exe',
  '/usr/bin/aseprite',
  '/usr/local/bin/aseprite'
].filter(Boolean);

function findAseprite() {
  for (const candidate of CANDIDATE_PATHS) {
    try {
      const res = spawnSync(candidate, ['--version'], { encoding: 'utf8', shell: true });
      if (res.status === 0) {
        return { path: candidate, version: res.stdout.trim() };
      }
    } catch (e) {
      // Ignora erro e tenta o próximo candidato
    }
  }
  return null;
}

function runExport() {
  console.log('====================================================');
  console.log('DEPTHGATE — EXPORTADOR ASEPRITE CLI (PIPELINE DE ASSETS)');
  console.log('====================================================\n');

  const aseprite = findAseprite();

  if (!aseprite) {
    console.warn('⚠️  [AVISO] Aseprite CLI não encontrado no sistema.');
    console.log('   O pipeline continuará operando com os assets de produção já exportados.');
    console.log('\n📖 Como habilitar a exportação automatizada do Aseprite:');
    console.log('   1. Instale o Aseprite (Steam ou versão oficial https://www.aseprite.org/).');
    console.log('   2. Adicione a pasta do Aseprite à variável de ambiente PATH do sistema, ou');
    console.log('   3. Defina a variável ASEPRITE_PATH com o caminho completo do executável, ex:');
    console.log('      $env:ASEPRITE_PATH="C:\\Program Files\\Aseprite\\aseprite.exe"');
    console.log('\n💡 Se você já exportou os PNGs e JSONs manualmente, execute a validação:');
    console.log('   node scripts/pipeline/validate_assets.cjs\n');
    return { success: false, reason: 'CLI_NOT_FOUND' };
  }

  console.log(`✅ Aseprite detectado: ${aseprite.version} (${aseprite.path})`);

  // Busca arquivos .aseprite em art-source
  let filesExported = 0;
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        walkDir(full);
      } else if (f.isFile() && (f.name.endsWith('.ase') || f.name.endsWith('.aseprite'))) {
        exportFile(full);
        filesExported++;
      }
    }
  }

  function exportFile(filePath) {
    const baseName = path.basename(filePath, path.extname(filePath));
    const targetPng = path.join(OUTPUT_DIR, 'characters', `${baseName}-body.png`);
    const targetJson = path.join(OUTPUT_DIR, 'characters', `${baseName}.json`);

    console.log(`📦 Exportando ${path.relative(ROOT, filePath)} -> ${path.relative(ROOT, targetPng)}...`);
    
    // Comando Aseprite para exportar spritesheet horizontal e tags em formato JSON
    const args = [
      '-b',
      filePath,
      '--sheet', targetPng,
      '--sheet-type', 'horizontal',
      '--data', targetJson,
      '--format', 'json-array',
      '--list-tags',
      '--list-slices'
    ];

    const result = spawnSync(aseprite.path, args, { encoding: 'utf8', shell: true });
    if (result.status === 0) {
      console.log(`   ✓ Exportação concluída com sucesso.`);
    } else {
      console.error(`   ✗ Falha ao exportar ${baseName}:`, result.stderr);
    }
  }

  walkDir(SOURCE_DIR);
  console.log(`\n🎉 Processamento concluído. ${filesExported} arquivos-fonte verificados/exportados.\n`);
  return { success: true, count: filesExported };
}

if (require.main === module) {
  runExport();
}

module.exports = { findAseprite, runExport };
