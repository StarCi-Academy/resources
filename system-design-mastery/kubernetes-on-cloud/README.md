# Kubernetes on Cloud (DigitalOcean)

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai ứng dụng NestJS lên DigitalOcean Kubernetes (DOKS).
- Sử dụng **NGINX Ingress Controller** (Bitnami) để route traffic HTTP/HTTPS.
- Sử dụng **Cert-Manager** (Bitnami) để tự động cấp và renew SSL/TLS certificate từ Let's Encrypt.
- Cấu hình DigitalOcean Load Balancer với sticky sessions.
- Tất cả images sử dụng `bitnamilegacy/*` để đảm bảo tương thích.

### English
- Deploy a NestJS application to DigitalOcean Kubernetes (DOKS).
- Use **NGINX Ingress Controller** (Bitnami) to route HTTP/HTTPS traffic.
- Use **Cert-Manager** (Bitnami) to automatically provision and renew SSL/TLS certificates from Let's Encrypt.
- Configure DigitalOcean Load Balancer with sticky sessions.
- All images use `bitnamilegacy/*` for compatibility.

---

## Cấu trúc thư mục / Directory Structure

```
kubernetes-on-cloud/
├── cert-manager/                        # Cấu hình Cert-Manager (EN: Cert-Manager config)
│   ├── values.origin.yaml               # File gốc từ Bitnami (EN: original file from Bitnami)
│   ├── values.yaml                      # Custom values với bitnamilegacy images
│   ├── run.sh                           # Script triển khai (Linux/macOS)
│   └── run.ps1                          # Script triển khai (Windows PowerShell)
├── nginx-ingress-controller/            # Cấu hình NGINX Ingress (EN: NGINX Ingress config)
│   ├── values.origin.yaml               # File gốc từ Bitnami (EN: original file from Bitnami)
│   ├── values.yaml                      # Custom values cho DigitalOcean
│   ├── run.sh                           # Script triển khai (Linux/macOS)
│   └── run.ps1                          # Script triển khai (Windows PowerShell)
├── example-backend/                     # NestJS backend app
│   ├── src/                             # Mã nguồn (EN: source code)
│   ├── Dockerfile                       # Multi-stage Docker build
│   └── docker-compose.yaml              # Build local
├── mysql-pod.yaml                       # MySQL Pod
├── mysql-service.yaml                   # MySQL ClusterIP Service
├── redis-pod.yaml                       # Redis Pod
├── redis-service.yaml                   # Redis ClusterIP Service
├── backend-deployment.yaml              # Backend Deployment (3 replicas)
├── backend-service.yaml                 # Backend NodePort Service
├── ingress.yaml                         # Ingress resource (route traffic)
└── README.md
```

---

## Kiến trúc hệ thống / System Architecture

### Tiếng Việt

```
Internet
    │
    ▼
DigitalOcean Load Balancer
(service.beta.kubernetes.io annotations)
    │
    ▼
NGINX Ingress Controller (namespace: ingress-nginx)
    │
    ├──► Ingress Resource (ingress.yaml)
    │        │
    │        ├── /api/* ──► backend-service:3000 ──► Backend Pods (3 replicas)
    │        │                                          │
    │        │                                          ├── mysql-service:3306 ──► MySQL Pod
    │        │                                          └── redis-service:6379 ──► Redis Pod
    │        │
    │        └── /* (default) ──► 404 (defaultBackend)
    │
    └──► Cert-Manager (namespace: cert-manager)
             │
             └── Tự động cấp SSL certificate từ Let's Encrypt
```

### English

```
Internet
    │
    ▼
DigitalOcean Load Balancer
(service.beta.kubernetes.io annotations)
    │
    ▼
NGINX Ingress Controller (namespace: ingress-nginx)
    │
    ├──► Ingress Resource (ingress.yaml)
    │        │
    │        ├── /api/* ──► backend-service:3000 ──► Backend Pods (3 replicas)
    │        │                                          │
    │        │                                          ├── mysql-service:3306 ──► MySQL Pod
    │        │                                          └── redis-service:6379 ──► Redis Pod
    │        │
    │        └── /* (default) ──► 404 (defaultBackend)
    │
    └──► Cert-Manager (namespace: cert-manager)
             │
             └── Automatically provisions SSL certificate from Let's Encrypt
```

---

## Bước 1 — Triển khai Cert-Manager / Step 1 — Deploy Cert-Manager

### Tiếng Việt
Cert-Manager cần được cài trước để Ingress có thể sử dụng TLS certificate.

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
kubectl get pods -n cert-manager
kubectl get crds | grep cert-manager
```

---

## Bước 2 — Triển khai NGINX Ingress Controller / Step 2 — Deploy NGINX Ingress Controller

### Tiếng Việt
NGINX Ingress Controller sẽ tạo DigitalOcean Load Balancer tự động.

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
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx
```

### Lấy External IP của Load Balancer / Get Load Balancer External IP
```bash
kubectl get svc -n ingress-nginx -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}'
```

---

## Bước 3 — Triển khai MySQL và Redis / Step 3 — Deploy MySQL and Redis

```bash
kubectl apply -f mysql-pod.yaml
kubectl apply -f mysql-service.yaml
kubectl apply -f redis-pod.yaml
kubectl apply -f redis-service.yaml
```

---

