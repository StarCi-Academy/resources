# Distributed Tracing — OpenTelemetry + Jaeger

Demo trace 1 request chạy qua 3 microservice, xem flame graph trên Jaeger UI.
(EN: Demo a single request flowing through 3 microservices, view flame graph in Jaeger UI.)

> Gắn với bài **Module 6.3 — Distributed Tracing**.

---

## Kiến trúc

```
curl /checkout
       │
       ▼
  api-gateway :3000 ───────► order-service :3001 ───────► payment-service :3002
       │                            │                              │
       │                    [span: validate-order]         [span: charge-credit-card]
       │                            │                              │
       └─────────── spans ──────────┴──────────────────────────────┘
                         OTLP HTTP → Jaeger :4318
                                  │
                                  ▼
                           Jaeger UI :16686
```

Cả 3 service đều bootstrap `startOtel()` ở dòng đầu tiên của `main.ts`.
Auto-instrumentation tự hook vào HTTP & axios, tự inject `traceparent` header → context propagate xuyên suốt 3 service.

---

## Install & run

```bash
npm install
docker compose -f .docker/jaeger.yaml up -d

# 3 terminal, 1 cho mỗi service
npm run start:gateway
npm run start:order
npm run start:payment
```

---

## Test

```bash
curl http://localhost:3000/checkout
```

Vào Jaeger UI: http://localhost:16686
- Chọn service `api-gateway` → Find Traces.
- Click vào trace vừa sinh → thấy flame graph:
  ```
  api-gateway: GET /checkout       (280ms)
    ├─ axios GET /order            (250ms)
    │   └─ order-service: GET /order
    │       ├─ validate-order       (40ms)   ← custom span
    │       └─ axios POST /charge   (205ms)
    │           └─ payment-service: POST /charge
    │               └─ charge-credit-card (200ms)
  ```

Điểm vàng: chỉ 1 trace ID duy nhất chạy xuyên 3 service.

---

## Context propagation — cách headed được bơm

- OTEL auto-instrumentation bắt axios outgoing call, inject header:
  ```
  traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
  ```
- Downstream Express server auto-extract header, parent span ID được dùng để gắn span con.
- Kết quả: cây trace liền mạch không cần code thủ công.

---

## Trace vs Span

| Khái niệm | Ý nghĩa |
|---|---|
| **Trace** | Toàn bộ hành trình end-to-end của 1 request — định danh bằng `traceId` duy nhất |
| **Span** | 1 bước trong trace (HTTP call, DB query, function) — có `name`, `startTime`, `endTime`, `attributes` |
| **Parent/Child** | Span cha spawn span con → cây |

---

## Sampling — đừng lưu 100% trace

Production: 100% request = TB span/ngày, tốn tiền.

```ts
// Trong tracing.ts, thêm sampler
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
const sdk = new NodeSDK({
  sampler: new TraceIdRatioBasedSampler(0.1),  // sample 10%
  ...
});
```

- Luôn sample 100% trace có lỗi (tail sampling ở collector).
- Sample 1-10% trace bình thường.

---

## Thay Jaeger bằng Tempo / Zipkin / SigNoz

Chỉ đổi `OTLPTraceExporter` URL — code service giữ nguyên. Đó là sức mạnh của OpenTelemetry standard.

---

## Cleanup

```bash
docker compose -f .docker/jaeger.yaml down
```

---

## References
- [OpenTelemetry Node.js docs](https://opentelemetry.io/docs/languages/js/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
- [Jaeger UI docs](https://www.jaegertracing.io/docs/)
