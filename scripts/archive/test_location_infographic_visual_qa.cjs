const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9245;
const USER_DATA_DIR = path.join(os.tmpdir(), 'edge_qa_profile_infographic_' + Date.now());
const ARTIFACTS_DIR = 'C:\\Users\\AYUSH\\.gemini\\antigravity-ide\\brain\\c2d0dce8-f519-4546-9d34-d5e401bc5833';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVisualQA() {
  console.log("🚀 Launching Clean Headless Edge with CDP on port", PORT);

  const edgeProcess = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  edgeProcess.stderr.on('data', d => {});

  await sleep(1500);

  let ws;
  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const target = pages.find(p => p.type === 'page') || pages[0];
    const wsUrl = target.webSocketDebuggerUrl;
    console.log("Connecting WebSocket to:", wsUrl);

    ws = new WebSocket(wsUrl);

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

    async function evalScript(expression) {
      const res = await sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw new Error("Script exception: " + JSON.stringify(res.exceptionDetails));
      }
      return res.result.value;
    }

    async function screenshot(filename) {
      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(ARTIFACTS_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`📸 Screenshot saved: ${filename}`);
    }

    async function setViewport(width, height) {
      await sendCommand('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    await sendCommand('DOM.enable');

    // 1. Desktop 1680x900 - Initial Bhubaneswar State
    console.log('\n--- 1. Desktop 1680x900: Initial Bhubaneswar State ---');
    await setViewport(1680, 900);
    await sendCommand('Page.navigate', { url: 'http://localhost:5173/#map' });
    await sleep(3500);

    const initialInfographic = await evalScript(`(() => {
      const card = document.querySelector('[data-testid="current-location-infographic"]');
      const img = document.querySelector('[data-testid="current-location-infographic-image"]');
      const statusBadge = document.querySelector('[data-testid="current-location-status-badge"]');
      return {
        cardExists: !!card,
        imgSrc: img ? img.src : null,
        naturalWidth: img ? img.naturalWidth : 0,
        naturalHeight: img ? img.naturalHeight : 0,
        badgeText: statusBadge ? statusBadge.innerText.trim() : null,
        titleText: card ? card.querySelector('h3')?.innerText.trim() : null,
      };
    })()`);

    console.log('Bhubaneswar Infographic Status:', initialInfographic);
    if (!initialInfographic.cardExists || initialInfographic.naturalWidth === 0) {
      throw new Error('Initial Bhubaneswar infographic image failed to render or load natural dimensions!');
    }
    await screenshot('current_location_infographic_bbsr_1680x900.png');

    // 2. Switch Hub to Puri
    console.log('\n--- 2. Switch Location Hub to Puri ---');
    const diagBefore = await evalScript(`(() => {
      const navLocationBtn = document.querySelector('button[title*="Click to toggle Live Location"]');
      if (navLocationBtn) navLocationBtn.click();
      return { hasNavBtn: !!navLocationBtn };
    })()`);
    console.log('Diag Before Hub Switch:', diagBefore);
    await sleep(800);

    const diagAfter = await evalScript(`(() => {
      const allBtns = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
      const puriBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Puri (Jagannath'));
      if (puriBtn) {
        puriBtn.click();
        return { clickedPuri: true, allBtns: allBtns.filter(t => t.length > 0) };
      }
      return { clickedPuri: false, allBtns: allBtns.filter(t => t.length > 0) };
    })()`);
    console.log('Diag After Hub Click:', diagAfter);
    await sleep(2500);

    const puriInfographic = await evalScript(`(() => {
      const card = document.querySelector('[data-testid="current-location-infographic"]');
      const img = document.querySelector('[data-testid="current-location-infographic-image"]');
      const statusBadge = document.querySelector('[data-testid="current-location-status-badge"]');
      return {
        cardExists: !!card,
        imgSrc: img ? img.src : null,
        naturalWidth: img ? img.naturalWidth : 0,
        badgeText: statusBadge ? statusBadge.innerText.trim() : null,
        titleText: card ? card.querySelector('h3')?.innerText.trim() : null,
      };
    })()`);
    console.log('Puri Infographic Status:', puriInfographic);
    if (!puriInfographic.cardExists || puriInfographic.naturalWidth === 0 || !puriInfographic.titleText?.includes('Puri')) {
      throw new Error('Puri infographic image failed to update dynamically!');
    }
    await screenshot('current_location_infographic_puri_1680x900.png');

    // 3. Switch Hub to Sambalpur
    console.log('\n--- 3. Switch Location Hub to Sambalpur ---');
    await evalScript(`(() => {
      const navLocationBtn = document.querySelector('button[title*="Click to toggle Live Location"]');
      if (navLocationBtn) navLocationBtn.click();
    })()`);
    await sleep(800);

    await evalScript(`(() => {
      const sambalpurBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sambalpur (Hirakud'));
      if (sambalpurBtn) sambalpurBtn.click();
    })()`);
    await sleep(2500);

    const sambalpurInfographic = await evalScript(`(() => {
      const card = document.querySelector('[data-testid="current-location-infographic"]');
      const img = document.querySelector('[data-testid="current-location-infographic-image"]');
      const statusBadge = document.querySelector('[data-testid="current-location-status-badge"]');
      return {
        cardExists: !!card,
        imgSrc: img ? img.src : null,
        naturalWidth: img ? img.naturalWidth : 0,
        badgeText: statusBadge ? statusBadge.innerText.trim() : null,
        titleText: card ? card.querySelector('h3')?.innerText.trim() : null,
      };
    })()`);
    console.log('Sambalpur Infographic Status:', sambalpurInfographic);
    if (!sambalpurInfographic.cardExists || sambalpurInfographic.naturalWidth === 0 || !sambalpurInfographic.titleText?.includes('Sambalpur')) {
      throw new Error('Sambalpur infographic image failed to update dynamically!');
    }
    await screenshot('current_location_infographic_sambalpur_1680x900.png');

    // 4. Desktop 1280x800
    console.log('\n--- 4. Desktop 1280x800 Viewport Check ---');
    await setViewport(1280, 800);
    await sleep(1500);
    await screenshot('current_location_infographic_desktop_1280x800.png');

    // 5. Mobile 390x844
    console.log('\n--- 5. Mobile 390x844 Viewport Check ---');
    await setViewport(390, 844);
    await sleep(1500);
    await screenshot('current_location_infographic_mobile_390x844.png');

    console.log('\n🎉 ALL CURRENT-LOCATION INFOGRAPHIC VISUAL QA CHECKS PASSED!');
  } finally {
    if (ws) ws.close();
    edgeProcess.kill('SIGKILL');
  }
}

runVisualQA().catch((err) => {
  console.error('❌ QA Execution Failed:', err);
  process.exit(1);
});
