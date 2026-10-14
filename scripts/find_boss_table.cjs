const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('class hh extends');
console.log('hh at', idx);
const before = code.substring(idx - 1000, idx);
console.log(before);
