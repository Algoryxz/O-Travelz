#!/usr/bin/env python3
"""
Deterministic OpenAPI Schema Generator & Drift Validator for O-Travelz.

Usage:
    python scripts/generate_openapi.py          # Generate shared/openapi/openapi.json
    python scripts/generate_openapi.py --check  # Verify tracked schema matches current backend code
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

# Ensure backend package is in python path
REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Use SQLite memory URL to avoid external database requirements during generation
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "deterministic-openapi-build-key")

from app.main import app  # noqa: E402

OUTPUT_DIR = REPO_ROOT / "shared" / "openapi"
OUTPUT_FILE = OUTPUT_DIR / "openapi.json"


def get_deterministic_openapi() -> dict:
    """Generate OpenAPI schema dictionary with stable keys and properties."""
    # Reset cached openapi schema if any
    app.openapi_schema = None
    schema = app.openapi()
    return schema


def serialize_schema(schema: dict) -> str:
    """Serialize schema deterministically with 2-space indentation and newline."""
    return json.dumps(schema, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate or validate O-Travelz OpenAPI schema.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check whether tracked openapi.json matches current backend code without modifying it.",
    )
    args = parser.parse_args()

    schema_dict = get_deterministic_openapi()
    generated_content = serialize_schema(schema_dict)

    if args.check:
        if not OUTPUT_FILE.exists():
            print(f"[ERROR] OpenAPI schema file does not exist at {OUTPUT_FILE}")
            print("Run 'python scripts/generate_openapi.py' to generate it.")
            return 1

        current_content = OUTPUT_FILE.read_text(encoding="utf-8")
        if current_content != generated_content:
            print("[ERROR] OpenAPI schema drift detected!")
            print("Tracked shared/openapi/openapi.json does not match current backend FastAPI schemas.")
            print("Run 'python scripts/generate_openapi.py' and commit the updated schema.")
            return 1

        print(f"[PASS] OpenAPI schema is synchronized with backend contracts ({OUTPUT_FILE.relative_to(REPO_ROOT)}).")
        return 0

    # Write generated schema
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(generated_content, encoding="utf-8")
    print(f"[OK] Generated deterministic OpenAPI schema -> {OUTPUT_FILE.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
