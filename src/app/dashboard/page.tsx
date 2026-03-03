"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Product, Order, SalesData, DashboardStats } from "@/types";
import StatCard from "@/components/stat-card";
import DailyOrdersChart from "@/components/daily-orders-chart";
import { Package, ShoppingCart, TrendingUp, Percent, Copy, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalProducts: 0,
		ordersToday: 0,
		totalItemsSold: 0,
		stockSoldPercentage: 0,
	});
	const [chartData, setChartData] = useState<SalesData[]>([]);
	const [recentOrders, setRecentOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const supabase = createClient();

	useEffect(() => {
		fetchDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchDashboardData = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;
			setUserId(user.id);

			// Fetch products
			const { data: products } = await supabase
				.from("products")
				.select("*")
				.eq("user_id", user.id);

			// Fetch orders for user's products
			const productIds = (products || []).map((p: Product) => p.id);
			let orders: Order[] = [];
			if (productIds.length > 0) {
				const { data: ordersData } = await supabase
					.from("orders")
					.select("*, products(*)")
					.in("product_id", productIds)
					.order("created_at", { ascending: false });
				orders = ordersData || [];
			}

			// Calculate stats
			const today = new Date().toISOString().split("T")[0];
			const todayOrders = orders.filter(
				(o) => o.created_at.split("T")[0] === today
			);
			const totalItemsSold = orders.reduce((acc, o) => acc + o.quantity, 0);
			const totalStock = (products || []).reduce(
				(acc: number, p: Product) => acc + p.stock_limit,
				0
			);
			const stockSoldPercentage =
				totalStock > 0 ? Math.round((totalItemsSold / totalStock) * 100) : 0;

			setStats({
				totalProducts: (products || []).length,
				ordersToday: todayOrders.length,
				totalItemsSold,
				stockSoldPercentage: Math.min(stockSoldPercentage, 100),
			});

			// Recent orders
			setRecentOrders(orders.slice(0, 5));

			// Build chart data for last 7 days
			const last7Days: SalesData[] = [];
			for (let i = 6; i >= 0; i--) {
				const date = new Date();
				date.setDate(date.getDate() - i);
				const dateStr = date.toISOString().split("T")[0];
				const dayOrders = orders.filter(
					(o) => o.created_at.split("T")[0] === dateStr
				);
				const dayItems = dayOrders.reduce((acc, o) => acc + o.quantity, 0);
				last7Days.push({
					date: date.toLocaleDateString("id-ID", {
						day: "numeric",
						month: "short",
					}),
					orders: dayOrders.length,
					items: dayItems,
				});
			}
			setChartData(last7Days);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"
						/>
					))}
				</div>
				<div className="h-[400px] bg-white rounded-2xl shadow-sm animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
						Dashboard
					</h1>
					<p className="text-muted-foreground mt-1">
						Ringkasan penjualan takjil Anda hari ini
					</p>
				</div>
				{userId && (
					<Button
						variant="outline"
						onClick={copyStoreLink}
						className="rounded-xl gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
					>
						{copied ? (
							<CheckCheck className="w-4 h-4 text-emerald-600" />
						) : (
							<Copy className="w-4 h-4" />
						)}
						{copied ? "Disalin!" : "Salin Link Toko"}
					</Button>
				)}
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Total Produk"
					value={stats.totalProducts}
					icon={Package}
					color="emerald"
				/>
				<StatCard
					title="Pesanan Hari Ini"
					value={stats.ordersToday}
					icon={ShoppingCart}
					color="orange"
				/>
				<StatCard
					title="Total Item Terjual"
					value={stats.totalItemsSold}
					icon={TrendingUp}
					color="blue"
				/>
				<StatCard
					title="% Stok Terjual"
					value={`${stats.stockSoldPercentage}%`}
					icon={Percent}
					color="purple"
				/>
			</div>

			{/* Chart */}
			<DailyOrdersChart data={chartData} />

			{/* Recent Orders */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					Pesanan Terbaru
				</h2>
				{recentOrders.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
						<p>Belum ada pesanan masuk</p>
						<p className="text-sm mt-1">
							Bagikan link toko Anda untuk mulai menerima pesanan
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{recentOrders.map((order) => (
							<div
								key={order.id}
								className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
							>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
										<ShoppingCart className="w-5 h-5 text-emerald-600" />
									</div>
									<div>
										<p className="font-medium text-gray-900">
											{order.customer_name}
										</p>
										<p className="text-sm text-muted-foreground">
											{order.products?.name} × {order.quantity}
										</p>
									</div>
								</div>
								<div className="text-right">
									<Badge
										variant={order.status === "pending" ? "secondary" : "default"}
										className={`rounded-lg ${order.status === "pending"
												? "bg-orange-50 text-orange-600 border-orange-200"
												: "bg-emerald-50 text-emerald-600 border-emerald-200"
											}`}
									>
										{order.status === "pending" ? "Menunggu" : order.status}
									</Badge>
									<p className="text-xs text-muted-foreground mt-1">
										{new Date(order.created_at).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
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
