# Saga pattern (choreography) — NestJS demo

This monorepo demonstrates a **choreography-style saga**: services communicate over **Apache Kafka**, each with its own **SQLite** database (TypeORM). There is no central orchestrator; **compensation** runs when inventory cannot fulfill the order.

## Architecture

| Service | Port | HTTP / Kafka |
|---------|------|--------------|
| **order** | 3001 | `POST /order` — create order; consumes topic `inventory-events` |
| **payment** | 3002 | Kafka consumer on `inventory-events` (refund on out-of-stock); emits `payment-events` on refund |
| **inventory** | 3003 | `POST /inventory/check` — deduct stock or emit failure events |

**Main topic:** `inventory-events` — payload includes `eventType`:

- `INVENTORY_OUT_OF_STOCK` → order set to `CANCELLED`; payment record (if any) → `REFUNDED` and emit `PAYMENT_REFUNDED` on `payment-events`.
- `INVENTORY_DEDUCTED` → order → `COMPLETED`.

**Startup seed data** (for quick demos):

- `productId: 1` — stock **0** (failure / compensation path).
- `productId: 2` — stock **100** (success path).

## Prerequisites

- Node.js (version compatible with the project)
- Docker (for Kafka)

## Run Kafka

```bash
docker compose -f containers/kafka.yaml up -d
```

Default broker: `localhost:9092` (hard-coded in the apps).

## Install

```bash
npm install
```

## Run each service

Use **three terminals** (with Kafka running):

```bash
npx nest start order --watch
npx nest start payment --watch
npx nest start inventory --watch
```

> In this monorepo, the default project in `nest-cli.json` is not these apps—always pass the app name as above.

## Try the flow (`curl` example)

1. Create an order (order service):

```bash
curl -X POST http://localhost:3001/order -H "Content-Type: application/json" -d "{\"productId\":2,\"quantity\":1}"
```

Note the order `id` from the response.

2. Check / deduct inventory (inventory service), replace `ORDER_ID` with that id:

```bash
curl -X POST http://localhost:3003/inventory/check -H "Content-Type: application/json" -d "{\"orderId\":ORDER_ID,\"productId\":2,\"quantity\":1}"
```

- Enough stock → order becomes **COMPLETED** (via `INVENTORY_DEDUCTED`).
- `productId: 1` or quantity above stock → **OUT_OF_STOCK** → order **CANCELLED** and payment (if present for that `orderId`) **REFUNDED**.

Creating a payment record can be done via `PaymentService.createPayment(orderId)` in code or by extending the API—the payment controller currently only handles Kafka events.

## Stack

- [NestJS](https://nestjs.com/) 11 — Kafka microservices (`@nestjs/microservices`, `kafkajs`)
- [TypeORM](https://typeorm.io/) + `sqlite3` — one DB file per app (`order.sqlite`, `payment.sqlite`, `inventory.sqlite`)

## Scripts (`package.json`)

| Script | Description |
|--------|-------------|
| `npm run build` | Build the monorepo |
| `npm run start:dev` | Use an app name: `npx nest start order --watch` (or `payment`, `inventory`) |
| `npm run test` | Jest |
| `npm run lint` | ESLint |

## License

See `package.json` (`UNLICENSED` unless you change it).
