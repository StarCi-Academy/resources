# Timeouts & Retries (Exponential Backoff + Jitter)

Demo cách gọi HTTP downstream có **timeout** cứng + **retry** với **exponential backoff + full jitter** kiểu AWS.
(EN: Demo HTTP downstream calls with strict timeout + exponential backoff + full jitter retry, AWS-style.)

> Gắn với bài **Module 5.1 — Timeouts and Retries**.

---

## Kiến trúc

```
Client ──▶ NestApp :3000 ──▶ FakeDownstream :4001
                │                  │
                │              /fast   (200 OK ngay)
                │              /slow   (hang 5s)      ← test timeout
                │              /flaky  (30% fail 503) ← test retry
                │
                └── ResilientHttpService: timeout + exp backoff + jitter
```

---

## Install & run

```bash
npm install

# Terminal 1 — fake downstream
npm run start:downstream

# Terminal 2 — Nest app
npx nest start --watch
```

---

## Test 3 kịch bản

```bash
# 1) Happy path — trả ngay
curl http://localhost:3000/call/fast

# 2) Timeout — downstream hang 5s, timeout của ta 1s
#    → retry 2 lần (3 attempt tổng), kết quả 500 sau ~3-7s
curl -w "\n%{http_code}\n" http://localhost:3000/call/slow

# 3) Flaky — downstream fail 30%, retry thường cứu được
#    → retry đến 4 lần với backoff 200ms → 2s
curl http://localhost:3000/call/flaky
```

---

## Công thức

```
attempt n → sleep = random(0, min(cap, base * 2^(n-1)))

base = 200ms, cap = 2s

attempt 1 fail → ngủ random(0..200)
attempt 2 fail → ngủ random(0..400)
attempt 3 fail → ngủ random(0..800)
attempt 4 fail → ngủ random(0..1600)
attempt 5 fail → ngủ random(0..2000)   # đã bị cap
```

- **Exponential** cho downstream thời gian hồi phục.
- **Full jitter** (random từ 0 đến max) chống mọi client cùng retry đồng loạt → DDOS chính mình.

---

## Khi nào KHÔNG retry?

- Non-idempotent writes (POST tạo order): retry có thể tạo trùng — dùng **idempotency key**.
- Lỗi 4xx (400, 401, 403): retry vô ích, bug ở client.
- Retry budget hết: nếu >10% traffic là retry → tắt ngay, downstream sắp chết.

---

## Chọn timeout thế nào?

- Đo `p99` latency của downstream.
- Đặt timeout = `p99 * 2` (ví dụ p99=200ms → timeout=400-500ms).
- Quá ngắn: false positive. Quá dài: hang → bị bulkhead exhausted.

---

## References
- [AWS — Exponential Backoff and Jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [Google SRE Book — Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)
