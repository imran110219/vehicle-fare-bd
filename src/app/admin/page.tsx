import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { City, VehicleType } from "@prisma/client";

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [configs, totalCount] = await Promise.all([
    prisma.vehicleFareConfig.findMany({
      orderBy: [{ city: "asc" }, { vehicleType: "asc" }],
      skip,
      take: PAGE_SIZE
    }),
    prisma.vehicleFareConfig.count()
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  async function updateConfig(formData: FormData) {
    "use server";
    const city = formData.get("city") as City;
    const vehicleType = formData.get("vehicleType") as VehicleType;
    const baseFare = Number(formData.get("baseFare"));
    const perKmRate = Number(formData.get("perKmRate"));
    const morningMultiplier = Number(formData.get("morningMultiplier"));
    const afternoonMultiplier = Number(formData.get("afternoonMultiplier"));
    const eveningMultiplier = Number(formData.get("eveningMultiplier"));
    const nightMultiplier = Number(formData.get("nightMultiplier"));

    await prisma.vehicleFareConfig.update({
      where: { city_vehicleType: { city, vehicleType } },
      data: {
        baseFare,
        perKmRate,
        morningMultiplier,
        afternoonMultiplier,
        eveningMultiplier,
        nightMultiplier
      }
    });
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">Admin: Vehicle pricing</h1>
        <p className="text-sm text-slate-600">
          Update base fares, per-km rates, and time multipliers. Showing {configs.length} of{" "}
          {totalCount} configurations.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {configs.map((config) => (
            <form key={config.id} action={updateConfig} className="grid gap-4 sm:grid-cols-8">
              <input type="hidden" name="city" value={config.city} />
              <input type="hidden" name="vehicleType" value={config.vehicleType} />
              <div className="text-sm font-semibold text-slate-700">
                {config.city} • {config.vehicleType}
              </div>
              <input
                name="baseFare"
                type="number"
                defaultValue={config.baseFare}
                className="rounded-lg border border-brand-200 p-2"
              />
              <input
                name="perKmRate"
                type="number"
                defaultValue={config.perKmRate}
                className="rounded-lg border border-brand-200 p-2"
              />
              <input
                name="morningMultiplier"
                type="number"
                step="0.01"
                defaultValue={config.morningMultiplier}
                className="rounded-lg border border-brand-200 p-2"
              />
              <input
                name="afternoonMultiplier"
                type="number"
                step="0.01"
                defaultValue={config.afternoonMultiplier}
                className="rounded-lg border border-brand-200 p-2"
              />
              <input
                name="eveningMultiplier"
                type="number"
                step="0.01"
                defaultValue={config.eveningMultiplier}
                className="rounded-lg border border-brand-200 p-2"
              />
              <input
                name="nightMultiplier"
                type="number"
                step="0.01"
                defaultValue={config.nightMultiplier}
                className="rounded-lg border border-brand-200 p-2"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white">
                Save
              </button>
            </form>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin?page=${page - 1}`}
                className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-200"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin?page=${page + 1}`}
                className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-200"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
