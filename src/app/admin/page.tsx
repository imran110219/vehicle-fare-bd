import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const configs = await prisma.cityConfig.findMany({ orderBy: { city: "asc" } });

  async function updateConfig(formData: FormData) {
    "use server";
    const city = formData.get("city") as string;
    const baseFare = Number(formData.get("baseFare"));
    const perKmRate = Number(formData.get("perKmRate"));

    await prisma.cityConfig.update({
      where: { city },
      data: { baseFare, perKmRate }
    });
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">Admin: City pricing</h1>
        <p className="text-sm text-slate-600">Update base fares and per-km rates.</p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {configs.map((config) => (
            <form key={config.id} action={updateConfig} className="grid gap-4 sm:grid-cols-4">
              <input type="hidden" name="city" value={config.city} />
              <div className="text-sm font-semibold text-slate-700">{config.city}</div>
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
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
