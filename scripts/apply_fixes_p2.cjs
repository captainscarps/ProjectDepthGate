const fs = require('fs');
const path = require('path');

const bundles = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

const riftSrc = fs.readFileSync('scripts/source/rift.js', 'utf8');

for (const bPath of bundles) {
  if (!fs.existsSync(bPath)) continue;
  console.log(`\nPatching ${bPath}...`);
  let code = fs.readFileSync(bPath, 'utf8');

  // 1. Substituir __offerRiftPrompt por código corrigido
  const riftStart = code.indexOf('function __offerRiftPrompt(S)');
  const riftEnd = code.indexOf('function __startRiftRun(S)');
  if (riftStart !== -1 && riftEnd !== -1) {
    const newRiftPrompt = riftSrc.substring(
      riftSrc.indexOf('function __offerRiftPrompt(S)'),
      riftSrc.indexOf('function __startRiftRun(S)')
    );
    code = code.substring(0, riftStart) + newRiftPrompt + code.substring(riftEnd);
    console.log('✓ __offerRiftPrompt atualizado com botão Recusar e correções!');
  } else {
    console.error('✗ Não encontrou __offerRiftPrompt para substituir');
  }

  // 2. Diálogo da Guardiã auto-fechar ao finalizar digitação da última fala
  // Inspecionar __dlg
  const dlgIdx = code.indexOf('function __dlg(S,list,done)');
  if (dlgIdx !== -1) {
    // Procurar por shown>=full.length&&(ev.remove(),tm===ev&&(tm=null))
    const typeEndTarget = 'shown>=full.length&&(ev.remove(),tm===ev&&(tm=null))';
    const typeEndRep = 'shown>=full.length&&(ev.remove(),tm===ev&&(tm=null),i>=list.length-1&&(autoCloseTimer?.remove?.(),autoCloseTimer=ui.time.delayedCall(2200,()=>{!closed&&i>=list.length-1&&end()})))';
    
    // Inserir let autoCloseTimer=null antes de let i=-1
    const letITarget = 'let i=-1,full="",shown=0,tm=null,closed=!1;';
    const letIRep = 'let i=-1,full="",shown=0,tm=null,closed=!1,autoCloseTimer=null;';

    // No next() e end(): limpar autoCloseTimer
    const nextTarget = 'const next=()=>{if(closed)return;if(tm){tm.remove(),tm=null,tx.setText(full);return}show()}';
    const nextRep = 'const next=()=>{if(closed)return;if(tm){tm.remove(),tm=null,tx.setText(full);if(i>=list.length-1){autoCloseTimer?.remove?.();autoCloseTimer=ui.time.delayedCall(2200,()=>{!closed&&i>=list.length-1&&end()})}return}autoCloseTimer?.remove?.();autoCloseTimer=null;show()}';

    const endTarget = 'const end=()=>{if(closed)return;closed=!0;';
    const endRep = 'const end=()=>{if(closed)return;closed=!0;autoCloseTimer?.remove?.();autoCloseTimer=null;';

    if (code.includes(typeEndTarget)) {
      code = code.replace(typeEndTarget, typeEndRep);
      if (code.includes(letITarget)) code = code.replace(letITarget, letIRep);
      if (code.includes(nextTarget)) code = code.replace(nextTarget, nextRep);
      if (code.includes(endTarget)) code = code.replace(endTarget, endRep);
      console.log('✓ Diálogo com auto-fechamento ao finalizar a fala configurado!');
    } else {
      console.log('• Verificando se autoCloseTimer já estava presente em __dlg...');
    }
  }

  // 3. Spawning correto do Mímico no baú (tile coordinates + snap)
  const chestOld = 'const m = this.scene.spawnEnemy("MIMIC", this.x, this.y, { eliteRoll: false });';
  const chestNew = 'const mCol = Math.floor(this.x / dt), mRow = Math.floor(this.y / dt); const m = this.scene.spawnEnemy("MIMIC", mCol, mRow, { eliteRoll: false }); if (m) { m.x = this.x; m.y = this.y; }';

  if (code.includes(chestOld)) {
    code = code.replace(chestOld, chestNew);
    console.log('✓ Spawn do Mímico corrigido com coordenadas de tile (col, row) + posicionamento exato!');
  } else if (code.includes('mCol = Math.floor(this.x / dt)')) {
    console.log('• Spawn do Mímico já estava com coordenadas de tile.');
  } else {
    console.warn('! Aviso: chestOld não encontrado exatamente, buscando padrão...');
    const reChest = /this\.scene\.spawnEnemy\(\s*["']MIMIC["']\s*,\s*this\.x\s*,\s*this\.y/g;
    if (reChest.test(code)) {
      code = code.replace(reChest, 'this.scene.spawnEnemy("MIMIC", Math.floor(this.x / dt), Math.floor(this.y / dt)');
      console.log('✓ Spawn do Mímico substituído via regex!');
    }
  }

  fs.writeFileSync(bPath, code, 'utf8');
  console.log(`✓ Gravado: ${bPath}`);
}

console.log('\nTodos os patches foram aplicados com sucesso!');
