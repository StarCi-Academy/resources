# DTOs and Data Validation
# (EN: DTOs and Data Validation)

Bảo vệ ứng dụng khỏi dữ liệu xấu. Học cách xây dựng Đối tượng Chuyển đổi Dữ liệu (DTOs) và thực thi một cách hệ thống các quy tắc kiểm tra (validation) bằng `ValidationPipe`.
(EN: Protect your application from bad data. Learn to construct Data Transfer Objects (DTOs) and systematically enforce validation rules using ValidationPipe.)

---

## 🏗️ 1. DTO là gì? (What is a DTO?)

Một **Data Transfer Object (DTO)** là đối tượng định nghĩa hình dạng dữ liệu sẽ được gửi qua mạng. Nó tuyên bố rõ ràng dữ liệu mà Client đang gửi tới một endpoint.
(EN: A DTO is an object that defines the shape of data sent over the network. It explicitly declares what the client is posting to an endpoint.)

Thay vì xử lý dữ liệu thô với kiểu `any` (nguy hiểm), chúng ta dùng class có cấu trúc:
(EN: Instead of dangerous raw `any` types, we use structured classes:)
```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) // ✅ Safe & Predictable
```

---

## 🛡️ 2. Sử dụng Class-Validator (Using Class-Validator)

Trong NestJS, chúng ta kết hợp `class-validator` và `class-transformer` để biến các class DTO thành những tấm khiên bất khả xâm phạm.
(EN: In NestJS, we blend `class-validator` and `class-transformer` to make DTO classes impenetrable shields.)

Sử dụng các decorator như `@IsEmail()`, `@IsString()`, `@MinLength()` để đặt luật chơi cho dữ liệu.
(EN: Use decorators like `@IsEmail()`, `@IsString()`, `@MinLength()` to enforce data rules.)

---

## 🔄 3. Luồng hệ thống (System Flow)

Dữ liệu được "lọc" qua nhiều lớp trước khi chạm tới tầng xử lý nghiệp vụ:
(EN: Data is "filtered" through multiple layers before reaching business logic:)

```
Client (Postman/Curl)
  │
  ▼ [JSON Payload]
ValidationPipe (main.ts)    <── 1. Chặn & Kiểm tra dựa trên DTO Rules
  │                             (Nếu sai -> Trả về 400 Bad Request ngay lập tức)
  │
  ▼ [Clean & Typed DTO]
Controller (Handler)        <── 2. Nhận dữ liệu đã được validate an toàn
  │
  ▼
Service (API Logic)         <── 3. Chỉ tập trung xử lý logic nghiệp vụ
```

---

## ⚙️ 4. ValidationPipe Toàn cục (Global ValidationPipe)

Để kích hoạt, ta cấu hình trong `main.ts` (EN: Configure in `main.ts`):
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // Loại bỏ các trường thừa không nằm trong DTO
  forbidNonWhitelisted: true,   // Báo lỗi nếu có trường thừa
  transform: true,              // Tự động cast kiểu dữ liệu
}));
```

---

## 🛠️ 5. Thiết lập & Chạy (Setup & Run)

```bash
# Cài đặt (EN: Install)
npm install

# Chạy (EN: Run)
npm run start:dev
```

### Ví dụ lỗi Validation (Testing Failure)
```bash
# Gửi name quá ngắn (< 3 ký tự)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Cu\", \"email\": \"wrong-email\", \"age\": 15}"
```
**Kết quả:** Trả về mã lỗi **400 Bad Request** với danh sách các lỗi chi tiết (Name too short, Invalid email, Age < 18).

---

## 📚 6. Tài liệu tham khảo (References)
- [NestJS Validation Techniques](https://docs.nestjs.com/techniques/validation)
- [Class-Validator Decorators](https://github.com/typestack/class-validator#validation-decorators)
