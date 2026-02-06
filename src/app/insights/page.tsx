import { prisma } from "@/lib/prisma";
import { formatBucket } from "@/lib/buckets";
import { City, DistanceBucket, TimeOfDay, VehicleType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import {
  getCityLabel,
  getDistanceBucketLabel,
  getDictionary,
  getTimeOfDayLabel,
  getVehicleTypeLabel,
  type Lang
} from "@/lib/i18n";
import { InsightsStatsClient } from "@/components/InsightsStatsClient";

const timeOptions: TimeOfDay[] = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];
const bucketOptions: DistanceBucket[] = [
  "KM_0_1",
  "KM_1_2",
  "KM_2_3",
  "KM_3_5",
  "KM_5_8",
  "KM_8_PLUS"
];

type Props = {
  searchParams: Promise<{ city?: string; vehicleType?: string; timeOfDay?: string; bucket?: string }>;
};

export default async function InsightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const city = (params.city as City) || City.DHAKA;
  const vehicleType = (params.vehicleType as VehicleType) || VehicleType.RICKSHAW;
  const timeOfDay = (params.timeOfDay as TimeOfDay) || "MORNING";
  const bucket = (params.bucket as DistanceBucket) || "KM_0_1";
  const session = await auth();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) || "en";
  const dictionary = getDictionary(lang);

  const availableConfigs = await prisma.vehicleFareConfig.findMany({
    select: { city: true, vehicleType: true },
    orderBy: [{ city: "asc" }, { vehicleType: "asc" }]
  });
  const cityOptions = Array.from(new Set(availableConfigs.map((item) => item.city)));
  const vehicleOptions = Array.from(new Set(availableConfigs.map((item) => item.vehicleType)));

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">{dictionary.communityInsightsTitle}</h1>
        <p className="text-sm text-slate-600">{dictionary.communityInsightsSubtitle}</p>
      </header>

      <form className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-4">
        <div>
          <label className="text-sm font-semibold">{dictionary.cityLabel}</label>
          <select name="city" defaultValue={city} className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {(cityOptions.length ? cityOptions : Object.values(City)).map((item) => (
              <option key={item} value={item}>
                {getCityLabel(lang, item)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">{dictionary.vehicleTypeLabel}</label>
          <select
            name="vehicleType"
            defaultValue={vehicleType}
            className="mt-2 w-full rounded-lg border border-brand-200 p-2"
          >
            {(vehicleOptions.length ? vehicleOptions : Object.values(VehicleType)).map((item) => (
              <option key={item} value={item}>
                {getVehicleTypeLabel(lang, item)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">{dictionary.timeOfDayLabel}</label>
          <select name="timeOfDay" defaultValue={timeOfDay} className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {getTimeOfDayLabel(lang, option)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">{dictionary.distanceBucketLabel}</label>
          <select name="bucket" defaultValue={bucket} className="mt-2 w-full rounded-lg border border-brand-200 p-2">
            {bucketOptions.map((option) => (
              <option key={option} value={option}>
                {getDistanceBucketLabel(lang, option) || formatBucket(option)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white sm:col-span-4">
          {dictionary.viewStats}
        </button>
      </form>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <InsightsStatsClient
          city={city}
          vehicleType={vehicleType}
          timeOfDay={timeOfDay}
          bucket={bucket}
          isAuthed={Boolean(session?.user)}
          lang={lang}
        />
      </section>
    </div>
  );
}
