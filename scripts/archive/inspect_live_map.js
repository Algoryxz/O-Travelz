import http from 'http';

function getWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:9232/json`, (res) => {
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

async function inspect() {
  try {
    const wsUrl = await getWebSocketUrl();
    const ws = new globalThis.WebSocket(wsUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const map = window.__stitch_map;
            const layer = window.__stitch_markers;
            return {
              hasMap: !!map,
              hasLayer: !!layer,
              layersCount: layer ? layer.getLayers().length : 0,
            };
          })()`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (e) => {
      console.log('Result:', JSON.parse(e.data));
      ws.close();
    };
  } catch (e) {
    console.error(e);
  }
}
inspect();
