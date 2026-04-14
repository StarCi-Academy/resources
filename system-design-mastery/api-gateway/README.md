# API Gateway Pattern

Demo API Gateway sử dụng Kong (DB-less mode) để route traffic đến 3 NestJS microservices.
(EN: API Gateway demo using Kong in DB-less mode to route traffic to 3 NestJS microservices.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Xây dựng 3 NestJS microservices (user, product, order) trong một monorepo.
- Cài đặt Kong API Gateway ở chế độ DB-less declarative.
- Cấu hình Kong route traffic `/users/*`, `/products/*`, `/orders/*` đến từng service tương ứng.
- Client chỉ cần gọi qua 1 endpoint duy nhất (Kong `:8000`).

### English
- Build 3 NestJS microservices (user, product, order) in a monorepo.
- Set up Kong API Gateway in DB-less declarative mode.
- Configure Kong to route `/users/*`, `/products/*`, `/orders/*` to corresponding services.
- Client only needs to call a single endpoint (Kong `:8000`).

---

## Cấu trúc thư mục / Directory Structure

```
api-gateway/
├── .docker/
│   └── kong.yaml                # Docker Compose cho Kong (EN: Docker Compose for Kong)
├── kong/
│   └── kong.yml                 # Kong declarative config — định nghĩa routes
├── apps/
│   ├── user-service/src/        # :3001 — CRUD user (SQLite)
│   │   ├── main.ts              # Entry point
│   │   ├── app.module.ts        # Root module
│   │   ├── app.controller.ts    # HTTP endpoints /users
│   │   ├── app.service.ts       # Business logic
│   │   ├── user.entity.ts       # TypeORM entity
│   │   └── index.ts             # Barrel export
│   ├── product-service/src/     # :3002 — CRUD product (SQLite)
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── product.entity.ts
│   │   └── index.ts
│   └── order-service/src/       # :3003 — CRUD order (SQLite)
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.controller.ts
│       ├── app.service.ts
│       ├── order.entity.ts
│       └── index.ts
├── nest-cli.json                # NestJS monorepo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Luồng hệ thống / System Flow

### Tiếng Việt

```
Client (browser / curl / Postman)
    │
    ▼
Kong API Gateway (:8000)
    │
    ├── /users/*     ──► user-service    (:3001) ──► SQLite
    ├── /products/*  ──► product-service (:3002) ──► SQLite
    └── /orders/*    ──► order-service   (:3003) ──► SQLite
```

- Client gửi request đến Kong port `8000`.
- Kong đọc cấu hình từ `kong.yml`, match path prefix.
- Kong forward request đến service tương ứng.
- Service xử lý và trả response qua Kong về cho client.

### English

```
Client (browser / curl / Postman)
    │
    ▼
Kong API Gateway (:8000)
    │
    ├── /users/*     ──► user-service    (:3001) ──► SQLite
    ├── /products/*  ──► product-service (:3002) ──► SQLite
    └── /orders/*    ──► order-service   (:3003) ──► SQLite
```

- Client sends requests to Kong port `8000`.
- Kong reads config from `kong.yml`, matches path prefix.
- Kong forwards request to the corresponding service.
- Service processes and returns response through Kong to the client.

---

## Bước 1 — Cài đặt dependencies / Step 1 — Install Dependencies

```bash
npm install
```

---

## Bước 2 — Chạy 3 NestJS services / Step 2 — Run 3 NestJS Services

### Tiếng Việt
Mở 3 terminal riêng biệt để chạy từng service:

### English
Open 3 separate terminals to run each service:

```bash
# Terminal 1: User Service (:3001)
npx nest start user-service --watch

# Terminal 2: Product Service (:3002)
npx nest start product-service --watch

# Terminal 3: Order Service (:3003)
npx nest start order-service --watch
```

---

## Bước 3 — Chạy Kong API Gateway / Step 3 — Run Kong API Gateway

```bash
docker compose -f .docker/kong.yaml up --build -d
```

### Kiểm tra Kong đã chạy / Verify Kong is running

```bash
# Kiểm tra Admin API (EN: check Admin API)
curl http://localhost:8001/status

# Xem danh sách services đã cấu hình (EN: view configured services)
curl http://localhost:8001/services

# Xem danh sách routes (EN: view routes)
curl http://localhost:8001/routes
```

---

## Bước 4 — Test API qua Kong / Step 4 — Test API via Kong

### Tiếng Việt
Tất cả request đều đi qua Kong port `8000`:

### English
All requests go through Kong port `8000`:

```bash
# === USER SERVICE ===

# Tạo user mới (EN: create new user)
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","email":"a@example.com"}'

# Lấy danh sách users (EN: get all users)
curl http://localhost:8000/users

# Lấy user theo ID (EN: get user by ID)
curl http://localhost:8000/users/1

# === PRODUCT SERVICE ===

# Tạo sản phẩm mới (EN: create new product)
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"stock":50}'

# Lấy danh sách sản phẩm (EN: get all products)
curl http://localhost:8000/products

# === ORDER SERVICE ===

# Tạo đơn hàng mới (EN: create new order)
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'

# Lấy danh sách đơn hàng (EN: get all orders)
curl http://localhost:8000/orders
```

---

## So sánh: Gọi trực tiếp vs qua Kong / Direct Call vs Kong

| | Gọi trực tiếp / Direct | Qua Kong / Via Kong |
|---|---|---|
| User | `http://localhost:3001/users` | `http://localhost:8000/users` |
| Product | `http://localhost:3002/products` | `http://localhost:8000/products` |
| Order | `http://localhost:3003/orders` | `http://localhost:8000/orders` |

### Tiếng Việt
- **Không có Kong:** Client phải biết port của từng service → khó scale, khó quản lý.
- **Có Kong:** Client chỉ cần 1 endpoint `:8000` → dễ scale, dễ thêm rate limiting, auth, logging.

### English
- **Without Kong:** Client must know each service's port → hard to scale, hard to manage.
- **With Kong:** Client only needs 1 endpoint `:8000` → easy to scale, add rate limiting, auth, logging.

---

## Cấu hình Kong / Kong Configuration

### File: `kong/kong.yml`

| Service | URL Upstream | Route Path |
|---------|-------------|------------|
| user-service | `http://host.docker.internal:3001` | `/users` |
| product-service | `http://host.docker.internal:3002` | `/products` |
| order-service | `http://host.docker.internal:3003` | `/orders` |

### Tiếng Việt
- `host.docker.internal` cho phép container Docker truy cập services chạy trên máy host.
- `strip_path: false` giữ nguyên path prefix khi forward đến service.

### English
- `host.docker.internal` allows Docker container to access services running on the host machine.
- `strip_path: false` preserves path prefix when forwarding to service.

---

## Dọn dẹp tài nguyên / Cleanup

```bash
# Dừng Kong (EN: stop Kong)
docker compose -f .docker/kong.yaml down

# Dừng NestJS services — Ctrl+C trong từng terminal
# (EN: Stop NestJS services — Ctrl+C in each terminal)
```

---

## Tài liệu tham khảo / References

- [Kong Gateway Documentation](https://docs.konghq.com/gateway/latest/)
- [Kong DB-less Declarative Config](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative/)
- [NestJS Monorepo Documentation](https://docs.nestjs.com/cli/monorepo)
