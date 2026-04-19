# Scalibity Fundamental — Stateful vs Stateless trên Kubernetes

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai Pod Postgres trên Kubernetes để làm **shared state store**.
- Dùng Service (ClusterIP) tạo DNS nội bộ cho Postgres.
- Triển khai **hai** NestJS backend (monorepo, dùng chung TypeORM + entity `Note`):
  - `postgres-app` — trỏ TypeORM tới Postgres service → **stateless**, scale thoải mái.
  - `sqlite-app` — trỏ TypeORM tới file SQLite local trong pod → **stateful**, scale lên là lộ bệnh.
- Expose cả hai app ra ngoài bằng Service NodePort để demo trực quan.
- Build Docker image và push lên registry `starci183` (hoặc dùng image có sẵn).
- Dùng `kubectl scale` để kể câu chuyện: *tại sao stateless scale được, stateful thì không*.

### English
- Deploy a Postgres Pod on Kubernetes as a **shared state store**.
- Use a ClusterIP Service to give Postgres an internal DNS name.
- Deploy **two** NestJS backends (monorepo, sharing TypeORM + the `Note` entity):
  - `postgres-app` — TypeORM → Postgres service → **stateless**, scales freely.
  - `sqlite-app` — TypeORM → local SQLite file inside each pod → **stateful**, breaks on scale-out.
- Expose both apps via NodePort Services for demo access.
- Build Docker image and push to the `starci183` registry (or use the existing image).
- Use `kubectl scale` to tell the story: *why stateless scales and stateful does not*.

## Cấu trúc thư mục / Directory Structure

```
scalibity-fundamental/
├── example-backend/                   # Mã nguồn NestJS monorepo (EN: NestJS monorepo source)
│   ├── apps/
│   │   ├── postgres-app/
│   │   │   ├── src/{main,app.module}.ts   # TypeORM postgres driver
│   │   │   ├── Dockerfile                 # Build isolate image postgres-app
│   │   │   └── docker-compose.yaml        # Chạy postgres-app + Postgres local
│   │   └── sqlite-app/
│   │       ├── src/{main,app.module}.ts   # TypeORM sqlite driver
│   │       ├── Dockerfile                 # Build isolate image sqlite-app
│   │       └── docker-compose.yaml        # Chạy sqlite-app local
│   ├── libs/
│   │   ├── note.entity.ts             # Entity dùng chung (EN: shared entity)
│   │   └── note.controller.ts         # Controller dùng chung (EN: shared controller)
│   ├── package.json
│   ├── nest-cli.json                  # Monorepo: postgres-app + sqlite-app
│   └── tsconfig.json
├── postgres-pod.yaml                  # Pod Postgres (EN: Postgres Pod)
├── postgres-service.yaml              # Service ClusterIP cho Postgres (EN: ClusterIP Service)
├── postgres-app-deployment.yaml       # Deployment stateless (EN: stateless Deployment)
├── postgres-app-service.yaml          # Service NodePort expose postgres-app
├── sqlite-app-deployment.yaml         # Deployment stateful (EN: stateful Deployment + emptyDir)
├── sqlite-app-service.yaml            # Service NodePort expose sqlite-app
└── README.md
```

## Luồng hệ thống / System Flow

### Tiếng Việt

```
Client (bên ngoài cluster)
  │
  ├─► Service NodePort postgres-app-service (:30001)
  │      │
  │      ▼
  │   Deployment: postgres-app (N replicas — stateless)
  │      │
  │      └─► postgres-service.default.svc.cluster.local:5432 ──► Postgres Pod
  │                                                              (shared state duy nhất)
  │
  └─► Service NodePort sqlite-app-service (:30002)
         │
         ▼
      Deployment: sqlite-app (N replicas — stateful)
         │
         └─► /data/notes.db  (mỗi pod một file emptyDir riêng!)
```

### English

```
Client (outside the cluster)
  │
  ├─► NodePort Service postgres-app-service (:30001)
  │      │
  │      ▼
  │   Deployment: postgres-app (N replicas — stateless)
  │      │
  │      └─► postgres-service.default.svc.cluster.local:5432 ──► Postgres Pod
  │                                                              (single shared state)
  │
  └─► NodePort Service sqlite-app-service (:30002)
         │
         ▼
      Deployment: sqlite-app (N replicas — stateful)
         │
         └─► /data/notes.db  (each pod has its own emptyDir file!)
```

## Bước 1 — Build và push Docker image / Step 1 — Build and Push Docker Image

### Tiếng Việt

**Cách 1:** Build isolate từng app (mỗi app có Dockerfile + docker-compose riêng):

```bash
cd example-backend

# Build postgres-app (EN: build postgres-app isolated image)
docker compose -f apps/postgres-app/docker-compose.yaml build
docker push starci183/scalibity-postgres-app:latest

# Build sqlite-app (EN: build sqlite-app isolated image)
docker compose -f apps/sqlite-app/docker-compose.yaml build
docker push starci183/scalibity-sqlite-app:latest
```

