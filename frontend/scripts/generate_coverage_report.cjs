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

// Load essentials dataset from compiled or regex
const essentialsFile = path.join(__dirname, '../src/data/odishaEssentials.ts');
let essentialsContent = fs.readFileSync(essentialsFile, 'utf8');

// Parse basic counts
const categories = {
  destinations: places.length,
  hotels: (essentialsContent.match(/category:\s*"hotel"/g) || []).length,
  hospitals: (essentialsContent.match(/category:\s*"hospital"/g) || []).length,
  pharmacies: (essentialsContent.match(/category:\s*"pharmacy"/g) || []).length,
  atms: (essentialsContent.match(/category:\s*"atm"/g) || []).length,
  restaurants: (essentialsContent.match(/category:\s*"restaurant"/g) || []).length,
  petrol: (essentialsContent.match(/category:\s*"petrol"/g) || []).length,
  police: (essentialsContent.match(/category:\s*"police"/g) || []).length,
};

console.log('================================================================');
console.log('   O-TRAVELZ ODISHA-WIDE DATA COVERAGE REPORT');
console.log('================================================================\n');

console.log('1. CATEGORY TOTALS:');
console.table(categories);

console.log('\n2. 30-DISTRICT COVERAGE AUDIT:');
let totalCovered = 0;
const districtSummary = ODISHA_DISTRICTS.map(dist => {
  const placeMatches = places.filter(p => p.district && p.district.toLowerCase() === dist.toLowerCase()).length;
  const regex = new RegExp(`district:\\s*["']${dist}["']`, 'gi');
  const essentialMatches = (essentialsContent.match(regex) || []).length;
  const total = placeMatches + essentialMatches;
  if (total > 0) totalCovered++;
  return {
    District: dist,
    Destinations: placeMatches,
    Essentials: essentialMatches,
    Total: total,
    Status: total > 0 ? '✓ Covered' : 'No verified records'
  };
});

console.table(districtSummary);
console.log(`\nTotal Districts Covered: ${totalCovered} / 30 (${Math.round((totalCovered / 30) * 100)}%)`);
console.log('================================================================\n');
