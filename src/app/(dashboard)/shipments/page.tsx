import { Ship, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getShipments } from "@/lib/list-data";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ontime: "Tepat Waktu",
  late: "Terlambat",
  in_transit: "Dalam Perjalanan",
  delivered: "Terkirim",
};

const STATUS_VARIANT: Record<string, "success" | "danger" | "accent" | "neutral"> = {
  ontime: "success",
  late: "danger",
  in_transit: "accent",
  delivered: "neutral",
};

export default async function ShipmentsPage() {
  const { rows, source } = await getShipments();

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold">Pengiriman</h1>
          <p className="text-sm text-muted-foreground">Daftar pengiriman terbaru</p>
        </div>
        <Badge variant={source === "database" ? "success" : "neutral"}>
          <Database className="h-3 w-3" aria-hidden="true" />
          {source === "database" ? "Data langsung dari database" : "Data demo (database belum diisi)"}
        </Badge>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Vendor</th>
                <th className="px-3 py-2 font-medium">Provinsi Tujuan</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Keterlambatan</th>
                <th className="px-3 py-2 font-medium">Dikirim</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <Ship className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {row.vendor}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.province}</td>
                  <td className="px-3 py-2">
                    <Badge variant={STATUS_VARIANT[row.status] ?? "neutral"}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.delayHours ? `${row.delayHours} jam` : "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(row.shippedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}