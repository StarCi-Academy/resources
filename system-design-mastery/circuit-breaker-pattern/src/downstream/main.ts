import * as http from 'http';

/**
 * Fake downstream — có switch bật/tắt "chết" để demo circuit breaker
 * (EN: Fake downstream — can toggle "dead" mode to demonstrate circuit breaker)
 *
 * Endpoints:
 *   GET  /data     → 200 nếu healthy, 503 nếu dead
 *   POST /kill     → bật dead mode (EN: enable dead mode)
 *   POST /revive   → tắt dead mode (EN: disable dead mode)
 */

// Flag điều khiển trạng thái (EN: state flag)
let dead = false;

const server = http.createServer((req, res) => {
  const url = req.url ?? '/';

  if (req.method === 'POST' && url === '/kill') {
    dead = true;
    console.log('[downstream] KILLED');
    res.writeHead(200); res.end('killed');
    return;
  }

  if (req.method === 'POST' && url === '/revive') {
    dead = false;
    console.log('[downstream] REVIVED');
    res.writeHead(200); res.end('revived');
    return;
  }

  if (url === '/data') {
    if (dead) {
      // Giả chết: trả 503 ngay (EN: fake dead — return 503)
      res.writeHead(503); res.end('dead');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, payload: 'some data' }));
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(4002, () => console.log('Fake downstream on :4002'));
