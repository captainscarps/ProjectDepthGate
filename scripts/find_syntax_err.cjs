const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

try {
  new vm.SourceTextModule(code);
} catch (e) {
  console.log(e);
}
