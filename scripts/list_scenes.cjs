const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const superCalls = [...bundle.matchAll(/super\s*\(\s*["']([A-Za-z0-9_\-]+)["']\s*\)/g)].map(m => m[1]);
console.log('Registered Scene Keys:', Array.from(new Set(superCalls)));
