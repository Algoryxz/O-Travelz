import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../..");
const distStaticDir = path.resolve(__dirname, "../dist/static/images");
const generatedDir = path.resolve(__dirname, "../generated");

fs.mkdirSync(generatedDir, { recursive: true });

console.log("[Projection Compiler] Loading canonical sources...");
const manifestPath = path.join(repoRoot, "data/images/sources/manifest.json");
const catManifestPath = path.join(repoRoot, "data/images/sources/category_manifest.json");
const rejectedPath = path.join(repoRoot, "data/images/sources/rejected_candidates.json");
const pubPath = path.join(repoRoot, "data/images/sources/publishability_report.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const categories = JSON.parse(fs.readFileSync(catManifestPath, "utf-8"));

const rejectedIds = new Set();
if (fs.existsSync(rejectedPath)) {
  const rejected = JSON.parse(fs.readFileSync(rejectedPath, "utf-8"));
  for (const r of rejected) {
    const rid = r.research_id || r.place_id;
    if (rid) rejectedIds.add(rid);
  }
}

const pubDecisions = {};
if (fs.existsSync(pubPath)) {
  const pub = JSON.parse(fs.readFileSync(pubPath, "utf-8"));
  for (const d of pub.decisions || []) {
    pubDecisions[d.place_id] = d;
  }
}

const PUBLIC_VARIANTS = ["hero.webp", "card.webp", "thumbnail.webp"];

const publicManifest = {
  generated_at: process.env.VITE_BUILD_TIME || new Date().toISOString(),
  compiler: "build-public-media-projection.js",
  rules: {
    allowed_variants: PUBLIC_VARIANTS,
    excluded_variants: ["original.webp"],
    verification_requirement: "EXACT_LOCATION_VERIFIED or VERIFIED_AUTHENTIC_PHOTOGRAPHY",
    rejected_policy: "NEVER_PUBLISH",
  },
  places: {},
  categories: {},
};

const filesToCopy = [];
let totalOriginalBytesSaved = 0;

for (const item of manifest) {
  const placeId = item.place_id;
  const assetHash = item.asset_hash;
  const vStatus = item.verification_status || "";

  if (rejectedIds.has(placeId)) continue;

  const d = pubDecisions[placeId] || {};
  if (d.classification === "RELATED_LOCATION_ONLY") continue;

  if (
    vStatus !== "VERIFIED_AUTHENTIC_PHOTOGRAPHY" &&
    vStatus !== "EXACT_LOCATION_VERIFIED" &&
    d.classification !== "EXACT_LOCATION_VERIFIED"
  ) {
    continue;
  }

  const srcPlaceDir = path.join(repoRoot, "data/images/places", placeId, assetHash);
  if (!fs.existsSync(srcPlaceDir)) continue;

  const destPlaceDir = path.join(distStaticDir, "places", placeId, assetHash);

  const placeEntry = {
    place_name: item.place_name,
    asset_hash: assetHash,
    title: item.title,
    alt_text: item.alt_text,
    creator: item.creator,
    license: item.license,
    attribution: item.attribution,
    variants: {},
  };

  const origFile = path.join(srcPlaceDir, "original.webp");
  if (fs.existsSync(origFile)) {
    totalOriginalBytesSaved += fs.statSync(origFile).size;
  }

  for (const v of PUBLIC_VARIANTS) {
    const srcF = path.join(srcPlaceDir, v);
    if (fs.existsSync(srcF)) {
      const destF = path.join(destPlaceDir, v);
      filesToCopy.push({ src: srcF, dest: destF });
      const vName = v.replace(".webp", "");
      placeEntry.variants[vName] = {
        path: `/static/images/places/${placeId}/${assetHash}/${v}`,
        size_bytes: fs.statSync(srcF).size,
      };
    }
  }

  publicManifest.places[placeId] = placeEntry;
}

for (const cat of categories) {
  const catId = cat.category_id;
  const assetHash = cat.asset_hash;
  const srcCatDir = path.join(repoRoot, "data/images/categories", catId, assetHash);
  const destCatDir = path.join(distStaticDir, "categories", catId, assetHash);

  const origFile = path.join(srcCatDir, "original.webp");
  if (fs.existsSync(origFile)) {
    totalOriginalBytesSaved += fs.statSync(origFile).size;
  }

  const catEntry = {
    category_key: cat.category_key,
    asset_hash: assetHash,
    title: cat.title,
    variants: {},
  };

  for (const v of PUBLIC_VARIANTS) {
    const srcF = path.join(srcCatDir, v);
    if (fs.existsSync(srcF)) {
      const destF = path.join(destCatDir, v);
      filesToCopy.push({ src: srcF, dest: destF });
      const vName = v.replace(".webp", "");
      catEntry.variants[vName] = {
        path: `/static/images/categories/${catId}/${assetHash}/${v}`,
        size_bytes: fs.statSync(srcF).size,
      };
    }
  }

  publicManifest.categories[catId] = catEntry;
}

const manifestOut = path.join(generatedDir, "publicMediaManifest.json");
fs.writeFileSync(manifestOut, JSON.stringify(publicManifest, null, 2), "utf-8");
console.log(
  `[Projection Compiler] Wrote public manifest with ${Object.keys(publicManifest.places).length} places, ${Object.keys(publicManifest.categories).length} categories -> ${manifestOut}`
);

const distDir = path.resolve(__dirname, "../dist");
if (fs.existsSync(distDir)) {
  if (fs.existsSync(distStaticDir)) {
    fs.rmSync(distStaticDir, { recursive: true, force: true });
  }

  let copiedCount = 0;
  let copiedBytes = 0;
  for (const { src, dest } of filesToCopy) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copiedCount++;
    copiedBytes += fs.statSync(dest).size;
  }

  console.log(
    `[Projection Compiler] Deployed ${copiedCount} public variant files (${(copiedBytes / (1024 * 1024)).toFixed(2)} MB) to ${distStaticDir}`
  );
  console.log(
    `[Projection Compiler] Successfully eliminated ${(totalOriginalBytesSaved / (1024 * 1024)).toFixed(2)} MB of unneeded original.webp sources!`
  );
}
