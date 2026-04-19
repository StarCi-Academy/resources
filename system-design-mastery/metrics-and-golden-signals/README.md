# Metrics & The 4 Golden Signals

Demo 4 Golden Signals (Google SRE) qua `prom-client`, scrape bằng Prometheus, vẽ trên Grafana.
(EN: Demo the 4 Golden Signals via prom-client, scraped by Prometheus, visualized in Grafana.)

> Gắn với bài **Module 6.1 — Metrics & Golden Signals**.

---

## 4 Golden Signals

| Signal | PromQL đề xuất |
|---|---|
| **Latency** (p99) | `histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket[5m])) by (le))` |
| **Traffic** (rps) | `sum(rate(http_requests_total[1m]))` |
| **Errors** (%) | `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))` |
| **Saturation** | `http_requests_in_flight` + `process_cpu_user_seconds_total` |

---

## Install & run

```bash
npm install

# Terminal 1 — Nest app
npx nest start --watch

# Terminal 2 — Prometheus + Grafana
docker compose -f .docker/prometheus.yaml up -d
```

Truy cập:
- Nest metrics: http://localhost:3000/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (anonymous Admin đã bật)

---

## Sinh traffic

```bash
# Happy traffic — latency ngẫu nhiên
while true; do curl -s "http://localhost:3000/api/data?latency=$((RANDOM % 400 + 50))" > /dev/null; sleep 0.1; done

# Terminal khác — traffic có 30% lỗi
while true; do curl -s "http://localhost:3000/api/data?fail=0.3&latency=200" > /dev/null; sleep 0.1; done
```

---

## Thiết lập Grafana dashboard

1. Vào http://localhost:3001.
2. **Connections → Add data source → Prometheus**, URL `http://prometheus:9090`, Save.
3. Tạo Dashboard 4 panel dùng PromQL bên trên.

---

## RED Method — phiên bản dành riêng cho Microservices API

| | Ý nghĩa | Đổi từ Golden |
|---|---|---|
| **R**ate | Requests / second | = Traffic |
| **E**rrors | % 5xx | = Errors |
| **D**uration | Latency (p99) | = Latency |

(Saturation được đẩy xuống layer infra — node CPU, pod memory...)

---

## Vì sao KHÔNG dùng average latency

- `avg`: 99 request 1ms + 1 request 10s → avg = 100ms, che mất đau đớn của 1% user.
- Luôn dùng **percentile** (p50/p95/p99) qua histogram.

---

## Cleanup

```bash
docker compose -f .docker/prometheus.yaml down -v
```

---

## References
- [Google SRE — The 4 Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/)
- [prom-client](https://github.com/siimon/prom-client)
- [Grafana PromQL cheat sheet](https://promlabs.com/promql-cheat-sheet/)
