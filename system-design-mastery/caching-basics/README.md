# Caching Basics — 4 tầng Cache trên Kubernetes

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai Postgres + Redis làm 2 stateful service chia sẻ (EN: shared data store + cache store).
- Triển khai **một** NestJS backend (`cache-app`) minh hoạ **3 layer cache phía app** trong cùng 1 controller:
  1. **Cache-Aside** bằng `@Inject(CACHE_MANAGER)` → Redis.
  2. **TypeORM query cache** (`.cache()`) → Redis.
  3. **Response cache** của NestJS (`CacheInterceptor`) → Redis.
- Thêm **Nginx reverse-proxy cache** đứng trước `cache-app` → layer cache ngoài cùng, chặn traffic trước khi chạm Node.js.
- Giả lập DB chậm bằng `pg_sleep(0.3)` ngay trong Postgres → đo latency thấy rõ trước/sau cache.
- Build Docker image và push lên registry `starci183` (hoặc dùng image có sẵn).

### English
- Deploy Postgres + Redis as shared stateful services (data + cache store).
- Deploy **one** NestJS backend (`cache-app`) demonstrating **three app-level cache layers** in a single controller:
  1. **Cache-Aside** via `@Inject(CACHE_MANAGER)` → Redis.
  2. **TypeORM query cache** (`.cache()`) → Redis.
  3. **NestJS response cache** (`CacheInterceptor`) → Redis.
- Add an **Nginx reverse-proxy cache** in front of `cache-app` — the outermost layer, blocking traffic before it hits Node.js.
- Simulate a slow DB with `pg_sleep(0.3)` inside Postgres → latency gap is clearly measurable.
- Build Docker image and push to the `starci183` registry (or use the existing image).

## Cấu trúc thư mục / Directory Structure

```
caching-basics/
├── example-backend/                  # NestJS cache-app (EN: NestJS cache-app)
│   ├── src/
│   │   ├── main.ts                   # Bootstrap + seed 50 product lúc boot
│   │   ├── app.module.ts             # TypeORM Postgres + CacheModule Redis
│   │   ├── product.entity.ts         # Entity Product
│   │   ├── product.controller.ts     # 3 pattern cache trong 1 file
│   │   └── product.seed.ts           # Seed dữ liệu mẫu (EN: seed helper)
│   ├── Dockerfile                    # Build image cache-app
│   ├── docker-compose.yaml           # Chạy cache-app + Postgres + Redis local
│   ├── package.json
│   ├── nest-cli.json
│   └── tsconfig.json
├── postgres-pod.yaml                 # Pod Postgres (source of truth)
├── postgres-service.yaml             # ClusterIP cho Postgres
├── redis-pod.yaml                    # Pod Redis (cache store)
├── redis-service.yaml                # ClusterIP cho Redis
├── cache-app-deployment.yaml         # Deployment có 3 layer cache (2 replica)
├── cache-app-service.yaml            # ClusterIP expose cache-app (upstream cho Nginx)
├── nginx-configmap.yaml              # nginx.conf với proxy_cache
├── nginx-deployment.yaml             # Nginx reverse-proxy cache
├── nginx-service.yaml                # NodePort :30080 — entrypoint client
└── README.md
```

## Luồng hệ thống / System Flow

### Tiếng Việt

```
Client (bên ngoài cluster)
  │
  └─► NodePort nginx-cache-service (:30080)
         │                                        ← Layer 4: Nginx proxy_cache
         ▼
      cache-app-service (ClusterIP :3000)
         │
         ▼
      cache-app Deployment (2 replicas)
         │   ← Layer 1: CacheInterceptor (response cache)
         │   ← Layer 2: @Inject(CACHE_MANAGER) (Cache-Aside)
         │   ← Layer 3: TypeORM .cache() (query cache)
         ├─► redis-service:6379  (shared cache giữa các pod)
         └─► postgres-service:5432 (source of truth, pg_sleep 300ms)
```

### English

```
Client (outside the cluster)
  │
  └─► NodePort nginx-cache-service (:30080)
         │                                   ← Layer 4: Nginx proxy_cache
         ▼
      cache-app-service (ClusterIP :3000)
         │
         ▼
      cache-app Deployment (2 replicas)
         │   ← Layer 1: CacheInterceptor (response cache)
         │   ← Layer 2: @Inject(CACHE_MANAGER) (Cache-Aside)
         │   ← Layer 3: TypeORM .cache() (query cache)
         ├─► redis-service:6379
         └─► postgres-service:5432 (pg_sleep 300ms)
```

