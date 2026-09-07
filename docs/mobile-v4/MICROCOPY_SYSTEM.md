# O-TRAVELZ Mobile V4 — Content & Microcopy System Specification

> **Authoritative Microcopy, Cultural Voice, and Bilingual String Architecture**<br>
> Scope: **Truth Language, Standard System Messages, Bilingual Structure (English + Odia)**<br>
> Governance: **Zero Fabricated Certainty; Anti-Marketplace Tone; Zero Machine-Translation of Canonical Entities**<br>
> Wave: `M3` | Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Architectural Philosophy: Calm, Honest, Cultural Voice

The voice of O-TRAVELZ Mobile V4 is that of a **dignified digital cultural atlas and reliable transit companion**:
- **Calm and truthful**: Never uses urgency banners ("Only 2 seats left!", "Hurry, book now!"), commercial clickbait, or fake certainty.
- **Dignified Odia heritage**: Canonical monument names, temple rituals, and artisan villages preserve their authentic Odia script and cultural names.
- **Zero machine-translation distortion**: Canonical proper nouns (e.g., *Mukteshvara Deula*, *Raghurajpur*, *Dhauli Shanti Stupa*) are never translated by statistical ML into distorted English words (e.g., translating *Bada Danda* literally as "Big Stick" instead of "Grand Road").

---

## 2. Standard Truth Language Vocabulary

| Term | Permitted Meaning & Context | Prohibited Misuse |
|---|---|---|
| **Verified** | Confirmed by official government survey, CRUT transit agency, or physical on-site inspection. | Never applied to unvetted crowd suggestions. |
| **Scheduled** | Official static published timetable (Mo Bus / Ama Bus). Non-telemetry. | Never phrased as "Arriving now" or "Live arrival". |
| **Candidate** | Stop or facility noted in official route records but awaiting physical GPS verification. | Never rendered as a confirmed green pin. |
| **Estimated** | Mathematical calculation (Haversine spherical distance, walking duration). | Never presented as a surveyed pedestrian route. |
| **Unavailable** | Data missing from official records or remote provider currently unreachable. | Never disguised with generic fake placeholders. |
| **Cached** | Information retrieved earlier and stored in on-device SQLite database. | Never presented as real-time current conditions. |

---

## 3. Standard System & Fallback Copy Strings (English + Odia)

### 3.1 Weather Unavailable
- **English**: "Current weather unavailable. Connect to the internet to fetch Open-Meteo forecasts."
- **Odia**: "ବର୍ତ୍ତମାନର ପାଣିପାଗ ସୂଚନା ଉପଲବ୍ଧ ନାହିଁ। ପାଣିପାଗ ଜାଣିବା ପାଇଁ ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ କରନ୍ତୁ।"

### 3.2 AI Assistant Unavailable
- **English**: "AI Assistant requires an internet connection. Browsing the verified Odisha catalog using standard filters."
- **Odia**: "AI ସହାୟକ ପାଇଁ ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ଆବଶ୍ୟକ। ନିର୍ଦ୍ଧାରିତ ଫିଲ୍ଟର୍ ବ୍ୟବହାର କରି ଯାତ୍ରା ଯୋଜନା କରନ୍ତୁ।"

### 3.3 Candidate Stop Disclosure
- **English**: "Candidate Stop: This stop is listed in official transit records, but physical GPS coordinates are pending field verification. Approach the nearest chowk or landmark to board."
- **Odia**: "ପ୍ରସ୍ତାବିତ ବସ୍ ରହଣି: ଏହି ରହଣି ସରକାରୀ ତାଲିକାରେ ଅଛି, କିନ୍ତୁ ଏହାର ନିର୍ଦ୍ଦିଷ୍ଟ GPS ସ୍ଥାନ ଯାଞ୍ଚ ହୋଇନାହିଁ। ନିକଟସ୍ଥ ଛକରେ ସ୍ଥାନୀୟ ଲୋକଙ୍କୁ ପଚାରି ବସ୍ ଚଢନ୍ତୁ।"

