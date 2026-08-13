import { Ship, Clock3, AlertTriangle, Warehouse, Fuel, TrendingUp, Database } from "lucide-react";
import { AiBriefingCard } from "@/components/dashboard/ai-briefing-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ShipmentTrendChart } from "@/components/charts/shipment-trend-chart";
import { InventoryDonutChart } from "@/components/charts/inventory-donut-chart";
import { ShipmentScatterChart } from "@/components/charts/shipment-scatter-chart";
import { VendorHeatmap } from "@/components/charts/vendor-heatmap";
import { ShipmentTimeline } from "@/components/charts/shipment-timeline";
import { IndonesiaMap } from "@/components/charts/indonesia-map";
import { Badge } from "@/components/ui/badge";
import { getDashboardKpis, getShipmentTrend, getInventoryDistribution } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic"; // always read fresh data, no static caching

export default async function DashboardPage() {
  const [kpis, trend, inventory] = await Promise.all([
    getDashboardKpis(),
    getShipmentTrend(),
    getInventoryDistribution(),
  ]);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold">Ringkasan Operasional</h1>
          <p className="text-sm text-muted-foreground">Senin, 6 Juli 2026 — data diperbarui otomatis</p>
        </div>
        <Badge variant={kpis.source === "database" ? "success" : "neutral"}>
          <Database className="h-3 w-3" aria-hidden="true" />
          {kpis.source === "database" ? "Data langsung dari database" : "Data demo (database belum diisi)"}
        </Badge>
      </div>

      <AiBriefingCard />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Pengiriman" value={kpis.totalShipments} icon={<Ship className="h-4 w-4 text-accent" aria-hidden="true" />} deltaPct={4.2} />
        <KpiCard label="Tepat Waktu" value={kpis.onTimePct} unit="%" icon={<Clock3 className="h-4 w-4 text-accent" aria-hidden="true" />} deltaPct={1.8} format="percent" />
        <KpiCard label="Terlambat" value={kpis.latePct} unit="%" icon={<AlertTriangle className="h-4 w-4 text-accent" aria-hidden="true" />} deltaPct={-1.8} format="percent" />
        <KpiCard label="Inventaris" value={kpis.inventoryTon} unit="ton" icon={<Warehouse className="h-4 w-4 text-accent" aria-hidden="true" />} deltaPct={2.1} />
        <KpiCard label="Biaya BBM" value={kpis.fuelCostPerLiter} unit="/L" icon={<Fuel className="h-4 w-4 text-accent" aria-hidden="true" />} deltaPct={-0.9} format="currency" />
        <KpiCard label="Margin Laba" value={kpis.profitMarginPct} unit="%" icon={<TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />} deltaPct={3.4} format="percent" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ShipmentTrendChart data={trend} />
        <InventoryDonutChart data={inventory} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ShipmentScatterChart />
        <VendorHeatmap />
      </div>

      <ShipmentTimeline />
      <IndonesiaMap />
    </div>
  );
}
