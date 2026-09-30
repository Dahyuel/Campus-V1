# Campus LMS (Nilebyte Campus)

> Multi-role academic operations platform for Campus by Nilebyte — role-specific dashboards for Students, Faculty, Admin, Department Head, and Dean, backed by a Fastify + PostgreSQL API with an AI tutor (RAG) subsystem.

![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Overview

Campus LMS is a single-root **Vite + Fastify monorepo** implementing a role-based academic LMS.

- **Phase 1** — authentication, user management, and database foundation.
- **Phase 2** — student core: courses, grades, schedule, dashboard.
- **Phase 3+** — faculty, admin, department head, and dean modules, plus notifications and an AI tutor.

The frontend (`src/`) is a React 19 SPA. The backend (`server/`) is a Fastify + TypeScript API backed by PostgreSQL, Redis, MinIO, RabbitMQ, and Qdrant. A bundled `deepseek-web-to-api-main/` project provides an OpenAI-compatible DeepSeek proxy used for the AI tutor.

> **Repository layout note (known, accepted deviation):** the original spec assumed separate `./backend/` and `./frontend/` directories. This project instead uses `server/` and `src/` at the repository root, driven by a single root `package.json`.

---

## Features

### Role-Based Portals

| Role | Highlights |
|---|---|
| **Student** | My Courses, Materials, Schedule, Grades, Community, AI Tutor, Messages, Settings |
| **Faculty** | My Students, Attendance, Grade Entry, Course Community |
| **Admin** | Students, Faculty & Staff, Enrollment, Finance, Exam Scheduling, Analytics, Reports |
| **Department Head** | At-Risk student tracking, department data, messaging |
| **Dean** | Departments, Academic Overview, Financial Overview, University Analytics |
| **All roles** | Home dashboard, Messages, Notifications, Settings, Help |

### Platform Capabilities

- **Authentication** — JWT access + refresh tokens, refresh-token rotation with family revocation, HTTP-only refresh cookie, rate-limited login, bcrypt (rounds=12) password hashing.
- **AI Tutor** — per-course tutoring sessions with streaming SSE responses, RAG indexing over course materials (Qdrant + embeddings), and citation tracking.
- **Notifications & messaging** — per-role direct messages, broadcast channels, and real-time unread badges.
- **Object storage** — MinIO (S3-compatible) for course materials and uploads.
- **Async processing** — RabbitMQ for background jobs (indexing, notifications).
- **Caching/sessions** — Redis for refresh-token state and rate limiting.
- **Data layer** — PostgreSQL 16 with versioned SQL migrations and a demo seeder.

---

## Tech Stack

**Frontend**
- React 19, React Router 7, TypeScript
- Vite 8 with Tailwind CSS 4
- TanStack React Query 5 for data fetching/caching
- Framer Motion / Motion for animation
- Axios with auth + auto-refresh interceptors
- Lucide React icons

**Backend**
- Fastify 5 (TypeScript, ESM)
- `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, `@fastify/rate-limit`, `@fastify/multipart`
- PostgreSQL (`pg`), Redis (`ioredis`), RabbitMQ (`amqplib`)
- MinIO / AWS SDK v3 S3 client
- Qdrant client + OpenAI/Google GenAI SDKs for the AI tutor
- Zod for validation

**Infrastructure**
- Docker Compose: Postgres 16, Redis 7, MinIO, RabbitMQ 3.13, Qdrant

---

## Prerequisites

- **Node.js** 20+ (enforced via `engines` in `package.json`)
- **Docker** + Docker Compose (for Postgres, Redis, MinIO, RabbitMQ, Qdrant)
- **OpenSSL** (to generate JWT secrets)

---

## Project Structure

```
Campus-V1-main/
├── src/                        # Frontend (React 19 + Vite)
│   ├── api/                    # Low-level auth API (token storage, refresh)
│   ├── components/             # UI by role
│   │   ├── admin/              #   Admin tabs
│   │   ├── dashboards/         #   Role dashboards
│   │   ├── dean/               #   Dean tabs
│   │   ├── depthead/           #   Department head tabs
│   │   ├── faculty/            #   Faculty tabs
│   │   ├── student/            #   Student tabs (incl. AI Tutor)
│   │   ├── ui/                 #   Shared UI primitives
│   │   ├── Login.tsx, Sidebar.tsx, TopBar.tsx, HomeDashboard.tsx
│   ├── context/AuthContext.tsx # Auth provider + session rehydration
│   ├── data/                   # Typed mock/fallback data
│   ├── hooks/                  # React Query hooks per role
│   ├── lib/                    # Axios client, auth helpers, motion presets
│   ├── App.tsx                 # Router + role-based route rendering
│   ├── main.tsx                # Entry point
│   └── types.ts                # Shared frontend types
├── server/                     # Backend (Fastify + TypeScript)
│   ├── routes/                 # auth, student, faculty, admin, depthead,
│   │                           # dean, notifications, ai-tutor, *-messages,
│   │                           # student-community
│   ├── plugins/                # cors, jwt, minio, rabbitmq, redis
│   ├── middleware/             # requireAuth
│   ├── db/                     # client, migrate, activity helpers
│   ├── migrations/             # 001…008 versioned SQL migrations
│   ├── data/                   # Seeded users / demo data
│   ├── config.ts               # Env parsing + validation
│   ├── auth.ts                 # Token generation/rotation
│   ├── redis.ts                # Redis keys + client
│   └── index.ts                # Fastify app bootstrap
├── deepseek-web-to-api-main/   # OpenAI-compatible DeepSeek proxy (AI tutor)
├── docker-compose.yml          # Local infrastructure stack
├── development.sh              # One-command local dev bootstrap
├── .env.example                # Environment template
├── vite.config.ts              # Vite config (proxy /api → :4000)
├── tsconfig.json               # Frontend TS config
└── tsconfig.server.json        # Backend TS config
```

---

## Installation

```bash
# 1. Clone
git clone <your-repo-url> Campus-V1-main
cd Campus-V1-main

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

Generate strong JWT secrets and paste them into `.env`:

```bash
openssl rand -base64 64
```

---

## Configuration

All configuration is read from `.env`. See `.env.example` for the full template.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://campus:campus@localhost:5432/campus_db` | PostgreSQL connection URL |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection URL (server refuses to start without it) |
| `JWT_SECRET` | Yes | — | Base JWT secret (min 32 chars) |
| `JWT_ACCESS_SECRET` | Yes | — | Access-token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh-token secret (min 32 chars) |
| `JWT_ACCESS_TTL_SECONDS` | No | `900` | Access token lifetime (15 min) |
| `JWT_REFRESH_TTL_SECONDS` | No | `604800` | Refresh token lifetime (7 days) |
| `BCRYPT_ROUNDS` | No | `12` | Password hashing cost |
| `PORT` | No | `4000` | Backend port |
| `HOST` | No | `127.0.0.1` | Backend host |
| `APP_URL` | No | `http://localhost:3000` | Public app URL |
| `FRONTEND_ORIGIN` | No | `http://localhost:3000` | CORS allow-origin |
| `VITE_API_URL` | No | `/api` | Frontend API base path |
| `MINIO_ENDPOINT` | Yes | `http://localhost:9000` | MinIO endpoint |
| `MINIO_ACCESS_KEY` | Yes | — | MinIO access key |
| `MINIO_SECRET_KEY` | Yes | — | MinIO secret key |
| `MINIO_BUCKET` | No | `campus-materials` | Storage bucket |
| `RABBITMQ_URL` | No | `amqp://campus:campus@localhost:5672` | RabbitMQ URL |
| `DEMO_SEED_PASSWORD` | Yes | — | Password for all seeded demo accounts (min 12 chars, mixed case/digits/symbols) |
| `QDRANT_URL` | No | `http://localhost:6333` | Qdrant vector DB (AI tutor) |
| `EMBEDDING_MODEL` | No | `text-embedding-3-small` | Embedding model name |
| `DEEPSEEK_BASE_URL` | No | `http://localhost:4981/openai/v1` | DeepSeek proxy OpenAI-compatible base URL |
| `DEEPSEEK_API_KEY` | No | `not-needed` | Proxy API key (dummy) |

> AI features are optional. If Qdrant / the DeepSeek proxy are not configured, the rest of the app still runs.

---

## Running Locally

### Option A — One command (recommended)

`development.sh` kills stale processes on ports 3000/4000, starts the Docker infrastructure, waits for Postgres + Redis, runs migrations, then boots both servers:

```bash
./development.sh
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:4000

### Option B — Manual

```bash
# Start infrastructure
docker compose up -d

# Apply migrations + seed demo data
npm run migrate

# Run backend (:4000) + frontend (:3000) together
npm run dev:all

# …or run them separately
npm run dev          # backend only (tsx watch)
npm run dev:client   # frontend only (vite :3000)
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run backend with `tsx watch` on `server/index.ts` |
| `npm run dev:client` | Run Vite dev server on port 3000 |
| `npm run dev:all` | Run backend + frontend concurrently |
| `npm run migrate` | Apply DB migrations and seed demo data |
| `npm run build` | Build the frontend with Vite |
| `npm run preview` | Preview the production frontend build |
| `npm run lint` | Typecheck frontend and backend (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` and `server.js` |

---

## Demo Accounts

After `npm run migrate`, the following accounts are seeded (all use `DEMO_SEED_PASSWORD` from `.env`):

| Username | Role | Email |
|---|---|---|
| `student` | Student | ahmed.dahy@nilebyte.edu |
| `faculty` | Faculty | faculty@nilebyte.edu |
| `admin` | Admin | admin@nilebyte.edu |
| `depthead` | Dept. Head | depthead@nilebyte.edu |
| `dean` | Dean | dean@nilebyte.edu |

Additional student, faculty, and admin accounts are seeded as well. You can log in with **either the username or the email**.

---

## Architecture

```
┌──────────────────────┐        /api (Vite proxy)        ┌──────────────────────┐
│  React 19 SPA (Vite) │ ──────────────────────────────▶ │  Fastify API (:4000) │
│  src/                │ ◀────────────────────────────── │  server/             │
└──────────────────────┘        JSON + SSE               └──────────┬───────────┘
                                                                     │
        ┌────────────────┬────────────────┬────────────────┬────────┴───────┐
        ▼                ▼                ▼                ▼                ▼
   PostgreSQL         Redis            MinIO           RabbitMQ         Qdrant
 (users, courses, (refresh tokens,  (course files,   (async jobs)   (embeddings,
  grades, etc.)    rate limits)     uploads)                        RAG chunks)
```

### Authentication flow

1. `POST /auth/login` validates credentials, issues a short-lived **access token** (returned in the body) and a long-lived **refresh token** (HTTP-only cookie).
2. The frontend stores the access token in memory and attaches it as `Authorization: Bearer <token>`.
3. On `401`, the Axios interceptor calls `POST /auth/refresh` once (deduplicated across concurrent requests) and replays the original request.
4. Refresh tokens are **rotated** on every use; reuse detection revokes the entire token family (stored in Redis).
5. `POST /auth/logout` deletes the refresh token and clears the cookie.

---

## Database Migrations

Migrations live in `server/migrations/` and are applied in order by `server/db/migrate.ts`:

| File | Purpose |
|---|---|
| `001_init.sql` | `users`, `role_type` enum, refresh-token + activity logs |
| `002_student_core.sql` | Courses, grades, schedule, dashboard data |
| `003_schedule_faculty.sql` | Scheduling + faculty assignments |
| `004_faculty_core.sql` | Faculty students, attendance, grade entry |
| `005_admin_core.sql` | Admin enrollment, finance, exam scheduling, analytics |
| `006_events_notifications.sql` | Events, notifications, messaging |
| `007_ai_tutor.sql` | Tutor sessions/messages, broadcasts, RAG index log |
| `008_security_hardening.sql` | Security hardening constraints/indexes |

Run them with:

```bash
npm run migrate
```

---

## AI Tutor & DeepSeek Proxy

The AI tutor (`src/components/student/AITutorTab.tsx`, `server/routes/ai-tutor.ts`) provides per-course chat sessions with streaming responses and RAG citations over course materials.

Responses are generated through the bundled **`deepseek-web-to-api-main/`** proxy — an OpenAI-compatible server that wraps the DeepSeek web chat. It exposes `/v1/chat/completions` and `/v1/models` on port **4981** by default and supports streaming, multi-turn sessions, DeepThink reasoning, and web search.

See [`deepseek-web-to-api-main/README.md`](./deepseek-web-to-api-main/README.md) for capture instructions, configuration, and OpenCode/MCP integration.

> **Disclaimer:** that proxy is reverse-engineered and intended for personal/research/educational use only. Never commit its `.env` or cookie files.

---

## Development Notes

- **Single root package**: `server/` and `src/` share one `package.json` and one `node_modules`.
- **Typechecking** is split: `tsconfig.json` covers `src/`, `tsconfig.server.json` covers `server/`. `npm run lint` runs both.
- **Vite HMR** can be disabled with `DISABLE_HMR=true` (used in AI Studio to avoid flicker during agent edits).
- **API proxy**: Vite rewrites `/api/*` → backend (default `http://localhost:4000`), configurable via `BACKEND_URL`.

### Known deviations

- Repo layout is `server/` + `src/` at root, not `./backend` + `./frontend`.
- `bcryptjs` (pure JS) is used instead of native `bcrypt` — functionally equivalent, rounds=12 preserved.
- JWT payloads carry `roleType` / `jti` / `type` (a superset of the original `{ sub, role }`).

---

## Security Notes

- `.env` and `credentials.txt` are gitignored and **must never be committed**.
- Redis is required; the backend will not start without a working `REDIS_URL`.
- JWT secrets must be at least 32 characters — the server refuses to start with weak or missing secrets.
- Login is rate-limited (5 attempts / 15 minutes per IP+identifier); refresh is rate-limited (30/min).
- Demo account passwords come from `DEMO_SEED_PASSWORD`; there is no committed plaintext credential file.
- Change all default Docker credentials (`MINIO_*`, `RABBITMQ_*`, `POSTGRES_*`) before any real use.

---

## Contributing

1. Fork the repository and create a feature branch.
2. Follow existing conventions (TypeScript strictness, component structure, route/hook patterns).
3. Run `npm run lint` before opening a PR.
4. Never commit secrets, `.env`, or credential files.

---

## License

MIT — see the bundled `deepseek-web-to-api-main/LICENSE`. Add a root `LICENSE` file if you intend to distribute the LMS separately.

---

## Acknowledgments

- **Nilebyte** — Campus platform and product direction.
- **deepseek-web-to-api** — OpenAI-compatible DeepSeek proxy powering the AI tutor.
- Built with React, Fastify, PostgreSQL, Redis, MinIO, RabbitMQ, and Qdrant.
