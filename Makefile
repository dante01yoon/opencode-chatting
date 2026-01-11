SHELL := /bin/bash

.PHONY: up down logs server client migrate

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

server:
	cd server && npm run start:dev

client:
	cd client && npm run dev

migrate:
	cd server && npx prisma migrate dev --name init
