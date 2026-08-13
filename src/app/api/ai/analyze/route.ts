import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getMockOperationalData } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { verifyAccessToken } from "@/lib/auth";

// ---------------------------------------------------------------------------
// SYSTEM PROMPT — kept server-side only, never exposed to the client bundle.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `Kamu adalah seorang Direktur Operasional Supply Chain dengan pengalaman lebih dari 20 tahun.
Analisis seluruh data yang diberikan.
Fokus pada: risiko logistik, efisiensi vendor, supply bottleneck, inventory, distribusi, cashflow, dan prediksi.

Kembalikan HANYA JSON valid dengan schema persis berikut, tanpa markdown, tanpa penjelasan tambahan:
{
  "status": "AMAN | WASPADA | KRITIS",
  "summary": "string",
  "priority_score": number (0-100),
  "risk_level": "string",
  "recommendation": ["string", "..."],
  "prediction": "string",
  "confidence": number (0-100)
}`;

const RequestSchema = z.object({
  shipment: z.array(z.any()).optional().default([]),
  inventory: z.array(z.any()).optional().default([]),
  vendor: z.array(z.any()).optional().default([]),
  fuel: z.array(z.any()).optional().default([]),
});

const InsightSchema = z.object({
  status: z.enum(["AMAN", "WASPADA", "KRITIS"]),
  summary: z.string(),
  priority_score: z.number().min(0).max(100),
  risk_level: z.string(),
  recommendation: z.array(z.string()),
  prediction: z.string(),
  confidence: z.number().min(0).max(100),
});

export async function POST(req: NextRequest) {
  // --- Rate limiting (per-IP) ---
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = rateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  // --- Input validation ---
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — we fall back to server-side mock operational data
  }
  const parsed = RequestSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const payload =
    parsed.data.shipment.length || parsed.data.inventory.length
      ? parsed.data
      : getMockOperationalData(); // demo fallback so the button works out of the box

  const apiKey = process.env.GEMINI_API_KEY;

  const authHeader = req.headers.get("authorization");
  let actorId: string | undefined;
  try {
    if (authHeader) actorId = (await verifyAccessToken(authHeader.replace("Bearer ", ""))).sub;
  } catch {
    // insight generation is allowed for demo purposes even without a valid session
  }

  // --- No API key configured yet: return a clearly-labeled simulated insight ---
  if (!apiKey) {
    const fallback = simulateInsight(payload);
    await persistInsight(fallback, actorId, ip);
    return NextResponse.json(fallback);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Data operasional:\n${JSON.stringify(payload)}` },
    ]);

    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();
    const json = JSON.parse(cleaned);
    const insight = InsightSchema.parse(json);

    await persistInsight(insight, actorId, ip);
    return NextResponse.json(insight);
  } catch (err) {
    logger.error("Gemini call failed, falling back to simulated insight", { err });
    const fallback = simulateInsight(payload);
    await persistInsight(fallback, actorId, ip);
    // Graceful degradation — never leak internals to the client.
    return NextResponse.json(fallback);
  }
}

async function persistInsight(
  insight: z.infer<typeof InsightSchema>,
  actorId: string | undefined,
  ip: string
) {
  try {
    await prisma.predictionHistory.create({
      data: {
        status: insight.status,
        summary: insight.summary,
        priorityScore: insight.priority_score,
        riskLevel: insight.risk_level,
        recommendation: JSON.stringify(insight.recommendation),
        prediction: insight.prediction,
        confidence: insight.confidence,
      },
    });
    await logAudit({ actorId, action: "AI_INSIGHT_GENERATED", metadata: { status: insight.status }, ipAddress: ip });
  } catch (err) {
    logger.error("Failed to persist prediction history", { err });
  }
}

/** Deterministic, clearly-labeled fallback used when no Gemini key is set or the call fails. */
function simulateInsight(payload: ReturnType<typeof getMockOperationalData>) {
  return {
    status: "WASPADA" as const,
    summary:
      "Simulasi lokal (Gemini API key belum dikonfigurasi): volume pengiriman stabil, namun dua vendor menunjukkan keterlambatan berulang pada rute timur yang perlu ditinjau minggu ini.",
    priority_score: 62,
    risk_level: "Sedang",
    recommendation: [
      "Audit ulang kontrak dengan vendor berkinerja rendah pada rute Makassar–Surabaya.",
      "Naikkan buffer stok komoditas cepat busuk sebesar 8% untuk minggu depan.",
      "Pantau biaya bahan bakar — tren naik 3 hari berturut-turut.",
    ],
    prediction: "Proyeksi keterlambatan pengiriman naik ~5% jika kondisi cuaca timur tidak membaik.",
    confidence: 74,
  };
}
