const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const sIdx = code.indexOf('step(i="stone"');
const sEnd = code.indexOf('sfx(i){', sIdx);
console.log('step method:');
console.log(code.substring(sIdx, sEnd));
