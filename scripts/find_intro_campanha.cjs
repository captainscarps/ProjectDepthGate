const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const matches = [...bundle.matchAll(/intro_campanha/g)];
console.log('Matches for intro_campanha:', matches.map(m => m.index));
matches.forEach(m => {
  console.log('--- Context at', m.index, '---');
  console.log(bundle.slice(Math.max(0, m.index - 150), Math.min(bundle.length, m.index + 250)));
});
