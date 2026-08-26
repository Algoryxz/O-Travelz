#!/usr/bin/env python3
"""
O-TRAVELZ Transit Data Ingestion — Phase 1 & 2
================================================
Phase 1: Inventory every PDF in data/research/transit/official/
Phase 2: Determine PDF type (text vs image-based), extract raw text

Outputs:
  - transit_document_inventory.json
  - raw_text/<filename>.txt  (raw extracted text per PDF)
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

# PDF libraries
import pdfplumber
import pymupdf  # PyMuPDF

# ─── Paths ───────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
OFFICIAL_DIR = SCRIPT_DIR.parent / "official"
OUTPUT_DIR = SCRIPT_DIR
RAW_TEXT_DIR = OUTPUT_DIR / "raw_text"
RAW_TEXT_DIR.mkdir(parents=True, exist_ok=True)

INVENTORY_FILE = OUTPUT_DIR / "transit_document_inventory.json"


def get_file_size_mb(path: Path) -> float:
    return round(path.stat().st_size / (1024 * 1024), 2)


def extract_text_pdfplumber(pdf_path: Path) -> tuple[str, list[dict]]:
    """Extract text using pdfplumber (better for tables)."""
    full_text = ""
    page_details = []
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                tables = page.extract_tables() or []
                chars = page.chars or []
                page_details.append({
                    "page_number": i + 1,
                    "width": float(page.width),
                    "height": float(page.height),
                    "text_length": len(text),
                    "has_text": len(text.strip()) > 0,
                    "char_count": len(chars),
                    "table_count": len(tables),
                    "tables": tables,
                })
                full_text += f"\n\n--- PAGE {i+1} ---\n\n{text}"
    except Exception as e:
        full_text = f"[ERROR extracting with pdfplumber: {e}]"
    return full_text, page_details


def extract_text_pymupdf(pdf_path: Path) -> tuple[str, int, list[dict]]:
    """Extract text using PyMuPDF (better for general text extraction)."""
    full_text = ""
    page_count = 0
    page_details = []
    try:
        doc = pymupdf.open(str(pdf_path))
        page_count = len(doc)
        for i, page in enumerate(doc):
            text = page.get_text("text") or ""
            images = page.get_images(full=True)
            page_details.append({
                "page_number": i + 1,
                "width": round(page.rect.width, 1),
                "height": round(page.rect.height, 1),
                "text_length": len(text),
                "has_text": len(text.strip()) > 0,
                "image_count": len(images),
            })
            full_text += f"\n\n--- PAGE {i+1} ---\n\n{text}"
        doc.close()
    except Exception as e:
        full_text = f"[ERROR extracting with PyMuPDF: {e}]"
    return full_text, page_count, page_details


def classify_document(filename: str, full_text: str, page_details: list) -> dict:
    """
    Classify the document based on filename and extracted text content.
    Returns operator, geographic coverage, document type, etc.
    """
    fn_lower = filename.lower()
    text_lower = full_text.lower()

    # ─── Operator detection ─────────────────────────────────────
    operator = "unknown"
    network_type = "unknown"

    if "mo bus" in text_lower or "mo_bus" in fn_lower or "mo bus" in fn_lower:
        operator = "CRUT"
        network_type = "Mo Bus"
    if "ama bus" in text_lower or "ama_bus" in fn_lower or "ama bus" in fn_lower or "ama-bus" in fn_lower:
        operator = "CRUT"
        network_type = "AMA Bus"
    if "crut" in text_lower:
        operator = "CRUT"
    if "ama e-ride" in text_lower or "e-ride" in text_lower:
        operator = "CRUT"
        network_type = "AMA E-Ride"
    if "capital region" in text_lower:
        if network_type == "unknown":
            network_type = "Capital Region Transit"

    # ─── Geographic coverage ────────────────────────────────────
    cities = []
    districts = []
    city_patterns = {
        "Bhubaneswar": ["bhubaneswar", "bbsr"],
        "Cuttack": ["cuttack", "ctc"],
        "Puri": ["puri"],
        "Rourkela": ["rourkela", "rkl"],
        "Sambalpur": ["sambalpur"],
        "Berhampur": ["berhampur", "brahmapur", "brahmapur"],
        "Keonjhar": ["keonjhar"],
        "Jajpur": ["jajpur"],
        "Balasore": ["balasore", "baleshwar"],
        "Angul": ["angul"],
        "Jharsuguda": ["jharsuguda"],
        "Boudh": ["boudh"],
    }
    for city, patterns in city_patterns.items():
        for p in patterns:
            if p in fn_lower or p in text_lower:
                if city not in cities:
                    cities.append(city)
                break

    # ─── Document type ──────────────────────────────────────────
    doc_types = []
    if "schedule" in fn_lower or "schedule" in text_lower:
        doc_types.append("schedule")
    if "route" in fn_lower or "route" in text_lower:
        doc_types.append("route_details")
    if "stoppage" in fn_lower or "stoppages" in fn_lower or "stoppage" in text_lower:
        doc_types.append("stop_list")
    if "fare" in fn_lower or "fare" in text_lower:
        doc_types.append("fare_document")
    if "map" in fn_lower:
        doc_types.append("network_map")
    if "timetable" in fn_lower or "time table" in text_lower:
        doc_types.append("timetable")
    if "updated" in fn_lower or "updated" in text_lower:
        doc_types.append("route_update")
    if not doc_types:
        doc_types.append("other")

    # ─── Date detection ─────────────────────────────────────────
    apparent_date = None
    # Try patterns like w.e.f 11.04.26, wef 01.06.26, etc.
    date_patterns = [
        r'w\.?e\.?f\.?\s*(\d{1,2}[\./]\d{1,2}[\./]\d{2,4})',
        r'(\d{1,2}[\./]\d{1,2}[\./]20\d{2})',
        r'(\d{1,2}[\./]\d{1,2}[\./]\d{2})',
        r'(\d{1,2}\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*20\d{2})',
        r'(20\d{2}[-/]\d{1,2}[-/]\d{1,2})',
    ]
    # Check filename first
    for pattern in date_patterns:
        m = re.search(pattern, fn_lower)
        if m:
            apparent_date = m.group(1)
            break
    # Then text
    if not apparent_date:
        for pattern in date_patterns:
            m = re.search(pattern, text_lower)
            if m:
                apparent_date = m.group(1)
                break

    # ─── Text extraction quality assessment ─────────────────────
    total_chars = sum(p.get("text_length", 0) for p in page_details)
    pages_with_text = sum(1 for p in page_details if p.get("has_text", False))
    total_pages = len(page_details)
    total_images = sum(p.get("image_count", 0) for p in page_details)

    if total_chars < 100 and total_pages > 0:
        extraction_type = "image_based_ocr_required"
    elif pages_with_text < total_pages * 0.5:
        extraction_type = "mixed_text_and_image"
    else:
        extraction_type = "text_based"

    return {
        "operator": operator,
        "network_type": network_type,
        "cities": cities,
        "districts": districts,
        "document_types": doc_types,
        "apparent_date": apparent_date,
        "extraction_type": extraction_type,
        "total_text_chars": total_chars,
        "pages_with_text": pages_with_text,
        "total_images": total_images,
    }


def process_pdf(pdf_path: Path) -> dict:
    """Process a single PDF: extract text, classify, produce inventory record."""
    filename = pdf_path.name
    print(f"\n{'='*60}")
    print(f"Processing: {filename}")
    print(f"  Size: {get_file_size_mb(pdf_path)} MB")

    # Extract with both libraries
    plumber_text, plumber_pages = extract_text_pdfplumber(pdf_path)
    mupdf_text, page_count, mupdf_pages = extract_text_pymupdf(pdf_path)

    # Use the richer text extraction
    # pdfplumber is usually better for tables, PyMuPDF for general text
    if len(mupdf_text) >= len(plumber_text):
        primary_text = mupdf_text
        primary_engine = "pymupdf"
    else:
        primary_text = plumber_text
        primary_engine = "pdfplumber"

    # Use mupdf page details for image counts + plumber for table counts
    combined_pages = []
    for i in range(page_count):
        pg = {
            "page_number": i + 1,
        }
        if i < len(mupdf_pages):
            pg.update({
                "width": mupdf_pages[i]["width"],
                "height": mupdf_pages[i]["height"],
                "text_length": mupdf_pages[i]["text_length"],
                "has_text": mupdf_pages[i]["has_text"],
                "image_count": mupdf_pages[i]["image_count"],
            })
        if i < len(plumber_pages):
            pg["table_count"] = plumber_pages[i]["table_count"]
        combined_pages.append(pg)

    # Classify
    classification = classify_document(filename, primary_text, combined_pages)

    # Save raw text
    txt_file = RAW_TEXT_DIR / f"{pdf_path.stem}.txt"
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(f"SOURCE: {filename}\n")
        f.write(f"EXTRACTED WITH: {primary_engine}\n")
        f.write(f"PAGES: {page_count}\n")
        f.write(f"{'='*60}\n")
        f.write(primary_text)

    # Also save table data separately if tables found
    tables_found = []
    for i, pg in enumerate(plumber_pages):
        if pg.get("tables"):
            for t_idx, table in enumerate(pg["tables"]):
                tables_found.append({
                    "page": i + 1,
                    "table_index": t_idx,
                    "rows": len(table),
                    "cols": len(table[0]) if table else 0,
                    "data": table,
                })
    if tables_found:
        table_file = RAW_TEXT_DIR / f"{pdf_path.stem}_tables.json"
        with open(table_file, "w", encoding="utf-8") as f:
            json.dump(tables_found, f, indent=2, ensure_ascii=False)

    # ─── Build inventory record ─────────────────────────────────
    # Extract a human-readable title from filename
    # Strip UUID prefix if present
    clean_name = filename
    uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}_'
    m = re.match(uuid_pattern, filename)
    if m:
        clean_name = filename[m.end():]
    clean_name = clean_name.replace(".pdf", "").replace("-", " ").replace("_", " ")

    # First few lines of text as title hint
    text_preview = primary_text.strip()[:500].replace("\n", " | ")

    record = {
        "filename": filename,
        "clean_name": clean_name,
        "file_size_bytes": pdf_path.stat().st_size,
        "file_size_mb": get_file_size_mb(pdf_path),
        "page_count": page_count,
        "document_title": clean_name,  # will be refined after text inspection
        "operator": classification["operator"],
        "network_type": classification["network_type"],
        "geographic_coverage": {
            "cities": classification["cities"],
            "districts": classification["districts"],
        },
        "document_types": classification["document_types"],
        "apparent_date": classification["apparent_date"],
        "extraction_type": classification["extraction_type"],
        "extraction_engine": primary_engine,
        "total_text_chars": classification["total_text_chars"],
        "pages_with_text": classification["pages_with_text"],
        "total_images": classification["total_images"],
        "tables_extracted": len(tables_found),
        "page_details": combined_pages,
        "text_preview": text_preview,
        "raw_text_file": str(txt_file.relative_to(OUTPUT_DIR)),
        "tables_file": str((RAW_TEXT_DIR / f"{pdf_path.stem}_tables.json").relative_to(OUTPUT_DIR)) if tables_found else None,
    }

    print(f"  Pages: {page_count}")
    print(f"  Extraction: {classification['extraction_type']}")
    print(f"  Operator: {classification['operator']}")
    print(f"  Network: {classification['network_type']}")
    print(f"  Cities: {classification['cities']}")
    print(f"  Types: {classification['document_types']}")
    print(f"  Date: {classification['apparent_date']}")
    print(f"  Text chars: {classification['total_text_chars']}")
    print(f"  Tables: {len(tables_found)}")

    return record


def main():
    print("=" * 60)
    print("O-TRAVELZ Transit Data Ingestion — Phase 1 & 2")
    print(f"Official PDF directory: {OFFICIAL_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 60)

    if not OFFICIAL_DIR.exists():
        print(f"ERROR: Official PDF directory not found: {OFFICIAL_DIR}")
        sys.exit(1)

    pdfs = sorted(OFFICIAL_DIR.glob("*.pdf"))
    print(f"\nFound {len(pdfs)} PDF files\n")

    inventory = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "source_directory": str(OFFICIAL_DIR),
            "total_documents": len(pdfs),
            "extraction_tools": ["pdfplumber", "pymupdf"],
        },
        "documents": [],
    }

    for pdf_path in pdfs:
        record = process_pdf(pdf_path)
        inventory["documents"].append(record)

    # Summary statistics
    summary = {
        "total_documents": len(inventory["documents"]),
        "total_pages": sum(d["page_count"] for d in inventory["documents"]),
        "total_size_mb": round(sum(d["file_size_mb"] for d in inventory["documents"]), 2),
        "text_based_docs": sum(1 for d in inventory["documents"] if d["extraction_type"] == "text_based"),
        "image_based_docs": sum(1 for d in inventory["documents"] if d["extraction_type"] == "image_based_ocr_required"),
        "mixed_docs": sum(1 for d in inventory["documents"] if d["extraction_type"] == "mixed_text_and_image"),
        "docs_with_tables": sum(1 for d in inventory["documents"] if d["tables_extracted"] > 0),
        "operators_found": list(set(d["operator"] for d in inventory["documents"])),
        "networks_found": list(set(d["network_type"] for d in inventory["documents"])),
        "cities_found": list(set(c for d in inventory["documents"] for c in d["geographic_coverage"]["cities"])),
    }
    inventory["summary"] = summary

    # Write inventory
    with open(INVENTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print("INVENTORY COMPLETE")
    print(f"{'='*60}")
    print(f"Documents: {summary['total_documents']}")
    print(f"Total pages: {summary['total_pages']}")
    print(f"Total size: {summary['total_size_mb']} MB")
    print(f"Text-based: {summary['text_based_docs']}")
    print(f"Image-based (OCR needed): {summary['image_based_docs']}")
    print(f"Mixed: {summary['mixed_docs']}")
    print(f"With tables: {summary['docs_with_tables']}")
    print(f"Operators: {summary['operators_found']}")
    print(f"Networks: {summary['networks_found']}")
    print(f"Cities: {summary['cities_found']}")
    print(f"\nInventory written to: {INVENTORY_FILE}")
    print(f"Raw text files in: {RAW_TEXT_DIR}")


if __name__ == "__main__":
    main()
