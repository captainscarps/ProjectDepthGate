const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

function findCalls(str, limit = 5) {
  let pos = 0;
  let count = 0;
  console.log('--- CALLS FOR:', str);
  while ((pos = code.indexOf(str, pos)) !== -1 && count < limit) {
    console.log(`[pos ${pos}]:`, code.substring(Math.max(0, pos - 60), pos + 120));
    pos += str.length;
    count++;
  }
}

findCalls('enemy-death');
findCalls('player-hurt');
findCalls('boss-intro');
findCalls('boss-phase2');
