import type { CityConfig } from "@prisma/client";

export type FareInput = {
  config: CityConfig;
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
  let multiplier = 1;
  const notes: string[] = [];

  if (input.timeOfDay === "NIGHT") multiplier += 0.15;
  if (input.weather === "RAIN") multiplier += 0.2;
  if (input.traffic) multiplier += 0.1;
  if (input.luggage) multiplier += 0.1;

  const rawTotal = (baseFare + distanceFare) * multiplier;
  const totalFare = roundTo(rawTotal, 0);
  const typicalLow = roundTo(totalFare * 0.85, 0);
  const typicalHigh = roundTo(totalFare * 1.15, 0);

  notes.push("Typical range reflects +/-15% of the computed fare.");

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
