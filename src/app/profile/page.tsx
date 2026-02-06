import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getCityLabel, getDictionary, getVehicleTypeLabel, type Lang } from "@/lib/i18n";

const PAGE_SIZE = 10;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) || "en";
  const dictionary = getDictionary(lang);

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [reports, totalCount] = await Promise.all([
    prisma.fareReport.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE
    }),
    prisma.fareReport.count({
      where: { userId: session.user.id }
    })
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">{dictionary.profileTitle}</h1>
        <p className="text-sm text-slate-600">
          {dictionary.profileSubtitle}{" "}
          {dictionary.profileShowing
            .replace("{shown}", String(reports.length))
            .replace("{total}", String(totalCount))}
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500">{dictionary.profileNoSubmissions}</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border border-brand-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-800">
                    {getCityLabel(lang, report.city)} • {getVehicleTypeLabel(lang, report.vehicleType)}
                  </p>
                  <p className="text-sm text-slate-500">{report.createdAt.toLocaleString()}</p>
                </div>
                <p className="text-sm text-slate-700">
                  {report.pickupArea} to {report.dropArea} • {report.distanceKm.toFixed(1)} km
                </p>
                <p className="text-sm text-slate-700">
                  {dictionary.farePaidLabel}: BDT {report.farePaid}
                </p>
                {report.estimatedFareAtTime ? (
                  <p className="text-sm text-slate-700">
                    {dictionary.estimatedLabel}: BDT {report.estimatedFareAtTime} •{" "}
                    {formatDelta(dictionary.youPaidVsEstimated, report.farePaid, report.estimatedFareAtTime)}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">{dictionary.estimatedFareUnavailable}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/profile?page=${page - 1}`}
                className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-200"
              >
                {dictionary.previousLabel}
              </Link>
            )}
            <span className="text-sm text-slate-600">
              {dictionary.pageLabel} {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/profile?page=${page + 1}`}
                className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-200"
              >
                {dictionary.nextLabel}
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

function formatDelta(label: string, paid: number, estimated: number) {
  const delta = paid - estimated;
  const percent = estimated > 0 ? (delta / estimated) * 100 : 0;
  const sign = delta >= 0 ? "+" : "-";
  const absDelta = Math.abs(delta);
  const absPercent = Math.abs(percent);
  return `${label}: ${sign}BDT ${absDelta} (${sign}${absPercent.toFixed(0)}%)`;
}
