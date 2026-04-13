# RESTful CRUD API Best Practices
# (EN: RESTful CRUD API Best Practices)

Hiểu rõ các nguyên tắc cốt lõi để xây dựng API chuẩn RESTful, dễ dự đoán, ánh xạ đúng các phương thức HTTP và mã trạng thái (status codes) trong NestJS.
(EN: Understand the core principles of building predictable, standard REST APIs mapped to proper HTTP methods and status codes in NestJS.)

---

## 🏗️ 1. Bản chất của REST (The Essence of REST)

REST (Representational State Transfer) không phải là một giao thức nghiêm ngặt mà là một tập hợp các ràng buộc kiến trúc. Một API chuẩn RESTful tổ chức dữ liệu thành các "tài nguyên" (Resources - ví dụ: Users, Products) và sử dụng các phương thức HTTP tiêu chuẩn để thao tác chúng.
(EN: REST is not a strict protocol but a set of architectural constraints. A RESTful API organizes data into "resources" and uses standard HTTP methods to manipulate them.)

---

## 📏 2. Quy tắc đặt tên Tài nguyên (Resource Naming)

Tuyệt đối **không** dùng động từ trong đường dẫn URL. Phương thức HTTP đã mô tả hành động đó rồi. Luôn dùng danh từ số nhiều cho các collection.
(EN: Never use verbs in the URL path. The HTTP method already describes the action. Pluralize nouns for collections.)

| Hành động (Action) | HTTP Method | Route | Mô tả (Description) |
|---|---|---|---|
| **Retrieve all** | `GET` | `/users` | Lấy danh sách người dùng. |
| **Create** | `POST` | `/users` | Tạo mới người dùng. |
| **Retrieve one** | `GET` | `/users/:id` | Lấy chi tiết 1 người dùng. |
| **Replace** | `PUT` | `/users/:id` | Thay thế toàn bộ dữ liệu. |
| **Update** | `PATCH` | `/users/:id` | Cập nhật một phần dữ liệu. |
| **Delete** | `DELETE` | `/users/:id` | Xóa người dùng. |

---

## 🔄 3. Luồng hệ thống (System Flow)

Dữ liệu di chuyển theo mô hình chuẩn của NestJS:
(EN: Data flows through the standard NestJS pattern:)

```
Client (Postman/Curl)
  │
  ▼ [HTTP Method]
Controller (Resource Path)   <── Router mappings (@Get, @Post, etc.)
  │
  ▼
Service (API Logic)           <── prepare → execute → confirm
  │
  ▼
Repository / Mock DB          <── Data persistence
```

---

## 📡 4. Mã trạng thái HTTP (HTTP Status Codes)

Trả về đúng mã trạng thái là cực kỳ quan trọng cho logic của Frontend.
(EN: Returning the correct status code is critical for frontend logic.)

- `200 OK`: Thành công chuẩn cho GET, PUT, PATCH.
- `201 Created`: Thành công cho POST (NestJS tự động xử lý).
- `204 No Content`: Thành công cho DELETE (không có nội dung trả về).
- `400 Bad Request`: Client gửi dữ liệu không hợp lệ.
- `401 Unauthorized`: Thiếu hoặc sai Token xác thực.
- `403 Forbidden`: Token hợp lệ nhưng không có quyền truy cập.
- `404 Not Found`: Tài nguyên không tồn tại.
- `500 Internal Server Error`: Lỗi logic code backend (Bug).

---

## 🛠️ 5. Thiết lập & Chạy (Setup & Run)

```bash
# Cài đặt (EN: Install)
npm install

# Chạy ở mode phát triển (EN: Run development)
npm run start:dev
```

### Ví dụ Curl (Example)
```bash
# Tạo user mới (Tự động trả về 201 Created)
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"name\": \"Cuong\", \"email\": \"cuong@starci.vn\"}"

# Xóa user (Trả về 204 No Content)
curl -X DELETE http://localhost:3000/users/1
```

---

## 📚 6. Tài liệu tham khảo (References)
- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [REST API Tutorial](https://restfulapi.net/)