### 3.4 Route Geometry Unavailable
- **English**: "Route geometry unmapped: Showing scheduled stop sequence. Exact road polyline is not yet surveyed."
- **Odia**: "ରାସ୍ତା ମାନଚିତ୍ର ଉପଲବ୍ଧ ନାହିଁ: ନିର୍ଦ୍ଧାରିତ ରହଣି କ୍ରମ ଦର୍ଶାଯାଇଛି। ସମ୍ପୂର୍ଣ୍ଣ ରାସ୍ତା ରେଖା ଯାଞ୍ଚ ଚାଲିଛି।"

### 3.5 Offline State Active
- **English**: "Offline Mode: Exploring bundled Odisha atlas. Verified places, transit schedules, and emergency contacts are fully available."
- **Odia**: "ଅଫଲାଇନ୍ ମୋଡ୍: ଡିଭାଇସ୍‌ରେ ଥିବା ଓଡ଼ିଶା ଭ୍ରମଣ ତଥ୍ୟ ଉପଲବ୍ଧ। ସମସ୍ତ ସ୍ଥାନ, ବସ୍ ସମୟସାରଣୀ ଏବଂ ଜରୁରୀକାଳୀନ ନମ୍ବର କାର୍ଯ୍ୟକ୍ଷମ ଅଛି।"

### 3.6 Missing Media Internal Staging
- **English**: "Authentic photograph pending verification. Per O-TRAVELZ truth policy, this destination will remain unlisted until authentic imagery is approved."
- **Odia**: "ପ୍ରାମାଣିକ ଫଟୋ ଯାଞ୍ଚ ଚାଲିଛି। ଯାଞ୍ଚ ଶେଷ ନହେବା ପର୍ଯ୍ୟନ୍ତ ଏହି ସ୍ଥାନ ସାର୍ବଜନୀନ ତାଲିକାରେ ପ୍ରକାଶିତ ହେବ ନାହିଁ।"

### 3.7 Location Permission Denied
- **English**: "Location access not granted. Explore any Odisha district manually using the map and search filters."
- **Odia**: "ଲୋକେସନ୍ ଅନୁମତି ମିଳିନାହିଁ। ଆପଣ ମାନଚିତ୍ର କିମ୍ବା ଫିଲ୍ଟର୍ ବ୍ୟବହାର କରି ନିଜେ ସ୍ଥାନ ଖୋଜିପାରିବେ।"

### 3.8 No Saved Trips (Zero State)
- **English**: "No saved itineraries yet. Plan your first journey across Odisha's temples, crafts, and coastal sanctuaries."
- **Odia**: "କୌଣସି ଯାତ୍ରା ସାଇତା ହୋଇନାହିଁ। ଓଡ଼ିଶାର ଐତିହ୍ୟ ଓ ପ୍ରକୃତି ଭ୍ରମଣ ପାଇଁ ନୂତନ ଯୋଜନା ଆରମ୍ଭ କରନ୍ତୁ।"

### 3.9 Transit Fare Unavailable
- **English**: "Fare information unavailable. Check official or operator information before travel."
- **Odia**: "ଭଡ଼ା ସୂଚନା ଉପଲବ୍ଧ ନାହିଁ। ଯାତ୍ରା ପୂର୍ବରୁ ସରକାରୀ କିମ୍ବା ପରିଚାଳକ ସୂଚନା ଯାଞ୍ଚ କରନ୍ତୁ।"

### 3.10 Contribution Under Review
- **English**: "Thank you for contributing! Your photo and stop survey are under editorial review before public publication."
- **Odia**: "ଆପଣଙ୍କ ଅବଦାନ ପାଇଁ ଧନ୍ୟବାଦ! ଯାଞ୍ଚ ଶେଷ ହେବା ପରେ ଏହା ସାର୍ବଜନୀନ ଭାବେ ପ୍ରକାଶିତ ହେବ।"

---

## 4. Bilingual String Governance Rules

1. **Dual Representation**: Every destination, monument, and civic facility stores `name_en` and `name_or` as first-class database fields.
2. **Canonical Vernacular Display**: In bilingual cards, the primary title is displayed in English with the authentic Odia script subtitle beneath (e.g., "Lingaraj Temple / ଲିଙ୍ଗରାଜ ମନ୍ଦିର").
3. **No Machine Translation for Cultural Terms**: Cultural rituals (e.g., *Ratha Yatra*, *Sandhya Arati*, *Boita Bandana*) and art forms (e.g., *Pattachitra*, *Pipili Chandua*, *Dhokra*) must use approved cultural glossaries.
