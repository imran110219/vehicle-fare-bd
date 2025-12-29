# Setup

## Prerequisites
- Node.js 18+
- Postgres 14+

## Environment Variables
Create a `.env` file at the project root.

Required:
- `DATABASE_URL` - Postgres connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Base URL for NextAuth callbacks

Optional:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - enable Google login
- `ALLOW_NOMINATIM` - set to `true` to enable geocoding
- `NOMINATIM_BASE_URL` - override Nominatim host
- `ALLOW_OSRM` - set to `true` to enable OSRM routing

## Local Development
```
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Database Seed
```
npm run prisma:seed
```

## Docker
```
docker-compose up --build
```

The Docker setup includes Postgres and the app with sensible defaults. Update `DATABASE_URL` and `NEXTAUTH_SECRET` as needed.
