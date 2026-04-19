# Rate Limiting & CDN (Perimeter Defense)

Demo 2 lớp phòng thủ ngoài vành đai: **Rate Limiting** (chống DDOS/abuse) và **CDN** (giảm tải origin cho static assets).
(EN: Demo 2 perimeter defenses — Rate Limiting and CDN.)

> Gắn với bài **Module 4.4 — Protecting the System**.

---

## Flow

```
Client ──▶ Nginx CDN Edge :8080
            │  /static/*  ──── cache HIT ───▶ (trả luôn, không đánh origin)
            │  /static/*  ──── cache MISS ──▶ Origin :3000 (Nest) ──▶ set cache
            │  /api/*     ─── pass-through ─▶ Origin :3000
                                                │
                                                ▼
                                       ThrottlerGuard (Redis)
                                      5 req/s, 30 req/min default
                                      3 req/10s cho /login
```

---

## Install & run

```bash
npm install
docker compose -f .docker/redis.yaml up -d
npx nest start --watch

# Terminal khác — bật CDN edge giả lập
docker compose -f .docker/nginx.yaml up -d
```

---

## Test Rate Limiting

```bash
# Bắn 10 request nhanh vào /api/data — request thứ 6 trở đi sẽ nhận 429
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/data; done
# 200 200 200 200 200 429 429 429 429 429

# /login bị limit nặng hơn: 3 / 10s
for i in {1..5}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/login; done
# 200 200 200 429 429
```

---

## Test CDN

```bash
# Lần 1 qua edge — cache MISS, đánh xuống origin
curl -I http://localhost:8080/static/logo.svg
# X-Cache-Status: MISS

# Lần 2 — cache HIT, không đánh origin (kể cả khi tắt Nest!)
curl -I http://localhost:8080/static/logo.svg
# X-Cache-Status: HIT

# Sau 60s (TTL hết), lần gọi tiếp theo sẽ MISS lại
```

---

## Thuật toán Rate Limit

| Algo | Ưu | Nhược |
|---|---|---|
| **Fixed Window** | Rẻ, đơn giản | Double-burst ở mép window |
| **Sliding Window** (đang dùng) | Mượt, chính xác | Tốn hơn chút |
| **Token Bucket** | Cho phép burst ngắn | Cần lưu token + refill job |
| **Leaky Bucket** | Rate đầu ra ổn định | Drop request khi đầy |

`@nestjs/throttler` 6.x dùng sliding window over Redis với Lua script — share counter giữa nhiều instance.

---

## CDN — con dao 2 lưỡi

- **Lợi**: Edge cache 200ms → 10ms, giảm 90% bandwidth.
- **Hại**: **Cache Invalidation**. Push `app.js` mới mà CDN vẫn serve bản cũ 24h → user "F5 không thấy gì mới".
  - Fix: versioned URL (`app.v2.js`), hoặc gọi API purge khi deploy.

---

## Cleanup

```bash
docker compose -f .docker/nginx.yaml down
docker compose -f .docker/redis.yaml down -v
```

---

## References
- [@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting)
- [Nginx proxy_cache](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache)