## Bước 4 — Triển khai Backend / Step 4 — Deploy Backend

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
```

---

## Bước 5 — Tạo ClusterIssuer cho Let's Encrypt / Step 5 — Create ClusterIssuer for Let's Encrypt

### Tiếng Việt
Tạo `ClusterIssuer` để Cert-Manager biết cách lấy certificate từ Let's Encrypt:

### English
Create a `ClusterIssuer` so Cert-Manager knows how to obtain certificates from Let's Encrypt:

```yaml
# letsencrypt-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # Email nhận thông báo hết hạn certificate
    # (EN: Email to receive certificate expiration notifications)
    email: your-email@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
      - http01:
          ingress:
            class: nginx
```

```bash
kubectl apply -f letsencrypt-issuer.yaml
```

---

## Bước 6 — Tạo Ingress Resource / Step 6 — Create Ingress Resource

### Tiếng Việt
Cập nhật `ingress.yaml` với domain thực tế của bạn:

### English
Update `ingress.yaml` with your actual domain:

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-ingress
  annotations:
    # Sử dụng NGINX Ingress class (EN: use NGINX Ingress class)
    kubernetes.io/ingress.class: nginx
    # Kích hoạt Cert-Manager tự động cấp certificate
    # (EN: enable Cert-Manager to automatically provision certificate)
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.your-domain.com
      secretName: backend-tls-secret
  rules:
    - host: api.your-domain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: example-backend-service
                port:
                  number: 3000
```

```bash
kubectl apply -f ingress.yaml
```

---

## Bước 7 — Kiểm tra Certificate / Step 7 — Verify Certificate

```bash
# Kiểm tra Certificate resource (EN: check Certificate resource)
kubectl get certificates

# Kiểm tra chi tiết (EN: check details)
kubectl describe certificate backend-tls-secret

# Kiểm tra secret chứa certificate (EN: check secret containing certificate)
kubectl get secret backend-tls-secret
```

---

## Test API

### Tiếng Việt
Sau khi DNS đã trỏ đến Load Balancer IP và certificate đã được cấp:

### English
After DNS points to Load Balancer IP and certificate has been provisioned:

```bash
# Test với HTTPS (EN: test with HTTPS)
curl https://api.your-domain.com/health

# Tạo item mới (EN: create new item)
curl -X POST https://api.your-domain.com/items \
  -H "Content-Type: application/json" \
  -d '{"name":"kubernetes-on-cloud"}'

# Lấy danh sách items (EN: get items list)
curl https://api.your-domain.com/items
```

---

## DigitalOcean Load Balancer Annotations

### Tiếng Việt
Các annotations quan trọng cho Load Balancer:

### English
Important annotations for Load Balancer:

| Annotation | Mô tả / Description |
|------------|---------------------|
| `service.beta.kubernetes.io/do-loadbalancer-size-unit` | Kích thước LB (1 = nhỏ nhất) / LB size (1 = smallest) |
| `service.beta.kubernetes.io/do-loadbalancer-type` | Loại LB (REGIONAL_NETWORK = hiệu năng cao) / LB type |
| `service.beta.kubernetes.io/do-loadbalancer-sticky-sessions-type` | Sticky session: `cookies` hoặc `none` |
| `service.beta.kubernetes.io/do-loadbalancer-sticky-sessions-cookie-name` | Tên cookie cho sticky session |
| `service.beta.kubernetes.io/do-loadbalancer-sticky-sessions-cookie-ttl` | TTL của cookie (giây) / Cookie TTL (seconds) |

---

## Dọn dẹp tài nguyên / Cleanup

### Tiếng Việt
Sau khi demo xong, xóa toàn bộ tài nguyên:

### English
After the demo, delete all resources:

```bash
# Xóa Ingress (EN: delete Ingress)
kubectl delete -f ingress.yaml

# Xóa backend (EN: delete backend)
kubectl delete -f backend-service.yaml
kubectl delete -f backend-deployment.yaml

# Xóa MySQL và Redis (EN: delete MySQL and Redis)
kubectl delete -f redis-service.yaml
kubectl delete -f redis-pod.yaml
kubectl delete -f mysql-service.yaml
kubectl delete -f mysql-pod.yaml

# Xóa NGINX Ingress Controller (EN: delete NGINX Ingress Controller)
helm uninstall nginx-ingress -n ingress-nginx
kubectl delete namespace ingress-nginx

# Xóa Cert-Manager (EN: delete Cert-Manager)
helm uninstall cert-manager -n cert-manager
kubectl delete namespace cert-manager
```

---

## Helm Charts sử dụng / Helm Charts Used

| Component | Chart | Registry |
|-----------|-------|----------|
| NGINX Ingress Controller | `oci://registry-1.docker.io/bitnamicharts/nginx-ingress-controller` | bitnamilegacy |
| Cert-Manager | `oci://registry-1.docker.io/bitnamicharts/cert-manager` | bitnamilegacy |

---

## Node Pool Configuration

### Tiếng Việt
Cấu hình sử dụng `nodeSelector` để deploy pods lên node pool cụ thể:

### English
Configuration uses `nodeSelector` to deploy pods to specific node pools:

| Component | Node Pool Label |
|-----------|-----------------|
| NGINX Ingress Controller | `doks.digitalocean.com/node-pool: ingress-pool` |
| Default Backend | `doks.digitalocean.com/node-pool: ingress-pool` |
| Cert-Manager (all components) | `doks.digitalocean.com/node-pool: system-pool` |

**Lưu ý / Note:** Thay đổi giá trị `nodeSelector` trong `values.yaml` nếu node pool của bạn có tên khác.
(EN: Change `nodeSelector` values in `values.yaml` if your node pools have different names.)
