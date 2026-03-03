"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
	Plus,
	Pencil,
	Trash2,
	Loader2,
	Package,
	Search,
	ImageIcon,
	Upload,
} from "lucide-react";

export default function MenuPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editProduct, setEditProduct] = useState<Product | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	// Form state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stockLimit, setStockLimit] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [existingImageUrl, setExistingImageUrl] = useState("");
	const [category, setCategory] = useState("Lainnya");

	const categories = ["Kolak", "Es", "Gorengan", "Kue", "Minuman", "Lainnya"];

	const supabase = createClient();

	useEffect(() => {
		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchProducts = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("products")
				.select("*")
				.eq("user_id", user.id)
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

	const resetForm = () => {
		setName("");
		setDescription("");
		setPrice("");
		setStockLimit("");
		setImageFile(null);
		setImagePreview("");
		setExistingImageUrl("");
		setCategory("Lainnya");
		setEditProduct(null);
	};

	const openEditDialog = (product: Product) => {
		setEditProduct(product);
		setName(product.name);
		setDescription(product.description || "");
		setPrice(product.price.toString());
		setStockLimit(product.stock_limit.toString());
		setImageFile(null);
		setImagePreview("");
		setExistingImageUrl(product.image_url || "");
		setCategory(product.category || "Lainnya");
		setIsDialogOpen(true);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = () => setImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const openCreateDialog = () => {
		resetForm();
		setIsDialogOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			// Upload image if new file selected
			let finalImageUrl = existingImageUrl;
			if (imageFile) {
				const fileExt = imageFile.name.split(".").pop();
				const fileName = `${user.id}/${Date.now()}.${fileExt}`;
				const { error: uploadError } = await supabase.storage
					.from("product-images")
					.upload(fileName, imageFile, { upsert: true });
				if (uploadError) throw uploadError;
				const { data: urlData } = supabase.storage
					.from("product-images")
					.getPublicUrl(fileName);
				finalImageUrl = urlData.publicUrl;
			}

			const productData = {
				name,
				description,
				price: parseInt(price),
				stock_limit: parseInt(stockLimit),
				image_url: finalImageUrl,
				category,
				user_id: user.id,
			};

			if (editProduct) {
				const { error } = await supabase
					.from("products")
					.update(productData)
					.eq("id", editProduct.id);
				if (error) throw error;
				toast.success("Produk berhasil diperbarui");
			} else {
				const { error } = await supabase.from("products").insert(productData);
				if (error) throw error;
				toast.success("Produk berhasil ditambahkan");
			}

			setIsDialogOpen(false);
			resetForm();
			fetchProducts();
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : "Terjadi kesalahan";
			toast.error(editProduct ? "Gagal memperbarui produk" : "Gagal menambahkan produk", {
				description: errMsg,
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const { error } = await supabase.from("products").delete().eq("id", id);
			if (error) throw error;
			toast.success("Produk berhasil dihapus");
			setDeleteConfirm(null);
			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
			toast.error("Gagal menghapus produk");
		}
	};

	const formatRupiah = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const filteredProducts = products.filter((p) =>
		p.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
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
						Produk
					</h1>
					<p className="text-muted-foreground mt-1">
						Kelola daftar produk takjil Anda
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							onClick={openCreateDialog}
							className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all"
						>
							<Plus className="w-4 h-4 mr-2" />
							Tambah Produk
						</Button>
					</DialogTrigger>
					<DialogContent className="rounded-2xl sm:max-w-md">
						<DialogHeader>
							<DialogTitle>
								{editProduct ? "Edit Produk" : "Tambah Produk Baru"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nama Produk</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Contoh: Kolak Pisang"
									required
									className="rounded-xl"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2 col-span-2">
									<Label>Kategori</Label>
									<Select value={category} onValueChange={setCategory}>
										<SelectTrigger className="rounded-xl">
											<SelectValue placeholder="Pilih kategori" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((cat) => (
												<SelectItem key={cat} value={cat}>{cat}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Deskripsi</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Deskripsi singkat produk..."
									className="rounded-xl resize-none"
									rows={3}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="price">Harga (Rp)</Label>
									<Input
										id="price"
										type="number"
										value={price}
										onChange={(e) => setPrice(e.target.value)}
										placeholder="5000"
										required
										min="0"
										className="rounded-xl"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="stockLimit">Batas Stok</Label>
									<Input
										id="stockLimit"
										type="number"
										value={stockLimit}
										onChange={(e) => setStockLimit(e.target.value)}
										placeholder="50"
										required
										min="1"
										className="rounded-xl"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="imageFile">Gambar Produk (opsional)</Label>
								<div className="flex items-center gap-3">
									<label
										htmlFor="imageFile"
										className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-emerald-400 transition-colors text-sm text-gray-600"
									>
										<Upload className="w-4 h-4" />
										{imageFile ? imageFile.name : "Pilih gambar..."}
									</label>
									<input
										id="imageFile"
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
									/>
								</div>
								{(imagePreview || existingImageUrl) && (
									<div className="rounded-xl overflow-hidden border border-gray-200 h-32 bg-gray-50 relative">
										<img src={imagePreview || existingImageUrl} alt="Preview" className="w-full h-full object-cover" />
									</div>
								)}
							</div>
							<DialogFooter className="gap-2">
								<DialogClose asChild>
									<Button
										type="button"
										variant="outline"
										className="rounded-xl"
									>
										Batal
									</Button>
								</DialogClose>
								<Button
									type="submit"
									disabled={saving}
									className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
								>
									{saving ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : null}
									{editProduct ? "Simpan Perubahan" : "Tambah Produk"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			{products.length > 0 && (
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<Input
						placeholder="Cari produk..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 rounded-xl"
					/>
				</div>
			)}

			{/* Product Table */}
			{products.length === 0 ? (
				<div className="bg-white rounded-2xl shadow-sm p-16 text-center">
					<Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Belum ada produk
					</h3>
					<p className="text-muted-foreground mb-6">
						Tambahkan produk takjil pertama Anda untuk mulai menerima pesanan.
					</p>
					<Button
						onClick={openCreateDialog}
						className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
					>
						<Plus className="w-4 h-4 mr-2" />
						Tambah Produk Pertama
					</Button>
				</div>
			) : (
				<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="font-semibold">Produk</TableHead>
								<TableHead className="font-semibold">Harga</TableHead>
								<TableHead className="font-semibold">Stok</TableHead>
								<TableHead className="font-semibold text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredProducts.map((product) => (
								<TableRow key={product.id} className="hover:bg-gray-50/50">
									<TableCell>
										<div className="flex items-center gap-3">
											{product.image_url ? (
												<div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
													<img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
												</div>
											) : (
												<div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
													<ImageIcon className="w-5 h-5 text-emerald-400" />
												</div>
											)}
											<div>
												<p className="font-medium text-gray-900">{product.name}</p>
												{product.description && (
													<p className="text-sm text-muted-foreground line-clamp-1">
														{product.description}
													</p>
												)}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<span className="font-medium text-emerald-600">
											{formatRupiah(product.price)}
										</span>
									</TableCell>
									<TableCell>
										<span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-sm font-medium">
											{product.stock_limit} pcs
										</span>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openEditDialog(product)}
												className="rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
											>
												<Pencil className="w-4 h-4" />
											</Button>

											<Dialog
												open={deleteConfirm === product.id}
												onOpenChange={(open) =>
													setDeleteConfirm(open ? product.id : null)
												}
											>
												<DialogTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="rounded-lg hover:bg-red-50 hover:text-red-600"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</DialogTrigger>
												<DialogContent className="rounded-2xl sm:max-w-sm">
													<DialogHeader>
														<DialogTitle>Hapus Produk?</DialogTitle>
													</DialogHeader>
													<p className="text-sm text-muted-foreground">
														Anda yakin ingin menghapus{" "}
														<strong>{product.name}</strong>? Semua pesanan
														terkait juga akan terhapus.
													</p>
													<DialogFooter className="gap-2">
														<DialogClose asChild>
															<Button variant="outline" className="rounded-xl">
																Batal
															</Button>
														</DialogClose>
														<Button
															onClick={() => handleDelete(product.id)}
															className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
														>
															Hapus
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
