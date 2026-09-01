# O-Travelz — Provider Verification Record

**Status:** FROZEN
**Phase:** Phase 1 — Research and verified data
**Verification date:** 2026-08-17
**Verifier:** Temporary Akriti coverage (Smarak)
**Scope:** Bhubaneswar/Odisha initial product scope

## Freeze rule

This record is the frozen Phase 1 provider-verification baseline as of 2026-08-17.

A capability is not considered verified merely because a consumer application appears to
support it. A public developer API, open-data feed, route, fare, schedule, or live source
must have direct evidence before O-Travelz treats it as available.

The record distinguishes:
- provider/platform capability;
- publicly documented developer/API access;
- static information;
- scheduled information;
- live information.

No private/authenticated API is claimed to be absent merely because public access was not found.

---

## 1. Mo Bus / AMA Bus

**Mode:** Public bus

**Service status:** VERIFIED.

**Public API / open-data status:** NOT VERIFIED as a public developer API.

**Verified evidence:**
- Odisha Motor Vehicle Department identifies Mo Bus as a CRUT-operated public bus service
  serving Bhubaneswar, Cuttack, Puri and Khordha.
- CRUT publishes AMA BUS network/operational material.
- Odisha OPTICS exposes public bus-at-location, bus-between-locations, bus information,
  bus fare, route and timetable functions.

**Sources:**
- https://odishatransport.gov.in/content/Mo-Bus/7
- https://comprehensiveregiontransport.in/
- https://opms.odishatransport.gov.in/sta/LiveBusBetweenLocation.aspx
- https://opms.odishatransport.gov.in/sta/TimeTable.aspx

**Best verified substitute for O-Travelz:** Official CRUT network/route material and
official OPTICS timetable/route/fare information, manually digitized where required.

**Data tier:** `static` and `scheduled`.

**Live status:** NOT CLAIMED. A public developer live/ETA interface was not verified.

**Provider integration status:** Research only; adapter implementation belongs to Rudra
after this verification record.

**Verification:** Temporary Akriti coverage, 2026-08-17.

---

## 2. Mo E-Ride

**Mode:** Electric-rickshaw feeder/paratransit

**Service status:** VERIFIED.

**Public API / open-data status:** NO PUBLIC DEVELOPER API VERIFIED.

**Verified evidence:**
Official Mo E-Ride route documents hosted by Bhubaneswar One provide named routes,
ordered stops, operating hours, route lengths, and approximate peak headways.

**Sources:**
- https://cms.bhubaneswarone.in/uploadDocuments/content/Mo_E-RIDE_Routes_Updated-1_removed.pdf
- https://cms.bhubaneswarone.in/uploadDocuments/content/Mo_E-RIDE_Route_map_23052022_RP-1_to_RP-10.pdf
- https://cms.bhubaneswarone.in/uploadDocuments/content/4.Untold_Stories_of_Sarathis_of_Mo_E-Ride_English_publication_1.pdf

**Best verified substitute for O-Travelz:** Official route PDFs/maps manually digitized into
static topology plus explicitly labelled headway information.

**Data tier:** `static` and `scheduled` where the documented operating window/headway is used.

**Estimate handling:** Approximate headway must remain explicitly approximate/estimate-only;
it must never be represented as live data.

**Live status:** NOT VERIFIED.

**Important remaining condition:** A route is not seed-ready until every stop used by the
structured importer has an independently verified coordinate.

**Provider integration status:** Research only; adapter implementation belongs to Rudra.

**Verification:** Temporary Akriti coverage, 2026-08-17.

---

## 3. Odisha Yatri

**Mode:** Mobility platform for cab/auto and other mobility services

**Service status:** VERIFIED.

**Public API / open-data status:** PLATFORM/NETWORK INTEGRATION CAPABILITY VERIFIED;
PUBLIC UNAUTHENTICATED DEVELOPER ACCESS FOR O-TRAVELZ NOT VERIFIED.

**Verified evidence:**
The official Odisha Yatri site states that the application is built on the open-source
Beckn Protocol and common ONDC network standards, with interoperability for compliant
buyer applications.

**Sources:**
- https://odishayatri.in/about/
- https://odishayatri.in/open

**Best verified substitute for O-Travelz:** Official platform/network documentation until
a directly consumable public interface is verified.

**Data tier:** `unknown` for O-Travelz machine-consumable live/scheduled data.

**Live status:** NOT CLAIMED.

**Provider integration status:** Requires separate Rudra verification before adapter work.

**Verification:** Temporary Akriti coverage, 2026-08-17.

---

## 4. Auto / e-rickshaw

**Mode:** Auto-rickshaw / e-rickshaw

**Service status:** VERIFIED as a regulated transport mode.

**Public API / open-data status:** NO PUBLIC TRIP-PLANNING API VERIFIED.

