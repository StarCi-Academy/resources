# Failures in Distributed Systems — Failure Amplification

Demo hiện tượng **failure amplification**: chuỗi 4 service mỗi service 99% uptime → toàn chuỗi chỉ đạt ~96%.
(EN: Demo failure amplification — 4 services at 99% uptime compose to ~96% end-to-end.)

> Gắn với bài **Module 5.0 — Failures in Distributed Systems**.

---

## Ý tưởng

```
Client ──▶ ServiceA ──▶ ServiceB ──▶ ServiceC ──▶ ServiceD
           99%         99%         99%         99%

End-to-end success = 0.99⁴ ≈ 96.06%
→ Cứ 100 user: ~4 người fail dù không service nào chết hoàn toàn.
```

Với 10 service nối đuôi nhau: `0.99^10 ≈ 90.4%` — 1/10 user gặp lỗi!

---

## Install & run

```bash
npm install
npx nest start --watch
```

---

## Test

```bash
# 1 request — có thể ok hoặc fail
curl http://localhost:3000/chain

# Chạy 5000 lượt, so kết quả thực tế vs lý thuyết
curl "http://localhost:3000/chain/simulate?n=5000"
# {
#   "total": 5000,
#   "success": 4803,
#   "failure": 197,
#   "successRate": "96.06%",
#   "theoreticalRate": "96.06%"
# }
```

---

## 8 Fallacies of Distributed Computing

Luôn phải nhớ khi thiết kế:

1. Mạng luôn ổn định → SAI
2. Latency = 0 → SAI
3. Bandwidth vô hạn → SAI
4. Mạng an toàn → SAI
5. Topology không đổi → SAI
6. 1 admin duy nhất → SAI
7. Chi phí transport = 0 → SAI
8. Mạng đồng nhất → SAI

Mọi resilience pattern (timeout, retry, circuit breaker, bulkhead) đều sinh ra để né 8 ảo tưởng trên.

---

## Bài học

- **Thiết kế fail-safe, không phải fail-proof**: chấp nhận lỗi sẽ xảy ra, câu hỏi là app nhận biết và xử lý thế nào.
- **Timeout + Retry**: chặn hang indefinitely, thử lại với backoff.
- **Circuit Breaker**: khi service xuống, stop gọi trong X giây để nó hồi phục.
- **Graceful Degradation**: fallback, ẩn tính năng phụ, giữ core flow sống.

Xem các demo tiếp theo: `timeouts-and-retries`, `circuit-breaker-pattern`, `bulkhead-pattern`, `health-checks-graceful-degradation`.
