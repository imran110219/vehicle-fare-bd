"use client";

import { useEffect, useMemo, useState } from "react";
import { City, VehicleFareConfig, VehicleType } from "@prisma/client";
import { calculateFare } from "@/lib/fare";
import { estimateSchema } from "@/lib/validation";
import {
  getCityLabel,
  getDictionary,
  getTimeOfDayLabel,
  getVehicleTypeLabel,
  getWeatherLabel,
  type Lang
} from "@/lib/i18n";

const timeOptions = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"] as const;
const weatherOptions = ["CLEAR", "RAIN"] as const;

type Props = {
  configs: VehicleFareConfig[];
  lang: Lang;
};

export function EstimatorClient({ configs, lang }: Props) {
  const dictionary = getDictionary(lang);
  const cityOptions = useMemo(() => {
    const options = Array.from(new Set(configs.map((item) => item.city)));
    return options.length ? options : Object.values(City);
  }, [configs]);
  const [city, setCity] = useState<City>(cityOptions[0] || City.DHAKA);
  const vehicleOptions = useMemo(() => {
    const options = configs.filter((item) => item.city === city).map((item) => item.vehicleType);
    return options.length ? options : Object.values(VehicleType);
  }, [city, configs]);
  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicleOptions[0] || VehicleType.RICKSHAW);
  const [timeOfDay, setTimeOfDay] = useState("MORNING");
  const [weather, setWeather] = useState<"CLEAR" | "RAIN" | "">("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggage, setLuggage] = useState(false);
  const [traffic, setTraffic] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [communityRange, setCommunityRange] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleOptions.includes(vehicleType)) {
      setVehicleType(vehicleOptions[0] || VehicleType.RICKSHAW);
    }
  }, [vehicleOptions, vehicleType]);

  const config = useMemo(
    () => configs.find((item) => item.city === city && item.vehicleType === vehicleType) || configs[0],
    [city, configs, vehicleType]
  );

  const fare = config
    ? calculateFare({
        config,
        distanceKm: distanceKm || 0,
        timeOfDay: timeOfDay as "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT",
        weather: weather ? (weather as "CLEAR" | "RAIN") : undefined,
        luggage,
        traffic
      })
    : null;

  async function fetchCommunityRange(nextDistance: number) {
    if (!nextDistance) return;
    const res = await fetch(
      `/api/insights?city=${city}&vehicleType=${vehicleType}&timeOfDay=${timeOfDay}&distanceKm=${nextDistance}`
    );
    if (!res.ok) {
      setCommunityRange(null);
      return;
    }
    const data = await res.json();
    if (!data || !data.medianFare) {
      setCommunityRange(null);
      return;
    }
    const reportsText = dictionary.reportsCountSuffix.replace("{count}", String(data.count));
    setCommunityRange(`BDT ${Math.round(data.iqrLow)} - ${Math.round(data.iqrHigh)} (${reportsText})`);
  }

  async function onEstimate() {
    const nextDistance = distanceKm;
    const parsed = estimateSchema.safeParse({
      city,
      vehicleType,
      distanceKm: nextDistance,
      timeOfDay,
      weather: weather || undefined,
      passengerCount,
      luggage,
      traffic
    });

    if (!parsed.success) {
      setFormError(dictionary.estimateError);
      return;
    }

    setFormError(null);
    await fetchCommunityRange(nextDistance);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">{dictionary.estimatorTitle}</h1>
        <p className="text-sm text-slate-600">{dictionary.estimatorSubtitle}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">{dictionary.cityLabel}</label>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value as City)}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                {cityOptions.map((item) => (
                  <option key={item} value={item}>
                    {getCityLabel(lang, item)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">{dictionary.vehicleTypeLabel}</label>
              <select
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value as VehicleType)}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                {vehicleOptions.map((item) => (
                  <option key={item} value={item}>
                    {getVehicleTypeLabel(lang, item)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">{dictionary.timeOfDayLabel}</label>
              <select
                value={timeOfDay}
                onChange={(event) => setTimeOfDay(event.target.value)}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                {timeOptions.map((option) => (
                  <option key={option} value={option}>
                    {getTimeOfDayLabel(lang, option)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">{dictionary.weatherLabel}</label>
              <select
                value={weather}
                onChange={(event) => setWeather(event.target.value as "CLEAR" | "RAIN" | "")}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                <option value="">{dictionary.weatherOptional}</option>
                {weatherOptions.map((option) => (
                  <option key={option} value={option}>
                    {getWeatherLabel(lang, option)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">{dictionary.passengersLabel}</label>
              <input
                type="number"
                min={1}
                max={3}
                value={passengerCount}
                onChange={(event) => setPassengerCount(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={luggage} onChange={(e) => setLuggage(e.target.checked)} />
              {dictionary.luggageLabel}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={traffic} onChange={(e) => setTraffic(e.target.checked)} />
              {dictionary.trafficLabel}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">{dictionary.distanceLabel}</label>
              <input
                type="number"
                value={distanceKm ? distanceKm.toFixed(2) : ""}
                onChange={(event) => setDistanceKm(Number(event.target.value))}
                placeholder={dictionary.distancePlaceholder}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              />
            </div>
            <button
              type="button"
              onClick={onEstimate}
              className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {dictionary.estimate}
            </button>
          </div>

          {formError && <p className="text-xs text-rose-600">{formError}</p>}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{dictionary.fareEstimateTitle}</h2>
            {fare ? (
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>{dictionary.baseFareLabel}: BDT {fare.baseFare}</p>
                <p>{dictionary.distanceFareLabel}: BDT {fare.distanceFare}</p>
                <p>{dictionary.multiplierLabel}: {fare.multiplier.toFixed(2)}x</p>
                <p className="text-lg font-semibold text-brand-800">
                  {dictionary.totalLabel}: BDT {fare.totalFare}
                </p>
                <p>
                  {dictionary.typicalRange}: BDT {fare.typicalLow} - {fare.typicalHigh}
                </p>
                {communityRange && (
                  <p>
                    {dictionary.communityRange}: {communityRange}
                  </p>
                )}
                <p className="text-xs text-slate-500">{fare.notes[0]}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">{dictionary.estimatePrompt}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
