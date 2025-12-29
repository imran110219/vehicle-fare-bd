# Rickshaw Fare BD

Community-driven rickshaw fare estimator for Bangladesh. It combines city pricing rules, optional routing, and real-world submissions to help riders and drivers agree on fair fares.

## Features
- Fare estimator with time-of-day, weather, traffic, and luggage multipliers
- Map-based pickup/drop selection with distance estimation
- Community insights from real submissions (median and IQR)
- Authenticated fare reporting with basic spam controls
- Admin view to update city pricing configs
- English/Bangla UI labels

## Tech Stack
- Next.js App Router (React 18)
- Prisma ORM + Postgres
- NextAuth (credentials + optional Google)
- MapLibre GL
- Zod for validation

## Quick Start
1) Install dependencies
```
npm install
```

2) Create a `.env` file (example)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rickshaw_fare
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
ALLOW_NOMINATIM=false
ALLOW_OSRM=false
```

3) Generate Prisma client and run migrations
```
npm run prisma:generate
npm run prisma:migrate
```

4) Start the dev server
```
npm run dev
```

## Documentation
- `docs/index.md`
- `docs/overview.md`
- `docs/setup.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/future.md`

## Scripts
- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - apply migrations
- `npm run prisma:seed` - seed database
- `npm run test` - unit tests
- `npm run test:e2e` - Playwright e2e tests

## Docker
A basic `docker-compose.yml` is included for local Postgres and the app.
```
docker-compose up --build
```
