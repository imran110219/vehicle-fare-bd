# Architecture

## High-Level
- Next.js App Router with server components
- Prisma Client for database access
- NextAuth for authentication
- MapLibre GL for map interactions

## Key Pages
- `/` - estimator UI (server fetch of city configs, client estimator)
- `/report` - server action for fare submission (auth required)
- `/insights` - community stats explorer
- `/admin` - city pricing updates (admin only)
- `/profile` - user submissions list

## Data Flow
1) Estimator loads city pricing from `CityConfig`.
2) Distance is computed from OSRM or haversine fallback.
3) Fare is calculated in `src/lib/fare.ts`.
4) Community insights are read from `DistanceBucketStat`, refreshed from `FareReport` when stale.

## Server Actions
- Fare report submission and admin updates are server actions, guarded by auth checks.

## Caching
- `DistanceBucketStat` stores a rolling 10-minute cache of community stats.
- `GeocodeCache` stores geocoding lookups keyed by query.
