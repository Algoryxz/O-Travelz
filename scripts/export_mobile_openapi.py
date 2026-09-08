import sys, json, argparse, pathlib

def get_openapi():
    # Insert backend into path
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "backend"))
    from app.main import app
    schema = app.openapi()
    return schema

def clean_deterministic(schema):
    # Sort keys recursively
    def sort_obj(obj):
        if isinstance(obj, dict):
            return {k: sort_obj(v) for k, v in sorted(obj.items())}
        if isinstance(obj, list):
            return [sort_obj(v) for v in obj]
        return obj
    return sort_obj(schema)

def main():
    parser = argparse.ArgumentParser(description="Export or check canonical mobile OpenAPI contract")
    parser.add_argument("--check", action="store_true", help="Check if committed snapshot matches current FastAPI generation")
    parser.add_argument("--output", default="mobile/contracts/openapi-mobile.json", help="Output file path")
    args = parser.parse_args()

    target_path = pathlib.Path(args.output)
    schema = clean_deterministic(get_openapi())
    dumped = json.dumps(schema, indent=2, ensure_ascii=False) + "\n"

    if args.check:
        if not target_path.exists():
            print(f"Error: {target_path} does not exist. Run export first.")
            sys.exit(1)
        current = target_path.read_text(encoding="utf-8")
        if current != dumped:
            print("FAIL: Committed mobile OpenAPI snapshot does not match current backend.")
            sys.exit(1)
        print("OK: Committed mobile OpenAPI snapshot is in sync.")
        sys.exit(0)

    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(dumped, encoding="utf-8")
    print(f"Exported deterministic OpenAPI contract to {target_path}")

if __name__ == "__main__":
    main()
