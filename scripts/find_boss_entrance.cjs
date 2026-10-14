const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

let pos = 0;
while ((pos = code.indexOf('bossEntrance', pos)) !== -1) {
  console.log(`bossEntrance at ${pos}:`);
  console.log(code.substring(pos - 60, pos + 200));
  pos += 12;
}
