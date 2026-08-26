"""
O-Travelz Automated Image Registration Script
Reads data/images/manual/manifest.json and registers verified images into frontend/src/utils/imageRegistry.ts
and copies served assets to frontend/public/images/manual/.
"""

import os
import shutil
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANUAL_DIR = REPO_ROOT / "data" / "images" / "manual"
MANIFEST_FILE = MANUAL_DIR / "manifest.json"
FRONTEND_PUBLIC_DIR = REPO_ROOT / "frontend" / "public" / "images" / "manual"
REGISTRY_TS_FILE = REPO_ROOT / "frontend" / "src" / "utils" / "imageRegistry.ts"

SIGNATURE_HUB_OVERRIDES = [
    ('hero_odisha_cinematic', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqOOikBJZ-5aej8Mblj0xhbGmiY5GW8Kj_DZfPgIWPyUvZ5vc_sVEWY7JWPXCXQFb-2br6r-8CWlxMzqLYIwHeuqC4S-BO4olt2McZxM0XMwm60bFF5jTHCJ9RzglXhmXsGtAeSglMXMTLvTeF6ylfKJbb15-N2Q_MhYfOTwaeSmGiir3D4rZv5iaAKQdKSvnn6b27mSb6nL5tXkFAD46fn4NVUcipQQcUR9MuzEOiMzaGlkR4n4fVqdjyPmY_H0PQ4XiMl9yCMb0', 'Hero Editorial Photo & Konark Sun Temple'),
    ('place_puri_001', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX9t5xDnxhIlK3OKNGhyuOS73-1dAaksAFQQG_pMNb3CeRJYrdIV52fSNjxCwpm5iWiVwMIOTQXgUtjezNwOEj-IS3ysi7TasX98BsKC3cBLZBa26cpCBbXhLn0mVFSKHaMjWGTA2cbE7ZJftd49rZYbyWgJllFl6Nf7-rTyfDWLBxdBSGqarYv0Ay8lJ_SUK8OthnJ8c2zJWsx_-ehHOJhObOwcEPlaj9AJMvLx_WHzbsY38-o3lG-mgsq7UIn-1EXddvACeNm0Q', 'Jagannath Temple Puri Golden Beach'),
    ('place_konark_001', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqOOikBJZ-5aej8Mblj0xhbGmiY5GW8Kj_DZfPgIWPyUvZ5vc_sVEWY7JWPXCXQFb-2br6r-8CWlxMzqLYIwHeuqC4S-BO4olt2McZxM0XMwm60bFF5jTHCJ9RzglXhmXsGtAeSglMXMTLvTeF6ylfKJbb15-N2Q_MhYfOTwaeSmGiir3D4rZv5iaAKQdKSvnn6b27mSb6nL5tXkFAD46fn4NVUcipQQcUR9MuzEOiMzaGlkR4n4fVqdjyPmY_H0PQ4XiMl9yCMb0', 'Konark Sun Temple Sanctuary'),
    ('place_bbsr_001', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe49mA0mm7Qpx5MT7y5Djc1elkDXFDsaNpmLpJ4PY6IgMjNj2zKrp8HaiUzLv0qaau1kssmLlGV_cMihm9Fe4_1yjjN3xBmz3ce-Qm4SC_oKAN8QUDWJ3fx_gXOc2oKzW-dxlJyIROyw2USQwWfx4-YboARQzxLieWAoRy__qL4Jnz968ztd8rV3fItXe9pUNk9oKT35gvx_wASv-SpZRJGWv-AEwHOUuaT67zAwPFqjxh8ed6Ckh-2jw7eySKtp1okPgYLyc5Kms', 'Lingaraj Temple Bhubaneswar Heritage Precinct'),
    ('place_chilika_001', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBncciVZ_jB169hv_MKF44YxFY_wzB-0nEJAi6vrAnpeouErvxxKFxom7VZ-7VH9-vNrDKxN8ByHJmV0fSwpDCvfWJimHI98mDrHhdQnuSK-QwL88IBCAMCSVoaVGRLgl5O7mtGsbvpmBuHP6F7yMkUsDNRu85F9aKH8KliiglC5e8ZyAzkBtt2vd3fxyF1_cC1PJSxaPskidx5Q5U3hRBdUeDZoLNEobb-CVjWhJsGiP4yU1xS39ATAVvK4PfVW7q626KW5dHZYu0', 'Chilika Marine Lagoon'),
    ('exp_ekamra_haat', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80', 'Ekamra Haat Traditional Craft Hub'),
    ('Boyanika Sambalpuri Handloom Emporium', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80', 'Boyanika Sambalpuri Handloom Emporium'),
]

PHASE3_WIKIMEDIA_OVERRIDES = [
    ("place_med_006", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/M5-Sec-19-Ispat-general-Hospital-1.jpg/960px-M5-Sec-19-Ispat-general-Hospital-1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", "Ispat General Hospital (IGH) (Sundargarh, hospital)"),
    ("place_med_003", "https://upload.wikimedia.org/wikipedia/commons/7/7f/MKCG_Medical_college_Berhampur.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", "MKCG Medical College & Hospital (Ganjam, hospital)"),
    ("place_med_002", "https://upload.wikimedia.org/wikipedia/commons/5/53/Platinum_jubilee_gate_of_scb_medical_2021.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", "SCB Medical College & Hospital (Cuttack, hospital)"),
    ("place_angul_003", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Rengali_reservoir_Orrisa.jpg/960px-Rengali_reservoir_Orrisa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", "Rengali Dam & Reservoir (Angul, lake)"),
    ("place_dhenkanal_002", "https://upload.wikimedia.org/wikipedia/commons/d/d7/Mahima_Gadi%2C_Joranda%2C_Dhenkanal._Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Joranda Gadi (Mahima Dharma Seat) (Dhenkanal, monument)"),
    ("place_subarnapur_002", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Ratha_Jatra_at_Patali_Srikhetra%2C_Kotsamalae%2C_Sonepur%2C_Odisha.jpg/960px-Ratha_Jatra_at_Patali_Srikhetra%2C_Kotsamalae%2C_Sonepur%2C_Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", "Patali Srikhetra (Kotsamalai) (Subarnapur, monument)"),
    ("place_jajpur_002", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ratnagiri_-_Odisha_-_001.jpg/960px-Ratnagiri_-_Odisha_-_001.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", "Ratnagiri Buddhist Monastery (Jajpur, monument)"),
    ("place_balangir_003", "https://upload.wikimedia.org/wikipedia/commons/0/0c/Balangir_palace.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Sailashree Palace (Balangir, monument)"),
    ("place_jajpur_003", "https://upload.wikimedia.org/wikipedia/commons/7/78/Udayagiri_Buddhist_Complex_10.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Udayagiri Buddhist Complex (Jajpur, monument)"),
    ("place_keonjhar_004", "https://upload.wikimedia.org/wikipedia/commons/f/f0/Gonasika_Guptaganga_Temple%2C_Gonasika_-_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", "Gonasika (Baitarani Source) (Keonjhar, nature)"),
    ("place_mayurbhanj_003", "https://upload.wikimedia.org/wikipedia/commons/2/22/Intricate_carvings_on_exterior_of_the_Kichakeswari_temple%2C_Khiching%2C_Mayurbhanj%2C_Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Khiching Kichakeswari Temple (Mayurbhanj, temple)"),
    ("place_sambalpur_005", "https://upload.wikimedia.org/wikipedia/commons/b/b1/Ghanteswari_Temple_%2813%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Maa Ghanteswari Temple (Chiplima) (Sambalpur, temple)"),
    ("place_kalahandi_003", "https://upload.wikimedia.org/wikipedia/commons/9/9d/Maa_Manikeswari_Temple%2C_Bhawanipatna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", "Maa Manikeswari Temple (Bhawanipatna) (Kalahandi, temple)"),
    ("place_subarnapur_003", "https://upload.wikimedia.org/wikipedia/commons/8/88/Subarnameru_Sonepur_Subarnapur_district_Odisha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Subarnameru Temple (Subarnapur, temple)"),
    ("place_transit_012", "https://upload.wikimedia.org/wikipedia/commons/8/8b/360%C2%B0_photo_sphere_of_Badambadi_bus_stand%2C_Cuttack%2C_Odisha.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Badambadi Bus Stand (Cuttack) (Cuttack, transit_hub)"),
    ("place_transit_010", "https://upload.wikimedia.org/wikipedia/commons/b/b1/Balasore_railway_station_in_Baleshwar%2C_Odisha_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Balasore Railway Station (BLS) (Balasore, transit_hub)"),
    ("place_transit_007", "https://upload.wikimedia.org/wikipedia/commons/5/5b/Berhampur_railway_station_in_Ganjam_district%2C_Odisha_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Berhampur Railway Station (BAM) (Ganjam, transit_hub)"),
    ("place_transit_005", "https://upload.wikimedia.org/wikipedia/commons/3/32/Cuttack_Railway_Station.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Cuttack Junction Railway Station (CTC) (Cuttack, transit_hub)"),
    ("place_transit_003", "https://upload.wikimedia.org/wikipedia/commons/0/02/ATC_Tower_Rourkela.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Rourkela Airport (RRK) (Sundargarh, transit_hub)"),
    ("place_transit_009", "https://upload.wikimedia.org/wikipedia/commons/f/fc/Rourkela_Railway_Station.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", "Rourkela Junction Railway Station (ROU) (Sundargarh, transit_hub)"),
    ("place_transit_002", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Jharsuguda_Airport.png/960px-Jharsuguda_Airport.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail", "Veer Surendra Sai Airport Jharsuguda (JRG) (Jharsuguda, transit_hub)"),
    ("place_keonjhar_002", "https://upload.wikimedia.org/wikipedia/commons/5/55/Badaghagara_Kendujhar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled", "Badaghagara Waterfall (Keonjhar, waterfall)"),
    ("place_gajapati_003", "https://upload.wikimedia.org/wikipedia/commons/5/5a/Elephant_faced_waterfall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Gandahati Waterfall (Gajapati, waterfall)"),
    ("place_keonjhar_003", "https://upload.wikimedia.org/wikipedia/commons/b/b6/At_the_site_of_khandadhar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Khandadhar Waterfall (Keonjhar) (Keonjhar, waterfall)"),
    ("place_jharsuguda_001", "https://upload.wikimedia.org/wikipedia/commons/d/da/Koilighugar_waterfall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Koilighugar Waterfall (Jharsuguda, waterfall)"),
    ("place_kalahandi_001", "https://upload.wikimedia.org/wikipedia/commons/d/d4/Phurlijharan.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Phurlijharan Waterfall (Kalahandi, waterfall)"),
    ("place_keonjhar_001", "https://upload.wikimedia.org/wikipedia/commons/e/e9/PXL_20250608_043103853.MP_Sanaghagara_Waterfall_%2C_Keonjhar%2C_Odisha_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", "Sanaghagara Waterfall (Keonjhar, waterfall)"),
]

def register_images():
    print("=" * 65)
    print("O-TRAVELZ AUTOMATED FRONTEND IMAGE REGISTRATION")
    print("=" * 65)

    if not MANIFEST_FILE.exists():
        print(f"[ERROR] Manifest file does not exist: {MANIFEST_FILE}")
        return False

    manifest_data = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    images = manifest_data.get("images", [])
    print(f"Loaded {len(images)} verified images from manifest.")

    FRONTEND_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    copied_count = 0
    for img in images:
        src_file = MANUAL_DIR / img["filename"]
        dst_file = FRONTEND_PUBLIC_DIR / img["filename"]
        if src_file.exists():
            shutil.copy2(src_file, dst_file)
            copied_count += 1

    print(f"Copied {copied_count} verified images to {FRONTEND_PUBLIC_DIR.relative_to(REPO_ROOT)}")

    # Construct the complete, clean PLACE_IMAGE_OVERRIDES dictionary
    lines = []
    lines.append("export const PLACE_IMAGE_OVERRIDES: Record<string, string> = {")
    
    # 1. Signature Hubs
    lines.append("  // 1. Signature Hubs & Curated Experiences")
    for key, url, comment in SIGNATURE_HUB_OVERRIDES:
        lines.append(f'  "{key}": "{url}", // {comment}')

    # 2. Phase 4 Ingested Manual Collection
    lines.append("\n  // 2. Phase 4 Ingested Authentic Manual Assets (Local Static Serving)")
    registered_rids = {k for k, _, _ in SIGNATURE_HUB_OVERRIDES}
    for img in images:
        rid = img["research_id"]
        if rid in registered_rids:
            continue
        registered_rids.add(rid)
        fname = img["filename"]
        pname = img.get("place_name", "")
        dist = img.get("district", "")
        cat = img.get("category", "")
        comment = f"// {pname} ({dist}, {cat})" if pname else ""
        lines.append(f'  "{rid}": "/images/manual/{fname}", {comment}')

    # 3. Phase 3 Wikimedia Verified Assets
    lines.append("\n  // 3. Phase 3 Recovered Authentic Destinations (Wikimedia Commons Verified)")
    for key, url, comment in PHASE3_WIKIMEDIA_OVERRIDES:
        if key not in registered_rids:
            lines.append(f'  "{key}": "{url}", // {comment}')
            registered_rids.add(key)

    lines.append("};\n")
    new_dict_str = "\n".join(lines)

    # Replace PLACE_IMAGE_OVERRIDES in imageRegistry.ts
    current_ts = REGISTRY_TS_FILE.read_text(encoding="utf-8")
    
    # Find start and end of PLACE_IMAGE_OVERRIDES
    dict_start = current_ts.find("export const PLACE_IMAGE_OVERRIDES: Record<string, string> = {")
    if dict_start == -1:
        print("[ERROR] Could not find PLACE_IMAGE_OVERRIDES declaration.")
        return False

    # Find the closing semicolon of the dict
    dict_end = current_ts.find("export const MANUAL_IMAGE_OVERRIDES = PLACE_IMAGE_OVERRIDES;")
    if dict_end == -1:
        print("[ERROR] Could not find MANUAL_IMAGE_OVERRIDES assignment.")
        return False

    updated_ts = current_ts[:dict_start] + new_dict_str + "\n" + current_ts[dict_end:]
    REGISTRY_TS_FILE.write_text(updated_ts, encoding="utf-8")
    print(f"Successfully generated clean imageRegistry.ts with {len(registered_rids)} total overrides.")
    return True

if __name__ == "__main__":
    register_images()
