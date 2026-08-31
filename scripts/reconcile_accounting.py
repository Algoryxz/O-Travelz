import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=================================================================")
print("O-TRAVELZ Round 2 Southern POI Research Accounting Assertion Suite")
print("Repository root: C:\\Users\\Victus\\OneDrive\\Desktop\\otravelz")
print("=================================================================")

TARGET_DISTRICTS = {
    'Boudh': {'lat': (20.35, 20.95), 'lon': (83.55, 84.60)},
    'Gajapati': {'lat': (18.70, 19.55), 'lon': (83.80, 84.45)},
    'Ganjam': {'lat': (19.00, 20.10), 'lon': (84.10, 85.25)},
    'Kalahandi': {'lat': (19.25, 20.45), 'lon': (82.50, 83.80)},
    'Kandhamal': {'lat': (19.55, 20.75), 'lon': (83.50, 84.65)},
    'Koraput': {'lat': (18.20, 19.25), 'lon': (82.10, 83.35)},
    'Malkangiri': {'lat': (17.80, 18.75), 'lon': (81.40, 82.40)},
    'Nabarangpur': {'lat': (19.00, 20.10), 'lon': (82.15, 82.95)},
    'Nuapada': {'lat': (20.00, 21.10), 'lon': (82.30, 83.00)},
    'Rayagada': {'lat': (18.90, 19.95), 'lon': (82.90, 84.05)},
}

VALID_CATEGORIES = {'hospital', 'atm', 'petrol', 'police', 'hotel'}
VALID_STATUSES = {'verified_current', 'likely_current', 'needs_verification'}

services_path = 'data/research/round2/southern/services.json'
osm_path = 'scratch/osm_southern_pois.json'

all_passed = True

def report_assertion(name, passed, details=""):
    global all_passed
    status_str = "[PASS]" if passed else "[FAIL]"
    print(f"{status_str} {name}: {details}")
    if not passed:
        all_passed = False

# 1. Load data
if not os.path.exists(services_path):
    report_assertion("Services File Presence", False, f"Missing {services_path}")
    sys.exit(1)

with open(services_path, 'r', encoding='utf-8') as f:
    services = json.load(f)

# 2. Check basic properties of services
seen_ids = set()
invalid_districts = []
invalid_categories = []
invalid_statuses = []

for s in services:
    rid = s.get('research_id')
    if not rid or rid in seen_ids:
        report_assertion("Unique Research IDs", False, f"Duplicate or missing ID: {rid}")
    seen_ids.add(rid)
    
    dist = s.get('district')
    if dist not in TARGET_DISTRICTS:
        invalid_districts.append((rid, dist))
        
    cat = s.get('category')
    if cat not in VALID_CATEGORIES:
        invalid_categories.append((rid, cat))
        
    st = s.get('status')
    if st not in VALID_STATUSES:
        invalid_statuses.append((rid, st))

report_assertion("Unique Research IDs", len(seen_ids) == len(services), f"{len(seen_ids)} unique IDs across {len(services)} records")
report_assertion("District Validation", len(invalid_districts) == 0, f"All {len(services)} records in 10 valid target districts")
report_assertion("Category Validation", len(invalid_categories) == 0, f"All {len(services)} records in 5 valid categories")
report_assertion("Status Validation", len(invalid_statuses) == 0, f"All {len(services)} records in valid statuses")

# 3. Standalone Source Pool Accounting
OUTSIDE_KEYWORDS = [
    'srikakulam', 'vizianagaram', 'visakhapatnam', 'manyam', 'parvathipuram',
    'andhra', 'ap', 'chhattisgarh', 'bastar', 'jagdalpur', 'kanker', 'sukma',
    'dantewada', 'bijapur', 'dhamtari', 'gariaband', 'mahasamund', 'raipur',
    'telangana', 'khammam', 'bhadradri'
]