**Cách 2:** Dùng image có sẵn trên registry — bỏ qua build, Deployment tự pull.

### English

**Option 1:** Build each app in isolation (per-app Dockerfile + docker-compose):

```bash
cd example-backend
docker compose -f apps/postgres-app/docker-compose.yaml build
docker push starci183/scalibity-postgres-app:latest
docker compose -f apps/sqlite-app/docker-compose.yaml build
docker push starci183/scalibity-sqlite-app:latest
```

**Option 2:** Use the existing registry images — skip build.

## Bước 2 — Triển khai Postgres / Step 2 — Deploy Postgres

### Tiếng Việt
Apply Pod và Service cho Postgres — đây là tầng stateful *duy nhất* được phép tồn tại trong hệ thống:

### English
Apply the Pod and Service for Postgres — this is the only stateful tier allowed in the system:

```bash
kubectl apply -f postgres-pod.yaml
kubectl apply -f postgres-service.yaml
```

## Bước 3 — Triển khai hai backend / Step 3 — Deploy Both Backends

### Tiếng Việt
Apply Deployment + Service NodePort cho cả `postgres-app` và `sqlite-app`:

### English
Apply the Deployment and NodePort Service for both `postgres-app` and `sqlite-app`:

```bash
kubectl apply -f postgres-app-deployment.yaml
kubectl apply -f postgres-app-service.yaml
kubectl apply -f sqlite-app-deployment.yaml
kubectl apply -f sqlite-app-service.yaml
```

## Bước 4 — Kiểm tra trạng thái / Step 4 — Verify Status

```bash
kubectl get pods -o wide
kubectl get services
kubectl get deployments
```

### Tiếng Việt
- Tất cả Pod phải `Running`.
- Deployment `postgres-app` và `sqlite-app` bắt đầu với `1/1 READY`.
- Service `postgres-app-service` hiển thị NodePort `30001`, `sqlite-app-service` hiển thị `30002`.

### English
- All Pods should be `Running`.
- Deployments `postgres-app` and `sqlite-app` start with `1/1 READY`.
- `postgres-app-service` exposes NodePort `30001`; `sqlite-app-service` exposes `30002`.

## Bước 5 — Kịch bản demo / Step 5 — Demo Scenarios

Thay `<NODE_IP>` bằng IP node thực tế hoặc `localhost` nếu dùng Minikube/Docker Desktop.

### 5.0 Chạy nhanh bằng script / Quick run via script

Có 2 script tự động hoá 4 kịch bản bên dưới (`bash` cho Linux/macOS/WSL, PowerShell cho Windows):

```bash
# Linux / macOS / WSL
bash demo.sh apply        # triển khai (EN: deploy)
bash demo.sh stateless    # kịch bản postgres-app (EN: postgres-app scenario)
bash demo.sh stateful     # kịch bản sqlite-app  (EN: sqlite-app scenario)
bash demo.sh all          # chạy tuần tự cả 3 bước
bash demo.sh clean        # dọn dẹp
```

```powershell
# Windows PowerShell
.\demo.ps1 apply
.\demo.ps1 stateless
.\demo.ps1 stateful
.\demo.ps1 all
.\demo.ps1 clean
```

Script dùng `HOST=localhost` mặc định — set env `HOST=<NODE_IP>` nếu chạy xa cluster.
Phần bên dưới là kịch bản chạy tay, giải thích từng bước.

### 5.1 Stateless thắng lớn — scale `postgres-app` lên 5 replica

```bash
kubectl scale deployment/postgres-app --replicas=5
kubectl get pods -l app=postgres-app -w        # đợi đủ 5/5 READY

# Tạo 6 note — Service round-robin qua các pod
for i in 1 2 3 4 5 6; do
  curl -s -X POST http://<NODE_IP>:30001/notes \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"note-$i\"}"
  echo
done

# Đọc — pod nào phục vụ cũng trả ra cùng 1 danh sách đầy đủ 6 note
curl http://<NODE_IP>:30001/notes
```

**Quan sát / Observe:**
- Mỗi POST trả `pod` khác nhau (round-robin).
- `GET /notes` luôn trả `count=6` và list giống nhau — mọi pod đọc chung Postgres.
- Trường `createdByPod` trong mỗi note cho thấy nhiều pod khác nhau đã ghi.

### 5.2 Scale down `postgres-app` về 1 — data còn nguyên

```bash
kubectl scale deployment/postgres-app --replicas=1
curl http://<NODE_IP>:30001/notes     # vẫn 6 note
```

State nằm ở Postgres → pod chết không ảnh hưởng. Đó là **stateless**.

### 5.3 Stateful thua đau — scale `sqlite-app` lên 3 replica

