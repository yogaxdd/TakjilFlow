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
	const [storeDescription, setStoreDescription] = useState("");
	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [ewalletNumber, setEwalletNumber] = useState("");
	const [ewalletName, setEwalletName] = useState("");
	const [bannerFile, setBannerFile] = useState<File | null>(null);
	const [bannerPreview, setBannerPreview] = useState("");
	const [existingBannerUrl, setExistingBannerUrl] = useState("");

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
				setStoreDescription(data.store_description || "");
				setWhatsappNumber(data.whatsapp_number || "");
				setEwalletNumber(data.ewallet_number || "");
				setEwalletName(data.ewallet_name || "");
				setExistingBannerUrl(data.banner_url || "");
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

			const profileData = {
				user_id: user.id,
				store_name: storeName,
				store_description: storeDescription,
				whatsapp_number: whatsappNumber,
				ewallet_number: ewalletNumber,
				ewallet_name: ewalletName,
				banner_url: finalBannerUrl,
			};

			const { error } = await supabase
				.from("seller_profiles")
				.upsert(profileData, { onConflict: "user_id" });
			if (error) throw error;

			setExistingBannerUrl(finalBannerUrl);
			setBannerFile(null);
			setBannerPreview("");
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
