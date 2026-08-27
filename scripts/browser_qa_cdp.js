const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9230;
const SCREENSHOT_DIR = path.join(__dirname, '../artifacts/screenshots');
const USER_DATA_DIR = path.join(os.tmpdir(), 'edge_qa_profile_' + Date.now());

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBrowserQA() {
  console.log("🚀 Launching Clean Headless Edge with CDP on port", PORT);

  const edgeProcess = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1680,900',
    'http://localhost:5173/'
  ]);

  await sleep(2500);

  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const target = pages.find(p => p.type === 'page') || pages[0];
    const wsUrl = target.webSocketDebuggerUrl;
    console.log("Connecting WebSocket to:", wsUrl);

    const ws = new WebSocket(wsUrl);

    let nextId = 1;
    const pendingCallbacks = new Map();

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        const timeout = setTimeout(() => {
          if (pendingCallbacks.has(id)) {
            pendingCallbacks.delete(id);
            reject(new Error(`Command ${method} timed out after 10000ms`));
          }
        }, 10000);

        pendingCallbacks.set(id, { resolve, reject, timeout });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingCallbacks.has(msg.id)) {
        const { resolve, reject, timeout } = pendingCallbacks.get(msg.id);
        clearTimeout(timeout);
        pendingCallbacks.delete(msg.id);
        if (msg.error) {
          reject(msg.error);
        } else {
          resolve(msg.result);
        }
      }
    };

    // Enable Page & Runtime & DOM
    await sendCommand("Page.enable");
    await sendCommand("Runtime.enable");
    await sendCommand("DOM.enable");

    // Wait for initial render of app
    await sleep(2000);

    // Switch to Map & Routes tab
    console.log("Clicking Map & Routes tab via data-testid='nav-tab-map'...");
    await sendCommand("Runtime.evaluate", {
      expression: `document.querySelector('[data-testid="nav-tab-map"]')?.click();`
    });
    await sleep(3000);

    // Helper to capture and write screenshot
    async function capture(filename) {
      const res = await sendCommand("Page.captureScreenshot", { format: "png" });
      const filePath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`📸 Saved screenshot: ${filename} (${fs.statSync(filePath).size} bytes)`);
      return filePath;
    }

    // 1. Initial Bhubaneswar Map (Desktop 1680x900)
    console.log("Capturing 1. Initial Bhubaneswar Map (1680x900)...");
    await capture("1_initial_bhubaneswar_map.png");

    // 2. Click Food layer
    console.log("Switching to Food layer...");
    await sendCommand("Runtime.evaluate", {
      expression: `document.querySelector('[data-testid="map-tab-culinary"]')?.click();`
    });
    await sleep(2000);
    await capture("2_food_layer.png");

    // 3. Click Hotels layer
    console.log("Switching to Hotels layer...");
    await sendCommand("Runtime.evaluate", {
      expression: `document.querySelector('[data-testid="map-tab-hotels"]')?.click();`
    });
    await sleep(2000);
    await capture("3_hotels_layer.png");

    // 4. Click Transit layer
    console.log("Switching to Transit layer...");
    await sendCommand("Runtime.evaluate", {
      expression: `document.querySelector('[data-testid="map-tab-transit"]')?.click();`
    });
    await sleep(2000);
    await capture("4_transit_layer.png");

    // Switch back to Destinations / All
    console.log("Switching back to Destinations layer...");
    await sendCommand("Runtime.evaluate", {
      expression: `document.querySelector('[data-testid="map-tab-destinations"]')?.click();`
    });
    await sleep(2000);

    // 5. Select a destination marker (Nandankanan or first pin) to open popup & Details side sheet
    console.log("Clicking destination marker...");
    const markerRes = await sendCommand("Runtime.evaluate", {
      expression: `
        (() => {
          const pin = document.querySelector('.custom-destination-pin') || document.querySelector('.leaflet-marker-icon');
          if (pin) {
            pin.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            return 'Dispatched click on destination pin';
          }
          return 'No destination pin found';
        })()
      `
    });
    console.log("Marker click result:", markerRes.result?.value);
    await sleep(2000);
    await capture("5_selected_marker_popup.png");

    // 6. Trigger Route action
    console.log("Triggering Route action...");
    const routeRes = await sendCommand("Runtime.evaluate", {
      expression: `
        (() => {
          const routeBtn = document.querySelector('[data-map-action="route"]') || document.querySelector('[data-testid="place-card-route-btn"]');
          if (routeBtn) {
            routeBtn.click();
            return 'Triggered Route action';
          }
          return 'Route action button not found';
        })()
      `
    });
    console.log("Route action result:", routeRes.result?.value);
    await sleep(2500);
    await capture("6_route_active.png");

    // 7. Mobile Viewport (390 x 844)
    console.log("Setting mobile viewport (390 x 844)...");
    await sendCommand("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(2500);
    await capture("7_mobile_map.png");

    // 8. Desktop 1280x800 Viewport
    console.log("Setting desktop 1280x800 viewport...");
    await sendCommand("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(2000);
    await capture("8_desktop_1280_map.png");

    // Query Map DOM verification state
    const domAudit = await sendCommand("Runtime.evaluate", {
      expression: `
        (() => {
          const searchInput = !!document.querySelector('input[placeholder*="Search places"]');
          const searchThisAreaBtn = !!document.querySelector('button:has-text("Search this area")') || Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Search this area'));
          const layerTabs = Array.from(document.querySelectorAll('[data-testid^="map-tab-"]')).map(t => t.textContent.trim());
          const clusterCount = document.querySelectorAll('.custom-cluster-badge').length;
          const individualPinCount = document.querySelectorAll('.custom-destination-pin').length;
          const tilesCount = document.querySelectorAll('.leaflet-tile-loaded').length;
          const hudOverlay = !!document.querySelector('[data-testid="directions-hud-overlay"]');
          const detailCard = !!document.querySelector('[data-testid="place-info-card"]');
          return {
            searchInput,
            layerTabs,
            clusterCount,
            individualPinCount,
            tilesCount,
            hudOverlay,
            detailCard
          };
        })()
      `,
      returnByValue: true
    });

    console.log("\n📊 DOM Reality Audit Results:", JSON.stringify(domAudit.result?.value, null, 2));

    ws.close();
    console.log("🎉 Visual verification run completed successfully!");
  } finally {
    edgeProcess.kill();
  }
}

runBrowserQA().catch(err => {
  console.error("Browser QA Error:", err);
  process.exit(1);
});
