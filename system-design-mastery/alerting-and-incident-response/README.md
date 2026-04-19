# 6.4 — Alerting & Incident Response (Prometheus + Alertmanager + NestJS)

> Demo cho Module 6.4. Prometheus scrape metrics từ Nest app, evaluate alert
> rules, Alertmanager route theo severity và gọi webhook về Nest để mô phỏng
> bước đầu của incident response (pager cho P1, Slack cho P2, log MTTR khi
> resolved).
>
> (EN: Demo for Module 6.4. Prometheus scrapes metrics from the Nest app,
> evaluates alert rules, Alertmanager routes by severity and calls a webhook
> back into Nest to simulate incident response — pager for P1, Slack for P2,
> MTTR log on resolve.)

---

## 1. Flow tổng quan (EN: System Flow)

```
Client → Nest /api → prom-client (http_requests_total, http_request_duration_ms)
                       │
                       ▼
                 GET /metrics  ← scrape (5s)  Prometheus
                                                │
                                                ▼ evaluate alerts.yml
                                           Alertmanager (route by severity)
                                                │ webhook
                                                ▼
                                         Nest POST /alerts
                                        (P1 pager / P2 Slack / resolved)
```

Các khái niệm chính (EN: key concepts):

- **Alert rule**: viết theo *symptom-based* (error rate, p99 latency) thay vì
  *cause-based* (CPU, memory).
- **Severity**: `p1` = đau user → gọi điện; `p2` = warning → Slack.
- **Incident Response**: detect → triage → mitigate → resolve → post-mortem.
  Demo này cover 2 bước đầu và bước cuối (log resolved để tính MTTR).

---

## 2. Setup

```bash
npm install
```

## 3. Chạy Prometheus + Alertmanager

```bash
docker compose -f .docker/stack.yaml up --build -d
```

- Prometheus UI: http://localhost:9090 (tab **Alerts** để xem state)
- Alertmanager UI: http://localhost:9093

## 4. Chạy Nest app

```bash
npm run start:dev
```

App listen `:3000`, expose:

- `GET /api?fail=0.5&latency=1500` — endpoint giả lập, nhận `fail` (tỉ lệ 5xx)
  và `latency` (ms).
- `GET /metrics` — Prometheus scrape target.
- `POST /alerts` — webhook receiver của Alertmanager.

---

## 5. Kịch bản demo (EN: Demo scenarios)

### 5.1 Trigger P1 — HighErrorRate (> 5% trong 2 phút)

```bash
# Spam request với 50% fail rate
while true; do curl -s "http://localhost:3000/api?fail=0.5" > /dev/null; done
```

Sau ~2 phút:

- Prometheus **Alerts** tab: `HighErrorRate` chuyển `PENDING → FIRING`.
- Alertmanager gửi webhook về Nest `/alerts`.
- Log Nest xuất hiện: `[P1][PAGE] HighErrorRate FIRING ...`

### 5.2 Trigger P2 — HighLatencyP99 (p99 > 1s trong 5 phút)

```bash
while true; do curl -s "http://localhost:3000/api?latency=1500" > /dev/null; done
```

Sau ~5 phút → log `[P2][SLACK] HighLatencyP99 FIRING ...`

### 5.3 Resolved → MTTR

Dừng spam, đợi ~2–5 phút, alert tự resolved:

```
[RESOLVED] HighErrorRate (severity=p1)
```

---

## 6. Alert rule philosophy (EN: best practices)

- **Alert on symptoms, not causes** — đo cái user cảm nhận (error rate, p99),
  không alert CPU 80% vì user không care.
- **Actionable** — mỗi alert phải có runbook; nếu không cần làm gì thì đừng
  alert.
- **Giảm noise** — dùng `for:` để loại spike ngắn; group theo `alertname` để
  không flood pager.
- **Escalation**: P1 → phone call on-call, P2 → Slack, P3 → email/ticket.
- **Post-mortem blameless**: log timestamp firing ↔ resolved để tính MTTR,
  rút kinh nghiệm, không đổ lỗi cá nhân.

---

## 7. Project structure

```
alerting-and-incident-response/
├── .docker/
│   ├── prometheus.yml         # scrape + rule_files + alerting target
│   ├── alerts.yml             # alert rules (P1 error-rate, P2 p99 latency)
│   ├── alertmanager.yml       # route by severity → webhook
│   └── stack.yaml             # docker compose: Prometheus + Alertmanager
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts      # /api synthetic traffic
│   ├── metrics.ts             # prom-client registry + counters/histograms
│   ├── metrics.controller.ts  # GET /metrics
│   └── alerts.controller.ts   # POST /alerts webhook receiver
└── README.md
```
