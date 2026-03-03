"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PromoCode } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Ticket, Trash2, Loader2, ToggleLeft, ToggleRight, Copy } from "lucide-react";

export default function PromoPage() {
	const [promos, setPromos] = useState<PromoCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [code, setCode] = useState("");
	const [discountPercent, setDiscountPercent] = useState("");
	const [maxUses, setMaxUses] = useState("100");
	const [expiresAt, setExpiresAt] = useState("");

	const supabase = createClient();

	useEffect(() => { fetchPromos(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

	const fetchPromos = async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { data } = await supabase
				.from("promo_codes")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false });
			setPromos(data || []);
		} catch (e) { console.error(e); } finally { setLoading(false); }
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");
			const { error } = await supabase.from("promo_codes").insert({
				user_id: user.id,
				code: code.toUpperCase(),
				discount_percent: parseInt(discountPercent),
				max_uses: parseInt(maxUses),
				expires_at: expiresAt || null,
			});
			if (error) throw error;
			toast.success(`Promo ${code.toUpperCase()} berhasil dibuat!`);
			setIsDialogOpen(false);
			setCode(""); setDiscountPercent(""); setMaxUses("100"); setExpiresAt("");
			fetchPromos();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Gagal membuat promo";
			toast.error("Error", { description: msg });
		} finally { setSaving(false); }
	};

	const toggleActive = async (promo: PromoCode) => {
		try {
			const { error } = await supabase.from("promo_codes")
				.update({ is_active: !promo.is_active })
				.eq("id", promo.id);
			if (error) throw error;
			toast.success(promo.is_active ? "Promo dinonaktifkan" : "Promo diaktifkan");
			fetchPromos();
		} catch { toast.error("Gagal mengubah status promo"); }
	};

	const deletePromo = async (id: string) => {
		try {
			const { error } = await supabase.from("promo_codes").delete().eq("id", id);
			if (error) throw error;
			toast.success("Promo dihapus");
			fetchPromos();
		} catch { toast.error("Gagal menghapus promo"); }
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
				<div className="h-[300px] bg-white rounded-2xl shadow-sm animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Promo & Diskon</h1>
					<p className="text-muted-foreground mt-1">Buat kode promo untuk pelanggan</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200">
							<Plus className="w-4 h-4 mr-2" /> Buat Promo
						</Button>
					</DialogTrigger>
					<DialogContent className="rounded-2xl sm:max-w-md">
						<DialogHeader><DialogTitle>Buat Kode Promo</DialogTitle></DialogHeader>
						<form onSubmit={handleCreate} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="code">Kode Promo</Label>
								<Input id="code" value={code} onChange={(e) => setCode(e.target.value)}
									placeholder="RAMADHAN25" required className="rounded-xl uppercase" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="disc">Diskon (%)</Label>
									<Input id="disc" type="number" value={discountPercent}
										onChange={(e) => setDiscountPercent(e.target.value)}
										placeholder="25" required min="1" max="100" className="rounded-xl" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="max">Maks. Penggunaan</Label>
									<Input id="max" type="number" value={maxUses}
										onChange={(e) => setMaxUses(e.target.value)}
										placeholder="100" required min="1" className="rounded-xl" />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="exp">Berlaku Sampai (opsional)</Label>
								<Input id="exp" type="date" value={expiresAt}
									onChange={(e) => setExpiresAt(e.target.value)} className="rounded-xl" />
							</div>
							<DialogFooter className="gap-2">
								<DialogClose asChild><Button type="button" variant="outline" className="rounded-xl">Batal</Button></DialogClose>
								<Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
									{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Buat Promo
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{promos.length === 0 ? (
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-16 text-center">
						<Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada promo</h3>
						<p className="text-muted-foreground">Buat kode promo pertama untuk pelanggan Anda.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid sm:grid-cols-2 gap-4">
					{promos.map((promo) => (
						<Card key={promo.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
							<CardContent className="p-5">
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
											<span className="font-mono font-bold text-emerald-700 text-sm">{promo.code}</span>
										</div>
										<Badge variant="secondary" className={`rounded-lg text-xs ${promo.is_active
											? "bg-emerald-50 text-emerald-600 border-emerald-200"
											: "bg-gray-100 text-gray-500"}`}>
											{promo.is_active ? "Aktif" : "Nonaktif"}
										</Badge>
									</div>
									<div className="flex gap-1">
										<button onClick={() => { navigator.clipboard.writeText(promo.code); toast.success("Kode disalin!"); }}
											className="p-1.5 rounded-lg hover:bg-gray-100"><Copy className="w-3.5 h-3.5 text-gray-500" /></button>
										<button onClick={() => toggleActive(promo)} className="p-1.5 rounded-lg hover:bg-gray-100">
											{promo.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
										</button>
										<button onClick={() => deletePromo(promo.id)} className="p-1.5 rounded-lg hover:bg-red-50">
											<Trash2 className="w-3.5 h-3.5 text-red-500" />
										</button>
									</div>
								</div>
								<div className="space-y-1 text-sm">
									<p className="text-2xl font-bold text-emerald-600">{promo.discount_percent}% OFF</p>
									<p className="text-muted-foreground">
										Digunakan: {promo.used_count}/{promo.max_uses}
									</p>
									{promo.expires_at && (
										<p className="text-xs text-muted-foreground">
											Berlaku sampai: {new Date(promo.expires_at).toLocaleDateString("id-ID")}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
