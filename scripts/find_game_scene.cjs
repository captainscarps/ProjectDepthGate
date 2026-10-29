const fs = require('fs');
const content = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const regex = /class\s+[a-zA-Z0-9_]+\s+extends\s+[a-zA-Z0-9_.]*Scene/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(m[0], 'at', m.index);
  console.log(content.slice(m.index, m.index + 250).replace(/\n/g, ' '));
}
