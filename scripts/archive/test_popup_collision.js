import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9232;
const USER_DATA_DIR = path.resolve('./tmp_edge_popup_test');
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

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('🚀 Starting Edge CDP Browser for Map Popup Collision Verification...');

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
    // 1. Desktop 1680x900 - Medical Marker Popup Near Top
    console.log('--- 1. Testing Desktop 1680x900 Medical Popup Near Top ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1680,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await client.send('Page.navigate', { url: 'http://localhost:5173/' });
    await delay(3000);

    // Switch to Map tab
    await client.eval(`(() => {
      const mapBtn = document.querySelector('[data-testid="nav-tab-map"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Map & Routes'));
      if (mapBtn) mapBtn.click();
    })()`);
    await delay(2500);

    // Switch to Medical tab
    await client.eval(`(() => {
      const medTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Medical'));
      if (medTab) medTab.click();
    })()`);
    await delay(2500);

    // Find and open top-most medical marker
    const medInfo = await client.eval(`(() => {
      const map = window.__stitch_map;
      const layer = window.__stitch_markers;
      if (!map || !layer) return { error: 'No map or layer' };
      const layers = layer.getLayers();
      if (layers.length === 0) return { error: '0 layers' };
      layers.sort((a, b) => {
        const ptA = map.latLngToContainerPoint(a.getLatLng());
        const ptB = map.latLngToContainerPoint(b.getLatLng());
        return ptA.y - ptB.y;
      });
      const topMarker = layers[0];
      topMarker.openPopup();
      return {
        lat: topMarker.getLatLng().lat,
        lon: topMarker.getLatLng().lng,
        y: map.latLngToContainerPoint(topMarker.getLatLng()).y,
        hasPopup: !!topMarker.getPopup(),
        isOpen: topMarker.isPopupOpen(),
      };
    })()`);
    console.log('Medical marker info:', medInfo);
    await delay(2000);
    await client.screenshot('popup_desktop_1680_medical.png');

    // 2. Desktop 1280x800 - Hotel Marker Popup
    console.log('--- 2. Testing Desktop 1280x800 Hotel Popup ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await delay(1500);

    // Switch to Hotels tab
    await client.eval(`(() => {
      const hotelTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hotels'));
      if (hotelTab) hotelTab.click();
    })()`);
    await delay(2500);

    const hotelInfo = await client.eval(`(() => {
      const map = window.__stitch_map;
      const layer = window.__stitch_markers;
      if (!map || !layer) return { error: 'No map or layer' };
      const layers = layer.getLayers();
      if (layers.length === 0) return { error: '0 layers' };
      layers.sort((a, b) => {
        const ptA = map.latLngToContainerPoint(a.getLatLng());
        const ptB = map.latLngToContainerPoint(b.getLatLng());
        return ptA.y - ptB.y;
      });
      const topMarker = layers[0];
      topMarker.openPopup();
      return {
        lat: topMarker.getLatLng().lat,
        lon: topMarker.getLatLng().lng,
        isOpen: topMarker.isPopupOpen(),
      };
    })()`);
    console.log('Hotel marker info:', hotelInfo);
    await delay(2000);
    await client.screenshot('popup_desktop_1280_hotel.png');

    // 3. Mobile 390x844 - Food Marker Popup
    console.log('--- 3. Testing Mobile 390x844 Food Popup ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(2000);

    // Click Food tab on mobile
    await client.eval(`(() => {
      const foodTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Food'));
      if (foodTab) foodTab.click();
    })()`);
    await delay(2500);

    const foodInfo = await client.eval(`(() => {
      const map = window.__stitch_map;
      const layer = window.__stitch_markers;
      if (!map || !layer) return { error: 'No map or layer' };
      const layers = layer.getLayers();
      if (layers.length === 0) return { error: '0 layers' };
      layers.sort((a, b) => {
        const ptA = map.latLngToContainerPoint(a.getLatLng());
        const ptB = map.latLngToContainerPoint(b.getLatLng());
        return ptA.y - ptB.y;
      });
      const topMarker = layers[0];
      topMarker.openPopup();
      return {
        lat: topMarker.getLatLng().lat,
        lon: topMarker.getLatLng().lng,
        isOpen: topMarker.isPopupOpen(),
      };
    })()`);
    console.log('Food marker info:', foodInfo);
    await delay(2000);
    await client.screenshot('popup_mobile_390_food.png');

    console.log('✅ All Popup Collision Verification Screenshots captured successfully!');
  } catch (err) {
    console.error('❌ CDP Verification error:', err);
  } finally {
    client.close();
    edgeProcess.kill();
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();
