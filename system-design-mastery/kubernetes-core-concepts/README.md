# Kubernetes Core Concepts

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai Pod MySQL và Redis trên Kubernetes.
- Dùng Service (ClusterIP) để tạo DNS nội bộ cho MySQL và Redis.
- Triển khai NestJS backend dưới dạng Deployment (3 replicas), kết nối MySQL và Redis qua `svc.cluster.local`.
- Dùng Service (NodePort) để expose backend ra bên ngoài cluster.
- Build Docker image và push lên registry `starci183` (hoặc dùng image có sẵn).

### English
- Deploy MySQL and Redis Pods on Kubernetes.
- Use ClusterIP Services to create internal DNS for MySQL and Redis.
- Deploy a NestJS backend as a Deployment (3 replicas), connecting to MySQL and Redis via `svc.cluster.local`.
- Use a NodePort Service to expose the backend outside the cluster.
- Build Docker image and push to `starci183` registry (or use the existing image).

## Cấu trúc thư mục / Directory Structure

```
kubernetes-core-concepts/
├── example-backend/              # Mã nguồn NestJS backend (EN: NestJS backend source code)
│   ├── src/
│   │   ├── main.ts               # Entry point
│   │   ├── app.module.ts         # Root module — kết nối MySQL + Redis
│   │   ├── app.controller.ts     # HTTP endpoints
│   │   ├── app.service.ts        # Business logic
│   │   ├── item.entity.ts        # TypeORM entity
│   │   ├── redis.module.ts       # Redis connection module
│   │   └── index.ts              # Barrel export
│   ├── Dockerfile                # Multi-stage build
│   ├── docker-compose.yaml       # Build + chạy local (EN: build + run locally)
│   ├── package.json
│   └── tsconfig.json
├── mysql-pod.yaml                # Pod chạy MySQL (EN: MySQL Pod)
├── mysql-service.yaml            # Service ClusterIP cho MySQL (EN: ClusterIP Service for MySQL)
├── redis-pod.yaml                # Pod chạy Redis (EN: Redis Pod)
├── redis-service.yaml            # Service ClusterIP cho Redis (EN: ClusterIP Service for Redis)
├── backend-deployment.yaml       # Deployment 3 replicas (EN: Deployment with 3 replicas)
├── backend-service.yaml          # Service NodePort expose backend (EN: NodePort Service)
└── README.md
```

## Luồng hệ thống / System Flow

### Tiếng Việt

```
Client (bên ngoài cluster)
  │
  ▼
Service NodePort (:30000)
  │
  ▼
Deployment: example-backend (3 replicas)
  │
  ├──► mysql-service.default.svc.cluster.local:3306 ──► MySQL Pod
  │
  └──► redis-service.default.svc.cluster.local:6379 ──► Redis Pod
```

### English

```
Client (outside the cluster)
  │
  ▼
Service NodePort (:30000)
  │
  ▼
Deployment: example-backend (3 replicas)
  │
  ├──► mysql-service.default.svc.cluster.local:3306 ──► MySQL Pod
  │
  └──► redis-service.default.svc.cluster.local:6379 ──► Redis Pod
```

## Bước 1 — Build và push Docker image / Step 1 — Build and Push Docker Image

### Tiếng Việt

**Cách 1:** Tự build từ source code trong folder `example-backend`:

```bash
cd example-backend

# Cài dependencies và build (EN: install dependencies and build)
npm install
npm run build

# Build Docker image và tag cho registry starci183 (EN: build Docker image and tag for starci183 registry)
docker compose build

# Push lên Docker Hub (cần đăng nhập trước: docker login) (EN: push to Docker Hub — login first: docker login)
docker push starci183/example-backend:latest
```

**Cách 2:** Dùng image có sẵn trên registry (nếu đã được push):

```bash
# Không cần build — Deployment sẽ pull image starci183/example-backend:latest từ Docker Hub
# (EN: no build needed — Deployment will pull image starci183/example-backend:latest from Docker Hub)
```

### English

