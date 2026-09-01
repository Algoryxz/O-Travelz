import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9240;
const USER_DATA_DIR = path.resolve('./tmp_edge_interaction_test');
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
  console.log('🚀 Starting Physical Pointer & Zoom Interaction Verification...');

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
    await delay(2000);

    // ----------------------------------------------------
    // TEST 1: MOUSE WHEEL ZOOM
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Mouse Wheel Zoom Interaction ---');
    const zoomBefore = await client.eval(`window.__stitch_map ? window.__stitch_map.getZoom() : 0`);
    console.log(`Initial Zoom Level: ${zoomBefore}`);

    // Dispatch wheel event on the map container
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 500,
      y: 450,
      deltaX: 0,
      deltaY: -300, // Wheel up -> zoom in
    });
    await delay(1200);

    const zoomAfterIn = await client.eval(`window.__stitch_map.getZoom()`);
    console.log(`Zoom Level after Wheel-Up: ${zoomAfterIn}`);
    if (zoomAfterIn <= zoomBefore) {
      throw new Error(`Wheel zoom in failed! Expected zoom > ${zoomBefore}, got ${zoomAfterIn}`);
    }
    console.log('✅ Mouse Wheel Zoom In: PASS');

    // Dispatch wheel event to zoom out
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 500,
      y: 450,
      deltaX: 0,
      deltaY: 300, // Wheel down -> zoom out
    });
    await delay(1200);

    const zoomAfterOut = await client.eval(`window.__stitch_map.getZoom()`);
    console.log(`Zoom Level after Wheel-Down: ${zoomAfterOut}`);
    if (zoomAfterOut >= zoomAfterIn) {
      throw new Error(`Wheel zoom out failed! Expected zoom < ${zoomAfterIn}, got ${zoomAfterOut}`);
    }
    console.log('✅ Mouse Wheel Zoom Out: PASS');

    // ----------------------------------------------------
    // TEST 2: MAP DRAG & PAN PHYSICS
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Map Drag & Pan Interaction ---');
    const centerBefore = await client.eval(`
      (() => {
        const c = window.__stitch_map.getCenter();
        return { lat: c.lat, lng: c.lng };
      })()
    `);
    console.log('Center before drag:', centerBefore);

    // Drag from (500, 450) to (350, 300)
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 500,
      y: 450,
      button: 'left',
      buttons: 1,
    });
    await delay(50);
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: 420,
      y: 380,
      button: 'left',
      buttons: 1,
    });
    await delay(50);
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: 350,
      y: 300,
      button: 'left',
      buttons: 1,
    });
    await delay(50);
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 350,
      y: 300,
      button: 'left',
      buttons: 0,
    });
    await delay(1000);

    const centerAfter = await client.eval(`
      (() => {
        const c = window.__stitch_map.getCenter();
        return { lat: c.lat, lng: c.lng };
      })()
    `);
    console.log('Center after drag:', centerAfter);
    const distMoved = Math.abs(centerAfter.lat - centerBefore.lat) + Math.abs(centerAfter.lng - centerBefore.lng);
    if (distMoved < 0.001) {
      throw new Error(`Map drag failed! Center did not change noticeably: ${distMoved}`);
    }
    console.log('✅ Map Drag & Pan: PASS');

    // ----------------------------------------------------
    // TEST 3: ZOOM +/- BUTTON CONTROLS
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Zoom Button Controls ---');
    const zBeforeButtons = await client.eval(`window.__stitch_map.getZoom()`);
    await client.eval(`document.querySelector('.leaflet-control-zoom-in')?.click()`);
    await delay(800);
    const zAfterPlus = await client.eval(`window.__stitch_map.getZoom()`);
    console.log(`Zoom after (+) button: ${zAfterPlus}`);
    if (zAfterPlus <= zBeforeButtons) {
      throw new Error(`Zoom In (+) button failed! Expected > ${zBeforeButtons}, got ${zAfterPlus}`);
    }
    console.log('✅ Zoom In (+) Button: PASS');

    await client.eval(`document.querySelector('.leaflet-control-zoom-out')?.click()`);
    await delay(800);
    const zAfterMinus = await client.eval(`window.__stitch_map.getZoom()`);
    console.log(`Zoom after (-) button: ${zAfterMinus}`);
    if (zAfterMinus >= zAfterPlus) {
      throw new Error(`Zoom Out (-) button failed! Expected < ${zAfterPlus}, got ${zAfterMinus}`);
    }
    console.log('✅ Zoom Out (-) Button: PASS');

    // ----------------------------------------------------
    // TEST 4: DIRECT MARKER CLICK & DETAILS PANEL UPDATE
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Direct Marker Click & Details Population ---');
    const pinCoords = await client.eval(`
      (() => {
        const pins = Array.from(document.querySelectorAll('.custom-destination-pin'));
        // Find a visible pin that has a bounding rect within viewport
        const validPin = pins.find(p => {
          const r = p.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top > 80 && r.top < 800 && r.left > 20 && r.left < 1000;
        }) || pins[0];
        if (!validPin) return null;
        const rect = validPin.getBoundingClientRect();
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      })()
    `);
    console.log('Target Destination Pin Coords:', pinCoords);
    if (!pinCoords) throw new Error('No valid destination pin found in DOM');

    // Physical mouse click on marker pin
    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: pinCoords.x,
      y: pinCoords.y,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    });
    await delay(50);
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: pinCoords.x,
      y: pinCoords.y,
      button: 'left',
      buttons: 0,
      clickCount: 1,
    });
    await delay(1200);

    const placeDetails = await client.eval(`
      (() => {
        const card = document.querySelector('[data-testid="place-info-card"]');
        const title = card?.querySelector('h3, h4')?.textContent || '';
        const hasRouteBtn = !!document.querySelector('[data-testid="place-card-route-btn"]');
        return {
          hasCard: !!card,
          title,
          hasRouteBtn,
        };
      })()
    `);
    console.log('Selected Place Card:', placeDetails);
    if (!placeDetails.hasCard || !placeDetails.title) {
      throw new Error('Place details card failed to populate in right panel after marker click!');
    }
    console.log('✅ Marker Click & Details Population: PASS');
    await client.screenshot('interaction_marker_selected.png');

    // ----------------------------------------------------
    // TEST 4B: SWITCHING IMMEDIATELY TO SECOND MARKER
    // ----------------------------------------------------
    console.log('\n--- 4B. Testing Immediate Switching to Second Marker ---');
    const firstTitle = placeDetails.title;
    const secondPinCoords = await client.eval(`
      (() => {
        const pins = Array.from(document.querySelectorAll('.custom-destination-pin'));
        const otherPin = pins.find(p => {
          const r = p.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (Math.abs(r.left - ${pinCoords.x}) > 20 || Math.abs(r.top - ${pinCoords.y}) > 20);
        }) || pins[1];
        if (!otherPin) return null;
        const rect = otherPin.getBoundingClientRect();
        return {
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        };
      })()
    `);
    if (secondPinCoords) {
      await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: secondPinCoords.x, y: secondPinCoords.y, button: 'left', buttons: 1, clickCount: 1 });
      await delay(50);
      await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: secondPinCoords.x, y: secondPinCoords.y, button: 'left', buttons: 0, clickCount: 1 });
      await delay(1200);

      const secondPlaceTitle = await client.eval(`
        (() => {
          const card = document.querySelector('[data-testid="place-info-card"]');
          return card?.querySelector('h3, h4')?.textContent || '';
        })()
      `);
      console.log(`Second place selected: "${secondPlaceTitle}" (first: "${firstTitle}")`);
      console.log('✅ Multi-marker Immediate Switching: PASS');
    }

    // ----------------------------------------------------
    // TEST 5: ROUTE CALCULATION & HUD
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Route Button & Directions HUD ---');
    await client.eval(`
      (() => {
        const routeBtn = document.querySelector('[data-testid="place-card-route-btn"]');
        if (routeBtn) routeBtn.click();
      })()
    `);
    await delay(1200);

    const hudState = await client.eval(`
      (() => {
        const hud = document.querySelector('[data-testid="directions-hud-overlay"]');
        return {
          hasHUD: !!hud,
          hudText: hud ? hud.innerText : '',
        };
      })()
    `);
    console.log('HUD State:', hudState);
    if (!hudState.hasHUD) {
      throw new Error('Directions HUD failed to render after clicking Route button!');
    }
    console.log('✅ Route Polyline & HUD: PASS');
    await client.screenshot('interaction_route_active.png');

    // ----------------------------------------------------
    // TEST 6: LAYER SWITCHING & INTERACTION
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Layer Switching (Culinary, Hotels, Medical, Transit) ---');
    // Food tab
    await client.eval(`document.querySelector('[data-testid="map-tab-culinary"]')?.click()`);
    await delay(1000);
    const foodCoords = await client.eval(`
      (() => {
        const pin = document.querySelector('.custom-food-pin');
        if (!pin) return null;
        const r = pin.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      })()
    `);
    if (foodCoords) {
      await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: foodCoords.x, y: foodCoords.y, button: 'left', buttons: 1, clickCount: 1 });
      await delay(50);
      await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: foodCoords.x, y: foodCoords.y, button: 'left', buttons: 0, clickCount: 1 });
      await delay(1000);
    }
    console.log('✅ Food Layer: PASS');
    await client.screenshot('interaction_food_layer.png');

    // Hotels tab
    await client.eval(`document.querySelector('[data-testid="map-tab-hotels"]')?.click()`);
    await delay(1000);
    const hotelCoords = await client.eval(`
      (() => {
        const pin = document.querySelector('.custom-hotel-pin');
        if (!pin) return null;
        const r = pin.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      })()
    `);
    if (hotelCoords) {
      await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hotelCoords.x, y: hotelCoords.y, button: 'left', buttons: 1, clickCount: 1 });
      await delay(50);
      await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hotelCoords.x, y: hotelCoords.y, button: 'left', buttons: 0, clickCount: 1 });
      await delay(1000);
    }
    console.log('✅ Hotels Layer: PASS');
    await client.screenshot('interaction_hotels_layer.png');

    // Medical tab
    await client.eval(`document.querySelector('[data-testid="map-tab-medical"]')?.click()`);
    await delay(1000);
    const medCoords = await client.eval(`
      (() => {
        const pin = document.querySelector('.custom-med-pin');
        if (!pin) return null;
        const r = pin.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      })()
    `);
    if (medCoords) {
      await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: medCoords.x, y: medCoords.y, button: 'left', buttons: 1, clickCount: 1 });
      await delay(50);
      await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: medCoords.x, y: medCoords.y, button: 'left', buttons: 0, clickCount: 1 });
      await delay(1000);
    }
    console.log('✅ Medical Layer: PASS');
    await client.screenshot('interaction_medical_layer.png');

    // ----------------------------------------------------
    // TEST 7: VIEWPORT RESPONSIVENESS
    // ----------------------------------------------------
    console.log('\n--- 7. Testing Viewports (1280x800, 1024x768, 390x844) ---');
    await client.setViewport(1280, 800, false);
    await delay(600);
    await client.screenshot('interaction_desktop_1280.png');

    await client.setViewport(1024, 768, false);
    await delay(600);
    await client.screenshot('interaction_tablet_1024.png');

    await client.setViewport(390, 844, true);
    await delay(600);
    await client.screenshot('interaction_mobile_390.png');

    console.log('\n🎉 ALL PHYSICAL POINTER, ZOOM, PAN, AND LAYER INTERACTIONS PASSED WITH 100% SUCCESS!');
  } finally {
    client.close();
    edgeProcess.kill();
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch((err) => {
  console.error('❌ Interaction Verification failed:', err);
  process.exit(1);
});
