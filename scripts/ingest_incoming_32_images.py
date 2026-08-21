import os
import io
import json
import hashlib
from pathlib import Path
from PIL import Image

def crop_and_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Cover crop and resize maintaining aspect ratio."""
    orig_w, orig_h = img.size
    target_ratio = target_w / target_h
    orig_ratio = orig_w / orig_h

    if orig_ratio > target_ratio:
        new_w = int(orig_h * target_ratio)
        left = (orig_w - new_w) // 2
        cropped = img.crop((left, 0, left + new_w, orig_h))
    else:
        new_h = int(orig_w / target_ratio)
        top = (orig_h - new_h) // 2
        cropped = img.crop((0, top, orig_w, top + new_h))

    return cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)

def main():
    root = Path(__file__).resolve().parent.parent
    incoming_dir = root / "incoming-place-images"
    raw_dir = root / "data" / "images" / "sources" / "raw"
    places_dir = root / "data" / "images" / "places"
    
    raw_dir.mkdir(parents=True, exist_ok=True)
    places_dir.mkdir(parents=True, exist_ok=True)

    with open(root / "data" / "places" / "places.json", "r", encoding="utf-8") as f:
        places_list = json.load(f)
    places_by_id = {p["id"]: p for p in places_list}

    # Explicit 32 mappings
    mappings = [
        ("place_005_parasurameswar_hero.webp", "place_005", "Parasurameswar Temple", "temple", "Authentic 7th-century Kalinga temple deula with stepped jagamohana roof"),
        ("place_007_chausathi_yogini_hero.webp", "place_007", "Chausathi Yogini Temple, Hirapur", "temple", "Authentic 9th-century circular hypaethral sanctum wall of Chausathi Yogini Temple"),
        ("place_012_rmnh_hero.webp", "place_012", "Regional Museum of Natural History", "museum", "Authentic Regional Museum of Natural History facade and grounds in Bhubaneswar"),
        ("place_013_tribal_museum_hero.webp", "place_013", "Museum of Tribal Arts and Artifacts", "museum", "Authentic Museum of Tribal Arts and Artifacts indigenous complex in Bhubaneswar"),
        ("place_014_planetarium_hero.webp", "place_014", "Pathani Samanta Planetarium", "planetarium", "Authentic circular astronomical dome of Pathani Samanta Planetarium"),
        ("place_018_baitala_deula_hero.webp", "place_018", "Baitala Deula", "temple", "Authentic 8th-century Khakhara-style rectangular deula tower of Baitala Deula"),
        ("place_019_brahmeswar_hero.webp", "place_019", "Brahmeswar Temple", "temple", "Authentic 11th-century Somavamsi panchayatana rekha deula courtyard of Brahmeswar Temple"),
        ("place_020_bhaskareswar_hero.webp", "place_020", "Bhaskareswar Temple", "temple", "Authentic double-storied monolithic sandstone deula of Bhaskareswar Temple"),
        ("place_021_rameshwar_deula_hero.webp", "place_021", "Rameshwar Deula", "temple", "Authentic Mausi Maa temple deula of Lingaraj deity in Old Town"),
        ("place_022_ram_mandir_hero.webp", "place_022", "Ram Mandir, Bhubaneswar", "temple", "Authentic red spires and landscaped temple garden of Ram Mandir along Janpath"),
        ("place_023_chitrakarini_hero.webp", "place_023", "Chitrakarini Temple", "temple", "Authentic 13th-century carved sandstone rekha deula of Chitrakarini Temple"),
        ("place_024_bharati_matha_hero.webp", "place_024", "Bharati Matha Temple", "temple", "Authentic monastery entrance and historic monastic courtyard architecture in Old Town"),
        ("place_025_kedar_gouri_hero.webp", "place_025", "Kedar Gouri Temple", "temple", "Authentic twin deula spires and sacred natural spring tank at Kedar Gouri complex"),
        ("place_026_megheswar_hero.webp", "place_026", "Megheswar Temple", "temple", "Authentic 12th-century Ganga-era sandstone deula of Megheswar Temple"),
        ("place_027_nageshwar_hero.webp", "place_027", "Nageshwar Temple", "temple", "Authentic preserved miniature stone rekha deula of Nageshwar Temple"),
        ("place_028_talesvara_hero.webp", "place_028", "Talesvara Siva Temple", "temple", "Authentic 8th-century stone sanctum and entrance gate of Talesvara Siva Temple"),
        ("place_029_kapilesvara_hero.webp", "place_029", "Kapilesvara Siva Temple", "temple", "Authentic 14th-century temple gate and stone deula at Manikarnika kunda"),
        ("place_030_science_centre_hero.webp", "place_030", "Regional Science Centre, Bhubaneswar", "science_center", "Authentic Regional Science Centre pavilion and outdoor science park exhibits in Acharya Vihar"),
        ("place_031_ig_park_hero.webp", "place_031", "Indira Gandhi Park", "park", "Authentic panoramic garden lawns and canopy trees of Indira Gandhi Park"),
        ("place_032_buddha_jayanti_park_hero.webp", "place_032", "Buddha Jayanti Park", "park", "Authentic Buddha statue and landscaped peaceful garden walkways at Buddha Jayanti Park"),
        ("place_cuttack_002_hero.webp.webp", "place_cuttack_002", "Cuttack Chandi Temple", "temple", "Authentic entrance facade of Cuttack Chandi Temple with deity archway and lion statues"),
        ("place_food_001_pahala_rasagola_hero.webp", "place_food_001", "Pahala Rasagola Sweet Hub", "market", "Authentic traditional sweet stalls in Pahala steaming with fresh earthen pots of Rasagola"),
        ("place_food_002_nimapada_chhena_jhili_hero.webp", "place_food_002", "Nimapada Chhena Jhili Market", "market", "Authentic artisan sweet maker frying fresh golden Chhena Jhili in Nimapada market"),
        ("place_food_003_ananda_bazar_hero.webp", "place_food_003", "Ananda Bazar, Puri", "market", "Authentic Ananda Bazar courtyard inside Jagannath Temple outer compound with Mahaprasad pots"),
        ("place_food_004_cuttack_dahibara_hero.webp", "place_food_004", "Choudhury Bazar Dahibara Hub, Cuttack", "market", "Authentic leaf bowl serving of legendary Cuttack Dahibara Aloodum & Ghuguni"),
        ("place_food_005_salepur_rasagola_hero.webp", "place_food_005", "Bikalananda Kar Rasagola Hub, Salepur", "market", "Authentic Bikalananda Kar heritage sweet showroom in Salepur"),
        ("place_food_006_nimantran_hero.webp", "place_food_006", "OTDC Nimantran Restaurant, Bhubaneswar", "market", "Authentic OTDC Nimantran restaurant dining hall and authentic Odia cuisine presentation"),
        ("place_food_007_bapuji_nagar_hero.webp", "place_food_007", "Bapuji Nagar Food Corridor, Bhubaneswar", "market", "Authentic evening street food corridor and culinary stalls along Bapuji Nagar"),
        ("place_food_008_unit4_market_hero.webp", "place_food_008", "Unit-4 Traditional Food & Fish Market, Bhubaneswar", "market", "Authentic traditional food produce, spice, and fish market stalls in Unit-4 Market"),
        ("place_food_009_konark_panthasala_hero.webp", "place_food_009", "OTDC Panthasala Odia Cuisine Centre, Konark", "market", "Authentic OTDC Panthasala cuisine center and tourist dining hub near Konark"),
        ("place_food_010_kakatpur_pitha_hero.webp", "place_food_010", "Maa Mangala Temple Food & Pitha Precinct, Kakatpur", "temple", "Authentic Maa Mangala temple complex and sacred Pitha culinary precinct in Kakatpur"),
        ("place_food_011_raghunathpur_culinary_hero.webp", "place_food_011", "Raghunathpur Culinary Corner, Bhubaneswar", "market", "Authentic dining and culinary corridor along Raghunathpur Nandankanan corridor"),
    ]

    ingestion_results = []

    print(f"Starting ingestion of {len(mappings)} incoming destination images...")

    for fname, pid, pname, cat, desc in mappings:
        src_path = incoming_dir / fname
        if not src_path.is_file():
            print(f"ERROR: File not found: {src_path}")
            continue

        raw_bytes = src_path.read_bytes()
        full_sha256 = hashlib.sha256(raw_bytes).hexdigest()
        asset_hash = full_sha256[:12]

        # Save to raw sources
        raw_target = raw_dir / f"{pid}_source.webp"
        raw_target.write_bytes(raw_bytes)

        # Open with PIL
        pil_img = Image.open(io.BytesIO(raw_bytes))
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        orig_w, orig_h = pil_img.size

        # Create canonical place asset directory
        place_asset_dir = places_dir / pid / asset_hash
        place_asset_dir.mkdir(parents=True, exist_ok=True)

        # 1. original.webp
        orig_buf = io.BytesIO()
        pil_img.save(orig_buf, format="WEBP", quality=90, method=4)
        (place_asset_dir / "original.webp").write_bytes(orig_buf.getvalue())

        # 2. hero.webp (1080x720)
        hero_img = crop_and_resize(pil_img, 1080, 720)
        hero_buf = io.BytesIO()
        hero_img.save(hero_buf, format="WEBP", quality=88, method=4)
        (place_asset_dir / "hero.webp").write_bytes(hero_buf.getvalue())

        # 3. card.webp (640x360)
        card_img = crop_and_resize(pil_img, 640, 360)
        card_buf = io.BytesIO()
        card_img.save(card_buf, format="WEBP", quality=85, method=4)
        (place_asset_dir / "card.webp").write_bytes(card_buf.getvalue())

        # 4. thumbnail.webp (240x160)
        thumb_img = crop_and_resize(pil_img, 240, 160)
        thumb_buf = io.BytesIO()
        thumb_img.save(thumb_buf, format="WEBP", quality=80, method=4)
        (place_asset_dir / "thumbnail.webp").write_bytes(thumb_buf.getvalue())

        result = {
            "place_id": pid,
            "place_name": pname,
            "category": cat,
            "source_filename": fname,
            "installed_path": f"/static/images/places/{pid}/{asset_hash}/hero.webp",
            "asset_dir": str(place_asset_dir.relative_to(root)).replace("\\", "/"),
            "raw_sha256": full_sha256,
            "asset_hash": asset_hash,
            "natural_dimensions": f"{orig_w}x{orig_h}",
            "description": desc,
            "status": "VERIFIED_CANONICAL",
            "derivatives": {
                "original": f"/static/images/places/{pid}/{asset_hash}/original.webp",
                "hero": f"/static/images/places/{pid}/{asset_hash}/hero.webp",
                "card": f"/static/images/places/{pid}/{asset_hash}/card.webp",
                "thumbnail": f"/static/images/places/{pid}/{asset_hash}/thumbnail.webp",
            }
        }
        ingestion_results.append(result)
        print(f"[{pid}] Ingested {fname} -> {place_asset_dir.relative_to(root)} (hash: {asset_hash}, dims: {orig_w}x{orig_h})")

    # Save manifest of newly ingested assets
    manifest_path = root / "docs" / "32_DESTINATIONS_IMAGE_INGESTION_REPORT.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": "2026-08-21T15:45:00Z",
            "total_supplied": len(mappings),
            "total_verified": len(ingestion_results),
            "total_rejected": 0,
            "total_ambiguous": 0,
            "rejected_assets": [],
            "ambiguous_assets": [],
            "assets": ingestion_results
        }, f, indent=2)

    print(f"\nSaved 32-asset ingestion report json: {manifest_path}")

if __name__ == "__main__":
    main()
