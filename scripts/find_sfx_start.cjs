const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('case"warrior-heavy-strike":');
console.log('warrior-heavy-strike at', idx);
const sfxStart = code.lastIndexOf('sfx(i', idx);
console.log('sfx start at', sfxStart);
console.log(code.substring(sfxStart, sfxStart + 300));
