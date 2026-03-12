"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { SellerProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Store, Phone, CreditCard, Upload } from "lucide-react";

export default function SettingsPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [storeName, setStoreName] = useState("");
	const [storeSlug, setStoreSlug] = useState("");
	const [storeDescription, setStoreDescription] = useState("");
	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [ewalletNumber, setEwalletNumber] = useState("");
	const [ewalletName, setEwalletName] = useState("");
	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [bannerPreview, setBannerPreview] = useState("");
	const [existingBannerUrl, setExistingBannerUrl] = useState("");
	const [qrisFile, setQrisFile] = useState<File | null>(null);
	const [qrisPreview, setQrisPreview] = useState("");
	const [existingQrisUrl, setExistingQrisUrl] = useState("");
	const [bankName, setBankName] = useState("");
	const [paymentConfig, setPaymentConfig] = useState<Record<string, boolean>>({ qris: true, dana: true, gopay: true, shopeepay: true, cod: true, bank: false });

	const supabase = createClient();

	useEffect(() => {
		fetchProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchProfile = async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { data } = await supabase
				.from("seller_profiles")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (data) {
				setStoreName(data.store_name || "");
				setStoreSlug(data.store_slug || "");
				setStoreDescription(data.store_description || "");
				setWhatsappNumber(data.whatsapp_number || "");
				setEwalletNumber(data.ewallet_number || "");
				setEwalletName(data.ewallet_name || "");
				setExistingBannerUrl(data.banner_url || "");
				setExistingQrisUrl(data.qris_url || "");
				setBankName(data.bank_name || "");
				if (data.payment_config) setPaymentConfig(data.payment_config);
			}
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setBannerFile(file);
			const reader = new FileReader();
			reader.onload = () => setBannerPreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleQrisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setQrisFile(file);
			const reader = new FileReader();
			reader.onload = () => setQrisPreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			let finalBannerUrl = existingBannerUrl;
			if (bannerFile) {
				const fileExt = bannerFile.name.split(".").pop();
				const fileName = `${user.id}/banner.${fileExt}`;
				const { error: uploadError } = await supabase.storage
					.from("product-images")
					.upload(fileName, bannerFile, { upsert: true });
				if (uploadError) throw uploadError;
				const { data: urlData } = supabase.storage
					.from("product-images")
					.getPublicUrl(fileName);
				finalBannerUrl = urlData.publicUrl;
			}

			let finalQrisUrl = existingQrisUrl;
			if (qrisFile) {
				const fileExt = qrisFile.name.split(".").pop();
				const fileName = `${user.id}/qris.${fileExt}`;
				const { error: qrisUploadError } = await supabase.storage
					.from("product-images")
					.upload(fileName, qrisFile, { upsert: true });
				if (qrisUploadError) throw qrisUploadError;
				const { data: qrisUrlData } = supabase.storage
					.from("product-images")
					.getPublicUrl(fileName);
				finalQrisUrl = qrisUrlData.publicUrl;
			}

			const profileData = {
				user_id: user.id,
				store_name: storeName,
				store_slug: storeSlug || null,
				store_description: storeDescription,
				whatsapp_number: whatsappNumber,
				ewallet_number: ewalletNumber,
				ewallet_name: ewalletName,
				banner_url: finalBannerUrl,
				qris_url: finalQrisUrl,
				bank_name: bankName,
				payment_config: paymentConfig,
			};

			const { error } = await supabase
				.from("seller_profiles")
				.upsert(profileData, { onConflict: "user_id" });
			if (error) throw error;

			setExistingBannerUrl(finalBannerUrl);
			setExistingQrisUrl(finalQrisUrl);
			setBannerFile(null);
			setBannerPreview("");
			setQrisFile(null);
			setQrisPreview("");
			toast.success("Pengaturan berhasil disimpan!");
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Gagal menyimpan";
			toast.error("Error", { description: msg });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
				<div className="h-[500px] bg-white rounded-2xl shadow-sm animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-6 max-w-2xl">
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pengaturan</h1>
				<p className="text-muted-foreground mt-1">
					Kelola profil toko dan informasi pembayaran
				</p>
			</div>

			<form onSubmit={handleSave} className="space-y-6">
				{/* Store Info */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Store className="w-5 h-5 text-emerald-600" />
							Informasi Toko
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="storeName">Nama Toko</Label>
							<Input
								id="storeName"
								value={storeName}
								onChange={(e) => setStoreName(e.target.value)}
								placeholder="Takjil Mama Lina"
								className="rounded-xl"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="storeSlug">Username Toko (URL)</Label>
							<div className="flex">
								<span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
									takjilflow.com/store/
								</span>
								<Input
									id="storeSlug"
									value={storeSlug}
									onChange={(e) => setStoreSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())}
									placeholder="mamalina"
									className="rounded-l-none rounded-r-xl"
								/>
							</div>
							<p className="text-xs text-muted-foreground mt-1">Hanya huruf, angka, dan strip (-)</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="storeDesc">Deskripsi Toko</Label>
							<Textarea
								id="storeDesc"
								value={storeDescription}
								onChange={(e) => setStoreDescription(e.target.value)}
								placeholder="Menyediakan berbagai takjil segar untuk berbuka puasa..."
								className="rounded-xl resize-none"
								rows={3}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="banner">Banner Toko (opsional)</Label>
							<div className="flex items-center gap-3">
								<label
									htmlFor="banner"
									className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-emerald-400 transition-colors text-sm text-gray-600"
								>
									<Upload className="w-4 h-4" />
									{bannerFile ? bannerFile.name : "Pilih banner..."}
								</label>
								<input id="banner" type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
							</div>
							{(bannerPreview || existingBannerUrl) && (
								<div className="rounded-xl overflow-hidden border border-gray-200 h-32 bg-gray-50">
									<img src={bannerPreview || existingBannerUrl} alt="Banner" className="w-full h-full object-cover" />
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Contact */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Phone className="w-5 h-5 text-emerald-600" />
							Kontak
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="wa">No. WhatsApp</Label>
							<Input
								id="wa"
								value={whatsappNumber}
								onChange={(e) => setWhatsappNumber(e.target.value)}
								placeholder="083843173660"
								className="rounded-xl"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Payment */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<CreditCard className="w-5 h-5 text-emerald-600" />
							Pembayaran E-Wallet
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="ewalletName">Nama E-Wallet (Dana/GoPay/ShopeePay)</Label>
							<Input
								id="ewalletName"
								value={ewalletName}
								onChange={(e) => setEwalletName(e.target.value)}
								placeholder="a.n Budi Santoso"
								className="rounded-xl"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ewalletNum">No. E-Wallet</Label>
							<Input
								id="ewalletNum"
								value={ewalletNumber}
								onChange={(e) => setEwalletNumber(e.target.value)}
								placeholder="083843173660"
								className="rounded-xl"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Payment Method Activation */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<CreditCard className="w-5 h-5 text-emerald-600" />
							Metode Pembayaran Aktif
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm text-muted-foreground">Aktifkan metode pembayaran yang ingin kamu terima dari pelanggan.</p>
						<div className="grid grid-cols-2 gap-2">
							{[
								{ id: "qris", label: "QRIS" },
								{ id: "dana", label: "Dana" },
								{ id: "gopay", label: "GoPay" },
								{ id: "shopeepay", label: "ShopeePay" },
								{ id: "bank", label: "Transfer Bank" },
								{ id: "cod", label: "COD (Bayar di Tempat)" },
							].map((pm) => (
								<label key={pm.id} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors ${paymentConfig[pm.id] ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
									<input
										type="checkbox"
										checked={!!paymentConfig[pm.id]}
										onChange={(e) => setPaymentConfig({ ...paymentConfig, [pm.id]: e.target.checked })}
										className="w-4 h-4 accent-emerald-600"
									/>
									<span className="text-sm font-medium">{pm.label}</span>
								</label>
							))}
						</div>
						{paymentConfig.bank && (
							<div className="space-y-2 pt-1">
								<Label htmlFor="bankName">Nama Bank (misal: BCA, Mandiri, BNI)</Label>
								<Input
									id="bankName"
									value={bankName}
									onChange={(e) => setBankName(e.target.value)}
									placeholder="BCA"
									className="rounded-xl"
								/>
								<p className="text-xs text-muted-foreground">Nomor rekening diambil dari No. E-Wallet di atas.</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* QRIS */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Upload className="w-5 h-5 text-emerald-600" />
							QRIS Pembayaran
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm text-muted-foreground">
							Upload foto QRIS kamu agar pelanggan bisa langsung scan saat memilih metode pembayaran QRIS di toko.
						</p>
						<div className="flex items-center gap-3">
							<label
								htmlFor="qris"
								className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-emerald-400 transition-colors text-sm text-gray-600"
							>
								<Upload className="w-4 h-4" />
								{qrisFile ? qrisFile.name : existingQrisUrl ? "Ganti QRIS..." : "Upload QRIS..."}
							</label>
							<input id="qris" type="file" accept="image/*" onChange={handleQrisChange} className="hidden" />
						</div>
						{(qrisPreview || existingQrisUrl) && (
							<div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 inline-block">
								<img
									src={qrisPreview || existingQrisUrl}
									alt="QRIS Preview"
									className="h-44 w-auto object-contain"
								/>
							</div>
						)}
					</CardContent>
				</Card>

				<Button
					type="submit"
					disabled={saving}
					className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-emerald-200"
				>
					{saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
					{saving ? "Menyimpan..." : "Simpan Pengaturan"}
				</Button>
			</form>
		</div>
	);
}
