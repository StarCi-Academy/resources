# TypeORM & PostgreSQL Relationship Demo

Dự án minh họa cách thiết lập quan hệ database (1:1, 1:N, N:N) sử dụng TypeORM và PostgreSQL trong NestJS.

---

## 🛠️ Thiết lập (Setup)

### 1. Cài đặt dependencies (EN: Install dependencies)
```bash
npm install
```

### 2. Khởi chạy Database (Docker) (EN: Run Database)
```bash
# Sử dụng cấu hình mẫu trong .docker/ (EN: use sample config in .docker/)
docker compose -f .docker/postgresql.yaml up --build -d
```

### 3. Chạy ứng dụng (EN: Run application)
```bash
npm run start:dev
```

---

## 🏗️ Hệ thống thực thể & Quan hệ (Entities & Relations)

Chúng ta sử dụng domain **Cat** làm trung tâm để minh họa:

| Loại quan hệ | Entities | Diễn giải |
|---|---|---|
| **1:1** (One-to-One) | `Cat` ↔ `CatPassport` | Mỗi con mèo có duy nhất 1 hộ chiếu. |
| **1:N** (One-to-Many) | `Cat` ↔ `Toy` | Một con mèo có thể sở hữu nhiều đồ chơi. |
| **N:N** (Many-to-Many) | `Cat` ↔ `Owner` | Một con mèo có nhiều chủ, và ngược lại. |

---

## 🔄 Luồng hệ thống (System Flow)

```
Client (Postman/Curl) → Controller → Service → Repository → PostgreSQL
```

1. **Controller:** Tiếp nhận HTTP Request.
2. **Service:** Xử lý logic theo pattern `prepare → execute → confirm`.
3. **Repository:** TypeORM tự tạo câu lệnh SQL với `JOIN` khi dùng `{ relations: [...] }`.
4. **PostgreSQL:** Lưu trữ dữ liệu với toàn vẹn khóa ngoại.

---

## 📡 API Endpoints

### 1. Lấy danh sách kèm JOIN (EN: Get all with JOIN)
**GET** `/cats`
Trả về toàn bộ mèo cùng với passport, toys và owners của chúng.

### 2. Tạo mèo mới (CASCADE) (EN: Create new cat)
**POST** `/cats`
```json
{
  "name": "Nyan Cat",
  "passport": { "passportNumber": "CAT-123" },
  "toys": [{ "name": "Soft Ball" }, { "name": "Fake Mouse" }],
  "owners": [{ "name": "Alice" }, { "name": "Bob" }]
}
```
*Ghi chú: Nhờ `cascade: true`, TypeORM sẽ tự động lưu các bảng liên quan.*

### 3. Xem chi tiết (EN: Get details)
**GET** `/cats/:id`

---

## 📝 Quy tắc lập trình (Coding Rules)

Dự án tuân thủ tiêu chuẩn **AGENTS.md**:
- **Bilingual (VI+EN):** Mọi JSDoc và comment đều viết song ngữ.
- **Line-by-line WHY:** Giải thích lý do của các bước logic quan trọng.
- **Barrel Export:** Sử dụng `index.ts` để tối ưu việc import.
- **Service Pattern:** `prepare → execute → confirm`.

---

## 📚 Tài liệu tham khảo (References)

- [TypeORM Relations](https://typeorm.io/relations)
- [Nested Joins in TypeORM](https://typeorm.io/find-options#basic-options)
