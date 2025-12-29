# Database

## Prisma Config
Prisma is configured via `prisma.config.ts` (Prisma 7). The schema lives at `prisma/schema.prisma`.

## Models
### User
- Core account identity with role (`USER`, `ADMIN`).

### Account / Session / VerificationToken
- NextAuth tables for provider accounts and sessions.

### CityConfig
- Per-city pricing rules: base fare and per-km rate.

### FareReport
- User-submitted fares with distance, fare paid, conditions, and optional coordinates.
- Duplicate checks and daily rate limiting are enforced at the app layer.

### GeocodeCache
- Cached geocoding results keyed by normalized query.

### DistanceBucketStat
- Aggregated community stats by city, distance bucket, and time of day.
- Updated when fresh data is required.

## Indexes and Constraints
- Unique city in `CityConfig`.
- Composite unique key on `DistanceBucketStat (city, bucket, timeOfDay)`.
- Indexes on `FareReport` for city and distance bucket queries.
