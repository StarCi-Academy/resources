# Mongoose & MongoDB Demo
# (EN: Mongoose & MongoDB Demo)

Dự án minh họa cách sử dụng Mongoose để quản lý dữ liệu NoSQL trong NestJS, bao gồm thiết lập Schema, Collection và các câu lệnh truy vấn cơ bản.
(EN: This project demonstrates using Mongoose to manage NoSQL data in NestJS, including Schema/Collection setup and basic query syntax.)

---

## 🛠️ 1. Thiết lập (Setup & Run)

### 1.1 Khởi chạy Database (Docker) (EN: Run Database)
```bash
# Sử dụng cấu hình MongoDB (EN: Use MongoDB config)
docker compose -f .docker/mongodb.yaml up --build -d
```

### 1.2 Cài đặt & Chạy (EN: Install & Run)
```bash
npm install
npm run start:dev
```

---

## 🏗️ 2. Cấu trúc Schema (Schema Structure)

Chúng ta sử dụng **CatSchema** với các tính năng đặc thù của MongoDB:
(EN: Using **CatSchema** with MongoDB-specific features:)

- **Index:** Đánh index cho trường `name` để tối ưu tìm kiếm. (EN: Indexing 'name' for optimized search.)
- **Timestamps:** Tự động quản lý `createdAt` và `updatedAt`. (EN: Automatic lifecycle management.)
- **Dynamic fields:** `metadata` kiểu Object cho phép lưu trữ dữ liệu không định hình. (EN: Schema-less fields for flexible data.)
- **Arrays:** `hobbies` lưu trữ danh sách sở thích. (EN: Native array support.)

---

## 🔄 3. Luồng hệ thống (System Flow)

Luồng xử lý từ request đến storage (EN: Process flow from request to storage):

```
Client (Postman/Curl)
  │
  ▼
Controller (Entry)
  │
  ▼
Service (API Logic)  <── prepare → execute → confirm
  │
  ▼
Model (Mongoose)     <── Schema validation & Mapping
  │
  ▼
MongoDB Database     <── Document-based Storage
```

---

## 📡 4. Mongoose Syntax Basics

| Hành động (Action) | Mongoose Syntax | Giải thích (Explanation) |
|---|---|---|
| **Tạo mới** | `new this.catModel(data).save()` | Khởi tạo và lưu document. (EN: Create & save.) |
| **Tìm tất cả** | `.find().exec()` | Lấy toàn bộ documents. (EN: Get all.) |
| **Sắp xếp** | `.sort({ age: -1 })` | Sắp xếp theo tuổi giảm dần. (EN: Sort by age desc.) |
| **Cập nhật** | `findByIdAndUpdate(id, data)` | Cập nhật và trả về bản ghi mới nhất. (EN: Atomic update.) |

---

## 📚 5. Tài liệu tham khảo (References)
- [NestJS Mongoose Guide](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Official Documentation](https://mongoosejs.com/docs/guide.html)
