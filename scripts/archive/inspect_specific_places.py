import json
from pathlib import Path

places = json.loads(Path('data/places/places.json').read_text(encoding='utf-8'))
print(f"Total places in places.json: {len(places)}")

for p in places:
    pid = p.get("id")
    name = p.get("name")
    dist = p.get("district")
    cat = p.get("category")
    if any(k in str(pid).lower() or k in name.lower() for k in ["jajpur", "cuttack", "ganjam", "nayagarh", "bolangir", "balangir", "boudh", "deogarh", "koraput", "nuapada", "rayagada"]):
        print(f"  {pid}: {name} ({dist}) [{cat}]")
