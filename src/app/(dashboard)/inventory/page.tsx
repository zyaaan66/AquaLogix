import { Warehouse, Database, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInventoryList } from "@/lib/list-data";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { rows, source } = await getInventoryList();

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold">Inventaris</h1>
          <p className="text-sm text-muted-foreground">Stok komoditas saat ini</p>
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
                <th className="px-3 py-2 font-medium">Komoditas</th>
                <th className="px-3 py-2 font-medium">Stok</th>
                <th className="px-3 py-2 font-medium">Titik Reorder</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const low = row.stockTon < row.reorderPoint;
                return (
                  <tr key={row.id} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 flex items-center gap-2">
                      <Warehouse className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      {row.commodity}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{row.stockTon} {row.unit}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.reorderPoint} {row.unit}</td>
                    <td className="px-3 py-2">
                      <Badge variant={low ? "danger" : "success"}>
                        {low && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
                        {low ? "Perlu Restok" : "Aman"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(row.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}