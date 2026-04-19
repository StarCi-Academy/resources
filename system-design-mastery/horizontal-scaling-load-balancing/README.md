# Horizontal Scaling & Load Balancing

Demo Nginx load balancer đứng trước 3 NestJS instance, round-robin traffic.
(EN: Demo Nginx load balancer fronting 3 NestJS instances with round-robin traffic.)

> Gắn với bài **Module 4.1 — Horizontal Scaling & Load Balancing**.

---

## Mục tiêu / Objective

### Tiếng Việt
- 3 NestJS instance stateless chạy trên port 3001/3002/3003.
- Nginx container lắng port 8080 làm load balancer — round robin về 3 instance.
- Test round-robin bằng `curl` liên tục, thấy `instanceId` xoay vòng.
- Kill 1 instance để thấy Nginx tự né node chết.

### English
- 3 stateless NestJS instances on ports 3001/3002/3003.
- Nginx container on port 8080 acts as load balancer — round robin to 3 instances.
- Verify round-robin by `curl`ing repeatedly; observe `instanceId` rotating.
- Kill 1 instance to see Nginx automatically skip the dead node.

---

## Cấu trúc / Structure

```
horizontal-scaling-load-balancing/
├── .docker/
│   ├── nginx.conf          # upstream round-robin config
│   └── nginx.yaml          # docker-compose Nginx
├── src/
│   ├── main.ts             # bootstrap lấy PORT/INSTANCE_ID từ ENV
│   ├── app.module.ts
│   ├── app.controller.ts   # GET / + GET /health
│   └── index.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Luồng / Flow

```
curl http://localhost:8080
        │
        ▼
     Nginx :8080  (round-robin upstream)
  ┌──────┼──────┐
  ▼      ▼      ▼
node-A  node-B  node-C
:3001   :3002   :3003
```

---

## Bước 1 — Install

```bash
npm install
```

---

## Bước 2 — Chạy 3 NestJS instance

### Windows PowerShell

```powershell
# Terminal 1
$env:PORT="3001"; $env:INSTANCE_ID="node-A"; npx nest start --watch

# Terminal 2
$env:PORT="3002"; $env:INSTANCE_ID="node-B"; npx nest start --watch

# Terminal 3
$env:PORT="3003"; $env:INSTANCE_ID="node-C"; npx nest start --watch
```

### macOS / Linux

```bash
PORT=3001 INSTANCE_ID=node-A npx nest start --watch
PORT=3002 INSTANCE_ID=node-B npx nest start --watch
PORT=3003 INSTANCE_ID=node-C npx nest start --watch
```

---

## Bước 3 — Chạy Nginx

```bash
docker compose -f .docker/nginx.yaml up --build -d
```

---

## Bước 4 — Test round-robin

```bash
for i in 1 2 3 4 5 6; do curl -s http://localhost:8080 | jq .instanceId; done
# -> "node-A"
# -> "node-B"
# -> "node-C"
# -> "node-A"
# ...
```

### Test fail-over

- Ctrl+C dừng instance B.
- Gọi lại `curl` liên tục — bạn sẽ thấy Nginx tự động bỏ qua node chết và chỉ chia giữa A và C.
(EN: Stop instance B, re-curl — Nginx skips the dead node and balances between A and C.)

---

## Layer 4 vs Layer 7 Load Balancing

| | Layer 4 (TCP/UDP) | Layer 7 (HTTP) |
|---|---|---|
| Tốc độ | Rất nhanh, ít CPU | Chậm hơn một chút |
| Hiểu HTTP path/header | ❌ | ✅ |
| Route theo URL | ❌ | ✅ (`/api/images` → cluster A) |
| Ví dụ | AWS NLB, HAProxy TCP | AWS ALB, Nginx, Traefik |

Nginx trong demo này đang chạy **Layer 7** — có thể đổi `location /api/xxx` để route riêng theo path.

---

## Thuật toán LB (đổi trong `nginx.conf`)

```nginx
upstream nest_backend {
  # round robin (default)
  # least_conn;                        # ít connection nhất
  # ip_hash;                           # sticky theo client IP
  server host.docker.internal:3001;
  server host.docker.internal:3002;
  server host.docker.internal:3003;
}
```

---

## Cleanup

```bash
docker compose -f .docker/nginx.yaml down
```

---

## References
- [Nginx Load Balancing](http://nginx.org/en/docs/http/load_balancing.html)
- [12-Factor App — Processes](https://12factor.net/processes)
