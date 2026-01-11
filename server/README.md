# Chat Server (NestJS + Socket.IO)

## Requirements
- Node.js 20+
- PostgreSQL (Railway Postgres)
- Redis (Railway Redis)

## Environment
Create a `.env` with:
```
PORT=3001
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
REDIS_URL=redis://HOST:PORT
SESSION_SECRET=change-me
NODE_ENV=development
```

## Setup
```
npm install
npm run prisma:generate
```

## Database
Generate and apply migrations after setting `DATABASE_URL`:
```
npx prisma migrate dev --name init
```

## Run
```
# dev
npm run start:dev

# prod
npm run build
npm run start:prod
```

## HTTP Endpoints
- `POST /auth/session` (body: `{ nickname }`)
- `GET /auth/session`
- `GET /rooms`
- `POST /rooms` (requires session)
- `GET /rooms/:roomId/messages` (requires membership)
- `GET /health`

## Socket Events
- `room:create` `{ name }`
- `room:join` `{ roomId }`
- `room:leave` `{ roomId }`
- `message:send` `{ roomId, content }`

Server emits:
- `room:created`
- `user:join`
- `user:leave`
- `message:new`
