# Health Checks & Graceful Degradation

Demo **Liveness/Readiness Probe** qua `@nestjs/terminus` + **Graceful Degradation** (fail fancy features, keep core alive).
(EN: Demo Liveness/Readiness probes via @nestjs/terminus + Graceful Degradation.)

> Gắn với bài **Module 5.4 — Health Checks & Graceful Degradation**.

---

## Liveness vs Readiness — nhầm là chết

| | Liveness | Readiness |
|---|---|---|
| Câu hỏi | "App còn thở không?" | "App sẵn sàng nhận traffic chưa?" |
| FAIL → K8s làm gì | **KILL** container, restart | Rút pod khỏi Service, chờ OK lại |
| Check gì | chỉ process alive | + dependency (DB, Redis, queue) |
| Khi nào fail | deadlock, OOM | dependency chết, warm-up chưa xong |

**Trap**: nhiều team check DB trong liveness → khi DB blip 2s, toàn bộ pod bị restart đồng loạt → downtime dài hơn.

---

## Install & run

```bash
npm install
docker compose -f .docker/redis.yaml up -d
npx nest start --watch
```

---

## Test health

```bash
# Liveness — luôn 200 nếu process chạy
curl http://localhost:3000/health/live
# { "status": "ok", "info": {}, ... }

# Readiness — 200 nếu Redis OK
curl http://localhost:3000/health/ready
# { "status": "ok", "info": { "redis": { "status": "up" } } }

# Tắt Redis để thấy readiness fail
docker stop health-check-redis
curl -w "\n%{http_code}\n" http://localhost:3000/health/ready
# 503 — { "status": "error", "info": { "redis": { "status": "down" } } }

# App vẫn sống (liveness vẫn 200) → K8s không restart, chỉ ngừng gửi traffic
curl http://localhost:3000/health/live  # 200
```

---

## Test Graceful Degradation

```bash
# Happy path — recommender chạy
curl http://localhost:3000/recommendations/42
# { "items": ["Personalized for user 42: A", ...], "source": "recommender-service" }

# Giả lập recommender chết
curl -X PUT http://localhost:3000/dev/recommender-dead \
  -H 'Content-Type: application/json' -d '{"dead": true}'

# Recommendation tự fallback sang static evergreen list — UI vẫn có nội dung
curl http://localhost:3000/recommendations/42
# { "items": ["Evergreen Top 1", ...], "source": "static-fallback" }

# Core flow (checkout) vẫn chạy bình thường — tuyệt đối không fallback
curl -X POST http://localhost:3000/checkout \
  -H 'Content-Type: application/json' -d '{"orderId":123}'
```

---

## Feature Triage

| Tier | Ví dụ | Khi gặp sự cố |
|---|---|---|
| **Tier 1 — Core** | Login, Checkout, Payment | Không bao giờ fallback. Fail loudly. |
| **Tier 2 — Important** | Product list, Inventory | Serve stale cache, chấp nhận eventual consistency |
| **Tier 3 — Nice-to-have** | Recommendations, Ratings | Cắt thẳng, serve static/hardcode |

---

## K8s probe config mẫu

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30   # chờ app startup
  periodSeconds: 10
  failureThreshold: 3       # fail 3 lần liên tiếp → restart

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 2
```

---

## References
- [@nestjs/terminus](https://docs.nestjs.com/recipes/terminus)
- [Kubernetes — Configure Liveness/Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
