# Vehicle Fare BD

Community-driven vehicle fare estimator for Bangladesh. Combines city pricing rules with real-world submissions to help riders and drivers agree on fair fares.

## Features

- **Fare Estimator** - Calculate fares with time-of-day, weather, traffic, and luggage multipliers
- **Community Insights** - View aggregated stats (median, IQR) from real submissions
- **Fare Reporting** - Submit actual fares with spam controls and duplicate detection
- **Admin Panel** - Manage base fares, per-km rates, and time multipliers
- **Multi-language** - English and Bangla UI support

## User Flows

| Flow | Description | Auth Required |
|------|-------------|---------------|
| Estimate | Choose city, vehicle, distance, conditions | No |
| Report | Submit what you paid | Yes |
| Insights | View community stats by filters | No |
| Admin | Update pricing configurations | Admin |

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL + Prisma ORM v7
- **Auth**: NextAuth.js (credentials + optional Google OAuth)
- **Validation**: Zod
- **Testing**: Jest (unit), Playwright (e2e)

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Clone and install
git clone <repo-url>
cd vehicle-fare-bd
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: seed sample data

# Start development server
npm run dev
```

### Environment Variables

**Required:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/vehicle_fare"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

**Optional:**
```env
# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Fare calculation (defaults shown)
FARE_RAIN_MULTIPLIER="0.2"
FARE_TRAFFIC_MULTIPLIER="0.1"
FARE_LUGGAGE_MULTIPLIER="0.1"
FARE_TYPICAL_RANGE_PERCENT="0.15"

# Rate limiting (defaults shown)
MAX_REPORTS_PER_DAY="10"
DUPLICATE_WINDOW_MINUTES="10"
STATS_CACHE_DURATION_MINUTES="10"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Apply database migrations |
| `npm run prisma:seed` | Seed database with sample data |

## Docker

```bash
docker-compose up --build
```

Includes PostgreSQL and the app with sensible defaults. Update `DATABASE_URL` and `NEXTAUTH_SECRET` in your environment as needed.

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Utilities (fare calc, validation, auth)
└── types/         # TypeScript definitions

prisma/
├── schema.prisma  # Database schema
├── seed.ts        # Seed script
└── migrations/    # Migration files

docs/              # Documentation
tests/             # E2E tests
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | App structure, data flow, security |
| [Database](docs/database.md) | Prisma models and schema |
| [API](docs/api.md) | HTTP endpoints and responses |
| [Setup](docs/setup.md) | Detailed setup instructions |
| [Future](docs/future.md) | Roadmap and planned features |

## License

MIT
