#!/usr/bin/env python3
"""
Full Shared API Contract Drift Checker.

Verifies:
1. shared/openapi/openapi.json matches backend FastAPI app schema
2. shared/api/generated.ts matches openapi.json
"""
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def main() -> int:
    # 1. Check OpenAPI schema
    print("[1/2] Checking OpenAPI schema drift against backend FastAPI...")
    res = subprocess.run(
        [sys.executable, str(REPO_ROOT / "scripts" / "generate_openapi.py"), "--check"],
        cwd=REPO_ROOT,
    )
    if res.returncode != 0:
        return res.returncode

    # 2. Check TypeScript generated types
    print("[2/2] Checking TypeScript contracts drift against shared/openapi/openapi.json...")
    ts_target = REPO_ROOT / "shared" / "api" / "generated.ts"
    if not ts_target.exists():
        print(f"[ERROR] Generated TypeScript contract missing at {ts_target}")
        return 1

    current_ts = ts_target.read_text(encoding="utf-8")

    # Generate in temp file
    temp_ts = REPO_ROOT / "shared" / "api" / "temp_generated.ts"
    try:
        gen_res = subprocess.run(
            ["npx", "--prefix", "frontend", "openapi-typescript", str(REPO_ROOT / "shared" / "openapi" / "openapi.json"), "-o", str(temp_ts)],
            cwd=REPO_ROOT,
            shell=True,
            capture_output=True,
            text=True,
        )
        if gen_res.returncode != 0:
            print(f"[ERROR] Failed to run openapi-typescript: {gen_res.stderr}")
            return gen_res.returncode

        temp_content = temp_ts.read_text(encoding="utf-8")
        if current_ts != temp_content:
            print("[ERROR] TypeScript contracts drift detected in shared/api/generated.ts!")
            print("Run 'npm run generate:api' (or 'npx --prefix frontend openapi-typescript shared/openapi/openapi.json -o shared/api/generated.ts')")
            return 1
    finally:
        if temp_ts.exists():
            temp_ts.unlink()

    print("[PASS] All shared API contracts are in sync (OpenAPI + TypeScript).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
