import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
}

/**
 * Builds the notification list from real business signals instead of static
 * placeholder text: shipments currently late, inventory below its reorder
 * point, and the most recent AI insight if it wasn't "AMAN". Falls back to a
 * small set of representative demo notifications if the database is empty,
 * consistent with how the rest of the dashboard signals demo vs. live data.
 */
export async function getNotifications(): Promise<{ items: Notification[]; source: "database" | "demo" }> {
  try {
    const [lateShipments, lowStock, latestInsight] = await Promise.all([
      prisma.shipment.findMany({
        where: { status: "late" },
        include: { vendor: true, province: true },
        orderBy: { shippedAt: "desc" },
        take: 3,
      }),
      prisma.inventory.findMany({ include: { commodity: true } }),
      prisma.predictionHistory.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

    const totalShipmentCount = await prisma.shipment.count();
    if (totalShipmentCount === 0) {
      return { items: demoNotifications(), source: "demo" };
    }

    const items: Notification[] = [];

    if (lateShipments.length > 0) {
      const routes = lateShipments.map((s: (typeof lateShipments)[number]) => `${s.vendor.name} → ${s.province.name}`).join(", ");
      items.push({
        id: "late-shipments",
        title: `${lateShipments.length} pengiriman terlambat`,
        message: `Rute berisiko: ${routes}`,
        severity: "danger",
      });
    }

    const belowReorder = lowStock.filter((r: (typeof lowStock)[number]) => r.stockTon < r.reorderPoint);
    if (belowReorder.length > 0) {
      const names = belowReorder.map((r: (typeof belowReorder)[number]) => r.commodity.name).join(", ");
      items.push({
        id: "low-stock",
        title: `${belowReorder.length} komoditas di bawah titik reorder`,
        message: names,
        severity: "warning",
      });
    }

    if (latestInsight && latestInsight.status !== "AMAN") {
      items.push({
        id: "ai-insight",
        title: `Briefing AI terbaru: ${latestInsight.status}`,
        message: latestInsight.summary,
        severity: latestInsight.status === "KRITIS" ? "danger" : "warning",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "all-clear",
        title: "Semua operasional normal",
        message: "Tidak ada pengiriman terlambat atau stok kritis saat ini.",
        severity: "info",
      });
    }

    return { items, source: "database" };
  } catch (err) {
    logger.error("Failed to build notifications, using demo data", { err });
    return { items: demoNotifications(), source: "demo" };
  }
}

function demoNotifications(): Notification[] {
  return [
    {
      id: "demo-late",
      title: "3 pengiriman berisiko terlambat",
      message: "Rute Makassar–Surabaya menunjukkan pola keterlambatan berulang.",
      severity: "warning",
    },
    {
      id: "demo-stock",
      title: "Stok Udang Beku menipis",
      message: "Sudah di bawah titik reorder 50 ton.",
      severity: "danger",
    },
  ];
}
