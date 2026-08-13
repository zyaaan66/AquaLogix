import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface ShipmentRow {
  id: string;
  vendor: string;
  province: string;
  status: string;
  delayHours: number | null;
  shippedAt: Date;
}

export async function getShipments(): Promise<{ rows: ShipmentRow[]; source: "database" | "demo" }> {
  try {
    const shipments = await prisma.shipment.findMany({
      include: { vendor: true, province: true },
      orderBy: { shippedAt: "desc" },
      take: 50,
    });
    if (shipments.length === 0) return { rows: demoShipments(), source: "demo" };
    return {
      rows: shipments.map((s: (typeof shipments)[number]) => ({
        id: s.id,
        vendor: s.vendor.name,
        province: s.province.name,
        status: s.status,
        delayHours: s.delayHours,
        shippedAt: s.shippedAt,
      })),
      source: "database",
    };
  } catch (err) {
    logger.error("Failed to read shipments, using demo data", { err });
    return { rows: demoShipments(), source: "demo" };
  }
}

function demoShipments(): ShipmentRow[] {
  return [
    { id: "demo-1", vendor: "CV Samudra Jaya", province: "Papua Tengah", status: "ontime", delayHours: null, shippedAt: new Date() },
    { id: "demo-2", vendor: "PT Nelayan Makmur", province: "Papua", status: "late", delayHours: 6, shippedAt: new Date() },
    { id: "demo-3", vendor: "UD Bahari Segar", province: "Papua Barat", status: "delivered", delayHours: null, shippedAt: new Date() },
  ];
}

export interface InventoryRow {
  id: string;
  commodity: string;
  unit: string;
  stockTon: number;
  reorderPoint: number;
  updatedAt: Date;
}

export async function getInventoryList(): Promise<{ rows: InventoryRow[]; source: "database" | "demo" }> {
  try {
    const rows = await prisma.inventory.findMany({ include: { commodity: true }, orderBy: { updatedAt: "desc" } });
    if (rows.length === 0) return { rows: demoInventory(), source: "demo" };
    return {
      rows: rows.map((r: (typeof rows)[number]) => ({
        id: r.id,
        commodity: r.commodity.name,
        unit: r.commodity.unit,
        stockTon: r.stockTon,
        reorderPoint: r.reorderPoint,
        updatedAt: r.updatedAt,
      })),
      source: "database",
    };
  } catch (err) {
    logger.error("Failed to read inventory, using demo data", { err });
    return { rows: demoInventory(), source: "demo" };
  }
}

function demoInventory(): InventoryRow[] {
  return [
    { id: "demo-1", commodity: "Ikan Segar", unit: "kg", stockTon: 42, reorderPoint: 20, updatedAt: new Date() },
    { id: "demo-2", commodity: "Udang Beku", unit: "kg", stockTon: 28, reorderPoint: 15, updatedAt: new Date() },
    { id: "demo-3", commodity: "Cumi & Sotong", unit: "kg", stockTon: 18, reorderPoint: 20, updatedAt: new Date() },
  ];
}

export interface VendorRow {
  id: string;
  name: string;
  onTimeRate: number;
  contact: string | null;
  isActive: boolean;
}

export async function getVendors(): Promise<{ rows: VendorRow[]; source: "database" | "demo" }> {
  try {
    const rows = await prisma.vendor.findMany({ orderBy: { onTimeRate: "desc" } });
    if (rows.length === 0) return { rows: demoVendors(), source: "demo" };
    return { rows, source: "database" };
  } catch (err) {
    logger.error("Failed to read vendors, using demo data", { err });
    return { rows: demoVendors(), source: "demo" };
  }
}

function demoVendors(): VendorRow[] {
  return [
    { id: "demo-1", name: "CV Samudra Jaya", onTimeRate: 0.94, contact: "0812-xxxx-xxxx", isActive: true },
    { id: "demo-2", name: "PT Nelayan Makmur", onTimeRate: 0.81, contact: "0813-xxxx-xxxx", isActive: true },
    { id: "demo-3", name: "UD Bahari Segar", onTimeRate: 0.76, contact: null, isActive: false },
  ];
}