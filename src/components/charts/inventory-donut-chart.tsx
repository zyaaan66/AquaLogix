"use client";

import { useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportNodeToPng } from "@/lib/export";
import type { InventorySlice } from "@/lib/dashboard-data";

const COLORS = ["#0EA5E9", "#38BDF8", "#0284C7", "#334155", "#64748B"];

export function InventoryDonutChart({ data }: { data: InventorySlice[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-foreground text-sm font-medium">
          Distribusi Inventaris per Komoditas
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Export CSV" onClick={() => exportToCsv("distribusi-inventaris", data)}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export PNG"
            onClick={() => containerRef.current && exportNodeToPng(containerRef.current, "distribusi-inventaris")}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-64" ref={containerRef}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
