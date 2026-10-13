const fs = require('fs');

const files = [
  'C:/Users/rafaelscarpille/.gemini/antigravity/scratch/ProjectDepthGate/assets/index-D6qIWtA7-p209.js',
  'C:/Users/rafaelscarpille/.gemini/antigravity/scratch/ProjectDepthGate/Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const fp of files) {
  let content = fs.readFileSync(fp, 'utf8');

  // 1. Add enemy-mimic: 0.46 to visual scaling table Si
  const oldScale = '"shaman-wolf":.42},ee={';
  const newScale = '"shaman-wolf":.42,"enemy-mimic":0.46},ee={';
  if (!content.includes('"enemy-mimic":0.46')) {
    if (!content.includes(oldScale)) throw new Error('oldScale not found in ' + fp);
    content = content.replace(oldScale, newScale);
  }

  // 2. Adjust stats in ee definition
  const oldDef = 'MIMIC:{name:"Mímico",texture:"enemy-mimic",sizeClass:"medium",bodySize:26,speed:75,maxHp:14,damage:3,';
  const newDef = 'MIMIC:{name:"Mímico",texture:"enemy-mimic",sizeClass:"small",bodySize:18,speed:85,maxHp:5,damage:1,';
  if (content.includes(oldDef)) {
    content = content.replace(oldDef, newDef);
  }

  fs.writeFileSync(fp, content, 'utf8');
  console.log('Updated ' + fp);
}
