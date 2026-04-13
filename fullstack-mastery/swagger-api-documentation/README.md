# Unified Responses, Exception Filters & API Docs
# (EN: Unified Responses, Exception Filters & API Docs)

Cung cấp trải nghiệm API nhất quán cho đội ngũ Frontend. Thực thi một cấu trúc JSON đồng nhất cho cả phản hồi thành công và các trạng thái lỗi một cách hoàn toàn tự động, kết hợp với tài liệu API chuyên nghiệp từ Swagger và Scalar.
(EN: Provide a predictable API experience for Frontend teams. Enforce an identical JSON structure for both successful responses and error states automatically, combined with professional API documentation using Swagger and Scalar.)

---

## 🏗️ 1. Thống nhất hóa Phản hồi (Unified Response Shape)

Nếu Frontend phải parse dữ liệu với nhiều cấu trúc khác nhau (ví dụ: chỗ thì `data.items`, chỗ thì `entity.list`), tốc độ phát triển sẽ bị kéo chậm lại. Trong các dự án lớn, Backend PHẢI tuân thủ một JSON Contract duy nhất.
(EN: Inconsistent API structures slow down frontend development. In large projects, Backend MUST adhere to a single strict JSON contract.)

Dự án này sử dụng:
- **`TransformInterceptor`**: Tự động bọc mọi kết quả thành công vào object có `statusCode`, `message`, `data`, và `timestamp`.
- **`AllExceptionsFilter`**: "Tấm lưới" bảo vệ cuối cùng, đảm bảo mọi lỗi (kể cả lỗi crash 500) đều trả về JSON có cấu trúc tương tự.

---

## 🔄 2. Luồng hệ thống (System Flow)

Dữ liệu được xử lý tập trung tại "cửa ngõ" ra vào của NestJS:
(EN: Data is centrally processed at NestJS "entry/exit" gates:)

```
Client (Frontend)
  │
  ▼ [Request]
Controller (Handler)         <── Logic xử lý (EN: Business Logic)
  │
  ├─ (Thành công) ───> [Transform Interceptor] ───> { statusCode, data, timestamp }
  │
  └─ (Có lỗi) ───────> [All Exceptions Filter] ───> { statusCode, error, message, ... }
```

---

## 📚 3. Tài liệu API (Swagger & Scalar)

Thay vì dùng Swagger UI mặc định, dự án này tích hợp **Scalar** — một giao diện hiện đại và trực quan hơn để tra cứu API.
(EN: Instead of default Swagger UI, this project integrates **Scalar** — a modern and intuitive interface for API documentation.)

| Tài liệu (Docs) | URL |
|---|---|
| **Scalar UI (Modern)** | `http://localhost:3000/scalar` |
| **Swagger UI (Classic)** | `http://localhost:3000/swagger` |

Sử dụng `@ApiProperty()` và `@ApiOperation()` để mô tả chi tiết từng endpoint ngay trong code.
(EN: Use `@ApiProperty()` and `@ApiOperation()` to describe endpoints directly in code.)

---

## 🛠️ 4. Thiết lập & Chạy (Setup & Run)

```bash
# Cài đặt (EN: Install)
npm install

# Chạy (EN: Run)
npm run start:dev
```

### Kiểm tra API (How to test)
1. Truy cập `/scalar` để xem tài liệu.
2. Gọi `GET /cats` để thấy cấu trúc phản hồi thành công được bọc bởi Interceptor.
3. Gọi `GET /cats/error-demo` để thấy cấu trúc lỗi được thống nhất bởi Exception Filter.

---

## 📖 5. Tài liệu tham khảo (References)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [Scalar NestJS Reference](https://www.npmjs.com/package/@scalar/nestjs-api-reference)
