# Helm — 4 mẫu scale DB trên Kubernetes (Bitnami + bitnamilegacy)

Thư mục này nằm trong **Module 4.3 — Database Scaling**: minh hoạ **HA** (high availability) và **sharding / phân mảnh dữ liệu** bằng Helm chart chính thức từ `bitnamicharts`, override image sang **`docker.io/bitnamilegacy/*`** (theo cùng pattern Bitnami khuyến nghị khi không dùng image `bitnami/*` mặc định).

| Thư mục | Chart OCI | Ý chính (VI) | Main idea (EN) |
|----------|-----------|--------------|----------------|
| `postgresql-ha/` | `postgresql-ha` | Primary + standby (repmgr), client qua **Pgpool** | HA SQL: failover + pooler |
| `redis-cluster/` | `redis-cluster` | **16384 hash slots** chia 3 master; replica HA | Partitioned in-memory cache |
| `mongodb-sharded/` | `mongodb-sharded` | **Mongos** route; shard per range/hash | Horizontal partition cho document DB |
| `cassandra/` | `cassandra` | Ring topology; RF + consistency | Wide-column; HA + scale-out writes |

Mỗi chart có `values.origin.yaml` (snapshot từ [bitnami/charts](https://github.com/bitnami/charts)) và `values.yaml` (chỉ override image + password demo + quy mô nhỏ).

**Prerequisite:** Kubernetes + Helm 3.8+ (OCI). Namespace mặc định: `database`.

```bash
kubectl version --client
helm version
```

Xem hướng dẫn chi tiết, bảng so sánh HA vs sharding, và lệnh dọn dẹp trong [`../README.md`](../README.md) (mục Kubernetes + Helm).
