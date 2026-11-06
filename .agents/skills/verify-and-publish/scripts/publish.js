import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

console.log('====================================================');
console.log('  DEPTHGATE - QA AUTOMATIZADO E PUBLICAÇÃO NO GIT   ');
console.log('====================================================\n');

function run(cmd, desc) {
  console.log(`> ${desc}...`);
  try {
    const out = execSync(cmd, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
    if (out.trim()) console.log(out.trim());
    return { ok: true, out };
  } catch (err) {
    console.error(`[ERRO] Falha ao executar: ${desc}`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    return { ok: false, err };
  }
}

// 1. Executa suite de testes QA
console.log('Passo 1: Executando suite de testes de integridade e sintaxe...');
const verify = run('node --experimental-vm-modules ".agents/skills/verify-and-publish/scripts/verify-all.js"', 'Verificação QA');
if (!verify.ok) {
  console.error('\n[ABORTADO] A publicação foi cancelada porque a suite de QA encontrou erros.');
  process.exit(1);
}

// 2. Verifica status do Git
console.log('\nPasso 2: Verificando status do Git...');
const status = run('git status -s', 'Git Status');
if (!status.out.trim()) {
  console.log('Nenhuma alteração detectada para commit.');
  process.exit(0);
}

// 3. Adiciona arquivos e faz commit
const msg = process.argv.slice(2).join(' ').trim() || `fix(hub): correcao do menu de pausa e suite de testes QA [${new Date().toISOString().slice(0, 10)}]`;
console.log(`\nPasso 3: Commitando com a mensagem: "${msg}"...`);
run('git add -A', 'Git Add');
const commit = run(`git commit -m "${msg.replace(/"/g, '\\"')}"`, 'Git Commit');
if (!commit.ok) {
  console.error('\n[ABORTADO] Falha no commit.');
  process.exit(1);
}

// 4. Sincroniza e envia para o remoto
console.log('\nPasso 4: Sincronizando com o repositório remoto (pull --rebase)...');
const pull = run('git pull --rebase origin main', 'Git Pull');
if (!pull.ok) {
  console.error('\n[ABORTADO] Conflito ao atualizar com o remoto. Resolva o conflito antes de enviar.');
  process.exit(1);
}

console.log('\nPasso 5: Enviando alterações para origin/main (git push)...');
const push = run('git push origin main', 'Git Push');
if (!push.ok) {
  console.error('\n[ATENÇÃO] Falha no push. Verifique autenticação e credenciais do Git.');
  process.exit(1);
}

console.log('\n====================================================');
console.log('[SUCESSO] Código verificado, testado e publicado no GitHub com sucesso!');
console.log('====================================================');

