import hashlib
import json
import os
import shutil
import subprocess
import time

def hash_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def collect_dist_hashes(dist_dir):
    file_hashes = {}
    for root, _, files in os.walk(dist_dir):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, dist_dir).replace("\\", "/")
            file_hashes[rel] = {
                "size": os.path.getsize(full),
                "sha256": hash_file(full)
            }
    return file_hashes

def run_build(env_vars):
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    frontend_dir = os.path.join(repo_root, "frontend")
    dist_dir = os.path.join(frontend_dir, "dist")
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)

    full_env = os.environ.copy()
    full_env.update(env_vars)

    cmd = ["npm", "run", "build"]
    # Run npm run build
    p = subprocess.run(cmd, cwd=frontend_dir, env=full_env, capture_output=True, text=True, shell=True)
    if p.returncode != 0:
        raise RuntimeError(f"Build failed:\n{p.stderr}\n{p.stdout}")

    return collect_dist_hashes(dist_dir)

def main():
    print("[Phase 6] Testing Build Reproducibility...")
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    feature_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo_root, encoding="utf-8").strip()

    # Pin VITE_BUILD_TIME and VITE_BUILD_SHA to ensure true reproducibility testing
    fixed_time = "2026-09-06T12:00:00.000Z"
    env_vars = {
        "VITE_BASE_PATH": "/O-Travelz/",
        "VITE_BUILD_SHA": feature_sha,
        "VITE_BUILD_TIME": fixed_time
    }

    print("[Phase 6] Running Build 1...")
    hashes_1 = run_build(env_vars)
    print(f"Build 1 emitted {len(hashes_1)} files.")

    print("[Phase 6] Running Build 2...")
    hashes_2 = run_build(env_vars)
    print(f"Build 2 emitted {len(hashes_2)} files.")

    files_1 = set(hashes_1.keys())
    files_2 = set(hashes_2.keys())

    missing_in_2 = list(files_1 - files_2)
    missing_in_1 = list(files_2 - files_1)

    differing_content = []
    for f in sorted(files_1.intersection(files_2)):
        # Allow manifest.json or publicMediaManifest.json generated_at timestamp differences if not pinned
        if hashes_1[f]["sha256"] != hashes_2[f]["sha256"]:
            differing_content.append({
                "file": f,
                "build1_sha": hashes_1[f]["sha256"],
                "build2_sha": hashes_2[f]["sha256"],
                "build1_size": hashes_1[f]["size"],
                "build2_size": hashes_2[f]["size"]
            })

    total_bytes = sum(h["size"] for h in hashes_1.values())
    is_reproducible = len(missing_in_1) == 0 and len(missing_in_2) == 0 and len(differing_content) == 0

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "wave": "Wave D1.4 - Phase 6 Build Reproducibility",
        "source_git_sha": feature_sha,
        "pinned_build_time": fixed_time,
        "build_1_total_files": len(hashes_1),
        "build_2_total_files": len(hashes_2),
        "total_dist_bytes": total_bytes,
        "total_dist_mb": round(total_bytes / (1024 * 1024), 2),
        "missing_in_build_2": missing_in_2,
        "missing_in_build_1": missing_in_1,
        "differing_files_count": len(differing_content),
        "differing_files": differing_content,
        "reproducible": is_reproducible,
        "verdict": "PASSED" if is_reproducible else "FAILED"
    }

    out_file = os.path.join(repo_root, "reports/d1_4_build_reproducibility.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"[Phase 6] Saved {out_file} successfully!")
    print(f"Total files: {len(hashes_1)}, Total MB: {report['total_dist_mb']}")
    print(f"Differing files: {len(differing_content)}, Reproducible: {is_reproducible}")

if __name__ == "__main__":
    main()
