# OAuth2 & Google Login Integration
# (EN: OAuth2 & Google Login Integration)

Hiện đại hóa trải nghiệm người dùng bằng cách loại bỏ các biểu mẫu đăng ký tẻ nhạt. Tích hợp Google Single Sign-on mượt mà vào hệ sinh thái Backend của bạn.
(EN: Modernize user acquisition by eliminating tedious registration forms. Integrate OAuth2 Google Single Sign-on smoothly into your backend ecosystem.)

---

## 🏗️ 1. Sức mạnh của Single Sign-On (The Power of SSO)

Yêu cầu người dùng tạo thêm một mật khẩu mới sẽ làm giảm tỷ lệ chuyển đổi. **OAuth2** giải quyết vấn đề này bằng cách để các nhà cung cấp bên thứ ba (Google) xác minh danh tính người dùng.
(EN: Asking users for new passwords drops conversion. **OAuth2** lets providers like Google verify identities.)

Backend NestJS không xử lý mật khẩu. Nó chỉ nhận một token mã hóa từ Google xác minh email của người dùng, sau đó chúng ta trao đổi (Swap) lấy JWT nội bộ của chính mình.
(EN: NestJS doesn't handle passwords. It receives a token from Google, then swaps it for an internal JWT.)

---

## 🔄 2. Luồng xử lý kỹ thuật (Technical Flow)

Quy trình trao đổi Token từ ngoài vào trong:
(EN: Token swap process from outside in:)

```
User (Browser)
  │
  ▼ [1] Click "Login with Google" (GET /auth/google)
NestJS (AuthGuard)
  │
  ├── [2] Redirect tới Google OAuth2 Page
  └── [3] User xác nhận quyền truy cập
  │
  ▼ [4] GET /auth/google/callback?code=...
GoogleStrategy (Server)
  │
  ├── [5] Trao đổi 'code' lấy Google Profile
  └── [6] Map dữ liệu (Email, Name, Picture)
  │
AuthService (Business)
  │
  ├── [7] Kiểm tra DB: Nếu user chưa có -> Silent Register
  └── [8] Sinh JWT nội bộ của hệ thống
  │
  ▼ [9] Return { user, access_token } (Hoặc Redirect tới Frontend)
```

---

## 🛠️ 3. Thiết lập (Setup Strategy)

### 3.1 Google Cloud Console
1. Tạo Project tại [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo OAuth Client ID (Web Application).
3. Thêm Authorized Redirect URIs: `http://localhost:3000/auth/google/callback`.

### 3.2 Khởi chạy ứng dụng
```bash
# Chạy Database (EN: Run Database)
docker compose -f .docker/postgresql.yaml up -d

# Cài đặt & Chạy (EN: Install & Run)
npm install
npm run start:dev
```

---

## 📚 4. Tài liệu tham khảo (References)
- [NestJS OAuth2 Strategy](https://docs.nestjs.com/security/authentication#google-oauth2)
- [Passport-Google-OAuth20](https://www.passportjs.org/packages/passport-google-oauth20/)
