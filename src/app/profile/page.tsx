import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const reports = await prisma.fareReport.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">My submissions</h1>
        <p className="text-sm text-slate-600">Track your submitted fares.</p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border border-brand-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-800">
                    {report.city} • {report.vehicleType}
                  </p>
                  <p className="text-sm text-slate-500">{report.createdAt.toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-700">
                  {report.pickupArea} to {report.dropArea} • {report.distanceKm.toFixed(1)} km
                </p>
                <p className="text-sm text-slate-700">Fare paid: BDT {report.farePaid}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
