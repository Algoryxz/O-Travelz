# M15 — Emergency Essentials, Civic Contacts and Artisan Clusters Baseline

## 1. Executive Summary

Wave M15 equips O-TRAVELZ Mobile V4 (Android Jetpack Compose & iOS SwiftUI) with verified civic essentials, emergency telephony access, and living cultural heritage exploration across Odisha.

Travelers navigating unfamiliar districts require rapid, dependable access to vital civic utilities (hospitals, police stations, fuel stations, ATMs) and emergency numbers, alongside authentic cultural access to Odisha's centuries-old artisan settlements and GI-tagged traditions.

---

## 2. Emergency Helplines Specification

The platform bundles 8 state and national emergency numbers directly in memory, ensuring 100% availability in Airplane Mode without network connectivity:

| ID | Service Label | Number | Category | 24x7 |
|:---|:---|:---|:---|:---|
| `hl-112` | National Emergency Service | `112` | Police / Fire / Medical / SDRF | Yes |
| `hl-108` | Emergency Medical Ambulance | `108` | Ambulance / Life Support | Yes |
| `hl-1363` | National Tourist Helpline | `1363` | Multilingual Travel Support | Yes |
| `hl-odisha-tourist` | Odisha Tourist Police / Helpline | `0674-2396996` | State Tourism Police Desk | Yes |
| `hl-181` | Women Helpline (Odisha) | `181` | Crisis Support & Counseling | Yes |
| `hl-101` | Fire & Rescue Service | `101` | Fire & Disaster Response | Yes |
| `hl-1033` | National Highway Emergency (NHAI) | `1033` | Highway Road Assistance | Yes |
| `hl-1098` | Childline Emergency Support | `1098` | Child Protection & Rescue | Yes |

---

## 3. Telephony & Dialer Security

In accordance with strict mobile security standards (`android-intent-security` and iOS URL scheme policies):

1. **Zero Silent Calls**: Neither app requests or utilizes `android.permission.CALL_PHONE`. All telephony handoffs delegate execution to the native system phone dialer.
2. **Intent Action**: Android strictly employs `Intent(Intent.ACTION_DIAL, Uri.parse("tel:$sanitized"))`.
3. **URL Scheme**: iOS strictly uses `URL(string: "tel://\(sanitized)")` via `UIApplication.shared.open`.
4. **Input Sanitization**: Phone numbers are strictly filtered to digits and a leading `+` before generating URIs, preventing URI scheme injection or malformed payloads.
5. **Confirmation Modal**: An explicit dialog (`AlertDialog` on Android, `Alert` on iOS) is presented before opening the phone dialer, displaying the target recipient name and number.

---

## 4. Civic Services Architecture

Civic facilities are queried dynamically from the backend using the verified catalog of 211 civic facilities across Odisha:

- **Endpoint**: `GET /api/v1/services/nearby`
- **Query Parameters**:
  - `lat` (Double): Latitude of traveler coordinate or place anchor.
  - `lon` (Double): Longitude of traveler coordinate or place anchor.
  - `category` (String, optional): `healthcare`, `police`, `fuel`, `atm`, `transit`, or `all`.
  - `radius_km` (Double, optional): Search radius.
- **Client Implementations**:
  - Android: `EssentialsRepository` calling `OTravelzApiService.getNearbyServices` via Retrofit.
  - iOS: `EssentialsRepository` calling `APIClient.shared.getNearbyServices` via URLSession.
- **UI Surfaces**:
  - Android: `EssentialsSheet` (Material 3 `ModalBottomSheet` with category filter chips and distance badges).
  - iOS: `EssentialsSheetView` (SwiftUI Sheet with capsule selector and distance indicators).
  - Place Detail: Accessible via "Nearby Emergency & Civic Help" action button on both platforms.

---

## 5. Living Heritage & Artisan Clusters

Odisha's artisanal identity is represented through 6 canonical craft settlements with verified Geographical Indication (GI) status and direct linkage to destination details:

1. **Raghurajpur Heritage Crafts Village** (`Puri`): Pattachitra cloth painting, palm-leaf Tala Pattachitra engraving, cow-dung toys. INTACH-protected heritage craft village. (GI Tagged).
2. **Pipili Applique Village** (`Puri`): 12th-century Chandua applique tradition crafted for Lord Jagannath's Rath Yatra canopies and chhatris. (GI Tagged).
3. **Cuttack Silver Filigree (Tarakasi)** (`Cuttack`): 500-year-old maritime metalcraft of drawing paper-thin silver wires into jewelry and Durga Puja Chandi Medhas. (GI Tagged).
4. **Ekamra Haat Cultural Center** (`Khordha`): Curated urban craft marketplace featuring master weavers, terracotta artisans, and Dokra casters from all 30 districts.
5. **Sambalpur Handloom & Ikat Belt** (`Sambalpur`): Western Odisha weaving heartland producing Sambalpuri Bandha tie-dye textiles. (GI Tagged).
6. **Kantilo Bell Metal Enclave** (`Nayagarh`): Ancient Mahanadi riverbank cluster forging Kansari bronze, bell-metal (Kansa), and ritual temple vessels.

---

## 6. Verification Status

| Check | Result | Evidence |
|:---|:---|:---|
| Android Unit Tests | PASS (81/81 passed) | `:android:testDebugUnitTest` |
| Android Build | PASS (APK built) | `:android:assembleDebug` |
| Android Lint | PASS (0 errors) | `:android:lintDebug` |
| iOS Unit Tests | SOURCE_PARITY_VERIFIED | `EssentialsDomainTests.swift` |
| OpenAPI Contract | PASS | `python scripts/export_mobile_openapi.py --check` |
| Project Context | PASS | `python scripts/check_project_context.py` |
| Research Staging | PASS | `python scripts/validate_research_staging.py` |
| Mobile Offline Staging | PASS | `python scripts/validate_mobile_offline_staging.py` |
| Trailing Whitespace | PASS | `git diff --check` |
