# Mongoose & MongoDB Demo

Dự án minh họa cách sử dụng Mongoose để quản lý dữ liệu NoSQL trong NestJS, bao gồm thiết lập Schema, Collection và các câu lệnh truy vấn cơ bản.

---

## 🛠️ Thiết lập (Setup)

### 1. Cài đặt dependencies (EN: Install dependencies)
```bash
npm install
```

### 2. Khởi chạy Database (Docker) (EN: Run Database)
```bash
# Sử dụng cấu hình mẫu trong .docker/ (EN: use sample config in .docker/)
docker compose -f .docker/mongodb.yaml up --build -d
```

### 3. Chạy ứng dụng (EN: Run application)
```bash
npm run start:dev
```

---

## 🏗️ Cấu trúc Schema (Schema Structure)

Chúng ta sử dụng **CatSchema** với các tính năng đặc thù của MongoDB:
- **Index:** Đánh index cho trường `name` để tối ưu tìm kiếm.
- **Timestamps:** Tự động quản lý `createdAt` và `updatedAt`.
- **Dynamic fields:** `metadata` kiểu Object cho phép lưu trữ dữ liệu không định hình.
- **Arrays:** `hobbies` lưu trữ danh sách sở thích.

---

## 🔄 Luồng hệ thống (System Flow)

```
Client → Controller → Service → Model (Mongoose) → MongoDB
```

---

## 📡 Mongoose Syntax Basics

Dưới đây là các syntax cơ bản được triển khai trong `CatService`:

| Hành động | Mongoose Syntax | Giải thích |
|---|---|---|
| **Tạo mới** | `new this.catModel(data).save()` | Khởi tạo instance và lưu vào collection. |
| **Tìm tất cả** | `this.catModel.find().exec()` | Lấy toàn bộ documents. |
| **Sắp xếp & Giới hạn** | `.sort({ age: -1 }).limit(10)` | Sắp xếp tuổi giảm dần, lấy 10 bản ghi. |
| **Tìm theo ID** | `this.catModel.findById(id).exec()` | Tìm nhanh bằng `_id`. |
| **Cập nhật** | `findByIdAndUpdate(id, data, { new: true })` | Cập nhật và trả về bản ghi mới nhất. |

---

## 📡 API Endpoints

### 1. Lấy danh sách (EN: Get all)
**GET** `/cats`

### 2. Tạo mèo mới (EN: Create new cat)
**POST** `/cats`
```json
{
  "name": "Luna",
  "age": 2,
  "breed": "British Shorthair",
  "hobbies": ["Sleeping", "Eating"],
  "metadata": {
    "color": "Gray",
    "weight": "4kg"
  }
}
```

### 3. Tìm kiếm theo tên (EN: Search by name)
**GET** `/cats/search?name=Luna`

### 4. Cập nhật (EN: Update)
**PUT** `/cats/:id`

---

## 📚 Tài liệu tham khảo (References)

- [NestJS Mongoose Introduction](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
