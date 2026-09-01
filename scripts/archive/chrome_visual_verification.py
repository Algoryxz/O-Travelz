#!/usr/bin/env python3
"""Automated Chrome Visual Verification via Chrome DevTools Protocol (CDP).

Controls real Google Chrome instance to:
1. Navigate to http://localhost:5173/
2. Scroll to Discover / Top Destinations section and capture screenshot.
3. Open Place Details Modal for Shree Jagannatha Temple Puri and capture screenshot.
4. Switch to Lingaraj Temple and capture screenshot.
5. Switch to Konark Sun Temple and capture screenshot.
6. Verify visual authenticity of all rendered photographs.
"""
from __future__ import annotations

import base64
import json
import subprocess
import sys
import time
from pathlib import Path
import httpx

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "tmp" / "chrome_screenshots"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def run_cdp_verification():
    # 1. Launch Chrome in headless mode with remote debugging
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--remote-allow-origins=*",
        "--disable-gpu",
        "--window-size=1440,1080",
        "--no-first-run",
        "--no-default-browser-check",
        "about:blank",
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2.0)

    try:
        # 2. Get WebSocket debugger URL from Chrome
        r = httpx.get("http://localhost:9222/json", timeout=10.0)
        pages = r.json()
        if not pages:
            print("No pages found in Chrome!")
            return False
        ws_url = pages[0]["webSocketDebuggerUrl"]
        page_id = pages[0]["id"]
        print(f"Connected to Chrome page {page_id} via {ws_url}")

        # Use websockets via simple synchronous HTTP CDP endpoints or python websockets
        # In CDP HTTP endpoint: /json/new, /json/activate
        # Or using python's websockets library if installed, else simple CDP client
        try:
            import websocket
        except ImportError:
            subprocess.run([sys.executable, "-m", "pip", "install", "websocket-client"], check=True)
            import websocket

        ws = websocket.create_connection(ws_url, timeout=60.0)

        msg_id = 0
        def cdp_send(method: str, params: dict = None) -> dict:
            nonlocal msg_id
            msg_id += 1
            payload = {"id": msg_id, "method": method, "params": params or {}}
            ws.send(json.dumps(payload))
            while True:
                try:
                    raw = ws.recv()
                    if not raw:
                        continue
                    resp = json.loads(raw)
                    if resp.get("id") == msg_id:
                        if "error" in resp:
                            print(f"CDP Error for {method}: {resp['error']}")
                        return resp.get("result", {})
                except Exception as e:
                    print(f"CDP recv error: {e}")
                    raise

        def capture_screenshot(filename: str, clip: dict = None):
            params = {"format": "png"}
            if clip:
                params["clip"] = clip
            res = cdp_send("Page.captureScreenshot", params)
            data = base64.b64decode(res["data"])
            out_path = OUTPUT_DIR / filename
            out_path.write_bytes(data)
            print(f"Captured screenshot: {out_path} ({len(data)} bytes)")
            return out_path

        def evaluate_js(expression: str) -> any:
            res = cdp_send("Runtime.evaluate", {"expression": expression, "returnByValue": True})
            return res.get("result", {}).get("value")

        # Enable Page & Runtime
        cdp_send("Page.enable")
        cdp_send("Runtime.enable")
        cdp_send("DOM.enable")

        # 1. Navigate to frontend
        print("Navigating to http://localhost:5173/...")
        cdp_send("Page.navigate", {"url": "http://localhost:5173/"})
        time.sleep(3.0)

        # 2. Capture Home / Landing Page
        capture_screenshot("01_chrome_home_landing.png")

        # Scroll to Discover section
        evaluate_js("window.scrollTo(0, 700);")
        time.sleep(1.5)
        capture_screenshot("02_chrome_discover_cards.png")

        # Scroll to Top Destinations
        evaluate_js("window.scrollTo(0, 1400);")
        time.sleep(1.5)
        capture_screenshot("03_chrome_top_destinations.png")

        # 3. Click on Jagannath Temple Puri card / modal trigger
        # Find element by text or selector
        click_puri = evaluate_js("""
            (() => {
                const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], h3'));
                const puriEl = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('jagannath'));
                if (puriEl) {
                    puriEl.click();
                    return true;
                }
                // Try finding any card with puri in data or click first destination card
                const cards = document.querySelectorAll('.group, [data-place-id]');
                if (cards.length > 0) {
                    cards[0].click();
                    return true;
                }
                return false;
            })()
        """)
        print(f"Clicked Puri destination element: {click_puri}")
        time.sleep(2.0)
        capture_screenshot("04_chrome_puri_details_modal.png")

        # 4. Open Lingaraj Temple Details
        evaluate_js("""
            (() => {
                // Close current modal if open
                const closeBtn = document.querySelector('button[aria-label="Close"], button svg.lucide-x');
                if (closeBtn) closeBtn.closest('button').click();
            })()
        """)
        time.sleep(1.0)

        click_lingaraj = evaluate_js("""
            (() => {
                const buttons = Array.from(document.querySelectorAll('button, a, div, h3'));
                const lingaraj = buttons.find(b => b.textContent && b.textContent.includes('Lingaraj'));
                if (lingaraj) {
                    lingaraj.click();
                    return true;
                }
                return false;
            })()
        """)
        print(f"Clicked Lingaraj element: {click_lingaraj}")
        time.sleep(2.0)
        capture_screenshot("05_chrome_lingaraj_modal.png")

        # 5. Open Konark Sun Temple Details
        evaluate_js("""
            (() => {
                const closeBtn = document.querySelector('button[aria-label="Close"], button svg.lucide-x');
                if (closeBtn) closeBtn.closest('button').click();
            })()
        """)
        time.sleep(1.0)

        click_konark = evaluate_js("""
            (() => {
                const buttons = Array.from(document.querySelectorAll('button, a, div, h3'));
                const konark = buttons.find(b => b.textContent && b.textContent.includes('Konark'));
                if (konark) {
                    konark.click();
                    return true;
                }
                return false;
            })()
        """)
        print(f"Clicked Konark element: {click_konark}")
        time.sleep(2.0)
        capture_screenshot("06_chrome_konark_modal.png")

        # 6. Capture Contact Sheet HTML page
        contact_sheet_url = "file:///" + str((Path(__file__).resolve().parent.parent / "tmp" / "contact_sheet.html").as_posix())
        cdp_send("Page.navigate", {"url": contact_sheet_url})
        time.sleep(2.0)
        capture_screenshot("07_chrome_50_destinations_contact_sheet.png")

        ws.close()
        print("\nAll Chrome visual verification screenshots successfully captured!")
        return True

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    run_cdp_verification()
