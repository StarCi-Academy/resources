# Horizontal Scaling & Load Balancing — DigitalOcean LB + Nginx Ingress

> Demo *nâng cao* cho Module 4.1 — kiến trúc **HA production-grade** trên DOKS
> với **L7 path-based routing** tới 3 backend NestJS khác nhau trong cùng
> một monorepo (users / orders / products), mỗi cái chạy trên một cổng riêng.
>
> ```
> Internet → DigitalOcean Load Balancer (L4, REGIONAL_NETWORK)
>         → Nginx Ingress Controller (L7, 2+ replica)
>           ├── /api/users    → users-service:3001    → 3 pod users-app
>           ├── /api/orders   → orders-service:3002   → 3 pod orders-app
>           └── /api/products → products-service:3003 → 3 pod products-app
> ```
>
> Demo trực quan 4 tính chất cốt lõi:
> 1. **L7 path routing** — MỘT public IP phục vụ 3 backend, chọn theo URL path.
> 2. **Round-robin** trong từng service phân tải đều qua các pod.
> 3. **Scale out/in** một service không ảnh hưởng service khác.
> 4. **Fail-over** — pod chết, Ingress tự bỏ qua trong vài giây.
>
> (EN: Advanced Module 4.1 demo — HA architecture on DOKS with L7 path-based
> routing to 3 NestJS backends in a monorepo (users/orders/products), each on
> its own port.)

---

## Mục tiêu / Objective

### Tiếng Việt
- Triển khai **monorepo 3 NestJS backend** (users/orders/products), mỗi app 3 replica, chạy trên cổng riêng (3001/3002/3003), trả dataset khác nhau.
- Đặt **Nginx Ingress Controller** (Bitnami chart) lên cluster làm tầng L7, route theo URL path tới 3 service.
- Để DOKS tự provision một **DigitalOcean Load Balancer** (L4) làm tầng entry duy nhất có public IP.
- Demo L7 routing, round-robin, scale riêng từng service, fail-over qua script `demo.sh` / `demo.ps1`.
- Phân tích **các loại DO Load Balancer**, **giá**, và **trường hợp dùng**.

### English
- Deploy a **monorepo of 3 NestJS backends** (users/orders/products), each with 3 replicas on its own port (3001/3002/3003), returning different datasets.
- Install **Nginx Ingress Controller** (Bitnami chart) for L7 path-based routing to the 3 services.
- Let DOKS provision a **DigitalOcean Load Balancer** (L4) as the single public-IP entry.
- Demonstrate L7 routing, round-robin, per-service scaling, fail-over via `demo.sh` / `demo.ps1`.
- Discuss **DO Load Balancer types**, **pricing**, and **use cases**.

---

## Cấu trúc thư mục / Directory Structure

```
horizontal-scaling-load-balancing/
├── example-backend/                      # Monorepo NestJS — 3 app
│   ├── apps/
│   │   ├── users-app/                    # Cổng 3001 — dataset users
│   │   │   ├── src/{main,app.module}.ts
│   │   │   ├── tsconfig.app.json
│   │   │   └── Dockerfile
│   │   ├── orders-app/                   # Cổng 3002 — dataset orders
│   │   │   ├── src/{main,app.module}.ts
│   │   │   ├── tsconfig.app.json
│   │   │   └── Dockerfile
│   │   └── products-app/                 # Cổng 3003 — dataset products
│   │       ├── src/{main,app.module}.ts
│   │       ├── tsconfig.app.json
│   │       └── Dockerfile
│   ├── libs/
│   │   └── base.controller.ts            # Factory controller dùng chung
│   ├── docker-compose.yaml               # Build + chạy cả 3 app local
│   ├── package.json / tsconfig / nest-cli.json  (monorepo)
├── nginx-ingress-controller/             # Helm values + script deploy DO
│   ├── values.yaml                       # DOKS: replica=2, REGIONAL_NETWORK...
│   ├── run.sh / run.ps1
├── users-app-deployment.yaml             # Deployment + Service cho users-app
├── orders-app-deployment.yaml            # Deployment + Service cho orders-app
├── products-app-deployment.yaml          # Deployment + Service cho products-app
├── backend-ingress.yaml                  # Ingress L7 path-based (3 rule)
├── demo.sh / demo.ps1                    # apply / data / rr / scale / failover
└── README.md
```

