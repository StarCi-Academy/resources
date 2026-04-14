# Synchronous Communication — REST + gRPC

Demo giao tiếp đồng bộ giữa microservices sử dụng NestJS + gRPC.
(EN: Demo synchronous communication between microservices using NestJS + gRPC.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Xây dựng gateway REST API nhận request từ client.
- Gateway gọi gRPC đến 2 backend services (user-service, product-service).
- Backend services phục vụ qua gRPC protocol (không có HTTP).
- So sánh REST vs gRPC trong kiến trúc microservice.

### English
- Build a gateway REST API that receives client requests.
- Gateway calls gRPC to 2 backend services (user-service, product-service).
- Backend services serve via gRPC protocol (no HTTP).
- Compare REST vs gRPC in microservice architecture.

---

## Cấu trúc thư mục / Directory Structure

```
synchronous-communication-rest-grpc/
├── proto/
│   ├── user.proto               # Protobuf definition cho User (EN: for User)
│   └── product.proto            # Protobuf definition cho Product (EN: for Product)
├── apps/
│   ├── gateway/src/             # :3000 — REST API, gọi gRPC đến backend
│   │   ├── main.ts              # Entry point — HTTP server
│   │   ├── app.module.ts        # Đăng ký gRPC clients (EN: register gRPC clients)
│   │   ├── app.controller.ts    # REST endpoints → gRPC calls
│   │   └── index.ts             # Barrel export
│   ├── user-service/src/        # :5001 — gRPC server
│   │   ├── main.ts              # Entry point — gRPC microservice
│   │   ├── app.module.ts
│   │   ├── app.controller.ts    # gRPC method handlers
│   │   ├── app.service.ts       # Business logic (in-memory data)
│   │   └── index.ts
│   └── product-service/src/     # :5002 — gRPC server
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.controller.ts
│       ├── app.service.ts
│       └── index.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Luồng hệ thống / System Flow

### Tiếng Việt

```
Client (curl / Postman)
    │
    ▼ HTTP REST
Gateway Service (:3000)
    │
    ├── GET /users      ──► gRPC :5001 ──► UserService.FindAll()
    ├── GET /users/:id  ──► gRPC :5001 ──► UserService.FindOne()
    ├── POST /users     ──► gRPC :5001 ──► UserService.Create()
    │
    ├── GET /products      ──► gRPC :5002 ──► ProductService.FindAll()
    ├── GET /products/:id  ──► gRPC :5002 ──► ProductService.FindOne()
    └── POST /products     ──► gRPC :5002 ──► ProductService.Create()
```

1. Client gửi HTTP request đến Gateway `:3000`.
2. Gateway chuyển đổi REST request thành gRPC call.
3. Backend service xử lý gRPC call, trả về response.
4. Gateway chuyển đổi gRPC response thành JSON trả về client.

### English

1. Client sends HTTP request to Gateway `:3000`.
2. Gateway converts REST request to gRPC call.
3. Backend service processes gRPC call, returns response.
4. Gateway converts gRPC response to JSON and returns to client.

---

## Bước 1 — Cài đặt dependencies / Step 1 — Install Dependencies

```bash
npm install
```

---

## Bước 2 — Chạy gRPC backend services / Step 2 — Run gRPC Backend Services

### Tiếng Việt
Mở 2 terminal chạy 2 gRPC servers trước:

### English
Open 2 terminals and start 2 gRPC servers first:

```bash
# Terminal 1: User gRPC Service (:5001)
npx nest start user-service --watch

# Terminal 2: Product gRPC Service (:5002)
npx nest start product-service --watch
```

---

## Bước 3 — Chạy Gateway REST Service / Step 3 — Run Gateway REST Service

```bash
# Terminal 3: Gateway REST Service (:3000)
npx nest start gateway --watch
```

---

## Bước 4 — Test API / Step 4 — Test API

### Tiếng Việt
Tất cả request gửi đến Gateway REST port `3000`:

### English
All requests sent to Gateway REST port `3000`:

```bash
# === USER SERVICE (qua gRPC) ===

# Lấy tất cả users (EN: get all users)
curl http://localhost:3000/users

# Lấy user theo ID (EN: get user by ID)
curl http://localhost:3000/users/1

# Tạo user mới (EN: create new user)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Lê Văn C","email":"c@example.com"}'

# === PRODUCT SERVICE (qua gRPC) ===

# Lấy tất cả products (EN: get all products)
curl http://localhost:3000/products

# Lấy product theo ID (EN: get product by ID)
curl http://localhost:3000/products/1

# Tạo product mới (EN: create new product)
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mouse","price":29.99,"stock":100}'
```

---

## So sánh REST vs gRPC / REST vs gRPC Comparison

| Tiêu chí / Criteria | REST | gRPC |
|---------------------|------|------|
| Giao thức / Protocol | HTTP/1.1 (JSON) | HTTP/2 (Protobuf binary) |
| Tốc độ / Speed | Chậm hơn (text-based) | Nhanh hơn (binary serialization) |
| Contract | Không bắt buộc (OpenAPI optional) | Bắt buộc (`.proto` file) |
| Streaming | Không native | Hỗ trợ bidirectional streaming |
| Browser support | Tốt | Cần gRPC-Web proxy |
| Phù hợp / Best for | Public API, client-facing | Internal service-to-service |

### Tiếng Việt
- **REST**: Dùng cho API public (client → gateway) vì browsers hỗ trợ tốt.
- **gRPC**: Dùng cho giao tiếp nội bộ giữa services vì nhanh hơn và có strong contract qua `.proto`.

### English
- **REST**: Used for public API (client → gateway) because browsers support it well.
- **gRPC**: Used for internal service-to-service communication because it's faster with strong contracts via `.proto`.

---

## Dọn dẹp / Cleanup

```bash
# Ctrl+C trong các terminal để dừng services
# (EN: Ctrl+C in each terminal to stop services)
```

---

## Tài liệu tham khảo / References

- [NestJS gRPC Documentation](https://docs.nestjs.com/microservices/grpc)
- [Protocol Buffers Documentation](https://protobuf.dev/)
- [gRPC Official](https://grpc.io/)