```bash
kubectl scale deployment/sqlite-app --replicas=3
kubectl get pods -l app=sqlite-app

# POST 9 note
for i in $(seq 1 9); do
  curl -s -X POST http://<NODE_IP>:30002/notes \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"sqlite-$i\"}"
  echo
done

# Đọc nhiều lần — count nhảy loạn theo pod nào được route
for i in 1 2 3 4 5 6; do
  curl -s http://<NODE_IP>:30002/notes
  echo
done
```

**Quan sát / Observe (đây là điểm chốt bài học):**
- Mỗi GET cho `count` khác nhau: `3`, `2`, `4`, `3`... Mỗi pod chỉ thấy những note mà *chính nó* đã ghi.
- `id` các note bị trùng (mỗi SQLite tự đánh số từ 1) — primary key không còn là global identity.

### 5.4 Scale down `sqlite-app` — mất data vĩnh viễn

```bash
kubectl scale deployment/sqlite-app --replicas=1
# 2 pod bị xoá → 2 emptyDir /data bị xoá → 2 file notes.db biến mất
curl http://<NODE_IP>:30002/notes
```

Rolling update cũng cho kết quả y hệt: đổi image → pod mới → `emptyDir` mới toanh → DB trắng.

## Chạy local bằng Docker Compose (không cần Kubernetes) / Run Locally with Docker Compose (No Kubernetes)

### Tiếng Việt

Mỗi app có compose riêng, chạy isolate:

```bash
cd example-backend

# Chạy postgres-app + Postgres (cổng 3000)
docker compose -f apps/postgres-app/docker-compose.yaml up --build -d

# Chạy sqlite-app (cổng 3001)
docker compose -f apps/sqlite-app/docker-compose.yaml up --build -d
```

- `postgres-app`: `curl http://localhost:3000/notes`
- `sqlite-app`:   `curl http://localhost:3001/notes`

### English

Each app has its own compose file — run them in isolation:

```bash
cd example-backend
docker compose -f apps/postgres-app/docker-compose.yaml up --build -d
docker compose -f apps/sqlite-app/docker-compose.yaml   up --build -d
```

- `postgres-app`: `curl http://localhost:3000/notes`
- `sqlite-app`:   `curl http://localhost:3001/notes`

## Dọn dẹp tài nguyên / Cleanup

### Tiếng Việt
Sau khi demo xong, xoá toàn bộ tài nguyên trên cluster:

### English
After the demo, delete all resources from the cluster:

```bash
kubectl delete -f sqlite-app-service.yaml
kubectl delete -f sqlite-app-deployment.yaml
kubectl delete -f postgres-app-service.yaml
kubectl delete -f postgres-app-deployment.yaml
kubectl delete -f postgres-service.yaml
kubectl delete -f postgres-pod.yaml
```

## Biến môi trường backend / Backend Environment Variables

| Biến / Variable | App | Giá trị mặc định / Default Value |
|-----------------|-----|----------------------------------|
| `PORT` | both | `3000` |
| `POSTGRES_HOST` | postgres-app | `postgres-service.default.svc.cluster.local` |
| `POSTGRES_PORT` | postgres-app | `5432` |
| `POSTGRES_USER` | postgres-app | `postgres` |
| `POSTGRES_PASSWORD` | postgres-app | `postgres` |
| `POSTGRES_DATABASE` | postgres-app | `notes` |
| `SQLITE_PATH` | sqlite-app | `/data/notes.db` |

## Bài học rút ra / Key Takeaways

### Tiếng Việt
1. **State quyết định khả năng scale.** Cùng một codebase NestJS + TypeORM, chỉ thay nơi lưu state đã biến từ scale-được sang không-scale-được.
2. **App phải stateless; state đẩy xuống service chuyên giữ state** (Postgres, Redis, S3…).
3. **`Deployment` + filesystem local = anti-pattern.** Nếu buộc phải giữ state trong pod, tối thiểu phải dùng `StatefulSet` + `PersistentVolumeClaim` — nhưng vẫn không phải "scale ngang" theo nghĩa cổ điển.
4. **Service round-robin không cứu được state cục bộ** — user thấy kết quả nhảy loạn y hệt counter RAM trong bài giảng.
5. **Trần thật nằm ở tầng stateful.** Khi traffic tăng 10×, `postgres-app` scale tuyến tính; giới hạn chạm đúng vào Postgres — đó là lúc cần Read Replica, Sharding, Caching (các bài 4.2, 4.3 tiếp theo).

### English
1. **State decides scalability.** Same codebase, different state location → flipping from scalable to not.
2. **Apps must be stateless; push state to dedicated state services** (Postgres, Redis, S3…).
3. **`Deployment` + local filesystem = anti-pattern.** If state must live in a pod, use `StatefulSet` + `PersistentVolumeClaim` — but that's still not "horizontal scaling".
4. **Service round-robin cannot save local state** — users see results jumping around, exactly like the in-memory counter from the lesson.
5. **The real ceiling is the stateful tier.** At 10× traffic, `postgres-app` scales linearly and the bottleneck lands on Postgres — enter Read Replicas, Sharding, and Caching (lessons 4.2, 4.3).
