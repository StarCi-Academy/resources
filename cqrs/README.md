# CQRS Pattern — NestJS Demo
# (EN: CQRS Pattern — NestJS Demo)

Dự án minh họa pattern **Command Query Responsibility Segregation (CQRS)**. Tách biệt hoàn toàn thao tác thay đổi dữ liệu (Commands) và thao tác truy vấn dữ liệu (Queries) để tối ưu hóa hiệu năng và khả năng mở rộng.
(EN: Demonstrates the **Command Query Responsibility Segregation (CQRS)** pattern. Completely separates data mutation (Commands) and data retrieval (Queries) to optimize performance and scalability.)

---

## 🛠️ 1. Thiết lập (Setup & Run)

### 1.1 Khởi chạy Databases (Docker) (EN: Run Databases)
Sử dụng các file cấu hình trong thư mục `.docker/` (EN: Use config files in `.docker/`):
```bash
# Khởi chạy PostgreSQL (Write Model)
docker compose -f .docker/postgresql.yaml up -d

# Khởi chạy Elasticsearch (Read Model)
docker compose -f .docker/elasticsearch.yaml up -d
```

### 1.2 Chạy các services (EN: Run Services)
Mở **2 terminal** để chạy song song:

**Terminal 1 — Command handler (Write)**
```bash
npm install
npx nest start command --watch
```

**Terminal 2 — Query handler (Read)**
```bash
npx nest start query --watch
```

---

## 🏗️ 2. Kiến trúc (Architecture)

| Module | Port | Database | Trách nhiệm (Responsibility) |
|---------|------|----------|------------------|
| **Command** | 3000 | PostgreSQL | Xử lý ghi dữ liệu thông qua `CommandBus`. Phát event sau khi update thành công. |
| **Query** | 3001 | Elasticsearch | Xử lý đọc dữ liệu thông qua `QueryBus`. Lắng nghe event để đồng bộ Read Model. |

---

## 🔄 3. Luồng hệ thống (System Flow)

Dữ liệu được tách biệt thành hai mô hình Write và Read:
(EN: Data is split into two models: Write and Read:)

```
[Write Client] ───> [Command app] ───> [PostgreSQL]
                        │               (Write Model)
                        └─> [EventBus] ─────┐
                                            │ (Pub/Sub)
                                            ▼
[Read Client] <─── [Query app] <──── [Elasticsearch]
                        │               (Read Model)
                        └─> [Sync projections]
```

---

## 📡 4. Thử nghiệm (Try it out)

### 4.1 Cập nhật thông tin qua bộ Command (Port 3000)
```bash
curl -X POST http://localhost:3000/customer/update \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"123\", \"name\": \"Cuong\", \"email\": \"cuong@starci.vn\"}"
```

### 4.2 Truy vấn thông tin qua bộ Query (Port 3001)
```bash
curl -X GET http://localhost:3001/customer/123
```

---

## 📚 5. Những lưu ý kỹ thuật (Technical Constraints)
- **Eventual Consistency:** Model Query được cập nhật bất đồng bộ, dữ liệu có thể trễ vài mili giây.
- **Complexity:** Phải duy trì hai cơ sở dữ liệu và logic đồng bộ (projections).
- **Reliability:** Cần dùng Kafka/RabbitMQ nếu triển khai microservices thực thụ.
