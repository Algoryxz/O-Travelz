# O-Travelz transport static research files

Owner: Akriti — research/verification. Consumer: Smarak/Rudra after research acceptance.

## Canonical rule

Fixed-route topology must come from published route-stop evidence. If a field is not established,
use null/UNKNOWN rather than guessing.

## AMA Bus

`ama_bus.json` is currently a PARTIAL research artifact. Route 12 is retained as secondary evidence.
The canonical Capital Region topology must be rebuilt from the CRUT 16-Mar-2026 Detailed Stoppages PDF
before import as production topology.

`ama_bus_bqs_inventory_83.csv` is the official CRUT BQS baseline and is NOT the complete stop universe.

`ama_bus_stop_reconciliation.csv` is a reconciliation ledger awaiting the primary current route-stop source.

## Schedules

`*_schedule.json` must distinguish current scheduled information from historical/secondary schedules.
Do not reuse a historical timetable as current service.

## Fares

Fare files may contain verified minimums/pass rules without inventing an unsupported complete distance-band table.
