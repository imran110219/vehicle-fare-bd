# Database

## Prisma Config
Prisma is configured via `prisma.config.ts` (Prisma 7). The schema lives at `prisma/schema.prisma`.

## Models
### User
- Core account identity with role (`USER`, `ADMIN`).

### Account / Session / VerificationToken
- NextAuth tables for provider accounts and sessions.

### VehicleType
- Enum defining supported vehicle types across configs and reports.

### VehicleFareConfig
- Per-city + vehicle pricing rules: base fare, per-km rate, and time-of-day multipliers.

### FareReport
- User-submitted fares with distance, fare paid, vehicle type, and conditions.
- Duplicate checks and daily rate limiting are enforced at the app layer.

### DistanceBucketStat
- Aggregated community stats by city, vehicle type, distance bucket, and time of day.
- Updated when fresh data is required.

## Indexes and Constraints
- Composite unique key on `VehicleFareConfig (city, vehicleType)`.
- Composite unique key on `DistanceBucketStat (city, vehicleType, bucket, timeOfDay)`.
- Indexes on `FareReport` for city and distance bucket queries.
