const fs = require('fs');
const path = require('path');

const ODISHA_DISTRICTS = [
  'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh',
  'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur',
  'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Keonjhar',
  'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh',
  'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
];

// Load places dataset
const placesPath = path.join(__dirname, '../../data/places/places.json');
let places = [];
if (fs.existsSync(placesPath)) {
  places = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
}

// Load essentials dataset
const essentialsFile = path.join(__dirname, '../src/data/odishaEssentials.ts');
let essentials = [];
if (fs.existsSync(essentialsFile)) {
  const content = fs.readFileSync(essentialsFile, 'utf8');
  const jsonMatch = content.match(/export const ODISHA_ESSENTIALS:\s*EssentialPlace\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (jsonMatch) {
    try {
      essentials = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Error parsing essentials JSON:', e);
    }
  }
}

// Load transit stops
const transitFile = path.join(__dirname, '../src/data/staticTransitStops.ts');
let transitStops = [];
if (fs.existsSync(transitFile)) {
  const content = fs.readFileSync(transitFile, 'utf8');
  const jsonMatch = content.match(/export const VERIFIED_TRANSIT_STOPS:\s*VerifiedTransitStop\[\]\s*=\s*(\[[\s\S]*\]);/);
  if (jsonMatch) {
    try {
      transitStops = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Error parsing transit stops JSON:', e);
    }
  }
}

// Category counts
const categories = {
  destinations: places.length,
  hotels: essentials.filter(e => e.category === 'hotel').length,
  hospitals: essentials.filter(e => e.category === 'hospital').length,
  pharmacies: essentials.filter(e => e.category === 'pharmacy').length,
  atms: essentials.filter(e => e.category === 'atm' || e.category === 'bank').length,
  restaurants: essentials.filter(e => e.category === 'restaurant').length,
  petrol: essentials.filter(e => e.category === 'petrol').length,
  police: essentials.filter(e => e.category === 'police').length,
  transitStops: transitStops.length,
};

console.log('================================================================');
console.log('   O-TRAVELZ FACTUAL ODISHA-WIDE SPATIAL DATA COVERAGE REPORT');
console.log('================================================================\n');

console.log('1. CATEGORY TOTALS:');
console.table(categories);

console.log('\n2. 30-DISTRICT DETAILED SPATIAL BREAKDOWN:');
const districtSummary = ODISHA_DISTRICTS.map(dist => {
  const placeMatches = places.filter(p => p.district && p.district.toLowerCase() === dist.toLowerCase()).length;
  const distEssentials = essentials.filter(e => e.district && e.district.toLowerCase() === dist.toLowerCase());
  
  const hotels = distEssentials.filter(e => e.category === 'hotel').length;
  const restaurants = distEssentials.filter(e => e.category === 'restaurant').length;
  const hospitals = distEssentials.filter(e => e.category === 'hospital').length;
  const pharmacies = distEssentials.filter(e => e.category === 'pharmacy').length;
  const atms = distEssentials.filter(e => e.category === 'atm' || e.category === 'bank').length;
  const petrol = distEssentials.filter(e => e.category === 'petrol').length;
  const police = distEssentials.filter(e => e.category === 'police').length;

  const distTransit = transitStops.filter(t => t.district && t.district.toLowerCase() === dist.toLowerCase()).length;

  const total = placeMatches + hotels + restaurants + hospitals + pharmacies + atms + petrol + police + distTransit;
  const breadth = [placeMatches > 0, hotels > 0, restaurants > 0, hospitals > 0, pharmacies > 0, atms > 0, petrol > 0, police > 0, distTransit > 0].filter(Boolean).length;

  let level = 'None';
  if (total >= 15 && breadth >= 6) {
    level = 'Strong';
  } else if (total >= 7 && breadth >= 4) {
    level = 'Moderate';
  } else if (total > 0) {
    level = 'Limited';
  }

  return {
    District: dist,
    Destinations: placeMatches,
    Hotels: hotels,
    Restaurants: restaurants,
    Hospitals: hospitals,
    Pharmacies: pharmacies,
    ATMs: atms,
    Petrol: petrol,
    Police: police,
    Transit: distTransit,
    Total: total,
    Coverage: level
  };
});

console.table(districtSummary);

const strongCount = districtSummary.filter(d => d.Coverage === 'Strong').length;
const modCount = districtSummary.filter(d => d.Coverage === 'Moderate').length;
const limCount = districtSummary.filter(d => d.Coverage === 'Limited').length;
const noneCount = districtSummary.filter(d => d.Coverage === 'None').length;

console.log(`\nCoverage Distribution: Strong: ${strongCount} | Moderate: ${modCount} | Limited: ${limCount} | None: ${noneCount}`);
console.log('================================================================\n');
