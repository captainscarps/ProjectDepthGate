const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

let pos = 0;
while ((pos = code.indexOf('boss-intro', pos)) !== -1) {
  console.log(`boss-intro at ${pos}:`);
  console.log(code.substring(pos - 60, pos + 140));
  pos += 10;
}
