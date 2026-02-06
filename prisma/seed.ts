import {
  PrismaClient,
  City,
  VehicleType,
  TimeOfDay,
  Weather,
  NegotiationDifficulty,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { calculateFare } from "../src/lib/fare";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Deterministic pseudo-random generator (stable across runs)
 * so generated fares stay the same and upserts match.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toFixedDate(iso: string) {
  return new Date(iso);
}

function buildSeedKey(
  parts: Record<string, string | number | boolean | null | undefined>,
) {
  // stable string; keep short
  return Object.entries(parts)
    .map(([k, v]) => `${k}=${String(v ?? "")}`)
    .join("|");
}

function pickAreas(city: City) {
  if (city === City.DHAKA) {
    return [
      ["Dhanmondi", "Kalabagan"],
      ["Gulshan", "Banani"],
      ["Mirpur 10", "Kazipara"],
      ["Uttara", "Airport"],
      ["Mohammadpur", "Farmgate"],
    ];
  }
  // CHATTOGRAM
  return [
    ["GEC", "Agrabad"],
    ["Nasirabad", "Kotwali"],
    ["Pahartali", "Chawkbazar"],
    ["Oxygen", "Muradpur"],
    ["Halishahar", "New Market"],
  ];
}

/**
 * We seed configs grounded by public references:
 * - CNG meter rule baseline (Dhaka): min Tk40 first 2km; then Tk12/km; waiting Tk2/min. :contentReference[oaicite:3]{index=3}
 *   Since your model is base + perKm*distance, we approximate with base=40 and perKm=12.
 * - Pathao published rates (article report): Dhaka 15/km, base 25, min 50; Chattogram 12.5/km, min 40. :contentReference[oaicite:4]{index=4}
 *   Again approximate with base + perKm*distance.
 */
function getBaseRate(city: City, vehicleType: VehicleType) {
  // Defaults (fallback) — used for non-target vehicles.
  let baseFare = city === City.DHAKA ? 30 : 25;
  let perKmRate = city === City.DHAKA ? 18 : 16;

  if (vehicleType === VehicleType.CNG) {
    // Approximation of meter rule baseline
    baseFare = 40;
    perKmRate = 12;
  }

  if (vehicleType === VehicleType.BIKE) {
    // Approx Pathao Dhaka/CTG per-km (reported)
    baseFare = 25;
    perKmRate = city === City.DHAKA ? 15 : 13; // CTG ~12.5/km, rounded
  }

  if (vehicleType === VehicleType.CAR) {
    // Keep higher than bike; your multipliers already handle it
    baseFare = city === City.DHAKA ? 60 : 50;
    perKmRate = city === City.DHAKA ? 28 : 24;
  }

  if (vehicleType === VehicleType.RICKSHAW) {
    baseFare = city === City.DHAKA ? 30 : 25;
    perKmRate = city === City.DHAKA ? 18 : 16;
  }

  if (vehicleType === VehicleType.AUTO_RICKSHAW) {
    baseFare = city === City.DHAKA ? 35 : 30;
    perKmRate = city === City.DHAKA ? 20 : 18;
  }

  return { baseFare, perKmRate };
}

function vehicleMultipliers(vehicleType: VehicleType) {
  const table: Partial<Record<VehicleType, { base: number; perKm: number }>> = {
    [VehicleType.RICKSHAW]: { base: 1, perKm: 1 },
    [VehicleType.CNG]: { base: 1, perKm: 1 },
    [VehicleType.AUTO_RICKSHAW]: { base: 1.1, perKm: 1.1 },
    [VehicleType.BIKE]: { base: 1, perKm: 1 },
    [VehicleType.CAR]: { base: 1, perKm: 1 },
    [VehicleType.MICROBUS]: { base: 1.3, perKm: 1.2 },
    [VehicleType.BUS]: { base: 0.7, perKm: 0.6 },
  };
  return table[vehicleType] ?? { base: 1, perKm: 1 };
}

async function ensureUsers() {
  const seedUsers = [
    { id: "seed-user-1", name: "Seed User 1", email: "seed1@example.com" },
    { id: "seed-user-2", name: "Seed User 2", email: "seed2@example.com" },
  ];

  for (const u of seedUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name, email: u.email },
      create: { id: u.id, name: u.name, email: u.email },
    });
  }
}

async function ensureConfigs() {
  const targetCities: City[] = [City.DHAKA, City.CHATTOGRAM];
  const targetVehicles: VehicleType[] = [
    VehicleType.CNG,
    VehicleType.BIKE,
    VehicleType.CAR,
    VehicleType.RICKSHAW,
    VehicleType.AUTO_RICKSHAW,
  ];

  for (const city of targetCities) {
    for (const vehicleType of targetVehicles) {
      const base = getBaseRate(city, vehicleType);
      const m = vehicleMultipliers(vehicleType);

      await prisma.vehicleFareConfig.upsert({
        where: { city_vehicleType: { city, vehicleType } },
        update: {
          baseFare: Math.round(base.baseFare * m.base),
          perKmRate: Math.round(base.perKmRate * m.perKm),
          // keep your defaults for multipliers; tweak if you want:
          nightMultiplier: 1.15,
        },
        create: {
          city,
          vehicleType,
          baseFare: Math.round(base.baseFare * m.base),
          perKmRate: Math.round(base.perKmRate * m.perKm),
          nightMultiplier: 1.15,
        },
      });
    }
  }
}

