# Database Scaling — Read Replica + Sharding

Demo 2 kỹ thuật scale DB: **Read Replica** (tách reads khỏi writes) và **Sharding** (băm data ra nhiều host).
(EN: Demos 2 DB scaling techniques: Read Replica and Sharding.)

> Gắn với bài **Module 4.3 — Database Scaling**.

---

## Flow

```
POST /users                     GET /users                 GET /users?strong=1
       │                              │                            │
       ▼                              ▼                            ▼
   [Primary :5432]              [Replica :5433]              [Primary :5432]
       │                              ▲
       │   streaming replication      │
       └──────────────────────────────┘
```

- Writes luôn đi primary.
- Reads thường đi replica (rẻ hơn, scale được).
- Reads strong consistency (vd: ngay sau write) bắt buộc đi primary để tránh replication lag.

---

## Install & run

```bash
npm install

# Bật primary + replica (có sẵn streaming replication qua Bitnami)
docker compose -f .docker/postgresql.yaml up -d

# Seed schema vào primary — replica sẽ tự đồng bộ
docker exec -i db-scaling-primary psql -U app -d appdb < .docker/init.sql

npx nest start --watch
```

---

## Test

```bash
# 1) Tạo user (đi primary)
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"c@example.com","name":"Charlie"}'

# 2) Đọc từ replica (mặc định)
curl http://localhost:3000/users

# 3) Đọc strong từ primary (dùng cho flow critical)
curl "http://localhost:3000/users?strong=1"

# 4) Check shard — id=7 trong 4 shard
curl http://localhost:3000/users/7/shard
# { "userId": 7, "shardIndex": 3, "totalShards": 4 }
```

---

## Replication Lag — bẫy thường gặp

```
write: PUT /password (primary)   →   read: GET /me (replica, lag 1s)
                                              └─ vẫn thấy password cũ → "Sai mật khẩu"
```

Fix: luồng "vừa write xong lại read" phải đọc primary (`strong=1` trong demo).

---

## Sharding — các trap phải tránh

| Trap | Mô tả | Cách né |
|---|---|---|
| **Hotspot** | 1 celebrity nằm ở shard A → shard A ngập, shard B rảnh | Shard key cần phân bố đều; dùng composite key |
| **Cross-shard JOIN** | `users` ở shard A, `orders` ở shard B | Aggregate ở application layer |
| **Resharding đau** | Tăng từ 4 shard → 8 shard → 75% data phải di chuyển (với modulo) | Consistent hashing |

---

## Cleanup

```bash
docker compose -f .docker/postgresql.yaml down -v
```

---

## References
- [Bitnami PostgreSQL Replication](https://hub.docker.com/r/bitnami/postgresql)
- [Consistent Hashing](https://en.wikipedia.org/wiki/Consistent_hashing)
