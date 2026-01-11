import { PrismaClient, City, VehicleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seedUsers = [
    { id: "seed-user-1", name: "Seed User 1", email: "seed1@example.com" },
    { id: "seed-user-2", name: "Seed User 2", email: "seed2@example.com" }
  ];
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, email: user.email },
      create: { id: user.id, name: user.name, email: user.email }
    });
  }

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

  const now = new Date();
  const fareReports = [
    {
      userId: "seed-user-1",
      city: City.DHAKA,
      vehicleType: VehicleType.RICKSHAW,
      pickupArea: "Dhanmondi",
      dropArea: "Kalabagan",
      distanceKm: 2.4,
      farePaid: 60,
      timeOfDay: "MORNING",
      weather: "CLEAR",
      passengerCount: 1,
      luggage: false,
      traffic: false,
      negotiation: "MEDIUM",
      notes: "Short local ride",
      createdAt: now
    },
    {
      userId: "seed-user-2",
      city: City.DHAKA,
      vehicleType: VehicleType.CNG,
      pickupArea: "Gulshan",
      dropArea: "Banani",
      distanceKm: 3.2,
      farePaid: 120,
      timeOfDay: "EVENING",
      weather: "CLEAR",
      passengerCount: 2,
      luggage: false,
      traffic: true,
      negotiation: "HARD",
      notes: "Peak hour",
      createdAt: now
    },
    {
      userId: "seed-user-1",
      city: City.DHAKA,
      vehicleType: VehicleType.BIKE,
      pickupArea: "Mirpur 10",
      dropArea: "Kazipara",
      distanceKm: 4.5,
      farePaid: 80,
      timeOfDay: "AFTERNOON",
      weather: "CLEAR",
      passengerCount: 1,
      luggage: false,
      traffic: false,
      negotiation: "EASY",
      notes: "Quick commute",
      createdAt: now
    },
    {
      userId: "seed-user-2",
      city: City.CHATTOGRAM,
      vehicleType: VehicleType.AUTO_RICKSHAW,
      pickupArea: "GEC",
      dropArea: "Agrabad",
      distanceKm: 5.1,
      farePaid: 140,
      timeOfDay: "MORNING",
      weather: "CLEAR",
      passengerCount: 2,
      luggage: false,
      traffic: false,
      negotiation: "MEDIUM",
      notes: "Main road",
      createdAt: now
    },
    {
      userId: "seed-user-1",
      city: City.CHATTOGRAM,
      vehicleType: VehicleType.CAR,
      pickupArea: "Pahartali",
      dropArea: "Nasirabad",
      distanceKm: 6.3,
      farePaid: 260,
      timeOfDay: "NIGHT",
      weather: "RAIN",
      passengerCount: 3,
      luggage: true,
      traffic: false,
      negotiation: "HARD",
      notes: "Rain premium",
      createdAt: now
    },
    {
      userId: "seed-user-2",
      city: City.SYLHET,
      vehicleType: VehicleType.CNG,
      pickupArea: "Zindabazar",
      dropArea: "Amberkhana",
      distanceKm: 2.0,
      farePaid: 70,
      timeOfDay: "AFTERNOON",
      weather: "CLEAR",
      passengerCount: 1,
      luggage: false,
      traffic: false,
      negotiation: "EASY",
      notes: "Short hop",
      createdAt: now
    },
    {
      userId: "seed-user-1",
      city: City.SYLHET,
      vehicleType: VehicleType.BUS,
      pickupArea: "Subhanighat",
      dropArea: "Tilagor",
      distanceKm: 7.8,
      farePaid: 40,
      timeOfDay: "MORNING",
      weather: "CLEAR",
      passengerCount: 1,
      luggage: false,
      traffic: false,
      negotiation: "EASY",
      notes: "Shared bus",
      createdAt: now
    },
    {
      userId: "seed-user-2",
      city: City.KHULNA,
      vehicleType: VehicleType.RICKSHAW,
      pickupArea: "Sonadanga",
      dropArea: "Khalishpur",
      distanceKm: 3.6,
      farePaid: 75,
      timeOfDay: "EVENING",
      weather: "CLEAR",
      passengerCount: 1,
      luggage: false,
      traffic: true,
      negotiation: "MEDIUM",
      notes: "Market traffic",
      createdAt: now
    },
    {
      userId: "seed-user-1",
      city: City.KHULNA,
      vehicleType: VehicleType.BIKE,
      pickupArea: "Daulatpur",
      dropArea: "Shibbari",
      distanceKm: 5.4,
      farePaid: 90,
      timeOfDay: "NIGHT",
      weather: "CLEAR",
      passengerCount: 1,
      luggage: false,
      traffic: false,
      negotiation: "EASY",
      notes: "Late ride",
      createdAt: now
    },
    {
      userId: "seed-user-2",
      city: City.OTHER,
      vehicleType: VehicleType.CNG,
      pickupArea: "City Center",
      dropArea: "Bus Stand",
      distanceKm: 3.0,
      farePaid: 80,
      timeOfDay: "AFTERNOON",
      weather: "CLEAR",
      passengerCount: 2,
      luggage: false,
      traffic: false,
      negotiation: "MEDIUM",
      notes: "Medium distance",
      createdAt: now
    }
  ];

  for (const report of fareReports) {
    await prisma.fareReport.create({ data: report });
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
