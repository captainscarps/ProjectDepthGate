const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const matches = [...code.matchAll(/\.play\(([a-zA-Z0-9_$.]+sound[a-zA-Z0-9_$.]*)\)/g)];
console.log('Matches:', matches.map(m => m[0]));
