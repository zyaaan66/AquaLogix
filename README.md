# AquaLogix — Smart Supply Chain Analytics

Dashboard enterprise untuk logistik perikanan. **Semua 6 tahap roadmap sudah dikerjakan.**

## Menjalankan secara lokal

```bash
npm install                        # otomatis menjalankan `prisma generate`
cp .env.example .env   # isi GEMINI_API_KEY jika ingin AI asli (opsional — ada fallback)
npm run db:push                    # buat skema SQLite lokal
npm run db:seed                    # isi data contoh (vendor, pengiriman, inventaris, user)
npm run dev
```

Buka `http://localhost:3000/login` → masuk dengan `admin@aqualogix.id` / `password123`
(dibuat oleh `db:seed`) → diarahkan ke `/dashboard`.

## Validasi yang sudah dilakukan sebelum file ini dikirim

- ✅ `npm install` berhasil, tidak ada dependency yang hilang
- ✅ `npx tsc --noEmit` → **0 error** di seluruh project (termasuk tipe Prisma yang di-generate otomatis lewat postinstall)
- ✅ Versi Next.js dinaikkan ke `15.5.20` setelah `npm install` melaporkan CVE pada versi awal `15.0.3` yang saya pakai — sudah diperbaiki
- ⚠️ `next build` di sandbox saya gagal **hanya** karena `next/font/google` butuh akses ke `fonts.googleapis.com`, yang diblokir oleh kebijakan jaringan sandbox ini. Ini bukan bug kode — pola `next/font/google` yang dipakai adalah cara standar dan resmi dari Next.js, dan akan berhasil build normal di mesin Anda, Vercel, atau CI apa pun dengan akses internet biasa. Jika Anda ingin menghindarinya sepenuhnya (misalnya untuk build tanpa internet), beri tahu saya dan saya bisa ganti ke font lokal (`@font-face` file statis).
- ⚠️ Query engine Prisma (binary native) tidak bisa diunduh di sandbox saya (domain `binaries.prisma.sh` diblokir), jadi saya tidak bisa menjalankan query database sungguhan di sini — tapi `prisma generate` untuk tipe TypeScript berhasil otomatis, dan skema sudah divalidasi secara struktural.

## Peta lengkap 6 tahap

### Tahap 1 — Fondasi
Struktur Next.js 15 App Router, design system "Dark Premium" (navy + aksen biru langit,
glassmorphism, radius 16px, Inter/Plus Jakarta Sans), sidebar animasi, floating header,
KPI card dengan animasi counter, Executive AI Briefing card, 2 chart dasar.

### Tahap 2 — Auth JWT + RBAC
- `src/lib/auth.ts` — hash password (bcrypt), sign/verify access token (15 menit) & refresh token (7 hari)
- `src/app/api/auth/{login,refresh,logout}/route.ts` — endpoint auth lengkap dengan rate limiting
- `src/middleware.ts` — proteksi route berbasis role minimum (PARTNER < ANALYST < OPERATIONS_MANAGER < ADMIN), dijalankan di setiap request ke halaman terproteksi
- `src/app/login/page.tsx` — form login (React Hook Form + Zod)
- Refresh token disimpan sebagai cookie httpOnly `SameSite=strict`, tidak pernah terekspos ke JS klien

### Tahap 3 — Audit log & error logging
- `src/lib/audit.ts` — `logAudit()` dipanggil pada: login sukses/gagal, logout, upload sukses/ditolak, insight AI dibuat
- `src/lib/logger.ts` — logger terstruktur (JSON) sebagai titik integrasi siap pakai untuk Sentry/Datadog/CloudWatch di produksi
- Semua kegagalan logging **tidak pernah** membuat request utama gagal (fail-safe)

### Tahap 4 — Koneksi database nyata
- `prisma/seed.ts` — mengisi Role, User, Province, Vendor, Commodity, Inventory, Shipment (40 baris acak realistis 7 hari terakhir), FuelCost
- `src/lib/dashboard-data.ts` — semua KPI & chart dashboard sekarang **query langsung dari Prisma** (agregasi shipment count, on-time rate, inventory sum, harga BBM terbaru)
- Fallback otomatis ke data demo yang **jelas dilabeli** (badge "Data demo") jika database belum di-seed — dashboard tidak pernah blank

