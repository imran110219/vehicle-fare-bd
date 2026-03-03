"use client";

import { useState } from "react";
import { City, VehicleType } from "@prisma/client";
import type { PopularRoute } from "@/lib/routes";
import {
  getCityLabel,
  getDictionary,
  getVehicleTypeLabel,
  type Lang,
} from "@/lib/i18n";
import { useRouter } from "next/navigation";

type Props = {
  initialRoutes: PopularRoute[];
  initialCity?: City;
  initialVehicleType?: VehicleType;
  lang: Lang;
};

export function PopularRoutesClient({
  initialRoutes,
  initialCity,
  initialVehicleType,
  lang,
}: Props) {
  const router = useRouter();
  const dictionary = getDictionary(lang);
  const [selectedCity, setSelectedCity] = useState<City | "ALL">(
    initialCity || "ALL"
  );
  const [selectedVehicleType, setSelectedVehicleType] = useState<
    VehicleType | "ALL"
  >(initialVehicleType || "ALL");

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (selectedCity !== "ALL") params.set("city", selectedCity);
    if (selectedVehicleType !== "ALL")
      params.set("vehicleType", selectedVehicleType);

    router.push(`/routes?${params.toString()}`);
  };

  const handleEstimateRoute = (route: PopularRoute) => {
    // Store route data in sessionStorage for the estimator
    sessionStorage.setItem(
      "quickEstimate",
      JSON.stringify({
        city: route.city,
        vehicleType: route.vehicleType,
        distanceKm: route.avgDistance,
        pickupArea: route.pickupArea,
        dropArea: route.dropArea,
      })
    );
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              {dictionary.cityLabel}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value as City | "ALL")}
              className="mt-2 w-full rounded-lg border border-brand-200 p-2"
            >
              <option value="ALL">
                {dictionary.allCities || "All Cities"}
              </option>
              {Object.values(City).map((city) => (
                <option key={city} value={city}>
                  {getCityLabel(lang, city)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              {dictionary.vehicleTypeLabel}
            </label>
            <select
              value={selectedVehicleType}
              onChange={(e) =>
                setSelectedVehicleType(e.target.value as VehicleType | "ALL")
              }
              className="mt-2 w-full rounded-lg border border-brand-200 p-2"
            >
              <option value="ALL">
                {dictionary.allVehicles || "All Vehicles"}
              </option>
              {Object.values(VehicleType).map((type) => (
                <option key={type} value={type}>
                  {getVehicleTypeLabel(lang, type)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilterChange}
              className="w-full rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
            >
              {dictionary.applyFilters || "Apply Filters"}
            </button>
          </div>
        </div>
      </section>

      {/* Routes List */}
      <section className="space-y-4">
        {initialRoutes.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-500">
              {dictionary.noPopularRoutes ||
                "No popular routes found for these filters. Try adjusting your filters or check back later."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {initialRoutes.map((route, idx) => (
              <RouteCard
                key={`${route.city}-${route.vehicleType}-${route.pickupArea}-${route.dropArea}`}
                route={route}
                rank={idx + 1}
                onEstimate={() => handleEstimateRoute(route)}
                lang={lang}
              />
            ))}
          </div>
        )}
      </section>

      {/* Stats Summary */}
      {initialRoutes.length > 0 && (
        <section className="rounded-2xl bg-brand-50 p-6">
          <div className="grid gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold text-brand-800">
                {initialRoutes.length}
              </p>
              <p className="text-sm text-slate-600">
                {dictionary.popularRoutesCount || "Popular Routes"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-800">
                {initialRoutes.reduce((sum, r) => sum + r.tripCount, 0)}
              </p>
              <p className="text-sm text-slate-600">
                {dictionary.totalTrips || "Total Trips Reported"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-800">
                {new Set(initialRoutes.map((r) => r.city)).size}
              </p>
              <p className="text-sm text-slate-600">
                {dictionary.citiesCovered || "Cities Covered"}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

type RouteCardProps = {
  route: PopularRoute;
  rank: number;
  onEstimate: () => void;
  lang: Lang;
};

function RouteCard({ route, rank, onEstimate, lang }: RouteCardProps) {
  const dictionary = getDictionary(lang);
  const fareRange = `BDT ${route.minFare}-${route.maxFare}`;
  const daysAgo = Math.floor(
    (Date.now() - new Date(route.lastReported).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Rank Badge */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            #{rank}
          </span>
          <div>
            <p className="text-xs text-slate-500">
              {getCityLabel(lang, route.city)} •{" "}
              {getVehicleTypeLabel(lang, route.vehicleType)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {route.tripCount}{" "}
            {dictionary.tripsLabel || "trips"}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="font-semibold text-brand-900">{route.pickupArea}</p>
          </div>
          <div className="text-brand-600">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
          <div className="flex-1 text-right">
            <p className="font-semibold text-brand-900">{route.dropArea}</p>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {dictionary.avgDistance || "Avg"}: {route.avgDistance.toFixed(1)} km
        </p>
      </div>

      {/* Fare Info */}
      <div className="mb-4 rounded-lg bg-brand-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600">
              {dictionary.medianLabel || "Median Fare"}
            </p>
            <p className="text-2xl font-bold text-brand-800">
              BDT {route.medianFare}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">
              {dictionary.fareRangeLabel || "Range"}
            </p>
            <p className="text-sm font-medium text-slate-700">{fareRange}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {daysAgo === 0
            ? dictionary.reportedToday || "Reported today"
            : `${daysAgo} ${dictionary.daysAgo || "days ago"}`}
        </p>
        <button
          onClick={onEstimate}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {dictionary.quickEstimate || "Quick Estimate"}
        </button>
      </div>
    </div>
  );
}
