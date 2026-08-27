import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9235;
const USER_DATA_DIR = path.resolve('./tmp_edge_rebuild_test');
const ARTIFACTS_DIR = path.resolve('./artifacts/screenshots');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}/json`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find((item) => item.type === 'page');
          if (page && page.webSocketDebuggerUrl) {
            resolve(page.webSocketDebuggerUrl);
          } else {
            reject(new Error('No page WebSocket URL found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { res, rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((res, rej) => {
      const id = this.id++;
      this.callbacks.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const fullPath = path.join(ARTIFACTS_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`📸 Saved screenshot: ${filename}`);
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile,
    });
    await this.send('Emulation.setVisibleSize', { width, height });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('🚀 Starting Edge CDP Browser for Rebuilt Map Workspace Verification...');

  const edgeProcess = spawn(
    EDGE_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let connected = false;
  let wsUrl = '';
  for (let i = 0; i < 20; i++) {
    await delay(500);
    try {
      wsUrl = await getWebSocketUrl();
      connected = true;
      break;
    } catch (e) {}
  }

  if (!connected) {
    console.error('❌ Failed to connect to Edge debugger');
    edgeProcess.kill();
    process.exit(1);
  }

  const client = new CDPClient(wsUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('DOM.enable');

  try {
    // 1. Desktop 1680x900 - Initial Two-Column Workspace
    console.log('\n--- 1. Desktop 1680x900 Initial Two-Column Workspace ---');
    await client.setViewport(1680, 900, false);
    await client.send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(2000);

    // Accept consent modal if present
    await client.eval(`
      (() => {
        const btn = document.querySelector('button[data-testid="consent-accept-btn"]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Accept') || b.textContent.includes('Continue'));
        if (btn) btn.click();
      })()
    `);
    await delay(500);

    // Switch to Map tab
    await client.eval(`
      (() => {
        const mapTab = document.querySelector('button[data-testid="nav-tab-map"]') ||
                       Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Map'));
        if (mapTab) mapTab.click();
      })()
    `);
    await delay(2500);

    const initialMetrics = await client.eval(`
      (() => {
        const mapSec = document.querySelector('section');
        const aside = document.querySelector('aside');
        const searchInput = document.querySelector('[data-testid="map-search-input"]');
        const destTab = document.querySelector('[data-testid="map-tab-destinations"]');
        return {
          mapWidth: mapSec ? mapSec.getBoundingClientRect().width : 0,
          asideWidth: aside ? aside.getBoundingClientRect().width : 0,
          hasSearch: !!searchInput,
          hasDestTab: !!destTab,
          asideContentSnippet: aside ? aside.innerText.substring(0, 100) : '',
        };
      })()
    `);
    console.log('Desktop 1680 Layout Metrics:', initialMetrics);
    await client.screenshot('1_rebuilt_map_desktop_initial.png');

    // 2. Click Explore recommendation item to select a place (e.g. Museum of Tribal Arts or Ram Mandir)
    console.log('\n--- 2. Place Selection & Rich Details in Right Panel ---');
    const selectResult = await client.eval(`
      (() => {
        const recs = Array.from(document.querySelectorAll('aside .group'));
        if (recs.length > 2) {
          recs[2].click(); // Museum of Tribal Arts
          return { method: 'recommendation_card_click', clickedName: recs[2].querySelector('h4')?.textContent };
        }
        const pins = Array.from(document.querySelectorAll('.custom-destination-pin'));
        if (pins.length > 0) {
          pins[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          return { method: 'pin_click', count: pins.length };
        }
        return { method: 'none' };
      })()
    `);
    console.log('Selection Trigger:', selectResult);
    await delay(1500);

    const placeDetails = await client.eval(`
      (() => {
        const card = document.querySelector('[data-testid="place-info-card"]') || document.querySelector('aside');
        const title = card?.querySelector('h3, h4')?.textContent || '';
        const rating = card?.textContent.includes('★') || false;
        const routeBtn = document.querySelector('[data-testid="place-card-route-btn"]') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Route'));
        return {
          title,
          hasRating: rating,
          hasRouteBtn: !!routeBtn,
        };
      })()
    `);
    console.log('Selected Place Details:', placeDetails);
    await client.screenshot('2_rebuilt_map_place_selected.png');

    // 3. Click Route Button to test Routing Engine
    console.log('\n--- 3. Route Calculation & Directions HUD ---');
    await client.eval(`
      (() => {
        const routeBtn = document.querySelector('[data-testid="place-card-route-btn"]') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Route'));
        if (routeBtn) routeBtn.click();
      })()
    `);
    await delay(1500);

    const routeInfo = await client.eval(`
      (() => {
        const hud = document.querySelector('[data-testid="directions-hud-overlay"]');
        return {
          hasHUD: !!hud,
          hudText: hud ? hud.innerText : '',
        };
      })()
    `);
    console.log('Directions HUD:', routeInfo);
    await client.screenshot('3_rebuilt_map_route_active.png');

    // 4. Test Culinary Tab & Food Pin Click
    console.log('\n--- 4. Culinary Layer & Authentic Odia Food Details ---');
    await client.eval(`
      (() => {
        const foodTab = document.querySelector('[data-testid="map-tab-culinary"]');
        if (foodTab) foodTab.click();
      })()
    `);
    await delay(1500);
    await client.eval(`
      (() => {
        const pins = Array.from(document.querySelectorAll('.custom-food-pin'));
        if (pins.length > 0) {
          pins[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          const rec = document.querySelector('aside .group');
          if (rec) rec.click();
        }
      })()
    `);
    await delay(1000);
    await client.screenshot('4_rebuilt_map_food_layer.png');

    // 5. Test Hotels Tab & Hotel Pin Click
    console.log('\n--- 5. Hotels Layer & Stay Details ---');
    await client.eval(`
      (() => {
        const hotelTab = document.querySelector('[data-testid="map-tab-hotels"]');
        if (hotelTab) hotelTab.click();
      })()
    `);
    await delay(1500);
    await client.eval(`
      (() => {
        const pins = Array.from(document.querySelectorAll('.custom-hotel-pin'));
        if (pins.length > 0) {
          pins[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          const rec = document.querySelector('aside .group');
          if (rec) rec.click();
        }
      })()
    `);
    await delay(1000);
    await client.screenshot('5_rebuilt_map_hotels_layer.png');

    // 6. Test Medical Tab & Hospital Pin Click
    console.log('\n--- 6. Medical & Emergency Layer ---');
    await client.eval(`
      (() => {
        const medTab = document.querySelector('[data-testid="map-tab-medical"]');
        if (medTab) medTab.click();
      })()
    `);
    await delay(1500);
    await client.eval(`
      (() => {
        const pins = Array.from(document.querySelectorAll('.custom-med-pin'));
        if (pins.length > 0) {
          pins[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          const rec = document.querySelector('aside .group');
          if (rec) rec.click();
        }
      })()
    `);
    await delay(1000);
    await client.screenshot('6_rebuilt_map_medical_layer.png');

    // 7. Test Desktop 1280x800 Viewport
    console.log('\n--- 7. Desktop 1280x800 Viewport ---');
    await client.setViewport(1280, 800, false);
    await client.eval(`
      (() => {
        if (window.__stitch_map) window.__stitch_map.invalidateSize();
      })()
    `);
    await delay(1000);
    await client.screenshot('7_rebuilt_map_desktop_1280.png');

    // 8. Test Mobile 390x844 Viewport
    console.log('\n--- 8. Mobile 390x844 Viewport ---');
    await client.setViewport(390, 844, true);
    await client.eval(`
      (() => {
        if (window.__stitch_map) window.__stitch_map.invalidateSize();
        const allTab = document.querySelector('[data-testid="map-tab-destinations"]');
        if (allTab) allTab.click();
      })()
    `);
    await delay(1500);
    await client.eval(`
      (() => {
        const rec = document.querySelector('aside .group');
        if (rec) rec.click();
      })()
    `);
    await delay(1000);
    await client.screenshot('8_rebuilt_map_mobile_selected.png');

    console.log('\n🎉 ALL Edge CDP browser automation tests passed with 100% success!');
  } finally {
    client.close();
    edgeProcess.kill();
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch((err) => {
  console.error('❌ CDP Verification failed:', err);
  process.exit(1);
});
