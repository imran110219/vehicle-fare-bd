# Overview

Rickshaw Fare BD helps riders estimate fair rickshaw fares and lets the community report actual prices. It combines city pricing rules with on-the-ground reports to show typical ranges.

## Core User Flows
- Estimate a fare: choose city, conditions, and pickup/drop points.
- Report a fare: submit what you paid after logging in.
- View insights: see aggregated community stats by city, time, and distance bucket.
- Admin manage pricing: update base fare and per-km rates per city.

## Key Features
- Fare calculation with multipliers for time of day, rain, traffic, and luggage
- Distance estimation with OSRM routing when enabled, fallback to haversine
- Community range (IQR) displayed alongside the estimator
- Geocoding with caching (optional; can be disabled)
- Rate-limited fare submissions (per-user per day) and duplicate checks
- Basic profanity filtering in text inputs
- English/Bangla UI labels
