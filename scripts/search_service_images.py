#!/usr/bin/env python3
import urllib.request, urllib.parse, json

def search_wiki(query):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&srlimit=4'
    req = urllib.request.Request(url, headers={'User-Agent': 'OTravelzResearchBot/1.0 (travelz.odisha@example.org)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.load(resp)
            return [s['title'] for s in data.get('query', {}).get('search', [])]
    except Exception as e:
        return [str(e)]

def get_image_info(title):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&titles={urllib.parse.quote(title)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'OTravelzResearchBot/1.0 (travelz.odisha@example.org)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.load(resp)
            pages = data.get('query', {}).get('pages', {})
            for pid, pdata in pages.items():
                if 'imageinfo' in pdata and len(pdata['imageinfo']) > 0:
                    info = pdata['imageinfo'][0]
                    meta = info.get('extmetadata', {})
                    return {
                        'title': title,
                        'url': info.get('url'),
                        'width': info.get('width'),
                        'height': info.get('height'),
                        'artist': meta.get('Artist', {}).get('value', 'Unknown'),
                        'license': meta.get('LicenseShortName', {}).get('value', 'Unknown'),
                        'license_url': meta.get('LicenseUrl', {}).get('value', ''),
                        'description': meta.get('ImageDescription', {}).get('value', '')
                    }
    except Exception as e:
        return {'error': str(e)}
    return None

targets = [
    ("hosp_scb_cuttack", "File:Platinum jubilee gate of scb medical 2021.jpg"),
    ("transit_cuttack_railway_station", "File:Cuttack Railway Station.jpg"),
    ("transit_bhadrak_railway_station", "File:Bhadrak railway station at Bhadrak, Odisha 13.jpg"),
    ("transit_badambadi_bus_stand", "File:Badambadi bus stand.JPG")
]

for sid, t in targets:
    info = get_image_info(t)
    print(f"=== {sid} ===")
    print(json.dumps(info, indent=2))
