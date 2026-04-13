# Role-Based Access Control (RBAC) & Guards
# (EN: Role-Based Access Control (RBAC) & Guards)

Thiết lập ranh giới quyền hạn bằng cơ chế Role-Based (RBAC) để chặn các tính năng nhạy cảm bằng hệ thống Guard nghiêm ngặt trong NestJS.
(EN: Establish proper permission boundaries using Role-Based mechanisms to block restricted features behind strictly coded NestJS guards.)

---

## 🏗️ 1. Phân biệt AuthN và AuthZ (Authorization vs Authentication)

Trong khi **Xác thực (Authentication)** chứng minh bạn là *ai*, thì **Phân quyền (Authorization)** chứng minh bạn có thể *làm gì*.
(EN: Authentication proves *who* you are, Authorization proves *what* you can do.)

Nếu một vai trò `Guest` truy cập vào route xóa người dùng (`DEL /users`) với một Access Token hoàn toàn hợp lệ, hệ thống phải ngay lập tức từ chối bằng lỗi `403 Forbidden`.
(EN: If a `Guest` role accesses a `DEL /users` admin route with a valid token, the system must reject it with `403 Forbidden`.)

---

## 🔄 2. Luồng bảo vệ đa lớp (System Flow)

Dữ liệu đi qua hai "trạm gác" trước khi chạm tới tầng xử lý:
(EN: Data passes through two "checkpoints" before reaching the logic layer:)

```
Client (User/Admin)
  │
  ▼ [Request with JWT]
JwtAuthGuard (Checkpoint 1)  <── Kiểm tra Token có hợp lệ không? (EN: Is token valid?)
  │
  ▼ [Success - Attached req.user]
RolesGuard (Checkpoint 2)    <── User có Role cần thiết không? (EN: Does user have Role?)
  │                             (So sánh Metadata @Roles với user.role)
  │
  ▼ [Success]
Controller (Handler)         <── Thực thi nghiệp vụ (EN: Execute Business Logic)
```

---

## 🛡️ 3. Các thành phần chính (Key Components)

- **`@Roles()` Decorator**: Đính kèm metadata danh sách các quyền được phép vào endpoint.
- **`RolesGuard`**: Sử dụng `Reflector` để đọc metadata và so khớp với `role` trong Token của người dùng.
- **`Role Enum`**: Định nghĩa tập hợp các quyền (`ADMIN`, `USER`) để tránh sai sót chính tả.

---

## 🛠️ 4. Thiết lập & Chạy (Setup & Run)

### 4.1 Khởi chạy Database
```bash
docker compose -f .docker/postgresql.yaml up -d
```

### 4.2 Cài đặt & Chạy
```bash
npm install
npm run start:dev
```

### Cách thử nghiệm (Testing)
1. **SignUp Admin:** `POST /auth/signup` với `role: "admin"`.
2. **SignUp User:** `POST /auth/signup` với `role: "user"`.
3. **Test Admin API:** Sử dụng token của User để gọi `GET /admin/dashboard` -> Sẽ nhận về **403 Forbidden**. Chỉ token Admin mới vào được.

---

## 📚 5. Tài liệu tham khảo (References)
- [NestJS Authorization Official Guide](https://docs.nestjs.com/security/authorization)
