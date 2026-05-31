const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts = { dev: 'vite', build: 'vite build', preview: 'vite preview', predeploy: 'npm run build', deploy: 'gh-pages -d dist' };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
