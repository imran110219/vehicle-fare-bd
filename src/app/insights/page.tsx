import { prisma } from "@/lib/prisma";
import { getCommunityStats } from "@/lib/stats";
import { formatBucket } from "@/lib/buckets";
import { City, DistanceBucket, TimeOfDay, VehicleType } from "@prisma/client";

const timeOptions: TimeOfDay[] = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];
const bucketOptions: DistanceBucket[] = [
  "KM_0_1",
  "KM_1_2",
  "KM_2_3",
  "KM_3_5",
  "KM_5_8",
  "KM_8_PLUS"
];

export default async function InsightsPage({
  searchParams
}: {
  searchParams: { city?: string; vehicleType?: string; timeOfDay?: string; bucket?: string };
}) {
  const city = (searchParams.city as City) || City.DHAKA;
  const vehicleType = (searchParams.vehicleType as VehicleType) || VehicleType.RICKSHAW;
  const timeOfDay = (searchParams.timeOfDay as TimeOfDay) || "MORNING";
  const bucket = (searchParams.bucket as DistanceBucket) || "KM_0_1";

  const availableConfigs = await prisma.vehicleFareConfig.findMany({
    select: { city: true, vehicleType: true },
    orderBy: [{ city: "asc" }, { vehicleType: "asc" }]
  });
  const cityOptions = Array.from(new Set(availableConfigs.map((item) => item.city)));
  const vehicleOptions = Array.from(new Set(availableConfigs.map((item) => item.vehicleType)));

  const stats = await getCommunityStats(city, vehicleType, bucket, timeOfDay);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">Community insights</h1>
        <p className="text-sm text-slate-600">See aggregated fares based on real submissions.</p>
      </header>

      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-4">
        <div>
          <label className="text-sm font-semibold">City</label>
          <select name="city" defaultValue={city} className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {(cityOptions.length ? cityOptions : Object.values(City)).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Vehicle type</label>
          <select
            name="vehicleType"
            defaultValue={vehicleType}
            className="mt-2 w-full rounded-lg border border-brand-200 p-2"
          >
            {(vehicleOptions.length ? vehicleOptions : Object.values(VehicleType)).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Time of day</label>
          <select name="timeOfDay" defaultValue={timeOfDay} className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Distance bucket</label>
          <select name="bucket" defaultValue={bucket} className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {bucketOptions.map((option) => (
              <option key={option} value={option}>
                {formatBucket(option)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white sm:col-span-4">
          View stats
        </button>
      </form>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        {stats ? (
          <div className="space-y-2 text-sm text-slate-700">
            <p className="text-lg font-semibold text-brand-800">Median: BDT {stats.medianFare.toFixed(0)}</p>
            <p>
              IQR: BDT {stats.iqrLow.toFixed(0)} - {stats.iqrHigh.toFixed(0)}
            </p>
            <p>Total reports: {stats.count}</p>
            <p className="text-xs text-slate-500">Cached for 10 minutes.</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No community data for this filter yet.</p>
        )}
      </section>
    </div>
  );
}