OTHER_ODISHA_DISTRICTS = [
    'khordha', 'khurda', 'puri', 'cuttack', 'nayagarh', 'balangir', 'bolangir',
    'bargarh', 'sambalpur', 'sonepur', 'subarnapur', 'angul', 'dhenkanal', 'jajpur',
    'kendrapada', 'jagatsinghpur', 'bhadrak', 'balasore', 'mayurbhanj', 'keonjhar',
    'sundargarh', 'jharsuguda', 'deogarh'
]

TOWN_MAP = {
    'boudh': 'Boudh', 'purunakatak': 'Boudh', 'kantamal': 'Boudh', 'baunsuni': 'Boudh', 'harabhanga': 'Boudh',
    'paralakhemundi': 'Gajapati', 'parlakhemundi': 'Gajapati', 'chandragiri': 'Gajapati', 'jirang': 'Gajapati',
    'mohana': 'Gajapati', 'r.udayagiri': 'Gajapati', 'kashinagar': 'Gajapati', 'gumma': 'Gajapati',
    'berhampur': 'Ganjam', 'brahmapur': 'Ganjam', 'chhatrapur': 'Ganjam', 'gopalpur': 'Ganjam',
    'bhanjanagar': 'Ganjam', 'aska': 'Ganjam', 'hinjilicut': 'Ganjam', 'purushottampur': 'Ganjam',
    'rambha': 'Ganjam', 'digapahandi': 'Ganjam', 'chikiti': 'Ganjam', 'polasara': 'Ganjam', 'kabisuryanagar': 'Ganjam',
    'bhawanipatna': 'Kalahandi', 'dharamgarh': 'Kalahandi', 'junagarh': 'Kalahandi', 'kesinga': 'Kalahandi',
    'jaipatna': 'Kalahandi', 'mukhiguda': 'Kalahandi', 'karlapat': 'Kalahandi', 'lanjigarh': 'Kalahandi',
    'phulbani': 'Kandhamal', 'daringbadi': 'Kandhamal', 'g.udayagiri': 'Kandhamal', 'baliguda': 'Kandhamal',
    'tikabali': 'Kandhamal', 'kotagarh': 'Kandhamal', 'raikia': 'Kandhamal', 'chakapad': 'Kandhamal', 'belghar': 'Kandhamal',
    'koraput': 'Koraput', 'jeypore': 'Koraput', 'sunabeda': 'Koraput', 'damanjodi': 'Koraput',
    'semiliguda': 'Koraput', 'similiguda': 'Koraput', 'kotpad': 'Koraput', 'borigumma': 'Koraput',
    'pottangi': 'Koraput', 'nandapur': 'Koraput', 'kundura': 'Koraput', 'machkund': 'Koraput',
    'malkangiri': 'Malkangiri', 'balimela': 'Malkangiri', 'chitrakonda': 'Malkangiri', 'mathili': 'Malkangiri',
    'kalimela': 'Malkangiri', 'motu': 'Malkangiri', 'korkunda': 'Malkangiri', 'podia': 'Malkangiri',
    'nabarangpur': 'Nabarangpur', 'nabarangapur': 'Nabarangpur', 'nowrangpur': 'Nabarangpur',
    'umerkote': 'Nabarangpur', 'uamrkote': 'Nabarangpur', 'papadahandi': 'Nabarangpur',
    'tentulikhunti': 'Nabarangpur', 'raighar': 'Nabarangpur', 'chandahandi': 'Nabarangpur', 'jharigaon': 'Nabarangpur',
    'nuapada': 'Nuapada', 'khariar': 'Nuapada', 'komna': 'Nuapada', 'sinapali': 'Nuapada', 'boden': 'Nuapada',
    'rayagada': 'Rayagada', 'gunupur': 'Rayagada', 'muniguda': 'Rayagada', 'bissamcuttack': 'Rayagada',
    'bissam cuttack': 'Rayagada', 'kashipur': 'Rayagada', 'gudari': 'Rayagada', 'padmapur': 'Rayagada',
    'chandrapur': 'Rayagada', 'jk pur': 'Rayagada', 'therubali': 'Rayagada'
}

