const fs = require('fs');
const lines = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('step(i="stone"')) {
    console.log('step Line:', i + 1);
    console.log(lines[i].substring(0, 300));
  }
  if (lines[i].includes('this.stepDistance>=')) {
    console.log('stepDistance Line:', i + 1);
    console.log(lines[i].substring(0, 300));
  }
  if (lines[i].includes('playThunder:')) {
    console.log('playThunder Line:', i + 1);
    console.log(lines[i].substring(0, 300));
  }
}
