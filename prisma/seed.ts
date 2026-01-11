import { PrismaClient, City, VehicleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const baseCityRates = [
    { city: City.DHAKA, baseFare: 30, perKmRate: 18 },
    { city: City.CHATTOGRAM, baseFare: 25, perKmRate: 16 },
    { city: City.SYLHET, baseFare: 22, perKmRate: 15 },
    { city: City.KHULNA, baseFare: 22, perKmRate: 15 },
    { city: City.OTHER, baseFare: 22, perKmRate: 15 }
  ];

  const vehicleRateMultipliers: Record<VehicleType, { base: number; perKm: number }> = {
    [VehicleType.RICKSHAW]: { base: 1, perKm: 1 },
    [VehicleType.CNG]: { base: 1.4, perKm: 1.35 },
    [VehicleType.AUTO_RICKSHAW]: { base: 1.2, perKm: 1.2 },
    [VehicleType.BIKE]: { base: 0.8, perKm: 0.85 },
    [VehicleType.CAR]: { base: 2.2, perKm: 1.9 },
    [VehicleType.MICROBUS]: { base: 2.5, perKm: 2.1 },
    [VehicleType.BUS]: { base: 0.7, perKm: 0.6 },
    [VehicleType.OTHER]: { base: 1, perKm: 1 }
  };

  for (const city of baseCityRates) {
    for (const vehicleType of Object.values(VehicleType)) {
      const multiplier = vehicleRateMultipliers[vehicleType];
      await prisma.vehicleFareConfig.upsert({
        where: { city_vehicleType: { city: city.city, vehicleType } },
        update: {
          baseFare: Math.round(city.baseFare * multiplier.base),
          perKmRate: Math.round(city.perKmRate * multiplier.perKm)
        },
        create: {
          city: city.city,
          vehicleType,
          baseFare: Math.round(city.baseFare * multiplier.base),
          perKmRate: Math.round(city.perKmRate * multiplier.perKm)
        }
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