**Option 1:** Build from source code in the `example-backend` folder:

```bash
cd example-backend

# Install dependencies and build
npm install
npm run build

# Build Docker image and tag for starci183 registry
docker compose build

# Push to Docker Hub (login first: docker login)
docker push starci183/example-backend:latest
```

**Option 2:** Use the existing image on the registry (if already pushed):

```bash
# No build needed — Deployment will pull image starci183/example-backend:latest from Docker Hub
```

## Bước 2 — Triển khai MySQL và Redis / Step 2 — Deploy MySQL and Redis

### Tiếng Việt
Apply Pod và Service cho MySQL, Redis:

### English
Apply Pods and Services for MySQL and Redis:

```bash
kubectl apply -f mysql-pod.yaml
kubectl apply -f mysql-service.yaml
kubectl apply -f redis-pod.yaml
kubectl apply -f redis-service.yaml
```

## Bước 3 — Triển khai backend / Step 3 — Deploy Backend

### Tiếng Việt
Apply Deployment (3 replicas) và Service NodePort cho backend:

### English
Apply the Deployment (3 replicas) and NodePort Service for the backend:

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
```

## Bước 4 — Kiểm tra trạng thái / Step 4 — Verify Status

```bash
kubectl get pods -o wide
kubectl get services
kubectl get deployments
```

### Tiếng Việt
- Tất cả Pod phải ở trạng thái `Running`.
- Deployment `example-backend` phải có `3/3 READY`.
- Service `example-backend-service` phải hiển thị NodePort `30000`.

### English
- All Pods should be in `Running` state.
- Deployment `example-backend` should show `3/3 READY`.
- Service `example-backend-service` should display NodePort `30000`.

## Bước 5 — Test API / Step 5 — Test API

### Tiếng Việt
Truy cập backend qua NodePort (thay `<NODE_IP>` bằng IP node thực tế hoặc `localhost` nếu dùng Minikube/Docker Desktop):

### English
Access the backend via NodePort (replace `<NODE_IP>` with the actual node IP or `localhost` for Minikube/Docker Desktop):

```bash
# Kiểm tra kết nối MySQL + Redis (EN: check MySQL + Redis connections)
curl http://<NODE_IP>:30000/health

# Tạo item mới (EN: create a new item)
curl -X POST http://<NODE_IP>:30000/items -H "Content-Type: application/json" -d "{\"name\":\"kubernetes\"}"

# Lấy danh sách items (lần đầu từ MySQL, lần sau từ Redis cache)
# (EN: get items list — first from MySQL, subsequent from Redis cache)
curl http://<NODE_IP>:30000/items
```

## Chạy local bằng Docker Compose (không cần Kubernetes) / Run Locally with Docker Compose (No Kubernetes)

### Tiếng Việt
Nếu muốn test backend trước khi deploy lên Kubernetes:

### English
If you want to test the backend before deploying to Kubernetes:

```bash
cd example-backend
docker compose up --build -d
```

- VI: Truy cập `http://localhost:3000/health` để kiểm tra.
- EN: Access `http://localhost:3000/health` to verify.

## Dọn dẹp tài nguyên / Cleanup

### Tiếng Việt
Sau khi demo xong, xóa toàn bộ tài nguyên trên cluster:

### English
After the demo, delete all resources from the cluster:

```bash
kubectl delete -f backend-service.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f redis-service.yaml
kubectl delete -f redis-pod.yaml
kubectl delete -f mysql-service.yaml
kubectl delete -f mysql-pod.yaml
```

## Biến môi trường backend / Backend Environment Variables

| Biến / Variable | Giá trị mặc định / Default Value |
|-----------------|----------------------------------|
| `MYSQL_HOST` | `mysql-service.default.svc.cluster.local` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `root` |
| `MYSQL_PASSWORD` | `root123` |
| `MYSQL_DATABASE` | `demo_db` |
| `REDIS_HOST` | `redis-service.default.svc.cluster.local` |
| `REDIS_PORT` | `6379` |
