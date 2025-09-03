# CollabSpace Development Makefile

.PHONY: help build start stop clean test logs shell migrate seed backup deploy

# Default target
help:
	@echo "CollabSpace Development Commands:"
	@echo ""
	@echo "  make build     - Build all Docker images"
	@echo "  make start     - Start all services"
	@echo "  make stop      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make clean     - Clean up containers and volumes"
	@echo "  make logs      - Show logs from all services"
	@echo "  make test      - Run all tests"
	@echo "  make shell     - Open bash shell in backend container"
	@echo "  make migrate   - Run database migrations"
	@echo "  make seed      - Seed database with sample data"
	@echo "  make backup    - Backup database"
	@echo "  make deploy    - Deploy to production"
	@echo ""

# Build all images
build:
	@echo "Building all Docker images..."
	docker-compose build --parallel

# Start all services
start:
	@echo "Starting CollabSpace services..."
	docker-compose up -d
	@echo "Services starting... Check status with 'make logs'"

# Start with build
start-build: build start

# Stop all services
stop:
	@echo "Stopping CollabSpace services..."
	docker-compose down

# Restart services
restart: stop start

# Clean up everything
clean:
	@echo "Cleaning up containers, networks, and volumes..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Show logs
logs:
	docker-compose logs -f

# Show logs for specific service
logs-backend:
	docker-compose logs -f backend-java

logs-frontend:
	docker-compose logs -f frontend

logs-ai:
	docker-compose logs -f ai-service

logs-websocket:
	docker-compose logs -f realtime-engine

# Open bash shell in backend
shell:
	docker-compose exec backend-java bash

# Run database migrations
migrate:
	@echo "Running database migrations..."
	docker-compose exec backend-java java -jar app.jar --migrate

# Seed database with sample data
seed:
	@echo "Seeding database with sample data..."
	docker-compose exec postgres psql -U postgres -d collabspace -f /docker-entrypoint-initdb.d/dev_data.sql

# Backup database
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres collabspace > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Run all tests
test:
	@echo "Running backend tests..."
	cd backend-java && ./mvnw test
	@echo "Running frontend tests..."
	cd frontend && npm test -- --coverage
	@echo "Running AI service tests..."
	cd ai-service && python -m pytest
	@echo "Running WebSocket tests..."
	cd realtime-engine && npm test

# Integration tests
test-integration:
	@echo "Running integration tests..."
	docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit

# Check health of all services
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8080/actuator/health | jq .
	@curl -s http://localhost:5000/health | jq .
	@curl -s http://localhost:3001/health | jq .

# Development setup
dev-setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	cp frontend/.env.example frontend/.env
	cp realtime-engine/.env.example realtime-engine/.env
	@echo "Please edit .env files with your configuration"

# Production deployment
deploy:
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d --build

# Monitor services
monitor:
	@echo "Opening monitoring dashboards..."
	open http://localhost:9090  # Prometheus
	open http://localhost:3001  # Grafana

# Database operations
db-reset:
	@echo "Resetting database..."
	docker-compose down postgres
	docker volume rm collabspace_postgres_data
	docker-compose up -d postgres
	sleep 10
	make migrate
	make seed

# Check all dependencies
check-deps:
	@echo "Checking dependencies..."
	@command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed. Aborting." >&2; exit 1; }
	@echo "All dependencies satisfied!"

# Quick development start
quick-start: check-deps dev-setup start-build
	@echo "CollabSpace is starting up..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8080"
	@echo "Monitoring: http://localhost:9090"
	@echo ""
	@echo "Run 'make logs' to see service logs"
