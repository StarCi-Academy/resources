import * as http from 'http';

/**
 * Fake downstream HTTP server — mô phỏng service hay bị flaky
 * (EN: Fake downstream HTTP server — simulates a flaky service)
 *
 * 3 endpoint:
 *   GET /fast           → 200 OK ngay (EN: immediate 200)
 *   GET /slow           → hang 5s (EN: hangs 5s) — dùng test timeout
 *   GET /flaky?rate=0.7 → 30% fail 500, còn lại OK (EN: 30% fails, used to test retry)
 */

// Dùng global counter để fakery realistic hơn (EN: global counter for realism)
let counter = 0;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  counter += 1;
  const id = counter;

  console.log(`[downstream #${id}] ${req.method} ${url.pathname}${url.search}`);

  // /fast — trả ngay (EN: immediate response)
  if (url.pathname === '/fast') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id, ok: true }));
    return;
  }

  // /slow — ngủ 5s mới trả (EN: sleep 5s before responding)
  if (url.pathname === '/slow') {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id, ok: true, slept: 5000 }));
    return;
  }

  // /flaky — random fail dựa theo query param rate (EN: random fail based on rate)
  if (url.pathname === '/flaky') {
    const rate = Number(url.searchParams.get('rate') ?? 0.7); // success rate
    if (Math.random() >= rate) {
      console.log(`[downstream #${id}] /flaky -> 503 (simulated)`);
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id, ok: false }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id, ok: true }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(4001, () => {
  console.log('Fake downstream đang chạy trên :4001 (EN: fake downstream on :4001)');
});
