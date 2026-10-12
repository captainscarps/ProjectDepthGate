import fs from 'fs';
import path from 'path';

const BUNDLE = 'assets/index-D6qIWtA7-p209.js';
const MIRROR = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js';
const PORTAL_SRC = fs.readFileSync('scripts/source/portal-confirm.js', 'utf8');

let s = fs.readFileSync(BUNDLE, 'utf8');

// 1. Substituir bloco portal pelo novo PORTAL_SRC
const idxP = s.indexOf('function __calcPortalDifficulty');
const idxAfter = s.indexOf('function __openForge');
if (idxP !== -1 && idxAfter !== -1) {
  const chunk = s.substring(idxP, idxAfter);
  const lastBrace = chunk.lastIndexOf('}');
  const cutPoint = idxP + lastBrace + 1;
  s = s.substring(0, idxP) + PORTAL_SRC + '\n\n' + s.substring(cutPoint);
  console.log('1. Portal functions replaced successfully!');
}

// 2. Atualizar __BK_BOSSES para incluir os 3 novos chefes
const idxBosses = s.indexOf('const __BK_BOSSES');
if (idxBosses !== -1) {
  const endBosses = s.indexOf('];', idxBosses) + 2;
  const newBosses = 'const __BK_BOSSES = ["LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT", "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU", "BEHOLDER", "PALE_DRAGON", "CERBERUS", "GUARDIAN_FALLEN"];';
  s = s.substring(0, idxBosses) + newBosses + s.substring(endBosses);
  console.log('2. __BK_BOSSES updated with extra bosses!');
}

// 3. Atualizar linha de mortes do inimigo no livro (dupla contagem)
const newKillLine = `const kd = this.K[e.k] || { campaign: 0, endless: 0, total: 0 };
    const tot = kd.total || 0;
    const cK = kd.campaign || 0;
    const eK = kd.endless || 0;
    const kTxt = tot ? \`\${__L3("Derrotados", "Defeated", "Derrotados")}: \${tot} (Campanha: \${cK} | Infinito: \${eK})\` : __L3("Ainda não derrotado", "Not yet defeated", "Aún no derrotado");
    this.T(L, X + PW / 2, 300, kTxt, 7.5, tot ? __BK_INK : __BK_FAINT, { ox: .5, st: "italic" });`;

const idxKL = s.indexOf('const k = this.K[e.k] || 0;');
if (idxKL !== -1) {
  const endKL = s.indexOf('{ ox: .5, st: "italic" });', idxKL) + '{ ox: .5, st: "italic" });'.length;
  s = s.substring(0, idxKL) + newKillLine + s.substring(endKL);
  console.log('3. Book enemy entry kill counters updated to dual display!');
}

fs.writeFileSync(BUNDLE, s, 'utf8');
fs.writeFileSync(MIRROR, s, 'utf8');
console.log('OK! All applied directly.');
