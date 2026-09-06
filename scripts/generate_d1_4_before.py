import asyncio
import json
import os
import subprocess
import time
from playwright.async_api import async_playwright

async def measure_browser():
    url = "https://algoryxz.github.io/O-Travelz/"
    requests = []
    failures = []
    critical_media_404s = []

    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        # Fresh context with cache disabled
        ctx = await b.new_context(
            viewport={"width": 1440, "height": 900},
            ignore_https_errors=True
        )
        page = await ctx.new_page()

        # Disable cache via CDP
        client = await ctx.new_cdp_session(page)
        await client.send("Network.setCacheDisabled", {"cacheDisabled": True})

        def on_resp(res):
            req = res.request
            length = int(res.headers.get("content-length", 0))
            item = {
                "url": res.url,
                "status": res.status,
                "resource_type": req.resource_type,
                "content_type": res.headers.get("content-type", ""),
                "size_bytes": length
            }
            requests.append(item)
            if res.status >= 400:
                failures.append(item)
                if any(ext in res.url for ext in [".webp", ".jpg", ".jpeg", ".png", "logo", "hero"]):
                    critical_media_404s.append(item)

        page.on("response", on_resp)
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(4000)
        await b.close()

    total_transferred = sum(r["size_bytes"] for r in requests)
    return len(requests), len(failures), len(critical_media_404s), total_transferred

def audit_dist():
    dist_dir = os.path.abspath("frontend/dist")
    total_files = 0
    total_bytes = 0
    media_files = []

    media_exts = {".webp", ".jpg", ".jpeg", ".png", ".svg", ".gif", ".ico"}

    for root, _, files in os.walk(dist_dir):
        for f in files:
            p = os.path.join(root, f)
            size = os.path.getsize(p)
            total_files += 1
            total_bytes += size
            _, ext = os.path.splitext(f.lower())
            if ext in media_exts:
                rel = os.path.relpath(p, dist_dir).replace("\\", "/")
                media_files.append({"path": rel, "size_bytes": size, "size_kb": round(size / 1024, 2)})

    media_files.sort(key=lambda x: x["size_bytes"], reverse=True)
    total_media_bytes = sum(m["size_bytes"] for m in media_files)

    return total_files, total_bytes, len(media_files), total_media_bytes, media_files[:20]

def main():
    print("[Phase 0] Inspecting git branches and commits...")
    feature_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], encoding="utf-8").strip()
    gh_pages_sha = subprocess.check_output(["git", "rev-parse", "origin/gh-pages"], encoding="utf-8").strip()

    print("[Phase 0] Auditing frontend/dist ...")
    tot_files, tot_bytes, num_media, tot_media_bytes, top20_media = audit_dist()

    print("[Phase 0] Running fresh Playwright browser measurement with cache disabled...")
    req_count, fail_count, crit_404_count, transfer_bytes = asyncio.run(measure_browser())

    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "wave": "Wave D1.4 - Phase 0 Forensic Sync",
        "feature_sha": feature_sha,
        "gh_pages_sha": gh_pages_sha,
        "public_build_identity": {
            "git_sha": "e39dac0360d1f5d64370524e80665a400eb107e1",
            "built_at": "2026-09-06T11:49:27.831Z",
            "version": "4.0.0"
        },
        "backend_identity": {
            "canonical_target": "https://otravelz-backend.onrender.com",
            "status": "unreachable_timeout_hibernated",
            "note": "Render free-tier instance times out; frontend runs resiliently with local/cached data"
        },
        "alembic_revision": "0020_transit_ride_observations",
        "frontend_dist": {
            "total_files": tot_files,
            "total_bytes": tot_bytes,
            "total_mb": round(tot_bytes / (1024 * 1024), 2),
            "media_files_count": num_media,
            "media_total_bytes": tot_media_bytes,
            "media_total_mb": round(tot_media_bytes / (1024 * 1024), 2),
            "largest_20_media_files": top20_media
        },
        "browser_live_behavior": {
            "total_requests": req_count,
            "failed_requests_count": fail_count,
            "critical_media_404_count": crit_404_count,
            "total_first_page_transfer_bytes": transfer_bytes,
            "total_first_page_transfer_mb": round(transfer_bytes / (1024 * 1024), 2)
        }
    }

    os.makedirs("reports", exist_ok=True)
    out_file = "reports/d1_4_before.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"[Phase 0] Saved {out_file} successfully!")
    print(f"Dist: {tot_files} files, {report['frontend_dist']['total_mb']} MB (Media: {num_media} files, {report['frontend_dist']['media_total_mb']} MB)")
    print(f"Live Browser: {req_count} reqs, {fail_count} failures, {crit_404_count} media 404s, {report['browser_live_behavior']['total_first_page_transfer_mb']} MB")

if __name__ == "__main__":
    main()
