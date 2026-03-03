"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
	Search, Loader2, ShoppingBag, Store, Phone, MapPin, CreditCard, Clock, Package,
} from "lucide-react";

export default function TrackPage() {
	const [phone, setPhone] = useState("");
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);

	const supabase = createClient();

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!phone.trim()) return;
		setLoading(true);
		setSearched(true);

		try {
			const { data, error } = await supabase
				.from("orders")
				.select("*, products(*)")
				.eq("customer_phone", phone.trim())
				.order("created_at", { ascending: false });

			if (error) throw error;
			setOrders(data || []);
		} catch (error) {
			console.error(error);
			toast.error("Gagal mencari pesanan");
		} finally {
			setLoading(false);
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "pending": return "Menunggu";
			case "confirmed": return "Dikonfirmasi";
			case "done": return "Selesai";
			case "cancelled": return "Dibatalkan";
			default: return status;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending": return "bg-orange-50 text-orange-600 border-orange-200";
			case "confirmed": return "bg-blue-50 text-blue-600 border-blue-200";
			case "done": return "bg-emerald-50 text-emerald-600 border-emerald-200";
			case "cancelled": return "bg-red-50 text-red-600 border-red-200";
			default: return "bg-gray-50 text-gray-600";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending": return "⏳";
			case "confirmed": return "✅";
			case "done": return "🎉";
			case "cancelled": return "❌";
			default: return "📦";
		}
	};

	const formatRupiah = (amount: number) =>
		new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 sticky top-0 z-10">
				<div className="max-w-2xl mx-auto px-4 py-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
							<Store className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-lg font-bold text-gray-900">Lacak <span className="text-emerald-600">Pesanan</span></h1>
							<p className="text-xs text-muted-foreground">Cek status pesanan kamu 📦</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-2xl mx-auto px-4 py-8">
				{/* Search Form */}
				<Card className="rounded-2xl border-0 shadow-lg mb-8">
					<CardContent className="p-6">
						<form onSubmit={handleSearch} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="phone" className="flex items-center gap-1.5">
									<Phone className="w-4 h-4 text-gray-500" />
									Nomor WhatsApp
								</Label>
								<div className="flex gap-2">
									<Input
										id="phone"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="08xxxxxxxxxx"
										required
										className="rounded-xl h-11"
									/>
									<Button
										type="submit"
										disabled={loading}
										className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6"
									>
										{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
									</Button>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>

				{/* Results */}
				{searched && !loading && (
					<>
						{orders.length === 0 ? (
							<div className="text-center py-16">
								<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
								<h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada pesanan</h3>
								<p className="text-muted-foreground text-sm">
									Tidak ditemukan pesanan dengan nomor <strong>{phone}</strong>
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Ditemukan <strong className="text-gray-900">{orders.length}</strong> pesanan
								</p>
								{orders.map((order) => (
									<Card key={order.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
										<CardContent className="p-5">
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-center gap-2">
													<span className="text-lg">{getStatusIcon(order.status)}</span>
													<Badge variant="secondary" className={`rounded-lg ${getStatusColor(order.status)}`}>
														{getStatusLabel(order.status)}
													</Badge>
												</div>
												<span className="text-xs text-muted-foreground flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{new Date(order.created_at).toLocaleDateString("id-ID", {
														day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
													})}
												</span>
											</div>

											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<Package className="w-4 h-4 text-gray-400" />
													<span className="font-medium">{order.products?.name}</span>
													<span className="text-xs text-muted-foreground">× {order.quantity}</span>
												</div>
												<div className="flex items-center gap-2">
													<CreditCard className="w-4 h-4 text-gray-400" />
													<span className="font-bold text-emerald-600">
														{order.products ? formatRupiah(order.products.price * order.quantity) : "-"}
													</span>
													{order.discount_amount > 0 && (
														<span className="text-xs text-red-500 line-through">
															{formatRupiah(order.products ? order.products.price * order.quantity + order.discount_amount : 0)}
														</span>
													)}
												</div>
												{order.customer_address && (
													<div className="flex items-start gap-2 text-sm text-muted-foreground">
														<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
														<span>{order.customer_address}</span>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</>
				)}
			</div>

			<footer className="border-t border-gray-100 mt-12 py-6 text-center text-sm text-muted-foreground">
				Powered by <span className="font-semibold text-emerald-600">TakjilFlow</span> 🌙
			</footer>
		</div>
	);
}
