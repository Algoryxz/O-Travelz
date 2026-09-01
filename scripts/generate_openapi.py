#!/usr/bin/env python3
"""
Deterministic OpenAPI 3.x schema generator for O-TRAVELZ.
Extracts schema directly from backend FastAPI app and writes to shared/openapi/openapi.json.
Supports --check flag for CI drift validation.
"""
import sys
import json
from pathlib import Path

# Add backend directory to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

OUTPUT_PATH = REPO_ROOT / "shared" / "openapi" / "openapi.json"

def get_openapi_schema():
    from app.main import app
    schema = app.openapi()
    return schema

def main():
    check_mode = "--check" in sys.argv
    schema = get_openapi_schema()
    formatted = json.dumps(schema, indent=2, sort_keys=True) + "\n"

    if check_mode:
        if not OUTPUT_PATH.exists():
            print(f"ERROR: {OUTPUT_PATH} does not exist. Run python scripts/generate_openapi.py to generate it.", file=sys.stderr)
            sys.exit(1)
        current_content = OUTPUT_PATH.read_text(encoding="utf-8")
        if current_content != formatted:
            print("ERROR: OpenAPI schema drift detected! Run python scripts/generate_openapi.py to sync.", file=sys.stderr)
            sys.exit(1)
        print("OK: OpenAPI schema is up to date.")
        sys.exit(0)
    else:
        OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_PATH.write_text(formatted, encoding="utf-8")
        print(f"SUCCESS: OpenAPI schema written to {OUTPUT_PATH}")
        sys.exit(0)

if __name__ == "__main__":
    main()
