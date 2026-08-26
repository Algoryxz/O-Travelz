import json
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.db.base import Base, Place, PlaceImage

manifest_path = Path(__file__).resolve().parent.parent / "data" / "images" / "sources" / "manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

db = SessionLocal()
count = 0
for m in manifest:
    pid = m["place_id"]
    place = db.query(Place).filter(Place.research_id == pid).first()
    if not place:
        place = db.query(Place).filter(Place.name.ilike(m["place_name"].strip())).first()
    if place:
        img = db.query(PlaceImage).filter(PlaceImage.place_id == place.id).first()
        if not img:
            img = PlaceImage(place_id=place.id)
            db.add(img)
        img.storage_key = f"{pid}/{m['asset_hash']}"
        img.url = f"/static/images/places/{pid}/{m['asset_hash']}/hero.webp"
        img.card_url = f"/static/images/places/{pid}/{m['asset_hash']}/card.webp"
        img.thumbnail_url = f"/static/images/places/{pid}/{m['asset_hash']}/thumbnail.webp"
        img.content_sha256 = m["content_sha256"]
        img.source_name = m["source_name"]
        img.source_url = m["source_url"]
        img.creator = m["creator"]
        img.license = m["license"]
        img.attribution = m["attribution"]
        img.title = m["title"]
        img.alt_text = m["alt_text"]
        img.is_primary = True
        count += 1
db.commit()
db.close()
print(f"Synchronized {count} database PlaceImage records!")
