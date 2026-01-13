# Clubes - Automation Tasks (Docker Optimized)

.PHONY: help dev build db-generate db-migrate-dev db-migrate-prod db-seed up down logs deploy

help:
	@echo "Available commands:"
	@echo "  dev             - Start local development server (alias for up)"
	@echo "  up              - Start local services with Docker Compose"
	@echo "  down            - Stop local services"
	@echo "  logs            - Show Docker logs"
	@echo "  build           - Run build inside container"
	@echo "  db-generate     - Generate Prisma Client inside container"
	@echo "  db-migrate-dev  - Run Prisma migrations inside container"
	@echo "  db-migrate-prod - Run Prisma migrations for production (requires DATABASE_URL & DIRECT_URL)"
	@echo "  db-seed         - Seed the database inside container"
	@echo "  db-cleanup      - Cleanup the local database (preserving SUPER_ADMIN)"
	@echo "  db-cleanup-prod - Cleanup the production database (preserving SUPER_ADMIN)"
	@echo "  deploy          - Push changes to origin main (triggers Vercel build)"

dev: up

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

build:
	docker-compose exec app npm run build

db-generate:
	docker-compose exec app npx prisma generate

db-migrate-dev:
	docker-compose exec app npx prisma migrate dev

db-migrate-prod:
	@if [ -z "$$DATABASE_URL" ] || [ -z "$$DIRECT_URL" ]; then \
		echo "Error: DATABASE_URL and DIRECT_URL must be set as environment variables."; \
		echo "Usage: DATABASE_URL=\"...\" DIRECT_URL=\"...\" make db-migrate-prod"; \
		exit 1; \
	fi
	npx prisma migrate deploy

db-seed:
	docker-compose exec app npx prisma db seed

db-cleanup:
	docker-compose exec app npx ts-node prisma/cleanup.ts

db-cleanup-prod:
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "Error: DATABASE_URL must be set as an environment variable."; \
		echo "Usage: DATABASE_URL=\"...\" make db-cleanup-prod"; \
		exit 1; \
	fi
	NODE_TLS_REJECT_UNAUTHORIZED=0 npx ts-node prisma/cleanup.ts

deploy:
	git push origin main
