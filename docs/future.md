# Future Roadmap

## High Priority

### Security & Infrastructure
- [ ] IP-based rate limiting (Redis-backed for distributed deployments)
- [ ] Audit logging for admin actions (who changed what, when)
- [ ] Health check endpoint for container orchestration
- [ ] CI/CD pipeline (GitHub Actions for lint, test, build, deploy)

### Data Quality
- [ ] Location validation via Nominatim integration (env vars configured but unused)
- [ ] Fuzzy duplicate detection with distance/fare tolerance
- [ ] Bangla profanity filtering support

### User Experience
- [ ] Loading states and error handling in EstimatorClient
- [ ] Confirmation dialogs for admin bulk changes
- [ ] Form field labels and accessibility improvements

## Medium Priority

### Admin & Moderation
- [ ] Admin dashboard with analytics and charts
- [ ] Report moderation queue (approve/reject/flag)
- [ ] Ability to create/delete fare configs (currently update-only)
- [ ] Bulk operations for fare config management

### Features
- [ ] Dynamic pricing by neighborhood or zone
- [ ] City-specific fare rules and special event pricing
- [ ] User reputation/trust scores based on report accuracy
- [ ] Fraud detection with anomaly scoring
- [ ] Google OAuth UI and documentation (backend configured)

### Performance
- [ ] SQL-based percentile calculation (currently computed in app memory)
- [ ] Database query optimization (prevent N+1 queries)
- [ ] Response compression/gzip configuration

## Lower Priority

### Integrations
- [ ] Public API with API key authentication
- [ ] Exportable reports and CSV downloads
- [ ] OSRM integration for distance calculation (env vars configured)

### Mobile & Offline
- [ ] PWA support for offline-first experience
- [ ] Mobile-optimized estimator interface
- [ ] Push notifications for fare updates

### Localization
- [ ] Extended Bangla translations
- [ ] Regional dialect support
- [ ] Currency formatting options

### Analytics
- [ ] Event tracking integration (PostHog/Mixpanel)
- [ ] Error monitoring (Sentry)
- [ ] Structured logging infrastructure (Winston/Pino)

## Completed

- [x] Security headers (CSP, X-Frame-Options, etc.)
- [x] API endpoint authentication (`/api/insights`)
- [x] Pagination for profile and admin pages
- [x] Comprehensive profanity filter (bad-words library)
- [x] Configurable fare multipliers via environment variables
- [x] Configurable rate limits and cache durations
