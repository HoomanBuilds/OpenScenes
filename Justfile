# List available recipes
default:
    @just --list

# --- Development ---

# Run Next.js development server
dev:
    npm run dev

# Run video render worker
worker-render:
    npm run worker:render

# Run AI generation worker
worker-ai:
    npm run worker:ai

# Run all workers concurrently
workers:
    bash scripts/workers.sh

# Start infrastructure (Docker)
infra-up:
    docker-compose up -d
    @echo "Infrastructure started!"

# Stop infrastructure
infra-down:
    docker-compose down
    @echo "Infrastructure stopped."

# View infrastructure logs
infra-logs:
    docker-compose logs -f

# --- Database ---

# Reset database (careful!)
db-reset:
    npx prisma migrate reset

# Open Prisma Studio
db-studio:
    npx prisma studio

# --- Setup ---

# Install dependencies
install:
    npm install

# Check types and lint
check:
    npm run lint
    npx tsc --noEmit
