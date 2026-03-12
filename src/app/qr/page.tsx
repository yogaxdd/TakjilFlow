"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, ExternalLink, Printer, QrCode, Store } from "lucide-react";

export default function QRPage() {
	const [storeSlug, setStoreSlug] = useState("");
	const [storeName, setStoreName] = useState("Toko Saya");
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);

	const supabase = createClient();

	useEffect(() => {
		const fetchProfile = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) { setLoading(false); return; }

			const { data } = await supabase
				.from("seller_profiles")
				.select("store_name, store_slug, user_id")
				.eq("user_id", user.id)
				.single();

			if (data) {
				setStoreName(data.store_name || "Toko Saya");
				setStoreSlug(data.store_slug || user.id);
			} else {
				setStoreSlug(user.id);
			}
			setLoading(false);
		};
		fetchProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const storeUrl = typeof window !== "undefined"
		? `${window.location.origin}/store/${storeSlug}`
		: `https://takjilflow.com/store/${storeSlug}`;

	const copyLink = () => {
		navigator.clipboard.writeText(storeUrl);
		setCopied(true);
		toast.success("Link toko disalin!");
		setTimeout(() => setCopied(false), 2000);
	};

	const printStandee = () => {
		const w = window.open("", "", "width=800,height=600");
		if (!w) return;
		const qrSvg = document.getElementById("qr-svg")?.outerHTML || "";
		w.document.write(`
      <html><head><title>Standee QR ${storeName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#fff; }
        .card { border: 3px solid #059669; border-radius: 24px; padding: 40px 48px; max-width: 400px; text-align: center; }
        .icon { width:60px; height:60px; background:#059669; border-radius:16px; display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; }
        .icon svg { width:32px; height:32px; fill:none; stroke:white; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
        .brand { font-size: 13px; font-weight:700; letter-spacing:2px; color:#059669; text-transform:uppercase; margin-bottom:8px; }
        h1 { font-size: 28px; font-weight:800; color:#111; margin-bottom:6px; }
        .sub { font-size: 14px; color:#888; margin-bottom:24px; }
        .qr { background:#f9f9f9; border-radius:16px; padding:16px; display:inline-block; margin-bottom:24px; border: 1px solid #eee; }
        .url { font-size: 11px; color:#555; word-break:break-all; background:#f4f4f4; border-radius:8px; padding:8px 12px; margin-bottom:24px; }
        .cta { font-size: 13px; color:#444; font-style:italic; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style></head>
      <body>
        <div class="card">
          <div class="brand">TakjilFlow</div>
          <h1>${storeName}</h1>
          <p class="sub">Scan QR untuk pesan takjil sekarang!</p>
          <div class="qr">${qrSvg}</div>
          <div class="url">${storeUrl}</div>
          <p class="cta">Atau ketik URL di atas di browser kamu 🌙</p>
        </div>
      </body></html>
    `);
		w.document.close();
		w.focus();
		w.print();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-xl">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">QR Standee Toko</h1>
				<p className="text-muted-foreground mt-1">Cetak QR Code untuk ditaruh di meja jualan kamu.</p>
			</div>

			{/* Preview Card */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
				<div className="inline-flex items-center gap-2 mb-2">
					<div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
						<Store className="w-4 h-4 text-white" />
					</div>
					<span className="text-sm font-bold text-emerald-600 tracking-wide uppercase">TakjilFlow</span>
				</div>
				<h2 className="text-2xl font-extrabold text-gray-900 mb-1">{storeName}</h2>
				<p className="text-sm text-muted-foreground mb-6">Scan untuk pesan takjil sekarang! 🌙</p>

				<div className="inline-block bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
					<QRCodeSVG
						id="qr-svg"
						value={storeUrl}
						size={200}
						level="H"
						includeMargin={false}
						fgColor="#111111"
					/>
				</div>

				<div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6">
					<span className="text-xs text-gray-500 flex-1 text-left truncate font-mono">{storeUrl}</span>
					<button onClick={copyLink} className="text-xs text-emerald-600 font-medium hover:underline flex-shrink-0 flex items-center gap-1">
						<Copy className="w-3 h-3" />
						{copied ? "Disalin!" : "Salin"}
					</button>
				</div>

				<div className="flex gap-3">
					<Button
						onClick={printStandee}
						className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
					>
						<Printer className="w-4 h-4" /> Cetak Standee
					</Button>
					<Button
						variant="outline"
						onClick={() => window.open(storeUrl, "_blank")}
						className="rounded-xl gap-2 border-gray-200"
					>
						<ExternalLink className="w-4 h-4" /> Buka Toko
					</Button>
				</div>
			</div>

			{/* Custom slug reminder */}
			<div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
				<div className="flex items-start gap-3">
					<QrCode className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
					<div>
						<p className="text-sm font-semibold text-amber-800 mb-1">Ingin URL yang lebih pendek?</p>
						<p className="text-sm text-amber-700">
							Set <strong>Username Toko</strong> kamu di{" "}
							<a href="/settings" className="underline font-medium">Pengaturan</a>{" "}
							agar QR code mengarah ke URL yang lebih mudah diingat, seperti{" "}
							<code className="bg-amber-100 px-1 rounded">/store/namatoko</code>.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
