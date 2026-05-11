.PHONY: start dev stop reset db-setup clean

# Start everything from scratch (initial setup)
start:
	@echo "Starting app..."
	@echo "📦 Starting PostgreSQL container..."
	docker-compose up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 5
	@echo "🔧 Generating Prisma client..."
	pnpm exec prisma generate
	@echo "📊 Running database migrations..."
	pnpm exec prisma migrate dev --name init
	@echo "🌱 Seeding database..."
	pnpm exec prisma db seed
	@echo "✅ Setup complete!"
	@echo "🎯 Starting development server..."
	pnpm dev

# Just start the dev server (assumes DB is already set up)
dev:
	@echo "🎯 Starting development server..."
	pnpm dev

# Set up database only (useful for resets)
db-setup:
	@echo "📦 Starting PostgreSQL container..."
	docker-compose up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 5
	@echo "🔧 Generating Prisma client..."
	pnpm exec prisma generate
	@echo "📊 Running database migrations..."
	pnpm exec prisma migrate dev --name init
	@echo "🌱 Seeding database..."
	pnpm exec prisma db seed
	@echo "✅ Database setup complete!"

# Reset database (drops and recreates)
reset:
	@echo "🔄 Resetting database..."
	pnpm exec prisma migrate reset --force
	@echo "✅ Database reset complete!"

# Stop all Docker containers
stop:
	@echo "🛑 Stopping containers..."
	docker-compose down
	@echo "✅ Containers stopped!"

# Clean everything (containers, volumes, node_modules)
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	rm -rf node_modules
	rm -rf .next
	@echo "✅ Cleanup complete!"

# View logs
logs:
	docker-compose logs -f

# Open Prisma Studio
studio:
	pnpm exec prisma studio

# Help
help:
	@echo "Available commands:"
	@echo "  make start    - Initial setup and start (first time use)"
	@echo "  make dev      - Start development server"
	@echo "  make db-setup - Set up database only"
	@echo "  make reset    - Reset database"
	@echo "  make stop     - Stop Docker containers"
	@echo "  make clean    - Clean everything"
	@echo "  make logs     - View Docker logs"
	@echo "  make studio   - Open Prisma Studio"
