"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Order, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	BarChart3, TrendingUp, DollarSign, ShoppingCart, Package, Crown, Calendar,
} from "lucide-react";

export default function ReportPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [period, setPeriod] = useState("today");

	const supabase = createClient();

	useEffect(() => { fetchData(); }, []); // eslint-disable-line

	const fetchData = async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { data: prods } = await supabase.from("products").select("*").eq("user_id", user.id);
			setProducts(prods || []);

			const productIds = (prods || []).map((p) => p.id);
			if (productIds.length === 0) { setLoading(false); return; }

			const { data } = await supabase
				.from("orders").select("*, products(*)")
				.in("product_id", productIds)
				.order("created_at", { ascending: false });
			setOrders(data || []);
		} catch (e) { console.error(e); } finally { setLoading(false); }
	};

	const formatRupiah = (n: number) =>
		new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

	const getFilteredOrders = () => {
		const now = new Date();
		return orders.filter((o) => {
			if (o.status === "cancelled") return false;
			const d = new Date(o.created_at);
			if (period === "today") return d.toDateString() === now.toDateString();
			if (period === "week") {
				const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
				return d >= weekAgo;
			}
			if (period === "month") {
				return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
			}
			return true;
		});
	};

	const filtered = getFilteredOrders();
	const totalRevenue = filtered.reduce((a, o) => a + ((o.products?.price || 0) * o.quantity) - (o.discount_amount || 0), 0);
	const totalItems = filtered.reduce((a, o) => a + o.quantity, 0);
	const avgOrder = filtered.length > 0 ? Math.round(totalRevenue / filtered.length) : 0;

	// Best seller
	const productSales: { [key: string]: { name: string; sold: number; revenue: number } } = {};
	filtered.forEach((o) => {
		const name = o.products?.name || "-";
		const price = o.products?.price || 0;
		if (!productSales[name]) productSales[name] = { name, sold: 0, revenue: 0 };
		productSales[name].sold += o.quantity;
		productSales[name].revenue += price * o.quantity;
	});
	const topProducts = Object.values(productSales).sort((a, b) => b.sold - a.sold);

	// Status counts
	const statusCounts = {
		pending: filtered.filter((o) => o.status === "pending").length,
		confirmed: filtered.filter((o) => o.status === "confirmed").length,
		done: filtered.filter((o) => o.status === "done").length,
	};

	// Payment method breakdown
	const paymentBreakdown: { [key: string]: number } = {};
	filtered.forEach((o) => {
		const m = o.payment_method || "cod";
		paymentBreakdown[m] = (paymentBreakdown[m] || 0) + 1;
	});

	const periodLabel = period === "today" ? "Hari Ini" : period === "week" ? "Minggu Ini" : period === "month" ? "Bulan Ini" : "Semua";

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
				<div className="grid grid-cols-2 gap-4">
					{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Laporan</h1>
					<p className="text-muted-foreground mt-1">Ringkasan penjualan dan analisis</p>
				</div>
				<Select value={period} onValueChange={setPeriod}>
					<SelectTrigger className="w-44 rounded-xl">
						<Calendar className="w-4 h-4 mr-2 text-gray-400" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="today">Hari Ini</SelectItem>
						<SelectItem value="week">Minggu Ini</SelectItem>
						<SelectItem value="month">Bulan Ini</SelectItem>
						<SelectItem value="all">Semua Waktu</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Revenue Card */}
			<div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
				<p className="text-emerald-100 text-sm font-medium">Pendapatan {periodLabel}</p>
				<p className="text-3xl sm:text-4xl font-bold mt-1">{formatRupiah(totalRevenue)}</p>
				<div className="flex gap-6 mt-3 text-emerald-200 text-sm">
					<span>{filtered.length} pesanan</span>
					<span>{totalItems} item</span>
					<span>Rata² {formatRupiah(avgOrder)}/pesanan</span>
				</div>
			</div>

			{/* Status Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
							<ShoppingCart className="w-6 h-6 text-orange-600" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Menunggu</p>
							<p className="text-2xl font-bold text-orange-700">{statusCounts.pending}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
							<Package className="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Dikonfirmasi</p>
							<p className="text-2xl font-bold text-blue-700">{statusCounts.confirmed}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
							<TrendingUp className="w-6 h-6 text-emerald-600" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Selesai</p>
							<p className="text-2xl font-bold text-emerald-700">{statusCounts.done}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Best Products */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg flex items-center gap-2">
							<Crown className="w-5 h-5 text-orange-500" /> Produk Terlaris
						</CardTitle>
					</CardHeader>
					<CardContent>
						{topProducts.length === 0 ? (
							<p className="text-muted-foreground text-center py-8">Belum ada data</p>
						) : (
							<div className="space-y-3">
								{topProducts.map((p, i) => (
									<div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
										<div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-yellow-100 text-yellow-700" :
												i === 1 ? "bg-gray-200 text-gray-600" :
													"bg-gray-100 text-gray-500"
											}`}>{i + 1}</div>
										<div className="flex-1">
											<p className="font-medium text-sm">{p.name}</p>
											<p className="text-xs text-muted-foreground">{p.sold} terjual</p>
										</div>
										<span className="text-sm font-semibold text-emerald-600">{formatRupiah(p.revenue)}</span>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Payment Breakdown */}
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg flex items-center gap-2">
							<DollarSign className="w-5 h-5 text-blue-500" /> Metode Pembayaran
						</CardTitle>
					</CardHeader>
					<CardContent>
						{Object.keys(paymentBreakdown).length === 0 ? (
							<p className="text-muted-foreground text-center py-8">Belum ada data</p>
						) : (
							<div className="space-y-3">
								{Object.entries(paymentBreakdown).sort((a, b) => b[1] - a[1]).map(([method, count]) => {
									const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
									const label = method === "qris" ? "QRIS" : method === "dana" ? "Dana" :
										method === "gopay" ? "GoPay" : method === "shopeepay" ? "ShopeePay" : "COD";
									return (
										<div key={method} className="space-y-1">
											<div className="flex justify-between text-sm">
												<span className="font-medium">{label}</span>
												<span className="text-muted-foreground">{count} ({pct}%)</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
