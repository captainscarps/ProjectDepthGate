const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const matches = [...bundle.matchAll(/(campanha_1|campanha_2|campanha_3|part_1|part_2|modo_infinito)/g)];
console.log('Matches:', matches.map(m => ({ match: m[0], index: m.index })));
