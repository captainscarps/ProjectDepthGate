const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

function showCase(name) {
  const p = `case"${name}":`;
  const idx = code.indexOf(p);
  if (idx !== -1) {
    const end = code.indexOf('break;', idx);
    console.log(code.substring(idx, end + 6));
  } else {
    console.log('NOT FOUND:', name);
  }
}

showCase('shield-block');
showCase('shield-block-heavy');
showCase('attack-miss');
showCase('cast-charge');
showCase('mage-meteor');
showCase('archer-multishot');
showCase('archer-explosive-arrow');
showCase('warrior-heavy-strike');
showCase('warrior-whirlwind');
showCase('warrior-iron-skin');
