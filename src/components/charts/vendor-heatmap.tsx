"use client";

import { useRef } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToCsv, exportNodeToPng } from "@/lib/export";

const VENDORS = ["Bahari Jaya", "Nusantara Fresh", "Samudra Makmur", "Laut Lestari"];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// on-time rate 0-1 per vendor per day — demo values.
// eslint-disable-next-line no-restricted-syntax
const MATRIX = [
  [0.9, 0.85, 0.95, 0.8, 0.7, 0.6, 0.75],
  [0.95, 0.97, 0.92, 0.96, 0.94, 0.98, 0.93],
  [0.7, 0.65, 0.8, 0.75, 0.6, 0.55, 0.7],
  [0.85, 0.88, 0.9, 0.82, 0.86, 0.89, 0.91],
];

function colorFor(rate: number) {
  // interpolate from danger (low) to success (high) through the accent hue
  if (rate >= 0.85) return "#10B981";
  if (rate >= 0.7) return "#0EA5E9";
  if (rate >= 0.6) return "#F59E0B";
  return "#EF4444";
}

export function VendorHeatmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rows = VENDORS.map((vendor, vi) => ({
    vendor,
    ...Object.fromEntries(DAYS.map((day, di) => [day, Math.round(MATRIX[vi][di] * 100)])),
  }));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-foreground text-sm font-medium">
          Heatmap Ketepatan Waktu Vendor
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" aria-label="Export CSV" onClick={() => exportToCsv("heatmap-vendor", rows)}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export PNG"
            onClick={() => containerRef.current && exportNodeToPng(containerRef.current, "heatmap-vendor")}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={containerRef}>
        <svg viewBox="0 0 560 200" className="w-full h-auto" role="img" aria-label="Heatmap ketepatan waktu vendor per hari">
          {VENDORS.map((vendor, vi) => (
            <g key={vendor}>
              <text x={0} y={30 + vi * 40 + 14} fontSize="11" fill="hsl(var(--muted-foreground))">
                {vendor}
              </text>
              {DAYS.map((day, di) => {
                const rate = MATRIX[vi][di];
                return (
                  <g key={day} transform={`translate(${140 + di * 58}, ${vi * 40 + 12})`}>
                    <rect
                      width={48}
                      height={28}
                      rx={6}
                      fill={colorFor(rate)}
                      fillOpacity={0.25 + rate * 0.6}
                    >
                      <title>{`${vendor} — ${day}: ${Math.round(rate * 100)}% tepat waktu`}</title>
                    </rect>
                    <text
                      x={24}
                      y={18}
                      fontSize="10"
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                    >
                      {Math.round(rate * 100)}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          {DAYS.map((day, di) => (
            <text
              key={day}
              x={164 + di * 58}
              y={12}
              fontSize="11"
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
            >
              {day}
            </text>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
