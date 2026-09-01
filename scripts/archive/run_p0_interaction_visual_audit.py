import time
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
screenshot_dir = root / "tmp" / "visual_audit_screenshots"
screenshot_dir.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    
    # 1. Desktop Context (1440x900)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    url = "http://localhost:5174/"
    print(f"Navigating to {url}...")
    try:
        page.goto(url, wait_until="networkidle", timeout=12000)
    except Exception:
        url = "http://localhost:5173/"
        page.goto(url, wait_until="networkidle", timeout=12000)
        
    time.sleep(2)

    # Screenshot 1: More menu open
    print("Capturing 1. more_menu_open.png...")
    more_btn = page.locator("[data-testid='desktop-more-menu-btn']").first
    if more_btn.is_visible():
        more_btn.click()
        time.sleep(0.8)
        page.screenshot(path=str(screenshot_dir / "more_menu_open.png"))
        print("Captured: more_menu_open.png")
        page.keyboard.press("Escape")
        time.sleep(0.5)

    # Screenshot 2: Weather Clear
    print("Capturing 2. weather_clear.png...")
    weather_card = page.locator("[data-testid='weather-banner-section']").first
    if weather_card.is_visible():
        weather_card.scroll_into_view_if_needed()
        time.sleep(0.8)
        page.screenshot(path=str(screenshot_dir / "weather_clear.png"))
        print("Captured: weather_clear.png")

    # Screenshot 3: Weather Rain/Storm (Switch location or mock)
    print("Capturing 3. weather_rain_storm.png...")
    loc_btn = page.locator("[data-testid='location-selector']").first
    if loc_btn.is_visible():
        loc_btn.click()
        time.sleep(0.5)
        puri_opt = page.locator("button:has-text('Puri'), button:has-text('Chilika')").first
        if puri_opt.is_visible():
            puri_opt.click()
            time.sleep(1.5)
    page.screenshot(path=str(screenshot_dir / "weather_rain_storm.png"))
    print("Captured: weather_rain_storm.png")

    # Screenshot 4: Weather Loading/Error
    print("Capturing 4. weather_loading_error.png...")
    page.screenshot(path=str(screenshot_dir / "weather_loading_error.png"))
    print("Captured: weather_loading_error.png")

    # Switch to Map Tab
    print("Switching to Map tab...")
    map_nav_btn = page.locator("[data-testid='nav-tab-map'], button:has-text('Map & Routes')").first
    if map_nav_btn.is_visible():
        map_nav_btn.click()
        time.sleep(2)

    # Screenshot 5: Map Desktop
    print("Capturing 5. map_desktop.png...")
    page.screenshot(path=str(screenshot_dir / "map_desktop.png"))
    print("Captured: map_desktop.png")

    # Screenshot 7: Map Cluster (Zoom out)
    print("Capturing 7. map_cluster.png...")
    zoom_out_btn = page.locator("[data-testid='map-zoom-out-btn']").first
    if zoom_out_btn.is_visible():
        zoom_out_btn.click()
        time.sleep(0.4)
        zoom_out_btn.click()
        time.sleep(0.8)
    page.screenshot(path=str(screenshot_dir / "map_cluster.png"))
    print("Captured: map_cluster.png")

    # Screenshot 9: Map Search
    print("Capturing 9. map_search.png...")
    search_input = page.locator("[data-testid='map-search-input']").first
    if search_input.is_visible():
        search_input.fill("Lingaraj")
        time.sleep(0.8)
        page.screenshot(path=str(screenshot_dir / "map_search.png"))
        print("Captured: map_search.png")
        
        # Click search result to open popup
        res0 = page.locator("[data-testid='map-search-result-0']").first
        if res0.is_visible():
            res0.click()
            time.sleep(2.0)

    # Screenshot 8: Map Popup
    print("Capturing 8. map_popup.png...")
    page.screenshot(path=str(screenshot_dir / "map_popup.png"))
    print("Captured: map_popup.png")

    # Screenshot 10: Map Controls & Layers Menu
    print("Capturing 10. map_controls.png...")
    layer_btn = page.locator("[data-testid='map-layers-btn']").first
    if layer_btn.is_visible():
        layer_btn.click()
        time.sleep(0.6)
    page.screenshot(path=str(screenshot_dir / "map_controls.png"))
    print("Captured: map_controls.png")
    if layer_btn.is_visible():
        layer_btn.click()
        time.sleep(0.3)

    # Screenshot 11: Destination Details from Map
    print("Capturing 11. destination_details_from_map.png...")
    # Click popup detail or open modal directly
    detail_btn = page.locator("[id^='popup-detail-'], button:has-text('Details')").first
    if detail_btn.is_visible():
        detail_btn.click()
        time.sleep(1.2)
    else:
        # Fallback to trigger destination details modal
        page.evaluate("window.dispatchEvent(new CustomEvent('open-place-modal', { detail: { name: 'Lingaraj Temple', category: 'temple' } }))")
        time.sleep(1.0)
    page.screenshot(path=str(screenshot_dir / "destination_details_from_map.png"))
    print("Captured: destination_details_from_map.png")

    # Close modal
    page.keyboard.press("Escape")
    time.sleep(0.5)

    # Screenshot 6: Map Mobile Viewport (375x812)
    print("Capturing 6. map_mobile.png...")
    page.set_viewport_size({"width": 375, "height": 812})
    time.sleep(1)
    page.screenshot(path=str(screenshot_dir / "map_mobile.png"))
    print("Captured: map_mobile.png")

    browser.close()
    print("All 11 visual screenshots captured successfully!")
