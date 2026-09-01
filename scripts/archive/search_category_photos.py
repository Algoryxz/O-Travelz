#!/usr/bin/env python3
"""Search Wikimedia Commons for authentic Creative Commons category photos:
1. Medical Help / Hospital in Odisha (e.g., AIIMS Bhubaneswar, SCB Medical)
2. ATMs / Banking in Odisha / India
3. Hangout & Chill / Café / Tea Lounge / Leisure Garden in Odisha
"""
import json
import sys
import httpx

sys.stdout.reconfigure(encoding='utf-8')

QUERIES = {
    "medical_help": [
        "AIIMS Bhubaneswar",
        "SCB Medical College",
        "Hospital Odisha",
        "Capital Hospital Bhubaneswar",
    ],
    "atms": [
        "ATM in India",
        "State Bank of India ATM",
        "Automated teller machine India",
        "Bank branch Odisha",
    ],
    "hangout_chill": [
        "Café in India",
        "Tea stall Odisha",
        "Coffee shop India",
        "Botanical Garden Bhubaneswar",
    ]
}

def main():
    headers = {
        "User-Agent": "OTravelz-Category-Ingestion/1.0 (https://o-travelz.com; dev@o-travelz.com) python-httpx/0.27.2",
    }

    with httpx.Client(headers=headers, follow_redirects=True) as client:
        for cat, q_list in QUERIES.items():
            print(f"\n=== Searching for {cat} ===")
            for q in q_list:
                print(f"Query: {q}")
                url = "https://commons.wikimedia.org/w/api.php"
                params = {
                    "action": "query",
                    "generator": "search",
                    "gsrsearch": q,
                    "gsrnamespace": "6",
                    "gsrlimit": "4",
                    "prop": "imageinfo",
                    "iiprop": "url|size|mime|extmetadata",
                    "iiurlwidth": "1280",
                    "format": "json",
                }
                r = client.get(url, params=params, timeout=20.0)
                pages = r.json().get("query", {}).get("pages", {})
                for page_id, page in pages.items():
                    info = page.get("imageinfo", [{}])[0]
                    mime = info.get("mime", "")
                    if mime in ("image/jpeg", "image/png"):
                        t = page.get("title", "")
                        meta = info.get("extmetadata", {})
                        lic = meta.get("LicenseShortName", {}).get("value", "")
                        artist = meta.get("Artist", {}).get("value", "")
                        print(f"  * {t} | Lic: {lic} | Artist: {artist[:40]}")

if __name__ == "__main__":
    main()
