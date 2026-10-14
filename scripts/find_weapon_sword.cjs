const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

let pos = 0;
while ((pos = code.indexOf('weapon-sword', pos)) !== -1) {
  console.log(`weapon-sword at ${pos}:`);
  console.log(code.substring(pos - 40, pos + 100));
  pos += 12;
}
