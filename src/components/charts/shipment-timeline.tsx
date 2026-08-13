"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  status: "success" | "warning" | "danger" | "accent";
}

const EVENTS: TimelineEvent[] = [
  { time: "06:20", title: "SHP-1041 berangkat", detail: "Bitung → Jakarta via PT Nusantara Fresh", status: "accent" },
  { time: "09:45", title: "SHP-1038 tiba tepat waktu", detail: "Makassar → Surabaya", status: "success" },
  { time: "11:10", title: "SHP-1032 terlambat 3 jam", detail: "Ambon → Makassar, cuaca buruk", status: "warning" },
  { time: "13:55", title: "SHP-1029 dibatalkan sementara", detail: "Kendala dokumen vendor CV Bahari Jaya", status: "danger" },
  { time: "16:30", title: "SHP-1045 berangkat", detail: "Jakarta → Balikpapan via PT Laut Lestari", status: "accent" },
];

const DOT_COLOR: Record<TimelineEvent["status"], string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  accent: "bg-accent",
};

export function ShipmentTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-sm font-medium">Linimasa Pengiriman Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-4">
          {EVENTS.map((event, i) => (
            <li key={i} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                  DOT_COLOR[event.status]
                )}
                aria-hidden="true"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">{event.time}</span>
                <Badge variant={event.status === "accent" ? "accent" : event.status}>{event.title}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
