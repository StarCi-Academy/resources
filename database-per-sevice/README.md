# Database per Service pattern — NestJS demo

This repository demonstrates the **Database per Service** pattern using NestJS. It separates data ownership so that each microservice manages its own database independently, ensuring loose coupling and allowing the use of polyglot persistence to fit the service's specific workload.

## Architecture

| Service | Port | Database | Responsibilities |
|---------|------|----------|------------------|
| **order** | 3000 | PostgreSQL | Manages order creation and tracking. Owns the relational `orders` data. |
| **inventory** | 3001 | MongoDB | Manages product stock. Owns the document-based `products` data to optimize for fast reads. |

- **Order service:** Uses PostgreSQL for strict relational ACID operations on orders.
- **Inventory service:** Uses MongoDB for fast document retrieval.
- Services do not share databases. Cross-service data retrieval is meant to be done via APIs (or CQRS/API Composition in a real-world scenario).

## Prerequisites

- Node.js
- Docker & Docker Compose (for the databases)

## Run Databases (PostgreSQL + MongoDB)

Start the databases using the provided docker-compose file:

```bash
docker-compose -f containers/docker-compose.yaml up -d
```

## Install

```bash
npm install
```

## Run the services

Use **two terminals** to run the separate applications:

**Terminal 1 — Order service (PostgreSQL)**
```bash
npx nest start order --watch
```

**Terminal 2 — Inventory service (MongoDB)**
```bash
npx nest start inventory --watch
```

## Try the flow (`curl` example)

1. **Add a product to the Inventory service (Port 3001):**

```bash
curl -X POST http://localhost:3001/inventory \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Laptop X\", \"stock\": 100}"
```
*Behind the scenes: The Inventory app executes business logic and saves a document to MongoDB.*

2. **Create an order in the Order service (Port 3000):**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d "{\"customerId\": \"cus-123\", \"totalAmount\": 1500.00}"
```
*Behind the scenes: The Order app stores the structured relational order record in PostgreSQL.*

## Important technical constraints to consider

- **Distributed Transactions:** Because data is scattered, two-phase commit is unfeasible. We need to implement the **Saga pattern** for cross-service consistency.
- **Complex Queries:** Gathering joined data from multiple services is difficult requiring API Composition or **CQRS**.
- **Eventual Consistency:** Data might not be strictly synchronized across services at all times.

## Stack

- [NestJS](https://nestjs.com/) 11
- PostgreSQL (`typeorm`, `pg`)
- MongoDB (`@nestjs/mongoose`, `mongoose`)
