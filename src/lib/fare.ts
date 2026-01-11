import type { VehicleFareConfig } from "@prisma/client";

export type FareInput = {
  config: VehicleFareConfig;
  distanceKm: number;
  timeOfDay: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  weather?: "CLEAR" | "RAIN";
  traffic: boolean;
  luggage: boolean;
};

export type FareResult = {
  baseFare: number;
  distanceFare: number;
  multiplier: number;
  totalFare: number;
  typicalLow: number;
  typicalHigh: number;
  notes: string[];
};

export function calculateFare(input: FareInput): FareResult {
  const baseFare = input.config.baseFare;
  const distanceFare = input.config.perKmRate * input.distanceKm;
  const timeMultiplier = getTimeMultiplier(input.config, input.timeOfDay);
  let multiplier = timeMultiplier;
  const notes: string[] = [];

  if (input.weather === "RAIN") multiplier += 0.2;
  if (input.traffic) multiplier += 0.1;
  if (input.luggage) multiplier += 0.1;

  const rawTotal = (baseFare + distanceFare) * multiplier;
  const totalFare = roundTo(rawTotal, 0);
  const typicalLow = roundTo(totalFare * 0.85, 0);
  const typicalHigh = roundTo(totalFare * 1.15, 0);

  notes.push(
    `Typical range reflects +/-15% of the computed fare. Time-of-day multiplier: ${timeMultiplier.toFixed(2)}x.`
  );

  return {
    baseFare,
    distanceFare: roundTo(distanceFare, 1),
    multiplier,
    totalFare,
    typicalLow,
    typicalHigh,
    notes
  };
}

export function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getTimeMultiplier(config: VehicleFareConfig, timeOfDay: FareInput["timeOfDay"]) {
  switch (timeOfDay) {
    case "MORNING":
      return config.morningMultiplier;
    case "AFTERNOON":
      return config.afternoonMultiplier;
    case "EVENING":
      return config.eveningMultiplier;
    case "NIGHT":
      return config.nightMultiplier;
    default:
      return 1;
  }
}
