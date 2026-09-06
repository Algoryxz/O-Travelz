import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_heritage_selector():
    print("Starting Playwright Chromium test on http://localhost:4173/ ...")
    total_errors = 0

    viewports = [
        {"name": "Desktop (1440x900)", "width": 1440, "height": 900},
        {"name": "Mobile (390x844)", "width": 390, "height": 844},
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp in viewports:
            print(f"\n--- Testing Viewport: {vp['name']} ---")
            context = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
            page = context.new_page()

            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

            page.goto("http://localhost:4173/", wait_until="domcontentloaded")

            # We are on StitchHomePage where Immersive Heritage Explorer is mounted
            page.wait_for_timeout(1000)

            # Scroll to Immersive Heritage Explorer
            section = page.locator('text=Immersive Heritage Explorer').first
            section.scroll_into_view_if_needed()
            page.wait_for_timeout(1000)

            selector = page.locator('[data-testid="heritage-monument-selector"]')
            selector.wait_for(state="visible", timeout=8000)

            initial_val = selector.input_value()
            print(f"Initial selector value: {initial_val}")
            if initial_val != "konark-sun-temple":
                print(f"ERROR: Expected konark-sun-temple, got {initial_val}")
                total_errors += 1

            monuments = [
                {"id": "puri-jagannath-temple", "name": "Puri Jagannath Temple", "odia": "ଜଗନ୍ନାଥ"},
                {"id": "lingaraj-temple", "name": "Lingaraj Temple", "odia": "ଲିଙ୍ଗରାଜ"},
                {"id": "brahmeswara-temple", "name": "Brahmeswara Temple", "odia": "ବ୍ରହ୍ମେଶ୍ୱର"},
                {"id": "konark-sun-temple", "name": "Konark Sun Temple", "odia": "କୋଣାର୍କ"},
            ]

            for m in monuments:
                print(f"Selecting via dropdown: {m['name']} ({m['id']})...")
                selector.select_option(m["id"])
                page.wait_for_timeout(800)

                val = selector.input_value()
                if val != m["id"]:
                    print(f"  ERROR: Selector failed to update to {m['id']}, current is {val}")
                    total_errors += 1
                else:
                    print(f"  OK: Selector value is {val}")

                # Check title in card / viewer
                title_loc = page.locator(f"h3:has-text(\"{m['name']}\")").first
                if not title_loc.is_visible():
                    print(f"  ERROR: Title {m['name']} not visible")
                    total_errors += 1
                else:
                    print(f"  OK: Title visible: {m['name']}")

                # Check Odia name
                odia_loc = page.locator(f"text={m['odia']}").first
                if not odia_loc.is_visible():
                    print(f"  ERROR: Odia text {m['odia']} not visible")
                    total_errors += 1
                else:
                    print(f"  OK: Odia text visible: {m['odia']}")

            # Test top chip click -> dropdown synchronization
            print("Testing top tab chip click -> dropdown sync...")
            chip = page.locator('#heritage-3d-section button:has-text("Puri Jagannath Temple")').first
            chip.click()
            page.wait_for_timeout(800)

            synced_val = selector.input_value()
            if synced_val == "puri-jagannath-temple":
                print("  OK: Dropdown correctly synchronized to top chip selection (puri-jagannath-temple)")
            else:
                print(f"  ERROR: Dropdown did not sync to top chip. Current: {synced_val}")
                total_errors += 1

            print(f"Console error count for {vp['name']}: {len(console_errors)}")
            if console_errors:
                print(f"Console errors: {console_errors}")

            context.close()

        browser.close()

    print(f"\nFinal Playwright Verification Result: Total Errors = {total_errors}")
    return total_errors == 0

if __name__ == "__main__":
    success = test_heritage_selector()
    sys.exit(0 if success else 1)
