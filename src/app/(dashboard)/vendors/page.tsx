import { Users, Database, CircleCheck, CircleOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVendors } from "@/lib/list-data";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const { rows, source } = await getVendors();

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold">Vendor</h1>
          <p className="text-sm text-muted-foreground">Mitra pemasok dan performanya</p>
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
                <th className="px-3 py-2 font-medium">Kontak</th>
                <th className="px-3 py-2 font-medium">Tepat Waktu</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {row.name}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{row.contact ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{(row.onTimeRate * 100).toFixed(0)}%</td>
                  <td className="px-3 py-2">
                    <Badge variant={row.isActive ? "success" : "neutral"}>
                      {row.isActive ? <CircleCheck className="h-3 w-3" aria-hidden="true" /> : <CircleOff className="h-3 w-3" aria-hidden="true" />}
                      {row.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
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