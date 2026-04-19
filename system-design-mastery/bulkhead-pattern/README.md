# Bulkhead Pattern — Compartmentalize to Survive

Demo **Bulkhead** — chia pool tài nguyên thành các khoang kín, lỗi 1 feature không ăn thread của core flow.
(EN: Demo Bulkhead — split resource pool into watertight compartments, a failing feature doesn't starve others.)

> Gắn với bài **Module 5.3 — Bulkhead Pattern**.

---

## Ý tưởng

```
Trước khi có bulkhead:
──────────────────────────────────
       Shared pool: 500 threads
──────────────────────────────────
  profile hang 10s
  └── ăn hết 500 thread
       └── checkout không còn slot → 503

Sau khi có bulkhead:
┌──────────┬──────────┬──────────┐
│ Checkout │ Profile  │Reporting │
│ 8 slots  │ 2 slots  │ 1 slot   │
└──────────┴──────────┴──────────┘
  profile hang → ăn max 2 slot
  checkout vẫn còn 8 slot → OK
```

---

## Install & run

```bash
npm install
npx nest start --watch
```

---

## Test — chứng minh cô lập

```bash
# 1) Bắn 3 request vào profile mỗi cái hang 30s → ăn hết 2 slot của profile + 1 fail 503
curl "http://localhost:3000/profile?slow=30" &
curl "http://localhost:3000/profile?slow=30" &
curl "http://localhost:3000/profile?slow=30"
# -> thứ 3: 503 "bulkhead 'profile' full"

# 2) Check stats — profile còn 0 slot
curl http://localhost:3000/bulkhead/stats
# { "checkout": { "free": 8, "capacity": 8 },
#   "profile":  { "free": 0, "capacity": 2 },
#   "reporting":{ "free": 1, "capacity": 1 } }

# 3) Checkout VẪN HOẠT ĐỘNG vì khoang riêng!
curl http://localhost:3000/checkout
# { "ok": true, "feature": "checkout" }
```

**Đây là điểm vàng**: profile đang "chết", nhưng core flow (checkout) **không bị ảnh hưởng**.

---

## Hai tầng bulkhead

| Tầng | Cách thực hiện | Khi cần |
|---|---|---|
| **Code** (demo này) | Semaphore / thread pool riêng cho mỗi feature | Mỗi monolith / service có nhiều feature |
| **Infrastructure** | Pod riêng, node pool riêng trên K8s, DB connection pool riêng | Microservices, cần cô lập blast radius |

---

## Bulkhead + Circuit Breaker = combo chí mạng

```
request → bulkhead (chặn quá nhiều concurrent) → circuit breaker (chặn nếu downstream đã chết) → downstream
```

- Bulkhead: hạn chế số concurrent → tránh một feature kéo sập toàn service.
- Circuit Breaker: khi downstream chết, không cho request đi qua để tiết kiệm thread bulkhead.

---

## Fail-fast vs queue

Demo dùng **fail-fast** (`throw 503` ngay khi đầy) thay vì queue.

- **Fail-fast**: user thấy lỗi ngay, không chờ timeout — trải nghiệm tốt hơn dưới load.
- **Queue có giới hạn**: dùng khi burst ngắn có thể chấp nhận chờ vài giây.

---

## References
- [Release It! — Bulkhead Pattern](https://pragprog.com/titles/mnee2/release-it-second-edition/)
- [Hystrix Bulkhead docs](https://github.com/Netflix/Hystrix/wiki/How-it-Works#bulkhead)
- [async-mutex](https://github.com/DirtyHairy/async-mutex)
