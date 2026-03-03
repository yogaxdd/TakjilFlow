# TakjilFlow — Deployment Guide

## 📦 Setup Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Salin `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan kredensial Supabase Anda:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx....
```

### 3. Setup Database Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pergi ke **SQL Editor**
3. Buka file `supabase/migration.sql`
4. Copy-paste seluruh isi file dan jalankan

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka `http://localhost:3000`

---

## 🚀 Deploy ke Vercel

1. Push repository ke GitHub
2. Buka [vercel.com](https://vercel.com) dan import project
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**

---

## 📋 Alur Penggunaan

1. **Daftar** → Buat akun di `/register`
2. **Tambah Produk** → Di `/menu`, tambahkan produk takjil dengan harga dan stok
3. **Bagikan Link Toko** → Klik "Salin Link Toko" di dashboard → Kirim ke pelanggan
4. **Pelanggan Pesan** → Pelanggan buka link, pilih produk, isi data, kirim pesanan
5. **Pantau** → Lihat pesanan masuk, grafik, dan stat di dashboard
