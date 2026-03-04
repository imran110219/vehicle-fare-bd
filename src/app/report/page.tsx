import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation";
import { hasProfanity } from "@/lib/profanity";
import { startOfDayBD } from "@/lib/rateLimit";
import { calculateFare } from "@/lib/fare";
import { cookies } from "next/headers";
import { getDictionary, type Lang } from "@/lib/i18n";
import { fareConfig } from "@/lib/config";
import ReportFormClient from "@/components/ReportFormClient";

export default async function ReportPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) || "en";
  const dictionary = getDictionary(lang);

  async function submitReport(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (!dbUser) {
      redirect("/login?error=stale");
    }

    const payload = {
      city: formData.get("city"),
      vehicleType: formData.get("vehicleType"),
      pickupArea: formData.get("pickupArea"),
      dropArea: formData.get("dropArea"),
      distanceKm: Number(formData.get("distanceKm")),
      farePaid: Number(formData.get("farePaid")),
      timeOfDay: formData.get("timeOfDay"),
      weather: formData.get("weather") || undefined,
      passengerCount: Number(formData.get("passengerCount")),
      luggage: formData.get("luggage") === "on",
      traffic: formData.get("traffic") === "on",
      negotiation: formData.get("negotiation"),
      notes: formData.get("notes") || undefined
    };

    const parsed = reportSchema.safeParse(payload);
    if (!parsed.success) {
      redirect("/report?error=invalid");
    }

    const textCheck = `${parsed.data.pickupArea} ${parsed.data.dropArea} ${parsed.data.notes || ""}`;
    if (hasProfanity(textCheck)) {
      redirect("/report?error=profanity");
    }

    const todayCount = await prisma.fareReport.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfDayBD() }
      }
    });
    if (todayCount >= fareConfig.maxReportsPerDay) {
      redirect("/report?error=rate_limit");
    }

    const duplicate = await prisma.fareReport.findFirst({
      where: {
        userId: session.user.id,
        pickupArea: parsed.data.pickupArea,
        dropArea: parsed.data.dropArea,
        vehicleType: parsed.data.vehicleType,
        farePaid: parsed.data.farePaid,
        distanceKm: parsed.data.distanceKm,
        createdAt: { gte: new Date(Date.now() - fareConfig.duplicateWindowMinutes * 60 * 1000) }
      }
    });

    if (duplicate) {
      redirect("/report?error=duplicate");
    }

    const config = await prisma.vehicleFareConfig.findUnique({
      where: {
        city_vehicleType: {
          city: parsed.data.city,
          vehicleType: parsed.data.vehicleType
        }
      }
    });
    const estimatedFareAtTime = config
      ? calculateFare({
          config,
          distanceKm: parsed.data.distanceKm,
          timeOfDay: parsed.data.timeOfDay,
          weather: parsed.data.weather,
          luggage: parsed.data.luggage,
          traffic: parsed.data.traffic
        }).totalFare
      : null;

    await prisma.fareReport.create({
      data: {
        userId: session.user.id,
        city: parsed.data.city,
        vehicleType: parsed.data.vehicleType,
        pickupArea: parsed.data.pickupArea,
        dropArea: parsed.data.dropArea,
        distanceKm: parsed.data.distanceKm,
        farePaid: parsed.data.farePaid,
        estimatedFareAtTime: estimatedFareAtTime ?? undefined,
        estimatorVersion: "v1",
        timeOfDay: parsed.data.timeOfDay,
        weather: parsed.data.weather,
        passengerCount: parsed.data.passengerCount,
        luggage: parsed.data.luggage,
        traffic: parsed.data.traffic,
        negotiation: parsed.data.negotiation,
        notes: parsed.data.notes || null
      }
    });

    redirect("/profile?success=1");
  }

  if (!session?.user) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">{dictionary.signInRequiredTitle}</h1>
        <p className="mt-2 text-sm text-slate-600">{dictionary.signInRequiredBody}</p>
        <a className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-white" href="/login">
          {dictionary.signInLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-brand-900">{dictionary.reportTitle}</h1>
      <p className="text-sm text-slate-600">{dictionary.reportSubtitle}</p>
      <ReportFormClient submitAction={submitReport} lang={lang} />
    </div>
  );
}
