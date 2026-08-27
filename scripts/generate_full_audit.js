const fs = require('fs');
const path = require('path');

// 1. Load places.json
const places = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/places/places.json'), 'utf8'));

// 2. Parse odishaEssentials.ts
const essentialsTs = fs.readFileSync(path.join(__dirname, '../frontend/src/data/odishaEssentials.ts'), 'utf8');
const essentialsMatch = essentialsTs.match(/export const ODISHA_ESSENTIALS: EssentialPlace\[\] = (\[[\s\S]*?\]);/);
let essentials = [];
if (essentialsMatch) {
  essentials = eval(`(${essentialsMatch[1]})`);
}

// 3. Parse staticTransitStops.ts
const transitTs = fs.readFileSync(path.join(__dirname, '../frontend/src/data/staticTransitStops.ts'), 'utf8');
const transitMatch = transitTs.match(/export const VERIFIED_TRANSIT_STOPS: VerifiedTransitStop\[\] = (\[[\s\S]*?\]);/);
let stops = [];
if (transitMatch) {
  stops = eval(`(${transitMatch[1]})`);
}

// 4. Load ama_bus.json and ama_bus_schedule.json
const routes = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/transport/static/ama_bus.json'), 'utf8'));
const schedules = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/transport/static/ama_bus_schedule.json'), 'utf8'));

const ODISHA_30_DISTRICTS = [
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak",
  "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati",
  "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi",
  "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput",
  "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
  "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
];

console.log(`Audited Places: ${places.length}`);
console.log(`Audited Essentials: ${essentials.length}`);
console.log(`Audited Transit Stops: ${stops.length}`);
console.log(`Audited Bus Routes: ${routes.length}`);
console.log(`Audited Schedules: ${schedules.length}`);

// Generate District Matrix
const matrix = {};
ODISHA_30_DISTRICTS.forEach(d => {
  matrix[d] = {
    destinations: 0,
    hotels: 0,
    restaurants: 0,
    hospitals: 0,
    pharmacies: 0,
    atms: 0,
    petrol: 0,
    police: 0,
    transit_stops: 0,
    transit_routes: 0,
    rail: 0,
    airports: 0,
    images: 0
  };
});

places.forEach(p => {
  const d = p.district || "Khordha";
  if (matrix[d]) {
    matrix[d].destinations++;
    if (p.image || p.imageUrl || p.thumbnail) {
      matrix[d].images++;
    }
  }
});

essentials.forEach(e => {
  const d = e.district;
  if (matrix[d]) {
    if (e.category === 'hotel') matrix[d].hotels++;
    else if (e.category === 'restaurant') matrix[d].restaurants++;
    else if (e.category === 'hospital') matrix[d].hospitals++;
    else if (e.category === 'pharmacy') matrix[d].pharmacies++;
    else if (e.category === 'atm') matrix[d].atms++;
    else if (e.category === 'petrol') matrix[d].petrol++;
    else if (e.category === 'police') matrix[d].police++;
  }
});

stops.forEach(s => {
  const d = s.district;
  if (matrix[d]) {
    matrix[d].transit_stops++;
    if (s.stop_type === 'rail_station') matrix[d].rail++;
    else if (s.stop_type === 'airport') matrix[d].airports++;
    if (s.routes_serving_stop) {
      matrix[d].transit_routes += s.routes_serving_stop.length;
    }
  }
});

console.log("\n=== DISTRICT X CATEGORY MATRIX ===");
console.log("| District | Destinations | Hotels | Restaurants | Hospitals | Pharmacies | ATMs | Petrol | Police | Transit Stops | Routes | Rail | Airport | Exact Images | Coverage Tier |");
console.log("|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|");

