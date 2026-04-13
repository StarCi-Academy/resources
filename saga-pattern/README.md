# Saga Pattern (Choreography) — NestJS Demo
# (EN: Saga Pattern (Choreography) — NestJS Demo)

Dự án minh họa **Choreography-based Saga**. Các microservice liên lạc thông qua **Apache Kafka**, mỗi service quản lý DB riêng (**SQLite**). Không có bộ điều phối trung tâm; thay vào đó, các service tự lắng nghe event và thực hiện logic bù đắp (**Compensation**) khi có lỗi xảy ra.
(EN: Demonstrates a **Choreography-based Saga**. Services communicate via **Apache Kafka**, each managing its own **SQLite** DB. No central orchestrator; instead, services listen to events and perform **Compensation** logic when errors occur.)

---

## 🛠️ 1. Thiết lập (Setup & Run)

### 1.1 Khởi chạy Message Broker (Docker) (EN: Run Kafka)
Sử dụng cấu hình Kafka trong `.docker/` (EN: Use Kafka config in `.docker/`):
```bash
docker compose -f .docker/kafka.yaml up -d
```

### 1.2 Chạy các services (EN: Run Services)
Mở **3 terminal** riêng biệt để chạy 3 ứng dụng:

```bash
# Terminal 1: Order Service
npx nest start order --watch

# Terminal 2: Payment Service
npx nest start payment --watch

# Terminal 3: Inventory Service
npx nest start inventory --watch
```

---

## 🏗️ 2. Kiến trúc (Architecture)

| Service | Port | Trách nhiệm (Responsibility) |
|---------|------|--------------|
| **Order** | 3001 | Tạo Order, lắng nghe `inventory-events` để Update trạng thái (Complete/Cancel). |
| **Payment** | 3002 | Xử lý thanh toán, lắng nghe `inventory-events` để thực hiện hoàn tiền (Refund). |
| **Inventory** | 3003 | Kiểm tra kho, trừ kho hoặc phát tán event thất bại (Out of stock). |

---

## 🔄 3. Luồng hệ thống (System Flow)

Luồng Saga thành công và thất bại thông qua Event:
(EN: Success and failure Saga flow via Events:)

```
[Order Created] ───> [Kafka: inventory-events]
                         │
                         ▼
             [Inventory Check] ─── (Fail) ───┐
                         │                   │
                      (Success)         [Compensation]
                         │                   │
                         ▼                   ▼
                 [Order Completed]    [Order Cancelled]
                                      [Payment Refunded]
```

---

## 📡 4. Thử nghiệm (Try it out)

### Bước 1: Tạo Order mới (Success path)
```bash
curl -X POST http://localhost:3001/order -d "{\"productId\":2,\"quantity\":1}"
```

### Bước 2: Trigger kiểm tra kho (Thay ORDER_ID bằng id thực tế)
```bash
curl -X POST http://localhost:3003/inventory/check -d "{\"orderId\":ORDER_ID,\"productId\":2,\"quantity\":1}"
```
- **Success:** Dùng `productId: 2` (có hàng) -> Order sẽ thành `COMPLETED`.
- **Compensation:** Dùng `productId: 1` (hết hàng) -> Order sẽ bị `CANCELLED` và Payment sẽ được `REFUNDED`.

---

## 📚 5. Tham khảo (References)
- [Saga Pattern Microservices](https://microservices.io/patterns/data/saga.html)
- [NestJS Kafka Microservices](https://docs.nestjs.com/microservices/kafka)
