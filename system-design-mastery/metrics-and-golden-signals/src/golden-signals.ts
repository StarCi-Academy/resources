import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * 4 Golden Signals (Google SRE) gói vào 1 registry share toàn app
 * (EN: 4 Golden Signals bundled in a single shared registry)
 *
 *   1) Latency — histogram duration theo route
 *   2) Traffic — counter request count (chia status)
 *   3) Errors  — derive từ counter với status=5xx
 *   4) Saturation — gauge số request đang in-flight
 */
export const registry = new Registry();

// Default metrics: CPU, memory, event loop lag... (EN: CPU, memory, event loop)
collectDefaultMetrics({ register: registry });

/**
 * [LATENCY] Histogram duration ms — buckets để tính p50/p95/p99
 * (EN: duration histogram — buckets power p50/p95/p99)
 */
export const requestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Latency per request in ms — Golden Signal: Latency',
  labelNames: ['route', 'method', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});

/**
 * [TRAFFIC + ERRORS] Counter tổng request
 * (EN: total request counter — covers Traffic + Errors via status label)
 *
 * - Traffic: rate(http_requests_total[1m])
 * - Errors:  rate(http_requests_total{status=~"5.."}[1m])
 *            / rate(http_requests_total[1m])
 */
export const requestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests — Golden Signals: Traffic + Errors',
  labelNames: ['route', 'method', 'status'],
  registers: [registry],
});

/**
 * [SATURATION] Gauge số request đang in-flight
 * (EN: in-flight request gauge — Saturation signal)
 *
 * Approx cho "hệ đang bão hoà bao nhiêu" ở application layer.
 */
export const inFlightRequests = new Gauge({
  name: 'http_requests_in_flight',
  help: 'In-flight HTTP requests — Golden Signal: Saturation',
  registers: [registry],
});
