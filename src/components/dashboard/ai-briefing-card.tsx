"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "AMAN" | "WASPADA" | "KRITIS";

interface Insight {
  status: Status;
  summary: string;
  priority_score: number;
  risk_level: string;
  recommendation: string[];
  prediction: string;
  confidence: number;
}

const STATUS_MAP: Record<Status, { variant: "success" | "warning" | "danger"; label: string }> = {
  AMAN: { variant: "success", label: "Aman" },
  WASPADA: { variant: "warning", label: "Waspada" },
  KRITIS: { variant: "danger", label: "Kritis" },
};

/** Typewriter reveal for the AI summary — purely presentational, text is already fetched. */
function TypedText({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useState(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  });
  return <p className="text-sm leading-relaxed text-foreground/90">{shown}</p>;
}

export function AiBriefingCard() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateInsight() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "X-Requested-With": "AquaLogix" },
      });
      if (!res.ok) throw new Error("Gagal menghasilkan insight");
      const data: Insight = await res.json();
      setInsight(data);
    } catch (e) {
      setError("Tidak dapat menghasilkan insight saat ini. Coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="gradient-border">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
          <CardTitle className="text-foreground text-base font-display font-semibold">
            Executive AI Briefing
          </CardTitle>
        </div>
        <Button id="generate-insight-btn" size="sm" onClick={generateInsight} loading={loading}>
          Generate Today&apos;s Insight
        </Button>
      </CardHeader>

      <CardContent>
        {!insight && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            Belum ada briefing hari ini. Tekan tombol di atas untuk menganalisis data operasional
            terkini menggunakan AI.
          </p>
        )}

        {loading && (
          <div className="space-y-2" aria-live="polite" aria-busy="true">
            <div className="h-4 w-2/3 rounded shimmer-bg" />
            <div className="h-4 w-full rounded shimmer-bg" />
            <div className="h-4 w-5/6 rounded shimmer-bg" />
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <AnimatePresence>
          {insight && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_MAP[insight.status].variant}>
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  {STATUS_MAP[insight.status].label}
                </Badge>
                <Badge variant="accent">Prioritas {insight.priority_score}/100</Badge>
                <Badge variant="neutral">Risiko: {insight.risk_level}</Badge>
              </div>

              <TypedText text={insight.summary} />

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Rekomendasi</p>
                <ul className="space-y-1 text-sm">
                  {insight.recommendation.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 rounded-sm bg-muted/40 px-2.5 py-2 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span className="text-muted-foreground">{insight.prediction}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Keyakinan model</span>
                <div className="h-1.5 flex-1 max-w-[160px] overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-accent transition-all duration-700 ease-cubic"
                    )}
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums">{insight.confidence}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
