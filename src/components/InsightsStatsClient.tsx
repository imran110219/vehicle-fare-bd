"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { bucketToDistanceKm } from "@/lib/buckets";
import { getDictionary, type Lang } from "@/lib/i18n";
import type { DistanceBucket, TimeOfDay, City, VehicleType } from "@prisma/client";

type StatsResponse = {
  medianFare: number;
  iqrLow: number;
  iqrHigh: number;
  count: number;
  updatedAt: string;
} | null;

type Props = {
  city: City;
  vehicleType: VehicleType;
  timeOfDay: TimeOfDay;
  bucket: DistanceBucket;
  isAuthed: boolean;
  lang: Lang;
};

export function InsightsStatsClient({ city, vehicleType, timeOfDay, bucket, isAuthed, lang }: Props) {
  const dictionary = useMemo(() => getDictionary(lang), [lang]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const distanceKm = bucketToDistanceKm(bucket);
      const endpoint = isAuthed ? "/api/insights" : "/api/insights/public";
      const params = new URLSearchParams({
        city,
        vehicleType,
        timeOfDay,
        distanceKm: String(distanceKm)
      });
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!active) return;
      if (!res.ok) {
        setStats(null);
        setLoading(false);
        return;
      }
      const data = (await res.json()) as StatsResponse;
      setStats(data);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [bucket, city, isAuthed, timeOfDay, vehicleType]);

  if (loading) {
    return <p className="text-sm text-slate-500">{dictionary.loadingInsights}</p>;
  }

  if (!stats) {
    return <p className="text-sm text-slate-500">{dictionary.noCommunityData}</p>;
  }

  const lowConfidence = stats.count < 8;
  const updatedAt = new Date(stats.updatedAt).toLocaleString();

  return (
    <div className="space-y-2 text-sm text-slate-700">
      <div className="flex items-center gap-2">
        <p className="text-lg font-semibold text-brand-800">
          {dictionary.medianLabel}: BDT {stats.medianFare.toFixed(0)}
        </p>
        {lowConfidence && (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            {dictionary.lowConfidence}
          </span>
        )}
      </div>
      <p>
        {dictionary.typicalRange}: BDT {stats.iqrLow.toFixed(0)} - {stats.iqrHigh.toFixed(0)}
      </p>
      <p>
        {dictionary.reportCount}: {stats.count}
      </p>
      <p>
        {dictionary.lastUpdated}: {updatedAt}
      </p>
      <p className="text-xs text-slate-500">{dictionary.trustNote}</p>
      {lowConfidence && (
        <p className="text-xs text-brand-700">
          <Link href="/report" className="underline">
            {dictionary.submitReport}
          </Link>
        </p>
      )}
    </div>
  );
}
