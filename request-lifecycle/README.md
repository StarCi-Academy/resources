# NestJS Request Lifecycle Demo

Minh họa toàn bộ vòng đời của một HTTP request trong NestJS: **Middleware → Guard → Interceptor → Pipe → Controller → Service**.

---

## Lifecycle diagram

```
Client
  │
  ▼
[Middleware 1] RequestIdMiddleware   → gắn UUID vào mọi request để trace
[Middleware 2] LoggerMiddleware      → log method, url, ip, status code
  │
  ▼
[Guard]        TimingGuard           → ghi timestamp lúc request vào phase Guard, luôn cho đi qua
  │
  ▼
[Interceptor]  ExecutionTimerInterceptor  (pre)  → chuẩn bị đo thời gian
[Interceptor]  ResponseTransformInterceptor (pre) → chuẩn bị bọc response
  │
  ▼
[Pipe]         ParsePositiveIntPipe  → validate param là số nguyên dương, ném 400 nếu không hợp lệ
  │
  ▼
[Controller]   ItemsController       → nhận request đã sạch, ủy thác xuống service
[Service]      ItemsService          → xử lý business logic, trả data
  │
  ▼
[Interceptor]  ResponseTransformInterceptor (post) → bọc response thành { data, timestamp, requestId }
[Interceptor]  ExecutionTimerInterceptor (post)    → log duration từ Guard đến đây
  │
  ▼
Client nhận response
```

> **Interceptor bao quanh handler theo kiểu "onion":** Timer bao ngoài, Transform bao trong.
> Khi response đi ngược lại: Transform chạy trước, rồi đến Timer.

---

## Các thành phần và tác dụng

| Thành phần | Vị trí trong lifecycle | Tác dụng |
|---|---|---|
| **Middleware** | Đầu tiên, trước tất cả | Xử lý raw request/response — không biết về NestJS context; dùng để enrich, log, cors, rate-limit |
| **Guard** | Sau middleware, trước interceptor | Quyết định request có được **phép tiếp tục** không (return true/false); thường dùng cho auth, role check |
| **Interceptor** | Sau guard, **bao quanh** handler | Can thiệp cả **trước** và **sau** khi handler chạy; dùng để transform response, đo thời gian, cache |
| **Pipe** | Ngay trước handler, trên từng param | **Validate và transform** giá trị param/body trước khi truyền vào handler; ném exception nếu không hợp lệ |
| **Controller** | Nhận request đã qua hết các bước trên | Chỉ định tuyến request vào đúng handler, **không chứa business logic** |
| **Service** | Được gọi từ controller | Chứa toàn bộ **business logic** |

---

## Usecases cụ thể trong demo

### Middleware

| File | Usecase |
|---|---|
| `LoggerMiddleware` | Ghi log mỗi request: `[GET] /items/1 — 200 — IP: ::1` — audit trail, debug traffic |
| `RequestIdMiddleware` | Gắn UUID `x-request-id` vào mỗi request — distributed tracing, correlate logs |

### Guard

| File | Usecase |
|---|---|
| `TimingGuard` | Ghi timestamp lúc request đến phase Guard và gắn vào header `x-guard-entry-time` để Interceptor tính duration; minh họa Guard có thể đọc toàn bộ NestJS context (class, handler name) |

### Interceptor

| File | Usecase |
|---|---|
| `ExecutionTimerInterceptor` | Tính thời gian từ lúc vào Guard đến khi response hoàn tất — performance monitoring |
| `ResponseTransformInterceptor` | Bọc mọi response thành `{ data, timestamp, requestId }` — đảm bảo API shape nhất quán |

### Pipe

| File | Usecase |
|---|---|
| `ParsePositiveIntPipe` | Validate route param là số nguyên dương — ném HTTP 400 nếu là chuỗi, số âm, hoặc 0 |

---

## API Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/items` | Lấy toàn bộ items |
| GET | `/items/:id` | Lấy item theo id (validate qua Pipe) |

```bash
# Happy path
curl http://localhost:3000/items
curl http://localhost:3000/items/1

# Pipe ném HTTP 400
curl http://localhost:3000/items/0
curl http://localhost:3000/items/-5
curl http://localhost:3000/items/abc
```

### Response shape (sau khi qua ResponseTransformInterceptor)

```json
{
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "A powerful laptop"
  },
  "timestamp": "2026-04-13T05:00:00.000Z",
  "requestId": "a1b2c3d4-..."
}
```

---

## Cài đặt và chạy

```bash
npm install
npm run start:dev
```

---

## Cấu trúc thư mục

```
src/
├── common/
│   ├── middleware/
│   │   ├── logger.middleware.ts        ← Usecase 1: log mọi request
│   │   ├── request-id.middleware.ts    ← Usecase 2: gắn UUID vào header
│   │   └── index.ts
│   ├── guards/
│   │   ├── timing.guard.ts             ← ghi timestamp, luôn allow
│   │   └── index.ts
│   ├── interceptors/
│   │   ├── execution-timer.interceptor.ts    ← đo thời gian thực thi
│   │   ├── response-transform.interceptor.ts ← wrap response thành shape chuẩn
│   │   └── index.ts
│   └── pipes/
│       ├── parse-positive-int.pipe.ts  ← validate số nguyên dương
│       └── index.ts
└── modules/
    └── items/
        ├── items.service.ts
        ├── items.controller.ts
        ├── items.module.ts
        └── index.ts
```

---

## References

- [NestJS Middleware](https://docs.nestjs.com/middleware)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Pipes](https://docs.nestjs.com/pipes)
