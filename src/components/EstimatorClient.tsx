"use client";

import { useMemo, useState } from "react";
import { CityConfig } from "@prisma/client";
import { MapPicker } from "@/components/MapPicker";
import { calculateFare } from "@/lib/fare";
import { haversineDistanceKm } from "@/lib/distance";
import { estimateSchema } from "@/lib/validation";
import { getDictionary, type Lang } from "@/lib/i18n";

const timeOptions = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night" }
];

const weatherOptions = [
  { value: "CLEAR", label: "Clear" },
  { value: "RAIN", label: "Rain" }
];

type Props = {
  configs: CityConfig[];
  lang: Lang;
};

type LatLng = { lat: number; lng: number };

export function EstimatorClient({ configs, lang }: Props) {
  const dictionary = getDictionary(lang);
  const [pickup, setPickup] = useState<LatLng | undefined>();
  const [drop, setDrop] = useState<LatLng | undefined>();
  const [pickupArea, setPickupArea] = useState("");
  const [dropArea, setDropArea] = useState("");
  const [city, setCity] = useState(configs[0]?.city || "DHAKA");
  const [timeOfDay, setTimeOfDay] = useState("MORNING");
  const [weather, setWeather] = useState<"CLEAR" | "RAIN" | "">("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggage, setLuggage] = useState(false);
  const [traffic, setTraffic] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [distanceNote, setDistanceNote] = useState("Straight-line estimate used");
  const [communityRange, setCommunityRange] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const config = useMemo(
    () => configs.find((item) => item.city === city) || configs[0],
    [city, configs]
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

  async function computeDistance() {
    if (pickup && drop) {
      try {
        const res = await fetch(
          `/api/estimate?pickupLat=${pickup.lat}&pickupLng=${pickup.lng}&dropLat=${drop.lat}&dropLng=${drop.lng}`
        );
        if (res.ok) {
          const data = await res.json();
          setDistanceKm(data.distanceKm);
          setDistanceNote(data.note);
          return data.distanceKm as number;
        }
      } catch (error) {
        // fall through to haversine
      }
      const fallback = haversineDistanceKm(pickup, drop);
      setDistanceKm(fallback);
      setDistanceNote("Straight-line estimate used");
      return fallback;
    }
    return distanceKm;
  }

  async function fetchCommunityRange(nextDistance: number) {
    if (!nextDistance) return;
    const res = await fetch(
      `/api/insights?city=${city}&timeOfDay=${timeOfDay}&distanceKm=${nextDistance}`
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
    setCommunityRange(`BDT ${Math.round(data.iqrLow)} - ${Math.round(data.iqrHigh)} (${data.count} reports)`);
  }

  async function geocodeArea(query: string, type: "pickup" | "drop") {
    if (!query) return;
    setGeoError(null);
    const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
      setGeoError("Geocoding failed. Please place the pin manually.");
      return;
    }
    const data = await res.json();
    if (type === "pickup") {
      setPickup({ lat: data.lat, lng: data.lng });
    } else {
      setDrop({ lat: data.lat, lng: data.lng });
    }
  }

  async function onEstimate() {
    const nextDistance = await computeDistance();
    const parsed = estimateSchema.safeParse({
      city,
      distanceKm: nextDistance,
      timeOfDay,
      weather: weather || undefined,
      passengerCount,
      luggage,
      traffic
    });

    if (!parsed.success) {
      setFormError("Please provide a valid distance and inputs.");
      return;
    }

    setFormError(null);
    await fetchCommunityRange(nextDistance);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">{dictionary.estimatorTitle}</h1>
        <p className="text-sm text-slate-600">
          Estimate fair rickshaw fares in Bangladesh using city pricing and community data.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">City</label>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                {configs.map((item) => (
                  <option key={item.city} value={item.city}>
                    {item.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Time of day</label>
              <select
                value={timeOfDay}
                onChange={(event) => setTimeOfDay(event.target.value)}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Weather</label>
              <select
                value={weather}
                onChange={(event) => setWeather(event.target.value as "CLEAR" | "RAIN" | "")}
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              >
                <option value="">Optional</option>
                {weatherOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Passengers</label>
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
              Luggage
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={traffic} onChange={(e) => setTraffic(e.target.checked)} />
              Heavy traffic
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Pickup area</label>
              <input
                value={pickupArea}
                onChange={(event) => setPickupArea(event.target.value)}
                placeholder="e.g. Dhanmondi"
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              />
              <button
                type="button"
                onClick={() => geocodeArea(pickupArea, "pickup")}
                className="mt-2 text-xs font-semibold text-brand-700"
              >
                Find on map
              </button>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Drop area</label>
              <input
                value={dropArea}
                onChange={(event) => setDropArea(event.target.value)}
                placeholder="e.g. Gulshan"
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              />
              <button
                type="button"
                onClick={() => geocodeArea(dropArea, "drop")}
                className="mt-2 text-xs font-semibold text-brand-700"
              >
                Find on map
              </button>
            </div>
          </div>

          {geoError && <p className="text-xs text-rose-600">{geoError}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Distance (km)</label>
              <input
                type="number"
                value={distanceKm ? distanceKm.toFixed(2) : ""}
                onChange={(event) => setDistanceKm(Number(event.target.value))}
                placeholder="Auto from map"
                className="mt-2 w-full rounded-lg border border-brand-200 p-2"
              />
              <p className="text-xs text-slate-500 mt-1">{distanceNote}</p>
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
            <h2 className="text-lg font-semibold text-slate-900">Route selection</h2>
            <div className="mt-4 space-y-4">
              <MapPicker label={`${dictionary.pickup} pin`} value={pickup} onChange={setPickup} />
              <MapPicker label={`${dictionary.drop} pin`} value={drop} onChange={setDrop} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Fare estimate</h2>
            {fare ? (
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>Base fare: BDT {fare.baseFare}</p>
                <p>Distance fare: BDT {fare.distanceFare}</p>
                <p>Multiplier: {fare.multiplier.toFixed(2)}x</p>
                <p className="text-lg font-semibold text-brand-800">Total: BDT {fare.totalFare}</p>
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
              <p className="mt-4 text-sm text-slate-500">Select a city and distance to see estimates.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
