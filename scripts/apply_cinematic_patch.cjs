const fs = require('fs');

const bundlePath = 'assets/index-D6qIWtA7-p209.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

const originalBlock = fs.readFileSync('scripts/cutscene_original_block.js', 'utf8');
const replacementBlock = fs.readFileSync('scripts/cinematic_engine_replacement.js', 'utf8');

if (!bundle.includes(originalBlock)) {
  console.error("Error: originalBlock not found in bundle!");
  process.exit(1);
}

bundle = bundle.replace(originalBlock, replacementBlock);
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('Successfully patched index-D6qIWtA7-p209.js with Cinematic Cutscene Engine!');

// Also sync to Projeto atualizado
const projPath = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js';
if (fs.existsSync(projPath)) {
  fs.writeFileSync(projPath, bundle, 'utf8');
  console.log('Successfully synced to Projeto atualizado!');
}
