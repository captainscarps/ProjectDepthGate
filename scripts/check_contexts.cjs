const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

function showContext(str) {
  const idx = code.indexOf(str);
  console.log('---', str, 'at', idx);
  if (idx !== -1) {
    console.log(code.substring(idx - 120, idx + 200));
  }
}

showContext('sfx-skeleton-death');
showContext('sfx-hero-hurt-female');
showContext('sfx-boss-evil-laugh');
showContext('sfx-hero-grunt-warrior');
