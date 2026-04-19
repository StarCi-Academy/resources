# Centralized Logging — Pino → Loki → Grafana

Demo ship structured JSON logs từ NestJS vào Loki, query & vẽ trên Grafana.
(EN: Demo shipping structured JSON logs from NestJS into Loki, query + visualize in Grafana.)

> Gắn với bài **Module 6.2 — Centralized Logging**.

---

## Stack

```
NestJS (pino) ──► stdout (pretty for dev)
       │
       └──► pino-loki transport ──► Loki :3100 ──► Grafana :3001 (Explore tab)
```

Log line ví dụ (JSON → Loki):
```json
{
  "level":"info",
  "time":1715000000000,
  "app":"centralized-logging-demo",
  "env":"dev",
  "traceId":"abc-123",
  "event":"payment.charged",
  "orderId":"42",
  "amount":199,
  "msg":"..."
}
```

---

## Install & run

```bash
npm install

# Terminal 1 — Loki + Grafana
docker compose -f .docker/loki.yaml up -d

# Terminal 2 — Nest app
npx nest start --watch
```

---

## Sinh log

```bash
# Login ok
curl -X POST http://localhost:3000/login \
  -H "x-trace-id: trace-1" \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}'

# Login fail — sinh log error
curl -X POST http://localhost:3000/login \
  -H "x-trace-id: trace-2" \
  -H 'Content-Type: application/json' \
  -d '{"username":"bob","password":"wrong"}'

# Order flow — 4 dòng log cùng traceId
curl http://localhost:3000/order/42 -H "x-trace-id: trace-3"
```

---

## Query trong Grafana (LogQL)

1. Mở http://localhost:3001 → **Connections → Add → Loki** với URL `http://loki:3100` → Save.
2. Vào **Explore** → chọn Loki data source → chạy queries:

```logql
# Toàn bộ log của app
{app="centralized-logging-demo"}

# Chỉ log error
{app="centralized-logging-demo"} |= "\"level\":\"error\""

# Parse JSON, filter theo field
{app="centralized-logging-demo"} | json | event="login.failed"

# Lọc theo traceId — xem toàn bộ hành trình 1 request
{app="centralized-logging-demo"} | json | traceId="trace-3"
```

---

## Quy tắc structured logging

1. **JSON luôn luôn**: máy đọc được, dễ filter.
2. **Key nhất quán**: `traceId`, `userId`, `orderId`, `event`, `level` — thống nhất toàn org.
3. **Không log password, credit card, JWT token** — GDPR/PCI.
4. **Không log vòng lặp nóng** — log cost = network cost.
5. **Correlation**: mọi log phải có `traceId` để join với tracing.

---

## Lifecycle & chi phí

- **Hot tier** (Loki/Elasticsearch): 7-14 ngày để debug nóng — đắt, nhanh.
- **Cold tier** (S3 / Glacier): 90+ ngày để compliance — siêu rẻ, query chậm.
- Auto-delete log sau N ngày để khỏi nổ bill.

---

## Thay thế Loki bằng ELK

Nếu đã dùng Elasticsearch: đổi target trong `app.module.ts` từ `pino-loki` sang `pino-elasticsearch`. LogQL → Lucene query.

---

## Cleanup

```bash
docker compose -f .docker/loki.yaml down -v
```

---

## References
- [Pino](https://getpino.io/) + [pino-loki](https://github.com/Julien-R44/pino-loki)
- [Grafana Loki — LogQL](https://grafana.com/docs/loki/latest/query/)
