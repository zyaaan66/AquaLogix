"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Moon, Sun, LogOut, ChevronDown, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Notification } from "@/lib/notifications";

const SEVERITY_ICON = { info: Info, warning: AlertTriangle, danger: AlertCircle };
const SEVERITY_COLOR = { info: "text-accent", warning: "text-warning", danger: "text-danger" };

export function Header() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const anyMenuOpen = notifOpen || menuOpen;

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.items ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  }, []);

  function closeMenus() {
    setNotifOpen(false);
    setMenuOpen(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "X-Requested-With": "AquaLogix" },
    });
    toast.success("Berhasil keluar.");
    router.push("/login");
  }

  const hasNotifications = notifications.length > 0;

  return (
    <>
      {/* Invisible click-outside layer — closes any open dropdown when clicking
          elsewhere on the page. Sits below the header/dropdowns (z-20) but
          above normal page content, so it reliably catches outside clicks. */}
      {anyMenuOpen && (
        <button
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-20 cursor-default"
          onClick={closeMenus}
        />
      )}

      <header className="sticky top-0 z-30 mx-3 mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-card/70 px-3 py-2 backdrop-blur-xl shadow-card">
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="flex w-72 items-center gap-2 rounded-sm border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/60"
          aria-label="Buka command palette (Cmd+K)"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span>Cari pengiriman, vendor...</span>
          <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ubah tema"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 hidden dark:block" aria-hidden="true" />
            <Moon className="h-4 w-4 block dark:hidden" aria-hidden="true" />
          </Button>

          <div className="relative z-30">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Notifikasi${hasNotifications ? ` (${notifications.length} baru)` : ""}`}
              aria-expanded={notifOpen}
              onClick={() => {
                setMenuOpen(false);
                setNotifOpen((v) => !v);
              }}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {hasNotifications && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-semibold text-white">
                  {notifications.length}
                </span>
              )}
            </Button>
            {notifOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-80 rounded-sm border border-border bg-popover p-2 text-sm shadow-card animate-fade-up"
              >
                <p className="px-2 py-1.5 font-medium">Notifikasi</p>
                {notifLoading && (
                  <div className="space-y-1.5 px-2 py-1.5">
                    <div className="h-3 w-full rounded shimmer-bg" />
                    <div className="h-3 w-2/3 rounded shimmer-bg" />
                  </div>
                )}
                {!notifLoading && notifications.length === 0 && (
                  <p className="px-2 py-1.5 text-muted-foreground">Tidak ada notifikasi baru.</p>
                )}
                {!notifLoading && (
                  <ul className="max-h-72 space-y-0.5 overflow-y-auto">
                    {notifications.map((n) => {
                      const Icon = SEVERITY_ICON[n.severity];
                      return (
                        <li key={n.id} className="flex gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/40">
                          <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", SEVERITY_COLOR[n.severity])} aria-hidden="true" />
                          <div>
                            <p className="font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.message}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="relative z-30">
            <button
              onClick={() => {
                setNotifOpen(false);
                setMenuOpen((v) => !v);
              }}
              className="flex items-center gap-2 rounded-sm py-1 pl-1 pr-2 transition-colors hover:bg-muted/50"
              aria-label="Menu akun"
              aria-expanded={menuOpen}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-xs font-semibold text-white">
                A
              </div>
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 rounded-sm border border-border bg-popover p-1 text-sm shadow-card animate-fade-up"
              >
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-muted/50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
