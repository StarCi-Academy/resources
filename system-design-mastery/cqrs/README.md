# CQRS Pattern — NestJS Demo (RabbitMQ EventBus)
# (EN: CQRS Pattern — NestJS Demo (RabbitMQ EventBus))

Dự án minh họa pattern **Command Query Responsibility Segregation (CQRS)** sử dụng **RabbitMQ** làm EventBus để đồng bộ dữ liệu giữa Write Model (PostgreSQL) và Read Model (Elasticsearch).
(EN: Demonstrates the **Command Query Responsibility Segregation (CQRS)** pattern using **RabbitMQ** as an EventBus to synchronize data between the Write Model (PostgreSQL) and the Read Model (Elasticsearch).)

---

## 🛠️ 1. Thiết lập (Setup)

### 1.1 Cài đặt phụ thuộc (Install Dependencies)
```bash
npm install
```

---

## 🚀 2. Chạy dịch vụ (Run Services)

### 2.1 Khởi chạy Infrastructure (Docker) (EN: Run Infrastructure)
Sử dụng các file cấu hình trong thư mục `.docker/` (EN: Use config files in `.docker/`):

```bash
# 1. Khởi chạy PostgreSQL (Write Model)
docker compose -f .docker/postgresql.yaml up --build -d

# 2. Khởi chạy Elasticsearch (Read Model)
docker compose -f .docker/elasticsearch.yaml up --build -d

# 3. Khởi chạy RabbitMQ (EventBus)
docker compose -f .docker/rabbitmq.yaml up --build -d
```

---

## 💻 3. Chạy ứng dụng (Run Application)

Mở **2 terminal** để chạy song song:

**Terminal 1 — Command Service (Port 3000)**
```bash
npx nest start command --watch
```

**Terminal 2 — Query Service (Port 3001)**
```bash
npx nest start query --watch
```

---

## 🏗️ 4. Kiến trúc (Architecture)

| Thành phần (Component) | Port | Công nghệ (Tech) | Trách nhiệm (Responsibility) |
|---------|------|----------|------------------|
| **Command Service** | 3000 | PostgreSQL | Tiếp nhận Commands, lưu vào DB chính, phát Event qua RabbitMQ. |
| **EventBus** | 5672 | RabbitMQ | Cầu nối truyền tin bất đồng bộ giữa hai service. |
| **Query Service** | 3001 | Elasticsearch | Lắng nghe Event từ EventBus để cập nhật ES và xử lý Queries từ Client. |

---

## 🔄 5. Luồng hệ thống (System Flow) (BẮT BUỘC)

Dữ liệu được tách biệt thành hai mô hình Write và Read, đồng bộ qua Distributed Event Bus:
(EN: Data is split into two models: Write and Read, synchronized via Distributed Event Bus:)

```
[WRITE FLOW]
Client → Command Controller → Command Handler → PostgreSQL → RabbitMQ (Event)

[READ FLOW]
RabbitMQ (Event) → Query Controller (Listener) → Event Handler → Elasticsearch
Client → Query Controller → Query Handler → Elasticsearch
```

---

## 📡 6. Thử nghiệm (Try it out)

### 6.1 Ghi dữ liệu (Command)
```bash
curl -X POST http://localhost:3000/customer/update \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"123\", \"name\": \"Cuong\", \"email\": \"cuong@starci.vn\"}"
```

### 6.2 Đọc dữ liệu (Query)
```bash
curl -X GET http://localhost:3001/customer/123
```

---

## 📚 7. Những lưu ý kỹ thuật (Technical Constraints)
- **Service Pattern:** Tuân thủ `prepare → sign → execute → confirm` trong Handler.
- **Microservices Bridge:** Sử dụng hybrid app (HTTP + RMQ) ở phía Query service.
- **Eventual Consistency:** Dữ liệu trong Elasticsearch có độ trễ nhỏ so với PostgreSQL.
- **Scalability:** Có thể scale độc lập bộ đọc và bộ ghi tùy theo tải trọng.
