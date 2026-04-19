# Caching Basics — Cache-Aside with Redis

Demo pattern **Cache-Aside** (Lazy Loading) — cứu DB khỏi 10,000 request đọc cùng 1 row.
(EN: Demo the **Cache-Aside** (Lazy Loading) pattern — shielding DB from repeated reads on the same row.)

> Gắn với bài **Module 4.2 — Caching Basics**.

---

## Flow

```
GET /products/:id
     │
     ▼
  [App] ─── cache.get(key) ───▶ [Redis]
     │                              │
     │◀──────── hit ────────────────┘ (trả về ngay, ~2ms)
     │
     │  miss
     ▼
  [App] ─── SELECT * WHERE id ──▶ [DB] (chậm 500ms)
     │                              │
     │◀───── row ───────────────────┘
     │
     └── cache.set(key, row, TTL=60s) ──▶ [Redis]
```

Write:
```
PUT /products/:id/price  → DB UPDATE → cache.del(key)   # invalidate
```

---

## Install & run

```bash
npm install
docker compose -f .docker/redis.yaml up -d
npx nest start --watch
```

---

## Test

```bash
# Lần 1: cache miss → 500ms (do delay giả lập DB)
curl http://localhost:3000/products/1
# { "source": "db", "data": {...}, "durationMs": 505 }

# Lần 2: cache hit → vài ms
curl http://localhost:3000/products/1
# { "source": "cache", "data": {...}, "durationMs": 3 }

# Update giá → cache bị invalidate
curl -X PUT http://localhost:3000/products/1/price \
  -H 'Content-Type: application/json' \
  -d '{"price": 1099}'

# Lần 3: miss lại (do del) → đọc giá mới từ DB
curl http://localhost:3000/products/1
```

Quan sát log Nest:
- `[CACHE MISS] product:1`
- `[DB HIT ] SELECT * FROM products WHERE id=1`
- `[CACHE HIT ] product:1`
- `[CACHE INVALIDATE] product:1`

---

## Cache Patterns — So sánh nhanh

| Pattern | Read | Write | Phù hợp |
|---|---|---|---|
| **Cache-Aside** (demo này) | App đọc cache → miss thì đọc DB + set cache | App ghi DB → del cache | Default, đơn giản |
| **Write-Through** | App đọc cache trước | App ghi cache → cache ghi DB | Cần consistency strong |
| **Write-Behind** | App đọc cache | App ghi cache → ghi DB async | Write-heavy, chấp nhận eventual |
| **Read-Through** | App đọc cache; cache tự load DB khi miss | Giống Write-Through | Ẩn DB hoàn toàn |

---

## Cache Invalidation — 2 con quỷ

1. **Stale data**: quên `del` sau khi `UPDATE` → user đọc giá cũ.
2. **Thundering herd**: 10,000 request cùng miss một lúc → đánh sập DB. Fix bằng **lock + single-flight** hoặc **probabilistic early expiration**.

---

## Cleanup

```bash
docker compose -f .docker/redis.yaml down -v
```

---

## References
- [Redis Caching Strategies](https://redis.io/learn/howtos/solutions/caching-architecture)
- [AWS Cache-Aside Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/cache-aside.html)
