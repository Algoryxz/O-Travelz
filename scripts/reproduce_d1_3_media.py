import asyncio
import json
from playwright.async_api import async_playwright

async def main():
    results = {
        "url": "https://algoryxz.github.io/O-Travelz/",
        "requests": [],
        "failures": [],
        "images": [],
        "console_errors": []
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        page.on("console", lambda msg: results["console_errors"].append(f"{msg.type}: {msg.text}") if msg.type in ["error", "warning"] else None)

        def on_response(response):
            req = response.request
            item = {
                "url": response.url,
                "method": req.method,
                "status": response.status,
                "status_text": response.status_text,
                "content_type": response.headers.get("content-type", ""),
                "resource_type": req.resource_type,
            }
            results["requests"].append(item)
            if response.status >= 400:
                results["failures"].append(item)
            if req.resource_type == "image" or "image" in response.headers.get("content-type", ""):
                results["images"].append(item)

        page.on("response", on_response)

        print("Navigating to https://algoryxz.github.io/O-Travelz/ ...")
        try:
            await page.goto("https://algoryxz.github.io/O-Travelz/", wait_until="networkidle", timeout=30000)
        except Exception as e:
            print("Navigation wait ended with:", e)

        await page.wait_for_timeout(3000)

        # Get build info
        build_info = await page.evaluate("() => window.__OTRAVELZ_BUILD__ || null")
        results["build_info"] = build_info

        await browser.close()

    with open("reports/reproduce_d1_3_raw.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Captured {len(results['requests'])} total requests.")
    print(f"Captured {len(results['failures'])} failures:")
    for f in results["failures"]:
        print(f"  {f['status']} {f['url']}")
    print(f"Captured {len(results['images'])} images:")
    for img in results["images"]:
        print(f"  {img['status']} {img['url']} ({img.get('content_type')})")

if __name__ == "__main__":
    asyncio.run(main())
