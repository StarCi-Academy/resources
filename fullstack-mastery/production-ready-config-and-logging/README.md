# Production-Ready Config & Logging Demo
# (EN: Production-Ready Config & Logging Demo)

Hướng dẫn thiết lập cấu hình đa môi trường (Local / Prod) và hệ thống logging tập trung sử dụng Winston, Loki và Grafana.
(EN: Guide to setting up multi-environment configuration (Local / Prod) and a centralized logging system using Winston, Loki, and Grafana.)

---

## 🚀 1. Tính năng chính (Key Features)

- **Đa môi trường (Multi-env):** Sử dụng `@nestjs/config` để load `.env.local` hoặc `.env.production`.
- **Logging Tập trung (Centralized Logging):**
  - **Console:** Màu sắc đẹp mắt, dễ đọc khi dev. (EN: Pretty colors, easy to read during development.)
  - **File:** Lưu log vào đĩa cứng cho audit. (EN: Save logs to disk for auditing.)
  - **Loki:** Đẩy log trực tiếp lên Grafana stack. (EN: Push logs directly to the Grafana stack.)
- **Bọc Config (Layered Config):** Sử dụng `registerAs()` để quản lý config theo namespace (`app`, `log`).

---

## 🏗️ 2. Luồng xử lý (System Flow)

Luồng khởi tạo và ghi log trong ứng dụng:
(EN: Application initialization and logging flow:)

```
Bootstrap (main.ts)
  │
  ├── Load Env (.env.local / .env.production)
  │     │
  │     └── ConfigService (Register Namespaces)
  │           │
  │           └── WinstonModule (Async Configuration)
  │                 │
  │                 ├── Console Transport (Standard)
  │                 ├── File Transport (If Enabled)
  │                 └── Loki Transport (If Enabled)
  │
  └── Global Logger (set as Winston)
        │
        └── All System/App Logs → Winston Transports
```

---

## ⚙️ 3. Thiết lập môi trường (Environment Setup)

Dự án cung cấp 2 file mẫu:
(EN: The project provides 2 sample files:)

1. **`.env.local`**: Level `debug`, lưu log vào `logs/app.log`, tắt Loki.
2. **`.env.production`**: Level `warn`, tắt file logging, **bật Loki** để push lên server.

### Cách chạy (How to Run):
```bash
# Chạy ở Local (EN: Run locally)
npm run start:dev

# Chạy ở Production (EN: Run as Production)
$env:NODE_ENV="production"; npm run start:dev
```

---

## 📊 4. Giải thích kỹ thuật (Technical Breakdown)

### 4.1 Tại sao dùng Async configuration?
Trong `app.module.ts`, chúng ta dùng `WinstonModule.forRootAsync`. Điều này quan trọng vì **Winston cần các giá trị từ ConfigService** (được load từ file .env) để biết các settings runtime.
(EN: We use `WinstonModule.forRootAsync` because **Winston depends on ConfigService** values to determine runtime settings.)

### 4.2 Global Logger
Trong `main.ts`, chúng ta thay thế hoàn toàn logger mặc định của Nest bằng Winston. Điều này đảm bảo các log từ framework và log từ application đều được định dạng nhất quán và gửi về Loki.
(EN: In `main.ts`, we fully replace the default Nest logger with Winston. This ensures framework and app logs are formatted consistently and sent to Loki.)

---

## 📚 5. Tài liệu tham khảo (References)

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Winston Logging Guide](https://github.com/winstonjs/winston)
