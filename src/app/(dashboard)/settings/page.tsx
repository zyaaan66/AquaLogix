import { cookies } from "next/headers";
import { Settings, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verifyAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const token = (await cookies()).get("access_token")?.value;
  const session = token ? await verifyAccessToken(token).catch(() => null) : null;

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-xl font-semibold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Informasi akun dan preferensi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" aria-hidden="true" /> Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground">Email</span>
            <span>{session?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Peran</span>
            <Badge variant="accent">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {session?.role ?? "—"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="text-sm text-muted-foreground">
          Preferensi tambahan (notifikasi, tema, integrasi) akan tersedia di rilis berikutnya.
        </CardContent>
      </Card>
    </div>
  );
}