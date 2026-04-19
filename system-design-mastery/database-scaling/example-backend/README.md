# Example backend — NestJS + 4 Helm databases

Ứng dụng NestJS minh hoạ **một service** kết nối đồng thời:

| Backend | Thư viện | Endpoint kiểm tra |
|---------|-----------|-------------------|
| PostgreSQL HA (Pgpool) | `@nestjs/typeorm` + `pg` | `GET /integrations` → `postgres` |
| Redis Cluster | `ioredis` `Cluster` | `redis` |
| MongoDB Sharded (mongos) | `@nestjs/mongoose` | `mongodb` |
| Apache Cassandra | `cassandra-driver` (DataStax) | `cassandra` |

NestJS **không** có package `@nestjs/cassandra` chính thức; pattern chuẩn là provider `useFactory` bọc `cassandra-driver` (xem `src/cassandra/cassandra.module.ts`).

## Chạy local (cluster đã có Helm + port-forward)

```bash
npm install
cp .env.example .env
# Sửa .env nếu port-forward khác localhost
npx nest start --watch
```

Ví dụ port-forward (terminal riêng):

```bash
kubectl port-forward -n database svc/postgresql-ha-pgpool 5432:5432
kubectl port-forward -n database svc/redis-cluster 6379:6379
kubectl port-forward -n database svc/mongodb-sharded-mongodb-sharded 27017:27017
kubectl port-forward -n database svc/cassandra 9042:9042
```

Khi đó trong `.env` dùng `127.0.0.1` thay cho DNS cluster.

## API

- `GET /health` — không gọi DB.
- `GET /integrations` — ping song song 4 nguồn, trả `{ postgres, redis, mongodb, cassandra }` mỗi mục `{ ok, ms, detail?, error? }`.
- `POST /integrations/demo-write` — body `{ "message": "..." }`: ghi Mongo + Cassandra + tăng counter Redis.

## MongoDB sharded — shard key (ops)

Để shard collection `integration_events` theo `bucket`, sau khi cluster sẵn sàng (mongosh trên mongos):

```javascript
sh.enableSharding("demo");
sh.shardCollection("demo.integration_events", { bucket: 1 });
```

Không chạy lệnh này vẫn dùng được cho demo ping/ghi trên unsharded DB; sharding là bước minh hoạ thêm.

## Build production

```bash
npm run build
node dist/main.js
```
