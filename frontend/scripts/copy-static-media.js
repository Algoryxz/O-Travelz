import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../..');
const distDir = path.resolve(__dirname, '../dist');

const staticTargets = [
  {
    src: path.join(repoRoot, 'data/images/places'),
    dest: path.join(distDir, 'static/images/places'),
  },
  {
    src: path.join(repoRoot, 'data/images/categories'),
    dest: path.join(distDir, 'static/images/categories'),
  },
];

console.log('[copy-static-media] Starting static media packaging for production build...');

if (!fs.existsSync(distDir)) {
  console.warn(`[copy-static-media] Dist directory ${distDir} does not exist. Skipping.`);
  process.exit(0);
}

let totalCopied = 0;

for (const target of staticTargets) {
  if (fs.existsSync(target.src)) {
    fs.mkdirSync(path.dirname(target.dest), { recursive: true });
    fs.cpSync(target.src, target.dest, { recursive: true, force: true });
    console.log(`[copy-static-media] Successfully synced: ${path.relative(repoRoot, target.src)} -> ${path.relative(repoRoot, target.dest)}`);
    totalCopied++;
  } else {
    console.warn(`[copy-static-media] Source directory not found: ${target.src}`);
  }
}

console.log(`[copy-static-media] Completed copying ${totalCopied} static media target directories into dist/static/images.`);
