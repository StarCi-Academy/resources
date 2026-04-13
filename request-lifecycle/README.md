# NestJS Request Lifecycle Demo
# (EN: NestJS Request Lifecycle Demo)

Minh họa toàn bộ vòng đời của một HTTP request trong NestJS: **Middleware → Guard → Interceptor → Pipe → Controller → Service**.
(EN: Demonstrates the entire lifecycle of an HTTP request in NestJS: **Middleware → Guard → Interceptor → Pipe → Controller → Service**.)

---

## 🏗️ 1. Luồng hệ thống (System Flow / Lifecycle Diagram)

Thứ tự thực thi khi một request đi từ Client vào Server và quay ngược lại:
(EN: Execution order when a request travels from Client to Server and back:)

```
Client
  │
  ▼
[Middleware 1] RequestIdMiddleware   (UUID tracing)
[Middleware 2] LoggerMiddleware      (Traffic Audit)
  │
  ▼
[Guard]        TimingGuard           (Auth / Roles / Entry-time)
  │
  ▼
[Interceptor]  ExecutionTimer (Pre)  (Performance Setup)
[Interceptor]  ResponseWrap   (Pre)  (Response Prep)
  │
  ▼
[Pipe]         ValidationPipe        (Validation & Transformation)
  │
  ▼
[Controller]   Entry Point           (Route delegation)
[Service]      Business Logic        (Data handling)
  │
  ▼
[Interceptor]  ResponseWrap   (Post) (Wrap into { data, timestamp, ... })
[Interceptor]  ExecutionTimer (Post) (Log total duration)
  │
  ▼
Client receives response
```

---

## 🧩 2. Các thành phần & Tác dụng (Components & Effects)

| Thành phần (Component) | Vị trí (Position) | Tác dụng (Effect) |
|---|---|---|
| **Middleware** | Đầu tiên (First) | Xử lý raw request/response; dùng để log, cors, rate-limit. |
| **Guard** | Sau middleware | Quyết định request có được phép tiếp tục không (Auth/Roles). |
| **Interceptor** | Bao quanh handler | Can thiệp cả trước và sau; dùng để transform response, đo thời gian. |
| **Pipe** | Trước handler | Validate và transform giá trị param/body. |

---

## 📡 3. Các thành phần demo (Demo Components)

### 3.1 Middleware
- **`LoggerMiddleware`**: Ghi log chi tiết `[GET] /items/1 — 200 — IP: ::1` để kiểm tra lưu lượng.
- **`RequestIdMiddleware`**: Gắn UUID vào header `x-request-id` để tracing log.

### 3.2 Guard
- **`TimingGuard`**: Ghi lại thời điểm request bắt đầu vào NestJS context để Interceptor tính toán thời gian thực thi chính xác.

### 3.3 Interceptor
- **`ExecutionTimerInterceptor`**: Tính tổng thời gian xử lý từ lúc vào Guard đến khi có response.
- **`ResponseTransformInterceptor`**: Format mọi response về dạng chuẩn: `{ data, timestamp, requestId }`.

### 3.4 Pipe
- **`ParsePositiveIntPipe`**: Đảm bảo route param (như `:id`) phải là số nguyên dương, trả về lỗi 400 nếu sai định dạng.

---

## 🛠️ 4. Thiết lập (Setup & Run)

```bash
# Cài đặt (EN: Install)
npm install

# Chạy (EN: Run)
npm run start:dev
```

### Response Pattern (Sau khi qua Interceptor)
```json
{
  "data": { "id": 1, "name": "Laptop" },
  "timestamp": "2026-04-13T05:00:00Z",
  "requestId": "uuid-v4-standard-string"
}
```

---

## 📚 5. Tài liệu tham khảo (References)
- [NestJS Request Lifecycle Official Doc](https://docs.nestjs.com/faq/request-lifecycle)
