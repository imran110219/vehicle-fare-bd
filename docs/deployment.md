# Deployment Guide

This guide covers deploying Vehicle Fare BD to production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Vercel Deployment](#vercel-deployment)
- [Docker Production](#docker-production)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Performance Optimization](#performance-optimization)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Quick Start

**Recommended deployment options:**

| Option | Best For | Difficulty | Cost |
|--------|----------|------------|------|
| Vercel + Neon | Quick MVP, auto-scaling | Easy | Free tier available |
| Docker + VPS | Full control, cost-effective | Medium | ~$5-20/month |
| AWS/GCP/Azure | Enterprise, high traffic | Hard | Variable |

## Vercel Deployment

Vercel is the recommended platform for Next.js applications (zero-config deployment).

### Prerequisites

- Vercel account (free tier available)
- PostgreSQL database (Neon, Supabase, or RDS)

### Step 1: Prepare Database

**Option A: Neon (Serverless PostgreSQL)**

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string (starts with `postgresql://`)

**Option B: Supabase**

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database > Connection string (Direct connection)

**Option C: Self-hosted/RDS**

Ensure your database is accessible from the internet with proper firewall rules.

### Step 2: Deploy to Vercel

#### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables (see Environment Variables section)
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Promote to production
vercel --prod
```

#### Via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Step 3: Run Migrations

```bash
# Install Prisma CLI globally or use npx
npm i -g prisma

# Set DATABASE_URL locally
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Optional: seed database
npx prisma db seed
```

### Step 4: Create Admin User

```bash
# Connect to your production database
psql $DATABASE_URL -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your-admin@example.com';"
```

### Vercel Configuration

Create `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

**Notes:**
- Vercel automatically detects Next.js
- Use Vercel Postgres for built-in database
- Enable "Serverless Function Region" close to your users
- Free tier: 100GB bandwidth, unlimited requests

## Docker Production

Deploy using Docker for full control and portability.

### Prerequisites

- Docker and Docker Compose installed
- VPS or cloud instance (DigitalOcean, Linode, AWS EC2, etc.)
- Domain name (optional but recommended)

### Step 1: Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: "3.9"

services:
  db:
    image: postgres:15-alpine
    container_name: vehicle_db_prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: vehicle_app_prod
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      # Add other env vars
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: vehicle_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - app_network

volumes:
  postgres_data:

networks:
  app_network:
    driver: bridge
```

### Step 2: Create Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
# Multi-stage build for smaller image size
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.mjs`:

```javascript
export default {
  output: 'standalone', // Required for Docker
  // ... rest of config
}
```

### Step 3: Create Nginx Configuration

Create `nginx.conf`:

```nginx
events {
  worker_connections 1024;
}

http {
  upstream nextjs {
    server app:3000;
  }

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
  limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

  server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Client upload limit
    client_max_body_size 10M;

    location / {
      limit_req zone=general burst=20 nodelay;
      proxy_pass http://nextjs;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
      limit_req zone=api burst=5 nodelay;
      proxy_pass http://nextjs;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static/ {
      proxy_pass http://nextjs;
      proxy_cache_valid 200 365d;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

### Step 4: Deploy

```bash
# On your server
git clone <your-repo-url>
cd vehicle-fare-bd

# Create .env file
cp .env.example .env
# Edit .env with production values

# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
```

## Manual Deployment

Deploy directly to a VPS without Docker.

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (process manager)

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Setup Database

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE vehicle_fare;
CREATE USER vehicle_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE vehicle_fare TO vehicle_user;
\q
```

### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> vehicle-fare-bd
cd vehicle-fare-bd

# Install dependencies
npm ci --only=production

# Setup environment
sudo cp .env.example .env
sudo nano .env  # Edit with production values

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start npm --name "vehicle-fare" -- start
pm2 save
pm2 startup  # Follow instructions to enable startup on boot
```

### Step 4: Configure Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/vehicle-fare
```

Add configuration (use the nginx.conf template above).

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vehicle-fare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables

### Required (Production)

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require"

# Auth
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://yourdomain.com"

# Node environment
NODE_ENV="production"
```

### Optional (Production)

```env
# OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Feature flags
ALLOW_NOMINATIM="true"
ALLOW_OSRM="true"
NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"

# Fare calculation (use defaults or customize)
FARE_RAIN_MULTIPLIER="0.2"
FARE_TRAFFIC_MULTIPLIER="0.1"
FARE_LUGGAGE_MULTIPLIER="0.1"
FARE_TYPICAL_RANGE_PERCENT="0.15"

# Caching and rate limiting
STATS_CACHE_DURATION_MINUTES="15"  # Increase for production
MAX_REPORTS_PER_DAY="10"
DUPLICATE_WINDOW_MINUTES="10"

# Monitoring (optional)
SENTRY_DSN="https://..."
```

### Security Best Practices

- **Never commit** `.env` files to version control
- **Use secrets management** (AWS Secrets Manager, Vault, Vercel Secrets)
- **Rotate secrets** regularly
- **Use strong passwords** for database (20+ characters)
- **Enable SSL/TLS** for database connections
- **Restrict database access** by IP whitelist

## Database Setup

### Connection Pooling

For serverless/Vercel deployments, use connection pooling:

**Neon:**
```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require&pooler=true"
```

**PgBouncer (self-hosted):**
```bash
# Install PgBouncer
sudo apt install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
vehicle_fare = host=localhost port=5432 dbname=vehicle_fare

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

Update `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:6432/vehicle_fare"
```

### Backups

**Automated backups (cron job):**

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/vehicle-fare"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-db.sh
```

### Migrations

**Production migration strategy:**

```bash
# 1. Backup database first
pg_dump $DATABASE_URL > backup_pre_migration.sql

# 2. Run migrations
npx prisma migrate deploy

# 3. Verify application health
curl -f https://yourdomain.com/api/health || echo "Health check failed"

# 4. Rollback if needed
psql $DATABASE_URL < backup_pre_migration.sql
```

## Post-Deployment

### Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

### Create Admin User

```bash
# Via SQL
psql $DATABASE_URL -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'admin@example.com';"

# Or via Prisma Studio
npx prisma studio
# Navigate to User table, edit role field
```

### Seed Production Data (Optional)

```bash
# Seed with sample fare configs
npx prisma db seed

# Or manually via admin panel at /admin
```

## Performance Optimization

### Next.js Optimizations

**Enable output: 'standalone'** in `next.config.mjs`:
```javascript
export default {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  // ... other config
}
```

### Database Optimizations

**Add indexes** (already in schema):
```prisma
@@index([city])
@@index([city, createdAt])
@@index([city, distanceKm])
```

**Connection pooling** (see Database Setup section)

### Caching Strategy

**Increase cache duration** for production:
```env
STATS_CACHE_DURATION_MINUTES="30"  # vs 10 in dev
```

**Enable Vercel Edge Caching:**
```typescript
// In API routes
export const revalidate = 600; // Cache for 10 minutes
```

### CDN Configuration

**Vercel** automatically serves assets via CDN.

**For self-hosted:**
- Use Cloudflare for free CDN + DDoS protection
- Configure Nginx caching for static assets (see nginx.conf)

## Monitoring

### Application Monitoring

**Sentry (Error Tracking):**

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Infrastructure Monitoring

**Uptime monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Server monitoring (for VPS):**
```bash
# Install Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

Access at `http://your-server-ip:19999`

### Logs

**View logs:**

```bash
# PM2
pm2 logs vehicle-fare

# Docker
docker-compose logs -f app

# System logs
journalctl -u nginx -f
```

**Structured logging:**

Install winston:
```bash
npm install winston
```

Create `src/lib/logger.ts`:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

## Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Database connection issues:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Prisma connection
npx prisma db pull
```

**Out of memory:**

Increase Node.js memory:
```bash
# In package.json scripts
"start": "NODE_OPTIONS='--max-old-space-size=4096' next start"
```

**Prisma client not generated:**
```bash
npx prisma generate
```

**Migration failures:**
```bash
# Check migration status
npx prisma migrate status

# Reset (WARNING: deletes data)
npx prisma migrate reset

# Or apply specific migration
npx prisma migrate resolve --applied "20231201_migration_name"
```

### Performance Issues

**Slow database queries:**
```bash
# Enable query logging in PostgreSQL
# Edit /etc/postgresql/*/main/postgresql.conf
log_min_duration_statement = 100  # Log queries > 100ms

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**High memory usage:**
- Reduce connection pool size
- Enable streaming for large queries
- Optimize Prisma queries (use `select` to fetch specific fields)

**Slow page loads:**
- Enable Next.js compression
- Optimize images (use next/image)
- Enable CDN caching
- Minimize client-side JavaScript

### Security Checklist

- [ ] SSL/TLS enabled (HTTPS)
- [ ] Environment variables secured
- [ ] Database has strong password
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key-based authentication enabled
- [ ] Regular security updates applied
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Content Security Policy headers set
- [ ] Secrets rotated regularly

---

## Next Steps

After deployment:

1. **Test all functionality** on production URL
2. **Monitor logs** for errors
3. **Setup alerts** for downtime
4. **Document runbook** for common issues
5. **Schedule regular backups**
6. **Plan scaling strategy** as traffic grows

For questions or issues, check the main [README](../README.md) or open an issue on GitHub.
