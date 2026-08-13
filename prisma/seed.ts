import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AquaLogix database...");

  // --- Roles ---
  const roleNames = ["ADMIN", "OPERATIONS_MANAGER", "ANALYST", "PARTNER"] as const;
  const roles = Object.fromEntries(
    await Promise.all(
      roleNames.map(async (name) => [name, await prisma.role.upsert({ where: { name }, update: {}, create: { name } })])
    )
  );

  // --- Users ---
  const passwordHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "admin@aqualogix.id" },
    update: {},
    create: {
      name: "Admin AquaLogix",
      email: "admin@aqualogix.id",
      passwordHash,
      roleId: roles["ADMIN"].id,
    },
  });
  await prisma.user.upsert({
    where: { email: "ops@aqualogix.id" },
    update: {},
    create: {
      name: "Manajer Operasional",
      email: "ops@aqualogix.id",
      passwordHash,
      roleId: roles["OPERATIONS_MANAGER"].id,
    },
  });

  // --- Provinces ---
  const provinceNames = [
    "Sulawesi Selatan",
    "Jawa Timur",
    "Maluku",
    "Sulawesi Utara",
    "DKI Jakarta",
    "Kalimantan Timur",
  ];
  const provinces: Record<string, Awaited<ReturnType<typeof prisma.province.upsert>>> = Object.fromEntries(
    await Promise.all(
      provinceNames.map(async (name) => [
        name,
        await prisma.province.upsert({ where: { name }, update: {}, create: { name } }),
      ])
    )
  );

  // --- Vendors ---
  const vendorData = [
    { name: "CV Bahari Jaya", onTimeRate: 0.71 },
    { name: "PT Nusantara Fresh", onTimeRate: 0.94 },
    { name: "UD Samudra Makmur", onTimeRate: 0.83 },
    { name: "PT Laut Lestari", onTimeRate: 0.89 },
  ];
  const vendors = [];
  for (const v of vendorData) {
    vendors.push(await prisma.vendor.create({ data: v }));
  }

  // --- Commodities + Inventory ---
  const commodityData = [
    { name: "Ikan Segar", unit: "ton", stockTon: 82, reorderPoint: 60 },
    { name: "Udang Beku", unit: "ton", stockTon: 45, reorderPoint: 50 },
    { name: "Cumi & Sotong", unit: "ton", stockTon: 30, reorderPoint: 25 },
    { name: "Kepiting & Rajungan", unit: "ton", stockTon: 18, reorderPoint: 20 },
  ];
  for (const c of commodityData) {
    const commodity = await prisma.commodity.create({ data: { name: c.name, unit: c.unit } });
    await prisma.inventory.create({
      data: { commodityId: commodity.id, stockTon: c.stockTon, reorderPoint: c.reorderPoint },
    });
  }

  // --- Shipments (last 7 days, mixed status) ---
  const provinceList = Object.values(provinces);
  const statuses = ["ontime", "ontime", "ontime", "late", "in_transit", "delivered"];
  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const shippedAt = new Date();
    shippedAt.setDate(shippedAt.getDate() - daysAgo);
    const status = statuses[Math.floor(Math.random() * statuses.length)] as string;
    await prisma.shipment.create({
      data: {
        vendorId: vendors[Math.floor(Math.random() * vendors.length)].id,
        provinceId: provinceList[Math.floor(Math.random() * provinceList.length)].id,
        status,
        delayHours: status === "late" ? Math.floor(Math.random() * 10) + 1 : null,
        shippedAt,
        deliveredAt: status === "delivered" ? new Date() : null,
      },
    });
  }

  // --- Fuel cost (last 7 days) ---
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await prisma.fuelCost.create({
      data: { date, pricePerLiter: 11000 + Math.floor(Math.random() * 800) },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
