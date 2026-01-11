# Overview

Vehicle Fare BD helps riders estimate fair vehicle fares and lets the community report actual prices. It combines city + vehicle pricing rules with on-the-ground reports to show typical ranges.

## Core User Flows
- Estimate a fare: choose city, vehicle type, distance, and conditions.
- Report a fare: submit what you paid after logging in.
- View insights: see aggregated community stats by city, vehicle, time, and distance bucket.
- Admin manage pricing: update base fare, per-km rates, and time multipliers per city + vehicle.

## Key Features
- Fare calculation with multipliers for time of day, rain, traffic, and luggage
- Community range (IQR) displayed alongside the estimator
- Rate-limited fare submissions (per-user per day) and duplicate checks
- Basic profanity filtering in text inputs
- English/Bangla UI labels
