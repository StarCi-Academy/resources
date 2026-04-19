# Publish-Subscribe Pattern

Demo Pub/Sub pattern sử dụng NATS. 1 publisher broadcast message đến nhiều subscribers.
(EN: Demo Pub/Sub pattern using NATS. 1 publisher broadcasts messages to multiple subscribers.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Xây dựng publisher service publish events lên NATS subject.
- 3 subscribers subscribe cùng subject, mỗi subscriber xử lý khác nhau:
  - **Analytics**: Đếm và ghi nhận thống kê events.
  - **Notification**: Gửi thông báo (mô phỏng email/SMS).
  - **Audit**: Ghi audit log cho tất cả events.
- So sánh NATS core pub/sub (broadcast) vs Kafka Consumer Groups (load balancing).

### English
- Build a publisher service that publishes events to a NATS subject.
- 3 subscribers subscribe to the same subject, each processing differently:
  - **Analytics**: Counts and records event statistics.
  - **Notification**: Sends notifications (simulates email/SMS).
  - **Audit**: Records audit log for all events.
- Compare NATS core pub/sub (broadcast) vs Kafka Consumer Groups (load balancing).

---

## Cấu trúc thư mục / Directory Structure

```
publish-subscribe-pattern/
├── .docker/
│   └── nats.yaml                      # NATS server + monitoring :8222
├── apps/
│   ├── publisher-service/src/         # :3001 — REST API + NATS publisher
│   │   ├── main.ts                    # HTTP server
│   │   ├── app.module.ts
│   │   ├── app.controller.ts          # POST /events
│   │   ├── app.service.ts             # NATS publish logic
│   │   └── index.ts
│   ├── subscriber-analytics/src/      # Subscriber — thu thập analytics
│   │   ├── main.ts                    # Application context (không có HTTP)
│   │   ├── app.module.ts
│   │   ├── app.service.ts             # NATS subscribe + đếm events
│   │   └── index.ts
│   ├── subscriber-notification/src/   # Subscriber — gửi thông báo
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts             # NATS subscribe + notification
│   │   └── index.ts
│   └── subscriber-audit/src/          # Subscriber — ghi audit log
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.service.ts             # NATS subscribe + audit log
│       └── index.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Luồng hệ thống / System Flow

### Tiếng Việt

```
Client (curl)
    │
    ▼ POST /events
Publisher Service (:3001)
    │
    └── nc.publish("app.events", message)
                    │
                    ▼ NATS Core Pub/Sub (Broadcast)
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
Analytics       Notification      Audit
Subscriber      Subscriber        Subscriber
    │               │               │
    ▼               ▼               ▼
Đếm events     Gửi thông báo    Ghi audit log
```

### Điểm mấu chốt (EN: Key Point)
- **Tất cả 3 subscribers đều nhận CÙNG message** — đây là broadcast pattern.
- NATS dùng **subject** (dấu chấm, vd. `app.events`, `order.created`) thay vì channel.
- Không bật JetStream → fire-and-forget, message không được lưu trữ (giống Redis Pub/Sub).

### English
- **All 3 subscribers receive the SAME message** — this is the broadcast pattern.
- NATS uses **subjects** (dot-separated, e.g. `app.events`, `order.created`) instead of channels.
- JetStream disabled → fire-and-forget, messages are not persisted (same as Redis Pub/Sub).

---

## So sánh NATS vs Kafka vs Redis Pub/Sub

| Tiêu chí / Criteria | NATS core | Kafka | Redis Pub/Sub |
|---------------------|-----------|-------|---------------|
| Pattern | Subject-based pub/sub | Consumer Groups | Channel pub/sub |
| Ai nhận message? | TẤT CẢ subscribers | 1 consumer/group | TẤT CẢ subscribers |
| Message persistence | Không (có với JetStream) | Có — lưu trên disk | Không |
| Throughput | Rất cao (~10M msg/s) | Cao | Cao |
| Latency | Sub-millisecond | ~ms | Sub-millisecond |
| Phù hợp cho / Best for | Microservices, IoT, real-time | Task distribution, replay | Real-time broadcast |
| Khi subscriber offline | Message mất | Message chờ sẵn | Message mất |

---

## Bước 1 — Cài đặt / Step 1 — Install

```bash
npm install
```

---

## Bước 2 — Chạy NATS / Step 2 — Run NATS

```bash
docker compose -f .docker/nats.yaml up -d
```

### Kiểm tra NATS / Verify NATS

```bash
# Truy cập HTTP monitoring (EN: access HTTP monitoring)
curl http://localhost:8222/varz
```

---

## Bước 3 — Chạy 3 subscribers / Step 3 — Run 3 Subscribers

### Tiếng Việt
Chạy 3 subscribers TRƯỚC để chúng sẵn sàng nhận messages:

### English
Run 3 subscribers FIRST so they are ready to receive messages:

```bash
# Terminal 1: Analytics Subscriber
npx nest start subscriber-analytics --watch

# Terminal 2: Notification Subscriber
npx nest start subscriber-notification --watch

# Terminal 3: Audit Subscriber
npx nest start subscriber-audit --watch
```

---

## Bước 4 — Chạy Publisher / Step 4 — Run Publisher

```bash
# Terminal 4: Publisher Service (:3001)
npx nest start publisher-service --watch
```

---

## Bước 5 — Test / Step 5 — Test

```bash
# Publish event "USER_REGISTERED"
# (EN: all 3 subscribers will receive this)
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"USER_REGISTERED","payload":{"userId":1,"name":"Nguyen Van A"}}'

