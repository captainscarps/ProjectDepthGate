const fs = require('fs');
const path = require('path');

const mpBase = 'scripts/magmatic_planet_extracted/Magmatic Planet';
const destDir = 'assets/pixel-art/newmaps';
const mirrorDir = 'Projeto atualizado/assets/pixel-art/newmaps';

// Mapeamento minucioso dos sprites do vulcão para os melhores arquivos do Magmatic Planet
// Garantindo que sejam orgânicos, arredondados, sem cantos retos/quadrados e de altíssima qualidade!
const mapping = {
  // --- ROCHAS E BOULDERS ---
  'vc-boulder1.png': 'props/boulders-rubble-scree/00-single-rounded-boulder.png',
  'vc-boulder2.png': 'props/boulders-rubble-scree/01-angular-boulder.png',
  'vc-boulder3.png': 'props/boulders-rubble-scree/02-two-boulders-leaning.png',
  'vc-boulder4.png': 'props/boulders-rubble-scree/08-squat-wide-rock-mound.png',
  'vc-boulder5.png': 'props/boulders-rubble-scree/03-tight-cluster-of-three.png',
  'vc-mp-magma-rock.png': 'props/boulders-rubble-scree/07-fractured-boulder-split.png',
  'vc-mp-rock-cluster.png': 'props/boulders-rubble-scree/03-tight-cluster-of-three.png',

  // --- COLUNAS DE BASALTO ---
  'vc-columns1.png': 'props/basalt-columns-spires/00-single-tall-hexagonal.png',
  'vc-columns2.png': 'props/basalt-columns-spires/05-pair-of-hexagonal-basalt.png',
  'vc-columns3.png': 'props/basalt-columns-spires/01-cluster-of-three-tall.png',
  'vc-bigcolumns.png': 'props/basalt-columns-spires/02-tight-bundle-of-five.png',
  'vc-mp-column-single.png': 'props/basalt-columns-spires/00-single-tall-hexagonal.png',
  'vc-mp-column-trio.png': 'props/basalt-columns-spires/01-cluster-of-three-tall.png',
  'vc-mp-column-bundle.png': 'props/basalt-columns-spires/02-tight-bundle-of-five.png',

  // --- PISCINAS DE LAVA ORGÂNICAS E FLUIDAS (SEM CANTOS QUADRADOS) ---
  'vc-lavapool.png': 'props/lava-pools-falls/00-round-lava-pool-in-rock-rim.png',
  'vc-lavapool2.png': 'props/lava-pools-falls/02-long-kidney-lava-pool.png',
  'vc-mp-lavapool-round.png': 'props/lava-pools-falls/00-round-lava-pool-in-rock-rim.png',
  'vc-mp-lavapool-drip.png': 'props/lava-pools-falls/01-lava-pool-with-dripping-lip.png',
  'vc-mp-lavapool-crust.png': 'props/lava-pools-falls/05-lava-pool-with-crust-islands.png',
  'vc-mp-lavapool-crystal.png': 'props/lava-pools-falls/07-lava-pool-with-swirled-crust.png',

  // --- CRISTAIS DE ÂMBAR E OBSIDIANA ---
  'vc-mp-crystal1.png': 'props/amber-crystal-formations/01-cluster-of-three-amber.png',
  'vc-mp-crystal2.png': 'props/amber-crystal-formations/02-fan-of-amber-crystal.png',
  'vc-mp-magma-bulb.png': 'props/amber-crystal-formations/09-chunky-amber-crystal.png',
  'vc-swordrock.png': 'props/amber-crystal-formations/00-single-tall-amber.png',
  'vc-obsidian1.png': 'props/crystal-obsidian-sulfur-nodes/rep00-obsidian-spikes-on-rock.png',
  'vc-obsidian2.png': 'props/crystal-obsidian-sulfur-nodes/rep03-rock-mound-with-obsidian.png',
  'vc-obsidian3.png': 'props/crystal-obsidian-sulfur-nodes/rep08-obsidian-shard-and-amber.png',
  'vc-sulfur.png': 'props/crystal-obsidian-sulfur-nodes/rep14-spiky-sulfur-crystal-cluster.png',

  // --- RESPIRADOUROS, VENTS E CONES ---
  'vc-vent.png': 'props/geysers-vents-spatter-cones/00-small-squat-spatter-cone.png',
  'vc-mp-spatter-cone.png': 'props/geysers-vents-spatter-cones/00-small-squat-spatter-cone.png',
  'vc-mp-tall-cone.png': 'props/geysers-vents-spatter-cones/01-tall-steep-spatter-cone.png',
  'vc-mp-twin-cone.png': 'props/geysers-vents-spatter-cones/03-twin-spatter-cone-two.png',

  // --- FLORA DE FOGO ---
  'vc-mp-ember-fern.png': 'props/heat-plants-fire-flora/00-small-fan-of-five-ember.png',
  'vc-mp-fire-succulent.png': 'props/heat-plants-fire-flora/02-low-round-spiky-succulent.png',
  'vc-stump.png': 'props/ash-trees-giant-fungi/05-split-ash-tree-trunk.png',

  // --- FÓSSEIS E RESTOS DE TITÃS ---
  'vc-mp-titan-skull.png': 'props/fossils-titan-remains/01-long-snouted-creature.png',
  'vc-mp-curved-horns.png': 'props/fossils-titan-remains/03-pair-of-curved-horns.png',
  'vc-mp-beast-jaw.png': 'props/fossils-titan-remains/05-broken-beast-jaw.png',
  'vc-remains.png': 'props/fossils-titan-remains/12-lower-jawbone-with-two-big.png',

  // --- ARCOS E TUBOS DE LAVA ---
  'vc-mp-rock-arch.png': 'props/arches-rock-bridges/02-gently-arched-natural-rock.png',
  'vc-mp-lava-tube.png': 'props/cave-mouths-lava-tubes-craters/00-rounded-cave-mouth-opening.png',

  // --- MÓDULOS DE CRISTA E BORDAS ROCHOSAS (SEM CANTOS QUADRADOS) ---
  'vc-thorn-h.png': 'props/ridge-wall-modules/00-run-ew-plain.png',
  'vc-thorn-v.png': 'props/ridge-wall-modules/20-side-run-ns-l.png'
};

console.log('Total mappings configured:', Object.keys(mapping).length);

let copied = 0;
for (const [targetName, relSrc] of Object.entries(mapping)) {
  const srcPath = path.join(mpBase, relSrc);
  if (!fs.existsSync(srcPath)) {
    console.error('Source missing:', srcPath);
    continue;
  }
  const destPath = path.join(destDir, targetName);
  const mirrorPath = path.join(mirrorDir, targetName);

  fs.copyFileSync(srcPath, destPath);
  fs.copyFileSync(srcPath, mirrorPath);
  copied++;
}

console.log(`Copied ${copied} sprites to ${destDir} and ${mirrorDir}`);