### Tahap 5 — Chart lanjutan + export
- Scatter plot (korelasi jarak rute vs keterlambatan)
- Heatmap SVG kustom (ketepatan waktu vendor per hari)
- Timeline pengiriman harian
- Peta Indonesia — **disederhanakan** (posisi bubble representatif, bukan GeoJSON batas wilayah presisi; disebutkan jelas di UI)
- Export CSV & PNG di setiap chart (`src/lib/export.ts`)

### Tahap 6 — Command palette, Case Study, hardening
- Command palette fungsional (⌘K) via `cmdk` — navigasi antar halaman, ganti tema, trigger generate insight
- Halaman `/case-study` — 11 bagian portofolio (Challenge → Lessons Learned)
- Hardening: Content-Security-Policy, X-Frame-Options, CORS eksplisit per-origin, CSRF check (header `X-Requested-With`) pada semua request state-changing, validasi MIME via magic bytes di `/api/upload`

## Keterbatasan yang jujur perlu diketahui

- **CSRF**: pendekatan yang dipakai (custom header check) adalah defense-in-depth yang solid dikombinasikan dengan `SameSite=strict`, tapi untuk produksi sesungguhnya pertimbangkan token CSRF per-sesi yang lebih formal (double-submit cookie dengan token acak, bukan header statis).
- **Rate limiter** in-memory — cukup untuk single-instance/demo, perlu diganti ke Redis (Upstash dll) untuk deployment multi-instance/serverless.
- **Peta Indonesia**: sejak versi terbaru menggunakan SVG batas provinsi sungguhan (lihat bagian "Aset & Lisensi Pihak Ketiga" di bawah), bukan lagi ilustrasi bebas. Marker data provinsi ditempatkan berdasarkan koordinat bounding-box asli dari file SVG tersebut.
- **Enkripsi upload** disimulasikan dengan AES-256-GCM per-request (kunci acak sekali pakai, tidak disimpan) — untuk produksi sungguhan, kunci enkripsi harus dikelola lewat KMS/secret manager dan `Document.encryptedRef` harus menunjuk ke lokasi blob terenkripsi yang sesungguhnya (S3, dsb).

## Aset & Lisensi Pihak Ketiga

**Peta Indonesia** (`public/maps/indonesia.svg`) diambil dari repositori open-source:
- Sumber: [github.com/junwatu/indonesia-map](https://github.com/junwatu/indonesia-map)
- Lisensi: **GNU General Public License v3.0** (GPL-3.0)
- Modifikasi yang dilakukan: hanya mengganti warna `fill`/`stroke` (recolor) agar sesuai palet Dark Premium AquaLogix — bentuk/batas wilayah tidak diubah.
- Konsekuensi lisensi: karena GPL-3.0 bersifat *share-alike*, jika bagian ini didistribusikan ulang secara terpisah, ketentuan GPL-3.0 (termasuk kewajiban membuka source pada distribusi turunan) ikut berlaku untuk aset ini. Untuk keperluan portofolio pribadi (menampilkan kode ke calon pemberi kerja / repositori publik non-komersial), ini pada umumnya tidak bermasalah — tapi jika proyek ini suatu saat dikomersialkan, pertimbangkan mengganti aset ini dengan sumber berlisensi lebih permisif (mis. peta dari simplemaps.com yang gratis untuk penggunaan komersial).


## Tentang referensi DashUI

File `DashUI-1_0_0.zip` yang sempat Anda unggah tidak pernah berhasil sampai ke sesi kerja
saya (folder upload selalu kosong di sisi saya setiap kali dicek). Struktur folder di proyek
ini karena itu mengikuti pola umum Next.js App Router yang reusable (route groups,
`components/ui` untuk primitives, `components/layout`, `components/dashboard`,
`components/charts`) — bukan hasil peniruan langsung dari DashUI. Jika Anda unggah ulang
filenya di pesan berikutnya, saya bisa sesuaikan pola penamaan/struktur foldernya.
