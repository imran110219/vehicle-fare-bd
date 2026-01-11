# Architecture

## High-Level
- Next.js App Router with server components
- Prisma Client for database access
- NextAuth for authentication

## Key Pages
- `/` - estimator UI (server fetch of city configs, client estimator)
- `/report` - server action for fare submission (auth required)
- `/insights` - community stats explorer
- `/admin` - city pricing updates (admin only)
- `/profile` - user submissions list

## Data Flow
1) Estimator loads vehicle pricing from `VehicleFareConfig`.
2) Fare is calculated in `src/lib/fare.ts`.
3) Community insights are read from `DistanceBucketStat`, refreshed from `FareReport` when stale.

## Server Actions
- Fare report submission and admin updates are server actions, guarded by auth checks.

## Caching
- `DistanceBucketStat` stores a rolling 10-minute cache of community stats.
