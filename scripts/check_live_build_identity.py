import asyncio
from playwright.async_api import async_playwright

async def get_build_info():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page()
        await page.goto('https://algoryxz.github.io/O-Travelz/', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)
        build_info = await page.evaluate("() => window.__OTRAVELZ_BUILD__ || null")
        print("Build info:", build_info)
        await b.close()

if __name__ == "__main__":
    asyncio.run(get_build_info())