## Bước 1 — Build và push Docker image / Step 1 — Build and Push Docker Image

### Tiếng Việt

```bash
cd example-backend
docker compose -f docker-compose.yaml build
docker push starci183/caching-cache-app:latest
```

Hoặc dùng image có sẵn trên registry — bỏ qua build, Deployment tự pull.

### English

```bash
cd example-backend
docker compose -f docker-compose.yaml build
docker push starci183/caching-cache-app:latest
```

Or use the existing registry image — skip build.

## Bước 2 — Triển khai Postgres + Redis / Step 2 — Deploy Postgres + Redis

```bash
kubectl apply -f postgres-pod.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f redis-pod.yaml
kubectl apply -f redis-service.yaml
```

## Bước 3 — Triển khai cache-app / Step 3 — Deploy cache-app

```bash
kubectl apply -f cache-app-deployment.yaml
kubectl apply -f cache-app-service.yaml
```

## Bước 4 — Triển khai Nginx proxy cache / Step 4 — Deploy Nginx Proxy Cache

```bash
kubectl apply -f nginx-configmap.yaml
kubectl apply -f nginx-deployment.yaml
kubectl apply -f nginx-service.yaml
```

## Bước 5 — Kiểm tra / Step 5 — Verify

```bash
kubectl get pods -o wide
kubectl get services
```

- `postgres-pod`, `redis-pod`, `nginx-cache-*` phải `Running`.
- `cache-app` có `2/2 READY`.
- `nginx-cache-service` hiển thị NodePort `30080`.

## Bước 6 — Kịch bản demo / Step 6 — Demo Scenarios

Dùng `kubectl port-forward` để test cache-app trực tiếp, và `<NODE_IP>:30080` để test qua Nginx.

```bash
# Port-forward cache-app sang localhost:3000
kubectl port-forward svc/cache-app-service 3000:3000 &
```

### 6.1 Cache-Aside — `@Inject(CACHE_MANAGER)`

```bash
# Lần 1: miss → ~320ms, source=db (pg_sleep 300ms + overhead)
curl -s http://localhost:3000/products/1
# { "source": "db", "pod": "cache-app-...", "durationMs": 305, "data": {...} }

# Lần 2: hit → vài ms, source=cache
curl -s http://localhost:3000/products/1
# { "source": "cache", "pod": "cache-app-...", "durationMs": 2, "data": {...} }

# Update giá → invalidate cache
curl -s -X PUT http://localhost:3000/products/1/price \
  -H 'Content-Type: application/json' \
  -d '{"price": 999}'
# { "invalidated": ["product:1", "products:stats-summary", "products:cheapest"] }

# Lần 3: miss lại → đọc data mới
curl -s http://localhost:3000/products/1
```

### 6.2 TypeORM Query Cache — `.cache()`

```bash
# Lần 1: miss → hit DB thật
curl -s http://localhost:3000/products
# { "source": "db", "durationMs": 45, ... }

# Lần 2+: TypeORM đọc thẳng từ Redis
curl -s http://localhost:3000/products
# { "source": "typeorm-cache", "durationMs": 3, ... }
```

### 6.3 Response Cache — `CacheInterceptor`

```bash
# Lần 1: chạy aggregate thật
curl -s -w "\ntime: %{time_total}s\n" http://localhost:3000/products/stats/summary

# Lần 2+: toàn bộ response body đọc từ Redis, không chạm service/DB
curl -s -w "\ntime: %{time_total}s\n" http://localhost:3000/products/stats/summary
```

### 6.4 Nginx proxy_cache — layer ngoài cùng

```bash
# Thay <NODE_IP> bằng IP node (hoặc localhost nếu Minikube/Docker Desktop)
NODE=<NODE_IP>

# Lần 1: MISS → Nginx forward xuống cache-app
curl -I http://$NODE:30080/products/1
# X-Cache-Status: MISS

# Lần 2: HIT → response phục vụ ngay từ Nginx, không đi xuống Node
curl -I http://$NODE:30080/products/1
# X-Cache-Status: HIT

# Đo latency 5 lần liên tiếp
for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w "nginx #$i: %{time_total}s (%{http_code})\n" \
    http://$NODE:30080/products/1
done
```

