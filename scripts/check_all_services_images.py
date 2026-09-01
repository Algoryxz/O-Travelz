#!/usr/bin/env python3
import urllib.request, urllib.parse, json

with open("data/services/odisha_services.json", "r", encoding="utf-8") as f:
    services = json.load(f)

def search_wiki(query):
    url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&srlimit=3'
    req = urllib.request.Request(url, headers={'User-Agent': 'OTravelzResearchBot/1.0 (travelz.odisha@example.org)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.load(resp)
            return [s['title'] for s in data.get('query', {}).get('search', [])]
    except Exception as e:
        return []

for s in services:
    q = f"{s['name']} {s['district']}"
    res = search_wiki(q)
    if res:
        print(f"MATCH: {s['id']} ({s['name']}) -> {res}")
    else:
        # Try simplified query
        q2 = s['name']
        res2 = search_wiki(q2)
        if res2:
            print(f"MAYBE: {s['id']} ({s['name']}) -> {res2}")
        else:
            print(f"NONE:  {s['id']} ({s['name']})")
