"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
	ShoppingCart,
	Search,
	Phone,
	MapPin,
	User,
	Filter,
	Eye,
	CreditCard,
	Download,
	CheckCheck,
} from "lucide-react";

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	const supabase = createClient();

	useEffect(() => {
		fetchOrders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchOrders = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// Fetch user's products first
			const { data: products } = await supabase
				.from("products")
				.select("id")
				.eq("user_id", user.id);

			if (!products || products.length === 0) {
				setOrders([]);
				setLoading(false);
				return;
			}

			const productIds = products.map((p) => p.id);

			const { data, error } = await supabase
				.from("orders")
				.select("*, products(*)")
				.in("product_id", productIds)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setOrders(data || []);
		} catch (error) {
			console.error("Error fetching orders:", error);
			toast.error("Gagal memuat pesanan");
		} finally {
			setLoading(false);
		}
	};

	const updateOrderStatus = async (orderId: string, newStatus: string) => {
		try {
			const { error } = await supabase
				.from("orders")
				.update({ status: newStatus })
				.eq("id", orderId);
			if (error) throw error;
			toast.success(`Status diperbarui ke "${getStatusLabel(newStatus)}"`);
			fetchOrders();
			setSelectedOrder(null);
		} catch (error) {
			console.error("Error updating order:", error);
			toast.error("Gagal memperbarui status");
		}
	};

	const exportCSV = () => {
		const headers = ["Nama", "Telepon", "Alamat", "Produk", "Qty", "Total", "Bayar", "Status", "Waktu"];
		const rows = filteredOrders.map((o) => [
			o.customer_name,
			o.customer_phone,
			o.customer_address || "-",
			o.products?.name || "-",
			o.quantity,
			o.products ? o.products.price * o.quantity : 0,
			getPaymentLabel(o.payment_method),
			getStatusLabel(o.status),
			new Date(o.created_at).toLocaleString("id-ID"),
		]);
		const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `pesanan_${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("Data pesanan berhasil diexport!");
	};

	const bulkConfirmPending = async () => {
		const pending = orders.filter((o) => o.status === "pending");
		if (pending.length === 0) { toast.info("Tidak ada pesanan menunggu"); return; }
		try {
			const ids = pending.map((o) => o.id);
			const { error } = await supabase.from("orders").update({ status: "confirmed" }).in("id", ids);
			if (error) throw error;
			toast.success(`${pending.length} pesanan dikonfirmasi!`);
			fetchOrders();
		} catch { toast.error("Gagal konfirmasi massal"); }
	};

	const bulkDoneConfirmed = async () => {
		const confirmed = orders.filter((o) => o.status === "confirmed");
		if (confirmed.length === 0) { toast.info("Tidak ada pesanan dikonfirmasi"); return; }
		try {
			const ids = confirmed.map((o) => o.id);
			const { error } = await supabase.from("orders").update({ status: "done" }).in("id", ids);
			if (error) throw error;
			toast.success(`${confirmed.length} pesanan diselesaikan!`);
			fetchOrders();
		} catch { toast.error("Gagal menyelesaikan massal"); }
	};

	const formatRupiah = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "pending":
				return "Menunggu";
			case "confirmed":
				return "Dikonfirmasi";
			case "done":
				return "Selesai";
			case "cancelled":
				return "Dibatalkan";
			default:
				return status;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-orange-50 text-orange-600 border-orange-200";
			case "confirmed":
				return "bg-blue-50 text-blue-600 border-blue-200";
			case "done":
				return "bg-emerald-50 text-emerald-600 border-emerald-200";
			case "cancelled":
				return "bg-red-50 text-red-600 border-red-200";
			default:
				return "bg-gray-50 text-gray-600 border-gray-200";
		}
	};

	const getPaymentLabel = (method: string) => {
		switch (method) {
			case "qris": return "QRIS";
			case "dana": return "Dana";
			case "gopay": return "GoPay";
			case "shopeepay": return "ShopeePay";
			case "cod": return "COD";
			default: return method || "-";
		}
	};

	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.customer_phone.includes(searchTerm) ||
			order.products?.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Group orders by customer + timestamp (within same minute = same order batch)
	const orderStats = {
		total: orders.length,
		pending: orders.filter((o) => o.status === "pending").length,
		confirmed: orders.filter((o) => o.status === "confirmed").length,
		done: orders.filter((o) => o.status === "done").length,
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
				<div className="grid grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-20 bg-white rounded-2xl shadow-sm animate-pulse" />
					))}
				</div>
				<div className="h-[400px] bg-white rounded-2xl shadow-sm animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
					Pesanan
				</h1>
				<p className="text-muted-foreground mt-1">
					Kelola pesanan masuk dari pelanggan
				</p>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-wrap gap-2">
				<Button onClick={exportCSV} variant="outline" className="rounded-xl gap-2" size="sm">
					<Download className="w-4 h-4" /> Export CSV
				</Button>
				{orderStats.pending > 0 && (
					<Button onClick={bulkConfirmPending} className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
						<CheckCheck className="w-4 h-4" /> Konfirmasi Semua ({orderStats.pending})
					</Button>
				)}
				{orderStats.confirmed > 0 && (
					<Button onClick={bulkDoneConfirmed} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
						<CheckCheck className="w-4 h-4" /> Selesaikan Semua ({orderStats.confirmed})
					</Button>
				)}
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div className="bg-white rounded-2xl p-4 shadow-sm">
					<p className="text-xs font-medium text-muted-foreground">Total</p>
					<p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
				</div>
				<div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
					<p className="text-xs font-medium text-orange-600">Menunggu</p>
					<p className="text-2xl font-bold text-orange-700">{orderStats.pending}</p>
				</div>
				<div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
					<p className="text-xs font-medium text-blue-600">Dikonfirmasi</p>
					<p className="text-2xl font-bold text-blue-700">{orderStats.confirmed}</p>
				</div>
				<div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
					<p className="text-xs font-medium text-emerald-600">Selesai</p>
					<p className="text-2xl font-bold text-emerald-700">{orderStats.done}</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<Input
						placeholder="Cari nama, telepon, atau produk..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 rounded-xl"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-full sm:w-48 rounded-xl">
						<Filter className="w-4 h-4 mr-2 text-gray-400" />
						<SelectValue placeholder="Filter Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Semua Status</SelectItem>
						<SelectItem value="pending">Menunggu</SelectItem>
						<SelectItem value="confirmed">Dikonfirmasi</SelectItem>
						<SelectItem value="done">Selesai</SelectItem>
						<SelectItem value="cancelled">Dibatalkan</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Orders Table */}
			{
				filteredOrders.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-sm p-16 text-center">
						<ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							{orders.length === 0 ? "Belum ada pesanan" : "Tidak ada hasil"}
						</h3>
						<p className="text-muted-foreground">
							{orders.length === 0
								? "Pesanan dari pelanggan akan muncul di sini."
								: "Coba ubah filter atau kata kunci pencarian."}
						</p>
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead className="font-semibold">Pelanggan</TableHead>
									<TableHead className="font-semibold">Produk</TableHead>
									<TableHead className="font-semibold">Qty</TableHead>
									<TableHead className="font-semibold">Total</TableHead>
									<TableHead className="font-semibold">Bayar</TableHead>
									<TableHead className="font-semibold">Status</TableHead>
									<TableHead className="font-semibold">Waktu</TableHead>
									<TableHead className="font-semibold text-right">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredOrders.map((order) => (
									<TableRow key={order.id} className="hover:bg-gray-50/50">
										<TableCell>
											<div className="space-y-0.5">
												<p className="font-medium text-gray-900 flex items-center gap-1.5">
													<User className="w-3.5 h-3.5 text-gray-400" />
													{order.customer_name}
												</p>
												<p className="text-xs text-muted-foreground flex items-center gap-1.5">
													<Phone className="w-3 h-3" />
													{order.customer_phone}
												</p>
												{order.customer_address && (
													<p className="text-xs text-muted-foreground flex items-start gap-1.5">
														<MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
														<span className="line-clamp-1">{order.customer_address}</span>
													</p>
												)}
											</div>
										</TableCell>
										<TableCell>
											<span className="font-medium text-gray-900">
												{order.products?.name || "-"}
											</span>
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-sm font-medium">
												{order.quantity}
											</span>
										</TableCell>
										<TableCell>
											<span className="font-medium text-emerald-600">
												{order.products
													? formatRupiah(order.products.price * order.quantity)
													: "-"}
											</span>
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
												<CreditCard className="w-3 h-3" />
												{getPaymentLabel(order.payment_method)}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant="secondary"
												className={`rounded-lg ${getStatusColor(order.status)}`}
											>
												{getStatusLabel(order.status)}
											</Badge>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{new Date(order.created_at).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setSelectedOrder(order)}
												className="rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
											>
												<Eye className="w-4 h-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)
			}

			{/* Order Detail Dialog */}
			<Dialog
				open={selectedOrder !== null}
				onOpenChange={(open) => !open && setSelectedOrder(null)}
			>
				<DialogContent className="rounded-2xl sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Detail Pesanan</DialogTitle>
					</DialogHeader>
					{selectedOrder && (
						<div className="space-y-4">
							{/* Customer Info */}
							<div className="rounded-xl bg-gray-50 p-4 space-y-2">
								<div className="flex items-center gap-2">
									<User className="w-4 h-4 text-gray-500" />
									<span className="font-medium">{selectedOrder.customer_name}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Phone className="w-4 h-4" />
									<a
										href={`https://wa.me/${selectedOrder.customer_phone.replace(/^0/, "62")}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-emerald-600 hover:underline"
									>
										{selectedOrder.customer_phone}
									</a>
								</div>
								{selectedOrder.customer_address && (
									<div className="flex items-start gap-2 text-sm text-muted-foreground">
										<MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
										<span>{selectedOrder.customer_address}</span>
									</div>
								)}
							</div>

							{/* Order Info */}
							<div className="rounded-xl border p-4 space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Produk</span>
									<span className="font-medium">
										{selectedOrder.products?.name}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Jumlah</span>
									<span className="font-medium">{selectedOrder.quantity} pcs</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Total</span>
									<span className="font-bold text-emerald-600">
										{selectedOrder.products
											? formatRupiah(
												selectedOrder.products.price * selectedOrder.quantity
											)
											: "-"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-muted-foreground">Waktu</span>
									<span className="text-sm">
										{new Date(selectedOrder.created_at).toLocaleDateString(
											"id-ID",
											{
												day: "numeric",
												month: "long",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											}
										)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Pembayaran</span>
									<span className="font-medium flex items-center gap-1.5">
										<CreditCard className="w-3.5 h-3.5 text-gray-400" />
										{getPaymentLabel(selectedOrder.payment_method)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Status</span>
									<Badge
										variant="secondary"
										className={`rounded-lg ${getStatusColor(selectedOrder.status)}`}
									>
										{getStatusLabel(selectedOrder.status)}
									</Badge>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-2">
								{selectedOrder.status === "pending" && (
									<>
										<Button
											onClick={() =>
												updateOrderStatus(selectedOrder.id, "confirmed")
											}
											className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
										>
											Konfirmasi
										</Button>
										<Button
											onClick={() =>
												updateOrderStatus(selectedOrder.id, "cancelled")
											}
											variant="outline"
											className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
										>
											Batalkan
										</Button>
									</>
								)}
								{selectedOrder.status === "confirmed" && (
									<Button
										onClick={() =>
											updateOrderStatus(selectedOrder.id, "done")
										}
										className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
									>
										Tandai Selesai
									</Button>
								)}
							</div>

							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline" className="w-full rounded-xl">
										Tutup
									</Button>
								</DialogClose>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div >
	);
}
