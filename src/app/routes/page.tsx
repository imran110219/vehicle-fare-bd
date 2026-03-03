import { cookies } from "next/headers";
import { City, VehicleType } from "@prisma/client";
import { getPopularRoutes } from "@/lib/routes";
import { PopularRoutesClient } from "@/components/PopularRoutesClient";
import { getDictionary, type Lang } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{
    city?: string;
    vehicleType?: string;
  }>;
};

export default async function PopularRoutesPage({ searchParams }: Props) {
  const params = await searchParams;
  const city = params.city as City | undefined;
  const vehicleType = params.vehicleType as VehicleType | undefined;

  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) || "en";
  const dictionary = getDictionary(lang);

  // Fetch popular routes with filters
  const routes = await getPopularRoutes({
    city,
    vehicleType,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">
          {dictionary.popularRoutesTitle || "Popular Routes"}
        </h1>
        <p className="text-sm text-slate-600">
          {dictionary.popularRoutesSubtitle ||
            "See the most frequently traveled routes and their typical fares based on community data."}
        </p>
      </header>

      <PopularRoutesClient
        initialRoutes={routes}
        initialCity={city}
        initialVehicleType={vehicleType}
        lang={lang}
      />
    </div>
  );
}
