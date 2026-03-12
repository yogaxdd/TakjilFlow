"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Product, Order, SalesData, DashboardStats } from "@/types";
import StatCard from "@/components/stat-card";
import DailyOrdersChart from "@/components/daily-orders-chart";
import { Package, ShoppingCart, TrendingUp, Percent, Copy, CheckCheck, DollarSign, BarChart3, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductRanking {
	name: string;
	totalSold: number;
	revenue: number;
}

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalProducts: 0,
		ordersToday: 0,
		totalItemsSold: 0,
		stockSoldPercentage: 0,
		totalRevenue: 0,
		averageOrderValue: 0,
	});
	const [chartData, setChartData] = useState<SalesData[]>([]);
	const [recentOrders, setRecentOrders] = useState<Order[]>([]);
	const [bestSelling, setBestSelling] = useState<ProductRanking[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [smartInsight, setSmartInsight] = useState("");
	const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);

	const supabase = createClient();

	useEffect(() => {
		fetchDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Supabase Realtime — new order notification
	useEffect(() => {
		const channel = supabase
			.channel("orders-realtime")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "orders" },
				(payload) => {
					const name = payload.new?.customer_name || "Seseorang";
					const msg = `🛒 Pesanan baru dari ${name}!`;
					setRealtimeAlert(msg);
					toast.success(msg, { description: "Cek halaman Pesanan.", duration: 6000 });
					// subtle audio click
					try {
						const ctx = new AudioContext();
						const osc = ctx.createOscillator();
						const gain = ctx.createGain();
						osc.connect(gain); gain.connect(ctx.destination);
						osc.frequency.value = 880;
						gain.gain.setValueAtTime(0.4, ctx.currentTime);
						gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
						osc.start(); osc.stop(ctx.currentTime + 0.4);
					} catch {/* ignore */ }
					setTimeout(() => setRealtimeAlert(null), 8000);
					// refresh stats
					setTimeout(() => fetchDashboardData(), 1500);
				}
			)
			.subscribe();
		return () => { supabase.removeChannel(channel); };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const formatRupiah = (amount: number) =>
		new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

	const fetchDashboardData = async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { data: profile } = await supabase
				.from("seller_profiles")
				.select("store_slug")
				.eq("user_id", user.id)
				.single();

			setUserId(profile?.store_slug || user.id);

			const { data: products } = await supabase
				.from("products").select("*").eq("user_id", user.id);

			const productIds = (products || []).map((p: Product) => p.id);
			let orders: Order[] = [];
			if (productIds.length > 0) {
				const { data: ordersData } = await supabase
					.from("orders").select("*, products(*)")
					.in("product_id", productIds)
					.neq("status", "cancelled")
					.order("created_at", { ascending: false });
				orders = ordersData || [];
			}

			const today = new Date().toISOString().split("T")[0];
			const todayOrders = orders.filter((o) => o.created_at.split("T")[0] === today);
			const totalItemsSold = orders.reduce((acc, o) => acc + o.quantity, 0);
			const totalStock = (products || []).reduce((acc: number, p: Product) => acc + p.stock_limit, 0);
			const stockSoldPercentage = totalStock > 0 ? Math.round((totalItemsSold / totalStock) * 100) : 0;

			// Revenue calculation
			const totalRevenue = orders.reduce((acc, o) => {
				const price = o.products?.price || 0;
				return acc + (price * o.quantity) - (o.discount_amount || 0);
			}, 0);
			const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

			setStats({
				totalProducts: (products || []).length,
				ordersToday: todayOrders.length,
				totalItemsSold,
				stockSoldPercentage: Math.min(stockSoldPercentage, 100),
				totalRevenue,
				averageOrderValue,
			});

			setRecentOrders(orders.slice(0, 5));

			// Best selling products
			const productSales: { [key: string]: ProductRanking } = {};
			orders.forEach((o) => {
				const name = o.products?.name || "Unknown";
				const price = o.products?.price || 0;
				if (!productSales[name]) {
					productSales[name] = { name, totalSold: 0, revenue: 0 };
				}
				productSales[name].totalSold += o.quantity;
				productSales[name].revenue += price * o.quantity;
			});
			setBestSelling(
				Object.values(productSales).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5)
			);

			// Smart Insights
			const topProducts = Object.values(productSales).sort((a, b) => b.totalSold - a.totalSold);
			if (topProducts.length > 0 && totalRevenue > 0) {
				const top = topProducts[0];
				const pct = Math.round((top.revenue / totalRevenue) * 100);
				const insight = pct >= 50
					? `\u26a1 "${top.name}" menyumbang ${pct}% pendapatan. Pastikan stok selalu cukup!`
					: averageOrderValue > 30000
						? `\ud83d\udca1 Rata-rata pesanan Rp ${averageOrderValue.toLocaleString("id-ID")}. Coba buat paket bundling untuk meningkatkan nilai pesanan.`
						: `\ud83d\udcc8 "${top.name}" adalah produk terlaris. Pertimbangkan menambah varian.`;
				setSmartInsight(insight);
			}

			// Build chart data for last 7 days
			const last7Days: SalesData[] = [];
			for (let i = 6; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				const dateStr = date.toISOString().split("T")[0];
				const dayOrders = orders.filter((o) => o.created_at.split("T")[0] === dateStr);
				const dayItems = dayOrders.reduce((acc, o) => acc + o.quantity, 0);
				const dayRevenue = dayOrders.reduce((acc, o) => acc + ((o.products?.price || 0) * o.quantity), 0);
				last7Days.push({
					date: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
					orders: dayOrders.length,
					items: dayItems,
					revenue: dayRevenue,
				});
			}
			setChartData(last7Days);
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	const copyStoreLink = () => {
		if (userId) {
			const link = `${window.location.origin}/store/${userId}`;
			navigator.clipboard.writeText(link);
			setCopied(true);
			toast.success("Link toko disalin!");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="h-32 bg-white rounded-2xl shadow-sm animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-muted-foreground mt-1">Ringkasan penjualan takjil Anda</p>
				</div>
				<div className="flex gap-2">
					{userId && (
						<Button
							variant="outline"
							onClick={copyStoreLink}
							className="rounded-xl gap-2 border-emerald-200 hover:bg-emerald-50"
						>
							{copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
							{copied ? "Disalin!" : "Salin Link Toko"}
						</Button>
					)}
				</div>
			</div>

			{/* Real-time Alert Banner */}
			{realtimeAlert && (
				<div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 animate-in slide-in-from-top-2 duration-300">
					<span className="relative flex h-2.5 w-2.5 flex-shrink-0">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
					</span>
					<span className="text-sm font-medium text-emerald-800">{realtimeAlert}</span>
				</div>
			)}

			{/* Smart Insight */}
			{smartInsight && (
				<div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
					<BarChart3 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
					<p className="text-sm text-amber-800 font-medium">{smartInsight}</p>
				</div>
			)}

			{/* Revenue Highlight */}
			<div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-md">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-emerald-100 text-sm font-medium">Total Pendapatan</p>
						<p className="text-3xl font-bold mt-1">{formatRupiah(stats.totalRevenue)}</p>
						<p className="text-emerald-200 text-xs mt-2">
							Rata-rata per pesanan: {formatRupiah(stats.averageOrderValue)}
						</p>
					</div>
					<div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
						<DollarSign className="w-7 h-7 text-white" />
					</div>
				</div>
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard title="Total Produk" value={stats.totalProducts} icon={Package} color="emerald" />
				<StatCard title="Pesanan Hari Ini" value={stats.ordersToday} icon={ShoppingCart} color="orange" />
				<StatCard title="Total Item Terjual" value={stats.totalItemsSold} icon={TrendingUp} color="blue" />
				<StatCard title="% Stok Terjual" value={`${stats.stockSoldPercentage}%`} icon={Percent} color="purple" />
			</div>

			{/* Chart + Best Selling */}
			<div className="grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<DailyOrdersChart data={chartData} />
				</div>
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<Crown className="w-5 h-5 text-orange-500" /> Produk Terlaris
					</h2>
					{bestSelling.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
							<p className="text-sm">Belum ada data penjualan</p>
						</div>
					) : (
						<div className="space-y-3">
							{bestSelling.map((product, i) => (
								<div key={product.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
									<div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-yellow-100 text-yellow-700" :
										i === 1 ? "bg-gray-200 text-gray-600" :
											i === 2 ? "bg-orange-100 text-orange-700" :
												"bg-gray-100 text-gray-500"
										}`}>
										{i + 1}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
										<p className="text-xs text-muted-foreground">{product.totalSold} terjual</p>
									</div>
									<span className="text-sm font-semibold text-emerald-600">{formatRupiah(product.revenue)}</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Recent Orders */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Pesanan Terbaru</h2>
				{recentOrders.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
						<p>Belum ada pesanan masuk</p>
						<p className="text-sm mt-1">Bagikan link toko Anda untuk mulai menerima pesanan</p>
					</div>
				) : (
					<div className="space-y-3">
						{recentOrders.map((order) => (
							<div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
										<ShoppingCart className="w-5 h-5 text-emerald-600" />
									</div>
									<div>
										<p className="font-medium text-gray-900">{order.customer_name}</p>
										<p className="text-sm text-muted-foreground">
											{order.products?.name} × {order.quantity}
											{order.products && (
												<span className="ml-2 font-medium text-emerald-600">
													{formatRupiah(order.products.price * order.quantity)}
												</span>
											)}
										</p>
									</div>
								</div>
								<div className="text-right">
									<Badge variant="secondary" className={`rounded-lg ${order.status === "pending" ? "bg-orange-50 text-orange-600 border-orange-200" :
										order.status === "confirmed" ? "bg-blue-50 text-blue-600 border-blue-200" :
											order.status === "done" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
												"bg-red-50 text-red-600 border-red-200"
										}`}>
										{order.status === "pending" ? "Menunggu" :
											order.status === "confirmed" ? "Dikonfirmasi" :
												order.status === "done" ? "Selesai" : "Dibatalkan"}
									</Badge>
									<p className="text-xs text-muted-foreground mt-1">
										{new Date(order.created_at).toLocaleDateString("id-ID", {
											day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
										})}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
