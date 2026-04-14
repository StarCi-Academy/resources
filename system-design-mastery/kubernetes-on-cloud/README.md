# Kubernetes on Cloud (DigitalOcean)

Hướng dẫn triển khai ứng dụng NestJS lên DigitalOcean Kubernetes (DOKS) với NGINX Ingress Controller và Cert-Manager.
(EN: Guide to deploy NestJS application to DigitalOcean Kubernetes with NGINX Ingress Controller and Cert-Manager.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai ứng dụng NestJS backend lên DigitalOcean Kubernetes (DOKS).
- Sử dụng **NGINX Ingress Controller** (Bitnami) để route traffic HTTP/HTTPS vào cluster.
- Sử dụng **Cert-Manager** (Bitnami) để tự động cấp và renew SSL/TLS certificate từ Let's Encrypt.
- Cấu hình DigitalOcean Load Balancer với sticky sessions và REGIONAL_NETWORK.
- Tất cả images sử dụng `bitnamilegacy/*` để đảm bảo tương thích.

### English
- Deploy a NestJS backend application to DigitalOcean Kubernetes (DOKS).
- Use **NGINX Ingress Controller** (Bitnami) to route HTTP/HTTPS traffic into the cluster.
- Use **Cert-Manager** (Bitnami) to automatically provision and renew SSL/TLS certificates from Let's Encrypt.
- Configure DigitalOcean Load Balancer with sticky sessions and REGIONAL_NETWORK.
- All images use `bitnamilegacy/*` for compatibility.

---

## Cấu trúc thư mục / Directory Structure

```
kubernetes-on-cloud/
├── cert-manager/                        # Cấu hình Cert-Manager (EN: Cert-Manager configuration)
│   ├── values.origin.yaml               # File gốc từ Bitnami (EN: original Bitnami values)
│   ├── values.yaml                      # Custom values — bitnamilegacy images + nodeSelector
│   ├── run.sh                           # Script triển khai Linux/macOS (EN: deploy script)
│   └── run.ps1                          # Script triển khai Windows PowerShell
├── nginx-ingress-controller/            # Cấu hình NGINX Ingress (EN: NGINX Ingress configuration)
│   ├── values.origin.yaml               # File gốc từ Bitnami (EN: original Bitnami values)
│   ├── values.yaml                      # Custom values — DO LB annotations + nodeSelector
│   ├── run.sh                           # Script triển khai Linux/macOS
│   └── run.ps1                          # Script triển khai Windows PowerShell
├── example-backend/                     # NestJS backend application
│   ├── src/                             # Mã nguồn TypeScript (EN: TypeScript source code)
│   │   ├── main.ts                      # Entry point — bootstrap NestJS app
│   │   ├── app.module.ts                # Root module — kết nối MySQL + Redis
│   │   ├── app.controller.ts            # HTTP endpoints
│   │   ├── app.service.ts               # Business logic
│   │   ├── item.entity.ts               # TypeORM entity
│   │   ├── redis.module.ts              # Redis connection module
│   │   └── index.ts                     # Barrel export
│   ├── Dockerfile                       # Multi-stage Docker build
│   ├── docker-compose.yaml              # Build và chạy local (EN: build and run locally)
│   ├── package.json                     # Dependencies
│   └── tsconfig.json                    # TypeScript config
├── mysql-pod.yaml                       # Pod MySQL (EN: MySQL Pod manifest)
├── mysql-service.yaml                   # Service ClusterIP cho MySQL (EN: ClusterIP Service)
├── redis-pod.yaml                       # Pod Redis (EN: Redis Pod manifest)
├── redis-service.yaml                   # Service ClusterIP cho Redis (EN: ClusterIP Service)
├── backend-deployment.yaml              # Deployment backend — 3 replicas
├── backend-service.yaml                 # Service NodePort cho backend
├── cluster-issuer.yaml                  # ClusterIssuer Let's Encrypt (prod + staging)
├── ingress.yaml                         # Ingress resource — route traffic + TLS
└── README.md                            # File này (EN: this file)
```

---

## Kiến trúc hệ thống / System Architecture

### Tiếng Việt

```
                              Internet
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  DigitalOcean Load Balancer │
                    │  (REGIONAL_NETWORK + Sticky │
                    │   Sessions via Cookies)     │
                    └─────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  NGINX Ingress Controller   │
                    │  (namespace: ingress-nginx) │
                    │  - 2 replicas               │
                    │  - nodeSelector: ingress-pool│
                    └─────────────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
    ┌─────────────┐      ┌───────────────┐      ┌─────────────┐
    │ ClusterIssuer│      │    Ingress    │      │  Default    │
    │ (cert-manager│      │   Resource    │      │  Backend    │
    │  namespace)  │      │ (ingress.yaml)│      │   (404)     │
    └─────────────┘      └───────────────┘      └─────────────┘
           │                      │
           │                      ▼
           │         ┌─────────────────────────────┐
           │         │  example-backend-service    │
           │         │  (NodePort → ClusterIP)     │
           │         └─────────────────────────────┘
           │                      │
           │                      ▼
           │         ┌─────────────────────────────┐
           │         │  Backend Deployment         │
           │         │  (3 replicas)               │
           │         └─────────────────────────────┘
           │                      │
           │         ┌────────────┴────────────┐
           │         │                         │
           │         ▼                         ▼
           │  ┌─────────────┐          ┌─────────────┐
           │  │mysql-service│          │redis-service│
           │  │ (ClusterIP) │          │ (ClusterIP) │
           │  └─────────────┘          └─────────────┘
           │         │                         │
           │         ▼                         ▼
           │  ┌─────────────┐          ┌─────────────┐
           │  │  MySQL Pod  │          │  Redis Pod  │
           │  └─────────────┘          └─────────────┘
           │
           ▼
    ┌─────────────────────────────┐
    │       Cert-Manager          │
    │  (namespace: cert-manager)  │
    │  - controller: 1 replica    │
    │  - webhook: 1 replica       │
    │  - cainjector: 1 replica    │
    │  - nodeSelector: system-pool│
    └─────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────┐
    │     Let's Encrypt ACME      │
    │  (HTTP-01 Challenge qua     │
    │   NGINX Ingress)            │
    └─────────────────────────────┘
```

### English

```
                              Internet
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  DigitalOcean Load Balancer │
                    │  (REGIONAL_NETWORK + Sticky │
                    │   Sessions via Cookies)     │
                    └─────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │  NGINX Ingress Controller   │
                    │  (namespace: ingress-nginx) │
                    │  - 2 replicas               │
                    │  - nodeSelector: ingress-pool│
                    └─────────────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
    ┌─────────────┐      ┌───────────────┐      ┌─────────────┐
    │ ClusterIssuer│      │    Ingress    │      │  Default    │
    │ (cert-manager│      │   Resource    │      │  Backend    │
    │  namespace)  │      │ (ingress.yaml)│      │   (404)     │
    └─────────────┘      └───────────────┘      └─────────────┘
           │                      │
           │                      ▼
           │         ┌─────────────────────────────┐
           │         │  example-backend-service    │
           │         │  (NodePort → ClusterIP)     │
           │         └─────────────────────────────┘
           │                      │
           │                      ▼
           │         ┌─────────────────────────────┐
           │         │  Backend Deployment         │
           │         │  (3 replicas)               │
           │         └─────────────────────────────┘
           │                      │
           │         ┌────────────┴────────────┐
           │         │                         │
           │         ▼                         ▼
           │  ┌─────────────┐          ┌─────────────┐
           │  │mysql-service│          │redis-service│
           │  │ (ClusterIP) │          │ (ClusterIP) │
           │  └─────────────┘          └─────────────┘
           │         │                         │
           │         ▼                         ▼
           │  ┌─────────────┐          ┌─────────────┐
           │  │  MySQL Pod  │          │  Redis Pod  │
           │  └─────────────┘          └─────────────┘
           │
           ▼
    ┌─────────────────────────────┐
    │       Cert-Manager          │
    │  (namespace: cert-manager)  │
    │  - controller: 1 replica    │
    │  - webhook: 1 replica       │
    │  - cainjector: 1 replica    │
    │  - nodeSelector: system-pool│
    └─────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────┐
    │     Let's Encrypt ACME      │
    │  (HTTP-01 Challenge via     │
    │   NGINX Ingress)            │
    └─────────────────────────────┘
```

---

## Luồng xử lý / Request Flow

### Tiếng Việt
1. **Client** gửi request HTTPS đến domain `api.example.com`.
2. **DNS** resolve domain → DigitalOcean Load Balancer External IP.
3. **DO Load Balancer** forward traffic đến NGINX Ingress Controller pods.
4. **NGINX Ingress** match Ingress rule → route đến `example-backend-service`.
5. **Backend Service** load balance request đến 1 trong 3 backend pods.
6. **Backend Pod** xử lý request, kết nối MySQL/Redis qua ClusterIP DNS.
7. **Response** trả về theo đường ngược lại.

### English
1. **Client** sends HTTPS request to domain `api.example.com`.
2. **DNS** resolves domain → DigitalOcean Load Balancer External IP.
3. **DO Load Balancer** forwards traffic to NGINX Ingress Controller pods.
4. **NGINX Ingress** matches Ingress rule → routes to `example-backend-service`.
5. **Backend Service** load balances request to 1 of 3 backend pods.
6. **Backend Pod** processes request, connects to MySQL/Redis via ClusterIP DNS.
7. **Response** returns via the reverse path.

---

## Bước 1 — Chuẩn bị DigitalOcean Kubernetes / Step 1 — Prepare DigitalOcean Kubernetes

### Tiếng Việt
Tạo cluster DOKS với 2 node pools:

### English
Create DOKS cluster with 2 node pools:

| Node Pool | Mục đích / Purpose | Label |
|-----------|-------------------|-------|
| `ingress-pool` | Chạy NGINX Ingress Controller + Default Backend | `doks.digitalocean.com/node-pool: ingress-pool` |
| `system-pool` | Chạy Cert-Manager + workloads khác | `doks.digitalocean.com/node-pool: system-pool` |

```bash
# Kết nối kubectl với cluster DOKS (EN: connect kubectl to DOKS cluster)
doctl kubernetes cluster kubeconfig save <cluster-name>

# Kiểm tra kết nối (EN: verify connection)
kubectl get nodes
```

---

## Bước 2 — Triển khai Cert-Manager / Step 2 — Deploy Cert-Manager

### Tiếng Việt
Cert-Manager cần được cài đặt trước để Ingress có thể sử dụng TLS certificate.

### English
Cert-Manager needs to be installed first so Ingress can use TLS certificates.

**Linux/macOS:**
```bash
cd cert-manager
chmod +x run.sh && ./run.sh
```

**Windows PowerShell:**
```powershell
cd cert-manager
.\run.ps1
```

### Kiểm tra trạng thái / Verify Status
```bash
# Kiểm tra pods (EN: check pods)
kubectl get pods -n cert-manager

# Kiểm tra CRDs đã được cài (EN: verify CRDs installed)
kubectl get crds | grep cert-manager
```

**Output mong đợi (EN: expected output):**
```
NAME                                         READY   STATUS    RESTARTS   AGE
cert-manager-xxxxxxxxxx-xxxxx                1/1     Running   0          1m
cert-manager-cainjector-xxxxxxxxxx-xxxxx     1/1     Running   0          1m
cert-manager-webhook-xxxxxxxxxx-xxxxx        1/1     Running   0          1m
```

---

## Bước 3 — Triển khai NGINX Ingress Controller / Step 3 — Deploy NGINX Ingress Controller

### Tiếng Việt
NGINX Ingress Controller sẽ tự động tạo DigitalOcean Load Balancer.

### English
NGINX Ingress Controller will automatically create a DigitalOcean Load Balancer.

**Linux/macOS:**
```bash
cd nginx-ingress-controller
chmod +x run.sh && ./run.sh
```

**Windows PowerShell:**
```powershell
cd nginx-ingress-controller
.\run.ps1
```

### Kiểm tra trạng thái / Verify Status
```bash
# Kiểm tra pods (EN: check pods)
kubectl get pods -n ingress-nginx

# Kiểm tra Service và External IP (EN: check Service and External IP)
kubectl get svc -n ingress-nginx
```

### Lấy External IP của Load Balancer / Get Load Balancer External IP
```bash
# Đợi đến khi có External IP (EN: wait until External IP is assigned)
kubectl get svc -n ingress-nginx -w

# Hoặc lấy IP trực tiếp (EN: or get IP directly)
kubectl get svc -n ingress-nginx -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}'
```

**Quan trọng (EN: Important):**
- Ghi lại External IP để cấu hình DNS.
- (EN: Note down the External IP to configure DNS.)

---

## Bước 4 — Cấu hình DNS / Step 4 — Configure DNS

### Tiếng Việt
Trỏ domain đến External IP của Load Balancer:

### English
Point your domain to the Load Balancer External IP:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | api | `<EXTERNAL_IP>` | 300 |
| A | @ | `<EXTERNAL_IP>` | 300 |

```bash
# Kiểm tra DNS đã propagate (EN: verify DNS propagation)
nslookup api.example.com
dig api.example.com
```

---

## Bước 5 — Tạo ClusterIssuer / Step 5 — Create ClusterIssuer

### Tiếng Việt
Cập nhật email trong `cluster-issuer.yaml` rồi apply:

### English
Update email in `cluster-issuer.yaml` then apply:

```bash
# Sửa email trong file (EN: edit email in file)
# email: your-email@example.com → email: your-actual-email@domain.com

# Apply ClusterIssuer (EN: apply ClusterIssuer)
kubectl apply -f cluster-issuer.yaml

# Kiểm tra ClusterIssuer (EN: verify ClusterIssuer)
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

**Output mong đợi (EN: expected output):**
```
NAME                  READY   AGE
letsencrypt-prod      True    1m
letsencrypt-staging   True    1m
```

---

## Bước 6 — Triển khai MySQL và Redis / Step 6 — Deploy MySQL and Redis

```bash
# Apply MySQL Pod và Service (EN: apply MySQL Pod and Service)
kubectl apply -f mysql-pod.yaml
kubectl apply -f mysql-service.yaml

# Apply Redis Pod và Service (EN: apply Redis Pod and Service)
kubectl apply -f redis-pod.yaml
kubectl apply -f redis-service.yaml

# Kiểm tra trạng thái (EN: verify status)
kubectl get pods
kubectl get svc
```

---

## Bước 7 — Build và Push Docker Image / Step 7 — Build and Push Docker Image

### Tiếng Việt
Build image backend và push lên Docker Hub:

### English
Build backend image and push to Docker Hub:

```bash
cd example-backend

# Đăng nhập Docker Hub (EN: login to Docker Hub)
docker login

# Build image (EN: build image)
docker compose build

# Push image (EN: push image)
docker push starci183/example-backend:latest
```

---

## Bước 8 — Triển khai Backend / Step 8 — Deploy Backend

```bash
# Apply Deployment và Service (EN: apply Deployment and Service)
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Kiểm tra Deployment (EN: verify Deployment)
kubectl get deployments
kubectl get pods -l app=example-backend
```

**Output mong đợi (EN: expected output):**
```
NAME              READY   UP-TO-DATE   AVAILABLE   AGE
example-backend   3/3     3            3           1m
```

---

## Bước 9 — Cấu hình và Triển khai Ingress / Step 9 — Configure and Deploy Ingress

### Tiếng Việt
Cập nhật domain trong `ingress.yaml`:

### English
Update domain in `ingress.yaml`:

```yaml
# Thay đổi api.example.com thành domain thực tế
# (EN: Change api.example.com to your actual domain)
spec:
  tls:
    - hosts:
        - api.your-domain.com  # ← Thay đổi ở đây (EN: change here)
      secretName: backend-tls-secret
  rules:
    - host: api.your-domain.com  # ← Thay đổi ở đây (EN: change here)
```

```bash
# Apply Ingress (EN: apply Ingress)
kubectl apply -f ingress.yaml

# Kiểm tra Ingress (EN: verify Ingress)
kubectl get ingress
kubectl describe ingress backend-ingress
```

---

## Bước 10 — Kiểm tra Certificate / Step 10 — Verify Certificate

### Tiếng Việt
Cert-Manager sẽ tự động tạo Certificate sau khi Ingress được apply:

### English
Cert-Manager will automatically create Certificate after Ingress is applied:

```bash
# Kiểm tra Certificate (EN: check Certificate)
kubectl get certificates

# Xem chi tiết quá trình cấp certificate (EN: view certificate provisioning details)
kubectl describe certificate backend-tls-secret

# Kiểm tra CertificateRequest (EN: check CertificateRequest)
kubectl get certificaterequest

# Kiểm tra Order (EN: check Order)
kubectl get order

# Kiểm tra Challenge (EN: check Challenge)
kubectl get challenge
```

**Output mong đợi khi thành công (EN: expected output when successful):**
```
NAME                  READY   SECRET               AGE
backend-tls-secret    True    backend-tls-secret   5m
```

**Troubleshooting:**
```bash
# Nếu Certificate không Ready, kiểm tra logs (EN: if Certificate not Ready, check logs)
kubectl logs -n cert-manager -l app.kubernetes.io/name=cert-manager

# Kiểm tra events (EN: check events)
kubectl get events --sort-by='.lastTimestamp'
```

---

## Bước 11 — Test API / Step 11 — Test API

### Tiếng Việt
Sau khi certificate đã được cấp (READY=True):

### English
After certificate has been provisioned (READY=True):

```bash
# Test health endpoint với HTTPS (EN: test health endpoint with HTTPS)
curl https://api.your-domain.com/health

# Tạo item mới (EN: create new item)
curl -X POST https://api.your-domain.com/items \
  -H "Content-Type: application/json" \
  -d '{"name":"kubernetes-on-cloud"}'

# Lấy danh sách items (EN: get items list)
curl https://api.your-domain.com/items
```

**Output mong đợi (EN: expected output):**
```json
{"status":"ok","mysql":"connected","redis":"connected"}
```

---

## DigitalOcean Load Balancer Annotations

### Tiếng Việt
Các annotations được cấu hình trong `nginx-ingress-controller/values.yaml`:

### English
Annotations configured in `nginx-ingress-controller/values.yaml`:

| Annotation | Giá trị / Value | Mô tả / Description |
|------------|-----------------|---------------------|
| `do-loadbalancer-size-unit` | `"1"` | Kích thước LB nhỏ nhất (EN: smallest LB size) |
| `do-loadbalancer-type` | `"REGIONAL_NETWORK"` | Network LB hiệu năng cao (EN: high-performance network LB) |
| `do-loadbalancer-sticky-sessions-type` | `"cookies"` | Sticky session dùng cookies |
| `do-loadbalancer-sticky-sessions-cookie-name` | `"cookie"` | Tên cookie |
| `do-loadbalancer-sticky-sessions-cookie-ttl` | `"300"` | Cookie TTL 5 phút (EN: 5 minutes TTL) |

---

## Node Selector Configuration

### Tiếng Việt
Các component được schedule lên node pool cụ thể:

### English
Components are scheduled to specific node pools:

| Component | Node Pool | Lý do / Reason |
|-----------|-----------|----------------|
| NGINX Ingress Controller | `ingress-pool` | Tách riêng traffic xử lý (EN: isolate traffic handling) |
| Default Backend | `ingress-pool` | Cùng pool với Ingress (EN: same pool as Ingress) |
| Cert-Manager (all) | `system-pool` | System workloads (EN: system workloads) |

**Lưu ý (EN: Note):** Thay đổi `nodeSelector` trong `values.yaml` nếu node pool có tên khác.

---

## Biến môi trường Backend / Backend Environment Variables

| Biến / Variable | Giá trị / Value | Mô tả / Description |
|-----------------|-----------------|---------------------|
| `MYSQL_HOST` | `mysql-service.default.svc.cluster.local` | MySQL Service DNS |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | `root123` | MySQL password |
| `MYSQL_DATABASE` | `demo_db` | Database name |
| `REDIS_HOST` | `redis-service.default.svc.cluster.local` | Redis Service DNS |
| `REDIS_PORT` | `6379` | Redis port |

---

## Helm Charts sử dụng / Helm Charts Used

| Component | Chart OCI URL | Image Registry |
|-----------|---------------|----------------|
| NGINX Ingress Controller | `oci://registry-1.docker.io/bitnamicharts/nginx-ingress-controller` | `bitnamilegacy/*` |
| Cert-Manager | `oci://registry-1.docker.io/bitnamicharts/cert-manager` | `bitnamilegacy/*` |

---

## Dọn dẹp tài nguyên / Cleanup

### Tiếng Việt
Sau khi demo xong, xóa toàn bộ tài nguyên theo thứ tự:

### English
After the demo, delete all resources in order:

```bash
# 1. Xóa Ingress (EN: delete Ingress)
kubectl delete -f ingress.yaml

# 2. Xóa ClusterIssuer (EN: delete ClusterIssuer)
kubectl delete -f cluster-issuer.yaml

# 3. Xóa Backend (EN: delete Backend)
kubectl delete -f backend-service.yaml
kubectl delete -f backend-deployment.yaml

# 4. Xóa MySQL và Redis (EN: delete MySQL and Redis)
kubectl delete -f redis-service.yaml
kubectl delete -f redis-pod.yaml
kubectl delete -f mysql-service.yaml
kubectl delete -f mysql-pod.yaml

# 5. Xóa NGINX Ingress Controller (EN: delete NGINX Ingress Controller)
# Lưu ý: Sẽ xóa cả DigitalOcean Load Balancer
# (EN: Note: Will also delete DigitalOcean Load Balancer)
helm uninstall nginx-ingress -n ingress-nginx
kubectl delete namespace ingress-nginx

# 6. Xóa Cert-Manager (EN: delete Cert-Manager)
helm uninstall cert-manager -n cert-manager
kubectl delete namespace cert-manager

# 7. Xóa CRDs của Cert-Manager (EN: delete Cert-Manager CRDs)
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.crds.yaml
```

---

## Troubleshooting

### Certificate không được cấp / Certificate not provisioned

```bash
# Kiểm tra Challenge (EN: check Challenge)
kubectl get challenge
kubectl describe challenge <challenge-name>

# Kiểm tra Order (EN: check Order)
kubectl get order
kubectl describe order <order-name>

# Kiểm tra Cert-Manager logs (EN: check Cert-Manager logs)
kubectl logs -n cert-manager -l app.kubernetes.io/name=cert-manager -f
```

**Nguyên nhân phổ biến (EN: common causes):**
- DNS chưa trỏ đến Load Balancer IP.
- Firewall chặn port 80 (HTTP-01 challenge).
- Rate limit từ Let's Encrypt (dùng staging issuer để test).

### Ingress không route traffic / Ingress not routing traffic

```bash
# Kiểm tra Ingress Controller logs (EN: check Ingress Controller logs)
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=nginx-ingress-controller -f

# Kiểm tra Ingress config đã load (EN: verify Ingress config loaded)
kubectl exec -n ingress-nginx -it <ingress-pod> -- cat /etc/nginx/nginx.conf | grep server_name
```

### Backend không kết nối được MySQL/Redis / Backend cannot connect to MySQL/Redis

```bash
# Kiểm tra Service endpoints (EN: check Service endpoints)
kubectl get endpoints mysql-service
kubectl get endpoints redis-service

# Test kết nối từ backend pod (EN: test connection from backend pod)
kubectl exec -it <backend-pod> -- nc -zv mysql-service 3306
kubectl exec -it <backend-pod> -- nc -zv redis-service 6379
```

---

## Tài liệu tham khảo / References

- [DigitalOcean Kubernetes Documentation](https://docs.digitalocean.com/products/kubernetes/)
- [Bitnami NGINX Ingress Controller Chart](https://github.com/bitnami/charts/tree/main/bitnami/nginx-ingress-controller)
- [Bitnami Cert-Manager Chart](https://github.com/bitnami/charts/tree/main/bitnami/cert-manager)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)
