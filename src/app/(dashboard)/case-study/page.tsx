import {
  Target,
  Search,
  AlertOctagon,
  Compass,
  LayoutTemplate,
  PenTool,
  Code2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  BookOpenCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
  {
    icon: AlertOctagon,
    title: "Challenge",
    body: "Perusahaan logistik perikanan mengambil keputusan operasional (rute, stok, vendor) secara manual dan reaktif, sehingga keterlambatan pengiriman dan pembusukan komoditas baru diketahui setelah terjadi.",
  },
  {
    icon: Search,
    title: "Research",
    body: "Meninjau pola dashboard SaaS enterprise (Linear, Stripe, Vercel) untuk kepadatan informasi yang tetap tenang secara visual, serta mempelajari kebutuhan spesifik rantai pasok komoditas cepat busuk.",
  },
  {
    icon: Target,
    title: "Problem",
    body: "Tidak ada satu pandangan terpadu yang menghubungkan status pengiriman, tingkat inventaris, kinerja vendor, dan biaya bahan bakar — sehingga risiko baru terlihat setelah berdampak ke pelanggan.",
  },
  {
    icon: Compass,
    title: "Business Goal",
    body: "Memberi tim operasional satu ringkasan harian yang dapat ditindaklanjuti dalam waktu kurang dari dua menit, lengkap dengan rekomendasi berbasis AI yang dapat dijelaskan alasannya.",
  },
  {
    icon: LayoutTemplate,
    title: "Architecture",
    body: "Next.js App Router dengan pemisahan jelas: Server Components untuk pembacaan data (Prisma), Route Handlers untuk aksi sensitif (auth, AI, upload), dan middleware terpusat untuk RBAC/CORS/CSRF.",
  },
  {
    icon: PenTool,
    title: "Design System",
    body: "Tema 'Dark Premium' bernuansa kedalaman laut: navy gelap sebagai dasar, aksen biru langit tunggal untuk sinyal aksi, glassmorphism tipis, dan grid spasi 8-point untuk konsistensi.",
  },
  {
    icon: Code2,
    title: "Implementation",
    body: "Komponen modular di bawah components/ui (primitives), components/dashboard, dan components/charts — masing-masing dapat diuji dan digunakan ulang lintas halaman tanpa duplikasi logika.",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    body: "JWT access+refresh token, RBAC berjenjang di middleware, validasi MIME asli via magic bytes (bukan ekstensi), rate limiting, audit log otomatis, dan header keamanan (X-Frame-Options, CSP dasar).",
  },
  {
    icon: Sparkles,
    title: "AI",
    body: "Gemini Flash dipanggil eksklusif dari backend dengan system prompt yang mewajibkan output JSON terstruktur, divalidasi ulang dengan Zod sebelum ditampilkan — dengan fallback simulasi berlabel jelas.",
  },
  {
    icon: TrendingUp,
    title: "Result",
    body: "Prototipe fungsional dengan data langsung dari database (bukan mock statis), delapan jenis visualisasi interaktif, dan alur kerja end-to-end dari login hingga insight AI dalam waktu kurang dari 5 detik.",
  },
  {
    icon: BookOpenCheck,
    title: "Lessons Learned",
    body: "Menyeimbangkan kejujuran teknis (menandai data demo vs live, fallback AI yang transparan) dengan kesan produk premium ternyata memperkuat kepercayaan, bukan menguranginya.",
  },
];

export default function CaseStudyPage() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="font-display text-xl font-semibold">Case Study — AquaLogix</h1>
        <p className="text-sm text-muted-foreground">
          Smart Supply Chain Analytics untuk logistik perikanan. Studi kasus proses desain hingga implementasi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex-row items-center gap-2">
              <section.icon className="h-4 w-4 text-accent" aria-hidden="true" />
              <CardTitle className="text-foreground text-sm font-semibold">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
