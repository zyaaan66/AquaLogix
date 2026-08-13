"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Ship,
  Warehouse,
  Users,
  FileLock2,
  BookOpenText,
  Settings,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Pengiriman", icon: Ship },
  { href: "/inventory", label: "Inventaris", icon: Warehouse },
  { href: "/vendors", label: "Vendor", icon: Users },
  { href: "/partner-gateway", label: "Partner Gateway", icon: FileLock2 },
  { href: "/case-study", label: "Case Study", icon: BookOpenText },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-card/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent/15 text-accent">
          <Waves className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-none">AquaLogix</p>
          <p className="text-[11px] text-muted-foreground leading-none mt-1">Supply Chain Analytics</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-sm px-2.5 py-2 text-sm transition-colors duration-200 ease-cubic",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-nav-pill"
                  className="absolute inset-0 rounded-sm bg-accent/15 gradient-border"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" aria-hidden="true" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 text-[11px] text-muted-foreground">
        <p>AquaLogix v1.0.0</p>
        <p>Smart Supply Chain Analytics</p>
      </div>
    </aside>
  );
}
