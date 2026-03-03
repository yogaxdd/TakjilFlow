"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Search, Phone, ShoppingBag, Crown, TrendingUp } from "lucide-react";

interface Customer {
	name: string;
	phone: string;
	address: string;
	totalOrders: number;
	totalItems: number;
	totalSpent: number;
	lastOrder: string;
}

export default function CustomersPage() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	const supabase = createClient();

	useEffect(() => { fetchCustomers(); }, []); // eslint-disable-line

	const fetchCustomers = async () => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			const { data: products } = await supabase
				.from("products").select("id").eq("user_id", user.id);
			if (!products || products.length === 0) { setLoading(false); return; }

			const productIds = products.map((p) => p.id);
			const { data: orders } = await supabase
				.from("orders").select("*, products(*)")
				.in("product_id", productIds)
				.order("created_at", { ascending: false });

			// Aggregate by phone
			const customerMap: { [phone: string]: Customer } = {};
			(orders || []).forEach((o: Order) => {
				const phone = o.customer_phone;
				if (!customerMap[phone]) {
					customerMap[phone] = {
						name: o.customer_name,
						phone,
						address: o.customer_address || "",
						totalOrders: 0,
						totalItems: 0,
						totalSpent: 0,
						lastOrder: o.created_at,
					};
				}
				customerMap[phone].totalOrders += 1;
				customerMap[phone].totalItems += o.quantity;
				customerMap[phone].totalSpent += (o.products?.price || 0) * o.quantity;
				if (o.created_at > customerMap[phone].lastOrder) {
					customerMap[phone].lastOrder = o.created_at;
					customerMap[phone].name = o.customer_name;
				}
			});

			setCustomers(Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent));
		} catch (e) { console.error(e); toast.error("Gagal memuat data pelanggan"); }
		finally { setLoading(false); }
	};

	const formatRupiah = (amount: number) =>
		new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

	const filtered = customers.filter((c) =>
		c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		c.phone.includes(searchTerm)
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
				<div className="grid grid-cols-3 gap-4">
					{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
				</div>
				<div className="h-[400px] bg-white rounded-2xl animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pelanggan</h1>
				<p className="text-muted-foreground mt-1">Database pelanggan dari semua pesanan</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
							<Users className="w-6 h-6 text-emerald-600" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Total Pelanggan</p>
							<p className="text-2xl font-bold text-gray-900">{customers.length}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
							<ShoppingBag className="w-6 h-6 text-orange-600" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Total Pesanan</p>
							<p className="text-2xl font-bold text-gray-900">{customers.reduce((a, c) => a + c.totalOrders, 0)}</p>
						</div>
					</CardContent>
				</Card>
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
							<TrendingUp className="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Total Pendapatan</p>
							<p className="text-2xl font-bold text-gray-900">{formatRupiah(customers.reduce((a, c) => a + c.totalSpent, 0))}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Search */}
			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
				<Input
					placeholder="Cari nama atau telepon..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-10 rounded-xl"
				/>
			</div>

			{/* Table */}
			{filtered.length === 0 ? (
				<Card className="rounded-2xl border-0 shadow-sm">
					<CardContent className="p-16 text-center">
						<Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pelanggan</h3>
						<p className="text-muted-foreground text-sm">Pelanggan akan muncul setelah ada pesanan masuk.</p>
					</CardContent>
				</Card>
			) : (
				<Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="font-semibold">#</TableHead>
								<TableHead className="font-semibold">Pelanggan</TableHead>
								<TableHead className="font-semibold">Pesanan</TableHead>
								<TableHead className="font-semibold">Item</TableHead>
								<TableHead className="font-semibold">Total Belanja</TableHead>
								<TableHead className="font-semibold">Terakhir</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.map((customer, i) => (
								<TableRow key={customer.phone} className="hover:bg-gray-50/50">
									<TableCell>
										{i < 3 ? (
											<div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? "bg-yellow-100 text-yellow-700" :
													i === 1 ? "bg-gray-200 text-gray-600" :
														"bg-orange-100 text-orange-700"
												}`}>
												{i === 0 && <Crown className="w-3.5 h-3.5" />}
												{i > 0 && (i + 1)}
											</div>
										) : (
											<span className="text-sm text-muted-foreground">{i + 1}</span>
										)}
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium text-gray-900">{customer.name}</p>
											<p className="text-xs text-muted-foreground flex items-center gap-1">
												<Phone className="w-3 h-3" />
												<a href={`https://wa.me/${customer.phone.replace(/^0/, "62")}`}
													target="_blank" rel="noopener noreferrer"
													className="text-emerald-600 hover:underline">{customer.phone}</a>
											</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="secondary" className="rounded-lg bg-emerald-50 text-emerald-700">
											{customer.totalOrders}x
										</Badge>
									</TableCell>
									<TableCell>
										<span className="text-sm font-medium">{customer.totalItems} pcs</span>
									</TableCell>
									<TableCell>
										<span className="font-semibold text-emerald-600">{formatRupiah(customer.totalSpent)}</span>
									</TableCell>
									<TableCell>
										<span className="text-sm text-muted-foreground">
											{new Date(customer.lastOrder).toLocaleDateString("id-ID", {
												day: "numeric", month: "short",
											})}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}
		</div>
	);
}
