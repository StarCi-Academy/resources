# JWT Authentication Flow
# (EN: JWT Authentication Flow)

Hiểu rõ cơ chế cốt lõi của xác thực phi trạng thái (stateless) bằng cách sử dụng JSON Web Tokens (JWT) và sự khác biệt so với cơ chế Cookie-Session truyền thống.
(EN: Understand the core mechanism of stateless authentication using JSON Web Tokens (JWT) and how it differentiates from traditional server-side session cookies.)

---

## 🏗️ 1. Session vs Token (Sessions vs Tokens)

Trước khi có JWT, Backend sử dụng **Sessions**. Khi bạn đăng nhập, server tạo một bản ghi trong DB (RAM/Redis) và gửi một `session_id` qua cookie.
(EN: Before JWT, backends used **Sessions**. When you logged in, the server created a record in DB/Redis and sent a `session_id` cookie.)

Với kiến trúc Microservices, việc check DB/Redis trung tâm rất chậm. **JWT** giải quyết vấn đề này bằng cách là một cơ chế **phi trạng thái (stateless)**. Backend ký token và giao cho Client. Client gửi token này trong header `Authorization: Bearer <token>`. Server chỉ cần dùng toán học để xác minh chữ ký mà không cần truy vấn database.
(EN: In microservices, checking central DB is slow. **JWT** solves this by being **stateless**. Backend signs the token and hands it to the client. The client sends it back in `Authorization: Bearer <token>` header.)

---

## 🔄 2. Luồng xác thực (Authentication Flow)

Quy trình đăng nhập và truy cập tài nguyên bảo mật:
(EN: Login and secure resource access process:)

```
Client (User)
  │
  ▼ [1] POST /auth/login { user, pass }
AuthService (Server)
  │
  ├── [2] Validate Password
  └── [3] Generate JWT (Signed with Secret)
  │
  ▼ [4] Return { access_token }
Client (Browser/Mobile)
  │
  ▼ [5] GET /users/profile (Header: Authorization Bearer <token>)
JwtAuthGuard (Guard) ───────┐
  │                         │ [6] Verify Crypto Signature
  ▼ (Success)               ▼
UserController (Handler)    (Assign user to Request)
```

---

## 🛡️ 3. Các thành phần demo (Demo Components)

- **`AuthService.login()`**: Nơi ký số (sign) và tạo ra chuỗi JWT.
- **`JwtStrategy`**: Chiến lược xác thực, giải mã (decode) và xác minh chữ ký của Token gửi lên.
- **`JwtAuthGuard`**: Tấm khiên bảo vệ, từ chối mọi request không có Token hợp lệ.

---

## 🛠️ 4. Thiết lập & Chạy (Setup & Run)

### 4.1 Khởi chạy Database (Docker) (EN: Run Database)
```bash
# Sử dụng file cấu hình PostgreSQL (EN: Use PostgreSQL config)
docker compose -f .docker/postgresql.yaml up -d
```

### 4.2 Cài đặt & Chạy ứng dụng (EN: Install & Run)
```bash
# Cài đặt (EN: Install)
npm install

# Chạy (EN: Run)
npm run start:dev
```

### Cách thử nghiệm (Testing)

1. **Đăng ký (Sign Up):**
   ```bash
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"starci@gmail.com\", \"password\": \"123456\"}"
   ```
   *Nhận về Token và User được tạo mới trong bảng `users`.*

2. **Đăng nhập (Sign In):**
   ```bash
   curl -X POST http://localhost:3000/auth/signin \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"starci@gmail.com\", \"password\": \"123456\"}"
   ```
   *Lấy chuỗi `access_token` để truy cập các tài nguyên bảo mật.*

3. **Kiểm tra khu vực bảo mật:**
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/users/profile
   ```

---

## 📚 5. Tài liệu tham khảo (References)
- [NestJS Authentication Official Guide](https://docs.nestjs.com/security/authentication)
- [JWT Introduction (jwt.io)](https://jwt.io/introduction)
