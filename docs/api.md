# API

All endpoints are implemented in the Next.js App Router under `src/app/api`.

## GET /api/insights
Returns community stats for a city/vehicle/time/distance.

Query params:
- `city` (enum)
- `vehicleType` (enum)
- `timeOfDay` (enum)
- `distanceKm` (number)

Response:
```
{ "medianFare": 90, "iqrLow": 75, "iqrHigh": 110, "count": 24 }
```

Errors:
- 400 if params are missing

## /api/auth
NextAuth handler for credentials and optional Google login.
