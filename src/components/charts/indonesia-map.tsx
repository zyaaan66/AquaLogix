"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Real Indonesia province-boundary map, sourced from an open-source SVG (see
// attribution + license in README.md). The file lives at /public/maps/indonesia.svg
// and has been recolored (fill/stroke only — no shapes altered) to match the
// AquaLogix Dark Premium palette. Data markers below are overlaid on top using
// coordinates computed from that same SVG's own viewBox (0 0 2021 922), so they
// land on the correct province regardless of screen size.
const MAP_VIEWBOX = "0 0 2021 922";

const PROVINCE_POINTS = [
  { name: "Sulawesi Selatan", x: 1077, y: 585, shipments: 320, risk: "low" as const },
  { name: "Jawa Timur", x: 752, y: 758, shipments: 410, risk: "low" as const },
  { name: "Maluku", x: 1445, y: 565, shipments: 95, risk: "high" as const },
  { name: "Sulawesi Utara", x: 1229, y: 375, shipments: 140, risk: "medium" as const },
  { name: "Kalimantan Timur", x: 950, y: 420, shipments: 178, risk: "medium" as const },
  // Jakarta isn't tagged as its own shape in the source map (too small at this
  // scale), so this marker is manually placed on the north coast of Java near
  // where Jakarta actually sits.
  { name: "DKI Jakarta", x: 500, y: 685, shipments: 260, risk: "low" as const },
];

const RISK_COLOR = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };

export function IndonesiaMap() {
  const [hovered, setHovered] = useState<(typeof PROVINCE_POINTS)[number] | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-sm font-medium">
          Sebaran Pengiriman per Provinsi (Indonesia)
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Peta batas provinsi sesungguhnya (sumber &amp; lisensi di README).
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-sm border border-border" style={{ aspectRatio: "2021 / 922" }}>
          {/* Base map: real province boundaries, rendered as a static image so
              none of the original SVG's markup needs converting to JSX. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maps/indonesia.svg"
            alt="Peta batas provinsi Indonesia"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Interactive overlay: shipping lane + data markers, in the same
              coordinate space as the underlying map so they line up exactly. */}
          <svg viewBox={MAP_VIEWBOX} className="absolute inset-0 h-full w-full" role="img" aria-label="Penanda data pengiriman per provinsi">
            <path
              d={`M ${PROVINCE_POINTS[5].x} ${PROVINCE_POINTS[5].y} Q ${PROVINCE_POINTS[1].x} ${PROVINCE_POINTS[1].y + 40} ${PROVINCE_POINTS[0].x} ${PROVINCE_POINTS[0].y} T ${PROVINCE_POINTS[2].x} ${PROVINCE_POINTS[2].y}`}
              stroke="#0EA5E9"
              strokeWidth={4}
              fill="none"
              strokeDasharray="2 20"
              strokeLinecap="round"
              opacity={0.7}
            />
            {PROVINCE_POINTS.map((p) => {
              const r = Math.max(16, p.shipments / 6);
              const isHovered = hovered?.name === p.name;
              return (
                <g
                  key={p.name}
                  transform={`translate(${p.x}, ${p.y})`}
                  onMouseEnter={() => setHovered(p)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  <circle r={r + 14} fill={RISK_COLOR[p.risk]} fillOpacity={isHovered ? 0.18 : 0} className="transition-all duration-200" />
                  <circle r={r} fill={RISK_COLOR[p.risk]} fillOpacity={isHovered ? 0.95 : 0.8} stroke="#0F172A" strokeWidth={3} className="transition-all duration-200" />
                  <text y={-r - 14} fontSize="26" textAnchor="middle" fill="#F8FAFC" fontWeight={isHovered ? 700 : 500} style={{ paintOrder: "stroke", stroke: "#0F172A", strokeWidth: 5 }}>
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {hovered && (
            <div className="pointer-events-none absolute left-2 top-2 rounded-sm border border-border bg-popover px-2.5 py-1.5 text-xs shadow-card animate-fade-up">
              <p className="font-medium">{hovered.name}</p>
              <p className="text-muted-foreground">{hovered.shipments} pengiriman aktif</p>
            </div>
          )}
        </div>

        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          {(["low", "medium", "high"] as const).map((r) => (
            <span key={r} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: RISK_COLOR[r] }} />
              Risiko {r === "low" ? "rendah" : r === "medium" ? "sedang" : "tinggi"}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
