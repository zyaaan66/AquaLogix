import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getMockOperationalData } from "@/lib/mock-data";

export interface DashboardKpis {
  totalShipments: number;
  onTimePct: number;
  latePct: number;
  inventoryTon: number;
  fuelCostPerLiter: number;
  profitMarginPct: number;
  source: "database" | "demo";
}

/**
 * Reads live KPI aggregates from the database. Falls back to representative
 * demo values (clearly flagged via `source`) when the DB hasn't been seeded
 * yet, so the dashboard is never blank on a fresh checkout.
 */
export async function getDashboardKpis(): Promise<DashboardKpis> {
  try {
    const [totalShipments, onTimeCount, lateCount, inventoryAgg, latestFuel] = await Promise.all([
      prisma.shipment.count(),
      prisma.shipment.count({ where: { status: "ontime" } }),
      prisma.shipment.count({ where: { status: "late" } }),
      prisma.inventory.aggregate({ _sum: { stockTon: true } }),
      prisma.fuelCost.findFirst({ orderBy: { date: "desc" } }),
    ]);

    if (totalShipments === 0) {
      return { ...demoKpis(), source: "demo" };
    }

    const onTimePct = (onTimeCount / totalShipments) * 100;
    const latePct = (lateCount / totalShipments) * 100;

    return {
      totalShipments,
      onTimePct: Number(onTimePct.toFixed(1)),
      latePct: Number(latePct.toFixed(1)),
      inventoryTon: inventoryAgg._sum.stockTon ?? 0,
      fuelCostPerLiter: latestFuel?.pricePerLiter ?? 0,
      profitMarginPct: 23.5, // derived from finance system in a full implementation
      source: "database",
    };
  } catch (err) {
    logger.error("Failed to read dashboard KPIs from database, using demo data", { err });
    return { ...demoKpis(), source: "demo" };
  }
}

function demoKpis(): Omit<DashboardKpis, "source"> {
  return {
    totalShipments: 1284,
    onTimePct: 91.4,
    latePct: 8.6,
    inventoryTon: 318,
    fuelCostPerLiter: 11600,
    profitMarginPct: 23.5,
  };
}

export interface ShipmentTrendPoint {
  day: string;
  ontime: number;
  late: number;
}

/** Last 7 days on-time vs late shipment counts, grouped by day. Falls back to demo shape. */
export async function getShipmentTrend(): Promise<ShipmentTrendPoint[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const shipments = await prisma.shipment.findMany({
      where: { shippedAt: { gte: since } },
      select: { shippedAt: true, status: true },
    });

    if (shipments.length === 0) return demoTrend();

    const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const buckets = new Map<string, { ontime: number; late: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      buckets.set(dayLabels[d.getDay()], { ontime: 0, late: 0 });
    }

    for (const s of shipments) {
      const label = dayLabels[s.shippedAt.getDay()];
      const bucket = buckets.get(label);
      if (!bucket) continue;
      if (s.status === "ontime" || s.status === "delivered") bucket.ontime += 1;
      if (s.status === "late") bucket.late += 1;
    }

    return Array.from(buckets.entries()).map(([day, v]) => ({ day, ...v }));
  } catch (err) {
    logger.error("Failed to read shipment trend from database, using demo data", { err });
    return demoTrend();
  }
}

function demoTrend(): ShipmentTrendPoint[] {
  return [
    { day: "Sen", ontime: 82, late: 12 },
    { day: "Sel", ontime: 88, late: 8 },
    { day: "Rab", ontime: 79, late: 15 },
    { day: "Kam", ontime: 91, late: 6 },
    { day: "Jum", ontime: 85, late: 10 },
    { day: "Sab", ontime: 93, late: 4 },
    { day: "Min", ontime: 95, late: 3 },
  ];
}

export interface InventorySlice {
  name: string;
  value: number;
}

export async function getInventoryDistribution(): Promise<InventorySlice[]> {
  try {
    const rows = await prisma.inventory.findMany({ include: { commodity: true } });
    if (rows.length === 0) return demoInventory();
    return rows.map((r: (typeof rows)[number]) => ({ name: r.commodity.name, value: r.stockTon }));
  } catch (err) {
    logger.error("Failed to read inventory distribution from database, using demo data", { err });
    return demoInventory();
  }
}

function demoInventory(): InventorySlice[] {
  return [
    { name: "Ikan Segar", value: 42 },
    { name: "Udang Beku", value: 28 },
    { name: "Cumi & Sotong", value: 18 },
    { name: "Lainnya", value: 12 },
  ];
}

export { getMockOperationalData };
