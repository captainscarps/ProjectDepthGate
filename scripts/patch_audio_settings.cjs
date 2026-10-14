const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Replace Portuguese label "VOLUME AMBIENTE" with "EFEITOS CLIMÁTICOS"
  const oldLabel = '"set.ambient":"VOLUME AMBIENTE"';
  const newLabel = '"set.ambient":"EFEITOS CLIMÁTICOS"';
  if (code.includes(oldLabel)) {
    code = code.replace(oldLabel, newLabel);
    console.log(`[${file}] Updated Portuguese label to EFEITOS CLIMÁTICOS`);
  }

  // Also in English: "AMBIENT VOLUME" -> "WEATHER EFFECTS"
  const oldLabelEn = '"set.ambient":"AMBIENT VOLUME"';
  const newLabelEn = '"set.ambient":"WEATHER EFFECTS"';
  if (code.includes(oldLabelEn)) {
    code = code.replace(oldLabelEn, newLabelEn);
    console.log(`[${file}] Updated English label to WEATHER EFFECTS`);
  }

  // In Spanish: "VOLUMEN AMBIENTE" -> "EFECTOS CLIMÁTICOS"
  const oldLabelEs = '"set.ambient":"VOLUMEN AMBIENTE"';
  const newLabelEs = '"set.ambient":"EFECTOS CLIMÁTICOS"';
  if (code.includes(oldLabelEs)) {
    code = code.replace(oldLabelEs, newLabelEs);
    console.log(`[${file}] Updated Spanish label to EFECTOS CLIMÁTICOS`);
  }

  // Update footstep biome detection in player update
  const oldStep = 'const r={catacombs:"stone",ruins:"moss",fortress:"volcanic",frozen:"snow"}[this.level.theme.id]??"stone";';
  const newStep = 'const bioId=(this.level?.theme?.id||this.level?.biome||this.levelId||"").toLowerCase();const r=bioId.includes("rio")?"water":bioId.includes("frozen")?"snow":bioId.includes("forest")||bioId.includes("bosque")?"grass":bioId.includes("ruin")?"moss":bioId.includes("fortress")?"volcanic":bioId.includes("castle")?"wood":"stone";';
  if (code.includes(oldStep)) {
    code = code.replace(oldStep, newStep);
    console.log(`[${file}] Updated footstep biome mapping with water, grass, snow, wood, stone`);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log(`[${file}] Saved settings & footstep biome patches.`);
}
