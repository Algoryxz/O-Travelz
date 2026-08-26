#!/usr/bin/env python3
"""
Phase 1.5 — Priority 1: Mo Bus Network Map Visual Extraction
=============================================================
Renders Mo Bus network map PDF at high resolution, crops regions,
and extracts route details from visual inspection.
"""
import json
import pymupdf
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
OFFICIAL_DIR = SCRIPT_DIR.parent / "official"
RAW_DIR = SCRIPT_DIR / "raw_text"
OUTPUT_DIR = SCRIPT_DIR

MOBUS_PDF = OFFICIAL_DIR / "Latest_MO_BUS_Full_Network_Final_English_2_For_Odia_and_English_compressed.pdf"

def render_and_crop():
    """Render Mo Bus pages at high DPI and crop key regions."""
    doc = pymupdf.open(str(MOBUS_PDF))

    # Page 2 has the English route details — render at 400 DPI
    page2 = doc[1]
    
    # Full page at 400 DPI
    pix = page2.get_pixmap(dpi=400)
    pix.save(str(RAW_DIR / "mobus_page2_400dpi.png"))
    print(f"Page 2 full: {pix.width}x{pix.height}")
    
    # Crop the route details section (left side, upper area)
    # Route details is roughly the left 40%, top 55% of the page
    w, h = pix.width, pix.height
    
    # Route details legend
    route_detail_clip = pymupdf.Rect(0, h * 0.12, w * 0.40, h * 0.60)
    pix_legend = page2.get_pixmap(dpi=500, clip=pymupdf.Rect(
        page2.rect.width * 0, page2.rect.height * 0.12,
        page2.rect.width * 0.40, page2.rect.height * 0.60
    ))
    pix_legend.save(str(RAW_DIR / "mobus_page2_route_legend_500dpi.png"))
    print(f"Route legend crop: {pix_legend.width}x{pix_legend.height}")
    
    # Map region - central Bhubaneswar (center of map)
    pix_bbsr = page2.get_pixmap(dpi=500, clip=pymupdf.Rect(
        page2.rect.width * 0.30, page2.rect.height * 0.40,
        page2.rect.width * 0.70, page2.rect.height * 0.70
    ))
    pix_bbsr.save(str(RAW_DIR / "mobus_page2_bbsr_center_500dpi.png"))
    print(f"BBSR center crop: {pix_bbsr.width}x{pix_bbsr.height}")
    
    # Map region - Cuttack area (upper right)
    pix_ctc = page2.get_pixmap(dpi=500, clip=pymupdf.Rect(
        page2.rect.width * 0.55, page2.rect.height * 0.08,
        page2.rect.width * 1.0, page2.rect.height * 0.45
    ))
    pix_ctc.save(str(RAW_DIR / "mobus_page2_cuttack_500dpi.png"))
    print(f"Cuttack crop: {pix_ctc.width}x{pix_ctc.height}")
    
    # Map region - Puri area (bottom right)
    pix_puri = page2.get_pixmap(dpi=500, clip=pymupdf.Rect(
        page2.rect.width * 0.60, page2.rect.height * 0.75,
        page2.rect.width * 1.0, page2.rect.height * 1.0
    ))
    pix_puri.save(str(RAW_DIR / "mobus_page2_puri_500dpi.png"))
    print(f"Puri crop: {pix_puri.width}x{pix_puri.height}")
    
    # Page 1 (Odia) - route legend
    page1 = doc[0]
    pix_odia_legend = page1.get_pixmap(dpi=500, clip=pymupdf.Rect(
        page1.rect.width * 0, page1.rect.height * 0.12,
        page1.rect.width * 0.40, page1.rect.height * 0.60
    ))
    pix_odia_legend.save(str(RAW_DIR / "mobus_page1_odia_legend_500dpi.png"))
    print(f"Odia legend crop: {pix_odia_legend.width}x{pix_odia_legend.height}")
    
    doc.close()
    print("All crops saved.")


if __name__ == "__main__":
    render_and_crop()
