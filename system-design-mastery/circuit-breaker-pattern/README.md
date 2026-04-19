# Circuit Breaker Pattern (opossum)

Demo **Circuit Breaker** — cắt cầu chì khi downstream chết, không cho request rơi vào hố đen.
(EN: Demo Circuit Breaker — trip the fuse when downstream is dead, stop cascading failures.)

> Gắn với bài **Module 5.2 — Circuit Breaker Pattern**.

---

## 3 trạng thái

```
                 errorRate > 50%
   ┌────────────────────────────────────▶
CLOSED                                    OPEN
(normal)                                  (reject all)
   ▲                                       │
   │ probe OK                resetTimeout (5s)
   │                                       │
   │                                       ▼
   └────────  HALF_OPEN  ◀─────────────────┘
              (probe a few requests)
              probe FAIL → back to OPEN
```

---

## Install & run

```bash
npm install

# Terminal 1 — fake downstream với switch kill/revive
npm run start:downstream

# Terminal 2 — Nest app
npx nest start --watch
```

---

## Test

```bash
# 1) Downstream healthy → CLOSED, trả data
curl http://localhost:3000/data
curl http://localhost:3000/breaker/stats   # state: CLOSED

# 2) Kill downstream
curl -X POST http://localhost:4002/kill

# 3) Bắn 10 request — 5 request đầu bị fail, sau đó circuit OPEN
for i in {1..10}; do curl -s http://localhost:3000/data; echo; done
# {"ok":false,"payload":"fallback — ..."}   ← fallback kick in
curl http://localhost:3000/breaker/stats   # state: OPEN

# 4) Chờ 5s resetTimeout → HALF_OPEN
sleep 6
curl http://localhost:3000/breaker/stats   # state: HALF_OPEN

# 5) Revive downstream và thử lại → CLOSED
curl -X POST http://localhost:4002/revive
curl http://localhost:3000/data            # ok
curl http://localhost:3000/breaker/stats   # state: CLOSED
```

---

## Config opossum (breaker.service.ts)

```ts
new CircuitBreaker(fn, {
  timeout: 1000,                   // timeout mỗi call
  errorThresholdPercentage: 50,    // > 50% error → OPEN
  volumeThreshold: 5,              // cần tối thiểu 5 request trước khi tính %
  resetTimeout: 5000,              // OPEN → HALF_OPEN sau 5s
});
```

---

## Fallback — "fail gracefully"

```ts
breaker.fallback(() => ({
  ok: false,
  payload: 'serving stale cache / static data'
}));
```

Điều này cho phép **Graceful Degradation** — khi "Gợi ý cho bạn" chết, trả "Top 10 evergreen" để UI không vỡ.

---

## Kết hợp

- **Circuit Breaker + Retry**: retry chỉ trong giới hạn retry budget, breaker cắt sớm khi downstream sập.
- **Circuit Breaker + Bulkhead**: pool riêng mỗi downstream + breaker riêng → lỗi của service A không ăn thread của service B.

---

## References
- [opossum GitHub](https://github.com/nodeshift/opossum)
- [Martin Fowler — Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
