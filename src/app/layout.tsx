import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "TakjilFlow — Smart Preorder & Production Optimizer",
  description:
    "TakjilFlow membantu penjual takjil Ramadhan mengelola preorder, melacak penjualan harian, dan mencegah kelebihan produksi.",
  keywords: ["takjil", "ramadhan", "preorder", "umkm", "food", "management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
