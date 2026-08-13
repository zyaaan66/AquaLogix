"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileCheck2, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type FileState = { file: File; status: "validating" | "uploading" | "ready" | "error"; error?: string };

export default function PartnerGatewayPage() {
  const [items, setItems] = useState<FileState[]>([]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    Array.from(fileList).forEach(async (file) => {
      // --- Client-side pre-check (fast feedback; the real gate is server-side) ---
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setItems((prev) => [{ file, status: "error", error: "Format tidak didukung (hanya PDF, PNG, JPEG)." }, ...prev]);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setItems((prev) => [{ file, status: "error", error: "Ukuran melebihi batas 10 MB." }, ...prev]);
        return;
      }

      setItems((prev) => [{ file, status: "uploading" }, ...prev]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "X-Requested-With": "AquaLogix" },
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setItems((prev) =>
            prev.map((p) => (p.file === file ? { ...p, status: "error", error: data.error } : p))
          );
          toast.error(data.error ?? "Gagal mengunggah berkas.");
          return;
        }

        setItems((prev) => prev.map((p) => (p.file === file ? { ...p, status: "ready" } : p)));
        toast.success(`${file.name} berhasil diunggah dan dienkripsi (AES-256-GCM).`);
      } catch {
        setItems((prev) =>
          prev.map((p) => (p.file === file ? { ...p, status: "error", error: "Gagal terhubung ke server." } : p))
        );
      }
    });
  }, []);

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-xl font-semibold">Secure Partner Gateway</h1>
        <p className="text-sm text-muted-foreground">
          Unggah dokumen vendor secara aman. Setiap berkas divalidasi ulang di server (bukan hanya di
          browser) menggunakan pemeriksaan magic-bytes sebelum dienkripsi dan disimpan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-sm font-medium">Unggah Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            <UploadCloud className="h-8 w-8 text-accent" aria-hidden="true" />
            <p className="text-sm">
              Seret berkas ke sini, atau <span className="text-accent underline">pilih file</span>
            </p>
            <p className="text-xs text-muted-foreground">PDF, PNG, JPEG — maksimal 10 MB</p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          {items.length > 0 && (
            <ul className="mt-4 space-y-2">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-sm"
                >
                  <span className="truncate">{item.file.name}</span>
                  {item.status === "error" && (
                    <span className="flex items-center gap-1 text-danger">
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      {item.error}
                    </span>
                  )}
                  {item.status === "validating" && (
                    <span className="text-xs text-muted-foreground">Memvalidasi…</span>
                  )}
                  {item.status === "uploading" && (
                    <span className="flex items-center gap-1 text-xs text-accent">
                      <ShieldCheck className="h-4 w-4 animate-pulse" aria-hidden="true" />
                      Mengunggah &amp; mengenkripsi…
                    </span>
                  )}
                  {item.status === "ready" && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                      Tersimpan aman
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
