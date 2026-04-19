import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus registry và metrics định nghĩa 1 lần, share toàn app
 * (EN: Prometheus registry + metrics — defined once, shared app-wide)
 */
export const registry = new Registry();

// Thu thập default metrics (CPU, memory, event loop...) — rẻ (EN: cheap default metrics)
collectDefaultMetrics({ register: registry });

/**
 * Counter số request đã phục vụ — phân loại theo route và status
 * (EN: Counter of served requests — labeled by route and status)
 */
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['route', 'status'],
  registers: [registry],
});

/**
 * Histogram latency request — đo p50/p95/p99
 * (EN: Histogram of request latency — powers p50/p95/p99)
 */
export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in ms',
  labelNames: ['route', 'status'],
  // Bucket tuỳ workload — nhỏ thì thêm bucket nhỏ (EN: tune buckets to workload)
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});
