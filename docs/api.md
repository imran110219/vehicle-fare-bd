# API Reference

All endpoints are implemented in the Next.js App Router under `src/app/api`.

## Authentication

All API endpoints (except `/api/auth/*`) require authentication via NextAuth session cookies.

## Security Headers

All responses include security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## GET /api/insights

Returns community fare statistics for a given city, vehicle type, time of day, and distance bucket.

### Authentication
Required. Must be logged in.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | enum | Yes | City name (see values below) |
| `vehicleType` | enum | Yes | Vehicle type (see values below) |
| `timeOfDay` | enum | Yes | Time of day (MORNING, AFTERNOON, EVENING, NIGHT) |
| `distanceKm` | number | Yes | Distance in kilometers |

#### City Values
```
DHAKA, CHATTOGRAM, KHULNA, RAJSHAHI, SYLHET, GAZIPUR, NARAYANGANJ,
MYMENSINGH, BARISHAL, CUMILLA, RANGPUR, BOGURA, SAVAR, KUSHTIA,
JASHORE, TANGAIL, DINAJPUR, FENI, NOAKHALI, PABNA, OTHER
```

#### Vehicle Type Values
```
RICKSHAW, CNG, AUTO_RICKSHAW, BIKE, CAR, MICROBUS, BUS, OTHER
```

### Response

**Success (200)**
```json
{
  "id": "clx...",
  "city": "DHAKA",
  "vehicleType": "RICKSHAW",
  "bucket": "KM_2_3",
  "timeOfDay": "MORNING",
  "medianFare": 90,
  "iqrLow": 75,
  "iqrHigh": 110,
  "count": 24,
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**No Data (200)**
```json
null
```

### Errors

| Status | Description |
|--------|-------------|
| 400 | Missing or invalid query parameters |
| 401 | Unauthorized (not logged in) |

### Example

```bash
curl -X GET "http://localhost:3000/api/insights?city=DHAKA&vehicleType=RICKSHAW&timeOfDay=MORNING&distanceKm=2.5" \
  -H "Cookie: next-auth.session-token=..."
```

---

## /api/auth/[...nextauth]

NextAuth.js authentication handler supporting:
- **Credentials**: Email + password login
- **Google OAuth**: Optional (requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/signin` | Sign-in page |
| GET | `/api/auth/signout` | Sign-out page |
| POST | `/api/auth/callback/credentials` | Credentials login |
| GET/POST | `/api/auth/callback/google` | Google OAuth callback |
| GET | `/api/auth/session` | Get current session |
| GET | `/api/auth/csrf` | Get CSRF token |

### Session Object

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "role": "USER"
  },
  "expires": "2024-02-15T10:30:00.000Z"
}
```

### Roles
- `USER` - Standard user (can submit reports, view insights)
- `ADMIN` - Administrator (can manage fare configs)

---

## Rate Limiting

Currently implemented at application level:
- **Reports**: Max 10 per user per day (Bangladesh timezone)
- **Duplicate detection**: 10-minute window for identical submissions

These values are configurable via environment variables:
- `MAX_REPORTS_PER_DAY`
- `DUPLICATE_WINDOW_MINUTES`
