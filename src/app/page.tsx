"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";
import {
  ShoppingBag, BarChart3, Package, ArrowRight,
  CheckCircle2, Shield, Bell, QrCode, Users, Star,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};




export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="TakjilFlow" width={44} height={44} className="rounded-xl" />
              <span className="text-xl font-bold tracking-tight">
                Takjil<span className="text-emerald-600">Flow</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-emerald-600 font-medium text-sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold px-5 shadow-sm">
                  Mulai Gratis →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div className="space-y-7" variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
                  🌙 Ramadhan 2026 — Platform Preorder Takjil #1
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Preorder Takjil,{" "}
                <span className="text-emerald-600">Tanpa Chaos.</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 leading-relaxed max-w-lg">
                Platform SaaS untuk penjual takjil UMKM. Kelola pesanan, kontrol stok,
                dan analisis penjualan — semua dari satu dashboard.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-13 px-8 text-base font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
                    Mulai Gratis <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="rounded-xl h-13 px-8 text-base font-semibold border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all w-full sm:w-auto">
                    Lihat Fitur
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-5 pt-1">
                {[
                  "Gratis selamanya",
                  "Tanpa kartu kredit",
                  "Setup 2 menit",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Dashboard Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-400 ml-2 font-mono">TakjilFlow — Dashboard</span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Realtime alert badge */}
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-sm text-emerald-700 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Pesanan baru masuk dari Budi Santoso!
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Produk", value: "12", color: "text-emerald-800 bg-emerald-50 border-emerald-100" },
                      { label: "Pesanan Hari Ini", value: "48", color: "text-orange-800 bg-orange-50 border-orange-100" },
                      { label: "Total Terjual", value: "156", color: "text-blue-800 bg-blue-50 border-blue-100" },
                      { label: "Stok Terjual", value: "78%", color: "text-purple-800 bg-purple-50 border-purple-100" },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
                        <p className="text-xs font-medium opacity-70">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 font-medium mb-3">Pesanan Mingguan</p>
                    <div className="flex items-end gap-1.5 h-14">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-emerald-500 rounded-t-sm opacity-80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {["Se", "Se", "Ra", "Ka", "Ju", "Sa", "Mi"].map((d, i) => (
                        <span key={i} className="text-[9px] text-gray-400">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="absolute -bottom-4 -left-4 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">+3 pesanan baru</p>
                  <p className="text-[10px] text-gray-400">2 menit yang lalu</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-10 border-y border-gray-100 bg-gray-50/60">
        <motion.div
          className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            { v: "500+", l: "Penjual Aktif" },
            { v: "12.000+", l: "Pesanan Diproses" },
            { v: "Rp 1,2M+", l: "Total Transaksi" },
            { v: "4.9 ★", l: "Rating Pengguna" },
          ].map((s) => (
            <motion.div key={s.l} variants={fadeUp}>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{s.v}</p>
              <p className="text-sm text-gray-500 mt-1">{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Problem section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Masalah Penjual Takjil{" "}
            <span className="text-orange-500">Setiap Ramadhan</span>
          </motion.h2>
          <motion.p
            className="text-gray-500 text-lg mb-12"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
          >
            Masalah yang sama berulang tiap tahun karena tidak punya sistem yang tepat.
          </motion.p>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {[
              { emoji: "📦", title: "Kelebihan Produksi", desc: "Produksi terlalu banyak karena tidak ada data akurat permintaan." },
              { emoji: "📋", title: "Pesanan Berantakan", desc: "Pesanan masuk dari chat, telepon, dan langsung. Kacau sekali." },
              { emoji: "📊", title: "Tidak Ada Analitik", desc: "Tidak tahu produk mana paling laris dan berapa optimal produksi." },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="text-base font-bold mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.span
              className="text-xs font-semibold uppercase tracking-widest text-emerald-600"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            >
              Fitur Unggulan
            </motion.span>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mt-2 mb-3"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
            >
              Semua yang Kamu Butuhkan
            </motion.h2>
            <motion.p
              className="text-gray-500 text-lg max-w-xl mx-auto"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
            >
              Dirancang untuk penjual UMKM — tidak ribet, langsung pakai.
            </motion.p>
          </div>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {[
              { icon: ShoppingBag, title: "Preorder Digital", desc: "Toko online siap pakai. Pelanggan pesan dari browser, stok otomatis terkurangi.", accent: "emerald" },
              { icon: BarChart3, title: "Dashboard Analitik", desc: "Grafik penjualan real-time, produk terlaris, dan insight bisnis otomatis.", accent: "orange" },
              { icon: Shield, title: "Kontrol Stok Penuh", desc: "Batas stok per produk. Sistem mencegah pesanan melebihi kapasitas produksi.", accent: "blue" },
              { icon: Bell, title: "Notifikasi Real-time", desc: "Bunyi & popup otomatis setiap ada pesanan masuk — tanpa refresh halaman.", accent: "violet" },
              { icon: QrCode, title: "QR Code Standee", desc: "Generate & cetak QR Code unik untuk ditaruh di meja jualan. O2O yang mudah.", accent: "pink" },
              { icon: Users, title: "Database Pelanggan", desc: "Lihat siapa pelanggan setia kamu. Badge loyalitas otomatis dari Bronze ke Sultan.", accent: "teal" },
            ].map((f) => {
              const accentMap: Record<string, string> = {
                emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
                orange: "bg-orange-50 border-orange-100 text-orange-600",
                blue: "bg-blue-50 border-blue-100 text-blue-600",
                violet: "bg-violet-50 border-violet-100 text-violet-600",
                pink: "bg-pink-50 border-pink-100 text-pink-600",
                teal: "bg-teal-50 border-teal-100 text-teal-600",
              };
              const cls = accentMap[f.accent];
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${cls}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              Mulai dalam 3 Langkah
            </motion.h2>
          </div>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          >
            {[
              { step: "01", title: "Daftar & Tambah Produk", desc: "Buat akun gratis, tambahkan daftar takjil, harga, dan batas stok." },
              { step: "02", title: "Bagikan Link / QR Toko", desc: "Pelanggan bisa scan QR atau buka link langsung untuk pesan." },
              { step: "03", title: "Pantau & Optimasi", desc: "Pesanan masuk real-time. Analisis data untuk produksi lebih tepat." },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-5">
                  <span className="text-white font-extrabold text-lg">{item.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonial/Quote */}
      <section className="py-16 px-4 sm:px-6 bg-emerald-600">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 text-yellow-300 fill-yellow-300" />
            ))}
          </div>
          <blockquote className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-6">
            "Dulu sering produksi kurang atau berlebih. Sekarang pesanan sudah tertata rapi dan saya bisa fokus masak."
          </blockquote>
          <p className="text-emerald-200 text-sm font-medium">— Ibu Sari, Penjual Kolak & Es Buah · Bandung</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold mb-4"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Siap Memulai Ramadhan yang Lebih Teratur?
          </motion.h2>
          <p className="text-gray-500 text-lg mb-8">Bergabung sekarang. Gratis untuk semua UMKM.</p>
          <Link href="/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 px-10 text-base font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Mulai Gratis Sekarang <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="TakjilFlow" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-bold">Takjil<span className="text-emerald-600">Flow</span></span>
          </div>
          <p className="text-sm text-gray-400">© 2026 TakjilFlow · Dibuat untuk UMKM Ramadhan 🌙</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/login" className="hover:text-emerald-600 transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-emerald-600 transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