async function computeEstimatedFareAtTime(input: {
  city: City;
  vehicleType: VehicleType;
  distanceKm: number;
  timeOfDay: TimeOfDay;
  weather?: Weather | null;
  luggage: boolean;
  traffic: boolean;
}) {
  const config = await prisma.vehicleFareConfig.findUnique({
    where: {
      city_vehicleType: { city: input.city, vehicleType: input.vehicleType },
    },
  });

  if (!config) {
    throw new Error(
      `Missing VehicleFareConfig for city=${input.city} vehicleType=${input.vehicleType}`,
    );
  }

  const out = calculateFare({
    config,
    distanceKm: input.distanceKm,
    timeOfDay: input.timeOfDay,
    weather: input.weather ?? undefined,
    luggage: input.luggage,
    traffic: input.traffic,
  });

  // totalFare expected in your example
  const total = (out as any).totalFare;
  if (typeof total !== "number") {
    throw new Error("calculateFare() did not return { totalFare: number }");
  }
  return Math.round(total);
}

function negotiationFromFlags(timeOfDay: TimeOfDay, traffic: boolean) {
  if (traffic) return NegotiationDifficulty.HARD;
  if (timeOfDay === TimeOfDay.NIGHT) return NegotiationDifficulty.HARD;
  if (timeOfDay === TimeOfDay.EVENING) return NegotiationDifficulty.MEDIUM;
  return NegotiationDifficulty.EASY;
}

function noiseByNegotiation(neg: NegotiationDifficulty, rnd: () => number) {
  // returns multiplier delta
  if (neg === NegotiationDifficulty.EASY) return rnd() * 0.1 - 0.05; // -5%..+5%
  if (neg === NegotiationDifficulty.MEDIUM) return rnd() * 0.2; // 0%..+20%
  return 0.1 + rnd() * 0.35; // +10%..+45%
}

async function seedReportsDense() {
  const rnd = mulberry32(20260207); // stable seed

  const cities: City[] = [City.DHAKA, City.CHATTOGRAM];
  const vehicles: VehicleType[] = [
    VehicleType.CNG,
    VehicleType.BIKE,
    VehicleType.CAR,
    VehicleType.RICKSHAW,
    VehicleType.AUTO_RICKSHAW,
  ];

  const times: TimeOfDay[] = [
    TimeOfDay.MORNING,
    TimeOfDay.AFTERNOON,
    TimeOfDay.EVENING,
    TimeOfDay.NIGHT,
  ];
  const weathers: (Weather | null)[] = [Weather.CLEAR, Weather.RAIN];
  const traffics = [false, true];
  const luggages = [false, true];

  // Distance samples to cover your DistanceBucket mapping behavior
  const distances = [0.8, 1.5, 2.5, 4.0, 6.5, 10.0];

  const baseDate = toFixedDate("2026-01-15T06:00:00.000Z");
  let idx = 0;

  for (const city of cities) {
    const areaPairs = pickAreas(city);

    for (const vehicleType of vehicles) {
      for (const timeOfDay of times) {
        for (const weather of weathers) {
          for (const traffic of traffics) {
            for (const luggage of luggages) {
              for (const distanceKm of distances) {
                const [pickupArea, dropArea] =
                  areaPairs[idx % areaPairs.length];

                const negotiation = negotiationFromFlags(timeOfDay, traffic);
                const passengerCount =
                  vehicleType === VehicleType.CAR
                    ? 2
                    : vehicleType === VehicleType.CNG
                      ? 2
                      : vehicleType === VehicleType.AUTO_RICKSHAW
                        ? 2
                        : 1;

                const estimatedFareAtTime = await computeEstimatedFareAtTime({
                  city,
                  vehicleType,
                  distanceKm,
                  timeOfDay,
                  weather,
                  luggage,
                  traffic,
                });

                const delta = noiseByNegotiation(negotiation, rnd);
                const farePaid = Math.round(
                  clamp(estimatedFareAtTime * (1 + delta), 20, 5000),
                );

                const createdAt = new Date(baseDate.getTime() + idx * 60_000); // +1 minute per row
                const userId = idx % 2 === 0 ? "seed-user-1" : "seed-user-2";

                const seedKey = buildSeedKey({
                  city,
                  vehicleType,
                  timeOfDay,
                  weather: weather ?? "NONE",
                  traffic,
                  luggage,
                  distanceKm,
                  pickupArea,
                  dropArea,
                  userId,
                });

                await prisma.fareReport.upsert({
                  where: { seedKey },
                  update: {
                    farePaid,
                    estimatedFareAtTime,
                    estimatorVersion: "v1",
                    createdAt,
                    negotiation,
                    passengerCount,
                    notes: `seeded: online-based baseline + multipliers`,
                  },
                  create: {
                    seedKey,
                    userId,
                    city,
                    vehicleType,
                    pickupArea,
                    dropArea,
                    distanceKm,
                    farePaid,
                    estimatedFareAtTime,
                    estimatorVersion: "v1",
                    timeOfDay,
                    weather: weather ?? undefined,
                    passengerCount,
                    luggage,
                    traffic,
                    negotiation,
                    notes: `seeded: online-based baseline + multipliers`,
                    createdAt,
                  },
                });

                idx++;
              }
            }
          }
        }
      }
    }
  }

  console.log(
    `Seeded/updated ${idx} fare reports (dense combos) for Dhaka + Chattogram.`,
  );
}

async function main() {
  await ensureUsers();
  await ensureConfigs();
  await seedReportsDense();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
