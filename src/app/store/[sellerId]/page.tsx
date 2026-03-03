"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
	ShoppingBag,
	Minus,
	Plus,
	Loader2,
	ShoppingCart,
	Store,
	CheckCircle2,
} from "lucide-react";
import { useParams } from "next/navigation";

interface CartItem {
	product: Product;
	quantity: number;
}

export default function StorePage() {
	const params = useParams();
	const sellerId = params.sellerId as string;
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [customerName, setCustomerName] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [orderSuccess, setOrderSuccess] = useState(false);
	const [orderedItems, setOrderedItems] = useState<{ [productId: string]: number }>({});

	const supabase = createClient();

	useEffect(() => {
		fetchProducts();
		fetchExistingOrders();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sellerId]);

	const fetchProducts = async () => {
		try {
			const { data, error } = await supabase
				.from("products")
				.select("*")
				.eq("user_id", sellerId)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setProducts(data || []);
		} catch (error) {
			console.error("Error fetching products:", error);
			toast.error("Gagal memuat produk");
		} finally {
			setLoading(false);
		}
	};

	const fetchExistingOrders = async () => {
		try {
			// Fetch today's orders to calculate remaining stock
			const today = new Date().toISOString().split("T")[0];
			const { data: orders } = await supabase
				.from("orders")
				.select("product_id, quantity")
				.gte("created_at", `${today}T00:00:00`)
				.lte("created_at", `${today}T23:59:59`);

			if (orders) {
				const ordered: { [key: string]: number } = {};
				orders.forEach((o) => {
					ordered[o.product_id] = (ordered[o.product_id] || 0) + o.quantity;
				});
				setOrderedItems(ordered);
			}
		} catch (error) {
			console.error("Error fetching orders:", error);
		}
	};

	const getAvailableStock = (product: Product) => {
		const ordered = orderedItems[product.id] || 0;
		return Math.max(0, product.stock_limit - ordered);
	};

	const addToCart = (product: Product) => {
		const available = getAvailableStock(product);
		const existingItem = cart.find((item) => item.product.id === product.id);
		const currentQty = existingItem ? existingItem.quantity : 0;

		if (currentQty >= available) {
			toast.error("Stok tidak cukup");
			return;
		}

		if (existingItem) {
			setCart(
				cart.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			);
		} else {
			setCart([...cart, { product, quantity: 1 }]);
		}
	};

	const removeFromCart = (productId: string) => {
		const existingItem = cart.find((item) => item.product.id === productId);
		if (existingItem && existingItem.quantity > 1) {
			setCart(
				cart.map((item) =>
					item.product.id === productId
						? { ...item, quantity: item.quantity - 1 }
						: item
				)
			);
		} else {
			setCart(cart.filter((item) => item.product.id !== productId));
		}
	};

	const getCartQuantity = (productId: string) => {
		const item = cart.find((i) => i.product.id === productId);
		return item ? item.quantity : 0;
	};

	const totalAmount = cart.reduce(
		(acc, item) => acc + item.product.price * item.quantity,
		0
	);

	const formatRupiah = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const handleSubmitOrder = async (e: React.FormEvent) => {
		e.preventDefault();
		if (cart.length === 0) {
			toast.error("Keranjang masih kosong");
			return;
		}

		setSubmitting(true);
		try {
			// Validate stock again
			for (const item of cart) {
				const available = getAvailableStock(item.product);
				if (item.quantity > available) {
					toast.error(`Stok ${item.product.name} tidak cukup`, {
						description: `Tersedia: ${available} pcs`,
					});
					setSubmitting(false);
					return;
				}
			}

			// Insert orders
			const orders = cart.map((item) => ({
				product_id: item.product.id,
				quantity: item.quantity,
				customer_name: customerName,
				customer_phone: customerPhone,
				status: "pending",
			}));

			const { error } = await supabase.from("orders").insert(orders);
			if (error) throw error;

			setOrderSuccess(true);
			setCart([]);
			setCustomerName("");
			setCustomerPhone("");
			fetchExistingOrders();
			toast.success("Pesanan berhasil dikirim!");
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan";
			toast.error("Gagal mengirim pesanan", { description: errMsg });
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
			</div>
		);
	}

	if (orderSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center px-4">
				<Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm max-w-md w-full">
					<CardContent className="p-8 text-center">
						<div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
							<CheckCircle2 className="w-10 h-10 text-emerald-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Pesanan Berhasil! 🎉
						</h2>
						<p className="text-muted-foreground mb-6">
							Pesanan Anda sudah dikirim ke penjual. Silakan tunggu konfirmasi.
						</p>
						<Button
							onClick={() => {
								setOrderSuccess(false);
								fetchProducts();
							}}
							className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
						>
							Pesan Lagi
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
			{/* Header */}
			<div className="bg-white/80 backdrop-blur-md border-b border-emerald-100/50 sticky top-0 z-10">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
							<Store className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-lg font-bold text-gray-900">
								Takjil<span className="text-emerald-600">Flow</span> Store
							</h1>
							<p className="text-xs text-muted-foreground">
								Pesan takjil favoritmu di sini 🌙
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-8">
				{products.length === 0 ? (
					<div className="text-center py-20">
						<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Toko belum memiliki produk
						</h2>
						<p className="text-muted-foreground">
							Penjual belum menambahkan produk ke toko ini.
						</p>
					</div>
				) : (
					<div className="grid lg:grid-cols-3 gap-8">
						{/* Products */}
						<div className="lg:col-span-2 space-y-4">
							<h2 className="text-xl font-bold text-gray-900 mb-4">
								Menu Takjil
							</h2>
							<div className="grid sm:grid-cols-2 gap-4">
								{products.map((product) => {
									const available = getAvailableStock(product);
									const cartQty = getCartQuantity(product.id);
									const isSoldOut = available <= 0;

									return (
										<Card
											key={product.id}
											className={`rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isSoldOut ? "opacity-60" : ""
												}`}
										>
											<div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
											<CardContent className="p-5">
												<div className="flex justify-between items-start mb-3">
													<div>
														<h3 className="font-semibold text-gray-900">
															{product.name}
														</h3>
														{product.description && (
															<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
																{product.description}
															</p>
														)}
													</div>
												</div>
												<div className="flex items-center justify-between mt-4">
													<div>
														<p className="text-lg font-bold text-emerald-600">
															{formatRupiah(product.price)}
														</p>
														<p
															className={`text-xs ${isSoldOut
																	? "text-red-500 font-medium"
																	: "text-muted-foreground"
																}`}
														>
															{isSoldOut
																? "Habis"
																: `Sisa ${available} pcs`}
														</p>
													</div>
													{!isSoldOut && (
														<div className="flex items-center gap-2">
															{cartQty > 0 ? (
																<div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-1 py-1">
																	<button
																		onClick={() => removeFromCart(product.id)}
																		className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
																	>
																		<Minus className="w-4 h-4" />
																	</button>
																	<span className="w-8 text-center font-semibold text-emerald-700">
																		{cartQty}
																	</span>
																	<button
																		onClick={() => addToCart(product)}
																		className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors"
																		disabled={cartQty >= available}
																	>
																		<Plus className="w-4 h-4" />
																	</button>
																</div>
															) : (
																<Button
																	size="sm"
																	onClick={() => addToCart(product)}
																	className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
																>
																	<Plus className="w-4 h-4 mr-1" />
																	Tambah
																</Button>
															)}
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						</div>

						{/* Order Form */}
						<div className="lg:col-span-1">
							<div className="sticky top-24">
								<Card className="rounded-2xl border-0 shadow-lg bg-white">
									<CardHeader className="pb-3">
										<CardTitle className="flex items-center gap-2 text-lg">
											<ShoppingCart className="w-5 h-5 text-emerald-600" />
											Keranjang
										</CardTitle>
									</CardHeader>
									<CardContent>
										{cart.length === 0 ? (
											<div className="text-center py-6 text-muted-foreground">
												<ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
												<p className="text-sm">Keranjang masih kosong</p>
											</div>
										) : (
											<>
												<div className="space-y-3 mb-4">
													{cart.map((item) => (
														<div
															key={item.product.id}
															className="flex justify-between items-center p-3 rounded-xl bg-gray-50"
														>
															<div>
																<p className="font-medium text-sm text-gray-900">
																	{item.product.name}
																</p>
																<p className="text-xs text-muted-foreground">
																	{item.quantity} × {formatRupiah(item.product.price)}
																</p>
															</div>
															<p className="font-semibold text-emerald-600 text-sm">
																{formatRupiah(item.product.price * item.quantity)}
															</p>
														</div>
													))}
												</div>
												<div className="border-t pt-3 mb-4">
													<div className="flex justify-between items-center">
														<span className="font-semibold text-gray-900">
															Total
														</span>
														<span className="text-xl font-bold text-emerald-600">
															{formatRupiah(totalAmount)}
														</span>
													</div>
												</div>
											</>
										)}

										<form onSubmit={handleSubmitOrder} className="space-y-3">
											<div className="space-y-1.5">
												<Label htmlFor="customerName" className="text-xs">
													Nama Pemesan
												</Label>
												<Input
													id="customerName"
													value={customerName}
													onChange={(e) => setCustomerName(e.target.value)}
													placeholder="Nama lengkap"
													required
													className="rounded-xl h-10"
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="customerPhone" className="text-xs">
													No. WhatsApp
												</Label>
												<Input
													id="customerPhone"
													value={customerPhone}
													onChange={(e) => setCustomerPhone(e.target.value)}
													placeholder="08xxxxxxxxxx"
													required
													className="rounded-xl h-10"
												/>
											</div>
											<Button
												type="submit"
												className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-semibold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
												disabled={submitting || cart.length === 0}
											>
												{submitting ? (
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												) : (
													<ShoppingCart className="w-4 h-4 mr-2" />
												)}
												{submitting ? "Mengirim..." : "Kirim Pesanan"}
											</Button>
										</form>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<footer className="border-t border-gray-100 mt-12 py-6 text-center text-sm text-muted-foreground">
				Powered by{" "}
				<span className="font-semibold text-emerald-600">TakjilFlow</span> 🌙
			</footer>
		</div>
	);
}
