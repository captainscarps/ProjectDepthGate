/**
 * DEPTHGATE — Patch de Animações Direcionais do PlayerVisual (Etapa 2)
 * 
 * Implementa seleção inteligente de animação baseada no vetor real de movimento:
 * - Cima (Up, vista traseira): Utiliza os frames de costas 'upA' e 'upB' em cadência de passos e postura traseira.
 * - Baixo (Down, vista frontal): Mantém vista frontal com arma no topo.
 * - Laterais (Left / Right): Mantém animação canônica lateral walk/run com flipX.
 * - Idles: Respeita a última direção de olhar (costas quando olhou para cima, frente quando olhou para baixo).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BUNDLE_PATH = path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js');

function applyDirectionalPatch() {
  console.log('Aplicando patch de animações direcionais...');
  let content = fs.readFileSync(BUNDLE_PATH, 'utf8');

  const oldCode = `stC??M.cast;this.mk2.setFrame(U)}else if(n)this.mk2.play(\`\${this.animPrefix}-\${r>.6?"run":"walk"}\`,!0);/*__IDLEUP__*/else if(h&&M.upA!=null&&!A.bakedWeapon)this.mk2.anims.stop()/*§ZWxzZSBpZihoJiZNLnVwQSE9bnVsbCl0aGlzLm1rMi5hbmltcy5zdG9wKCk=*//*__IDLEUP__*/,this.mk2.setFrame(M.upB!=null&&Math.floor(this.t*1.6)%2?M.upB:M.upA);else{`;

  // Nova lógica direcional respeitando movimento para cima (traseiro), baixo (frontal) e laterais
  const newCode = `stC??M.cast;this.mk2.setFrame(U)}else if(n){if(h&&M.upA!=null&&!A.bakedWeapon){this.mk2.anims.stop();const upCad=r>.6?12:7.5;this.mk2.setFrame(M.upB!=null&&Math.floor(this.t*upCad)%2?M.upB:M.upA);}else{this.mk2.play(\`\${this.animPrefix}-\${r>.6?"run":"walk"}\`,!0);}}/*__IDLEUP__*/else if(h&&M.upA!=null&&!A.bakedWeapon){this.mk2.anims.stop();this.mk2.setFrame(M.upA);}else{`;

  if (!content.includes(oldCode)) {
    if (content.includes('upCad=r>.6?12:7.5')) {
      console.log('✅ O patch de animações direcionais já está aplicado!');
      return true;
    }
    console.error('❌ Não foi possível localizar o ponto exato de injeção em index-D6qIWtA7-p209.js');
    return false;
  }

  content = content.replace(oldCode, newCode);
  fs.writeFileSync(BUNDLE_PATH, content, 'utf8');
  console.log('✅ Patch direcional aplicado com sucesso em assets/index-D6qIWtA7-p209.js!');
  return true;
}

if (require.main === module) {
  const ok = applyDirectionalPatch();
  process.exit(ok ? 0 : 1);
}

module.exports = { applyDirectionalPatch };
