# CQRS pattern — NestJS demo

This repository demonstrates the **Command Query Responsibility Segregation (CQRS)** pattern using NestJS. It separates data mutation operations (Commands) from data retrieval operations (Queries) into different bounded contexts to optimize for fast reads and complex business logic.

## Architecture

| Service | Port | Database | Responsibilities |
|---------|------|----------|------------------|
| **command** | 3000 | PostgreSQL | Dispatches commands via `CommandBus`. Updates the Write Model. Publishes `CustomerProfileUpdatedEvent`. |
| **query** | 3001 | Elasticsearch | Dispatches queries via `QueryBus`. Listens to `CustomerProfileUpdatedEvent` to sync the materialized Read Model. |

- **Write model (Commands):** Handles creating, updating, and deleting data using **PostgreSQL**.
- **Read model (Queries):** Handles retrieving data using a flattened, read-optimized document in **Elasticsearch**.

*(Note: In a true distributed microservice environment, the `CustomerProfileUpdatedEvent` would be transmitted over a message broker like Kafka or RabbitMQ. For this demo, we use the NestJS EventBus within CQRS context).*

## Prerequisites

- Node.js
- Docker & Docker Compose (for the databases)

## Run Databases (PostgreSQL + Elasticsearch)

Start the databases using the provided docker-compose file:

```bash
docker-compose -f containers/docker-compose.yaml up -d
```

## Install

```bash
npm install
```

## Run the CQRS services

Use **two terminals** to run the separate applications:

**Terminal 1 — Command handler (Write)**
```bash
npx nest start command --watch
```

**Terminal 2 — Query handler (Read)**
```bash
npx nest start query --watch
```

## Try the flow (`curl` example)

1. **Update a customer profile via the Command app (Port 3000):**

```bash
curl -X POST http://localhost:3000/customer/update \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"123\", \"name\": \"John Doe\", \"email\": \"john@example.com\"}"
```
*Behind the scenes: The Command app executes the business logic, saves to PostgreSQL, and emits an event. The Query app (or an event handler) updates the projection in Elasticsearch.*

2. **Retrieve the customer profile via the Query app (Port 3001):**

```bash
curl -X GET http://localhost:3001/customer/123
```
*Behind the scenes: The Query app fetches the read-optimized document directly from Elasticsearch without complex JOINs.*

## Important technical constraints to consider

- **Eventual Consistency:** The query model is updated asynchronously. Users might see stale data for a short time after an update.
- **Increased Complexity:** Multiple databases, event schemas, and synchronization logic must be maintained.
- **Event Loss:** Mechanisms like Event Sourcing or a Transactional Outbox are typically required to ensure the read database always stays in sync.

## Stack

- [NestJS](https://nestjs.com/) 11 — (`@nestjs/cqrs`)
- PostgreSQL (`typeorm`, `pg`)
- Elasticsearch (`@nestjs/elasticsearch`)
