import asyncio
import json
import datetime
from playwright.async_api import async_playwright

async def measure_route(page, name, target_action=None):
    media_requests = []
    total_bytes = 0
    all_requests = 0

    def on_resp(res):
        nonlocal total_bytes, all_requests
        all_requests += 1
        headers = {k.lower(): v for k, v in res.headers.items()}
        ct = headers.get("content-type", "")
        clen = int(headers.get("content-length", 0))
        total_bytes += clen
        if "image" in ct or any(res.url.lower().endswith(ext) for ext in [".webp", ".jpg", ".jpeg", ".png", ".svg"]):
            # Categorize
            cat = "other"
            url_lower = res.url.lower()
            if "hero" in url_lower:
                cat = "hero"
            elif "card" in url_lower:
                cat = "card"
            elif "thumb" in url_lower:
                cat = "thumbnail"
            elif "logo" in url_lower:
                cat = "logo"

            media_requests.append({
                "url": res.url,
                "status": res.status,
                "content_type": ct,
                "size_bytes": clen,
                "size_kb": round(clen / 1024, 2),
                "category": cat
            })

    page.on("response", on_resp)
    if target_action:
        await target_action(page)
    await page.wait_for_timeout(2500)
    page.remove_listener("response", on_resp)

    return {
        "view": name,
        "total_requests": all_requests,
        "total_transferred_kb": round(total_bytes / 1024, 2),
        "media_count": len(media_requests),
        "media": media_requests
    }

async def run_budget_audit():
    base_url = "https://algoryxz.github.io/O-Travelz/"
    viewports = [
        {"name": "desktop", "width": 1440, "height": 900},
        {"name": "mobile", "width": 390, "height": 844}
    ]

    budget_limits = {
        "hero_kb_max": 1024,      # 1 MB
        "card_kb_max": 500,       # 500 KB
        "thumbnail_kb_max": 200   # 200 KB
    }

    results = {}
    budget_violations = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for vp in viewports:
            vp_name = vp["name"]
            results[vp_name] = []
            ctx = await browser.new_context(
                viewport={"width": vp["width"], "height": vp["height"]},
                ignore_https_errors=True
            )
            page = await ctx.new_page()

            # CDP disable cache to test real transferred sizes
            client = await ctx.new_cdp_session(page)
            await client.send("Network.setCacheDisabled", {"cacheDisabled": True})

            # 1. Home
            async def load_home(p):
                await p.goto(base_url, wait_until="networkidle")

            home_data = await measure_route(page, "home", load_home)
            results[vp_name].append(home_data)

            # 2. Discover
            async def nav_discover(p):
                # Try clicking discover tab/button or scroll
                nav_btns = await p.query_selector_all("nav button, header button, a")
                clicked = False
                for btn in nav_btns:
                    text = await btn.text_content()
                    if text and "discover" in text.lower():
                        await btn.click()
                        clicked = True
                        break
                if not clicked:
                    # Scroll down to load more content
                    await p.evaluate("window.scrollBy(0, 1000)")

            discover_data = await measure_route(page, "discover", nav_discover)
            results[vp_name].append(discover_data)

            # 3. Place Detail
            async def nav_detail(p):
                # Try clicking a destination card
                cards = await p.query_selector_all("div[role='button'], div[tabindex='0'], .cursor-pointer")
                clicked = False
                for c in cards:
                    text = await c.text_content()
                    if text and any(k in text.lower() for k in ["konark", "temple", "puri", "beach"]):
                        await c.click()
                        clicked = True
                        break
                if not clicked:
                    await p.evaluate("window.scrollBy(0, 800)")

            detail_data = await measure_route(page, "place_detail", nav_detail)
            results[vp_name].append(detail_data)

            # Check budget limits
            for view_run in results[vp_name]:
                for m in view_run["media"]:
                    cat = m["category"]
                    size_kb = m["size_kb"]
                    if cat == "hero" and size_kb > budget_limits["hero_kb_max"]:
                        budget_violations.append(f"{vp_name} {view_run['view']} hero exceeded: {size_kb} KB > {budget_limits['hero_kb_max']} KB ({m['url']})")
                    elif cat == "card" and size_kb > budget_limits["card_kb_max"]:
                        budget_violations.append(f"{vp_name} {view_run['view']} card exceeded: {size_kb} KB > {budget_limits['card_kb_max']} KB ({m['url']})")
                    elif cat == "thumbnail" and size_kb > budget_limits["thumbnail_kb_max"]:
                        budget_violations.append(f"{vp_name} {view_run['view']} thumbnail exceeded: {size_kb} KB > {budget_limits['thumbnail_kb_max']} KB ({m['url']})")

            await ctx.close()

        await browser.close()

    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.4",
        "phase": "Phase 9 — Media Performance Budget",
        "budget_limits": budget_limits,
        "views_tested": ["home", "discover", "place_detail"],
        "viewports_tested": ["desktop (1440x900)", "mobile (390x844)"],
        "results": results,
        "violations_count": len(budget_violations),
        "violations": budget_violations,
        "verdict": "PERFORMANCE_BUDGET_MET" if len(budget_violations) == 0 else "PERFORMANCE_BUDGET_EXCEEDED"
    }

    with open("reports/d1_4_public_performance_budget.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_4_public_performance_budget.json")

if __name__ == "__main__":
    asyncio.run(run_budget_audit())
