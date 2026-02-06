// Fare calculation configuration
// These values can be overridden via environment variables

function parseFloat(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function parseInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export const fareConfig = {
  // Condition multipliers (added to base multiplier)
  rainMultiplier: parseFloat(process.env.FARE_RAIN_MULTIPLIER, 0.2),
  trafficMultiplier: parseFloat(process.env.FARE_TRAFFIC_MULTIPLIER, 0.1),
  luggageMultiplier: parseFloat(process.env.FARE_LUGGAGE_MULTIPLIER, 0.1),

  // Typical range percentage (e.g., 0.15 = ±15%)
  typicalRangePercent: parseFloat(process.env.FARE_TYPICAL_RANGE_PERCENT, 0.15),

  // Cache duration for community stats (in minutes)
  statsCacheDurationMinutes: parseInt(process.env.STATS_CACHE_DURATION_MINUTES, 10),

  // Rate limiting
  maxReportsPerDay: parseInt(process.env.MAX_REPORTS_PER_DAY, 10),
  duplicateWindowMinutes: parseInt(process.env.DUPLICATE_WINDOW_MINUTES, 10)
} as const;

export const demandPressureByTimeOfDay = {
  MORNING: 0.05,
  AFTERNOON: 0.03,
  EVENING: 0.1,
  NIGHT: 0.15
} as const;

export const demandPressureCities = ["DHAKA", "CHATTOGRAM", "NARAYANGANJ", "GAZIPUR"] as const;