ODISHA_30_DISTRICTS.forEach(d => {
  const m = matrix[d];
  const activeCats = [
    m.destinations > 0,
    m.hotels > 0,
    m.restaurants > 0,
    m.hospitals > 0,
    m.pharmacies > 0,
    m.atms > 0,
    m.petrol > 0,
    m.police > 0,
    m.transit_stops > 0
  ].filter(Boolean).length;

  let tier = "Limited";
  if (activeCats >= 8 && m.destinations >= 4 && (m.hotels >= 2 || m.restaurants >= 2)) {
    tier = "**Strong**";
  } else if (activeCats >= 7) {
    tier = "Moderate";
  }

  console.log(`| ${d} | ${m.destinations} | ${m.hotels} | ${m.restaurants} | ${m.hospitals} | ${m.pharmacies} | ${m.atms} | ${m.petrol} | ${m.police} | ${m.transit_stops} | ${m.transit_routes} | ${m.rail} | ${m.airports} | ${m.images} | ${tier} |`);
});

// Category Counts
const catCounts = {};
essentials.forEach(e => {
  catCounts[e.category] = (catCounts[e.category] || 0) + 1;
});
console.log("\nEssentials Category Counts:", catCounts);

// Hotels list audit
console.log("\n=== 40 HOTELS AUDIT ===");
const hotels = essentials.filter(e => e.category === 'hotel');
hotels.forEach((h, idx) => {
  console.log(`${idx + 1}. [${h.district}] ${h.name} | SubType: ${h.subType} | Coords: (${h.lat}, ${h.lon}) | Source: ${h.dataSource || 'OTDC / Verified Portal'} | Rating: ${h.rating ? `${h.rating} (${h.ratingCount || 0} via ${h.ratingSource})` : 'N/A'} | Hours: ${h.openingHours || 'Check-in: ' + h.checkInTime}`);
});

// Restaurants breakdown
console.log("\n=== RESTAURANTS AUDIT ===");
const restaurants = essentials.filter(e => e.category === 'restaurant');
const restSubtypes = {};
restaurants.forEach(r => {
  restSubtypes[r.subType] = (restSubtypes[r.subType] || 0) + 1;
});
console.log("Restaurant Subtypes:", restSubtypes);

// Hospitals audit
console.log("\n=== HOSPITALS AUDIT ===");
const hospitals = essentials.filter(e => e.category === 'hospital');
const hospSubtypes = {};
hospitals.forEach(h => {
  hospSubtypes[h.subType] = (hospSubtypes[h.subType] || 0) + 1;
});
console.log(`Hospitals count: ${hospitals.length}, 24x7 emergency count: ${hospitals.filter(h => h.is24x7).length}, phone count: ${hospitals.filter(h => h.phone || h.emergencyPhone).length}`);

// Pharmacies audit
console.log("\n=== PHARMACIES AUDIT ===");
const pharmacies = essentials.filter(e => e.category === 'pharmacy');
console.log(`Pharmacies count: ${pharmacies.length}, PMBJP Jan Aushadhi count: ${pharmacies.filter(p => p.dataSource && p.dataSource.includes('PMBJP')).length}, 24x7 count: ${pharmacies.filter(p => p.is24x7).length}`);

// ATMs audit
console.log("\n=== ATMS AUDIT ===");
const atms = essentials.filter(e => e.category === 'atm');
console.log(`ATMs count: ${atms.length}, Banks: ${[...new Set(atms.map(a => a.bankName))].join(', ')}`);

// Petrol audit
console.log("\n=== PETROL AUDIT ===");
const petrol = essentials.filter(e => e.category === 'petrol');
console.log(`Petrol count: ${petrol.length}, EV charging supported: ${petrol.filter(p => p.evCharging).length}`);

// Police audit
console.log("\n=== POLICE AUDIT ===");
const police = essentials.filter(e => e.category === 'police');
console.log(`Police count: ${police.length}, Dial 112 emergency: ${police.filter(p => p.emergencyPhone === '112').length}`);

// Transit breakdown
console.log("\n=== TRANSIT BREAKDOWN ===");
console.log(`Total Stops: ${stops.length}`);
console.log(`Airports: ${stops.filter(s => s.stop_type === 'airport').length}`);
console.log(`Rail Junctions: ${stops.filter(s => s.stop_type === 'rail_station').length}`);
console.log(`OSRTC Bus Terminals: ${stops.filter(s => s.stop_type === 'bus_terminal').length}`);
console.log(`CRUT Bus Hubs: ${stops.filter(s => s.agency === 'CRUT').length}`);