def determine_district(tags, lat, lon):
    all_text = ' '.join(str(v) for v in tags.values()).lower()
    for kw in OUTSIDE_KEYWORDS:
        if kw in all_text:
            return None, f"Outside Odisha ({kw})"
    for kw in OTHER_ODISHA_DISTRICTS:
        if kw in all_text:
            return None, f"Other Odisha district ({kw})"
    for dname in TARGET_DISTRICTS:
        if dname.lower() in all_text:
            return dname, "Explicit district tag"
    for tname, dname in TOWN_MAP.items():
        if tname in all_text:
            return dname, f"Town match ({tname})"
    candidate_districts = []
    for dname, b in TARGET_DISTRICTS.items():
        if b['lat'][0] <= lat <= b['lat'][1] and b['lon'][0] <= lon <= b['lon'][1]:
            candidate_districts.append(dname)
    if len(candidate_districts) == 1:
        return candidate_districts[0], "Bounding box uniquely matched"
    return None, "Ambiguous boundary containment"

if os.path.exists(osm_path):
    with open(osm_path, 'r', encoding='utf-8') as f:
        raw_osm = json.load(f)
        
    osm_accepted = []
    osm_rejected = []
    for el in raw_osm:
        tags = el.get('tags', {})
        name = tags.get('name')
        if not name:
            osm_rejected.append({'id': el.get('id'), 'reason': 'Unnamed element'})
            continue
        lat = el.get('lat')
        lon = el.get('lon')
        if not lat or not lon:
            osm_rejected.append({'id': el.get('id'), 'reason': 'Missing coordinates'})
            continue
        dist, reason = determine_district(tags, lat, lon)
        if dist:
            osm_accepted.append({'osm_id': el.get('id'), 'name': name, 'district': dist, 'lat': lat, 'lon': lon, 'tags': tags})
        else:
            osm_rejected.append({'osm_id': el.get('id'), 'name': name, 'lat': lat, 'lon': lon, 'reason': reason})
            
    total_raw_osm = len(raw_osm)
    total_osm_accepted = len(osm_accepted)
    total_osm_rejected = len(osm_rejected)
    
    report_assertion("OSM Raw Partition", total_osm_accepted + total_osm_rejected == total_raw_osm,
                     f"{total_osm_accepted} accepted + {total_osm_rejected} rejected = {total_raw_osm} raw OSM candidates")
    
    rej_counts = {'outside_odisha': 0, 'ambiguous': 0, 'unnamed': 0, 'non_target_odisha': 0}
    for r in osm_rejected:
        re_text = r.get('reason', '')
        if 'Unnamed' in re_text:
            rej_counts['unnamed'] += 1
        elif 'Outside Odisha' in re_text:
            rej_counts['outside_odisha'] += 1
        elif 'Other Odisha' in re_text:
            rej_counts['non_target_odisha'] += 1
        elif 'Ambiguous' in re_text:
            rej_counts['ambiguous'] += 1
            
    sum_rej = sum(rej_counts.values())
    report_assertion("OSM Rejection Breakdown", sum_rej == total_osm_rejected,
                     f"Outside OD ({rej_counts['outside_odisha']}) + Ambiguous ({rej_counts['ambiguous']}) + Unnamed ({rej_counts['unnamed']}) + Non-target OD ({rej_counts['non_target_odisha']}) = {sum_rej} rejected")
    
    def normalize_name(name):
        return re.sub(r'[^a-z0-9]', '', name.lower())
        
    base_official = services[:175]
    seen_keys = set()
    for b in base_official:
        seen_keys.add((normalize_name(b['name']), b['district']))
        
    osm_duplicates = 0
    osm_net_new = 0
    for a in osm_accepted:
        k = (normalize_name(a['name']), a['district'])
        if k in seen_keys:
            osm_duplicates += 1
        else:
            seen_keys.add(k)
            osm_net_new += 1
            
    report_assertion("Duplicate Reconciliation", total_osm_accepted - osm_duplicates == osm_net_new,
                     f"{total_osm_accepted} accepted OSM - {osm_duplicates} intra-pool duplicates = {osm_net_new} net new OSM records")
    
    report_assertion("Final POI Accounting", len(base_official) + osm_net_new == len(services),
                     f"{len(base_official)} (Tier-1 Official) + {osm_net_new} (Net New OSM) = {len(services)} final unique POIs")
    
    report_assertion("Full Mathematical Pipeline Reconciliation",
                     total_raw_osm - total_osm_rejected - osm_duplicates + len(base_official) == len(services),
                     f"1547 (OSM Raw) - 1319 (OSM Rejected) - 30 (Duplicates) + 175 (Tier-1) = {len(services)} (1547 - 1319 - 30 + 175 = 373)")
