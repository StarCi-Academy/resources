# Refresh Token Master Strategy
# (EN: Refresh Token Master Strategy)

Khám phá lý do tại sao Access Tokens phải bị giới hạn nghiêm ngặt và học cách triển khai cơ chế Refresh Token Rotation (xoay vòng) một cách an toàn nhất.
(EN: Discover why Access Tokens must be heavily restricted and learn how to implement strict Refresh Token rotation mechanisms explicitly.)

---

## 🏗️ 1. Tại sao cần Refresh Token? (Why Refresh Tokens?)

Nếu Hacker đánh cắp được JWT, họ sẽ chiếm quyền control user. Vì JWT là phi trạng thái, bạn **không thể** dễ dàng vô hiệu hóa một token cụ thể trên DB (trừ khi dùng Redis blocklist tốn kém).
(EN: If a JWT is stolen, the hacker gains user control. Since JWT is stateless, invalidating a specific token is hard without a costly blocklist.)

Để giảm thiểu rủi ro, **Access Token (AT)** được đặt thời gian hết hạn cực ngắn (ví dụ: 15 phút). **Refresh Token (RT)** là token thứ hai, bảo mật hơn, có thời hạn dài (ví dụ: 7 ngày) được dùng chỉ để yêu cầu cấp lại AT mới.
(EN: To minimize risk, AT has a short lifespan (15m). RT is a secondary, secure token with a long lifespan (7d) used only to request new ATs.)

---

## 🔄 2. Luồng Xoay vòng & Thu hồi (Rotation & Revocation Flow)

Dự án này triển khai cơ chế **Rotation** (mỗi lần refresh sẽ đổi cả AT và RT mới) và **Revocation** (Đăng xuất để vô hiệu hóa RT hoàn toàn).
(EN: This project implements **Rotation** (new AT & RT on every refresh) and **Revocation** (Logout to invalidate RT).)

```
Client (User)
  │
  ▼ [1] POST /auth/signin
AuthService (Server)
  │
  ├── [2] Cấp AT (15m) & RT (7d)
  └── [3] Lưu mã băm (Hash) của RT vào DB
  │
  ▼ [4] Return { at, rt }
Client
  │
  ▼ [5] AT hết hạn -> POST /auth/refresh (Gửi kèm RT)
AuthService (Server)
  │
  ├── [6] Verify chữ ký RT & So khớp Hash trong DB
  ├── [7] Sinh cặp AT & RT MỚI (Rotation)
  └── [8] Cập nhật Hash mới vào DB (Vô hiệu RT cũ)
  │
  ▼ [9] Return { new_at, new_rt }
```

---

## 🛡️ 3. Lưu trữ An toàn (Secure Storage)

- **Database:** Chúng ta không bao giờ lưu RT thô. Chỉ lưu **Bcrypt Hash** của RT trong bảng `users` (`refreshTokenHash`).
- **Rotation:** Ngay khi RT được sử dụng, nó sẽ bị thay thế bằng một RT mới, giúp phát hiện sớm các hành vi đánh cắp token.

---

## 🛠️ 4. Thiết lập & Chạy (Setup & Run)

### 4.1 Khởi chạy Database (Docker)
```bash
docker compose -f .docker/postgresql.yaml up -d
```

### 4.2 Cài đặt & Chạy
```bash
npm install
npm run start:dev
```

### Cách thử nghiệm (Testing)
1. **SignIn:** Lấy cặp token đầu tiên.
2. **Refresh:** Gửi RT lên để lấy cặp token mới. Thử lại với RT cũ -> Sẽ bị từ chối (Vô hiệu hóa thành công).
3. **Logout:** Gửi AT lên để xóa Hash trong DB. Mọi RT sau đó đều không sử dụng được nữa.

---

## 📚 5. Tài liệu tham khảo (References)
- [Refresh Tokens - Auth0](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