---

## Luồng hệ thống / System Flow

```
                 Internet
                    │
                    ▼
  ┌──────────────────────────────────────┐
  │  DigitalOcean Load Balancer (L4)     │  ← PUBLIC IP duy nhất, TCP/TLS passthrough
  │  type: REGIONAL_NETWORK              │    do DOKS tự tạo từ Service type=LoadBalancer
  └──────────────────────────────────────┘
                    │
                    ▼
  ┌──────────────────────────────────────┐
  │  Nginx Ingress Controller (L7, 2 pod)│  ← Đọc HTTP host/path, route theo Ingress rule
  └──────────────────────────────────────┘
        │                │                │
        ▼                ▼                ▼
  /api/users        /api/orders      /api/products
     (:3001)          (:3002)           (:3003)
        │                │                │
        ▼                ▼                ▼
  users-service   orders-service   products-service   ← ClusterIP + kube-proxy round-robin
        │                │                │
   ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
   ▼    ▼    ▼      ▼    ▼    ▼      ▼    ▼    ▼
  u-1  u-2  u-3    o-1  o-2  o-3    p-1  p-2  p-3    ← NestJS stateless, Ready mới nhận traffic
```

---

## I. Lý thuyết cô đọng / Theory in a Nutshell

### 1. Horizontal Scaling vs Vertical Scaling
- **Vertical (scale-up)**: nâng CPU/RAM của 1 node. Dễ, nhưng có trần và SPOF.
- **Horizontal (scale-out)**: thêm node. Cần app **stateless** + **load balancer** ở trước. Đây là con đường cloud-native.

### 2. Tại sao app phải Stateless
Nếu pod A giữ session trong RAM, LB route request tiếp theo sang pod B ⇒ 401. Giải pháp: đẩy state ra Redis/JWT/DB. (Xem `scalibity-fundamental/` để nhìn tận mắt sự khác biệt).

### 3. Layer 4 vs Layer 7
| | Layer 4 (TCP/UDP) | Layer 7 (HTTP) |
|---|---|---|
| Biết gì? | IP + port | URL path, header, cookie |
| Tốc độ | Rất nhanh, ít CPU | Chậm hơn, tốn CPU |
| Route theo path/host | ❌ | ✅ |
| TLS termination | passthrough hoặc terminate | thường terminate tại LB |
| Ví dụ DO | `REGIONAL_NETWORK` (DO NLB) | `REGIONAL` (DO classic LB) hoặc Nginx Ingress trên nó |

Kiến trúc phổ biến (cũng là demo này): **L4 ở biên (DO LB) + L7 ở trong (Ingress Controller)**. L4 cho throughput, L7 cho linh hoạt routing.

### 4. Thuật toán cân bằng tải
- `round_robin` — mặc định; tuần tự A→B→C→A. Đơn giản, công bằng khi request đồng đều.
- `least_conn` — chọn pod đang ít kết nối nhất; tốt cho WebSocket / request nặng.
- `ip_hash` — hash IP client → cùng client về cùng pod; sticky nhẹ, nhưng hỏng cân bằng.
- Trong Nginx Ingress đổi bằng annotation `nginx.ingress.kubernetes.io/load-balance`.

### 5. Vai trò của `readinessProbe`
**Đây là chìa khoá fail-over**. Pod chỉ vào pool khi `readinessProbe` pass; K8s tự rút pod ra khi probe fail. Không có readiness → user ăn 5xx khi rolling update / pod crash.

---

## II. Các loại DigitalOcean Load Balancer / DO Load Balancer Types

Trên DOKS bạn provision LB bằng annotation trong Service của Ingress Controller
(`service.beta.kubernetes.io/do-loadbalancer-*`). Có **2 nhóm chính**:

### A. REGIONAL (Classic LB)
- **Layer**: L4 + L7 (TCP/HTTP/HTTPS).
- **Tính năng**: TLS termination, HTTP health check, sticky session cookie.
- **Throughput**: Có thể tăng bằng *size unit* (1–100). 1 unit ≈ 10.000 concurrent connection.
- **Khi dùng**: web app chuẩn, traffic vừa phải, cần HTTP routing ngay tại LB.

