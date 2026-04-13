# Unified Responses & Exception Filters
# (EN: Unified Responses & Exception Filters)

Cung cấp trải nghiệm API nhất quán cho đội ngũ Frontend. Thực thi một cấu trúc JSON đồng nhất cho cả phản hồi thành công và các trạng thái lỗi một cách hoàn toàn tự động.
(EN: Provide a predictable API experience for Frontend teams. Enforce an identical JSON structure for both successful responses and error states completely automatically.)

---

## 🏗️ 1. Sự hỗn loạn của API không đồng nhất (The Chaos of Inconsistent APIs)

Nếu Frontend phải parse `data.user[0]` ở một endpoint này nhưng lại là `userEntity.email` ở endpoint khác, tốc độ phát triển sẽ bị kéo chậm lại đáng kể. Trong các dự án lớn, Backend PHẢI tuân thủ một JSON Contract duy nhất.
(EN: Inconsistent API structures slow down frontend development. In large teams, the backend must strictly stick to a single, unified JSON contract.)

---

## 🔄 2. Luồng xử lý (System Flow)

Dữ liệu được "chế biến" lại tại cửa ngõ ra (Exit Gate) của ứng dụng:
(EN: Data is "reprocessed" at the application's Exit Gate:)

```
Client (Frontend)
   │
   ▼ [Standard HTTP Request]
Controller (Handler)         <── Xử lý Business Logic
   │
   ├─ (Thành công) ───> [Transform Interceptor] ───> { statusCode, message, data, timestamp }
   │
   └─ (Thất bại) ─────> [All Exceptions Filter] ───> { statusCode, error, message, timestamp }
```

---

## 🛡️ 3. Các thành phần chính (Key Components)

### 3.1 Global Response Interceptor
Bắt lấy kết quả đầu ra của controller và bọc chúng vào một cấu trúc chuẩn. Sử dụng decorator `@ResponseMessage` để tùy chỉnh thông điệp thành công.
(EN: Catches controller output and wraps it into a standard shape. Use `@ResponseMessage` to customize success messages.)

### 3.2 Global Exception Filter
"Tấm lưới" bảo vệ cuối cùng. Dù là lỗi logic hay hệ thống crash, Frontend sẽ không bao giờ nhận được trang lỗi HTML thô mà luôn là một object JSON có cấu trúc rõ ràng.
(EN: The final safety blanket. Whether it's a logic error or a system crash, the Frontend never receives raw HTML error pages.)

---

## 🛠️ 4. Thiết lập & Chạy (Setup & Run)

```bash
# Cài đặt (EN: Install)
npm install

# Chạy (EN: Run)
npm run start:dev
```

### Kiểm tra kết quả (How to Test)
1. **Thành công:** `GET /users` -> Nhận được JSON bọc với message "Lấy danh sách thành công".
2. **Thất bại:** `POST /users` (body rỗng) -> Nhận được JSON lỗi có cấu trúc tương tự.

---

## 📚 5. Tài liệu tham khảo (References)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
