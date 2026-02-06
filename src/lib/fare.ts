import type { VehicleFareConfig } from "@prisma/client";
import { demandPressureByTimeOfDay, demandPressureCities, fareConfig } from "./config";

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
  const demandPressure = getDemandPressure(input.config.city, input.timeOfDay);

  if (input.weather === "RAIN") multiplier += fareConfig.rainMultiplier;
  if (input.traffic) multiplier += fareConfig.trafficMultiplier;
  if (input.luggage) multiplier += fareConfig.luggageMultiplier;
  if (demandPressure > 0) multiplier += demandPressure;

  const rawTotal = (baseFare + distanceFare) * multiplier;
  const totalFare = roundTo(rawTotal, 0);

  const rangePercent = fareConfig.typicalRangePercent;
  const typicalLow = roundTo(totalFare * (1 - rangePercent), 0);
  const typicalHigh = roundTo(totalFare * (1 + rangePercent), 0);

  notes.push(
    `Typical range reflects +/-${Math.round(rangePercent * 100)}% of the computed fare. Time-of-day multiplier: ${timeMultiplier.toFixed(2)}x.`
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

function getDemandPressure(city: VehicleFareConfig["city"], timeOfDay: FareInput["timeOfDay"]) {
  if (!demandPressureCities.includes(city)) return 0;
  return demandPressureByTimeOfDay[timeOfDay] ?? 0;
}
