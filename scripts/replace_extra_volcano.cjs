const fs = require('fs');
const path = require('path');

const mpBase = 'scripts/magmatic_planet_extracted/Magmatic Planet';
const destDir = 'assets/pixel-art/newmaps';
const mirrorDir = 'Projeto atualizado/assets/pixel-art/newmaps';

const extraMapping = {
  'vc-anvil.png': 'props/boulders-rubble-scree/04-low-flat-rock-slab.png',
  'vc-banner.png': 'props/basalt-columns-spires/06-tall-pointed-rock-spire.png',
  'vc-forge.png': 'props/cave-mouths-lava-tubes-craters/00-rounded-cave-mouth-opening.png',
  'vc-minecart.png': 'props/boulders-rubble-scree/r2-12-compact-mound-of-six.png',
  'vc-rack.png': 'props/crystal-obsidian-sulfur-nodes/rep00-obsidian-spikes-on-rock.png',
  'vc-fx-crust1.png': 'terrain/cooled-lava-crust/tile_00.png',
  'vc-fx-crust2.png': 'terrain/cooled-lava-crust/tile_01.png',
  'vc-fx-crust3.png': 'terrain/cooled-lava-crust/tile_02.png',
  'vc-fx-streak.png': 'terrain/lava-path/tile_00.png',
  'vc-fx-streak2.png': 'terrain/lava-path/tile_02.png',
  'vc-fx-bubble.png': 'props/lava-pools-falls/rep17-lava-pool-with-bubbles.png'
};

for (const [targetName, relSrc] of Object.entries(extraMapping)) {
  const srcPath = path.join(mpBase, relSrc);
  if (!fs.existsSync(srcPath)) {
    console.error('Source missing:', srcPath);
    continue;
  }
  const destPath = path.join(destDir, targetName);
  const mirrorPath = path.join(mirrorDir, targetName);

  fs.copyFileSync(srcPath, destPath);
  fs.copyFileSync(srcPath, mirrorPath);
  console.log(`Updated ${targetName} from ${relSrc}`);
}
console.log('Todos os 11 sprites extras atualizados com sucesso!');
