"use client";

import { useRef } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportNodeToPng } from "@/lib/export";

// Demo distribution: distance (km) vs delay (hours), sized by shipment volume (ton).
// In Tahap berikutnya, ganti dengan agregat nyata dari tabel Shipment (jarak rute × delayHours).
const data = [
  { distance: 120, delay: 1, volume: 8 },
  { distance: 340, delay: 3, volume: 12 },
  { distance: 560, delay: 6, volume: 20 },
  { distance: 210, delay: 2, volume: 10 },
  { distance: 780, delay: 9, volume: 25 },
  { distance: 95, delay: 0.5, volume: 6 },
  { distance: 430, delay: 4, volume: 15 },
  { distance: 660, delay: 7, volume: 22 },
];

export function ShipmentScatterChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-foreground text-sm font-medium">
          Korelasi Jarak Rute vs Keterlambatan
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Export CSV" onClick={() => exportToCsv("jarak-vs-keterlambatan", data)}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export PNG"
            onClick={() => containerRef.current && exportNodeToPng(containerRef.current, "jarak-vs-keterlambatan")}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-64" ref={containerRef}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="distance"
              name="Jarak"
              unit=" km"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              type="number"
              dataKey="delay"
              name="Keterlambatan"
              unit=" jam"
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <ZAxis type="number" dataKey="volume" range={[60, 300]} name="Volume" unit=" ton" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Scatter data={data} fill="#0EA5E9" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
