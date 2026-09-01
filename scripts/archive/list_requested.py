import json
from pathlib import Path

reqs = json.loads(Path('data/images/sources/manual_image_request.json').read_text(encoding='utf-8'))
for i, r in enumerate(reqs, 1):
    rid = r.get("research_id")
    pname = r.get("place_name")
    dist = r.get("district")
    cat = r.get("category")
    print(f"{i:02d}. {rid}: {pname} ({dist}) [{cat}]")
