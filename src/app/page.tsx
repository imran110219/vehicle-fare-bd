import { prisma } from "@/lib/prisma";
import { EstimatorClient } from "@/components/EstimatorClient";
import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";

export default async function HomePage() {
  const configs = await prisma.vehicleFareConfig.findMany({
    orderBy: [{ city: "asc" }, { vehicleType: "asc" }]
  });
  const lang = (cookies().get("lang")?.value as Lang) || "en";

  return <EstimatorClient configs={configs} lang={lang} />;
}
