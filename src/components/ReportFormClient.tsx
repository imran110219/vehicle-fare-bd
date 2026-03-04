"use client";

import { useEffect, useState } from "react";
import { City, VehicleType } from "@prisma/client";
import {
  getCityLabel,
  getDictionary,
  getNegotiationLabel,
  getTimeOfDayLabel,
  getVehicleTypeLabel,
  getWeatherLabel,
  type Lang,
} from "@/lib/i18n";

type Props = {
  submitAction: (formData: FormData) => Promise<void>;
  lang: Lang;
};

export default function ReportFormClient({ submitAction, lang }: Props) {
  const dictionary = getDictionary(lang);
  const [city, setCity] = useState<City>(City.DHAKA);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/areas?city=${city}`)
      .then((r) => r.json())
      .then((data) => setAreas(data.areas ?? []))
      .catch(() => setAreas([]));
  }, [city]);

  return (
    <form action={submitAction} className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-semibold">{dictionary.cityLabel}</label>
          <select
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value as City)}
            className="mt-2 w-full rounded-lg border border-brand-200 p-2"
          >
            {Object.values(City).map((c) => (
              <option key={c} value={c}>
                {getCityLabel(lang, c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">{dictionary.vehicleTypeLabel}</label>
          <select name="vehicleType" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {Object.values(VehicleType).map((type) => (
              <option key={type} value={type}>
                {getVehicleTypeLabel(lang, type)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">{dictionary.timeOfDayLabel}</label>
          <select name="timeOfDay" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {(["MORNING", "AFTERNOON", "EVENING", "NIGHT"] as const).map((value) => (
              <option key={value} value={value}>
                {getTimeOfDayLabel(lang, value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold">{dictionary.weatherLabel}</label>
          <select name="weather" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            <option value="">{dictionary.weatherOptional}</option>
            {(["CLEAR", "RAIN"] as const).map((value) => (
              <option key={value} value={value}>
                {getWeatherLabel(lang, value)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">{dictionary.passengersLabel}</label>
          <input
            name="passengerCount"
            type="number"
            min={1}
            max={3}
            defaultValue={1}
            className="mt-2 w-full rounded-lg border border-brand-200 p-2"
          />
        </div>
      </div>

      {/* Shared datalist for both pickup and drop areas */}
      <datalist id="area-suggestions">
        {areas.map((area) => (
          <option key={area} value={area} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="pickupArea"
          list="area-suggestions"
          placeholder={dictionary.pickupPlaceholder}
          autoComplete="off"
          className="rounded-lg border border-brand-200 p-2"
        />
        <input
          name="dropArea"
          list="area-suggestions"
          placeholder={dictionary.dropPlaceholder}
          autoComplete="off"
          className="rounded-lg border border-brand-200 p-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="distanceKm"
          type="number"
          step="0.1"
          placeholder={dictionary.distanceLabel}
          className="rounded-lg border border-brand-200 p-2"
        />
        <input
          name="farePaid"
          type="number"
          placeholder={dictionary.farePaidPlaceholder}
          className="rounded-lg border border-brand-200 p-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input name="luggage" type="checkbox" /> {dictionary.luggageLabel}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="traffic" type="checkbox" /> {dictionary.trafficLabel}
        </label>
        <select name="negotiation" className="rounded-lg border border-brand-200 p-2">
          {(["EASY", "MEDIUM", "HARD"] as const).map((value) => (
            <option key={value} value={value}>
              {dictionary.negotiationLabel}: {getNegotiationLabel(lang, value)}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="notes"
        placeholder={dictionary.notesPlaceholder}
        className="rounded-lg border border-brand-200 p-2"
      />

      <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white">
        {dictionary.reportSubmit}
      </button>
    </form>
  );
}