### B. REGIONAL_NETWORK (Network LB — NLB)
- **Layer**: L4 thuần (TCP/UDP).
- **Tính năng**: Bandwidth rất cao (>>Classic), giữ IP client qua PROXY protocol, ít feature L7.
- **Throughput**: cũng dùng *size unit*, nhưng trần cao hơn nhiều.
- **Khi dùng**: API gateway / Nginx Ingress phía sau nó (giao L7 cho Nginx), game/voice (UDP), workload băng thông cao.
- **Demo này dùng REGIONAL_NETWORK** vì Nginx Ingress đã lo L7.

### C. GLOBAL (còn gọi Global LB, phát hành sau)
- **Layer**: L7 anycast trên nhiều region.
- **Khi dùng**: multi-region active-active, fail-over cross-region. Ngoài phạm vi demo này.

### Bảng giá DigitalOcean (tham khảo — kiểm tra lại trang giá mới nhất trước khi quote khách)
> Giá niêm yết tháng, phí phát sinh riêng theo băng thông vượt quota.
> (EN: Monthly listed price; bandwidth overage billed separately.)

| Loại / Type | Size unit | Giá ~ / tháng | Phù hợp / Use case |
|---|---|---|---|
| REGIONAL (Classic) | 1 unit | **~$12** | Side project, staging, API nhỏ < 10k conn |
| REGIONAL (Classic) | 3 units | ~$36 | Prod SMB, API vừa |
| REGIONAL (Classic) | 10 units | ~$120 | Prod lớn, ecommerce |
| REGIONAL_NETWORK (NLB) | 1 unit | **~$15** | Ingress Controller front, API gateway |
| REGIONAL_NETWORK (NLB) | 5 units | ~$75 | High-throughput API, real-time |
| GLOBAL | theo request/GB | **pay-as-you-go** | Multi-region fail-over, CDN-like routing |

> Lưu ý: DOKS cluster + node pool tính **phí riêng**. LB trên chỉ là phí tầng edge.
> (EN: Cluster nodes are billed separately; the table above is edge-LB only.)

---

## III. Đảm bảo tính sẵn sàng cao (HA) / High Availability

Demo này có **3 tầng HA**, mỗi tầng bù cho lỗi của tầng dưới:

| Tầng | Kỹ thuật HA | Lỗi nó chịu được |
|---|---|---|
| DO Load Balancer | DO tự multi-AZ, tự fail-over | Lỗi phần cứng LB, 1 AZ DO chết |
| Nginx Ingress Controller | `replicaCount: 2` + `topologySpreadConstraints` | 1 node K8s chết → còn controller pod ở node khác |
| Backend pod | `replicas: 3` + `readinessProbe` + `RollingUpdate maxUnavailable: 0` | 1 pod crash, rolling update, node drain |

**Checklist khi đi prod:**
- [ ] `replicas >= 2` cho cả Ingress Controller lẫn app.
- [ ] `PodDisruptionBudget` để `kubectl drain` không kill cùng lúc quá nhiều pod.
- [ ] Node pool của Ingress Controller chạy trên **≥ 2 node khác AZ** (DOKS regional).
- [ ] App **stateless**; state đẩy ra Managed DB / Redis / Spaces.
- [ ] `readinessProbe` có endpoint *rẻ* như `/healthz` (không đụng DB).
- [ ] Cấu hình **HPA** (Horizontal Pod Autoscaler) để tự scale theo CPU/RPS.

---

## Bước 1 — Build và push 3 image / Step 1 — Build and Push 3 Images

Mỗi app có `Dockerfile` isolate trong thư mục của nó (build context = monorepo root).

```bash
cd example-backend
docker compose -f docker-compose.yaml build    # build cả 3 cùng lúc
docker push starci183/hsl-users-app:latest
docker push starci183/hsl-orders-app:latest
docker push starci183/hsl-products-app:latest
```

Chạy thử local 3 app ở 3 cổng 3001/3002/3003:

```bash
docker compose -f docker-compose.yaml up --build -d
curl http://localhost:3001/api/users       # dataset users
curl http://localhost:3002/api/orders      # dataset orders
curl http://localhost:3003/api/products    # dataset products
```

Hoặc bỏ qua build, Deployment tự pull 3 image có sẵn trên registry.

## Bước 2 — Cài Nginx Ingress Controller + DO LB / Step 2 — Install Ingress + DO LB

