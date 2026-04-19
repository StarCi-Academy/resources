# Database Scaling — Read Replica, Sharding & Helm clusters

Module **4.3 — Database Scaling**: gồm **Helm charts** (PostgreSQL HA, Redis Cluster, MongoDB Sharded, Cassandra) và **example-backend** NestJS ping/ghi cả bốn nguồn.

---

## Cấu trúc thư mục

```
database-scaling/
├── helm/                    # Bitnami OCI + override image bitnamilegacy
│   ├── postgresql-ha/
│   ├── redis-cluster/
│   ├── mongodb-sharded/
│   └── cassandra/
├── example-backend/         # NestJS — TypeORM + Mongoose + ioredis Cluster + cassandra-driver
└── README.md
```

---

## Example backend (NestJS)

Xem [`example-backend/README.md`](example-backend/README.md).

Tóm tắt:

```bash
cd example-backend
npm install
cp .env.example .env
npx nest start --watch
```

- `GET /integrations` — ping **Postgres (Pgpool)**, **Redis Cluster**, **MongoDB (mongos)**, **Cassandra**.
- `POST /integrations/demo-write` — ghi mẫu Mongo + Cassandra + Redis counter.

Cassandra dùng package **`cassandra-driver`** với Nest provider (`src/cassandra/`), không có `@nestjs/cassandra` official.

---

## Kubernetes + Helm — 4 ví dụ HA / sharding (Bitnami)

Chart từ `oci://registry-1.docker.io/bitnamicharts/*`; `values.yaml` override image sang **`docker.io/bitnamilegacy/*`**. Chi tiết: [`helm/README.md`](helm/README.md).

| Stack | Chart | Ý chính |
|-------|-------|---------|
| PostgreSQL HA | `postgresql-ha` | Repmgr + standby; client qua **Pgpool** |
| Redis Cluster | `redis-cluster` | Hash slots; master/replica |
| MongoDB Sharded | `mongodb-sharded` | **Mongos** + shards |
| Cassandra | `cassandra` | Ring + RF/CL; CQL |

### Triển khai nhanh

```bash
cd helm/postgresql-ha && chmod +x run.sh && ./run.sh && cd ../..
cd helm/redis-cluster   && chmod +x run.sh && ./run.sh && cd ../..
cd helm/mongodb-sharded && chmod +x run.sh && ./run.sh && cd ../..
cd helm/cassandra       && chmod +x run.sh && ./run.sh && cd ../..
```

### Cleanup Helm

```bash
helm uninstall postgresql-ha redis-cluster mongodb-sharded cassandra -n database 2>/dev/null
kubectl delete pvc --all -n database
kubectl delete namespace database
```

---

## Liên kết

- [Bitnami postgresql-ha chart](https://github.com/bitnami/charts/tree/main/bitnami/postgresql-ha)
- [Bitnami redis-cluster chart](https://github.com/bitnami/charts/tree/main/bitnami/redis-cluster)
- [Bitnami mongodb-sharded chart](https://github.com/bitnami/charts/tree/main/bitnami/mongodb-sharded)
- [Bitnami cassandra chart](https://github.com/bitnami/charts/tree/main/bitnami/cassandra)
- [cassandra-driver (Node.js)](https://docs.datastax.com/en/developer-driver-nodejs-docs/)

Bài **Complex applications and Helm charts** có thể trùng mẫu; bản gom cho 4.3 nằm tại `helm/` + `example-backend/` trong module này.