# Publish event "ORDER_PLACED"
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"ORDER_PLACED","payload":{"orderId":42,"amount":999}}'

# Publish event "PAYMENT_COMPLETED"
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"PAYMENT_COMPLETED","payload":{"orderId":42,"method":"credit_card"}}'
```

### Tiếng Việt
Sau mỗi curl, kiểm tra logs ở cả 3 terminal subscribers:

- **Analytics**: `Ghi nhận event USER_REGISTERED — totalCount: 1`
- **Notification**: `Gửi thông báo — Sự kiện "USER_REGISTERED" đã xảy ra`
- **Audit**: `Ghi audit log — auditId: 1, eventType: USER_REGISTERED`

### English
After each curl, check logs in all 3 subscriber terminals:

- **Analytics**: `recorded event USER_REGISTERED — totalCount: 1`
- **Notification**: `sending notification — event "USER_REGISTERED" occurred`
- **Audit**: `recording audit log — auditId: 1, eventType: USER_REGISTERED`

---

## NATS Core Pub/Sub vs NATS JetStream

### Tiếng Việt

| | Core Pub/Sub | JetStream |
|---|--------------|-----------|
| Persistence | Không | Có |
| Consumer groups (queue groups) | Có (cùng conn, load balance) | Có |
| Message replay | Không | Có |
| At-least-once delivery | Không | Có |
| Complexity | Đơn giản | Phức tạp hơn |
| Use case | Real-time broadcast | Event sourcing, work queue |

Project này dùng **Core Pub/Sub** vì mục tiêu là demo broadcast pattern đơn giản.
Nếu muốn mỗi message chỉ 1 subscriber xử lý (load balancing), dùng **queue groups**:
`nc.subscribe("app.events", { queue: "workers" })`.

### English
This project uses **Core Pub/Sub** because the goal is to demo the simple broadcast pattern.
For load-balanced delivery (one subscriber per message), use **queue groups**:
`nc.subscribe("app.events", { queue: "workers" })`.

---

## Wildcard Subjects (NATS-specific)

NATS hỗ trợ wildcard rất mạnh trong subject (EN: NATS supports powerful wildcards in subjects):

- `order.*` — match `order.created`, `order.paid` (1 token)
- `order.>` — match `order.created`, `order.item.added` (nhiều tokens)

Ví dụ: subscriber có thể lắng nghe tất cả events bắt đầu với `app.`:
(EN: e.g. a subscriber can listen to all events starting with `app.`:)

```typescript
nc.subscribe('app.>');
```

---

## Dọn dẹp / Cleanup

```bash
# Dừng NATS (EN: stop NATS)
docker compose -f .docker/nats.yaml down

# Ctrl+C trong các terminal để dừng services
# (EN: Ctrl+C in each terminal to stop services)
```

---

## Tài liệu tham khảo / References

- [NATS Documentation](https://docs.nats.io/)
- [nats.js GitHub](https://github.com/nats-io/nats.js)
- [NATS Subject Design](https://docs.nats.io/nats-concepts/subjects)
- [Publish-Subscribe Pattern](https://microservices.io/patterns/communication-style/messaging.html)
