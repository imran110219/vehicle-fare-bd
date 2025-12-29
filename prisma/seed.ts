import { PrismaClient, City } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cities = [
    { city: City.DHAKA, baseFare: 30, perKmRate: 18 },
    { city: City.CHATTOGRAM, baseFare: 25, perKmRate: 16 },
    { city: City.SYLHET, baseFare: 22, perKmRate: 15 }
  ];

  for (const city of cities) {
    await prisma.cityConfig.upsert({
      where: { city: city.city },
      update: {
        baseFare: city.baseFare,
        perKmRate: city.perKmRate
      },
      create: city
    });
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