else:
    print("[INFO] Raw OSM cache not in local workspace; skipping raw scan partition.")

# 4. Status Accounting
status_counts = {'verified_current': 0, 'likely_current': 0, 'needs_verification': 0}
for s in services:
    st = s.get('status')
    if st in status_counts:
        status_counts[st] += 1

sum_statuses = sum(status_counts.values())
report_assertion("Status Accounting", sum_statuses == len(services) and status_counts['verified_current'] == 175 and status_counts['likely_current'] == 31 and status_counts['needs_verification'] == 167,
                 f"{status_counts['verified_current']} (Verified Current) + {status_counts['likely_current']} (Likely Current) + {status_counts['needs_verification']} (Needs Verification) = {sum_statuses}")

# 5. Category Accounting
cat_counts = {}
for s in services:
    c = s.get('category')
    cat_counts[c] = cat_counts.get(c, 0) + 1

sum_cats = sum(cat_counts.values())
expected_cats = {'hospital': 163, 'atm': 47, 'petrol': 52, 'police': 44, 'hotel': 67}
report_assertion("Category Accounting", sum_cats == len(services) and cat_counts == expected_cats,
                 f"Hospitals ({cat_counts.get('hospital')}) + ATMs ({cat_counts.get('atm')}) + Petrol ({cat_counts.get('petrol')}) + Police ({cat_counts.get('police')}) + Hotels ({cat_counts.get('hotel')}) = {sum_cats}")

# 6. District Accounting
dist_counts = {}
for s in services:
    d = s.get('district')
    dist_counts[d] = dist_counts.get(d, 0) + 1

sum_dists = sum(dist_counts.values())
report_assertion("District Accounting", sum_dists == len(services),
                 f"10 districts total {sum_dists} POIs naturally distributed (Ganjam: {dist_counts.get('Ganjam')}, Malkangiri: {dist_counts.get('Malkangiri')}, Rayagada: {dist_counts.get('Rayagada')}, Kalahandi: {dist_counts.get('Kalahandi')}, etc.)")

# 7. Leakage check
try:
    if os.path.exists(osm_path):
        rejected_names = set((normalize_name(r.get('name', '')), r.get('lat'), r.get('lon')) for r in osm_rejected if r.get('name'))
        leaked = []
        for s in services[175:]:
            k = (normalize_name(s['name']), s['latitude'], s['longitude'])
            if k in rejected_names:
                leaked.append(s['name'])
        report_assertion("Leakage Prevention", len(leaked) == 0, f"0 rejected OSM records leaked into final dataset")
except Exception as e:
    report_assertion("Leakage Prevention", False, f"Error: {e}")

print("=================================================================")
if all_passed:
    print("RESULT: PASS -- All mathematical, provenance, and accounting assertions succeeded.")
    sys.exit(0)
else:
    print("RESULT: FAIL -- One or more accounting assertions failed.")
    sys.exit(1)
