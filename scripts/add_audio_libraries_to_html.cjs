const fs = require('fs');

const files = ['index.html', 'Projeto atualizado/index.html'];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let html = fs.readFileSync(f, 'utf8');
  if (!html.includes('howler.min.js')) {
    const target = '<script src="./assets/network-coop.js?v=4.59"></script>';
    const addition = '<script src="./assets/howler.min.js"></script>\n  <script src="./assets/tone.min.js"></script>\n  <script src="./assets/network-coop.js?v=4.59"></script>';
    if (html.includes(target)) {
      html = html.replace(target, addition);
      fs.writeFileSync(f, html, 'utf8');
      console.log(`[${f}] Added Howler.js and Tone.js script tags.`);
    } else {
      console.log(`[${f}] Target not found!`);
    }
  } else {
    console.log(`[${f}] Already contains howler.min.js`);
  }
}
