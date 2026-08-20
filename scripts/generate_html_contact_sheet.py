#!/usr/bin/env python3
"""Generate a standalone visual contact sheet HTML of all 50 canonical Odisha destinations."""
import json
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent.parent
    manifest = json.loads((root / "data" / "images" / "sources" / "manifest.json").read_text(encoding="utf-8"))

    html_parts = [
        "<!DOCTYPE html>",
        "<html><head><meta charset='utf-8'><title>O-Travelz 50 Canonical Destinations Visual Audit</title>",
        "<style>",
        "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }",
        "h1 { text-align: center; color: #38bdf8; margin-bottom: 8px; }",
        ".subtitle { text-align: center; color: #94a3b8; margin-bottom: 32px; font-size: 16px; }",
        ".grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; max-width: 1600px; margin: 0 auto; }",
        ".card { background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }",
        ".card img { width: 100%; height: 200px; object-fit: cover; display: block; }",
        ".info { padding: 14px; }",
        ".badge { display: inline-block; background: #0284c7; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 6px; }",
        ".title { font-size: 16px; font-weight: bold; margin: 0 0 4px 0; color: #f1f5f9; }",
        ".meta { font-size: 12px; color: #94a3b8; margin: 2px 0; }",
        ".meta span { color: #cbd5e1; font-weight: 500; }",
        "</style></head><body>",
        "<h1>O-Travelz Canonical Destinations — Visual Photo Audit</h1>",
        "<div class='subtitle'>50 Verified Authentic Creative Commons Destination Photographs</div>",
        "<div class='grid'>"
    ]

    for idx, m in enumerate(manifest):
        pid = m["place_id"]
        pname = m["place_name"]
        asset_hash = m.get("asset_hash")
        hero_rel = (root / "data" / "images" / "places" / pid / asset_hash / "hero.webp").as_uri()

        html_parts.append(f"""
        <div class="card" id="dest-{pid}">
          <img src="{hero_rel}" alt="{pname}" loading="lazy" />
          <div class="info">
            <span class="badge">#{idx+1} &bull; {pid}</span>
            <div class="title">{pname}</div>
            <div class="meta"><span>Photographer:</span> {m.get('creator')}</div>
            <div class="meta"><span>License:</span> {m.get('license')}</div>
            <div class="meta"><span>Source:</span> {m.get('source_name')}</div>
          </div>
        </div>
        """)

    html_parts.extend(["</div></body></html>"])

    out_file = root / "tmp" / "contact_sheet.html"
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text("\n".join(html_parts), encoding="utf-8")
    print(f"Generated visual contact sheet at {out_file}")

if __name__ == "__main__":
    main()
