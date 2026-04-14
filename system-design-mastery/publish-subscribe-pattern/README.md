# Publish-Subscribe Pattern

Demo Pub/Sub pattern sử dụng Redis Pub/Sub. 1 publisher broadcast message đến nhiều subscribers.
(EN: Demo Pub/Sub pattern using Redis Pub/Sub. 1 publisher broadcasts messages to multiple subscribers.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Xây dựng publisher service publish events lên Redis channel.
- 3 subscribers subscribe cùng channel, mỗi subscriber xử lý khác nhau:
  - **Analytics**: Đếm và ghi nhận thống kê events.
  - **Notification**: Gửi thông báo (mô phỏng email/SMS).
  - **Audit**: Ghi audit log cho tất cả events.
- So sánh Pub/Sub (broadcast) vs Consumer Groups (load balancing) trong Asynchronous Event-Driven.

### English
- Build a publisher service that publishes events to a Redis channel.
- 3 subscribers subscribe to the same channel, each processing differently:
  - **Analytics**: Counts and records event statistics.
  - **Notification**: Sends notifications (simulates email/SMS).
  - **Audit**: Records audit log for all events.
- Compare Pub/Sub (broadcast) vs Consumer Groups (load balancing) from Asynchronous Event-Driven module.

---

## Cấu trúc thư mục / Directory Structure

```
publish-subscribe-pattern/
├── .docker/
│   └── redis.yaml                     # Redis server
├── apps/
│   ├── publisher-service/src/         # :3001 — REST API + Redis publisher
│   │   ├── main.ts                    # HTTP server
│   │   ├── app.module.ts
│   │   ├── app.controller.ts          # POST /events
│   │   ├── app.service.ts             # Redis publish logic
│   │   └── index.ts
│   ├── subscriber-analytics/src/      # Subscriber — thu thập analytics
│   │   ├── main.ts                    # Application context (không có HTTP)
│   │   ├── app.module.ts
│   │   ├── app.service.ts             # Redis subscribe + đếm events
│   │   └── index.ts
│   ├── subscriber-notification/src/   # Subscriber — gửi thông báo
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts             # Redis subscribe + notification
│   │   └── index.ts
│   └── subscriber-audit/src/          # Subscriber — ghi audit log
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.service.ts             # Redis subscribe + audit log
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
    └── redis.publish("app-events", message)
                    │
                    ▼ Redis Pub/Sub (Broadcast)
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
- Khác với Asynchronous Event-Driven (Kafka Consumer Groups) nơi mỗi message chỉ 1 consumer xử lý.

### English
- **All 3 subscribers receive the SAME message** — this is the broadcast pattern.
- Different from Asynchronous Event-Driven (Kafka Consumer Groups) where each message is processed by only 1 consumer.

---

## So sánh Kafka vs Redis Pub/Sub

| Tiêu chí / Criteria | Kafka (Event-Driven) | Redis Pub/Sub |
|---------------------|----------------------|---------------|
| Pattern | Consumer Groups | Publish-Subscribe |
| Ai nhận message? | 1 consumer/group | TẤT CẢ subscribers |
| Message persistence | Có — lưu trên disk | Không — fire and forget |
| Phù hợp cho / Best for | Task distribution, replay | Real-time broadcast, notifications |
| Khi subscriber offline | Message chờ sẵn | Message mất |

---

## Bước 1 — Cài đặt / Step 1 — Install

```bash
npm install
```

---

## Bước 2 — Chạy Redis / Step 2 — Run Redis

```bash
docker compose -f .docker/redis.yaml up --build -d
```

### Kiểm tra Redis / Verify Redis

```bash
docker exec -it redis-pubsub redis-cli ping
# Output: PONG
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

## Redis Pub/Sub vs Redis Streams

### Tiếng Việt

| | Pub/Sub | Streams |
|---|---------|---------|
| Persistence | Không | Có |
| Consumer groups | Không | Có |
| Message replay | Không | Có |
| Complexity | Đơn giản | Phức tạp hơn |
| Use case | Real-time broadcast | Event sourcing, task queue |

Project này dùng **Pub/Sub** vì mục tiêu là demo broadcast pattern đơn giản.

### English
This project uses **Pub/Sub** because the goal is to demo the simple broadcast pattern.

---

## Dọn dẹp / Cleanup

```bash
# Dừng Redis (EN: stop Redis)
docker compose -f .docker/redis.yaml down

# Ctrl+C trong các terminal để dừng services
# (EN: Ctrl+C in each terminal to stop services)
```

---

## Tài liệu tham khảo / References

- [Redis Pub/Sub Documentation](https://redis.io/docs/manual/pubsub/)
- [ioredis GitHub](https://github.com/redis/ioredis)
- [Publish-Subscribe Pattern](https://microservices.io/patterns/communication-style/messaging.html)
