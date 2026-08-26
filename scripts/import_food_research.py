"""
Idempotent Seeding Script for Verified Odisha Food Research Dataset.

Imports VERIFIED_PLACE records from data/research/food/odisha_food_research.json
into the database `places` table, ensuring:
- Single canonical Place identity
- Additive food metadata (cuisine, dietary_tags, speciality_dishes, highway_corridor, food_category)
- Zero duplicate records
- Zero overwriting of stronger coordinates with nulls
- Category and Interest association preservation
"""
import json
import logging
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from geoalchemy2 import WKTElement
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.interest import Interest, PlaceInterest
from app.models.place import Place

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RESEARCH_JSON_PATH = BASE_DIR / "data" / "research" / "food" / "odisha_food_research.json"

CATEGORY_DEFINITIONS = {
    "heritage_sweet_stall": "Heritage Sweet Stall & Confectionery",
    "street_food_market": "Street Food Market & Tiffin Hub",
    "restaurant": "Traditional & Regional Restaurant",
    "traditional_temple_food": "Traditional Temple Food & Prasadam Precinct",
    "highway_stop": "Highway Stop & Travel Corridor Kitchen",
    "regional_speciality": "Regional Culinary Speciality & Artisan Producer",
    "local_food_experience": "Local Food & Fresh Coastal Catch Experience",
}


def ensure_categories_and_interests(db: Session) -> tuple[dict[str, uuid.UUID], uuid.UUID]:
    """Ensure all required food categories and interests exist."""
    category_map: dict[str, uuid.UUID] = {}
    for cat_name, display_name in CATEGORY_DEFINITIONS.items():
        cat = db.query(Category).filter(Category.name == cat_name).first()
        if not cat:
            cat = Category(
                id=uuid.uuid4(),
                name=cat_name,
                display_name=display_name,
                description=f"Curated {display_name} in Odisha",
            )
            db.add(cat)
            db.flush()
            logger.info(f"Created category: {cat_name}")
        category_map[cat_name] = cat.id

    # Ensure "food" interest
    food_interest = db.query(Interest).filter(Interest.name == "food").first()
    if not food_interest:
        food_interest = Interest(
            id=uuid.uuid4(),
            name="food",
            display_name="Culinary & Heritage Food",
            description="Authentic Odia cuisine, temple sweets, street food, and fresh coastal seafood.",
        )
        db.add(food_interest)
        db.flush()
        logger.info("Created food interest")

    return category_map, food_interest.id


def import_food_research(dry_run: bool = False) -> dict[str, int]:
    """Import verified food places idempotently."""
    if not RESEARCH_JSON_PATH.exists():
        raise FileNotFoundError(f"Research JSON not found at: {RESEARCH_JSON_PATH}")

    with open(RESEARCH_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    records = data.get("records", [])
    logger.info(f"Loaded {len(records)} food records from research dataset")

    stats = {
        "total_records": len(records),
        "verified_places_processed": 0,
        "inserted": 0,
        "updated": 0,
        "skipped_non_verified": 0,
        "geocoded": 0,
        "unresolved_coords": 0,
    }

    db: Session = SessionLocal()
    try:
        category_map, food_interest_id = ensure_categories_and_interests(db)

        for rec in records:
            rec_type = rec.get("record_type")
            if rec_type != "VERIFIED_PLACE":
                stats["skipped_non_verified"] += 1
                continue

            stats["verified_places_processed"] += 1
            research_id = rec.get("research_id")
            name = rec.get("name")
            cat_name = rec.get("food_category", "restaurant")
            category_id = category_map.get(cat_name, list(category_map.values())[0])

            lat = rec.get("latitude")
            lon = rec.get("longitude")
            coord_status = rec.get("coordinate_status", "unresolved")

            location_wkt = None
            if lat is not None and lon is not None:
                location_wkt = WKTElement(f"POINT({lon} {lat})", srid=4326)
                stats["geocoded"] += 1
            else:
                stats["unresolved_coords"] += 1

            existing = db.query(Place).filter(Place.research_id == research_id).first()

            verified_at = None
            if rec.get("verified_at"):
                try:
                    verified_at = datetime.strptime(rec["verified_at"], "%Y-%m-%d")
                except ValueError:
                    verified_at = None

            if existing:
                # Update existing record additively
                existing.name = name
                existing.category_id = category_id
                if location_wkt is not None:
                    existing.location = location_wkt
                existing.district = rec.get("district")
                existing.address = rec.get("address")
                existing.cuisine = rec.get("cuisine")
                existing.dietary_tags = rec.get("dietary_tags")
                existing.speciality_dishes = rec.get("speciality_dishes")
                existing.highway_corridor = rec.get("highway_corridor")
                existing.food_category = rec.get("food_category")
                existing.rating = rec.get("rating")
                existing.rating_count = rec.get("rating_count")
                existing.rating_source = rec.get("rating_source")
                existing.opening_hours = rec.get("opening_hours")
                existing.price_tier = rec.get("price_tier")
                existing.source = rec.get("source", "Odisha Food Research")
                existing.source_url = rec.get("source_url")
                existing.verified_at = verified_at
                existing.verification_status = "VERIFIED"
                existing.source_provenance_note = rec.get("notes")
                existing.coordinate_verification = coord_status
                stats["updated"] += 1
                logger.info(f"Updated verified food place: {research_id} ({name})")
            else:
                # Insert new Place record
                new_place = Place(
                    id=uuid.uuid4(),
                    research_id=research_id,
                    name=name,
                    category_id=category_id,
                    location=location_wkt,
                    district=rec.get("district"),
                    address=rec.get("address"),
                    cuisine=rec.get("cuisine"),
                    dietary_tags=rec.get("dietary_tags"),
                    speciality_dishes=rec.get("speciality_dishes"),
                    highway_corridor=rec.get("highway_corridor"),
                    food_category=rec.get("food_category"),
                    rating=rec.get("rating"),
                    rating_count=rec.get("rating_count"),
                    rating_source=rec.get("rating_source"),
                    opening_hours=rec.get("opening_hours"),
                    price_tier=rec.get("price_tier"),
                    source=rec.get("source", "Odisha Food Research"),
                    source_url=rec.get("source_url"),
                    verified_at=verified_at,
                    verification_status="VERIFIED",
                    source_provenance_note=rec.get("notes"),
                    coordinate_verification=coord_status,
                )
                db.add(new_place)
                db.flush()

                # Associate with "food" interest
                pi = PlaceInterest(
                    id=uuid.uuid4(),
                    place_id=new_place.id,
                    interest_id=food_interest_id,
                )
                db.add(pi)
                stats["inserted"] += 1
                logger.info(f"Inserted verified food place: {research_id} ({name})")

        if not dry_run:
            db.commit()
            logger.info("Database transaction committed successfully.")
        else:
            db.rollback()
            logger.info("Dry run complete; changes rolled back.")

    except Exception as exc:
        db.rollback()
        logger.error(f"Error during food research import: {exc}", exc_info=True)
        raise
    finally:
        db.close()

    return stats


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    res = import_food_research(dry_run=dry)
    print("\n============================================================")
    print("FOOD RESEARCH IMPORT SUMMARY")
    print("============================================================")
    for k, v in res.items():
        print(f"  {k}: {v}")
    print("============================================================\n")
