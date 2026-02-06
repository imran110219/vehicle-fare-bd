# Setup Guide

Detailed setup instructions for Vehicle Fare BD. For quick start, see the [README](../README.md).

## Prerequisites

- **Node.js** 18+ (recommended: use nvm)
- **PostgreSQL** 14+ (or use Docker)
- **npm** 9+ (comes with Node.js)

## Database Setup

### Option 1: Local PostgreSQL

```bash
# Create database
createdb vehicle_fare

# Or via psql
psql -c "CREATE DATABASE vehicle_fare;"
```

### Option 2: Docker PostgreSQL

```bash
docker run -d \
  --name vehicle-fare-db \
  -e POSTGRES_PASSWORD=12345678 \
  -e POSTGRES_DB=vehicle_fare \
  -p 5432:5432 \
  postgres:14
```

### Option 3: Full Docker Compose

```bash
docker-compose up -d
```

This starts both PostgreSQL and the Next.js app.

## Environment Configuration

Copy the example file and configure:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:12345678@localhost:5432/vehicle_fare` |
| `NEXTAUTH_SECRET` | Random string for JWT signing | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |
| `FARE_RAIN_MULTIPLIER` | Multiplier added for rain | `0.2` |
| `FARE_TRAFFIC_MULTIPLIER` | Multiplier added for traffic | `0.1` |
| `FARE_LUGGAGE_MULTIPLIER` | Multiplier added for luggage | `0.1` |
| `FARE_TYPICAL_RANGE_PERCENT` | ± percentage for typical range | `0.15` |
| `STATS_CACHE_DURATION_MINUTES` | Community stats cache TTL | `10` |
| `MAX_REPORTS_PER_DAY` | Rate limit per user | `10` |
| `DUPLICATE_WINDOW_MINUTES` | Duplicate detection window | `10` |

## Database Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Optional: seed with sample data
npm run prisma:seed
```

### Reset Database

```bash
# Drop all tables and re-migrate
npx prisma migrate reset
```

## Running the App

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production

```bash
npm run build
npm run start
```

## Testing

```bash
# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# E2E tests (requires running app)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Creating an Admin User

After registration, promote a user to admin via database:

```bash
psql $DATABASE_URL -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'admin@example.com';"
```

Or via Prisma Studio:

```bash
npx prisma studio
```

Navigate to User table, find the user, change `role` to `ADMIN`.

## Troubleshooting

### Prisma Client Issues

```bash
# Regenerate client after schema changes
npm run prisma:generate
```

### Database Connection Errors

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` format
3. Ensure database exists

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Migration Conflicts

```bash
# Reset and re-run migrations
npx prisma migrate reset
```
