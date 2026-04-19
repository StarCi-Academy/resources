# Monitoring vs Observability — The 3 Pillars Intro

Demo 3 trụ cột **Logs + Metrics + Traces** trong cùng 1 NestJS app, liên kết bằng `traceId`.
(EN: Demo the 3 pillars — Logs + Metrics + Traces — in one NestJS app, bound by `traceId`.)

> Gắn với bài **Module 6.0 — Monitoring vs Observability**.

---

## Ý tưởng

```
                   ┌─────── Metrics ───────┐
                   │ /metrics — prom-client │
                   │  http_requests_total   │  → Prometheus scrape
                   │  http_request_duration │
                   └────────────────────────┘
Request ──▶ App ──┤
                   │                  ┌───── Logs ─────┐
                   │                  │ nestjs-pino    │  JSON structured
                   │                  │ + traceId      │  → Loki / Elasticsearch
                   │                  └────────────────┘
                   │
                   └────────── Traces ───────────
                      traceId gắn vào log + header  → Jaeger / Tempo
```

- **Monitoring** (passive): xem dashboard, biết "CPU 95%".
- **Observability** (active): có đủ dữ liệu cấu trúc để trả lời "tại sao request này fail?" mà không cần deploy lại.

---

## Install & run

```bash
npm install
npx nest start --watch
```

---

## Test

```bash
# Gọi nhiều lần để sinh metrics + logs + trace
for i in {1..20}; do
  curl -s -H "x-trace-id: trace-$i" http://localhost:3000/order/$i > /dev/null;
done

# Log (Pino pretty) — có traceId ở mỗi dòng
# [1234] INFO (6-0-observability/1234): step: order-start (reqId=trace-1, traceId=trace-1)

# Metrics — Prometheus format
curl http://localhost:3000/metrics | grep http_request
# http_requests_total{route="/order/:id",status="200"} 16
# http_requests_total{route="/order/:id",status="500"} 4
# http_request_duration_ms_bucket{le="50",route="/order/:id",status="200"} 2
# ...
```

---

## 3 trụ cột — khi nào dùng cái nào

| | Metrics | Logs | Traces |
|---|---|---|---|
| **Dạng dữ liệu** | Số, tag | Text (JSON/plain) | Cây span theo thời gian |
| **Kích thước** | Nhỏ, aggregatable | Lớn (TB/ngày) | Trung bình (sample được) |
| **Tool** | Prometheus, Datadog | Loki, Elasticsearch | Jaeger, Tempo, Zipkin |
| **Trả lời** | Có gì đang sai? (p99 tăng, error rate cao) | Sai ở đâu? (stack trace) | Tại sao sai? (bước nào hang) |

---

## Workflow debug chuẩn SRE

1. Dashboard (**Metrics**) báo đỏ: error rate `/order/:id` tăng.
2. Drill vào **Traces**: chọn 1 request fail, thấy bước "Payment" hang 3s.
3. Copy `traceId`, tìm trong **Logs**: đọc stack trace chi tiết ("invalid visa token").
4. Fix, deploy, theo dõi Metrics ổn lại.

---

## Đường kết nối 3 pillar: `traceId`

- Request tới → middleware sinh / đọc `x-trace-id`.
- Gắn vào context → mọi log của request đều có `traceId`.
- Header `x-trace-id` truyền tiếp sang downstream service.
- OpenTelemetry/Jaeger dùng `traceId` này để vẽ span graph.

---

## Tiếp theo

- **Module 6.1** `metrics-and-golden-signals` — Prometheus + Grafana + 4 Golden Signals.
- **Module 6.2** `centralized-logging` — Loki + Grafana.
- **Module 6.3** `distributed-tracing` — OpenTelemetry + Jaeger.
- **Module 6.4** `alerting-and-incident-response` — Alertmanager.
