import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const PLACES_JSON = path.join(ROOT_DIR, 'data/places/places.json');
const AMA_BUS_JSON = path.join(ROOT_DIR, 'data/transport/static/ama_bus.json');
const AMA_BUS_SCHEDULE_JSON = path.join(ROOT_DIR, 'data/transport/static/ama_bus_schedule.json');
const ESSENTIALS_TS = path.join(ROOT_DIR, 'frontend/src/data/odishaEssentials.ts');
const TRANSIT_STOPS_TS = path.join(ROOT_DIR, 'frontend/src/data/staticTransitStops.ts');

console.log('🔍 [O-Travelz Data Quality Audit & Provenance Validator]');
console.log('----------------------------------------------------');

let totalErrors = 0;
let totalWarnings = 0;
let stats = {
  placesCount: 0,
  placesWithRating: 0,
  placesWithHours: 0,
  essentialsCount: 0,
  essentialsByCategory: {},
  transitStopsCount: 0,
  transitRoutesCount: 0,
  transitSchedulesCount: 0,
  duplicateIds: 0,
  invalidCoordinates: 0,
};

function isValidOdishaCoord(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
         !isNaN(lat) && !isNaN(lon) &&
         lat >= 17.0 && lat <= 23.5 &&
         lon >= 81.0 && lon <= 88.0;
}

// 1. Audit canonical places.json
if (fs.existsSync(PLACES_JSON)) {
  const places = JSON.parse(fs.readFileSync(PLACES_JSON, 'utf-8'));
  stats.placesCount = places.length;
  const seenIds = new Set();

  places.forEach((p, idx) => {
    if (!p.id && !p.name) {
      console.error(`❌ [places.json] Entry #${idx} missing id and name`);
      totalErrors++;
    }
    const id = p.id || p.name;
    if (seenIds.has(id)) {
      console.error(`❌ [places.json] Duplicate ID: ${id}`);
      totalErrors++;
      stats.duplicateIds++;
    }
    seenIds.add(id);

    if (p.lat != null && p.lon != null) {
      if (!isValidOdishaCoord(p.lat, p.lon)) {
        console.error(`❌ [places.json] Invalid Odisha coordinate for ${p.name}: (${p.lat}, ${p.lon})`);
        totalErrors++;
        stats.invalidCoordinates++;
      }
    }

    if (p.rating != null) {
      stats.placesWithRating++;
      if (p.rating < 1.0 || p.rating > 5.0) {
        console.error(`❌ [places.json] Impossible rating ${p.rating} for ${p.name}`);
        totalErrors++;
      }
    }

    if (p.opening_hours != null || p.opening_hours_source != null) {
      stats.placesWithHours++;
    }
  });
  console.log(`✅ Audited places.json: ${stats.placesCount} places (${stats.placesWithRating} with ratings, ${stats.placesWithHours} with hours)`);
} else {
  console.warn(`⚠️ [places.json] File not found at ${PLACES_JSON}`);
  totalWarnings++;
}

// 2. Audit transport static files
if (fs.existsSync(AMA_BUS_JSON)) {
  const routes = JSON.parse(fs.readFileSync(AMA_BUS_JSON, 'utf-8'));
  stats.transitRoutesCount = Array.isArray(routes) ? routes.length : (routes.routes?.length || 0);
  console.log(`✅ Audited ama_bus.json: ${stats.transitRoutesCount} transit routes`);
}

if (fs.existsSync(AMA_BUS_SCHEDULE_JSON)) {
  const schedules = JSON.parse(fs.readFileSync(AMA_BUS_SCHEDULE_JSON, 'utf-8'));
  stats.transitSchedulesCount = Object.keys(schedules).length;
  console.log(`✅ Audited ama_bus_schedule.json: ${stats.transitSchedulesCount} verified schedule profiles`);
}

// 3. Audit staticTransitStops.ts
if (fs.existsSync(TRANSIT_STOPS_TS)) {
  const content = fs.readFileSync(TRANSIT_STOPS_TS, 'utf-8');
  const match = content.match(/id:\s*['"]([^'"]+)['"]/g);
  stats.transitStopsCount = match ? match.length : 0;
  console.log(`✅ Audited staticTransitStops.ts: ~${stats.transitStopsCount} transit stop records`);
}

// 4. Audit odishaEssentials.ts
if (fs.existsSync(ESSENTIALS_TS)) {
  const content = fs.readFileSync(ESSENTIALS_TS, 'utf-8');
  const idMatches = content.match(/id:\s*['"]([^'"]+)['"]/g) || [];
  stats.essentialsCount = idMatches.length;

  const categories = ['hospital', 'pharmacy', 'atm', 'bank', 'restaurant', 'petrol', 'police', 'hotel'];
  categories.forEach(cat => {
    const reg = new RegExp(`category:\\s*['"]${cat}['"]`, 'g');
    const count = (content.match(reg) || []).length;
    stats.essentialsByCategory[cat] = count;
  });

  console.log(`✅ Audited odishaEssentials.ts: ${stats.essentialsCount} total records`);
  console.log('   Categories:', JSON.stringify(stats.essentialsByCategory));
}

console.log('----------------------------------------------------');
console.log(`Summary: ${totalErrors} Errors, ${totalWarnings} Warnings`);

if (totalErrors > 0) {
  console.error('❌ Data quality validation FAILED.');
  process.exit(1);
} else {
  console.log('🎉 Data quality validation PASSED.');
  process.exit(0);
}
