# Campus LMS (Nilebyte Campus)

A single-root Vite + Fastify monorepo implementing a role-based academic LMS.
Phase 1 (auth + user management + DB foundation) and Phase 2 (student core:
courses, grades, schedule, dashboard) are implemented.

## Repository layout (known deviation, accepted)

This project is a single root Vite + Fastify app. The original spec assumed
separate `./backend/` and `./frontend/` directories; those do not exist.

- `server/` — backend (Fastify + TypeScript + PostgreSQL + Redis)
- `src/` — frontend (React 19 + Vite + TypeScript + Tailwind)
- root `package.json` drives both (scripts: `dev`, `dev:client`, `dev:all`, `migrate`, `build`)

## Run Locally

**Prerequisites:** Node.js 20+, Docker (for Postgres + Redis)

1. `cp .env.example .env` and fill in strong secrets (see required keys below).
2. Log in to Docker for quad.io **before** running the script:
   ```bash
   docker login
   ```
3. `./development.sh`           # one-shot script: starts infra, migrates, and runs backend + frontend

The `development.sh` script will:

- Kill any existing backend (:4000) / frontend (:3000) instances
- Start Postgres + Redis via `docker compose up -d`
- Wait until Postgres + Redis are ready
- Apply migrations and seed demo data (`npm run migrate`)
- Start both services (`npm run dev:all`) — Fastify on :4000, Vite on :3000

To run services manually instead:

1. `docker compose up -d`      # starts postgres:16 (5432) + redis:7 (6379) + minio + rabbitmq + qdrant
2. `npm install`               # root install covers server + src
3. `npm run migrate`           # applies migrations and seeds demo data
4. `npm run dev:all`           # Fastify on :4000, Vite on :3000

`npm run dev` runs only the backend; `npm run dev:client` runs only the frontend.

## Required `.env` keys

| Key | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (e.g. `postgresql://campus:campus@localhost:5432/campus_db`) |
| `REDIS_URL` | Redis connection string (e.g. `redis://localhost:6379`) |
| `JWT_SECRET` | Signing secret used as a fallback / legacy token signer |
| `JWT_ACCESS_SECRET` | Signing secret for 15-minute access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Signing secret for 7-day refresh tokens (min 32 chars) |
| `PORT` | Backend port (default `4000`) |
| `HOST` | Backend bind address (default `127.0.0.1`) |
| `FRONTEND_ORIGIN` | Allowed CORS origin (default `http://localhost:3000`) |
| `APP_URL` | Self-referential app URL (default `http://localhost:3000`) |
| `VITE_API_URL` | Frontend API base URL (default `http://localhost:4000`) |
| `BCRYPT_ROUNDS` | Password hashing rounds (default `12`) |
| `MINIO_ENDPOINT` | MinIO/S3 endpoint |
| `MINIO_ACCESS_KEY` | MinIO/S3 access key |
| `MINIO_SECRET_KEY` | MinIO/S3 secret key |
| `MINIO_BUCKET` | MinIO/S3 bucket name |
| `RABBITMQ_URL` | RabbitMQ connection URL |
| `DEMO_SEED_PASSWORD` | Strong password used for all demo accounts during `npm run migrate` (min 12 chars) |

Generate strong JWT secrets with:

```bash
openssl rand -base64 64
```

## Security notes

- `.env` and `credentials.txt` are gitignored and must never be committed.
- Redis is required; the backend will not start without a working `REDIS_URL`.
- JWT secrets must be at least 32 characters. The server refuses to start with weak or missing secrets.
- Demo account passwords come from `DEMO_SEED_PASSWORD`; there is no committed plaintext credential file.

## Known Deviations

- Repo layout is `server/` + `src/` at root, not `./backend` + `./frontend`.
- `bcryptjs` (pure-JS) is used instead of native `bcrypt` — functionally equivalent, rounds=12 preserved.
- JWT payloads carry `roleType`/`jti`/`type` (a superset of the original `{sub, role}`).
