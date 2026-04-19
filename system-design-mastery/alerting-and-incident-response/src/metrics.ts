import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Registry + metrics cho demo alerting
 *
 * @returns registry để scrape, counter + histogram để record request
 * (EN: registry to scrape, counter + histogram to record requests)
 */
export const registry = new Registry();
collectDefaultMetrics({ register: registry });

// Counter đếm request theo status → dùng để tính error-rate trong alert rule
// (EN: counter by status → used to compute error-rate in alert rule)
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [registry],
});

// Histogram latency ms → dùng histogram_quantile cho p99 latency alert
// (EN: latency histogram ms → used with histogram_quantile for p99 alert)
export const httpRequestDurationMs = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});
