"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
	LayoutDashboard,
	Package,
	ClipboardList,
	Ticket,
	Settings,
	Users,
	FileBarChart,
	LogOut,
	ExternalLink,
	Menu,
	X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/menu", label: "Produk", icon: Package },
	{ href: "/orders", label: "Pesanan", icon: ClipboardList },
	{ href: "/customers", label: "Pelanggan", icon: Users },
	{ href: "/report", label: "Laporan", icon: FileBarChart },
	{ href: "/promo", label: "Promo", icon: Ticket },
	{ href: "/settings", label: "Pengaturan", icon: Settings },
];

export default function DashboardSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();
	const [userId, setUserId] = useState<string | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) setUserId(user.id);
		};
		getUser();
	}, [supabase]);

	const handleLogout = async () => {
		await supabase.auth.signOut();
		toast.success("Berhasil logout");
		router.push("/");
		router.refresh();
	};

	const sidebarContent = (
		<>
			<div className="p-6">
				<Link href="/" className="flex items-center gap-2 group">
					<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md group-hover:shadow-emerald-200 transition-shadow">
						<span className="text-white font-bold text-base">T</span>
					</div>
					<span className="text-lg font-bold text-gray-900">
						Takjil<span className="text-emerald-600">Flow</span>
					</span>
				</Link>
			</div>

			<nav className="flex-1 px-4 space-y-1">
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setMobileOpen(false)}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
								? "bg-emerald-50 text-emerald-700 shadow-sm"
								: "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
								}`}
						>
							<item.icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : ""}`} />
							{item.label}
						</Link>
					);
				})}
				{userId && (
					<Link
						href={`/store/${userId}`}
						target="_blank"
						onClick={() => setMobileOpen(false)}
						className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
					>
						<ExternalLink className="w-5 h-5" />
						Lihat Toko
					</Link>
				)}
			</nav>

			<div className="p-4 border-t border-gray-100">
				<Button
					variant="ghost"
					onClick={handleLogout}
					className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
				>
					<LogOut className="w-5 h-5 mr-3" />
					Keluar
				</Button>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile toggle */}
			<button
				onClick={() => setMobileOpen(!mobileOpen)}
				className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-xl p-2 shadow-md border border-gray-100"
			>
				{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</button>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div
					className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
					}`}
			>
				{sidebarContent}
			</aside>
		</>
	);
}
