# Asynchronous Event-Driven Architecture

Demo kiến trúc event-driven sử dụng Apache Kafka. Service publish events, các services khác consume và xử lý bất đồng bộ.
(EN: Demo event-driven architecture using Apache Kafka. Service publishes events, other services consume and process asynchronously.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Xây dựng kiến trúc event-driven với Kafka làm message broker.
- Order Service (producer) tạo đơn hàng và publish event `ORDER_CREATED`.
- Inventory Service (consumer) lắng nghe event → trừ tồn kho.
- Notification Service (consumer) lắng nghe event → gửi thông báo.
- Hai consumers dùng **khác consumer group** → cả hai đều nhận event.

### English
- Build event-driven architecture with Kafka as message broker.
- Order Service (producer) creates orders and publishes `ORDER_CREATED` event.
- Inventory Service (consumer) listens to event → deducts inventory.
- Notification Service (consumer) listens to event → sends notification.
- Two consumers use **different consumer groups** → both receive the event.

---

## Cấu trúc thư mục / Directory Structure

```
asynchronous-event-driven/
├── .docker/
│   └── kafka.yaml                  # Kafka KRaft (không cần Zookeeper)
├── apps/
│   ├── order-service/src/          # :3001 — REST API + Kafka producer
│   │   ├── main.ts                 # HTTP server
│   │   ├── app.module.ts           # TypeORM + Kafka client
│   │   ├── app.controller.ts       # POST /orders
│   │   ├── app.service.ts          # Tạo order + publish event
│   │   ├── order.entity.ts         # TypeORM entity
│   │   └── index.ts
│   ├── inventory-service/src/      # Kafka consumer — trừ tồn kho
│   │   ├── main.ts                 # Kafka microservice (không có HTTP)
│   │   ├── app.module.ts
│   │   ├── app.controller.ts       # @EventPattern handler
│   │   ├── app.service.ts          # Logic trừ tồn kho
│   │   └── index.ts
│   └── notification-service/src/   # Kafka consumer — gửi thông báo
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.controller.ts
│       ├── app.service.ts
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
    ▼ POST /orders
Order Service (:3001)
    │
    ├── 1. Lưu order vào SQLite
    │
    └── 2. Publish "ORDER_CREATED" ──► Kafka Topic: "order-events"
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                                               │
                    ▼                                               ▼
          Inventory Service                               Notification Service
          (group: inventory-consumer)                     (group: notification-consumer)
                    │                                               │
                    ▼                                               ▼
          Trừ tồn kho trong memory                        Log thông báo đơn hàng mới
          (EN: deduct inventory)                          (EN: log new order notification)
```

### English
1. Client sends `POST /orders` to Order Service.
2. Order Service saves order to SQLite, then publishes `ORDER_CREATED` event to Kafka.
3. Inventory Service (consumer group A) receives event → deducts inventory.
4. Notification Service (consumer group B) receives event → sends notification.
5. Both consumers receive the **same event** because they have **different consumer groups**.

---

## Kafka Consumer Groups — Giải thích / Explanation

### Tiếng Việt
- **Cùng group ID**: Chỉ 1 consumer trong group nhận message (load balancing).
- **Khác group ID**: TẤT CẢ consumers đều nhận message (broadcasting).
- Trong project này: `inventory-consumer-group` ≠ `notification-consumer-group` → cả hai đều nhận.

### English
- **Same group ID**: Only 1 consumer in the group receives the message (load balancing).
- **Different group IDs**: ALL consumers receive the message (broadcasting).
- In this project: `inventory-consumer-group` ≠ `notification-consumer-group` → both receive.

---

## Bước 1 — Cài đặt / Step 1 — Install

```bash
npm install
```

---

## Bước 2 — Chạy Kafka / Step 2 — Run Kafka

```bash
docker compose -f .docker/kafka.yaml up --build -d
```

### Kiểm tra Kafka / Verify Kafka

```bash
docker logs kafka-event-driven
```

---

## Bước 3 — Chạy consumers trước / Step 3 — Run Consumers First

### Tiếng Việt
Khởi động consumers TRƯỚC producer để chúng sẵn sàng nhận events:

### English
Start consumers BEFORE producer so they are ready to receive events:

```bash
# Terminal 1: Inventory Consumer
npx nest start inventory-service --watch

# Terminal 2: Notification Consumer
npx nest start notification-service --watch
```

---

## Bước 4 — Chạy producer / Step 4 — Run Producer

```bash
# Terminal 3: Order Service (Producer + REST API)
npx nest start order-service --watch
```

---

## Bước 5 — Test / Step 5 — Test

```bash
# Tạo đơn hàng — sẽ publish event đến cả 2 consumers
# (EN: Create order — will publish event to both consumers)
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"productName":"Laptop","quantity":2}'

# Lấy danh sách đơn hàng (EN: get all orders)
curl http://localhost:3001/orders
```

### Tiếng Việt
Sau khi tạo đơn hàng, kiểm tra logs của cả 2 consumers:
- **Terminal Inventory**: `Đã trừ tồn kho — Laptop: 50 → 48`
- **Terminal Notification**: `Gửi thông báo đơn hàng mới — Order #1`

### English
After creating order, check logs of both consumers:
- **Terminal Inventory**: `inventory deducted — Laptop: 50 → 48`
- **Terminal Notification**: `sending new order notification — Order #1`

---

## Dọn dẹp / Cleanup

```bash
# Dừng Kafka (EN: stop Kafka)
docker compose -f .docker/kafka.yaml down

# Ctrl+C trong các terminal services
# (EN: Ctrl+C in each terminal to stop services)
```

---

## Tài liệu tham khảo / References

- [NestJS Kafka Microservice](https://docs.nestjs.com/microservices/kafka)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Event-Driven Architecture Pattern](https://microservices.io/patterns/data/event-driven-architecture.html)
