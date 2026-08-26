#!/usr/bin/env python3
"""
CLI script to import validated official Odisha transit data into the local/dev database.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal
from app.transport.importer import OfficialTransitImporter


def main():
    print("=" * 60)
    print("O-TRAVELZ Official Transit Import (Phase 2)")
    print("=" * 60)

    db = SessionLocal()
    try:
        importer = OfficialTransitImporter(db)
        summary = importer.run_import()

        print("\nImport Summary:")
        print(f"  Providers upserted:       {summary.providers_upserted}")
        print(f"  Routes upserted:          {summary.routes_upserted}")
        print(f"  Stops upserted:           {summary.stops_upserted}")
        print(f"  Route-Stop links upserted:{summary.route_stops_upserted}")
        print(f"  Schedules upserted:       {summary.schedules_upserted}")
        print(f"  Total departures:         {summary.total_trips_imported}")
        print(f"  Geocoded coordinates:     {summary.geocoded_coords_count}")
        print(f"  Unresolved coordinates:   {summary.unresolved_coords_count}")
        print("\nDatabase transaction successfully committed.")
    except Exception as e:
        db.rollback()
        print(f"\nERROR: Import failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
