const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const idx = bundle.indexOf('super("Game")');
console.log(bundle.slice(idx + 1500, idx + 4000));
