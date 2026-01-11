import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation";
import { hasProfanity } from "@/lib/profanity";
import { startOfDayBD } from "@/lib/rateLimit";

export default async function ReportPage() {
  const session = await auth();

  async function submitReport(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      redirect("/login");
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
    if (todayCount >= 10) {
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
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }
      }
    });

    if (duplicate) {
      redirect("/report?error=duplicate");
    }

    await prisma.fareReport.create({
      data: {
        userId: session.user.id,
        city: parsed.data.city,
        vehicleType: parsed.data.vehicleType,
        pickupArea: parsed.data.pickupArea,
        dropArea: parsed.data.dropArea,
        distanceKm: parsed.data.distanceKm,
        farePaid: parsed.data.farePaid,
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
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-sm text-slate-600">Please sign in to submit fare reports.</p>
        <a className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-white" href="/login">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-brand-900">Submit a fare report</h1>
      <p className="text-sm text-slate-600">Share what you paid so the community can see fair ranges.</p>
      <form action={submitReport} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold">City</label>
            <select name="city" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
              <option value="DHAKA">Dhaka</option>
              <option value="CHATTOGRAM">Chattogram</option>
              <option value="SYLHET">Sylhet</option>
              <option value="KHULNA">Khulna</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Vehicle type</label>
            <select name="vehicleType" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
              <option value="RICKSHAW">Rickshaw</option>
              <option value="CNG">CNG</option>
              <option value="AUTO_RICKSHAW">Auto-rickshaw</option>
              <option value="BIKE">Bike</option>
              <option value="CAR">Car</option>
              <option value="MICROBUS">Microbus</option>
              <option value="BUS">Bus</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Time of day</label>
            <select name="timeOfDay" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
              <option value="MORNING">Morning</option>
              <option value="AFTERNOON">Afternoon</option>
              <option value="EVENING">Evening</option>
              <option value="NIGHT">Night</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Weather</label>
            <select name="weather" className="mt-2 w-full rounded-lg border border-brand-200 p-2">
              <option value="">Optional</option>
              <option value="CLEAR">Clear</option>
              <option value="RAIN">Rain</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Passengers</label>
            <input
              name="passengerCount"
              type="number"
              min={1}
              max={3}
              defaultValue={1}
              className="mt-2 w-full rounded-lg border border-brand-200 p-2"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input name="pickupArea" placeholder="Pickup area" className="rounded-lg border border-brand-200 p-2" />
          <input name="dropArea" placeholder="Drop area" className="rounded-lg border border-brand-200 p-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input name="distanceKm" type="number" step="0.1" placeholder="Distance (km)" className="rounded-lg border border-brand-200 p-2" />
          <input name="farePaid" type="number" placeholder="Fare paid (BDT)" className="rounded-lg border border-brand-200 p-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input name="luggage" type="checkbox" /> Luggage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="traffic" type="checkbox" /> Heavy traffic
          </label>
          <select name="negotiation" className="rounded-lg border border-brand-200 p-2">
            <option value="EASY">Negotiation: Easy</option>
            <option value="MEDIUM">Negotiation: Medium</option>
            <option value="HARD">Negotiation: Hard</option>
          </select>
        </div>

        <textarea name="notes" placeholder="Notes (optional)" className="rounded-lg border border-brand-200 p-2" />

        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white">
          Submit report
        </button>
      </form>
    </div>
  );
}
