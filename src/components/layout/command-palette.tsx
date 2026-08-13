"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Ship,
  Warehouse,
  Users,
  FileLock2,
  BookOpenText,
  Settings,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-popover shadow-glass animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        label="Command palette AquaLogix"
      >
        <Command.Input
          autoFocus
          placeholder="Ketik perintah atau cari halaman..."
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
            Tidak ada hasil.
          </Command.Empty>

          <Command.Group heading="Navigasi" className="px-2 py-1.5 text-xs text-muted-foreground">
            <Command.Item
              onSelect={() => go("/dashboard")}
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm data-[selected=true]:bg-muted/50 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Command.Item>
            <Command.Item
              onSelect={() => go("/partner-gateway")}
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm data-[selected=true]:bg-muted/50 cursor-pointer"
            >
              <FileLock2 className="h-4 w-4" /> Secure Partner Gateway
            </Command.Item>
            <Command.Item
              onSelect={() => go("/case-study")}
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm data-[selected=true]:bg-muted/50 cursor-pointer"
            >
              <BookOpenText className="h-4 w-4" /> Case Study
            </Command.Item>
            <Command.Item
              onSelect={() => go("/settings")}
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm data-[selected=true]:bg-muted/50 cursor-pointer"
            >
              <Settings className="h-4 w-4" /> Pengaturan
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Aksi" className="px-2 py-1.5 text-xs text-muted-foreground">
            <Command.Item
              onSelect={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm data-[selected=true]:bg-muted/50 cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Ubah ke mode {theme === "dark" ? "terang" : "gelap"}
            </Command.Item>
            <Command.Item
              onSelect={() => {
                document.getElementById("generate-insight-btn")?.click();
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm data-[selected=true]:bg-muted/50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> Generate Today&apos;s Insight
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
