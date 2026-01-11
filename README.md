# Chatting Opencode

A Slack-inspired real-time chat application built with **NestJS**, **Socket.IO**, and **Next.js**. This monorepo includes a robust backend with horizontal scaling capabilities and a modern frontend.

This project was created using the **oh-my-opencode** plugin with subagent models (frontend UI/UX, document writer, and specialized research agents) to speed up architecture, UI, and documentation work.

### Subagent Models
- `Sisyphus`: `openai/gpt-5.2-codex`
- `oracle`: `openai/gpt-5.2`
- `librarian`: `google/antigravity-gemini-3-flash`
- `explore`: `google/antigravity-gemini-3-flash`
- `frontend-ui-ux-engineer`: `google/antigravity-gemini-3-pro-high`
- `document-writer`: `google/antigravity-gemini-3-flash`
- `multimodal-looker`: `google/antigravity-gemini-3-flash`

---

## Architecture Overview

The system is designed for high availability and scalability using a modern tech stack:

### Core Components
- **Frontend**: Next.js (App Router) with Socket.IO client for real-time interaction.
- **Backend**: NestJS (Express-based) providing REST APIs and WebSocket gateways.
- **Database**: PostgreSQL managed via Prisma ORM for structured data storage.
- **In-Memory Store**: Redis for session management and real-time event synchronization.

### Scaling & High Availability
- **Redis Socket.IO Adapter**: Enables horizontal scaling by broadcasting WebSocket events across multiple server instances.
- **Stateless Sessions**: User sessions are stored in Redis (`connect-redis`), allowing any server instance to authenticate requests.
- **Database Migrations**: Automated schema management using Prisma.

---

## Local Development

### Prerequisites
- **Node.js**: v20 or higher
- **Docker**: For running infrastructure services (Postgres, Redis)
- **Make**: (Optional) For using the provided Makefile commands

### 1. Infrastructure Setup
Spin up the required services using Docker Compose:
```bash
make up
# Or: docker compose up -d
```
This starts:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **pgAdmin**: `localhost:5050` (Email: `admin@local.dev`, Pass: `admin`)
- **RedisInsight**: `localhost:5540`

### 2. Backend Setup (Server)
```bash
cd server
npm install
npm run prisma:generate
npx prisma migrate dev --name init
```

### 3. Frontend Setup (Client)
```bash
cd client
npm install
```

### 4. Running the Application
Open two terminals or use the Makefile:
```bash
# Terminal 1: Start Server
make server

# Terminal 2: Start Client
make client
```

### 5. Accessing the Apps
| Service | URL |
| :--- | :--- |
| **Client** | [http://localhost:3000](http://localhost:3000) |
| **Server** | [http://localhost:3001](http://localhost:3001) |
| **Health Check** | [http://localhost:3001/health](http://localhost:3001/health) |
| **pgAdmin** | [http://localhost:5050](http://localhost:5050) |
| **RedisInsight** | [http://localhost:5540](http://localhost:5540) |

---

## Production Deployment (Railway)

This project is configured for easy deployment on **Railway**.

### Steps:
1. Create a new project on Railway.
2. Add a **PostgreSQL** and **Redis** service.
3. Deploy the **Server**:
   - Point to the `server/` directory.
   - Railway will use `server/railway.json` for build/start commands.
4. Deploy the **Client**:
   - Point to the `client/` directory.
   - Railway will use `client/railway.json` for build/start commands.

---

## Environment Variables

### Server (`server/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port the server listens on | `3001` |
| `CLIENT_URL` | URL of the frontend (for CORS) | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SESSION_SECRET` | Secret key for signing sessions | `dev-secret` |
| `NODE_ENV` | Environment mode | `development` |

### Client (`client/.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SERVER_URL` | URL of the backend API | `http://localhost:3001` |

---

## Useful Commands

- `make up`: Start infrastructure containers.
- `make down`: Stop infrastructure containers.
- `make logs`: Follow container logs.
- `make migrate`: Run database migrations.
- `make server`: Start NestJS in dev mode.
- `make client`: Start Next.js in dev mode.
# opencode-chatting
