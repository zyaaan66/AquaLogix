"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  deltaPct: number; // positive = improvement
  icon: ReactNode;
  format?: "number" | "currency" | "percent";
}

function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

export function KpiCard({ label, value, unit, deltaPct, icon, format = "number" }: KpiCardProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const animated = useCountUp(value, inView);
  const positive = deltaPct >= 0;

  const display =
    format === "currency"
      ? formatNumber(animated, { maximumFractionDigits: 0 })
      : format === "percent"
      ? `${animated.toFixed(1)}%`
      : formatNumber(Math.round(animated));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="hover:shadow-glow-accent/40 transition-shadow duration-300">
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            {icon}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold tabular-nums">{display}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              positive ? "text-success" : "text-danger"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{Math.abs(deltaPct)}% vs minggu lalu</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
