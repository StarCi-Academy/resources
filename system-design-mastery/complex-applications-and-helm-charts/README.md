# Complex Applications and Helm Charts

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai các ứng dụng phức tạp (database cluster) trên Kubernetes bằng Helm.
- Sử dụng Bitnami Helm charts từ OCI registry (`bitnamicharts`).
- Cấu hình High Availability cho MongoDB, PostgreSQL và Redis.

### English
- Deploy complex applications (database clusters) on Kubernetes using Helm.
- Use Bitnami Helm charts from OCI registry (`bitnamicharts`).
- Configure High Availability for MongoDB, PostgreSQL, and Redis.

## Cấu trúc thư mục / Directory Structure

```
complex-applications-and-helm-charts/
├── mongodb-sharded/
│   ├── values.origin.yaml  # File gốc từ Bitnami GitHub (EN: original file from Bitnami GitHub)
│   ├── values.yaml         # Override với bitnamilegacy images (EN: override with bitnamilegacy images)
│   ├── run.sh              # Script triển khai cho Linux/macOS (EN: deploy script for Linux/macOS)
│   └── run.ps1             # Script triển khai cho Windows (EN: deploy script for Windows)
├── postgresql-ha/
│   ├── values.origin.yaml  # File gốc từ Bitnami GitHub (EN: original file from Bitnami GitHub)
│   ├── values.yaml         # Override với bitnamilegacy images (EN: override with bitnamilegacy images)
│   ├── run.sh              # Script triển khai cho Linux/macOS (EN: deploy script for Linux/macOS)
│   └── run.ps1             # Script triển khai cho Windows (EN: deploy script for Windows)
├── redis-cluster/
│   ├── values.origin.yaml  # File gốc từ Bitnami GitHub (EN: original file from Bitnami GitHub)
│   ├── values.yaml         # Override với bitnamilegacy images (EN: override with bitnamilegacy images)
│   ├── run.sh              # Script triển khai cho Linux/macOS (EN: deploy script for Linux/macOS)
│   └── run.ps1             # Script triển khai cho Windows (EN: deploy script for Windows)
└── README.md
```

## Giải thích về file values / Values File Explanation

### Tiếng Việt
- `values.origin.yaml`: File gốc từ GitHub Bitnami, chứa tất cả cấu hình mặc định với image `bitnami/*`.
- `values.yaml`: File override chỉ chứa các thay đổi cần thiết, đổi image từ `bitnami/*` sang `bitnamilegacy/*`.

### English
- `values.origin.yaml`: Original file from Bitnami GitHub, contains all default configurations with `bitnami/*` images.
- `values.yaml`: Override file containing only necessary changes, switching images from `bitnami/*` to `bitnamilegacy/*`.

### Image mapping / Bảng ánh xạ image

| Original (bitnami/) | Legacy (bitnamilegacy/) |
|---------------------|-------------------------|
| `bitnami/redis-cluster` | `bitnamilegacy/redis-cluster` |
| `bitnami/redis-exporter` | `bitnamilegacy/redis-exporter` |
| `bitnami/mongodb-sharded` | `bitnamilegacy/mongodb-sharded` |
| `bitnami/mongodb-exporter` | `bitnamilegacy/mongodb-exporter` |
| `bitnami/postgresql-repmgr` | `bitnamilegacy/postgresql-repmgr` |
| `bitnami/pgpool` | `bitnamilegacy/pgpool` |
| `bitnami/postgres-exporter` | `bitnamilegacy/postgres-exporter` |
| `bitnami/os-shell` | `bitnamilegacy/os-shell` |

## Yêu cầu / Prerequisites

### Tiếng Việt
- Kubernetes cluster đang chạy (Minikube, Docker Desktop, hoặc cloud).
- `kubectl` đã kết nối đến cluster.
- `helm` version 3.8+ (hỗ trợ OCI registry).

### English
- A running Kubernetes cluster (Minikube, Docker Desktop, or cloud).
- `kubectl` connected to the cluster.
- `helm` version 3.8+ (OCI registry support).

```bash
# Kiểm tra phiên bản (EN: check versions)
kubectl version --client
helm version
```

## Helm Charts sử dụng / Helm Charts Used

| Chart | OCI Registry | Mô tả / Description |
|-------|--------------|---------------------|
| MongoDB Sharded | `oci://registry-1.docker.io/bitnamicharts/mongodb-sharded` | Sharded cluster với ConfigServer + Mongos + Shards |
| PostgreSQL HA | `oci://registry-1.docker.io/bitnamicharts/postgresql-ha` | HA cluster với Pgpool + Repmgr |
| Redis Cluster | `oci://registry-1.docker.io/bitnamicharts/redis-cluster` | Native Redis Cluster (6 nodes: 3 master + 3 slave) |

## Triển khai / Deployment

### MongoDB Sharded

#### Linux/macOS

