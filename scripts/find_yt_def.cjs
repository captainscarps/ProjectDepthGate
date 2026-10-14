const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

let pos = 0;
while ((pos = code.indexOf('Yt={', pos)) !== -1) {
  console.log(`Yt={ at ${pos}:`);
  console.log(code.substring(pos, pos + 300));
  pos += 4;
}
if (pos === 0) {
  const matches = [...code.matchAll(/([a-zA-Z0-9_$]+)=\{necromancer:/g)];
  console.log('Matches for necromancer:', matches.map(m => m[0]));
}
