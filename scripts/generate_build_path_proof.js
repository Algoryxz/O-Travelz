const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'frontend/dist');

if (!fs.existsSync(distDir)) {
  console.error('Dist directory does not exist.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

// Check script and link tags in index.html
const assetTags = [];
const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
let match;
while ((match = scriptRegex.exec(indexHtml)) !== null) {
  assetTags.push({ type: 'script', url: match[1] });
}

const linkRegex = /<link[^>]+href=["']([^"']+)["']/g;
while ((match = linkRegex.exec(indexHtml)) !== null) {
  assetTags.push({ type: 'link', url: match[1] });
}

const allAssetsPrefixed = assetTags.filter(t => !t.url.startsWith('http')).every(t => t.url.startsWith('/O-Travelz/'));

// Check for un-prefixed root logo path in bundled JS
const jsDir = path.join(distDir, 'assets');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
let hardcodedRootLogoCount = 0;

for (const jsFile of jsFiles) {
  const code = fs.readFileSync(path.join(jsDir, jsFile), 'utf8');
  if (code.includes('"/logo.jpeg"')) {
    hardcodedRootLogoCount++;
  }
}

// Check key static assets in dist
const keyAssets = [
  'logo.jpeg',
  'sw.js',
  'images/destinations/chandrabhaga_beach.webp',
  'images/destinations/gopalpur_beach.webp',
  'images/destinations/puri_beach.webp',
  'images/destinations/konark_sun_temple.webp',
  'static/images/places/place_013/a2d24252c0ce/hero.webp',
  'static/images/places/place_013/a2d24252c0ce/card.webp',
  'static/images/places/place_013/a2d24252c0ce/thumbnail.webp',
];

const assetProof = keyAssets.map(rel => {
  const full = path.join(distDir, rel);
  const exists = fs.existsSync(full);
  return {
    path: rel,
    exists,
    sizeBytes: exists ? fs.statSync(full).size : 0,
    expectedPublicUrl: '/O-Travelz/' + rel
  };
});

const report = {
  timestamp: new Date().toISOString(),
  basePathConfigured: '/O-Travelz/',
  indexHtmlAssetTags: assetTags,
  allIndexAssetsPrefixed: allAssetsPrefixed,
  hardcodedRootLogoInJs: hardcodedRootLogoCount,
  staticAssetsVerified: assetProof,
  verdict: allAssetsPrefixed && hardcodedRootLogoCount === 0 && assetProof.every(a => a.exists) ? 'PASSED' : 'FAILED'
};

const outPath = path.join(repoRoot, 'reports/d1_3_build_path_proof.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log('Build path proof report generated at', outPath, 'Verdict:', report.verdict);
