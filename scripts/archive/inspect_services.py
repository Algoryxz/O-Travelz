#!/usr/bin/env python3
import json

with open("data/services/odisha_services.json", "r", encoding="utf-8") as f:
    services = json.load(f)

print(f"Total services: {len(services)}")
for s in services:
    print(f"{s['id']} | {s['name']} | {s['category']} | {s['subcategory']} | {s['district']} | {s['locality']}")