```bash
cd mongodb-sharded
chmod +x run.sh
./run.sh
```

#### Windows (PowerShell)

```powershell
cd mongodb-sharded
.\run.ps1
```

#### Thông tin kết nối / Connection Info

| Thông tin / Info | Giá trị / Value |
|------------------|-----------------|
| Endpoint | `mongodb-sharded-mongodb-sharded.database.svc.cluster.local:27017` |
| Root Password | `root123` |

---

### PostgreSQL HA

#### Linux/macOS

```bash
cd postgresql-ha
chmod +x run.sh
./run.sh
```

#### Windows (PowerShell)

```powershell
cd postgresql-ha
.\run.ps1
```

#### Thông tin kết nối / Connection Info

| Thông tin / Info | Giá trị / Value |
|------------------|-----------------|
| Endpoint (Pgpool) | `postgresql-ha-pgpool.database.svc.cluster.local:5432` |
| Database | `demo_db` |
| Username | `postgres` |
| Password | `postgres123` |

---

### Redis Cluster

#### Linux/macOS

```bash
cd redis-cluster
chmod +x run.sh
./run.sh
```

#### Windows (PowerShell)

```powershell
cd redis-cluster
.\run.ps1
```

#### Thông tin kết nối / Connection Info

| Thông tin / Info | Giá trị / Value |
|------------------|-----------------|
| Endpoint | `redis-cluster.database.svc.cluster.local:6379` |
| Password | `redis123` |

## Kiểm tra trạng thái / Verify Status

```bash
# Xem tất cả pods trong namespace database (EN: view all pods in database namespace)
kubectl get pods -n database

# Xem services (EN: view services)
kubectl get svc -n database

# Xem persistent volumes (EN: view persistent volumes)
kubectl get pvc -n database
```

## Kiến trúc / Architecture

### MongoDB Sharded

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐             ┌─────▼─────┐
        │  Mongos 1 │             │  Mongos 2 │
        └─────┬─────┘             └─────┬─────┘
              │                         │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
   │ ConfigSvr │     │  Shard 1  │     │  Shard 2  │
   │ (3 nodes) │     │ (3 nodes) │     │ (3 nodes) │
   └───────────┘     └───────────┘     └───────────┘
```

### PostgreSQL HA

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐             ┌─────▼─────┐
        │  Pgpool 1 │             │  Pgpool 2 │
        └─────┬─────┘             └─────┬─────┘
              │                         │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
   │  Primary  │────►│ Standby 1 │────►│ Standby 2 │
   │  (Write)  │     │  (Read)   │     │  (Read)   │
   └───────────┘     └───────────┘     └───────────┘
```

### Redis Cluster

```
              ┌─────────────────────────────────────────┐
              │           Redis Cluster (6 nodes)       │
              │                                         │
              │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
              │  │Master 1 │  │Master 2 │  │Master 3 │  │
              │  │ Slot    │  │ Slot    │  │ Slot    │  │
              │  │ 0-5460  │  │5461-10922│ │10923-16383│ │
              │  └────┬────┘  └────┬────┘  └────┬────┘  │
              │       │            │            │       │
              │  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  │
              │  │ Slave 1 │  │ Slave 2 │  │ Slave 3 │  │
              │  └─────────┘  └─────────┘  └─────────┘  │
              └─────────────────────────────────────────┘
```

## Dọn dẹp tài nguyên / Cleanup

### Tiếng Việt
Xóa từng release bằng Helm:

### English
Delete each release using Helm:

```bash
# Xóa MongoDB Sharded (EN: delete MongoDB Sharded)
helm uninstall mongodb-sharded -n database

# Xóa PostgreSQL HA (EN: delete PostgreSQL HA)
helm uninstall postgresql-ha -n database

# Xóa Redis Cluster (EN: delete Redis Cluster)
helm uninstall redis-cluster -n database

# Xóa PVC nếu cần (EN: delete PVCs if needed)
kubectl delete pvc --all -n database

# Xóa namespace (EN: delete namespace)
kubectl delete namespace database
```

## Lưu ý Production / Production Notes

### Tiếng Việt
- **Mật khẩu**: Thay đổi tất cả mật khẩu mặc định trong `values.yaml` trước khi deploy production.
- **Storage**: Sử dụng StorageClass phù hợp với cloud provider (gp2, gp3 cho AWS; pd-ssd cho GCP).
- **Resources**: Cấu hình `resources.requests` và `resources.limits` cho CPU/Memory.
- **Backup**: Thiết lập backup strategy cho dữ liệu quan trọng.

### English
- **Passwords**: Change all default passwords in `values.yaml` before production deployment.
- **Storage**: Use appropriate StorageClass for your cloud provider (gp2, gp3 for AWS; pd-ssd for GCP).
- **Resources**: Configure `resources.requests` and `resources.limits` for CPU/Memory.
- **Backup**: Set up a backup strategy for critical data.
