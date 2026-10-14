const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const sfxStart = 1450886;
const switchEnd = code.indexOf('default:', sfxStart);
const sfxBlock = code.substring(sfxStart, switchEnd + 50);

const cases = [...sfxBlock.matchAll(/case"([^"]+)":/g)].map(m => m[1]);
console.log('Total SFX cases:', cases.length);
console.log(cases);