```bash
cd nginx-ingress-controller
bash run.sh            # hoặc: pwsh run.ps1
# Xong → kubectl get svc -n ingress-nginx
# EXTERNAL-IP của service nginx-ingress-* chính là IP của DO Load Balancer.
```

Ghi lại IP đó — ta gọi nó là `LB_IP`.

## Bước 3 — Deploy 3 app + Ingress / Step 3 — Deploy 3 Apps + Ingress

```bash
kubectl apply -f users-app-deployment.yaml
kubectl apply -f orders-app-deployment.yaml
kubectl apply -f products-app-deployment.yaml
kubectl apply -f backend-ingress.yaml

kubectl rollout status deploy/users-app
kubectl rollout status deploy/orders-app
kubectl rollout status deploy/products-app
```

Trỏ DNS `hsl.example.com` → `LB_IP`, hoặc test trực tiếp bằng Host header
(script demo đã xử lý sẵn).

## Bước 4 — Chạy demo / Step 4 — Run the Demo

```bash
# Linux / macOS / WSL
LB_IP=<do-lb-ip> bash demo.sh apply
LB_IP=<do-lb-ip> bash demo.sh data       # gọi 3 path → 3 dataset khác nhau
LB_IP=<do-lb-ip> bash demo.sh rr         # round-robin trong từng service
LB_IP=<do-lb-ip> bash demo.sh scale      # scale users-app 3 → 6 → 1
LB_IP=<do-lb-ip> bash demo.sh failover   # kill 1 pod orders-app
LB_IP=<do-lb-ip> bash demo.sh all

# Windows PowerShell
$env:LB_IP='<do-lb-ip>'
.\demo.ps1 all
```

### Output mong đợi / Expected output

- `data`: 3 JSON trả về khác hẳn nhau — users (4 record), orders (5 record), products (6 record). Chứng minh Ingress L7 chọn đúng service theo URL path.
- `rr`: với mỗi service, 6 pod in ra phân bổ đều qua 3 pod; service khác có prefix pod name khác.
- `scale`: chỉ `users-app` nhảy từ 3 → 6 → 1; `orders-app`/`products-app` giữ nguyên — cô lập scale giữa các service.
- `failover`: sau khi `kubectl delete pod` 1 pod `orders-app`, không có `(lỗi)` kéo dài — Ingress rút pod chết khỏi pool chỉ trong vài giây nhờ readinessProbe.

---

## Dọn dẹp / Cleanup

```bash
bash demo.sh clean
helm uninstall nginx-ingress -n ingress-nginx   # xoá DO LB tự động
```

---

## IV. Gotchas & Best Practices

1. **Đừng bật sticky session trừ khi thực sự cần.** Nó giết phân tải đều và che vấn đề stateful.
2. **`type: LoadBalancer` mà thay đổi annotation có thể recreate LB** → đổi IP → DNS cần cập nhật. Dùng `service.beta.kubernetes.io/do-loadbalancer-name` để pin tên.
3. **Health check của DO LB ≠ `readinessProbe` của pod.** DO chỉ check Ingress Controller; readiness mới kiểm tra pod app. Cần cả hai.
4. **Pin Ingress Controller vào node pool riêng** (`ingress-pool`) để traffic LB không tranh CPU với app pod.
5. **`PROXY protocol`**: đã bật qua annotation. Nếu Ingress Controller chưa enable PROXY sẽ parse header sai → cần bật `use-proxy-protocol: "true"` trong Nginx config (bitnami chart đã mặc định xử lý khi set annotation này — kiểm tra bản chart của bạn).
6. **Chi phí**: DO LB là **fixed monthly**; nhỏ thì vẫn mất ~$12–15/tháng cho 1 LB. Ở scale micro, dùng `NodePort` + DNS round-robin / Cloudflare có thể rẻ hơn nhưng kém HA.

---

## References

- [Nginx — HTTP Load Balancing](http://nginx.org/en/docs/http/load_balancing.html)
- [DigitalOcean — Kubernetes Load Balancer annotations](https://docs.digitalocean.com/products/kubernetes/how-to/configure-load-balancers/)
- [DigitalOcean — Load Balancer pricing](https://www.digitalocean.com/pricing/load-balancers)
- [The Twelve-Factor App — Processes](https://12factor.net/processes)
