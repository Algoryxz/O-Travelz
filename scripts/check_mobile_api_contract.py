import sys, json, argparse, pathlib

def load_committed(path="mobile/contracts/openapi-mobile.json"):
    p = pathlib.Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Committed contract not found at {path}")
    return json.loads(p.read_text(encoding="utf-8"))

def load_current():
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "backend"))
    from app.main import app
    return app.openapi()

def compare_contracts(old_spec, new_spec):
    changes = []

    old_paths = old_spec.get("paths", {})
    new_paths = new_spec.get("paths", {})

    # 1. Check endpoints & methods
    for path, old_methods in old_paths.items():
        if path not in new_paths:
            changes.append({"type": "BREAKING", "category": "REMOVED_ENDPOINT", "detail": f"Path '{path}' was removed."})
            continue
        new_methods = new_paths[path]
        for method in old_methods:
            if method not in new_methods:
                changes.append({"type": "BREAKING", "category": "REMOVED_METHOD", "detail": f"Method '{method.upper()} {path}' was removed."})

    for path, new_methods in new_paths.items():
        if path not in old_paths:
            changes.append({"type": "ADDITIVE", "category": "ADDED_ENDPOINT", "detail": f"Path '{path}' was added."})
            continue
        old_methods = old_paths[path]
        for method in new_methods:
            if method not in old_methods:
                changes.append({"type": "ADDITIVE", "category": "ADDED_METHOD", "detail": f"Method '{method.upper()} {path}' was added."})

    # 2. Check schemas
    old_schemas = old_spec.get("components", {}).get("schemas", {})
    new_schemas = new_spec.get("components", {}).get("schemas", {})

    for schema_name, old_s in old_schemas.items():
        if schema_name not in new_schemas:
            changes.append({"type": "BREAKING", "category": "REMOVED_SCHEMA", "detail": f"Schema '{schema_name}' was removed."})
            continue
        new_s = new_schemas[schema_name]
        
        # Check required fields added
        old_req = set(old_s.get("required", []))
        new_req = set(new_s.get("required", []))
        added_req = new_req - old_req
        if added_req:
            changes.append({"type": "BREAKING", "category": "ADDED_REQUIRED_FIELD", "detail": f"Schema '{schema_name}' added required fields: {list(added_req)}."})
        
        # Check properties removed
        old_props = old_s.get("properties", {})
        new_props = new_s.get("properties", {})
        removed_props = set(old_props.keys()) - set(new_props.keys())
        if removed_props:
            changes.append({"type": "BREAKING", "category": "REMOVED_FIELD", "detail": f"Schema '{schema_name}' removed fields: {list(removed_props)}."})

    return changes

def main():
    parser = argparse.ArgumentParser(description="Audit API contract drift")
    parser.add_argument("--contract", default="mobile/contracts/openapi-mobile.json")
    args = parser.parse_args()

    try:
        old_spec = load_committed(args.contract)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    new_spec = load_current()
    changes = compare_contracts(old_spec, new_spec)

    breaking = [c for c in changes if c["type"] == "BREAKING"]
    additive = [c for c in changes if c["type"] == "ADDITIVE"]

    print(f"Contract Drift Check: {len(changes)} total differences detected.")
    print(f"  Breaking changes: {len(breaking)}")
    print(f"  Additive changes: {len(additive)}")

    for c in changes:
        print(f"[{c['type']}] {c['category']}: {c['detail']}")

    if breaking:
        print("FAIL: Breaking changes detected against committed mobile contract.")
        sys.exit(1)
    else:
        print("PASS: No breaking contract drift detected.")
        sys.exit(0)

if __name__ == "__main__":
    main()
