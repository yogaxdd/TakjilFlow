import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  BarChart3,
  Package,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white font-bold text-base">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Takjil<span className="text-emerald-600">Flow</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-emerald-600 font-medium"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200">
                  Mulai Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                <Zap className="w-4 h-4" />
                Kelola Preorder Takjil dengan Mudah
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Berhenti Produksi Berlebih.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
                  Kelola Pesanan Takjil
                </span>{" "}
                Ramadhan Lebih Cerdas.
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg">
                Sistem preorder digital yang membantu penjual takjil UMKM
                mengelola pesanan, mengontrol stok, dan menganalisis penjualan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 px-8 text-lg font-semibold shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
                  >
                    Mulai Gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl h-14 px-8 text-lg font-semibold border-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 w-full sm:w-auto"
                  >
                    Lihat Fitur
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Gratis selamanya
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Tanpa kartu kredit
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Setup 2 menit
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 via-emerald-100 to-orange-100 rounded-3xl blur-3xl opacity-40" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-emerald-100/50 bg-white p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs text-gray-400 ml-2">
                      TakjilFlow Dashboard
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-medium">Total Produk</p>
                      <p className="text-2xl font-bold text-emerald-900 mt-1">12</p>
                    </div>
                    <div className="rounded-xl bg-orange-50 p-4 border border-orange-100">
                      <p className="text-xs text-orange-600 font-medium">Pesanan Hari Ini</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">48</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                      <p className="text-xs text-blue-600 font-medium">Total Terjual</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">156</p>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-4 border border-purple-100">
                      <p className="text-xs text-purple-600 font-medium">Stok Terjual</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">78%</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-3">Pesanan Mingguan</p>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-sm transition-all duration-500"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                        <span key={d} className="text-[10px] text-gray-400">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Masalah <span className="text-orange-500">Penjual Takjil</span> di Bulan Ramadhan
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Setiap Ramadhan, jutaan penjual takjil mengalami masalah yang sama berulang kali.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                emoji: "📦",
                title: "Kelebihan Produksi",
                desc: "Sering produksi terlalu banyak karena tidak ada data akurat tentang permintaan pelanggan.",
              },
              {
                emoji: "📋",
                title: "Pesanan Berantakan",
                desc: "Pesanan masuk lewat chat, telepon, dan langsung. Sulit melacak siapa pesan apa.",
              },
              {
                emoji: "📊",
                title: "Tidak Ada Analitik",
                desc: "Tidak tahu produk mana yang paling laris dan berapa jumlah optimal produksi harian.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-6">
              <Package className="w-4 h-4" />
              Fitur Utama
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Semua Fitur yang Anda Butuhkan
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Kelola bisnis takjil Ramadhan Anda dengan fitur yang lengkap.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: "Manajemen Preorder",
                desc: "Pelanggan bisa pesan langsung dari halaman toko Anda. Stok otomatis berkurang.",
                color: "emerald",
              },
              {
                icon: BarChart3,
                title: "Dashboard Analitik",
                desc: "Pantau penjualan harian, stok terjual, dan tren pesanan dalam grafik yang mudah dibaca.",
                color: "orange",
              },
              {
                icon: Shield,
                title: "Kontrol Stok Penuh",
                desc: "Atur batas stok per produk. Sistem otomatis mencegah pesanan melebihi stok.",
                color: "blue",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-7 h-7 text-${feature.color}-500`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cara Kerjanya
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Mulai gunakan TakjilFlow hanya dalam 3 langkah mudah.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Daftar & Tambah Produk",
                desc: "Buat akun gratis, lalu tambahkan daftar takjil yang Anda jual beserta harga dan stok.",
              },
              {
                step: "02",
                title: "Bagikan Link Toko",
                desc: "Bagikan link toko Anda ke pelanggan. Mereka bisa langsung pesan dari browser.",
              },
              {
                step: "03",
                title: "Pantau & Optimasi",
                desc: "Lihat pesanan masuk di dashboard. Analisis data penjualan untuk optimasi produksi.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-all duration-300 group-hover:-translate-y-1">
                  <span className="text-white font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50" />
            <div className="relative px-8 py-16 sm:px-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-100 text-sm font-medium mb-6 backdrop-blur-sm">
                <TrendingUp className="w-4 h-4" />
                Gratis untuk UMKM
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Siap Mengoptimalkan Penjualan Takjil Anda?
              </h2>
              <p className="text-lg text-emerald-100 mb-8 max-w-xl mx-auto">
                Bergabung sekarang dan kelola bisnis takjil Ramadhan Anda dengan lebih pintar.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl h-14 px-10 text-lg font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Mulai Gratis Sekarang
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              Takjil<span className="text-emerald-600">Flow</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 TakjilFlow. Dibuat untuk UMKM Ramadhan 🌙
          </p>
        </div>
      </footer>
    </div>
  );
}
