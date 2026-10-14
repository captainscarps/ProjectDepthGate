const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const sfxStart = code.indexOf('case"demon-attack":');
console.log('demon-attack at', sfxStart);
console.log(code.substring(sfxStart, sfxStart + 1200));
