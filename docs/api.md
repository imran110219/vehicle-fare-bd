# API

All endpoints are implemented in the Next.js App Router under `src/app/api`.

## GET /api/estimate
Computes distance between pickup and drop coordinates.

Query params:
- `pickupLat` (number)
- `pickupLng` (number)
- `dropLat` (number)
- `dropLng` (number)

Response:
```
{ "distanceKm": 5.2, "note": "OSRM routing estimate" }
```

Errors:
- 400 if any coordinates are missing or invalid

## GET /api/geocode
Geocodes a text query and caches the result.

Query params:
- `query` (string)

Response:
```
{ "lat": 23.81, "lng": 90.41, "displayName": "Dhaka, Bangladesh" }
```

Errors:
- 400 if query is missing
- 503 if geocoding is disabled (`ALLOW_NOMINATIM` not `true`)
- 500 if the upstream provider fails
- 404 if no results

## GET /api/insights
Returns community stats for a city/time/distance.

Query params:
- `city` (enum)
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
