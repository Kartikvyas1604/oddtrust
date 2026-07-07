# OddsTrust Web (Next.js API Layer)

Next.js 16 App Router application serving the OddsTrust frontend **and** REST API.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js (port 3000)            │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Page Routes  │  │  API Routes (this layer)  │ │
│  │  / (home)     │  │  /api/overview            │ │
│  │  /matches     │  │  /api/matches             │ │
│  │  /oracle      │  │  /api/matches/:id         │ │
│  │  /proof-feed  │  │  /api/proof-feed          │ │
│  └──────────────┘  │  /api/oracle/query/:id    │ │
│                    │  /api/network-health       │ │
│                    │  /api/metrics              │ │
│                    │  /health                   │ │
│                    └──────────────────────────┘ │
└─────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    ┌────────┐          ┌──────────┐
    │ Redis  │          │ Postgres │
    │(cache) │          │(persist) │
    └────────┘          └──────────┘
```

The API layer replaces the previous Fastify server. All REST endpoints now run as
Next.js Route Handlers within the same process, eliminating the need for a
separate API server.

## Worker Processes

Background tasks run in separate processes:
- **Ingestion worker** (`apps/backend`) — connects to TxLINE, ingests odds,
  runs consistency detection, publishes to Redis pub/sub
- **WebSocket server** (`ws-server.ts`) — subscribes to Redis proof-feed channel,
  streams live updates to WS clients on port 3002

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy and fill environment
cp .env.example .env

# Start infrastructure (Postgres + Redis)
docker compose up -d postgres redis

# Start Next.js dev server (API + frontend)
pnpm dev
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/overview` | Tournament trust score + aggregate stats |
| GET | `/api/matches` | Live match grid (filter: `?status=flagged`, sort: `?sort=margin`) |
| GET | `/api/matches/:id` | Full market breakdown for one fixture |
| GET | `/api/proof-feed?cursor=` | Paginated proof feed (cursor-based) |
| WS | `ws://host:3002/ws/proof-feed` | Live streaming proof feed |
| GET | `/api/oracle/query/:fixtureId` | Agent-composable trust score (stable contract) |
| GET | `/api/network-health` | Total checks, consistency rate, slot, agents |
| GET | `/health` | Component health (DB, Redis, last check) |
| GET | `/api/metrics` | Prometheus-formatted metrics |

## Endpoints Used from TxLINE

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/guest` | Guest JWT authentication |
| `POST /subscribe` | Wallet-signed subscription → API token |
| `GET /fixtures` | List all World Cup fixtures |
| `GET /fixtures/{id}/odds` | Current odds for a fixture |
| `GET /fixtures/{id}/odds/historical` | Historical odds (replay mode) |
| `GET /fixtures/{id}/proof` | Validation proof reference |
| `WS /v1?token=...` | Live odds stream |

## Testing

```bash
pnpm test
```

## Docker

```bash
# Full stack: web + ws-server + worker + postgres + redis
docker compose -f docker-compose.yml up --build
```
