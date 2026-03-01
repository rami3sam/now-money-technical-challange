# Now Money Challenge

This project implements a distributed payment orchestration system composed of multiple services that simulate a real-world money transfer workflow.

## Services

- **orchestrator**
- **fx-quote-service**
- **payout-partner-simulator**

---

## Tech Stack

- Node.js (runtime)
- TypeScript (type safety)
- Express (web server)
- MongoDB (database)
- Mongoose (database interactions)
- Axios (HTTP client)
- Zod (schema validation)
- Vitest (testing framework)
- Docker (containerisation and integration testing)
- Winston (logging)

---

## Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/rami3sam/now-money-technical-challange.git
cd now-money-technical-challange
```

2. Create a `.env` file in the **top-level root** of the repository with the following values:

```env
WEBHOOK_SECRET=example_secret
MONGO_USERNAME=example_username
MONGO_PASSWORD=example_password
```

Alternatively, you can provide these environment variables as command-line arguments when running Docker Compose.

---

## How to Run Locally

Start all services using Docker Compose:

```bash
docker compose up
```

This will start:

- orchestrator
- fx-quote-service
- payout-partner-simulator
- database

---
## How to Run Locally

```bash
docker compose up
```

## How to Run Tests

⚠️ Containers must be running first (`docker compose up`).

### Run Unit Tests

```bash
docker compose exec orchestrator npm run test:unit
```

### Run Integration Tests

```bash
docker compose exec orchestrator npm run test:integration
```

---
## Using Postman

You can import the Postman collection from the repository:

```
postman/now-money.postman_collection.json
```

## Environment Variables

| Variable | Description |
|---|---|
| WEBHOOK_SECRET | Secret used to verify partner webhooks |
| MONGO_USERNAME | MongoDB username |
| MONGO_PASSWORD | MongoDB password |

---

## Project Structure

```
.
├── orchestrator
├── fx-quote-service
├── payout-partner-simulator
├── postman
├── docker-compose.yml
└── .env
```

---

## Notes

- All services communicate via internal Docker networking.
- Integration tests run against real containers.

---

Now Money Technical Challenge