**Quan sát / Observe:**
- Lần đầu `MISS` có latency ~320ms (Nginx → cache-app miss → DB).
- Lần sau `HIT` < 5ms — Nginx serve từ disk cache, **không chạm Node.js**.
- Tắt `cache-app` (`kubectl scale deployment/cache-app --replicas=0`) → Nginx vẫn trả stale nhờ `proxy_cache_use_stale`.

## Chạy local bằng Docker Compose (không cần Kubernetes) / Run Locally

### Tiếng Việt

```bash
cd example-backend
docker compose -f docker-compose.yaml up --build -d
# cache-app:  http://localhost:3000
# postgres:   localhost:5432
# redis:      localhost:6379
```

### English

```bash
cd example-backend
docker compose -f docker-compose.yaml up --build -d
```

## Dọn dẹp / Cleanup

```bash
kubectl delete -f nginx-service.yaml
kubectl delete -f nginx-deployment.yaml
kubectl delete -f nginx-configmap.yaml
kubectl delete -f cache-app-service.yaml
kubectl delete -f cache-app-deployment.yaml
kubectl delete -f redis-service.yaml
kubectl delete -f redis-pod.yaml
kubectl delete -f postgres-service.yaml
kubectl delete -f postgres-pod.yaml
```

## Biến môi trường backend / Backend Environment Variables

| Biến / Variable | Giá trị mặc định / Default Value |
|-----------------|----------------------------------|
| `PORT` | `3000` |
| `POSTGRES_HOST` | `postgres-service.default.svc.cluster.local` |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `postgres` |
| `POSTGRES_DATABASE` | `products` |
| `REDIS_HOST` | `redis-service.default.svc.cluster.local` |
| `REDIS_PORT` | `6379` |

## Endpoint bản đồ / Endpoint Map

| Method | Path | Pattern minh hoạ |
|---|---|---|
| `GET` | `/products/health` | Readiness probe |
| `GET` | `/products/:id` | **Cache-Aside** (`@Inject(CACHE_MANAGER)`) |
| `GET` | `/products` | **TypeORM query cache** (`.cache()`) + HTTP `Cache-Control` |
| `GET` | `/products/stats/summary` | **Response cache** (`CacheInterceptor`) |
| `PUT` | `/products/:id/price` | Write-through invalidate cả 3 layer |

## Bài học rút ra / Key Takeaways

### Tiếng Việt
1. **Cache là nhiều layer xếp chồng.** Nginx → response cache → cache-aside → ORM cache → DB. Mỗi layer chặn bớt traffic cho layer kế tiếp.
2. **Chọn layer theo shape của data.** Object business đã transform → Cache-Aside; query SQL thô → TypeORM cache; endpoint public GET → response cache + Nginx.
3. **`pg_sleep` ở DB mô phỏng cost thật.** Không phải `setTimeout` app-side — cost phải nằm đúng lớp DB để cache mới có ý nghĩa.
4. **Invalidate phải đồng bộ mọi layer.** `PUT /products/:id/price` xoá: cache-aside key + response cache key + TypeORM identifier. Thiếu 1 trong 3 → stale data.
5. **Nginx `proxy_cache_use_stale` là cứu tinh.** Khi backend chết, user vẫn có data cũ — downtime không còn đồng nghĩa với 5xx.
6. **Redis là stateful shared service, giống Postgres.** Nhiều pod `cache-app` chia sẻ cùng 1 Redis → cache consistent giữa các instance, không bị phân mảnh như bài `scalibity-fundamental`.

### English
1. **Cache is a stack of layers.** Nginx → response cache → cache-aside → ORM cache → DB. Each layer shields the next.
2. **Pick the layer by data shape.** Transformed business objects → Cache-Aside; raw SQL → TypeORM cache; public GET → response cache + Nginx.
3. **Use `pg_sleep` at the DB to simulate real cost.** Not app-side `setTimeout` — the cost must live at the DB layer for caches to matter.
4. **Invalidation must fan out across all layers.** `PUT /products/:id/price` deletes the cache-aside key, response cache key, and TypeORM identifier. Miss any one → stale.
5. **Nginx `proxy_cache_use_stale` is the safety net.** When the backend dies, users still get stale data — downtime no longer equals 5xx.
6. **Redis is a shared stateful service, just like Postgres.** Many `cache-app` pods share one Redis → consistent cache across instances, unlike the fragmented SQLite demo in `scalibity-fundamental`.
