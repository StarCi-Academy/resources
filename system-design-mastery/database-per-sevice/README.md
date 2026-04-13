# Database per Service Pattern — NestJS Demo
# (EN: Database per Service Pattern — NestJS Demo)

Dự án minh họa pattern **Database per Service**. Mỗi microservice quản lý database riêng biệt, đảm bảo tính đóng gói dữ liệu và cho phép sử dụng Polyglot Persistence (mọi service dùng database phù hợp nhất với nó).
(EN: Demonstrates the **Database per Service** pattern. Each microservice manages its own independent database, ensuring data encapsulation and allowing Polyglot Persistence.)

---

## 🛠️ 1. Thiết lập (Setup & Run)

### 1.1 Khởi chạy Databases (Docker) (EN: Run Databases)
Sử dụng các file cấu hình trong thư mục `.docker/` (EN: Use config files in `.docker/`):
```bash
# Khởi chạy PostgreSQL cho Order Service
docker compose -f .docker/postgresql.yaml up -d

# Khởi chạy MongoDB cho Inventory Service
docker compose -f .docker/mongodb.yaml up -d
```

### 1.2 Chạy các services (EN: Run Services)
Mở **2 terminal** riêng biệt để chạy 2 ứng dụng:

**Terminal 1 — Order Service (PostgreSQL)**
```bash
npm install
npx nest start order --watch
```

**Terminal 2 — Inventory Service (MongoDB)**
```bash
npx nest start inventory --watch
```

---

## 🏗️ 2. Kiến trúc (Architecture)

| Service | Port | Database | Trách nhiệm (Responsibility) |
|---------|------|----------|------------------|
| **Order** | 3000 | PostgreSQL | Quản lý đơn hàng (SQL/Relational). |
| **Inventory** | 3001 | MongoDB | Quản lý kho hàng (NoSQL/Document). |

---

## 🔄 3. Luồng hệ thống (System Flow)

Luồng xử lý dữ liệu hoàn toàn độc lập giữa các service:
(EN: Completely independent data flow between services:)

```
[Order Client] ───> [Order Service] ───> [PostgreSQL]
                     (Owns Order Data)

[Inventory Client] ──> [Inventory Service] ──> [MongoDB]
                        (Owns Product Data)
```

> **Lưu ý:** Các service KHÔNG chia sẻ database. Việc truy xuất dữ liệu chéo giữa các service phải được thực hiện qua API hoặc các pattern như **API Composition**, **CQRS** hoặc **Saga**.
> (EN: Services DO NOT share databases. Cross-service data retrieval must be done via APIs or patterns like API Composition, CQRS, or Saga.)

---

## 📡 4. Thử nghiệm (Try it out)

### 4.1 Thêm sản phẩm vào Kho (Inventory - Port 3001)
```bash
curl -X POST http://localhost:3001/inventory \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Macbook M3\", \"stock\": 50}"
```

### 4.2 Tạo đơn hàng (Order - Port 3000)
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"customerId\": \"user_01\", \"totalAmount\": 2500}"
```

---

## 📚 5. Thách thức kỹ thuật (Technical Challenges)
- **Distributed Transactions:** Cần dùng **Saga pattern** để đảm bảo tính nhất quán dữ liệu xuyên suốt các service.
- **Complex Queries:** Cần dùng **CQRS** để gộp data từ nhiều nguồn khác nhau.
- **Eventual Consistency:** Dữ liệu có thể không đồng bộ ngay lập tức.
