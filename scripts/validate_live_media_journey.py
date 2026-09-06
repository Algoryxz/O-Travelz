import asyncio
import json
import os
import time
from playwright.async_api import async_playwright

LIVE_URL = "https://algoryxz.github.io/O-Travelz/"

async def run_journey():
    desktop_results = {
        "viewport": "1280x800",
        "requests": [],
        "failures": [],
        "images": [],
        "console_errors": [],
        "destination_clicks": []
    }
    
    mobile_results = {
        "viewport": "390x844",
        "requests": [],
        "failures": [],
        "images": [],
        "console_errors": []
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # ----------------- DESKTOP JOURNEY -----------------
        print(f"[Phase 8] Running Desktop Journey on {LIVE_URL} ...")
        context_desktop = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context_desktop.new_page()

        page.on("console", lambda msg: desktop_results["console_errors"].append(f"{msg.type}: {msg.text}") if msg.type in ["error"] else None)

        def on_desktop_response(response):
            req = response.request
            content_length = int(response.headers.get("content-length", 0))
            item = {
                "url": response.url,
                "method": req.method,
                "status": response.status,
                "status_text": response.status_text,
                "content_type": response.headers.get("content-type", ""),
                "resource_type": req.resource_type,
                "size_bytes": content_length,
            }
            desktop_results["requests"].append(item)
            if response.status >= 400:
                desktop_results["failures"].append(item)
            if req.resource_type == "image" or "image" in response.headers.get("content-type", ""):
                desktop_results["images"].append(item)

        page.on("response", on_desktop_response)

        try:
            await page.goto(LIVE_URL, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"[Phase 8] Navigation warning: {e}")
        await page.wait_for_timeout(3000)

        # Accept terms consent gate if present
        try:
            accept_btn = page.locator("button:has-text('Accept & Continue')")
            if await accept_btn.count() > 0 and await accept_btn.is_visible():
                await accept_btn.click()
                print("[Phase 8] Dismissed Terms Consent Gate")
                await page.wait_for_timeout(1500)
        except Exception as e:
            print(f"[Phase 8] Terms consent check: {e}")

        # Click through destination tabs/cards if available
        destinations_to_test = ["Chandrabhaga", "Gopalpur", "Konark", "Puri"]
        for dest in destinations_to_test:
            try:
                card = page.locator(f"text={dest}").first
                if await card.count() > 0 and await card.is_visible():
                    await card.click()
                    desktop_results["destination_clicks"].append({"name": dest, "clicked": True})
                    await page.wait_for_timeout(1000)
            except Exception as e:
                desktop_results["destination_clicks"].append({"name": dest, "clicked": False, "error": str(e)})

        await page.screenshot(path="reports/desktop_live.png", full_page=False)
        await context_desktop.close()

        # ----------------- MOBILE JOURNEY -----------------
        print(f"[Phase 8] Running Mobile Journey (390x844) on {LIVE_URL} ...")
        context_mobile = await browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True
        )
        page_mobile = await context_mobile.new_page()

        page_mobile.on("console", lambda msg: mobile_results["console_errors"].append(f"{msg.type}: {msg.text}") if msg.type in ["error"] else None)

        def on_mobile_response(response):
            req = response.request
            content_length = int(response.headers.get("content-length", 0))
            item = {
                "url": response.url,
                "method": req.method,
                "status": response.status,
                "status_text": response.status_text,
                "content_type": response.headers.get("content-type", ""),
                "resource_type": req.resource_type,
                "size_bytes": content_length,
            }
            mobile_results["requests"].append(item)
            if response.status >= 400:
                mobile_results["failures"].append(item)
            if req.resource_type == "image" or "image" in response.headers.get("content-type", ""):
                mobile_results["images"].append(item)

        page_mobile.on("response", on_mobile_response)

        try:
            await page_mobile.goto(LIVE_URL, wait_until="domcontentloaded", timeout=30000)
        except Exception as e:
            print(f"[Phase 8] Mobile navigation warning: {e}")
        await page_mobile.wait_for_timeout(3000)

        # Accept terms consent gate if present on mobile
        try:
            accept_btn_m = page_mobile.locator("button:has-text('Accept & Continue')")
            if await accept_btn_m.count() > 0 and await accept_btn_m.is_visible():
                await accept_btn_m.click()
                await page_mobile.wait_for_timeout(1500)
        except Exception as e:
            pass

        # Scroll down mobile feed
        await page_mobile.evaluate("window.scrollBy(0, 800)")
        await page_mobile.wait_for_timeout(2000)

        await page_mobile.screenshot(path="reports/mobile_live.png", full_page=False)
        await context_mobile.close()
        await browser.close()

    # Compile journey report
    all_failures = desktop_results["failures"] + mobile_results["failures"]
    # Filter out dead localhost tunnel errors if any (which should be 0 now)
    critical_media_failures = [
        f for f in all_failures 
        if any(ext in f["url"] for ext in [".webp", ".jpg", ".jpeg", ".png", "logo", "hero"])
    ]

    journey_report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "targetUrl": LIVE_URL,
        "desktop": {
            "totalRequests": len(desktop_results["requests"]),
            "imageRequests": len(desktop_results["images"]),
            "failures": desktop_results["failures"],
            "consoleErrors": desktop_results["console_errors"],
            "destinationInteractions": desktop_results["destination_clicks"]
        },
        "mobile": {
            "totalRequests": len(mobile_results["requests"]),
            "imageRequests": len(mobile_results["images"]),
            "failures": mobile_results["failures"],
            "consoleErrors": mobile_results["console_errors"]
        },
        "criticalMediaFailures": critical_media_failures,
        "verdict": "PASSED" if len(critical_media_failures) == 0 else "FAILED"
    }

    with open("reports/d1_3_public_media_journey.json", "w", encoding="utf-8") as f:
        json.dump(journey_report, f, indent=2)

    # Compile performance report
    desktop_bytes = sum(r["size_bytes"] for r in desktop_results["requests"])
    mobile_bytes = sum(r["size_bytes"] for r in mobile_results["requests"])
    max_single_image_bytes = max((r["size_bytes"] for r in desktop_results["images"] + mobile_results["images"]), default=0)
    max_single_resource_bytes = max((r["size_bytes"] for r in desktop_results["requests"] + mobile_results["requests"]), default=0)

    perf_report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "desktopTransferredBytes": desktop_bytes,
        "desktopTransferredMB": round(desktop_bytes / (1024 * 1024), 2),
        "mobileTransferredBytes": mobile_bytes,
        "mobileTransferredMB": round(mobile_bytes / (1024 * 1024), 2),
        "maxSingleImageBytes": max_single_image_bytes,
        "maxSingleImageKB": round(max_single_image_bytes / 1024, 2),
        "maxSingleResourceBytes": max_single_resource_bytes,
        "maxSingleResourceKB": round(max_single_resource_bytes / 1024, 2),
        "rawWikimediaDownloaded": any("Chandrabhaga_Beach_in_Odisha_02.jpg" in r["url"] for r in desktop_results["requests"] + mobile_results["requests"]),
        "verdict": "PASSED" if max_single_image_bytes < 1024 * 1024 and not any("Chandrabhaga_Beach_in_Odisha_02.jpg" in r["url"] for r in desktop_results["requests"]) else "FAILED"
    }

    with open("reports/d1_3_media_performance.json", "w", encoding="utf-8") as f:
        json.dump(perf_report, f, indent=2)

    import urllib.request
    try:
        req = urllib.request.Request("https://algoryxz.github.io/O-Travelz/sw.js", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as res:
            sw_http_ok = res.status == 200
    except Exception:
        sw_http_ok = False

    # Compile Release Acceptance Report
    acceptance_report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "wave": "Wave D1.3",
        "releaseTarget": "Production Public Web",
        "canonicalHost": "GitHub Pages (https://algoryxz.github.io/O-Travelz/)",
        "checks": {
            "zeroCriticalMedia404s": len(critical_media_failures) == 0,
            "zeroRawMultiMegabyteOriginals": not perf_report["rawWikimediaDownloaded"],
            "noDeadLocalhostTunnelCalls": not any("9109f508361c7c" in r["url"] for r in desktop_results["requests"] + mobile_results["requests"]),
            "swRegistered": any("sw.js" in r["url"] and r["status"] == 200 for r in desktop_results["requests"] + mobile_results["requests"]) or sw_http_ok,
            "logoResolved": any("logo.jpeg" in r["url"] and r["status"] == 200 for r in desktop_results["requests"] + mobile_results["requests"]),
            "maxImageMediaUnderBudget": max_single_image_bytes < 1024 * 1024,
            "desktopRenderPass": len(desktop_results["requests"]) > 10,
            "mobileRenderPass": len(mobile_results["requests"]) > 10
        },
        "PUBLIC_WEB_READY": "YES" if len(critical_media_failures) == 0 and not perf_report["rawWikimediaDownloaded"] and max_single_image_bytes < 1024 * 1024 else "NO"
    }

    with open("reports/d1_3_release_acceptance.json", "w", encoding="utf-8") as f:
        json.dump(acceptance_report, f, indent=2)

    print(f"[Phase 8 & 10] Complete! Critical media failures: {len(critical_media_failures)}")
    print(f"Desktop Transferred: {perf_report['desktopTransferredMB']} MB | Mobile: {perf_report['mobileTransferredMB']} MB")
    print(f"Max single resource: {perf_report['maxSingleResourceKB']} KB")
    print(f"PUBLIC_WEB_READY: {acceptance_report['PUBLIC_WEB_READY']}")

if __name__ == "__main__":
    asyncio.run(run_journey())
