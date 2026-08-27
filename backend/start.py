"""Production entrypoint running Alembic migrations and idempotent canonical data verification before starting Uvicorn."""
import os
import sys
import subprocess
from pathlib import Path

# Ensure backend and workspace root are in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
WORKSPACE_ROOT = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(WORKSPACE_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_ROOT))


def run_migrations() -> None:
    print("[STARTUP] Running database migrations (alembic upgrade head)...", flush=True)
    alembic_ini = str(BACKEND_DIR / "alembic.ini")
    res = subprocess.run(
        [sys.executable, "-m", "alembic", "-c", alembic_ini, "upgrade", "head"],
        cwd=str(BACKEND_DIR),
        check=False,
    )
    if res.returncode != 0:
        print(
            f"[STARTUP ERROR] Database migration failed with exit code {res.returncode}. Aborting startup.",
            file=sys.stderr,
            flush=True,
        )
        sys.exit(res.returncode)
    print("[STARTUP] Database migrations successfully applied to head.", flush=True)


def seed_database_if_empty() -> None:
    """Idempotently and transactionally seed the database with verified canonical data if empty."""
    try:
        from app.db.session import SessionLocal
        from app.models.place import Place
        from app.models.category import Category

        db = SessionLocal()
        try:
            place_count = db.query(Place).count()
            cat_count = db.query(Category).count()

            if place_count == 0 or cat_count == 0:
                print(
                    f"[STARTUP] Database is empty (places={place_count}, categories={cat_count}). "
                    f"Beginning non-destructive canonical dataset load...",
                    flush=True,
                )
                from scripts.import_places import (
                    load_categories,
                    load_interests,
                    load_places,
                    import_records,
                )

                cats = load_categories()
                ints = load_interests()
                pls = load_places()

                result = import_records(db, cats, pls, interests=ints)
                db.commit()
                print(
                    f"[STARTUP] Canonical data seed completed: "
                    f"{result.categories_created} categories, "
                    f"{result.places_created} places, "
                    f"{result.interests_created} interests created.",
                    flush=True,
                )
            # Check if food categories are present
            food_cat_count = db.query(Category).filter(Category.name.in_(["restaurant", "street_food_market", "heritage_sweet_stall"])).count()
            if food_cat_count == 0:
                print("[STARTUP] Food categories not detected. Running idempotent food research load...", flush=True)
                try:
                    from scripts.import_food_research import import_food_research
                    import_food_research()
                except Exception as food_exc:
                    print(f"[STARTUP WARNING] Food research import note: {food_exc}", flush=True)

            # Check if transit routes and stops are present
            from app.models.transport import Route
            route_count = db.query(Route).count()
            if route_count == 0:
                print("[STARTUP] Transit routes not detected. Running official transit dataset import...", flush=True)
                try:
                    from app.transport.importer import OfficialTransitImporter
                    transit_importer = OfficialTransitImporter(db)
                    transit_summary = transit_importer.run_import()
                    print(
                        f"[STARTUP] Transit network import complete: "
                        f"{transit_summary.routes_upserted} routes, "
                        f"{transit_summary.stops_upserted} stops.",
                        flush=True,
                    )
                except Exception as transit_exc:
                    print(f"[STARTUP WARNING] Transit import note: {transit_exc}", flush=True)

                try:
                    from app.transport.research_importer import TransitIntelligenceImporter
                    intel_importer = TransitIntelligenceImporter(db)
                    intel_report = intel_importer.import_all()
                    print(
                        f"[STARTUP] Transit intelligence import complete: "
                        f"{intel_report.routes_count} routes, "
                        f"{intel_report.corridors_count} corridors.",
                        flush=True,
                    )
                except Exception as intel_exc:
                    print(f"[STARTUP WARNING] Transit intelligence import note: {intel_exc}", flush=True)

            # Check if place images are mapped
            from app.models.place_image import PlaceImage
            img_count = db.query(PlaceImage).count()
            if img_count == 0:
                manifest_path = WORKSPACE_ROOT / "data" / "images" / "sources" / "manifest.json"
                if manifest_path.exists():
                    import json
                    try:
                        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
                        synced = 0
                        for m in manifest:
                            pid = m.get("place_id")
                            place = db.query(Place).filter(Place.research_id == pid).first()
                            if not place and m.get("place_name"):
                                place = db.query(Place).filter(Place.name.ilike(m["place_name"].strip())).first()
                            if place:
                                img = PlaceImage(
                                    place_id=place.id,
                                    storage_key=f"{pid}/{m['asset_hash']}",
                                    url=f"/static/images/places/{pid}/{m['asset_hash']}/hero.webp",
                                    card_url=f"/static/images/places/{pid}/{m['asset_hash']}/card.webp",
                                    thumbnail_url=f"/static/images/places/{pid}/{m['asset_hash']}/thumbnail.webp",
                                    content_sha256=m.get("content_sha256", ""),
                                    source_name=m.get("source_name", "Curated"),
                                    source_url=m.get("source_url", ""),
                                    creator=m.get("creator", ""),
                                    license=m.get("license", ""),
                                    attribution=m.get("attribution", ""),
                                    title=m.get("title", ""),
                                    alt_text=m.get("alt_text", ""),
                                    is_primary=True,
                                )
                                db.add(img)
                                synced += 1
                        db.commit()
                        print(f"[STARTUP] Place images synced: {synced} records.", flush=True)
                    except Exception as img_exc:
                        print(f"[STARTUP WARNING] PlaceImage sync note: {img_exc}", flush=True)

            print(
                f"[STARTUP] Database verified: {place_count} places, {cat_count} categories, {route_count} routes. "
                f"Seed verification complete.",
                flush=True,
            )
        except Exception as exc:
            db.rollback()
            print(
                f"[STARTUP WARNING] Database verification/seed check encountered an issue: {exc}",
                file=sys.stderr,
                flush=True,
            )
        finally:
            db.close()
    except Exception as exc:
        print(
            f"[STARTUP WARNING] Could not initialize database session for seed check: {exc}",
            file=sys.stderr,
            flush=True,
        )


def start_server() -> None:
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    print(f"[STARTUP] Starting Uvicorn server on {host}:{port}...", flush=True)
    import uvicorn

    uvicorn.run("app.main:app", host=host, port=port)


if __name__ == "__main__":
    run_migrations()
    seed_database_if_empty()
    start_server()
