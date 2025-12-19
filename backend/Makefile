.PHONY: dev run build migrate seed fresh clean

# Development with hot reload (requires air)
dev:
	air

# Run the server
run:
	go run cmd/server/main.go

# Build binary
build:
	go build -o bin/server cmd/server/main.go

# Run migrations only
migrate:
	go run cmd/server/main.go migrate

# Run migrations + seed
seed:
	go run cmd/server/main.go seed

# Fresh: Drop all tables, migrate, and seed
fresh:
	go run cmd/server/main.go fresh

# Install dependencies
deps:
	go mod tidy
	go mod download

# Clean build artifacts
clean:
	rm -rf bin/
	rm -rf tmp/

# Create database (PostgreSQL)
createdb:
	createdb hsr_tools

# Drop database
dropdb:
	dropdb hsr_tools

# Format code
fmt:
	go fmt ./...

# Run tests
test:
	go test -v ./...
