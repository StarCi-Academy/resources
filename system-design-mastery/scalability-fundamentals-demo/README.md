# Scalability Fundamentals Demo

Demo bottleneck **stateful vs stateless** — chứng minh vì sao muốn scale out thì app phải stateless.
(EN: Demo the stateful vs stateless bottleneck — proving why scaling out demands a stateless app.)

> Gắn với bài **Module 4.0 — Scalability Fundamentals**.

---

## Mục tiêu / Objective

### Tiếng Việt
- 1 NestJS app expose 2 endpoint:
  - `POST /counter/local` — counter lưu trong RAM của chính instance (**stateful**).
  - `POST /counter/shared` — counter lưu trên Redis (**stateless**).
- Chạy 2 instance trên port 3001, 3002 để thấy:
  - Endpoint stateful: mỗi instance có 1 counter riêng → hit kiểu nào cũng lệch.
  - Endpoint stateless: mọi instance cùng đọc/ghi 1 key Redis → consistent.

### English
- 1 NestJS app exposing 2 endpoints:
  - `POST /counter/local` — in-memory counter (**stateful**).
  - `POST /counter/shared` — Redis-backed counter (**stateless**).
- Run 2 instances on ports 3001 and 3002 to observe:
  - Stateful endpoint: each instance has its own counter → inconsistent.
  - Stateless endpoint: all instances share the same Redis key → consistent.

---

## Cấu trúc thư mục / Directory Structure

```
scalability-fundamentals-demo/
├── .docker/
│   └── redis.yaml
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── counter.controller.ts
│   ├── stateful-counter.service.ts    # state trong RAM
│   ├── stateless-counter.service.ts   # state ở Redis
│   └── index.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Bước 1 — Cài đặt / Install

```bash
npm install
```

---

## Bước 2 — Chạy Redis / Run Redis

```bash
docker compose -f .docker/redis.yaml up --build -d
```

---

## Bước 3 — Chạy 2 instance / Run 2 Instances

### Windows PowerShell

```powershell
# Terminal 1
$env:PORT="3001"; $env:INSTANCE_ID="A"; npx nest start --watch

# Terminal 2
$env:PORT="3002"; $env:INSTANCE_ID="B"; npx nest start --watch
```

### macOS / Linux

```bash
# Terminal 1
PORT=3001 INSTANCE_ID=A npx nest start --watch

# Terminal 2
PORT=3002 INSTANCE_ID=B npx nest start --watch
```

---

## Bước 4 — Test / Test

```bash
# STATEFUL — hit vào instance A rồi instance B, counter không liên quan gì nhau
curl -X POST http://localhost:3001/counter/local
# -> { "instanceId": "A", "counter": 1 }
curl -X POST http://localhost:3001/counter/local
# -> { "instanceId": "A", "counter": 2 }
curl -X POST http://localhost:3002/counter/local
# -> { "instanceId": "B", "counter": 1 }  (instance B có counter riêng!)

# STATELESS — cả 2 instance dùng chung 1 key Redis
curl -X POST http://localhost:3001/counter/shared
# -> { "instanceId": "A", "counter": 1 }
curl -X POST http://localhost:3002/counter/shared
# -> { "instanceId": "B", "counter": 2 }   (tăng tiếp từ giá trị của A)
curl -X POST http://localhost:3001/counter/shared
# -> { "instanceId": "A", "counter": 3 }
```

### Bài học / Takeaway

- **Stateful endpoint**: kết quả phụ thuộc bạn hit vào instance nào → không thể đặt load balancer ở trước, vì user sẽ thấy kết quả nhảy loạn.
  (EN: Stateful endpoint yields different answers per instance — cannot safely sit behind a load balancer.)
- **Stateless endpoint**: counter được externalize ra Redis → scale ngang bao nhiêu instance cũng vẫn đồng nhất.
  (EN: Stateless endpoint externalizes state to Redis → consistent regardless of how many instances scale out.)

**Kết luận**: state là nguồn gốc của mọi bottleneck. Muốn horizontal scaling hoạt động, phải đẩy state ra khỏi application memory (session → JWT/Redis, file → S3, counter → Redis/DB...).
(EN: State is the root bottleneck. To horizontally scale, externalize state out of application memory.)

---

## Dọn dẹp / Cleanup

```bash
docker compose -f .docker/redis.yaml down -v
```

---

## Tài liệu tham khảo / References

- [The Twelve-Factor App: Processes](https://12factor.net/processes)
- [ioredis GitHub](https://github.com/redis/ioredis)
