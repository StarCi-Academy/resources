# TypeORM & PostgreSQL Relationship Demo
# (EN: TypeORM & PostgreSQL Relationship Demo)

Dự án minh họa cách thiết lập quan hệ database (1:1, 1:N, N:N) sử dụng TypeORM và PostgreSQL trong NestJS.
(EN: Demonstrates setting up database relationships (1:1, 1:N, N:N) using TypeORM and PostgreSQL in NestJS.)

---

## 🛠️ 1. Thiết lập (Setup & Run)

### 1.1 Khởi chạy Database (Docker) (EN: Run Database)
```bash
# Sử dụng cấu hình PostgreSQL (EN: Use PostgreSQL config)
docker compose -f .docker/postgresql.yaml up --build -d
```

### 1.2 Cài đặt & Chạy (EN: Install & Run)
```bash
npm install
npm run start:dev
```

---

## 🏗️ 2. Hệ thống thực thể & Quan hệ (Entities & Relations)

Chúng ta sử dụng domain **Cat** làm trung tâm để minh họa:
(EN: Using the **Cat** domain to illustrate standard relationships:)

| Loại (Type) | Thực thể (Entities) | Diễn giải (Explanation) |
|---|---|---|
| **1:1** | `Cat` ↔ `CatPassport` | Mỗi con mèo có duy nhất 1 hộ chiếu. (EN: 1 cat, 1 passport.) |
| **1:N** | `Cat` ↔ `Toy` | Một con mèo có thể sở hữu nhiều đồ chơi. (EN: 1 cat, many toys.) |
| **N:N** | `Cat` ↔ `Owner` | Một con mèo có nhiều chủ, và ngược lại. (EN: Many cats, many owners.) |

---

## 🔄 3. Luồng hệ thống (System Flow)

Dữ liệu di chuyển qua các lớp xử lý chuẩn của NestJS:
(EN: Data flows through standard NestJS processing layers:)

```
Client (Postman/Curl)
  │
  ▼
Controller (Entry Point)       <── Receive Request & Pass Data
  │
  ▼
Service (Business Logic)       <── prepare → execute → confirm
  │
  ▼
Repository (TypeORM)           <── Auto-generate SQL with JOINs
  │
  ▼
PostgreSQL Database            <── Persistent Storage
```

1. **Service Layer:** Triển khai logic theo pattern `prepare → execute → confirm`.
2. **TypeORM:** Tự tạo SQL `JOIN` khi sử dụng thuộc tính `{ relations: [...] }` giúp lấy data lồng nhau chỉ trong 1 lần query.

---

## 📡 4. API Endpoints

- `GET /cats`: Lấy toàn bộ mèo kèm theo Joins dữ liệu từ passport, toys và owners.
- `POST /cats`: Tạo mèo mới. Nhờ `cascade: true`, bạn có thể gửi dữ liệu lồng nhau và TypeORM sẽ tự động lưu vào tất cả các bảng.
- `GET /cats/:id`: Xem chi tiết một con mèo.

---

## 📚 5. Tài liệu tham khảo (References)
- [TypeORM Relations Official Guide](https://typeorm.io/relations)
- [TypeORM Many-to-Many](https://typeorm.io/many-to-many-relations)
