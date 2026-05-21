// Post-build step for GitHub Pages.
// - Copies index.html to 404.html so SPA deep links work after a hard refresh.
// - Writes .nojekyll so files starting with underscore aren't filtered out.
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'dist', 'medicare-clinic', 'browser');
const indexPath = path.join(outDir, 'index.html');
const fallbackPath = path.join(outDir, '404.html');
const nojekyllPath = path.join(outDir, '.nojekyll');

if (!fs.existsSync(indexPath)) {
  console.error(`prepare-ghpages: index.html not found at ${indexPath}`);
  process.exit(1);
}

fs.copyFileSync(indexPath, fallbackPath);
fs.writeFileSync(nojekyllPath, '');

console.log('prepare-ghpages: wrote 404.html and .nojekyll');
