"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
	ShoppingBag, Minus, Plus, Loader2, ShoppingCart, Store,
	CheckCircle2, ImageIcon, MapPin, CreditCard, Smartphone,
	Truck, QrCode, StickyNote, ArrowLeft, X,
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
	const [customerAddress, setCustomerAddress] = useState("");
	const [orderNotes, setOrderNotes] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [orderSuccess, setOrderSuccess] = useState(false);
	const [showCart, setShowCart] = useState(false);
	const [remainingStock, setRemainingStock] = useState<{ [key: string]: number }>({});

	const supabase = createClient();

	useEffect(() => {
		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sellerId]);

	const fetchProducts = async () => {
		try {
			const { data } = await supabase
				.from("products")
				.select("*")
				.eq("user_id", sellerId)
				.order("created_at", { ascending: false });
			setProducts(data || []);

			// Calculate remaining stock
			if (data && data.length > 0) {
				const pIds = data.map((p: Product) => p.id);
				const { data: ordersData } = await supabase
					.from("orders")
					.select("product_id, quantity, status")
					.in("product_id", pIds)
					.neq("status", "cancelled");

				const stockMap: { [key: string]: number } = {};
				data.forEach((p: Product) => {
					const sold = (ordersData || [])
						.filter((o: { product_id: string }) => o.product_id === p.id)
						.reduce((a: number, o: { quantity: number }) => a + o.quantity, 0);
					stockMap[p.id] = Math.max(0, p.stock_limit - sold);
				});
				setRemainingStock(stockMap);
			}
		} catch (error) {
			console.error(error);
			toast.error("Gagal memuat produk");
		} finally {
			setLoading(false);
		}
	};

	const addToCart = (product: Product) => {
		const stock = remainingStock[product.id] ?? product.stock_limit;
		const existing = cart.find((item) => item.product.id === product.id);
		const currentQty = existing ? existing.quantity : 0;
		if (currentQty >= stock) {
			toast.error("Stok tidak cukup");
			return;
		}
		if (existing) {
			setCart(cart.map((item) =>
				item.product.id === product.id
					? { ...item, quantity: item.quantity + 1 }
					: item
			));
		} else {
			setCart([...cart, { product, quantity: 1 }]);
		}
	};

	const removeFromCart = (productId: string) => {
		const existing = cart.find((item) => item.product.id === productId);
		if (existing && existing.quantity > 1) {
			setCart(cart.map((item) =>
				item.product.id === productId
					? { ...item, quantity: item.quantity - 1 }
					: item
			));
		} else {
			setCart(cart.filter((item) => item.product.id !== productId));
		}
	};

	const getCartItemQty = (productId: string) => {
		return cart.find((item) => item.product.id === productId)?.quantity || 0;
	};

	const totalItems = cart.reduce((a, i) => a + i.quantity, 0);
	const totalPrice = cart.reduce((a, i) => a + i.product.price * i.quantity, 0);

	const formatRupiah = (amount: number) =>
		new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (cart.length === 0) { toast.error("Keranjang masih kosong"); return; }
		if (!paymentMethod) { toast.error("Pilih metode pembayaran"); return; }
		setSubmitting(true);

		try {
			const ordersToInsert = cart.map((item) => ({
				product_id: item.product.id,
				quantity: item.quantity,
				customer_name: customerName,
				customer_phone: customerPhone,
				customer_address: customerAddress,
				payment_method: paymentMethod,
				order_notes: orderNotes,
			}));

			const { error } = await supabase.from("orders").insert(ordersToInsert);
			if (error) throw error;

			setOrderSuccess(true);
			setCart([]);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Gagal mengirim pesanan";
			toast.error("Error", { description: msg });
		} finally {
			setSubmitting(false);
		}
	};

	// Success
	if (orderSuccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
				<div className="text-center max-w-sm">
					<div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
						<CheckCircle2 className="w-10 h-10 text-emerald-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil! 🎉</h2>
					<p className="text-muted-foreground mb-6">
						Pesanan Anda telah dikirim. Penjual akan segera mengonfirmasi.
					</p>
					<div className="flex flex-col gap-3">
						<Button onClick={() => { setOrderSuccess(false); fetchProducts(); }}
							className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12">
							Pesan Lagi
						</Button>
						<a href="/track">
							<Button variant="outline" className="w-full rounded-xl h-12">
								Lacak Pesanan
							</Button>
						</a>
					</div>
				</div>
			</div>
		);
	}

	// Loading
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
			</div>
		);
	}

	const paymentMethods = [
		{ id: "qris", label: "QRIS", icon: QrCode, color: "text-purple-600 bg-purple-50 border-purple-200" },
		{ id: "dana", label: "Dana", icon: Smartphone, color: "text-blue-600 bg-blue-50 border-blue-200" },
		{ id: "gopay", label: "GoPay", icon: Smartphone, color: "text-green-600 bg-green-50 border-green-200" },
		{ id: "shopeepay", label: "ShopeePay", icon: Smartphone, color: "text-orange-600 bg-orange-50 border-orange-200" },
		{ id: "cod", label: "COD", icon: Truck, color: "text-gray-700 bg-gray-50 border-gray-200" },
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
			{/* Sticky Header */}
			<header className="bg-white/90 backdrop-blur-md border-b border-emerald-100/50 sticky top-0 z-30">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
							<Store className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-base sm:text-lg font-bold text-gray-900">
								Takjil<span className="text-emerald-600">Flow</span>
							</h1>
							<p className="text-[11px] text-muted-foreground">Pesan takjil favorit 🌙</p>
						</div>
					</div>
					{/* Cart Button (mobile) */}
					<button
						onClick={() => setShowCart(true)}
						className="lg:hidden relative bg-emerald-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-200"
					>
						<ShoppingCart className="w-4 h-4" />
						{totalItems > 0 && (
							<span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
								{totalItems}
							</span>
						)}
						{totalItems > 0 ? formatRupiah(totalPrice) : "Keranjang"}
					</button>
				</div>
			</header>

			<div className="max-w-6xl mx-auto px-4 py-6">
				<div className="lg:grid lg:grid-cols-5 lg:gap-8">
					{/* Product Grid */}
					<div className="lg:col-span-3">
						<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
							<ShoppingBag className="w-6 h-6 text-emerald-600" />
							Menu Takjil
						</h2>

						{products.length === 0 ? (
							<div className="bg-white rounded-2xl shadow-sm p-12 text-center">
								<ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
								<h3 className="text-lg font-semibold">Belum ada produk</h3>
								<p className="text-muted-foreground text-sm">Penjual belum menambahkan produk.</p>
							</div>
						) : (
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
								{products.map((product) => {
									const stock = remainingStock[product.id] ?? product.stock_limit;
									const isOutOfStock = stock <= 0;
									const cartQty = getCartItemQty(product.id);

									return (
										<div
											key={product.id}
											className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${isOutOfStock ? "opacity-60" : ""
												}`}
										>
											{/* Product Image */}
											<div className="relative aspect-square bg-gray-100 overflow-hidden">
												{product.image_url ? (
													<img
														src={product.image_url}
														alt={product.name}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<ImageIcon className="w-10 h-10 text-gray-300" />
													</div>
												)}
												{product.category && product.category !== "Lainnya" && (
													<Badge className="absolute top-2 left-2 rounded-lg bg-white/90 text-gray-700 text-[10px] px-1.5 py-0.5 shadow-sm">
														{product.category}
													</Badge>
												)}
												{isOutOfStock && (
													<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
														<span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Habis</span>
													</div>
												)}
												{!isOutOfStock && stock <= 5 && (
													<Badge className="absolute top-2 right-2 rounded-lg bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
														Sisa {stock}
													</Badge>
												)}
											</div>

											{/* Product Info */}
											<div className="p-3">
												<h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
													{product.name}
												</h3>
												{product.description && (
													<p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">
														{product.description}
													</p>
												)}
												<p className="text-emerald-600 font-bold text-base mb-2">
													{formatRupiah(product.price)}
												</p>

												{/* Add to Cart */}
												{isOutOfStock ? (
													<div className="text-center text-xs text-red-500 font-medium py-2">Stok Habis</div>
												) : cartQty > 0 ? (
													<div className="flex items-center justify-between bg-emerald-50 rounded-xl p-1">
														<button
															onClick={() => removeFromCart(product.id)}
															className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
														>
															<Minus className="w-3.5 h-3.5 text-red-500" />
														</button>
														<span className="font-bold text-emerald-700 text-sm">{cartQty}</span>
														<button
															onClick={() => addToCart(product)}
															className="w-8 h-8 rounded-lg bg-emerald-600 shadow-sm flex items-center justify-center hover:bg-emerald-700 transition-colors"
														>
															<Plus className="w-3.5 h-3.5 text-white" />
														</button>
													</div>
												) : (
													<button
														onClick={() => addToCart(product)}
														className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
													>
														<Plus className="w-3.5 h-3.5" /> Tambah
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Desktop Cart Sidebar */}
					<div className="hidden lg:block lg:col-span-2">
						<div className="sticky top-20">
							<CartPanel
								cart={cart}
								removeFromCart={removeFromCart}
								addToCart={addToCart}
								customerName={customerName}
								setCustomerName={setCustomerName}
								customerPhone={customerPhone}
								setCustomerPhone={setCustomerPhone}
								customerAddress={customerAddress}
								setCustomerAddress={setCustomerAddress}
								orderNotes={orderNotes}
								setOrderNotes={setOrderNotes}
								paymentMethod={paymentMethod}
								setPaymentMethod={setPaymentMethod}
								paymentMethods={paymentMethods}
								totalPrice={totalPrice}
								submitting={submitting}
								handleSubmit={handleSubmit}
								formatRupiah={formatRupiah}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Cart Sheet */}
			{showCart && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
					<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
						<div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-4 flex items-center justify-between z-10">
							<h3 className="font-bold text-lg flex items-center gap-2">
								<ShoppingCart className="w-5 h-5 text-emerald-600" /> Keranjang
							</h3>
							<button onClick={() => setShowCart(false)} className="p-2 rounded-xl hover:bg-gray-100">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-4">
							<CartPanel
								cart={cart}
								removeFromCart={removeFromCart}
								addToCart={addToCart}
								customerName={customerName}
								setCustomerName={setCustomerName}
								customerPhone={customerPhone}
								setCustomerPhone={setCustomerPhone}
								customerAddress={customerAddress}
								setCustomerAddress={setCustomerAddress}
								orderNotes={orderNotes}
								setOrderNotes={setOrderNotes}
								paymentMethod={paymentMethod}
								setPaymentMethod={setPaymentMethod}
								paymentMethods={paymentMethods}
								totalPrice={totalPrice}
								submitting={submitting}
								handleSubmit={handleSubmit}
								formatRupiah={formatRupiah}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Mobile Bottom Bar */}
			{totalItems > 0 && !showCart && (
				<div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-3 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
					<button
						onClick={() => setShowCart(true)}
						className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 flex items-center justify-between px-5 font-medium transition-colors"
					>
						<div className="flex items-center gap-2">
							<ShoppingCart className="w-5 h-5" />
							<span>{totalItems} item</span>
						</div>
						<span className="font-bold">{formatRupiah(totalPrice)}</span>
					</button>
				</div>
			)}

			{/* Footer */}
			<footer className="border-t border-gray-100 mt-12 py-6 text-center text-sm text-muted-foreground pb-20 lg:pb-6">
				Powered by <span className="font-semibold text-emerald-600">TakjilFlow</span> 🌙
			</footer>
		</div>
	);
}

// Cart Panel Component
function CartPanel({
	cart, removeFromCart, addToCart, customerName, setCustomerName,
	customerPhone, setCustomerPhone, customerAddress, setCustomerAddress,
	orderNotes, setOrderNotes, paymentMethod, setPaymentMethod,
	paymentMethods, totalPrice, submitting, handleSubmit, formatRupiah,
}: {
	cart: CartItem[];
	removeFromCart: (id: string) => void;
	addToCart: (p: Product) => void;
	customerName: string;
	setCustomerName: (v: string) => void;
	customerPhone: string;
	setCustomerPhone: (v: string) => void;
	customerAddress: string;
	setCustomerAddress: (v: string) => void;
	orderNotes: string;
	setOrderNotes: (v: string) => void;
	paymentMethod: string;
	setPaymentMethod: (v: string) => void;
	paymentMethods: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
	totalPrice: number;
	submitting: boolean;
	handleSubmit: (e: React.FormEvent) => void;
	formatRupiah: (n: number) => string;
}) {
	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			{/* Cart Items */}
			{cart.length === 0 ? (
				<div className="text-center py-8">
					<ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
					<p className="text-muted-foreground text-sm">Keranjang masih kosong</p>
					<p className="text-xs text-muted-foreground mt-1">Tambah produk dari menu</p>
				</div>
			) : (
				<div className="space-y-2">
					{cart.map((item) => (
						<div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
							{item.product.image_url ? (
								<img src={item.product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
							) : (
								<div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
									<ImageIcon className="w-5 h-5 text-gray-400" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{item.product.name}</p>
								<p className="text-xs text-emerald-600 font-semibold">{formatRupiah(item.product.price * item.quantity)}</p>
							</div>
							<div className="flex items-center gap-1.5">
								<button type="button" onClick={() => removeFromCart(item.product.id)}
									className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center hover:bg-red-50">
									<Minus className="w-3 h-3" />
								</button>
								<span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
								<button type="button" onClick={() => addToCart(item.product)}
									className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center hover:bg-emerald-700">
									<Plus className="w-3 h-3 text-white" />
								</button>
							</div>
						</div>
					))}
					<div className="flex justify-between items-center pt-2 border-t border-gray-100">
						<span className="text-sm text-muted-foreground">Total</span>
						<span className="text-lg font-bold text-emerald-600">{formatRupiah(totalPrice)}</span>
					</div>
				</div>
			)}

			{/* Customer Info */}
			<div className="space-y-3">
				<div className="space-y-1.5">
					<Label htmlFor="name" className="text-xs font-medium">Nama Pemesan</Label>
					<Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
						placeholder="Nama lengkap" required className="rounded-xl h-10 text-sm" />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="phone" className="text-xs font-medium">No. WhatsApp</Label>
					<Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
						placeholder="08xxxxxxxxxx" required className="rounded-xl h-10 text-sm" />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="address" className="text-xs font-medium flex items-center gap-1">
						<MapPin className="w-3 h-3" /> Alamat Pengiriman
					</Label>
					<Textarea id="address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
						placeholder="Alamat lengkap..." className="rounded-xl resize-none text-sm" rows={2} />
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="notes" className="text-xs font-medium flex items-center gap-1">
						<StickyNote className="w-3 h-3" /> Catatan (opsional)
					</Label>
					<Textarea id="notes" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}
						placeholder="Pedas, tidak pakai kacang, dll..." className="rounded-xl resize-none text-sm" rows={2} />
				</div>
			</div>

			{/* Payment */}
			<div className="space-y-2">
				<Label className="text-xs font-medium flex items-center gap-1">
					<CreditCard className="w-3 h-3" /> Metode Pembayaran
				</Label>
				<div className="grid grid-cols-3 gap-2">
					{paymentMethods.map((pm) => (
						<button
							key={pm.id}
							type="button"
							onClick={() => setPaymentMethod(pm.id)}
							className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium ${paymentMethod === pm.id
									? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
									: "border-gray-200 hover:border-gray-300 text-gray-600"
								}`}
						>
							<pm.icon className="w-4 h-4" />
							{pm.label}
						</button>
					))}
				</div>

				{/* Payment Info */}
				{paymentMethod === "qris" && (
					<div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
						<p className="text-xs text-purple-700 font-medium mb-2 text-center">Scan QRIS berikut:</p>
						<div className="bg-white rounded-lg p-2 flex justify-center">
							<img src="/qris.png" alt="QRIS" className="h-36 w-auto" />
						</div>
					</div>
				)}
				{(paymentMethod === "dana" || paymentMethod === "gopay" || paymentMethod === "shopeepay") && (
					<div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
						<p className="text-xs text-blue-700 font-medium">
							Transfer ke: <span className="font-bold">083843173660</span>
						</p>
						<p className="text-[11px] text-blue-500 mt-0.5">
							{paymentMethod === "dana" ? "Dana" : paymentMethod === "gopay" ? "GoPay" : "ShopeePay"}
						</p>
					</div>
				)}
				{paymentMethod === "cod" && (
					<div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
						<p className="text-xs text-gray-600">💵 Bayar langsung saat pengiriman/pengambilan</p>
					</div>
				)}
			</div>

			{/* Submit */}
			<Button
				type="submit"
				disabled={submitting || cart.length === 0 || !paymentMethod}
				className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-emerald-200 disabled:opacity-50"
			>
				{submitting ? (
					<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
				) : (
					<><ShoppingCart className="w-4 h-4 mr-2" /> Kirim Pesanan</>
				)}
			</Button>
		</form>
	);
}
