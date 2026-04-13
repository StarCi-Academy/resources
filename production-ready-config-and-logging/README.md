# Production-Ready Config & Logging Demo

Hướng dẫn thiết lập cấu hình đa môi trường (Local / Prod) và hệ thống logging tập trung sử dụng Winston, Loki và Grafana.

---

## 🚀 Tính năng chính (Key Features)

- **Đa môi trường (Multi-env):** Sử dụng `@nestjs/config` để load `.env.local` hoặc `.env.production`.
- **Logging Tập trung (Centralized Logging):**
  - **Console:** Màu sắc đẹp mắt, dễ đọc khi dev.
  - **File:** Lưu log vào đĩa cứng (thường dùng ở local/staging).
  - **Loki:** Đẩy log trực tiếp lên Grafana stack (dùng ở production).
- **Cấu trúc Config phân lớp (Layered Config):** Sử dụng `registerAs()` để namespace cấu hình (`app`, `log`).

---

## 🛠️ Cấu trúc dự án (Folder Structure)

```
src/
├── config/                  ← Nơi chứa tất cả logic config
│   ├── app.config.ts        ← Config về server, port, env
│   ├── log.config.ts        ← Config về winston, loki, file path
│   └── index.ts
├── common/
│   └── logger/
│       └── winston.config.ts ← Hàm khởi tạo các Transports của Winston
├── app.module.ts            ← Tích hợp ConfigModule & WinstonModule Async
└── main.ts                  ← Sử dụng Winston làm Global Logger
```

---

## ⚙️ Thiết lập môi trường (Environment Setup)

Dự án cung cấp 2 file mẫu:

1. **`.env.local`**: Thiết lập level `debug`, lưu log vào `logs/app.log`, tắt Loki.
2. **`.env.production`**: Thiết lập level `warn`, tắt file logging, **bật Loki** để push lên server.

### Cách chạy (How to Run):

```bash
# Chạy ở Local (EN: Run locally)
# Hệ thống tự load .env.local
npm run start:dev

# Chạy ở Production (EN: Run as Production)
# Gán NODE_ENV để load .env.production
$env:NODE_ENV="production"; npm run start:dev
```

---

## 📊 Giải thích về Logging (Logging Explained)

### 1. Winston Transports
Chúng ta sử dụng 3 transports chính trong `winston.config.ts`:

- **Console Transport:** Format dạng `[timestamp] level [context]: message`.
- **File Transport:** Sử dụng `winston.format.json()` để máy móc dễ dàng xử lý log về sau.
- **Loki Transport:** Gửi log qua HTTP tới Loki server.

### 2. Tại sao dùng Async configuration?
Trong `app.module.ts`, chúng ta dùng `WinstonModule.forRootAsync`. Điều này quan trọng vì **Winston cần các giá trị từ ConfigService** (được load từ file .env) để biết có nên bật Loki hay file logging hay không.

### 3. Global Logger
Trong `main.ts`, dòng `app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))` thay thế hoàn toàn logger mặc định của Nest bằng Winston cho toàn bộ hệ thống (kể cả log của framework).

---

## 📝 Ví dụ sử dụng trong Code (Usage Example)

```ts
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Thực hiện hành động... (EN: Doing something...)');
    this.logger.error('Lỗi nghiêm trọng! (EN: Fatal error!)', error.stack);
  }
}
```

---

## 📚 Tài liệu tham khảo (References)

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Winston Github](https://github.com/winstonjs/winston)
- [Grafana Loki](https://grafana.com/oss/loki/)
