# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Next.js 15 (App Router), Tailwind CSS |
| Backend | Next.js API Routes, Server Actions, Server Components |
| Database | PostgreSQL with Prisma ORM v7 |
| Authentication | NextAuth.js v4 (Credentials + Google OAuth) |
| Validation | Zod |
| Testing | Jest (unit), Playwright (e2e) |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home (fare estimator)
│   ├── layout.tsx          # Root layout with providers
│   ├── report/             # Fare submission (auth required)
│   ├── profile/            # User's submitted reports
│   ├── insights/           # Community stats explorer
│   ├── admin/              # Pricing config (admin only)
│   ├── login/              # Sign in page
│   ├── register/           # Sign up page
│   └── api/
│       ├── auth/           # NextAuth handler
│       └── insights/       # Community stats API
├── components/
│   ├── EstimatorClient.tsx # Interactive fare calculator
│   ├── Nav.tsx             # Navigation with auth status
│   ├── LanguageToggle.tsx  # EN/BN language switcher
│   └── Providers.tsx       # SessionProvider wrapper
├── lib/
│   ├── fare.ts             # Fare calculation logic
│   ├── stats.ts            # Community stats computation
│   ├── buckets.ts          # Distance bucket mapping
│   ├── config.ts           # Environment-based configuration
│   ├── auth.ts             # NextAuth configuration
│   ├── validation.ts       # Zod schemas
│   ├── prisma.ts           # Prisma client singleton
│   ├── profanity.ts        # Content filtering
│   ├── rateLimit.ts        # BD timezone utilities
│   ├── i18n.ts             # Internationalization
│   └── __tests__/          # Unit tests
└── types/
    └── next-auth.d.ts      # NextAuth type extensions
```

## Page Architecture

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Server + Client | No | Fare estimator with client-side interactivity |
| `/report` | Server Action | User | Submit fare reports |
| `/profile` | Server | User | View submitted reports (paginated) |
| `/insights` | Server | No | Community stats explorer |
| `/admin` | Server Action | Admin | Manage fare configurations (paginated) |
| `/login` | Server | No | Credentials sign in |
| `/register` | Server Action | No | User registration |

## Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  VehicleFare    │     │   FareReport     │     │ DistanceBucket  │
│    Config       │     │                  │     │     Stat        │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Prisma ORM                              │
└─────────────────────────────────────────────────────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Estimator     │     │  Report Page     │     │   Insights      │
│   (fare.ts)     │     │  (server action) │     │   (stats.ts)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Fare Estimation Flow

1. Home page fetches `VehicleFareConfig` for all cities (server)
2. `EstimatorClient` renders interactive form (client)
3. `calculateFare()` computes estimate using config + multipliers
4. Optional: fetches community stats from `/api/insights` (auth) or `/api/insights/public` (unauth)

### Report Submission Flow

1. User fills fare report form
2. Server action validates with Zod schema
3. Profanity filter checks text fields
4. Rate limit check (max per day)
5. Duplicate detection (10-min window)
6. Computes estimate snapshot and creates `FareReport` record
7. Redirects to profile page

### Community Stats Flow

1. Request arrives at `/api/insights` (auth) or `/api/insights/public` (unauth)
2. Public endpoint enforces k-anonymity (count >= 5)
3. Check `DistanceBucketStat` cache
4. If fresh (< configurable minutes): return cached
5. If stale: recompute from `FareReport` data
6. Update cache and return

## Authentication

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   NextAuth   │────▶│   Prisma     │
│   (cookies)  │◀────│   (JWT)      │◀────│   (User)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

- **Strategy**: JWT-based sessions
- **Providers**: Credentials (email/password), Google OAuth (optional)
- **Roles**: `USER`, `ADMIN`
- **Password**: bcrypt with 10 salt rounds

## Configuration

Environment-based configuration via `src/lib/config.ts`:

| Variable | Default | Description |
|----------|---------|-------------|
| `FARE_RAIN_MULTIPLIER` | 0.2 | Added to multiplier when raining |
| `FARE_TRAFFIC_MULTIPLIER` | 0.1 | Added for heavy traffic |
| `FARE_LUGGAGE_MULTIPLIER` | 0.1 | Added for luggage |
| `FARE_TYPICAL_RANGE_PERCENT` | 0.15 | ±% for typical range |
| `STATS_CACHE_DURATION_MINUTES` | 10 | Community stats cache TTL |
| `MAX_REPORTS_PER_DAY` | 10 | Rate limit per user |
| `DUPLICATE_WINDOW_MINUTES` | 10 | Duplicate detection window |

## Security

### Headers (via `next.config.mjs`)
- Content-Security-Policy
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection

### Application Security
- Server-side validation (Zod schemas)
- SQL injection protection (Prisma ORM)
- XSS protection (React auto-escaping)
- CSRF protection (NextAuth)
- Password hashing (bcrypt)
- Profanity filtering (bad-words)
- Rate limiting (per-user daily)

## Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|----------------|-----|--------------|
| Community Stats | `DistanceBucketStat` table | Configurable (default 10 min) | On new reports |
| Session | JWT cookie | NextAuth default | On logout |
| Fare Configs | None (always fresh) | N/A | N/A |

## Database Indexes

Optimized queries via Prisma indexes:

```prisma
VehicleFareConfig @@index([city])
FareReport        @@index([city, createdAt])
FareReport        @@index([city, distanceKm])
```

## Testing Architecture

```
tests/
├── src/lib/__tests__/     # Unit tests (Jest)
│   ├── fare.test.ts
│   ├── validation.test.ts
│   ├── profanity.test.ts
│   └── ...
└── tests/e2e/             # E2E tests (Playwright)
    └── smoke.spec.ts
```

Run tests:
```bash
npm test          # Unit tests
npm run test:e2e  # E2E tests
```