**Verified evidence:**
Odisha transport documentation identifies Auto Rickshaw as a contract-carriage vehicle
class and OPTICS exposes an Auto Rickshaw / Taxi information section.

**Sources:**
- https://odishatransport.gov.in/content/Permanent-Contract-Carriage/1
- https://opms.odishatransport.gov.in/sta/LiveBusBetweenLocation.aspx

**Best verified substitute for O-Travelz:** Current official fare/order information where
directly applicable; otherwise explicit unknown/estimate status.

**Data tier:** `static` only where a current, applicable source is verified; otherwise `unknown`.

**Live status:** NOT VERIFIED.

**Provider integration status:** Requires Rudra verification before integration.

**Verification:** Temporary Akriti coverage, 2026-08-17.

---

## 5. Taxi

**Mode:** Taxi / motor cab

**Service status:** VERIFIED as a regulated transport mode.

**Public API / open-data status:** NO PUBLIC TRIP-PLANNING API VERIFIED for an in-scope provider.

**Verified evidence:**
Odisha transport documentation identifies Motor Cab/Luxury Cab as contract-carriage
vehicle classes and OPTICS exposes an Auto Rickshaw / Taxi information section.

**Sources:**
- https://odishatransport.gov.in/content/Permanent-Contract-Carriage/1
- https://opms.odishatransport.gov.in/sta/LiveBusBetweenLocation.aspx

**Best verified substitute for O-Travelz:** Current official fare/order information where
directly applicable; otherwise explicit unknown/estimate status.

**Data tier:** `static` only where a current, applicable source is verified; otherwise `unknown`.

**Live status:** NOT VERIFIED.

**Provider integration status:** Requires Rudra verification before integration.

**Verification:** Temporary Akriti coverage, 2026-08-17.

---

## 6. Train / intercity rail

**Mode:** Intercity rail

**Service status:** VERIFIED.

**Public API / open-data status:** NO SIMPLE PUBLIC DEVELOPER API VERIFIED FOR O-TRAVELZ.

**Verified evidence:**
Indian Railways Passenger Reservation Enquiry provides official train schedule and
train-between-stations enquiry services. The schedule interface exposes train/station
sequence, arrival/departure, halt, distance and operating-day information where available.

**Sources:**
- https://www.indianrail.gov.in/enquiry/SCHEDULE/TrainSchedule.html?locale=en2
- https://www.indianrail.gov.in/enquiry/TBIS/TrainBetweenImportantStations.jsp

**Best verified substitute for O-Travelz:** Official Indian Railways timetable and
passenger-enquiry services.

**Data tier:** `scheduled`.

**Live status:** NOT CLAIMED for O-Travelz. Official live passenger-enquiry capability
does not by itself establish a usable public developer API.

**Provider integration status:** Requires Rudra verification before integration.

**Verification:** Temporary Akriti coverage, 2026-08-17.

---

# Frozen summary

| Provider | Service verified | Public developer API verified | Static | Scheduled | Live | O-Travelz status |
|---|---|---|---|---|---|---|
| AMA Bus / Mo Bus | Yes | No | Yes | Yes | Not claimed | Verified for static/scheduled research |
| Mo E-Ride | Yes | No | Yes | Yes/estimate | No | Verified for static/scheduled research |
| Odisha Yatri | Yes | No public access verified | Unknown | Unknown | Not claimed | Platform/network verified; integration unverified |
| Auto / e-rickshaw | Yes | No | Conditional | Unknown | No | Mode verified; usable data not established |
| Taxi | Yes | No | Conditional | Unknown | No | Mode verified; usable data not established |
| Train | Yes | No simple public developer API verified | Yes | Yes | Not claimed | Scheduled research verified |

## Demo recommendation

The initial researched multimodal pair is:

1. **AMA Bus / Mo Bus**
2. **Mo E-Ride**

This is a research recommendation, not an implementation authorization. Rudra may consume
only the provider capabilities and data tiers explicitly supported by this record.

## Explicit non-claims

This frozen record does **not** claim:
- that a private/authenticated provider API does not exist;
- that a consumer app's live features are publicly programmable;
- that approximate headways are live data;
- that an area/location coordinate is an exact transport-stop coordinate;
- that any unverified fare, route, schedule, or API capability exists.

## Handoff boundaries

**To Smarak:** verified provider/data semantics for Phase 2 import.

**To Rudra:** provider verification and the capabilities/data tiers that may be considered
for later adapter work.

**Historical freeze note:** At the Phase 1 freeze, place/category completion, transport
topology coordinate verification, and data-shape validation were listed as remaining
work. Phase 2 evidence now covers the place data shape and the confirmed AMA Bus import;
coordinate and identity closure items remain open as explicitly tracked research facts.
This record itself remains frozen and must not be silently expanded.

**Freeze date:** 2026-08-17
