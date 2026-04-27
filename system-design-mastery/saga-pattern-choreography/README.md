# Saga Pattern (Choreography) — NestJS Demo
# (EN: Saga Pattern (Choreography) — NestJS Demo)

Dự án minh họa **Choreography-based Saga**. Các microservice liên lạc thông qua **Apache Kafka**, mỗi service quản lý DB riêng (**SQLite**). Không có bộ điều phối trung tâm; thay vào đó, các service tự lắng nghe event và thực hiện logic bù đắp (**Compensation**) khi có lỗi xảy ra.
(EN: Demonstrates a **Choreography-based Saga**. Services communicate via **Apache Kafka**, each managing its own **SQLite** DB. No central orchestrator; instead, services listen to events and perform **Compensation** logic when errors occur.)

---

## 🛠️ 1. Thiết lập (Setup)

### 1.1 Cài đặt phụ thuộc (Install Dependencies)
```bash
npm install
```

---

## 🚀 2. Chạy dịch vụ (Run Services)

### 2.1 Khởi chạy Message Broker (Docker) (EN: Run Kafka)
Sử dụng cấu hình Kafka trong `.docker/` (EN: Use Kafka config in `.docker/`):
```bash
docker compose -f .docker/kafka.yaml up --build -d
```

---

## 💻 3. Chạy ứng dụng (Run Application)

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

## 🏗️ 4. Kiến trúc (Architecture)

| Service | Port | Trách nhiệm (Responsibility) |
|---------|------|--------------|
| **Order** | 3001 | Tạo Order, lắng nghe `inventory-events` để Update trạng thái (Complete/Cancel). |
| **Payment** | 3002 | Xử lý thanh toán, lắng nghe `inventory-events` để thực hiện hoàn tiền (Refund). |
| **Inventory** | 3003 | Kiểm tra kho, trừ kho hoặc phát tán event thất bại (Out of stock). |

---

## 🔄 5. Luồng hệ thống (System Flow) (BẮT BUỘC)

Luồng Saga quản lý giao dịch phân tán thông qua Event:
(EN: Saga flow managing distributed transactions via Events:)

```
Client → Order Controller → Order Service → Kafka (order-events)
Kafka (order-events) → Payment Service → Kafka (payment-events)
Kafka (payment-events) → Inventory Service → Kafka (inventory-events)
Kafka (inventory-events) → Order Service (Complete or Compensation)
```

### 5.1 Success Flow
1. **Order Service**: Tạo order (PENDING) -> Publish `OrderCreated`.
2. **Payment Service**: Lắng nghe `OrderCreated` -> Thanh toán -> Publish `PaymentProcessed`.
3. **Inventory Service**: Lắng nghe `PaymentProcessed` -> Trừ kho -> Publish `InventoryReserved`.
4. **Order Service**: Lắng nghe `InventoryReserved` -> Update order (COMPLETED).

### 5.2 Compensation Flow (Rollback)
1. **Inventory Service**: Hết hàng -> Publish `InventoryFailed`.
2. **Payment Service**: Lắng nghe `InventoryFailed` -> Hoàn tiền -> Publish `PaymentRefunded`.
3. **Order Service**: Lắng nghe `InventoryFailed` -> Update order (CANCELLED).

---

## 📡 6. Thử nghiệm (Try it out)

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

## 📚 7. Tham khảo (References)
- [Saga Pattern Microservices](https://microservices.io/patterns/data/saga.html)
- [NestJS Kafka Microservices](https://docs.nestjs.com/microservices/kafka)
